# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, `docs/UI_UX_SPEC.md`, `docs/PRODUCT_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **16 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`a7e6ed1d89d7592e1bf514e56f1e47e63495cbad`

This is the merged result of PR #88 — `M5: add task creation and inline editing`.

Validation evidence:

- final PR #88 head `ce89c473a7306982ce43a8a07fce43f3ecc1ee02`;
- Windows PR CI #331 / run `34340494624` / job `102429916044`: **SUCCESS**;
- PR Repository Preflight, visual capture/upload, Tauri release and diagnostic artifact upload: **PASS**;
- PR visual artifact `10099815643`, digest `sha256:0f993845d8d302095c05be8a3edcca6c9dce65c2859e7ae7118ad19d0f4436c5`;
- PR diagnostic artifact `10100064241`, digest `sha256:1cf9061d914157a5bbb01897f04d8e0b261ee0e8a1e0dd5debecaf0b7222f25a`;
- PR merged with expected-head guard at `2026-09-09T10:46:29Z`;
- merged main source SHA `a7e6ed1d89d7592e1bf514e56f1e47e63495cbad`, tree `bc5b22bc7093a7355b6bb0f93e1e88aa54d3a893`;
- Windows main CI #332 / run `34342022923` / job `102434764558`: **SUCCESS**;
- main Repository Preflight, visual capture/upload, Tauri release and diagnostic artifact upload: **PASS**;
- main visual artifact `10100383350`, digest `sha256:84facb757045e2f3a47ea128829b116bcad9784165c72e577ef58463c79fe9f7`;
- main diagnostic artifact `10100609210`, digest `sha256:6434366a5f35dff7f2a411292fb9e9cf5fc2349515edef80b7f79f60f2332ac6`.

Markdown-only tracking descendants do not replace this validated source/test baseline. Detailed evidence: `work-log/2026-09-09-1432-chatgpt-m5-task-create-inline-edit.md`.

## ACTIVE IMPLEMENTATION

**M5 Main UI — EST and Time Taken display/edit states.**

Active branch:

`m5-est-time-taken-edit`

Branch base / latest tracking tip when created:

`68d1a38874cf7d1c6988f11cd58fc28a8d050d84`

No implementation PR exists yet for this slice.

## USER-FACING PROGRESS

**`M-5/10 | 1/5 | 16/28`**

Current five checkpoints:

1. mandatory inspection + narrow EST/Time Taken mutation/UX contract — **COMPLETE**;
2. authoritative persistence/runtime/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — **IN PROGRESS**;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + tracking reconciliation — PENDING.

## INSPECTION FINDINGS / IMPLEMENTATION CONTRACT

Repository and product evidence establish the following contract.

### Existing authoritative data boundaries

- `ListBoardTask` already projects `estSeconds` and effective `timeTakenSeconds`; ordinary task cards already display both read-only.
- Effective Time Taken is authoritative work-session duration plus `manual_time_adjustment_seconds`; break duration is excluded.
- `persistence::task_metadata::set_task_time_taken` is the correct non-live metadata boundary and explicitly rejects a task with an open focus session.
- `TimerRuntime::set_time_taken_while_paused` is the validated live-task boundary: it requires Paused/OvertimePaused, validates open work-session/checkpoint bindings, rebases the durable manual adjustment transactionally, preserves raw session history and survives resume/recovery/Done without snap-back.
- `TimerController` already publishes `TimeTakenRebased`; `timer_set_time_taken` exists, but before renderer production use it needs an expected task binding so a stale editor cannot apply a value to a newly switched live task.
- The timer session projection already has monotonic revisions and a renderer listener/snapshot API. The List Board may consume that projection as presentation state; it must not become timer authority.

### EST correctness dependency

- The active timer checkpoint stores `TimerMode`, including `EstCountdown { est_ms }`; therefore a live-paused EST edit cannot update only `tasks.est_seconds`.
- For a live paused non-Pomodoro task, EST mutation must update the task row and durable timer mode/checkpoint through one persistence-success boundary. Otherwise the task card and authoritative countdown can diverge after resume/recovery.
- Pomodoro remains timer-display precedence. Editing the task EST while Pomodoro is paused changes task EST metadata but does not replace the active Pomodoro mode.
- For CountUp/EST-countdown live tasks, clearing EST changes the paused runtime to CountUp; setting EST changes it to EstCountdown while preserving accumulated work/session identity.
- If a newly set EST is already at/below the accumulated current work interval, the authoritative runtime may immediately become `TimeUp` rather than retaining an invalid countdown or producing arithmetic underflow. No work duration is discarded.
- Live EST edits are accepted only from `Paused` or `OvertimePaused`; running, break and `TimeUp` states remain non-editable.

