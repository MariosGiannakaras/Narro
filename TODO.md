# TODO.md

Milestones are ordered. Do not skip ahead unless a later task is required to unblock the current one.

## Milestone 1 — Windows desktop scaffold, capability and performance spike

Goal: prove the selected Tauri stack and lightweight focus-window architecture before product UI is built.

- [x] Create a Tauri 2 + React + TypeScript scaffold targeting Windows 10/11 x64.
- [x] Add Rust modules for app state, persistence, timers, scheduling, and window coordination.
- [x] Add SQLite plus migration harness; create migration `0001` even if the initial schema is minimal.
- [ ] Validate the replacement composition still uses only two initial webview windows: `main` and one persistent `focusSurface`; no third persistent Focus/Timer webview. Historical M1 PASS applies to the superseded implementation only.
  - [ ] Repository/runtime contracts contain no production `floatingTimer` window label, `timer.html` runtime entry, or split Focus/Timer capability/config expectation.
- [x] Prove programmatic create/show/hide/destroy/recreate/focus behavior for `main` without losing Rust/domain state (fixed 800x600 recreation geometry only).
  - [x] implementation compiles in Windows CI
  - [x] interactive hide/show/destroy and background state mutation validation
  - [x] interactive async recreate opens and remains responsive
  - [x] exact Rust state visibly survives and updates correctly in recreated `main`
- [ ] Validate Focus Panel, compact Timer and expanded Timer presentations inside the single persistent `focusSurface` replacement host.
  - [ ] Fixed nominal host uses the validated 340px product width: 340×700 Panel host/region, 340×110 compact region, 340×300 expanded region; the legacy 400px M1 scaffold width is not carried into product geometry.
  - [ ] One React root/coordinator owns committed/pending presentation state and shared authoritative projections; Panel/Timer are components, not independent window renderers.
  - [ ] Incoming presentation is prepared in the same WebView while outgoing content remains painted; preparing/inactive controls are inert and excluded from focus/accessibility navigation, without `display:none`/unmount-first prepaint.
  - [ ] Replacement implementation compiles in authoritative Windows CI.
  - [ ] Replacement interactive validation passes on Windows.
- [ ] Prove Panel ↔ compact Timer ↔ expanded Timer switching on the same persistent secondary WebView using the replacement fixed-host/native-region model, without creating parallel Focus webviews, resetting state, or routinely resizing the HWND/WebView for ordinary presentation changes.
  - [ ] Ordinary presentation switching preserves the same Focus HWND/WebView identity and does not use Focus create/destroy/close/open/hide/show/host-resize as the switch mechanism; show/hide is reserved for entering/exiting Focus itself.
  - [ ] Native region/position/topmost/taskbar changes and renderer presentation commit form one serialized, rollback-safe state machine.
  - [ ] Replacement implementation compiles in authoritative Windows CI.
  - [ ] Replacement interactive Panel -> Timer -> Panel same-HWND/WebView reuse validation passes.
- [ ] Revalidate always-on-top and skip-taskbar behavior for Floating Timer presentation on the replacement single Focus host.
- [ ] Revalidate Windows monitor enumeration and left/right positioning for Focus Panel presentation on the replacement fixed host.
  - Historical evidence: the superseded host passed implementation/geometry tests and physical selected-monitor left/right validation; this does not validate replacement geometry.
  - [ ] Replacement automated geometry validation passes.
  - [ ] Replacement physical selected-monitor left/right validation passes.
- [ ] Revalidate display-topology change handling for the replacement host: connect/disconnect/re-enumerate displays, recompute visible-region geometry/DPI, and keep the visible Focus presentation inside an available work area without restarting Narro.
  - Historical evidence: the superseded host passed event-driven topology tests and physical disconnect/reconnect recovery; this does not validate replacement region/DPI recovery.
  - [ ] Replacement automated topology/DPI/work-area recovery validation passes.
  - [ ] Replacement physical disconnect/reconnect recovery validation passes.
- [x] Prove global shortcut registration and conflict/error handling.
  - [x] native registration/unregistration/conflict implementation and Windows CI validation
  - [x] physical shortcut validation
- [x] Prove tray/background lifecycle plus explicit Quit.
  - [x] tray/background/recovery/Quit implementation and Windows CI validation
  - [x] physical tray/background/recovery/Quit validation
- [x] Prove local Windows notification delivery while process remains running.
  - [x] Rust notification delivery path and Windows CI validation
  - [x] physical visible Windows notification validation from installed build
- [x] Prove Windows autostart can be toggled locally and launches Narro after Windows restart/sign-in.
  - [x] status/enable/disable implementation, idempotence/state verification and Windows CI validation
  - [x] physical enable/disable registration observed in Windows Task Manager Startup apps
  - [x] actual autostart launch observed after a real Windows restart; `main` opened normally after sign-in
- [ ] Revalidate the consolidated `focusSurface` frontend entry/bundle remains Focus-only and does not pull dashboard/reports/settings/editor code after Panel/Timer coordination is combined.
- [ ] Re-measure replacement floating-only steady-state CPU and process memory with the main webview destroyed/closed and no active animations.
  - Historical baseline evidence: the process-tree harness was automated-validated by Windows CI #66 and the superseded composition completed three valid physical 30s-warmup / 60s-sample runs with zero process churn and `steadyStateValid: true`.
  - [ ] Replacement composition completes the same repeatable process-tree measurement protocol with valid steady-state samples.
- [ ] Record the replacement composition measurements and obvious WebView2/process contributors in `STATUS.md`.
- [ ] Reconfirm the M1 floating performance baseline supports the replacement single-`focusSurface` Tauri + WebView2 composition; if clearly unacceptable, evaluate the narrow native fallback from current evidence before proceeding.
- [x] Add a minimal smoke-test harness for Rust commands/events.
  - [x] harness created and compiles in Windows CI
  - [ ] explicit standalone interactive harness invocation remains optional/deferred; equivalent runtime paths were physically exercised during M1 validation

Acceptance criteria:

- `main` and `focusSurface` both project the same authoritative Rust application state
- Focus Panel -> Floating Timer -> Focus Panel does not create parallel secondary webviews or reset state
- ordinary Focus presentation changes preserve one `focusSurface` HWND/WebView identity and use component/region switching rather than Focus WebView hide/show/create/destroy/resize
- Floating Timer remains above normal Windows apps and can be moved
- Focus Panel can move to selected monitor edge
- display connect/disconnect does not require app restart and cannot strand the focus surface off-screen
- one confirmed global shortcut registers and fires
- tray/background lifecycle, notification, and autostart registration/toggling/restart launch work locally
- SQLite migration v1 runs cleanly on a fresh app-data directory
- floating-only idle CPU is stable/near-idle with no unexplained polling loop
- floating-only memory is measured and documented; if clearly unacceptable, stop and evaluate a native Win32/WinUI overlay before product UI work

**Gate A current result: REOPENED for the single-Focus replacement.** Historical M1 Gate A PASS remains valid evidence for the superseded implementation, but the replacement changes the window/presentation foundation, DPI/topology path, Focus-only bundle composition and floating performance profile. Re-close Gate A only after the open M1 replacement items above are validated on the new code.

Do not implement polished Blitzit UI in this milestone.

## Milestone 2 — Domain model, identity invariants, and local persistence

Goal: establish durable task/list/session behavior before UI complexity.

- [x] Define IDs and schema for lists, tasks, subtasks, notes, recurrence rules, reminders, sessions, preferences, and archived entities.
- [x] Implement list CRUD, ordering, archive, restore, permanent deletion.
- [x] Implement task CRUD and planning transitions: Backlog / This Week / Today / Done.
- [x] Implement ordering within planning buckets as position changes on stable task identities.
- [x] Implement task duplication as a new independent identity/copy.
- [x] Implement EST, Time Taken, completion timestamp, scheduled date/time, recurrence metadata, and archive state.
- [x] Distinguish date-only schedules from schedules with a specific local time in the domain/schema.
- [x] Implement subtasks with ordering/completion state.
- [x] Implement rich-note storage using a constrained local document format.
- [x] Implement preferences and schema defaults.
- [x] Implement permanent-task-delete semantics so deleted tasks no longer appear in user-facing reports, matching current official behavior.
- [x] Establish a persistence-first create/edit/move success boundary; future UI state must update only after the resolved local mutation succeeds.
- [x] Add deterministic fixture builders for tests.
- [x] Add regression tests proving reorder/move cannot duplicate, alias, or silently delete task identities.
- [x] Add repeated reorder/move and scheduled-lane-move tests based on publicly reported source-product duplication/reorder failures.

Acceptance criteria:

