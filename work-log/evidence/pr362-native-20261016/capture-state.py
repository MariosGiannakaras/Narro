from pathlib import Path
import subprocess, json, sys, datetime
r=Path(__file__).resolve().parent;label=sys.argv[1]
def run(*args):return subprocess.check_output([sys.executable,'-X','utf8',*map(str,args)],encoding='utf-8')
launch=json.loads((r/'launch.json').read_text(encoding='utf-8-sig'))
windows=json.loads(run(r/'native-input.py','windows'))
owned=[x for x in windows if x['pid']==launch['pid'] and x['title'] in ['Narro','Narro - Focus']]
data={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'label':label,'passiveOnly':True,'windows':[]}
for win in owned:
 h=win['hwnd'];uia=json.loads(run(r/'uia_controls.py',h));facts=json.loads(run(r/'window-facts.py',h))
 data['windows'].append({'window':win,'facts':facts,'uia':uia})
 suffix='main' if win['title']=='Narro' else 'focus'
 run(r/'native-input.py','snap',win['title'],label+'-'+suffix)
(r/'observations'/(label+'-state.json')).write_text(json.dumps(data,indent=2),encoding='utf-8')
print(run(r/'owned-db-proof.py',label).strip())
print(json.dumps({'label':label,'observedWindows':len(owned),'role':'Raw state acquisition only; classification after capture'}))
