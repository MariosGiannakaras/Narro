import pathlib,json,hashlib,shutil,subprocess,zipfile,os,csv
from datetime import datetime,timezone
ROOT=pathlib.Path(r'E:\SystemFiles\Desktop\NarroUpload');MAIN=pathlib.Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload');P=ROOT/'artifacts/m7-ci953-success125-20261005';D=MAIN/'work-log/evidence'/P.name;S=ROOT/'artifacts/m7-pr234-native-20261005/video/2026-10-05 17-23-36.mkv';T=ROOT/'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def sha(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
assert not D.exists()
probe=json.loads(subprocess.check_output([str(T/'ffprobe.exe'),'-v','error','-show_format','-show_streams','-of','json',str(S)]));duration=float(probe['format']['duration']);assert duration>360 and probe['streams'][0]['width']==4480;write(P/'inventory/recording-ffprobe.json',probe)
obs=max((pathlib.Path(os.environ['APPDATA'])/'obs-studio/logs').glob('*'),key=lambda p:p.stat().st_mtime);assert "17-23-36.mkv' stopped" in obs.read_text(encoding='utf-8-sig');shutil.copy2(obs,P/'inventory/obs-recording-log.txt')
shutil.copy2(S,P/'video'/S.name);assert S.stat().st_size<100_000_000
subprocess.run([str(T/'ffmpeg.exe'),'-v','error','-y','-i',str(S),'-map','0','-c','copy','-movflags','+faststart',str(P/'video/success125-full.mp4')],check=True)
subprocess.run([str(T/'ffmpeg.exe'),'-v','error','-y','-ss','288','-i',str(S),'-frames:v','1',str(P/'inventory/health-frame-288.png')],check=True)
b=read(P/'inventory/ledger-before.json');a=read(P/'inventory/ledger-after.json');assert b['preferences']['payload']==a['preferences']['payload'];bd={t['task']['id']:t for t in b['tasks']};ad={t['task']['id']:t for t in a['tasks']};original='95a2466c-a06c-4a41-a2b4-3d1e65b9fa08'
assert len(ad)-len(bd)==2 and all(ad[k]==bd[k] for k in bd if k!=original);assert bd[original]['closedWorkSeconds']==ad[original]['closedWorkSeconds']==846
new=[t for k,t in ad.items() if k not in bd];assert all(t['task']['completed_at'] and t['closedWorkSeconds']>0 for t in new)
state=json.loads(a['checkpoint']['payload_json'])['state'];assert state['task_id']==original and state['phase']=='paused'
modalBefore=read(P/'inventory/ledger-E-completed-fun.json');modalAfter=read(P/'inventory/ledger-success-modal-keys.json');assert modalBefore['tasks']==modalAfter['tasks'] and modalBefore['checkpoint']==modalAfter['checkpoint']
assert modalBefore['preferences']['payload']['celebration']['fun_gif'] and modalBefore['preferences']['payload']['celebration']['show_success_screen']
write(P/'inventory/ledger-verification.json',{'newCompletedOwnedTasks':new,'existingOwnedTaskRecordsExactlySameExceptOriginalSessionLifecycle':True,'originalTakenBeforeAfter':[846,846],'originalSessionBefore':b['checkpoint'],'originalNewPausedCheckpoint':a['checkpoint'],'preferencePayloadRestored':True,'modalLocalBPNTasksCheckpointUnchanged':True,'earlierC5IncidentalDelta51sNotChangedInThisSession':True,'noFixtureDeletionClockManipulationOrWholeDatabaseExport':True})
geometry=[]
for name in ['11-D-success125-reduced.json','20-E-success125-normal-fun.json']:
 d=read(P/'observations'/name);w=next(w for w in d['windows'] if w['hwnd']==7471826);assert w['dpi']==120 and w['outer']=={'x':-425,'y':0,'width':425,'height':875}
 buttons=[e for e in d['elements'] if e['type']=='ControlType.Button'];assert not next(e for e in buttons if e['name']=='Take a Break')['enabled'];geometry.append({'probe':name,'dpi':120,'outer':w['outer'],'sameHwnd':7471826,'nativeGeometry':'SCOPED_PASS','sourceMotionAcceptance':'OPEN','takeBreakEnabled':False})
assert not any(e['name']=='Well done!' for e in read(P/'observations/13-D-success-escape.json')['elements'])
write(P/'inventory/success125-verification.json',{'cases':geometry,'actualEscapeClosesD':True,'TabAndShiftTabExercised':True,'funGifFlagTrueDuringE':True,'animationEffectNotEstablishedByStaticProvider':True})
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
 w=csv.writer(f);w.writerow(['utc','original_seconds','action','target','raw_input'])
 for r in rows:w.writerow([r['utc'],r['originalApproxSeconds'],r.get('action'),r.get('button',r.get('name',r.get('chord',''))),r['evidenceInput']])
progress=read(MAIN/'work-log/evidence/m7-ci953-live-20261005/visual-progress.json');progress['supplementalSuccess125Capture']={'packet':P.name,'newReviewCells':0,'visualReviewedDelta':0};write(P/'visual-progress.json',progress)
write(P/'provenance.json',{'source':'38219e200fe3bec7309f8e03e72003184ca86d08','ci':953,'runId':37258629373,'artifactId':11324640580,'exeSha256':'bde7646d9a3f17af0078c41e8a90173bc044f6747d24fde278e6f5739ebe05d8','runtimePid':141908,'focusHwnd':7471826,'mainHwnd':3213706,'durationSeconds':duration,'canvas':'4480x1080/60fps','actions':len(rows),'offsetAnchorUtc':anchor.isoformat(),'offsetUncertaintySeconds':1,'obsStoppedVerified':True,'noAppSourceChangeTestBuildCiOrMerge':True,'monitorPreferenceTemporarilyLG125RestoredAuto':True,'windowsPrimaryDisplayUnchanged':True,'wipBackupHead':'842c162f7c1922734a10a38a3754da7fdb34a5ab'})
matrix=[('M1','Native125%context/sameHWND; Windowsprimaryunchanged, no quietperformance/topologyfailure/sleep proof;27 staysFAIL.'),('M2','Two new retained completed D/E identities, existing owned tasks unchanged except originalsession lifecycle.'),('M3','Nonzero D/E live work/completion ledger preserved; original846 restoredpaused/newsession; no broadfullacceptance.'),('M4','No scheduling exercise.'),('M5','Actual owned Main D/E create1mEST and completedrows captured; source/motionOPEN.'),('M6','Owned selectedlist returnsallfivecompleted/emptylive; source/canonicalOPEN.'),('M7','SCOPED_NATIVE_GEOMETRY_PASS success125 normal/reduced425x875(-425,0); actualEscapeclosesD/CloseE. TakeBreak37disabled; C4/source/motionOPEN.'),('M8','Actual selectedLGmonitor/showSuccess/FunGIF roundtrip and payloadrestoration; localmodalBPN leavescheckpoint/tasksunchanged. Source/animationOPEN.'),('M9','No new Reports/exports; owned sessiondata only.')]
write(P/'session-m1-m9-matrix.json',[{'milestone':m,'disposition':note,'evidence':'chronological-actions.csv; observations; inventory/ledger-verification.json'} for m,note in matrix])
final=next(w for w in read(P/'observations/25-final-compact.json')['windows'] if w['hwnd']==7471826)
section=f'''## Current — CI953 real125% success capture; visual review44/100

[Whole {duration:.3f}s original MKV/MP4, images, whole logs/ZIP and actions](work-log/evidence/{P.name}/README.md). Explicit Narro LGmonitor selection, no Windowsprimarychange. Actual reducedD and normalE success from expandedTimer bothnativeDPI120/425x875(-425,0), sameFocus7471826: scopednativegeometryPASS only, source/motionOPEN. LongunbrokenD and GreekE titles captured. ActualTab/ShiftTab/Escape closesD; focusedClose+localB/P/N onEsuccess leavesownedtask/checkpointexactlyunchanged; actualCloseE. FunGIFenabledE but effectiveanimateddecoration remainsunproven;37TakeBreakdisabled. Ownedlistallfivecompleted/emptylivecaptured. NoNextTaskrepeat, newolderC5delta or ordinaryusertaskchange.

**Visual review44/100,56OPEN unchanged:** M1 1/1examinedFAIL27; M5 12/25; M6 16/31; M7 13/29; M8 2/8; M9 0/6. No newreviewdenominator/milestoneacceptance. D/E are new retained completed ownedfixtures with nonzero{sorted(t['closedWorkSeconds'] for t in new)}swork. Existingownedrecords identical except original95a sessionlifecycle; original846s preserved, newpausedsession{a['checkpoint']['session_id']}/{state['total_work_ms']}ms. PreviousA/B/C76/90/87work,341break and oldC5+51 delta unchanged. Preferencepayloadrestoredauto/nullmonitor,right/light,showSuccessfalse/FunGIFfalse/defaultBreak10; updatedAtlegitimatelychanged. Normalmotionrestored.

Final sameCI953/38219e20/bde7646d, runtime141908/Main3213706/Focus7471826, original95apaused, compact{final['outer']} atDPI{final['dpi']}, MainPreferences, bothdisplaysactive. OBSstopped/flushed. Whole11logs are livebounded snapshot/historicalC5PASS notrerun. Earlier35expandedTimeUp observedFAIL,36selectionreset/NextTask REVIEW_PENDING,37disabledTakeBreak remainOPEN;07/23/27/C4/sourceOPEN. M10blocked/M11dormant. Temporary250msexpandprovider guard rejectedmissingReturn beforeinput, freshprobe recovered; noappfailureinferred.

**Continuation:** true125%successnormal/reduced acquisition is nowclosed; do notrepeatit solelybecausecanonical/motionanalysisispending. Review56registeredpendingcells plus35–37/supplementalGIF/title/keyboard states fromwhole recordings. Remainingdistinctphysicalrequirements should be selected fromcurrentTODO/crosswalk: quietperformance asaseparate nonrecordingprotocol; actualsleep/wake/topology whereavailable; remainingPreferences/shortcut/notificationmatrix ifalreadyimplemented. SuccessTakeBreak cannot beacceptedasPASSwhilecontrolisdisabled. Captureonly; existingWIPsourceandtoolsbackeduponbranch842c162f; noNarrosourcefix/build/CI. Announceactualmilestonecompletion/allM1–M9acceptancebeforeM10.

'''
(P/'README.md').write_text('# CI953 real125% success normal/reduced Windows evidence\n\n'+section+'''
[Whole original MKV](video/2026-10-05%2017-23-36.mkv), [whole H264/AAC MP4](video/success125-full.mp4), [chronological CSV](chronological-actions.csv), [exact provenance](provenance.json), [nativegeometry/keyboardverification](inventory/success125-verification.json), [owneddata/prefsverification](inventory/ledger-verification.json), [M1–M9matrix](session-m1-m9-matrix.json), [wholelogsZIP](Narro-M7-Logs.zip), [SHAmanifest](sha256-manifest.json).

![Actual125%reduced success with longtitle](observations/navigation-D-success125.png)

![Actual125%normal success and enabledFunGIF preference](observations/navigation-E-success125.png)

These nativepixels confirm the navigation/state; they are not additional registeredreviewcells or fullmotion/canonicalPASS. Nativehost is425x875 insideLG1920x1080; no ordinaryHWND/WebViewreplacement. Source details/animations require the wholecapture. D/E creation and title/draft states are retained separately, normal/reduced differ in title/keyboardexercise rather than being an identical-fixturemotioncomparison. EFunGIFstate is true, but noaccessibleImage orobviousstaticdecoration establishes effectiveanimation. NoFunGIFfailureclaimsolelyfromstaticimage. PreviousTakeBreakdisabled is stillsufficientlyobservedOPEN.
''',encoding='utf-8');(P/'.gitattributes').write_text('* -text\n** -text\n',encoding='utf-8')
for rel in ['HANDOFF.md','TODO.md','STATUS.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']:shutil.copy2(MAIN/rel,P/'inventory'/('post-'+pathlib.Path(rel).name))
manifest=[{'path':f.relative_to(P).as_posix(),'bytes':f.stat().st_size,'sha256':sha(f)} for f in sorted(P.rglob('*')) if f.is_file() and f.name!='sha256-manifest.json'];write(P/'sha256-manifest.json',manifest);shutil.copytree(P,D)
for rel in ['HANDOFF.md','TODO.md','STATUS.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']:
 f=MAIN/rel;old=f.read_text(encoding='utf-8-sig');at=old.index('## Current — CI953 live/expiry/break/completion acquisition');body=section.replace('(work-log/','(../work-log/') if rel.startswith('docs/') else section;f.write_text(old[:at]+body+old[at:],encoding='utf-8')
write(pathlib.Path(r'E:\SystemFiles\Desktop\Narro-Evidence-Tools\ready.json'),{'packet':P.name,'message':'docs: publish CI953 true125 success and keyboard Windows capture'})
print(json.dumps({'durationSeconds':duration,'actions':len(rows),'files':len(manifest)+1,'newCompletedWorkSeconds':sorted(t['closedWorkSeconds'] for t in new),'nativeSuccessGeometryCases':2,'review':'44/100'}))