- migrations are repeatable
- CRUD/reorder survive restart
- repeated reorder/move operations preserve task count and IDs
- duplicate creates exactly one new independent ID
- archive/restore preserves history
- permanent deletion is explicit, tested, and excluded from user-facing reports

**Gate B result: PASS / proceed to Milestone 3.** Domain/persistence invariants are automated-validated; product UI integration must preserve the persistence-first mutation boundary.

## Milestone 3 — Timer/session engine

Goal: implement correctness-critical runtime independently from UI.

Research context: before changing M3 behavior, consult `docs/BLITZIT_HISTORY_RISK_INDEX.md`. Tracked-time loss is a recurring Blitzit failure family through current 2026 reports; do not consider a visual timer test sufficient without durable session/Time Taken verification.

- [x] Implement session state machine: idle, running, paused, break, time-up/overtime.
- [x] Implement EST countdown mode.
- [x] Implement explicit `Time's Up` transition at EST expiry.
- [x] Implement Extend from `Time's Up`, preserving the same work runtime and exposing overtime.
- [x] Implement Done and Switch Task from `Time's Up` at the authoritative engine/runtime layer.
- [x] Implement Pomodoro countdown mode and automatic authoritative work -> break -> paused-awaiting-resume transitions.
- [x] Emit automatic Pomodoro break/finish notifications exactly once at authoritative boundaries, including late observation/recovery cases.
- [x] Implement the user-visible end-of-Pomodoro-break prompt/resume workflow per product specification once typed events/UI projection exist.
- [x] Implement count-up mode.
- [x] Track actual work duration independently of displayed countdown.
- [x] Make pause/resume idempotent.
- [x] Implement skip and finish timer/session transitions.
- [x] Persist session transitions/timestamps without per-second SQLite writes.
- [x] Prevent duplicate unfinished focus sessions at the database layer.
- [x] Keep break sessions distinct from work sessions and exclude break time from Time Taken.
- [x] Atomically replace the open session at work<->break and task-switch boundaries; rollback failed switches without publishing the candidate runtime.
- [x] Add durable runtime checkpoint/recovery and restore interrupted live sessions to the specified non-running state without counting process downtime as work. Cover running, paused, break, Time's Up, overtime and Pomodoro boundaries.
- [x] Couple task completion mutation and final timer/session close through one persistence-success boundary (transaction or equivalent safe coordination) so tracked work can never become `00:00` on Done.
- [x] Integrate paused manual Time Taken edits with the authoritative runtime/session baseline so resume/pause/Done cannot snap back, double-count or diverge from durable session totals.
- [x] Emit typed timer/session events consumed by both webviews; renderer/window lifecycle changes must remain presentation-only unless an explicit domain transition is requested.
- [x] Add persistence regression proving one pause/resume/finish path excludes paused wall time and combines pre/post-pause work.
- [x] Add source-derived pause/resume regression: 15m work -> pause -> wait -> resume -> 15m work -> Done = exactly 30m in durable Time Taken/session history; repeat across multiple pause cycles and recovery.
- [x] Add regression coverage for completing a live task after tracked work through the real task-completion mutation path: Time Taken must never reset to `00:00`.
- [x] Add crash/restart tests around running, paused, break, task-switch, Time's Up/overtime and Pomodoro transitions.
- [x] Define/test Windows sleep/resume behavior for no session/data loss. Default global policy excludes unattended sleep from Time Taken; global `count` is supported; each task can `inherit`, `exclude`, or `count`; the effective policy is snapshotted into the active focus session so later preference changes do not alter already-running work.
- [x] Add long-duration/large-elapsed safety coverage so very long sessions cannot overflow or corrupt timer/session state.

Acceptance criteria:

- timer correctness is tested with controlled/fake time
- UI refresh cadence cannot alter authoritative elapsed time
- persistence failure cannot publish an in-memory transition the database rejected
- restarting process does not count downtime as work
- pause/resume counts each running segment exactly once and every paused interval zero times
- paused manual Time Taken editing rebases the authoritative runtime deterministically
- task completion and task switching preserve all tracked Time Taken
- all timer modes produce coherent work/break session history
- renderer destruction/recreation or Focus Panel <-> Floating Timer presentation changes cannot reset/duplicate/advance a session
- no renderer owns irreplaceable timer/session state

**Gate C result: PASS / proceed to Milestone 4.** The timer/session engine, recovery, tracked-time durability, Pomodoro boundary effects, large-elapsed safety, and configurable Windows sleep/resume accounting are automated-validated on Windows. PR #35 exact head `a4582f5ea76737c8a5e01cb4e1c2cfb87a826159` passed Windows CI #192; squash merge `5eaf7f0eba1770112d41744377ea134ad5d41e33` passed main Windows CI #196.
## Milestone 4 — Scheduling, recurrence, reminders, eligibility

- [x] Implement Monday-based week classification.
- [x] Implement official scheduling shortcuts: Today, Later today (+2h), Tomorrow, Next week (+7d), custom date.
- [x] Classify scheduled tasks into Backlog / This Week / Today by Windows local date/timezone.
- [x] Prevent future-timed Today tasks from auto-starting before due time.
- [x] Preserve date-only schedule semantics without accidental timezone day shifts.
- [x] Implement one-off local reminders.
- [x] Implement recurrence presets and custom interval/unit/weekday rules documented in `docs/PRODUCT_SPEC.md`.
- [x] Implement recurring parent in Backlog and Monday-of-due-week child materialization.
- [x] Implement Replace Existing Tasks behavior.
- [x] Implement recurrence detachment semantics while preserving already modified independent children.
- [x] Make recurrence materialization idempotent on startup/resume/date change.
- [x] Add tray/background due-reminder processing while process is running.
- [x] Format visible dates/times using Windows locale/system 12/24-hour convention by default.
- [x] Add tests for DST, Monday/week boundaries, timezone changes, repeated startup, missed days, future-time eligibility and weekend/date-only behavior.
- [x] Add regression tests ensuring moving a scheduled task between lanes cannot duplicate/triplicate it.

Acceptance criteria:

- no duplicate recurring instances after repeated startup/resume
- recurrence replace/detach preserves documented child behavior
- due reminders work in tray/background mode
- task eligibility matches scheduling rules
- date-only tasks remain on the intended local calendar date
- scheduling/move operations never change task identity count

**Gate D result: PASS / proceed to Milestone 5.** The final installed-Windows acceptance on main CI #261 / artifact `9998653381` physically delivered reminder `91f217f6-abc3-4df3-a6cc-66e18a0fb046` due `2026-09-07 01:56` while Narro remained alive in tray/background mode, with no duplicate after more than one additional minute. Tray and Task Manager Narro icon identity also passed. The validated source/test baseline remains `c66558cdc3d3ab8f8ec0626c7897491625bb4ddd`.

## Milestone 5 — Design system and Main window product UI

Implement the screenshot hierarchy rather than an invented generic task manager.

### Shared visual foundation

- [x] Implement theme tokens for canvas/surfaces/borders/text/accent/success/warning/destructive states based on `docs/UI_UX_SPEC.md`.
- [x] Implement typography using Segoe UI Variable / Windows system fallbacks and tabular timer numerals.
- [x] Implement shared spacing/radius/elevation primitives.
- [x] Implement shared motion primitives and duration/easing tokens from `docs/UI_UX_SPEC.md`.
- [x] Implement `prefers-reduced-motion` behavior before adding component-specific animation.
- [x] Implement accessible tooltip/popover/menu primitives with stable geometry.
- [x] Establish a screenshot/visual-regression fixture harness for representative dark/light states.

### Main UI

- [x] App shell/navigation.
- [x] Home dashboard/list cards.
- [x] List-card rest, hover/Open, overflow-menu and create-list states.
- [x] Create/Edit List modal with icon import, color selection, title, cancel/create states.
- [x] List board with Backlog, This Week, Today, Done.
- [x] Task-card state model: normal, hover/action-revealed, scheduled, overdue, done, inline-create, notes-expanded, subtasks-expanded, paused/editable, destructive-confirm.
- [x] Drag/drop or equivalent reorder/move behavior with stable placeholder/drop animation.
- [x] Ensure hover actions use reserved/overlay slots and never reflow title/card geometry.
- [x] Task creation and inline editing.
- [x] EST and Time Taken display/edit states.
- [x] Scheduling UI and recurrence editor.
- [x] Subtasks UI.
- [x] Rich task notes editor/viewer with clickable URLs.
- [x] Require explicit click/keyboard activation to open note URLs; do not auto-launch links when entering focus.
- [x] Provide a larger/resizable Notes editing presentation in addition to compact inline focus access.
- [x] Use WebView/browser spellcheck where practical.
- [x] List settings: name, icon, archive/delete flows.
- [x] Search / quick-actions palette with keyboard-first behavior.
- [x] Archived lists/tasks surfaces.
- [x] Light/dark/system theme.
- [x] Remove all account/trial/upgrade/cloud/integration controls.

