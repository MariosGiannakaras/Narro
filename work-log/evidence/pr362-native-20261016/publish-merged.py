from pathlib import Path
import shutil
r=Path(__file__).resolve().parent;repo=Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload')
out=repo/'work-log/evidence/pr362-final-ci-rendered-20261016';out.mkdir(parents=True,exist_ok=True)
for p in ['main-input-identity.json','artifact-manifest.json']:shutil.copy2(r/'analysis'/p,out/p)
checkpoint='**Current Windows checkpoint — 2026-10-16:** PR362 final source560efeb076d2ec167232b9d86aa3354f6893214b /CI38894130069 **3/3 SUCCESS**, guarded merge5dfbede3; **554 input blobs/workflow identical**. Provider artifact12043788138 /EXE434b7182266086dca541d85c229f1cc4c2db413e5812551501ad1ab2f380da48 verified. Native correction **0/3 directions, 0/1 combined session / NOT RUN**. Next: fresh profile protection and one dual-screen Board/Focus/expanded-Timer capture, freeze/restore, aggregate review/publication. No recording/profile isolation active at this checkpoint. B58 heading2/2 and B42 ordinary date/X scoped acceptance reclosed from retained native/source evidence. M1–M4complete4/10; M10blocked/M11dormant.'
for name in ['HANDOFF.md','TODO.md','STATUS.md']:
 p=repo/name;s=p.read_text(encoding='utf-8');s=s.replace(s.splitlines()[2],checkpoint,1)
 if name=='HANDOFF.md':
  a=s.index('## One next operation');b=s.index('## Workspace',a)
  s=s[:a]+'''## One next operation

**Run protected PR362 native correction capture now.** Final560efeb0 /CI38894130069SUCCESS3/3, guardedmerged5dfbede3 with554-input/workflow identity. Verified artifact12043788138, EXE434b7182266086dca541d85c229f1cc4c2db413e5812551501ad1ab2f380da48. Prepared capture root `E:\\SystemFiles\\Desktop\\Narro-PA362-native-20261016` approved for final source. Fresh original backup/owned profile, optional prior-owned fixture/history seed, dual OBS, real cross-window create/title/order/completion/count/draft/identity in3directions; compatible Done/Notes/emptyCTA where sufficiently exercised. Normal tray Quit, OBSstop, freeze complete video/PNGs/UIA/chronology/logs, restore originals before aggregate analysis and main publication. Current native0/3, no physicalPASS. Preserve unaffected accepted checks; M10blocked/M11dormant.

''' + s[b:]
 if name=='TODO.md':s=s.replace('CI38894130069IN_PROGRESS','CI38894130069SUCCESS3/3,guardedmerge5dfbede3,554inputidentity')
 p.write_text(s,encoding='utf-8')
print('MERGED_MAIN_ARTIFACT_TRACKING_READY')
