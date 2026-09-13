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
- Milestone 6: **ACTIVE / 3 of 16 top-level items validated**.
- Milestones 7–10: **NOT STARTED**.

General roadmap progress remains **5 of 10 milestones complete**. M6 items 1–3 are validated. The next ordered work is item 4: **Render current task and authoritative timer with fixed/tabular timer geometry.** Do not skip ahead to later Focus controls, Floating Timer, shortcuts/preferences, Reports, or release polish.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`afaffaf616be89f8a967e61fb1c82b8453d83af8`

Tree:

`14fe75bdc155fb1aeb8a101ad76948fe10f38503`

This is the expected-head guarded squash merge of PR #102 — `M6: reproduce Focus Panel hierarchy` — from exact validated PR head `4f34d1e9bc108bb3a44c42be24121239b13f82f3`.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

## M6 items 1–2 — validated Focus entry boundary

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-entry.md`.

Validated behavior remains:

- explicit `Blitz now` is the production Focus-entry action; renderer/app launch does not auto-start a timer;
- Rust owns top-eligible Today selection and reuses validated M4 scheduling eligibility;
- future-timed Today tasks remain ineligible until due;
- timer mode resolves authoritatively from Pomodoro preferences, task EST, then count-up fallback;
- repeated/concurrent Start Blitz cannot duplicate or silently switch an existing live session;
- existing M3 `TimerService` / `TimerRuntime` remains the only authoritative persistence-first timer/session boundary;
- Focus entry does not auto-open task-note URLs;
- the normal two-webview model remains `main` plus reusable `focusSurface`.

## M6 item 3 — validated Focus Panel hierarchy

Implemented and validated behavior:

- normal `focusSurface` renders the product Focus Panel; the M1 diagnostic harness remains explicitly gated behind `?diagnostics=1`;
- the panel composes existing `get_home_snapshot`, `get_list_board_snapshot`, and revisioned timer-session projection instead of introducing renderer/domain authority;
- hierarchy reproduces the source-evidenced `All`/list selector, Today heading, quick controls, aggregate EST/progress, emphasized active live card, remaining queue, list-origin chips, overdue/schedule/subtask metadata, `+ ADD TASK`, Scheduled group, and Done group;
- list selector changes read context only; no renderer-owned task/session authority or polling was introduced;
- authoritative timer transitions refresh the planning projection through the existing typed event flow;
- later-item controls visible for hierarchy fidelity remain explicitly non-mutating rather than inventing premature semantics;
- deterministic production-component Focus fixtures and Windows Edge light/dark captures validate the same production DOM/CSS;
- no Rust/Tauri source, schema/migration, timer engine, scheduling policy, dependencies/lockfile, Notes URL behavior, Floating Timer, preferences/shortcuts, Reports, or release scope changed.

### PR #102 exact-head validation

Final exact PR head:

`4f34d1e9bc108bb3a44c42be24121239b13f82f3`

Windows PR CI #401:

- run `34723924944`, job `103634614847`, conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- production Windows Edge Focus Panel light/dark capture/validation: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10307940032`, digest `sha256:ff6b596e284cf65ad5aab2d36098cc6f3f296e2b68f1c76149bc704d75c64203`;
- diagnostic artifact `10307700842`, digest `sha256:4ba893354d5ab3486db9cc11a998bc54fa41afa973cfa40ee222fd2ff3ef87ee`;
- final changed files were limited to Focus Panel production/fixture/validation wiring plus `HANDOFF.md`;
- no PR comments, reviews, or unresolved review threads required action;
- exact validated head remained unchanged through guarded merge.

Two earlier PR runs supplied narrow fix evidence without advancing validation: CI #396 exposed only a TypeScript union-narrowing error after the static Focus gates had passed; CI #398 passed the entire repository preflight and created the Focus captures, then exposed only a validator assumption that conflated PNG capture height with headless Edge DOM layout height. Both fixes were limited to the exact evidence and final CI #401 passed.

### Resulting-main validation

PR #102 was squash-merged with expected-head guard `4f34d1e9bc108bb3a44c42be24121239b13f82f3`.

Resulting source SHA:

`afaffaf616be89f8a967e61fb1c82b8453d83af8`

Windows main CI #402:

- run `34728728053`, job `103647484892`, conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- production Windows Edge visual regression: **SUCCESS**;
- visual artifact upload: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- diagnostic artifact upload: **SUCCESS**;
- visual artifact `10309072118`, digest `sha256:c17f5a7aba0fcd44defc7d5a1da4243f632bdf344791fdc1ec8b01346a9cd196`;
- diagnostic artifact `10309022543`, digest `sha256:9c608b9033ebcb0e37d5a27cad0bc74ad30f2841890cb7e627fbdd6866b9daed`.

Detailed immutable evidence is recorded in `work-log/2026-09-13-chatgpt-m6-focus-panel-hierarchy.md`.

## Milestone 6 — next ordered work

The next top-level item is:

4. `Render current task and authoritative timer with fixed/tabular timer geometry.`

Implement this as the next narrow Focus Panel slice on top of the validated hierarchy. Reuse the existing revisioned authoritative timer/session projection and current live task identity. Timer numerals must remain fixed/tabular, renderer lifecycle must stay presentation-only, and timer/session persistence/recovery semantics from M3 must not be duplicated or weakened.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` remain the normal two-webview model; Focus Panel and Floating Timer are presentations of the same authoritative runtime.
- authoritative task/list/session/timer/scheduling/note/archive/preferences state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask/list identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- future-timed Today tasks remain ineligible until due; Focus entry must not bypass scheduling eligibility.
- repeated Focus entry cannot duplicate or silently switch an existing live session.
- Focus hierarchy/list switching remains read-only unless a later ordered item explicitly adds a validated mutation boundary.
- task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from Focus entry or task switching.
- hover/focus interactions may not reflow sibling geometry or move hit targets; keyboard/focus-visible equivalents and accessible names/tooltips remain required.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
