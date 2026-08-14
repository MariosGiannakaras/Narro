# STATUS.md

Last updated: 2026-08-15

## Current phase

**Research/specification complete. Implementation not started.**

The repository was initially empty. It now contains the durable project rules, product behavior specification, screenshot-by-screenshot evidence record, detailed UI/UX and motion specification, Windows architecture, and ordered implementation milestones required for Codex to begin without repeating the Blitzit research.

## Repository documentation complete

- `AGENTS.md` — durable development, fidelity, performance, motion, testing and scope rules
- `README.md` — project purpose, scope, selected stack and window strategy
- `docs/PRODUCT_SPEC.md` — product/domain behavior and confirmed/inferred/local distinctions
- `docs/UI_UX_SPEC.md` — main/focus/floating UI, component states, visual language, motion system, accessibility and fidelity checklist
- `docs/ARCHITECTURE.md` — Tauri/React/Rust/SQLite boundaries, two-webview model, timer/session design, persistence and Windows packaging
- `docs/RESEARCH_EVIDENCE.md` — official sources, evidence precedence, screenshot-by-screenshot inventory, conflicts and public UX corroboration
- `TODO.md` — ordered implementation milestones with acceptance criteria

## Confirmed repository goal

Build a personal/local **Windows** desktop application that reproduces the core Blitzit planning and focus experience as faithfully as practical while removing all remote-service requirements and improving interaction polish where the source UX has clear friction.

## Research completed

- Official Blitzit Help Center reviewed for lists, tasks, Blitz Mode, timer modes, scheduling/reminders, notes, subtasks, archive/delete behavior, Windows shortcuts, preferences, productivity/time-spent reports and Sessions.
- Supplied archive `blitzit Ss.rar` inspected.
- Archive SHA-256: `18ab981eebbdf8327976c09bf732f62857d501dae08e6057dfc743c7378b5fab`.
- All 30 PNG screenshots extracted and individually reviewed.
- Current screenshots include Blitzit `v2.6.69`; current direct captures take precedence over older public-review captures for UI details.
- Older Tool Finder captures were used only where they expose board/hover/menu states missing from current direct screenshots.
- Public feature-board/review material was used only to corroborate product qualities or UX friction, never to override official behavior/current screenshots.
- Current Tauri 2 Windows capabilities were checked for WebView2, windows/always-on-top, global shortcuts, tray, autostart, notifications, SQLite options and Windows packaging.
- Public engineering material about Blitzit's own implementation was recorded as research evidence only; it does not determine the clone framework.

## Confirmed product surfaces

The product exposes three presentations:

1. **Main window** — Home/list dashboard, list board, archives, search/quick actions, preferences, shortcuts, reports.
2. **Focus Panel** — narrow side-oriented Blitz Mode presentation with active task/timer and focus workflow.
3. **Floating Timer** — compact movable always-on-top presentation with task title, timer, subtasks and focus controls.

Focus Panel and Floating Timer are two presentations of one active focus session and, in MyBlitzit, two modes of one `focusSurface` webview.

## Confirmed core behavior

- Lists organize tasks.
- Planning columns: Backlog, This Week, Today, Done.
- Week starts Monday.
- Tasks can move/reorder across planning columns.
- Top Today ordering defines focus priority.
- EST is expected duration; Time Taken is actual work duration.
- EST may be parsed from task title when enabled.
- Timer modes: EST countdown, Pomodoro countdown, count-up tracking.
- Pomodoro can override EST display while actual work time is still tracked.
- Blitz Mode starts the top eligible Today task; future-timed scheduled tasks are not eligible before due time.
- Any eligible task may be made live via the focus Rocket action.
- Break, notes, pause/resume, skip and done are available during focus.
- Subtasks are editable/reorderable and contribute proportional progress.
- Notes support bold/italic/strike/lists/undo/redo and clickable URLs; source Blitzit can auto-open URLs when the task goes live.
- Scheduling includes date shortcuts, optional time and recurrence.
- Recurrence supports built-in and custom patterns plus replace-existing/detach semantics.
- Archived lists are reversible; permanent list deletion occurs from archive.
- Done tasks older than 60 days are automatically archived by Blitzit.
- Reports include productivity overview, time/completion insights and detailed editable sessions.

## Detailed screenshot findings now captured

The deeper pass explicitly records, among other states:

