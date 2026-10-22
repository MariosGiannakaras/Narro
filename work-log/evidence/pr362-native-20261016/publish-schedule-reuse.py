from pathlib import Path
import subprocess,json,hashlib,shutil
r=Path(__file__).resolve().parent;repo=Path(r'C:\Users\MariosG\.codex\worktrees\m7-native-paint\NarroUpload')
old='6a6079465fab293b973258083550192d640f4884';new='560efeb076d2ec167232b9d86aa3354f6893214b'
def git(*args):return subprocess.check_output(['git',*args],cwd=repo,encoding='utf-8').strip()
files=['src/TaskCard.tsx','src/taskScheduleApi.ts','src/taskScheduleQuickRemove.ts','src-tauri/src/board_task_schedule.rs','src-tauri/src/persistence/task_schedule_edit.rs']
proof=[]
for p in files:
 a,b=[git('rev-parse',ref+':'+p) for ref in [old,new]];assert a==b,p
 proof.append({'path':p,'blob':a})
def handlers(ref):
 s=git('show',ref+':src/ListBoard.tsx');return s[s.index('  const handleScheduleCommitted ='):s.index('  const handleRemoveRecurring =')]
assert handlers(old)==handlers(new),'Reassess affected schedule acceptance if actual handlers changed'
out=repo/'work-log/evidence/schedule-reuse-20261016';out.mkdir(parents=True,exist_ok=True)
shutil.copy2(r/'analysis/schedule-reuse/VE007-147_8.png',out/'VE007-147_8.png')
(out/'input-identity.json').write_text(json.dumps({'nativeSource':old,'currentCandidate':new,'identicalFiles':proof,'identicalScheduleCommitAndQuickRemoveHandlersSha256':hashlib.sha256(handlers(new).encode()).hexdigest(),'scope':'B42 ordinary scheduled-task date/X menu and removal; unrelated child-detail changes do not invalidate this acceptance'},indent=2),encoding='utf-8')
report='work-log/2026-10-16-b42-existing-native-source-reconciliation.md'
(repo/report).write_text('''# B42 ordinary schedule date/X — retained evidence reconciliation

**B42 ordinary scheduled-task date/X control and outcome: PASS scoped**, using already-executed PA358. This closes the remaining direct comparison for that control without replaying a successful native mutation. Full recurrence/scheduler/lane and tutorial-motion parity remain separate gates.

Canonical VE007~02:28–02:33 directly shows the scheduled-task overflow `Update Schedule`, informative date row and circular X; click removes the schedule without confirmation, preserves the task and moves it into the ordinary Backlog stack. The exact source interval and version continuity are recorded in Pass-3. [Direct147.8s source frame](evidence/schedule-reuse-20261016/VE007-147_8.png) was re-opened only for final comparison; the existing stronger interval corroborates the older B42 route to VE008/017, not a new requirements research pass.

Actual PA358 [74 scheduled menu](evidence/pr358-native-20261016/74-scheduled-menu.png) displays `Update Schedule`, Oct23 local date and right-hand circular X; [76 after quick clear](evidence/pr358-native-20261016/76-after-quick-clear.png) and read-only snapshots62→71→77→136 prove same task/list IDs, retained title/EST900/note hash/five child IDs/four completed, scheduled subsection removed, ordinaryBacklog rank preserved, no new sessions. The action was a real pointer click at00:26:47Z and state survived normal Quit/relaunch. Windows locale date formatting is the documented platform adaptation. No exact tutorial timing, generated-child physical coverage, or full unrelated menu parity claim.

Exact native source6a6079465fab293b973258083550192d640f4884 /CI38826523275SUCCESS3/3 /EXEa0c710ce664d081fb4ceab6045285f19fd0d34a84d639281d5143e722b99bd15. Five schedule/card/native input files and actual ListBoard schedule-commit/quick-remove handler ranges are identical through PR362final560efeb0. [Identity proof](evidence/schedule-reuse-20261016/input-identity.json). PR359/360/362 child-create/detail fixes do not change the schedule removal policy. Parent recurrence lifecycle, calendar/time editor, generated-child edge cases and broader motion retain their original separate tests/gates; no new physical PASS is fabricated.
''',encoding='utf-8')
p=repo/'TODO.md';lines=p.read_text(encoding='utf-8').splitlines()
for i,line in enumerate(lines):
 if line.startswith('  - [ ] **A15/B42,'):
  lines[i]='  - [x] **A15/B42 ordinary scheduled-task quick-remove control:** direct VE00702:28–02:33 date/circularX/source-outcome comparison against actual PA358menu74→X00:26:47→ordinaryBacklog76; stable task/list/note/fivechildren/EST900/no new session, sameEXErestart retained. Five schedule/card/native inputs and actual ListBoard handlers unchanged through560efeb0. **Scoped SOURCE_CONTROL_AND_NATIVE_PASS**; no generated-child physical/all-recurrence/motion claim. B70 already separatelyPASS. [Bounded reuse](work-log/2026-10-16-b42-existing-native-source-reconciliation.md).'
p.write_text('\n'.join(lines)+'\n',encoding='utf-8')
p=repo/'docs/AUDIT_IMPLEMENTATION_CROSSWALK.md';s=p.read_text(encoding='utf-8');s+='\n\n## 2026-10-16 B42 direct source/native comparison completion\n\nB42 ordinary scheduled-task date/circularX and preserved-task removal outcome **SCOPED SOURCE_CONTROL_AND_NATIVE_PASS**, reusing PA358 real pointer/DB/restart proof and direct VE007147.8s /canonical02:28–02:33 comparison. Schedule/card/native input and actual handler identity through560efeb0; no repeat Windows execution. Full recurrence/calendar/generated-child physical/motion gates stay separatelyOPEN. [Report](../work-log/2026-10-16-b42-existing-native-source-reconciliation.md).\n';p.write_text(s,encoding='utf-8')
ci=repo/'work-log/evidence/pr362-final-ci-rendered-20261016';ci.mkdir(exist_ok=True)
for name in ['ci-rendered-verification.json','ci-m7-semantic-results.json']:shutil.copy2(r/'analysis'/name,ci/name)
print('B42_SCOPED_PASS_REUSED; CI_RENDERED_4x7_PASS_RECEIPTS')
