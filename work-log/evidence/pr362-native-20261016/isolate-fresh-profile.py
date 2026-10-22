from pathlib import Path
import json,datetime,hashlib,sqlite3,subprocess
r=Path(__file__).resolve().parent
meta=json.loads((r/'session-meta.json').read_text(encoding='utf-8'))
assert meta['state']=='ARTIFACT_VERIFIED' and hashlib.sha256(Path(meta['executable']).read_bytes()).hexdigest()==meta['sha256']
ledger_path=r/'profile-protection-private.json';assert not ledger_path.exists(),'Never replay an isolation ledger'
running=subprocess.check_output(['powershell','-NoLogo','-NoProfile','-Command',"@(Get-Process narro,narro-m7-validation -ErrorAction SilentlyContinue | Select-Object Id,ProcessName) | ConvertTo-Json -Compress"],encoding='utf-8',creationflags=0x08000000)
assert not json.loads(running or '[]'),'Narro still running; do not touch profiles'
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')
items=[]
for kind in ['Roaming','Local']:
 base=(Path.home()/'AppData'/kind).resolve();active=base/'com.mariosg.Narro';protected=base/('com.mariosg.Narro.PA362-protected-'+stamp)
 assert active.resolve().parent==base and active.is_dir() and not active.is_symlink() and not (active.stat(follow_symlinks=False).st_file_attributes & 0x400) and protected.parent==base and not protected.exists()
 items.append({'kind':kind,'active':str(active),'protected':str(protected)})
db=Path(items[0]['active'])/'narro.db';digest=hashlib.sha256(db.read_bytes()).hexdigest()
backup=r/('private-current-original-backup-'+stamp);backup.mkdir()
source=sqlite3.connect(db.as_uri()+'?mode=ro',uri=True);target=sqlite3.connect(backup/'narro.db');source.backup(target)
assert target.execute('pragma quick_check').fetchone()[0]=='ok';source.close();target.close()
assert hashlib.sha256(db.read_bytes()).hexdigest()==digest,'Original DB changed while protecting it'
ledger={'sessionRoot':str(r),'state':'PREPARED','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'originalDbSha256':digest,'namespaces':items}
ledger_path.write_text(json.dumps(ledger,indent=2),encoding='utf-8')
for item in items:
 active=Path(item['active']);active.rename(item['protected'])
 ledger['state']='ORIGINAL_PROTECTED_'+item['kind'];ledger_path.write_text(json.dumps(ledger,indent=2),encoding='utf-8')
 active.mkdir();(active/'pa-owned-profile.json').write_text(json.dumps({'sessionRoot':str(r),'owned':True,'utc':ledger['utc']}),encoding='utf-8')
ledger['state']='OWNED_PROFILE_ACTIVE';ledger_path.write_text(json.dumps(ledger,indent=2),encoding='utf-8')
print(json.dumps({'state':ledger['state'],'originalDbSha256':digest,'backupQuickCheck':'ok','freshProfile':True}))

