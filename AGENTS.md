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
- `docs/RESEARCH_EVIDENCE.md` for supplied screenshots/video evidence, visual evidence and source precedence;
- `docs/BLITZIT_VIDEO_EVIDENCE.md` for user-supplied recordings/transcripts, timestamped interaction/motion findings and their dispositions;
- `docs/SOURCE_AUDIT.md` for exhaustive Help Center page-by-page research, official videos, roadmap, bug reports and public user-feedback synthesis.
- `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` for the mandatory finding→implementation disposition of parity, video, Help Center, UI/UX and reliability findings.

## Audit incorporation rule

A previously validated milestone is not permission to ignore stronger evidence discovered later.

Before implementing an affected surface, inspect `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`:
- if the surface has a `FIX_NOW` finding, correct and validate that narrow discrepancy before unrelated forward work;
- if the finding is routed to a later milestone, ensure it is represented in that milestone's TODO and do not front-run it;
- if evidence is ambiguous, do not misrepresent inference as confirmed Blitzit behavior. First exhaust the relevant available evidence; if the exact source detail remains unknowable and implementation cannot reasonably remain blocked, make the strongest professional product/design/engineering decision consistent with the evidence, Narro's established visual/interaction language, Windows desktop conventions, accessibility, and the surrounding Blitzit experience. Record material inferred decisions explicitly;
- if it is an intentional Narro deviation, preserve the documented reliability/accessibility/agency improvement;
- when new material evidence is discovered, update the crosswalk and roadmap before continuing implementation based on older assumptions.

This prevents repeated implementation/rework while preserving the ordered **mandatory** 10-milestone roadmap. Optional Milestone 11 is a separately user-activated extension defined in `docs/BLITZIT_LIVE_REFERENCE_AUDIT.md`; while dormant/skipped it does not alter the mandatory roadmap, progress denominator, or continuation order.

If M11 is explicitly activated, its live Blitzit work is evidence acquisition first, not implementation. The full planned user-visible + observable protocol/state corpus must be captured and frozen before substantive analysis; the full corpus must then be analyzed/reconciled and a remediation plan frozen before Narro source/config/test changes begin. Do not convert an interesting live observation directly into a patch during capture.

## Source-forensics consumption rule

Use `docs/EVIDENCE_ROUTING_MAP.md` to discover the authoritative evidence chain, then use `docs/BLITZIT_PARITY_RECONCILIATION_WORKFLOW.md` whenever new Blitzit analysis exists or an affected user-visible surface is being implemented.

Do not re-analyze every original image/video during implementation. `SOURCE_COMPLETE` Pass-3 records are the normal requirements input. Re-open raw evidence only for a material ambiguity/conflict, an uncaptured detail exposed by implementation, or direct final visual verification. A direct final screenshot/video comparison is verification against the source, not a second research pass.

New source findings must pass through a reconciliation step before the affected surface is considered parity-complete: canonical finding -> static visual calibration where applicable -> current implementation comparison -> audit-crosswalk disposition -> affected milestone/tracking -> implementation/validation. Backend/domain/API work that does not prejudge an unfinished visual surface may continue while related source analysis is still open; final user-visible parity may not.

For stable screenshot-backed states, use `docs/BLITZIT_VISUAL_CALIBRATION_PLAN.md` / tracker before claiming `SOURCE_PARITY_PASS`. Physical Windows validation proves native behavior only unless it explicitly includes the relevant canonical Blitzit comparison.

## Evidence is guidance, not an oracle

The repository specifications are a researched starting point. They are not assumed to be infallible, complete, or the only valid way to implement the product.

Distinguish three levels:

1. **Requirements and invariants** — binding unless the user explicitly changes them. Examples: personal/local-only Windows scope, no auth/cloud/telemetry, data-integrity rules, timer/session correctness, explicit user decisions, and the core planning-to-focus product loop.
2. **Observed Blitzit behavior and visuals** — the default fidelity target for every in-scope user-visible surface. Narro is a personal/local reconstruction of the evidenced Blitzit desktop experience: confirmed layout, visible copy, hierarchy, spacing, states, interaction flow, sequencing, motion character and product behavior should match the strongest available Blitzit evidence as closely as practical.
3. **Current proposals** — architecture sketches, library choices, schema details and implementation mechanics that are not themselves user-visible source behavior. These remain strong defaults, not immutable truths.

