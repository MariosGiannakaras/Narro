from pathlib import Path
import ctypes as c,ctypes.wintypes as w,sys,json,datetime,time
sys.path.insert(0,r'E:\SystemFiles\Desktop\Narro-PA351-native-20261014\probe-deps');sys.coinit_flags=0
import comtypes.client
r=Path(__file__).resolve().parent;u=c.windll.user32
mod=comtypes.client.GetModule('UIAutomationCore.dll');a=comtypes.client.CreateObject(mod.CUIAutomation,interface=mod.IUIAutomation)
h=int(sys.argv[1]);action=sys.argv[2];assert action in ['Start Recording','Stop Recording','state']
assert u.IsWindow(w.HWND(h))
root=a.ElementFromHandle(h);assert root.CurrentName.startswith('OBS ')
names=root.FindAll(4,a.CreatePropertyCondition(30005,action if action!='state' else 'Start Recording'))
if action!='state':
 assert names.Length==1,'Need one actual named OBS recording control'
 element=names.GetElement(0);assert element.CurrentIsEnabled and not element.CurrentIsOffscreen
 element.GetCurrentPattern(10000).QueryInterface(mod.IUIAutomationInvokePattern).Invoke()
 expected='Stop Recording' if action=='Start Recording' else 'Start Recording'
 for _ in range(50):
  if root.FindAll(4,a.CreatePropertyCondition(30005,expected)).Length==1:break
  time.sleep(.2)
 assert root.FindAll(4,a.CreatePropertyCondition(30005,expected)).Length==1,'OBS record state did not settle'
state=[]
nodes=root.FindAll(4,a.CreateTrueCondition())
for i in range(nodes.Length):
 e=nodes.GetElement(i)
 if e.CurrentName in ['Start Recording','Stop Recording','Pause Recording'] or 'recordTime' in e.CurrentAutomationId:
  state.append({'name':e.CurrentName,'id':e.CurrentAutomationId,'type':e.CurrentControlType})
data={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'hwnd':h,'action':action,'controls':state}
with (r/'obs-actions.jsonl').open('a',encoding='utf-8') as f:f.write(json.dumps(data)+'\n')
print(json.dumps(data))
