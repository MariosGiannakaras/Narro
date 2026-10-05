import pathlib,json,hashlib,shutil,subprocess,zipfile,os,csv
from datetime import datetime,timezone
ROOT=pathlib.Path(r'E:\SystemFiles\Desktop\NarroUpload');MAIN=pathlib.Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload');P=ROOT/'artifacts/m7-ci953-live-20261005';D=MAIN/'work-log/evidence'/P.name
S=ROOT/'artifacts/m7-pr234-native-20261005/video/2026-10-05 16-52-15.mkv';T=ROOT/'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
assert not D.exists()
probe=json.loads(subprocess.check_output([str(T/'ffprobe.exe'),'-v','error','-show_format','-show_streams','-of','json',str(S)]));duration=float(probe['format']['duration']);assert duration>1300 and probe['streams'][0]['width']==4480
write(P/'inventory/recording-ffprobe.json',probe)
obs=max((pathlib.Path(os.environ['APPDATA'])/'obs-studio/logs').glob('*'),key=lambda p:p.stat().st_mtime);assert "16-52-15.mkv' stopped" in obs.read_text(encoding='utf-8-sig');shutil.copy2(obs,P/'inventory/obs-recording-log.txt')
mp4=P/'video/live-full.mp4';subprocess.run([str(T/'ffmpeg.exe'),'-v','error','-y','-i',str(S),'-map','0','-c','copy','-movflags','+faststart',str(mp4)],check=True)
media=[]
for source in [S,mp4]:
 parts=[];h=hashlib.sha256()
 with source.open('rb') as f:
  n=0
  while block:=f.read(64*1024*1024):
   n+=1;part=P/'video'/(source.name+f'.part{n:03}');part.write_bytes(block);parts.append(part.name);h.update(block)
 assert h.hexdigest()==sha(source);media.append({'file':source.name,'bytes':source.stat().st_size,'sha256':sha(source),'parts':parts,'reassembledByteIdentical':True})
mp4.unlink();write(P/'video/media-reassembly.json',media)
for offset in [1120,1245]:subprocess.run([str(T/'ffmpeg.exe'),'-v','error','-y','-ss',str(offset),'-i',str(S),'-frames:v','1',str(P/f'inventory/health-frame-{offset}.png')],check=True)
b=read(P/'inventory/ledger-before.json');a=read(P/'inventory/ledger-after.json');assert b['preferences']['payload']==a['preferences']['payload']
bd={t['task']['id']:t for t in b['tasks']};ad={t['task']['id']:t for t in a['tasks']};original='95a2466c-a06c-4a41-a2b4-3d1e65b9fa08';older='9d0e80ec-77b7-49e4-b66c-f67ed7818704'
assert set(bd)<=set(ad) and len(ad)-len(bd)==3
assert ad[original]['closedWorkSeconds']==bd[original]['closedWorkSeconds']==846
assert ad[older]['closedWorkSeconds']-bd[older]['closedWorkSeconds']==51
unchanged=[k for k in bd if k not in [original,older]];assert all(bd[k]==ad[k] for k in unchanged)
new=[t for k,t in ad.items() if k not in bd];assert all(t['task']['completed_at'] for t in new)
assert sorted(t['closedWorkSeconds'] for t in new)==[76,87,90]
breaks=[s for t in new for s in t['sessions'] if s['kind']=='break'];assert sorted(s['duration_seconds'] for s in breaks)==[41,300]
end=json.loads(a['checkpoint']['payload_json']);assert end['state']['task_id']==original and end['state']['phase']=='paused'
write(P/'inventory/ledger-verification.json',{'preferencesPayloadRestored':True,'unchangedExistingOwnedTaskIds':unchanged,'newTasksRetainedCompleted':new,'originalTaskSecondsBeforeAfter':[846,846],'originalOldSegmentClosedAndNewPausedSession':{'before':b['checkpoint'],'after':a['checkpoint']},'olderC5FixtureIncidentalWorkDelta':{'taskId':older,'beforeSeconds':8410,'afterSeconds':8461,'deltaSeconds':51,'cause':'success Next Task selected All default first owned fixture','pausedAndRetained':True},'actualBreakSeconds':[41,300],'noFixtureDeletionOrClockManipulation':True,'wholeUserDatabaseNotExported':True})
with (P/'observations/owned-live-sessions-export.csv').open(encoding='utf-8-sig',newline='') as f:export=list(csv.DictReader(f))
assert len(export)==5 and all(row['Task'].startswith('M7 PR235 CI953 live ') for row in export)
write(P/'inventory/csv-verification.json',{'exportedDuringCapture':True,'rows':5,'onlyOwnedList':True,'oneBreak41sIncluded':True,'secondBreakAndLaterCompletionsNotYetInThisEarlyExport':True,'finalSessionTruth':'inventory/ledger-after.json'})
shutil.copytree(ROOT/'artifacts/m7-pr235-ci953/candidate/Narro-M7-Logs',P/'Narro-M7-Logs')
with zipfile.ZipFile(P/'Narro-M7-Logs.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted((P/'Narro-M7-Logs').rglob('*')):
  if f.is_file():z.write(f,f.relative_to(P).as_posix())
with zipfile.ZipFile(P/'Narro-M7-Logs.zip') as z:
 assert z.testzip() is None
 for name in z.namelist():assert hashlib.sha256(z.read(name)).hexdigest()==sha(P/name)
anchor=datetime.fromtimestamp(S.stat().st_birthtime,timezone.utc);rows=[];seen=set()
for filename in ['actions.jsonl','raw-actions.log']:
 for n,line in enumerate((P/filename).read_text(encoding='utf-8-sig').splitlines(),1):
  try:r=json.loads(line)
  except ValueError:continue
  if not isinstance(r,dict) or 'utc' not in r:continue
  key=json.dumps(r,sort_keys=True)
  if key in seen:continue
  seen.add(key);r['originalApproxSeconds']=round((datetime.fromisoformat(r['utc'].replace('Z','+00:00'))-anchor).total_seconds(),3);r['evidenceInput']=f'{filename}:{n}';rows.append(r)
rows.sort(key=lambda r:r['utc']);(P/'chronological-actions.jsonl').write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in rows),encoding='utf-8')
with (P/'chronological-actions.csv').open('w',encoding='utf-8',newline='') as f:
 w=csv.writer(f);w.writerow(['utc','original_seconds','action','target_or_note','raw_input'])
 for r in rows:w.writerow([r['utc'],r['originalApproxSeconds'],r.get('action'),r.get('button',r.get('name',r.get('chord',r.get('observation','')))),r['evidenceInput']])
