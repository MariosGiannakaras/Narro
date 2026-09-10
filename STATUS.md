# STATUS.md

Last updated: 2026-09-11

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 19 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 19/28`**

The first nineteen ordered M5 items are fully main validated. The latest completed item is **Subtasks UI**. The next ordered item is **Rich task notes editor/viewer with clickable URLs**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`120bf882b67c54d832a1116f8fa024fe2727e155`

Tree:

`6c898857c43a1f25d147d4af1eec6d3f4d08a1a2`

This is the expected-head guarded merge of PR #91 — `M5: add Subtasks UI`.

Markdown-only tracking descendants, beginning with TODO reconciliation commit `0ee98838bfd03b818a9ac37de996edc7c8887e8f`, do **not** replace this validated source/test baseline.

### PR #91 exact-head validation

Final validated PR head:

`929c5042a095dfcedc1343ff680080fb2d229cbe`

Windows PR CI #359:

- run `34511982661`;
- job `102988191474`;
- exact head `929c5042a095dfcedc1343ff680080fb2d229cbe`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10166459738`, digest `sha256:176f7bf17badd1efd8aafeaaa09110ce44568ed70588db064e38abc412244ef8`;
- diagnostic artifact `10166706435`, digest `sha256:c52c6c764b29e3147de21c5e733948e985ca5de5aa091ebb7c7eb9cdec709a4c`;
- PR comments: none;
- submitted reviews: none;
- inline review threads: none;
- final exact-head semantic/diff review: **PASS**.

An earlier exact-head Windows CI #355 / run `34511182147` failed only at `cargo fmt --check` after all frontend/static checks and the production Vite build had passed. The three formatter-only Rust diffs were applied exactly from that log and revalidated by #359; the failed run does not count as progress.

PR #91 was merged with `expected_head_sha=929c5042a095dfcedc1343ff680080fb2d229cbe`, producing main source SHA `120bf882b67c54d832a1116f8fa024fe2727e155`.

### Resulting-main validation

Windows main CI #360:

- run `34536225635`;
- job `103068350228`;
- exact source SHA `120bf882b67c54d832a1116f8fa024fe2727e155`;
- event: `push`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10175731468`, digest `sha256:5a7d009113217741067605456948ec7b7ed323974d265b28a663580fa68285ab`;
- diagnostic artifact `10175926487`, digest `sha256:01d5f5fdf8d4c825a12c6ab15e2532b470682c1a971f6349efe0b6ef24af7e32`.

Detailed immutable evidence is recorded in the newest M5 Subtasks UI work log.

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
18. production scheduling and recurrence editor over the authoritative M4 scheduling/recurrence model;
19. production Subtasks UI over the authoritative M2 subtask identity/order/completion persistence model.

### Latest completed: Subtasks UI

Validated behavior includes:

- authoritative completed/total subtask counts are projected in List Board task cards without renderer polling;
- expanded rows are loaded through task-scoped Rust commands and retain stable persisted `SubtaskId` / parent `TaskId` identity;
- renderer-facing create/title/completion/reorder/delete writes use immediate SQLite transactions and expected-state stale guards;
- reorder validates duplicate-free equal identity sets and the renderer's expected current order before rank rewrite;
- destructive delete validates expected `updated_at` and compacts ranks atomically;
- aggregate All Lists and completed Done tasks remain read-only while active individual-list tasks can manage subtasks, including while the parent task is live;
- subtask controls are isolated from parent drag, and expanded subtasks suppress conflicting task actions while preserving the fixed task title/action slot geometry;
- successful subtask mutations refresh both authoritative subtask rows and board progress; a commit followed by refresh failure is reported as saved and blocks unsafe follow-up mutations;
- a rendered-parent identity gate rejects mismatched stale rows before mutation callbacks;
- deterministic Rust/static coverage and light/dark production visual fixtures cover expanded, inline-edit and completed read-only states.

### Next ordered M5 item

`Rich task notes editor/viewer with clickable URLs.`

This work must build on the already validated M2 constrained rich-note persistence model. It must preserve persistence-first writes, explicit task/list identity, no renderer-only authoritative note state, task-card geometry invariants, keyboard access, and the source-product safety rule that URLs require explicit user activation. The following ordered M5 items remain separate unless a narrow dependency requires them: explicit no-auto-launch URL policy, larger/resizable Notes editing presentation, and WebView/browser spellcheck.

## Durable correctness decisions

Future work must preserve:

- Narro remains a personal, local-only Windows 10/11 x64 desktop application; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` are the normal two-webview model; presentation changes must not duplicate authoritative runtime state.
- Authoritative task/list/session/timer/scheduling state lives outside renderer memory; persistence-first mutations remain the success boundary.
- Stable task and subtask identities are mandatory; reorder/move/schedule/subtask changes may not alias or duplicate identities.
- A committed authoritative mutation must not be reported as failed merely because a secondary renderer refresh/event delivery fails.
- All Lists remains an aggregate projection, never a persisted synthetic list.
- Scheduled pending tasks remain projected through validated effective planning-lane semantics.
- Archived lists/tasks remain absent from active board projection; completed non-archived tasks project to Done exactly once.
- Renderer-independent timer/session accounting, one-open-session protection and durable recovery must not regress.
- EST/title/subtask/note metadata edits must not rewrite or lose Time Taken/session state.
- Paused manual Time Taken editing must use the validated authoritative runtime/session baseline rebase path.
- Date-only schedules remain calendar dates, distinct from local date-times; Monday week boundaries and timezone/DST validation remain authoritative.
- Recurrence materialization remains deterministic/idempotent and preserves validated replace/detach semantics; stale recurrence writes fail atomically before destructive child work.
- Notes URLs require explicit click/keyboard activation and may never auto-launch merely because a task becomes live.
- Hover/focus/edit interactions may not reflow task/list card geometry or move hit targets; reserved/overlay action slots remain the established pattern.
- Keyboard/focus-visible equivalents and accessible names/tooltips remain required for icon-only actions.
- Motion never owns or delays domain-state completion; no infinite decorative animation is allowed, especially on `focusSurface`.
- `prefers-reduced-motion` must remove nonessential translation/scale without hiding state changes.
- Timer numerals remain tabular and must not gain per-second transition animation.
- Exact `1280×720` is a PNG visual-artifact contract, not a browser DOM-layout viewport assumption.
- Excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- Diagnostic controls remain gated behind `?diagnostics=1` and outside normal product navigation.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
