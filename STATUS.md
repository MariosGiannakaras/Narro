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
- Milestone 6: **ACTIVE / 4 of 16 top-level items validated**.
- Milestones 7–10: **NOT STARTED**.

General roadmap progress remains **5 of 10 milestones complete**. M6 items 1–4 are validated. The next ordered work is item 5: **Show remaining/scheduled/done sections matching documented focus workflow.** Do not skip ahead to item-6 Focus controls, Floating Timer, shortcuts/preferences, Reports, or release polish.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`aaefd323d0523a8129156858fc7e4f72ca849e97`

Tree:

`334aaefc45113770ef1f3c2dc94373951ac90913`

This is the expected-head validated squash merge of PR #103 — `M6: render authoritative Focus live timer` — from exact validated PR head `84373aca8169fd19c453a27530e0e0b8ebef1eae`.

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

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-panel-hierarchy.md`.

Validated behavior remains:

- normal `focusSurface` renders the product Focus Panel; diagnostics remain gated behind `?diagnostics=1`;
- panel state composes existing home/list-board/timer projections rather than introducing renderer/domain authority;
- hierarchy reproduces list selector, Today heading, quick controls, aggregate EST/progress, active live card, remaining queue, list-origin chips, overdue/schedule/subtask metadata, `+ ADD TASK`, Scheduled and Done groups;
- list selector changes read context only;
- deterministic production-component fixtures and Windows Edge light/dark captures validate the production DOM/CSS.

## M6 item 4 — validated authoritative Focus live timer

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-live-timer.md`.

Validated behavior:

- current live task renders an authoritative timer readout from `TimerSnapshot` only;
- EST countdown, count-up, Pomodoro work, break countdown, explicit `Time's Up`, overtime running and overtime paused states are represented;
- countdown display rounds upward; elapsed/overtime display rounds downward, avoiding premature zero or fabricated elapsed time;
- timer geometry uses a fixed `10ch` slot and tabular numerals;
- `connectLiveTimerSessionProjection` preserves listen-before-snapshot race protection and revision ordering;
- snapshot sampling occurs at most once per second only while the authoritative state is ticking (`running`, `break`, `overtime_running`);
- stable states stop sampling until a typed timer event changes authoritative state;
- renderer cadence remains presentation-only and does not calculate authoritative elapsed time, mutate timer/session state, write persistence, or poll planning state;
- production Focus fixtures and Windows validation require authoritative timer value, tabular marker, accessible label and stable light/dark timer geometry.

### PR #103 exact-head validation

Final exact PR head:

`84373aca8169fd19c453a27530e0e0b8ebef1eae`

Windows PR CI #403:

- run `34730948100`, job `103653504912`, conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Focus Panel Windows Edge visual capture/validation: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10308304972`, digest `sha256:ee892015a97edf36b76c72ebd9c886aceb4c21c26649af308a5a6a2f2b5d008c`;
- diagnostic artifact `10310040153`, digest `sha256:f2e54eccaa59ba2e3b7b0ea3e03c97e91bbc72e5e94875413e5462cf6d473d9f`.

### Resulting-main validation

Resulting source SHA:

`aaefd323d0523a8129156858fc7e4f72ca849e97`

Windows main CI #404:

- run `34731560893`, job `103655163926`, conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10310001250`, digest `sha256:09192116597bd121ca59db101e63c62fa213cb92150a5bdf93705cb01d57e00b`;
- diagnostic artifact `10310336106`, digest `sha256:ad2d0cf188355cfc02b208299cd892d62dd0f32544d1fd880d54462d11de5209`.

## Milestone 6 — next ordered work

The next top-level item is:

5. `Show remaining/scheduled/done sections matching documented focus workflow.`

Implement this as the next narrow Focus Panel slice on top of the validated hierarchy/live timer. Reconstruct workflow semantics from current product/UI/source evidence and existing list-board projection. Preserve stable task identities, M4 scheduling eligibility/date semantics and M3 timer/session authority. Do not absorb item-6 break/notes/pause/resume/skip/finish controls.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` remain the normal two-webview model; Focus Panel and Floating Timer are presentations of the same authoritative runtime.
- authoritative task/list/session/timer/scheduling/note/archive/preferences state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask/list identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- future-timed Today tasks remain ineligible until due; Focus entry and queue rendering must not bypass scheduling eligibility.
- repeated Focus entry cannot duplicate or silently switch an existing live session.
- live timer sampling remains bounded to ticking states and cannot become a renderer-owned clock or per-second database/list-board poll.
- Focus hierarchy/list switching remains read-only unless a later ordered item explicitly adds a validated mutation boundary.
- task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from Focus entry or task switching.
- hover/focus interactions may not reflow sibling geometry or move hit targets; keyboard/focus-visible equivalents and accessible names/tooltips remain required.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