Acceptance criteria:

- all main-window states in `docs/UI_UX_SPEC.md` are reachable
- screenshot-backed fixtures cover Home dark/light, list hover/menu, create-list states, search, board/task states, archives and destructive confirmations
- no hover/focus interaction causes layout shift
- Notes can be comfortably edited on a large display without losing compact focus access
- URLs never launch merely because a task becomes live
- reduced-motion mode remains fully usable
- no dead controls exist for excluded features
- keyboard navigation remains usable

**Gate E result: PASS / proceed to Milestone 6.** All 28 ordered Milestone 5 items are validated on authoritative Windows CI. PR #100 exact head `db78e0d6adebd51ab9e56a81185e4dac0206d1c5` passed Windows CI #390; expected-head guarded squash merge `c89526dbc40742570d8d89353244add2d6350d2d` passed resulting-main Windows CI #391.

### 2026-09-26 parity/reliability reconciliation

- [x] Reconcile confirmed production omissions discovered after Gate E without redoing the validated M5 foundation:
  - [x] A1 List Duplicate: production wiring plus durable independent list/task identities.
  - [x] A2 Render persisted local list icons on active/archive list surfaces with safe fallback.
  - [x] A3 Top-of-lane `+` creates at highest priority atomically.
  - [x] A4 Normal task create accepts optional EST atomically using existing duration validation.
  - [x] A5 Main board task completion and explicit permanent-delete confirmation use validated persistence/session/report semantics.
  - [x] A6 Pointer/keyboard completion into Done without treating Done as a normal planning reorder lane.
  - [x] A7 Re-enable safe identity-based per-task edits in All Lists; aggregate reorder remains disabled.
  - [x] A8 Search matched-substring highlighting with unchanged keyboard/focus behavior.
  - [x] A9 Remove normal-main diagnostic JSON projection while preserving the user-facing Pomodoro resume prompt.
  - [x] A19 Done lane shows the documented local-month completion count.
  - [x] Evolve temporary static tests that encoded these earlier absences into final safety/product invariants.

**Gate E reconciliation result: PASS / proceed to the reopened Milestone 6 reconciliation gate.** PR #156 exact head `2cde42c10389c2417e1b6e356eae59150ebff8ce` passed Windows CI #539, including repository preflight, Rust checks/tests, Windows visual regression, Tauri release build, visual artifact `narro-m5-visual-regression`, and diagnostic harness artifact. Expected-head guarded squash merge `4e315f551737d729f76e5f561dd8d7404717e157` passed resulting-main Windows CI #540 through the repository's identical-tree validation gate. The validated source baseline for this reconciliation is `4e315f551737d729f76e5f561dd8d7404717e157`.

## Milestone 6 — Blitz Mode / Focus Panel

- [x] Start Blitz from eligible Today tasks.
- [x] Auto-select top eligible Today task.
- [x] Reproduce Focus Panel hierarchy: list selector, Today, quick controls, aggregate EST/progress, active live card, remaining queue, Add Task, scheduled group, done group.
- [x] Render current task and authoritative timer with fixed/tabular timer geometry.
- [x] Show remaining/scheduled/done sections matching documented focus workflow.
- [x] Implement break, notes, pause/resume, skip, finish.
- [x] Implement subtasks/progress in focus mode.
- [x] Permit EST/Time Taken editing only while paused.
- [ ] Revalidate selected-monitor and left/right Focus Panel placement on the replacement fixed Focus host.
- [ ] Revalidate monitor/display-change reaction while Focus Mode is open on the replacement region/DPI/topology path.
- [x] Implement configured scrolling behavior for the live title.
- [x] Allow ordinary focus-row task titles up to two lines where practical; expose full title accessibly.
- [x] Reserve action slots for hover/focus controls so controls never push task text or move hit targets.
- [x] Add tooltips for icon-only controls.
- [x] Implement active-card, paused, break, time-up/overtime, overdue, notes-expanded and no-eligible-task visual states.
- [x] Handle empty/no-eligible-task states.

Acceptance criteria:

- Focus Panel drives a complete work session without main-window interaction
- all session changes appear immediately when main is open/reopened
- current screenshot hierarchy is visually recognizable at a glance, not merely functionally equivalent
- focus hover/focus controls do not move sibling content or change pointer targets
- display hotplug cannot strand the panel off-screen
- normal and reduced-motion behavior pass interaction tests

**Historical Gate F initial result:** all original 16 Milestone 6 items passed on the superseded Focus-host implementation. PR #116 exact head `f0e02570308d86416861c53e1d296e5edb309ef8` passed Windows CI #445; expected-head guarded squash merge `ab5818fa92970655b63323839111a1977a5837a7` passed resulting-main Windows CI #446. Current Gate F status is the reopened replacement state below.

### 2026-09-26 parity/reliability reconciliation

- [x] Reconcile confirmed Focus production omissions discovered after Gate F:
  - [x] A10 Ordinary Focus rows expose the documented source-backed task actions with reserved geometry and keyboard/focus equivalents.
  - [x] A11 Rocket / Make Live switches through authoritative timer/session APIs and preserves prior work.
  - [x] A12 Focus queue reorder reuses validated persisted task ordering and stable IDs.
  - [x] A13 Ordinary-row delete, schedule, notes and non-live completion reuse validated Main/domain boundaries.
  - [x] A14 Replace disabled Focus `+ ADD TASK` with persistence-first creation; All Lists requires explicit owning-list choice.
  - [x] A15 Focus Home exits the Focus surface through existing lifecycle without silently resetting timer/session state.
  - [x] A16 Live-task title editing is available only through Notes and reuses stale-safe title persistence.
  - [x] A17 Time's Up exposes Extend using the existing authoritative `timer_extend` transition.
  - [x] Evolve temporary M6 static tests that froze placeholder/non-mutating controls.

**Historical Gate F reconciliation:** PR #158 exact head `c13e7f6cfbec3accde4841fd4fd61b68d0924ff6` and resulting-main `b1ff5910abec82272c4ee57479a44eb62248a88f` validated the superseded Focus-host implementation.

- [ ] Revalidate the complete M6 Focus Panel end to end inside the replacement single-`focusSurface` coordinator: entry/selection, hierarchy, authoritative timer projection, every existing action/state, keyboard/focus/reduced-motion behavior, quick task/Home flows, selected-monitor/edge placement, topology recovery, and immediate consistency with Main. Reuse the existing validated domain commands; do not reimplement unrelated M6 behavior.

**Gate F current result: REOPENED for replacement integration.** Re-close M6 only after the two placement/topology items and the complete replacement-host regression item above pass on the new implementation.

## Cross-cutting completion requirements for remaining milestones (M7–M10)

These requirements apply to every open or reopened roadmap milestone. A later replacement may reopen earlier validated items when it changes the implementation that materially supported their acceptance; historical PASS evidence remains preserved but does not certify replacement code.

- Error handling and significant state coverage must be sufficient for the milestone's real user-facing surface and domain behavior. Relevant failures, unavailable states, loading/waiting states, empty states, invalid input, stale/conflicting state, recovery paths, and other meaningful edge cases must provide clear, complete feedback rather than silent failure or ambiguous UI.
- Automated tests/fixtures and physical Windows checks must cover the meaningful edge cases appropriate to the milestone, following `ENGINEERING_QUALITY.md`; unavailable checks remain `NOT RUN`, never implied PASS.
- User-facing operations must define what the user sees while work is pending, when it fails, when required state/resources are unavailable, and after recovery/retry where applicable.
- A milestone cannot be reported complete while known significant error, loading, unavailable, recovery, or edge-case states in that milestone remain unhandled or untracked.
- When user-supplied Blitzit videos/transcripts exist before an affected unfinished milestone closes, analyze the materially relevant subset before milestone completion rather than deferring known interaction/motion evidence to the final review. Focus Panel/Floating Timer/transition/expand-collapse evidence present before M7 closure is M7 evidence.
- Every milestone completion report must include that milestone's **total source diff** as `+A/-B` lines. Calculate it from the milestone's validated starting source SHA to its final validated source SHA; documentation/tracking-only commits do not replace the source baseline and are excluded from this source-diff figure.

## Milestone 7 — Floating Timer mode

**Current corrective-scope rule:** the single-Focus replacement changes implementation that materially supported M1 Gate A, M6 Gate F and multiple M7 acceptance items, and directly changes M8 Focus-shortcut routing. Those affected items/gates are therefore reopened until the replacement is validated. Historical PASS evidence remains immutable evidence for the superseded code only. M2–M5 stay closed because no direct dependency has been found.

