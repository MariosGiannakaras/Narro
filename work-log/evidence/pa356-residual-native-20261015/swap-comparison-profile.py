from pathlib import Path
import json,datetime,subprocess
r=Path(__file__).resolve().parent;p=r/'profile-protection-private.json';l=json.loads(p.read_text());assert l['state']=='OWNED_PROFILE_ACTIVE'
assert subprocess.check_output(['powershell','-NoProfile','-Command',"@(Get-Process narro,narro-m7-validation -ErrorAction SilentlyContinue).Count"]).strip()==b'0'
assert not l.get('comparisonRole');stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')
for x in l['namespaces']:
 active=Path(x['active']);assert json.loads((active/'pa-owned-profile.json').read_text())['sessionRoot']==str(r)
 retained=active.with_name(active.name+'.PA356-current-owned-'+stamp);assert not retained.exists();active.rename(retained);x['currentOwnedRetained']=str(retained)
 active.mkdir();(active/'pa-owned-profile.json').write_text(json.dumps({'owned':True,'sessionRoot':str(r),'role':'historical-ci942-comparison-only'}))
l['comparisonRole']='historical-ci942';p.write_text(json.dumps(l,indent=2));(r/'analysis/current-meta.json').write_bytes((r/'session-meta.json').read_bytes());(r/'session-meta.json').write_bytes((r/'analysis/baseline-meta.json').read_bytes());print('FRESH_ISOLATED_HISTORICAL_COMPARISON_ONLY')
