# AGENTS.md

## Purpose

This file contains durable implementation rules for MyBlitzit. Keep changing progress in `STATUS.md` and `TODO.md`; do not turn this file into a changelog.

## Start-of-task procedure

Before making changes:

1. Read `STATUS.md` and `TODO.md`.
2. Read only specification sections relevant to the current milestone.
3. Inspect current Git state, existing implementation, tests, and applicable repository instructions.
4. Do not repeat the original Blitzit research unless new evidence conflicts with the recorded specification or an unresolved item blocks implementation.

Use `docs/RESEARCH_EVIDENCE.md` as the evidence index.

## Source and decision precedence

When sources disagree:

1. latest explicit user instruction
2. current supplied screenshots
3. current official Blitzit documentation/material
4. older supplied public-review screenshots
5. public reviews/feature-board comments for corroboration or UX-friction evidence only
6. inference

Never silently convert inference into confirmed behavior. Record necessary implementation choices that are not confirmed Blitzit behavior as MyBlitzit design decisions in `STATUS.md`.

## Platform and scope

MyBlitzit is a **personal, local-only Windows desktop application**. Target Windows 10/11 x64 first. Do not spend implementation effort on macOS, Linux, mobile, or cross-platform abstractions unless the user later changes scope.

Do not add:

- accounts/login/auth/remote identity
- cloud backend, cloud sync, hosted APIs, remote databases
- subscriptions, payments, licenses, trials, upgrade prompts
- collaboration or multi-user concepts
- telemetry or analytics sent off-device
- AI/Blitzy features
- remote integrations/webhooks/calendar sync
- voice transcription that sends audio to a service

Allowed local OS functionality includes notifications, tray/background lifecycle, autostart, opening URLs, local file selection, and installers.

## Selected architecture

Use:

- Tauri 2 desktop shell
- React + TypeScript frontend
- Rust for authoritative domain/runtime state and native coordination
- SQLite for durable local persistence with migrations
- Windows WebView2 supplied by the OS/runtime

The product has three visual presentations but normally only **two webview windows**:

- `main`
- `focusSurface`, which changes between Focus Panel and Floating Timer modes

Do not create separate persistent Focus Panel and Floating Timer webviews. The active focus session belongs to Rust application state, not to a window.

### Main-window lifecycle

If the main window is closed while tray reminders or an active focus session must continue, it may be destroyed and recreated on demand instead of being kept invisibly alive. UI state required after recreation must therefore be derivable from durable/domain state rather than hidden renderer memory.

### Floating Timer performance

The Floating Timer is a performance-sensitive surface.

- Use the same `focusSurface` webview when switching between full Focus Panel and Floating Timer.
- Load a dedicated minimal frontend entry/route for the focus surface; do not import dashboard, reports, archive, or settings code into its initial bundle.
- Avoid heavyweight animation/chart/editor libraries in the floating surface.
- Do not poll SQLite or perform writes every timer tick.
- Renderer refresh frequency must not determine timer correctness.
- Keep idle work near zero; no background animation loops when content is static.
- Measure process memory/CPU in Milestone 1 before adding product UI.
- A native Win32/WinUI overlay is a fallback only if measured WebView2 overhead is materially unacceptable. Do not introduce hybrid native UI speculatively.

## Timer and session correctness

Timer behavior is correctness-critical.

- Never treat a UI `setInterval` counter as authoritative elapsed time.
- Store timestamps and accumulated durations; derive displayed time from them.
- Use monotonic time while the process is alive so wall-clock changes do not corrupt live sessions.
- Persist enough state to recover from process interruption.
- On restart, restore an interrupted live session paused unless later evidence establishes another behavior; do not count app downtime as work.
- Work and break sessions must be distinguishable in persistence/reports.
- Switching Focus Panel/Floating Timer must not start, stop, duplicate, or reset a session.
- Pausing stops work-time accumulation.
- EST and Time Taken edits for a live task are allowed only while paused.
- Pomodoro overrides EST for displayed countdown while actual work time remains tracked.

Every timer transition needs unit tests with controlled time.

## Scheduling correctness

- Use the Windows user's configured local timezone.
- Week boundaries start Monday.
- Scheduled tasks are classified into Backlog / This Week / Today according to local date.
- Tasks scheduled for a future time today are not eligible to auto-start until due.
- Recurrence generation must be deterministic and idempotent.
- No server exists to materialize recurrence/reminders while the process is stopped; catch up safely on launch/resume.
- Use tray/background runtime for due reminders while MyBlitzit is running.
- Never create duplicate recurrence instances during repeated startup/date-boundary processing.

## Persistence

