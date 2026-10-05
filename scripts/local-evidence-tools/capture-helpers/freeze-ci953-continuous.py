import csv, hashlib, json, os, pathlib, shutil, subprocess, zipfile
from datetime import datetime, timezone
ROOT=pathlib.Path(r'E:\SystemFiles\Desktop\NarroUpload');MAIN=pathlib.Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload')
P=ROOT/'artifacts/m7-ci953-continuous-20261005';DEST=MAIN/'work-log/evidence'/P.name
SOURCE=ROOT/'artifacts/m7-pr234-native-20261005/video/2026-10-05 15-56-25.mkv'
TOOLS=ROOT/'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p):
    with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
assert not DEST.exists()
probe=read(P/'inventory/recording-ffprobe.json');duration=float(probe['format']['duration'])
assert duration>1000 and probe['streams'][0]['width']==4480
obs=max((pathlib.Path(os.environ['APPDATA'])/'obs-studio/logs').glob('*'),key=lambda p:p.stat().st_mtime)
text=obs.read_text(encoding='utf-8-sig');assert "15-56-25.mkv' stopped" in text
shutil.copy2(obs,P/'inventory/obs-recording-log.txt')
mp4=P/'video/2026-10-05-continuous-full.mp4'
subprocess.run([str(TOOLS/'ffmpeg.exe'),'-v','error','-y','-i',str(SOURCE),'-map','0','-c','copy','-movflags','+faststart',str(mp4)],check=True)
media=[]
for source in [SOURCE,mp4]:
    parts=[]
    with source.open('rb') as f:
        n=0
        while block:=f.read(64*1024*1024):
            n+=1;part=P/'video'/(source.name+f'.part{n:03}');part.write_bytes(block);parts.append(part.name)
    h=hashlib.sha256()
    for name in parts:
        with (P/'video'/name).open('rb') as f:
            while block:=f.read(1024*1024):h.update(block)
    assert h.hexdigest()==sha(source)
    media.append({'file':source.name,'bytes':source.stat().st_size,'sha256':sha(source),'parts':parts,'reassembledByteIdentical':True})