- [ ] Implement compact mode by transforming the existing `focusSurface` window; do not create a third persistent webview.
- [ ] Make it movable, always-on-top, and absent from normal taskbar presentation where appropriate.
  - Historical evidence: Native drag affordance, focusSurface-scoped drag capability, exact-head PR CI, guarded merge, and resulting-main CI are automated-validated.
  - Historical evidence: Physical Windows validation: Drag PASS; Return button PASS; Always-on-top PASS; no normal taskbar button PASS.
- [ ] Implement collapsed state matching the supplied compact screenshot: title, live timer, subtask progress, add, expand.
- [ ] Implement expanded action strip for Break, Notes, Pause/Resume, Skip, Done, return-to-panel.
- [ ] Implement expanded subtask rows with completion, title editing, reorder, delete and progress.
  - Historical evidence: Completion/reopen, reorder, delete, add and progress were automated-validated in the original M7 expanded-content slice.
  - Historical evidence: A18 parity reconciliation: expanded Floating Timer supports stale-safe subtask title editing through the existing authoritative subtask mutation boundary. PR #155 exact head `c630a57346c067ab04c0fa086703582542f4f7e5` passed Windows CI #559; guarded squash merge `76ef5dadf1d6587ee52d029d980ad4de7a9abd93` passed resulting-main Windows CI #560.
- [ ] Keep icon hit targets stable and show tooltips without changing window width.
- [ ] Implement Focus Panel <-> Floating Timer content transition with short one-shot opacity/transform motion; do not animate native window geometry in a high-frequency JS loop. **Current implementation direction:** one fixed-maximum-size `focusSurface` WebView, conditional React presentation and DPI-aware native visible-region clipping; `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md` is the executable plan. Replacement implementation is in progress and remains unvalidated.
  - Historical evidence: Initial native hidden-stage transition correction, finite 150ms content motion, reduced-motion contract, exact-head PR CI, guarded merge and resulting-main CI are automated-validated.
  - Historical evidence: Physical-fail corrective candidate is automated-validated: target-edge DPI staging, focus-surface horizontal overflow suppression, and paint-gated collapsed/expanded resize publication; PR #122 exact-head CI #471 and resulting-main CI #472 PASS.
  - Historical evidence: Motion-smoothing corrective candidate is automated-validated: keyed Panel/Timer exit-before-native sequencing in both directions plus finite collapsed/expanded exit/resize/entrance sequencing; PR #123 exact-head CI #476 and resulting-main CI #477 PASS.
  - Historical evidence: Physical-fail compositor corrective candidate is automated-validated: settled Focus content is fully masked before native Panel/Timer geometry, collapsed/expanded resize uses an explicit hidden `resizing` phase, and a finite two-frame presented-frame barrier brackets native geometry; PR #124 exact-head CI #479 and resulting-main CI #480 PASS.
  - Historical evidence: Physical Windows CI #480 re-test evidence recorded: Panel -> Timer PASS; Timer -> Panel borderline/functional PASS; right-side return PASS; normal-size horizontal overflow PASS; timer/session continuity PASS; Expand/Collapse FAIL with repeated stale/duplicated action-strip pixels.
  - Historical evidence: Native hidden-resize corrective candidate: target hierarchy stays visibility-hidden through native hide/resize/show and a post-show frame opportunity, with physical-size/visibility rollback on error; PR #125 exact-head CI #486, guarded merge `a7161ac`, and resulting-main CI #487 PASS. Physical re-test remains open.
  - Historical evidence: Transition completion now observes the actual opacity animation or verified no-animation state for both mode changes and Timer expand/collapse; executable cancellation/no-transition tests and PR #136 exact-head CI #501 PASS. Guarded merge `0fc7401` has an identical tree; automatic main CI #502 was cancelled as redundant. Its later physical finding is recorded below.
  - Historical evidence: CI #501 physical retest found the expanded action strip still mounted alongside the collapsed heading. PR #138 gives action and subtask siblings distinct React keys; a three-cycle executable Edge DOM test passes and fails against the original duplicate keys. Exact-head CI #503 PASS; guarded merge `5e0e0c1` has an identical tree, and duplicate main CI #504 was cancelled. The physical result is recorded below.
  - Historical evidence: CI #503 physical retest: three native expand/collapse cycles, including visible subtask controls, showed no stale/duplicated action strip or collapsed-state pixels; Panel/Timer session continuity and normal-size no-overflow passed. Continuous transition smoothness and the unavailable display conditions remain open; see the 2026-09-25 work log.
  - Historical evidence: CI #507 follow-up: settled expand/collapse and session continuity again passed, but two 20 fps Panel→Timer captures showed blank/pale staging frames before Timer content rendered. The continuous no-flash criterion is FAIL; see `work-log/2026-09-25-codex-m7-panel-timer-flash-reproduction.md`.
  - Historical evidence: With actual Windows animations Off on CI #507, Panel→Timer and Timer→Panel both showed blank frames before the target content; nonessential translation was absent. Visual no-flash criterion remains FAIL; see `work-log/2026-09-25-codex-m7-os-reduced-motion-physical.md`.
  - Historical evidence: PR #140 keeps a usable collapse control after the last live task ends while Timer is expanded and avoids empty Pomodoro notification write locks. Executable Edge click and Rust contention tests passed CI #505; guarded merge `aafa7de` has the identical source tree and duplicate main CI #506 was cancelled. Physical keyboard collapse to native 356×118 PASS.
  - Historical evidence: Hidden-publication corrective source is automated-validated: native prepare/reveal now keeps the host hidden while React synchronously publishes a prepainted target root before reveal, with explicit previous-mode recovery on frame/reveal/cancellation failure. PR #145 exact head `f901fa907b550e921daf32123ec84a49aebb7006` passed Windows CI #513; expected-head guarded squash merge `c875b4894e90cc75c04c9ff9508ef1dc1a176ad5` passed resulting-main Windows CI #514. Physical Windows re-validation remains open.
  - Historical evidence: User-provided 60 fps CI #514 physical recording confirms the hidden-publication correction still FAILS the continuous criterion: with normal Windows animations the mode switch exposes transient target loading/staging content; after `Show animations in Windows` is visibly switched Off, Panel/Timer transitions around ~32.8s and ~34.3s expose blank white target-host frames before content. PR #147 adds one-shot native transparent host prewarm so WebView2 is actually visible/painting at alpha 0 before the existing two-frame barrier and reveal. Exact head `8f173cd37fc8d1506ec546feb2248e92db81cebe` passed Windows CI #516; guarded merge `f59e4d16a49659832ea562c3718cc5ba748b74fb` passed resulting-main CI #517. Physical retest from #517 remains open.
  - Historical evidence: CI #517 user-provided 60 fps retest narrowed the remaining failure to renderer readiness: the native blank-host flash is gone, but Panel→Timer briefly reveals `No active focus task` around ~4.55s before live task `fas` appears at ~4.60s, and Timer→Panel briefly reveals `Loading Focus Panel…` around ~20.25s before the settled Panel at ~20.30s. PR #148 gates Panel reveal on settled board+timer projections (exact-head CI #518 PASS; resulting-main CI #519 PASS). PR #150 gates Timer reveal on settled timer projection plus matching live-task board snapshot (exact head `a4dd2839a84fc4cd69c2d7ed55beb224cc6d811f`, CI #520 PASS; merged main `445aa37b9b8441c9351d5dd87ff353690b3050c2`, resulting-main CI #521 PASS). Physical retest from #521 remains open.
  - Historical evidence: CI #521 user-provided 60 fps physical retest remains FAIL for Panel↔Timer continuity. With normal Windows animations, ~8.300s briefly shows `No active focus task` before live task `fas` at ~8.333s and ~10.600s shows `Loading Focus Panel…` before the settled Panel at ~10.633s; equivalent loading/staging remains with actual Windows animations Off around ~35.267s and ~40.700s. The readiness gates were ordered after transparent prewarm, so PR #151 reorders both success and recovery to `prepare -> publish -> readiness while hidden -> transparent prewarm -> presented-frame barrier -> reveal`. Exact head `077c2ea4b74e1f346a7ca3b9e9ec7cb76b2ca451` passed Windows CI #522; merged main source `8c3a108ec2c8ebdea0e5c1aa2b234490d718aff2` passed resulting-main CI #523. Physical Panel↔Timer confirmation remains open and may be batched with the later M7 manual matrix; it is not counted as PASS.
  - Historical evidence: CI #530 exact-build physical re-test on 2026-09-26: three settled Panel→Timer→Panel shortcut cycles retained one Focus window and paused task, but continuous capture with Windows animations On visibly exposed a pale empty focus frame and then desktop before Timer. Gate 7 visual continuity remains **FAIL**. See `work-log/2026-09-26-codex-m7-ci530-panel-timer-physical-fail.md`; animations Off and the rest of the latest-build matrix were not run.
  - Historical evidence: Independent second audit of the same CI #521 recording, rechecked frame-by-frame, confirms a separate Expand/Collapse continuity failure not covered by PR #151: with animations On, Expand around ~9.53–9.65s exposes an enlarged mostly empty Timer before expanded controls; Collapse around ~17.2s hides expanded content before the native surface finishes shrinking and then republishes collapsed content. The same class reproduces with Windows animations Off around ~43.02–43.13s on Expand and ~37.38s on Collapse. Treat this as a distinct resize visibility/readiness issue. #151 resulting-main validation is complete; by explicit user direction, the Panel↔Timer physical retest may be batched later, so this independently evidenced corrective slice may proceed now without marking the deferred manual gate PASS.
  - Historical evidence: Expand/Collapse empty-surface corrective source is automated-validated: PR #153 replaces the visible child fade/hide resize sequence with an atomic transparent-host swap (`cloak -> native resize -> synchronous target publish -> finite frame barrier -> uncloak`) while preserving native geometry/rollback authority and the solved duplicate-key/stale-pixel behavior. Exact head `ed046af079038952f5877b19324b6bf36912e69f` passed Windows CI #527; merged main `57a18a2b9ffd81b1b2d968c54bf1e997311c0cd8` passed Windows CI #528. Physical Expand/Collapse confirmation remains open and is batched with the remaining M7 Windows matrix.
  - Historical evidence: CI #530 blank/desktop continuity corrective source is automated-validated: PR #155 adds a short-lived native bitmap/tool-window visual hold over the same `focusSurface` during hidden geometry/readiness/prewarm/reveal work, with serialized ownership and cleanup on success/failure. Exact head `c630a57346c067ab04c0fa086703582542f4f7e5` passed Windows CI #559; guarded squash merge `76ef5dadf1d6587ee52d029d980ad4de7a9abd93` passed resulting-main CI #560. Physical continuous-capture confirmation remains OPEN/NOT RUN.
  - Historical evidence: CI #624 exact-artifact physical batch on 2026-09-28: Gate 7 **FAIL** with Windows animations On. Three Timer→Panel cycles exposed 3–5 pure-white frames; three Expand/Collapse cycles exposed white/mostly empty resized surfaces. Two valid Panel↔Timer cycles with animations Off had no blank frame; Off Expand/Collapse remains untested. See `work-log/2026-09-28-codex-m7-ci624-physical-batch.md` and sanitized frame evidence.
  - Historical evidence: PR #191 first candidate `f1ef35a` passed exact-head Windows CI, but three physically recorded Off Expand/Collapse cycles still exposed the old expanded white surface beneath compact content. The On attempt was interrupted before cycles; Gate 7 remains FAIL. See `work-log/2026-09-28-codex-m7-pr191-retest-in-progress.md`.
  - Historical evidence: PR #191 second visual-hold candidate `12707c0` passed exact-head Windows CI run `36373768756`; physical animations-On 3× Panel↔Timer and 3× Expand/Collapse retest still showed the old expanded white area under compact content, so Gate 7 remains FAIL. Preceding `788fb87` compiled but failed CI Clippy on a redundant cast, which `12707c0` removed.
  - Historical evidence: PR #191 target-bounds correction `d505b93` passed exact-head CI run `36374929708`; physical On cycles no longer showed the prior expanded white tail, but the Off resize capture contained full-white expanded Timer frames 570 and 677. Gate 7 remains FAIL; see `work-log/2026-09-28-codex-m7-visual-continuity-history.md`.
  - Historical evidence: Repeated-failure assessment: `f1ef35a`, `12707c0`, `d505b93` and now `b23c8ab` each passed CI and physically failed Gate 7. The exact `b23c8ab` Off recording shows full-white expansion and white collapse frames. The source path, failure signatures, alternatives and bounded experiment decision are in `work-log/2026-09-28-codex-m7-architecture-assessment.md`.
  - Historical evidence: Record the separate persistent Timer WebView experiment's verdict. `8b94946` passed CI and On/Off clipping captures avoided the old white resize frames but On transitions showed loading copy. `a6a9459` passed CI and removed that copy but exposed the compact Timer over Panel controls. `4e4960b` passed CI `36530577060`; one exact-build animations-On capture of three settled Panel↔Timer cycles reduced the overlap to about 0.07–0.10 seconds, with no white host/loading copy in the six inspected boundary sequences. **Strict Gate 7 remains OPEN/FAIL.** The separate-WebView candidate used about +95 MiB floating-only working set versus the old composition; PR #191 was later closed unmerged as a superseded architecture experiment. See `work-log/2026-09-29-codex-m7-separate-timer-physical.md`.
  - [ ] Reimplement the affected M1 window foundation, M6 Focus presentation composition and M7 Timer presentation/transition path as one coherent replacement, following the milestone map in `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md`. Preserve validated domain and product behavior; historical milestone PASS records do not validate the new code.
  - [ ] Implement the replacement composition specified in `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md`: one fixed-size Focus HWND/WebView; native region for Panel, compact Timer and expanded Timer; one React mode coordinator; visible-region placement/DPI recovery; remove the second Timer WebView and obsolete cross-window switching. Preserve timer/session authority and error rollback. **Implementation phase only:** do not run tests, builds, CI, app launches or physical checks until implementation is complete and the user explicitly authorizes testing.
  - [ ] Migrate all repository architecture contracts before implementation is called complete: `verify-config`, CI dist requirements, M1/M6/M7/M8 static/integration tests, Main/global/in-app shortcut routing and package preflight must assert one `focusSurface` and dynamic component toggling, not split-window or old hide/resize/show behavior. Editing tests is required now; executing them remains deferred by user direction.
  - [ ] Remove/retire live split-window artifacts after replacement paths exist: separate Timer renderer/window wrappers, cross-window readiness/query/request protocol, persistent two-window transition helper, split `prepare/reveal/present` native commands and obsolete visual-hold/DWM/prewarm code. Historical work logs/prompts remain untouched as evidence.
  - [ ] After explicit user authorization, validate the completed replacement on its exact executable against the continuous Panel↔Timer and Timer Expand/Collapse Gate 7 criterion. No source/CI result alone may close the physical gate.
  - [ ] Physical Windows re-validation: no left/staging flash, no horizontal focus-surface scrollbar, no stale/duplicated expanded pixels during expand/collapse, and no abrupt return flicker.
