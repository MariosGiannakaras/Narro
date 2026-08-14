# STATUS.md

Last updated: 2026-08-15

## Current phase

**Research/specification complete. Implementation not started.**

The repository was initially empty. The first committed content establishes the product specification, evidence record, architecture, and ordered implementation plan. No speculative app code has been added yet.

## Confirmed repository goal

Build a personal/local desktop application that reproduces the core Blitzit planning and focus experience as faithfully as practical, while removing remote-service requirements.

## Research completed

- Official Blitzit Help Center reviewed, including:
  - Introduction
  - Lists
  - Tasks
  - Blitz Mode / focus sessions
  - Timer modes
  - Scheduling and reminders
  - Task notes
  - Subtasks
  - Deleting and archiving
  - Windows and macOS shortcuts
  - Preferences
  - Productivity report
  - Time spent report
  - Sessions report
- Supplied archive `blitzit Ss.rar` inspected.
- Archive SHA-256: `18ab981eebbdf8327976c09bf732f62857d501dae08e6057dfc743c7378b5fab`
- 30 PNG screenshots were extracted and reviewed.
- The screenshot set contains current captures showing Blitzit `v2.6.69` plus older public-review captures. Current captures take precedence for UI details.

See `docs/RESEARCH_EVIDENCE.md`.

## Confirmed product surfaces

The local app needs three distinct desktop presentations:

1. **Main window**
   - Home/list dashboard
   - list board
   - archive views
   - search / quick actions
   - preferences / shortcuts
   - reports

2. **Focus Panel**
   - narrow side-oriented Blitz Mode window
   - configurable monitor and left/right placement
   - current task + timer
   - remaining/scheduled/done tasks
   - task management, notes, subtasks, breaks

3. **Floating Timer**
   - small movable always-on-top window
   - task title + live timer
   - expandable subtasks
   - break / notes / pause / skip / done actions
   - resize/return to Focus Panel

The Focus Panel and Floating Timer are two views of one active focus session.

## Confirmed core behavior

- Lists organize tasks.
- Planning columns are Backlog, This Week, Today, and Done.
- Week starts Monday.
- Tasks can be reordered and moved across planning columns.
- EST is an expected duration; Time Taken is actual work duration.
- EST may be parsed from a task title when enabled.
- Three timer modes exist:
  - EST countdown
  - Pomodoro countdown
  - count-up time tracking
- Pomodoro takes priority over EST while still tracking actual time.
- Blitz Mode starts the top eligible Today task.
- Future-timed scheduled tasks are not eligible until due.
- Break, notes, pause/resume, skip, and done are available during focus.
- Subtasks are editable/reorderable and have proportional completion progress.
- Notes support basic rich formatting and clickable URLs.
- Scheduling includes one-off date/time and recurrence.
- Archived lists are reversible; permanent list deletion happens only from archive.
- Done tasks older than 60 days are automatically archived by Blitzit.
- Reports include productivity, time-by-list/completion insights, and detailed sessions.
- Global and in-app shortcuts are documented in `AGENTS.md` and `docs/PRODUCT_SPEC.md`.

## Local-only scope decisions

Excluded entirely:

- auth/accounts
- billing/subscriptions/trials/upgrade UI
- cloud sync/backend
- analytics/telemetry
- integrations/webhooks/MCP
- AI assistant
- remote calendar sync
- multi-user/collaboration
- support/community surfaces

Local equivalents:

- scheduled reminders -> local OS notifications while MyBlitzit is running in background
- persistent background behavior -> tray process
- open-on-login -> OS autostart
- list icons -> local copied/imported image assets
- reports -> local SQLite queries and local export

Voice note transcription is **not** part of the initial scope because the confirmed Blitzit behavior does not establish an offline implementation and the project forbids remote services.

## Architecture decision

Selected: **Tauri 2 + React + TypeScript + Rust + SQLite**.

Key reasons:

- native desktop windows with multiple webview windows
- always-on-top support
- monitor discovery and window positioning
- global shortcut support
- tray and autostart support
- local notifications
- Windows/macOS packaging
- HTML/CSS is well suited to reproducing the supplied interface
- Rust can own authoritative timers, session state, recurrence, and SQLite writes independent of individual webviews

Electron was considered viable, but Tauri provides the required desktop primitives with a smaller runtime footprint and avoids bundling a full Chromium runtime. Flutter was not selected because the core requirement is exact desktop multi-window/floating-window behavior plus web-like UI reproduction; Tauri has a more direct fit.

See `docs/ARCHITECTURE.md`.

## Important evidence conflicts already resolved

### Sessions export format

Official Sessions documentation describes PDF export, while the supplied current Sessions screenshot visibly shows `Export .csv`. The current screenshot is newer UI evidence.

Decision:
- Overview report: local **Export PDF**
- Sessions report: local **Export CSV**
- Do not add duplicate export buttons merely to satisfy both sources.

### Account/profile and upgrade controls

Current screenshots show trial/upgrade/profile controls. They are out of scope by explicit project requirement. Remove them rather than stubbing them.

### External calendar controls

Older screenshots show calendar/integration badges and `Open in Calendar`. Remote calendar integration is out of scope. Keep local scheduling/reminders; omit external integration badges/actions.

## Deliberate local design decisions that are not claims about Blitzit

These are required to make a reliable local app:

- Closing the main window may hide it while the tray/background process continues; explicit Quit stops the process. This supports reminders/global shortcuts/focus sessions.
- If the process is interrupted during a work session, restore the session paused on next launch and do not count downtime.
- Recurring-task materialization is performed idempotently on startup, resume, and date-boundary checks.
- Timer state is authoritative in Rust, not in individual frontend windows.
- SQLite migrations are mandatory from schema v1.

These decisions may be changed only if new evidence or a new user instruction requires it.

## Next executable work

Start `TODO.md` Milestone 1: create and validate the Tauri/React/Rust scaffold plus SQLite migration harness and native-window capability spike. Do not start polishing the product UI before the desktop primitives are proven.
