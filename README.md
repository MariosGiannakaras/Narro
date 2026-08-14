# MyBlitzit

MyBlitzit is a personal, local-only desktop productivity application intended to reproduce the core planning and focus experience of Blitzit as faithfully as practical without accounts, cloud services, subscriptions, analytics, or multi-user infrastructure.

The repository is currently in the specification/bootstrap phase. The product behavior, UI states, evidence, and technical direction were researched on 2026-08-15 from Blitzit's official Help Center plus 30 supplied screenshots in `blitzit Ss.rar`.

## Product scope

The target application includes:

- local lists and tasks
- Backlog / This Week / Today / Done planning
- task estimates (EST) and actual time tracking
- scheduling, recurrence, and local reminders
- subtasks and rich task notes
- Blitz/focus sessions
- a narrow Focus Panel
- a movable always-on-top Floating Timer
- EST countdown, Pomodoro, and count-up tracking modes
- keyboard shortcuts
- local archives
- search / quick actions
- preferences and light/dark/system theme
- local productivity and session reports
- local report export where specified

Explicitly out of scope:

- account creation, login, authentication
- subscriptions, billing, licensing, trials, upgrade prompts
- cloud backend or cloud sync
- multi-user or collaboration
- remote integrations (Google Calendar, Notion, ClickUp, Asana, webhooks, MCP, etc.)
- AI assistant / Blitzy
- telemetry / analytics sent off-device
- support/help-center/community UI
- voice transcription unless a future fully-local implementation is explicitly approved

## Read first

Codex should read these files before implementation:

1. `AGENTS.md` — durable project rules
2. `STATUS.md` — current confirmed state and decisions
3. `TODO.md` — ordered implementation milestones
4. `docs/PRODUCT_SPEC.md` — behavioral specification
5. `docs/UI_UX_SPEC.md` — window/UI/state specification
6. `docs/ARCHITECTURE.md` — technical architecture
7. `docs/RESEARCH_EVIDENCE.md` — evidence, source precedence, screenshot inventory, and conflicts

Do not repeat product research unless a requirement conflicts with the recorded evidence or new evidence is introduced.

## Technical direction

The selected stack is **Tauri 2 + React + TypeScript + Rust + SQLite**.

The key reason is not bundle size alone: this app needs multiple native desktop windows, an always-on-top movable timer, monitor/side positioning, global shortcuts, local persistence, system notifications, tray/background behavior, and installers on Windows/macOS. Tauri 2 exposes first-party desktop APIs for these needs while allowing precise HTML/CSS reproduction of the supplied UI.

The Rust side is the authoritative owner of timer/session state and persistence. The main window, Focus Panel, and Floating Timer are separate views of the same application state.

Implementation has intentionally not started yet. The first milestone in `TODO.md` creates the scaffold and validates the desktop primitives before product UI work.
