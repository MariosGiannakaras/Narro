# HANDOFF.md

Canonical zero-context continuation state for Narro. Before changing source, read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, active Milestone 6 in `TODO.md`, relevant `STATUS.md`, Focus/Blitz sections in `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, `docs/BEHAVIOR_MATRIX.md`, and the newest relevant immutable `work-log/*.md` entries. Read `docs/BLITZIT_HISTORY_RISK_INDEX.md` whenever timer/session reliability risks apply. Inspect open implementation PRs and exact CI state before making changes.

## CURRENT MILESTONE

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestones 1–5: COMPLETE / PASS.
- Milestone 6: ACTIVE / **5 of 16** top-level items validated.
- Milestones 7–10: NOT STARTED.

Compact progress basis: **5/10 milestones complete; item-6 slice 2/5 checkpoints; M6 5/16 items validated.**

## CURRENT VALIDATED SOURCE BASELINE

Source/test SHA: `c74985c117aa4ac550ad6ade1442f28c998c5f49`

Source tree: `8eaf157fdb4d5c4d9db12091c6149e8c4ae1108b`

This is the resulting-main source SHA of PR #104 after authoritative Windows main CI #406 passed. Markdown-only tracking descendants do not replace it.

## LATEST COMPLETED IMPLEMENTATION / CI

**M6 item 5/16 — Show remaining/scheduled/done sections matching documented focus workflow.**

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-workflow-sections.md`.

- PR #104 final exact head `129687c381b84a91e76d008e8163c5b8bade21aa`;
- Windows PR CI #405 / run `34747582849` / job `103698237432`: **SUCCESS**;
- expected-head guarded squash merge source SHA `c74985c117aa4ac550ad6ade1442f28c998c5f49`;
- Windows main CI #406 / run `34748317733` / job `103700208950`: **SUCCESS**;
- main visual artifact `10314173991`, digest `sha256:ef8cbf16d39b327d410605371bb81f44c359693fc151b1c68b03123df82f36df`;
- main diagnostic artifact `10315251351`, digest `sha256:628a0ad331df9dca01e1588d37ad310a3470859f7dccac727e54a8db4da514a1`.

Validated item-5 behavior locks live-task exclusion, ordinary/overdue Remaining work, future-timed Scheduled separation, authoritative Done projection, stable identity partitioning, section counts/markers and exact hierarchy. No production source rewrite or new mutation semantics were required.

## ACTIVE IMPLEMENTATION SLICE

**M6 item 6/16 — Implement break, notes, pause/resume, skip, finish.**

Implementation branch: `m6-focus-actions`.

Current small-slice progress: **2/5**.

### Checkpoint 1/5 — COMPLETE: exact action/state contract reconstructed

Repository source/spec/evidence and the validated M3/M5 implementation establish:

- action order is Break, Notes, Pause/Resume, Skip, Done;
- Break uses the authoritative manual work->break transition, which closes the work session, opens a distinct break session and automatically resumes the same work task when a manual break expires;
- manual break may begin from running or paused work, but not Time's Up or an existing break;
- while a break is active, the Pause/Resume slot becomes Resume and an early return uses authoritative `timer_skip_break`; Skip and Done remain unavailable until work resumes;
- Pause/Resume reuses the idempotent M3 transitions and supports normal and overtime running/paused states;
- Skip must move to the next eligible task rather than stop and immediately restart the same top task; it therefore refreshes the authoritative board + timer projection, excludes the current identity/future-timed rows, and uses one persistence-first `timer_switch_task` when a next task exists, falling back to `timer_skip_task` only when no next eligible row exists;
- Done must use the M3 coupled completion boundary so tracked Time Taken cannot become `00:00`; the next eligible row is selected from a fresh authoritative Focus projection and may be started only after completion commits;
- a failure to start the next task after Done is a secondary failure: the committed completion remains success and must not be reported as a failed completion or invite an unsafe retry;
- Notes reuse the validated M5 `TaskNotes` editor/viewer, including compact editing, larger/resizable presentation, spellcheck and explicit pointer/keyboard-only URL opening;
- item 6 does not add subtasks/progress, paused EST/Time Taken editing, monitor placement, title behavior, hover-slot/tooltips polish or later visual-state/empty-state work.

The current manual-break value is the established schema/product default of 10 minutes. M8 remains responsible for exposing/persisting user-configurable break duration in Preferences; item 6 does not prematurely add that settings UI.

### Checkpoint 2/5 — COMPLETE: narrow implementation + deterministic/visual coverage + semantic/diff review

Implemented scope:

- `FocusLiveActions.tsx` adds a stable five-control action strip inside the existing active live card;
- timer mutations are typed wrappers over existing registered Rust commands; no renderer elapsed/session authority or new timer engine semantics were introduced;
- Break, Pause/Resume and early break Resume map directly to the validated authoritative transitions;
- Skip obtains a fresh `ListBoardSnapshot` and timer snapshot before choosing the next eligible row; a stale live-task identity aborts instead of switching from a different task;
- next-task mode preserves the current Pomodoro work/break snapshot when Pomodoro is active, otherwise resolves EST countdown from the authoritative task estimate or count-up fallback;
- Done commits through `timer_complete_task` first, then best-effort starts the already-selected next eligible task; secondary start failure is reported as a continuation warning while completion remains committed;
- Notes reuse `TaskNotes`; Focus supplies the external Notes trigger and suppresses only the duplicate internal trigger while keeping the validated editor, larger presentation and explicit URL activation path intact;
- action errors/status are local and accessible; existing revisioned timer events continue to refresh planning state in the parent Focus Panel;
- running-state production fixture now includes and measures the five-action strip in both Windows light/dark capture validation;
- static Focus preflight now guards authoritative command wrappers, fresh-board/timer checks, stale-task protection, committed-completion semantics, action ordering, Notes reuse, no renderer clock, no implicit URL opener and unchanged live timer/queue invariants;
- exact branch diff from reconciled main is limited to `src/FocusLiveActions.tsx`, `src/FocusPanel.tsx`, `src/timerSessionApi.ts`, `src/focusPanel.css`, `src/focusPanelVisualFixture.tsx`, `scripts/test-ui-focus-panel.mjs`, `scripts/validate-focus-panel-captures.mjs`, plus this HANDOFF checkpoint text. No Rust/Tauri source, schema/migration, dependencies/lockfile, scheduling policy, main-window UI, Floating Timer, shortcuts/preferences, Reports or release scope changed.

Attempted extra local clone/static execution is **NOT RUN** because the container cannot resolve `github.com`; existing source remains connector-only for validation. Manual semantic review found no evidence-backed reason for further source changes. Authoritative Windows CI is required on the exact PR head.

### Five checkpoints for this slice

1. mandatory reconstruction + exact Focus action/state contract from current docs/screenshots, existing M3 timer/session APIs/events and M5 Notes APIs — **COMPLETE**;
2. narrow implementation + deterministic/component/static coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — pending;
4. final exact-head review + expected-head guarded merge — pending;
5. resulting-main Windows CI + `TODO.md`/`STATUS.md`/`HANDOFF.md`/immutable work-log reconciliation — pending.

## INVARIANTS THAT MUST NOT REGRESS

- Focus Panel and Floating Timer remain presentations of the existing authoritative Rust-owned timer/session state; React cannot become parallel timer/session authority.
- `main` and `focusSurface` remain the normal two-webview architecture.
- Break, pause/resume, skip and finish reuse validated M3 persistence-first timer/session transitions and preserve tracked Time Taken, work/break separation, recovery, sleep policy, Time's Up/overtime and Pomodoro semantics.
- Successful authoritative mutation must not be reported as failed solely because a secondary continuation/event fails after commit.
- Notes reuse the validated local Notes document/API behavior; opening Notes or changing the live task never auto-opens URLs.
- User-visible URLs remain explicit pointer/keyboard actions only.
- Future-timed Today tasks remain ineligible until due; action controls cannot make them live early.
- Existing live timer geometry/sampling and Remaining/Scheduled/Done identity partitioning must not regress.
- Item 6 must not absorb item 7 subtasks/progress, item 8 paused EST/Time Taken editing, monitor placement, title scrolling/two-line work, action-slot/tooltips polish, later visual-state/empty-state work, Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Milestone 9 Reports or Milestone 10 release work.
- diagnostics remain gated behind `?diagnostics=1`.

## UNFINISHED WORK / EXACT NEXT ACTION

Open one PR for `m6-focus-actions` from the current exact branch head and require authoritative Windows CI on that exact head. Do not change implementation unless CI or final review produces evidence. Require Repository Preflight, TypeScript/Vite build, Focus Panel Windows light/dark visual capture/validation, Tauri Release and required artifact uploads before checkpoint 3.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user decision currently blocks M6 item 6.
- Local Node/Rust/Tauri preflight is **NOT RUN** because this environment cannot resolve GitHub to materialize the branch locally; authoritative Windows GitHub Actions is required before merge.
