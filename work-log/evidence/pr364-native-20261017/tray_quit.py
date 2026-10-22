import ctypes as c,ctypes.wintypes as w,time,datetime,json,pathlib,sys
r=pathlib.Path(__file__).parent;sys.path.insert(0,r'E:\SystemFiles\Desktop\Narro-Workspace\Narro-PA351-native-20261014\probe-deps');sys.coinit_flags=0
import comtypes.client
m=comtypes.client.GetModule('UIAutomationCore.dll');a=comtypes.client.CreateObject(m.CUIAutomation,interface=m.IUIAutomation)
u=c.windll.user32;u.SetProcessDPIAware();u.SendMessageW.restype=c.c_ssize_t
assert json.loads((r/'profile-protection-private.json').read_text())['state']=='OWNED_PROFILE_ACTIVE'
u.FindWindowW.restype=w.HWND
tray=u.FindWindowW('Shell_TrayWnd',None);assert tray
e=a.ElementFromHandle(int(tray)).FindFirst(4,a.CreatePropertyCondition(30005,'Notification Chevron'))
e.GetCurrentPattern(10000).QueryInterface(m.IUIAutomationInvokePattern).Invoke();time.sleep(.3)
time.sleep(.7)
e=a.GetRootElement().FindFirst(4,a.CreateAndCondition(a.CreatePropertyCondition(30005,'Narro'),a.CreatePropertyCondition(30003,50000)));assert bool(e) and not e.CurrentIsOffscreen
q=e.CurrentBoundingRectangle;u.SetCursorPos((q.left+q.right)//2,(q.top+q.bottom)//2);u.mouse_event(8,0,0,0,0);u.mouse_event(16,0,0,0,0);time.sleep(.3)
menus=[];cb=c.WINFUNCTYPE(w.BOOL,w.HWND,w.LPARAM)
@cb
def enum(h,p):
 t=c.create_unicode_buffer(260);u.GetClassNameW(h,t,260)
 if u.IsWindowVisible(h) and t.value=='#32768':menus.append(int(h))
 return True
u.EnumWindows(enum,0);assert len(menus)==1,menus
hm=u.SendMessageW(w.HWND(menus[0]),0x01e1,0,0);assert hm
count=u.GetMenuItemCount(w.HMENU(hm));labels=[]
for i in range(count):
 t=c.create_unicode_buffer(260);u.GetMenuStringW(w.HMENU(hm),i,t,260,0x400);labels.append(t.value)
indices=[i for i,s in enumerate(labels) if s.replace('&','')=='Quit Narro'];assert len(indices)==1,labels
rect=w.RECT();assert u.GetMenuItemRect(0,w.HMENU(hm),indices[0],c.byref(rect))
u.SetCursorPos((rect.left+rect.right)//2,(rect.top+rect.bottom)//2);u.mouse_event(2,0,0,0,0);u.mouse_event(4,0,0,0,0)
event={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'text':sys.argv[1] if len(sys.argv)>1 else 'normal tray Quit','menu':labels,'clicked_rect':[rect.left,rect.top,rect.right,rect.bottom]}
with (r/'actions.jsonl').open('a',encoding='utf-8') as f:f.write(json.dumps(event)+'\n')
print(json.dumps(event))


