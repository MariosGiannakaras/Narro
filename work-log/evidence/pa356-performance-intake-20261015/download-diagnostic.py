from pathlib import Path,PurePosixPath
import subprocess,json,hashlib,zipfile,struct
r=Path(__file__).resolve().parent;repo='repos/MariosGiannakaras/Narro';head='f7456738b8b8498387d4d9637409c4a384f95ba3';run=38688646540
def api(p):return json.loads(subprocess.check_output(['gh','api',repo+p]))
record=api(f'/actions/runs/{run}');assert record['head_sha']==head and record['conclusion']=='success'
a=api('/actions/artifacts/11952771160');assert a['name']=='narro-m1-diagnostic-windows-x64' and not a['expired']
archive=r/'analysis/m1-diagnostic.zip'
with archive.open('wb') as f:subprocess.run(['gh','api',repo+'/actions/artifacts/11952771160/zip'],stdout=f,check=True)
digest=hashlib.sha256(archive.read_bytes()).hexdigest();assert a['digest']=='sha256:'+digest
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 for n in z.namelist():
  p=PurePosixPath(n);assert not p.is_absolute() and '..' not in p.parts and ':' not in n and '\\' not in n
 z.extractall(r/'diagnostic');names=z.namelist()
exe=list((r/'diagnostic').rglob('narro.exe'));assert len(exe)==1;exe=exe[0];data=exe.read_bytes();off=struct.unpack_from('<I',data,60)[0];assert data[:2]==b'MZ' and struct.unpack_from('<H',data,off+4)[0]==34404
m={'state':'ARTIFACT_VERIFIED','ci':run,'head':head,'artifact':a['id'],'zip_sha256':digest,'crc_entries':len(names),'executable':str(exe),'sha256':hashlib.sha256(data).hexdigest(),'identifier':'com.mariosg.Narro.M1Diagnostic'}
(r/'session-meta.json').write_text(json.dumps(m,indent=2));print(json.dumps(m));print(json.dumps(names))
