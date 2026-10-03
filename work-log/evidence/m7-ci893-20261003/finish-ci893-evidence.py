import os, pathlib, sqlite3, json, shutil, zipfile, hashlib, subprocess, datetime
root=pathlib.Path.cwd(); run=root/'artifacts/m7-ci893-physical-20261003/run-1947'; out=root/'work-log/evidence/m7-ci893-20261003'
ff=root/'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe'
starts=[('2026-10-03 19-45-50.mkv','2026-10-03T16:45:50.510+00:00'),('2026-10-03 19-53-25.mkv','2026-10-03T16:53:25.928+00:00'),('2026-10-03 21-46-42.mkv','2026-10-03T18:46:42.513+00:00'),('2026-10-03 21-56-52.mkv','2026-10-03T18:56:52.110+00:00')]
frames=out/'frames'; frames.mkdir(exist_ok=True)
items=[]
for name in ['main-planning','panel-initial','greek-quick-create','inline-notes-filled','notes-keyboard-tooltip','large-notes-panel','expanded-notes-125','expanded-large-notes-single','timer-after-drag-desktop','notepad-topmost','tray-quit-menu','c5-restored-desktop']:
 p=run/'observations'/f'{name}.png'; stamp=datetime.datetime.fromtimestamp(p.stat().st_mtime,datetime.timezone.utc)
 candidates=[(file,datetime.datetime.fromisoformat(t)) for file,t in starts if datetime.datetime.fromisoformat(t)<=stamp]
 file,start=candidates[-1]; sec=(stamp-start).total_seconds()
 target=frames/f'{name}.png'
 subprocess.run([str(ff),'-hide_banner','-v','error','-n','-ss',str(sec),'-i',str(run/'video'/file),'-frames:v','1',str(target)],check=True)
 items.append({'frame':target.name,'recording':file,'seconds':sec,'captureClockApproxUtc':stamp.isoformat(),'method':'native 4480x1080 video frame at observation timestamp; live screenshots used only to locate evidence'})
for name,file,seconds,crop in [('normal-compact-panel-boundary','2026-10-03 21-46-42.mkv',161.37,'crop=1920:1080:0:0'),('normal-collapse-boundary','2026-10-03 21-46-42.mkv',159.2,'crop=550:875:0:180'),('reduced-collapse-boundary','2026-10-03 21-46-42.mkv',272.35,'crop=550:875:0:180'),('normal-expand-dual-boundary','2026-10-03 19-53-25.mkv',461.95,'crop=550:700:1150:280')]:
 subprocess.run([str(ff),'-hide_banner','-v','error','-n','-ss',str(seconds),'-i',str(run/'video'/file),'-vf',crop,'-frames:v','1',str(frames/f'{name}.png')],check=True)
 items.append({'frame':name+'.png','recording':file,'seconds':seconds,'crop':crop,'method':'native scale video-derived detail; crop coordinates in OBS canvas'})
(out/'frame-index.json').write_text(json.dumps(items,indent=2)+'\n',encoding='utf8')
db=pathlib.Path(os.environ['APPDATA'])/'com.mariosg.Narro/narro.db'; c=sqlite3.connect(db.as_uri()+'?mode=ro',uri=True);c.row_factory=sqlite3.Row
task=c.execute('SELECT id,title,manual_time_adjustment_seconds,completed_at FROM tasks WHERE title=?',('M7 CI893 full UI validation — long task title for Timer and Notes overflow',)).fetchone()
sessions=[dict(x) for x in c.execute('SELECT id,kind,started_at,ended_at,duration_seconds,source FROM sessions WHERE task_id=? ORDER BY started_at',(task['id'],))]
seconds=sum(x['duration_seconds'] for x in sessions if x['kind']=='work')+task['manual_time_adjustment_seconds']
original=[dict(x) for x in c.execute("SELECT id,title,manual_time_adjustment_seconds,completed_at FROM tasks WHERE title LIKE '%M7 C5%'")]
result={'readOnly':True,'task':dict(task),'sessions':sessions,'persistedWorkSeconds':seconds,'matchesRestored08_11':seconds==491,'originalC5Tasks':original,'note':'Paused restore observed after tray Quit; app downtime excluded. This task is not completed yet.'}; c.close()
(out/'task-ledger.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
obs=pathlib.Path(os.environ['APPDATA'])/'obs-studio/logs/2026-10-03 19-45-48.txt';shutil.copy2(obs,out/'obs-session.log')
with zipfile.ZipFile(out/'Narro-M7-Logs.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted((out/'Narro-M7-Logs').rglob('*')):
  if p.is_file():z.write(p,str(p.relative_to(out)))
for name in ['publish-ci893-physical.mjs','finish-ci893-evidence.py','extract-ci893-motion.mjs','measure-ci893-floating.ps1']:
 shutil.copy2(root/'artifacts/ui-validation-tools'/name,out/name)
manifest=[]
for p in sorted(out.rglob('*')):
 if p.is_file() and p.name!='manifest.json':manifest.append({'file':p.relative_to(out).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
print(json.dumps({'publishedFiles':len(manifest),'bytes':sum(x['bytes'] for x in manifest),'taskLedger':result},ensure_ascii=False))
