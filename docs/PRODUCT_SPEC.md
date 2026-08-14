# Product and Behavior Specification

Research baseline: 2026-08-15

Evidence labels used below:

- **[O]** confirmed by current official Blitzit documentation
- **[S]** confirmed by supplied screenshots
- **[I]** inference from consistent evidence; not stated directly
- **[L]** MyBlitzit local-only design decision, not a claim about Blitzit

When labels conflict, follow the precedence in `AGENTS.md`. The exhaustive external-source audit is in `docs/SOURCE_AUDIT.md`.

## 1. Product model

MyBlitzit is a local personal task planner centered on a sequence:

1. plan tasks by time horizon
2. place priority work in Today
3. start Blitz Mode
4. work one live task at a time with a visible timer
5. record actual work sessions and completion outcomes
6. review reports

Blitzit's own introduction describes the product around planning and a to-do list that collapses into a floating countdown timer. [O]

MyBlitzit must preserve that loop while removing service/account dependencies. [L]

A consistent product principle across official material and user feedback is that execution must remain simpler than project management. Do not add permanent complexity merely because a feature appears on a public roadmap. [O/L]

## 2. Entities

### 2.1 List

A list groups tasks by project/context. [O]

Fields/behavior:

- title [O/S]
- list color [O/S]
- optional imported icon [O/S]
- ordering among lists [I]
- active vs archived state [O]
- pending-task count [S]
- aggregate pending EST [S]
- preview of highest-priority tasks on Home card [S]

Special view:
- **All Lists** is an aggregate view, not a normal persisted list. It combines tasks from real lists into the same planning lanes. [O/S]

List actions:
- create [O/S]
- open [S]
- edit [S]
- duplicate [S]
- archive [O/S]
- unarchive from Archived Lists [O]
- permanently delete only after archived [O]

### 2.2 Task

Core fields:

- title [O]
- owning list [O]
- planning position/lane [O]
- EST in HH:MM-equivalent duration [O]
- actual Time Taken [O]
- scheduled date and optional time [O]
- recurrence relationship/rule if applicable [O]
- rich notes [O/S]
- ordered subtasks [O/S]
- completion timestamp/state [O]
- sort order [O]
- archive state for old done tasks [O]

A task can be manually moved/reordered while unscheduled. Scheduled date rules can also move it between planning lanes. [O]

Task identity must remain stable through moves/reorders. Reordering changes position, never identity or task count. [L]

### 2.3 Subtask

Fields:

- title
- completion state
- sort order

Behavior:
- add [O/S]
- click title to edit [O]
- complete/uncomplete [O/S]
- move up/down [O/S]
- delete [O/S]
- progress ring fills proportionally to completed count [O/S]
- available in normal task view and focus timer [O/S]

### 2.4 Note

Notes are task-local rich text. [O/S]

Confirmed formatting:
- Bold
- Italic
- Strikethrough
- bulleted list
- numbered list
- Undo
- Redo

URLs are clickable. The current Help Center says URLs automatically open when a task goes live, but Blitzit's own public roadmap later lists that automatic opening behavior as a shipped/resolved bug. [O]

**MyBlitzit resolution:** URLs remain clickable but are opened only by explicit user action. Going live must not unexpectedly launch every link in a note. Do not fetch or preview remote content. [L]

Voice transcription is excluded from initial MyBlitzit scope. [L]

The Notes experience must support compact inline access during focus and a larger/resizable editing presentation for substantial notes. Public user feedback specifically identifies the original fixed Notes area as too small on larger screens. [L]

### 2.5 Session

A session is a tracked period associated with focus work or a break. [O]

Store:
- session type: work or break
- task for work sessions
- start timestamp
- end timestamp
- duration
- order/session number per task where displayed
- source: automatic focus engine or manually added [L]
- edit history timestamp [L]

Reports must remain derivable from sessions after task completion and normal list archival. [L]

Permanent task deletion is different: official Blitzit documentation states deleted tasks no longer appear in Reports. MyBlitzit should remove the permanently deleted task from user-facing reports rather than presenting it as archived history. [O/L]

## 3. Main planning lanes

### 3.1 Backlog

Intended for work beyond one week. [O]

### 3.2 This Week

Intended for the current Monday-starting week. [O]

Scheduled tasks in the current week appear here before their due day. [O/S]

### 3.3 Today

Contains tasks intended for today. [O]

