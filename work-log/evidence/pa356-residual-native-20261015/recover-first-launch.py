from pathlib import Path
import sqlite3,subprocess,json,hashlib,shutil,datetime
r=Path(__file__).resolve().parent;p=r/'profile-protection-private.json';ledger=json.loads(p.read_text());assert ledger['state']=='PREPARED'
assert subprocess.check_output(['powershell','-NoProfile','-Command',"@(Get-Process narro,narro-m7-validation -ErrorAction SilentlyContinue).Count"]).strip()==b'0'
item=next(x for x in ledger['namespaces'] if x['kind']=='Roaming');active=Path(item['active']);backup=r/'private-Roaming-backup.db';first=r/'private-before-first-launch.db'
if not first.exists():shutil.copy2(backup,first)
assert first.read_bytes()==backup.read_bytes()
before=sqlite3.connect(first);expected=list(before.iterdump());assert before.execute('pragma quick_check').fetchone()[0]=='ok';before.close()
saved=active/'PA356-unintended-data-private';assert not saved.exists();saved.mkdir()
for suffix in ['', '-wal','-shm']:
 f=active/('narro.db'+suffix)
 if f.exists():f.rename(saved/f.name)
shutil.copy2(first,active/'narro.db')
restored=sqlite3.connect(active/'narro.db');assert list(restored.iterdump())==expected;assert restored.execute('pragma quick_check').fetchone()[0]=='ok';restored.close()
oldsha=item['dbSha256'];item['dbSha256']=hashlib.sha256((active/'narro.db').read_bytes()).hexdigest();ledger['recovery']={'diagnosticDataLogicallyRestored':True,'preLaunchDiagnosticDbRawSha256':oldsha,'restoredDiagnosticDbSha256':item['dbSha256'],'rawByteIdentity':False,'reason':'SQLite backup restores exact logical pre-launch snapshot; original raw file was not copied before the failed rename.'};p.write_text(json.dumps(ledger,indent=2))
production=Path.home()/'AppData/Roaming/com.mariosg.Narro/narro.db';assert hashlib.sha256(production.read_bytes()).hexdigest()==ledger['productionDbSha256']
proof={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'failure':'External profile helper left sqlite source open; shell failed to gate subsequent diagnostic launch. Narro production namespace unaffected.','recovery':ledger['recovery'],'productionDbByteIdentical':True,'productionDbSha256':ledger['productionDbSha256'],'unintendedPostLaunchFilesPrivatelyRetained':True}
(r/'first-launch-recovery.json').write_text(json.dumps(proof,indent=2));print(json.dumps(proof))
