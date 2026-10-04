from pathlib import Path
import json, shutil, hashlib, subprocess, zipfile

root = Path(r'E:\SystemFiles\Desktop\NarroUpload')
run = root/'artifacts/m7-ci942-physical-20261004/run-final'
out = root/'work-log/evidence/m7-ci942-20261004'
out.mkdir(parents=True, exist_ok=True)

def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        while b := f.read(8*1024*1024): h.update(b)
    return h.hexdigest()

reviews = {
 'collapse125-normal': 'Frames 1-120: Timer remains present through collapse at 125%; no pale/native-caption replacement observed.',
 'collapse100-normal': 'Frames 1-120: Timer remains present through collapse at 100%; later frames include the next intentional Expand.',
 'collapse100-reduced': 'Frames 1-120: immediate compact commit, then functional Locate pulse; no Timer absence observed.',
 'entry-normal-main': 'Frames 1-120: finite board opacity transition and restored board after authoritative Start Blitz.',
 'entry-normal-focus': 'Frames 1-120: desktop before entry, then populated Focus Panel; no partial empty host observed.',
 'entry-reduced-main': 'Frames 1-120: board remains opaque; Starting Blitz button changes separately. Correct post-relaunch Main ROI (182,182).',
 'entry-reduced-focus': 'Frames 1-120: populated Panel appears directly, without the normal entry opacity transition.'
}
index = json.loads((run/'motion/index.json').read_text())
for entry in index:
    entry['reviewed'] = True
    entry['reviewedFrames'] = [1,120]
    entry['reviewMethod'] = 'Direct consecutive-frame inspection of four 30-frame contact sheets; full lossless frames retained.'
    entry['observation'] = reviews[Path(entry['folder']).name]
    (run/entry['folder']/'provenance.json').write_text(json.dumps(entry,indent=2)+'\n',encoding='utf8')
(run/'motion/index.json').write_text(json.dumps(index,indent=2)+'\n',encoding='utf8')
stills=json.loads((run/'review-stills/index.json').read_text())
for entry in stills:
    entry['reviewed']=True
    entry['reviewMethod']='Direct inspection of the video-derived PNG.'
(run/'review-stills/index.json').write_text(json.dumps(stills,indent=2)+'\n',encoding='utf8')

for p in run.iterdir():
    if p.name == 'video' or 'private' in p.name: continue
    if p.is_dir(): shutil.copytree(p,out/p.name,dirs_exist_ok=True)
    else: shutil.copy2(p,out/p.name)
logs=run/'Narro-M7-Logs'
files={p.relative_to(logs).as_posix():p for p in logs.rglob('*') if p.is_file()}
with zipfile.ZipFile(out/'Narro-M7-Logs.zip','w',zipfile.ZIP_DEFLATED) as z:
    for name,p in sorted(files.items()): z.write(p,'Narro-M7-Logs/'+name)
with zipfile.ZipFile(out/'Narro-M7-Logs.zip') as z:
    assert len(z.namelist())==len(files)
    for name,p in files.items(): assert z.read('Narro-M7-Logs/'+name)==p.read_bytes()
for p in (root/'artifacts/m7-pr231-ci942').glob('*.json'):
    shutil.copy2(p,out/('artifact-'+p.name))
repro=out/'reproduction';repro.mkdir(exist_ok=True)
for name in ['extract-ci942-review.py','prepare-ci942-media.py','package-ci942.py','observed-drag-ci942.ps1','observed-physical-key-ci942-final.ps1','observed-focused-layout-ci942.ps1','observe-ci936-windows.ps1','read-ci936-display-devices.ps1','snapshot-ci942-ledger.py']:
    p=root/'artifacts/ui-validation-tools'/name
    if p.exists(): shutil.copy2(p,repro/name)
helper=root/'scripts/verify-m1-floating-performance-scenario.ps1'
shutil.copy2(helper,repro/'verify-m1-floating-performance-scenario-c2821e6.ps1')
(out/'performance-helper-provenance.json').write_text(json.dumps({
 'scenarioHelperSource':'c2821e6f998c6cd7424d5aed8673f5c9a3ff9e9d',
 'scenarioHelperSha256':sha(helper),
 'exactCi942ThreeRuns':True,
 'coldCi936Comparison':'One additional matched cold comparison only, using the same collector; not a replacement three-run baseline.'
},indent=2)+'\n',encoding='utf8')

video=run/'video/2026-10-04 12-45-40.mkv'
dst=out/'raw-video/recording-1';dst.mkdir(parents=True,exist_ok=True)
v={'recording':1,'originalFilename':video.name,'originalBytes':video.stat().st_size,'originalSha256':sha(video),
 'startUtc':'2026-10-04T09:45:40.777Z','stopUtc':'2026-10-04T10:31:04.202Z','normalStop':True,
 'parts':[],'obsPauseIntervals':[],
 'note':'Complete original two-display capture, including original audio streams. Not all 2722.867 seconds were directly reviewed. Performance runs after stop are separately logged and not claimed to be in this video.'}
probe=root/'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin/ffprobe.exe'
v['media']=json.loads(subprocess.run([str(probe),'-v','error','-show_entries','format=duration:stream=index,codec_name,width,height,r_frame_rate','-of','json',str(video)],capture_output=True,text=True,check=True).stdout)
with video.open('rb') as f:
    i=0
    while b:=f.read(40*1024*1024):
        i+=1;p=dst/(video.name+f'.part{i:03d}');p.write_bytes(b)
        v['parts'].append({'file':p.relative_to(out).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
h=hashlib.sha256()
for part in v['parts']:
    with (out/part['file']).open('rb') as f:
        while b:=f.read(8*1024*1024):h.update(b)
assert h.hexdigest()==v['originalSha256']
(out/'video-provenance.json').write_text(json.dumps([v],indent=2)+'\n',encoding='utf8')
(out/'.gitattributes').write_text('* -text\n',encoding='utf8')
(out/'visual-review-results.json').write_text(json.dumps({
 'build':'CI942','sourceHead':'c2821e6f998c6cd7424d5aed8673f5c9a3ff9e9d',
 'continuousVideoOriginalPreserved':True,'losslessMotionPngExports':840,
 'uniqueDirectlyReviewedConsecutiveSourceFrames':600,'uniquePtsRanges':5,
 'pairedMainFocusRoisCountedOnce':True,'directlyReviewedVideoDerivedStills':6,
 'motionRanges':index,'stills':stills,
 'nativeC5':'PASS','softwarePlacementAndTopology':'PASS exercised scope',
 'shortcutsBehindAddTaskModal':'FAIL M7-OBS-20261004-17',
 'sourceParity':'Only narrow toolbar grammar/motion behavior comparisons; whole M5/M6/M8 source parity remains open.',
 'excludedGalleryImage':'observations/compact-success-navigation-crop.png shows Codex rather than the intended success surface; retained raw, excluded from acceptance.',
 'limits':['Not every original video frame was manually inspected.','Navigation GDI screenshots are not substituted for continuous-motion evidence.','Physical cable disconnect and display sleep/wake were not run.','No M9 report/export acceptance was run.','No M10 checkbox/counter advanced.']
},indent=2)+'\n',encoding='utf8')
print(json.dumps({'out':str(out),'files':sum(p.is_file() for p in out.rglob('*')),
 'bytes':sum(p.stat().st_size for p in out.rglob('*') if p.is_file()),'nativeLogFiles':len(files),
 'zipByteIdentity':'PASS','rawVideoReassembly':'PASS'}),flush=True)
