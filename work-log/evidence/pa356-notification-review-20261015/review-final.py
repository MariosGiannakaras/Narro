from pathlib import Path
import subprocess,json,datetime
from PIL import Image,ImageDraw
r=Path(__file__).parent.resolve();pkg=r/'package-final';out=r/'review';out.mkdir(exist_ok=True)
cases=[('foreground',pkg/'foreground-and-repeated-foreground-complete-active-interval.mkv',range(116,130)),
       ('background',pkg/'background-complete.mkv',range(44,59))]
results=[]
for label,movie,times in cases:
    sheet=Image.new('RGB',(5*650,3*390),'#ddd');draw=ImageDraw.Draw(sheet)
    for i,t in enumerate(times):
        p=out/f'{label}-{t}s.png'
        subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(movie),'-frames:v','1','-vf','crop=650:350:3830:690','-update','1','-y',str(p)],check=True)
        im=Image.open(p);x=(i%5)*650;y=(i//5)*390;sheet.paste(im,(x,y+30));draw.text((x+5,y+6),f'{label}, movie {t}s, primary bottom-right',fill='black')
    sheet.save(out/f'{label}-toast-sequence.jpg')
    decode=subprocess.run(['ffmpeg','-v','error','-i',str(movie),'-f','null','NUL'],capture_output=True,text=True)
    (out/f'{label}-decode-errors.txt').write_text(decode.stderr,encoding='utf8');assert decode.returncode==0
    # Quantitative audio evidence remains a technical energy observation; not a listening claim.
    start=116 if label=='foreground' else 44
    audio=subprocess.run(['ffmpeg','-hide_banner','-ss',str(start),'-t','14','-i',str(movie),'-vn','-af','volumedetect','-f','null','NUL'],capture_output=True,text=True)
    (out/f'{label}-audio-volumedetect.txt').write_text(audio.stderr,encoding='utf8')
    results.append({'case':label,'sampledSeconds':list(times),'fullDecodeExit':decode.returncode})
(out/'review-provenance.json').write_text(json.dumps({'generatedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cases':results,'method':'Whole video fully decoded; 1Hz ROI sequences around actual firing support visible toast duration; raw continuous 60fps remains authoritative'},indent=2),encoding='utf8')
print(json.dumps(results))
