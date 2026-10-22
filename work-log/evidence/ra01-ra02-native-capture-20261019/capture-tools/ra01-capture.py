from pathlib import Path
import ctypes as c, ctypes.wintypes as w, json, sys, time, datetime, subprocess, sqlite3, os
r=Path(__file__).resolve().parent
sys.path.insert(0,r'E:\SystemFiles\Desktop\Narro-Workspace\Narro-PA351-native-20261014\probe-deps')
sys.coinit_flags=0
import comtypes.client
u=c.windll.user32
u.SetProcessDpiAwarenessContext(c.c_void_p(-4))
u.GetForegroundWindow.restype=w.HWND
m=comtypes.client.GetModule('UIAutomationCore.dll')
a=comtypes.client.CreateObject(m.CUIAutomation,interface=m.IUIAutomation)
h=525478
pid=w.DWORD();u.GetWindowThreadProcessId(w.HWND(h),c.byref(pid))
assert pid.value==json.loads((r/'launch.json').read_text(encoding='utf-8-sig'))['pid']
assert json.loads((r/'profile-protection-private.json').read_text())['state']=='OWNED_PROFILE_ACTIVE'
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def run(*args):return subprocess.run([sys.executable,'-X','utf8',*map(str,args)],check=True)
def snapshot(label):
 db=sqlite3.connect((Path.home()/'AppData/Roaming/com.mariosg.Narro/narro.db').as_uri()+'?mode=ro',uri=True)
 data={'utc':utc(),'tasks':db.execute('select id,list_id,title,manual_lane,sort_rank,completed_at from tasks order by list_id,sort_rank').fetchall()};db.close()
 (r/'observations'/(label+'-db.json')).write_text(json.dumps(data,indent=2));return data
def cards():
 nodes=a.ElementFromHandle(h).FindAll(4,a.CreatePropertyCondition(30003,50007));out=[]
 for i in range(nodes.Length):
  e=nodes.GetElement(i)
  if e.CurrentIsOffscreen:continue
  q=e.CurrentBoundingRectangle
  out.append({'name':e.CurrentName,'rect':[q.left,q.top,q.right,q.bottom]})
 return out
def item(rows,title):
 hits=[v for v in rows if v['name'].startswith(title+'Schedule / Repeat')]
 assert len(hits)==1,(title,rows)
 return hits[0]
def drag(label,source,anchor,cancel=False):
 subprocess.run([sys.executable,'-X','utf8',str(r/'native-input.py'),'key','Narro',label+'-activate','0x1B'],check=True,env=dict(os.environ,NARRO_PA_INPUT_NO_SNAPSHOT='1'))
 before=snapshot(label+'-before');rows=cards();s=item(rows,source);d=item(rows,anchor)
 p=(s['rect'][0]+8,s['rect'][1]+20);q=(d['rect'][0]+110,d['rect'][1]+4)
 assert int(u.GetForegroundWindow())==h,'Target must remain foreground'
 event={'utc':utc(),'case':label,'source':s,'anchor':d,'pointerFrom':p,'pointerTo':q,'cancel':cancel,'outcome':'INPUT_STARTED'}
 with (r/'chronological-manifest.jsonl').open('a') as f:f.write(json.dumps(event)+'\n')
 u.SetCursorPos(*p);time.sleep(.3);u.mouse_event(2,0,0,0,0)
 try:
  time.sleep(.2)
  for k in range(1,33):
   u.SetCursorPos(p[0]+(q[0]-p[0])*k//32,p[1]+(q[1]-p[1])*k//32);time.sleep(.018)
  time.sleep(.35)
  if cancel:u.keybd_event(0x1B,1,0,0);u.keybd_event(0x1B,1,2,0);time.sleep(.2)
 finally:u.mouse_event(4,0,0,0,0)
 time.sleep(1.3)
 after=snapshot(label+'-after');event.update(endUTC=utc(),outcome='INPUT_COMPLETED',afterCards=cards())
 with (r/'chronological-manifest.jsonl').open('a') as f:f.write(json.dumps(event)+'\n')
 run(r/'native-input.py','snap','Narro',label)
 print(json.dumps({'case':label,'status':'CAPTURED_REVIEW_PENDING'}),flush=True)
started=False
try:
 run(r/'motion.py','repeat-normal')
 run(r/'obs-control.py','329150','Start Recording');started=True
 time.sleep(1)
 for label,source,anchor,cancel in [('RA01-N1-cross-lane','Drag Alpha','Week Anchor',False),('RA01-N2-reorder','Week Second','Week Anchor',False),('RA01-N3-cancel','Drag Beta','Week Anchor',True)]:
  try:drag(label,source,anchor,cancel)
  except Exception as e:
   with (r/'chronological-manifest.jsonl').open('a') as f:f.write(json.dumps({'utc':utc(),'case':label,'outcome':'TOOL_OR_STATE_BLOCKER','error':str(e)})+'\n')
   print(str(e),flush=True)
 run(r/'motion.py','reduced');time.sleep(1)
 for label,source,anchor,cancel in [('RA01-R1-cross-lane','Drag Beta','Week Anchor',False),('RA01-R2-reorder','Drag Alpha','Week Second',False),('RA01-R3-cancel','Week Anchor','Week Second',True)]:
  try:drag(label,source,anchor,cancel)
  except Exception as e:
   with (r/'chronological-manifest.jsonl').open('a') as f:f.write(json.dumps({'utc':utc(),'case':label,'outcome':'TOOL_OR_STATE_BLOCKER','error':str(e)})+'\n')
   print(str(e),flush=True)
 time.sleep(1)
finally:
 if started:run(r/'obs-control.py','329150','Stop Recording')
 run(r/'motion.py','restore')
videos=sorted(Path(r'E:\SystemFiles\Desktop\Narro-Workspace\Narro-Capture-Recovery-20261019\video').glob('*.mkv'),key=lambda p:p.stat().st_mtime)
assert videos
video=videos[-1]
import shutil
destination=r/'video'/'RA01-original.mkv';assert not destination.exists();shutil.copy2(video,destination)
(r/'ra01-capture-receipt.json').write_text(json.dumps({'utc':utc(),'video':str(destination),'originalOBSFile':str(video),'analysis':'NOT STARTED','physicalVerdict':'REVIEW_PENDING'},indent=2))
