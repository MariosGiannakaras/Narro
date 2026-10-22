import ctypes as c,ctypes.wintypes as w,json,datetime,pathlib,sys
u=c.windll.user32;u.SetProcessDpiAwarenessContext(c.c_void_p(-4));out=[]
class MI(c.Structure):_fields_=[('size',w.DWORD),('monitor',w.RECT),('work',w.RECT),('flags',w.DWORD),('device',w.WCHAR*32)]
u.GetMonitorInfoW.argtypes=[w.HANDLE,c.POINTER(MI)];u.GetMonitorInfoW.restype=w.BOOL
c.windll.shcore.GetDpiForMonitor.argtypes=[w.HANDLE,c.c_int,c.POINTER(w.UINT),c.POINTER(w.UINT)]
c.windll.shcore.GetDpiForMonitor.restype=c.c_long
def rect(q):return [q.left,q.top,q.right,q.bottom]
@c.WINFUNCTYPE(w.BOOL,w.HANDLE,w.HDC,c.POINTER(w.RECT),w.LPARAM)
def enum(h,d,q,p):
 m=MI();m.size=c.sizeof(m);assert u.GetMonitorInfoW(h,c.byref(m));x=w.UINT();y=w.UINT();hr=c.windll.shcore.GetDpiForMonitor(h,0,c.byref(x),c.byref(y))
 out.append({'device':m.device,'bounds':rect(m.monitor),'work':rect(m.work),'primary':bool(m.flags&1),'dpi':[x.value,y.value],'dpi_hresult':hr});return True
u.EnumDisplayMonitors.argtypes=[w.HDC,c.POINTER(w.RECT),type(enum),w.LPARAM];u.EnumDisplayMonitors.restype=w.BOOL
assert u.EnumDisplayMonitors(None,None,enum,0)
assert sum(m['primary'] for m in out)==1, 'Incomplete monitor probe; do not infer topology'
data={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'monitors':out};pathlib.Path(__file__).parent.joinpath('observations',sys.argv[1]+'.json').write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8');print(json.dumps(data))
