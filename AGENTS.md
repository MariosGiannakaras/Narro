# AGENTS.md

## Purpose

This file contains durable implementation rules for Narro. Keep changing progress in `STATUS.md` and `TODO.md`; do not turn this file into a changelog.

## Start-of-task procedure

Before making changes:

1. Read `STATUS.md` and `TODO.md`.
2. Read only specification sections relevant to the current milestone.
3. Inspect current Git state, existing implementation, tests, and applicable repository instructions.
4. Do not repeat the original Blitzit research by default. Re-open original sources only when the current milestone is ambiguous, a source conflict matters, new evidence exists, or current platform/framework behavior needs verification.

Use:

- `docs/REFERENCES.md` as the compact direct-link index and guidance for re-checking original sources;
- `docs/RESEARCH_EVIDENCE.md` for supplied screenshots, visual evidence and source precedence;
- `docs/SOURCE_AUDIT.md` for exhaustive Help Center page-by-page research, official videos, roadmap, bug reports and public user-feedback synthesis.

## Evidence is guidance, not an oracle

The repository specifications are a researched starting point. They are not assumed to be infallible, complete, or the only valid way to implement the product.

Distinguish three levels:

1. **Requirements and invariants** — binding unless the user explicitly changes them. Examples: personal/local-only Windows scope, no auth/cloud/telemetry, data-integrity rules, timer/session correctness, explicit user decisions, and the core planning-to-focus product loop.
2. **Observed Blitzit behavior and visuals** — fidelity evidence. Preserve the recognizable workflow and experience, but do not blindly reproduce source bugs, obsolete behavior, accidental limitations, or implementation compromises.
3. **Current proposals** — architecture sketches, library choices, schema details, dimensions, timings, interaction mechanics and other implementation recommendations. These are strong defaults, not immutable truths.

Codex may choose a better implementation or UX treatment when it has concrete evidence that the alternative is simpler, more reliable, faster, lighter, more accessible, or better suited to Windows while preserving the intended behavior and visual character.

A materially different durable decision must be recorded in `STATUS.md` with the reason and relevant validation. Do not change major architecture or confirmed product semantics silently.

## Source and decision precedence

When evidence disagrees, investigate rather than mechanically applying a hierarchy. Use this order as a default:

1. latest explicit user instruction
2. current supplied screenshots for visible state/layout
3. current official Blitzit documentation/material for behavior intent
4. older supplied public-review screenshots
5. public reviews/feature-board comments for corroboration, bug evidence or UX-friction evidence only
6. inference

This precedence does **not** mean higher-ranked sources are automatically correct implementations for Narro. Current Blitzit can contain bugs and documentation can lag the product. Resolve meaningful conflicts using the evidence, the project goals and implementation validation.

Never silently convert inference into confirmed behavior. Record necessary implementation choices that are not confirmed Blitzit behavior as Narro design decisions in `STATUS.md`.

A planned or requested Blitzit feature is not automatically a Narro requirement. Post-parity ideas recorded in `docs/SOURCE_AUDIT.md` stay out of implementation until the ordered parity/reliability milestones pass or the user explicitly changes scope.

## Platform and scope

Narro is a **personal, local-only Windows desktop application**. Target Windows 10/11 x64 first. Do not spend implementation effort on macOS, Linux, mobile, or cross-platform abstractions unless the user later changes scope.

Do not add:

- accounts/login/auth/remote identity
- cloud backend, cloud sync, hosted APIs, remote databases
- subscriptions, payments, licenses, trials, upgrade prompts
- collaboration or multi-user concepts
- telemetry or analytics sent off-device
- AI/Blitzy features
- remote integrations/webhooks/calendar sync
- voice transcription that sends audio to a service

Allowed local OS functionality includes notifications, tray/background lifecycle, autostart, explicitly opening user-selected URLs, local file selection, and installers.

## Selected starting architecture

Current best starting point:

- Tauri 2 desktop shell
- React + TypeScript frontend
- Rust for authoritative domain/runtime state and native coordination
- SQLite for durable local persistence with migrations
- Windows WebView2 supplied by the OS/runtime

This architecture was selected for the current requirements, especially the lightweight always-on-top focus surface. It is **not an untouchable conclusion**.

Milestone 1 exists partly to validate this choice. If measured Windows behavior exposes a concrete blocker or a clearly better architecture, Codex may evaluate and adopt a different approach after documenting the evidence and updating `STATUS.md`, `README.md`, `TODO.md`, and the affected architecture rules before broad implementation proceeds.

The current proposed window model has three visual presentations but normally only **two webview windows**:

- `main`
- `focusSurface`, which changes between Focus Panel and Floating Timer modes

Do not create separate persistent Focus Panel and Floating Timer webviews merely because the source product presents them separately. The intent is one active focus session with low floating-window overhead. If a different window composition proves measurably better without state divergence or resource regression, it may replace this proposal with the same documented-decision process.

### Main-window lifecycle

