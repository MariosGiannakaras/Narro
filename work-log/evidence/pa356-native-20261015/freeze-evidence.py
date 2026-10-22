from pathlib import Path
import json,sqlite3,hashlib,shutil,zipfile,datetime,subprocess
r=Path(__file__).resolve().parent;p=r/'package';p.mkdir(exist_ok=True)
ledger=json.loads((r/'profile-protection-private.json').read_text());assert ledger['state']=='ORIGINAL_PROFILES_RESTORED'
owned=Path(next(x['retainedPostfix'] for x in ledger['namespaces'] if x['kind']=='Roaming'))
assert json.loads((owned/'pa-owned-profile.json').read_text())['sessionRoot']==str(r)
backup=r/'private-owned-after-capture.db'
with sqlite3.connect(owned/'narro.db') as s,sqlite3.connect(backup) as b:s.backup(b);assert b.execute('pragma quick_check').fetchone()[0]=='ok'
origin=Path(r'E:\SystemFiles\Desktop\NarroUpload\artifacts\m7-pr234-native-20261005\video\2026-10-15 11-33-03.mkv')
movie=r/'pa356-native.mkv';shutil.copy2(origin,movie)
assert hashlib.sha256(origin.read_bytes()).digest()==hashlib.sha256(movie.read_bytes()).digest()
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(movie)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video');assert (v['width'],v['height'])==(4480,1080)
names=['session-meta.json','launch.json','native-actions.jsonl','key-dispatch.jsonl','actions.jsonl','obs-actions.jsonl','original-profile-restoration-proof.json','CAPTURE_ORDER.md','native-input.py','physical-key.py','keyboard-owner.py','uia_controls.py','uia-focus.py','scroll-many.py','monitor-facts.py','window-facts.py','obs-control.py','tray_quit.py','motion.py','freeze-evidence.py']
names += [f.name for f in r.glob('motion-*.json')]+[f.name for f in r.glob('g*.png')]
for name in names:shutil.copy2(r/name,p/name)
shutil.copytree(r/'observations',p/'observations',dirs_exist_ok=True)
shutil.copytree(r/'analysis/validation/Narro-M7-Logs',p/'Narro-M7-Logs',dirs_exist_ok=True)
pdfs=['narro-overview-2026-07-17-to-2026-10-15-2.pdf']+[f'narro-overview-2026-09-15-to-2026-10-15-{n}.pdf' for n in [3,4,5]]
for name in pdfs:shutil.copy2(Path('F:/')/name,p/name)
parts=[]
with movie.open('rb') as s:
 while chunk:=s.read(40*1024*1024):
  part=p/(movie.name+f'.part{len(parts)+1:02d}');part.write_bytes(chunk);parts.append({'name':part.name,'bytes':len(chunk),'sha256':hashlib.sha256(chunk).hexdigest()})
manifest={'name':movie.name,'originalPath':str(origin),'bytes':movie.stat().st_size,'durationSeconds':float(probe['format']['duration']),'sha256':hashlib.sha256(movie.read_bytes()).hexdigest(),'parts':parts,'obsStartSettledUtc':'2026-10-15T08:33:03.892305+00:00','correlation':'OBS recording started before settled Start receipt; frame offsets are approximate, action UTC journals authoritative.'}
(p/'video-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
(p/'video.ffprobe.json').write_text(json.dumps(probe,indent=2)+'\n')
(p/'README.md').write_text('''# PA356 exact Windows raw acquisition

Source f7456738 / CI38688646540 all3SUCCESS / guarded main e0e7c3b3 / EXE b2d51e4e8b97f2feb5ae8235f91222126eca498c3615722e68531f912ec50293. Acquisition2/2 completed; aggregate review pending. Continuous original OBS4480x1080/60fps movie in two ordered binary parts, verify concatenated SHA256 against manifest. Both displays side-by-side, primary2560x1080/100%, LG1920x1080/125% unchanged. All native action UTC, UIA/focus observations, screenshots, four actual PDFs, complete Narro-M7-Logs and restoration receipts included. Personal original/owned DBs, namespace ledger and private OBS health setupclip excluded.

G1 actual theme-save, physical Escape/Tab, scrolling, primary normal and LG reduced, Shortcuts/return. G2 actual90day export, default Nitro reader3pages, postexport final-day tooltip, paired30day exports. Early90day draft was dismissed by outside Export click, so first two exports remain30day; authoritative90day is Jul17-Oct15-2. Do not infer a successful action from its label. Native Preferences visibly remained open after paired-export setup Escape at08:38:27; recovery via explicit Close08:39:11. Filtered UIA absence does not prove modal closure. Aggregate video must decide each occurrence. UIA SetFocus on an offscreen control alone does not prove user reachability. No source edits during recording. Normal trayQuit08:39:38, OBSstop08:39:39, originals byte-identical restored08:39:40; original motion restored, topology unchanged.

Prior accepted unaffected PA scopes retained; this Reports-only run does not exercise newC5/timer/performance/installer/notification acceptance. HDMI physically unplug/replug remains user-deferred manualNOTRUN; sourceparity/conditional OS gates remainOPEN; mandatory3/10/M10blocked, PA09/M11excluded.
''',encoding='utf-8')
with zipfile.ZipFile(p/'raw-observations.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(p.rglob('*')):
  if f.is_file() and f.suffix not in {'.png','.pdf','.zip'} and '.mkv.part' not in f.name and f.name!='freeze-manifest.json':z.write(f,f.relative_to(p).as_posix())
files={f.relative_to(p).as_posix():{'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()} for f in sorted(p.rglob('*')) if f.is_file() and f.name!='freeze-manifest.json'}
(p/'freeze-manifest.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'profileState':ledger['state'],'ownedDbPrivate':True,'ownedDbSha256':hashlib.sha256(backup.read_bytes()).hexdigest(),'files':files},indent=2)+'\n')
print(json.dumps({'files':len(files),'bytes':sum(x['bytes'] for x in files.values()),'logs':sum(n.startswith('Narro-M7-Logs/') for n in files),'videoSeconds':float(probe['format']['duration']),'videoSha256':manifest['sha256']}))
