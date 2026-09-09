# STATUS.md

Last updated: 2026-09-09

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 15 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

**`M-5/10 | 5/5 | 15/28`**

The first fifteen ordered M5 items are fully main validated: semantic theme tokens, typography, spacing/radius/elevation, shared motion primitives, `prefers-reduced-motion`, accessible tooltip/popover/menu primitives, deterministic dark/light visual-regression infrastructure, Main-window App shell/navigation, Home dashboard/list cards, list-card interaction states, persistence-backed Create/Edit List, List Board, Task-card state model, persistence-backed reorder/move, and production hover/focus action geometry with reserved overlay slots and no title/card reflow.

The next ordered item is **Task creation and inline editing**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`f965da939397b22adc6b024e5dd86ee750a18b92`

This is the merged result of PR #87 — `M5: harden task hover action geometry`.

### PR #87 exact-head validation

Final validated PR head:

`94d6ef53ba882c4e0022a42eb242a87d427b84c9`

Windows PR CI #324:

- run `34323668511`;
- job `102375871427`;
- exact head `94d6ef53ba882c4e0022a42eb242a87d427b84c9`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10093105381`, digest `sha256:0bb2d5698589e6199b3fbbaad90efb7a9183da74e77d07c8664e95d284a8c5a0`;
- diagnostic artifact `10093299961`, digest `sha256:8e13f9cdcd8f6b3a8b06aed2bb9f59e060ba2b2ee3cdade46812b8edf7bbccc3`;
- final exact-head semantic/diff review: **PASS**;
- issue comments, submitted reviews and inline review threads requiring resolution: **none**.

The final PR changed-file set was confined to `TaskCard` / List Board renderer code and CSS, deterministic frontend static/visual checks, preflight wiring, and the in-branch handoff note. No Rust/schema/domain/persistence implementation changed.

PR #87 merged at `2026-09-09T07:39:16Z`, producing main source SHA `f965da939397b22adc6b024e5dd86ee750a18b92`. The PR head and merged main source share tree `0928b83c165a21db3c7203094894cd9e4a6af5a4`, so the exact validated source content reached `main`.

### Resulting-main validation

Windows main CI #325:

- run `34324954967`;
- job `102379970998`;
- exact source SHA `f965da939397b22adc6b024e5dd86ee750a18b92`;
- conclusion: **SUCCESS**;
- Repository Preflight: **PASS**;
- Capture Visual Regression Fixtures: **PASS**;
- Upload Visual Regression Artifact: **PASS**;
- Tauri Release: **PASS**;
- Upload Diagnostic Harness Artifact: **PASS**;
- visual artifact `10093618064`, digest `sha256:d3dd321cc9ed0b47988217e7a661da14e13f2aec2b7596ae3a71d6ab25ee08cc`;
- diagnostic artifact `10093848439`, digest `sha256:eade32f945641e2a6c22789f40e0294e814d04172035cbf9b87e86d5dc766a68`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

Detailed evidence: `work-log/2026-09-09-1125-chatgpt-m5-hover-action-geometry.md`.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Two-window architecture (`main` + reusable `focusSurface`), tray/background lifecycle, notifications, autostart, monitor handling, shortcuts and the floating-only performance baseline are validated. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

Tracked-time correctness remains a durable anti-regression requirement: renderer lifecycle, pause/resume, task switching, manual Time Taken edits and Done must never lose or double-count authoritative work history.

## Milestone 4 — Gate D complete

**PASS.** Scheduling/recurrence/reminder/eligibility are implemented and validated. Final M4 source baseline before M5 was `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`, validated by Windows main CI #261 / artifact `9998653381`. Installed-Windows reminder acceptance passed, including tray/background delivery and no duplicate after an additional observation period.

Reminder delivery still does **not** claim crash-proof exactly-once semantics across a process crash after Windows accepts a notification but before durable `fired_at` acknowledgment.

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
15. production hover/focus action geometry with reserved/overlay slots and no title/card reflow.

Detailed evidence for each slice is under the corresponding immutable `work-log/*.md` entry; the latest two are:

- `work-log/2026-09-09-0858-chatgpt-m5-task-reorder.md`;
- `work-log/2026-09-09-1125-chatgpt-m5-hover-action-geometry.md`.

### Completed: hover-action geometry hardening

Validated behavior now provides:

- production Move up / Move down controls inside the existing fixed `4.25rem` action column;
- absolutely overlaid `1.75rem` controls inside the existing `4.25rem × 1.25rem` reserved slot;
- hover/card-focus/child-focus reveal through opacity/visibility only;
- stable title/card dimensions and pointer targets in rest vs action-revealed states;
- accessible `aria-label`s and shared Tooltip behavior for icon-only actions;
- pointer controls and `Alt+ArrowUp/Down` reusing the already validated persistence-first reorder boundary;
- action-button drag initiation isolation;
- All Lists, Done, scheduled and otherwise non-reorderable rows remaining read-only;
- deterministic production DOM/static checks plus light/dark Windows Edge capture geometry validation;
- `test:ui-task-hover-actions` included in frontend preflight.

### Next ordered M5 item

`Task creation and inline editing.`

Implement this as a narrow persistence-backed slice. Reuse the existing M2 task create/update boundaries, preserve success-only authoritative snapshot refresh, and keep EST/Time Taken editing, scheduling/recurrence, subtasks, notes, destructive flows, list settings, search, Settings and Reports outside the slice unless a strict dependency is proven.

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
- Date-only schedules remain calendar dates, distinct from local date-times; Monday week boundaries and timezone/DST validation remain authoritative.
- Notes URLs require explicit click/keyboard activation and may never auto-launch merely because a task becomes live.
- Imported list icons remain Narro app-data-owned; only relative owned paths are persisted or eligible for cleanup.
- Hover/focus interactions may not reflow task/list card geometry, move sibling controls under the pointer, or move hit targets. Reserved/overlay action slots remain the established pattern.
- Keyboard/focus-visible equivalents and accessible names/tooltips remain required for icon-only actions.
- Motion never owns or delays domain-state completion; no infinite decorative animation is allowed, especially on `focusSurface`.
- `prefers-reduced-motion` must remove nonessential translation/scale without hiding state changes.
- Timer numerals remain tabular and must not gain per-second transition animation.
- Exact `1280×720` is a PNG visual-artifact contract, not a browser DOM-layout viewport assumption.
- Excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- Diagnostic controls remain gated behind `?diagnostics=1` and outside normal product navigation.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.