If the main window is closed while tray reminders or an active focus session must continue, it may be destroyed and recreated on demand instead of being kept invisibly alive. UI state required after recreation must therefore be derivable from durable/domain state rather than hidden renderer memory.

This is a performance proposal, not a product requirement. Keep the simpler lifecycle if measurements show destruction/recreation adds complexity without worthwhile savings.

### Floating Timer performance

The Floating Timer is a performance-sensitive surface.

Current implementation guidance:

- Prefer the same `focusSurface` webview when switching between full Focus Panel and Floating Timer.
- Load a dedicated minimal frontend entry/route for the focus surface; do not import dashboard, reports, archive, or settings code into its initial bundle.
- Avoid heavyweight animation/chart/editor libraries in the floating surface.
- Do not poll SQLite or perform writes every timer tick.
- Renderer refresh frequency must not determine timer correctness.
- Keep idle work near zero; no background animation loops when content is static.
- Measure process memory/CPU in Milestone 1 before adding product UI.
- Re-measure after final Floating Timer UI is implemented.
- A native Win32/WinUI overlay is a valid measured fallback if WebView2 overhead or window behavior is materially unacceptable.

Do not optimize architecture from assumption alone. Measure first, then choose the simplest solution that meets the product and performance goals.

## Timer and session correctness

Timer behavior is correctness-critical.

- Never treat a UI `setInterval` counter as authoritative elapsed time.
- Store timestamps and accumulated durations; derive displayed time from them.
- Use monotonic time while the process is alive so wall-clock changes do not corrupt live sessions.
- Persist enough state to recover from process interruption.
- On restart, restore an interrupted live session paused unless later evidence establishes a better local behavior; do not count app downtime as work without an explicit decision.
- Work and break sessions must be distinguishable in persistence/reports.
- Switching Focus Panel/Floating Timer must not start, stop, duplicate, or reset a session.
- Switching live tasks closes one work segment and opens another without losing accumulated Time Taken.
- Pausing stops work-time accumulation.
- EST and Time Taken edits for a live task are allowed only while paused unless a later validated UX intentionally changes that rule.
- Pomodoro overrides EST for displayed countdown while actual work time remains tracked.
- EST expiry enters an explicit `Time's Up` state with Extend/Done/Switch behavior before any optional future auto-overtime preference.
- Never keep the only authoritative Time Taken value in renderer memory.

Every timer transition needs unit tests with controlled time. Include explicit regression coverage for completion after a live session so tracked time can never silently become `00:00`.

## Scheduling correctness

- Use the Windows user's configured local timezone.
- Distinguish date-only schedules from schedules with a specific local time.
- Week boundaries start Monday.
- Scheduled tasks are classified into Backlog / This Week / Today according to local date.
- Tasks scheduled for a future time today are not eligible to auto-start until due.
- Recurrence generation must be deterministic and idempotent.
- Recurring parent/child relationships, Replace Existing Tasks, and detachment semantics should follow the recorded product behavior unless a better local representation preserves the same user-visible result more reliably.
- No server exists to materialize recurrence/reminders while the process is stopped; catch up safely on launch/resume.
- Use tray/background runtime for due reminders while Narro is running unless a more reliable native Windows scheduling mechanism is adopted and validated.
- Never create duplicate recurrence instances during repeated startup/date-boundary processing.
- Date/time text follows Windows locale by default, including the system 12/24-hour convention.

Tests must cover DST, Monday/week boundaries, timezone changes, repeated startup, missed days, and moving scheduled tasks between lanes. A schedule/reorder operation must never clone a task identity.

## Persistence and identity invariants

- SQLite is the current durable-storage choice; persistence must remain fully local and transactional even if the implementation later adopts a different local storage mechanism for a concrete reason.
- Use migrations/versioning from the first durable schema.
- Keep database access behind domain services rather than scattering raw storage operations through React components.
- Avoid unsafe absolute asset paths when an app-data-relative copied asset is appropriate.
- Preserve user data across application upgrades.
- Permanent deletion must be explicit and confirmed.
- Archiving remains reversible until permanent deletion.
- Historical report/session data survives normal list archival.
- Permanently deleted tasks are removed from user-facing reports, matching current official Blitzit delete semantics unless a later explicit Narro decision intentionally preserves anonymized history.
- A successful create/move/edit is durably committed before the UI presents success.
- Reorder changes position only; it must never create/delete/alias task identities.
- Duplicate creates a new task identity and independent editable copy.

## URL and Notes behavior

Current official Help Center text says task-note URLs may auto-open when a task goes live, but Blitzit's public roadmap later lists that automatic opening as a resolved bug.

Narro resolves the conflict as follows:

- URLs render as clickable links.
- Opening a URL requires an explicit user action.
- Entering Blitz Mode or switching the live task never launches all note URLs automatically.
- Do not fetch remote previews by default.
- Notes retain compact inline access in Focus Mode and also support a larger/resizable editing presentation.
- Use WebView/browser spellcheck where practical; do not build a custom spelling service without need.

