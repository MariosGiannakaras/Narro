from pathlib import Path
import ctypes as c,ctypes.wintypes as w,datetime,time,json
r=Path(__file__).resolve().parent;u=c.windll.user32;u.GetForegroundWindow.restype=w.HWND
end=datetime.datetime.fromisoformat('2026-10-15T09:49:35+00:00');count=0
with (r/'background-reminder-foreground.jsonl').open('a',encoding='utf8') as f:
 while datetime.datetime.now(datetime.timezone.utc)<end:
  h=u.GetForegroundWindow();title=c.create_unicode_buffer(260);u.GetWindowTextW(h,title,260);pid=w.DWORD();u.GetWindowThreadProcessId(h,c.byref(pid))
  f.write(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'foregroundHwnd':int(h),'pid':pid.value,'title':title.value})+'\n');f.flush();count+=1;time.sleep(.5)
print(json.dumps({'observations':count,'endedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat()}))
