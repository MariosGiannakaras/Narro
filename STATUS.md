# STATUS.md

Last updated: 2026-09-02

## Current phase

**Milestone 1 in progress (Native harness Recreate deadlock fixed, artifact generating for manual re-test)**

The repository now contains the durable rules, exhaustive source/screenshot research, product behavior specification, UI/UX/motion specification, Windows architecture, ordered implementation plan, original Blitzit screenshot references, and the canonical Narro branding asset needed for Codex to begin without repeating the original product research.

## Repository documentation complete

- `AGENTS.md` — durable development, correctness, fidelity, performance, motion, Windows and scope rules
- `README.md` — purpose, scope, branding, selected stack and two-webview strategy
- `docs/PRODUCT_SPEC.md` — domain behavior and confirmed/inferred/local distinctions
- `docs/UI_UX_SPEC.md` — main/focus/floating UI, states, visual language, motion, accessibility and screenshot checklist
- `docs/ARCHITECTURE.md` — Tauri/React/Rust/SQLite boundaries and Windows runtime architecture
- `docs/RESEARCH_EVIDENCE.md` — supplied screenshot-by-screenshot evidence inventory
- `docs/SOURCE_AUDIT.md` — exhaustive current Help Center page-by-page audit, official video inventory, official blogs/roadmaps, Frill bugs/features and review synthesis
- `docs/REFERENCES.md` — direct source/reference index
- `docs/BEHAVIOR_MATRIX.md` — optional state/transition verification aid
- `docs/DECISION_GATES.md` — optional implementation validation checkpoints
- `docs/INTERACTION_CAPTURE_GUIDE.md` — optional future source-product interaction capture guide
- `TODO.md` — ordered executable milestones and anti-regression acceptance criteria

## Reference assets complete

### Original Blitzit screenshots

The repository contains the supplied original Blitzit screenshots under:

`reference/original-blitzit-screenshots/`

These are reference/evidence only. They are available to Codex for visual fidelity work and must not be treated as Narro-owned product assets or as infallible evidence of hidden behavior.

### Narro branding

Canonical Narro artwork is committed at:

`assets/branding/narro-logo-master.png`

Verified master metadata:

- `1254 × 1254` RGBA
- `916,927` bytes
- SHA-256 `c553431248aafc705ce20230a69418769e41e019f0eea4dc88d0949c9bb05a5a`
- Git blob SHA `41781e60334c4f873805915ddc4b2f1219e938e4`

The root README references this master PNG directly. Platform-specific Windows/app/tray/icon derivatives should be generated from this source when implementation begins. Do not replace the master with a lower-resolution or heavily compressed derivative.

## Confirmed repository goal

Build **Narro**, a personal/local **Windows** desktop application that reproduces Blitzit's core planning and focus experience as faithfully as practical while:

- removing remote-service/account dependencies;
- improving interaction polish where source UX has documented friction;
- prioritizing correctness/reliability over feature count;
- keeping the signature Focus Panel / Floating Timer lightweight.

## Research completed

### Supplied visual evidence

- inspected `blitzit Ss.rar`;
- SHA-256 `18ab981eebbdf8327976c09bf732f62857d501dae08e6057dfc743c7378b5fab`;
- 30 PNG screenshots individually reviewed;
- current captures include Blitzit `v2.6.69`;
- seven older Tool Finder captures used only for states absent from current screenshots.

### Official Help Center — exhaustive pass

Reviewed current pages across:

**Getting started**
- Home
- Introduction
- Lists
- Tasks
- Blitz Mode / focus sessions

**Workflow**
- Timer Modes
- Scheduling Task Reminders
- Task Notes
- Subtasks
- Deleting and Archiving
- macOS shortcuts for research only
- Windows Shortcuts
- AI Agent / Blitzy for domain vocabulary only

**Reports**
- Productivity Report
- Time Spent Report
- Sessions Report

**Integrations — research only, excluded from product**
- Google Calendar
- Notion
- ClickUp
- Asana
- Claude
- ChatGPT
- Raycast
- Zapier / n8n / Make / IFTTT webhook material
- Upcoming integrations

**Settings/community**
- Preferences
- Account & Billing
- Troubleshooting
- Activation Code
- Submitting Ideas and Bugs
- Affiliate Program

The integration/account/community pages are not implementation scope. They were used only when they reveal domain fields, UI placement, timezone/schedule semantics or known failure states.

### Official product/design/engineering material