- [ ] Implement shortcut to alternate Focus Panel/Floating Timer.
  - Historical evidence: Ctrl+Shift+T implementation passed PR #126 exact-head CI #488, guarded merge `77e535f`, and resulting-main CI #489.
  - Historical evidence: Concurrent native registration/retry and diagnostic publication are serialized; executable Rust concurrency/conflict/rollback tests and frontend retry-state tests passed PR #143 exact-head CI #507. Guarded merge `fce15f8` has the same tree; duplicate main CI #508 was cancelled. Scoped physical results appear below.
  - Historical evidence: Physical Panel/Timer shortcut use and session continuity passed on CI #503; one rapid repeated press settled to one Timer window.
  - Historical evidence: Physical CI #507 Ctrl+Shift+T, rapid repeated press, both-chord ownership conflict and retry after release passed with one Focus window and the same paused session. Further transition-boundary stress remains open.
  - Historical evidence: CI #624 Gate 8 physical boundary stress PASS: two bursts of five rapid presses settled to one Focus window with the same paused task/session/time and no stuck busy state; see 2026-09-28 M7 work log.
- [ ] Implement shortcut to locate/animate Floating Timer using a restrained finite attention pulse.
  - Historical evidence: Ctrl+Shift+P and finite attention pulse passed PR #127 exact-head CI #490, guarded merge `53c0376`, and resulting-main CI #491.
  - Historical evidence: The shared PR #143 registration/retry state machine and executable concurrency/conflict/rollback tests passed exact-head CI #507; guarded merge `fce15f8` has the identical tree. Scoped current-build physical results appear below.
  - Historical evidence: Physical visible/hidden Timer and Panel-mode shortcut behavior passed on CI #503; pulses ended in about 729/726 ms, or about 186 ms with reduced-motion media emulation.
  - Historical evidence: Physical CI #507 visible-Timer Ctrl+Shift+P pulse and Panel-mode no-op passed; native-hidden Timer on this exact build was not retested.
  - Historical evidence: Physical Windows OS animations Off: visible-Timer Ctrl+Shift+P gave one finite pulse and returned to settled state on CI #507. The original OS setting was restored.
  - Historical evidence: CI #624 Gate 9 physical PASS: repeated visible-Timer P pulses on actual animations On and Off settled; Panel P did not change mode/session; the Off pulse followed native mode hide/show. See 2026-09-28 M7 work log.
