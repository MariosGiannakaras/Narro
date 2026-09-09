# STATUS.md

Last updated: 2026-09-09

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 17 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 17/28`**

The first seventeen ordered M5 items are fully main validated. The latest completed item is **EST and Time Taken display/edit states**. The next ordered item is **Scheduling UI and recurrence editor**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`2c4ec648490764cfdd5b0f793f9f68ed73657037`

Tree:

`a1d562c3153fa6c0f169eaf9d587285e7141301d`

This is the squash-merged result of PR #89 — `M5: add EST and Time Taken editing`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

### PR #89 exact-head validation

Final validated PR head:

`b7e6a5d2dbf428888fc6fb2e05fc5fa53229d9ad`

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
- diagnostic artifact `10111710336`, digest `sha256:1f0a454973be877b39b12f3f72a1e6cba35c6727333183f4468a4de26331af61`;
- final exact-head semantic/diff review: **PASS**;
- PR comments/reviews requiring resolution: **none**.

PR #89 was squash-merged at `2026-09-09T15:43:09Z` using expected head `b7e6a5d2dbf428888fc6fb2e05fc5fa53229d9ad`, producing main source SHA `2c4ec648490764cfdd5b0f793f9f68ed73657037`.

### Resulting-main validation

Windows main CI #342:

- run `34372082553`;
- job `102535551447`;
- exact source SHA `2c4ec648490764cfdd5b0f793f9f68ed73657037`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10112664337`, digest `sha256:4e4f8cd95f8a1c8261c0ca7f25b30536fba3fcabca5ac4091e140c88b4cd5a7d`;
- diagnostic artifact `10112942834`, digest `sha256:4ec3c3d8635ddbe1c65abdeb46d7de2d0677b2fd6c13e7c6f0dd202cd7a7edc1`.

Detailed evidence: `work-log/2026-09-09-1858-chatgpt-m5-task-metrics.md`.

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
17. persistence-backed EST and Time Taken display/edit states with authoritative live-paused timer/session integration.

### Latest completed: EST and Time Taken display/edit states

Validated behavior includes:

- stale-safe expected-list/value persistence for non-live EST and Time Taken edits;
- non-live metric writes reject a live focus task rather than bypassing the timer runtime;
- live EST and Time Taken edits require the exact active task in `Paused` or `OvertimePaused`;
- live EST changes atomically commit task metadata plus durable timer checkpoint before publishing runtime state;
- CountUp/EST countdown rebasing preserves accumulated work, and EST below elapsed enters `TimeUp` without tracked-time loss;
- Pomodoro timer precedence remains intact when EST metadata changes;
- live Time Taken edits preserve raw session history and remain stable through resume, recovery and Done without snap-back/double-counting;
- stale task/current-total guards prevent renderer races from overwriting newer authoritative state;
- individual real List Boards expose metric editing while aggregate All Lists remains read-only;
- explicit `H:MM:SS` editing is used; EST may be blank to clear, Time Taken may not be blank;
- Save/Cancel remain inside the reserved `4.25rem` action slot and captured light/dark geometry proves no card/title-row reflow;
- renderer mutation success remains persistence-first, with committed-but-refresh-failed handling blocking unsafe retries;
- deterministic Rust, frontend/static and Windows visual regression coverage is part of preflight/CI.

### Next ordered M5 item

`Scheduling UI and recurrence editor.`

This slice must project the already validated Milestone 4 scheduling/recurrence model rather than recreate scheduling rules in renderer memory. It must preserve date-only versus local-date-time semantics, Monday-based week behavior, recurrence idempotency/detachment/replace rules, stable task identity, persistence-first mutations and no wrong-day/timezone shifts. Consult the relevant product/UI/behavior specifications and `docs/BLITZIT_HISTORY_RISK_INDEX.md` before implementation.

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
- Paused manual Time Taken editing must use the validated authoritative runtime/session baseline rebase path; it may not be implemented as a renderer-only task-field write.
- Date-only schedules remain calendar dates, distinct from local date-times; Monday week boundaries and timezone/DST validation remain authoritative.
- Recurrence materialization remains deterministic/idempotent and preserves validated replace/detach semantics.
- Notes URLs require explicit click/keyboard activation and may never auto-launch merely because a task becomes live.
- Hover/focus/edit interactions may not reflow task/list card geometry, move sibling controls under the pointer, or move hit targets. Reserved/overlay action slots remain the established pattern.
- Keyboard/focus-visible equivalents and accessible names/tooltips remain required for icon-only actions.
- Motion never owns or delays domain-state completion; no infinite decorative animation is allowed, especially on `focusSurface`.
- `prefers-reduced-motion` must remove nonessential translation/scale without hiding state changes.
- Timer numerals remain tabular and must not gain per-second transition animation.
- Exact `1280×720` is a PNG visual-artifact contract, not a browser DOM-layout viewport assumption.
- Excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- Diagnostic controls remain gated behind `?diagnostics=1` and outside normal product navigation.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.