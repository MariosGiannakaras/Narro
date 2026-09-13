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
- Milestone 6: **ACTIVE / 5 of 16 top-level items validated**.
- Milestones 7–10: **NOT STARTED**.

General roadmap progress remains **5 of 10 milestones complete**. M6 items 1–5 are validated. The next ordered work is item 6: **Implement break, notes, pause/resume, skip, finish.** Do not skip ahead to subtasks/progress, paused EST/Time Taken editing, monitor placement, later Focus polish, Floating Timer, shortcuts/preferences, Reports, or release work.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`c74985c117aa4ac550ad6ade1442f28c998c5f49`

Tree:

`8eaf157fdb4d5c4d9db12091c6149e8c4ae1108b`

This is the expected-head guarded squash merge of PR #104 — `M6: validate Focus workflow sections` — from exact validated PR head `129687c381b84a91e76d008e8163c5b8bade21aa`.

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

Validated behavior remains:

- current live task renders authoritative `TimerSnapshot` state only;
- EST countdown, count-up, Pomodoro work, break countdown, explicit `Time's Up`, overtime running and overtime paused are represented;
- countdown display rounds upward; elapsed/overtime display rounds downward;
- timer geometry uses a fixed `10ch` slot and tabular numerals;
- `connectLiveTimerSessionProjection` preserves listen-before-snapshot race protection and revision ordering;
- snapshot sampling occurs at most once per second only while authoritative state is ticking (`running`, `break`, `overtime_running`);
- stable states stop sampling until a typed timer event changes state;
- renderer cadence never becomes timer/session/persistence authority or a per-second planning-state poll.

PR #103 exact head `84373aca8169fd19c453a27530e0e0b8ebef1eae` passed Windows PR CI #403 / run `34730948100`; resulting main `aaefd323d0523a8129156858fc7e4f72ca849e97` passed Windows main CI #404 / run `34731560893`.

## M6 item 5 — validated Remaining / Scheduled / Done workflow

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-workflow-sections.md`.

Validated behavior:

- current live task identity is excluded from non-live queue sections;
- ordinary Today work remains in Remaining;
- overdue scheduled/date work remains actionable in Remaining;
- future-timed non-overdue Today work is shown in Scheduled and cannot also appear in Remaining;
- Done comes from authoritative `ListBoardSnapshot.done` rather than renderer-created completion history;
- All Lists keeps list-origin chips; selected-list projection uses the same stable identities;
- section order remains active card -> Remaining -> Add Task -> Scheduled -> Done;
- this item adds no action mutation semantics.

The production behavior already existed from the earlier hierarchy slice. PR #104 therefore added only explicit regression coverage plus in-progress handoff text; no production source rewrite was needed.

### PR #104 exact-head validation

Final exact PR head:

`129687c381b84a91e76d008e8163c5b8bade21aa`

Windows PR CI #405:

- run `34747582849`, job `103698237432`, conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10315220318`, digest `sha256:c07fecca5f209da2c7e7e3c2acdb0e67928a834b7aff0869ae6147e2559247f7`;
- diagnostic artifact `10315415290`, digest `sha256:f170b6fdb5516a8d90bd6ab7ae4d7013b1afdafb51ed5cd40d7bef6a768f1671`.

### Resulting-main validation

Resulting source SHA:

`c74985c117aa4ac550ad6ade1442f28c998c5f49`

Windows main CI #406:

- run `34748317733`, job `103700208950`, conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10314173991`, digest `sha256:ef8cbf16d39b327d410605371bb81f44c359693fc151b1c68b03123df82f36df`;
- diagnostic artifact `10315251351`, digest `sha256:628a0ad331df9dca01e1588d37ad310a3470859f7dccac727e54a8db4da514a1`.

## Milestone 6 — next ordered work

The next top-level item is:

6. `Implement break, notes, pause/resume, skip, finish.`

Implement this as the next narrow Focus action slice. Reconstruct the exact action/state contract from current product/UI/source evidence and inspect the already validated M3 timer/session commands/events plus M5 Notes APIs before editing. Reuse those authoritative mutation boundaries instead of duplicating timer/session or note authority in React. Preserve tracked Time Taken, work/break separation, persistence-first transitions, recovery, `Time's Up`/overtime/Pomodoro semantics and explicit-only URL opening. Do not absorb item 7 subtasks/progress, item 8 paused EST/Time Taken editing, later Focus placement/title/action-slot/tooltips/visual-state work, or Milestone 7 Floating Timer polish.

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
- Focus queue partitioning cannot clone identities or reinterpret scheduling state.
- task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from Focus entry, task switching or Notes opening.
- hover/focus interactions may not reflow sibling geometry or move hit targets; keyboard/focus-visible equivalents and accessible names/tooltips remain required.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
