# Architecture / Technical Specification

Decision date: 2026-08-15

## 1. Requirements that drive the stack

The product is not merely a task web UI. It needs:

- a normal desktop main window
- a narrow independently-positioned Focus Panel
- a movable always-on-top Floating Timer
- multi-monitor discovery and positioning
- global keyboard shortcuts while other apps are focused
- local reminders/notifications
- optional open-on-login
- a background/tray presence so shortcuts/reminders/focus can keep working when the main window is hidden
- reliable local persistence
- a timer that remains correct when individual windows are hidden/recreated
- Windows 10/11 packaging
- high UI fidelity to supplied screenshots

These requirements were evaluated before choosing the framework.

## 2. Selected stack

### Desktop shell: Tauri 2

Use Tauri 2.

Official Tauri 2 capabilities relevant to this project:

- window/WebviewWindow APIs, including always-on-top
- monitor enumeration/current monitor
- global-shortcut plugin
- autostart plugin
- notification plugin
- tray icon API
- Windows installers/bundling

Primary references are recorded in `docs/RESEARCH_EVIDENCE.md`.

### Frontend: React + TypeScript

Reasons:
- reusable components across main, Focus Panel, and Floating Timer
- predictable view-state rendering
- ecosystem for accessible drag/drop, date pickers, charts, and rich-text UI
- precise CSS reproduction

Use Vite as the frontend build tool unless the current Tauri template at implementation time establishes a different official default with a concrete advantage.

### Backend: Rust inside Tauri

Rust owns:
- SQLite connection/migrations
- domain commands that require transactions/invariants
- authoritative active timer/session state
- recurrence materialization
- reminder scheduling/check loop
- window orchestration where OS-native behavior is needed
- global shortcut dispatch
- tray lifecycle
- recovery state

Do not put correctness-critical timer/session state solely in React.

### Persistence: SQLite

One local database per OS user/application data directory.

Reasons:
- transactional local writes
- report queries
- durable session history
- straightforward migrations
- no server dependency

## 3. Alternatives considered

### Electron

Electron is technically capable:
- BrowserWindow supports multiple windows and always-on-top
- globalShortcut supports OS-global hotkeys

It was not selected because:
- it bundles a Chromium runtime rather than using the OS webview
- the app has no need for Node-specific renderer capabilities
- Tauri provides first-party primitives for the required desktop functions with a smaller runtime footprint

Electron remains a fallback only if a proven Tauri platform limitation blocks a required behavior.

### Flutter desktop

Flutter is strong for custom-rendered UI, but this product's risk is desktop shell behavior rather than raw custom drawing. Tauri directly combines web-style pixel control with first-party native window/shortcut/tray/autostart primitives.

Do not switch to Flutter solely for visual fidelity.

## 4. Process and window model

One Tauri application process owns domain/runtime state.

Persistent webview budget:
- `main`
- `focus-surface`

Do **not** keep separate Focus Panel and Floating Timer webviews alive. The secondary `focus-surface` changes native size/position and frontend route/state between the two presentations.

### main

- normal resizable Windows window
- Home/list/reports/archive/settings
- not always-on-top
- can be hidden while Rust/tray runtime continues
- may be destroyed and recreated during long focus-only periods if Milestone 1 measurements show worthwhile memory savings

### focus-surface

Two presentation modes:

`FocusPanel`:
- narrow/tall
- positioned to selected monitor edge
- always-on-top only if final UX validation calls for it; the original requirement explicitly guarantees always-on-top for Floating Timer
- renders Today queue, active task, notes/subtasks, scheduled/done groups

`FloatingTimer`:
- compact
- always-on-top = true
- user movable
- minimal renderer route/bundle
- supports collapsed and expanded subtask/action state

Window presentation state should be an enum such as:
- `Hidden`
- `FocusPanel`
- `FloatingTimer`

The active focus session is independent of this presentation enum. Switching presentation must never start/stop/reset the session.

### 4.1 Focus-surface transformation

