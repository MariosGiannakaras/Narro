# UI / UX Specification

Last updated: 2026-08-15

This document defines the visible Windows desktop experience for MyBlitzit. It combines direct evidence from the supplied Blitzit screenshots, behavior confirmed by the official Blitzit Help Center, and explicitly labeled MyBlitzit improvements.

The goal is not a generic task manager. The goal is the same compact, modern, low-friction planning-to-focus experience, with stronger interaction polish, clearer long-title handling, stable hover behavior, and lightweight micro-animations.

## Evidence labels

- **[CONFIRMED]** visible in supplied current screenshots and/or stated in official documentation.
- **[CORROBORATED]** visible in older supplied review captures and consistent with official behavior.
- **[MYBLITZIT IMPROVEMENT]** intentionally better UX; do not describe it as original Blitzit behavior.
- **[INFERENCE]** reasonable implementation interpretation where exact source behavior is not observable.

Current supplied screenshots take precedence over older review captures for visual details.

## 1. Window model

MyBlitzit uses two persistent webview surfaces on Windows:

1. **Main window** — planning, task/list management, archives, reports, preferences, search.
2. **Focus surface** — one secondary native window that changes between:
   - **Focus Panel**: tall narrow Today/focus workspace.
   - **Floating Timer**: compact always-on-top widget.

The Focus Panel and Floating Timer are presentations of the same active session, not separate session owners.

### Main window

[CONFIRMED source behavior]
- normal resizable desktop surface
- Home and Reports primary navigation
- dark/light theme
- planning and management happen here

[MYBLITZIT IMPROVEMENT]
- use native-feeling Windows chrome where practical without browser-like UI
- main webview may be destroyed while hidden for long focus-only periods if measurements show material memory savings; authoritative timer/session state remains in Rust

### Focus Panel

[CONFIRMED]
- narrow vertical panel placed on selected monitor and left/right side
- contains Today workflow, active timer, remaining tasks, scheduled tasks, done tasks
- list selector, Preferences, Home and compact/collapse control
- current live task is visually emphasized

Target starting width: approximately 340 logical px at 100% scaling. Screenshot pixel widths prove compactness but are not hard DPI-independent dimensions.

### Floating Timer

[CONFIRMED]
- movable
- always on top
- current task and live timer continuously visible
- collapsed and expanded states
- expanded state exposes focus actions and subtasks
- returns to Focus Panel

Target collapsed footprint: roughly 340 × 110 logical px, with content-driven expansion.

## 2. Visual language

### Overall character

The supplied screenshots establish:
- dark charcoal background rather than pure black
- low-contrast elevated cards
- thin borders
- rounded corners
- compact desktop density
- strong white/near-white primary text
- subdued gray secondary text
- cyan/teal-to-lime accent treatment
- restrained red for overdue/destructive states
- small colored list chips/icons
- minimal decorative imagery outside completion celebration

The interface must remain quiet. Accent color conveys state/action rather than decorating everything.

### Suggested design tokens

These are implementation targets, not claims of exact Blitzit source values.

Dark:
- `bg.canvas`: #0E0F0F
- `bg.surface`: #151616
- `bg.raised`: #1A1B1B
- `bg.input`: #222323
- `border.subtle`: rgba(255,255,255,.08)
- `border.strong`: rgba(255,255,255,.16)
- `text.primary`: #F4F5F5
- `text.secondary`: #9A9E9C
- `text.muted`: #6F7471

Light:
- `bg.canvas`: #ECEDEE to #F1F1F2 range
- `bg.surface`: #F8F8F8
- `bg.raised`: #FFFFFF
- `border.subtle`: rgba(0,0,0,.08)
- `text.primary`: #181A19
- `text.secondary`: #696D6A

Accent:
- teal/cyan start near #48D6C5
- lime end near #B7D96D
- success uses teal/green family
- overdue/destructive uses warm red/coral
- report early/late semantics use green/red

### Typography

Windows-first font stack:
`"Segoe UI Variable", "Segoe UI", system-ui, sans-serif`

Suggested hierarchy:
- page title: 22–26 px semibold/bold
- section title: 15–18 px semibold
- task title: 14–16 px medium/semibold
- metadata: 11–13 px
- timer: 18–22 px semibold with tabular numerals

Timers must use tabular numerals so the width does not jitter each second.

### Radius and spacing

Suggested radius scale:
- small controls: 6–8 px
- task cards: 8–10 px
- list cards/panels: 10–12 px
- modal: 12–14 px
- floating window content: 12–16 px

Spacing follows a 4 px base scale: 4, 8, 12, 16, 20, 24, 32.

