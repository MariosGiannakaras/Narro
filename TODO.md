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
- [ ] Record measurements and obvious WebView2/process contributors in `STATUS.md`.
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

- [ ] Implement session state machine: idle, running, paused, break, overtime as required by the specification.
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
- [ ] Implement replace-existing/detach semantics recorded in `docs/PRODUCT_SPEC.md`.
- [ ] Make recurrence materialization idempotent on startup/resume/date change.
- [ ] Add tray/background due-reminder processing while process is running.
- [ ] Add tests for DST/date-boundary behavior.

Acceptance criteria:

- no duplicate recurring instances after repeated startup/resume
- due reminders work in tray/background mode
- task eligibility matches scheduling rules

## Milestone 5 — Design system and Main window product UI

Implement the screenshot hierarchy rather than an invented generic task manager.

### Shared visual foundation

- [ ] Implement theme tokens for canvas/surfaces/borders/text/accent/success/warning/destructive states based on `docs/UI_UX_SPEC.md`.
- [ ] Implement typography using Segoe UI Variable / Windows system fallbacks and tabular timer numerals.
- [ ] Implement shared spacing/radius/elevation primitives.
- [ ] Implement shared motion primitives and duration/easing tokens from `docs/UI_UX_SPEC.md`.
- [ ] Implement `prefers-reduced-motion` behavior before adding component-specific animation.
- [ ] Implement accessible tooltip/popover/menu primitives with stable geometry.
- [ ] Establish a screenshot/visual-regression fixture harness for representative dark/light states.

### Main UI

- [ ] App shell/navigation.
- [ ] Home dashboard/list cards.
- [ ] List-card rest, hover/Open, overflow-menu and create-list states.
- [ ] Create/Edit List modal with icon import, color selection, title, cancel/create states.
- [ ] List board with Backlog, This Week, Today, Done.
- [ ] Task-card state model: normal, hover/action-revealed, scheduled, overdue, done, inline-create, notes-expanded, subtasks-expanded, paused/editable, destructive-confirm.
- [ ] Drag/drop or equivalent reorder/move behavior with stable placeholder/drop animation.
- [ ] Ensure hover actions use reserved/overlay slots and never reflow title/card geometry.
- [ ] Task creation and inline editing.
- [ ] EST and Time Taken display/edit states.
- [ ] Scheduling UI and recurrence editor.
- [ ] Subtasks UI.
- [ ] Rich task notes editor/viewer with clickable URLs.
- [ ] List settings: name, icon, archive/delete flows.
- [ ] Search / quick-actions palette with keyboard-first behavior.
- [ ] Archived lists/tasks surfaces.
- [ ] Light/dark/system theme.
- [ ] Remove all account/trial/upgrade/cloud/integration controls.

Acceptance criteria:

- all main-window states in `docs/UI_UX_SPEC.md` are reachable
- screenshot-backed fixtures cover Home dark/light, list hover/menu, create-list states, search, board/task states, archives and destructive confirmations
- no hover/focus interaction causes layout shift
- reduced-motion mode remains fully usable
- no dead controls exist for excluded features
- keyboard navigation remains usable

## Milestone 6 — Blitz Mode / Focus Panel

- [ ] Start Blitz from eligible Today tasks.
- [ ] Auto-select top eligible Today task.
- [ ] Reproduce Focus Panel hierarchy: list selector, Today, quick controls, aggregate EST/progress, active live card, remaining queue, Add Task, scheduled group, done group.
- [ ] Render current task and authoritative timer with fixed/tabular timer geometry.
- [ ] Show remaining/scheduled/done sections matching documented focus workflow.
- [ ] Implement break, notes, pause/resume, skip, finish.
- [ ] Implement subtasks/progress in focus mode.
- [ ] Permit EST/Time Taken editing only while paused.
- [ ] Implement selected-monitor and left/right Focus Panel placement.
- [ ] Implement configured scrolling behavior for the live title.
- [ ] Allow ordinary focus-row task titles up to two lines where practical; expose full title accessibly.
- [ ] Reserve action slots for hover/focus controls so controls never push task text.
- [ ] Add tooltips for icon-only controls.
- [ ] Implement active-card, paused, break, overdue, notes-expanded and no-eligible-task visual states.
- [ ] Handle empty/no-eligible-task states.

Acceptance criteria:

- Focus Panel drives a complete work session without main-window interaction
- all session changes appear immediately when main is open/reopened
- current screenshot hierarchy is visually recognizable at a glance, not merely functionally equivalent
- focus hover/focus controls do not move sibling content
- normal and reduced-motion behavior pass interaction tests

## Milestone 7 — Floating Timer mode

