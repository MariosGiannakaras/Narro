# STATUS.md

Last updated: 2026-09-10

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 18 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 18/28`**

The first eighteen ordered M5 items are fully main validated. The latest completed item is **Scheduling UI and recurrence editor**. The next ordered item is **Subtasks UI**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`64b7cc8cc79b3991a7407c2838b60f923c63dc75`

Tree:

`537390a65e7cec0343f01741db7c110bf38377a6`

This is the expected-head guarded merge of PR #90 — `M5: add scheduling and recurrence editor`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

### PR #90 exact-head validation

Final validated PR head:

`6b90835b58a2c659b0a78584b20af7d7c614a965`

Windows PR CI #353:

- run `34408571026`;
- job `102657360398`;
- exact head `6b90835b58a2c659b0a78584b20af7d7c614a965`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10126546425`, digest `sha256:7543eebd260dfabec66c784e3b3ec3a79fbcd7927d1d96d5f14941ccb46dd97b`;
- diagnostic artifact `10126751008`, digest `sha256:f76696b40b91006e10beb055ca01d2b7be5c682965c83ec3631b1736b5852b31`;
- final exact-head semantic/diff review: **PASS**;
- PR comments/reviews/threads requiring resolution: **none**.

PR #90 was merged with expected head `6b90835b58a2c659b0a78584b20af7d7c614a965`, producing main source SHA `64b7cc8cc79b3991a7407c2838b60f923c63dc75`.

### Resulting-main validation

Windows main CI #354:

- run `34451504139`;
- job `102788059565`;
- exact source SHA `64b7cc8cc79b3991a7407c2838b60f923c63dc75`;
- event: `push`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10141970473`, digest `sha256:f91c5c14056fe8f72edb005cd4153201dc5799dd82abdaf45a487a6111577bfb`;
- diagnostic artifact `10142174154`, digest `sha256:255491c37bcb2fa7943a92d635d6ab82b6d0e7f05fe828cec3fbcde6fd2f178a`.

Detailed evidence: `work-log/2026-09-10-1105-chatgpt-m5-scheduling-recurrence-ui.md`.

## Milestones 1–4 — validated gates

- **Gate A PASS:** Tauri 2 + WebView2 architecture, two-window model, Windows native lifecycle/capabilities and floating performance baseline validated.
- **Gate B PASS:** durable SQLite/domain identity, CRUD/order/archive/delete, metadata and persistence-first invariants validated.
- **Gate C PASS:** authoritative timer/session runtime, recovery, Pomodoro, tracked-time durability, manual Time Taken rebase and sleep accounting validated.
- **Gate D PASS:** scheduling/recurrence/reminders/eligibility, date-only semantics, timezone/DST/week boundaries and recurrence idempotency validated.

## Milestone 5 — validated ordered work

The following top-level items are validated complete, in roadmap order:

1. semantic theme-token foundation;
2. typography foundation;
3. spacing/radius/elevation foundation;
4. shared motion primitives;
5. `prefers-reduced-motion` behavior;
6. accessible tooltip/popover/menu primitives with stable geometry;
7. deterministic screenshot/visual-regression harness;
8. App shell/navigation;
9. Home dashboard/list cards;
10. list-card rest/hover/Open/overflow/create-list states;
11. persistence-backed Create/Edit List modal;
12. List Board with Backlog / This Week / Today / Done;
13. Task-card state model;
14. persistence-backed drag/drop or equivalent reorder/move behavior;
15. production hover/focus action geometry with reserved/overlay slots and no title/card reflow;
16. persistence-backed task creation and inline title editing;
17. persistence-backed EST and Time Taken display/edit states with authoritative live-paused timer/session integration;
18. production scheduling and recurrence editor over the authoritative M4 scheduling/recurrence model.

### Latest completed: Scheduling UI and recurrence editor

Validated behavior includes:

- individual List Boards expose production schedule/repeat editing while aggregate All Lists remains read-only;
- Today / Later today / Tomorrow / Next week shortcuts resolve in Rust, not renderer memory;
- custom date-only and local-date-time scheduling preserves M4 timezone/DST/calendar semantics;
- schedule edits use expected-list + expected-schedule stale guards inside an immediate SQLite transaction;
- recurrence create/edit/remove uses existing M4 persistence/materialization semantics;
- recurrence update/remove/Replace Existing expected-version checks are atomic inside persistence transactions;
- stale Replace Existing is rejected before child scan/detach/delete;
- modified/history-bearing generated children and occurrence reservations retain validated detachment behavior;
- generated occurrences cannot create nested recurrence rules;
- closed task cards project authoritative Repeats / Occurrence identity without per-card polling;
- editor-open state locks conflicting board mutations and schedule controls cannot initiate drag;
- successful mutations remain persistence-first with authoritative board refresh and committed-but-refresh-failed safety handling;
- deterministic Rust/static/frontend/Windows visual coverage is part of preflight/CI;
- scheduling visual capture waits deterministically for the asynchronous production dialog ready state without changing synchronous legacy fixtures.

### Next ordered M5 item

`Subtasks UI.`

This slice must project the already validated Milestone 2 subtask identity/order/completion persistence model rather than create renderer-only subtask authority. It must preserve parent-task identity, stable subtask identities, persistence-first mutation semantics, deterministic ordering, archive/completion restrictions, task-card no-layout-shift behavior, keyboard access, and the existing interaction locks around title/metrics/scheduling/reorder.

## Durable correctness decisions

Future work must preserve:

- Narro remains a personal, local-only Windows 10/11 x64 desktop application; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` are the normal two-webview model; presentation changes must not duplicate authoritative runtime state.
- Authoritative task/list/session/timer/scheduling state lives outside renderer memory; persistence-first mutations remain the success boundary.
- Stable task identities are mandatory. Reorder/move/schedule changes may never create, delete or alias task identities except through an explicit create/duplicate operation.
- A committed authoritative mutation must not be reported as failed merely because a secondary renderer refresh/event delivery fails.
- All Lists remains an aggregate projection, never a persisted synthetic list.
- Scheduled pending tasks remain projected through validated effective planning-lane semantics; scheduling owns the effective lane where applicable.
- Archived lists/tasks remain absent from active board projection; completed non-archived tasks project to Done exactly once.
- Renderer-independent timer/session accounting, one-open-session protection and durable recovery must not regress.
- EST/title metadata edits must not rewrite or lose Time Taken/session state.
- Paused manual Time Taken editing must use the validated authoritative runtime/session baseline rebase path.
- Date-only schedules remain calendar dates, distinct from local date-times; Monday week boundaries and timezone/DST validation remain authoritative.
- Recurrence materialization remains deterministic/idempotent and preserves validated replace/detach semantics; stale recurrence writes fail atomically before destructive child work.
- Notes URLs require explicit click/keyboard activation and may never auto-launch merely because a task becomes live.
- Hover/focus/edit interactions may not reflow task/list card geometry or move hit targets. Reserved/overlay action slots remain the established pattern.
- Keyboard/focus-visible equivalents and accessible names/tooltips remain required for icon-only actions.
- Motion never owns or delays domain-state completion; no infinite decorative animation is allowed, especially on `focusSurface`.
- `prefers-reduced-motion` must remove nonessential translation/scale without hiding state changes.
- Timer numerals remain tabular and must not gain per-second transition animation.
- Exact `1280×720` is a PNG visual-artifact contract, not a browser DOM-layout viewport assumption.
- Excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- Diagnostic controls remain gated behind `?diagnostics=1` and outside normal product navigation.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
