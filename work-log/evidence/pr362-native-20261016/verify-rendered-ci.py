from pathlib import Path, PurePosixPath
import subprocess, json, hashlib, zipfile
r=Path(__file__).resolve().parent;repo='repos/MariosGiannakaras/Narro';run=38894130069
record=json.loads(subprocess.check_output(['gh','api',repo+f'/actions/runs/{run}'],creationflags=0x08000000));assert record['head_sha']=='560efeb076d2ec167232b9d86aa3354f6893214b'
items=json.loads(subprocess.check_output(['gh','api',repo+f'/actions/runs/{run}/artifacts'],creationflags=0x08000000))['artifacts']
item=next(x for x in items if x['name']=='narro-m5-visual-regression' and not x['expired'])
p=r/'analysis/ci-visual.zip'
with p.open('wb') as f:subprocess.run(['gh','api',repo+f'/actions/artifacts/{item["id"]}/zip'],stdout=f,check=True,creationflags=0x08000000)
sha=hashlib.sha256(p.read_bytes()).hexdigest();assert item['digest']=='sha256:'+sha
with zipfile.ZipFile(p) as z:
 assert z.testzip() is None
 names=[n for n in z.namelist() if 'focus-editor-m7-integration' in n]
 for n in names:
  q=PurePosixPath(n);assert not q.is_absolute() and '..' not in q.parts
  target=r/'analysis/ci-m7-integration'/q.name;target.parent.mkdir(exist_ok=True);target.write_bytes(z.read(n))
 receipt={'source':record['head_sha'],'ci':run,'artifact':item['id'],'providerSha256':sha,'zipCrc':'PASS','entries':len(z.infolist()),'m7Files':names,'claim':'CI acquisition evidence only; full CI/native approval still pending'}
(r/'analysis/ci-rendered-verification.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
print(json.dumps(receipt))