Switching Focus Panel <-> Floating Timer:
1. persist any user-moved floating position before leaving FloatingTimer
2. choose target monitor/geometry
3. change native window size/position/always-on-top attributes from Rust/Tauri
4. update renderer presentation state
5. renderer uses a short opacity/transform transition; do not implement a JS high-frequency native-window resize animation

This design exists primarily to reduce memory/renderer overhead while preserving the visible two-mode experience.

### 4.2 Performance budget

Milestone 1 must measure on the target Windows machine:
- idle process RAM
- main-only RAM
- Focus Panel RAM/CPU
- Floating Timer collapsed RAM/CPU
- Floating Timer expanded RAM/CPU
- timer CPU over at least several minutes

Rules:
- no continuous decorative animation on Floating Timer
- no React interval is authoritative
- focus-surface must not load Reports/chart code
- lazy-load Notes editor only when opened
- prefer CSS transform/opacity for micro-animations
- if one WebView2 focus surface is still unacceptably heavy after optimization, investigate a native Win32/WinUI floating overlay as a measured fallback; do not adopt hybrid native UI preemptively

## 5. Event and command boundary

Frontend -> Rust commands:
- CRUD operations
- reorder/move task
- schedule/recurrence update
- start focus
- switch active task
- pause/resume
- start/skip break
- skip task
- complete task
- edit session
- update preferences that affect native runtime
- show/hide/switch windows

Rust -> frontend events:
- domain data changed
- active timer state changed
- session phase changed
- notification/alert event
- shortcut registration error/status
- monitor topology/placement change if needed
- theme/preference update if another window changes it

Prefer typed request/response DTOs. Generate or hand-maintain a small shared TypeScript model layer; do not expose arbitrary SQL to frontend views.

## 6. Timer state machine

The timer is the highest-risk subsystem.

Recommended runtime model:

```text
FocusRuntime
  active_task_id: Option<TaskId>
  mode: EstCountdown | CountUp | Pomodoro
  phase: Idle | WorkRunning | WorkPaused | BreakRunning | BreakPaused | Overtime
  phase_started_wall: DateTime
  phase_started_mono: Instant (in-memory only)
  accumulated_work_before_phase_ms
  accumulated_break_before_phase_ms
  est_seconds: Option<u64>
  pomodoro_work_seconds
  pomodoro_break_seconds
  active_session_id
```

The exact Rust types may differ, but invariants must hold.

### 6.1 Time calculation

While process alive:
- elapsed = monotonic now - monotonic phase start
- display derives from phase + mode + accumulated duration

Persist:
- wall-clock start/end timestamps for history/reporting
- accumulated duration
- recovery phase snapshot

Do not persist a monotonic `Instant`.

### 6.2 Pausing

On pause:
1. calculate elapsed monotonic segment
2. add to accumulated work/break
3. close or checkpoint persisted session segment
4. mark paused
5. UI freezes based on authoritative state

### 6.3 Switching task

1. close current work segment
2. persist accrued Time Taken
3. choose target task
4. derive timer mode from settings/EST
5. start a new work segment
6. emit one coherent state update

### 6.4 Process interruption

Local design:
- persist recovery snapshot periodically/on meaningful transition
- on next launch, detect non-idle unfinished runtime
- convert to paused
- do not count process downtime
- show user the recoverable active task

### 6.5 UI ticking

Frontend may render a smooth second counter by interpolating from the latest authoritative snapshot, but backend state is canonical.

Frontend may receive an authoritative timestamp/state snapshot on transitions and periodically for drift correction. A local display tick may update once per second, but it must never mutate persisted elapsed time. Resynchronize on visibility/presentation changes.

## 7. Timer-mode derivation

```text
if settings.pomodoro_enabled:
    Pomodoro
else if task.est_seconds exists:
    EstCountdown
else:
    CountUp
```

Actual Time Taken is the sum of work segments regardless of mode.

For Pomodoro:
- the sprint countdown is not the task EST
- break segments are recorded separately

For EST:
- zero crossing enters Overtime/Time's Up
- overtime continues actual work-time accumulation

## 8. Focus eligibility

