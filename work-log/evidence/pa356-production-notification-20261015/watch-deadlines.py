from pathlib import Path
import ctypes as c, ctypes.wintypes as w, datetime, json, time, subprocess, sys
r=Path(__file__).parent.resolve();u=c.windll.user32;u.GetForegroundWindow.restype=w.HWND
u.SetProcessDpiAwarenessContext(c.c_void_p(-4))
plan=json.loads((r/'probe-plan.json').read_text());due=[datetime.datetime.fromisoformat(p['dueUtc']) for p in plan['probes']]
stop=due[-1]+datetime.timedelta(seconds=35);captured=set();seen=set()
while datetime.datetime.now(datetime.timezone.utc)<stop:
    now=datetime.datetime.now(datetime.timezone.utc);windows=[]
    @c.WINFUNCTYPE(w.BOOL,w.HWND,w.LPARAM)
    def enum(h,p):
        if u.IsWindowVisible(h):
            name=c.create_unicode_buffer(512);cls=c.create_unicode_buffer(128)
            u.GetWindowTextW(h,name,512);u.GetClassNameW(h,cls,128)
            pid=w.DWORD();u.GetWindowThreadProcessId(h,c.byref(pid));rc=w.RECT();u.GetWindowRect(h,c.byref(rc))
            windows.append({'hwnd':int(h),'title':name.value,'class':cls.value,'pid':pid.value,'rect':[rc.left,rc.top,rc.right,rc.bottom]})
        return True
    u.EnumWindows(enum,0)
    data={'utc':now.isoformat(),'foreground':int(u.GetForegroundWindow()),'windows':windows}
    with (r/'native-window-watch.jsonl').open('a',encoding='utf8') as f:f.write(json.dumps(data)+'\n')
    for item in windows:
        if 'notification' in item['title'].lower() and item['hwnd'] not in seen:
            seen.add(item['hwnd']);print(json.dumps({'notificationWindow':item,'utc':now.isoformat()}),flush=True)
            subprocess.run([sys.executable,str(r/'uia_controls.py'),str(item['hwnd'])],stdout=(r/'observations'/f"toast-{item['hwnd']}.json").open('w',encoding='utf8'))
    for i,t in enumerate(due):
        for delay in [3,10]:
            k=(i,delay)
            if k not in captured and now>=t+datetime.timedelta(seconds=delay):
                captured.add(k)
                path=r/'observations'/f'probe-{i+1}-plus-{delay}s.png'
                subprocess.run(['ffmpeg','-v','error','-f','gdigrab','-i','desktop','-frames:v','1','-update','1',str(path)],check=True)
                print(json.dumps({'capture':str(path),'utc':now.isoformat()}),flush=True)
    time.sleep(.5)
print('WATCH_COMPLETE',flush=True)
