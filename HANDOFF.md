# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant immutable `work-log/*.md` entries. Read `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever timer/session or Focus reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **6 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

Compact progress basis: **5/10 milestones complete; item-7 slice 2/5 checkpoints; M6 6/16 items validated.**

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `17d7f9a2a99bd33a43f02afb7d81201c1dc23195`

Source tree: `3476df620697441df7d98b81e3d78d80aa08cbf4`

This is the resulting-main source/test SHA of PR #106 after authoritative Windows main CI #409 passed. It contains the validated PR #105 production Focus live-action implementation plus the PR #106 test-only state-contract assertions. Markdown-only tracking descendants do not replace this source/test baseline.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 6/16 — Implement break, notes, pause/resume, skip, finish.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-actions.md`.

- PR #105 production exact head `26c431de9f3c318bce15325c51ef767988d7ece5`; Windows PR CI #407 / run `34749228254` / job `103702560465`: **SUCCESS**.
- PR #106 test-only exact head `d6d969b7eaaf4e2fe5ee443236437e070c3b0a1f`; Windows PR CI #408 / run `34750003487` / job `103704719842`: **SUCCESS**.
- expected-head guarded PR #106 merge/source SHA `17d7f9a2a99bd33a43f02afb7d81201c1dc23195`, tree `3476df620697441df7d98b81e3d78d80aa08cbf4`.
- Windows resulting-main CI #409 / run `34750884431` / job `103707110038`: **SUCCESS**.
- main visual artifact `10315666938`, digest `sha256:e3d6e5733612f9a2f236773614271e3ed02289ca7c6836555c139c0a67665378`.
- main diagnostic artifact `10316660232`, digest `sha256:eba28cfd98279589d912e67f7c98a7963065d5b68293739add61180acb21604b`.

Validated item-6 behavior remains Break, Notes, Pause/Resume, Skip, Done through existing authoritative M3/M5 boundaries, with tracked Time Taken preserved, future-timed tasks excluded, explicit-only Notes URL opening, and no renderer-owned timer/session authority.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 7/16 — Implement subtasks/progress in focus mode.**

Implementation branch: `m6-focus-subtasks`.

Current small-slice progress: **2/5**.

### Checkpoint 1/5 — COMPLETE: exact Focus subtask/progress contract reconstructed

Current product/UI/source evidence plus the validated M2/M5 subtask implementation establish:

- the active Focus task exposes subtask progress, count, add, expand/collapse, completion checkbox and completed strike-through behavior;
- Focus uses the same durable `BoardSubtask` identities/order/completion state as Main/List Board; no renderer-only subtask record model is allowed;
- authoritative row reads use `getListBoardTaskSubtasks(taskId, listId)`;
- create, title edit, complete/reopen, reorder and delete reuse the existing persistence-first list-board subtask mutation APIs and their expected-value/order guards;
- the active live card already carries the parent `data-task-id`, so the validated `TaskSubtasks` parent-identity guard can be reused safely;
- progress must reconcile the task projection counts with the authoritative task-scoped subtask snapshot after a saved mutation;
- a saved mutation followed by refresh failure is committed success, not mutation failure: Focus must block unsafe repeat edits until reopened/refreshed;
- the Focus collapsed surface shows a source-evidenced progress ring, `n/m Subtasks`, add and expand/collapse controls; expanded rows reuse the existing accessible `TaskSubtasks` component;
- item 7 does not add paused EST/Time Taken editing, monitor/display behavior, title scrolling/two-line work, row hover-slot/tooltips polish, later visual states/empty states, Floating Timer work, Settings, Reports or release scope.

The history-risk index warning about subtasks disappearing in Focus is addressed by projecting the same persisted records rather than a separate Focus-only copy.

### Checkpoint 2/5 — COMPLETE: narrow implementation + deterministic/static/visual coverage + semantic/diff review

Implemented scope:

