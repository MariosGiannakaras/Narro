# TODO.md

The milestones are ordered. Do not skip ahead unless a later task is required to unblock the current one.

## Milestone 1 — Desktop scaffold and capability spike

Goal: prove the selected stack can support every desktop primitive before product UI is built.

- [ ] Create a Tauri 2 + React + TypeScript application scaffold.
- [ ] Add Rust modules for app state, persistence, timers, scheduling, and window coordination.
- [ ] Add SQLite and a migration harness; create migration `0001` even if the initial schema is minimal.
- [ ] Create three routable windows/views: main, focus panel, floating timer.
- [ ] Prove programmatic window creation/show/hide/focus.
- [ ] Prove always-on-top for the floating timer.
- [ ] Prove monitor enumeration and left/right positioning for the focus panel.
- [ ] Prove global shortcut registration and conflict/error handling.
- [ ] Prove tray/background behavior and explicit Quit.
- [ ] Prove local notification delivery while the app process remains running.
- [ ] Prove autostart can be toggled locally.
- [ ] Add a minimal smoke-test harness for Rust commands/events.

Acceptance criteria:

- all three windows can be opened without independent state divergence
- floating timer can remain above normal windows
- focus panel can move to the chosen display edge
- at least one global shortcut is registered and handled
- tray/background mode works without a cloud service
- a local notification can be emitted
- SQLite migration v1 runs cleanly on a fresh app-data directory

Do not implement polished Blitzit UI in this milestone.

## Milestone 2 — Domain model and local persistence

Goal: establish durable task/list/session behavior before UI complexity.

- [ ] Define IDs and database schema for lists, tasks, subtasks, task notes, recurrence rules, reminders, sessions, preferences, and archived entities.
- [ ] Implement list CRUD, ordering, archive, restore, and permanent deletion.
- [ ] Implement task CRUD and planning bucket transitions: Backlog / This Week / Today / Done.
- [ ] Implement task ordering within a planning bucket.
- [ ] Implement EST, Time Taken, completion timestamp, scheduled date/time, recurrence metadata, and archive state.
- [ ] Implement subtasks with ordering and completion state.
- [ ] Implement rich-note storage using a constrained document format suitable for local rendering.
- [ ] Implement app preferences and schema defaults.
- [ ] Add deterministic fixture builders for tests.

Acceptance criteria:

- database migrations are repeatable
- CRUD and reorder operations survive restart
- archive/restore does not destroy task history
- permanent delete is explicit and tested

## Milestone 3 — Timer/session engine

Goal: implement the correctness-critical runtime independently from UI.

- [ ] Implement session state machine: idle, running, paused, break.
- [ ] Implement EST countdown mode.
- [ ] Implement Pomodoro countdown mode.
- [ ] Implement count-up mode.
- [ ] Track actual work duration independently of displayed countdown.
- [ ] Make pause/resume idempotent.
- [ ] Implement skip and finish transitions.
- [ ] Persist session transitions and timestamps.
- [ ] Restore interrupted live sessions paused on launch.
- [ ] Prevent duplicate running sessions.
- [ ] Keep break sessions distinct from work sessions.
- [ ] Emit typed events consumed by every window.

Acceptance criteria:

- timer correctness is tested using controlled/fake time
- UI refresh cadence cannot alter authoritative elapsed time
- restarting the process does not count downtime as work
- all timer modes produce consistent session history

## Milestone 4 — Scheduling, recurrence, reminders, and eligibility

- [ ] Implement Monday-based week classification.
- [ ] Classify scheduled tasks into Backlog / This Week / Today according to local date.
- [ ] Prevent future-timed Today tasks from auto-starting before due time.
- [ ] Implement one-off local reminders.
- [ ] Implement supported recurrence rules and recurrence-instance generation.
- [ ] Make recurrence materialization idempotent on startup/resume/date change.
- [ ] Add tray/background due-reminder processing while the app is running.
- [ ] Add tests for DST/date-boundary behavior in the configured local timezone.

Acceptance criteria:

- no duplicate recurring instances after repeated startup/resume
- due reminders work while the process is in tray/background mode
- task eligibility matches scheduling rules

## Milestone 5 — Main window product UI

Implement the current screenshot hierarchy rather than an invented generic task manager.