Function:

```text
is_focus_eligible(task, now):
  task not done
  task appears in Today
  and (
    task has no scheduled time
    or task.scheduled_at <= now
  )
```

When Blitz Mode starts:
- choose first eligible Today task by current ordering

If none:
- return a domain result explaining that all Today tasks are future-scheduled or no Today tasks exist

Never make this a generic UI error string without a typed reason.

## 9. SQLite schema direction

Use migrations from v1.

Suggested tables:

### `lists`
- id
- title
- color
- icon_asset
- sort_order
- archived_at
- created_at
- updated_at

### `tasks`
- id
- list_id
- title
- manual_lane / planning metadata
- sort_order
- est_seconds
- manual_time_adjustment_seconds if manual edits are supported distinctly
- scheduled_at
- recurrence_rule_id nullable
- recurrence_parent_task_id nullable
- completed_at
- archived_at
- created_at
- updated_at

Do not store a blindly mutable `time_taken_seconds` as the only source. Prefer report/session-derived work duration plus an explicit manual adjustment or normalized edit operation so session history and totals cannot silently diverge.

### `subtasks`
- id
- task_id
- title
- sort_order
- completed_at
- created_at
- updated_at

### `task_notes`
- task_id
- editor_format_version
- content
- updated_at

### `recurrence_rules`
- id
- parent_task_id
- frequency
- interval
- weekday mask / JSON
- month-day behavior
- timezone
- active
- last_materialized_period

### `sessions`
- id
- task_id nullable for free-standing break if necessary
- kind: work/break
- started_at
- ended_at
- duration_seconds
- source: focus/manual/edit
- created_at
- updated_at

### `settings`
Structured key/value or typed single-row sections.

### `runtime_recovery`
Single-row current focus snapshot sufficient to restore paused.

Indexes:
- tasks by list/lane/scheduled_at/completed_at
- sessions by task/started_at
- recurrence by active/next generation key
- archived/completed queries used by reports

Use foreign keys.

## 10. Lane derivation and ordering

Separate:
- **manual planning lane/order**
- **effective displayed lane**

For unscheduled task:
- effective lane = manual lane

For scheduled unfinished task:
- lane derives from schedule date using configured timezone/week boundary

This prevents date-boundary jobs from destroying the user's underlying manual organization unnecessarily.

Within lane:
1. manually prioritized unscheduled items
2. scheduled grouping according to UI
3. stable sort by explicit sort order / schedule as specified

Exact mixed-order behavior remains a fidelity item; do not encode screenshot accident as database schema.

## 11. Recurrence engine

No server exists.

Run materialization:
- application startup
- resume/wake
- local date boundary
- recurrence edit

Use an idempotency key per recurrence occurrence, e.g.:
`rule_id + occurrence_local_date_time`

Create a unique database constraint so repeated runs cannot duplicate children.

Respect configured timezone and DST by storing schedule instants plus local rule semantics.

Historical generated children must not be rewritten unless user explicitly chooses a replace-existing operation.

## 12. Background lifecycle

To support:
- reminders
- global shortcuts
- active focus
- floating timer

the Tauri process should remain alive while the main window is hidden.

Use a tray icon with:
- Show MyBlitzit
- Show Focus Panel / Floating Timer when active
- Pause/Resume when active (optional if simple)
- Quit

Explicit Quit:
- flush/persist runtime snapshot
- unregister shortcuts
- close cleanly

Autostart is user-controlled.

## 13. Notifications and sounds

Notifications are local OS notifications.

Reminder/check loop:
- compute next relevant reminder
- use a lightweight backend timer/wakeup
- re-evaluate on task/settings/timezone changes and sleep/wake
- emit/send notification when due

If durable OS-scheduled future notifications are not portable through Tauri, rely on background process rather than pretending notifications work when the process is terminated.

Sounds:
- bundle local sound assets
- provide preview
- volume/mute behavior must respect OS/platform limitations

## 14. Notes editor

Need WYSIWYG behavior for:
- bold
- italic
- strike
- bullet
- numbered
- undo/redo
- links

