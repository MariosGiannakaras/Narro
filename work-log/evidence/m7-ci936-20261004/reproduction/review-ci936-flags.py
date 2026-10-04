from pathlib import Path
from PIL import Image,ImageDraw
import json
r=Path(r'E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-ci936-physical-20261004\run-final')
s=json.loads((r/'frame-screening.json').read_text())
tiles=[]
for e in s['sequences']:
 for f in e['flagged']:
  for n in range(f['frame']-1,f['frame']+2):
   p=r/e['folder']/f'frame-{n:03}.png'
   im=Image.open(p).convert('RGB')
   im=im.crop((0,0,im.width,min(im.height,185))).resize((430,185))
   tiles.append((e['folder'].split('/')[-1]+f' #{n}',im))
sheet=Image.new('RGB',(430*3,210*len(tiles)//3),'#222222');d=ImageDraw.Draw(sheet)
for i,(label,im) in enumerate(tiles):
 x=(i%3)*430;y=(i//3)*210;d.text((x+3,y+3),label,fill='white');sheet.paste(im,(x,y+25))
p=r/'flagged-frame-neighbors.jpg';sheet.save(p,quality=96);print(p)
