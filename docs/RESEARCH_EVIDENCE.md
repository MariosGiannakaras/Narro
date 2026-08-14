# Research Sources and Evidence

Research baseline: 2026-08-15

This file is the evidence index for MyBlitzit. It records what was observed, what was confirmed by official Blitzit documentation, and what is a deliberate MyBlitzit-only decision so implementation does not need to repeat the original product research.

## 1. Evidence precedence

Use this order when evidence disagrees:

1. latest explicit user requirement
2. supplied current/direct screenshots
3. current official Blitzit Help Center documentation
4. older supplied public-review screenshots
5. public reviews/feature-board comments used only as corroboration or UX feedback
6. inference

A screenshot proves only visible state. It does not by itself prove what clicking a control does; official Help Center behavior is used for transitions where available.

## 2. Supplied archive

Source: `blitzit Ss.rar`

- RAR5 archive
- SHA-256: `18ab981eebbdf8327976c09bf732f62857d501dae08e6057dfc743c7378b5fab`
- extracted PNG count: 30
- current direct captures visibly include Blitzit `v2.6.69`
- archive also contains seven older Tool Finder review captures

Current direct captures win for visual hierarchy/labels when they differ from older review material.

## 3. Screenshot-by-screenshot inventory

### `490270ab-01ec-41ef-866d-605d9d1b43c7.png`
Create New List modal.

Visible:
- modal centered over darkened app
- close X
- `Create a new list`
- large circular upload-icon control
- `UPLOAD AN ICON`
- optional formats `(jpg, png, svg)`
- color swatches including multicolor, blue, lime/green, pink/purple, mint, cyan, yellow, black
- selected swatch has check/ring treatment
- title input
- outlined Cancel
- teal→lime gradient Create

Evidence use:
- list creation fields
- accent-button visual language
- selected swatch state

### `86d1bc8e-50c8-45f8-8d45-ff84e011cd27.png`
Reports date-range picker.

Visible:
- date-range trigger above popup
- preset column: Today, Yesterday, This week, Last 30 days, Last 60 days, Last 90 days
- two adjacent month calendars
- month navigation arrows
- range start/end filled circles
- continuous range highlight between endpoints
- outlined Cancel spanning most footer
- accent Apply

Evidence use:
- report date filtering UI
- date-range selected/hover states

### `Screenshot_1.png`
Current dark Home, Blitzit v2.6.69.

Visible:
- dark desktop shell
- original account/trial card at upper-left
- left navigation card
- greeting `Good Night, Ma` plus secondary text
- `Your Lists`
- helper text `Lists with your upcoming tasks`
- All Lists aggregate card
- multiple normal list cards
- create-list tile
- list preview rows
- pending counts / aggregate EST
- top utility strip in original
- bottom Home / Reports nav
- Windows title controls

MyBlitzit scope action:
- account/trial/upgrade/integration/profile/AI controls are omitted, not stubbed

### `Screenshot_2.png`
Create List tile close-up.

Visible:
- dashed rounded border
- plus
- uppercase `CREATE LIST`
- teal/lime accent treatment

### `Screenshot_3.png`
List card hover/overflow.

Visible:
- list icon + `STUDY`
- four preview rows
- centered gradient `Open` hover action
- footer `4 pending tasks`, `Est: 37hr`
- ellipsis menu
- menu items `Edit List`, `Duplicate`, divider, `Archive List`

Evidence use:
- list-card rest/hover/menu states

### `Screenshot_4.png`
Search / command palette.

Visible:
- full-app dim layer
- compact centered palette
- search icon
- placeholder `Search for tasks, lists`
- `Ctrl+F` hint
- `Quick actions`
- `Add new task`
- `Add new list`
- `Go to Reports`

### `Screenshot_5.png`
Preferences upper section.

Visible:
- scrollable Preferences modal/panel
- `Blitz Panel`
- selected monitor thumbnail with resolution and `Screen 1`
- Blitz Panel Side Left/Right segmented control
- `General`
- Hide est/done times on tasks toggle
- Auto-parse Est. time from title toggle
- System/Dark/Light theme segmented control
- timezone dropdown `(GMT+03:00) Europe/Athens`

