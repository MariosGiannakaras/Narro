from pathlib import Path
import json,shutil,subprocess,hashlib,zipfile
r=Path(__file__).resolve().parent;p=r/'package';p.mkdir(exist_ok=True)
ledger=json.loads((r/'profile-protection-private.json').read_text());assert ledger['state']=='ORIGINAL_PROFILES_RESTORED'
for f in r.iterdir():
 if f.is_file() and f.suffix in ['.json','.jsonl','.png','.py'] and 'private' not in f.name:shutil.copy2(f,p/f.name)
shutil.copytree(r/'observations',p/'observations',dirs_exist_ok=True)
shutil.copytree(r.parent/'analysis/validation/Narro-M7-Logs',p/'Narro-M7-Logs',dirs_exist_ok=True)
origin=Path(r'E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-pr234-native-20261005\video\2026-10-15 11-51-28.mkv');movie=r/'pa356-diagnostic.mkv';shutil.copy2(origin,movie)
assert hashlib.sha256(movie.read_bytes()).digest()==hashlib.sha256(origin.read_bytes()).digest()
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(movie)]))
shutil.copy2(movie,p/movie.name)
(p/'video-manifest.json').write_text(json.dumps({'originalPath':str(origin),'name':movie.name,'bytes':movie.stat().st_size,'sha256':hashlib.sha256(movie.read_bytes()).hexdigest(),'seconds':float(probe['format']['duration']),'probe':probe},indent=2))
(p/'README.md').write_text('''# PA356 same-EXE bounded keyboard context diagnostic

Original candidate/CI/source unchanged. Acquisition only; review follows raw freeze. OriginalOBS4480x1080/60fps movie retained whole, no cut. Initial namedUIA access failed before app tree exposed; no click sent. Modifierprobe found LeftAlt down08:51:29, confirmed08:52:37 and released. OriginUNKNOWN; this does not prove historical08:38 Altstate. Neutral actualmouse Settings/Escape; attemptedoccludedclick whileNitroforeground was excluded, and keyboardguard correctly refused input. ActualLG realdark/light changes+Tab/Escape and later actualNitroforeground→visibleLGSettings→Escape recorded with full before/after foreground/nativefocus root/UIAfocus/modifier facts and positive successor UIA. No product source changes/CI. Existing viewer closed normally by exactobserved process CloseMainWindow. NormaltrayQuit/OBSstop/originalprofiles restored byte-identically. Entire current Narro-M7-Logs included; prior session preserved. Profile DBs/ledger excluded. Scope onlyG1 missing context, no otherPA replay/M10advance/M11.
''',encoding='utf8')
with zipfile.ZipFile(p/'raw-observations.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(p.rglob('*')):
  if f.is_file() and f.suffix not in ['.png','.mkv','.zip']:z.write(f,f.relative_to(p).as_posix())
files={f.relative_to(p).as_posix():{'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in p.rglob('*') if f.is_file() and f.name!='freeze-manifest.json'}
(p/'freeze-manifest.json').write_text(json.dumps({'profileState':ledger['state'],'files':files},indent=2))
w=Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload');shutil.copytree(p,w/'work-log/evidence/pa356-keyboard-diagnostic-20261015',dirs_exist_ok=True)
print(json.dumps({'files':len(files),'logs':sum(n.startswith('Narro-M7-Logs/') for n in files),'seconds':float(probe['format']['duration']),'sha256':hashlib.sha256(movie.read_bytes()).hexdigest()}))
