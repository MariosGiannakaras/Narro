from pathlib import Path,PurePosixPath
import subprocess,json,hashlib,zipfile,struct
r=Path(__file__).resolve().parent
assert json.loads((r/'session-meta.json').read_text())['head']=='b11c80bb43e11ee438698450377beea0b31933c1'
assert (r/'analysis/main-input-identity.json').exists(), 'Merged main full input identity required before capture'
repo='repos/MariosGiannakaras/Narro';run=38994951447;head='b11c80bb43e11ee438698450377beea0b31933c1'
def api(p):return json.loads(subprocess.check_output(['gh','api',repo+p],creationflags=0x08000000))
record=api(f'/actions/runs/{run}')
assert record['head_sha']==head and record['status']=='completed' and record['conclusion']=='success','Exact CI not accepted'
jobs=api(f'/actions/runs/{run}/jobs?per_page=20')['jobs']
assert {j['name'] for j in jobs}=={'validation-gate','fast-gate','windows-candidate'} and all(j['conclusion']=='success' for j in jobs)
artifacts=api(f'/actions/runs/{run}/artifacts?per_page=20')['artifacts']
(r/'analysis').mkdir(exist_ok=True);receipts=[]
for name,alias in [('narro-m7-validation-windows-x64','validation')]:
 found=[x for x in artifacts if x['name']==name and not x['expired']];assert len(found)==1
 item=found[0];p=r/'analysis'/(alias+'.zip')
 if not p.exists() or item.get('digest')!='sha256:'+hashlib.sha256(p.read_bytes()).hexdigest():
  with p.open('wb') as f:subprocess.run(['gh','api',repo+f"/actions/artifacts/{item['id']}/zip"],stdout=f,check=True,creationflags=0x08000000)
 digest=hashlib.sha256(p.read_bytes()).hexdigest();assert item.get('digest')=='sha256:'+digest
 with zipfile.ZipFile(p) as z:
  assert z.testzip() is None
  for n in z.namelist():
   q=PurePosixPath(n);assert not q.is_absolute() and '..' not in q.parts and ':' not in n and '\\' not in n
  receipt={'artifact':item['id'],'name':name,'source':head,'ci':run,'sha256':digest,'entries':len(z.infolist())}
  if alias=='validation':
   exe=z.read('narro-m7-validation.exe');assert exe[:2]==b'MZ'
   off=struct.unpack_from('<I',exe,0x3c)[0];assert exe[off:off+4]==b'PE\0\0' and struct.unpack_from('<H',exe,off+4)[0]==34404
   folder=r/'analysis/validation';folder.mkdir(exist_ok=True);z.extractall(folder)
   receipt['exe_sha256']=hashlib.sha256(exe).hexdigest()
  if alias=='frontend':
   folder=r/'analysis/frontend';folder.mkdir(exist_ok=True);z.extractall(folder)
 receipts.append(receipt)
(r/'analysis/artifact-manifest.json').write_text(json.dumps({'run':record,'jobs':jobs,'artifacts':receipts,'availableArtifactMetadata':artifacts},indent=2),encoding='utf-8')
v=next(x for x in receipts if x['name']=='narro-m7-validation-windows-x64')
(r/'session-meta.json').write_text(json.dumps({'state':'ARTIFACT_VERIFIED','head':head,'ci':run,'pr':364,'executable':str(r/'analysis/validation/narro-m7-validation.exe'),'sha256':v['exe_sha256'],'scope':'PR364 affected Done/archive cards and genuinely missing B45/B40/customcolor claims; preserve accepted eight-group corpus.'},indent=2),encoding='utf-8')
print(json.dumps(receipts,indent=2))
