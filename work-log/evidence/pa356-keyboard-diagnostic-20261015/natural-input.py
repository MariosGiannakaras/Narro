import ctypes as c,ctypes.wintypes as w,json,sys,pathlib,datetime,time,subprocess
r=pathlib.Path(__file__).resolve().parent;u=c.windll.user32
u.SetProcessDpiAwarenessContext(c.c_void_p(-4));u.GetForegroundWindow.restype=w.HWND;u.GetAncestor.restype=w.HWND
meta=json.loads((r/'launch.json').read_text());ledger=json.loads((r/'profile-protection-private.json').read_text());assert ledger['state']=='OWNED_PROFILE_ACTIVE'
sys.path.insert(0,r'E:\SystemFiles\Desktop\Narro-PA351-native-20261014\probe-deps');sys.coinit_flags=0
import comtypes.client
m=comtypes.client.GetModule('UIAutomationCore.dll');a=comtypes.client.CreateObject(m.CUIAutomation,interface=m.IUIAutomation)
matches=[]
@c.WINFUNCTYPE(w.BOOL,w.HWND,w.LPARAM)
def enum(h,p):
 name=c.create_unicode_buffer(260);u.GetWindowTextW(h,name,260);pid=w.DWORD();u.GetWindowThreadProcessId(h,c.byref(pid))
 if pid.value==meta['pid'] and name.value=='Narro' and u.IsWindowVisible(h):matches.append(int(h))
 return True
u.EnumWindows(enum,0);assert len(matches)==1;h=matches[0]
class GUI(c.Structure):_fields_=[('cbSize',w.DWORD),('flags',w.DWORD),('hwndActive',w.HWND),('hwndFocus',w.HWND),('hwndCapture',w.HWND),('hwndMenuOwner',w.HWND),('hwndMoveSize',w.HWND),('hwndCaret',w.HWND),('rcCaret',w.RECT)]
def context(label):
 tid=u.GetWindowThreadProcessId(w.HWND(h),None);g=GUI();g.cbSize=c.sizeof(g);assert u.GetGUIThreadInfo(tid,c.byref(g));focus=a.GetFocusedElement();rect=focus.CurrentBoundingRectangle
 data={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'label':label,'main':h,'foreground':int(u.GetForegroundWindow()),'focusHwnd':int(g.hwndFocus or 0),'focusRoot':int(u.GetAncestor(g.hwndFocus,2) or 0),'uiaFocus':{'name':focus.CurrentName,'pid':focus.CurrentProcessId,'rect':[rect.left,rect.top,rect.right,rect.bottom]},'modifiersDown':[vk for vk in [16,17,18,91,92] if u.GetAsyncKeyState(vk)&0x8000]}
 with (r/'context.jsonl').open('a',encoding='utf8') as f:f.write(json.dumps(data)+'\n')
 return data
cmd,label=sys.argv[1:3];before=context(label+' before')
if cmd=='click':
 name=sys.argv[3];nodes=a.ElementFromHandle(h).FindAll(4,a.CreatePropertyCondition(30005,name));items=[nodes.GetElement(i) for i in range(nodes.Length) if nodes.GetElement(i).CurrentIsEnabled and not nodes.GetElement(i).CurrentIsOffscreen];assert len(items)==1
 q=items[0].CurrentBoundingRectangle;u.SetCursorPos((q.left+q.right)//2,(q.top+q.bottom)//2);u.mouse_event(2,0,0,0,0);time.sleep(.08);u.mouse_event(4,0,0,0,0);time.sleep(.3)
elif cmd=='key':
 assert before['foreground']==h and before['focusRoot']==h and not before['modifiersDown'],before
 subprocess.run([sys.executable,str(r/'physical-key.py'),str(h),sys.argv[3]],check=True)
elif cmd!='observe':raise ValueError(cmd)
after=context(label+' after')
subprocess.run([sys.executable,str(r/'uia_controls.py'),str(h)],stdout=(r/'observations'/(label+'.json')).open('w',encoding='utf8'),check=True)
print(json.dumps({'before':before,'after':after}))