- [ ] App shell and navigation.
- [ ] Home dashboard / list cards.
- [ ] List board with Backlog, This Week, Today, Done.
- [ ] Drag/drop or equivalent pointer reorder/move behavior.
- [ ] Task creation and inline editing.
- [ ] EST and Time Taken display/edit states.
- [ ] Scheduling UI and recurrence editor.
- [ ] Subtasks UI.
- [ ] Rich task notes editor/viewer with clickable URLs.
- [ ] List settings: name, icon, archive/delete flows.
- [ ] Search / quick actions.
- [ ] Archived lists/tasks surfaces.
- [ ] Light/dark/system theme.
- [ ] Remove all account/trial/upgrade/cloud/integration controls from the local product.

Acceptance criteria:

- all main-window states described in `docs/UI_UX_SPEC.md` are reachable
- no dead controls exist for excluded remote features
- keyboard navigation remains usable

## Milestone 6 — Blitz Mode / Focus Panel

- [ ] Start Blitz from eligible Today tasks.
- [ ] Auto-select the top eligible Today task.
- [ ] Render current task and authoritative timer.
- [ ] Show remaining/scheduled/done task sections matching the documented focus workflow.
- [ ] Implement break, notes, pause/resume, skip, finish.
- [ ] Implement subtasks and progress inside focus mode.
- [ ] Permit EST/Time Taken editing only while paused.
- [ ] Implement configured monitor and left/right focus-panel placement.
- [ ] Implement active-title scrolling for long names.
- [ ] Handle empty/no-eligible-task states.

Acceptance criteria:

- focus panel can drive a complete work session without main-window interaction
- all session changes appear in the main window immediately

## Milestone 7 — Floating Timer

- [ ] Implement compact always-on-top timer window.
- [ ] Make it movable by the user.
- [ ] Show task title and live timer.
- [ ] Implement expand/collapse subtasks.
- [ ] Implement break, notes, pause/resume, skip, finish controls.
- [ ] Implement return/resize to Focus Panel.
- [ ] Implement shortcut to switch Focus Panel/Floating Timer.
- [ ] Implement shortcut to locate/animate the Floating Timer.
- [ ] Persist sensible last position without trapping the window off-screen after monitor changes.

Acceptance criteria:

- switching between Focus Panel and Floating Timer never resets the session
- timer remains synchronized with authoritative Rust state
- lost/off-screen timer position is recoverable

## Milestone 8 — Shortcuts and preferences

- [ ] Implement all confirmed in-app shortcuts.
- [ ] Implement confirmed global shortcuts for Windows/macOS.
- [ ] Add local conflict/error feedback for unavailable global shortcuts.
- [ ] Implement preferences documented in the specification: theme, timer mode/defaults, focus-panel display/side, EST title parsing, title scrolling, autostart, and other confirmed local settings.
- [ ] Persist preferences in SQLite or a versioned local settings layer.

Acceptance criteria:

- shortcut behavior is covered by interaction tests where feasible
- preferences survive restart and affect all windows consistently

## Milestone 9 — Reports and history

- [ ] Implement local productivity overview from task/session history.
- [ ] Implement time-spent/completion reporting by list and relevant date range.
- [ ] Implement Sessions report with detailed work/break rows.
- [ ] Implement current-evidence exports:
  - Overview -> PDF
  - Sessions -> CSV
- [ ] Verify archived lists/tasks remain represented appropriately in historical reports.

Acceptance criteria:

- report totals reconcile with stored session/task history
- exports are generated fully locally

## Milestone 10 — Lifecycle, packaging, and regression pass

- [ ] Validate clean first launch and database creation.
- [ ] Validate upgrade across at least one migration change.
- [ ] Validate tray/hide/quit lifecycle.
- [ ] Validate multi-monitor behavior and monitor disconnect/reconnect recovery.
- [ ] Validate Windows packaging.
- [ ] Validate macOS packaging when a macOS build environment is available.
- [ ] Add application icon/branding owned by MyBlitzit.
- [ ] Run regression tests for lists, tasks, timer, scheduling, focus panel, floating timer, reports, shortcuts, and persistence.
- [ ] Update `README.md`, `STATUS.md`, and `TODO.md` to reflect a usable release candidate.

## Deferred unless explicitly approved

- fully local voice transcription
- external calendar integration
- cross-device sync
- mobile app
- collaborative/shared lists
- AI assistance