## 3. Motion system

Motion is a MyBlitzit enhancement. It makes state changes legible without making the product feel busy.

### Rules

- no hover animation may change sibling layout geometry
- prefer `opacity` and `transform`
- animate progress with transforms rather than layout width where practical
- avoid animated blur/backdrop-filter
- no perpetual gradient animation in the Floating Timer
- do not animate timer numerals between every second; update text discretely
- respect `prefers-reduced-motion`
- reduced-motion mode keeps state feedback but removes translation/scale and long easing

### Duration/easing targets

- press feedback: 70–90 ms
- hover/focus: 110–140 ms
- tooltip: 120–150 ms after 350–500 ms intent delay
- menu/popover open: 130–160 ms
- inline expansion: 160–200 ms
- modal: 180–220 ms
- task reorder/drop settle: 160–200 ms
- task completion: 200–260 ms
- chart/filter transition: 250–400 ms, one-shot only

Default easing:
- enter: cubic-bezier(.2,.8,.2,1)
- exit: cubic-bezier(.4,0,1,1)

### Specific micro-interactions

Buttons:
- hover increases background/outline contrast and may visually lift by ~1 px
- press scales to ~0.98 for <90 ms
- disabled controls do not move

Task cards:
- hover changes border/background while actions fade into reserved space
- drag lifts to scale ~1.01–1.015 with stronger shadow and fixed placeholder
- drop settles in 160–200 ms
- completion animates checkbox/check first, then text fade/strike, then card move/collapse

Menus/popovers:
- opacity 0→1 plus translateY 3–4 px or scale .98→1
- transform origin follows trigger
- close faster than open

Progress bars:
- animate to new value over ~220 ms
- no continuous shimmer

Focus/Float transition:
- native window geometry changes immediately or in a short controlled native sequence
- content crossfades/scales for 120–180 ms after geometry change
- do not implement a high-frequency JS loop to animate native window size

Find Timer shortcut:
- [CONFIRMED] original applies an animation to locate the floating timer
- [MYBLITZIT IMPROVEMENT] use two restrained outline pulses or a short glow ring lasting <=900 ms

Alert flash:
- [CONFIRMED] Preferences expose an animated timer flash
- run only when timed alerts are enabled

Completion celebration:
- [CONFIRMED] success screen, optional GIF and success sound exist
- [MYBLITZIT IMPROVEMENT] keep local celebration short, skippable and visually <=1.2 s by default

## 4. Main window — Home

### Shell

[CONFIRMED from `Screenshot_1`, `Screenshot_15`]
- large central content region
- left stack of compact cards/navigation
- top-right utility controls
- bottom navigation with Home and Reports
- greeting/title area plus secondary sentence in original
- `Your Lists` heading
- right-side helper text for lists with upcoming tasks

MyBlitzit removes account/trial/upgrade/profile/integration controls. Keep Search and Settings accessible.

### Left navigation

[CONFIRMED]
- `+ Create new list`
- divider
- `All my lists`
- `Archived lists`
- active row uses filled/raised state

### List card

[CONFIRMED from `Screenshot_1`, `Screenshot_3`, `Screenshot_15`]
Normal state:
- leading list icon/chip
- list name
- overflow `…`
- preview of several task rows
- optional task estimate/time metadata at row end
- footer pending-task count
- footer aggregate EST when available

Hover state:
- prominent `Open` pill appears
- external card size remains stable

Overflow menu:
- Edit List
- Duplicate
- divider
- Archive List

[MYBLITZIT IMPROVEMENT]
- reserve or overlay the Open affordance so hover never reflows content
- focus-visible state mirrors pointer hover

### Create List tile

[CONFIRMED from `Screenshot_2`]
- dashed rounded border
- centered plus
- uppercase `CREATE LIST`
- accent gradient/dashed treatment

Motion: hover increases border contrast and slightly scales/translates the plus; no looping gradient.

### Create/Edit List modal

[CONFIRMED from supplied `490270...png`]
- centered modal over dimmed context
- `Create a new list`
- close X
- large circular Upload an icon control
- optional file note `(jpg, png, svg)`
- color swatches including multicolor and dark/black option
- selected color ring/check
- title input
- Cancel outlined button
- Create accent-gradient button

Local icon behavior:
- copy imported asset to app-owned data directory
- preview before confirmation

## 5. Main window — List board

[CORROBORATED by supplied Tool Finder captures; behavior confirmed by official Lists/Tasks docs]

### Header
- Back
- list dropdown/chip
- pending-task count + aggregate EST sentence
- utility toolbar

