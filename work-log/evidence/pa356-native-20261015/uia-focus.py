from pathlib import Path
import json,sys,ctypes as c,ctypes.wintypes as w,datetime,time
r=Path(__file__).parent
assert json.loads((r/'profile-protection-private.json').read_text())['state']=='OWNED_PROFILE_ACTIVE'
sys.path.insert(0,r'E:\SystemFiles\Desktop\Narro-PA351-native-20261014\probe-deps');sys.coinit_flags=0
import comtypes.client
u=c.windll.user32;u.SetProcessDpiAwarenessContext(c.c_void_p(-4));u.GetForegroundWindow.restype=w.HWND
h=int(sys.argv[1]);name=sys.argv[2]
assert u.IsWindow(w.HWND(h)) and int(u.GetForegroundWindow())==h,'Activate observed owned Main before accessibility focus'
m=comtypes.client.GetModule('UIAutomationCore.dll');a=comtypes.client.CreateObject(m.CUIAutomation,interface=m.IUIAutomation)
root=a.ElementFromHandle(h)
nodes=root.FindAll(4,a.CreatePropertyCondition(30005,name));matches=[]
for i in range(nodes.Length):
    e=nodes.GetElement(i)
    if e.CurrentIsEnabled and e.CurrentIsKeyboardFocusable:matches.append(e)
assert len(matches)==1,{'name':name,'focusableMatches':len(matches)}
e=matches[0];q=e.CurrentBoundingRectangle
e.SetFocus();time.sleep(.2)
focused=bool(e.CurrentHasKeyboardFocus)
event={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'action':'real Windows UIA accessibility focus','hwnd':h,'name':name,'focused':focused,'rect':[q.left,q.top,q.right,q.bottom]}
with (r/'actions.jsonl').open('a',encoding='utf8') as f:f.write(json.dumps(event)+'\n')
print(json.dumps(event));assert focused,'Native focus not confirmed; reobserve before keyboard input'
