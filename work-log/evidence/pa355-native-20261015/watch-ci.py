import subprocess,json,time,datetime
run='38630226135';last=None
while True:
 p=subprocess.run(['gh','run','view',run,'--json','headSha,status,conclusion,jobs'],capture_output=True,text=True,creationflags=0x08000000)
 if p.returncode:
  print(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'readError':p.stderr.strip()}),flush=True);time.sleep(45);continue
 d=json.loads(p.stdout);assert d['headSha']=='7b54e62f5d5f814e3e37ed93d8dfa996e9bad6e5'
 state={'status':d['status'],'conclusion':d['conclusion'],'jobs':[{'name':j['name'],'status':j['status'],'conclusion':j['conclusion'],'step':next((s['name'] for s in j['steps'] if s['status']=='in_progress'),None)} for j in d['jobs']]}
 if state!=last:
  print(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),**state}),flush=True);last=state
 if d['status']=='completed':break
 time.sleep(45)