## Windows display/window correctness

- Floating Timer must be movable and always on top in the normal Windows desktop scenarios we can support reliably.
- Focus Panel monitor and left/right positioning must work on Windows multi-monitor setups.
- Treat monitor topology as dynamic: listen/recompute when displays connect, disconnect, wake, sleep, or change scaling/resolution.
- Validate saved positions against current work areas; recover off-screen windows automatically.
- Persist the Floating Timer's last safe position when doing so remains robust across topology changes.
- Validate always-on-top behavior over normal maximized and borderless full-screen applications. Do not promise overlay over exclusive full-screen modes if Windows/the target application prevents it.

Implementation mechanism is flexible: use the simplest reliable Windows/Tauri/native API combination rather than copying source-product limitations.

## UI implementation rules

- Reproduce the source structure, hierarchy, density, and interaction intent rather than designing a generic task manager.
- Pixel-perfect copying is not the goal when it would reduce readability, accessibility, Windows-native behavior, performance, or maintainability.
- Screenshot pixel dimensions are reference evidence for proportions, not hard CSS dimensions; support Windows DPI scaling.
- Support system, dark, and light themes.
- Do not copy Blitzit branding assets or account/paid UI; use Narro branding and local equivalents.
- Remove excluded cloud controls rather than showing dead imitations.
- Keep Focus Panel and Floating Timer deliberately compact.
- Focus task titles may use up to two lines where the compact layout permits; expose the full title through an accessible tooltip/detail mechanism.
- The optional scrolling live title applies to the active/live presentation, not every ordinary task row.
- Keyboard navigation/focus states must remain usable.
- Icon-only actions need accessible labels and tooltips where their meaning is not obvious.
- Pointer-hover affordances must have keyboard/focus-visible equivalents when meaningful.
- Focus/Blitz action buttons must never move under the pointer when they reveal labels/actions; public feedback explicitly reports this as frustrating source UX.

The UI spec's dimensions, colors, durations and easing values are calibration targets. Codex may refine them through rendered comparison and interaction testing rather than treating them as exact source constants.

## Motion and interaction polish

Use `docs/UI_UX_SPEC.md` as the detailed motion reference. Durable intent:

- Motion is functional feedback, not decoration.
- No hover/focus animation may reflow task text, move sibling controls, or change row/card geometry.
- Reserve/overlay action-icon slots instead of inserting controls on hover.
- Prefer transform and opacity; avoid continuously animated gradients, large-area blur/backdrop-filter animation, and other persistent GPU/CPU work.
- Timer numerals use tabular figures and update discretely; do not animate every second transition.
- Domain state changes complete independently of animation. Animation must never own or delay completion, pause/resume, persistence, task switching, or focus-mode switching.
- Menus, tooltips, inline expansions, reorder/drop, completion, and focus/floating presentation changes use short one-shot transitions.
- Respect `prefers-reduced-motion`; reduced-motion mode retains state clarity without unnecessary translation/scale.
- The Floating Timer has the strictest animation budget. No infinite decorative animation is allowed there.

Exact timing/easing choices may be improved during implementation if the result remains restrained, responsive and performant.

## Windows shortcuts

Implement the confirmed shortcuts unless Windows refuses registration or a later explicit decision changes them.

Global:
- bring Narro to front: `Ctrl+Shift+B`
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

1. run the narrowest relevant domain tests first
2. run frontend component/interaction tests for affected UI
3. run integration smoke tests for affected native commands/events
4. manually validate Windows behavior when touching windows, shortcuts, tray, notifications, autostart, multi-monitor positioning, or packaging
5. for performance-sensitive window changes, measure floating-only idle CPU and memory rather than relying on assumptions
6. for screenshot-backed UI work, compare against the relevant fixtures in `docs/UI_UX_SPEC.md` and test normal, hover/focus, active, expanded and error/destructive states that apply
7. validate both normal motion and reduced-motion behavior for affected animated components
8. add regression tests for any applicable source-product pain point recorded in `docs/SOURCE_AUDIT.md`, especially tracked-time loss, duplicate/reorder corruption, scheduling/day errors and off-screen monitor placement
9. when deviating materially from a documented proposal, validate the alternative against the same acceptance intent and record the durable decision in `STATUS.md`
10. update `TODO.md` and `STATUS.md`
11. stop when milestone acceptance criteria pass

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

- intended product behavior and project scope are preserved
- persistence, task-identity, scheduling and timer invariants are respected
- tests for new domain behavior exist and pass
- affected Windows desktop behavior has been smoke-tested
- screenshot-backed UI states have been visually checked when applicable
- reduced-motion and keyboard/focus behavior are not regressed by visual polish
- performance-sensitive surfaces have no unexplained regression
- relevant known Blitzit reliability failures have explicit anti-regression coverage
- any material deviation from a recorded proposal is documented with rationale/validation
- no known regression is left undocumented
- `TODO.md` and `STATUS.md` reflect reality
