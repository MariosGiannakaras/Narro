import ctypes as c,ctypes.wintypes as w,json,pathlib,sys,time,datetime
r=pathlib.Path(__file__).resolve().parent;u=c.windll.user32
u.SetProcessDpiAwarenessContext(c.c_void_p(-4));u.GetForegroundWindow.restype=w.HWND
meta=json.loads((r/'pdf-viewer-owned.json').read_text());hwnd=w.HWND(meta['hwnd'])
assert u.IsWindowVisible(hwnd)
title=c.create_unicode_buffer(1024);u.GetWindowTextW(hwnd,title,1024)
pid=w.DWORD();u.GetWindowThreadProcessId(hwnd,c.byref(pid))
assert pid.value==meta['pid'] and meta['fileName'].lower() in title.value.lower(), 'Wrong/changed PDF viewer document'
assert u.SetForegroundWindow(hwnd) or int(u.GetForegroundWindow())==meta['hwnd']
assert int(u.GetForegroundWindow())==meta['hwnd']
action=sys.argv[1]
if action=='wheel':
 u.mouse_event(0x0800,0,0,c.c_ulong(int(sys.argv[2])&0xffffffff),0)
elif action=='key':
 keys=[int(v) for v in sys.argv[2].split(',')]
 for vk in keys:u.keybd_event(vk,u.MapVirtualKeyW(vk,0),1 if vk in [33,34,35,36,37,38,39,40] else 0,0)
 time.sleep(.08)
 for vk in reversed(keys):u.keybd_event(vk,u.MapVirtualKeyW(vk,0),2|(1 if vk in [33,34,35,36,37,38,39,40] else 0),0)
else:raise ValueError(action)
with (r/'actions.jsonl').open('a',encoding='utf-8') as f:f.write(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'owned-PDF-viewer native input','action':action,'arguments':sys.argv[2:],'hwnd':meta['hwnd'],'pid':meta['pid'],'title':title.value})+'\n')