- Home dark/light and list-card rest/hover/Open/menu states
- Create List tile and Create/Edit List modal with icon upload/color swatches
- Search/quick-actions palette
- four-column board, inline Add Task, task EST/Time Taken, scheduled and overdue groups
- task normal/hover/live/paused/done/notes/subtasks/destructive states
- Preferences upper/middle/lower sections including monitor/side, theme/timezone, Pomodoro, title scrolling, alerts, sound previews, timer flash, schedule reminders and completion celebration
- Archived Lists and Archived Done Tasks/filter states
- Overview report, chart hover tooltip, productive-time cards, list filter and date-range picker
- Sessions metrics, Add Session, CSV export, inline edit and task-session detail modal
- Windows shortcut modal and per-global toggles
- Focus Panel hierarchy including aggregate EST/progress, active accent card, remaining/scheduled/done groups and inline Notes
- Floating Timer collapsed and expanded states, focus action strip, subtask progress, reorder and delete controls

See `docs/RESEARCH_EVIDENCE.md` and `docs/UI_UX_SPEC.md` rather than repeating the screenshots in implementation prompts.

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

- Windows supplies WebView2, avoiding a separately bundled browser runtime for the app.
- React/CSS provides fast iteration and close visual reproduction of the supplied UI.
- Rust is a good fit for authoritative timers, recurrence, persistence, shortcuts, notifications and window lifecycle.
- Tauri exposes the Windows desktop primitives required by the product.
- The always-running/floating use case makes avoiding an additional bundled browser runtime attractive, but actual RAM/CPU remains a measurement requirement rather than an assumed claim.

### Alternatives evaluated

**Electron:** fully capable and fast to develop, but rejected for this Windows-only personal app because the persistent focus/floating use case benefits from trying the OS WebView2 route first.

**WinUI 3/WPF/native Windows:** potentially lowest native-window overhead but slower for screenshot-heavy UI reproduction. Native Win32/WinUI remains a fallback only for the Floating Timer if measured WebView2 overhead is unacceptable.

## Lightweight window architecture

Use normally only two webview windows:

- `main`
- `focusSurface`

`focusSurface` changes between Focus Panel and Floating Timer modes by resizing/repositioning/restyling the same native window/webview. Do not keep separate focus and floating webviews alive.

The focus session/timer remains authoritative in Rust so changing or recreating windows cannot reset/duplicate it.

The focus-surface frontend must be a minimal bundle. If the main window is closed while a focus session/reminders continue, the main webview may be destroyed and recreated on demand if measurement shows worthwhile savings.

Milestone 1 must measure floating-only CPU/memory before polished UI work proceeds. No fixed memory claim is made before measurement.

## UI/UX direction locked for implementation

MyBlitzit should preserve Blitzit's compact, dark/light, low-noise desktop character while improving interaction polish.

Durable improvements:

- no hover-induced layout shift; action controls use reserved/overlay slots
- ordinary Focus task titles may use up to two lines where practical; full title remains accessible
- icon-only controls receive tooltips and stable hit targets
- tabular timer numerals prevent per-second width jitter
- keyboard/focus-visible equivalents accompany pointer interactions where meaningful
- motion uses short one-shot transform/opacity transitions rather than perpetual decorative effects
- reduced-motion is supported from the design-system layer
- Floating Timer uses the strictest animation/performance budget
- destructive actions receive clearer confirmation/undo treatment where compatible with product semantics

The detailed motion timing/easing and screenshot-fidelity checklist live in `docs/UI_UX_SPEC.md`.

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

## Deliberate MyBlitzit reliability decisions

These are local design decisions, not claims about Blitzit:

- explicit Quit stops the process; closing normal windows may leave tray/focus/reminder runtime alive when needed
- an interrupted running session restores paused on next launch and downtime is not counted as work
- recurrence materialization is deterministic/idempotent on launch/resume/date boundaries
- timer/session state is authoritative in Rust, not renderer memory
- SQLite migrations start at schema v1
- Focus Panel and Floating Timer share one secondary webview
- animation is presentation only and never owns domain-state transitions

## Known non-blocking research gaps

Do not invent these before their implementation milestone requires a local decision:

1. exact visual animation used by original `Find focus timer`
2. exact success-screen/GIF rotation behavior
3. whether completing the live task automatically starts the next eligible task or merely selects it
4. exact title mutation after EST suffix parsing
5. exact original shutdown behavior during an active session
6. exact mixed ordering policy for manually planned and scheduled Today tasks outside Focus Panel

Any local resolution must be recorded here when implemented.

## Next executable work

Start `TODO.md` Milestone 1: build the minimal Windows Tauri scaffold and **prove the two-webview focus architecture, native capabilities, SQLite migration path, and real Floating Timer resource profile before product UI implementation**.