Within Today:
- top ordering defines focus priority [O]
- overdue scheduled tasks can be grouped/labeled separately in red [S]
- current/future scheduled tasks may appear in a scheduled group [O/S]

### 3.4 Done

Tasks move here when completed. [O/S]

The main board screenshot shows a Done column and a monthly count. [S]

Blitzit automatically archives done tasks older than 60 days. [O]

### 3.5 Moving and ordering

Confirmed methods:
- drag/drop between lanes [O]
- reorder within a lane [O]
- back/forward arrow controls on hover [O]
- mark Done via checkbox [O]
- drag into Done [O]

MyBlitzit must also provide a keyboard-accessible non-drag mechanism. [L]

Reorder/move persistence must be transactional and invariant-tested. Public versions of Blitzit have had user-reported duplication/corruption while rearranging tasks; MyBlitzit explicitly treats that as an anti-regression requirement. [L]

## 4. Creating and editing tasks

Task creation is available:
- from `+ ADD TASK` at the bottom of a lane [O/S]
- from `+` at the top of a lane to insert at top [O]
- from the create-task shortcut [O]
- from focus panel Add Task [O/S]

Inline create state shows:
- Title
- EST
- Cancel
- Confirm [S]

Task title is edited by clicking the title. [O]

If the task is live, title editing is restricted; official docs state live-title editing is available only in Notes mode. [O]

A successful local create/edit must be durably committed before the UI presents it as saved. MyBlitzit must not reproduce cloud/server-delay states where a task appears to vanish and later reappear. [L]

### 4.1 EST parsing

Blitzit can parse an estimate placed at the end of a title. [O]

Examples of supported intent:
- minutes
- hours
- combined hours/minutes

Current Preferences screenshot contains `Auto-parse Est. time from title`. [S]

MyBlitzit should parse common suffixes case-insensitively and remove/normalize the estimate suffix from the title after successful parse if the implemented interaction matches the source behavior during validation. Exact text-normalization is not directly evidenced. [I]

### 4.2 Time Taken

Time Taken is the actual working duration and is updated from live sessions. [O]

It can also be edited manually. [O]

For a live task, EST and Time Taken may be edited only while the live timer is paused. [O]

Tracked time is correctness-critical: public Blitzit feedback currently includes lost-tracked-time reports, so MyBlitzit must persist transitions robustly and never keep the only authoritative accumulated time in a renderer. [L]

## 5. Scheduling

Scheduling is opened from a task expanded menu. [O]

### 5.1 Date shortcuts

Confirmed shortcuts:
- Today
- Later today = current time + 2 hours
- Tomorrow
- Next week = exactly 7 days later
- custom date [O]

After selecting a date, user can optionally add a specific time. [O]

Without a time:
- the task moves into Today on the scheduled date. [O]

With a future time today:
- it is visible as scheduled
- it is not eligible for Blitz auto-start until the scheduled time has arrived. [O]

Date-only schedules and schedules with a specific local time must be represented distinctly so timezone conversion cannot accidentally shift a date-only task to another day. [L]

### 5.2 Automatic lane movement

Scheduled tasks automatically move between Backlog, This Week, and Today based on due date. [O]

Week starts Monday. [O]

Implementation rule [L]:
- due today/past and not done -> Today
- due later in the current Monday-starting week -> This Week
- due beyond current week -> Backlog
- time-of-day affects focus eligibility, not the Today lane itself

All schedule calculations use the configured/local Windows timezone. Date/time display follows Windows locale conventions, including 12/24-hour preference, unless a future explicit in-app override is added. [L]

### 5.3 Recurrence

Confirmed built-in recurrence:
- every day
- every weekday
- weekly on selected date's weekday
- monthly on selected calendar date
- custom interval in days/weeks/months/years
- selected weekdays for relevant custom rules [O]

Blitzit creates a recurring parent task in Backlog and child tasks for due work. Official docs state children are created on the Monday of the week they are due. [O]

Editing supports replace-existing behavior; recurrence can also be detached/removed while preserving prior independent child tasks. [O]

Replace-existing semantics must not silently overwrite previously detached/independent children. [O/L]

MyBlitzit must preserve historical child edits and avoid regenerating duplicates. [L]

### 5.4 Reminders

Current Preferences screenshot shows:
- Schedule reminders (system) toggle
- reminder timing such as `10 mins before` [S]

