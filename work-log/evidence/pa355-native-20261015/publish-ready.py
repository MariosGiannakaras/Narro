from pathlib import Path
import json,shutil,zipfile
r=Path(__file__).resolve().parent;w=Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload')
o=w/'work-log/evidence/pa355-ci-20261015';o.mkdir(exist_ok=True)
for f in (r/'analysis').iterdir():
 if f.is_file() and (f.suffix=='.zip' or f.name.endswith('.verification.json') or f.name in ['main-source-proof.json','artifact-manifest.json']):shutil.copy2(f,o/f.name)
with zipfile.ZipFile(r/'analysis/visual.zip') as z:
 checks={}
 for theme in ['dark','light']:
  for name,marker in [(f'reports-sessions-add-keyboard-{theme}.html','data-reports-add-picker-interaction-pass="true"'),(f'theme-settings-preferences-dialog-{theme}.html','data-theme-settings-dialog-containment-pass="true"')]:
   matches=[n for n in z.namelist() if n.endswith(name)];assert len(matches)==1
   assert marker in z.read(matches[0]).decode('utf-8');checks[name]=True
(o/'new-rendered-ci-markers.json').write_text(json.dumps(checks,indent=2)+'\n',encoding='utf-8')
text='''# PR355 merged / exact Windows CI accepted / native next

[PR355](https://github.com/MariosGiannakaras/Narro/pull/355) exacthead7b54e62f5d5f814e3e37ed93d8dfa996e9bad6e5 passed [CI38630226135](https://github.com/MariosGiannakaras/Narro/actions/runs/38630226135) **3/3 jobs** including native Rust tests and both new actual rendered picker/Preferences regressions. Guarded squash merge main**dbc3f6f2b86ba7d301b79fd0f568e1b8f20ad954**. **532/532** executable/build/test/config blobs equal, workflow unchanged: reuse exactPR CI under strategy§7, no duplicate full mainCI.

[Five original artifacts and SHA/CRC/source receipts](evidence/pa355-ci-20261015) published. Validationartifact11926964347, x64EXE SHA256 **d772edbfe09711ced7a5780dcedfd7bb8429999f4cc409ccb5e9f74377a8d074**. Production artifact11927304122, visual11926589057 CRC349, Focus11926863357 CRC90, fast11926411019 CRC86; all provider digests match. React quality review of changed production components: geometry-only layout state/primitive effect deps/conditional listener cleanup, no extra subscription/poll, bounded local keyboard handling, existing modal/pending ownership preserved; no review-driven source change needed. ApprovedSpectrum/imageupload/218icons unchanged.

NEXT **fresh protected exact-EXE3-group native acceptance0/3**: Preferences width/scroll/Escape; Sessions actual filtered keyboard/different-task pointer/manual durable add/detail; PDF30/90-day real export/local date/normal Windows viewer/second export no overwrite/tooltip return. [Prepared order](evidence/pa354-review-20261014/pa355-capture-order.md). Before capture re-read currentTODO/HANDOFF/crosswalk and snapshot Windows monitor/motion/environment. Original profiles currently restored/no Narro or recorder. PA354 acquisition/review4/4/tooltip1/1 scopedPASS retained; oldReports-only C5INCONCLUSIVE is not a newC5failure. New corrected acceptance remainsOPEN regardless CI.

HDMI unplug/replug explicitly user-deferred manualNOTRUN; independent installer2/2 scopedPASS retained with clean-machine/older-schema/trueboot limits. Mandatory3/10/M10hardentry blocked, PA09/M11/liveBlitzit excluded. Preserve unchanged prior physical evidence and keep full new capture/logs/checkpoints on main.
'''
(w/'work-log/2026-10-15-pa355-merged-native-ready.md').write_text(text,encoding='utf-8')
summary='**Current PA355 exact candidate accepted:** PRhead7b54e62f/CI38630226135 **3/3 PASS**, guarded main**dbc3f6f2**, source532/532/workflow identical; five SHA/CRC artifacts published, exactx64EXE**d772edbf**. [One next operation](work-log/2026-10-15-pa355-merged-native-ready.md): fresh protected native3-group capture/aggregate acceptance**0/3**. PA3544/4capture/review and tooltip1/1 scopedPASS retained. Originals restored/no app or recorder; HDMI manualNOTRUN. Mandatory3/10/M10blocked; PA09/M11excluded.\n\n'
for name in ['STATUS.md','TODO.md','HANDOFF.md','docs/AUDIT_IMPLEMENTATION_CROSSWALK.md']:
 p=w/name;t=p.read_text(encoding='utf-8');first,rest=t.split('\n',1);rest=rest.replace('## NOW —','## HISTORICAL —').replace('**Current PA continuation:**','**Historical PA continuation:**')
 prefix=summary.replace('(work-log/','(../work-log/') if name.startswith('docs/') else summary
 if name=='HANDOFF.md':prefix='## NOW — PR355 merged/exact CI accepted, native0/3 next\n\n'+prefix
 p.write_text(first+'\n\n'+prefix+'Older checkpoints below are historical.\n\n'+rest.lstrip('\n'),encoding='utf-8')
print('Published accepted artifacts and current native continuation')
