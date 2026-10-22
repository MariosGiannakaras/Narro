from pathlib import Path
import shutil,json,zipfile,sqlite3,hashlib,subprocess,datetime
r=Path(__file__).parent.resolve();parent=r.parent
roots=[parent/'Narro-PA356-notification-20261015',parent/'Narro-PA356-notification-banner-20261015',r]
out=r/'package-final';out.mkdir(exist_ok=True)
for source in roots:
    l=json.loads((source/'profile-protection-private.json').read_text());assert l['state']=='ORIGINAL_PROFILES_RESTORED'
    target=out/source.name;target.mkdir(exist_ok=True)
    for p in source.iterdir():
        if p.is_file() and not p.name.startswith('private') and p.name!='profile-protection-private.json' and p.suffix in ['.json','.jsonl','.py','.ps1']:
            shutil.copy2(p,target/p.name)
    with zipfile.ZipFile(target/'raw-observations.zip','w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted((source/'observations').rglob('*')):
            if p.is_file():z.write(p,p.relative_to(source))
    retained=Path(next(x['retainedPostfix'] for x in l['namespaces'] if x['kind']=='Roaming'))
    assert json.loads((retained/'pa-owned-profile.json').read_text())['sessionRoot']==str(source)
    d=sqlite3.connect((retained/'narro.db').as_uri()+'?mode=ro',uri=True);d.row_factory=sqlite3.Row
    rows=[];plan=json.loads((source/'probe-plan.json').read_text())
    for p in plan['probes']:
        row=dict(d.execute('select * from reminders where id=?',(p['reminderId'],)).fetchone());rows.append({'plan':p,'persistedReminder':row})
    assert d.execute('pragma quick_check').fetchone()[0]=='ok';d.close()
    (target/'reminder-delivery.json').write_text(json.dumps(rows,indent=2),encoding='utf8')
# Full filename-gated logger folder includes current and inherited sessions.
logs=parent/'Narro-PA356-native-20261015/analysis/validation/Narro-M7-Logs'
shutil.copytree(logs,out/'Narro-M7-Logs',dirs_exist_ok=True)
with zipfile.ZipFile(out/'Narro-M7-Logs-original-bytes.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(logs.rglob('*')):
        if p.is_file():z.write(p,Path('Narro-M7-Logs')/p.relative_to(logs))
video=parent/'NarroUpload/artifacts/m7-pr234-native-20261005/video'
original=video/'2026-10-15 13-19-08.mkv'
prefix=out/'foreground-and-repeated-foreground-complete-active-interval.mkv'
subprocess.run(['ffmpeg','-v','error','-i',str(original),'-t','245','-map','0','-c','copy','-y',str(prefix)],check=True)
movies=[(original,prefix,'First245s includes all two scheduled observations; both were actually foreground. The second label does not establish background. Remaining interruption/idle tail is excluded from acceptance and retained locally.'),
        (video/'2026-10-15 20-04-49.mkv',out/'background-setup-invalid.mkv','Complete failed setup; strict Settings-foreground precondition failed, not a product FAIL.'),
        (video/'2026-10-15 20-06-32.mkv',out/'background-complete.mkv','Complete actual minimized-Narro background run including real deadline, auto recorder stop.')]
receipts=[]
for origin,published,note in movies:
    if origin!=original:shutil.copy2(origin,published)
    data=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(published)],text=True))
    receipts.append({'origin':str(origin),'originBytes':origin.stat().st_size,'originSha256':hashlib.sha256(origin.read_bytes()).hexdigest(),'published':published.name,'publishedBytes':published.stat().st_size,'publishedSha256':hashlib.sha256(published.read_bytes()).hexdigest(),'scope':note,'ffprobe':data})
(out/'video-receipts.json').write_text(json.dumps(receipts,indent=2),encoding='utf8')
# Publish only the Narro synthetic acceptance records from the read-only OS history.
history=json.loads((roots[0]/'notification-history.json').read_text(encoding='utf-8-sig'))
(out/'os-history-pa356-only.json').write_text(json.dumps([x for x in history if 'PA356 OS' in x['Xml']],indent=2),encoding='utf8')
manifest=[]
for p in sorted(out.rglob('*')):
    if p.is_file():manifest.append({'path':p.relative_to(out).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(out/'MANIFEST.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
repo=Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload');dest=repo/'work-log/evidence/pa356-notification-final-20261015'
shutil.copytree(out,dest,dirs_exist_ok=True)
print(json.dumps({'files':len(manifest),'bytes':sum(x['bytes'] for x in manifest),'logFiles':len([p for p in logs.rglob('*') if p.is_file()]),'video':[{k:v for k,v in x.items() if k!='ffprobe'} for x in receipts]}))
