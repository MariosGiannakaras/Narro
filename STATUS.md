# STATUS.md

Last updated: 2026-09-12

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5 / Gate E: **PASS** — all 28 top-level items validated.
- Milestone 6: **ACTIVE / 0 of 16 top-level items validated**.
- Milestones 7–10: **NOT STARTED**.

Milestone 5 is fully complete. The next ordered work is Milestone 6, beginning with **Start Blitz from eligible Today tasks** and then **Auto-select top eligible Today task**. Do not skip ahead to Floating Timer, shortcuts/preferences, Reports, or release polish.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`c89526dbc40742570d8d89353244add2d6350d2d`

Tree:

`26023de8bc73aef304627b014f8319d5cd74e4ed`

This is the expected-head guarded squash merge of PR #100 — `M5: guard excluded account and service controls` — from exact validated PR head `db78e0d6adebd51ab9e56a81185e4dac0206d1c5`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

### PR #100 exact-head validation

Windows PR CI #390:

- run `34715260353`, job `103611248532`, conclusion **SUCCESS**;
- exact head `db78e0d6adebd51ab9e56a81185e4dac0206d1c5`;
- Repository Preflight: **SUCCESS**;
- production Windows Edge visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10303923986`, digest `sha256:f9504c66d2d747f0cfb6b3d6e488c8b07f7820553b568146fe176242635880ff`;
- diagnostic artifact `10304538904`, digest `sha256:a9f506019f483e60faf50fdf007eddc06780c9a2e0aec23d0ab0b1744baa3414`;
- final PR scope: only `HANDOFF.md`, `package.json`, and `scripts/test-ui-excluded-controls.mjs`; no production renderer/Rust/schema/dependency/lockfile change;
- no submitted reviews, PR conversation comments, or inline review comments;
- the exact validated head remained unchanged through merge.

### Resulting-main validation

PR #100 was squash-merged with expected-head guard `db78e0d6adebd51ab9e56a81185e4dac0206d1c5`.

Windows main CI #391:

- run `34716334667`, job `103614139737`, conclusion **SUCCESS**;
- exact source SHA `c89526dbc40742570d8d89353244add2d6350d2d`;
- Repository Preflight: **SUCCESS**;
- production Windows Edge visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10304734623`, digest `sha256:85d2443897558d5517d994860ad67dde373ce57e750aa1cadbbd399c057a67c0`;
- diagnostic artifact `10304844701`, digest `sha256:92eec5b842c19837e704fd910a6c37172ec68ddbbfe9f5d824ae3bbebcd3592b`.

Detailed immutable evidence is recorded in `work-log/2026-09-12-chatgpt-m5-excluded-controls.md`.

## Milestone 5 — Gate E result

**PASS / proceed to Milestone 6.**

All 28 ordered M5 items are now authoritative-main validated. The final item, **Remove all account/trial/upgrade/cloud/integration controls**, was completed by proving and continuously enforcing the required absence rather than inventing replacement service UI.

Validated final-item behavior:

- production renderer surfaces contain no account, trial, upgrade, profile/avatar identity, integration, billing/subscription, cloud, Blitzy/AI-assistant, sign-in, or login controls;
- `scripts/test-ui-excluded-controls.mjs` recursively checks production `.tsx` renderer sources while excluding fixture-only entries;
- the same deterministic gate positively requires local Search, Settings, and Reports controls and the explicit `?diagnostics=1` diagnostic gate to remain present;
- the gate is part of `preflight:frontend` and therefore runs in authoritative Windows CI;
- no legitimate local Settings/Search/Reports/list/task functionality was removed;
- no auth/cloud/telemetry/trial/upgrade/profile/AI/integration authority was introduced;
- no production renderer, Rust/Tauri source, persistence/schema, dependency/lockfile, timer/session, scheduling, archive, Notes, theme, or visual-fixture behavior changed in the final M5 slice.

## Milestone 6 — active ordered work

Milestone 6 must build the source-evidenced Focus Panel over the already validated authoritative timer/session, scheduling, list/task, Notes, subtasks, theme, and two-webview foundations.

The first ordered item is:

1. `Start Blitz from eligible Today tasks.`

Before implementation, reconstruct the exact existing focus/session/window boundary and source-evidenced eligibility contract. Preserve the existing authoritative timer/session state machine and scheduling eligibility; do not create renderer-owned session authority or a third persistent webview.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` remain the normal two-webview model; Focus Panel and Floating Timer are presentations of the same authoritative runtime.
- authoritative task/list/session/timer/scheduling/note/archive/preferences state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask/list identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- live-task switching, Done, pause/resume, breaks, Time's Up/overtime, Pomodoro boundaries, recovery, and sleep accounting must continue using the validated authoritative engine rather than duplicated Focus UI logic.
- future-timed Today tasks remain ineligible until due; Focus entry must not bypass scheduling eligibility.
- list archive/restore and automatic done-task archival semantics remain unchanged.
- Search remains local/read-only; quick task creation continues to use the persistence-first create path.
- theme is local SQLite-backed preference state; both normal webviews project the same committed theme, and System follows OS/browser color mode without polling.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from Focus entry or task switching.
- hover/focus interactions may not reflow sibling geometry or move hit targets; keyboard/focus-visible equivalents and accessible names/tooltips remain required.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.