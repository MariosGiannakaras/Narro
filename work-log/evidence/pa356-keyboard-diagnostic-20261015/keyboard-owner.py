from pathlib import Path
import ctypes as c,ctypes.wintypes as w,json,datetime,sys
r=Path(__file__).resolve().parent;u=c.windll.user32
ledger=json.loads((r/'profile-protection-private.json').read_text());launch=json.loads((r/'launch.json').read_text())
assert ledger['state']=='OWNED_PROFILE_ACTIVE'
h=int(sys.argv[1]);pid=w.DWORD();thread=u.GetWindowThreadProcessId(w.HWND(h),c.byref(pid));assert pid.value==launch['pid']
class GTI(c.Structure):
 _fields_=[('size',w.DWORD),('flags',w.DWORD),('active',w.HWND),('focus',w.HWND),('capture',w.HWND),('menuOwner',w.HWND),('moveSize',w.HWND),('caret',w.HWND),('caretRect',w.RECT)]
g=GTI();g.size=c.sizeof(g);assert u.GetGUIThreadInfo(thread,c.byref(g))
def window(value):
 if not value:return None
 name=c.create_unicode_buffer(256);u.GetClassNameW(value,name,256);p=w.DWORD();u.GetWindowThreadProcessId(value,c.byref(p))
 return {'hwnd':int(value),'class':name.value,'pid':p.value}
data={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownedMain':h,'thread':thread,'active':window(g.active),'focus':window(g.focus),'capture':window(g.capture),'flags':g.flags}
(r/'observations'/(sys.argv[2]+'.json')).write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8');print(json.dumps(data))
