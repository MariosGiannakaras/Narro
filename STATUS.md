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
- Milestone 6: **ACTIVE / 8 of 16 top-level items validated**.
- Milestones 7–10: **NOT STARTED**.

General roadmap progress remains **5 of 10 milestones complete**. M6 items 1–8 are validated. The next ordered work is item 9: **Implement selected-monitor and left/right Focus Panel placement.** Do not skip ahead to display-hotplug reaction, later Focus polish, Floating Timer, shortcuts/preferences, Reports, or release work.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`7cfe942f9dda573106f8143772ebc87f498e5cc0`

Tree:

`eb6977360e8803166a35549e24af9f25fb12e2d3`

This is the expected-head guarded squash merge of PR #108 — `M6: add paused Focus EST and Time Taken editing` — from exact validated PR head `39b399fa053b63763d8e3b5243feeccfd13a4295`. Resulting-main Windows CI #413 passed on this exact SHA.

Markdown-only tracking descendants do **not** replace this validated source/test baseline.

## Milestone 6 validated work

### Items 1–2 — Focus entry boundary

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-entry.md`.

Validated behavior remains:

- explicit `Blitz now` starts Focus; renderer/app launch does not implicitly start a timer;
- Rust owns top-eligible Today selection and reuses validated scheduling eligibility;
- future-timed Today tasks remain ineligible until due;
- timer mode resolves authoritatively from Pomodoro preferences, task EST, then count-up fallback;
- repeated/concurrent Focus entry cannot duplicate or silently switch an existing live session;
- M3 timer/session authority remains persistence-first and outside renderer memory;
- normal architecture remains `main` plus reusable `focusSurface`.

### Item 3 — Focus Panel hierarchy

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-panel-hierarchy.md`.

Validated behavior remains:

- normal `focusSurface` renders the product Focus Panel; diagnostics stay gated behind `?diagnostics=1`;
- panel state composes existing home/list-board/timer projections rather than introducing renderer/domain authority;
- hierarchy reproduces list selector, Today, quick controls, aggregate EST/progress, live card, Remaining, Add Task, Scheduled and Done;
- All Lists preserves list-origin chips;
- production-component fixture plus Windows light/dark capture validates DOM/CSS hierarchy.

### Item 4 — authoritative Focus live timer

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-live-timer.md`.

Validated behavior remains:

- live task renders authoritative `TimerSnapshot` state only;
- EST countdown, count-up, Pomodoro work, break, `Time's Up`, overtime running and overtime paused are represented;
- timer uses fixed `10ch` geometry and tabular numerals;
- live sampling preserves revision ordering and occurs only while authoritative state is ticking;
- renderer cadence never becomes timer/session/persistence authority.

PR #103 exact head `84373aca8169fd19c453a27530e0e0b8ebef1eae` passed Windows PR CI #403; resulting main `aaefd323d0523a8129156858fc7e4f72ca849e97` passed Windows main CI #404.

### Item 5 — Remaining / Scheduled / Done workflow

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-workflow-sections.md`.

Validated behavior remains:

- live identity is excluded from non-live queue sections;
- ordinary/overdue actionable Today work remains in Remaining;
- future-timed non-overdue Today work is isolated in Scheduled;
- Done comes from authoritative `ListBoardSnapshot.done`;
- section order remains live card -> Remaining -> Add Task -> Scheduled -> Done.

PR #104 exact head `129687c381b84a91e76d008e8163c5b8bade21aa` passed Windows PR CI #405; resulting source SHA `c74985c117aa4ac550ad6ade1442f28c998c5f49` passed Windows main CI #406.

### Item 6 — Focus live actions

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-actions.md`.

Validated behavior remains:

- fixed action order: Break, Notes, Pause/Resume, Skip, Done;
- Break/Resume/Pause/Skip/Done reuse authoritative M3 timer/session transitions;
- Skip/Done refresh authoritative task/timer state and preserve scheduling eligibility;
- Done commits completion/Time Taken before any best-effort start-next continuation;
- secondary continuation failure cannot turn committed completion into failure;
- Notes reuse M5 `TaskNotes` and URLs open only by explicit pointer/keyboard action;
- no renderer-owned elapsed/session authority was introduced.

