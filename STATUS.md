# STATUS.md

Last updated: 2026-09-09

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 16 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 16/28`**

The first sixteen ordered M5 items are fully main validated. The latest completed item is **Task creation and inline editing**. The next ordered item is **EST and Time Taken display/edit states**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`a7e6ed1d89d7592e1bf514e56f1e47e63495cbad`

This is the merged result of PR #88 — `M5: add task creation and inline editing`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

### PR #88 exact-head validation

Final validated PR head:

`ce89c473a7306982ce43a8a07fce43f3ecc1ee02`

Windows PR CI #331:

- run `34340494624`;
- job `102429916044`;
- exact head `ce89c473a7306982ce43a8a07fce43f3ecc1ee02`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10099815643`, digest `sha256:0f993845d8d302095c05be8a3edcca6c9dce65c2859e7ae7118ad19d0f4436c5`;
- diagnostic artifact `10100064241`, digest `sha256:1cf9061d914157a5bbb01897f04d8e0b261ee0e8a1e0dd5debecaf0b7222f25a`;
- final exact-head semantic/diff review: **PASS**;
- issue comments, submitted reviews and inline review threads requiring resolution: **none**.

PR #88 merged with an expected-head guard at `2026-09-09T10:46:29Z`, producing main source SHA `a7e6ed1d89d7592e1bf514e56f1e47e63495cbad` and tree `bc5b22bc7093a7355b6bb0f93e1e88aa54d3a893`.

### Resulting-main validation

Windows main CI #332:

- run `34342022923`;
- job `102434764558`;
- exact source SHA `a7e6ed1d89d7592e1bf514e56f1e47e63495cbad`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10100383350`, digest `sha256:84facb757045e2f3a47ea128829b116bcad9784165c72e577ef58463c79fe9f7`;
- diagnostic artifact `10100609210`, digest `sha256:6434366a5f35dff7f2a411292fb9e9cf5fc2349515edef80b7f79f60f2332ac6`.

Detailed evidence: `work-log/2026-09-09-1432-chatgpt-m5-task-create-inline-edit.md`.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Two-window architecture (`main` + reusable `focusSurface`), tray/background lifecycle, notifications, autostart, monitor handling, shortcuts and the floating-only performance baseline are validated.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Tracked-time correctness remains a durable anti-regression requirement: renderer lifecycle, pause/resume, task switching, manual Time Taken edits and Done must never lose or double-count authoritative work history.

## Milestone 4 — Gate D complete

**PASS.** Scheduling/recurrence/reminder/eligibility are implemented and validated. Date-only scheduling, timezone/DST/week boundaries, recurrence idempotency and tray/background reminder behavior remain authoritative invariants.

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
16. persistence-backed task creation and inline title editing.

### Latest completed: task creation and inline editing

Validated behavior includes:

- bottom `+ ADD TASK` creation for real individual Backlog / This Week / Today lanes only;
- no task creation target in Done or aggregate All Lists;
- stable generated task identity and persistence-first create semantics;
- atomic expected-list/expected-title title-only editing;
- title-only writes preserve EST, Time Taken/session-owned state, identity, list/lane/order, scheduling and completion metadata;
- click-title edit with Enter/Save and Escape/Cancel;
- drag isolation for title/edit controls and preservation of the fixed reserved action geometry;
- authoritative board refresh after durable mutation;
- explicit saved-but-refresh-failed handling that blocks unsafe mutation retries;
- deterministic Rust/frontend/static/Windows visual coverage.

Top-priority insertion, create-task shortcut, EST editing and Time Taken editing were intentionally not absorbed into this slice.

### Next ordered M5 item

`EST and Time Taken display/edit states.`

This next slice must reuse the existing authoritative M2 task-metadata and M3 paused manual-Time-Taken/session-rebase boundaries. In particular, editing EST or Time Taken may not reset tracked work, overwrite session-owned state, or make renderer state authoritative. Consult `docs/BLITZIT_HISTORY_RISK_INDEX.md` before implementation because tracked-time loss and post-pause/manual-edit divergence are current source-product reliability risks.

## Durable correctness decisions

Future work must preserve:

- Narro remains a personal, local-only Windows 10/11 x64 desktop application; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` are the normal two-webview model; presentation changes must not duplicate authoritative runtime state.
- Authoritative task/list/session/timer/scheduling state lives outside renderer memory; persistence-first mutations remain the success boundary.
- Stable task identities are mandatory. Reorder/move changes positions/lanes only and may never create, delete or alias identities.
- A committed authoritative mutation must not be reported as failed merely because a secondary renderer refresh/event delivery fails.
- All Lists remains an aggregate projection, never a persisted synthetic list.
- Scheduled pending tasks remain projected through validated effective planning-lane semantics; manual board reorder/move remains disabled while scheduling owns the effective lane.
- Archived lists/tasks remain absent from active board projection; completed non-archived tasks project to Done exactly once.
- Renderer-independent timer/session accounting, one-open-session protection and durable recovery must not regress.
- EST/title metadata edits must not rewrite or lose Time Taken/session state.
- Paused manual Time Taken editing must use the already validated authoritative runtime/session baseline rebase path; it may not be implemented as a renderer-only task-field write.
- Date-only schedules remain calendar dates, distinct from local date-times; Monday week boundaries and timezone/DST validation remain authoritative.
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