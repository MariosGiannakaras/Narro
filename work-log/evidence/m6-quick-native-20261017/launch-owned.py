from pathlib import Path
import subprocess,json,datetime,sys
r=Path(__file__).resolve().parent
assert not (r/'launch.json').exists(),'Existing launch receipt: inspect side effects instead of relaunch'
subprocess.run([sys.executable,str(r/'assert-launch-safe.py')],check=True)
meta=json.loads((r/'session-meta.json').read_text())
running=subprocess.check_output(['powershell','-NoProfile','-Command',"@(Get-Process narro,narro-m7-validation -ErrorAction SilentlyContinue | Select-Object Id,ProcessName) | ConvertTo-Json -Compress"],encoding='utf-8',creationflags=0x08000000)
assert not json.loads(running or '[]'),'Existing Narro instance: inspect ownership before launch'
p=subprocess.Popen([meta['executable']],cwd=Path(meta['executable']).parent)
receipt={'pid':p.pid,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'executable':meta['executable'],'sha256':meta['sha256'],'ownedFixture':True}
(r/'launch.json').write_text(json.dumps(receipt,indent=2),encoding='utf-8')
print(json.dumps(receipt))
