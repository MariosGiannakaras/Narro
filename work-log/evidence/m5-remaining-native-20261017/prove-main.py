from pathlib import Path
import subprocess,json,datetime
r=Path(__file__).resolve().parent;repo=Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload');head='560efeb076d2ec167232b9d86aa3354f6893214b'
def git(*args):return subprocess.check_output(['git',*args],cwd=repo,encoding='utf-8')
if subprocess.run(['git','cat-file','-e',head],cwd=repo,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode:
 subprocess.run(['git','fetch','origin','pull/362/head'],cwd=repo,check=True)
def tree(ref):
 out={}
 for line in git('ls-tree','-r',ref).splitlines():
  meta,path=line.split('\t',1)
  if path.startswith(('work-log/','reference/')) or path.endswith('.md') and path!='docs/M7_AUTOMATIC_VALIDATION_LOGGING.md':continue
  out[path]=meta
 return out
a,b=tree(head),tree('HEAD');assert a==b,'Do not reuse PR validation for different executable/build/test/CI inputs'
out={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pr':362,'ci':38894130069,'head':head,'main':git('rev-parse','HEAD').strip(),'identicalInputs':len(a),'workflowIdentical':a['.github/workflows/ci.yml']==b['.github/workflows/ci.yml'],'mainValidation':'Exact green PR input/workflow identity under CI_VALIDATION_STRATEGY7; duplicate resulting-main run may be cancelled only after this proof','changedPaths':git('diff','--name-only',head,'HEAD').splitlines()}
(r/'analysis/main-input-identity.json').write_text(json.dumps(out,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in out.items() if k!='changedPaths'}))

