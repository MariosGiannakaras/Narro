# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`, the newest relevant immutable `work-log/` entries, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT STATE

`4/10M || 4/5 | 14/19`

**Reopened Milestone 1 / M7 single-Focus physical closure remains active.** C1/C2/C3/C4 are PASS. The CI #809 event-based re-audit physically accepts the corrected compositor boundary, Blitz-now entry, task/session continuity, cross-window reconciliation, second-launch single-instance behavior, idle no-op result, mixed-DPI crossing, edge/work-area behavior, topology removal recovery and topmost behavior. No new product defect is evidenced. C5 remains OPEN only for saved placement across normal Quit→relaunch plus final tracking reconciliation.

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
- full repository MP4s: **3/19 SOURCE_COMPLETE** at Pass-3 depth;
- VE-018: one 9.344 s / 560-frame planning-board excerpt is **PARTIAL** deep evidence, not full VE-018 completion;
- VE-003 Blitz Mode: **SOURCE_COMPLETE** from the actual full MP4;
- VE-005 Add & Manage Tasks and Lists: **SOURCE_COMPLETE** from the actual full MP4;
- VE-013 Subtasks: **SOURCE_COMPLETE** from the actual full MP4;
- exact next video: **VE-014 — Blitzit Tutorial Preferences.mp4**;
- raw MP4 access is currently available through the isolated analysis-only media bridge; do not merge that bridge into main.

Do not edit implementation PR #213 or any source/test/config files from this forensic track. Implementation reconciliation is explicitly deferred.

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
- Resulting-main Windows CI #854 / run `37069188509` is active on implementation
  merge `007a999e688144122362ad1a4012a22b310e66f2`.
  Do not promote any diagnostic artifact to final Candidate B until #854 passes.
- Durable exact-head/merge checkpoint:
  `work-log/2026-10-03-chatgpt-m1-pr216-ci853-merge-checkpoint.md`.
- Earlier combined-main failure history and #215 diagnosis remain in:
  `work-log/2026-10-02-chatgpt-current-main-pr212-pr214-pr213-reconciliation.md`
  and `work-log/2026-10-02-chatgpt-ci840-focus-capture-pr215.md`.

### M7 production physical lineage

The accepted M7 C4/C5-path production physical candidate remains CI #809 source
`2767b3827670603d1ab259b6a843c2e0da82d85d` / PR #208, because the remaining
saved-placement observation is explicitly bound to that already-audited
candidate and later source slices did not modify the placement-persistence
implementation under test.

- PR #208 exact head: `d885a577c5e7f2e376ed1f6cf5e7f83146dfec58`.
- Exact-head Windows CI #809 / run `36865451660`: **PASS**.
- Resulting-main Windows CI #810 / run `36867438874`: **PASS**.
- PR #209 exact head `5384ea7384d304a843771e225bfb50cd9394bf43`
  passed full Windows CI #811 and regression-locks tray Quit -> save Timer
  placement -> process exit ordering without changing production runtime.
- CI #809 physical evidence remains the accepted M7 C4 baseline; C5 still needs
  the saved-placement restart observation and is not closed by later CI.

## Exact artifacts to use next

### M7 C5 production physical acceptance

Continue to use the already accepted CI #809 **production** physical artifact:

- artifact id `11163439039`
- artifact digest `sha256:39ca0a91d7aa54be79ca35c509f82f25049a15a3fc4ffff199699eab309557a5`
- standalone `narro.exe` SHA-256 `a4b8e163539f429769540480a7aa0b5db9ca6fa2c356d6742f78d687b5cb5675`
- physical-build smoke: PASS, zero CI `runtimeVisual` checkpoints

Packaged Focus visual artifact `11163582492`, digest `sha256:c184e661163bdf9ff1a9dd02859d7c9523add0a5edb6433d2f7ce8a29bf96cf9`, confirms one Focus HWND `0x1022A`, compact 340x110, expanded 340x300, active title/time and no unintended scrollers.

### Remaining M1 diagnostic/manual validation

**PENDING resulting-main CI #854.**

Do not use the historical CI #816 diagnostic artifact for the final B/C/D
session. The complete current harness is merged in PR #216 and final Candidate B
must be taken from successful resulting-main CI #854.

Until #854 completes, exact-head #216 artifact `11244174942` is supporting
evidence only. Final Candidate B must record:
- implementation merge `007a999e688144122362ad1a4012a22b310e66f2`;
- successful main CI run;
- resulting-main diagnostic artifact id/digest;
- contained diagnostic `narro.exe` SHA-256.

Required isolation remains:
- identifier `com.mariosg.Narro.M1Diagnostic`;
- Main `index.html?diagnostics=1`;
- product `focusSurface` `focus.html`;
- no `runtimeVisual`;
- storage-isolation UI must report PASS before B/C/D.



Do **not** use the diagnostic artifact to substitute for M7 C5 production saved-placement acceptance.

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
- C5 / Gate 12 + platform closure: **OPEN only for saved-placement restart + final reconciliation**. Mixed-DPI crossing, edge/taskbar placement, real topology-removal recovery and topmost-over-maximized-app are physically PASS.

Progress is now `4/10M || 4/5 | 14/19`. Do not advance C5 or milestone completion until saved-placement restart is physically observed.

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

1. **Current-main validation reconciliation (agent-actionable):**
   - inspect resulting-main Windows CI #854 / run `37069188509` for merge
     `007a999e688144122362ad1a4012a22b310e66f2`;
   - if PASS, inspect/download the resulting-main packaged Focus artifact and
     diagnostic artifact;
   - require the main runtime artifact to retain real Panel↔Timer HWND motion;
   - record final Candidate B artifact id/digest and diagnostic EXE SHA-256;
   - reconcile `HANDOFF.md`, `STATUS.md`, `TODO.md`,
     `docs/M1_FINAL_REPLACEMENT_PHYSICAL_BATCH.md`, and a new immutable
     work-log.
   - if #854 fails, inspect that exact failure before changing code.
2. **Remaining physical Windows gates (user-action required later):**
   - M7 C5 saved placement using the CI #809 production artifact and
     `scripts/prepare-m7-physical-session.ps1`; the preparer verifies the EXE
     hash and snapshots production `%APPDATA%\\com.mariosg.Narro` while Narro
     is stopped;
   - M1 selected-monitor/reconnect/performance using only the final successful
     resulting-main Candidate B diagnostic artifact.

PR #216 has already reduced the future manual burden:
- diagnostic app data is isolated under
  `com.mariosg.Narro.M1Diagnostic`;
- runtime identifier/storage isolation is shown and must PASS;
- monitor placement is one click for the complete monitor×Left/Right matrix,
  with each settled placement visible ~750 ms and native PASS/FAIL evidence;
- reconnect validation re-runs the same matrix after refreshed enumeration;
- performance batch preflights duplicate processes, destroyed Main HWND,
  visible compact Focus region and DPI before each of three child measurements.

Do not add parallel monitor/performance automation unless new evidence proves
these probes insufficient. Do not resume deferred M9 while reopened Milestone 1
remains incomplete.

Physical procedure:
`docs/M1_FINAL_REPLACEMENT_PHYSICAL_BATCH.md`.

## Deferred unrelated work

- PR #205 (`M9: expose validated Overview aggregation command/API`) remains open/deferred until M7 physical closure.
- PR #198 (`M9: add screenshot-backed Reports Overview visual foundation`) remains open/deferred.
- Static-contract cleanup remains maintenance-only and is not an M7 blocker.