MyBlitzit uses local OS notifications. [L]

The app should remain available in a tray/background process for reliable reminders while the desktop session is active. [L]

## 6. Search and quick actions

Current screenshot shows a centered search palette opened by `Ctrl+F`, with placeholder `Search for tasks, lists`. [S]

Quick actions shown:
- Add new task
- Add new list
- Go to Reports [S]

Official shortcuts confirm Search and state that it does not operate in Blitz Mode. [O]

Search results should cover local tasks and lists only. [L]

## 7. Archives

### 7.1 Lists

List menu -> Archive List. [O/S]

Archived Lists screen:
- lists disappear from active workspace
- can be unarchived
- can be permanently deleted from archive [O]

Permanent deletion removes the list and its tasks and cannot be undone. [O]

### 7.2 Done-task archive

Archived Done Tasks is a sibling view to Archived Lists. [O/S]

Blitzit auto-archives done tasks older than 60 days. [O]

Current screenshot shows:
- search field
- list filter including All Lists [S]

Normal archival preserves task/session/report history. Permanent deletion removes the entity from user-facing reports, matching official delete semantics. [O/L]

## 8. Blitz Mode / focus session

### 8.1 Entry

User prepares Today in priority order, then activates `Blitzit now`. [O/S]

Eligibility:
- unscheduled Today tasks are eligible
- scheduled tasks whose scheduled time has arrived/passed are eligible
- future-timed Today tasks are not eligible
- if all Today tasks are future-timed, Blitz Mode does not start yet [O]

On entry:
- Focus Panel opens
- top eligible Today task automatically becomes live
- its timer starts
- remaining tasks are listed below [O]

### 8.2 Live-task switching

Any eligible task can be made live via Rocket action. [O/S]

Switching immediately makes that task the live task. [O]

Implementation must close the previous work segment and start a new work segment without losing prior Time Taken. [L]

### 8.3 Focus actions

Confirmed in both Focus Panel and Floating Timer:
- Break
- Notes
- Pause/Resume
- Skip
- Done [O]

Skip:
- moves to next task
- works for live tasks, not breaks [O]

Manual Break:
- pauses the current task
- starts a break
- Windows shortcut documentation says the task resumes after the break, unless the break is skipped manually [O]

Done:
- marks active task completed [O]
- may show success/gamified completion feedback when enabled [O]

Whether Done immediately auto-starts the next task is not explicitly established by current documentation. Initial implementation should complete the active task and select the next eligible task; auto-start behavior should be validated during fidelity testing. [I]

### 8.4 Focus Panel content

Confirmed current/official structure:
- list selector
- Today title
- Preferences gear
- Home action
- compact/floating switch
- total EST summary
- completion progress bar and count
- highlighted active task with title + live timer
- active subtasks
- remaining tasks
- Add Task
- scheduled-today group
- done-during-session group
- inline notes
- task scheduling/menu actions [O/S]

### 8.5 Focus Panel placement

Preferences allow:
- target monitor
- left or right side [O/S]

Panel is a narrow desktop window, not a pane inside the main window. [S/I]

MyBlitzit must position it using monitor work-area coordinates and persist the preference. [L]

Monitor topology is dynamic. If a display is connected/disconnected while MyBlitzit is running, re-enumerate monitors and recover the Focus/Floating window into a valid visible work area without requiring application restart. [L]

## 9. Floating Timer

The Floating Timer is the compact focus presentation. [O]

Confirmed:
- movable anywhere [O]
- always on top [O]
- task title visible [O/S]
- countdown/live timer visible [O/S]
- subtasks can be expanded/collapsed [S]
- subtask progress ring [S]
- action strip provides Break, Notes, Pause/Resume, Skip, Done [O/S]
- resize icon returns to Focus Panel [O/S]

Current screenshot also shows reorder and delete controls inside expanded subtasks. [S]

The timer window should not appear in the main app layout and must remain synchronized with the same active runtime state. [L]

Persist the last safe user position and recover it when monitor geometry changes. Validate always-on-top behavior against normal maximized and borderless full-screen Windows applications; document unavoidable exclusive-fullscreen limitations rather than promising impossible overlay behavior. [L]

## 10. Timer modes

Timer selection table:

| Pomodoro | EST | Display mode |
|---|---:|---|
| Off | present | EST countdown |
| On | absent | Pomodoro countdown |
| On | present | Pomodoro countdown |
| Off | absent | count-up Time Tracking |

