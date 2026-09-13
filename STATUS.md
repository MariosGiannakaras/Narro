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
- Milestone 6: **ACTIVE / 6 of 16 top-level items validated**.
- Milestones 7–10: **NOT STARTED**.

General roadmap progress remains **5 of 10 milestones complete**. M6 items 1–6 are validated. The next ordered work is item 7: **Implement subtasks/progress in focus mode.** Do not skip ahead to paused EST/Time Taken editing, monitor placement, later Focus polish, Floating Timer, shortcuts/preferences, Reports, or release work.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`17d7f9a2a99bd33a43f02afb7d81201c1dc23195`

Tree:

`3476df620697441df7d98b81e3d78d80aa08cbf4`

This is the expected-head guarded squash merge of PR #106 — `M6: lock Focus action state contract` — from exact validated PR head `d6d969b7eaaf4e2fe5ee443236437e070c3b0a1f`. It contains the PR #105 production Focus action implementation plus six test-only state-contract assertions. Resulting-main Windows CI #409 passed on this exact SHA.

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

Validated behavior remains:

- current live task identity is excluded from non-live queue sections;
- ordinary Today work remains in Remaining;
- overdue scheduled/date work remains actionable in Remaining;
- future-timed non-overdue Today work is shown in Scheduled and cannot also appear in Remaining;
- Done comes from authoritative `ListBoardSnapshot.done` rather than renderer-created completion history;
- All Lists keeps list-origin chips; selected-list projection uses the same stable identities;
- section order remains active card -> Remaining -> Add Task -> Scheduled -> Done;
- this item adds no action mutation semantics.

PR #104 exact head `129687c381b84a91e76d008e8163c5b8bade21aa` passed Windows PR CI #405 / run `34747582849`; resulting source SHA `c74985c117aa4ac550ad6ade1442f28c998c5f49` passed Windows main CI #406 / run `34748317733`.

## M6 item 6 — validated Focus live actions

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-actions.md`.

Validated behavior:

- the live action strip is fixed in source-evidenced order: Break, Notes, Pause/Resume, Skip, Done;
- Break uses the authoritative manual work-to-break transition and the established 10-minute default until M8 exposes the persisted preference;
- active-break Resume maps to authoritative `timer_skip_break`;
- Pause/Resume reuses the validated idempotent M3 transitions, including overtime states;
- Skip refreshes authoritative board/timer snapshots, rejects stale live-task identity, excludes future-timed non-overdue Today rows and uses one persistence-first `timer_switch_task` to the next eligible task, falling back to `timer_skip_task` only when no next eligible task exists;
- Done commits through the M3 coupled completion boundary before any start-next attempt, preserving durable Time Taken;
- a failed best-effort start-next after committed Done remains a continuation warning, not a failed completion or retry invitation;
- Notes reuse the validated M5 `TaskNotes` component, including explicit pointer/keyboard-only URL activation;
- no renderer-owned elapsed clock, Rust timer/session rewrite, schema/migration, dependency or scheduling-policy change was introduced;
- static Focus contract coverage locks break-state identification plus Break/Pause-Resume/Skip/Done state gating;
- Windows light/dark visual regression covers the fixed five-action geometry.

### PR #105 production implementation validation

Exact PR head:

`26c431de9f3c318bce15325c51ef767988d7ece5`

Windows PR CI #407:

- run `34749228254`, job `103702560465`, conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10315332440`, digest `sha256:de3579f9c3192c4c3a2e7e256ae6ef50d6bb061519bfb74e832c50863d4d7cda`;
- diagnostic artifact `10315167944`, digest `sha256:1f8bb3ae4b443dccc6e58279a32d4e60170cbe1990898fe4344c50adf6d54d30`.

GitHub's merge transaction temporarily advanced main to source commit `1fdc619d120a81dbd30e88e5dfee28ac13fde8b0` with production tree `df10c7fab1b13e9742787a9787562e7692b70fe2` while PR metadata remained open and no push workflow event was emitted. Retrying the same expected-head guarded merge closed PR #105 at GitHub-reported merge commit `e31d7b695014e32c14ab452393a521323fef4f03`, which had zero file changes and retained the same production tree. This did not by itself satisfy resulting-main CI requirements.

### PR #106 test-only follow-up validation

PR #106 added exactly six static contract assertions and no production-source changes.

Exact PR head:

`d6d969b7eaaf4e2fe5ee443236437e070c3b0a1f`

Windows PR CI #408:

- run `34750003487`, job `103704719842`, conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10315775336`, digest `sha256:d1aab4cfbadce4ae55393ba22324c7139612842b1d68f1b5c8f0c5ad2704d258`;
- diagnostic artifact `10315568456`, digest `sha256:2157ad8e7dba35c672657984fc521179f45a5ba7aef90d65288f8da741dff8ca`.

Expected-head guarded squash merge resulting source/test SHA:

`17d7f9a2a99bd33a43f02afb7d81201c1dc23195`

Tree:

`3476df620697441df7d98b81e3d78d80aa08cbf4`

### Resulting-main validation

Windows main CI #409:

- run `34750884431`, job `103707110038`, conclusion **SUCCESS**;
- exact head SHA `17d7f9a2a99bd33a43f02afb7d81201c1dc23195`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10315666938`, digest `sha256:e3d6e5733612f9a2f236773614271e3ed02289ca7c6836555c139c0a67665378`;
- diagnostic artifact `10316660232`, digest `sha256:eba28cfd98279589d912e67f7c98a7963065d5b68293739add61180acb21604b`.

## Milestone 6 — next ordered work

The next top-level item is:

7. `Implement subtasks/progress in focus mode.`

Start this as the next narrow Focus slice. Reconstruct the exact subtask/progress contract from repository source/spec/fixture evidence, inspect the validated M2/M5 subtask APIs/components and current `ListBoardTask` projection, then reuse those identity-preserving boundaries in Focus. Do not absorb item 8 paused EST/Time Taken editing, monitor placement, title behavior, hover/action-slot/tooltips work, later visual-state/empty-state work, Milestone 7 Floating Timer polish, Milestone 8 shortcuts/preferences, Reports or release work.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` remain the normal two-webview model; Focus Panel and Floating Timer are presentations of the same authoritative runtime.
- authoritative task/list/session/timer/scheduling/note/archive/preferences state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask/list identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- future-timed Today tasks remain ineligible until due; Focus entry, queue rendering and Skip/Done next-task selection must not bypass scheduling eligibility.
- repeated Focus entry cannot duplicate or silently switch an existing live session.
- live timer sampling remains bounded to ticking states and cannot become a renderer-owned clock or per-second database/list-board poll.
- Focus queue partitioning cannot clone identities or reinterpret scheduling state.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions; successful committed completion cannot be rolled back semantically by secondary UI continuation failure.
- task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from Focus entry, task switching or Notes opening.
- hover/focus interactions may not reflow sibling geometry or move hit targets; keyboard/focus-visible equivalents and accessible names/tooltips remain required.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.
