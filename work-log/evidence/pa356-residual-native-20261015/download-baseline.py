from pathlib import Path
import subprocess,json,hashlib,zipfile
r=Path(__file__).resolve().parent;repo='repos/MariosGiannakaras/Narro';id=11299363071
run=json.loads(subprocess.check_output(['gh','api',repo+'/actions/runs/37191346390']));assert run['head_sha']=='c2821e6f998c6cd7424d5aed8673f5c9a3ff9e9d' and run['conclusion']=='success'
a=json.loads(subprocess.check_output(['gh','api',repo+f'/actions/artifacts/{id}']));assert not a['expired'] and a['name']=='narro-m1-diagnostic-windows-x64'
p=r/'analysis/ci942-diagnostic.zip'
with p.open('wb') as f:subprocess.run(['gh','api',repo+f'/actions/artifacts/{id}/zip'],stdout=f,check=True)
assert a['digest']=='sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
with zipfile.ZipFile(p) as z:
 assert z.testzip() is None
 for n in z.namelist():assert not Path(n).is_absolute() and '..' not in Path(n).parts and ':' not in n
 z.extractall(r/'baseline-ci942')
exes=list((r/'baseline-ci942').rglob('narro.exe'));assert len(exes)==1;exe=exes[0];sha=hashlib.sha256(exe.read_bytes()).hexdigest();assert sha=='89b2c7c6799743e891a8c602c0e969aab8d0ecdd6b64a809c453f44e567af648'
meta={'state':'ARTIFACT_VERIFIED','head':run['head_sha'],'ci':37191346390,'artifact':id,'executable':str(exe),'sha256':sha,'identifier':'com.mariosg.Narro.M1Diagnostic','scope':'Historical same-machine CPU comparison only; never substituted for current physical acceptance','zip_sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(r/'analysis/baseline-meta.json').write_text(json.dumps(meta,indent=2));print(json.dumps(meta))