[O]

Actual work time is always recorded regardless of displayed mode. [O]

### 10.1 EST countdown

- begins from EST [O]
- reaches 00:00 -> explicit `Time's Up` state [O]
- user may Extend, mark done, or switch task [O]
- Extend continues the active work session while showing overtime [O]
- completion can be classified early/late against EST [O]

`Time's Up` and overtime are domain-visible timer states, not merely display styling. [L]

Public requests and Blitzit's official roadmap mention optional automatic overtime without pausing/notification. Do not make this initial default: preserve parity first and record auto-overtime as a post-parity preference candidate. [L]

### 10.2 Pomodoro

Preferences control Pomodoro, work sprint, break duration, and notifications. [O]

Behavior:
- work sprint counts down
- break begins automatically at sprint end with notification
- after break, the user is prompted to resume work [O]

Current supplied preference screenshots have Pomodoro disabled, so exact transition visuals are not established. [S]

### 10.3 Count-up tracking

If no EST and Pomodoro off:
- timer counts upward from zero
- may pause/stop
- Time Taken reflects work duration [O]

## 11. Shortcuts

### 11.1 Global

Windows:
- Go to MyBlitzit: `Ctrl+Shift+B`
- Alternate Focus Mode: `Ctrl+Shift+T`
- Find focus timer: `Ctrl+Shift+P`

[O/S]

MyBlitzit is Windows-only; macOS bindings are research evidence only and are not implementation requirements. [L]

Current Shortcuts screenshot shows per-global-shortcut toggles. [S]

`Find focus timer` should trigger a visible attention animation on the Floating Timer. [O]

### 11.2 In-app

Windows:
- Create new task: `Ctrl+Alt+T` — quick task popup for any list [O]
- Start break: `Ctrl+Alt+B` — pauses active task, starts break, then resumes unless break is skipped [O]
- Pause task: `Ctrl+Alt+P` [O]
- Skip task: `Ctrl+Alt+S` — live tasks only, not breaks [O]
- Finish task: `Ctrl+Alt+F` [O]
- Add notes: `Ctrl+Alt+N` [O]
- Search: `Ctrl+F` — unavailable in Blitz Mode [O]

## 12. Preferences

### 12.1 Blitz Panel

- select monitor [O/S]
- left/right panel side [O/S]

### 12.2 General

Confirmed across docs/current screenshots:
- open on wake/login [O]
- hide EST / Time Taken on tasks [O/S]
- hidden times remain available on hover [O]
- auto-parse EST from title [S]
- System / Dark / Light theme [S]
- timezone [S]

Date/time display follows Windows locale by default, including 12/24-hour convention. [L]

### 12.3 Blitz Mode

- Pomodoros toggle [O/S]
- work sprint length when Pomodoro enabled [O]
- break length when Pomodoro enabled [O]
- default manual break length [O/S]
- scrolling title on live timer [O/S]

### 12.4 Alerts

Current screenshots show:
- timed alerts during a task
- task alert interval
- alert sound + preview
- animated flash on timer
- notification alerts
- notification sound + preview
- schedule reminders
- reminder timing [S]

Official docs confirm timed alerts, sounds, flash, and notification alerts. [O]

All sounds in MyBlitzit must be bundled/local user assets; no remote playback dependency. [L]

### 12.5 Celebration

- Show success screen
- Fun GIF on success screen
- Success sound effect [O/S]

Use local bundled assets only. [L]

## 13. Reports

Reports have at least:
- Overview
- Sessions [O/S]

Common filtering:
- list / All Lists
- date range [O/S]

Current date-range picker screenshot shows presets:
- Today
- Yesterday
- This week
- Last 30 days
- Last 60 days
- Last 90 days
- custom two-calendar range
- Cancel / Apply [S]

### 13.1 Overview / productivity

Confirmed metrics:
- total work days = active days [O/S]
- total tasks done + average per active day [O]
- total hours/time worked = task + break time + average per active day [O/S]
- average time per task, including partially completed tasks [O/S]

Daily chart:
- tasks/work time
- breaks
- total [O/S]

Most productive:
- hour = hour with most focus [O]
- day = weekday with most focus sessions [O]
- month = month with most active time when range spans months [O]

Lower sections:
- Time by List [O/S]
- completion/done-task insight including early/late and Time Taken [O/S]