Official Preferences wording uses `Hide EST / Time Taken`; treat as same setting family.

### `Screenshot_6.png`
Preferences middle section.

Visible:
- timezone continuation
- `Blitz mode settings`
- Pomodoros toggle
- Default break length `10 mins`
- Scrolling title on live timer toggle
- `Alerts`
- Timed alerts during a task toggle
- alert timing dropdown (`10 mins`)
- sound selector (`Melodic ...`)
- speaker/volume icon
- play-preview icon
- Animated flash on timer toggle
- Notification Alerts toggle
- notification sound selector (`Futuristic...`)
- Schedule reminders (system) toggle
- Reminder timing (`10 mins before`)

### `Screenshot_7.png`
Preferences lower section.

Visible:
- alert settings continuation
- `Celebrate task completion`
- Show success screen toggle
- nested Fun gif on success screen toggle
- Success sound effect
- speaker / play preview
- sound selector (`Victory B...`)
- enable toggle

### `Screenshot_8.png`
Archived Lists empty state.

Visible:
- left Archived lists nav selected
- segmented `Archived lists` / `Archived done tasks`
- `Archived lists` active
- right-side helper `Your archived lists`
- centered archive icon
- `No archived lists found`
- explanation text

### `Screenshot_9.png`
Archived Done Tasks empty/filter-open state.

Visible:
- `Archived done tasks` active
- full-width Search field
- list filter at right
- dropdown open with All Lists and individual lists
- `No Archived tasks found`
- empty-state explanation

### `Screenshot_10.png`
Reports Overview top.

Visible:
- Back + Reports
- Overview active / Sessions Beta
- All Lists filter
- Export PDF
- date range
- metric cards: Total work days, Total tasks done, Total time worked, Avg. Time per task
- large daily productivity graph
- legend Tasks / Breaks / Total
- graph hover tooltip with date and all three values
- graph menu icon
- lower Most Productive cards

### `Screenshot_11.png`
Reports Overview alternate/hover capture.

Confirms:
- same graph hierarchy
- same tooltip interaction
- same four top metrics and filters

### `Screenshot_12.png`
Reports Overview lower viewport.

Visible:
- graph continuation
- Most Productive hour/day/month cards
- Time By List panel
- Done Tasks panel
- green/red percentage legend
- `No report on the selected date range` empty copy

### `Screenshot_13.png`
Sessions dashboard.

Visible:
- Sessions active
- Add Session
- `Export .csv`
- Hide Break sessions
- date range
- All Lists filter
- Total Time
- Total Tasks
- Total Sessions
- empty main body in this selected range

Important conflict:
- current screenshot says CSV
- Help Center Sessions article describes PDF export
- current screenshot wins for MyBlitzit Sessions: CSV

### `Screenshot_14.png`
Reports list filter open.

Visible:
- active filter outline
- All Lists
- Job Preparation
- ReArrange
- STUDY
- list-specific color/icon chips

### `Screenshot_15.png`
Current light Home.

Visible:
- same Home information architecture as dark theme
- light canvas/cards
- list card hover with `Open`
- same accent system retained across theme

Evidence use:
- theme is hierarchy-preserving, not simple color inversion

### `Screenshot_16.png`
Windows Shortcuts modal.

Visible Global section:
- `Global (works outside & inside Blitzit)`
- Go to Blitzit — Ctrl + Shift + B
- Alternate between Focus Mode — Ctrl + Shift + T
- Find focus timer — Ctrl + Shift + P
- per-global shortcut toggle

Visible App section:
- Create new task — Ctrl + Alt + T
- Start break — Ctrl + Alt + B
- Pause task — Ctrl + Alt + P
- Skip task — Ctrl + Alt + S
- Finish active task — Ctrl + Alt + F
- Add Notes (Active task) — Ctrl + Alt + N
- Search — Ctrl + F

### `Screenshot_17.png`
Floating Timer expanded/subtasks state.