- [ ] Implement compact mode by transforming the existing `focusSurface` window; do not create a third persistent webview.
- [ ] Make it movable, always-on-top, and absent from normal taskbar presentation where appropriate.
- [ ] Implement collapsed state matching the supplied compact screenshot: title, live timer, subtask progress, add, expand.
- [ ] Implement expanded action strip for Break, Notes, Pause/Resume, Skip, Done, return-to-panel.
- [ ] Implement expanded subtask rows with completion, reorder, delete and progress.
- [ ] Keep icon hit targets stable and show tooltips without changing window width.
- [ ] Implement Focus Panel <-> Floating Timer content transition with short one-shot opacity/transform motion; do not animate native window geometry in a high-frequency JS loop.
- [ ] Implement shortcut to alternate Focus Panel/Floating Timer.
- [ ] Implement shortcut to locate/animate Floating Timer using a restrained finite attention pulse.
- [ ] Persist a safe last position and recover after monitor changes.
- [ ] Verify no decorative animation runs continuously while idle.
- [ ] Re-run Milestone 1 floating-only CPU/memory measurements after final UI is present.

Acceptance criteria:

- switching modes never resets/duplicates session
- timer remains synchronized with authoritative Rust state
- no second focus webview is created during normal switching
- collapsed/expanded states visually match the supplied hierarchy and density
- lost/off-screen position is recoverable
- final floating UI has no unexplained idle CPU or major memory regression versus Milestone 1 baseline
- reduced-motion mode removes nonessential translation/scale while preserving clear feedback

## Milestone 8 — Windows shortcuts and preferences

- [ ] Implement confirmed Windows in-app shortcuts.
- [ ] Implement confirmed Windows global shortcuts plus per-global enable toggles.
- [ ] Add conflict/error feedback for unavailable global shortcuts.
- [ ] Implement Preferences sections evidenced in screenshots/docs: monitor/side, hide times, EST parsing, theme, timezone, Pomodoro, break/work durations, scrolling title, timed alerts, sounds/previews, timer flash, notification alerts, schedule reminders, completion celebration.
- [ ] Preserve conditional/nested setting behavior without disruptive scroll jumps.
- [ ] Persist preferences in SQLite or a versioned local settings layer.

Acceptance criteria:

- shortcut behavior is tested where feasible
- preferences survive restart and affect both windows consistently
- Preferences upper/middle/lower screenshot states have visual fixtures
- sound previews do not overlap indefinitely

## Milestone 9 — Reports and history

- [ ] Implement local productivity overview from task/session history.
- [ ] Implement four summary metrics and productive-hour/day/month cards.
- [ ] Implement productivity chart with Tasks/Breaks/Total series and accessible hover/focus tooltip values.
- [ ] Implement time-spent/completion reporting by list/date range.
- [ ] Implement two-month date-range picker plus evidenced presets.
- [ ] Implement Sessions report with detailed work/break rows.
- [ ] Implement manual Add Session and inline session editing/task-session detail modal.
- [ ] Implement evidence-selected exports:
  - Overview -> PDF
  - Sessions -> CSV
- [ ] Verify archived lists/tasks remain represented correctly in historical reports.
- [ ] Limit chart animation to initial load/filter changes; no continuous chart motion.

Acceptance criteria:

- report totals reconcile with stored session/task history
- exports are generated fully locally
- chart values are accessible without pointer-only hover
- visual fixtures cover Overview, chart tooltip, list filter, date picker, Sessions and inline-edit modal

## Milestone 10 — Windows lifecycle, packaging, visual/regression pass

- [ ] Validate clean first launch and database creation.
- [ ] Validate upgrade across at least one migration change.
- [ ] Validate main-window destroy/recreate plus tray/focus runtime.
- [ ] Validate explicit Quit.
- [ ] Validate multi-monitor behavior and monitor disconnect/reconnect recovery.
- [ ] Validate Windows display scaling at 100%, 125%, 150%, and 200%.
- [ ] Validate Windows installer packaging.
- [ ] Add MyBlitzit-owned application icon/branding.
- [ ] Run regression tests for lists, tasks, timer, scheduling, focus panel/floating mode, reports, shortcuts, persistence, keyboard focus and reduced-motion.
- [ ] Run the complete screenshot-fidelity checklist in `docs/UI_UX_SPEC.md` in dark/light themes where applicable.
- [ ] Confirm animation does not cause task-row/card geometry changes or persistent idle CPU work.
- [ ] Update `README.md`, `STATUS.md`, and `TODO.md` for release-candidate reality.

## Deferred unless explicitly approved

- native Win32/WinUI Floating Timer fallback (only if performance evidence requires it)
- fully local voice transcription
- external calendar integration
- cross-device sync
- macOS/Linux/mobile versions
- collaborative/shared lists
- AI assistance
