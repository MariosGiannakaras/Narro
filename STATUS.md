# STATUS.md

Last updated: 2026-09-12

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 5 — Design system and Main window product UI.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5: **ACTIVE / 27 of 28 top-level items validated**.
- Milestones 6–10: **NOT STARTED**.

The first twenty-seven ordered M5 items are fully main validated. The latest completed item is **Light/dark/system theme**. The next ordered item is **Remove all account/trial/upgrade/cloud/integration controls**.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`40ac4acabea105e82a1f1a1211436bda628d4526`

Tree:

`0e7dc95db73a5577cc83ff4aa7c933ae9aba906d`

This is the squash merge of PR #99 — `M5: add persisted light dark and system theme` — from exact validated PR head `048f5009e5cee07cb78544f7ccd6290c43f33980`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

### PR #99 exact-head validation

Windows PR CI #388:

- run `34711580262`, job `103601188758`, conclusion **SUCCESS**;
- exact head `048f5009e5cee07cb78544f7ccd6290c43f33980`;
- Repository Preflight: **SUCCESS**;
- production Windows Edge theme-settings capture/DOM validation: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10303218552`, digest `sha256:af6a8261abb3693e3123a4551daa6f91db1c862ad49bc01712582013898ffb7b`;
- diagnostic artifact `10303194119`, digest `sha256:77b60fa4bca214ca8bb5b30f9a349a6a7fac8b3996626559b2223d49ab8cc3e9`;
- final PR scope: 17 changed files, all within theme IPC/runtime/UI/static/Windows-capture wiring and checkpoint documentation; no submitted reviews or PR comments.

### Resulting-main validation

Windows main CI #389:

- run `34712441687`, rerun job `103608683661`, conclusion **SUCCESS**;
- exact source SHA `40ac4acabea105e82a1f1a1211436bda628d4526`;
- attempt 1 job `103603519635` reached successful Repository Preflight and was cancelled by the workflow's 30-minute job timeout while visual capture was running; no test failure was recorded;
- rerun attempt 2 completed Repository Preflight, production Windows Edge theme-settings capture/DOM validation, visual artifact upload, Tauri Release and diagnostic artifact upload successfully;
- visual artifact `10303868283`, digest `sha256:7322bd3cb3cca9cf7726ccc08819ce253dc8c113d3109c200f501c0ec51fe776`;
- diagnostic artifact `10304293100`, digest `sha256:624df25ab71fc867fb06f14021eaed7133b88f4f4ab8d98089b721ac40388712`.

Detailed immutable evidence is recorded in `work-log/2026-09-12-chatgpt-m5-theme-preference.md`.

## Milestone 5 — validated ordered work

Validated top-level items 1–26 remain as previously recorded. Item 27 is now additionally validated:

27. Light/dark/system theme persists `System`, `Dark`, or `Light` through the existing SQLite preference authority, projects the same committed theme into both normal webviews, follows Windows/WebView2 color mode in System mode through the existing CSS media query, and exposes the evidenced Preferences → General → Theme segmented control with deterministic Windows coverage.

### Latest completed: Light/dark/system theme

Validated behavior includes:

- the existing `ThemePreference::{System, Dark, Light}` preference remains the single persisted authority; no schema or dependency change was needed;
- `set_theme_preference` mutates only `general.theme`, preserves all unrelated preferences and returns success only after the SQLite write commits;
- a post-commit cross-window event failure is logged separately and cannot turn a committed preference write into a renderer-visible failed mutation;
- `ThemeRuntimeProvider` runs in both `main` and `focusSurface`, listens before the initial persisted read, validates incoming tokens and performs no polling;
- System remains the persisted/root `system` token and follows the OS/WebView2 `prefers-color-scheme` media query without rewriting persistence;
- Settings now exposes only the evidenced General → Theme System/Dark/Light control for this slice, with accessible group/pressed semantics, pending state and error rollback;
- the focus diagnostic presentation consumes semantic theme tokens rather than hard-coded dark presentation values;
- deterministic Rust/static tests and production Windows Edge fixtures cover System, Dark, Light and failed-save states;
- no timer/session, scheduling, archive, Notes, Reports, account/cloud/integration authority or unrelated Milestone 8 preference family changed.

### Next ordered M5 item

`Remove all account/trial/upgrade/cloud/integration controls.`

This final M5 slice must remove or prove absent excluded service/account surfaces without deleting legitimate local Settings/Search/Reports/list/task controls or introducing replacement cloud/account behavior. Use the existing source-evidence exclusions and current implementation; do not start Milestone 6 until this item is implemented, exact-head validated, merged, resulting-main validated, and tracking reconciled.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` are the normal two-webview model; presentation changes must not duplicate authoritative runtime state.
- authoritative task/list/session/timer/scheduling/note/archive/preferences state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask/list identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- list archive/restore preserves history; permanent list deletion remains explicit, archive-only and irreversible.
- automatic done-task archival is idempotent and preserves normal historical/session data; permanent deletion semantics remain distinct.
- archived-list tasks must not be duplicated into the active-list Archived Done Tasks projection.
- Search remains local/read-only; quick task creation must continue to use the existing persistence-first create path with explicit list/lane selection.
- theme is local SQLite-backed preference state; both normal webviews project the same committed theme, and System follows OS/browser color mode without polling.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from focus/session/window transitions.
- hover/focus/edit interactions may not reflow task/list card geometry or move hit targets.
- keyboard/focus-visible equivalents and accessible names/tooltips remain required for icon-only actions.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.