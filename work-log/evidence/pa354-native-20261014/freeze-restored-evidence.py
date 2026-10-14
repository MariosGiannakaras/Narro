from pathlib import Path
import json,hashlib,shutil,sqlite3,datetime,subprocess,zipfile
r=Path(__file__).resolve().parent
p=r/'package';p.mkdir(exist_ok=True)
ledger=json.loads((r/'profile-protection-private.json').read_text())
assert ledger['state']=='ORIGINAL_PROFILES_RESTORED'
owned=Path(next(i['retainedPostfix'] for i in ledger['namespaces'] if i['kind']=='Roaming'))
assert json.loads((owned/'pa-owned-profile.json').read_text())['sessionRoot']==str(r)
backup=r/'private-owned-profile-after-capture.db'
with sqlite3.connect(owned/'narro.db') as src,sqlite3.connect(backup) as dst:src.backup(dst)
with sqlite3.connect(backup) as db:assert db.execute('pragma quick_check').fetchone()[0]=='ok'
for f in r.iterdir():
 if f.is_file() and f.name!='profile-protection-private.json' and (f.suffix in {'.jsonl','.png','.py'} or f.name.startswith('motion-') or f.name in {'session-meta.json','CAPTURE_ORDER.md','initial-uia.json','initial-window-facts.json','initial-windows.json','reports-setup-uia.json','setup-uia.json','original-profile-restoration-proof.json'}):shutil.copy2(f,p/f.name)
shutil.copytree(r/'observations',p/'observations',dirs_exist_ok=True)
shutil.copytree(r/'analysis/validation/Narro-M7-Logs',p/'Narro-M7-Logs',dirs_exist_ok=True)
for f in (r/'analysis').glob('pdf-page-*.png'):shutil.copy2(f,p/f.name)
for name in ['owned-overview-export.pdf','pdf-text.txt','native-review.json']:
 if (r/'analysis'/name).exists():shutil.copy2(r/'analysis'/name,p/name)
videos=[]
for f in sorted(r.glob('pa354*.mkv')):
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(f)]))
 (p/(f.name+'.ffprobe.json')).write_text(json.dumps(probe,indent=2)+'\n')
 parts=[]
 with f.open('rb') as src:
  while chunk:=src.read(40*1024*1024):
   part=p/(f.name+f'.part{len(parts)+1:02d}');part.write_bytes(chunk)
   parts.append({'name':part.name,'bytes':len(chunk),'sha256':hashlib.sha256(chunk).hexdigest()})
 videos.append({'name':f.name,'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'durationSeconds':float(probe['format']['duration']),'parts':parts})
(p/'video-manifest.json').write_text(json.dumps(videos,indent=2)+'\n')
(p/'README.md').write_text('''# PA354 exact Windows acquisition (4/4 groups attempted)

Source7647ffab / main73601944 / CI38614321520 / EXE205e0a42. Both physical displays4480x1080,60fps. Three full videos are split into ordered40MiB binary parts; concatenate each movie's parts in video-manifest order, then verify full SHA256. No footage omitted. Hard recording caps480/300/240s; later actions have UIA/screenshots and are not attributed to video.

Actions timestamps are UTC. Tool methods (UIA SetFocus, legacy keys, held SendInput scancodes, mouse) are explicit in action files/helper snapshots. Reports interactions attempted behind the still-open Preferences dialog are invalid; use the recovery/valid-LG observations. Acquisition counts are not PASS counts.

Original profile and motion restored; no Narro/recorder remains. Only synthetic test data appears here. Original personal DB/namespace ledger and owned private DB backup are excluded. Full seven-file Narro-M7-Logs included; this Reports-only run's C5 is INCONCLUSIVE, not a new C5 acceptance. PA05 real HDMI unplug/replug user-deferred NOT RUN. M10 remains blocked; no PA09/M11.
''')
with zipfile.ZipFile(p/'raw-observations.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(p.rglob('*')):
  if f.is_file() and f.suffix not in {'.zip','.png','.pdf'} and '.mkv.part' not in f.name:z.write(f,f.relative_to(p).as_posix())
manifest={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'profileState':ledger['state'],'sourceExeSha256':json.loads((r/'session-meta.json').read_text())['sha256'],'ownedDbBackupPrivate':True,'ownedDbBackupSha256':hashlib.sha256(backup.read_bytes()).hexdigest(),'files':{}}
for f in sorted(p.rglob('*')):
 if f.is_file():manifest['files'][f.relative_to(p).as_posix()]={'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
(p/'freeze-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'files':len(manifest['files']),'bytes':sum(f['bytes'] for f in manifest['files'].values()),'logs':sum(n.startswith('Narro-M7-Logs/') for n in manifest['files']),'videos':[{k:v[k] for k in ('name','durationSeconds','bytes')} for v in videos]}))