Visible:
- compact rounded dark window
- top action strip with icon-only controls
- far-right expand/return-to-panel icon
- progress dial + `3/4 Subtasks`
- add `+`
- collapse chevron
- subtask rows
- completed subtasks shown strikethrough
- per-row move up/down arrows
- per-row trash
- checkbox completion

Official Focus article maps common action strip semantics to Break, Notes, Pause, Skip and Done.

### `Screenshot_18.png`
Current Focus Panel full state.

Visible:
- list selector `All`
- `Today`
- gear
- Home
- compact/collapse icon
- aggregate `Est: 2hr 10min`
- teal→lime progress bar
- `1/4 Done`
- active task `BFCM strategy` with live seconds timer and bright accent outline
- active task subtask progress
- remaining task rows
- list chip on task in All view
- overdue age text (`2d ago`)
- `+ ADD TASK`
- `3 Scheduled tasks`
- scheduled due times
- secondary note/context lines
- `1 Done`
- completed row with strikethrough and time

This screenshot is the primary structural reference for Focus Panel implementation.

### `Screenshot_19.png`
Floating Timer collapsed.

Visible:
- task title left
- live timer right
- subtask progress dial
- `2/4 Subtasks`
- add `+`
- expand chevron
- very small desktop footprint

### `Screenshot_20.png`
Focus Panel Notes expanded.

Visible:
- active live card remains above
- another task is expanded inline into note editor
- editor toolbar includes Bold, Italic, Strikethrough, list controls, Undo, Redo and microphone in original
- multiline note content
- `Close`
- subtasks remain below note editor

Evidence use:
- Notes do not require navigating away from focus context
- voice transcription control exists in original but is excluded from initial local-only MyBlitzit scope

### `Screenshot_21.png`
Sessions task-detail editing modal.

Visible:
- underlying Sessions report with total time and session list
- modal for `BFCM strategy`
- List / Blitzit chip
- close X
- Add Session
- `25 Sessions`
- aggregate `9hr 8min`
- rows Session 25, Session 24, etc.
- date
- start time
- arrow to end time
- duration
- per-row ellipsis
- one inline time field actively edited with accent outline
- confirmation check icon for pending edit

Evidence use:
- multiple sessions per task
- inline-edit state
- task-detail session modal

## 4. Older supplied Tool Finder review captures

These are secondary/corroborative. They show an older visual generation and external-service UI that MyBlitzit will not copy.

### `... 1m54s.png`
- full four-column board: Backlog / This Week / Today / Done
- list selector
- pending count + aggregate EST
- column progress bars
- scheduled tasks in This Week
- overdue scheduled task group in Today
- `Blitzit now` button at bottom of Today
- All Clear empty states
- bottom Home / Reports

### `... 2m01s.png`
Inline Add Task state:
- Cancel
- Title
- Est time
- Confirm
- helper `Add a new task`

### `... 2m10s.png`
Normal created task state:
- title
- list chip
- EST lower-left
- Time Taken lower-right (`0min`)

### `... 2m19s.png`
Older Focus Panel hover state:
- active timer
- overdue task
- hover action icons
- Rocket/make-live action visibly present
- additional subtasks/notes/menu actions

### `... 2m28s.png`
Older Preferences:
- two monitor cards
- panel side
- theme
- Pomodoro
- break length
- timed alerts / notification alerts
- celebration settings

This corroborates that the preference families are stable across versions.

### `... 2m41s.png`
Focus task expanded menu:
- Update Schedule
- visible scheduled date/time
- Open in Calendar in original
- Change list
- Duplicate
- destructive confirmation state

MyBlitzit omits Open in Calendar because external calendar integration is out of scope.

### `... 4m33s.png`
Older board with inline Notes editor:
- rich formatting toolbar
- multiline note body
- URL-like content
- scheduled task cards

## 5. Official Blitzit product sources

Primary index:
- https://www.blitzit.app/help-center
- https://www.blitzit.app/help-center/home

### Introduction
https://www.blitzit.app/help-center/introduction-to-blitzit

Used for:
- plan → focus workflow
- floating countdown timer as core product idea
- Windows availability

### Lists
https://www.blitzit.app/help-center/lists