- [ ] Persist a safe last position and recover after monitor changes/restart.
  - Historical evidence: Native SQLite placement/relative recovery passed PR #128 exact-head CI #492, expected-head guarded merge `778a1bc`, and resulting-main CI #493.
  - Historical evidence: Visible Timer topology recovery now fits and repositions the measured outer window, including when no saved placement exists; PR #134 exact-head CI #499, guarded merge `c9ae591`, and resulting-main CI #500 PASS.
  - Historical evidence: Physical drag, Panel return/reopen, and same-monitor process restart restored the Timer at the moved position with the same paused session on CI #503.
  - Historical evidence: CI #624 Gate 10 physical PASS: secondary-monitor move, disconnect-to-primary recovery, reconnection, restart with saved position on DISPLAY2, and separate no-saved-placement restart with safe primary placement all retained the same paused session. Mixed-DPI size failure is separately Gate 12.
- [ ] Validate always-on-top against normal maximized and borderless full-screen Windows apps; document exclusive-fullscreen limitations if any.
  - Historical evidence: Document the Windows DirectFlip/Independent Flip composition caveat and separate exclusive-fullscreen observation in `docs/M7_FLOATING_RUNTIME_VALIDATION.md`.
  - Historical evidence: Physical stacking above maximized Edge and Edge F11 fullscreen passed on CI #503.
  - Historical evidence: CI #624 Gate 11 physical PASS over a separate borderless fullscreen Windows Forms application with probe→Timer→probe focus switching; Timer stayed visible/topmost. True exclusive fullscreen was unavailable and is not inferred.
- [ ] Verify expanded content remains on-screen when the widget is close to bottom/taskbar; reposition/anchor safely rather than overflowing unusably.
  - Historical evidence: Native hidden-resize work-area anchoring passed PR #130 exact-head CI #494, expected-head guarded merge `50cef42`, and resulting-main CI #495.
  - Historical evidence: Constrained work-area recovery fits native outer size before placement and keeps expanded controls scrollable at narrow/short DPI-scaled sizes; PR #132 exact-head CI #497, guarded merge `59bdc2d`, and resulting-main CI #498 PASS.
  - Historical evidence: Restore and live display-change paths reuse measured native fit/placement, with rollback on failure; PR #134 exact-head CI #499, guarded merge `c9ae591`, and resulting-main CI #500 PASS.
  - Historical evidence: Physical primary-work-area bottom expansion fitted the 356×308 native outer window at y=772 with lowest controls reachable and collapse usable on CI #503.
  - Historical evidence: CI #624 physical secondary-monitor bottom-edge expansion at 125% fit the 443×384 expanded Timer at y=696 (bottom=1080) with controls reachable and collapse usable after a Panel→Timer size reapply.
  - Historical evidence: CI #624 Gate 12 **FAIL** on dynamic mixed-DPI placement: moving the visible compact Timer to 125% DISPLAY2 left an approximately 271×75 outer window with both scrollbars and clipped controls. A Panel→Timer mode reapply restored 425×138. PR #191 contained a narrow display-recovery logical-size correction with regression tests; that closed superseded candidate never received a final mixed-DPI physical retest. Gate 12 must be retested on the single-Focus replacement. Non-default taskbar edge and separately shortened work area were not run.
- [ ] Verify no decorative animation runs continuously while idle.
  - Historical evidence: Static Floating Timer motion audit: finite attention pulse and transitions only; live timer sampling is conditional on active states. The only `infinite` title scroll belongs to the Focus Panel. See `work-log/2026-09-24-codex-m7-idle-motion-audit.md`.
  - Historical evidence: Physical CI #503 collapsed/expanded paused idle: zero running DOM animations/pulse nodes, and paired settled screenshots byte-identical. True-idle collapsed CI #505 also showed zero animations. Revalidate if later source changes idle motion.
- [ ] Re-run Milestone 1 floating-only CPU/memory measurements after final UI is present.
  - Historical evidence: CI #505 executable on Windows 10 with `main` destroyed: three valid 30s/60s runs per collapsed/expanded true-idle state, zero churn, idle CPU median 0.000% of one core in each state; separate running-timer run averaged 0.155%. Working set medians were 429.76/421.39 MiB, private medians 375.19/327.56 MiB. See 2026-09-25 work log for per-run ranges, warm-state caveat, source/artifact identity, and profile restoration. Re-measure after future performance-relevant source changes.

Acceptance criteria:

- switching modes never resets/duplicates session
- timer remains synchronized with authoritative Rust state
- no second focus webview is created during normal switching
- collapsed/expanded states visually match the supplied hierarchy and density
- saved position survives restart when still valid
- lost/off-screen position is recoverable
- final floating UI has no unexplained idle CPU or major memory regression versus Milestone 1 baseline
- reduced-motion mode removes nonessential translation/scale while preserving clear feedback

**Current M7 gate state:** 1/15 top-level checklist items remain validated after reopening every item whose acceptance depends on the replaced Focus host/presentation/placement/shortcut/performance path. Only the unrelated Change List/Duplicate capability remains closed. Historical M7 PASS evidence is preserved in subitems/work logs but does not validate the replacement.

### Post-validation video-evidence correction — VE-F003

This correction was discovered from current direct VE-005 evidence after M5 validation. It does **not** reopen M5 because the later Focus-host replacement does not change the underlying Change List/Duplicate domain implementation. The current roadmap counter is reduced for separate M1/M6 replacement reasons, not because of this M5-derived parity correction.

- [x] Expose current task-menu `Change List` and `Duplicate` behavior using existing persistence/domain authority: Change List moves the same stable task identity atomically to the chosen active list without corrupting schedule/session/history state; Duplicate creates one independent new task identity without aliasing source history/recurrence/session records. Preserve live-task safety, persistence-first UI publication, stale guards, All Lists identity semantics, and explicit error/recovery feedback. **Validated in PR #177** at exact head `e80034f481bc8d9368bb670cadfce2cdcbe61797`; Windows CI #602 PASS; expected-head guarded squash merge `f4c80d04b25f58637c0ef04c03b60dcd52fcff57`; resulting-main Windows CI #603 PASS.

## Active audit-incorporation gate — 2026-09-28

This cross-cutting gate applies before further forward implementation and **does not change the 10-milestone denominator**.

Authoritative detailed mapping: `docs/AUDIT_IMPLEMENTATION_CROSSWALK.md`.

- [x] Build one master finding→implementation register covering parity/code audit, video findings, Help Center/image findings, UI/UX forensic findings and reliability-history risks.
- [x] Route every material finding to one explicit disposition: validated, fix-now, future milestone, validation-open, ambiguity, intentional deviation or excluded scope.
- [x] Resolve every current `FIX_NOW` discrepancy affecting an already-built/current surface before unrelated forward work.
  - [x] CORR-01 recurrence update / No Repeat flow: source-evidenced conditional `Delete existing tasks(n)` destructive row plus authoritative safe detach/delete behavior. PR #182 exact head `72ab6c77d5e5f5e50c7f3f7e6a0c11b98c7c606c` passed Windows CI #617; expected-head guarded squash merge `50006f29b0329037aecfdab772104db8670768b0`; resulting-main Windows CI #618 PASS.
- [x] Preserve future-milestone routing instead of prematurely implementing M9/M10 work.
- [x] Preserve ambiguities/intentional Narro improvements instead of inventing source behavior.

**Execution rule:** new evidence that materially changes an already-built/current surface reopens only that narrow surface as a corrective slice; it does not require a wholesale milestone re-audit.

**Current execution priority:** complete the single-Focus replacement implementation without running deferred validation. When the user authorizes testing, revalidate and re-close the dependency chain in order: M1 Gate A replacement items → M6 Gate F replacement integration → M7 replacement items including Gate 7/12 → affected M8 shortcut items. Do not start unrelated remaining M8 feature work before that chain is reconciled.

## Milestone 8 — Windows shortcuts and preferences

**Current replacement impact:** the single-Focus replacement directly changes Focus shortcut routing, so the affected M8 shortcut items below are reopened for integration validation. Unaffected validated Preferences/persistence work remains closed. New remaining M8 feature work stays blocked until the M1→M6→M7 corrective chain is revalidated.