Reviewed:

- 2025 redesign/future-of-Blitzit material;
- 2026 founder engineering article;
- official Blitzit roadmap;
- public Frill roadmap/feature/bug board linked by Blitzit itself.

### Official videos

Identified official Help Center embedded YouTube demos including IDs for Introduction, Lists, Timer Modes, Scheduling, recurrence/custom recurrence, schedule editing, Notes, Subtasks and Windows Shortcuts.

The available research environment did **not** expose reliable YouTube streams/transcripts/metadata for these embedded IDs. No spoken claim is invented. The accompanying Help Center article is canonical unless an actual transcript/video becomes available later.

### Public user feedback/reviews

Reviewed current first-party Frill bug/feature feedback plus corroborative Product Hunt, G2, Trustpilot and hands-on editorial feedback.

Public reviews never override current screenshot/official behavior. They are used to identify repeated qualities users value and reliability/UX failures Narro should not reproduce.

## Confirmed core product behavior

- Lists organize tasks.
- Planning lanes: Backlog, This Week, Today; current desktop screenshots additionally show Done.
- Week starts Monday.
- Top Today order defines focus priority.
- Tasks can reorder/move across lanes.
- EST is expected duration; Time Taken is actual tracked work.
- EST may be parsed from supported title suffixes.
- Timer modes: EST countdown, Pomodoro, count-up tracking.
- EST expiry enters `Time's Up`; user can Extend, Done or Switch Task.
- Extend exposes overtime while work continues.
- Pomodoro overrides EST display; at sprint end a break starts automatically with notification; end of break prompts return to work.
- Future-timed Today tasks are not focus-eligible before due time.
- Rocket/make-live switches active task immediately.
- Break, Notes, Pause/Resume, Skip and Done exist during focus.
- Subtasks are add/edit/reorder/delete/complete capable during normal and live work.
- Scheduling shortcuts include Today, Later today (+2h), Tomorrow, Next week (+7d), custom date, optional time.
- Recurrence supports presets/custom intervals, Backlog parent, Monday-of-due-week children, replace-existing and detachment semantics.
- Lists archive before permanent deletion.
- Done tasks older than 60 days auto-archive in original Blitzit.
- Permanent task deletion removes the task from original Blitzit Reports.
- Reports include productivity overview, time/list/punctuality insights and editable detailed Sessions.
- Current screenshot/Help Center export conflict remains resolved as Overview PDF + Sessions CSV.

## Major source conflict resolved: Note URLs

Current Help Center text says URLs in task Notes automatically open when the task becomes live.

Blitzit's own public roadmap later contains a shipped/resolved bug report that links in the description opened when pressing Blitzit Now.

**Narro decision:**

- URLs remain clickable;
- explicit user activation is required;
- entering Focus Mode, changing active task, pause/resume never automatically launches note URLs;
- no remote preview/fetch.

This supersedes the earlier local decision to reproduce automatic opening.

## Reliability anti-regressions locked from user feedback

These are now implementation requirements, not optional polish.

### Lost tracked time

Public Blitzit feedback includes live tasks completing with `00:00` / lost tracked time.

Narro:
- Rust owns authoritative timer/session state;
- no renderer-only accumulated time;
- transition/checkpoint persistence without per-second writes;
- controlled-time tests;
- completion-after-live-work regression test;
- crash/restart recovery tests.

### Duplicate/reordered tasks

Public feedback reports drag/drop order not sticking and scheduled tasks duplicating/triplicating after movement.

Narro:
- stable immutable task identities;
- reorder changes position only;
- transactional ordering writes;
- repeated drag/drop/move tests preserve ID count;
- Duplicate explicitly creates exactly one new independent identity.

### Wrong-day scheduling/timezone

Current Frill roadmap tracks tasks appearing on wrong day, timezone shifts and recurrence weekday errors.

Narro:
- distinguish date-only vs date+time schedules;
- single explicit Windows local/configured timezone model;
- Windows-locale rendering;
- DST/week-boundary/timezone/missed-day tests;
- recurrence materialization idempotence.

### Monitor handling

Official Troubleshooting says Blitzit may require restart when a second monitor is connected after launch; feedback also mentions screen-selection responsiveness.

Narro:
- monitor topology is dynamic runtime state;
- re-enumerate displays on changes;
- clamp/recover Focus/Floating surfaces to visible work areas;
- persist safe Floating Timer position;
- no restart required for normal display hotplug.

### Focus action stability

