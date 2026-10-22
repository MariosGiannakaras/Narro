from pathlib import Path
import json,datetime,subprocess,time
r=Path(__file__).resolve().parent;p=r/'profile-protection-private.json';l=json.loads(p.read_text());assert l['state'] in ['OWNED_PROFILE_ACTIVE','RESTORING_CURRENT'] and l['comparisonRole']=='historical-ci942'
assert subprocess.check_output(['powershell','-NoProfile','-Command',"@(Get-Process narro,narro-m7-validation -ErrorAction SilentlyContinue).Count"]).strip()==b'0'
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S');l['state']='RESTORING_CURRENT';p.write_text(json.dumps(l,indent=2))
for x in l['namespaces']:
 active=Path(x['active']);marker=json.loads((active/'pa-owned-profile.json').read_text());assert marker['sessionRoot']==str(r)
 if marker.get('role')=='historical-ci942-comparison-only':
  retained=active.with_name(active.name+'.PA356-ci942-owned-'+stamp);assert not retained.exists()
  for attempt in range(11):
   try:active.rename(retained);break
   except PermissionError:
    if attempt==10:raise
    time.sleep(1)
  x['historicalOwnedRetained']=str(retained);p.write_text(json.dumps(l,indent=2))
  current=Path(x['currentOwnedRetained']);assert json.loads((current/'pa-owned-profile.json').read_text())['sessionRoot']==str(r);current.rename(active)
 else:
  candidates=[f for f in active.parent.glob(active.name+'.PA356-ci942-owned-*') if (f/'pa-owned-profile.json').exists() and json.loads((f/'pa-owned-profile.json').read_text()).get('sessionRoot')==str(r)]
  assert len(candidates)==1 and not Path(x['currentOwnedRetained']).exists();x['historicalOwnedRetained']=str(candidates[0])
 p.write_text(json.dumps(l,indent=2))
(r/'analysis/baseline-launch.json').write_bytes((r/'launch.json').read_bytes());(r/'session-meta.json').write_bytes((r/'analysis/current-meta.json').read_bytes());l['comparisonRole']='current-restored';l['state']='OWNED_PROFILE_ACTIVE';p.write_text(json.dumps(l,indent=2));print('CURRENT_ACCEPTED_DIAGNOSTIC_PROFILE_RESTORED')
