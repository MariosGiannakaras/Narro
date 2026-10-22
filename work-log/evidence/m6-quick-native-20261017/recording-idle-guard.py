from pathlib import Path
import json,datetime,time,subprocess,sys
r=Path(__file__).resolve().parent
start=next(x for x in reversed([json.loads(l) for l in (r/'obs-actions.jsonl').read_text().splitlines()]) if x['action']=='Start Recording')
t0=datetime.datetime.fromisoformat(start['utc']).timestamp()
while True:
 time.sleep(5)
 obs=[json.loads(l) for l in (r/'obs-actions.jsonl').read_text().splitlines() if l.strip()]
 if obs[-1]['action']=='Stop Recording':break
 p=r/'native-actions.jsonl';last=t0
 if p.exists():
  lines=p.read_text().splitlines()
  if lines:last=datetime.datetime.fromisoformat(json.loads(lines[-1])['utc']).timestamp()
 now=time.time()
 if now-last<120:continue
 state=json.loads(subprocess.check_output([sys.executable,str(r/'obs-control.py'),str(start['hwnd']),'state'],encoding='utf-8'))
 controls=state['controls'];active=any(c['name']=='Stop Recording' for c in controls);timer=next((c['name'] for c in controls if 'recordTime' in c['id']),None)
 owned=False
 if timer:
  try:
   h,m,s=map(int,timer.split(':'));owned=abs((h*3600+m*60+s)-(now-t0))<15
  except ValueError:pass
 result={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'idleSeconds':now-last,'recordingActive':active,'recordingOwnershipTimerVerified':owned,'action':'NO_TOUCH_UNKNOWN_OR_STOPPED'}
 if active and owned:
  subprocess.run([sys.executable,str(r/'obs-control.py'),str(start['hwnd']),'Stop Recording'],check=True);result['action']='STOPPED_OWNED_IDLE_RECORDING'
 (r/'idle-guard-result.json').write_text(json.dumps(result,indent=2),encoding='utf-8');break
