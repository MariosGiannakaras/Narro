# STATUS.md

Last updated: 2026-08-15

## Current phase

**Research/specification in progress. Implementation not started.**

The repository was initially empty. It now contains project rules, scope, current decisions, and ordered implementation work. Product/UI/architecture/evidence documents are still being completed before implementation begins.

## Confirmed repository goal

Build a personal/local **Windows** desktop application that reproduces the core Blitzit planning and focus experience as faithfully as practical while removing all remote-service requirements.

## Research completed

- Official Blitzit Help Center reviewed, including lists, tasks, Blitz Mode, timer modes, scheduling/reminders, notes, subtasks, archive/delete behavior, Windows shortcuts, preferences, and reports.
- Supplied archive `blitzit Ss.rar` inspected.
- Archive SHA-256: `18ab981eebbdf8327976c09bf732f62857d501dae08e6057dfc743c7378b5fab`.
- 30 PNG screenshots extracted and reviewed.
- Current screenshots include Blitzit `v2.6.69`; current captures take precedence over older public-review screenshots for UI details.
- Public engineering material about Blitzit's own implementation was checked, but the clone framework is chosen independently from the original implementation.

## Confirmed product surfaces

The product exposes three presentations:

1. **Main window** — Home/list dashboard, list board, archives, search/quick actions, preferences, shortcuts, reports.
2. **Focus Panel** — narrow side-oriented Blitz Mode presentation with active task/timer and focus workflow.
3. **Floating Timer** — compact movable always-on-top presentation with task title, timer, subtasks and focus controls.

Focus Panel and Floating Timer are two presentations of one active focus session.

## Confirmed core behavior

- Lists organize tasks.
- Planning columns: Backlog, This Week, Today, Done.
- Week starts Monday.
- Tasks can move/reorder across planning columns.
- EST is expected duration; Time Taken is actual work duration.
- EST may be parsed from task title when enabled.
- Timer modes: EST countdown, Pomodoro countdown, count-up tracking.
- Pomodoro can override EST display while actual time is still tracked.
- Blitz Mode starts the top eligible Today task; future-timed scheduled tasks are not eligible before due time.
- Break, notes, pause/resume, skip, done are available during focus.
- Subtasks are editable/reorderable and contribute proportional progress.
- Notes support basic rich formatting and clickable URLs.
- Scheduling includes one-off date/time and recurrence.
- Archived lists are reversible; permanent list deletion occurs from archive.
- Done tasks older than 60 days are automatically archived by Blitzit.
- Reports include productivity, time/completion insights, and detailed sessions.

## Local-only scope decisions

Excluded:

- auth/accounts
- billing/subscriptions/trials/upgrade UI
- cloud sync/backend/API
- analytics/telemetry
- integrations/webhooks/MCP
- AI assistant
- remote calendar sync
- multi-user/collaboration
- support/community surfaces
- macOS/Linux/mobile targets

Local equivalents:

- reminders -> Windows local notifications while app process is running/backgrounded
- background persistence -> tray runtime
- open-on-login -> Windows autostart
- list icons -> local copied/imported assets
- reports -> local SQLite queries and local export

Voice transcription is not part of initial scope.

## Final architecture decision

Selected: **Tauri 2 + React + TypeScript + Rust + SQLite**, Windows 10/11 x64 first.

This decision is based on MyBlitzit's requirements, not on copying Blitzit's implementation.

### Why Tauri

- Windows already supplies WebView2, avoiding a separately bundled browser runtime for the app.
- React/CSS provides fast iteration and close visual reproduction of the supplied UI.
- Rust is a good fit for authoritative timers, recurrence, persistence, shortcuts, notifications, and window lifecycle.
- Tauri exposes the required Windows desktop primitives: window creation/manipulation, always-on-top, multi-monitor positioning, global shortcuts, tray, autostart, notifications, SQLite integration, and Windows installers.
- The application is small/local and does not need Electron's bundled Chromium/process model advantages.

### Alternatives evaluated

**Electron:** fully capable and fast to develop, but rejected for this project because the always-running/floating use case benefits from avoiding a bundled Chromium runtime where Windows WebView2 is already available.

**WinUI 3/WPF/native Windows:** potentially best for minimum native overhead, but rejected as the primary stack because reproducing the screenshot-heavy UI and interaction states would take substantially more implementation effort. Native Win32/WinUI remains a fallback only for the Floating Timer if real measurements show WebView2 overhead is unacceptable.

## Lightweight window architecture

Use normally only two webview windows:

- `main`
- `focusSurface`

`focusSurface` changes between Focus Panel and Floating Timer modes by resizing/repositioning/restyling the same window. Do not keep separate focus and floating webviews alive.

The focus session/timer remains authoritative in Rust so changing or recreating windows cannot reset/duplicate it.

The focus-surface frontend must be a minimal bundle. If the main window is closed while a focus session/reminders continue, the main webview may be destroyed and recreated on demand to reduce idle resource use.

Milestone 1 must measure floating-only CPU/memory before product UI work proceeds. No fixed memory claim is made before measurement.

## Important evidence conflicts already resolved

### Sessions export format

Official Sessions documentation describes PDF export, while the supplied current Sessions screenshot shows `Export .csv`.

Decision:
- Overview report -> PDF
- Sessions report -> CSV

### Account/profile and upgrade controls

Current screenshots show account/trial/upgrade controls. They are removed entirely from MyBlitzit.

### External calendar controls

Older screenshots show external calendar/integration actions. Keep local scheduling/reminders but omit remote integration controls.

## Deliberate MyBlitzit design decisions

These are local reliability decisions, not claims about Blitzit:

- explicit Quit stops the process; closing normal windows may leave tray/focus/reminder runtime alive when needed
- an interrupted running session restores paused on next launch and downtime is not counted as work
- recurrence materialization is deterministic/idempotent on launch/resume/date boundaries
- timer/session state is authoritative in Rust, not renderer memory
- SQLite migrations start at schema v1
- Focus Panel and Floating Timer share one secondary webview

## Next executable work

Finish `docs/RESEARCH_EVIDENCE.md`, `docs/PRODUCT_SPEC.md`, `docs/UI_UX_SPEC.md`, and `docs/ARCHITECTURE.md`; then run `TODO.md` Milestone 1, which now includes the Windows/Tauri capability and floating-window performance spike.