Used for:
- list create/title/color/icon
- Backlog / This Week / Today semantics
- Monday-starting week
- scheduled tasks moving by date
- All Lists aggregate behavior

### Tasks
https://www.blitzit.app/help-center/tasks

Used for:
- create at bottom or top
- click title to edit
- drag/drop and reorder
- hover back/forward controls
- Focus priority = top Today first
- EST input
- EST title parsing examples/formats
- Time Taken
- live-task edit restrictions
- Done behavior

### Blitz Mode / Focus sessions
https://www.blitzit.app/help-center/blitz-mode-%28focus-sessions%29

Used for:
- eligibility rules for future-timed tasks
- top eligible Today task auto-start
- Focus Panel
- task reorder/add/delete/schedule/notes/done/break capabilities
- Rocket set-live action
- list dropdown
- quick preferences
- monitor/side preference
- return Home
- Floating Timer movable + always-on-top
- Break / Notes / Pause / Skip / Done
- return from Floating Timer to Focus Panel

### Timer modes
https://www.blitzit.app/help-center/timer-modes

Used for:
- EST countdown
- Time's Up
- extend/done/switch after estimate expires
- Pomodoro precedence over EST
- automatic break behavior
- count-up mode when no EST and Pomodoro off
- actual Time Taken always tracked

### Scheduling
https://www.blitzit.app/help-center/scheduling-task-reminders

Used for:
- Today / Later today / Tomorrow / Next week shortcuts
- optional time
- scheduled placement/movement
- recurrence presets
- custom recurrence days/weeks/months/years
- recurring parent in Backlog
- child materialization behavior
- Replace Existing Tasks / Delete Existing Tasks / detach semantics

### Task Notes
https://www.blitzit.app/help-center/task-notes

Used for:
- Notes in list and Blitz Mode
- Bold / Italics / Strikethrough
- bulleted / numbered lists
- Undo / Redo
- clickable URLs
- URLs auto-open when task goes live
- original voice transcription behavior, which MyBlitzit excludes initially

### Subtasks
https://www.blitzit.app/help-center/subtasks

Used for:
- add/edit/delete/reorder
- completion progress proportional to total subtasks
- full subtask management during Blitz Mode

### Deleting and Archiving
https://www.blitzit.app/help-center/deleting-and-archiving-tasks-and-lists

Used for:
- task delete confirmation/permanence
- list archive-first rule
- unarchive
- permanent list deletion from archive
- done-task automatic archive after 60 days

### Windows shortcuts
https://www.blitzit.app/help-center/key-shortcuts-for-windows

Used for exact Windows shortcut mapping and global/in-app distinction.

### Preferences
https://www.blitzit.app/help-center/preferences

Used for:
- launch/login behavior
- hide EST/Time Taken
- monitor/side
- Pomodoro and sprint/break lengths
- scrolling title
- timed alerts
- alert sounds
- animated timer flash
- notification alerts
- completion success screen/GIF/sound

### Productivity report
https://www.blitzit.app/help-center/productivity-report

Used for:
- list/date filters
- daily work/break/total graph
- metrics
- most productive hour/day/month

### Time spent report
https://www.blitzit.app/help-center/time-spent

Used for:
- Time By List
- punctuality / early-late insight
- Done tasks with completion date and Time Taken

### Sessions report
https://www.blitzit.app/help-center/sessions-report

Used for:
- totals
- list/date/break filters
- chronological session rows
- session number/date/start/end/duration
- inline edit/delete
- manual Add Session
- export documentation conflict noted above

## 6. Technical implementation research

The MyBlitzit stack is selected for the Windows-only local clone based on requirements, not because it is assumed to match Blitzit's implementation.

### Tauri 2

Core/process model:
- https://v2.tauri.app/concept/process-model/

Windows WebView2:
- https://v2.tauri.app/reference/webview-versions/
- https://v2.tauri.app/start/prerequisites/

Window/webview APIs:
- https://v2.tauri.app/reference/javascript/api/namespacewindow/
- https://v2.tauri.app/reference/javascript/api/namespacewebviewwindow/