- [ ] Implement confirmed Windows in-app shortcuts. PR #166 exact head `18a4d2b5a26bc705bf7cdf7bea647275b4877890` passed Windows CI #569; guarded squash merge `030274149cafdf590c5aa08f2cd1c9409595c7aa` passed resulting-main CI #570.
- [ ] Implement confirmed Windows global shortcuts plus per-global enable toggles. PR #168 exact head `e63dbd3107fca8ccf95d35506c7a16e4eeaac9f6` passed Windows CI #574; guarded squash merge `699b6ac46bcc6ebcabbcded21f929a7b32018b42` passed resulting-main CI #575.
- [x] Add conflict/error feedback for unavailable global shortcuts. Persisted enabled intent remains distinct from native registration; conflict/unavailable/retry and persistence/native rollback paths are explicit and validated in PR #168 / CI #574.
- [ ] Implement Preferences sections evidenced in screenshots/docs: monitor/side, hide times, EST parsing, theme, timezone, Pomodoro, break/work durations, scrolling title, timed alerts, sounds/previews, timer flash, notification alerts, schedule reminders, completion celebration.
  - [x] VE-F001: when `auto_parse_est_from_title` is enabled and a supported terminal duration parses successfully, persist it as EST and remove that parsed suffix from the saved visible title; failed/non-matching parses leave the title untouched.
  - [x] VE-F002: when `show_success_screen` is enabled, Done must commit completion and enter the success state before any next task starts; explicit `Next Task` may then start the next eligible task. The success-screen-disabled path keeps current Narro behavior pending stronger evidence/decision.
  - [x] Do not invent the post-click timer/session semantics for the directly visible success-screen `Take a Break` control; keep that exact transition unresolved until evidence or an explicit Narro product decision exists.
  - [x] VE-F008: preserve in-place conditional children for Pomodoro durations, timed-alert detail, notification-alert detail, reminder lead, and celebration children; hide-times must retain explicit hover disclosure.
  - [ ] Remaining Preferences runtime closure:
    - [x] PREF-R01 timed task-alert runtime effect and persisted interval semantics. PR #184 exact head `fc61ed5926fdb1c605de8ce1e1a9fb28ea0dfd7e` passed Windows CI #624 / run `36357415253`; expected-head guarded squash merge `e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`. The merged main source tree was verified identical to the validated PR source for all nine changed files by matching blob SHAs.
    - [ ] PREF-R02 animated timer-flash runtime effect, finite and reduced-motion safe.
    - [ ] PREF-R03 Notification Alerts gating without duplicating authoritative M3 notification effects.
    - [x] PREF-R04 schedule-reminder preference/lead integration through durable idempotent background delivery. PR #180 exact head `0309c879998f43ff8c6e39e65f02c44669fa48b8` passed Windows CI #607; guarded squash merge `643528ca223b29fd8fbd215db5b1b525c912c6fc` passed resulting-main CI #608.
    - [ ] PREF-R05 local sound catalog/preview behavior only from validated Narro-owned or user-local assets; previews must not overlap indefinitely.
- [ ] Ensure Start Break shortcut pauses the current task, starts break, and follows documented resume/skip behavior. The in-app shortcut reuses the existing authoritative Focus break/pause/resume/skip lifecycle and passed PR #166 / CI #569.
- [x] Preserve conditional/nested setting behavior without disruptive scroll jumps. Validated in reconciled PR #170 / Windows CI #604 with nested controls mounted in place and parent-gated rather than remounted.
- [ ] Use Windows locale for date/time presentation by default.
- [x] Persist preferences in SQLite or a versioned local settings layer. The typed versioned SQLite payload already persists all current General/Focus/Alerts/Celebration fields and now v3 ShortcutPreferences; reopen/migration/atomic mutation coverage passed PR #168 / CI #574.

Acceptance criteria:

- shortcut behavior is tested where feasible
- preferences survive restart and affect both windows consistently
- Preferences upper/middle/lower screenshot states have visual fixtures
- sound previews do not overlap indefinitely
- 12/24-hour display follows Windows locale in schedule/session UI

## Milestone 9 — Reports and history

- [ ] Implement local productivity overview from task/session history.
- [ ] Implement four summary metrics and productive-hour/day/month cards according to official definitions.
- [ ] Implement productivity chart with Tasks/Breaks/Total series and accessible hover/focus tooltip values.
- [ ] Implement Time By List and completion/punctuality insights according to official early/late semantics.
- [ ] Implement done-task rows with completion date, early/late when EST exists, and Time Taken.
- [ ] Implement two-month date-range picker plus evidenced presets.
- [ ] Implement Sessions report with detailed work/break rows.
- [ ] Implement manual Add Session and inline session editing/task-session detail modal.
- [ ] Ensure permanently deleted tasks are removed from user-facing reports while normal archived data remains represented.
- [ ] Implement evidence-selected exports:
  - Overview -> PDF
  - Sessions -> CSV
- [ ] Verify archived lists/tasks remain represented correctly in historical reports.
- [ ] Limit chart animation to initial load/filter changes; no continuous chart motion.

Acceptance criteria:

- report totals reconcile with stored session/task history
- report metric definitions match `docs/PRODUCT_SPEC.md`
- deletion/archive semantics are correct
- exports are generated fully locally
- chart values are accessible without pointer-only hover
- visual fixtures cover Overview, chart tooltip, list filter, date picker, Sessions and inline-edit modal

## Milestone 10 — Windows lifecycle, packaging, visual/regression pass

- [ ] Validate clean first launch and database creation.
- [ ] Validate upgrade across at least one migration change.
- [ ] Validate main-window destroy/recreate plus tray/focus runtime.
- [ ] Validate explicit Quit.
- [ ] Validate multi-monitor behavior and monitor disconnect/reconnect recovery without restart.
- [ ] Validate Windows display scaling at 100%, 125%, 150%, and 200%.
- [ ] Validate Windows locale variants including 12-hour and 24-hour time formats.
- [ ] Validate Windows installer packaging.
- [ ] Re-validate autostart launch after Windows restart/sign-in on the release-candidate build.
- [ ] Add Narro-owned application icon/branding.
- [ ] Run regression tests for lists, task identity/reorder, timer/tracked time, scheduling/recurrence, focus panel/floating mode, reports, shortcuts, persistence, keyboard focus and reduced-motion.
  - For any later milestone that replaced a shared foundation originally validated in an earlier milestone, confirm the affected milestone/items were reopened during the replacement and then reclosed only from replacement-code evidence. Explicitly rerun those earlier acceptance criteria against the release-candidate implementation and record the dependency map/result.
- [ ] Run the complete screenshot-fidelity checklist in `docs/UI_UX_SPEC.md` in dark/light themes where applicable.
- [ ] Confirm animation does not cause task-row/card geometry changes or persistent idle CPU work.
- [ ] Cross-check source-product anti-regressions in `docs/SOURCE_AUDIT.md` and `docs/BLITZIT_HISTORY_RISK_INDEX.md`: no lost tracked time, no duplicate tasks from reorder/schedule moves, no wrong-day schedule shifts, no restart-required monitor hotplug, no surprise URL launch, and no post-pause/manual-edit timer-vs-ledger divergence.
- [ ] Update `README.md`, `STATUS.md`, and `TODO.md` for release-candidate reality.

## Final Comprehensive Review Stage — after Milestone 10

This is a required post-roadmap quality stage and **does not become an 11th roadmap milestone**. The normal roadmap progress denominator remains 10 milestones. No item in this stage may be marked complete before Milestones 1–10 are complete and the corresponding review work has actually been performed and validated.

### Review preparation and evidence inventory

- [ ] Freeze the final review baseline at the validated Milestone 10 source SHA and record the complete application/version/environment under review.
- [ ] Inventory all relevant Narro specifications, validated work logs, screenshots, visual fixtures, and current product states that define expected behavior.
- [ ] Inventory **all available Blitzit screenshots, images, videos, transcripts/captions, and visual references**, including the supplied reference screenshots, `reference/original-blitzit-videos/inbox/`, and the evidence indexed by `docs/RESEARCH_EVIDENCE.md`, `docs/BLITZIT_VIDEO_EVIDENCE.md`, `docs/UI_UX_SPEC.md`, `docs/SOURCE_AUDIT.md`, and `docs/BLITZIT_HISTORY_RISK_INDEX.md`.
- [ ] Ingest and catalog the complete user-supplied Blitzit video/transcript corpus in `docs/BLITZIT_VIDEO_EVIDENCE.md`: account for every uploaded raw file, pair or explicitly mark transcripts/captions, record source/version/environment metadata when available, and preserve traceability to originals.
- [ ] Complete timestamped analysis of the uploaded recordings for interaction flow, UI states, animations/motion, transition/resize ordering, transient/loading/error/empty/unavailable states, visible accessibility cues, and material transcript claims; distinguish direct observation from narration and inference.
- [ ] Route every material video-derived discrepancy, missing transfer, source conflict, reliability issue, or UX finding into the final findings register and any affected specification/tracking document; confirm no uploaded video/transcript was silently skipped.
- [ ] Build a complete screen/state/interaction matrix so every relevant application surface has an explicit final-review entry rather than relying on spot checks.
- [ ] Build a **reference-coverage ledger for every canonical Blitzit image** currently indexed (46 total at this checkpoint: 22 current v2.6.69, 17 retained Help Center originals, 7 historical references). Each image must end with one explicit final-review disposition: directly compared to a reproducible Narro state; supporting/context-only evidence; superseded by stronger evidence; or not applicable with rationale. No canonical image may be silently skipped.
- [ ] Reconcile the final screen/state matrix against the Help Center evidence inventory as well as the image/video corpus: preserve the existing 34/34 visible legacy-page classification and 15/15 Narro-relevant deep-review coverage, and verify that every still-relevant behavior/state has a final implementation or explicit disposition.

