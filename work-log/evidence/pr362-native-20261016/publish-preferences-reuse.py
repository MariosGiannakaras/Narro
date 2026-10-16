from pathlib import Path
import subprocess, json, hashlib
repo=Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload')
root=Path(__file__).resolve().parent
def git(*args):return subprocess.check_output(['git',*args],cwd=repo,encoding='utf-8').strip()
final='560efeb076d2ec167232b9d86aa3354f6893214b'
if subprocess.run(['git','cat-file','-e',final],cwd=repo,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode:
 subprocess.run(['git','fetch','origin','pull/362/head'],cwd=repo,check=True)
files=['src/PreferenceSettingsSections.tsx','src/preferenceSettingsSections.css','src/ThemeSettingsPanel.tsx','src/themeSettingsPanel.css','src/typography.css']
proof=[]
for p in files:
 hashes={ref:git('rev-parse',ref+':'+p) for ref in ['7b54e62f5d5f814e3e37ed93d8dfa996e9bad6e5','f7456738b8b8498387d4d9637409c4a384f95ba3',final]}
 assert len(set(hashes.values()))==1,p
 proof.append({'path':p,'blobs':hashes})
out=repo/'work-log/evidence/preferences-reuse-20261016';out.mkdir(parents=True,exist_ok=True)
(out/'source-identity.json').write_text(json.dumps({'claim':'B58 exact visible section-heading copy only','identicalInputs':proof,'limits':'PreferencesDialog changed in PR356 keyboard fix; not part of heading-copy identity proof. Whole Preferences composition not accepted.'},indent=2),encoding='utf-8')
paths=['current-v2.6.69-preferences-general.png','current-v2.6.69-preferences-blitz-mode-alerts.png','current-v2.6.69-preferences-alerts-celebration.png','lg-dark-save.png','primary-before-escape.png','g1-lg-prefs-bottom.png']
(out/'reviewed-images.json').write_text(json.dumps([{'name':p,'sha256':hashlib.sha256((root/'analysis/preferences-reuse'/p).read_bytes()).hexdigest()} for p in paths],indent=2),encoding='utf-8')
report='work-log/2026-10-16-preferences-heading-evidence-reuse.md'
(repo/report).write_text('''# Preferences existing-corpus reuse — B58 copy acceptance

While PR362 CI builds, direct final comparison of SS-C08/SS-C09 (canonical Pass-3, calibration SYSTEM_REFERENCE/SYSTEM_COVERED) against already-published Windows captures closes **B58 exact section-heading copy, 2/2 PASS** without a new recording or source change.

| Claim | Direct source | Actual Windows proof | Result |
| --- | --- | --- | --- |
| `Blitz mode settings` | [SS-C08](../reference/original-blitzit-screenshots/current-v2.6.69-preferences-blitz-mode-alerts.png) | [PA356 LG dark saved state](evidence/pa356-keyboard-review-20261015/lg-dark-save.png), actual125% dark Preferences; heading fully visible near bottom | PASS exact copy |
| `Celebrate task completion` | [SS-C09](../reference/original-blitzit-screenshots/current-v2.6.69-preferences-alerts-celebration.png) | [PA355 LG bottom](evidence/pa355-native-20261015/g1-lg-prefs-bottom.png), actual125% light Preferences; heading fully visible | PASS exact copy |

PA355 source7b54e62f5d5f814e3e37ed93d8dfa996e9bad6e5 /CI38630226135 /EXEd772edbfe09711ced7a5780dcedfd7bb8429999f4cc409ccb5e9f74377a8d074; PA356 sourcef7456738b8b8498387d4d9637409c4a384f95ba3 /CI38688646540 /EXEb2d51e4e8b97f2feb5ae8235f91222126eca498c3615722e68531f912ec50293. Five heading/component/style/typography inputs have identical Git blobs from both actual captured sources through PR362final560efeb0. [Machine-readable identity and viewed-image hashes](evidence/preferences-reuse-20261016). This is scoped evidence reuse, not new native execution or whole M8 acceptance.

**B34 shell/keyboard subclaims retained PASS, whole source appearance OPEN.** Actual PA356 provides a bounded centered overlay over dimmed prior Home, reachable X, internal vertical scroll, and accepted neutral-input Escape/Tab/opener return. Direct SS-C07–09 comparison also confirms a remaining presentation discrepancy: source uses one continuous Preferences surface with section rules; current captured Narro wraps groups in separate rounded elevated cards and adds category eyebrows. The existing visual-system rule explicitly says continuous surface / avoid separate card shells. Route this confirmed composition correction to **M8 FIX_NOW when M8 is reached**, preserving all persisted controls, approved picker/upload/icons and native keyboard fixes. No unrelated M8 implementation starts during the current M5/M6 correction. Source screenshot alone does not prove sticky-header motion or exact transition timing; those remain unclaimed. B21/B22/B29/B57 and Focus Quick Preferences retain their independent gates.
''',encoding='utf-8')
p=repo/'TODO.md';s=p.read_text(encoding='utf-8');lines=s.splitlines()
for i,line in enumerate(lines):
 if line.startswith('  - [ ] **A23/B58,'):
  lines[i]='  - [x] **A23/B58 exact Preferences section-heading copy:** SS-C08 `Blitz mode settings` and SS-C09 `Celebrate task completion` directly compared with actual PA356dark125 / PA355light125 captured headings; **2/2 scoped PASS**. Five heading/style inputs identical through PR362final560efeb0. Whole Preferences composition remains B34OPEN; no settings-model change or new recording. [Evidence reuse](work-log/2026-10-16-preferences-heading-evidence-reuse.md).'
 if line.startswith('  - [ ] **A13/B34,'):
  lines[i]+=' **2026-10-16 direct comparison:** shell/keyboard subclaims retained from PA356; separate rounded group-card shells/category eyebrows differ from SS-C07–09 continuous surface and the calibrated visual-system rule. **M8 FIX_NOW composition** when reached; preserve accepted runtime/keyboard authority. [Scoped comparison](work-log/2026-10-16-preferences-heading-evidence-reuse.md).'
p.write_text('\n'.join(lines)+'\n',encoding='utf-8')
p=repo/'docs/AUDIT_IMPLEMENTATION_CROSSWALK.md';s=p.read_text(encoding='utf-8');lines=s.splitlines()
for i,line in enumerate(lines):
 if line.startswith('| B58 |'):
  lines[i]='| B58 | SS-C08/SS-C09 exact headings `Blitz mode settings` / `Celebrate task completion`; previous pre-fix label claim superseded | M8 full Preferences section-heading copy | **SCOPED SOURCE_COPY_AND_NATIVE_PASS 2/2**: actual PA356dark125 + PA355light125, five unchanged heading/style input blobs through560efeb0. Whole B34 composition remains OPEN. [Comparison](../work-log/2026-10-16-preferences-heading-evidence-reuse.md). |'
lines+=['','## 2026-10-16 retained Preferences evidence comparison','',
'B58 exact visible heading copy2/2PASS from existing actual Windows screenshots and direct canonical SS-C08/C09 comparison, with input identity proof. B34 native modal/scroll/keyboard subclaims retained, **source composition FIX_NOW M8**: existing Narro group-card shells/category eyebrows differ from the evidenced continuous section-rule surface and calibrated visual-system requirement. Keep B34OPEN; implement only when that ordered milestone is reached. No new physical execution, M8 completion or M10/M11 advance. [Full bounded comparison](../work-log/2026-10-16-preferences-heading-evidence-reuse.md).']
p.write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('B58_COPY_2_OF_2_PASS; B34_COMPOSITION_M8_FIX_NOW; NO_SOURCE_CHANGE')
