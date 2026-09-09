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

Branch base / main tracking tip when created:

`68d1a38874cf7d1c6988f11cd58fc28a8d050d84`

Latest source/test candidate reviewed before this tracking update:

`03a7de2e213d7039bca6ed69355a23a4f7b51d43`

Candidate tree:

`b8e8190f8b3e070f31d055fb2d4ab442d7382c4a`

The branch is 33 commits ahead of its base and 0 behind at that candidate. No implementation PR existed at the checkpoint-2 review; the exact next action is to open one and validate its final exact head with Windows CI.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 16/28`**

Current five checkpoints:

1. mandatory inspection + narrow EST/Time Taken mutation/UX contract — **COMPLETE**;
2. authoritative persistence/runtime/frontend implementation + deterministic Rust/static/visual coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — **PENDING**;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + tracking reconciliation — PENDING.

## CHECKPOINT 2 IMPLEMENTATION

### Non-live task metric persistence

- `persistence::task_estimate_edit` provides an immediate transaction with expected-list and null-safe expected-EST guards. The write changes only `est_seconds` and `updated_at` and rejects active live focus sessions.
- `persistence::task_time_taken_edit` provides an immediate transaction with expected-list and expected-effective-total guards. It delegates to the existing Time Taken reconciliation boundary, preserves raw session history and rejects live focus sessions.
- `board_task_metrics` exposes renderer-facing `update_list_board_task_estimate` and `update_list_board_task_time_taken` commands without owning raw task SQL.

### Live-paused task metric persistence/runtime

- `TimerRuntime::set_estimate_while_paused` requires Paused/OvertimePaused and an exact authoritative task/session binding.
- A live non-Pomodoro EST edit atomically persists both task EST and the durable timer checkpoint before the runtime candidate is published.
- Clearing live EST changes CountUp/EST-countdown work to CountUp; setting EST changes it to EstCountdown. Pomodoro retains active Pomodoro timer precedence while task EST metadata changes.
- Setting EST below already accumulated work enters `TimeUp` without discarding work. The interval anchor is normalized for valid countdown recovery while `total_work_ms`, session duration and effective tracked time remain intact. `estimate_below_elapsed_enters_time_up_without_losing_work` covers the invariant and recovery.
- Live Time Taken editing requires Paused/OvertimePaused, exact task binding and expected authoritative total. It rebases the manual adjustment while raw session/runtime elapsed accounting remains monotonic and survives resume/recovery/Done without snap-back.
- `TimerController` publishes `EstimateRebased` and the existing `TimeTakenRebased` through the normal monotonic revision/event path.
- `timer_set_estimate` and stale-bound `timer_set_time_taken` are registered Tauri commands. Expected Time Taken crosses IPC as a decimal string to avoid renderer precision loss.

### Production List Board / TaskCard

- Normal task cards keep read-only EST and Time Taken display semantics when editing is unavailable.
- Individual real List Boards expose keyboard/click metric editing. Aggregate All Lists remains read-only.
- Live task metrics are editable only when the authoritative timer projection says that exact task is `paused` or `overtime_paused`; running, break and `time_up` states are not editable.
- Live title editing remains unavailable from the List Board.
- Metric drafts use explicit `H:MM:SS`; EST may be blank to clear, Time Taken may not. Renderer validation caps values at the Rust `u32` command range.
- Save/Cancel controls occupy the existing reserved `4.25rem` action slot. Metric input uses the existing metadata row and does not change title/card width geometry.
- Production mutations remain persistence-first. Live command results are fed through the monotonic timer projection before the authoritative board snapshot refresh.
- A committed metric mutation followed by failed board refresh uses the established `Task change was saved, but the board could not refresh` boundary and blocks further unsafe task mutations.
- Reorder/title/metric controls are all excluded from parent drag initiation.

### Deterministic coverage added/updated

Rust coverage includes:

- EST-only metadata preservation;
- null-safe expected EST stale rejection;
- live-session rejection at the non-live EST boundary;
- non-live Time Taken session-history preservation and expected-total stale rejection;
- live Time Taken stale task/total rejection, anti-snap-back, recovery and completion behavior;
- live EST pause binding, CountUp↔EstCountdown behavior, Pomodoro precedence, below-elapsed `TimeUp` without time loss, recovery and rollback-on-persistence-failure;
- timer-event serialization for estimate rebase.

Frontend/static coverage includes:

- `scripts/test-ui-task-metrics.mjs` in `preflight:frontend`;
- typed command/event registration, stale guards, individual-list/live-state gates, explicit duration parsing, commit-before-runtime-publication, drag isolation and geometry contracts;
- legacy create/edit and hover-action drag-selector contracts updated only to include metric controls.

Windows visual coverage includes:

- dedicated `task-metric-fixture.html` using production `TaskCard` props, not fixture-only paused presentation;
- deterministic display, live-paused EST edit and live-overtime-paused Time Taken edit states;
- light/dark Edge captures;
- `validate-task-metric-captures.mjs` requiring 1280×720 PNGs, production editor markers, 68px reserved action slot, display/edit card and title-row geometry parity, and light/dark geometry parity;
- the metric validator is part of `test:visual-regression:windows`.

## SEMANTIC / DIFF REVIEW

Checkpoint-2 semantic review inspected the persistence boundaries, live runtime/controller/service path, Tauri registrations, TypeScript IPC contracts, `ListBoard`, `TaskCard`, CSS, visual fixture/capture validator and legacy UI static contracts.

Evidence-backed fixes made during review:

- extended the previously validated create/edit and hover drag guards to include `[data-task-metric-control]`;
- corrected stale metric static-test expectations from obsolete `StaleTask`/`StaleTimeTaken` names to the implemented `TaskBindingMismatch`/`ExpectedTimeTakenMismatch` contracts;
- added an explicit static linkage to the below-elapsed EST no-time-loss regression and production visual/capture chain.

No broad architecture change, migration, later-stage product behavior or unrelated feature activation is present in the reviewed diff.

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

## EXPLICIT EXCLUSIONS

This slice does **not** implement title-suffix EST auto-parsing preference, top-priority task creation, create-task shortcut, scheduling/recurrence UI, subtasks, notes, completion/delete/archive actions, list settings, search, Settings, Reports/session-row editing, or Focus Panel/Floating Timer product UI.

## NEXT AGENT ACTION

Open the implementation PR from `m5-est-time-taken-edit` to `main`, record the exact final PR head SHA, and inspect the authoritative Windows GitHub Actions run for that exact head. Required before checkpoint 3 can complete: Repository Preflight, tests, visual regression capture/validation and artifact upload, Tauri release build, and diagnostic artifact upload must all succeed. If CI fails, inspect the exact failure log and fix only evidence-backed problems; any fix creates a new head that must be revalidated.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user blocker is known.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
- Checkpoint 2 is complete by source/deterministic-coverage/semantic review, but the source candidate is **not validated** until exact-head Windows CI passes.
