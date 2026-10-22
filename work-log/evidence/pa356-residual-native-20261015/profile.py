from pathlib import Path
import json,sqlite3,hashlib,datetime,sys,subprocess,time
r=Path(__file__).resolve().parent;p=r/'profile-protection-private.json';identifier='com.mariosg.Narro.M1Diagnostic'
production=Path.home()/'AppData/Roaming/com.mariosg.Narro/narro.db'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else None
running=subprocess.check_output(['powershell','-NoProfile','-Command',"@(Get-Process narro,narro-m7-validation -ErrorAction SilentlyContinue).Count"],creationflags=0x08000000).strip();assert running==b'0',running
if sys.argv[1]=='protect':
 if p.exists():
  previous=json.loads(p.read_text());assert previous['state']=='PREPARED'
  assert all(not Path(x['protected']).exists() and sha(Path(x['active'])/'narro.db')==x['dbSha256'] for x in previous['namespaces'])
  saved=r/'profile-protection-first-prepared-private.json';assert not saved.exists();p.rename(saved)
 stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S');rows=[]
 for kind in ['Roaming','Local']:
  base=Path.home()/'AppData'/kind;active=base/identifier;protected=base/(identifier+'.PA356-protected-'+stamp);assert not protected.exists() and not active.is_symlink()
  rows.append({'kind':kind,'active':str(active),'protected':str(protected),'existed':active.exists(),'dbSha256':sha(active/'narro.db')})
 ledger={'state':'PREPARED','sessionRoot':str(r),'productionDbSha256':sha(production),'namespaces':rows};p.write_text(json.dumps(ledger,indent=2))
 for item in rows:
  active=Path(item['active'])
  if item['existed']:
   if (active/'narro.db').exists():
    db=sqlite3.connect((active/'narro.db').as_uri()+'?mode=ro',uri=True);backup=sqlite3.connect(r/('private-'+item['kind']+'-backup.db'))
    try:db.backup(backup);assert backup.execute('pragma quick_check').fetchone()[0]=='ok'
    finally:db.close();backup.close()
   active.rename(item['protected'])
  active.mkdir();(active/'pa-owned-profile.json').write_text(json.dumps({'owned':True,'sessionRoot':str(r)}));ledger['state']='PROTECTED_'+item['kind'];p.write_text(json.dumps(ledger,indent=2))
 ledger['state']='OWNED_PROFILE_ACTIVE';p.write_text(json.dumps(ledger,indent=2));print(json.dumps({'state':ledger['state'],'identifier':identifier,'productionDbSha256':ledger['productionDbSha256']}))
else:
 ledger=json.loads(p.read_text());assert ledger['state'] in ['OWNED_PROFILE_ACTIVE','RESTORING'];ledger['state']='RESTORING';p.write_text(json.dumps(ledger,indent=2))
 for item in ledger['namespaces']:
  if item.get('restored'):continue
  active=Path(item['active']);base=Path.home()/'AppData'/item['kind'];assert active.parent.resolve()==base.resolve() and Path(item['protected']).parent.resolve()==base.resolve()
  if 'retainedPostfix' not in item:
   item['retainedPostfix']=str(active.with_name(active.name+'.PA356-retained-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')));p.write_text(json.dumps(ledger,indent=2))
  retained=Path(item['retainedPostfix']);assert retained.parent.resolve()==base.resolve()
  if active.exists() and (active/'pa-owned-profile.json').exists() and json.loads((active/'pa-owned-profile.json').read_text()).get('sessionRoot')==str(r):
   assert not retained.exists()
   for attempt in range(11):
    try:active.rename(retained);break
    except PermissionError:
     if attempt==10:raise
     time.sleep(1)
  if item['existed'] and Path(item['protected']).exists():Path(item['protected']).rename(active)
  assert sha(active/'narro.db')==item['dbSha256']
  item['restored']=True;p.write_text(json.dumps(ledger,indent=2))
 assert sha(production)==ledger['productionDbSha256'];ledger['state']='ORIGINAL_PROFILES_RESTORED';p.write_text(json.dumps(ledger,indent=2))
 proof={'state':ledger['state'],'productionDbSha256':sha(production),'productionUnchanged':True,'diagnosticOriginalsRestored':True};(r/'restoration-proof.json').write_text(json.dumps(proof,indent=2));print(json.dumps(proof))
