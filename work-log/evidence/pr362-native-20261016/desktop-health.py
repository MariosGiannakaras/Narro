import ctypes as c,ctypes.wintypes as w,json,datetime
from pathlib import Path
u=c.windll.user32;u.GetForegroundWindow.restype=w.HWND;u.OpenInputDesktop.restype=w.HANDLE
h=u.GetForegroundWindow();title=c.create_unicode_buffer(1024);klass=c.create_unicode_buffer(260);pid=w.DWORD()
u.GetWindowTextW(h,title,len(title));u.GetClassNameW(h,klass,len(klass));u.GetWindowThreadProcessId(h,c.byref(pid))
d=u.OpenInputDesktop(0,False,1);name=c.create_unicode_buffer(260);needed=w.DWORD()
if d:
 assert u.GetUserObjectInformationW(w.HANDLE(d),2,name,c.sizeof(name),c.byref(needed));u.CloseDesktop(w.HANDLE(d))
data={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'foreground':{'hwnd':int(h or 0),'title':title.value,'class':klass.value,'pid':pid.value},'inputDesktop':name.value or None,'inputDesktopAccessible':bool(d)}
(Path(__file__).parent/'observations/desktop-health.json').write_text(json.dumps(data,indent=2),encoding='utf-8');print(json.dumps(data))