### End-to-end implementation and engineering quality review

- [ ] Review the application end to end against `ENGINEERING_QUALITY.md`, established Rust/TypeScript/Tauri/SQLite engineering practices, and the repository's validated architecture/invariants.
  - Reconcile every cross-milestone replacement: when a later correction changed a foundation created in an earlier validated milestone, verify the final implementation against both the newer corrective acceptance criteria and every materially affected earlier invariant/acceptance criterion. Do not treat historical milestone PASS records as validation of replacement code.
- [ ] Perform a final local-desktop security/privacy surface review: Tauri capabilities/permissions and IPC exposure, command/input validation boundaries, external-URL activation, filesystem scope, SQLite/query boundaries, absence of unintended remote/network/telemetry paths, secret/token handling, dependency advisories, and release configuration. Any material risk must enter the final findings register with remediation or an explicit accepted limitation.
- [ ] Review state ownership, persistence boundaries, identity integrity, timer/session accounting, scheduling/timezone/recurrence behavior, lifecycle/window coordination, local-only/privacy boundaries, failure semantics, recovery paths, concurrency/stale-state handling, dependency/configuration hygiene, and release behavior for correctness and maintainability.
- [ ] Review code structure for unnecessary duplication, brittle coupling, dead/obsolete paths, unsafe assumptions, unclear ownership, weak typing/error models, and avoidable complexity without performing broad rewrites merely for style.
- [ ] Review performance-sensitive paths for unnecessary polling, idle work, excess renderer/native churn, avoidable persistence writes, memory/CPU regressions, and animation/transition overhead.
- [ ] Re-run the complete regression/anti-regression matrix appropriate to the release candidate, including the source-product reliability risks recorded in `docs/BLITZIT_HISTORY_RISK_INDEX.md`.
- [ ] Verify that meaningful edge cases and user-facing failure/loading/unavailable/recovery states have clear feedback throughout the application; record any missing state handling as a final-review finding.

### Professional UI/UX, accessibility, and visual-system review

- [ ] Review usability, discoverability, interaction consistency, information architecture, visual hierarchy, alignment, spacing rhythm, density, typography, readability, iconography, control affordance, feedback, and overall cross-surface consistency using established professional desktop-product design principles.
- [ ] Use explicit professional evaluation lenses rather than taste alone: Nielsen's usability heuristics; Gestalt principles such as proximity, similarity, common region and continuity; Fitts's Law for target acquisition; Hick-Hyman/choice-complexity considerations where menus or option sets are involved; progressive disclosure; recognition over recall; visibility of system status; error prevention/recovery; and Windows desktop conventions. These are evaluation/fallback lenses and must not override confirmed Blitzit parity unless an already-documented accessibility/reliability/Windows exception applies or source evidence is genuinely missing.
- [ ] Review keyboard operation, focus order/visibility, accessible names, target sizes, reduced-motion behavior, semantic state communication, and color/contrast against applicable accessibility standards, targeting WCAG 2.2 AA where relevant to the desktop UI. Record contrast evidence for normal text (4.5:1 target), large text (3:1), and meaningful non-text UI/state boundaries (3:1) where the criterion applies; do not rely on visual inspection alone.
- [ ] Review the final color palette and semantic color usage for contrast, state distinction, consistency, dark/light behavior, destructive/warning/success communication, and legibility.
- [ ] Review responsive/adaptive behavior across supported window sizes, Focus Panel/Floating Timer modes, Windows DPI/scaling levels, monitor configurations, long content, locale/time-format variation, and other layout-pressure states.
- [ ] Review hover, focus, pressed, selected, disabled, pending, loading, empty, error, unavailable, confirmation, success, notification, overlay, dialog, menu, tooltip, and transition states for consistent behavior and visual treatment.

### Detailed Blitzit visual and functional fidelity verification

**Binding final-review rule:** for in-scope personal/local functionality, an unexplained deviation from confirmed Blitzit behavior or visuals is a defect/finding, not an acceptable redesign. The release-candidate goal is maximum observable Blitzit parity from the strongest available evidence. Exceptions are limited to documented local-only exclusions, reliability/data-integrity corrections, accessibility/Windows correctness, genuine source ambiguity, or technical impossibility; each exception must have an explicit disposition.

- [ ] Compare every relevant Narro screen, state, component, and interaction against the available Blitzit screenshot, video, transcript, and source evidence; do not limit this pass to screens already covered by automated fixtures. Use direct video evidence specifically for motion, sequencing, transient states, and interaction behavior where the sequence is visible.
- [ ] Verify layout structure, dimensions, proportions, alignment, spacing, typography, wrapping/truncation, icons, colors, borders, radii, shadows/elevation, dividers, progress/timer presentation, states, overlays, dialogs, menus, empty states, error states, loading/waiting states, and interaction details.
- [ ] Compare light/dark variants and any state-specific references separately when source evidence exists.
- [ ] Verify that functionality shown or documented in the source product was not silently omitted during implementation. Any apparent missing transfer must be traced to implementation, an intentional Narro deviation, superseded/ambiguous source evidence, or an explicit product decision.
- [ ] Where stable comparable screenshots exist, use repeatable screenshot/capture comparison with recorded viewport/DPI/theme/state; where exact pixel comparison is not meaningful, record the design-system/behavioral comparison and rationale instead. For stable references, record key comparable measurements where useful (surface/component bounds, spacing/gaps, alignment offsets, typography size/weight/line-height, radii/borders, and representative color samples) so the result is not based only on subjective eyeballing.
- [ ] Explicitly revisit deferred audit/fidelity questions such as B1/B2/B3/B4 and resolve or disposition them from the strongest final evidence rather than silently carrying them into release.
- [ ] For any final evidence gap that remains genuinely unrecoverable after the relevant audit/reference pass, make and record the strongest professional product/design/engineering decision consistent with adjacent Blitzit evidence, Narro's established design system, Windows desktop conventions, accessibility and reliability; do not leave ordinary product behavior unfinished solely because an exact source detail is unavailable, and do not present the inferred choice as confirmed Blitzit behavior.

### Finding disposition, remediation, and final gate

- [ ] Create a single final-review findings register covering engineering, correctness, usability, accessibility, visual fidelity, missing functionality, state coverage, and reliability findings with severity/evidence/owner/disposition.
- [ ] For every finding, record one explicit disposition: fixed and validated; intentional Narro deviation; source ambiguity requiring a documented product decision; or accepted limitation with rationale. No finding may disappear without disposition.
- [ ] Implement remediation in narrow evidence-backed slices only after the review finding exists; do not use the final review as justification for an unrelated architecture rewrite.
- [ ] Re-run affected automated, Windows, visual, accessibility, and regression evidence after remediation and confirm fixes did not regress previously validated behavior.
- [ ] Perform a final end-to-end release-candidate pass after all review findings are dispositioned.
- [ ] Publish the final comprehensive review report with the reviewed source SHA, evidence matrix, unresolved/accepted limitations, final validation evidence, and aggregate final-review remediation diff.

**Final comprehensive review gate:** remains OPEN until all tasks above are actually performed after Milestone 10. Planning this stage does not satisfy any checkbox.

## Post-parity candidates — recorded, not scheduled

Do not implement these until Milestones 1–10 and the Final Comprehensive Review Stage are complete, unless the user explicitly changes scope:

- Tags/labels
- Calendar week/month view
- quick list assignment while typing title
- paste bulleted/numbered text as multiple tasks
- CSV task import
- optional automatic overtime without `Time's Up` interruption
- subtask time estimates/tracking
- richer app theme/icon customization
- partial-completion/day-by-day accounting
- bulk task operations
