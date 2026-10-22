from pathlib import Path
import json, shutil, hashlib, sqlite3, zipfile, subprocess
r=Path(__file__).parent.resolve();out=r/'package';out.mkdir(exist_ok=True)
ledger=json.loads((r/'profile-protection-private.json').read_text());assert ledger['state']=='ORIGINAL_PROFILES_RESTORED'
for p in r.iterdir():
    if p.is_file() and not p.name.startswith('private') and p.suffix in ['.py','.json','.jsonl'] and p.name not in ['profile-protection-private.json']:
        shutil.copy2(p,out/p.name)
with zipfile.ZipFile(out/'raw-observations.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted((r/'observations').rglob('*')):
        if p.is_file():z.write(p,p.relative_to(r))
owned=Path(next(x['retainedPostfix'] for x in ledger['namespaces'] if x['kind']=='Roaming'))
assert json.loads((owned/'pa-owned-profile.json').read_text())['sessionRoot']==str(r)
for log in owned.rglob('Narro-M7-Logs'):
    shutil.copytree(log,out/'Narro-M7-Logs',dirs_exist_ok=True)
src=sqlite3.connect((owned/'narro.db').as_uri()+'?mode=ro',uri=True);dst=sqlite3.connect(r/'private-owned-final.db');src.backup(dst);dst.close();src.close()
d=sqlite3.connect(r/'private-owned-final.db');d.row_factory=sqlite3.Row
plan=json.loads((r/'probe-plan.json').read_text());rows=[]
for p in plan['probes']:
    row=dict(d.execute('select * from reminders where id=?',(p['reminderId'],)).fetchone());rows.append({'plan':p,'persistedReminder':row})
d.close();(out/'reminder-delivery.json').write_text(json.dumps(rows,indent=2),encoding='utf8')
video=Path(r'E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-pr234-native-20261005\video')
matches=[p for p in video.glob('*.mkv') if p.name.startswith('2026-10-15 13-08-5')]
assert len(matches)==1, [x.name for x in matches]
movie=matches[0];shutil.copy2(movie,out/'pa06-production.mkv')
probe=subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)],text=True)
(out/'video-receipt.json').write_text(json.dumps({'origin':str(movie),'sha256':hashlib.sha256(movie.read_bytes()).hexdigest(),'ffprobe':json.loads(probe)},indent=2),encoding='utf8')
manifest=[]
for p in sorted(out.rglob('*')):
    if p.is_file():manifest.append({'path':p.relative_to(out).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(out/'MANIFEST.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
repo=Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload');dest=repo/'work-log/evidence/pa356-production-notification-20261015'
shutil.copytree(out,dest,dirs_exist_ok=True)
print(json.dumps({'files':len(manifest),'bytes':sum(x['bytes'] for x in manifest),'movie':str(movie),'reminders':rows}))
