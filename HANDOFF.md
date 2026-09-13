# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant immutable `work-log/*.md` entries. Read `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever timer/session or Focus reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **7 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

Compact progress basis: **5/10 milestones complete; item-8 slice 2/5 checkpoints; M6 7/16 items validated.**

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `cadc4eab7a04c2b4defccf085f7658d031ff8328`

Source tree: `be9c421f2e769ff2842c103b92203680609ef32a`

This is the expected-head guarded squash merge of PR #107 after authoritative resulting-main Windows CI #411 passed. Markdown-only tracking descendants, including the item-7 immutable log and tracking reconciliation commits, do not replace this source/test baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 7/16 — Implement subtasks/progress in focus mode.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-subtasks.md`.

- PR #107 exact head `00b1d7290cf8ea09fe3b5b986b203bd44406d720`, tree `be9c421f2e769ff2842c103b92203680609ef32a`.
- Windows PR CI #410 / run `34754810013` / job `103717290439`: **SUCCESS**.
- PR visual artifact `10317231156`, digest `sha256:ee3b07a3853fa04bec91445d0579f1f9786bc21dc92629de25d733be93fe81e3`.
- PR diagnostic/runtime-harness artifact `10317120955`, digest `sha256:5a0ba23305c1d34b973c81cdd834a50c594d87b6f8076860be64708456b35a01`.
- expected-head guarded squash merge/source SHA `cadc4eab7a04c2b4defccf085f7658d031ff8328`, tree `be9c421f2e769ff2842c103b92203680609ef32a`.
- Windows resulting-main CI #411 / run `34756977752` / job `103722921099`: **SUCCESS**.
- main visual artifact `10317784445`, digest `sha256:240f3330e0c6ee0935d25d67abdab90d7852d0ea1c194ea9c90cf50788dcb0e9`.
- main diagnostic/runtime-harness artifact `10318046699`, digest `sha256:f5195bda2a5d8902e916dffdda79b074d909184be5cb564f0762812d38a67bea`.

Validated item-7 behavior remains: Focus projects the same persisted `BoardSubtask` identities/order/completion state as Main/List Board, reuses `TaskSubtasks`, reconciles task-scoped subtask snapshots with board progress after saved mutations, and treats post-commit refresh failure as committed success with unsafe retries blocked.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 8/16 — Permit EST/Time Taken editing only while paused.**

Implementation branch: `m6-focus-paused-metrics`.

Current small-slice progress: **2/5**.

### Checkpoint 1/5 — COMPLETE: exact Focus paused-metric contract reconstructed

Current product/UI/source evidence plus validated M3/M5 metric-edit behavior establish:

- Focus always projects authoritative live-task EST and Time Taken metadata, but editing is available only when the exact authoritative live task is `paused` or `overtime_paused`;
- running, break, `time_up`, `overtime_running`, idle, or a different task identity remain read-only;
- live EST writes must reuse `setPausedTimerEstimate` / `timer_set_estimate` with expected task/list/EST guards and existing runtime/checkpoint semantics;
- live Time Taken writes must reuse `setPausedTimerTimeTaken` / `timer_set_time_taken` with expected authoritative-total guard and the validated M3 manual-adjustment/session rebase boundary; Focus must never compute or persist a renderer-only elapsed total;
- draft parsing mirrors the validated M5 `H:MM:SS` contract and Rust `u32` editable range: blank EST clears it, zero EST is rejected, and Time Taken cannot be blank;
- after a successful timer command, the returned monotonic timer payload is applied before secondary board refresh so runtime/countdown rebase is immediate;
- board refresh must find the same task/list identity and reconcile the saved EST/Time Taken value before publishing the refreshed local metric projection;
- a committed metric mutation followed by board refresh/reconciliation failure is saved success: Focus reports saved-but-not-refreshed, blocks more metric edits, and requires reopening Focus rather than inviting an unsafe retry;
- if authoritative timer state leaves paused/overtime-paused while an editor is open, the renderer closes the editor; backend pause/task/expected-value guards remain the final concurrency boundary;
- item 8 does not change timer/session Rust behavior, schema, scheduling, monitor placement, title behavior, later Focus visual states, Floating Timer, Settings, Reports, or release scope.

The history-risk requirement is explicit: post-pause/manual Time Taken editing must not create timer-vs-ledger divergence or snap back on resume/Done.

### Checkpoint 2/5 — COMPLETE: narrow implementation + deterministic/static/visual coverage + semantic/diff review

