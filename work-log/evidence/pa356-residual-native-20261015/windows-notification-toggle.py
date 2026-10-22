from pathlib import Path
import sys,json,datetime,time,ctypes as c
r=Path(__file__).resolve().parent;sys.path.insert(0,r'E:\SystemFiles\Desktop\Narro-PA351-native-20261014\probe-deps');sys.coinit_flags=0
import comtypes.client
m=comtypes.client.GetModule('UIAutomationCore.dll');a=comtypes.client.CreateObject(m.CUIAutomation,interface=m.IUIAutomation)
root=a.ElementFromHandle(790236);assert root.CurrentName=='Settings'
condition=a.CreateAndCondition(a.CreatePropertyCondition(30005,'Get notifications from apps and other senders'),a.CreatePropertyCondition(30003,50000));nodes=root.FindAll(4,condition);assert nodes.Length==1
e=nodes.GetElement(0);assert e.CurrentIsEnabled and not e.CurrentIsOffscreen;toggle=e.GetCurrentPattern(10015).QueryInterface(m.IUIAutomationTogglePattern);before=toggle.CurrentToggleState
original=r/'os-notification-original.json'
if not original.exists():original.write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'notificationsToggle':before,'focusAssist':'Off (observed selected1 in windows-settings-before.json)','settingsHwnd':790236},indent=2))
desired=int(sys.argv[1]) if sys.argv[1]!='restore' else json.loads(original.read_text())['notificationsToggle'];assert desired in [0,1]
if before!=desired:toggle.Toggle();time.sleep(.3)
after=toggle.CurrentToggleState;assert after==desired
d={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'action':'Actual Windows Settings UIA TogglePattern','control':e.CurrentName,'requested':sys.argv[1],'before':before,'after':after}
with (r/'os-notification-actions.jsonl').open('a',encoding='utf8') as f:f.write(json.dumps(d)+'\n')
print(json.dumps(d))
