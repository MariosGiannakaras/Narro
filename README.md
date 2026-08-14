# MyBlitzit

MyBlitzit is a personal, local-only desktop productivity application intended to reproduce the core planning and focus experience of Blitzit as faithfully as practical without accounts, cloud services, subscriptions, analytics, or multi-user infrastructure.

The repository is currently in the specification/bootstrap phase. The product behavior, UI states, evidence, and technical direction were researched on 2026-08-15 from Blitzit's official Help Center, official engineering material, plus 30 supplied screenshots in `blitzit Ss.rar`.

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

## What the original Blitzit uses

Blitzit's founder explicitly documented on 2026-02-21 that the desktop application is maintained as **Electron macOS** and **Electron Windows** codebases. The current cross-device product also uses a unified remote API for operations such as task ordering, schedules, estimates, time tracking, and system-specific synchronization. Mobile is maintained separately as Apple-native and Android-native software.

Source: `https://www.blitzit.app/blog/building-a-cross-platform-productivity-app`

MyBlitzit intentionally does **not** reproduce Blitzit's remote API/cloud layer because the project is local-only.

## Technical direction

The selected stack is **Electron + React + TypeScript + SQLite**.

This supersedes the earlier Tauri proposal. Electron is now preferred because:

- it is the confirmed desktop runtime used by Blitzit itself;
- Blitzit's founder specifically connects Electron to the product's cross-platform dynamic-window desktop experience;
- Electron directly provides the required multi-window, always-on-top, positioning, tray, notification, and global-shortcut primitives;
- React/HTML/CSS remains well suited to close reproduction of the supplied interface;
- a local-only architecture can keep all authoritative domain/runtime state in the Electron main process without reproducing Blitzit's cloud API.

The **Electron main process** owns authoritative timer/session state, scheduling coordination, window lifecycle, shortcuts, notifications, and persistence. Renderer processes are UI projections only. Privileged operations are exposed through a narrow typed preload/IPC API with context isolation enabled.

The main window, Focus Panel, and Floating Timer are separate `BrowserWindow` presentations of the same application state.

Implementation has intentionally not started yet. The first milestone in `TODO.md` creates the Electron scaffold and validates the desktop primitives before product UI work.