- new `src/FocusLiveSubtasks.tsx` owns only Focus presentation/orchestration around existing list-board subtask APIs;
- collapsed live-task surface renders a fixed progress ring, authoritative projected count, Add and expand/collapse controls;
- expansion loads a task-scoped authoritative subtask snapshot and reuses `TaskSubtasks` for row editing/completion/reorder/delete behavior;
- successful subtask mutations perform a combined authoritative subtask + current Focus board refresh and reconcile projected completed/total counts before publishing the refreshed local subtask projection;
- post-commit refresh failure is explicitly reported as saved-but-not-refreshed, sets a refresh blocker, and prevents unsafe repeat mutation attempts;
- reorder reuses the existing expected-order contract; title/completion/delete reuse existing expected-value/update-time contracts;
- `FocusLiveActions` only composes `FocusLiveSubtasks`; existing item-6 timer/action code is otherwise unchanged;
- Focus-specific CSS provides stable toolbar/ring/expanded-row geometry without importing the full Main-window board stylesheet into the focus bundle;
- the old passive live-meta subtask text is hidden so the new progress surface is the single visible Focus subtask count;
- deterministic Focus fixture now measures the collapsed subtask surface/ring in light/dark Windows captures;
- `scripts/test-ui-focus-panel.mjs` statically locks authoritative reads/mutations, reconciliation, committed-refresh failure semantics, identity guard reuse, progress/add/toggle markers, no renderer timer authority, no implicit URL opening and unchanged item-6 action ordering;
- `scripts/validate-focus-panel-captures.mjs` locks DOM/accessibility/geometry for the collapsed progress surface across light/dark themes;
- React StrictMode mounted-guard behavior was corrected before PR creation so development double-effect setup cannot suppress later authoritative refresh state updates;
- syntax-only TypeScript transpilation of the new `FocusLiveSubtasks.tsx` with TypeScript 5.8.3 produced **0 diagnostics**;
- branch diff from reconciled main is limited to `src/FocusLiveSubtasks.tsx`, `src/FocusLiveActions.tsx`, `src/focusPanel.css`, `src/focusPanelVisualFixture.tsx`, `scripts/test-ui-focus-panel.mjs`, `scripts/validate-focus-panel-captures.mjs`, plus this in-progress handoff. No Rust/Tauri source, schema/migration, dependency/lockfile, timer engine, scheduling policy, Main-window UI, Floating Timer, shortcuts/preferences, Reports or release scope changed.

Full repository Node/Rust/Tauri preflight is **NOT RUN locally** in this connector-oriented environment. Authoritative Windows CI is required on the exact PR head.

### Five checkpoints for this slice

1. mandatory reconstruction + exact Focus subtask/progress contract from current docs/source/fixtures and validated M2/M5 subtask APIs — **COMPLETE**;
2. narrow implementation + deterministic/component/static coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of existing authoritative Rust/domain state; React cannot become parallel timer/session/task authority.
- `main` and `focusSurface` remain the normal two-webview architecture.
- stable task and subtask identities/order/completion state remain authoritative and persistence-first; Focus cannot create a second subtask persistence path.
- live Focus progress derives from authoritative task/subtask state and updates only after saved mutation plus authoritative refresh/reconciliation.
- a committed subtask mutation cannot be reported as mutation failure merely because its secondary refresh failed; unsafe retry is blocked instead.
- Break, Notes, Pause/Resume, Skip and Done behavior validated in item 6 must not regress.
- tracked Time Taken, work/break separation, recovery, sleep policy, `Time's Up`/overtime and Pomodoro semantics remain M3 authority.
- Notes URLs remain explicit pointer/keyboard actions only.
- future-timed Today tasks remain ineligible until due.
- existing live timer geometry/sampling and Remaining/Scheduled/Done identity partitioning must not regress.
- item 7 must not absorb item 8 paused EST/Time Taken editing, monitor placement/display hotplug, title scrolling/two-line work, action-slot/tooltips polish, later visual-state/empty-state work, Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports or Milestone 10 release work.
- diagnostics remain gated behind `?diagnostics=1`.

## UNFINISHED WORK / EXACT NEXT ACTION

Open one PR from `m6-focus-subtasks` at its current exact head. Require authoritative Windows CI on that exact head: Repository Preflight including TypeScript/Vite and Focus static gates, Windows Focus light/dark capture/validation, Tauri Release and required artifact uploads. Do not change implementation unless CI or final review provides evidence.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 7.
- Full local Node/Rust/Tauri repository validation is **NOT RUN**; authoritative Windows GitHub Actions is required before merge.
