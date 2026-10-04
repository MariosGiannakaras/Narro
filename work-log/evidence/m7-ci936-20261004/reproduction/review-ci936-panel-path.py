from pathlib import Path
from PIL import Image,ImageDraw
root=Path(r'E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-ci936-physical-20261004\run-final\panel-motion')
for p in root.glob('*/provenance.json'):
 d=p.parent; thumbs=[]
 for i in range(16,46):
  im=Image.open(d/f'frame-{i:03d}.png').convert('RGB'); im.thumbnail((580,280)); thumbs.append((i,im))
 sheet=Image.new('RGB',(600*6,304*5),(28,28,28));draw=ImageDraw.Draw(sheet)
 for j,(i,im) in enumerate(thumbs):
  x=j%6*600;y=j//6*304;sheet.paste(im,(x,y+22));draw.text((x+3,y+3),f'{i:03d} FULL UNION: includes moving host',fill='white')
 sheet.save(d/'moving-path-016-045.jpg',quality=95)
 print(d.name)
