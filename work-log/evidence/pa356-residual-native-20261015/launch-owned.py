from pathlib import Path
import json,hashlib,subprocess,datetime
r=Path(__file__).resolve().parent;m=json.loads((r/'session-meta.json').read_text());l=json.loads((r/'profile-protection-private.json').read_text())
assert l['state']=='OWNED_PROFILE_ACTIVE' and l['sessionRoot']==str(r)
assert hashlib.sha256(Path(m['executable']).read_bytes()).hexdigest()==m['sha256']
for x in l['namespaces']:
 assert json.loads((Path(x['active'])/'pa-owned-profile.json').read_text())['sessionRoot']==str(r)
 assert not x['existed'] or Path(x['protected']).is_dir()
p=subprocess.Popen([m['executable']]);d={'pid':p.pid,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'executable':m['executable'],'sha256':m['sha256']};(r/'launch.json').write_text(json.dumps(d,indent=2));print(json.dumps(d))