Public feedback explicitly describes Blitz buttons as jumpy and hard to catch with the cursor.

Narro:
- hover/focus controls use fixed/reserved slots;
- no layout shift;
- pointer targets never move because an action is revealed;
- icon tooltips instead of expanding labels under pointer.

### Notes ergonomics

Roadmap feedback requests a larger/adjustable Notes screen and includes spellcheck friction.

Narro:
- compact inline Notes remain in Focus context;
- larger/resizable editor is also available;
- use WebView/browser spellcheck where practical;
- no remote voice transcription initially.

## User-loved qualities to protect

Across official redesign material and public reviews, repeated positives are:

- clean/uncluttered UI;
- planning without project-management overload;
- ever-visible current task/timer;
- Focus Panel and smaller Floating Timer;
- fast transition from planning to doing;
- Pomodoro/reminders;
- subtasks/Notes;
- time awareness and reports;
- tactile/gamified completion feedback without clutter.

Therefore advanced requested features are not automatically added to initial scope.

## Post-parity candidates recorded, not scheduled

Useful/popular requests preserved in `docs/SOURCE_AUDIT.md` but excluded from initial Milestones 1–10 unless scope changes:

- Tags/labels
- Calendar week/month view
- quick list assignment while typing title
- paste bullet/numbered text as multiple tasks
- CSV task import
- optional automatic overtime without `Time's Up`
- subtask time estimates/tracking
- richer theme/icon customization
- partial-completion/day-by-day accounting
- bulk task operations

Reason: parity + reliability first; preserve the execution-focused product character.

## Local-only scope decisions

Excluded:

- auth/accounts
- billing/subscriptions/trials/licensing/activation
- cloud backend/sync/API
- analytics/telemetry
- integrations/webhooks/MCP
- AI assistant
- remote calendar sync
- multi-user/collaboration
- support/community surfaces
- macOS/Linux/mobile/web targets
- remote voice transcription

Local equivalents:

- reminders -> Windows notifications while runtime is active/backgrounded;
- background lifecycle -> tray;
- open-on-login -> Windows autostart;
- list icons -> copied local assets;
- reports/exports -> SQLite/local generation;
- external links -> explicit default-browser open.

## Current architecture direction

Selected starting point: **Tauri 2 + React + TypeScript + Rust + SQLite**, Windows 10/11 x64 first.

Framework choice is based on Narro's Windows-only local requirements, not on copying original Blitzit's Electron implementation.

Normally two webviews:

- `main`;
- `focusSurface` changing between Focus Panel and Floating Timer.

Rust owns authoritative timer/session/domain state. SQLite is durable source of truth. `focusSurface` is a minimal frontend bundle. Main may be destroyed/recreated during focus-only runtime if measurement shows worthwhile savings.

Milestone 1 must benchmark Floating-only CPU/RAM. Native Win32/WinUI Floating overlay remains a measured fallback only. The architecture remains a proposal subject to validation, as defined in `AGENTS.md`.

## UI/UX direction

- same compact modern dark/light character;
- screenshot-calibrated hierarchy/density;
- no hover layout shift;
- up to two-line Focus task titles where practical;
- full-title access;
- stable action targets;
- accessible tooltips/focus;
- tabular timer numerals;
- short finite micro-animations;
- reduced-motion;
- no persistent decorative animation in Floating Timer;
- resizable Notes;
- no surprise URL launch;
- Windows-locale dates/times;
- dynamic monitor recovery;
- safe persisted widget position.

Detailed states/motion/checklist are in `docs/UI_UX_SPEC.md`.

## Remaining non-blocking research gaps

Do not invent these until the relevant milestone requires a local choice:

1. exact original animation used by `Find focus timer`;
2. exact success-screen/GIF rotation behavior;
3. whether finishing a live task automatically starts the next eligible task or only selects it;
4. exact title mutation after EST suffix parsing;
5. exact original shutdown behavior during an active session;
6. exact mixed ordering policy for scheduled/manual Today tasks outside Focus Panel;
7. exact spoken content of embedded official YouTube videos, because transcripts were not retrievable in this research environment.

## Naming

The application name and repository name are both **Narro**. Current repository: `MariosGiannakaras/Narro`.

## Next executable work

Start `TODO.md` Milestone 1: build the minimal Windows Tauri scaffold and prove two-webview behavior, dynamic displays, native capabilities, SQLite migration path and real Floating Timer resource profile before product UI implementation.