Do **not** redesign, simplify, restyle or otherwise "improve" an evidenced Blitzit user-visible behavior merely because another treatment seems preferable. A user-visible deviation is permitted only when it is required by the explicit local-only scope, prevents a documented source reliability/data-integrity failure, is necessary for accessibility/Windows-platform correctness, or the source evidence is genuinely ambiguous or technically impossible to reproduce safely. Every material deviation must be explicit in the audit crosswalk/STATUS with its evidence and rationale.

Implementation internals may differ freely where needed for local-only correctness, performance and maintainability, provided the observable in-scope experience remains maximally faithful to Blitzit and the internal change does not introduce an unexplained user-visible deviation.

A materially different durable decision must be recorded in `STATUS.md` with the reason and relevant validation. Do not change major architecture or confirmed product semantics silently.

## Source and decision precedence

### Maximum observable parity rule

The user's current product direction is to reproduce the in-scope Blitzit desktop product as closely as the available evidence permits, while keeping Narro local and personal-use oriented. Treat confirmed Blitzit behavior/visuals as the default answer, not as optional inspiration.

"Exact" means **maximum observable parity from evidence**, not copying unavailable backend infrastructure or deliberately recreating defects. Where evidence is incomplete, preserve the distinction between confirmed behavior and inference, but do not leave ordinary implementation decisions unresolved indefinitely. After exhausting relevant evidence, choose the best professional reconstruction: use the strongest evidence, established UX/UI and engineering practice, Narro's existing design system, Windows desktop conventions, accessibility, and neighboring evidenced Blitzit patterns so the result feels native to the same product rather than like a separate redesign.

When evidence disagrees, investigate rather than mechanically applying a hierarchy. Use this order as a default:

1. latest explicit user instruction
2. current supplied direct recordings and screenshots — recordings are strongest for interaction/motion/transient-state evidence; screenshots are strongest for static visual detail
3. current official Blitzit documentation/material for behavior intent
4. older supplied public-review screenshots
5. public reviews/feature-board comments for corroboration, bug evidence or UX-friction evidence only
6. inference

For supplied recordings, distinguish what is directly visible/audible from transcript/narration claims and from inference; use `docs/BLITZIT_VIDEO_EVIDENCE.md` for timestamped classification and disposition.

This precedence does **not** mean higher-ranked sources are automatically correct implementations for Narro. Current Blitzit can contain bugs and documentation can lag the product. Resolve meaningful conflicts using the evidence, the project goals and implementation validation.

Never silently convert inference into confirmed behavior. When exact source behavior cannot be established, make a reasoned professional decision rather than an arbitrary guess: prefer consistency with adjacent evidenced Blitzit behavior, established desktop UX patterns, accessibility, reliability and Narro's existing design system. Record material implementation choices that are not confirmed Blitzit behavior as Narro design decisions in `STATUS.md`.

### Tracking unobserved Blitzit behavior before implementation

An unobserved source interaction is **not** a validated Blitzit specification. **2026-10-09 user decision:** when hidden/underlying Blitzit functionality is unknown, the implementation agent owns the decision and must implement the best coherent, deterministic, local-first user behavior, with clear state ownership, accessibility, safety and tests; do not defer ordinary functional decisions to the user or M11. For unknown calculations, explain and test a Narro-local rule rather than passing it off as verified Blitzit internals. Never alter a proven timer ledger, destructive/irreversible/data-domain invariant on mere speculation. **Unknown source-visual detail is reserved for optional, explicitly activated M11 Blitzit physical comparison, not a prerequisite to ordinary functional implementation or consolidated Narro Windows checks.** This does not authorize starting M11 early. Record every material inference, source-version conflict and approved Narro-specific exception in the appropriate `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` row and `docs/BLITZIT_UNVERIFIED_BEHAVIOR_REGISTER.md`, stating separately **implemented/CI-validated** versus **Blitzit behavior/source parity OPEN**. The register is a future physical-comparison index requested by the user, **not** M11 activation or its capture plan. **Lock the user-approved final Create/Edit List Spectrum Core design** (color picker, image upload and 218 offline icons) as Narro-specific product behavior and appearance; **do not replace or modify it to match Blitzit** unless explicitly requested. Only repair directly demonstrated regressions while preserving the approved UX.

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

