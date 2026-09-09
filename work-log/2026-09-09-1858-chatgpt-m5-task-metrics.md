# M5 EST and Time Taken display/edit states — validated

Date: 2026-09-09 18:58 (Europe/Athens)

Agent/tool: ChatGPT / GitHub connector

Milestone: **Milestone 5 — Design system and Main window product UI**

Ordered slice: **EST and Time Taken display/edit states**

## Scope

This immutable log records implementation and full Windows validation of only the ordered M5 EST and Time Taken display/edit slice. It does not claim scheduling/recurrence UI, subtasks, notes, destructive task/list flows, list settings, search, Settings, Reports/session-row editing, or Focus Panel/Floating Timer product UI.

## Source identities

- prior fully main-validated source baseline: `a7e6ed1d89d7592e1bf514e56f1e47e63495cbad`;
- feature branch: `m5-est-time-taken-edit`;
- PR: #89 — `M5: add EST and Time Taken editing`;
- final validated PR head: `b7e6a5d2dbf428888fc6fb2e05fc5fa53229d9ad`;
- expected-head guarded squash merge: `2026-09-09T15:43:09Z`;
- resulting fully validated main source/test SHA: `2c4ec648490764cfdd5b0f793f9f68ed73657037`;
- resulting source tree: `a1d562c3153fa6c0f169eaf9d587285e7141301d`.

Markdown-only tracking descendants after this SHA do not replace the validated source/test baseline.

## Material implementation

### Non-live task metrics

- Added expected-state EST persistence using an immediate SQLite transaction, expected list binding and null-safe expected EST comparison.
- EST-only writes preserve unrelated task metadata and reject active live focus tasks so renderer commands cannot bypass the authoritative timer runtime.
- Added expected-state non-live Time Taken editing using an immediate transaction, expected list and expected effective-total guards.
- Non-live Time Taken delegates to the existing authoritative task/session reconciliation boundary and preserves raw historical session rows.
- Added renderer-facing typed task-metric command boundaries without scattering raw task SQL into frontend-facing command handlers.

### Live paused task metrics

- Added `TimerRuntime::set_estimate_while_paused` with exact task, work-session and durable-checkpoint binding checks.
- The live EST mutation writes task EST metadata and the durable timer checkpoint inside one transaction before publishing the candidate runtime state.
- Non-Pomodoro live EST supports CountUp -> EstCountdown, clearing back to CountUp, and EST below accumulated work -> `TimeUp` without losing accumulated tracked time.
- Pomodoro retains timer-mode precedence while EST metadata changes.
- Live Time Taken editing now carries expected task and expected authoritative total guards so a stale renderer cannot retarget or overwrite newer time.
- Live Time Taken continues to rebase only the manual adjustment while raw runtime/session elapsed accounting remains monotonic through resume, recovery and Done.
- TimerController publishes `EstimateRebased` and `TimeTakenRebased` through the normal monotonic revision/event path.
- Expected Time Taken crosses renderer IPC as a decimal string to avoid JavaScript integer precision loss at the authoritative stale-write boundary.

### Production List Board / TaskCard

- Individual real List Boards expose EST and Time Taken edit affordances; aggregate All Lists remains read-only.
- A live task can edit metrics only when the authoritative timer projection says that exact task is `paused` or `overtime_paused`.
- Live title editing from the List Board remains disabled.
- Metric drafts use explicit `H:MM:SS`; EST may be blank to clear, Time Taken may not be blank, and renderer validation respects the Rust `u32` editable range.
- Save/Cancel use the existing reserved `4.25rem` action slot; metric inputs remain inside the metadata row without title/card reflow.
- Task action/title/metric controls are excluded from parent drag initiation.
- Mutations remain persistence-first. Live command results are applied through the monotonic timer projection before authoritative board refresh.
- If a mutation committed but board refresh fails, the existing saved-but-refresh-failed boundary reports the commit and blocks unsafe retries rather than presenting the authoritative mutation as failed.

## Deterministic coverage

Rust regression coverage includes:

- EST-only metadata preservation;
- null-safe stale expected EST rejection;
- non-live EST/Time Taken rejection for live tasks;
- non-live Time Taken raw-session preservation and expected-total rejection;
- live Time Taken stale-task/stale-total rejection;
- live Time Taken anti-snap-back behavior through resume/recovery/completion;
- live EST pause/task/session binding;
- CountUp/EST countdown rebasing;
- Pomodoro precedence;
- EST below elapsed entering `TimeUp` without tracked-time loss;
- live EST recovery and rollback if checkpoint persistence fails;
- typed estimate-rebase event serialization.

Frontend/static coverage:

