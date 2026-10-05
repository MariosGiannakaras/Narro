import pathlib,json,shutil,subprocess,hashlib,zipfile,os
from datetime import datetime,timezone
ROOT=pathlib.Path(r'E:\SystemFiles\Desktop\NarroUpload');MAIN=pathlib.Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload');P=ROOT/'artifacts/m7-ci953-layout-20261005';D=MAIN/'work-log/evidence'/P.name;S=ROOT/'artifacts/m7-pr234-native-20261005/video/2026-10-05 16-24-29.mkv';T=ROOT/'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
assert not D.exists()
probe=json.loads(subprocess.check_output([str(T/'ffprobe.exe'),'-v','error','-show_format','-show_streams','-of','json',str(S)]));duration=float(probe['format']['duration']);assert duration>90
write(P/'inventory/recording-ffprobe.json',probe)
log=max((pathlib.Path(os.environ['APPDATA'])/'obs-studio/logs').glob('*'),key=lambda p:p.stat().st_mtime);assert "16-24-29.mkv' stopped" in log.read_text(encoding='utf-8-sig');shutil.copy2(log,P/'inventory/obs-recording-log.txt')
shutil.copy2(S,P/'video'/S.name)
subprocess.run([str(T/'ffmpeg.exe'),'-v','error','-y','-i',str(S),'-map','0','-c','copy','-movflags','+faststart',str(P/'video/layout-full.mp4')],check=True)
subprocess.run([str(T/'ffmpeg.exe'),'-v','error','-y','-ss','95','-i',str(S),'-frames:v','1',str(P/'inventory/health-frame-95.png')],check=True)
b=read(P/'inventory/ledger-before.json');a=read(P/'inventory/ledger-after.json');assert b['tasks']==a['tasks'] and b['checkpoint']==a['checkpoint'] and b['preferences']['payload']==a['preferences']['payload'];write(P/'inventory/ledger-verification.json',{'tasksExactlySame':True,'checkpointExactlySame':True,'preferencesPayloadExactlySame':True,'readOnly':True})
shutil.copytree(ROOT/'artifacts/m7-pr235-ci953/candidate/Narro-M7-Logs',P/'Narro-M7-Logs')
with zipfile.ZipFile(P/'Narro-M7-Logs.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted((P/'Narro-M7-Logs').rglob('*')):
  if f.is_file():z.write(f,f.relative_to(P).as_posix())
with zipfile.ZipFile(P/'Narro-M7-Logs.zip') as z:
 assert z.testzip() is None
 for n in z.namelist():assert hashlib.sha256(z.read(n)).hexdigest()==sha(P/n)
anchor=datetime.fromtimestamp(S.stat().st_birthtime,timezone.utc);rows=[]
for filename in ['actions.jsonl','raw-actions.log']:
 for n,line in enumerate((P/filename).read_text(encoding='utf-8-sig').splitlines(),1):
  try:r=json.loads(line)
  except ValueError:continue
  if not isinstance(r,dict) or 'utc' not in r:continue
  r['originalApproxSeconds']=round((datetime.fromisoformat(r['utc'].replace('Z','+00:00'))-anchor).total_seconds(),3);r['evidenceInput']=f'{filename}:{n}';rows.append(r)
rows.sort(key=lambda r:r['utc']);(P/'chronological-actions.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows),encoding='utf-8')
layout=[r for r in rows if r.get('action')=='focused-webview-keyboard-layout'];assert any(r['after']=='4080408' and r['active']==3213706 and r['request']=='read' for r in layout);assert any(r['after']=='4080408' and r['active']==7471826 and r['request']=='read' for r in layout);assert layout[-1]['after']=='4090409'
write(P/'provenance.json',{'source':'38219e200fe3bec7309f8e03e72003184ca86d08','ci':953,'artifact':11324640580,'exeSha256':'bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8','pid':141908,'focusHwnd':7471826,'mainHwnd':3213706,'durationSeconds':duration,'nativeActions':len(rows),'canvas':'4480x1080/60fps','obsStoppedVerified':True,'normalMotionOnly':True,'greekInputThreadLayoutVerified':'4080408','restoredInputThreadLayout':'4090409','noAppSourceChanges':True})
write(P/'session-m1-m9-matrix.json',[{'milestone':f'M{i}','disposition':('Captured actual Greek HKL4080408 Add-dialog creation and local B/P/N on focused Add, Main and Focus. Source/motion/full acceptance OPEN.' if i in [5,6,8] else 'No new milestone acceptance; owned paused ledger unchanged; existing gates remain open.')} for i in range(1,10)])
progress=read(MAIN/'work-log/evidence/m7-ci953-continuous-20261005/visual-progress.json');progress['supplementalLayoutCapture']={'packet':P.name,'visualReviewedDelta':0,'newReviewCells':0};write(P/'visual-progress.json',progress)
w=next(w for w in read(P/'observations/final-compact.json')['windows'] if w['hwnd']==7471826)
section=f'''## Current — CI953 actual Greek keyboard-layout capture; visual review44/100

[Whole {duration:.3f}s original MKV/MP4, health image, full logs/ZIP and chronological actions](work-log/evidence/{P.name}/README.md). Actual Windows focused WebView HKL4080408 verified on Main3213706 and Focus7471826 while Add task button focused. Actual physical Ctrl+Alt+T opens each Add dialog; draft typed, focused Add tested with Ctrl+Alt+B/P/N; actual Escape cancellation. Both return to HKL4090409. Normal motion only. This closes the earlier missing input-layout acquisition, not full M8 shortcut/source acceptance. Read-only task/checkpoint/preference payload exactly unchanged; no created task/session. No app source/tests/build/CI changes. Whole live logs are a bounded snapshot; historicalC5 PASS preserved, not rerun.

**Visual review44/100,56OPEN unchanged:** M1 1/1 examined FAIL27; M5 12/25; M6 16/31; M7 13/29; M8 2/8; M9 0/6. No new denominator or accepted milestone counter. Exact38219e20/CI953/artifact11324640580/EXEbde7646d; runtime141908, same Focus7471826; final paused compact native host{w['outer']} at DPI{w['dpi']}; Main All Lists/Notes collapsed, both displays active, Windowsdark/Narrolight/normal motion. OBS stopped/flushed. Gates07/23/27/C4 and source parity remain OPEN;28–34 await analysis. M10 blocked/M11 dormant.

**Continuation:** next independent acquisition is a separately owned running work→pause/resume→real EST expiry/Time's Up→Extend/Done/Switch and break workflow, with a fresh pre-session matrix and explicit durable fixture/session deltas. Do not claim the current paused ledger unchanged after a live workflow. Existing56 pending cells and bookmarks need later whole-recording/canonical review. Desktop Publish-Narro-Evidence.bat is installed/tested and publishes only a prepared SHA-verified packet/tracking; no active-recording sealing or source upload. Preserve uncompiled async-worker WIP. Announce actual milestone completion and all M1–M9 gates complete before M10.

'''
(P/'README.md').write_text('# CI953 actual Windows Greek input-layout modal evidence\n\n'+section+'''[Whole MKV](video/2026-10-05%2016-24-29.mkv), [whole MP4](video/layout-full.mp4), [actions](chronological-actions.jsonl), [logs ZIP](Narro-M7-Logs.zip), [provenance](provenance.json), [M1–M9 matrix](session-m1-m9-matrix.json), [SHA manifest](sha256-manifest.json).

![Original-derived capture health frame95s](inventory/health-frame-95.png)

The health image is not a counted visual review. Normal motion only, no reduced-motion or global-shortcut matrix claimed in this short packet. Do not infer pass for unrelated surfaces merely appearing. UIA provider snapshots show each local-key state; unchanged owned checkpoint corroborates no unintended work/break transition. No whole user database exported.
''',encoding='utf-8');(P/'.gitattributes').write_text('* -text\n** -text\n',encoding='utf-8')
for rel in ['HANDOFF.md','TODO.md','STATUS.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']:shutil.copy2(MAIN/rel,P/'inventory'/('post-'+pathlib.Path(rel).name))
manifest=[{'path':f.relative_to(P).as_posix(),'bytes':f.stat().st_size,'sha256':sha(f)} for f in sorted(P.rglob('*')) if f.is_file() and f.name!='sha256-manifest.json'];write(P/'sha256-manifest.json',manifest);shutil.copytree(P,D)
for rel in ['HANDOFF.md','TODO.md','STATUS.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']:
 f=MAIN/rel;old=f.read_text(encoding='utf-8-sig');start=old.index('## Current — CI953 Notes/modal/bottom-edge capture; visual review44/100');body=section.replace('(work-log/','(../work-log/') if rel.startswith('docs/') else section;f.write_text(old[:start]+body+old[start:],encoding='utf-8')
write(pathlib.Path(r'E:\SystemFiles\Desktop\Narro-Evidence-Tools\ready.json'),{'packet':P.name,'message':'docs: publish CI953 actual Greek layout modal capture'})
print(json.dumps({'duration':duration,'files':len(manifest)+1,'actions':len(rows)}))