### Columns
Stable planning columns:
1. Backlog
2. This Week
3. Today
4. Done

Each column:
- tall rounded panel
- title
- aggregate EST where meaningful
- `+` add-at-top
- thin progress bar and `x/y Done` where applicable
- bottom `+ ADD TASK`

Today is the focus-launch lane and receives stronger accent treatment in older captures.

### Empty state

[CORROBORATED]
- small circular check/success icon
- `All Clear`

### Inline create

[CORROBORATED from Tool Finder 2m01]
- `× CANCEL`
- Title input
- Est time input
- `Confirm` accent button
- helper `Add a new task`

Create-at-top inserts at highest priority in that lane.

### Task card state inventory

Normal:
- priority/order number where used
- title
- list chip in All Lists context
- EST lower-left
- Time Taken lower-right

Hover/action-revealed:
- completion checkbox
- directional movement controls and/or task actions
- action icons reveal without changing card height

Scheduled:
- grouped toward bottom of relevant lane
- scheduled date/time metadata
- optional secondary note/context line

Overdue:
- warning section such as `Scheduled tasks overdue`
- warning/red age/date treatment

Done:
- completion indicator
- title may be strikethrough
- remains in Done until archive policy moves old tasks

Live:
- active focus card gets accent border and live timer

Notes-expanded:
- rich editor opens inside task/focus context

Subtasks-expanded:
- progress and rows render inline

Paused-live:
- EST / Time Taken become editable; running live state does not allow those edits

Destructive-confirm:
- deletion requires explicit confirmation

## 6. Search / command palette

[CONFIRMED from `Screenshot_4`]
- full-app dim overlay
- compact centered palette near upper-middle
- search icon
- placeholder `Search for tasks, lists`
- `Ctrl+F` key hint
- divider
- `Quick actions`
- Add new task
- Add new list
- Go to Reports

[MYBLITZIT IMPROVEMENT]
- keyboard-first selection
- stable result-row height
- matched substring highlight
- Enter executes, Esc closes
- result changes fade without vertical jumping

Search is unavailable in Blitz Mode per official shortcuts documentation.

## 7. Archives

### Archived Lists

[CONFIRMED `Screenshot_8`]
- segmented `Archived lists` / `Archived done tasks`
- right-side section label
- centered empty state with archive icon, title and explanation

Behavior:
- archived lists can be restored
- permanent deletion only from archive and requires confirmation

### Archived Done Tasks

[CONFIRMED `Screenshot_9`]
- same segmented tabs
- full-width search field
- list filter dropdown
- All Lists + individual lists
- centered empty state

Original behavior auto-archives done tasks older than 60 days.

## 8. Preferences

Preferences use a tall modal/panel with internal scrolling and section dividers.

### Blitz Panel

[CONFIRMED `Screenshot_5`]
- monitor preview showing desktop thumbnail/resolution
- selected screen label
- `Blitz Panel Side` Left/Right segmented control

### General

[CONFIRMED]
- Hide EST / Time Taken on tasks
- Auto-parse EST time from title
- System / Dark / Light theme
- Timezone dropdown

When time fields are hidden, official docs state values remain available on hover.

### Blitz mode settings

[CONFIRMED]
- Pomodoros toggle
- default break length dropdown
- scrolling title on live timer toggle
- official docs additionally establish configurable work-sprint and Pomodoro-break lengths when Pomodoro is enabled

Conditional settings expand/collapse without unexpectedly shifting the user's scroll position.

### Alerts

[CONFIRMED `Screenshot_6`, `Screenshot_7`]
Timed alerts during a task:
- enable toggle
- timing dropdown
- sound dropdown
- speaker/volume affordance
- preview/play control
- animated flash on timer toggle

Notification Alerts:
- enable toggle
- sound dropdown
- speaker/preview controls

Schedule reminders (system):
- enable toggle
- reminder timing such as `10 mins before`

### Celebrate task completion

[CONFIRMED]
- Show success screen
- nested Fun GIF on success screen
- Success sound effect
- sound preview controls

[MYBLITZIT IMPROVEMENT]
- nested options visibly disable/collapse when parent is off
- sound previews never overlap

## 9. Windows Shortcuts modal

[CONFIRMED `Screenshot_16` + official Windows docs]

Visual structure:
- centered modal
- close X
- `Global (works outside & inside Blitzit)`
- each shortcut rendered as keycaps
- per-global enable toggle
- `App (works only inside of Blitzit)`

Global:
- Ctrl+Shift+B — Go to MyBlitzit
- Ctrl+Shift+T — Alternate between Focus Mode
- Ctrl+Shift+P — Find focus timer

