# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entries, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## LIVE RECONCILIATION — 2026-10-03

This section is the current continuation state.

- Current validated application source baseline: `1a96da7d8b4c6f4aa2aa58cb7d6bd49726b0fab0` (PR #221). Exact head `5cc184d87ae4f3562e439012292526940a48cb0a` PASSed full Windows CI #884 / run `37122117866`; merged main has zero non-Markdown differences from that head. No duplicate source CI is required. Physical M7 motion/label batch is active, not yet accepted.
- PR #217 is merged. Resulting-main diagnostic hash-release follow-up is validated by Windows CI #866 / run `37078139295`: **PASS** on `f1a200c3624c3e25154a7023443c1dfc5be1e69d`.
- PR #218 is **closed**; do not treat it as an active continuation.
- **Final M1 Candidate B is ready** from resulting-main CI #866 / run `37078139295` on source `f1a200c3624c3e25154a7023443c1dfc5be1e69d`: artifact id `11257763093`, ZIP SHA-256 `0453b29656198a35863feca85f460fb540274f1ab826ff1a49ea29d90018f49e`, contained diagnostic EXE SHA-256 `7168dbca6e72484d0782f0541460103144162d9dd5f0355cc7df8e321c6e45c3`. Its runtime storage-isolation smoke PASSed and production Roaming/Local namespaces remained unchanged. Physical M1 B/C/D may use only this candidate until superseded by later validated source.
- PR #219 (`M7: add automatic local physical-validation logs`) is now **merged**.
- PR #219 final exact head `b62375ec0a1a9d68edec4c872dd56a3e864aa5b1` passed Windows CI #872 / run `37101133903` and was expected-head guarded squash-merged as main commit `1423bb8a71deedac2fa17edf6c2fae1f98e2cbb0`.
- CI #869 on prior head `422230e755a373d3ccb61246e1917ff7934a1210` failed **only** because `verify-m7-validation-logging.ps1` had a PowerShell parser error before the smoke could launch; all preceding substantive Windows gates passed.
- The smoke script was narrowly repaired and an earlier PowerShell parser preflight was added. A subsequent correctness review also fixed the evidence handoff so the entire two-session `Narro-M7-Logs` folder is retained/uploaded for debugging. Resulting-main Windows CI #873 / run `37105088285` **PASSed** on validated source `1423bb8a71deedac2fa17edf6c2fae1f98e2cbb0`. Final M7 C5 artifact: `narro-m7-validation-windows-x64`, id `11268220111`, ZIP SHA-256 `e17532df1f1eab86022d93616fb4d217ff09d6378ee94bf5af90522950286e44`, contained EXE SHA-256 `4fde3778720505705ac9c7f9b05a30cb70c26b02c09c6dec442775bc5c66637c`, fingerprint `fnv1a64:ccb7e96a5db9d324:bytes:14874624`.
- #219 adds `narro-m7-validation.exe`, automatic local `Narro-M7-Logs`, detailed native/persistence restart evidence and a fail-closed `PENDING/PASS/FAIL/INCONCLUSIVE` C5 evaluator. Normal `narro.exe` keeps logging inert.
- Milestone 8 is validated and reconciled. Current M7 corrective progress is `5/10M || 2/5 | 14/19`.

**NEXT AGENT ACTION:** Complete PR #222 on fix/m7-native-insets-and-editors in the attached m7-content-transitions worktree. Six compatible corrections cover native frame insets, Notes horizontal/large-editor/Save bounds, Greek shortcuts, loading-modal keyboard ownership and sole transition paint ownership. Checkpoints 1 evidence/crosswalk and 2 implementation/regressions are done. Complete 3 final exact-head full Windows CI, then 4 exact EXE native/editor/keyboard/100%-125%/two-monitor/restart/motion/performance retest and 5 final evidence/reconciliation. CI #887 / run 37129736602 was cancelled to add the dense-video-confirmed motion correction before final candidate production; it is not a physical acceptance attempt. Complete CI #884 logs/video/360-frame observations are in work-log/2026-10-03-codex-m7-ci884-physical-batch-evidence.md. Computer Use returned the physical Escape stop even after explicit user resumption and a JS reset; stop app input for that turn, preserve the already-authorized next-turn retest. Both displays were subsequently enumerated, but this is not a two-monitor PASS. OBS is stopped/closed; PID 14080 remains paused on CI #884, original C5 Time Taken 2:17:16, OS animations On and focused WebView Greek. Preserve independent M9/source-analysis work. Progress 5/10M || 2/5 | 14/19.

**C5 PHYSICAL ACTION COMPLETED — 2026-10-03:** the requested exact CI #873 EXE completed active compact Timer → qualifying 328 px drag → actual tray **Quit Narro** → same-EXE relaunch → visible saved `(1640,780)` Timer. The same task/time returned paused; native two-session evaluator **PASS**. [Completed run](work-log/2026-10-03-codex-m7-ci873-c5-completed.md), [continuous video and embedded review frames](work-log/2026-10-03-codex-m7-ci873-c5-video-review.md), whole `Narro-M7-Logs` folder/ZIP and hashes are published. No C5 restart user action remains. Formal tracking and `M7-OBS-20261003-01/02` disposition remain pending; M1 Candidate B B/C/D remain separate. OBS was stopped/closed and Narro remains paused.

Durable implementation checkpoint: `work-log/2026-10-03-chatgpt-m7-automatic-validation-logging-pr219-pending.md`. CI #869 correction chain: `work-log/2026-10-03-chatgpt-m7-ci869-parser-failure-ci871.md`. Candidate B evidence: `work-log/2026-10-03-chatgpt-m1-ci866-final-candidate-b.md`. Concurrency correction: `work-log/2026-10-03-chatgpt-pr218-concurrency-correction.md`.

## CURRENT STATE

`5/10M || 2/5 | 14/19`

**Reopened Milestone 1 / M7 single-Focus physical closure remains active.** Historical CI #809 C1/C2/C3/C4 PASS and unrelated acceptance are preserved. CI #884 exposes six narrowly evidenced FIX_NOW defects including motion coexistence. C5 restart is physically PASS on CI #873; changed host geometry in PR #222 requires fresh relevant acceptance rather than inheriting that PASS. Final native/DPI/monitor/motion/performance and source-parity/calibration gates remain open.

## Parallel user-directed Blitzit forensic track — analysis only

This section is **not** the normal implementation next action. It applies only when the user explicitly asks to continue the Blitzit forensic/source-analysis pass.

User direction recorded 2026-10-02:
- analyze all supplied Blitzit videos/images at the most detailed practical level;
- record the evidence durably in the repository;
- **do not modify Narro implementation in this analysis track**;
- leave enough repository state that a zero-context chat can resume by being told only to continue the forensic pass.

When that instruction is given, read in order:
1. `docs/BLITZIT_FORENSIC_PASS3_HANDOFF.md`
2. `docs/BLITZIT_FORENSIC_REAUDIT_PLAN.md`
3. `docs/BLITZIT_FORENSIC_PASS3_TRACKER.md`
4. `docs/BLITZIT_FORENSIC_PASS3_SCREENSHOTS.md`
5. `docs/BLITZIT_FORENSIC_PASS3_VIDEOS.md`

Current source-analysis checkpoint:
- screenshots: **46/46 SOURCE_COMPLETE** at Pass-3 depth;
- full repository MP4s: **11/19 SOURCE_COMPLETE** at Pass-3 depth;
- VE-018: one 9.344 s / 560-frame planning-board excerpt is **PARTIAL** deep evidence, not full VE-018 completion;
- VE-003 Blitz Mode: **SOURCE_COMPLETE** from the actual full MP4;
- VE-005 Add & Manage Tasks and Lists: **SOURCE_COMPLETE** from the actual full MP4;
- VE-013 Subtasks: **SOURCE_COMPLETE** from the actual full MP4;
- VE-014 Preferences: **SOURCE_COMPLETE** from the actual full MP4;
- VE-016 Timer Modes: **SOURCE_COMPLETE** from the actual full MP4;
- VE-017 Update Recurring Schedules: **SOURCE_COMPLETE** from the actual full MP4;
- VE-007 Schedule Task Reminders: **SOURCE_COMPLETE** from the actual full MP4;
- VE-009 Custom Recurring Schedules: **SOURCE_COMPLETE** from the actual full MP4;
- VE-010 Notes: **SOURCE_COMPLETE** from the actual full MP4;
- VE-015 Sessions Walkthrough: **SOURCE_COMPLETE** from the actual full MP4;
- VE-011 Reports: **SOURCE_COMPLETE** from the actual full MP4;
- exact next video: **VE-012 — Blitzit Tutorial How to Use Reports -Update Improved Sessions and Stats.mp4**;
- raw MP4 access is currently available through the isolated analysis-only media bridge; do not merge that bridge into main.

Do not edit implementation PR #213 or any source/test/config files from this forensic track. Implementation reconciliation is explicitly deferred.

## Blitzit parity consumption / implementation coordination

This coordination rule is additive and does **not** change the active M7 next action.

- Binding workflow: `docs/BLITZIT_PARITY_RECONCILIATION_WORKFLOW.md`.
- The Pass-3 analysis agent continues source-only work and does not patch implementation.
- Implementation agents consume canonical `SOURCE_COMPLETE` findings; they do not re-analyze every raw screenshot/video.
- New source findings are compared with current Narro during a separate reconciliation step that updates `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` and the affected milestone/tracking before parity closure.
- Current M9 Reports/Sessions visual parity is **not ready for final acceptance** while VE-015, VE-011 and VE-012 remain OPEN. Nonvisual M9 work may continue.
- PR #205 is nonvisual typed Overview API work; Windows CI #886 PASSed its current exact head `96498085a4bd1e9935c1a2f3ca75bee905a10678`. Normal implementation integration policy may continue independently of the Reports visual evidence gate.
- PR #198 remains provisional Reports visual foundation. Do not treat or merge it as the final Blitzit-parity answer until VE-015/011/012 are source-complete and reconciled against its current implementation.
- PR #213 already validated positional cross-lane insertion and remaining-EST projection; stale `FIX_NOW` wording for those two items is corrected in the crosswalk by the parity-workflow reconciliation commit. Remaining board progress/ordinal/hover/drag-motion/fade fidelity gaps remain open.

## Evidence-routing audit — 2026-10-03

- Direct raw-source sampling confirms the sampled completed video Pass-3 records are genuinely deep and evidence-class disciplined.
- The 46 screenshot records are useful qualitative source records but do not consistently preserve the measurable geometry/spacing/typography/color/radius/shadow detail needed for maximum visual parity.
- Screenshot source inspection remains 46/46; a separate static visual-calibration layer is **OPEN** in `docs/BLITZIT_VISUAL_CALIBRATION_PLAN.md` / tracker.
- `docs/EVIDENCE_ROUTING_MAP.md` is the common discovery entry point for ChatGPT/Codex so prior-pass trackers, current Pass-3 findings, calibration, reconciliation and physical validation are not conflated.
- This documentation change does not alter the active M7 physical next action. Pass-3 video continuation remains VE-015.

## Current source / validation baseline

- Latest implementation merge:
  `007a999e688144122362ad1a4012a22b310e66f2` — PR #216
  `M1: automate final monitor evidence and placement persistence reopen`.
  Later main commits are Markdown-only tracking/forensic updates.
- PR #216 exact head
  `306dfc50d68477059ceb65a45c5806558db6abbf` passed full Windows
  CI #853 / run `37044645690`.
- Exact-head packaged Focus artifact was manually inspected in addition to the
  green job:
  - Panel→Timer HWND `(668,0) → (388,80)`, native movement observed ~109 ms;
  - Timer→Panel HWND `(388,80) → (668,0)`, native movement observed ~134 ms;
  - both final samples remain at the target position.
  Therefore the corrected capture path contains real source→target HWND motion;
  the 30 s ACK/capture-window change did not weaken the movement requirement.
- PR #216 exact-head diagnostic artifact:
  - id `11244174942`;
  - ZIP digest
    `sha256:f68866ae46da694d28858217aedc6d08999ce765fc19c0226a32710fe5b78570`;
  - contained `narro.exe` SHA-256
    `6f7e6667ec392b8fe7fbf79dc6374489a1e3b1d9f1e036902db9c74f17d4a56c`.
  This is **supporting PR-head evidence only**, not final Candidate B.
- PR #216 adds:
  - one-click all-monitor Left/Right placement matrix with ~750 ms physical dwell
    and native expected-vs-actual PASS/FAIL probes;
  - stale matrix invalidation after topology/selection changes;
  - SQLite close/reopen regression for saved Timer placement;
  - diagnostic storage isolation from production data;
  - final M7 physical-session safety backup/hash preparation;
  - CI-only Focus ACK/capture timeout alignment.
- Resulting-main Windows CI #854 / run `37069188509` **PASSed** on implementation
  merge `007a999e688144122362ad1a4012a22b310e66f2`.
- Resulting-main packaged Focus artifact id `11254745758`, digest
  `sha256:d1cfe097e56dcf1091a51db2e305f838cc530532883280879ed7e7567e77fdb1`,
  was manually inspected: Panel→Timer `(668,0)→(388,80)` at ~140 ms and
  Timer→Panel `(388,80)→(668,0)` at ~135 ms, with final samples at target.
- Resulting-main diagnostic artifact id `11254037811`, digest
  `sha256:acb24529528549762a1d7c1794268aa9ee7825197a1062b506c3b184942862b8`,
  contains diagnostic `narro.exe` SHA-256
  `a4da47d57fd08b5f3193a4f793c4df963061c094a861a4dc0fd4e6ed0b92f4af`.
  This remains historical PR #216 fallback evidence. The final user-facing
  Candidate B is the later CI #866 artifact recorded below and in
  `work-log/2026-10-03-chatgpt-m1-ci866-final-candidate-b.md`.
- Durable exact-head/merge checkpoint:
  `work-log/2026-10-03-chatgpt-m1-pr216-ci853-merge-checkpoint.md`.
- Earlier combined-main failure history and #215 diagnosis remain in:
  `work-log/2026-10-02-chatgpt-current-main-pr212-pr214-pr213-reconciliation.md`
  and `work-log/2026-10-02-chatgpt-ci840-focus-capture-pr215.md`.

### M7 production physical lineage

The accepted M7 C4 production physical baseline remains CI #809 source `2767b3827670603d1ab259b6a843c2e0da82d85d` / PR #208. The user-directed C5 continuation used the validated automatic-logging CI #873 candidate identified in LIVE RECONCILIATION and now physically passes the saved-placement restart criterion. Do not treat the older baseline identity as an instruction to repeat a completed C5 run.

- PR #208 exact head: `d885a577c5e7f2e376ed1f6cf5e7f83146dfec58`.
- Exact-head Windows CI #809 / run `36865451660`: **PASS**.
- Resulting-main Windows CI #810 / run `36867438874`: **PASS**.
- PR #209 exact head `5384ea7384d304a843771e225bfb50cd9394bf43`
  passed full Windows CI #811 and regression-locks tray Quit -> save Timer
  placement -> process exit ordering without changing production runtime.
- CI #809 physical evidence remains the accepted M7 C4 baseline; CI #873 supplies the completed C5 physical restart observation, whole two-session logs and continuous video. Formal closure remains separate from CI alone.

## Exact artifacts to use next

### M7 C5 production physical acceptance

CI #809 below is historical C4 lineage. PR #219 is merged and its resulting-main CI #873 logging EXE has completed physical C5 PASS. Use the completed-run evidence in LIVE RECONCILIATION; no new restart run is pending. Review the recorded additional motion/label observations before formal milestone reconciliation.

Legacy CI #809 artifact:

- artifact id `11163439039`
- artifact digest `sha256:39ca0a91d7aa54be79ca35c509f82f25049a15a3fc4ffff199699eab309557a5`
- standalone `narro.exe` SHA-256 `a4b8e163539f429769540480a7aa0b5db9ca6fa2c356d6742f78d687b5cb5675`
- physical-build smoke: PASS, zero CI `runtimeVisual` checkpoints

Packaged Focus visual artifact `11163582492`, digest `sha256:c184e661163bdf9ff1a9dd02859d7c9523add0a5edb6433d2f7ce8a29bf96cf9`, confirms one Focus HWND `0x1022A`, compact 340x110, expanded 340x300, active title/time and no unintended scrollers.

### Remaining M1 diagnostic/manual validation

Final Candidate B is **ready** and fixed to resulting-main CI #866:

- source SHA: `f1a200c3624c3e25154a7023443c1dfc5be1e69d`
- Windows CI: #866 / run `37078139295` — **PASS**
- diagnostic artifact: `narro-m1-diagnostic-windows-x64`
- artifact id: `11257763093`
- ZIP SHA-256:
  `0453b29656198a35863feca85f460fb540274f1ab826ff1a49ea29d90018f49e`
- contained diagnostic `narro.exe` SHA-256:
  `7168dbca6e72484d0782f0541460103144162d9dd5f0355cc7df8e321c6e45c3`

CI #866's real runtime storage-isolation smoke PASSed with diagnostic SQLite
under `com.mariosg.Narro.M1Diagnostic`; production Roaming and Local
`com.mariosg.Narro` namespaces remained unchanged.

M1 B/C/D are therefore no longer blocked on repository-side candidate
preparation. They still require the user's real Windows physical/measurement
run using `docs/M1_FINAL_REPLACEMENT_PHYSICAL_BATCH.md`.

Do **not** use Candidate B as a substitute for the M7 C5 production/validation
acceptance path.

## CI #806 recording audit

User recording `2026-10-01 15-20-44.mp4`, SHA-256 `86e51a5dcc6cc8bd5cb6af41971daa3c23016a97768c7f8469f567d4f232710b`, was audited across the complete 172.8 s timeline with dense transition sampling.

Important findings:

- The early `Blitz is already active` + `Focus task unavailable` / `All Clear` mismatch is **not clean idle evidence**. It is consistent with the already-documented stale SQLite residue risk from the invalid CI #795 `runtimeVisual=1` artifact.
- A clean real task `Test` becomes active around 78 s. From there, task identity/time remain continuous across Panel, compact Timer and expanded Timer.
- At approximately **81.50 s**, expanded -> compact produces a real white L/outline frame. This is an independent Gate 7 failure and is the evidence that produced PR #208.
- The same clean session supplies positive unaffected evidence for repeated Panel/Timer switching, animations Off then restored On, continuous timer identity, visible Focus->Main completion reconciliation, and Timer dragging.
- The recording does not conclusively prove the clean idle no-op input, real 100%/125% DPI crossing, topology reconnect, fullscreen topmost, or close/restart placement persistence.

Durable evidence: `work-log/2026-10-01-chatgpt-m7-ci806-physical-failure-pr208-ci809-main810.md`.

## CI #809 corrected two-monitor re-audit

User recording `2026-10-01 19-03-32.mp4`, SHA-256 `2da82409caa7b1dc4ad74f1d188ae230d5bd8566f6939f388fb4abe7058096a6`, is a synchronized **two-monitor** 4480×1080 capture. The earlier partial audit incorrectly treated the canvas too much like one surface / 50-50 split. The actual horizontal layout is 1920 + 2560; evidence must be correlated across both monitors at the same timestamp.

Physically accepted after the corrected event-based re-audit:
- six+ animations-On compact↔expanded sequences: the CI #806 white L/blank boundary does not recur;
- active task/session/time continuity and no document scrollbar;
- Main `Blitz now` is visibly activated at ~5.2–5.4 s and the existing Focus surface presents Panel;
- expanded Timer retains task/title/time;
- Focus completion reconciles to Main Done;
- real mixed-DPI crossing around ~116–122 s: compact Timer is ~425 physical px on the 1920-wide side and ~340 px on the 2560-wide side; Windows settings explicitly show the latter at 100%, matching 125%→100%;
- lower-edge/taskbar constrained expansion remains visible and usable;
- real topology reduction/removal around ~136.5–142 s recovers Narro safely onto the surviving display without restart;
- compact Timer remains topmost over a maximized Notepad++ window during the cross-monitor sequence;
- Windows animations are visibly switched Off and restored On; the authoritative `docs/M7_CLOSURE_PLAN.md` does not require a separate two-cycle-Off count for closure.

Further re-audit then found the missing C4 event evidence:
- around 38 s Narro Main + active Timer are already visibly alive;
- around 39.25–40.75 s the desktop `narro.exe` is activated again;
- through at least ~41.5 s the same Main/Timer state persists with no competing Narro UI/reset/conflict, physically closing the second-launch single-instance observation;
- after completion, Focus reaches `All Clear` around ~146 s and remains there without placeholder/stale Timer or pulse until the next unrelated Alt-Tab interaction; combined with the explicit on-screen final shortcut procedure and user clarification that tests must be correlated event-wise, this is accepted as operator-context physical no-op evidence for idle T / Find Timer.

Still missing:
- no unambiguous tray Quit → same-build relaunch → saved-placement recovery appears anywhere in the recording.

The recording does not visibly show `Get-FileHash`; exact CI #809 identity is bound by the operator/test context rather than a pixel-readable hash.

Corrected durable evidence: `work-log/2026-10-02-chatgpt-m7-ci809-two-monitor-reaudit.md`. The prior `2026-10-01-chatgpt-m7-ci809-partial-physical-audit.md` remains immutable as the superseded first interpretation.

## M7 checkpoint state

- C1: PASS
- C2: PASS
- C3: PASS
- C4 / Gate 7 physical continuity: **PASS**. Visual/session/Blitz-now/reconciliation, second-launch ownership and idle no-op behavior are accepted on CI #809.
- C5 / Gate 12 + platform closure: **saved-placement restart PHYSICAL PASS on CI #873; formal reconciliation/new-observation disposition OPEN**. Mixed-DPI crossing, edge/taskbar placement, real topology-removal recovery and topmost-over-maximized-app retain their accepted CI #809 evidence.

Progress is now `5/10M || 5/5 | 14/19`. C5 saved-placement restart is now physically observed and PASS. This evidence publication preserves the concurrent M8 closure counters; formal M7 tracking/new-observation disposition remains separate.

## Invariants that must not regress

- Narro remains local-only Windows Tauri 2 + React/TypeScript + Rust + SQLite.
- Runtime window composition is only `main` + one persistent `focusSurface`.
- Focus Panel, compact Timer and expanded Timer are presentations inside the same persistent Focus HWND/WebView.
- Ordinary presentation switching must not create/destroy/hide/show/resize the WebView as its mechanism.
- Timer/session authority remains Rust-owned and continuous through presentation changes.
- Logical geometry remains Panel 340x700, compact Timer 340x110, expanded Timer 340x300 with DPI-aware native visible regions.
- Focus document roots must not expose browser scrollbars.
- Native presentation changes remain serialized and rollback-safe.
- `Blitz now` enters Focus Panel.
- Idle/no-task Ctrl+Shift+T and Find Timer must not expose a placeholder Timer.
- Single-instance ownership must prevent competing SQLite/background/global-shortcut authority.

## Unfinished work / exact next action

Two independent tracks remain:

1. **M7 automatic validation logger (agent-actionable):**
   - check PR #219 exact head
     `422230e755a373d3ccb61246e1917ff7934a1210`;
   - authoritative Windows CI #869 / run `37079768471` is the next decision
     point;
   - if CI fails, inspect the exact failing step/log and fix only the evidenced
     issue on PR #219;
   - if CI passes, verify the dedicated validation artifact and exact executable
     identity, expected-head guarded-merge #219, validate resulting main, then
     reconcile tracking;
   - do not change the PR #219 head while the current CI is still validating it
     unless a concrete failure requires a fix.
2. **Remaining physical Windows gates (user-action required):**
   - after #219 is validated, M7 C5 uses the validated
     `narro-m7-validation.exe` and its automatic `Narro-M7-Logs` evidence;
   - M1 B/C/D use final Candidate B from CI #866, artifact id `11257763093`,
     EXE SHA-256
     `7168dbca6e72484d0782f0541460103144162d9dd5f0355cc7df8e321c6e45c3`.

Validated #216/#866 evidence remains useful:
- main CI #854 and #866 PASS;
- real Panel↔Timer HWND movement physically captured by CI artifact;
- one-click monitor matrix + reconnect reuse;
- 3× performance batch + native scenario preflight;
- validated diagnostic storage isolation;
- production AppData backup helper for the legacy M7 physical path.

Do not use the reopened Milestone 1 physical gates as a blanket blocker for independent later work. Continue independently safe M8 slices under the manual-test batching policy; M9 remains deferred while unblocked M8 work remains.

Physical procedure:
`docs/M1_FINAL_REPLACEMENT_PHYSICAL_BATCH.md`.

## Deferred unrelated work

- M9 remains ordered after M8; it is not blocked merely by the pending M1/M7 physical observations.
- Historical M9 PR references must not be treated as implementation continuation points without checking live GitHub. Current open M9 PRs are #205 (nonvisual Overview command/API boundary; exact head `96498085a4bd1e9935c1a2f3ca75bee905a10678`, CI #886 PASS) and #198 (provisional Reports visual foundation; exact head `a0364a72b6c01c29d1e4d5b7ca44d2883d0e2dd7`, CI #775 PASS). Re-check their live state before acting; #198 remains subject to the Reports/Sessions Pass-3 parity-reconciliation gate.
- Static-contract cleanup remains maintenance-only and is not an M7 blocker.


Durable resulting-main artifact evidence: `work-log/2026-10-03-chatgpt-m7-main873-validation-artifact-ready.md`.


Final resulting-main validation evidence: `work-log/2026-10-03-chatgpt-m7-main873-final-validation-artifact.md`.


Active M8 PREF-R05 checkpoint: `work-log/2026-10-03-chatgpt-m8-pref-r05-pr220-ci876.md`.
