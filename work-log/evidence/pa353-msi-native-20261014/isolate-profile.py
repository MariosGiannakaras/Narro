from pathlib import Path
import json, datetime, hashlib, shutil, sqlite3, subprocess
r=Path(__file__).resolve().parent
old=Path(r'E:\SystemFiles\Desktop\Narro-PA353-native-20261014')
meta=json.loads((r/'session-meta.json').read_text(encoding='utf-8-sig'))
assert meta['state']=='ARTIFACT_VERIFIED'
assert hashlib.sha256(Path(meta['executable']).read_bytes()).hexdigest()==meta['sha256']
running=subprocess.check_output(['powershell','-NoLogo','-NoProfile','-Command',"@(Get-Process narro,narro-m7-validation -ErrorAction SilentlyContinue | Select-Object Id,ProcessName) | ConvertTo-Json -Compress"],encoding='utf8',creationflags=0x08000000)
assert not json.loads(running or '[]'), 'Stop existing Narro normally before isolation'
prior=json.loads((old/'profile-protection-private.json').read_text())
assert prior['state']=='ORIGINAL_PROFILES_RESTORED'
p=r/'profile-protection-private.json'; assert not p.exists()
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')
items=[]
for item in prior['namespaces']:
    base=(Path.home()/'AppData'/item['kind']).resolve()
    active=base/'com.mariosg.Narro'; retained=Path(item['retainedPostfix'])
    protected=base/('com.mariosg.Narro.PA353MSI-protected-'+stamp)
    assert active.parent==base and retained.resolve().parent==base and protected.parent==base
    assert active.is_dir() and retained.is_dir() and not active.is_symlink() and not retained.is_symlink() and not protected.exists()
    marker=json.loads((retained/'pa-owned-profile.json').read_text())
    assert marker['owned'] and marker['sessionRoot']==str(old)
    items.append({'kind':item['kind'],'active':str(active),'retained':str(retained),'protected':str(protected)})
db=Path(next(i['active'] for i in items if i['kind']=='Roaming'))/'narro.db'
actual=hashlib.sha256(db.read_bytes()).hexdigest()
backup=r/'private-current-original-backup'; backup.mkdir()
source=sqlite3.connect(db.as_uri()+'?mode=ro',uri=True)
target=sqlite3.connect(backup/'narro.db'); source.backup(target)
assert target.execute('pragma quick_check').fetchone()[0]=='ok'
source.close(); target.close()
ledger={'sessionRoot':str(r),'originalDbSha256':actual,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'state':'PREPARED','namespaces':items}
p.write_text(json.dumps(ledger,indent=2),encoding='utf8')
for item in items:
    active=Path(item['active']); active.rename(item['protected'])
    ledger['state']='ORIGINAL_PROTECTED_'+item['kind']; p.write_text(json.dumps(ledger,indent=2),encoding='utf8')
    if item['kind']=='Roaming': shutil.copytree(item['retained'],active)
    else: active.mkdir()
    (active/'pa-owned-profile.json').write_text(json.dumps({'sessionRoot':str(r),'owned':True,'utc':ledger['utc']}),encoding='utf8')
ledger['state']='OWNED_PROFILE_ACTIVE'; p.write_text(json.dumps(ledger,indent=2),encoding='utf8')
print(json.dumps({'state':ledger['state'],'originalDbSha256':actual,'backupQuickCheck':'ok'}))
