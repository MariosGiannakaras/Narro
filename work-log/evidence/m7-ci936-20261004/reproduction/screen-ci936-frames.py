from pathlib import Path
import json
from PIL import Image,ImageDraw
import numpy as np
run=Path(r'E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-ci936-physical-20261004\run-final')
index=json.loads((run/'motion/index.json').read_text(encoding='utf8'));results=[]
for e in index:
 if not e['action']['button'].startswith('Collapse'):continue
 folder=run/e['folder'];frames=sorted(folder.glob('frame-*.png'));roiScale=1.25 if '125' in folder.name else 1
 reports=[]
 for i,p in enumerate(frames,1):
  im=Image.open(p).convert('RGB');a=np.asarray(im,dtype=np.int16)
  header=a[round(12*roiScale):round(72*roiScale),round(12*roiScale):-round(12*roiScale)]
  red,green,blue=header[:,:,0],header[:,:,1],header[:,:,2]
  white=float(np.mean(np.min(header,axis=2)>225));dark=int(np.sum(np.max(header,axis=2)<160))
  caption=int(np.sum((red>100)&(red<210)&(green>130)&(blue>160)&(green-red>=5)&(green-red<=45)&(blue-green>=5)&(blue-green<=40)))
  flagged=white<.75 or dark<10 or caption>100
  if flagged:reports.append({'frame':i,'whiteFraction':round(white,4),'darkPixels':dark,'captionBluePixels':caption})
 e['actualDecodedDimensions']={'width':im.width,'height':im.height};(folder/'provenance.json').write_text(json.dumps(e,indent=2)+'\n',encoding='utf8')
 results.append({'folder':e['folder'],'framesScreened':len(frames),'flagged':reports,'limits':'Light paused Timer header only; pixel screening is not OCR/source-parity/motion acceptance. Flags require direct review.'})
 # Compact header overview keeps every frame visible; original full-frame sheets remain.
 h=round(145*roiScale);w=im.width;tw=min(w,340);th=round(h*tw/w)
 for b in [0,90]:
  sheet=Image.new('RGB',(tw*10,(th+18)*9),(32,32,32));draw=ImageDraw.Draw(sheet)
  for j,p in enumerate(frames[b:b+90]):
   col=j%10;row=j//10;tile=Image.open(p).convert('RGB').crop((0,0,w,h)).resize((tw,th))
   sheet.paste(tile,(col*tw,row*(th+18)+18));draw.text((col*tw+3,row*(th+18)+2),str(b+j+1),fill='white')
  sheet.save(folder/f'header-overview-{b//90+1}.jpg',quality=95)
(run/'motion/index.json').write_text(json.dumps(index,indent=2)+'\n',encoding='utf8')
(run/'frame-screening.json').write_text(json.dumps({'method':'Screen every collapsed sequence180-frame header for light-surface loss/solid pale/no glyphs/classic blue caption; explicit thresholds in reproduction script','sequences':results},indent=2)+'\n',encoding='utf8')
print(json.dumps({'collapsedSequences':len(results),'framesScreened':sum(s['framesScreened'] for s in results),'flaggedFrames':sum(len(s['flagged']) for s in results),'flaggedSequences':[s['folder'] for s in results if s['flagged']]}),flush=True)
