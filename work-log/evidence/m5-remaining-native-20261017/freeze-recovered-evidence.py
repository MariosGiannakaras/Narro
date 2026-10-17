from pathlib import Path
import json,shutil,hashlib,datetime,zipfile
r=Path(__file__).resolve().parent
assert json.loads((r/'profile-protection-private.json').read_text())['state']=='ORIGINAL_PROFILES_RESTORED'
actions=[json.loads(x) for x in (r/'obs-actions.jsonl').read_text().splitlines()]
assert actions[-1]['action']=='Stop Recording'
out=r/'frozen';assert not out.exists();out.mkdir();(out/'video').mkdir()
for p in r.glob('*.png'):shutil.copy2(p,out/p.name)
for p in r.glob('*.py'):shutil.copy2(p,out/p.name)
for src,dst in [(r/'observations',out/'observations'),(r/'analysis/validation/Narro-M7-Logs',out/'Narro-M7-Logs')]:
    assert src.is_dir();shutil.copytree(src,dst)
names=['session-meta.json','launch.json','launch-segment1.json','PREPARATION.json','CAPTURE_ORDER.md','native-actions.jsonl','key-dispatch.jsonl','obs-actions.jsonl','actions.jsonl','computer-use-actions.jsonl','group-manifest.jsonl','original-profile-restoration-proof.json','session-evidence-matrix-before.json','owned-fixture-seed.json','relocation-proof.json']
for name in names:
    if (r/name).exists():shutil.copy2(r/name,out/name)
for p in r.glob('*trace*.jsonl'):shutil.copy2(p,out/p.name)
for name in ['main-input-identity.json','artifact-manifest.json']:shutil.copy2(r/'analysis'/name,out/name)
shutil.copy2(r.parent/'desktop-relocation.json',out/'desktop-relocation.json')
shutil.copy2(r/'segment1-actions-180s.mkv',out/'video/segment1-actions-180s.mkv')
shutil.copy2(r/'video-originals/2026-10-17 04-47-54.mkv',out/'video/segment2-complete.mkv')
def digest(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(8*1024*1024),b''):h.update(b)
    return h.hexdigest()
original=r/'video-originals/2026-10-16 15-27-47.mkv'
meta=json.loads((r/'session-meta.json').read_text())
record={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':meta['head'],'ci':meta['ci'],'exeSha256':meta['sha256'],'originalSegment1':{'path':str(original),'bytes':original.stat().st_size,'sha256':digest(original),'durationSeconds':12611.85,'publishedExcerptSeconds':180,'excerptMethod':'ffmpeg -t180 -map0 -c copy; original retained unmodified locally','lastObservedActionUtc':'2026-10-16T12:30:30.731593Z','stopObserved':False},'segment2':{'obsStart':actions[-2] if actions[-2]['action']=='Start Recording' else None,'obsStop':actions[-1],'completeVideo':True},'groupsAcquired':'8/8, G8 conditional125% NOT RUN; no aggregate verdict yet','exclusions':'Protected original profiles/backups, owned DB/cache, namespace ledger, downloaded executable/ZIP, and unrelated long post-action idle tail from interrupted segment1. Whole Narro-M7-Logs included.'}
record['files']=[{'path':p.relative_to(out).as_posix(),'bytes':p.stat().st_size,'sha256':digest(p)} for p in sorted(out.rglob('*')) if p.is_file()]
(out/'freeze-manifest.json').write_text(json.dumps(record,indent=2),encoding='utf-8')
with zipfile.ZipFile(out/'raw-structured-evidence.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(out.rglob('*')):
        if p.is_file() and p.suffix not in ['.png','.mkv'] and p.name!='raw-structured-evidence.zip':z.write(p,p.relative_to(out).as_posix())
print(json.dumps({'frozen':str(out),'files':len(record['files']),'pngs':len(list(out.glob('*.png'))),'logs':len(list((out/'Narro-M7-Logs').glob('*'))),'originalsRestored':True,'segment1OriginalHash':record['originalSegment1']['sha256']}))
