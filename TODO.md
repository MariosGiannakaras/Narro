# TODO.md

Milestones are ordered. Do not skip ahead unless a later task is required to unblock the current one.

## Milestone 1 — Windows desktop scaffold, capability and performance spike

Goal: prove the selected Tauri stack and lightweight focus-window architecture before product UI is built.

- [ ] Create a Tauri 2 + React + TypeScript scaffold targeting Windows 10/11 x64.
- [ ] Add Rust modules for app state, persistence, timers, scheduling, and window coordination.
- [ ] Add SQLite plus migration harness; create migration `0001` even if the initial schema is minimal.
- [ ] Create only two initial webview windows: `main` and `focusSurface`.
- [ ] Prove programmatic create/show/hide/destroy/recreate/focus behavior for `main` without losing Rust/domain state.
- [ ] Implement two temporary modes on `focusSurface`: Focus Panel and compact Floating Timer.
- [ ] Prove switching those modes by resize/reposition/restyle of the same secondary webview.
- [ ] Prove always-on-top and skip-taskbar behavior for Floating Timer mode.
- [ ] Prove Windows monitor enumeration and left/right positioning for Focus Panel mode.
- [ ] Prove global shortcut registration and conflict/error handling.
- [ ] Prove tray/background lifecycle plus explicit Quit.
- [ ] Prove local Windows notification delivery while process remains running.
- [ ] Prove Windows autostart can be toggled locally.
- [ ] Build the `focusSurface` as a separate minimal frontend entry/bundle that does not import dashboard/reports/settings/editor code.
- [ ] Measure floating-only steady-state CPU and process memory with the main webview destroyed/closed and no active animations.
- [ ] Record measurements and any obvious WebView2/process contributors in `STATUS.md`.
- [ ] Add a minimal smoke-test harness for Rust commands/events.

Acceptance criteria:

- `main` and `focusSurface` both project the same authoritative Rust application state
- Focus Panel -> Floating Timer -> Focus Panel does not create parallel secondary webviews or reset state
- Floating Timer remains above normal Windows apps and can be moved
- Focus Panel can move to selected monitor edge
- one confirmed global shortcut registers and fires
- tray/background lifecycle, notification, and autostart work locally
- SQLite migration v1 runs cleanly on a fresh app-data directory
- floating-only idle CPU is stable/near-idle with no unexplained polling loop
- floating-only memory is measured and documented; if clearly unacceptable, stop and evaluate a native Win32/WinUI overlay before product UI work

Do not implement polished Blitzit UI in this milestone.

## Milestone 2 — Domain model and local persistence

Goal: establish durable task/list/session behavior before UI complexity.

- [ ] Define IDs and schema for lists, tasks, subtasks, notes, recurrence rules, reminders, sessions, preferences, and archived entities.
- [ ] Implement list CRUD, ordering, archive, restore, permanent deletion.
- [ ] Implement task CRUD and planning transitions: Backlog / This Week / Today / Done.
- [ ] Implement ordering within planning buckets.
- [ ] Implement EST, Time Taken, completion timestamp, scheduled date/time, recurrence metadata, and archive state.
- [ ] Implement subtasks with ordering/completion state.
- [ ] Implement rich-note storage using a constrained local document format.
- [ ] Implement preferences and schema defaults.
- [ ] Add deterministic fixture builders for tests.

Acceptance criteria:

- migrations are repeatable
- CRUD/reorder survive restart
- archive/restore preserves history
- permanent deletion is explicit and tested

## Milestone 3 — Timer/session engine

Goal: implement correctness-critical runtime independently from UI.

- [ ] Implement session state machine: idle, running, paused, break.
- [ ] Implement EST countdown mode.
- [ ] Implement Pomodoro countdown mode.
- [ ] Implement count-up mode.
- [ ] Track actual work duration independently of displayed countdown.
- [ ] Make pause/resume idempotent.
- [ ] Implement skip and finish transitions.
- [ ] Persist session transitions/timestamps.
- [ ] Restore interrupted live sessions paused on launch.
- [ ] Prevent duplicate running sessions.
- [ ] Keep break sessions distinct from work sessions.
- [ ] Emit typed events consumed by both webviews.

Acceptance criteria:

- timer correctness is tested with controlled/fake time
- UI refresh cadence cannot alter authoritative elapsed time
- restarting process does not count downtime as work
- all timer modes produce consistent session history

## Milestone 4 — Scheduling, recurrence, reminders, eligibility

- [ ] Implement Monday-based week classification.
- [ ] Classify scheduled tasks into Backlog / This Week / Today by Windows local date/timezone.
- [ ] Prevent future-timed Today tasks from auto-starting before due time.
- [ ] Implement one-off local reminders.
- [ ] Implement supported recurrence rules and recurrence-instance generation.
- [ ] Make recurrence materialization idempotent on startup/resume/date change.
- [ ] Add tray/background due-reminder processing while process is running.
- [ ] Add tests for DST/date-boundary behavior.

