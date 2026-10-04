from pathlib import Path
import datetime,json,subprocess,sys
from PIL import Image,ImageDraw
root=Path(r'E:\SystemFiles\Desktop\NarroUpload');run=root/'artifacts/m7-ci942-physical-20261004/run-final'
ff=root/'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe'
video=run/'video/2026-10-04 12-45-40.mkv'
def dt(s):return datetime.datetime.fromisoformat(s.replace('Z','+00:00'))
start=dt('2026-10-04T09:45:40.777Z')
actions=[json.loads(l) for l in (run/'actions.jsonl').read_text(encoding='utf-8-sig').splitlines() if l.strip()]
entries=[]
def extract(name,pts,crop,action):
 dest=run/'motion'/name;dest.mkdir(parents=True,exist_ok=True)
 x,y,w,h=crop
 subprocess.run([str(ff),'-hide_banner','-v','error','-y','-ss',str(pts),'-i',str(video),'-vf',f'crop={w}:{h}:{x}:{y}','-frames:v','120',str(dest/'frame-%03d.png')],check=True)
 frames=sorted(dest.glob('frame-*.png'))
 for b in range(0,len(frames),30):
  tilew= min(w,440);tileh=round(h*tilew/w);sheet=Image.new('RGB',(tilew*5,(tileh+22)*6),(28,28,28));draw=ImageDraw.Draw(sheet)
  for j,p in enumerate(frames[b:b+30]):
   im=Image.open(p).convert('RGB');im.thumbnail((tilew,tileh));c=j%5;r=j//5
   sheet.paste(im,(c*tilew,r*(tileh+22)+22));draw.text((c*tilew+3,r*(tileh+22)+3),f'{b+j+1:03d} PTS {pts+(b+j)/60:.3f}',fill='white')
  sheet.save(dest/f'sheet-{b//30+1}.jpg',quality=95)
 entry={'folder':dest.relative_to(run).as_posix(),'ptsStart':pts,'frames':len(frames),'crop':dict(zip(['x','y','width','height'],crop)),'action':action,'reviewed':False}
 (dest/'provenance.json').write_text(json.dumps(entry,indent=2)+'\n',encoding='utf8');entries.append(entry);print(name,flush=True)
if '--reduced-main-only' in sys.argv:
 a=next(a for a in actions if a.get('button')=='Blitz now' and a['processId']==135708)
 extract('entry-reduced-main',(dt(a['utc'])-start).total_seconds()-.2,(2098,178,1024,747),a)
 saved=json.loads((run/'motion/index.json').read_text())
 saved=[e for e in saved if e['folder']!='motion/entry-reduced-main']+entries
 (run/'motion/index.json').write_text(json.dumps(saved,indent=2)+'\n',encoding='utf8')
 sys.exit(0)
collapses=[a for a in actions if a.get('button')=='Collapse Floating Timer']
for i,a in enumerate(collapses):
 crop=(858,701,433,379) if i==0 else (3246,609,348,308)
 extract(['collapse125-normal','collapse100-normal','collapse100-reduced'][i],(dt(a['utc'])-start).total_seconds()-.2,crop,a)
for a in [a for a in actions if a.get('button')=='Blitz now']:
 label='entry-normal' if a['processId']==17624 else 'entry-reduced'
 pts=(dt(a['utc'])-start).total_seconds()-.2
 extract(label+'-main',pts,(1942,22,1024,747) if label=='entry-normal' else (2098,178,1024,747),a)
 extract(label+'-focus',pts,(4136,0,344,708),a)
(run/'motion/index.json').write_text(json.dumps(entries,indent=2)+'\n',encoding='utf8')
clips=run/'review-clips';clips.mkdir(exist_ok=True)
clipIndex=[]
for name,clock,duration,crop in [
 ('notes-toolbar-and-live-edit','10:12:30',115,(4136,0,344,708)),
 ('modal-shortcuts-background-action-failure','10:14:40',102,(4136,0,344,708)),
 ('c5-dual-display-drag-quit-relaunch','10:17:00',215,None),
 ('compact-finish-full-panel-success','10:25:10',60,None)]:
 pts=(dt('2026-10-04T'+clock+'Z')-start).total_seconds();dst=clips/(name+'.mp4')
 args=[str(ff),'-hide_banner','-v','error','-y','-ss',str(pts),'-i',str(video),'-t',str(duration)]
 if crop:
  x,y,w,h=crop;args+=['-vf',f'crop={w}:{h}:{x}:{y}','-c:v','libx264','-preset','veryfast','-crf','18','-threads','4','-an']
 else:args+=['-c','copy','-avoid_negative_ts','make_zero']
 subprocess.run(args+['-movflags','+faststart',str(dst)],check=True)
 clipIndex.append({'file':dst.name,'requestedStartPts':pts,'requestedStartUtc':'2026-10-04T'+clock+'Z','requestedDuration':duration,'crop':crop,'method':'cropped h264 preview, audio omitted' if crop else 'unaltered streams copied at keyframe bounds; requested time may differ from first copied source frame','acceptanceReference':'original MKV plus lossless consecutive PNGs','bytes':dst.stat().st_size})
 print(name,dst.stat().st_size,flush=True)
(clips/'provenance.json').write_text(json.dumps(clipIndex,indent=2)+'\n',encoding='utf8')
