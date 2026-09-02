# TODO.md

Milestones are ordered. Do not skip ahead unless a later task is required to unblock the current one.

## Milestone 1 — Windows desktop scaffold, capability and performance spike

Goal: prove the selected Tauri stack and lightweight focus-window architecture before product UI is built.

- [x] Create a Tauri 2 + React + TypeScript scaffold targeting Windows 10/11 x64.
- [x] Add Rust modules for app state, persistence, timers, scheduling, and window coordination.
- [x] Add SQLite plus migration harness; create migration `0001` even if the initial schema is minimal.
- [x] Create only two initial webview windows: `main` and `focusSurface`.
- [ ] Prove programmatic create/show/hide/destroy/recreate/focus behavior for `main` without losing Rust/domain state.
  - [x] implementation compiles in Windows CI
  - [ ] interactive destroy/recreate/state-survival validation
- [ ] Implement two temporary modes on `focusSurface`: Focus Panel and compact Floating Timer.
  - [x] implementation compiles in Windows CI
  - [ ] interactive validation
- [ ] Prove switching those modes by resize/reposition/restyle of the same secondary webview.
  - [x] implementation compiles in Windows CI
  - [ ] interactive validation
- [ ] Prove always-on-top and skip-taskbar behavior for Floating Timer mode.
- [ ] Prove Windows monitor enumeration and left/right positioning for Focus Panel mode.
- [ ] Prove display-topology change handling: connect/disconnect/re-enumerate displays and clamp windows to a visible work area without restarting Narro.
- [ ] Prove global shortcut registration and conflict/error handling.
- [ ] Prove tray/background lifecycle plus explicit Quit.
- [ ] Prove local Windows notification delivery while process remains running.
- [ ] Prove Windows autostart can be toggled locally.
- [x] Build the `focusSurface` as a separate minimal frontend entry/bundle that does not import dashboard/reports/settings/editor code.
- [ ] Measure floating-only steady-state CPU and process memory with the main webview destroyed/closed and no active animations.
- [ ] Record measurements and obvious WebView2/process contributors in `STATUS.md`.
- [ ] Add a minimal smoke-test harness for Rust commands/events.
  - [x] harness created and compiles in Windows CI
  - [ ] interactive execution

Acceptance criteria:

- `main` and `focusSurface` both project the same authoritative Rust application state
- Focus Panel -> Floating Timer -> Focus Panel does not create parallel secondary webviews or reset state
- Floating Timer remains above normal Windows apps and can be moved
- Focus Panel can move to selected monitor edge
- display connect/disconnect does not require app restart and cannot strand the focus surface off-screen
- one confirmed global shortcut registers and fires
- tray/background lifecycle, notification, and autostart work locally
- SQLite migration v1 runs cleanly on a fresh app-data directory
- floating-only idle CPU is stable/near-idle with no unexplained polling loop
- floating-only memory is measured and documented; if clearly unacceptable, stop and evaluate a native Win32/WinUI overlay before product UI work

Do not implement polished Blitzit UI in this milestone.

## Milestone 2 — Domain model, identity invariants, and local persistence

Goal: establish durable task/list/session behavior before UI complexity.

- [ ] Define IDs and schema for lists, tasks, subtasks, notes, recurrence rules, reminders, sessions, preferences, and archived entities.
- [ ] Implement list CRUD, ordering, archive, restore, permanent deletion.
- [ ] Implement task CRUD and planning transitions: Backlog / This Week / Today / Done.
- [ ] Implement ordering within planning buckets as position changes on stable task identities.
- [ ] Implement task duplication as a new independent identity/copy.
- [ ] Implement EST, Time Taken, completion timestamp, scheduled date/time, recurrence metadata, and archive state.
- [ ] Distinguish date-only schedules from schedules with a specific local time in the domain/schema.
- [ ] Implement subtasks with ordering/completion state.
- [ ] Implement rich-note storage using a constrained local document format.
- [ ] Implement preferences and schema defaults.
- [ ] Implement permanent-task-delete semantics so deleted tasks no longer appear in user-facing reports, matching current official behavior.
- [ ] Ensure successful create/edit/move is committed locally before success is reflected in UI state.
- [ ] Add deterministic fixture builders for tests.
- [ ] Add regression tests proving reorder/move cannot duplicate, alias, or silently delete task identities.
- [ ] Add repeated drag/drop and scheduled-lane-move tests based on publicly reported source-product duplication/reorder failures.

Acceptance criteria:

- migrations are repeatable
- CRUD/reorder survive restart
- repeated reorder/move operations preserve task count and IDs
- duplicate creates exactly one new independent ID
- archive/restore preserves history
- permanent deletion is explicit, tested, and excluded from user-facing reports

## Milestone 3 — Timer/session engine

Goal: implement correctness-critical runtime independently from UI.