- `test:ui-task-metrics` is part of `preflight:frontend`;
- typed Tauri/TypeScript command and event registration;
- individual-list/live-state edit gates;
- duration parsing/range validation;
- persistence-before-runtime-publication ordering;
- drag isolation;
- saved-but-refresh-failed handling;
- production visual fixture linkage and no-layout-shift assertions.

Windows visual coverage:

- dedicated `task-metric-fixture.html` uses production `TaskCard` props rather than a fixture-only paused body;
- light/dark captures cover metric display, live-paused EST edit and live-overtime-paused Time Taken edit;
- validator requires 1280×720 PNGs, production editor markers, 68px reserved action slot, display/edit card and title-row geometry parity, and light/dark geometry parity.

## CI findings and evidence-backed fixes

Intermediate Windows CI exposed only repository-quality issues; each was fixed before the final validated head:

1. Stable rustfmt 1.98.1 required formatting changes in new/edited Rust files, including `timer/runtime.rs`. Exact formatter output was applied without semantic changes.
2. Windows CI #339 then passed formatting and `cargo check` but Clippy rejected `TimerRuntime::set_estimate_while_paused` for `too_many_arguments` (8/7). Existing Narro precedent favored a structural fix rather than lint suppression, so `LiveEstimateEditInput` was introduced to aggregate expected task/list/EST inputs while preserving the external controller/Tauri contract.

No deterministic failure was rerun without a corrective change.

## Final PR validation

Windows PR CI #341:

- run `34368816102`;
- job `102524819883`;
- exact head `b7e6a5d2dbf428888fc6fb2e05fc5fa53229d9ad`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10111419066`, digest `sha256:4a62f2146b8624287fe3f228407c59743a8de732afa9560af85d2fd71f9ac76a`;
- diagnostic/runtime harness artifact `10111710336`, digest `sha256:1f0a454973be877b39b12f3f72a1e6cba35c6727333183f4468a4de26331af61`;
- final exact-head semantic/diff review: **PASS**;
- PR comments/reviews requiring resolution: **none**.

PR #89 was squash-merged with expected-head guard on `b7e6a5d2dbf428888fc6fb2e05fc5fa53229d9ad`.

## Resulting-main validation

Windows main CI #342:

- run `34372082553`;
- job `102535551447`;
- exact main source SHA `2c4ec648490764cfdd5b0f793f9f68ed73657037`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10112664337`, digest `sha256:4e4f8cd95f8a1c8261c0ca7f25b30536fba3fcabca5ac4091e140c88b4cd5a7d`;
- diagnostic/runtime harness artifact `10112942834`, digest `sha256:4ec3c3d8635ddbe1c65abdeb46d7de2d0677b2fd6c13e7c6f0dd202cd7a7edc1`.

Local checkout/toolchain validation in the connector-only environment: **NOT RUN**. Windows CI above is the authoritative reproducible source/test gate.

## Correctness/risk invariants preserved

- Tracked work never resets, disappears, double-counts or snaps back because EST/Time Taken was edited.
- Raw session history remains authoritative accounting data; user-facing Time Taken rebasing does not rewrite historical session durations.
- A stale renderer cannot overwrite newer EST/Time Taken or retarget a live edit after a task switch.
- Pomodoro countdown semantics remain authoritative over EST metadata.
- A live EST below already elapsed work enters `TimeUp` without discarding accumulated work.
- All Lists remains a read-only aggregate projection.
- Stable task identity, scheduled-lane semantics and persistence-first mutation boundaries remain unchanged.
- Metric editing preserves the fixed task-card action geometry and does not introduce pointer-hover layout shift.
- No URL auto-launch, account/cloud/integration behavior, or later-stage feature was introduced.

## Tracking reconciliation

- `TODO.md`: `EST and Time Taken display/edit states` marked `[x]` after resulting-main CI passed.
- Milestone 5 validated top-level progress is now **17/28**.
- `STATUS.md` advances the validated source/test baseline to `2c4ec648490764cfdd5b0f793f9f68ed73657037`.
- `HANDOFF.md` points to the next ordered slice.

## Exact continuation

Next ordered Milestone 5 item: **Scheduling UI and recurrence editor**.

A zero-context agent should create/resume one coherent branch from the latest main tracking tip, inspect the already validated Milestone 4 scheduling/recurrence domain and persistence boundaries plus relevant `PRODUCT_SPEC`, `UI_UX_SPEC`, `BEHAVIOR_MATRIX` and history-risk evidence, record a narrow five-checkpoint implementation plan, and implement only scheduling/recurrence UI while preserving date-only/local-date-time semantics, recurrence idempotency/detachment/replace rules, stable task identity and persistence-first mutation behavior.