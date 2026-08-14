# MyBlitzit

MyBlitzit is a personal, local-only **Windows desktop** productivity application intended to reproduce the core planning and focus experience of Blitzit as faithfully as practical without accounts, cloud services, subscriptions, analytics, or multi-user infrastructure.

The repository is in the specification/bootstrap phase. Product behavior and UI states were researched on 2026-08-15 from Blitzit's official Help Center, official public material, and all 30 supplied screenshots in `blitzit Ss.rar`.

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
- Windows keyboard shortcuts/global hotkeys
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
- remote integrations, webhooks, or MCP
- AI assistant / Blitzy
- telemetry / analytics sent off-device
- support/help-center/community UI
- macOS/Linux/mobile targets
- voice transcription unless a future fully-local implementation is explicitly approved

## Fidelity and UX target

MyBlitzit should feel recognizably like the current Blitzit desktop experience rather than like a generic task application. The supplied screenshots define the information hierarchy, density, compact focus behavior, dark/light visual language, task/list states, settings surfaces, reports, Focus Panel and Floating Timer.

The clone is allowed to improve interaction quality without inventing new product workflows. Approved improvements include:

- stable hover/focus actions with no layout shift
- better handling of long task titles
- accessible tooltips and keyboard focus for icon-only controls
- tabular timer numerals to prevent per-second geometry jitter
- restrained micro-animations for hover, press, menus, expansions, task completion, reorder/drop and Focus/Floating transitions
- reduced-motion support
- stronger destructive-action clarity
- strict animation/resource budget for the always-on-top Floating Timer

These improvements are labeled as MyBlitzit decisions in the specifications and must not be misrepresented as confirmed Blitzit behavior.

## Read first

Codex should read these files before implementation:

1. `AGENTS.md` — durable project rules
2. `STATUS.md` — current confirmed state and decisions
3. `TODO.md` — ordered implementation milestones
4. `docs/PRODUCT_SPEC.md` — behavioral specification
5. `docs/UI_UX_SPEC.md` — window/UI/state/motion specification and screenshot fidelity checklist
6. `docs/ARCHITECTURE.md` — technical architecture
7. `docs/RESEARCH_EVIDENCE.md` — evidence, source precedence, screenshot inventory, and conflicts

Do not repeat product research unless a requirement conflicts with recorded evidence or new evidence is introduced.

## Original implementation evidence

Public engineering material about Blitzit's own implementation is recorded only as research evidence. **MyBlitzit does not choose a framework merely because Blitzit uses it.** The clone stack is selected independently for this project's Windows-only, local-only requirements.

## Technical direction

Selected stack: **Tauri 2 + React + TypeScript + Rust + SQLite**, targeting Windows 10/11 initially.

Why this fits MyBlitzit:

- Windows supplies the WebView2 runtime, so Tauri does not need to bundle a second full browser engine with the app.
- React/HTML/CSS allows fast, precise iteration against the supplied Blitzit screenshots.
- Rust can own authoritative timers, scheduling, recurrence, persistence, shortcuts, notifications, and window coordination independently of UI refresh cycles.
- Tauri supports the Windows desktop primitives required by the product: multiple windows, always-on-top behavior, monitor/window positioning, global shortcuts, tray/background lifecycle, autostart, notifications, and Windows installers.
- SQLite provides reliable fully-local persistence with migrations and no server dependency.

### Lightweight focus-window design

The product has three **presentations** but should normally use only two webview windows:

1. `main` — dashboard, list board, settings, archives, reports.
2. `focusSurface` — one secondary window that changes between:
   - Focus Panel mode, and
   - compact Floating Timer mode.

Do **not** keep separate Focus Panel and Floating Timer webviews alive. Switching modes should resize/reposition/restyle the same secondary window while preserving the active session in Rust.

The Floating Timer route must be a minimal frontend bundle and must not load dashboard/report/editor code that it does not use. If the main window is closed while a focus session or tray reminders continue, the implementation may destroy the main webview and recreate it on demand rather than retain it invisibly.

The first implementation milestone must benchmark the floating-only steady state. A native Win32/WinUI floating overlay is only a fallback if measured WebView2 overhead is materially unacceptable; do not introduce a hybrid native UI before evidence requires it.

Implementation has intentionally not started yet. `TODO.md` begins with a Windows/Tauri capability and performance spike before product UI work.
