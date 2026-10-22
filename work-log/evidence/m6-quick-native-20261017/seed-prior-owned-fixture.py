from pathlib import Path, PurePosixPath
import sqlite3,json,hashlib,shutil,datetime
r=Path(__file__).resolve().parent
prior=Path(r"E:\SystemFiles\Desktop\Narro-Workspace\Narro-M5-Remaining-native-20261016")
ledger=json.loads((r/'profile-protection-private.json').read_text());assert ledger['state']=='OWNED_PROFILE_ACTIVE' and ledger['sessionRoot']==str(r)
old=json.loads((prior/'profile-protection-private.json').read_text());assert old['state']=='ORIGINAL_PROFILES_RESTORED'
source=Path(next(x for x in old['namespaces'] if x['kind']=='Roaming')['retainedPostfix'])
dest=Path(next(x for x in ledger['namespaces'] if x['kind']=='Roaming')['active'])
assert json.loads((source/'pa-owned-profile.json').read_text())==dict(json.loads((source/'pa-owned-profile.json').read_text()),sessionRoot=str(prior),owned=True)
assert json.loads((dest/'pa-owned-profile.json').read_text())['sessionRoot']==str(r)
assert source.resolve().parent==(Path.home()/'AppData/Roaming').resolve() and not source.is_symlink()
assert not (dest/'narro.db').exists(),'Never overwrite an initialized test DB'
expected=json.loads((prior/'observations/G8-015-complete-owned-db.json').read_text())
# A retained SQLite rollback journal can require recovery even for a read.
# Recover only a byte-exact private copy; never mutate retained evidence.
staging=r/'private-owned-fixture-recovery';assert not staging.exists()
staging.mkdir();copied=[]
for suffix in ['', '-journal', '-wal', '-shm']:
 src=source/('narro.db'+suffix)
 if src.exists():
  before=hashlib.sha256(src.read_bytes()).hexdigest();shutil.copy2(src,staging/src.name)
  assert hashlib.sha256((staging/src.name).read_bytes()).hexdigest()==before
  copied.append({'name':src.name,'sha256':before})
a=sqlite3.connect(staging/'narro.db');a.row_factory=sqlite3.Row
assert {x['id'] for x in a.execute('select id from lists')}=={x['id'] for x in expected['lists']}
assert {x['id'] for x in a.execute('select id from tasks')}=={x['id'] for x in expected['tasks']}
assert a.execute('pragma quick_check').fetchone()[0]=='ok'
b=sqlite3.connect(dest/'narro.db');a.backup(b);assert b.execute('pragma quick_check').fetchone()[0]=='ok';b.close();assets=[]
for row in a.execute('select icon_asset from lists where icon_asset is not null'):
 rel=PurePosixPath(row['icon_asset']);assert not rel.is_absolute() and '..' not in rel.parts and ':' not in str(rel)
 src=source.joinpath(*rel.parts).resolve();target=dest.joinpath(*rel.parts);assert src.is_relative_to(source.resolve()) and target.resolve().is_relative_to(dest.resolve())
 target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,target);assets.append({'path':str(rel),'sha256':hashlib.sha256(src.read_bytes()).hexdigest()})
a.close()
for item in copied:assert hashlib.sha256((source/item['name']).read_bytes()).hexdigest()==item['sha256'],'Retained source evidence changed'
(r/'owned-fixture-seed.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceSession':'M5-eight-group-20261016-17','ownedOnly':True,'sqliteBackupQuickCheck':'ok','lists':len(expected['lists']),'tasks':len(expected['tasks']),'assets':assets,'retainedSourceUnchanged':copied,'recovery':'Private byte-exact DB/journal copy only; retained source untouched; recovered IDs and quick_check validated'},indent=2),encoding='utf-8')
print('PRIOR_OWNED_FIXTURE_SEEDED_NO_PERSONAL_DATA')
