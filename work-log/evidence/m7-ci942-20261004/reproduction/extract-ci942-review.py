from pathlib import Path
import json, datetime, subprocess
root=Path(r'E:\SystemFiles\Desktop\NarroUpload')
run=root/'artifacts/m7-ci942-physical-20261004/run-final'
ff=root/'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe'
video=run/'video/2026-10-04 12-45-40.mkv'
start=datetime.datetime.fromisoformat('2026-10-04T09:45:40.777+00:00')
out=run/'review-stills';out.mkdir(exist_ok=True)
entries=[]
for name in ['notes-new-toolbar','notes-toolbar-saved-running','english-n-notes','large-notes100-reduced-current','c5-reappeared','english-f-compact-success']:
 p=run/'observations'/(name+'.json');d=json.loads(p.read_text(encoding='utf-8-sig'))
 w=next(w for w in d['windows'] if w['title']=='Narro - Focus')
 t=datetime.datetime.fromisoformat(d['utc'].replace('Z','+00:00'));pts=(t-start).total_seconds()
 r=w['outer'];height=300 if 'large-notes' in name else 700 if r['y']==0 else 110
 x=max(0,r['x']+1920-4);y=max(0,r['y']-4);width=min(4480-x,r['width']+8);h=min(1080-y,round(height*w['dpi']/96)+8)
 dst=out/(name+'.png')
 subprocess.run([str(ff),'-hide_banner','-v','error','-y','-ss',str(pts),'-i',str(video),'-vf',f'crop={width}:{h}:{x}:{y}','-frames:v','1',str(dst)],check=True)
 entries.append({'file':dst.name,'observation':p.name,'utc':d['utc'],'pts':pts,'crop':{'x':x,'y':y,'width':width,'height':h},'reviewed':False})
source=root/'reference/original-blitzit-videos/inbox/Blitzit Tutorial How to Use Notes.mp4'
subprocess.run([str(ff),'-hide_banner','-v','error','-y','-ss','35','-i',str(source),'-frames:v','1',str(out/'canonical-ve010-35s.png')],check=True)
(out/'index.json').write_text(json.dumps(entries,indent=2)+'\n',encoding='utf8')
print(json.dumps(entries),flush=True)