App:
- Ctrl+Alt+T — Create new task
- Ctrl+Alt+B — Start break
- Ctrl+Alt+P — Pause task
- Ctrl+Alt+S — Skip task
- Ctrl+Alt+F — Finish active task
- Ctrl+Alt+N — Add Notes (Active task)
- Ctrl+F — Search

If a global registration fails, show an unavailable state next to that shortcut instead of failing silently.

## 10. Reports — Overview

[CONFIRMED `Screenshot_10`–`Screenshot_14`]

Header/filters:
- Back + Reports
- Overview / Sessions segmented tabs
- list filter
- Export PDF
- date range

Metric cards:
- Total work days
- Total tasks done
- Total time worked
- Avg. Time per task

Productivity chart:
- daily axis
- Tasks color
- Breaks color
- Total color
- hover tooltip with date and all three metrics
- chart menu icon upper-right

[MYBLITZIT IMPROVEMENT]
- tooltip follows point without obscuring pointer target
- keyboard focus exposes equivalent values
- chart motion occurs only on load/filter change

Productive-time cards:
- Most Productive hour
- Most Productive day
- Most Productive month

Lower panels:
- Time By List
- Done Tasks
- early/late legend visible in current screenshots
- empty copy when selected range has no report

## 11. Reports — Date Range Picker

[CONFIRMED supplied `86d1...png`]

- trigger with calendar icon and range
- preset column: Today, Yesterday, This week, Last 30 days, Last 60 days, Last 90 days
- two adjacent month calendars
- previous/next controls
- start/end dates filled with accent circles
- selected span highlighted continuously
- Cancel outlined action
- Apply accent action

[MYBLITZIT IMPROVEMENT]
- keyboard date navigation
- obvious start/end focus states
- selected range remains visible while navigating adjacent months

## 12. Reports — Sessions

### Sessions dashboard

[CONFIRMED `Screenshot_13`]
- Overview / Sessions
- Add Session
- current screenshot shows `Export .csv`
- Hide Break sessions
- date range
- Total Time
- Total Tasks
- Total Sessions
- list filter

### Session list

Official docs establish chronological rows with:
- task
- list
- session number
- date
- start
- end
- duration
- overflow

### Inline edit

[CONFIRMED `Screenshot_21` + official docs]
- date/start/end/duration editable
- editing field gets accent outline
- confirm/check action appears for pending edit
- overflow remains available

### Task Sessions modal

[CONFIRMED `Screenshot_21`]
- task title
- list chip/name
- close X
- Add Session
- aggregate session count
- aggregate task session time
- rows `Session N`
- date field
- start → end time
- duration
- per-row overflow

[MYBLITZIT IMPROVEMENT]
- preserve scroll position after editing
- local validation failure restores previous value and shows inline error

## 13. Focus Panel

### Top bar

[CONFIRMED `Screenshot_18`, `Screenshot_20`]
- list selector (`All` in capture)
- `Today`
- Preferences gear
- Home
- compact/collapse icon

### Day summary

[CONFIRMED]
- aggregate `Est: 2hr 10min` style label
- horizontal accent progress bar
- `1/4 Done` style count

Progress change gets one short transition when completion changes.

### Active live card

[CONFIRMED]
- strong accent border
- active task title
- live timer right-aligned
- subtask progress row
- add subtask `+`
- expand/collapse chevron

[MYBLITZIT IMPROVEMENT]
- title may use up to two lines before truncation; full title appears in tooltip/focus detail
- timer uses fixed-width tabular numerals
- accent border does not continuously pulse

### Remaining task rows

[CONFIRMED/CORROBORATED]
- title
- optional list chip at right in All Lists
- optional overdue age/date
- completion checkbox
- hover actions may expose Rocket/make-live, subtasks, notes and overflow

[MYBLITZIT IMPROVEMENT based on public Blitzit feedback]
- action slots reserve width; revealing controls never pushes/truncates title further
- tooltips instead of hover labels that reflow
- 2-line title clamp where compact width permits

### Add Task

[CONFIRMED]
- `+ ADD TASK` between normal queue and scheduled section

### Scheduled tasks

[CONFIRMED]
- section count such as `3 Scheduled tasks`
- title
- due label such as `Today 1:00PM`
- optional secondary note/context line
- original may show external integration chips; MyBlitzit omits them while preserving local schedule metadata

### Done section

[CONFIRMED]
- section count
- completed rows
- strikethrough title
- Time Taken at right

### Inline Notes

