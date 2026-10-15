from pathlib import Path
import sys,json,datetime,time
r=Path(__file__).parent;sys.path.insert(0,r'E:\SystemFiles\Desktop\Narro-PA351-native-20261014\probe-deps');sys.coinit_flags=0
import comtypes.client
m=comtypes.client.GetModule('UIAutomationCore.dll');a=comtypes.client.CreateObject(m.CUIAutomation,interface=m.IUIAutomation)
root=a.ElementFromHandle(790236);assert root.CurrentName=='Settings'
nodes=root.FindAll(4,a.CreateTrueCondition());elements=[nodes.GetElement(i) for i in range(nodes.Length)]
radios={e.CurrentName:e.GetCurrentPattern(10010).QueryInterface(m.IUIAutomationSelectionItemPattern) for e in elements if e.CurrentControlType==50013 and e.CurrentName in ['Off','Priority only','Alarms only']}
assert len(radios)==3
names=["When I'm duplicating my display","When I'm playing a game","When I'm using an app in full screen mode"]
toggles={}
for e in elements:
    if e.CurrentControlType==50000 and e.CurrentName in names:
        try:toggles[e.CurrentName]=e.GetCurrentPattern(10015).QueryInterface(m.IUIAutomationTogglePattern)
        except (ValueError,Exception):pass
assert len(toggles)==3
before={'mode':next(k for k,p in radios.items() if p.CurrentIsSelected),'rules':{k:p.CurrentToggleState for k,p in toggles.items()}}
file=r/'focus-assist-original.json'
if not file.exists():file.write_text(json.dumps(before,indent=2),encoding='utf8')
target={'mode':'Off','rules':dict.fromkeys(names,0)} if sys.argv[1]=='quiet-test-off' else json.loads(file.read_text())
for k,v in target['rules'].items():
    if toggles[k].CurrentToggleState!=v:toggles[k].Toggle()
radios[target['mode']].Select();time.sleep(.25)
after={'mode':next(k for k,p in radios.items() if p.CurrentIsSelected),'rules':{k:p.CurrentToggleState for k,p in toggles.items()}}
assert after==target,(after,target)
data={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'request':sys.argv[1],'before':before,'after':after}
with (r/'focus-assist-actions.jsonl').open('a') as f:f.write(json.dumps(data)+'\n')
print(json.dumps(data))
