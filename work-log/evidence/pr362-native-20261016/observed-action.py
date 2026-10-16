import subprocess,json,sys,pathlib,os
r=pathlib.Path(__file__).parent
launch=json.loads((r/'launch.json').read_text(encoding='utf-8-sig'))
windows=json.loads(subprocess.check_output([sys.executable,'-X','utf8',str(r/'native-input.py'),'windows'],encoding='utf-8'))
matches=[x for x in windows if x['title']==os.environ.get('NARRO_PA_TARGET_TITLE','Narro') and x['pid']==launch['pid']];assert len(matches)==1,'Need one observed owned Narro window'
hwnd=str(matches[0]['hwnd'])
def probe():return json.loads(subprocess.check_output([sys.executable,'-X','utf8',str(r/'uia_controls.py'),hwnd],encoding='utf-8'))
action,label,value=sys.argv[1:4];before=probe()
(r/'observations'/(label+'-before.json')).write_text(json.dumps(before,indent=2),encoding='utf-8')
if action in ['click','hover']:
 found=[e for e in before['controls'] if e['name']==value and e['enabled'] and not e['offscreen'] and e['type'] in [50000,50011,50003,50013,50004,50007]]
 assert len(found)==1,[(e['name'],e['rect']) for e in found]
 x,y,x2,y2=found[0]['rect'];px=(x+x2)//2
 # The real full-row toggle bounds include a separate overlaid plus. Its
 # observed right chevron is the unambiguous physical toggle hit area.
 if action=='click' and value.startswith(('Expand subtasks for ','Collapse subtasks for ')):px=x2-max(8,(y2-y)//2)
 args=['click-screen' if action=='click' else 'move-screen',os.environ.get('NARRO_PA_TARGET_TITLE','Narro'),label,str(px),str((y+y2)//2)]
elif action=='text':
 focused=[e for e in before['controls'] if e['focused'] and e['type']==50004];assert len(focused)==1,'Focused edit must be observed'
 args=['text',os.environ.get('NARRO_PA_TARGET_TITLE','Narro'),label,value]
elif action=='key':args=['key',os.environ.get('NARRO_PA_TARGET_TITLE','Narro'),label,value]
else:raise ValueError(action)
subprocess.run([sys.executable,'-X','utf8',str(r/'native-input.py'),*args],check=True,env=dict(os.environ,NARRO_PA_INPUT_NO_SNAPSHOT='1'))
after=probe();(r/'observations'/(label+'-after.json')).write_text(json.dumps(after,indent=2),encoding='utf-8')
print(json.dumps({'label':label,'hwnd':hwnd,'focused':[(e['name'],e.get('value')) for e in after['controls'] if e['focused']]}))
