from pathlib import Path
import subprocess,json
r=Path(__file__).parent
ff=Path(r'E:\SystemFiles\Desktop\NarroUpload\artifacts\ui-validation-tools\ffmpeg-portable\ffmpeg-9.0.2-essentials_build\bin\ffmpeg.exe')
# Actual recorded Main content coordinates, excluding native chrome. This is
# evidence review only; it never operates the app or modifies the recording.
raw=subprocess.check_output([str(ff),'-hide_banner','-loglevel','error','-ss','8','-i',str(r/'nsis-native.mkv'),'-t','12','-vf','crop=1000:700:2006:109,scale=100:70,fps=60','-f','rawvideo','-pix_fmt','rgb24','-'])
size=100*70*3;observations=[]
for i in range(len(raw)//size):
    frame=raw[i*size:(i+1)*size]
    fraction=sum(1 for p in range(0,size,3) if min(frame[p:p+3])>240)/(100*70)
    if fraction>0.95:observations.append(8+i/60)
result={'method':'Recorded Main content white-pixel fraction >95%, no native/UI actions','sampledSeconds':[8,20],
    'whiteFrames':len(observations),'firstWhiteSecond':observations[0] if observations else None,
    'lastWhiteSecond':observations[-1] if observations else None,
    'whiteFrameSeconds':len(observations)/60,
    'scope':'Cold-start observation, not proof of a Focus transition defect or full startup performance acceptance.'}
(r/'startup-frame-observation.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