write(P/'observations/bookmarks.json',[r for r in rows if r.get('action')=='bookmark'])
expired=read(P/'inventory/ledger-A-expired.json');assert json.loads(expired['checkpoint']['payload_json'])['state']['phase']=='time_up'
breakend=json.loads(read(P/'inventory/ledger-C-real-break-expiry.json')['checkpoint']['payload_json']);assert breakend['state']['kind']=='work' and breakend['closed_break_seconds']==341
final=next(w for w in read(P/'observations/87-final-compact.json')['windows'] if w['hwnd']==7471826)
success=[]
for name in ['71-C-success-reduced100.json','81-B-success125-normal-fun.json']:
 doc=read(P/'observations'/name);w=next(w for w in doc['windows'] if w['hwnd']==7471826);button=next(e for e in doc['elements'] if e['name']=='Take a Break' and e['type']=='ControlType.Button');assert not button['enabled'];success.append({'probe':name,'actualDpi':w['dpi'],'actualOuter':w['outer'],'takeBreakEnabled':False})
assert all(s['actualDpi']==96 for s in success)
write(P/'inventory/success-surface-verification.json',{'cases':success,'limits':'Both success surfaces actually100%, even B entryTimer125. Filename125 indicates entry only. Fun GIF toggled on for B but no accessible image or obvious decoration in provider; effective animation remains OPEN.'})
progress=read(MAIN/'work-log/evidence/m7-ci953-layout-20261005/visual-progress.json');progress['supplementalLiveCapture']={'packet':P.name,'visualReviewedDelta':0,'newReviewCells':0};write(P/'visual-progress.json',progress)
write(P/'provenance.json',{'source':'38219e200fe3bec7309f8e03e72003184ca86d08','ci':953,'runId':37258629373,'artifactId':11324640580,'exeSha256':'bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8','runtimePid':141908,'focusHwnd':7471826,'mainHwnd':3213706,'durationSeconds':duration,'canvas':'4480x1080/60fps','originalAnchorUtc':anchor.isoformat(),'offsetUncertaintySeconds':1,'actions':len(rows),'obsStopFlushUtc':'2026-10-05T14:14:35.747Z','obsFramesOutput':80376,'obsFramesDrawn':80409,'obsStoppedVerified':True,'wholeMedia':media,'noAppSourceEditsTestsBuildsCiOrMerge':True,'separateWipBackupBranch':'wip/m7-async-read-and-evidence-tools-20261005'})
matrix=[('M1','Native dual topology/context and actual100/125 cross drags; no quiet performance/sleep/cable acceptance.27 FAIL remains.'),('M2','SCOPED owned identities preserved; 3 newly created completed retained fixtures, existing ordinary fixture semantics unchanged except explicit segment lifecycle. No whole-db claim.'),('M3','SCOPED ledger corroboration: A76/B90/C87work seconds, C41+300break, actual expiry and paused restoration; original846 preserved; oldC5+51 explicit. Full runtime acceptance unchanged.'),('M4','No new scheduling/recurrence exercise.'),('M5','Owned list/task creation with invalidEST error then valid H:MM:SS correction; Main live/complete transitions. Source/motion OPEN.'),('M6','Owned list/live selection, PanelTimeUp/Skip, completion/queue; selection reset across presentations36 REVIEW_PENDING. Source/motion OPEN.'),('M7','Actual running/pause/resume/compact/expanded, two realEST expiries, Extend/overtime/Done/Skip; manualBreak41s and naturalBreak300s, successnormal/reduced100.35 observedFAIL,37 TakeBreak OPEN; C4 remainsOPEN.'),('M8','Real defaultBreak10→5→10 and celebrationoff→on→off/FunGIFoff→on→off, semantic preference payload restored; full source/acceptance OPEN.'),('M9','Real owned live-origin work/break Reports/tooltip/Sessions filters and actualCSV5rows during capture; final ledger retained. Canonical/detail/full visual acceptance OPEN.')]
write(P/'session-m1-m9-matrix.json',[{'milestone':m,'disposition':note,'evidence':'chronological-actions.csv; observations; inventory/ledger-verification.json'} for m,note in matrix])
section=f'''## Current — CI953 live/expiry/break/completion acquisition; visual review44/100

[Whole {duration:.3f}s recording, verified multipart MKV/MP4, native images, whole logs/ZIP, CSV and chronological actions](work-log/evidence/{P.name}/README.md). Actual own list/three tasks; real A/B60sEST expiry, work pause/resume/button+CtrlAltP, compact/expanded while live, ATimeUp→Extend/overtime→Done, BTimeUp→Skip→C; real manual break41s skipped and natural300s break expiry→running work. Enabled success screen from expandedTimer C reduced100/B normal100 (B entryTimer125 moves to actual100 success); Take a Break is disabled37. Reports owned work/break list, chart tooltip, actual hide/showBreak rows and CSV5rows exercised during ongoingBreak. No app source edits/tests/builds/CI/merge; previous WIP backup remains separate.

**35 observed FAIL, pending full recording/source review:** domain A time_up/60000ms13:58:13Z, expandedTimer remains00:00/Pause/Task resumed through13:58:53Z; Main cardTimeUp. Actual ReturnPanel recoversTimeUp. **36 REVIEW_PENDING:** Panel/success re-entry resets selected listAll; successNextTask selects older ownedC5fixture instead of B, recoveryPause leaves explicitly retained51swork. **37 OPEN:** successTakeBreak disabled with implementation-status copy. FunGIFenabled for B but visible/animated parity is not established. Do not infer125 success PASS from an entry/filename; native successDPI is96 in both cases.

**Visual review44/100,56OPEN unchanged:** M1 1/1 examinedFAIL27; M5 12/25; M6 16/31; M7 13/29; M8 2/8; M9 0/6. Supplemental acquisition is not new reviewed cells or milestone acceptance. New retained completed A/B/C work totals76/90/87s; Cbreak41+300=341s. OlderC5fixture8410→8461s from NextTask; original95aTimeTaken846 preserved, old801ssegment closed and new paused session9e190776 with326ms. Checkpoint is legitimately different, not unchanged. All other previously snapshotted owned task records match exactly. Preference payload restored, updatedAt legitimately changed. No fixture deletion/clock manipulation/wholeDB export.

Final original95a paused, same runtime141908/Focus7471826/Main3213706, compact{final['outer']} atDPI{final['dpi']}, both displays active, MainPreferences, Windowsdark/Narrolight/normal motion. Remaining countdown is new-session30:00 (before16:39); record this task-switch/session behavior without calling it a presentation-only reset. Whole11logs/live bounded snapshot includes historicalC5 PASS, not rerun. OBS stopped/flushed. Gates07/23/27/C4/source remainOPEN,28–37 await analysis; M10 blocked/M11 dormant.

**Continuation:** later chat can analyze56 registered pending cells plus supplemental35–37 from whole media/canonical fixtures and disposition only sufficiently exercised requirements. Distinct physical gaps: explicit125% success geometry (currentAUTO chooses100%primary), success TakeBreak actual path cannot run while disabled, remaining preference/shortcut/error/motion matrix and separate quiet performance/sleep/wake/topology as required. Do not repeat completed live/expiry/defaultBreak setup merely because review is pending. Capture-only priority; preserve WIP backup, announce actual milestone completion/all M1–M9 complete before M10. DesktopBAT publishes prepared frozen evidence/tracking, not active recordings.

'''
readme='# CI953 live work, expiry, break and completion Windows evidence\n\n'+section+'''
## Whole media and analysis navigation

Whole original MKV and stream-copy playable MP4 are preserved in ordered64MiB binary parts under video/, with whole-file SHA256 in [reassembly manifest](video/media-reassembly.json). Join parts as binary bytes and verify the listed whole hash. Local Desktop `Narro-Evidence-Tools/Reassemble.ps1 -MediaDirectory <absolute video directory>` can do this. No frames/audio omitted. No executable helper is part of this evidence-only commit. [Chronological CSV](chronological-actions.csv), [native actions](chronological-actions.jsonl), [bookmarks35–37](observations/bookmarks.json), [M1–M9 matrix](session-m1-m9-matrix.json), [whole Narro logs ZIP](Narro-M7-Logs.zip), [data deltas](inventory/ledger-verification.json), [provenance](provenance.json), [OBS log](inventory/obs-recording-log.txt), [SHA manifest](sha256-manifest.json).

Important original intervals (UTC exact actions in manifest; file creation offsets±1s): Aactualstart13:56:53, pause13:57:19, resume13:57:21, localPpause13:57:44, resume13:58:01; domainTimeUp13:58:13 while expanded remainsstale, Panelrecovery13:58:53. Extend13:59:18, Done13:59:34 autostartsB. BPanelTimeUp real14:00:34, Skip14:01:05; CBreak14:01:06→Resume/skip14:01:47, work resume14:03:37, five-minuteBreak14:04:12→actualexpiry14:09:12. Settings duringbreak restoresdefault10 whilecurrent5 persists. CSuccessexpanded/reduced14:10:04, NextTask14:10:54 unexpectedlyoldC5, Pause14:11:46; explicitBMakeLive14:12:07, crossDPI14:12:34, BComplete/normal14:12:38. FinaloriginalMakeLive/Pause14:14:32/33. No static sampled frame establishes a full motion PASS.

CSV was exported14:07:07 and contains5owned rows, work0/35/60/76 and break41. It predates the secondbreak/completion tail; finalsessiontruth is ledger-after, not this early export. Chart click pinned actual tooltip, not a separate day drilldown. Lastrestore now projects30:00 remaining/new326ms checkpoint;846s historicalTaken is preserved. The start/stop wall-clock timestamps include paused waits, not accumulatedwork; do not subtract wall time to infer workduration.

![Observed stale expandedTimeUp versus Main card](observations/navigation-A-timeup.png)

![Actual reduced100%success from expandedTimer](observations/navigation-C-success.png)

![Actual normal100%success entered from125%Timer](observations/navigation-B-success125.png)

Health images at1120/1245s are original-derived navigation checks, not additional reviewed cells. Capture includes necessary UIA/read-only diagnostics and native recovery but no repo/source-debugging interval. No new native quiet-performance measurement or source parity claim. Same Focus HWND is retained throughout.
'''
(P/'README.md').write_text(readme,encoding='utf-8');(P/'.gitattributes').write_text('* -text\n** -text\n',encoding='utf-8')
for rel in ['HANDOFF.md','TODO.md','STATUS.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']:shutil.copy2(MAIN/rel,P/'inventory'/('post-'+pathlib.Path(rel).name))
manifest=[{'path':f.relative_to(P).as_posix(),'bytes':f.stat().st_size,'sha256':sha(f)} for f in sorted(P.rglob('*')) if f.is_file() and f.name!='sha256-manifest.json'];write(P/'sha256-manifest.json',manifest);shutil.copytree(P,D)
for rel in ['HANDOFF.md','TODO.md','STATUS.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']:
 f=MAIN/rel;old=f.read_text(encoding='utf-8-sig');at=old.index('## Current — CI953 actual Greek keyboard-layout capture');body=section.replace('(work-log/','(../work-log/') if rel.startswith('docs/') else section;f.write_text(old[:at]+body+old[at:],encoding='utf-8')
write(pathlib.Path(r'E:\SystemFiles\Desktop\Narro-Evidence-Tools\ready.json'),{'packet':P.name,'message':'docs: publish CI953 live expiry break completion Windows capture'})
print(json.dumps({'durationSeconds':duration,'actions':len(rows),'files':len(manifest)+1,'preferencesRestored':True,'newCompletedWorkSeconds':[76,90,87],'breakSeconds':[41,300],'olderOwnedFixtureDeltaSeconds':51,'review':'44/100'}))
