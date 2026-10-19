from pathlib import Path
import time,json,subprocess,sys,datetime
r=Path(__file__).resolve().parent
lease=r/'recording-lease.json'
token=json.loads(lease.read_text())['token']
time.sleep(180)
state=json.loads(lease.read_text())
if state.get('token')==token and state.get('state')=='RECORDING':
 result=subprocess.run([sys.executable,'-X','utf8',str(r/'obs-control.py'),'329150','Stop Recording'],capture_output=True,text=True)
 state.update(state='WATCHDOG_STOPPED',utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),result=result.returncode,stdout=result.stdout,stderr=result.stderr)
 lease.write_text(json.dumps(state,indent=2))
