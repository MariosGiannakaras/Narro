import ctypes as c,ctypes.wintypes as w,json,pathlib,sys,time,datetime
r=pathlib.Path(__file__).parent;u=c.windll.user32;u.SetProcessDpiAwarenessContext(c.c_void_p(-4));u.GetForegroundWindow.restype=w.HWND
h=w.HWND(int(sys.argv[1]));assert int(u.GetForegroundWindow())==h.value
assert json.loads((r/'profile-protection-private.json').read_text())['state']=='OWNED_PROFILE_ACTIVE'
p=w.POINT(int(sys.argv[2]),int(sys.argv[3]));u.ClientToScreen(h,c.byref(p));u.SetCursorPos(p.x,p.y)
start=datetime.datetime.now(datetime.timezone.utc).isoformat();delta=int(sys.argv[4]);count=int(sys.argv[5])
for _ in range(count):
 assert int(u.GetForegroundWindow())==h.value
 u.mouse_event(0x0800,0,0,delta&0xffffffff,0);time.sleep(.08)
time.sleep(.4)
with (r/'actions.jsonl').open('a',encoding='utf8') as f:f.write(json.dumps({'utc':start,'action':'repeated actual native mouse-wheel','hwnd':h.value,'point':[p.x,p.y],'delta':delta,'count':count,'endUtc':datetime.datetime.now(datetime.timezone.utc).isoformat()})+'\n')
