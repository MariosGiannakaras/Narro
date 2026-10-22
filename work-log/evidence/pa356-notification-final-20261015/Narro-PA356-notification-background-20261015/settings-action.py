import pathlib,sys,ctypes as c,ctypes.wintypes as w,time,json,datetime
r=pathlib.Path(__file__).parent;sys.path.insert(0,r'E:\SystemFiles\Desktop\Narro-PA351-native-20261014\probe-deps');sys.coinit_flags=0
import comtypes.client
m=comtypes.client.GetModule('UIAutomationCore.dll');a=comtypes.client.CreateObject(m.CUIAutomation,interface=m.IUIAutomation)
u=c.windll.user32;u.SetProcessDpiAwarenessContext(c.c_void_p(-4));u.GetForegroundWindow.restype=w.HWND;u.GetAncestor.restype=w.HWND;u.WindowFromPoint.restype=w.HWND
h=790236;assert u.GetForegroundWindow()==h;root=a.ElementFromHandle(h);assert root.CurrentName=='Settings'
nodes=root.FindAll(4,a.CreateTrueCondition());items=[nodes.GetElement(i) for i in range(nodes.Length) if nodes.GetElement(i).CurrentName==sys.argv[1] and nodes.GetElement(i).CurrentControlType==50020 and not nodes.GetElement(i).CurrentIsOffscreen and nodes.GetElement(i).CurrentIsEnabled];assert len(items)==1,len(items)
e=items[0];rect=e.CurrentBoundingRectangle;p=w.POINT((rect.left+rect.right)//2,(rect.top+rect.bottom)//2)
assert u.GetAncestor(u.WindowFromPoint(p),2)==h,'Control is occluded; abort'
u.SetCursorPos(p.x,p.y);u.mouse_event(2,0,0,0,0);time.sleep(.08);u.mouse_event(4,0,0,0,0)
with (r/'settings-actions.jsonl').open('a') as f:f.write(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'clicked':sys.argv[1],'rect':[rect.left,rect.top,rect.right,rect.bottom]})+'\n')
