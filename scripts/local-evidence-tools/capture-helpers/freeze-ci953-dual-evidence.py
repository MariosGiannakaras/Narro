import csv, hashlib, json, pathlib, shutil, zipfile
from datetime import datetime, timezone

ROOT=pathlib.Path(r'E:\SystemFiles\Desktop\NarroUpload')
MAIN=pathlib.Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload')
P=ROOT/'artifacts/m7-ci953-dual-20261005'
DEST=MAIN/'work-log/evidence/m7-ci953-dual-20261005'
SOURCE=ROOT/'artifacts/m7-pr234-native-20261005/video/2026-10-05 15-22-38.mkv'

def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.file_digest(p.open('rb'),'sha256').hexdigest()
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
anchor=datetime.fromtimestamp(SOURCE.stat().st_birthtime,timezone.utc)
def offset(utc):return round((datetime.fromisoformat(utc.replace('Z','+00:00'))-anchor).total_seconds(),3)
probe=read(P/'inventory/recording-ffprobe.json')
duration=float(probe['format']['duration'])
assert sha(SOURCE)==sha(P/'video'/SOURCE.name)
assert probe['streams'][0]['width']==4480 and probe['streams'][0]['height']==1080
before=read(P/'inventory/ledger-before.json');after=read(P/'inventory/ledger-after.json')
assert before['tasks']==after['tasks']
assert before['checkpoint']==after['checkpoint']
assert before['preferences']['payload']==after['preferences']['payload']
write(P/'inventory/ledger-verification.json',{'readOnly':True,'ownedTasksIdentitiesNotesSessionsTimeExactlySame':True,'checkpointIncludingTimestampExactlySame':True,'preferencePayloadRestored':True,'preferenceUpdatedAtChangedLegitimately':[before['preferences']['updatedAt'],after['preferences']['updatedAt']],'activeTakenSeconds':846,'activePausedWorkMs':801308,'previousOwnedManual120sFixtureUnchanged':True,'wholeUserDatabaseNotExported':True})