The current selected window model has three Focus presentations but exactly **two normal runtime webview windows**:

- `main`
- one persistent `focusSurface`

Within `focusSurface`, Focus Panel, compact Timer and expanded Timer are **React presentations/components of the same host**, selected by one serialized presentation coordinator. Treat "Single-Activity Architecture" only as an analogy for one persistent host with dynamic component toggling; it is not an Android Activity requirement and does not mean the whole desktop app must use one window.

For ordinary Panel ↔ Timer and compact ↔ expanded changes:
- do not create/destroy a Focus/Timer WebView;
- do not switch between separate persistent Focus windows;
- do not hide/show the `focusSurface` as the presentation-switch mechanism;
- do not resize the HWND/WebView as the normal mode-switch mechanism;
- keep the same Focus HWND/WebView identity and use React presentation state plus DPI-aware native region/position/topmost/taskbar coordination;
- keep the outgoing presentation available until the incoming presentation has authoritative data and is render-ready; do not rely on `display:none` or unmount-first switching for prepaint;
- inactive/preparing content must be non-interactive and absent from keyboard/accessibility navigation;
- one shared coordinator/projection owns mode sequencing and authoritative subscriptions; presentation components must not create competing timer/session authorities.

The `focusSurface` may be shown when entering Focus and hidden when Focus is genuinely exited; that lifecycle is distinct from Panel/Timer component toggling. A different persistent-window composition is no longer an ordinary implementation option for this corrective program. Reconsider it only if the single-host replacement is proven technically insufficient by exact-build evidence and the architecture decision is explicitly reopened and documented.

### Main-window lifecycle

If the main window is closed while tray reminders or an active focus session must continue, it may be destroyed and recreated on demand instead of being kept invisibly alive. UI state required after recreation must therefore be derivable from durable/domain state rather than hidden renderer memory.

This is a performance proposal, not a product requirement. Keep the simpler lifecycle if measurements show destruction/recreation adds complexity without worthwhile savings.

### Floating Timer performance

The Floating Timer is a performance-sensitive surface.

Current implementation guidance:

- Use the same persistent `focusSurface` WebView for Focus Panel and Floating Timer; ordinary presentation changes are component/region changes, not WebView lifecycle changes.
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
- Do not invent one-off visual values when source detail is incomplete. Derive ordinary components from the calibrated Blitzit visual system (`docs/BLITZIT_VISUAL_SYSTEM.md`) and use professional Windows/accessibility/design conventions only as fallback. Targeted pixel measurement is reserved for distinctive/signature treatments or structural geometry where it materially improves parity.
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

### Reuse physical Windows evidence across open gates

Before and after every physical Windows session/capture, inspect current `TODO.md`, `HANDOFF.md`, and `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md` for all open validation-only or source-parity gates in M1–M9. Maintain a session evidence matrix and disposition each gate that the same recording/screenshots actually exercise sufficiently, including already-implemented surfaces from other milestones. Record exact executable/source, exercised states and evidence pointers; a surface merely appearing does not establish PASS. Preserve insufficiently exercised gates as open. Do not start unrelated implementation simply because a surface appeared in the capture.

### Efficient physical evidence acquisition

For ordinary M1–M10/Final-Review interactive Windows validation, choose the **most reliable evidence method for the scenario**. This may be OBS/video, Computer Use, screenshots, native/UIA probes, diagnostic logging, purpose-built capture tooling, or a combination. No specific recorder or tool is mandatory.

