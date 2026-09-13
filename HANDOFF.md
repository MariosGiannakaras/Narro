# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant immutable `work-log/*.md` entries. Read `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever timer/session or Focus reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **8 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

Compact progress basis: **5/10 milestones complete; new item-9 slice 0/5 checkpoints; M6 8/16 items validated.**

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `7cfe942f9dda573106f8143772ebc87f498e5cc0`

Source tree: `eb6977360e8803166a35549e24af9f25fb12e2d3`

This is the expected-head guarded squash merge of PR #108 after authoritative resulting-main Windows CI #413 passed. Markdown-only tracking descendants, including the item-8 immutable log and reconciliation commits, do not replace this source/test baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 8/16 — Permit EST/Time Taken editing only while paused.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-paused-metrics.md`.

Validated behavior:

- Focus always displays authoritative live-task EST and Time Taken metadata;
- edit controls are available only when the exact authoritative live task is `paused` or `overtime_paused`;
- running, break, `time_up`, `overtime_running`, idle and mismatched task identities remain read-only;
- EST reuses `setPausedTimerEstimate` / `timer_set_estimate` and Time Taken reuses `setPausedTimerTimeTaken` / `timer_set_time_taken`; no Focus-only persistence/timer authority exists;
- existing expected-value guards, M5 `H:MM:SS` validation and Rust `u32` editable range remain authoritative;
- the successful timer command's monotonic payload is projected before secondary board refresh, preserving immediate runtime/countdown rebase semantics;
- board refresh must reconcile the exact task/list identity and saved metric value;
- if the mutation committed but secondary refresh/reconciliation fails, Focus reports saved-but-not-refreshed, blocks additional metric edits and requires reopening/refreshed Focus rather than unsafe retries;
- leaving paused/overtime-paused closes an open metric editor; backend task/state/expected-value guards remain final authority;
- item-6 live actions, item-7 subtask/progress behavior, live timer geometry/sampling and queue partitioning remain unchanged;
- static plus Windows running/paused-metrics light/dark visual coverage locks the state/geometry contract.

### PR #108 exact-head validation

- branch `m6-focus-paused-metrics`;
- exact head `39b399fa053b63763d8e3b5243feeccfd13a4295`;
- head tree `eb6977360e8803166a35549e24af9f25fb12e2d3`;
- Windows PR CI #412 / run `34768156548` / job `103752758975`: **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10321605266`, digest `sha256:128c4b29d02e0242ee21e4e1d12423a2ea5a5582663485c8a9d49e242c6bf7d6`;
- diagnostic/runtime-harness artifact `10321750409`, digest `sha256:a724ec7d152c27d3c035a4212c21c1030ed8608f37b569442539e8bab05ebe46`;
- final exact-head review: mergeable, unchanged validated head, expected eight-file Focus/tracking scope, no comments/reviews/unresolved threads.

### Merge / resulting-main validation

- expected-head guarded squash merge source/test SHA `7cfe942f9dda573106f8143772ebc87f498e5cc0`;
- source tree `eb6977360e8803166a35549e24af9f25fb12e2d3`;
- Windows main CI #413 / run `34768987050` / job `103754978629`: **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10321826013`, digest `sha256:cbf7539eb309156f6dd961d0563d79765a0ac3d760b8d780fb304115988edf08`;
- diagnostic/runtime-harness artifact `10321502031`, digest `sha256:84b9f3e90eee84367192e11b21b48bc044b6f0d3fa6b3c8496572e7fa84f4c4e`.

No Rust/Tauri source, database schema/migration, dependency/lockfile, timer/session engine semantics, scheduling policy, monitor/display behavior, Floating Timer behavior, shortcuts/preferences, Reports or release behavior changed in item 8.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 9/16 — Implement selected-monitor and left/right Focus Panel placement.**

No implementation branch has been created yet for item 9.

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. mandatory reconstruction + exact item-9 placement contract from current docs/source, validated M1 monitor/edge-positioning primitives and current preference/window-coordination paths — pending;
2. narrow implementation + deterministic/static/native coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of authoritative Rust/domain/native-window state; React cannot become parallel timer/session/task/monitor authority.
- `main` and `focusSurface` remain the normal two-webview architecture.
- item 9 must reuse the already validated native monitor enumeration/work-area/window-positioning authority from M1 where compatible; do not introduce a renderer-computed monitor geometry source of truth.
- selected-monitor and left/right placement must not absorb item 10 display-topology/hotplug reaction unless a direct dependency is proven.
- stable task/subtask/list identities, ordering and completion state remain persistence-first and authoritative outside renderer memory.
- Focus subtask progress remains authoritative and item-7 post-commit refresh-failure semantics must not regress.
- Break, Notes, Pause/Resume, Skip and Done behavior validated in item 6 must not regress.
- tracked Time Taken, work/break separation, recovery, sleep policy, `Time's Up`/overtime and Pomodoro semantics remain M3 authority.
- paused manual Time Taken edits use the validated authoritative runtime/session rebase boundary; live EST/Time Taken editing remains limited to the exact paused/overtime-paused live task.
- successful authoritative metric mutation cannot be reported as failed merely because secondary board refresh failed; further metric edits remain blocked until Focus is reopened/refreshed.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard actions only.
- live timer geometry/sampling, Focus queue partitioning and subtask identity/progress must not regress.
- item 9 must not absorb display-hotplug behavior, title scrolling/two-line work, action-slot/tooltips polish, later visual-state/empty-state work, Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports or Milestone 10 release work.
- diagnostics remain gated behind `?diagnostics=1`.

## UNFINISHED WORK / EXACT NEXT ACTION

Reconstruct item 9 before editing. Inspect the validated M1 monitor enumeration, work-area clamp and left/right positioning source/tests; current `focusSurface` window-coordination commands; the persisted preference fields already available for selected monitor/side; and relevant Focus product/UI evidence. Determine the narrowest native-authoritative path that places Focus Panel on the selected monitor at the chosen left/right edge without implementing item-10 live display-topology reaction.

After reconstruction, create one coherent item-9 branch from current main tracking tip, implement only the required placement behavior/tests, perform semantic/file-scope review, then open one PR and require authoritative Windows CI on the exact head.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 9.
- Local full Node/Rust/Tauri validation remains unavailable in this connector-oriented environment; authoritative Windows GitHub Actions is required before merge.