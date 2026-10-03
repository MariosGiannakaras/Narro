import pathlib, os, json, hashlib, shutil, subprocess, sqlite3, zipfile, datetime
root=pathlib.Path.cwd(); run=root/'artifacts/m7-ci893-physical-20261003/run-1947'
out=root/'work-log/evidence/m7-ci893-followup-20261003'; out.mkdir(parents=True,exist_ok=True)
bin=root/'artifacts/ui-validation-tools/ffmpeg-portable/ffmpeg-9.0.2-essentials_build/bin'
raw=run/'video/2026-10-03 22-40-37.mkv'; video=out/'video'; video.mkdir(exist_ok=True)
def command(exe,args): return subprocess.check_output([str(bin/(exe+'.exe')),*args])
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def probe(p): return json.loads(command('ffprobe',['-v','error','-count_packets','-show_entries','format=duration,size:stream=index,codec_name,codec_type,width,height,r_frame_rate,nb_read_packets','-of','json',str(p)]))
command('ffmpeg',['-hide_banner','-v','error','-n','-i',str(raw),'-map','0','-c','copy','-f','segment','-segment_time','360','-reset_timestamps','1','-segment_format','mp4','-segment_format_options','movflags=+faststart','-segment_list',str(video/'segments.csv'),str(video/'part-%03d.mp4')])
original=probe(raw); parts=[{'file':p.relative_to(out).as_posix(),'sha256':sha(p),'probe':probe(p)} for p in sorted(video.glob('*.mp4'))]
for s in original['streams']:
 assert sum(int(next(t['nb_read_packets'] for t in p['probe']['streams'] if t['index']==s['index'])) for p in parts)==int(s['nb_read_packets'])
(out/'video-provenance.json').write_text(json.dumps({'rawFile':raw.name,'rawSha256':sha(raw),'rawProbe':original,'parts':parts,'allStreamPacketCountsPreserved':True,'startUtc':'2026-10-03T19:40:37.631Z','method':'full all-stream packet-preserving remux; idle intervals retained'},indent=2)+'\n')
frames=out/'frames';frames.mkdir(exist_ok=True)
start=datetime.datetime.fromisoformat('2026-10-03T19:40:37.631+00:00'); index=[]
for name,utc,crop in [
 ('created-companion','2026-10-03T19:51:58.5+00:00','crop=425:875:1495:0'),
 ('english-break-compact','2026-10-03T19:52:26.5+00:00','crop=425:138:800:649'),
 ('greek-break-expanded','2026-10-03T19:53:29.5+00:00','crop=425:375:800:649'),
 ('greek-done-auto-next','2026-10-03T19:54:01.7+00:00','crop=425:875:1495:0'),
 ('greek-skip-companion','2026-10-03T19:55:01.5+00:00','crop=425:875:1495:0'),
 ('success-screen','2026-10-03T20:00:23.0+00:00','crop=425:875:1495:0'),
 ('success-tab-close','2026-10-03T20:00:43.6+00:00','crop=425:875:1495:0'),
 ('success-tab-wrapped','2026-10-03T20:00:59.0+00:00','crop=425:875:1495:0')]:
 seconds=(datetime.datetime.fromisoformat(utc)-start).total_seconds()
 command('ffmpeg',['-hide_banner','-v','error','-n','-ss',str(seconds),'-i',str(raw),'-vf',crop,'-frames:v','1',str(frames/(name+'.png'))])
 index.append({'file':name+'.png','rawRecording':raw.name,'seconds':seconds,'crop':crop,'method':'native scale OBS video frame'})
(out/'frame-index.json').write_text(json.dumps(index,indent=2)+'\n')
observations=out/'observations';observations.mkdir(exist_ok=True)
for p in (run/'observations').glob('followup-*.json'):shutil.copy2(p,observations/p.name)
for name in ['actions.jsonl','followup-recorder-actions.jsonl']:
 if (run/name).exists():shutil.copy2(run/name,out/name)
shutil.copytree(root/'artifacts/m7-pr222-ci893/candidate/Narro-M7-Logs',out/'Narro-M7-Logs')
with zipfile.ZipFile(out/'Narro-M7-Logs.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted((out/'Narro-M7-Logs').rglob('*')):
  if p.is_file():z.write(p,p.relative_to(out).as_posix())
shutil.copy2(pathlib.Path(os.environ['APPDATA'])/'obs-studio/logs/2026-10-03 19-45-48.txt',out/'obs-session.log')
db=pathlib.Path(os.environ['APPDATA'])/'com.mariosg.Narro/narro.db'; c=sqlite3.connect(db.as_uri()+'?mode=ro',uri=True);c.row_factory=sqlite3.Row
tasks=[]
for task in c.execute("SELECT id,title,manual_time_adjustment_seconds,completed_at FROM tasks WHERE title LIKE 'M7 CI893%' OR title='M7 C5 CI873 validation'"):
 sessions=[dict(s) for s in c.execute('SELECT id,kind,started_at,ended_at,duration_seconds,source FROM sessions WHERE task_id=? ORDER BY started_at',(task['id'],))]
 tasks.append({'task':dict(task),'sessions':sessions,'workSeconds':sum(s['duration_seconds'] for s in sessions if s['kind']=='work')+task['manual_time_adjustment_seconds']})
c.close()
(out/'task-ledger.json').write_text(json.dumps({'readOnly':True,'tasks':tasks,'note':'Follow-up completed dedicated CI893 task and companion. Original C5 test task briefly auto-started after success-disabled Done and accumulated 43 seconds before pause/Skip; historical C5 evidence is unchanged.'},ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(out/'.gitattributes').write_text('* -text\n');shutil.copy2(pathlib.Path(__file__),out/pathlib.Path(__file__).name)
manifest=[{'file':p.relative_to(out).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(out.rglob('*')) if p.is_file() and p.name!='manifest.json']
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'files':len(manifest),'parts':len(parts),'allStreamPacketCountsPreserved':True,'tasks':[(t['task']['title'],t['workSeconds'],t['task']['completed_at']) for t in tasks]},ensure_ascii=False))