### Stale-write and scope rules

- Add null-safe expected-prior EST and expected-list guards for estimate edits. An EST edit changes only `est_seconds`/`updated_at`; it must never rewrite title, Time Taken, schedule, completion, identity, lane or order.
- Add expected task/current-total guards for manual Time Taken edits. A stale editor must fail rather than overwrite a newer session/manual-time result or act on a switched live task.
- Non-live EST and Time Taken editing is available from a real individual List Board, including Done where the task is no longer live; aggregate All Lists remains read-only for mutation.
- If the task becomes live while a non-live editor is open, the non-live backend must reject the write and require the live runtime boundary.
- If the live task/state changes while an editor is open, the live backend must reject stale/non-paused binding rather than retargeting the mutation.
- Existing source rule remains: live title editing is not available on the board; title edits for a live task are restricted to the later Notes-mode workflow.

### Renderer interaction contract

- Normal cards continue to display EST and Time Taken.
- On a real individual board, editable metric values use keyboard/click-accessible controls without changing card/title geometry.
- An active EST or Time Taken editor occupies the existing metadata value slot; Save/Cancel use the already reserved `4.25rem` title-row action slot so opening/closing the editor cannot move sibling controls or card width.
- Direct duration editing uses an explicit duration field; it is not the later Preferences-controlled title-suffix auto-parse feature.
- Live task metric editing is exposed only when the authoritative timer projection says that exact task is Paused/OvertimePaused. The same card shows a compact live/paused state label without adding a new Focus Panel workflow.
- Production mutation remains persistence-first. On success, apply returned authoritative timer payload when relevant and then refresh the List Board snapshot. A committed mutation followed by failed board refresh remains `saved but could not refresh` and blocks unsafe retry.
- Metric controls must be excluded from parent drag initiation just like title/action controls.

### Explicit exclusions

This slice does **not** implement:

- title-suffix EST auto-parsing preference;
- top-priority task creation or create-task shortcut;
- scheduling/recurrence UI;
- subtasks;
- notes;
- completion/delete/archive actions;
- list settings;
- search;
- Settings;
- Reports/session-row editing;
- Focus Panel or Floating Timer product UI.

## REQUIRED DETERMINISTIC COVERAGE

Before checkpoint 2 can complete, add/adjust evidence for:

- EST-only persistence preserving title, Time Taken/session history, identity/list/lane/order/schedule/completion;
- null/non-null expected EST stale-write guards;
- non-live Time Taken expected-total/list guard and live-session rejection;
- live Time Taken expected-task/expected-total stale guards plus existing pause/resume/recovery/Done anti-snap-back cases;
- live EST pause requirement, task/session binding, CountUp↔EstCountdown rebase, Pomodoro precedence, already-expired estimate -> TimeUp, recovery and rollback-on-persistence-failure;
- timer event/TypeScript contract for estimate rebase;
- production board editability rules: individual vs All Lists, non-live vs live paused/running, title restriction for live task, persistence-before-refresh and committed-refresh handling;
- drag isolation and stable reserved action geometry;
- deterministic light/dark Windows capture of production EST/Time Taken display/edit state rather than relying only on the old fixture-only paused card.

## COMPLETED CAPABILITIES / INVARIANTS THAT MUST NOT REGRESS

- authoritative Rust/domain/persistence state and persistence-first mutation semantics remain authoritative;
- stable task identities and one-open-session invariant must not regress;
- renderer-independent timer/session accounting must not regress;
- tracked time must never reset, double-count or snap back after pause/resume/recovery/Done;
- a committed mutation plus failed renderer refresh/broadcast must not be reported as authoritative mutation failure;
- All Lists remains an aggregate read projection;
- scheduled lane semantics, reorder/move identity invariants and task-card no-layout-shift behavior remain unchanged;
- notes never auto-launch URLs;
- excluded account/trial/upgrade/profile/AI/integration controls remain absent;
- diagnostics remain gated behind `?diagnostics=1`.

## NEXT AGENT ACTION

Continue checkpoint 2 on `m5-est-time-taken-edit`: implement the narrow expected-state EST/Time Taken persistence boundaries, the live-paused EST runtime/checkpoint rebase and stale-bound live Time Taken command; then wire the List Board production controls and deterministic static/visual coverage. Do not open a PR until semantic/diff review is complete.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user blocker is known.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**; exact-head Windows GitHub Actions remains authoritative.
