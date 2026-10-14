from pathlib import Path
from PIL import Image,ImageDraw
import json,datetime
r=Path(__file__).parent
frames=sorted((r/'analysis/source-entry-frames').glob('*.jpg'))
sheet=Image.new('RGB',(480*5,292*((len(frames)+4)//5)),'#171717')
d=ImageDraw.Draw(sheet)
for n,p in enumerate(frames):
    im=Image.open(p);im.thumbnail((480,270))
    x=n%5*480;y=n//5*292;sheet.paste(im,(x,y));d.text((x+6,y+273),f'VE-003 {30+n/60:.3f}s frame{n+1}',fill='white')
sheet.save(r/'analysis/source-entry-contact.jpg',quality=96)
rows=[json.loads(s) for s in (r/'normal-entry-final.jsonl').read_text().splitlines()]
changes=[];last=None
for row in rows:
    for w in row['windows']:
        if w['title']=='NarroBoardFocusPixels' and w['visible'] and w['rect']!=last:
            changes.append({'utc':row['utc'],'rect':w['rect']});last=w['rect']
elapsed=(datetime.datetime.fromisoformat(changes[-1]['utc'])-datetime.datetime.fromisoformat(changes[0]['utc'])).total_seconds()
result={'source':'VE-003 30.000–30.500s','sourceFrames':len(frames),'nativePopupGeometryChanges':changes,'observedFirstToLastGeometryChangeSeconds':elapsed,'caveat':'Native samples bound timing; video frames, not this trace alone, decide composition parity.'}
(r/'analysis/source-entry-native-geometry.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
