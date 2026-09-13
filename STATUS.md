# STATUS.md

Last updated: 2026-09-13

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`. Immutable implementation evidence lives under `work-log/`.

## Current phase

**Milestone 6 — Blitz Mode / Focus Panel.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4 / Gate D: **PASS**.
- Milestone 5 / Gate E: **PASS** — all 28 top-level items validated.
- Milestone 6: **ACTIVE / 9 of 16 top-level items validated**.
- Milestones 7–10: **NOT STARTED**.

General roadmap progress: **5 of 10 milestones complete**.

M6 items 1–9 are validated. The next ordered work is item 10: **React to monitor/display changes while Focus Mode is open.** Do not skip ahead to live-title behavior, row-title polish, action slots/tooltips, later Focus visual states, Floating Timer, shortcuts/preferences, Reports, or release work.

## Current validated source baseline

Latest fully resulting-main-validated **source/test** baseline:

`3230808b61c6649b1adce166731c9ca1f5a2480b`

Tree:

`3921eeccf00abae60bb47837bc2bcba3c4df511f`

This is the expected-head guarded squash merge of PR #109 — `M6: place Focus Panel on selected monitor edge` — from exact validated PR head `c69566ebbff1318403c44958d6fd8503816e92b4`. Resulting-main Windows CI #416 passed on this exact SHA.

Markdown-only tracking descendants created after this source SHA do **not** replace the validated source/test baseline.

## Milestone 6 validated work

### Items 1–2 — Focus entry boundary

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-entry.md`.

- explicit `Blitz now` starts Focus; app/render lifecycle does not implicitly start a timer;
- Rust owns top eligible Today selection and validated scheduling eligibility;
- future-timed Today tasks remain ineligible until due;
- timer mode is authoritative from Pomodoro preference, task EST, then count-up fallback;
- repeated/concurrent entry cannot duplicate or silently switch an existing live session.

### Item 3 — Focus Panel hierarchy

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-panel-hierarchy.md`.

- normal `focusSurface` renders the product Focus Panel while diagnostics remain gated;
- hierarchy includes list selector, Today, quick controls, aggregate EST/progress, live card, Remaining, Add Task, Scheduled and Done;
- panel composes authoritative existing projections rather than creating renderer/domain authority.

### Item 4 — authoritative Focus live timer

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-live-timer.md`.

- live task renders authoritative timer state for EST countdown, count-up, Pomodoro work/break, Time's Up and overtime;
- timer geometry is fixed/tabular;
- sampling is revision-aware and bounded to ticking states; renderer cadence is not timer authority.

### Item 5 — Remaining / Scheduled / Done workflow

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-workflow-sections.md`.

- live identity is excluded from non-live sections;
- ordinary/overdue Today work remains in Remaining;
- future-timed non-overdue Today work is isolated in Scheduled;
- Done is authoritative and section order is preserved.

### Item 6 — Focus live actions

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-actions.md`.

- Break, Notes, Pause/Resume, Skip, Done use existing authoritative boundaries;
- Done persists completion/Time Taken before best-effort next-task continuation;
- Notes reuse the validated M5 editor/viewer and URLs remain explicit activation only.

### Item 7 — Focus subtasks/progress

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-subtasks.md`.

- Focus uses the same persisted subtask identities/order/completion state as Main;
- compact progress plus expanded `TaskSubtasks` mutations remain persistence-first;
- committed-refresh failure is reported as saved-but-not-refreshed and blocks unsafe repeat mutation until refresh/reopen.

### Item 8 — paused Focus EST / Time Taken editing

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-paused-metrics.md`.

- live EST and Time Taken remain read-only except for the exact authoritative `paused` / `overtime_paused` live task;
- edits reuse typed timer/session mutation boundaries and expected-value guards;
- returned authoritative timer payload is projected before secondary board refresh;
- committed-refresh failure blocks unsafe repeat edits rather than misreporting the successful mutation as failed.

PR #108 exact head `39b399fa053b63763d8e3b5243feeccfd13a4295` passed Windows PR CI #412. Resulting source SHA `7cfe942f9dda573106f8143772ebc87f498e5cc0` passed Windows main CI #413.

### Item 9 — selected-monitor / left-right Focus Panel placement

Immutable evidence: `work-log/2026-09-13-chatgpt-m6-focus-panel-placement.md`.

Validated behavior:

- production `presentFocusPanel()` invokes one native `present_focus_panel` command;
- native placement reads persisted `general.selected_monitor_key` and `general.focus_panel_side`;
- saved monitor selection resolves exactly; stale keys retain `MONITOR_SELECTION_STALE` and never silently fall back;
- no saved monitor uses the Windows/Tauri primary monitor and persisted/default side (`Right` by default);
- production and diagnostic placement share the validated M1 work-area/DPI/physical-edge helper;
- renderer code owns no monitor enumeration, work-area, DPI or physical-position logic;
- Start Blitz remains authoritative before presentation; presentation failure cannot retry/rollback a committed timer session;
- no display-hotplug observer changes, Preferences UI, Floating Timer behavior, schema/migration, dependency/lockfile, timer/session semantics or scheduling policy were introduced.

#### PR #109 exact-head validation

The first run, Windows CI #414 / run `34770881321` / job `103760136916`, failed only at `cargo fmt -- --check`. The exact two rustfmt hunks were applied without logic changes.

Final exact PR head:

`c69566ebbff1318403c44958d6fd8503816e92b4`

Tree:

`3921eeccf00abae60bb47837bc2bcba3c4df511f`

Windows PR CI #415:

- run `34771056631`, job `103760608623`, conclusion **SUCCESS**;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10322311638`, digest `sha256:15364fda13988a77bfb1ac9fbf07359a53651a27d0b8e5cb70c022f885948b90`;
- diagnostic/runtime-harness artifact `10322167265`, digest `sha256:8a8629a2732651e289764e68d0368aebfe5239dc07773c6d092a92b249f76378`.

Final review found the exact head unchanged and mergeable, changed-file scope exactly `HANDOFF.md`, `scripts/test-ui-focus-entry.mjs`, `src-tauri/src/lib.rs`, `src/focusEntryApi.ts`, and no comments/reviews/unresolved threads.

Expected-head guarded squash merge source/test SHA:

`3230808b61c6649b1adce166731c9ca1f5a2480b`

Tree:

`3921eeccf00abae60bb47837bc2bcba3c4df511f`

#### Resulting-main validation

Windows main CI #416:

- run `34775579647`, job `103772972498`, conclusion **SUCCESS**;
- exact main SHA `3230808b61c6649b1adce166731c9ca1f5a2480b`;
- Repository Preflight: **SUCCESS**;
- Windows visual regression: **SUCCESS**;
- Tauri Release: **SUCCESS**;
- required artifact uploads: **SUCCESS**;
- visual artifact `10323541445`, digest `sha256:c11d16401fa22ab75ca115c9265910ed2e9237d12e4a3bc728d733b97b11f20e`;
- diagnostic/runtime-harness artifact `10323662287`, digest `sha256:f8799ce43437fecbcf7291f5b06a3302323637352501eef02663b5a0c4c966ac`.

## Milestone 6 — next ordered work

The next top-level item is:

10. `React to monitor/display changes while Focus Mode is open.`

Reconstruct the exact behavior from the validated M1 event-driven display-topology observer/off-screen recovery path, item-9 preference-aware placement, `docs/M1_DISPLAY_TOPOLOGY_VALIDATION.md`, `docs/ARCHITECTURE.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, and relevant history-risk/work-log evidence.

The next slice must remain event-driven and native-authoritative. It should revalidate/recover an already-open Focus Panel after monitor connection/disconnection/reorder or work-area/DPI change without renderer geometry calculations, high-frequency polling, a third webview, timer/session mutation, Preferences UI, Floating Timer scope, or later Focus visual-polish work.

## Durable correctness decisions

Future work must preserve:

- Narro remains personal, local-only Windows 10/11 x64 software; no auth/cloud/telemetry/integration authority is introduced.
- Tauri 2 + React/TypeScript + authoritative Rust/domain state + SQLite remains the validated architecture.
- `main` and reusable `focusSurface` remain the normal two-webview model.
- native/Rust window coordination remains monitor/work-area/DPI/physical-position authority.
- M1 display-topology handling remains event-driven; no renderer/high-frequency polling loop is introduced.
- authoritative task/list/subtask/session/timer/scheduling/note/archive/preferences state remains outside renderer memory; persistence-first mutations remain the success boundary.
- stable identities, tracked Time Taken, scheduling/date-only/timezone/recurrence semantics and All Lists aggregate semantics must not regress.
- future-timed Today tasks remain ineligible until due.
- repeated Focus entry cannot duplicate or silently switch an existing live session.
- Focus queue partitioning cannot clone identities or reinterpret scheduling state.
- subtask and paused-metric committed-refresh failure semantics must remain safe and non-retrying.
- Break/Pause-Resume/Skip/Done remain authoritative timer/session transitions.
- Notes URLs require explicit pointer/keyboard activation and may never auto-launch from Focus entry/task switching/Notes opening.
- hover/focus interactions may not reflow sibling geometry; reduced-motion remains usable and timer numerals remain tabular.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent; diagnostics remain gated behind `?diagnostics=1`.