mp4.unlink()
write(P/'video/media-reassembly.json',media)
(P/'video/Reassemble.ps1').write_text("$ErrorActionPreference='Stop'\nforeach ($m in (Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'media-reassembly.json') | ConvertFrom-Json)) {\n $target=Join-Path $PSScriptRoot $m.file\n if (Test-Path -LiteralPath $target) { throw ('Output already exists: '+$target) }\n $out=[IO.File]::Create($target)\n try { foreach ($part in $m.parts) { $in=[IO.File]::OpenRead((Join-Path $PSScriptRoot $part)); try { $in.CopyTo($out) } finally { $in.Dispose() } } } finally { $out.Dispose() }\n if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLower() -ne $m.sha256) { throw 'Media hash mismatch' }\n Write-Host ('Reassembled and verified: '+$target)\n}\n",encoding='utf-8')
# Reassembly is evidence access only, not runtime/build tooling.
subprocess.run([str(TOOLS/'ffmpeg.exe'),'-v','error','-y','-ss','850','-i',str(SOURCE),'-frames:v','1',str(P/'inventory/recording-health-frame-850.png')],check=True)
before=read(P/'inventory/ledger-before.json');after=read(P/'inventory/ledger-after.json')
for key in ['tasks','checkpoint']:assert before[key]==after[key]
assert before['preferences']['payload']==after['preferences']['payload']
write(P/'inventory/ledger-verification.json',{'tasksExactlySame':True,'checkpointExactlySame':True,'preferencesPayloadExactlySame':True,'readOnlyOwnedSnapshot':True,'noWholeUserDatabaseExport':True})
logs=ROOT/'artifacts/m7-pr235-ci953/candidate/Narro-M7-Logs';shutil.copytree(logs,P/'Narro-M7-Logs')
with zipfile.ZipFile(P/'Narro-M7-Logs.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted((P/'Narro-M7-Logs').rglob('*')):
        if f.is_file():z.write(f,f.relative_to(P).as_posix())
with zipfile.ZipFile(P/'Narro-M7-Logs.zip') as z:
    assert z.testzip() is None
    for name in z.namelist():assert hashlib.sha256(z.read(name)).hexdigest()==sha(P/name)
anchor=datetime.fromtimestamp(SOURCE.stat().st_birthtime,timezone.utc);rows=[];seen=set()
for filename in ['actions.jsonl','raw-actions.log']:
    for n,line in enumerate((P/filename).read_text(encoding='utf-8-sig').splitlines(),1):
        try:r=json.loads(line)
        except ValueError:continue
        if not isinstance(r,dict) or 'utc' not in r:continue
        key=json.dumps(r,sort_keys=True)
        if key in seen:continue
        seen.add(key);r['originalApproxSeconds']=round((datetime.fromisoformat(r['utc'].replace('Z','+00:00'))-anchor).total_seconds(),3);r['evidenceInput']=f'{filename}:{n}';rows.append(r)
rows.sort(key=lambda r:r['utc'])
(P/'chronological-actions.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows),encoding='utf-8')
with (P/'chronological-actions.csv').open('w',encoding='utf-8',newline='') as f:
    w=csv.writer(f);w.writerow(['utc','original_seconds','action','raw_input'])
    for r in rows:w.writerow([r['utc'],r['originalApproxSeconds'],r.get('action'),r['evidenceInput']])
write(P/'observations/bookmarks.json',[r for r in rows if r.get('action')=='bookmark'])
progress=read(MAIN/'work-log/evidence/m7-ci953-dual-20261005/visual-progress.json');progress['supplementalContinuousCapture']={'newReviewCells':0,'visualReviewedDelta':0,'packet':P.name};write(P/'visual-progress.json',progress)
write(P/'provenance.json',{'source':'38219e200fe3bec7309f8e03e72003184ca86d08','ci':953,'runId':37258629373,'artifactId':11324640580,'exeSha256':'bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8','pid':141908,'focusHwnd':7471826,'mainHwnd':3213706,'durationSeconds':duration,'canvas':'4480x1080/60fps','obsStopFlushLocal':'2026-10-05 16:13:48.381','obsStoppedVerified':True,'nativeActions':len(rows),'offsetAnchorUtc':anchor.isoformat(),'offsetUncertaintySeconds':1,'sourceCodeChanges':False,'wholeMediaReassembly':media})
matrix=[]
for m,note in [('M1','Two-display100/125 context corroboration; no quiet performance/sleep/cable test.27 remains FAIL.'),('M2','Owned identities/data unchanged; no new acceptance counter.'),('M3','Paused checkpoint/846s unchanged; no running/expiry test.'),('M4','No scheduling exercise.'),('M5','Main populated large Notes drag/keyboard boundary and focused Add dialog shortcuts captured.33/34 REVIEW_PENDING; no source PASS.'),('M6','Focus large Notes drag/keyboard and focused Add dialogs captured; normal/reduced dialogs. Source/motion OPEN.'),('M7','Bottom-edge compact/expanded/Notes/locate100/125 normal/reduced captured, same HWND. Reduced starts at already-clamped position. C4 OPEN.'),('M8','Local modal B/P/N, Main global T transfer exercised. Greek draft Unicode is NOT Greek OS keyboard-layout acceptance.'),('M9','No new Reports exercise; existing owned manual fixture retained unchanged.')]:matrix.append({'milestone':m,'disposition':note,'evidence':'chronological-actions.jsonl; observations; inventory/ledger-verification.json'})
write(P/'session-m1-m9-matrix.json',matrix)
body=f'''## Current — CI953 Notes/modal/bottom-edge capture; visual review44/100

[Whole {duration:.3f}s recording, verified multipart MKV/MP4, screenshots, whole logs/ZIP and actions](work-log/evidence/{P.name}/README.md). M5/M6 large populated Notes attempted lower-right resize and actual Ctrl+A/Tab/Shift+Tab/Escape, actual Return compact recovery; Notes bounds unchanged and Escape retains editor,33 REVIEW_PENDING pending affordance/source requirement. Main focused Add dialog local B/P/N and global T; global T transfers Focus while Main modal remains,34 REVIEW_PENDING. Focus local modal keys also captured. Dialogs normal/reduced with English/Greek draft text; **OS Greek keyboard layout was not exercised**. Drafts cancelled; no task writes. M7 bottom-edge100/125 compact→expanded→Notes→locate→compact captured normal/reduced on same7471826; reduced begins at already-clamped positions. No canonical/motion PASS inferred.

**Visual review unchanged44/100,56OPEN:** M1 1/1 examined FAIL27; M5 12/25; M6 16/31; M7 13/29; M8 2/8; M9 0/6. No new denominator/acceptance counters. Read-only owned tasks, paused checkpoint and preference payload match before/after exactly. Whole current Narro-M7-Logs and ZIP retain historicalC5 PASS, not rerun; live logs are bounded snapshot. Source38219e20/CI953/artifact11324640580/EXEbde7646d. No app source/tests/build/CI change.

Final paused compact(-1113,705) on LG125%, Main maximized Ultra100/All Lists with owned Notes collapsed; runtime141908/Focus7471826/Main3213706; both displays active, Windowsdark/Narrolight/normal motion. OBS stopped normally and flushed. Earlier07/23/27 and C4/source acceptance remain OPEN;28–34 require analysis. M10 blocked/M11 dormant.

**Continuation:** capture-only next distinct unmet path is actual OS Greek input-layout modal shortcuts (current Greek draft text does not prove it), followed by separately owned live work/expiry/break workflow if safely prepared. Review the56 frozen pending cells and supplemental bookmarks later using full recordings/canonical fixtures. Desktop Publish-Narro-Evidence.bat publishes a prepared SHA-verified evidence/tracking packet only; it cannot create missing observations or finalize an unprepared capture. Preserve uncompiled async-worker WIP. Explicitly announce each actual milestone completion and all M1–M9 completion before M10.

'''
readme='# CI953 supplemental M5/M6 Notes/dialogs and M7 bottom-edge evidence\n\n'+body.replace('(work-log/evidence/'+P.name+'/README.md)','(video/media-reassembly.json)')+'''
## Media access and limits

Whole original MKV and stream-copy H264/AAC MP4 exceed GitHub's single-file limit. Each is retained in ordered64MiB parts in video/. Download the whole folder and run video/Reassemble.ps1: it joins parts and verifies the original whole-file SHA256. No frames/audio omitted. Whole originals remain available locally. [Media sizes/hashes](video/media-reassembly.json), [media probe](inventory/recording-ffprobe.json), [OBS log](inventory/obs-recording-log.txt), [chronological CSV](chronological-actions.csv), [M1–M9 dispositions](session-m1-m9-matrix.json), [logs ZIP](Narro-M7-Logs.zip), [SHA manifest](sha256-manifest.json).

![Original-derived health frame850s, both displays](inventory/recording-health-frame-850.png)

This is capture health/navigation evidence, not a counted visual review or animation comparison. Whole host425x875 does not imply visible compact overflow. Ultra bottom compact initiallyy894 expands/clampsy780; LG compact initiallyy884 expands/clampsy705. Collapse stays clamped. Reduced-motion pair starts already clamped, not at the original lower position. Main large Task note remains990x557, Focus large306x576 after attempted lower-right drags; absent verified affordance/source criterion these are REVIEW_PENDING, not asserted resize FAIL. Keyboard/probe guards occasionally rejected transient/mismatched foreground before input; fresh observation recovered. All raw probes/actions retained. No user DB exported.
'''
(P/'README.md').write_text(readme,encoding='utf-8');(P/'.gitattributes').write_text('* -text\n** -text\n',encoding='utf-8')
for rel in ['HANDOFF.md','TODO.md','STATUS.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']:
    shutil.copy2(MAIN/rel,P/'inventory'/('post-'+pathlib.Path(rel).name))
manifest=[{'path':f.relative_to(P).as_posix(),'bytes':f.stat().st_size,'sha256':sha(f)} for f in sorted(P.rglob('*')) if f.is_file() and f.name!='sha256-manifest.json'];write(P/'sha256-manifest.json',manifest)
shutil.copytree(P,DEST)
for rel in ['HANDOFF.md','TODO.md','STATUS.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']:
    f=MAIN/rel;old=f.read_text(encoding='utf-8-sig');start=old.index('## Current — CI953 dual-display capture published; visual review44/100');section=body.replace('(work-log/','(../work-log/') if rel.startswith('docs/') else body;f.write_text(old[:start]+section+old[start:],encoding='utf-8')
write(pathlib.Path(r'E:\SystemFiles\Desktop\Narro-Evidence-Tools\ready.json'),{'packet':P.name,'message':'docs: publish CI953 Notes modal and bottom-edge Windows capture'})
print(json.dumps({'durationSeconds':duration,'actions':len(rows),'files':len(manifest)+1,'ready':str(DEST)}))