with zipfile.ZipFile(P/'Narro-M7-Logs.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted((P/'Narro-M7-Logs').rglob('*')):
        if f.is_file():z.write(f,f.relative_to(P).as_posix())
logfiles={f.relative_to(P).as_posix():sha(f) for f in (P/'Narro-M7-Logs').rglob('*') if f.is_file()}
with zipfile.ZipFile(P/'Narro-M7-Logs.zip') as z:
    assert len(logfiles)==11 and set(z.namelist())==set(logfiles)
    assert z.testzip() is None
    assert all(hashlib.sha256(z.read(n)).hexdigest()==h for n,h in logfiles.items())
write(P/'inventory/logs-integrity.json',{'files':11,'zipAllFilesByteIdentical':True,'sha256':logfiles,'liveSessionIsBoundedSnapshot':True})
rows=[];seen=set()
for filename in ['actions.jsonl','raw-actions.log']:
    for n,line in enumerate((P/filename).read_text(encoding='utf-8-sig').splitlines(),1):
        try:r=json.loads(line)
        except ValueError:continue
        if not isinstance(r,dict) or 'utc' not in r:continue
        key=json.dumps(r,sort_keys=True)
        if key in seen:continue
        seen.add(key)
        rows.append(dict(r,originalApproxSeconds=offset(r['utc']),evidenceInput=f'{filename}:{n}'))
rows.sort(key=lambda r:r['utc'])
(P/'chronological-actions.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows),encoding='utf-8',newline='\n')
with (P/'chronological-actions.csv').open('w',encoding='utf-8',newline='') as f:
    w=csv.writer(f);w.writerow(['utc','original_approx_seconds','action','target_or_note','raw_input'])
    for r in rows:w.writerow([r['utc'],r['originalApproxSeconds'],r['action'],r.get('button',r.get('name',r.get('chord',r.get('observation',r.get('request',r.get('mode','')))))),r['evidenceInput']])
write(P/'observations/bookmarks.json',[r for r in rows if r['action']=='bookmark'])

geometry=[]
expected={'settled-panel-lg-Left.json':(-1920,120),'settled-panel-lg-Right.json':(-425,120),'settled-panel-ultra-Left.json':(0,96),'settled-panel-ultra-Right.json':(2220,96)}
for name,(x,dpi) in expected.items():
    d=read(P/'observations'/name);w=next(w for w in d['windows'] if w['hwnd']==7471826)
    assert w['outer']['x']==x and w['outer']['y']==0 and w['dpi']==dpi
    geometry.append({'file':'observations/'+name,'utc':d['utc'],'originalApproxSeconds':offset(d['utc']),'hwnd':7471826,'dpi':dpi,'outer':w['outer'],'scopedNativeGeometry':'PASS','visualSourceMotionReview':'OPEN'})
write(P/'inventory/settled-geometry-verification.json',geometry)
for name,dpi,xsign in [('05-compact-padding-cross-lg.json',120,-1),('12-compact-cross-ultra.json',96,1)]:
    w=next(w for w in read(P/'observations'/name)['windows'] if w['hwnd']==7471826)
    assert w['dpi']==dpi and w['outer']['x']*xsign>0
progress=read(MAIN/'work-log/evidence/m7-ci953-gaps-20261005/visual-progress.json')
progress['supplementalDualCapture']={'newReviewCells':0,'visualReviewedDelta':0,'packet':'m7-ci953-dual-20261005'}
write(P/'visual-progress.json',progress)
write(P/'provenance.json',{'source':'38219e200fe3bec7309f8e03e72003184ca86d08','ci':953,'runId':37258629373,'artifactId':11324640580,'exeSha256':'bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8','pid':141908,'focusHwnd':7471826,'mainHwnd':3213706,'originalDurationSeconds':duration,'firstFileCreationUtcApprox':anchor.isoformat(),'offsetUncertaintySeconds':1,'obsStartUtc':'2026-10-05T12:22:38.572Z','obsStopFlushUtc':'2026-10-05T12:31:49.164Z','obsFramesOutput':32983,'obsFramesDrawn':32921,'obsFramesAttempted':33035,'obsRenderingLagFrames':114,'obsEncodingSkippedFrames':23,'nativeActions':len(rows),'canvas':'4480x1080/60fps','activeTopologyAfter':'UltraGear2560x1080/100% primary(0,0); LG1920x1080/125% secondary(-1920,0)','noExplicitPrimaryMonitorSelection':True,'noSourceTestsBuildCiChanges':True,'obsStopped':True})
matrix=[
 {'milestone':'M1','disposition':'SCOPED_NATIVE_TOPOLOGY_PASS; selected-monitor/DPI27 OPEN/FAIL','evidence':'inventory/display-paths-extend.json; inventory/display-modes-settled.json','limits':'Actual Duplicate->Extend activates both displays. No cable/sleep/wake/quiet performance or explicit DPI-stale recovery proof.'},
 {'milestone':'M2','disposition':'Existing acceptance unchanged; owned identity corroboration','evidence':'inventory/ledger-verification.json'},
 {'milestone':'M3','disposition':'Existing acceptance unchanged; paused ledger corroboration','evidence':'inventory/ledger-verification.json'},
 {'milestone':'M4','disposition':'No sufficient new scheduling exercise'},
 {'milestone':'M5','disposition':'Main catalog/Preferences present; no new board visual acceptance','evidence':'observations/02-main-dual.json','limits':'Do not infer task drag/editor/source PASS from Main merely appearing.'},
 {'milestone':'M6','disposition':'Dual Panel geometry corroborated; source/motion OPEN','evidence':'inventory/settled-geometry-verification.json','limits':'Only explicit re-entry materializes correctly observed side/monitor. Direct live relocation32 is pending.'},
 {'milestone':'M7','disposition':'SCOPED_NATIVE_CROSS_DPI_DRAG_PASS; compact/expanded/locate captured; C4 OPEN','evidence':'observations/05-compact-padding-cross-lg.json; observations/12-compact-cross-ultra.json; chronological-actions.jsonl','limits':'Same Focus HWND; no new tray Quit/relaunch/C5 test. Raw title-origin attempt caused no movement; verified padding starts succeeded.'},
 {'milestone':'M8','disposition':'Monitor/side roundtrip and semantic preference restoration corroborated; visual/source OPEN','evidence':'inventory/ledger-verification.json; inventory/settled-geometry-verification.json','limits':'Immediate geometry32 pending; existing selected-monitor/DPI27 remains FAIL.'},
 {'milestone':'M9','disposition':'No new Reports exercise; previous manual fixture unchanged','evidence':'inventory/ledger-verification.json'}]
write(P/'session-m1-m9-matrix.json',matrix)

readme=f'''# CI953 dual-display supplemental Windows evidence

Whole recording: **{duration:.3f}s (~9m10s),4480x1080/60fps**, actual two-display activity after Duplicate->Extend. No new visual denominator, whole-source or milestone completion claim. Visual review remains **44/100,56OPEN**; M1 1/1 examined FAIL27, M5 12/25, M6 16/31, M7 13/29, M8 2/8, M9 0/6. The [previous packet](../m7-ci953-gaps-20261005/README.md) already closes all six partial acquisition cells.

- [Whole original MKV](video/2026-10-05%2015-22-38.mkv) and [whole H264/AAC stream-copy MP4](video/2026-10-05-dual-full.mp4).
- [Chronological CSV](chronological-actions.csv), [{len(rows)} native actions](chronological-actions.jsonl), original [actions](actions.jsonl)/[tool output](raw-actions.log).
- [Whole11-file Narro-M7-Logs](Narro-M7-Logs) and [verified ZIP](Narro-M7-Logs.zip).
- [M1–M9 dispositions](session-m1-m9-matrix.json), [native settled geometry](inventory/settled-geometry-verification.json), [read-only ledgers](inventory/ledger-verification.json), [exact provenance/capture limitations](provenance.json), [media probe](inventory/recording-ffprobe.json), [whole OBS log](inventory/obs-recording-log.txt), [SHA256 manifest](sha256-manifest.json).

Original UTC0 is approximately{anchor.isoformat()} (file creation,±1s), not filename local time. Exact native UTC actions are retained. OBS reports114 rendering-lag frames(0.3%) and23 encoding-skipped frames(0.1%); distinguish capture stalls from app motion in later analysis. Adaptive native probes/recovery waits are included; only exercised/bookmarked intervals establish evidence. Audio is retained.

## Exercises and scoped results

At12:20:47Z UltraGear was available but inactive; LG was active. Actual OBS start12:22:38Z precedes actual DisplaySwitch Duplicate then Extend. The first immediate adapter-mode probe was unsettled and showed only one desktop adapter; later native QueryDisplayConfig proves both independent active source paths. Settled desktop: UltraGear2560x1080/100% primary(0,0), LG1920x1080/125% secondary(-1920,0). No explicit primary-monitor selection was made. Windows restored its configured layout.

Actual Timer padding drag12:25:20Z crosses UltraGear100→LG125; same HWND7471826, host(-1721,425),425x875. Actual reverse padding drag12:28:34Z reaches UltraGear100 at(781,344),340x700. The earlier title-origin input12:24:31Z produced no displacement and cannot establish drag PASS; subsequent observed blank header padding did. Compact/expanded, populated four-subtask view, actual locateCtrlShiftP and Panel/Timer transitions are captured in normal/reduced modes on both displays. Populated Timer Notes is exposed on LG without editing data. Inactive full host geometry is not the visible compact region, so do not call its875px host overflow a rendered defect without the native region/pixels.

Explicit current-display selection plus actual Left/Right controls and Timer->Panel re-entry reaches all four expected native anchors:

| Panel | Left x | Right x | DPI/host |
| --- | --- | --- | --- |
| UltraGear |0|2220|96 /340x700|
| LG TV |-1920|-425|120 /425x875|

These are **scoped native geometry PASS**, not canonical/static/full-motion review. Early probes immediately after Preferences clicks retain previous geometry. **32 / REVIEW_PENDING** records that direct live monitor/side relocation is not proven; explicit re-entry succeeds. Reconcile the actual apply intent before a FAIL/fix claim. The raw250ms post-expansion guard rejected a temporarily absent Return button without input; a fresh provider snapshot recovered. Do not label that guard rejection an app failure. Some early probe filenames say LG while the observed Focus was still100%/UltraGear; recorded native DPI/bounds take precedence over the filename.

![Whole original health frame at543s: LG left Panel and UltraGear Preferences](inventory/recording-health-frame-543.png)

The543s health frame confirms both captured displays and the LG-left Panel; it is not a counted review cell or canonical comparison. Native [navigation image](observations/navigation-dual.png) is also retained. No complete frame-by-frame/source review is claimed in this capture-only phase.

## Data, build and continuation

Exact source38219e200fe3bec7309f8e03e72003184ca86d08, [CI953](https://github.com/MariosGiannakaras/Narro/actions/runs/37258629373), artifact11324640580, EXEbde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8. Runtime141908 / Main3213706 / same Focus7471826. No source/test/build/CI change, no tray Quit/relaunch test; historical953C5 PASS is preserved in the full logs and not recounted. Live141908 logs are a bounded snapshot.

Read-only before/after owned task identities, existing sessions/notes/time and paused checkpoint including timestamp match exactly. Active846s/801308ms paused. Preference payload restores automatic/null monitor, Right, light; its updatedAt legitimately changes from actual selections. Earlier owned manual-origin120s fixture (English total147s) is unchanged. No whole user database is exported. Final compact Timer(781,344) on UltraGear100, paused16:39/0of4; Windowsdark/Narrolight/normal animation restored. Both displays remain active. Main remains maximized on UltraGear, Preferences open. OBS is stopped.

Pre/post current TODO/HANDOFF/crosswalk were inspected/copied into inventory. Selected-monitor/DPI27,07read responsiveness,23provider/source, C4/source/motion remain OPEN;28/29/30/31/32 await analysis. No cable/sleep/wake or quiet-performance acceptance. M10 hard entry blocked, M11 dormant. Preserve uncompiled async-worker WIP. The next analysis chat should consume the whole media and pending56 review cells; do not repeat the captured dual setup without a distinct unmet criterion. Additional physical-only work must name its uncovered path and refresh M1–M9 gates before/after. Announce every actual milestone completion and all required M1–M9 complete before M10.
'''
(P/'README.md').write_text(readme,encoding='utf-8',newline='\n')
(P/'.gitattributes').write_text('* -text\n** -text\n',encoding='utf-8',newline='\n')
manifest=[{'path':f.relative_to(P).as_posix(),'bytes':f.stat().st_size,'sha256':sha(f)} for f in sorted(P.rglob('*')) if f.is_file() and f.name!='sha256-manifest.json']
write(P/'sha256-manifest.json',manifest)
assert not DEST.exists()
shutil.copytree(P,DEST)
assert all(sha(DEST/e['path'])==e['sha256'] for e in manifest)

current='''## Current — CI953 dual-display capture published; visual review44/100

[Whole9m10s original/MP4, logs/ZIP and chronological actions](work-log/evidence/m7-ci953-dual-20261005/README.md). Exact38219e20/CI953/EXEbde7646d. Actual Duplicate->Extend restored UltraGear2560x1080/100% primary(0,0) and LG1920x1080/125% secondary(-1920,0); no explicit primary selection. Actual padding drags100→125→100 preserve Focus7471826. Compact/expanded/populated/locate and normal/reduced transitions captured on both displays. Explicit monitor and Left/Right with Timer→Panel re-entry reach native anchors Ultra0/2220 and LG-1920/-425, scoped native geometry PASS. Immediate live relocation after Preferences controls32 is REVIEW_PENDING; direct early probes retain old geometry. No canonical/full-motion PASS inferred.

**Visual review44/100,56OPEN unchanged:** M1 1/1 examined FAIL27; M5 12/25; M6 16/31; M7 13/29; M8 2/8; M9 0/6. No new denominator/counter. Previous six partial acquisition cells are all captured; appended scope30/30 capture-ready,0/30 reviewed. OBS original reports114 rendering-lag frames/23 encoding skips, so later motion review must separate recording artifacts. Whole11-file Narro-M7-Logs/verified ZIP preserves historicalC5 PASS, not rerun. No app source/tests/builds/CI change.

Owned identities/notes/sessions/time and paused checkpoint timestamp unchanged; active846s/801308ms. Preferences payload restores automatic/null monitor, Right/light; updatedAt changes legitimately. Prior owned manual120s fixture is unchanged. Final paused compact(781,344) on Ultra100, Main3213706 maximized/Preferences open; same runtime141908/Focus7471826, both displays active, Windowsdark/Narrolight/normal motion. OBS stopped. No cable/sleep/wake/quiet performance claim. Earlier07/23/27 and C4/source gates OPEN;28–32 require analysis. M10 hard entry blocked, M11 dormant.

**Continuation:** analyze the56 registered pending visual/source/motion cells from whole packets/canonical fixtures; all named six capture gaps and this dual path are recorded, so avoid repeating setup without a distinct unmet criterion. Additional physical-only sessions need a named uncovered path and current pre/post M1–M9 dispositions. Preserve separate uncompiled async-worker WIP. Explicitly announce each actual milestone completion and all required M1–M9 complete before M10. Earlier capture sections below are historical checkpoints; this is current continuation authority.

'''
for rel in ['HANDOFF.md','STATUS.md','TODO.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']:
    f=MAIN/rel;old=f.read_text(encoding='utf-8-sig');start=old.index('## Current — CI953 six capture gaps closed; visual review44/100')
    body=current.replace('(work-log/','(../work-log/') if rel.startswith('docs/') else current
    f.write_text(old[:start]+body+old[start:],encoding='utf-8',newline='\n')
print(json.dumps({'archiveFiles':len(manifest)+1,'nativeActions':len(rows),'durationSeconds':duration,'wholeLogs':11,'geometryCasesVerified':4,'visualReview':'44/100','archive':str(DEST)}))
