from pathlib import Path
import json,datetime,subprocess
from PIL import Image,ImageDraw
root=Path(r'E:\SystemFiles\Desktop\NarroUpload');run=root/'artifacts/m7-ci936-physical-20261004/run-final'
ff=root/'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe'
video=run/'video/2026-10-04 10-30-30.mkv'
def dt(s):return datetime.datetime.fromisoformat(s.replace('Z','+00:00'))
start=dt('2026-10-04T07:30:30.869Z')
events=[]
for p in (root/'artifacts/m7-pr230-ci936/candidate/Narro-M7-Logs').glob('session-*/events.jsonl'):
 for line in p.read_text(encoding='utf8').splitlines():
  if line.strip():
   e=json.loads(line)
   if e.get('focus'):events.append((dt(e['timestampUtc']),e))
events.sort(key=lambda pair:pair[0]);observations=[]
for p in (run/'observations').glob('*.json'):
 try:
  d=json.loads(p.read_text(encoding='utf-8-sig'));w=next(w for w in d.get('windows',[]) if w.get('title')=='Narro - Focus')
  observations.append((dt(d['utc']),w,p.name))
 except (KeyError,ValueError,StopIteration):pass
actions=[json.loads(l) for l in (run/'actions.jsonl').read_text(encoding='utf-8-sig').splitlines() if l.strip()]
index=[]
for a in actions:
 if a.get('button') not in ['Expand Floating Timer','Collapse Floating Timer']:continue
 t=dt(a['utc']);prior=[e for et,e in events if et<=t and e['focus'].get('position')]
 suffix='-collapse-' if a['button'].startswith('Collapse') else '-expand-'
 after=[(ot,w,n) for ot,w,n in observations if t<ot<t+datetime.timedelta(seconds=20) and w['hwnd']==a['windowId'] and suffix in n]
 if not prior or not after:continue
 before=prior[-1]['focus'];_,w,obs=min(after,key=lambda x:x[0]);scale=before['scaleFactor'];r=w['outer']
 xs=[before['position']['x'],r['x']];ys=[before['position']['y'],r['y']]
 x=max(0,min(xs)+1920-4);y=max(0,min(ys)-4)
 width=max(before['outerSize']['width'],r['width'])+max(xs)-min(xs)+8
 height=min(1080-y,max(ys)-min(ys)+round(300*max(scale,w['dpi']/96))+8)
 name=obs.removesuffix('.json')
 dest=run/'motion'/name;dest.mkdir(parents=True,exist_ok=True)
 pts=max(0,(t-start).total_seconds()-.2);entry={'folder':dest.relative_to(run).as_posix(),'recording':1,'action':a,'observation':obs,'ptsStart':pts,'crop':{'x':x,'y':y,'width':width,'height':height},'frames':180,'reviewed':False,'method':'180 consecutive source60fps frames; decoded from continuous OBS recording; export is not PASS'}
 if not (dest/'provenance.json').exists():
  subprocess.run([str(ff),'-hide_banner','-v','error','-y','-ss',str(pts),'-i',str(video),'-vf',f'crop={width}:{height}:{x}:{y}','-frames:v','180',str(dest/'frame-%03d.png')],check=True,stderr=subprocess.PIPE)
  frames=sorted(dest.glob('frame-*.png'));entry['frames']=len(frames)
  for b in range(0,len(frames),30):
   sheet=Image.new('RGB',(width*6,(height+22)*5),(32,32,32));draw=ImageDraw.Draw(sheet)
   for j,p in enumerate(frames[b:b+30]):
    col=j%6;row=j//6;sheet.paste(Image.open(p).convert('RGB'),(col*width,row*(height+22)+22));draw.text((col*width+3,row*(height+22)+3),f'{b+j+1:03d} PTS{pts+(b+j)/60:.3f}',fill='white')
   sheet.save(dest/f'sheet-{b//30+1}.jpg',quality=93)
  (dest/'provenance.json').write_text(json.dumps(entry,indent=2)+'\n',encoding='utf8')
  print(name,flush=True)
 else:entry=json.loads((dest/'provenance.json').read_text(encoding='utf8'))
 index.append(entry)
(run/'motion/index.json').write_text(json.dumps(index,indent=2)+'\n',encoding='utf8')
print(json.dumps({'sequences':len(index),'frames':sum(s['frames'] for s in index)}),flush=True)