Relevant confirmed capabilities:
- WebView2 renderer on Windows
- always-on-top
- window size/position
- monitor information
- multiple windows/webviews

Other official Tauri capabilities:
- global shortcuts: https://v2.tauri.app/plugin/global-shortcut/
- autostart: https://v2.tauri.app/plugin/autostart/
- notifications: https://v2.tauri.app/plugin/notification/
- tray: https://v2.tauri.app/learn/system-tray/
- SQLite plugin option: https://v2.tauri.app/plugin/sql/
- Windows installer: https://v2.tauri.app/distribute/windows-installer/

MyBlitzit will prefer Rust-owned SQLite rather than exposing arbitrary SQL to React.

### Original Blitzit implementation evidence

Official Blitzit engineering material has described desktop Electron Windows/macOS codebases:
- https://www.blitzit.app/blog/building-a-cross-platform-productivity-app

This is recorded as research about the original product. It does **not** determine MyBlitzit's stack. MyBlitzit is Windows-only and prioritizes a lightweight persistent floating surface, so Tauri remains the selected clone architecture unless measured capability tests disprove the choice.

## 7. Evidence conflicts and resolutions

### Sessions export
- current supplied Sessions screenshot: `Export .csv`
- Help Center Sessions article: PDF export

Resolution:
- Overview -> PDF
- Sessions -> CSV
- do not add duplicate export controls merely to satisfy both sources

### Hide time setting wording
- Help Center: Hide EST / Time Taken
- current screenshot: Hide est/done times on tasks

Resolution:
- same functional setting family
- MyBlitzit wording: `Hide EST / Time Taken on tasks`

### Older external calendar/integration UI

Older screenshots show integration chips and `Open in Calendar`.

Resolution:
- preserve local schedule/reminder behavior
- omit integration badges/actions entirely

## 8. Public reviews / feature-board UX corroboration

These sources do not define core behavior. They are used only to confirm perceived product qualities or identify UX friction.

### Long titles / hover action friction
https://blitzit.frill.co/b/xmnjk5vl/feature-ideas/see-more-than-one-line-of-the-title-when-in-blitzit-mode

User feedback reports:
- long Focus Mode task titles truncate too aggressively
- hover actions/labels can move controls and be difficult to target

MyBlitzit improvement derived from this:
- up to two lines for focus-row titles where practical
- full-title tooltip/focus disclosure
- fixed/reserved action slots
- no layout shift on hover

### Icon action discoverability
https://blitzit.frill.co/b/xmnjk5vl/feature-ideas/small-action-items-need-tooltips

MyBlitzit improvement:
- tooltips for icon-only focus/floating actions
- stable hit targets

### Compact timer value
Public reviews independently praise the clean/distraction-free workflow and floating/focus experience:
- https://www.trustpilot.com/review/blitzit.app
- https://www.producthunt.com/products/blitzit-2/reviews

No state transition in MyBlitzit depends solely on a review.

## 9. Visual conclusions used by implementation

The screenshots establish these state families:

List card:
- rest
- hover/Open
- overflow menu

Task:
- rest
- inline create
- hover/action revealed
- scheduled
- overdue
- done
- live
- paused/editable
- notes expanded
- subtasks expanded
- destructive confirmation

Focus Panel:
- normal day queue
- active live task
- task hover actions
- notes expanded
- scheduled group
- done group

Floating Timer:
- collapsed
- expanded/action strip
- expanded subtasks

Preferences:
- monitor/side
- general/time
- focus settings
- timed alerts
- notifications/reminders
- completion celebration

Reports:
- chart rest
- chart tooltip
- list filter open
- date picker open
- sessions empty/list
- session inline edit
- task sessions modal

## 10. Research stop rule

Codex should not repeat this research simply to begin implementation.

Re-research only if:
- a specific unresolved behavior blocks the active milestone
- implementation evidence contradicts this specification
- the user supplies newer screenshots/instructions
- a Tauri/Windows capability has materially changed and affects architecture

Do not browse account/billing/cloud integrations for implementation; they are explicitly out of scope.