Current screenshot shows Overview `Export PDF`. [S]

### 13.2 Time spent / completion insights

Time By List aggregates work time by list in the selected range. [O]

Punctuality measures the proportion of tracked task time completed early vs late relative to EST. [O]

Done task rows show:
- completion date [O]
- early/late when EST exists [O]
- Time Taken [O]
- tasks without EST omit early/late but retain Time Taken [O]

### 13.3 Sessions

Top metrics:
- Total Time = focused work time [O/S]
- Total Tasks
- Total Sessions [O/S]

Controls:
- list filter
- date range
- hide/show break sessions
- Add Session
- export [O/S]

Session row/detail includes:
- task
- list
- session number
- date
- start
- end
- duration [O]

Editing:
- date
- start
- end
- duration
- delete [O]
- screenshot shows an edit modal for one task with multiple numbered sessions and inline time fields [S]

Manual Add Session is required. [O]

Current screenshot shows `Export .csv` in Sessions. [S]
Official help text describes PDF export. This conflict is resolved in `STATUS.md`: MyBlitzit uses CSV for Sessions and PDF for Overview.

## 14. Main-window non-core controls intentionally omitted

The supplied UI includes some current Blitzit controls that MyBlitzit must not reproduce because they depend on excluded product/service scope:

- plan/trial status
- Upgrade Now
- integrations grid
- account avatar/profile identity
- Blitzy/AI floating control
- Help Center/support/community
- external calendar/integration badges
- remote integration menu items

Removing them is an explicit scope requirement, not a fidelity defect.

Official AI/MCP/integration documentation remains useful only as evidence that the domain cleanly supports titles, notes, subtasks, schedules, EST, Time Taken, list/lane moves and completion. [O]

## 15. Data loss and deletion behavior

Required local safety:

- task delete -> confirmation
- permanent task delete -> no longer appears in user-facing reports, matching official behavior [O/L]
- list active state -> archive first
- list permanent delete -> only from archive + confirmation
- archived list retains task/report data
- database file is not automatically reset on update
- no cleanup job may delete active or recent done tasks
- reorder operations must never create duplicate task identities
- timer/session transitions must survive crash/restart according to recovery policy

## 16. UI behavior refinements adopted for MyBlitzit

These are deliberate local UX decisions, not claims about the original product:

- Focus Panel task titles may use up to two lines before truncation; full text is available by tooltip/focus detail. [L]
- Hover actions must not reflow task titles or move sibling controls. [L]
- Icon-only focus/floating controls receive tooltips and stable hit targets. [L]
- Timer digits use tabular numerals so the layout does not jitter every second. [L]
- Notes can expand into a larger/resizable editor while retaining compact inline access during focus. [L]
- URLs require explicit open; entering focus does not unexpectedly launch them. [L]
- Date/time presentation follows Windows locale. [L]
- Display hotplug/reconnect is handled at runtime without requiring restart. [L]
- Motion is subtle, respects reduced-motion preferences, and is performance-budgeted for the always-on-top surface. [L]
- Focus Panel and Floating Timer are two modes of one secondary window, not two persistent webviews. [L]

## 17. Open behavioral questions that do not block early milestones

These are intentionally not guessed:

1. Exact animation/effect for `Find focus timer`.
2. Exact success-screen visuals/GIF rotation behavior.
3. Whether finishing an active task automatically starts the next eligible task or merely selects it.
4. Exact title-text mutation after EST suffix parsing.
5. Exact behavior of active-session shutdown in the original Blitzit app.
6. Exact ordering policy when scheduled tasks and manual tasks share a Today lane outside Focus Panel.

Implement sensible local behavior only when the relevant milestone is reached, record the decision in `STATUS.md`, and do not re-open already resolved research without new evidence.

## 18. Post-parity candidates from public user feedback

Record these so useful research is not lost, but do **not** implement them before the ordered parity/reliability milestones pass:

- Tags/labels
- Calendar week/month view
- quick list assignment while typing a task title
- paste a bulleted/numbered list as multiple tasks
- CSV task import
- optional automatic overtime without `Time's Up` interruption
- subtask time estimates/tracking
- richer theme/icon customization
- partial-completion/day-by-day accounting
- bulk task operations

These are candidates, not accepted current scope. MyBlitzit should remain an execution-focused personal tool rather than expand into a broad project-management system without an explicit future instruction.