PR #105 production exact head `26c431de9f3c318bce15325c51ef767988d7ece5` passed Windows PR CI #407. Because GitHub's PR #105 merge transaction produced a source-changing intermediate main commit followed by a zero-diff PR-completion commit without usable resulting-main push CI, PR #106 added only six static state-contract assertions and provided a clean non-Markdown merge boundary. PR #106 exact head `d6d969b7eaaf4e2fe5ee443236437e070c3b0a1f` passed Windows PR CI #408; resulting main `17d7f9a2a99bd33a43f02afb7d81201c1dc23195` passed Windows main CI #409.

### Item 7 — Focus subtasks/progress

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-subtasks.md`.

Validated behavior:

- Focus live task projects the same persisted `BoardSubtask` identities/order/completion state used by Main/List Board;
- collapsed surface renders a progress ring, authoritative `n/m Subtasks` count, Add and expand/collapse controls;
- expansion loads task-scoped authoritative subtasks and reuses `TaskSubtasks` for create, title edit, complete/reopen, reorder and delete;
- existing expected-value/order concurrency guards remain the persistence-first mutation boundary;
- after a saved mutation, task-scoped subtask state and current board projection are refreshed together and completed/total counts must reconcile before the refreshed projection is accepted;
- a committed mutation followed by secondary refresh/reconciliation failure is reported as saved-but-not-refreshed, blocks unsafe repeat mutation attempts and requires reopening/refreshed Focus rather than misreporting the commit as failed;
- live-card parent `data-task-id` preserves the validated subtask parent-identity guard;
- item-6 live actions remain unchanged;
- React StrictMode effect replay cannot permanently suppress later authoritative refresh state updates;
- Focus-specific compact styling avoids importing the entire Main-window board stylesheet;
- static plus Windows light/dark visual coverage locks the subtask contract and geometry;
- no Rust/Tauri source, schema/migration, dependency/lockfile, timer/session semantics, scheduling policy, monitor/display behavior, Floating Timer, shortcuts/preferences, Reports or release behavior changed.

#### PR #107 exact-head validation

Exact PR head:

`00b1d7290cf8ea09fe3b5b986b203bd44406d720`

Tree:

`be9c421f2e769ff2842c103b92203680609ef32a`

Windows PR CI #410:

- run `34754810013`, job `103717290439`, conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10317231156`, digest `sha256:ee3b07a3853fa04bec91445d0579f1f9786bc21dc92629de25d733be93fe81e3`;
- diagnostic/runtime-harness artifact `10317120955`, digest `sha256:5a0ba23305c1d34b973c81cdd834a50c594d87b6f8076860be64708456b35a01`.

Final exact-head review found the head unchanged and mergeable, no comments/reviews/unresolved threads, and scope limited to Focus source/static/visual files plus in-progress handoff.

Expected-head guarded squash merge resulting source/test SHA:

`cadc4eab7a04c2b4defccf085f7658d031ff8328`

Tree:

`be9c421f2e769ff2842c103b92203680609ef32a`

#### Resulting-main validation

Windows main CI #411:

- run `34756977752`, job `103722921099`, conclusion **SUCCESS**;
- exact main SHA `cadc4eab7a04c2b4defccf085f7658d031ff8328`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10317784445`, digest `sha256:240f3330e0c6ee0935d25d67abdab90d7852d0ea1c194ea9c90cf50788dcb0e9`;
- diagnostic/runtime-harness artifact `10318046699`, digest `sha256:f5195bda2a5d8902e916dffdda79b074d909184be5cb564f0762812d38a67bea`.

### Item 8 — paused Focus EST / Time Taken editing

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-paused-metrics.md`.

Validated behavior:

- Focus always shows authoritative EST and Time Taken for the live task;
- editing is exposed only when the exact authoritative live task is `paused` or `overtime_paused`; running, break, `time_up`, `overtime_running`, idle and mismatched task identities remain read-only;
- EST reuses `setPausedTimerEstimate` / `timer_set_estimate` and Time Taken reuses `setPausedTimerTimeTaken` / `timer_set_time_taken`; no Focus-only persistence/timer authority was introduced;
- expected EST / authoritative-total guards and M5 `H:MM:SS` / Rust `u32` validation remain the concurrency/validation boundary;
- the returned authoritative timer payload is projected before secondary board refresh so EST/runtime rebasing is immediately visible;
- board refresh must reconcile the same task/list identity and exact saved metric value;
- if a metric mutation committed but secondary refresh/reconciliation fails, Focus reports saved-but-not-refreshed, blocks further metric edits and requires reopening/refreshed Focus rather than enabling unsafe retries;
- leaving paused/overtime-paused closes an open metric editor; backend paused/task/expected-value guards remain final authority;
- item-6 actions and item-7 subtask/progress behavior remain unchanged;
- static plus Windows running/paused-metrics light/dark visual coverage locks read-only/editable state and compact geometry;
- no Rust/Tauri source, schema/migration, dependency/lockfile, scheduling policy, monitor/display behavior, Floating Timer, shortcuts/preferences, Reports or release behavior changed.

