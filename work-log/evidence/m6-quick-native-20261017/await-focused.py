from pathlib import Path
import subprocess,json,sys,time,datetime,os
r=Path(__file__).resolve().parent;label,name=sys.argv[1:3]
launch=json.loads((r/'launch.json').read_text(encoding='utf-8-sig'))
windows=json.loads(subprocess.check_output([sys.executable,'-X','utf8',str(r/'native-input.py'),'windows']))
matches=[w for w in windows if w['pid']==launch['pid'] and w['title']==os.environ.get('NARRO_PA_TARGET_TITLE','Narro')]
assert len(matches)==1,'Need one current owned target';h=matches[0]['hwnd'];start=time.monotonic();samples=[];passed=False
while time.monotonic()-start<4:
 raw=subprocess.check_output([sys.executable,'-X','utf8',str(r/'uia_controls.py'),str(h)])
 data=json.loads(raw);fields=[x for x in data['controls'] if x['name']==name and x['type']==50004]
 samples.append({'utc':data['utc'],'field':fields,'focused':[{'name':x['name'],'type':x['type']} for x in data['controls'] if x['focused']]})
 if len(fields)==1 and fields[0]['focused'] and fields[0]['enabled'] and not fields[0]['offscreen'] and fields[0].get('value')=='':passed=True;break
 time.sleep(.05)
(r/'observations'/(label+'-passive-focus.json')).write_text(json.dumps({'label':label,'expectedField':name,'passiveOnly':True,'elapsedSeconds':time.monotonic()-start,'clearedEnabledVisibleFocusObserved':passed,'samples':samples},indent=2),encoding='utf-8')
print(json.dumps({'label':label,'clearedEnabledVisibleFocusObserved':passed,'samples':len(samples),'elapsedSeconds':round(time.monotonic()-start,3)}))
if not passed:sys.exit(3)
