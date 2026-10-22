import ctypes as c,ctypes.wintypes as w,json,sys,datetime,pathlib
u=c.windll.user32;u.SetProcessDpiAwarenessContext(c.c_void_p(-4))
h=w.HWND(int(sys.argv[1]));assert u.IsWindow(h)
outer=w.RECT();client=w.RECT();origin=w.POINT()
assert u.GetWindowRect(h,c.byref(outer)) and u.GetClientRect(h,c.byref(client)) and u.ClientToScreen(h,c.byref(origin))
data={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'hwnd':int(sys.argv[1]),'dpi':u.GetDpiForWindow(h),'outer':[outer.left,outer.top,outer.right,outer.bottom],'clientSize':[client.right,client.bottom],'clientOrigin':[origin.x,origin.y],'virtualDesktop':[u.GetSystemMetrics(n) for n in [76,77,78,79]]}
print(json.dumps(data))
