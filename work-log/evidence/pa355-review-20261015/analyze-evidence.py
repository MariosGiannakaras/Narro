from pathlib import Path
import json,datetime,sqlite3,subprocess
from PIL import Image,ImageDraw
import fitz
r=Path(__file__).resolve().parent;o=r/'review';o.mkdir(exist_ok=True)
summary=[]
for name in ['g1-dark-theme','g1-dark-escape','g1-lg-wheel-bottom','g1-dark-wheel-bottom','g2-keyboard-selected','g2-mouse-selected','g2-after-manual-commit','g2-nested-add','g2-nested-cancel','g2-primary-cancel','g2-primary-valid-initial','g2-primary-valid-selected','g2-primary-valid-cancel','g3-new-keyboard-owner','g3-pointer-leave','g3-before-first-pdf','g3-tooltip-after-30pdf','g3-90-before-export','g3-final-tooltip']:
 d=json.loads((r/'observations'/(name+'.json')).read_text());c=d['controls'];dialogs=[x for x in c if x['type']==50032]
 summary.append({'name':name,'utc':d['utc'],'dialogs':[x['name'] for x in dialogs],'focused':[x['name'] for x in c if x['focused']],'tooltips':[x for x in c if x['type']==50022],'visibleFields':[{'name':x['name'],'value':x.get('value')} for x in c if not x['offscreen'] and x['type'] in [50004,50016]],'visibleManualTitles':[x['name'] for x in c if not x['offscreen'] and 'manual' in x['name'].lower()]})
(o/'native-summary.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
pdfs={};images=[]
for name in ['owned-30-day-first.pdf','owned-30-day-second.pdf','owned-90-day.pdf']:
 d=fitz.open(r/'analysis'/name);pdfs[name]={'pages':len(d),'text':'\n'.join(p.get_text() for p in d),'pagePixelHashes':[]}
 import hashlib
 for i,page in enumerate(d):
  pix=page.get_pixmap(matrix=fitz.Matrix(1.6,1.6));pdfs[name]['pagePixelHashes'].append(hashlib.sha256(pix.samples).hexdigest())
  if 'second' not in name:
   file=o/f'{name[:-4]}-page{i+1}.png';pix.save(file);im=Image.open(file).convert('RGB');im.thumbnail((620,480));canvas=Image.new('RGB',(640,520),'#ddd');canvas.paste(im,(8,25));ImageDraw.Draw(canvas).text((8,6),f'{name} page{i+1}',fill='black');images.append(canvas)
out=Image.new('RGB',(1280,1560),'white')
for i,im in enumerate(images):out.paste(im,((i//3)*640,(i%3)*520))
out.save(o/'pdf-contact.png');(o/'pdf-review.json').write_text(json.dumps(pdfs,indent=2)+'\n',encoding='utf-8')
start=datetime.datetime.fromisoformat(json.loads((r/'capture-meta.json').read_text(encoding='utf-8-sig'))['processStartUtc'])
shots=[('dark100-lower','2026-10-15T04:39:18+00:00',2050,150,1020,750),('picker125-selected','2026-10-15T04:36:42+00:00',140,150,1280,930),('different-pointer-selected','2026-10-15T04:37:28+00:00',140,150,1280,930),('one-minute-commit','2026-10-15T04:37:57+00:00',140,150,1280,930),('escape-failure','2026-10-15T04:39:26+00:00',2050,150,1020,750),('valid-primary-picker','2026-10-15T04:40:40+00:00',2050,150,1020,750)]
frames=[]
for name,t,x,y,w,h in shots:
 at=max(0,(datetime.datetime.fromisoformat(t)-start).total_seconds());f=o/(name+'.png')
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-ss',str(at),'-i',str(r/'pa355-native.mkv'),'-frames:v','1','-vf',f'crop={w}:{h}:{x}:{y}',str(f),'-y'],check=True)
 frames.append({'name':name,'actionUtc':t,'approximateMovieOffset':at,'crop':[x,y,w,h]})
(o/'video-review-offsets.json').write_text(json.dumps(frames,indent=2)+'\n')
print(json.dumps({'pdfPages':{n:d['pages'] for n,d in pdfs.items()},'firstSecondRenderedPagesIdentical':pdfs['owned-30-day-first.pdf']['pagePixelHashes']==pdfs['owned-30-day-second.pdf']['pagePixelHashes'],'nativeSnapshots':len(summary),'frames':len(frames)}))
