from pathlib import Path
import json,sqlite3,hashlib,shutil,zipfile,subprocess,datetime
r=Path(__file__).resolve().parent;p=r/'package';p.mkdir(exist_ok=True)
l=json.loads((r/'profile-protection-private.json').read_text());assert l['state']=='ORIGINAL_PROFILES_RESTORED'
owned=Path(next(x['retainedPostfix'] for x in l['namespaces'] if x['kind']=='Roaming'));assert json.loads((owned/'pa-owned-profile.json').read_text())['sessionRoot']==str(r)
src=sqlite3.connect((owned/'narro.db').as_uri()+'?mode=ro',uri=True);backup=sqlite3.connect(r/'private-owned-final.db')
try:src.backup(backup);assert backup.execute('pragma quick_check').fetchone()[0]=='ok'
finally:src.close();backup.close()
for f in r.iterdir():
 if f.is_file() and f.suffix in ['.py','.json','.jsonl','.md','.png'] and 'private' not in f.name:shutil.copy2(f,p/f.name)
obs=p/'observations';obs.mkdir(exist_ok=True)
for f in (r/'observations').iterdir():
 if f.is_file() and f.name not in ['settings-home.json']:shutil.copy2(f,obs/f.name)
for folder in ['performance','performance-retry1','performance-obs-closed','performance-ci942-comparison']:shutil.copytree(r/folder,p/folder,dirs_exist_ok=True)
for name in ['current-meta.json','baseline-meta.json','baseline-launch.json','process-cpu-contributions.json']:
 if (r/'analysis'/name).exists():shutil.copy2(r/'analysis'/name,p/name)
shutil.copy2(r/'analysis/ci942-diagnostic.zip',p/'ci942-diagnostic.zip')
(p/'performance-first-attempt-invalid.txt').write_text('First performance/run-01 INVALID: process PID1260 disappeared while metrics were read; collector threw before summary/rawsample export. Only scenario-preflight was written. Original process/output is in tool transcript; no sample/CPU result is manufactured. Later current candidate3/3 with OBSpreview and3/3 OBSclosed, plus one historicalCI942 comparison, completed unchanged collectors.\n')
videos=[]
for i,name in enumerate(['2026-10-15 12-41-33.mkv','2026-10-15 12-45-20.mkv'],1):
 original=Path(r'E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-pr234-native-20261005\video')/name;target=p/f'pa06-os-segment-{i:02d}.mkv';shutil.copy2(original,target)
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(target)]));videos.append({'name':target.name,'original':str(original),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size,'probe':probe})
(p/'video-manifest.json').write_text(json.dumps(videos,indent=2))
oldlogs=Path(r'E:\SystemFiles\Desktop\Narro-PA356-native-20261015\analysis\validation\Narro-M7-Logs');shutil.copytree(oldlogs,p/'Narro-M7-Logs-inherited',dirs_exist_ok=True)
(p/'README.md').write_text('''# PA356 remaining native acquisition — raw freeze before aggregate review

CurrentCI38688646540 sourcef7456738: diagnostic11952771160/EXE73a78877, native runtime isolationPASS. Original providerZIP/receipt in pa356-performance-intake-20261015. Current three valid30warm/60sample runs OBSpreview and three valid OBSclosed, MainHWNDcount0/one visiblecompact340x110/idle/nochurn. One first-attempt INVALID childprocess disappearance retained as such. One historicalCI942 diagnostic11299363071/EXE89b2c7c6 executed only as same-machine comparison, not substituted for current acceptance. Exact raw samples/CPUintervals/scenario/hash/batch summaries and historicalproviderZIP included. CurrentOBSclosed medianonecore2.382%; historicalsameOS comparator2.765%; bounded interpretation is aggregate-review work, not inferredphysicalPASS.

PA06 OS acquisition3/3 attempted: actualWindows globalnotificationsOn, actualOff, exactOnrestoration; native diagnostic SendTestNotification with realUIA dispatch/visibleSubmitted text and actual persistedReminder508d127d-2b6d-4465-bee0-33cb522f9bba due2026-10-15 12:49 Europe/Athens; Settings foreground/backgroundwatch throughdue+35s. The two original wholeOBS4480x1080/60fps/AAC movies are retained with SHA/ffprobe. The first earlynamedclick hitOBS instead and is INVALID; use actual09:42:12 and09:43:05 probes, not labels alone. Second segment has recorder/setup prelude; real timedprobe09:47:17, foregroundSettings09:47:18, due09:49:00, stop09:49:34. Submitted=true does not proveWindowsvisualdelivery. Diagnosticidentifier differs frominstalledproduction; anynegative/permission result needs that scope distinction. No actuallistenerfailureinjected orphysicalPASSinvented. Inherited complete10file Narro-M7-Logs are provided separately and explicitly belong to earlier productionPA356, not these filename-disableddiagnostic sessions.

NormalQuit/restoration complete09:51; productionDB byte-identical13185e54..., originalWindowsnotificationsToggle1 restored, FocusAssistOff left unchanged, originaldualmonitor/DPI/topology unchanged. Originaldiagnosticnamespace restored to protectedpost-recovery snapshot. Setuphelperfailure/unintendeddiagnosticlaunch is transparently preserved in first-launch-recovery.json: originaldiagnosticDB logically restored from beforelaunchSQLitebackup, oldrawbyteidentity unavailable; productiondata neverchanged. Prior/unintendedownedDBs/privateledgers/WebViewprofiles notpublished. NoNarroproductsource/build/test/CI change in this acquisition. HDMIuser-deferredmanualNOTRUN, PA09/M11excluded/M10blocked. PriorPreferences/PDF2/2PASS retained; aggregate review/disposition next.
''',encoding='utf8')
with zipfile.ZipFile(p/'raw-observations.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(p.rglob('*')):
  if f.is_file() and f.suffix not in ['.png','.mkv','.zip'] and f.name!='freeze-manifest.json':z.write(f,f.relative_to(p).as_posix())
files={f.relative_to(p).as_posix():{'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in p.rglob('*') if f.is_file() and f.name!='freeze-manifest.json'}
(p/'freeze-manifest.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'profileState':l['state'],'files':files},indent=2))
w=Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload');shutil.copytree(p,w/'work-log/evidence/pa356-residual-native-20261015',dirs_exist_ok=True)
print(json.dumps({'files':len(files),'bytes':sum(x['bytes'] for x in files.values()),'videos':[{'name':v['name'],'seconds':v['probe']['format']['duration'],'sha256':v['sha256']} for v in videos]}))