[CONFIRMED `Screenshot_20`, Tool Finder 4m33, official Notes docs]
- editor expands inside task context
- task title row remains visible
- toolbar: Bold, Italic, Strikethrough, bulleted list, numbered list, Undo, Redo, microphone in original
- Close action
- URLs are clickable

Initial MyBlitzit excludes remote voice transcription, so the microphone is absent unless fully-local transcription is separately approved.

Original behavior auto-opens note URLs when a task goes live. Implement only valid http/https URLs and avoid reopening the same URL repeatedly on pause/resume.

### Focus task overflow

[CORROBORATED Tool Finder 2m41]
- Update Schedule
- date/time summary
- Change list
- Duplicate
- destructive confirmation
- original `Open in Calendar` excluded

## 14. Floating Timer

### Collapsed

[CONFIRMED `Screenshot_19`]
- dark rounded compact panel
- task title left
- live timer right
- second row: circular subtask progress, `2/4 Subtasks`, plus and chevron
- subtle shadow/elevation against desktop
- always on top and movable
- no normal navigation

### Expanded

[CONFIRMED `Screenshot_17`]
Top action strip has icon-only controls corresponding to:
- Break
- Notes
- Pause/Resume
- Skip
- Done
- return/expand to Focus Panel at far right

Expanded subtasks:
- progress dial
- `n/m Subtasks`
- add `+`
- collapse chevron
- per-row checkbox
- completed text strikethrough
- reorder up/down
- delete

[MYBLITZIT IMPROVEMENT]
- fixed icon hit boxes >=32 px with tooltips
- hover never changes window width
- destructive subtask action gets safe confirmation/undo behavior according to final product rule

### Performance rules

- focus/floating route must not import reports/charts/editor code until needed
- collapsed state renders only title, timer, progress, chevron, drag region and minimum action logic
- no React polling is authoritative for elapsed time
- no infinite decorative CSS animation
- measure CPU/RAM in Milestone 1 and again after Floating Timer implementation

## 15. Timer/focus visual state matrix

Idle:
- no active accent card
- focus start only if an eligible Today task exists

Running EST countdown:
- accent active card
- remaining time displayed
- actual Time Taken accumulates in backend

Time's Up / overtime:
- official docs require `Time's Up`
- actions include extend, done, switch task
- clearly distinguish overtime from remaining estimate

Running count-up:
- starts at 00:00 and increments

Pomodoro work:
- work sprint countdown overrides EST display
- actual work time still accumulates

Break:
- task work accumulation pauses
- break tracked separately

Paused:
- timer visually indicates paused state
- EST and Time Taken become editable

Completed:
- task marked Done
- optional success moment per Preferences

## 16. Explicit UX improvements over Blitzit

These are deliberate and compatible with the same core workflow:

1. No hover layout shift — action controls use reserved/overlay slots.
2. Long-title readability — Focus rows can use two lines; full text via tooltip/focus.
3. Tooltips for icon-only controls — especially focus/floating actions.
4. Consistent keyboard focus — pointer actions have focus-visible equivalents where meaningful.
5. Reduced-motion support.
6. Better destructive-action safety.
7. No dead cloud UI — account/upgrade/integration controls are removed.
8. Stable timer geometry — tabular digits and fixed timer column.
9. Clear, restrained empty states.
10. Performance-aware focus surface — minimal bundle and no decorative continuous animation.

## 17. Accessibility / Windows requirements

- target WCAG 2.2 AA contrast where practical
- visible focus ring not dependent on color alone
- hit targets preferably >=32 px; critical focus controls >=36 px where space permits
- semantic labels for icon controls, toggles, progress, timer and charts
- chart data must have accessible textual equivalent
- Esc closes safe modal/popover/editor layers
- Enter confirms focused primary actions
- test 100%, 125%, 150%, 200% Windows display scaling
- multi-monitor placement must correctly convert logical/physical coordinates

## 18. Screenshot fidelity checklist

Before UI fidelity is considered complete, visual-regression fixtures should cover:
- Home dark
- Home light
- list-card hover/Open
- list-card overflow
- Create List tile
- Create List modal
- Search palette
- Preferences upper/middle/lower
- Archived Lists empty
- Archived Done Tasks empty + filter open
- Reports Overview + chart tooltip
- Reports lower section
- Reports list filter open
- Reports date-range picker
- Sessions dashboard
- Sessions task-detail edit modal
- Windows Shortcuts modal
- four-column List board
- inline Add Task
- task card with EST + Time Taken
- overdue scheduled group
- inline Notes in board
- Focus Panel normal
- Focus task hover actions
- Focus Notes expanded
- Focus overflow menu
- Floating Timer collapsed
- Floating Timer expanded with subtasks
