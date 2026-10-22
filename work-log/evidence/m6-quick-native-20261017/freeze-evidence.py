from pathlib import Path
import json, shutil, hashlib, datetime, subprocess, sys, zipfile
r=Path(__file__).resolve().parent
ledger=json.loads((r/'profile-protection-private.json').read_text());assert ledger['state']=='ORIGINAL_PROFILES_RESTORED','Restore originals before publishing'
meta=json.loads((r/'session-meta.json').read_text());launch=json.loads((r/'launch.json').read_text(encoding='utf-8-sig'))
running=subprocess.run(['powershell','-NoProfile','-Command',f'Get-Process -Id {launch["pid"]} -ErrorAction SilentlyContinue'],stdout=subprocess.PIPE,creationflags=0x08000000)
assert not running.stdout,'Owned process must exit normally before freeze'
actions=[json.loads(x) for x in (r/'obs-actions.jsonl').read_text().splitlines() if x.strip()]
assert actions[-1]['action']=='Stop Recording','OBS must stop before freeze'
start=next(x for x in reversed(actions) if x['action']=='Start Recording')
start_ts=datetime.datetime.fromisoformat(start['utc']).timestamp()
folder=Path(r'E:\SystemFiles\Desktop\Narro-Workspace\Narro-M5-B43-20261017\native\video-originals')
videos=[p for p in folder.glob('*.mkv') if p.stat().st_mtime>=start_ts-2];assert len(videos)==1,[str(x) for x in videos]
out=r/'frozen';out.mkdir(exist_ok=True);(out/'video').mkdir(exist_ok=True)
shutil.copy2(videos[0],out/'video'/videos[0].name)
for p in r.glob('*.png'):shutil.copy2(p,out/p.name)
for p in r.glob('*.py'):shutil.copy2(p,out/p.name)
for name in ['observations','analysis/validation/Narro-M7-Logs']:
 src=r/name;assert src.is_dir(),str(src);shutil.copytree(src,out/('Narro-M7-Logs' if src.name=='Narro-M7-Logs' else name),dirs_exist_ok=True)
for name in ['session-meta.json','launch.json','PREPARATION.json','CAPTURE_ORDER.md','native-actions.jsonl','key-dispatch.jsonl','obs-actions.jsonl','actions.jsonl','original-profile-restoration-proof.json','session-evidence-matrix-before.json','owned-fixture-seed.json','seeded-done-history.json']:
 if (r/name).exists():shutil.copy2(r/name,out/name)
for p in r.glob('*trace*.jsonl'):shutil.copy2(p,out/p.name)
for name in ['main-input-identity.json','artifact-manifest.json']:
 shutil.copy2(r/'analysis'/name,out/name)
rows=[{'path':p.relative_to(out).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(out.rglob('*')) if p.is_file() and p.name!='freeze-manifest.json']
(out/'freeze-manifest.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':meta['head'],'ci':meta['ci'],'exeSha256':meta['sha256'],'obsStart':start,'obsStop':actions[-1],'files':rows,'excluded':'Personal profiles, DB/cache/namespace ledger/backups; downloaded EXE/ZIP and WebView profile. Owned read-only SQL projections only.'},indent=2),encoding='utf-8')
with zipfile.ZipFile(out/'raw-structured-evidence.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(out.rglob('*')):
  if p.is_file() and p.suffix not in ['.png','.mkv'] and p.name!='raw-structured-evidence.zip':z.write(p,p.relative_to(out).as_posix())
print(json.dumps({'frozen':str(out),'files':len(rows),'video':videos[0].name,'videoBytes':videos[0].stat().st_size,'logs':len(list((out/'Narro-M7-Logs').rglob('*'))),'originalsRestored':True}))
