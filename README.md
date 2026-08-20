<p align="center">
  <img src="assets/branding/narro-logo-master.png" alt="Narro logo" width="128">
</p>

# Narro

Narro is a personal, local-only **Windows desktop** productivity application intended to reproduce the core planning and focus experience of Blitzit as faithfully as practical without accounts, cloud services, subscriptions, analytics, or multi-user infrastructure.

The repository is in the specification/bootstrap phase. Product behavior and UI states were researched on 2026-08-15 from Blitzit's full current Help Center, official product/engineering material, official embedded-video inventory, public roadmap/feature-board feedback, public reviews, and all 30 supplied screenshots in `blitzit Ss.rar`.

## Branding

The Narro logo shown above is the official project identity supplied by the project owner. Repository branding assets and usage rules live in `assets/branding/`.

- README/docs preview: `assets/branding/narro-logo.webp`
- canonical source design: original 1254×1254 RGBA artwork recorded in `assets/branding/README.md`
- Windows application, installer, taskbar and tray derivatives should be generated from the canonical Narro artwork when implementation begins
- do not substitute Blitzit branding or independently redesign/recolor the Narro mark

The lightweight WebP is a documentation preview, not the source for final high-resolution platform icons when the original master is available.

## How to interpret this repository

The specifications are a researched implementation baseline, **not an infallible source of truth and not a requirement to reproduce Blitzit's bugs or historical technical constraints**.

Keep the distinction clear:

- User requirements, local-only/Windows-only scope, data-integrity guarantees, and explicit product decisions are binding until changed by the user.
- Screenshots and official Blitzit material are evidence for the experience and workflows we want to reproduce.
- Public bugs/reviews/roadmap items are evidence of friction or ideas, not automatic requirements.
- Architecture sketches, dimensions, animation timings, library choices, schema layouts and other technical recommendations are current best proposals. Codex may improve them when a better solution preserves the same intent and is validated.

If an implementation agent wants to inspect the original material itself, start with `docs/REFERENCES.md`. It contains direct external URLs plus guidance on when the original source should be re-opened. `docs/SOURCE_AUDIT.md` contains the detailed source-by-source synthesis.

Material deviations from a durable proposal should be recorded in `STATUS.md` with the reason and validation evidence rather than being made silently.

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

## Fidelity, reliability, and UX target

Narro should feel recognizably like the current Blitzit desktop experience rather than like a generic task application. The supplied screenshots define the information hierarchy, density, compact focus behavior, dark/light visual language, task/list states, settings surfaces, reports, Focus Panel and Floating Timer.

Fidelity does not require copying every pixel or every source-product flaw. The clone is allowed to improve interaction quality and reliability without inventing a different product workflow. Approved improvements include:

- stable hover/focus actions with no layout shift
- better handling of long task titles
- accessible tooltips and keyboard focus for icon-only controls
- tabular timer numerals to prevent per-second geometry jitter
- larger/resizable Notes editing while retaining compact inline focus access
- explicit user-controlled URL opening rather than surprise auto-launch
- Windows-locale date/time formatting
- runtime monitor hotplug/reconnect recovery without restart
- safe persisted Floating Timer position
- strong anti-regression guarantees against lost tracked time, duplicate task identities and wrong-day scheduling
- restrained micro-animations for hover, press, menus, expansions, task completion, reorder/drop and Focus/Floating transitions
- reduced-motion support
- stronger destructive-action clarity
- strict animation/resource budget for the always-on-top Floating Timer

These improvements are labeled as Narro decisions in the specifications and must not be misrepresented as confirmed Blitzit behavior.

Popular user requests that materially broaden the product — such as Tags, Calendar week/month view, bulk entry, CSV import, subtask time estimates and optional automatic overtime — are recorded as **post-parity candidates** in `docs/SOURCE_AUDIT.md`; they are not part of the initial implementation plan unless scope is changed explicitly.

## Read first

Codex should read these files before implementation:

1. `AGENTS.md` — durable project, correctness, interpretation, performance and scope rules
2. `STATUS.md` — current confirmed state and decisions
3. `TODO.md` — ordered implementation milestones
4. `docs/PRODUCT_SPEC.md` — behavioral specification
5. `docs/UI_UX_SPEC.md` — window/UI/state/motion specification and screenshot fidelity checklist
6. `docs/ARCHITECTURE.md` — current technical architecture proposal
7. `docs/RESEARCH_EVIDENCE.md` — supplied screenshot inventory, evidence precedence and visual conflicts
8. `docs/SOURCE_AUDIT.md` — exhaustive Help Center page-by-page audit, official video inventory, roadmap/bugs and public user-feedback synthesis
9. `docs/REFERENCES.md` — compact direct-link index for independently re-checking original sources and current platform documentation

Do not repeat all product research by default. Re-open only the source relevant to an ambiguity, conflict, implementation decision, or potentially outdated technical API.

## Original implementation evidence

Public engineering material about Blitzit's own implementation is recorded only as research evidence. **Narro does not choose a framework merely because Blitzit uses it.** The clone stack is selected independently for this project's Windows-only, local-only requirements.

## Current technical direction

Starting stack: **Tauri 2 + React + TypeScript + Rust + SQLite**, targeting Windows 10/11 initially.

Why this is the current best starting point:

- Windows supplies the WebView2 runtime, so Tauri does not need to bundle a second full browser engine with the app.
- React/HTML/CSS allows fast, precise iteration against the supplied Blitzit screenshots.
- Rust can own authoritative timers, scheduling, recurrence, persistence, shortcuts, notifications, and window coordination independently of UI refresh cycles.
- Tauri supports the Windows desktop primitives required by the product: multiple windows, always-on-top behavior, monitor/window positioning, global shortcuts, tray/background lifecycle, autostart, notifications, and Windows installers.
- SQLite provides reliable fully-local transactional persistence with migrations and no server dependency.

This stack is **selected for the capability spike, not protected from evidence**. Milestone 1 must prove the required Windows behavior and measure the floating-only resource profile. If a concrete blocker or clearly better Windows implementation emerges, Codex may propose/adopt the better path after documenting the decision and updating the affected project files before broad implementation continues.

### Current lightweight focus-window proposal

The product has three **presentations** but currently plans for only two webview windows:

1. `main` — dashboard, list board, settings, archives, reports.
2. `focusSurface` — one secondary window that changes between:
   - Focus Panel mode, and
   - compact Floating Timer mode.

The reason is to preserve a single active focus state while minimizing the always-running floating surface. This is an architectural proposal, not a product-level requirement.

The current plan is to keep the Floating Timer route minimal and avoid loading dashboard/report/editor code it does not use. If the main window is closed while a focus session or tray reminders continue, the implementation may destroy and recreate the main webview only if measurement shows the additional complexity produces worthwhile savings.

A native Win32/WinUI floating overlay is a valid fallback if measured WebView2 overhead or native-window behavior is materially unacceptable. Other alternatives are also allowed when backed by evidence and compatible with the project goals.

Implementation has intentionally not started yet. `TODO.md` begins with a Windows capability/performance spike before polished product UI work.