Implemented scope:

- new `src/FocusLiveMetrics.tsx` composes existing `setPausedTimerEstimate` / `setPausedTimerTimeTaken` APIs; no new persistence or timer command exists;
- the live Focus card now shows EST and Time Taken in a dedicated metric surface through `FocusLiveActions`;
- non-paused states render plain read-only metric text rather than disabled edit controls;
- exact live-task `paused` / `overtime_paused` states expose edit controls; leaving those states closes an open editor;
- saves retain expected EST / expected authoritative Time Taken guards and publish the returned authoritative timer payload before secondary board refresh;
- refresh validates task/list identity and exact saved metric value; committed-refresh failure sets a local blocker and distinct saved-but-stale status/error;
- Focus metric CSS is isolated in `src/focusLiveMetrics.css` with stable three-column edit geometry and tabular duration numerals;
- `FocusLiveActions` only composes the metric surface and blocks opening/saving metrics while one of the existing live actions is already pending; item-6 action logic/order is otherwise unchanged;
- the existing running Focus visual fixture remains intact and now proves metric read-only behavior;
- an additional `paused-metrics` light/dark Windows fixture proves paused state, EST input, Save/Cancel controls, Time Taken edit affordance, Resume label, fixed timer width and metric geometry without replacing running coverage;
- `scripts/test-ui-focus-panel.mjs` statically locks exact-task paused gates, typed paused metric commands, expected-value guards, H:MM:SS/range validation, timer-payload-before-board-refresh ordering, reconciliation, committed-refresh failure semantics, read-only/edit markers, and absence of generic non-live metric writes or renderer elapsed clocks;
- `scripts/validate-focus-panel-captures.mjs` validates running read-only metrics and paused editable metrics across light/dark captures while preserving hierarchy/timer/subtask/action/queue regression checks;
- branch diff from tracking tip `5b8743d31d2fc1901cbe18308d2686617a2af9ae` is limited to Focus frontend metric source/CSS, Focus action composition, Focus static/visual scripts, visual fixture, and this handoff. No Rust/Tauri source, schema/migration, dependency/lockfile, scheduling policy, Main-window UI, monitor/display policy, Floating Timer, shortcuts/preferences, Reports or release scope changed.

Full repository Node/Rust/Tauri preflight is **NOT RUN locally** in this connector-oriented environment. Authoritative Windows CI is required on the exact PR head.

### Five checkpoints for this slice

1. mandatory reconstruction + exact paused Focus EST/Time Taken editing contract from current docs/source and validated M3/M5 metric-edit boundaries — **COMPLETE**;
2. narrow implementation + deterministic/component/static/visual coverage + semantic/diff review — **COMPLETE**;
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
- paused manual Time Taken edits use the validated authoritative runtime/session rebase boundary; Focus cannot write a display-only value that snaps back on resume/pause/Done.
- live EST editing uses the validated paused timer estimate boundary and remains unavailable while running, in break, at Time's Up, overtime-running or idle.
- successful authoritative metric mutation cannot be reported as failed merely because secondary board refresh failed; further metric edits are blocked until Focus is reopened/refreshed.
- future-timed Today tasks remain ineligible until due.
- Notes URLs remain explicit pointer/keyboard actions only.
- live timer geometry/sampling, Focus queue partitioning and subtask identity/progress must not regress.
- item 8 must not absorb selected-monitor/left-right placement, display hotplug, title scrolling/two-line work, action-slot/tooltips polish, later visual-state/empty-state work, Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports or Milestone 10 release work.
- diagnostics remain gated behind `?diagnostics=1`.

## UNFINISHED WORK / EXACT NEXT ACTION

Open one PR from `m6-focus-paused-metrics` at its current exact head. Require authoritative Windows CI on that exact head: Repository Preflight including TypeScript/Vite and Focus static gates, Windows running + paused-metric Focus light/dark capture/validation, Tauri Release and required artifact uploads. Do not change implementation unless CI or final review supplies evidence.

If exact-head PR CI succeeds, perform final same-head semantic/file-scope review, verify no unresolved PR discussion, then expected-head guarded squash merge. Require resulting-main Windows CI on the exact source merge SHA before marking item 8 complete or updating `TODO.md` to `[x]`.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 8.
- Full local Node/Rust/Tauri repository validation is **NOT RUN**; authoritative Windows GitHub Actions is required before merge.
