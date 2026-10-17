from pathlib import Path
import subprocess,json,hashlib,datetime,shutil,zipfile
r=Path.cwd();out=r/'frozen';assert json.loads((r/'profile-protection-private.json').read_text())['state']=='ORIGINAL_PROFILES_RESTORED'
ff=Path(r'E:\SystemFiles\Desktop\NarroUpload\artifacts\ui-validation-tools\ffmpeg-portable\ffmpeg-9.0.2-essentials_build\bin');first=r/'video-originals/2026-10-17 05-52-27.mkv';last=r/'video-originals/2026-10-17 10-01-01.mkv'
def digest(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(8*1024*1024),b''):h.update(b)
 return h.hexdigest()
def probe(p):return json.loads(subprocess.check_output([str(ff/'ffprobe.exe'),'-v','error','-show_entries','format=duration,size:stream=codec_name,width,height,r_frame_rate','-of','json',str(p)]))
clip=out/'video/segment1-actions-170s.mkv'
if not clip.exists():subprocess.run([str(ff/'ffmpeg.exe'),'-nostdin','-hide_banner','-loglevel','error','-i',str(first),'-t','170','-map','0','-c','copy',str(clip)],check=True)
actions=[json.loads(x) for x in (r/'native-actions.jsonl').read_text().splitlines()];obs=[json.loads(x) for x in (r/'obs-actions.jsonl').read_text().splitlines()];starts=[x for x in obs if x['action']=='Start Recording'];assert len(starts)==2 and obs[-1]['action']=='Stop Recording'
meta=json.loads((r/'session-meta.json').read_text());meta.update(acquisition='4/4',phase='FROZEN',recordingCurrentlyActive=False,personalProfilesRestored=True,analysis='NOT RUN / latest user capture-only instruction');(r/'session-meta.json').write_text(json.dumps(meta,indent=2),encoding='utf-8');shutil.copy2(r/'session-meta.json',out/'session-meta.json')
manifest=[]
for a in actions:
 segment=1 if a['utc']<'2026-10-17T07:00:00' else 2
 t0=datetime.datetime.fromisoformat(starts[segment-1]['utc']);t=datetime.datetime.fromisoformat(a['utc']);manifest.append({'utc':a['utc'],'segment':segment,'approxSecondsAfterOBSStart':round((t-t0).total_seconds(),3),'label':a['label'],'command':a['command']})
(out/'chronological-manifest.json').write_text(json.dumps({'alignment':'UTC actions authoritative; video offsets approximately OBS-start aligned, allow recorder startup difference. Last old actual input C2-035 at02:55:00.963561Z; no input after that until07:01:02Z. User stopped the old recording; exact stop time unobserved.','actions':manifest},indent=2),encoding='utf-8')
(out/'acquisition-results.json').write_text(json.dumps({'phase':'FROZEN_CAPTURE_ONLY','acquired':'4/4','review':'NOT RUN','groups':{'C4':'Darkcustom111111 applied by outside click, Save/reopen/Cancel; Home and archived color visible.','C2':'Two populated archived cards, dark/light rest/hover/keyboard, DeleteForever confirmation Cancel, actual Unarchive/rearchive, narrow900x1000.','C1':'Singular then complete WeekA to plural Done; light/dark wide/narrow900x1000.','C3':'Actual UpdateRecurring menu→editor→Cancel; RemoveRecurring; Oct12child→TomorrowOct18 and Oct13child→NextweekOct24; finalThisWeek/Backlogscheduledheaders captured.'},'conditional125DPI':'NOT RUN: actualoneprimary96DPI, no topologychange','noNewPassFail':'Acquisition complete is not acceptance; no substantive frame/motion/source analysis or Narro changes after latest user instruction.','originalProfilesRestored':True},indent=2),encoding='utf-8')
before=json.loads((r/'session-evidence-matrix-before.json').read_text());before.update(phase='FROZEN_CAPTURE_ONLY',acquisition='4/4',review='NOT RUN; retain every independently ungraded gate open',actualSource=meta['head'],exeSha256=meta['sha256'],evidence='chronological-manifest.json and acquisition-results.json; currentTODO/HANDOFF/crosswalk hashes in before-matrix; no extra milestone acceptance from appearing surfaces');(out/'session-evidence-matrix-after.json').write_text(json.dumps(before,indent=2),encoding='utf-8')
for p in r.glob('*.py'):shutil.copy2(p,out/p.name)
record={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':meta['head'],'ci':meta['ci'],'exeSha256':meta['sha256'],'acquisition':'4/4; REVIEW NOT RUN','originalSegment1':{'path':str(first),'sha256':digest(first),'bytes':first.stat().st_size,'probe':probe(first),'publishedExcerptSeconds':170,'method':'lossless stream copy, all observed actions plus tail margin; original retained unmodified locally','lastActualInputUtc':'2026-10-17T02:55:00.963561+00:00','stop':'User stopped; exact stop unobserved; long idle tail excluded explicitly'},'segment2':{'path':last.name,'complete':True,'probe':probe(last),'obsStart':starts[-1],'obsStop':obs[-1]},'exclusions':'Personal or owned DB/cache, protection ledger/backups, private journal-recovery clone, downloaded executableZIP, unrelated first-video idle tail. Entire Narro-M7-Logs included.'}
record['files']=[{'path':p.relative_to(out).as_posix(),'bytes':p.stat().st_size,'sha256':digest(p)} for p in sorted(out.rglob('*')) if p.is_file() and p.name not in ['freeze-manifest.json','raw-structured-evidence.zip']]
(out/'freeze-manifest.json').write_text(json.dumps(record,indent=2),encoding='utf-8')
with zipfile.ZipFile(out/'raw-structured-evidence.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(out.rglob('*')):
  if p.is_file() and p.suffix not in ['.png','.mkv'] and p.name!='raw-structured-evidence.zip':z.write(p,p.relative_to(out).as_posix())
print(json.dumps({'pngs':len(list(out.glob('*.png'))),'logFiles':len([p for p in (out/'Narro-M7-Logs').rglob('*') if p.is_file()]),'segment1FullSeconds':record['originalSegment1']['probe']['format']['duration'],'segment1PublishedSeconds':probe(clip)['format']['duration'],'segment2FullSeconds':record['segment2']['probe']['format']['duration'],'videoBytes':sum(p.stat().st_size for p in (out/'video').glob('*.mkv')),'review':'NOT RUN'}))
