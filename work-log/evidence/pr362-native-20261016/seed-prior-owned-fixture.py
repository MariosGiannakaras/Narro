from pathlib import Path, PurePosixPath
import sqlite3,json,hashlib,shutil,datetime
r=Path(__file__).resolve().parent
prior=Path(r"E:\SystemFiles\Desktop\Narro-PA360-native-20261016")
ledger=json.loads((r/'profile-protection-private.json').read_text());assert ledger['state']=='OWNED_PROFILE_ACTIVE' and ledger['sessionRoot']==str(r)
old=json.loads((prior/'profile-protection-private.json').read_text());assert old['state']=='ORIGINAL_PROFILES_RESTORED'
source=Path(next(x for x in old['namespaces'] if x['kind']=='Roaming')['retainedPostfix'])
dest=Path(next(x for x in ledger['namespaces'] if x['kind']=='Roaming')['active'])
assert json.loads((source/'pa-owned-profile.json').read_text())==dict(json.loads((source/'pa-owned-profile.json').read_text()),sessionRoot=str(prior),owned=True)
assert json.loads((dest/'pa-owned-profile.json').read_text())['sessionRoot']==str(r)
assert source.resolve().parent==(Path.home()/'AppData/Roaming').resolve() and not source.is_symlink()
assert not (dest/'narro.db').exists(),'Never overwrite an initialized test DB'
expected=json.loads((prior/'observations/159-final-owned-db.json').read_text())
a=sqlite3.connect((source/'narro.db').as_uri()+'?mode=ro',uri=True);a.row_factory=sqlite3.Row
assert {x['id'] for x in a.execute('select id from lists')}=={x['id'] for x in expected['lists']}
assert {x['id'] for x in a.execute('select id from tasks')}=={x['id'] for x in expected['tasks']}
assert a.execute('pragma quick_check').fetchone()[0]=='ok'
b=sqlite3.connect(dest/'narro.db');a.backup(b);assert b.execute('pragma quick_check').fetchone()[0]=='ok';b.close();assets=[]
for row in a.execute('select icon_asset from lists where icon_asset is not null'):
 rel=PurePosixPath(row['icon_asset']);assert not rel.is_absolute() and '..' not in rel.parts and ':' not in str(rel)
 src=source.joinpath(*rel.parts).resolve();target=dest.joinpath(*rel.parts);assert src.is_relative_to(source.resolve()) and target.resolve().is_relative_to(dest.resolve())
 target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,target);assets.append({'path':str(rel),'sha256':hashlib.sha256(src.read_bytes()).hexdigest()})
a.close()
(r/'owned-fixture-seed.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceSession':'PA360','ownedOnly':True,'sqliteBackupQuickCheck':'ok','lists':len(expected['lists']),'tasks':len(expected['tasks']),'assets':assets},indent=2),encoding='utf-8')
print('PRIOR_OWNED_FIXTURE_SEEDED_NO_PERSONAL_DATA')
