import sys,pathlib,json,ctypes as c,ctypes.wintypes as w,datetime
r=pathlib.Path(__file__).parent;sys.path.insert(0,r'E:\SystemFiles\Desktop\Narro-Workspace\Narro-PA351-native-20261014\probe-deps');sys.coinit_flags=0
c.windll.user32.SetProcessDpiAwarenessContext(c.c_void_p(-4))
import comtypes.client
mod=comtypes.client.GetModule('UIAutomationCore.dll');a=comtypes.client.CreateObject(mod.CUIAutomation,interface=mod.IUIAutomation)
h=int(sys.argv[1]);root=a.ElementFromHandle(h);nodes=root.FindAll(4,a.CreateTrueCondition());out=[]
for i in range(nodes.Length):
 e=nodes.GetElement(i)
 try:
  name=e.CurrentName;typ=e.CurrentControlType
  if len(sys.argv)>2 and sys.argv[2].casefold() not in name.casefold():continue
  if typ not in [50022,50000,50002,50003,50004,50007,50009,50013,50015,50016,50032,50025,50026,50020,50019,50011]:continue
  q=e.CurrentBoundingRectangle
  item={'name':name,'type':typ,'enabled':bool(e.CurrentIsEnabled),'offscreen':bool(e.CurrentIsOffscreen),'focused':bool(e.CurrentHasKeyboardFocus),'rect':[q.left,q.top,q.right,q.bottom]}
  for key,pattern,interface,attribute in [('selected',10010,mod.IUIAutomationSelectionItemPattern,'CurrentIsSelected'),('toggle',10015,mod.IUIAutomationTogglePattern,'CurrentToggleState'),('value',10002,mod.IUIAutomationValuePattern,'CurrentValue')]:
   try:item[key]=getattr(e.GetCurrentPattern(pattern).QueryInterface(interface),attribute)
   except Exception:pass
  out.append(item)
 except Exception:pass
print(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'hwnd':h,'controls':out}))