Before a substantial interactive session, prepare the intended acceptance matrix and likely action sequence so compatible checks can be exercised together and repeated setup is minimized. Prefer paired/related observations back-to-back under the same state/context when that improves comparability.

When using continuous screen/video capture:
- keep the recorded interval focused on the interactions, transitions and waits being validated rather than prolonged unrelated source inspection or idle debugging;
- where practical, defer deep source reading, root-cause analysis and Narro edits until after the useful capture segment;
- mark possible defects with a timestamp/bookmark or short factual note so the remaining independent observations can continue;
- allow necessary intermediate probes, capture-health checks, tool changes, state inspection or adaptive diagnostic steps when they materially improve evidence quality, are required to preserve/recover the scenario, or are needed to decide the next safe action;
- stop/restart or switch capture methods freely when that produces clearer or more trustworthy evidence.

After a useful capture segment, analyze the relevant video/screenshots/logs together and batch compatible evidence-backed corrections where practical. Do not turn this efficiency guidance into a rigid choreography that weakens validation, hides causal information, or prevents a better diagnostic method.

Prefer information-dense evidence and minimal repeated setup, not artificially short recordings. Performance measurements that require quiet/non-recording conditions remain separate protocols.

Optional M11 is intentionally stricter: if activated, it follows its dedicated whole-campaign **capture/freeze -> analysis -> reconciliation -> remediation** phase separation in `docs/BLITZIT_LIVE_REFERENCE_AUDIT.md`.

M10 may reuse this evidence later, but no M10 checkbox/counter advances before its hard entry gate clears. Explicitly tell the user when all required M1–M9 implementation and acceptance gates are complete before proceeding to M10.

### Repeated-failure escalation

Keep an evidence history for any acceptance failure that recurs: exact source/build, environment, reproduction steps, observed frames or state, attempted mechanism, and what the attempt actually proved. Distinguish the same failed acceptance criterion from a genuinely identical visual symptom; do not call a new symptom a recurrence without evidence.

If the same acceptance criterion still fails on two separately corrected, CI-validated builds that were physically tested, stop making successive small fixes to the same mechanism. Reassess the whole failure path and the underlying window/rendering composition. Compare at least one materially different, scoped solution against the current approach using the same physical acceptance capture and relevant correctness/performance measures. Record the alternatives, tradeoffs and decision in `STATUS.md`/`TODO.md` before more implementation. Do not claim a fix from CI, static screenshots, or a single sampled frame when continuous physical behavior is the criterion. A framework-wide migration requires evidence that a narrower alternative is insufficient.

### Cross-milestone replacement rule

A corrective slice in a later milestone may replace implementation foundations that were originally created and validated in an earlier milestone when current evidence requires it. When the replacement changes the implementation that materially supported an earlier milestone's acceptance, **reopen the affected earlier milestone/items** until the replacement is validated. Do not preserve a completed counter merely because the superseded implementation once passed.

Keep historical PASS evidence as immutable proof of the old implementation; never rewrite history or treat that evidence as validation of replacement code. Reopen only the materially affected scope, not unrelated items. Record the dependency/acceptance map in `TODO.md` or the active implementation plan, update roadmap counters to current truth, and validate the replacement in dependency order against every affected earlier invariant plus the newer corrective criteria. If a later milestone is already partially implemented and the replacement directly changes its integration path, reopen those affected later items too. Do not broaden the rewrite into unrelated milestones unless a direct dependency is demonstrated.

## Git discipline

- Preserve unrelated user changes.
- Avoid destructive Git operations.
- Work in coherent milestones.
- For long milestones, checkpoint after a working validated slice.
- Use clear commits describing completed slices.
- **Authoritative documentation/process/tracking/evidence-only changes go directly to `main` without Windows CI** when they do not alter executable/build/test/CI semantics. Markdown is path-ignored by CI; non-Markdown evidence-only commits use `[skip ci]`. Do not strand newer `HANDOFF`/`TODO`/`STATUS`/spec/evidence truth on a feature branch.
- Workflow YAML, scripts/tests, runtime/build configuration, dependency manifests and any file consumed by tooling are not "docs-only" and still require normal source validation.
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
