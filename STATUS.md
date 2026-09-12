# STATUS.md

Last updated: 2026-09-13

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5 / Gate E: **PASS** — all 28 top-level items validated.
- Milestone 6: **ACTIVE / 2 of 16 top-level items validated**.
- Milestones 7–10: **NOT STARTED**.

M6 items 1–2 are complete: **Start Blitz from eligible Today tasks** and **Auto-select top eligible Today task**. The next ordered work is item 3: **Reproduce Focus Panel hierarchy**. Do not skip ahead to Floating Timer, shortcuts/preferences, Reports, or release polish.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`bea3f352c609456762f83e4911017ac9ef23f682`

Tree:

`5df0821b29fa4a017a3dc84ea14c40937c85cf35`

This is the expected-head guarded squash merge of PR #101 — `M6: start Blitz from eligible Today tasks` — from exact validated PR head `6f329f4b9217a2f68d138ac30b1027071e209b8b`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

## M6 items 1–2 — validated Focus entry boundary

Implemented and validated behavior:

- explicit `Blitz now` is the only production Focus-entry action; render/app launch does not auto-start a timer;
- task selection is Rust-owned and reuses the validated M4 `scheduling::focus_eligibility_at` policy;
- future-timed Today tasks remain ineligible until due; scheduled Backlog/This Week tasks that project into Today can be selected when eligible;
- candidate order matches the All Lists planning order: active-list rank, task rank, stable task ID;
- persisted timezone overrides renderer fallback for eligibility classification;
- persisted/default Pomodoro settings override task EST; otherwise EST selects countdown and no EST selects count-up;
- `started`, `already_active`, and `no_eligible_today_tasks` are typed outcomes;
- repeated/concurrent Start Blitz cannot duplicate or silently switch an existing live session;
- the existing M3 `TimerService` / `TimerRuntime` remains the only authoritative persistence-first timer/session boundary;
- no-eligible returns before starting a session;
- successful timer/session commit remains success even if the secondary Focus Panel show/focus operation fails;
- Focus entry does not auto-open task-note URLs;
- the existing two-webview model remains unchanged: `main` plus reusable `focusSurface`.

### PR #101 exact-head validation

Initial PR CI #392 / run `34718784154` / job `103620662277` failed only at `cargo fmt --check`; frontend/static Focus-entry gates and the TypeScript/Vite build had passed. The exact rustfmt output was applied without semantic changes.

Final exact PR head:

`6f329f4b9217a2f68d138ac30b1027071e209b8b`

Windows PR CI #394:

- run `34718967378`, job `103621226697`, conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- production Windows Edge visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10305998073`, digest `sha256:3fa00578ce46e4ea16a6352486e718edc4162b6b62075dc548da7293bc87e7fa`;
- diagnostic artifact `10305534197`, digest `sha256:ab58df8f0f630d0bbc7fcbcc116f77d1246a220222f4100803842d3f7a0ed273`;
- final changed files: `HANDOFF.md`, `package.json`, `scripts/test-ui-focus-entry.mjs`, `src-tauri/src/focus_entry.rs`, `src-tauri/src/lib.rs`, `src/BlitzEntryButton.tsx`, `src/focusEntryApi.ts`, `src/main.tsx`;
- no PR/review comments required action;
- exact validated head remained unchanged through merge.

### Resulting-main validation

PR #101 was squash-merged with expected-head guard `6f329f4b9217a2f68d138ac30b1027071e209b8b`.

Windows main CI #395:

- run `34721633029`, job `103628495654`, conclusion **SUCCESS**;
- exact source SHA `bea3f352c609456762f83e4911017ac9ef23f682`;
- Repository Preflight: **SUCCESS**;
- production Windows Edge visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10306966263`, digest `sha256:038577b82dee0bd9a01fced940f05965e95bd596d868aee03e6497fa542f08dc`;
- diagnostic artifact `10306782210`, digest `sha256:d555877e292a44e9e0b135d3bd800853b77006d45b29cd3c6d1b3b8fb8bf433f`.

Detailed immutable evidence is recorded in `work-log/2026-09-13-chatgpt-m6-focus-entry.md`.

## Milestone 6 — next ordered work

The next top-level item is:

3. `Reproduce Focus Panel hierarchy: list selector, Today, quick controls, aggregate EST/progress, active live card, remaining queue, Add Task, scheduled group, done group.`

Build this hierarchy over the already validated authoritative timer/session and planning projections. Keep `focusSurface` minimal, presentation-only, event-driven, theme-consistent and within the existing two-webview architecture. Do not duplicate timer/session, task, schedule, notes or subtask authority in renderer state.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` remain the normal two-webview model; Focus Panel and Floating Timer are presentations of the same authoritative runtime.
- authoritative task/list/session/timer/scheduling/note/archive/preferences state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask/list identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- future-timed Today tasks remain ineligible until due; Focus entry must not bypass scheduling eligibility.
- repeated Focus entry cannot duplicate or silently switch an existing live session.
- list archive/restore and automatic done-task archival semantics remain unchanged.
- Search remains local/read-only; quick task creation continues to use the persistence-first create path.
- theme is local SQLite-backed preference state; both normal webviews project the same committed theme, and System follows OS/browser color mode without polling.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from Focus entry or task switching.
- hover/focus interactions may not reflow sibling geometry or move hit targets; keyboard/focus-visible equivalents and accessible names/tooltips remain required.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.