#### PR #108 exact-head validation

Exact PR head:

`39b399fa053b63763d8e3b5243feeccfd13a4295`

Tree:

`eb6977360e8803166a35549e24af9f25fb12e2d3`

Windows PR CI #412:

- run `34768156548`, job `103752758975`, conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10321605266`, digest `sha256:128c4b29d02e0242ee21e4e1d12423a2ea5a5582663485c8a9d49e242c6bf7d6`;
- diagnostic/runtime-harness artifact `10321750409`, digest `sha256:a724ec7d152c27d3c035a4212c21c1030ed8608f37b569442539e8bab05ebe46`.

Final exact-head review found the validated head unchanged and mergeable, the eight-file scope limited to Focus metric/action source/CSS, Focus static/visual scripts and in-progress handoff, with no comments/reviews/unresolved threads.

Expected-head guarded squash merge resulting source/test SHA:

`7cfe942f9dda573106f8143772ebc87f498e5cc0`

Tree:

`eb6977360e8803166a35549e24af9f25fb12e2d3`

#### Resulting-main validation

Windows main CI #413:

- run `34768987050`, job `103754978629`, conclusion **SUCCESS**;
- exact main SHA `7cfe942f9dda573106f8143772ebc87f498e5cc0`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10321826013`, digest `sha256:cbf7539eb309156f6dd961d0563d79765a0ac3d760b8d780fb304115988edf08`;
- diagnostic/runtime-harness artifact `10321502031`, digest `sha256:84b9f3e90eee84367192e11b21b48bc044b6f0d3fa6b3c8496572e7fa84f4c4e`.

## Milestone 6 — next ordered work

The next top-level item is:

9. `Implement selected-monitor and left/right Focus Panel placement.`

Start this as the next narrow Focus slice. Reconstruct the exact placement contract from the validated M1 monitor-enumeration/edge-positioning primitives, current window-coordination code, relevant Focus product/UI evidence and current preferences model. Reuse the existing native monitor/window authority rather than implementing renderer geometry authority. Do not absorb item 10 display-topology/hotplug reaction or later title behavior, action-slot/tooltips work, visual-state/empty-state work, Milestone 7 Floating Timer, Milestone 8 shortcuts/preferences, Reports or release work unless item 9 proves a direct dependency.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` remain the normal two-webview model; Focus Panel and Floating Timer are presentations of the same authoritative runtime.
- authoritative task/list/subtask/session/timer/scheduling/note/archive/preferences state lives outside renderer memory; persistence-first mutations remain the success boundary.
- stable task/subtask/list identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- future-timed Today tasks remain ineligible until due.
- repeated Focus entry cannot duplicate or silently switch an existing live session.
- live timer sampling remains bounded to ticking states and cannot become a renderer-owned clock or per-second database/list-board poll.
- Focus queue partitioning cannot clone identities or reinterpret scheduling state.
- Focus subtask progress must remain backed by the same persisted records as Main; committed subtask changes cannot be converted into reported mutation failures solely by secondary refresh failure.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions; successful committed completion cannot be rolled back semantically by secondary UI continuation failure.
- paused manual Time Taken editing must rebase the authoritative live runtime/session so later resume/pause/Done cannot snap back or double-count.
- live EST and Time Taken editing remain available only for the exact authoritative paused/overtime-paused live task; successful writes use existing typed timer/session mutation boundaries and cannot become renderer-owned metadata authority.
- task/list/archive/Search/theme/preferences behavior validated through M5 must not regress.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from Focus entry, task switching or Notes opening.
- hover/focus interactions may not reflow sibling geometry or move hit targets; keyboard/focus-visible equivalents and accessible names/tooltips remain required.
- motion never owns or delays domain-state completion; `prefers-reduced-motion` remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.

## Multi-agent continuation rule

Repository state must remain sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, relevant `docs/*`, and newest `work-log/*.md` entries as the continuation source of truth.