from pathlib import Path
import json,subprocess,sys,os
r=Path(__file__).resolve().parent
launch=json.loads((r/'launch.json').read_text(encoding='utf-8-sig'))
ws=json.loads(subprocess.check_output([sys.executable,str(r/'native-input.py'),'windows'],encoding='utf-8'))
w=next(x for x in ws if x['pid']==launch['pid'] and x['title']==os.environ.get('NARRO_PA_TARGET_TITLE','Narro'))
d=json.loads(subprocess.check_output([sys.executable,str(r/'uia_controls.py'),str(w['hwnd'])],encoding='utf-8'))
label=sys.argv[1];(r/'observations'/(label+'-observed.json')).write_text(json.dumps(d,indent=2),encoding='utf-8')
for e in d['controls']:
 if not e['offscreen'] and e['name'] and e['type'] in [50000,50004,50011,50007,50003,50020]: print(e['type'],e['name'],e.get('value'),e['rect'])