- [ ] Implement session state machine: idle, running, paused, break, time-up/overtime.
- [ ] Implement EST countdown mode.
- [ ] Implement explicit `Time's Up` transition at EST expiry.
- [ ] Implement Extend from `Time's Up`, preserving the same work session and exposing overtime.
- [ ] Implement Done and Switch Task from `Time's Up`.
- [ ] Implement Pomodoro countdown mode.
- [ ] Implement automatic Pomodoro break start with notification when work interval finishes.
- [ ] Implement end-of-Pomodoro-break prompt/resume workflow per product specification.
- [ ] Implement count-up mode.
- [ ] Track actual work duration independently of displayed countdown.
- [ ] Make pause/resume idempotent.
- [ ] Implement skip and finish transitions.
- [ ] Persist session transitions/timestamps without per-second SQLite writes.
- [ ] Restore interrupted live sessions paused on launch.
- [ ] Prevent duplicate running sessions.
- [ ] Keep break sessions distinct from work sessions.
- [ ] Emit typed events consumed by both webviews.
- [ ] Add regression coverage for completing a live task after tracked work: Time Taken must never reset to `00:00`.
- [ ] Add crash/restart tests around running, paused, break, task-switch and overtime transitions.

Acceptance criteria:

- timer correctness is tested with controlled/fake time
- UI refresh cadence cannot alter authoritative elapsed time
- restarting process does not count downtime as work
- tracked Time Taken survives completion and task switching
- all timer modes produce consistent session history
- no renderer owns irreplaceable timer/session state

## Milestone 4 — Scheduling, recurrence, reminders, eligibility

- [ ] Implement Monday-based week classification.
- [ ] Implement official scheduling shortcuts: Today, Later today (+2h), Tomorrow, Next week (+7d), custom date.
- [ ] Classify scheduled tasks into Backlog / This Week / Today by Windows local date/timezone.
- [ ] Prevent future-timed Today tasks from auto-starting before due time.
- [ ] Preserve date-only schedule semantics without accidental timezone day shifts.
- [ ] Implement one-off local reminders.
- [ ] Implement recurrence presets and custom interval/unit/weekday rules documented in `docs/PRODUCT_SPEC.md`.
- [ ] Implement recurring parent in Backlog and Monday-of-due-week child materialization.
- [ ] Implement Replace Existing Tasks behavior.
- [ ] Implement recurrence detachment semantics while preserving already modified independent children.
- [ ] Make recurrence materialization idempotent on startup/resume/date change.
- [ ] Add tray/background due-reminder processing while process is running.
- [ ] Format visible dates/times using Windows locale/system 12/24-hour convention by default.
- [ ] Add tests for DST, Monday/week boundaries, timezone changes, repeated startup, missed days, future-time eligibility and weekend/date-only behavior.
- [ ] Add regression tests ensuring moving a scheduled task between lanes cannot duplicate/triplicate it.

Acceptance criteria:

- no duplicate recurring instances after repeated startup/resume
- recurrence replace/detach preserves documented child behavior
- due reminders work in tray/background mode
- task eligibility matches scheduling rules
- date-only tasks remain on the intended local calendar date
- scheduling/move operations never change task identity count

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
- [ ] Require explicit click/keyboard activation to open note URLs; do not auto-launch links when entering focus.
- [ ] Provide a larger/resizable Notes editing presentation in addition to compact inline focus access.
- [ ] Use WebView/browser spellcheck where practical.
- [ ] List settings: name, icon, archive/delete flows.
- [ ] Search / quick-actions palette with keyboard-first behavior.
- [ ] Archived lists/tasks surfaces.
- [ ] Light/dark/system theme.
- [ ] Remove all account/trial/upgrade/cloud/integration controls.

Acceptance criteria:

- all main-window states in `docs/UI_UX_SPEC.md` are reachable
- screenshot-backed fixtures cover Home dark/light, list hover/menu, create-list states, search, board/task states, archives and destructive confirmations
- no hover/focus interaction causes layout shift
- Notes can be comfortably edited on a large display without losing compact focus access
- URLs never launch merely because a task becomes live
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
- [ ] React to monitor/display changes while Focus Mode is open.
- [ ] Implement configured scrolling behavior for the live title.
- [ ] Allow ordinary focus-row task titles up to two lines where practical; expose full title accessibly.
- [ ] Reserve action slots for hover/focus controls so controls never push task text or move hit targets.
- [ ] Add tooltips for icon-only controls.
- [ ] Implement active-card, paused, break, time-up/overtime, overdue, notes-expanded and no-eligible-task visual states.
- [ ] Handle empty/no-eligible-task states.

Acceptance criteria:

- Focus Panel drives a complete work session without main-window interaction
- all session changes appear immediately when main is open/reopened
- current screenshot hierarchy is visually recognizable at a glance, not merely functionally equivalent
- focus hover/focus controls do not move sibling content or change pointer targets
- display hotplug cannot strand the panel off-screen
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
- [ ] Persist a safe last position and recover after monitor changes/restart.
- [ ] Validate always-on-top against normal maximized and borderless full-screen Windows apps; document exclusive-fullscreen limitations if any.
- [ ] Verify expanded content remains on-screen when the widget is close to bottom/taskbar; reposition/anchor safely rather than overflowing unusably.
- [ ] Verify no decorative animation runs continuously while idle.
- [ ] Re-run Milestone 1 floating-only CPU/memory measurements after final UI is present.

Acceptance criteria:

- switching modes never resets/duplicates session
- timer remains synchronized with authoritative Rust state
- no second focus webview is created during normal switching
- collapsed/expanded states visually match the supplied hierarchy and density
- saved position survives restart when still valid
- lost/off-screen position is recoverable
- final floating UI has no unexplained idle CPU or major memory regression versus Milestone 1 baseline
- reduced-motion mode removes nonessential translation/scale while preserving clear feedback

## Milestone 8 — Windows shortcuts and preferences

- [ ] Implement confirmed Windows in-app shortcuts.
- [ ] Implement confirmed Windows global shortcuts plus per-global enable toggles.
- [ ] Add conflict/error feedback for unavailable global shortcuts.
- [ ] Implement Preferences sections evidenced in screenshots/docs: monitor/side, hide times, EST parsing, theme, timezone, Pomodoro, break/work durations, scrolling title, timed alerts, sounds/previews, timer flash, notification alerts, schedule reminders, completion celebration.
- [ ] Ensure Start Break shortcut pauses the current task, starts break, and follows documented resume/skip behavior.
- [ ] Preserve conditional/nested setting behavior without disruptive scroll jumps.
- [ ] Use Windows locale for date/time presentation by default.
- [ ] Persist preferences in SQLite or a versioned local settings layer.

Acceptance criteria:

- shortcut behavior is tested where feasible
- preferences survive restart and affect both windows consistently
- Preferences upper/middle/lower screenshot states have visual fixtures
- sound previews do not overlap indefinitely
- 12/24-hour display follows Windows locale in schedule/session UI

## Milestone 9 — Reports and history

- [ ] Implement local productivity overview from task/session history.
- [ ] Implement four summary metrics and productive-hour/day/month cards according to official definitions.
- [ ] Implement productivity chart with Tasks/Breaks/Total series and accessible hover/focus tooltip values.
- [ ] Implement Time By List and completion/punctuality insights according to official early/late semantics.
- [ ] Implement done-task rows with completion date, early/late when EST exists, and Time Taken.
- [ ] Implement two-month date-range picker plus evidenced presets.
- [ ] Implement Sessions report with detailed work/break rows.
- [ ] Implement manual Add Session and inline session editing/task-session detail modal.
- [ ] Ensure permanently deleted tasks are removed from user-facing reports while normal archived data remains represented.
- [ ] Implement evidence-selected exports:
  - Overview -> PDF
  - Sessions -> CSV
- [ ] Verify archived lists/tasks remain represented correctly in historical reports.
- [ ] Limit chart animation to initial load/filter changes; no continuous chart motion.

Acceptance criteria:

- report totals reconcile with stored session/task history
- report metric definitions match `docs/PRODUCT_SPEC.md`
- deletion/archive semantics are correct
- exports are generated fully locally
- chart values are accessible without pointer-only hover
- visual fixtures cover Overview, chart tooltip, list filter, date picker, Sessions and inline-edit modal

## Milestone 10 — Windows lifecycle, packaging, visual/regression pass

- [ ] Validate clean first launch and database creation.
- [ ] Validate upgrade across at least one migration change.
- [ ] Validate main-window destroy/recreate plus tray/focus runtime.
- [ ] Validate explicit Quit.
- [ ] Validate multi-monitor behavior and monitor disconnect/reconnect recovery without restart.
- [ ] Validate Windows display scaling at 100%, 125%, 150%, and 200%.
- [ ] Validate Windows locale variants including 12-hour and 24-hour time formats.
- [ ] Validate Windows installer packaging.
- [ ] Add Narro-owned application icon/branding.
- [ ] Run regression tests for lists, task identity/reorder, timer/tracked time, scheduling/recurrence, focus panel/floating mode, reports, shortcuts, persistence, keyboard focus and reduced-motion.
- [ ] Run the complete screenshot-fidelity checklist in `docs/UI_UX_SPEC.md` in dark/light themes where applicable.
- [ ] Confirm animation does not cause task-row/card geometry changes or persistent idle CPU work.
- [ ] Cross-check source-product anti-regressions in `docs/SOURCE_AUDIT.md`: no lost tracked time, no duplicate tasks from reorder/schedule moves, no wrong-day schedule shifts, no restart-required monitor hotplug, no surprise URL launch.
- [ ] Update `README.md`, `STATUS.md`, and `TODO.md` for release-candidate reality.

## Post-parity candidates — recorded, not scheduled

Do not implement these until Milestones 1–10 parity/reliability work is stable or the user explicitly changes scope:

- Tags/labels
- Calendar week/month view
- quick list assignment while typing title
- paste bulleted/numbered text as multiple tasks
- CSV task import
- optional automatic overtime without `Time's Up` interruption
- subtask time estimates/tracking
- richer app theme/icon customization
- partial-completion/day-by-day accounting
- bulk task operations

## Deferred unless explicitly approved

- native Win32/WinUI Floating Timer fallback (only if performance evidence requires it)
- fully local voice transcription
- external calendar/integration features
- webhooks/API/MCP
- AI assistant
- cross-device sync
- macOS/Linux/mobile/web versions
- collaborative/shared lists

