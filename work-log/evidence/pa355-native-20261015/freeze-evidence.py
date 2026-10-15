from pathlib import Path
import json,sqlite3,hashlib,shutil,zipfile,datetime,subprocess
r=Path(__file__).resolve().parent;p=r/'package';p.mkdir(exist_ok=True)
l=json.loads((r/'profile-protection-private.json').read_text());assert l['state']=='ORIGINAL_PROFILES_RESTORED'
owned=Path(next(x['retainedPostfix'] for x in l['namespaces'] if x['kind']=='Roaming'))
assert json.loads((owned/'pa-owned-profile.json').read_text())['sessionRoot']==str(r)
backup=r/'private-owned-after-capture.db'
with sqlite3.connect(owned/'narro.db') as s,sqlite3.connect(backup) as b:s.backup(b);assert b.execute('pragma quick_check').fetchone()[0]=='ok'
for f in r.iterdir():
 if f.is_file() and 'private' not in f.name and f.suffix in {'.json','.jsonl','.png','.py','.md'}:shutil.copy2(f,p/f.name)
shutil.copytree(r/'observations',p/'observations',dirs_exist_ok=True)
shutil.copytree(r/'analysis/validation/Narro-M7-Logs',p/'Narro-M7-Logs',dirs_exist_ok=True)
for f in (r/'analysis').glob('owned-*.pdf'):shutil.copy2(f,p/f.name)
f=r/'pa355-native.mkv';probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(f)]))
(p/'video.ffprobe.json').write_text(json.dumps(probe,indent=2)+'\n')
parts=[]
with f.open('rb') as s:
 while chunk:=s.read(40*1024*1024):
  part=p/(f.name+f'.part{len(parts)+1:02d}');part.write_bytes(chunk);parts.append({'name':part.name,'bytes':len(chunk),'sha256':hashlib.sha256(chunk).hexdigest()})
(p/'video-manifest.json').write_text(json.dumps({'name':f.name,'bytes':f.stat().st_size,'durationSeconds':float(probe['format']['duration']),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'parts':parts},indent=2)+'\n')
(p/'README.md').write_text('''# PA355 continuous exact Windows acquisition

Source7b54e62f / CI38630226135 / main dbc3f6f2 / EXEd772edbf. Acquisition3/3 groups completed; acceptance pending aggregate review. One full914.034s dual-display4480x1080/60fps movie, no intentional cut/gap, four ordered40MiB binary parts. Concatenate in manifest order and verify full SHA256. UTC action journals plus approximate process-start/video correlation in capture-meta.

All observations/helper snapshots, screenshots, three actual owned PDF exports and complete seven-file Narro-M7-Logs are included. Personal original DB/profile ledger and private owned DB backups are excluded. Normal trayQuit04:47:24.938 UTC; originals/motion/topology restored, originalDB SHA identical, no Narro/recorder. This Reports-only C5 result is INCONCLUSIVE, not a newC5 failure or PASS.

Factual possible defect: Preferences remains open on Escape after theme save/focus loss; primary picker/Overview attempts behind it are INVALID. Only explicitly named valid/recovery observations count. Whole raw recording retains those attempts and recovery. Phase2 must distinguish captured scope, PASS/FAIL/UNCERTAIN/NOTRUN, and reuse only sufficiently exercised M1–M9 gates. Actual Windows default NitroPDF viewer opened PDF1, NextPage twice and normal close; no reader settings changed. No source changes during acquisition. HDMI unplug/replug remains user-deferred manualNOTRUN; M10 blocked, PA09/M11 excluded.
''',encoding='utf-8')
with zipfile.ZipFile(p/'raw-observations.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(p.rglob('*')):
  if f.is_file() and f.suffix not in {'.png','.pdf','.zip'} and '.mkv.part' not in f.name and f.name!='freeze-manifest.json':z.write(f,f.relative_to(p).as_posix())
files={f.relative_to(p).as_posix():{'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in sorted(p.rglob('*')) if f.is_file() and f.name!='freeze-manifest.json'}
(p/'freeze-manifest.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'profileState':l['state'],'ownedDbPrivate':True,'ownedDbSha256':hashlib.sha256(backup.read_bytes()).hexdigest(),'files':files},indent=2)+'\n')
print(json.dumps({'files':len(files),'bytes':sum(x['bytes'] for x in files.values()),'logs':sum(n.startswith('Narro-M7-Logs/') for n in files),'videoSeconds':float(probe['format']['duration'])}))
