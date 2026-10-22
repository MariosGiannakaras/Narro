import ctypes as c,ctypes.wintypes as w,json,time,datetime,pathlib,sys
r=pathlib.Path(__file__).parent;u=c.windll.user32;g=c.windll.gdi32;u.SetProcessDpiAwarenessContext(c.c_void_p(-4));u.GetForegroundWindow.restype=w.HWND
out=[]
@c.WINFUNCTYPE(w.BOOL,w.HWND,w.LPARAM)
def enum(h,p):
 b=c.create_unicode_buffer(512);u.GetWindowTextW(h,b,512)
 if b.value not in ['Narro','Narro - Focus','NarroBoardFocusPixels']:return True
 pid=w.DWORD();u.GetWindowThreadProcessId(h,c.byref(pid));rect=w.RECT();u.GetWindowRect(h,c.byref(rect))
 region=g.CreateRectRgn(0,0,0,0);kind=u.GetWindowRgn(h,region);box=w.RECT();g.GetRgnBox(region,c.byref(box));g.DeleteObject(region)
 out.append({'hwnd':int(h),'pid':pid.value,'title':b.value,'visible':bool(u.IsWindowVisible(h)),'rect':[rect.left,rect.top,rect.right,rect.bottom],'dpi':u.GetDpiForWindow(h),'region_kind':kind,'visible_region_box':[box.left,box.top,box.right,box.bottom]})
 return True
end=time.monotonic()+float(sys.argv[2] if len(sys.argv)>2 else 4)
with open(r/(sys.argv[1]+'.jsonl'),'w',encoding='utf8',newline='\n') as f:
 while time.monotonic()<end:
  out=[];u.EnumWindows(enum,0);f.write(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'foreground':int(u.GetForegroundWindow()),'windows':out})+'\n');f.flush();time.sleep(.008)
