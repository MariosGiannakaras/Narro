from pathlib import Path
import json, datetime, subprocess
from PIL import Image, ImageDraw
root=Path(r'E:\SystemFiles\Desktop\NarroUpload'); run=root/'artifacts/m7-ci936-physical-20261004/run-final'
ff=root/'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe'
video=run/'video/2026-10-04 10-30-30.mkv'
def dt(s): return datetime.datetime.fromisoformat(s.replace('Z','+00:00'))
start=dt('2026-10-04T07:30:30.869Z')
def read(p):
 b=p.read_bytes(); return json.loads(b.decode('utf16' if b.startswith((b'\xff\xfe',b'\xfe\xff')) else 'utf-8-sig'))
def focus(d): return next(w for w in d['windows'] if w['title']=='Narro - Focus')
def rect(w,height):
 r=w['outer']; x=max(0,r['x']+1920-4);y=max(0,r['y']-4)
 return [x,y,min(4480-x,r['width']+8),min(1080-y,round(height*w['dpi']/96)+8)]
actions=[json.loads(l) for l in (run/'actions.jsonl').read_text(encoding='utf8').splitlines() if l.strip()]
observations=[]
for p in (run/'observations').glob('*.json'):
 try:
  d=read(p); w=focus(d); observations.append((dt(d['utc']),w,p.name))
 except (KeyError,ValueError,StopIteration): pass
observations.sort(key=lambda x:x[0])
index=[]
for prefix in ['normal-100-middle','normal-125-bottom','reduced-100-edge','reduced-125-middle']:
 for suffix,height in [('panel',700),('restore',110)]:
  obs=prefix+'-'+suffix+'-1.json'; after=read(run/'observations'/obs); t=dt(after['utc']); w=focus(after)
  a=max((a for a in actions if a.get('chord')=='Ctrl+Shift+T' and dt(a['utc'])<t),key=lambda a:dt(a['utc']))
  actiont=dt(a['utc']); prior=max((o for o in observations if o[0]<actiont),key=lambda x:x[0])
  oldheight=110 if suffix=='panel' else 700
  r1=rect(prior[1],oldheight); r2=rect(w,height)
  x=min(r1[0],r2[0]); y=min(r1[1],r2[1]); width=max(r1[0]+r1[2],r2[0]+r2[2])-x; h=min(1080-y,max(r1[1]+r1[3],r2[1]+r2[3])-y)
  pts=max(0,(actiont-start).total_seconds()-.2); dest=run/'panel-motion'/(prefix+'-'+suffix+'-1');dest.mkdir(parents=True,exist_ok=True)
  entry={'folder':dest.relative_to(run).as_posix(),'action':a,'observation':obs,'priorObservation':prior[2],'ptsStart':pts,'crop':{'x':x,'y':y,'width':width,'height':h},'displayRects':[r1,r2],'frames':120,'reviewed':False,'method':'Consecutive source60fps frames; old and new locations both retained; no automatic visual PASS'}
  if not (dest/'provenance.json').exists() or read(dest/'provenance.json')['crop']!=entry['crop']:
   subprocess.run([str(ff),'-hide_banner','-v','error','-y','-ss',str(pts),'-i',str(video),'-vf',f'crop={width}:{h}:{x}:{y}','-frames:v','120',str(dest/'frame-%03d.png')],check=True,stderr=subprocess.PIPE)
   frames=sorted(dest.glob('frame-*.png')); entry['frames']=len(frames)
   # Contact atlas preserves both actual endpoint locations; lossless full union crops remain alongside.
   for b in range(0,len(frames),30):
    thumbs=[]
    for p in frames[b:b+30]:
     im=Image.open(p).convert('RGB'); tiles=[]
     for rr in [r1,r2]:
      tile=im.crop((rr[0]-x,rr[1]-y,rr[0]-x+rr[2],min(h,rr[1]-y+rr[3])))
      tile.thumbnail((220,440)); tiles.append(tile)
     thumb=Image.new('RGB',(448,460),(20,20,20)); dd=ImageDraw.Draw(thumb)
     for col,tile in enumerate(tiles): thumb.paste(tile,(col*224,20)); dd.text((col*224,4),f'ROI {col+1}',fill='white')
     thumbs.append(thumb)
    sheet=Image.new('RGB',(448*6,482*5),(32,32,32)); draw=ImageDraw.Draw(sheet)
    for j,thumb in enumerate(thumbs):
     col=j%6;row=j//6;sheet.paste(thumb,(col*448,row*482+22));draw.text((col*448+3,row*482+3),f'{b+j+1:03d} PTS {pts+(b+j)/60:.3f}',fill='white')
    sheet.save(dest/f'sheet-{b//30+1}.jpg',quality=94)
   (dest/'provenance.json').write_text(json.dumps(entry,indent=2)+'\n',encoding='utf8')
   print(dest.name,flush=True)
  index.append(entry)
(run/'panel-motion/index.json').write_text(json.dumps(index,indent=2)+'\n',encoding='utf8')
gallery=run/'gallery';gallery.mkdir(exist_ok=True);gi=[]
entries=[('large-notes-100','large-notes-100.json',300),('large-notes-125-reduced','large-notes-125-reduced.json',300),('notes-resize-min-125','notes-resize-min-125.json',300),('c5-before-quit','c5-before-quit.json',110),('c5-restored','c5-restored.json',110),('notes-after-restart','notes-restart-persisted.json',300)]
entries += [(f'hover-{i}',f'hover-after-{i}.json',110) for i in range(6)]
for label,obs,height in entries:
 d=read(run/'observations'/obs);w=focus(d);t=dt(d['utc']);pts=(t-start).total_seconds()-.15;r=rect(w,height);q=gallery/(label+'.png')
 subprocess.run([str(ff),'-hide_banner','-v','error','-y','-ss',str(pts),'-i',str(video),'-vf',f'crop={r[2]}:{r[3]}:{r[0]}:{r[1]}','-frames:v','1',str(q)],check=True,stderr=subprocess.PIPE)
 gi.append({'file':q.relative_to(run).as_posix(),'pts':pts,'utcObservation':d['utc'],'observation':obs,'crop':r,'source':'recording1 original OBS dual60fps; UTC alignment approximate capture scheduling; no new screenshot'})
(gallery/'provenance.json').write_text(json.dumps(gi,indent=2)+'\n',encoding='utf8')
print(json.dumps({'panelSequences':len(index),'panelFrames':sum(e['frames'] for e in index),'gallery':len(gi)}),flush=True)
