from pathlib import Path
import datetime,json,hashlib,subprocess,time
session=Path(__file__).parent.resolve()
ledger_path=session/'profile-protection-private.json'
ledger=json.loads(ledger_path.read_text())
assert ledger['sessionRoot']==str(session)
assert ledger['state']!='ORIGINAL_PROFILES_RESTORED', 'Original profiles already restored'
output=subprocess.check_output(['powershell','-NoLogo','-NoProfile','-Command',
    "@(Get-Process narro,narro-m7-validation -ErrorAction SilentlyContinue | Select-Object Id,ProcessName) | ConvertTo-Json -Compress"],encoding='utf-8',creationflags=0x08000000)
assert not json.loads(output or '[]'), 'Close owned Narro normally before restoring profiles'
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')
for item in ledger['namespaces']:
    base=(Path.home()/'AppData'/item['kind']).resolve()
    active=Path(item['active']);protected=Path(item['protected'])
    retained=base/('com.mariosg.Narro.PA-postfix-retained-'+stamp)
    assert active.parent.resolve()==base and protected.parent.resolve()==base and retained.parent==base
    assert not retained.exists()
    if not protected.exists():continue
    if active.exists():
        marker=active/'pa-owned-profile.json'
        if marker.exists():assert json.loads(marker.read_text())['sessionRoot']==str(session)
        for attempt in range(40):
            try:
                active.rename(retained)
                break
            except PermissionError:
                if attempt == 39: raise
                time.sleep(.25)
        item['retainedPostfix']=str(retained)
    protected.rename(active)
    ledger_path.write_text(json.dumps(ledger,indent=2),encoding='utf-8')
original_db=Path(ledger['namespaces'][0]['active'])/'narro.db'
actual=hashlib.sha256(original_db.read_bytes()).hexdigest()
assert actual==ledger['originalDbSha256'], 'Restored original DB hash mismatch'
ledger['state']='ORIGINAL_PROFILES_RESTORED';ledger['restoredUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
ledger_path.write_text(json.dumps(ledger,indent=2),encoding='utf-8')
(session/'original-profile-restoration-proof.json').write_text(json.dumps({'state':ledger['state'],'utc':ledger['restoredUtc'],'originalDbSha256':actual,'hashIdentical':True},indent=2),encoding='utf-8')
print(json.dumps({'state':ledger['state'],'hashIdentical':True,'originalDbSha256':actual}))