Acceptance criteria:

- no duplicate recurring instances after repeated startup/resume
- due reminders work in tray/background mode
- task eligibility matches scheduling rules

## Milestone 5 — Main window product UI

Implement the screenshot hierarchy rather than an invented generic task manager.

- [ ] App shell/navigation.
- [ ] Home dashboard/list cards.
- [ ] List board with Backlog, This Week, Today, Done.
- [ ] Drag/drop or equivalent reorder/move behavior.
- [ ] Task creation and inline editing.
- [ ] EST and Time Taken display/edit states.
- [ ] Scheduling UI and recurrence editor.
- [ ] Subtasks UI.
- [ ] Rich task notes editor/viewer with clickable URLs.
- [ ] List settings: name, icon, archive/delete flows.
- [ ] Search / quick actions.
- [ ] Archived lists/tasks surfaces.
- [ ] Light/dark/system theme.
- [ ] Remove all account/trial/upgrade/cloud/integration controls.

Acceptance criteria:

- all main-window states in `docs/UI_UX_SPEC.md` are reachable
- no dead controls exist for excluded features
- keyboard navigation remains usable

## Milestone 6 — Blitz Mode / Focus Panel

- [ ] Start Blitz from eligible Today tasks.
- [ ] Auto-select top eligible Today task.
- [ ] Render current task and authoritative timer.
- [ ] Show remaining/scheduled/done sections matching documented focus workflow.
- [ ] Implement break, notes, pause/resume, skip, finish.
- [ ] Implement subtasks/progress in focus mode.
- [ ] Permit EST/Time Taken editing only while paused.
- [ ] Implement selected-monitor and left/right Focus Panel placement.
- [ ] Implement active-title scrolling for long names.
- [ ] Handle empty/no-eligible-task states.

Acceptance criteria:

- Focus Panel drives a complete work session without main-window interaction
- all session changes appear immediately when main is open/reopened

## Milestone 7 — Floating Timer mode

- [ ] Implement compact mode by transforming the existing `focusSurface` window; do not create a third persistent webview.
- [ ] Make it movable, always-on-top, and absent from normal taskbar presentation where appropriate.
- [ ] Show task title and live timer.
- [ ] Implement expand/collapse subtasks.
- [ ] Implement break, notes, pause/resume, skip, finish controls.
- [ ] Implement return to Focus Panel using the same window.
- [ ] Implement shortcut to alternate Focus Panel/Floating Timer.
- [ ] Implement shortcut to locate/animate Floating Timer.
- [ ] Persist a safe last position and recover after monitor changes.
- [ ] Re-run Milestone 1 floating-only CPU/memory measurements after final UI is present.

Acceptance criteria:

- switching modes never resets/duplicates session
- timer remains synchronized with authoritative Rust state
- no second focus webview is created during normal switching
- lost/off-screen position is recoverable
- final floating UI has no unexplained idle CPU or major memory regression versus Milestone 1 baseline

## Milestone 8 — Windows shortcuts and preferences

- [ ] Implement confirmed Windows in-app shortcuts.
- [ ] Implement confirmed Windows global shortcuts.
- [ ] Add conflict/error feedback for unavailable global shortcuts.
- [ ] Implement confirmed local preferences: theme, timer defaults, focus-panel display/side, EST title parsing, title scrolling, autostart, and other recorded local settings.
- [ ] Persist preferences in SQLite or a versioned local settings layer.

Acceptance criteria:

- shortcut behavior is tested where feasible
- preferences survive restart and affect both windows consistently

## Milestone 9 — Reports and history

- [ ] Implement local productivity overview from task/session history.
- [ ] Implement time-spent/completion reporting by list/date range.
- [ ] Implement Sessions report with detailed work/break rows.
- [ ] Implement evidence-selected exports:
  - Overview -> PDF
  - Sessions -> CSV
- [ ] Verify archived lists/tasks remain represented correctly in historical reports.

Acceptance criteria:

- report totals reconcile with stored session/task history
- exports are generated fully locally

## Milestone 10 — Windows lifecycle, packaging, regression

- [ ] Validate clean first launch and database creation.
- [ ] Validate upgrade across at least one migration change.
- [ ] Validate main-window destroy/recreate plus tray/focus runtime.
- [ ] Validate explicit Quit.
- [ ] Validate multi-monitor behavior and monitor disconnect/reconnect recovery.
- [ ] Validate Windows installer packaging.
- [ ] Add MyBlitzit-owned application icon/branding.
- [ ] Run regression tests for lists, tasks, timer, scheduling, focus panel/floating mode, reports, shortcuts, and persistence.
- [ ] Update `README.md`, `STATUS.md`, and `TODO.md` for release-candidate reality.

## Deferred unless explicitly approved

- native Win32/WinUI Floating Timer fallback (only if performance evidence requires it)
- fully local voice transcription
- external calendar integration
- cross-device sync
- macOS/Linux/mobile versions
- collaborative/shared lists
- AI assistance
