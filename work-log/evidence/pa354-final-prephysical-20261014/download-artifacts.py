from pathlib import Path, PurePosixPath
import json, subprocess, hashlib, zipfile, struct
r=Path(__file__).resolve().parent
repo='repos/MariosGiannakaras/Narro'; run=38614321520
head='7647ffabb8ee93edfe95f90395baec632802b25e'
def api(path): return json.loads(subprocess.check_output(['gh','api',repo+path],creationflags=0x08000000))
record=api(f'/actions/runs/{run}'); assert record['head_sha']==head and record['conclusion']=='success' and record['status']=='completed'
jobs=api(f'/actions/runs/{run}/jobs?per_page=10')['jobs']
assert {j['name'] for j in jobs}=={'validation-gate','fast-gate','windows-candidate'} and all(j['conclusion']=='success' for j in jobs)
artifacts=api(f'/actions/runs/{run}/artifacts?per_page=10')['artifacts']
names={'narro-m7-validation-windows-x64':'validation','narro-m7-physical-windows-x64':'physical','narro-m5-visual-regression':'visual','narro-m7-focus-runtime-visual':'focus-runtime','narro-fast-frontend-dist':'fast-frontend-dist'}
receipts=[]
for name,alias in names.items():
    matches=[a for a in artifacts if a['name']==name and not a['expired']]; assert len(matches)==1
    item=matches[0]; target=r/'analysis'/(alias+'.zip')
    with target.open('wb') as output: subprocess.run(['gh','api',repo+f"/actions/artifacts/{item['id']}/zip"],stdout=output,check=True,creationflags=0x08000000)
    digest=hashlib.sha256(target.read_bytes()).hexdigest(); assert item.get('digest')=='sha256:'+digest
    with zipfile.ZipFile(target) as z:
        assert z.testzip() is None
        for n in z.namelist():
            p=PurePosixPath(n); assert not p.is_absolute() and '..' not in p.parts and ':' not in n and '\\' not in n
        receipt={'artifact':item['id'],'name':name,'source':head,'ci':run,'zip_sha256':digest,'crc_entries':len(z.infolist())}
        if alias=='validation':
            exe=z.read('narro-m7-validation.exe'); assert exe[:2]==b'MZ'
            offset=struct.unpack_from('<I',exe,0x3c)[0]; assert exe[offset:offset+4]==b'PE\0\0' and struct.unpack_from('<H',exe,offset+4)[0]==34404
            folder=r/'analysis'/'validation'; folder.mkdir(exist_ok=True); z.extractall(folder)
            receipt['exe_sha256']=hashlib.sha256(exe).hexdigest()
    (r/'analysis'/(alias+'.verification.json')).write_text(json.dumps(receipt,indent=2),encoding='utf8'); receipts.append(receipt)
validation=next(v for v in receipts if v['name']=='narro-m7-validation-windows-x64')
meta={'state':'ARTIFACT_VERIFIED','head':head,'ci':run,'pr':354,'executable':str(r/'analysis/validation/narro-m7-validation.exe'),'sha256':validation['exe_sha256'],'scope':'Reports tooltip clipping: 30/90-day hover/focus/scroll, resize/DPI/reduced motion, picker/PDF paired checks'}
(r/'session-meta.json').write_text(json.dumps(meta,indent=2),encoding='utf8')
(r/'analysis/artifact-manifest.json').write_text(json.dumps({'run':record,'jobs':jobs,'artifacts':receipts},indent=2),encoding='utf8')
print(json.dumps(receipts))
