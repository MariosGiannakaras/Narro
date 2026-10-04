import pathlib,json,subprocess,datetime
from PIL import Image,ImageDraw
root=pathlib.Path(r'E:\SystemFiles\Desktop\NarroUpload')
run=root/'artifacts/m7-ci932-physical-20261004/run-final'
ff=root/'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe'
videos=root/'artifacts/m7-ci911-physical-20261004/run-0106/video'
def dt(s):return datetime.datetime.fromisoformat(s.replace('Z','+00:00'))
starts=[dt('2026-10-04T01:31:23.471Z'),dt('2026-10-04T02:22:55.771Z'),dt('2026-10-04T06:00:48.233Z'),dt('2026-10-04T06:03:31.099Z'),dt('2026-10-04T06:12:28.459Z')]
files=[videos/'2026-10-04 04-31-23.mkv',videos/'2026-10-04 05-22-55.mkv',videos/'2026-10-04 09-00-48.mkv',videos/'2026-10-04 09-03-31.mkv',videos/'2026-10-04 09-12-28.mkv']
starts.extend([dt('2026-10-04T06:21:34.508Z'),dt('2026-10-04T06:24:43.373Z')])
files.extend([videos/'2026-10-04 09-21-34.mkv',videos/'2026-10-04 09-24-43.mkv'])
starts.append(dt('2026-10-04T06:28:23.404Z'));files.append(videos/'2026-10-04 09-28-23.mkv')
obs=[]
for p in (run/'observations').glob('*.json'):
 try:
  data=json.loads(p.read_text(encoding='utf-8-sig')); w=next((w for w in data.get('windows',[]) if w.get('title')=='Narro - Focus'),None)
  if w:obs.append((dt(data['utc']),w,p.name))
 except (KeyError,ValueError,TypeError):pass
actions=[json.loads(l) for l in (run/'actions.jsonl').read_text(encoding='utf-8-sig').splitlines() if l.strip()]
index=[];case='official';counts={}
for a in actions:
 t=dt(a['utc'])
 if a.get('action') in ['EXPERIMENTAL-native-style','EXPERIMENTAL-repaint-boundary','EXPERIMENTAL-dwm-policy','EXPERIMENTAL-composition','EXPERIMENTAL-child-hold']:case=a['case']
 if a.get('button') not in ['Expand Floating Timer','Collapse Floating Timer']:continue
 ri=max(i for i,start in enumerate(starts) if t>=start)
 if ri==0:
  prior=[o for o in obs if o[0]<=t and (t-o[0]).total_seconds()<65]
  after=[o for o in obs if t<o[0] and (o[0]-t).total_seconds()<5]
  if not prior or not after:continue
  _,before,_=max(prior,key=lambda o:o[0]);_,after,obname=min(after,key=lambda o:o[0])
  rectangles=[before['outer'],after['outer']]
 elif ri==1:rectangles=[{'x':1466,'y':638,'width':340,'height':700}];obname='experiment-'+case+'-start.json'
 else:
  obname=('experiment-' if ri>=4 else 'experiment-repaint-')+case+'-start.json'
  data=json.loads((run/'observations'/obname).read_text(encoding='utf-8-sig'))
  rectangles=[next(w['outer'] for w in data['windows'] if w['hwnd']==a['windowId'])]
 x=max(0,min(r['x'] for r in rectangles)+1920-4);y=max(0,min(r['y'] for r in rectangles)-4)
 width=max(r['x']+r['width'] for r in rectangles)-min(r['x'] for r in rectangles)+8
 height=min(1080-y, (max(r['y'] for r in rectangles)-min(r['y'] for r in rectangles))+(390 if max(r['width'] for r in rectangles)==425 else 310))
 counts[(ri,case)]=counts.get((ri,case),0)+1
 name=f'{len(index)+1:02d}-'+(case if ri else 'official')+('-expand' if a['button'].startswith('Expand') else '-collapse')
 dest=run/'motion'/name;dest.mkdir(parents=True,exist_ok=True)
 framecount=120 if '-500-' in case else 60
 if (dest/'provenance.json').exists() and len(list(dest.glob('frame-*.png')))==framecount:
  index.append(json.loads((dest/'provenance.json').read_text(encoding='utf8')));continue
 pts=max(0,(t-starts[ri]).total_seconds()-.20)
 filter=f'crop={width}:{height}:{x}:{y}'
 subprocess.run([str(ff),'-hide_banner','-v','error','-y','-ss',str(pts),'-i',str(files[ri]),'-vf',filter,'-frames:v',str(framecount),str(dest/'frame-%03d.png')],check=True,stderr=subprocess.PIPE)
 frames=sorted(dest.glob('frame-*.png'))
 for b in range(0,len(frames),30):
  sheet=Image.new('RGB',(width*6,(height+22)*5),(32,32,32));draw=ImageDraw.Draw(sheet)
  for j,p in enumerate(frames[b:b+30]):
   col=j%6;row=j//6;sheet.paste(Image.open(p).convert('RGB'),(col*width,row*(height+22)+22));draw.text((col*width+3,row*(height+22)+3),f'{b+j+1:03d} PTS{pts+(b+j)/60:.3f}',fill='white')
  sheet.save(dest/f'sheet-{b//30+1}.jpg',quality=93)
 subprocess.run([str(ff),'-hide_banner','-v','error','-y','-ss',str(pts),'-i',str(files[ri]),'-t',str(framecount/60+.25),'-vf',filter,'-an','-c:v','libx264','-crf','18',str(dest/'motion.mp4')],check=True,stderr=subprocess.PIPE)
 entry={'folder':dest.relative_to(run).as_posix(),'recording':ri+1,'action':a,'case':case if ri else 'official','ptsStart':pts,'crop':{'x':x,'y':y,'width':width,'height':height},'observation':obname,'frames':len(frames),'reviewed':False,'method':f'{framecount} consecutive decoded source60fps frames, no OBS Pause in the selected recording; extraction is not a visual verdict'}
 index.append(entry);(dest/'provenance.json').write_text(json.dumps(entry,indent=2)+'\n',encoding='utf8')
 (run/'motion/index.json').write_text(json.dumps(index,indent=2)+'\n',encoding='utf8')
 print(name,flush=True)
print(json.dumps({'sequences':len(index),'frames':sum(s['frames'] for s in index)}),flush=True)