Choose a maintained React-compatible rich-text editor during implementation only after checking bundle/complexity. The persistence contract should support a versioned structured format or sanitized HTML.

Do not store executable HTML/script.

Voice transcription omitted initially.

## 15. Frontend state

Use server/backend-style query cache or a small typed store.

Guideline:
- persistent/domain data comes from Rust commands
- transient UI state stays in each view
- active runtime snapshot is subscribed from Rust events
- do not maintain independent mutable copies of the same task across `main` and `focus-surface`

A small state library is acceptable but not mandatory.

## 16. Reports

Compute from SQLite queries/view models.

Overview:
- aggregate work days
- task completions
- work/break durations
- averages
- productive time buckets
- time by list
- early/late comparison

Sessions:
- query raw sessions with filters
- editing a session updates its timestamps/duration transactionally
- report aggregates must immediately reflect edits

Export:
- Overview -> local PDF
- Sessions -> CSV

Do not send data to a reporting service.

## 16.1 Frontend performance and motion

The React layer must keep visual polish cheap:
- route/code-split Reports and heavy editors away from `focus-surface`
- use tabular numerals for timer text to avoid layout jitter
- reserve action-icon space so hover does not reflow titles
- use `prefers-reduced-motion`
- use one-shot transitions with transform/opacity; avoid infinite gradient/blur animations
- never animate large-area `backdrop-filter`
- chart animation runs only on initial render/filter changes
- profile render churn in Floating Timer before optimizing with memoization by habit

Animation is presentation only. Domain transitions complete in Rust first; UI motion must never delay, own, or determine task completion, pause/resume, session switching, persistence, or focus-surface state.

## 17. Security/privacy

- no network permission required for core app
- outbound network access should not be enabled globally merely because notes may contain URLs
- URL opening uses OS shell/default browser
- sanitize note content
- validate imported icon file type/size
- restrict Tauri command capability permissions to required windows/actions
- no telemetry
- no secrets/auth tokens

## 18. Packaging targets

Target:
- Windows 10/11 x64 first
- Windows arm64 only if the actual target machine or future requirement justifies it

Use Tauri Windows bundling (NSIS or MSI chosen during the packaging milestone after local install/update testing). macOS/Linux packaging is out of scope.

The project is personal, so Store distribution and mandatory code signing are not phase-1 requirements. Local development/install builds are acceptable subject to normal Windows security prompts.

## 19. Test strategy

### Rust unit tests
- lane derivation
- recurrence
- focus eligibility
- timer mode derivation
- timer transitions
- pause/resume
- overtime
- break flow
- session duration accounting
- crash recovery

### Persistence tests
Use temporary SQLite:
- migrations
- CRUD invariants
- archive/delete
- recurrence idempotency
- session editing

### Frontend tests
- task interactions
- modal states
- shortcuts dispatch at UI layer
- active/paused/break rendering
- notes/subtasks components
- reduced-motion behavior
- hover controls do not change row geometry

### Desktop smoke tests
Manual/automated where possible:
- main/focus/timer window switching
- always-on-top
- drag/move
- multi-monitor placement
- global shortcuts
- tray lifecycle
- notifications
- autostart
- packaging
- Windows DPI scaling at 100%, 125%, 150%, 200%
- Floating Timer RAM/CPU in collapsed/expanded states

## 20. Project tree target

After Milestone 1, aim for a compact structure like:

```text
/
  AGENTS.md
  README.md
  STATUS.md
  TODO.md
  docs/
    PRODUCT_SPEC.md
    UI_UX_SPEC.md
    ARCHITECTURE.md
    RESEARCH_EVIDENCE.md
  src/
    app/
    components/
    features/
      home/
      lists/
      tasks/
      focus/
      reports/
      settings/
    shared/
    windows/
      main/
      focus-surface/
        focus-panel/
        floating-timer/
  src-tauri/
    src/
      commands/
      domain/
      persistence/
      runtime/
      windows/
    migrations/
    capabilities/
```

Do not create extra architectural layers until real complexity requires them.
