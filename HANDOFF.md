# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant immutable `work-log/*.md` entries. Read `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever timer/session or Focus reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **7 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

Compact progress basis: **5/10 milestones complete; new item-8 slice 0/5 checkpoints; M6 7/16 items validated.**

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `cadc4eab7a04c2b4defccf085f7658d031ff8328`

Source tree: `be9c421f2e769ff2842c103b92203680609ef32a`

This is the expected-head guarded squash merge of PR #107 after authoritative resulting-main Windows CI #411 passed. Markdown-only tracking descendants, including the item-7 immutable log and tracking reconciliation commits, do not replace this source/test baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 7/16 — Implement subtasks/progress in focus mode.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-subtasks.md`.

Validated behavior:

- the Focus live card projects the same persisted `BoardSubtask` identities/order/completion state used by Main/List Board; no Focus-only subtask record model exists;
- collapsed Focus shows a progress ring, authoritative `n/m Subtasks` count, Add and expand/collapse controls;
- expansion loads `getListBoardTaskSubtasks(taskId, listId)` and reuses `TaskSubtasks` for create, title edit, complete/reopen, reorder and delete;
- existing expected-value/order guards remain the persistence-first concurrency boundary;
- after a saved mutation, Focus refreshes task-scoped subtasks plus current board projection and reconciles completed/total counts before accepting the refreshed projection;
- if a mutation committed but secondary refresh/reconciliation fails, Focus reports saved-but-not-refreshed, blocks unsafe repeat mutations and requires reopening/refreshed Focus instead of misreporting the committed mutation as failed;
- the existing live-card `data-task-id` keeps the validated parent identity guard effective;
- item-6 Break, Notes, Pause/Resume, Skip and Done behavior remains unchanged;
- React StrictMode effect replay cannot permanently disable authoritative refresh state updates;
- static and Windows light/dark visual coverage lock the Focus subtask contract and compact geometry.

### PR #107 exact-head validation

- branch `m6-focus-subtasks`;
- exact head `00b1d7290cf8ea09fe3b5b986b203bd44406d720`;
- head tree `be9c421f2e769ff2842c103b92203680609ef32a`;
- Windows PR CI #410 / run `34754810013` / job `103717290439`: **SUCCESS**;
- visual artifact `10317231156`, digest `sha256:ee3b07a3853fa04bec91445d0579f1f9786bc21dc92629de25d733be93fe81e3`;
- diagnostic/runtime-harness artifact `10317120955`, digest `sha256:5a0ba23305c1d34b973c81cdd834a50c594d87b6f8076860be64708456b35a01`;
- final exact-head review: mergeable, unchanged head, no comments/reviews/unresolved threads, seven-file scope limited to Focus source/tests plus in-progress handoff.

### Merge / resulting-main validation

- expected-head guarded squash merge source/test SHA `cadc4eab7a04c2b4defccf085f7658d031ff8328`;
- source tree `be9c421f2e769ff2842c103b92203680609ef32a`;
- Windows main CI #411 / run `34756977752` / job `103722921099`: **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10317784445`, digest `sha256:240f3330e0c6ee0935d25d67abdab90d7852d0ea1c194ea9c90cf50788dcb0e9`;
- diagnostic/runtime-harness artifact `10318046699`, digest `sha256:f5195bda2a5d8902e916dffdda79b074d909184be5cb564f0762812d38a67bea`.

No Rust/Tauri source, database schema/migration, dependency/lockfile, timer/session engine semantics, scheduling policy, monitor/display policy, Floating Timer behavior, shortcuts/preferences, Reports or release behavior changed in item 7.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 8/16 — Permit EST/Time Taken editing only while paused.**

No implementation branch has been created yet for item 8.

Current small-slice progress: **0/5**.

### Five checkpoints for this slice

1. mandatory reconstruction + exact paused Focus EST/Time Taken editing contract from current docs/source and validated M3/M5 metric-edit boundaries — pending;
2. narrow implementation + deterministic/component/static coverage + semantic/diff review — pending;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of authoritative Rust/domain state; React cannot become parallel timer/session/task authority.
- `main` and `focusSurface` remain the normal two-webview architecture.
- stable task/subtask/list identities, ordering and completion state remain persistence-first and authoritative outside renderer memory.
- Focus subtask progress remains authoritative and item-7 post-commit refresh failure semantics must not regress.
- Break, Notes, Pause/Resume, Skip and Done behavior validated in item 6 must not regress.
- tracked Time Taken, work/break separation, recovery, sleep policy, `Time's Up`/overtime and Pomodoro semantics remain M3 authority.
- paused manual Time Taken edits must use the already validated authoritative session/runtime rebase boundary; Focus must not write a display-only Time Taken value that can snap back on resume/pause/Done.
- EST editing for a live task must use the existing authoritative paused timer/estimate boundary and must not become available while timer work is running, in break, at Time's Up, or otherwise outside the specified paused states unless current source evidence proves a different contract.
- successful authoritative metric mutation cannot be reported as failed merely because a later secondary UI refresh fails; unsafe retry behavior must remain explicit and evidence-backed.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard actions only.
- live timer geometry/sampling, Focus queue partitioning and subtask identity/progress must not regress.
- item 8 must not absorb selected-monitor/left-right placement, display hotplug, title scrolling/two-line work, action-slot/tooltips polish, later visual-state/empty-state work, Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports or Milestone 10 release work.
- diagnostics remain gated behind `?diagnostics=1`.

## UNFINISHED WORK / EXACT NEXT ACTION

Reconstruct item 8 before editing. Inspect the validated M3 paused metric mutation APIs/runtime behavior (`setPausedTimerEstimate`, `setPausedTimerTimeTaken` and their Rust commands/tests), the M5 `TaskCard`/`ListBoard` metric editor state and validation rules, current `FocusPanel`/live card, and relevant Focus product/UI evidence. Determine the narrowest way to expose EST and Time Taken editing in Focus **only** while the authoritative live timer is paused, while preserving persistence-first success, runtime/session rebase semantics and fixed live-card/timer geometry. Add deterministic/static/visual coverage only for item 8, then create one coherent feature branch/PR and require authoritative Windows CI on the exact head.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 8.
- Local full Node/Rust/Tauri validation remains unavailable in this connector-oriented environment; authoritative Windows GitHub Actions is required before merge.