- SQLite is the durable source of truth.
- Use migrations from schema version 1.
- Keep database access behind Rust/domain services rather than scattering raw SQL through React components.
- Avoid unsafe absolute asset paths when an app-data-relative copied asset is appropriate.
- Preserve user data across application upgrades.
- Permanent deletion must be explicit and confirmed.
- Archiving remains reversible until permanent deletion.
- Historical report/session data must survive normal list archival.

## UI implementation rules

- Reproduce structure, hierarchy, density, spacing, and interaction states from the current screenshots rather than designing a generic task manager.
- Screenshot pixel dimensions are reference evidence for proportions, not hard CSS dimensions; support Windows DPI scaling.
- Support system, dark, and light themes.
- Do not copy Blitzit branding assets or account/paid UI; use MyBlitzit branding and local equivalents.
- Remove excluded cloud controls rather than showing dead imitations.
- Keep Focus Panel and Floating Timer deliberately compact.
- Floating Timer must be movable and always on top.
- Focus Panel monitor and left/right positioning must actually work on Windows multi-monitor setups.
- Focus task titles may use up to two lines where the compact layout permits; expose the full title through an accessible tooltip/detail mechanism.
- The optional scrolling live title applies to the active/live presentation, not every ordinary task row.
- Keyboard navigation/focus states must remain usable.
- Icon-only actions need accessible labels and tooltips where their meaning is not obvious.
- Pointer-hover affordances must have keyboard/focus-visible equivalents when meaningful.

## Motion and interaction polish

Use `docs/UI_UX_SPEC.md` as the detailed motion reference. Durable rules:

- Motion is functional feedback, not decoration.
- No hover/focus animation may reflow task text, move sibling controls, or change row/card geometry.
- Reserve/overlay action-icon slots instead of inserting controls on hover.
- Prefer transform and opacity; avoid continuously animated gradients, large-area blur/backdrop-filter animation, and other persistent GPU/CPU work.
- Timer numerals use tabular figures and update discretely; do not animate every second transition.
- Domain state changes complete in Rust independently of animation. Animation must never own or delay completion, pause/resume, persistence, task switching, or focus-mode switching.
- Menus, tooltips, inline expansions, reorder/drop, completion, and focus/floating presentation changes use short one-shot transitions defined in `docs/UI_UX_SPEC.md`.
- Respect `prefers-reduced-motion`; reduced-motion mode retains state clarity without unnecessary translation/scale.
- The Floating Timer has the strictest animation budget. No infinite decorative animation is allowed there.

## Windows shortcuts

Implement confirmed shortcuts unless Windows refuses registration.

Global:
- bring MyBlitzit to front: `Ctrl+Shift+B`
- alternate Focus Panel / Floating Timer: `Ctrl+Shift+T`
- locate/animate Floating Timer: `Ctrl+Shift+P`

In-app:
- create task: `Ctrl+Alt+T`
- start break: `Ctrl+Alt+B`
- pause/resume task: `Ctrl+Alt+P`
- skip task: `Ctrl+Alt+S`
- finish active task: `Ctrl+Alt+F`
- active-task notes: `Ctrl+Alt+N`
- search: `Ctrl+F` outside Blitz Mode

If a global shortcut cannot be registered because another application owns it, expose a local error/state rather than failing silently.

## Testing and validation

For each milestone:

1. run the narrowest relevant Rust/domain tests first
2. run frontend component/interaction tests for affected UI
3. run integration smoke tests for affected Tauri commands/events
4. manually validate Windows behavior when touching windows, shortcuts, tray, notifications, autostart, multi-monitor positioning, or packaging
5. for performance-sensitive window changes, measure floating-only idle CPU and memory rather than relying on assumptions
6. for screenshot-backed UI work, compare against the relevant fixtures in the `docs/UI_UX_SPEC.md` fidelity checklist and test normal, hover/focus, active, expanded and error/destructive states that apply
7. validate both normal motion and reduced-motion behavior for affected animated components
8. update `TODO.md` and `STATUS.md`
9. stop when milestone acceptance criteria pass

Do not perform unrelated cleanup or broad rewrites.

## Git discipline

- Preserve unrelated user changes.
- Avoid destructive Git operations.
- Work in coherent milestones.
- For long milestones, checkpoint after a working validated slice.
- Use clear commits describing completed slices.
- Keep status/TODO documentation current rather than deferring it to the end.

## Definition of done for an implementation milestone

A milestone is complete only when:

- behavior matches specification/evidence priority
- persistence and timer invariants are respected
- tests for new domain behavior exist and pass
- affected Windows desktop behavior has been smoke-tested
- screenshot-backed UI states have been visually checked when applicable
- reduced-motion and keyboard/focus behavior are not regressed by visual polish
- performance-sensitive surfaces have no unexplained regression
- no known regression is left undocumented
- `TODO.md` and `STATUS.md` reflect reality
