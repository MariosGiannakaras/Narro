# TODO.md

Milestones are ordered. Do not skip ahead unless a later task is required to unblock the current one.

## Milestone 1 — Windows desktop scaffold, capability and performance spike

Goal: prove the selected Tauri stack and lightweight focus-window architecture before product UI is built.

- [x] Create a Tauri 2 + React + TypeScript scaffold targeting Windows 10/11 x64.
- [x] Add Rust modules for app state, persistence, timers, scheduling, and window coordination.
- [x] Add SQLite plus migration harness; create migration `0001` even if the initial schema is minimal.
- [x] Create only two initial webview windows: `main` and `focusSurface`.
- [x] Prove programmatic create/show/hide/destroy/recreate/focus behavior for `main` without losing Rust/domain state (fixed 800x600 recreation geometry only).
  - [x] implementation compiles in Windows CI
  - [x] interactive hide/show/destroy and background state mutation validation
  - [x] interactive async recreate opens and remains responsive
  - [x] exact Rust state visibly survives and updates correctly in recreated `main`
- [x] Implement two temporary modes on `focusSurface`: Focus Panel and compact Floating Timer.
  - [x] implementation compiles in Windows CI
  - [x] interactive validation
- [x] Prove switching those modes by resize/restyle of the same secondary webview (monitor-edge repositioning deferred).
  - [x] implementation compiles in Windows CI
  - [x] interactive Panel -> Timer -> Panel reuse validation
- [x] Prove always-on-top and skip-taskbar behavior for Floating Timer mode.
- [x] Prove Windows monitor enumeration and left/right positioning for Focus Panel mode.
  - [x] implementation and geometry tests automated-validated
  - [x] physical selected-monitor left/right validation
- [x] Prove display-topology change handling: connect/disconnect/re-enumerate displays and clamp windows to a visible work area without restarting Narro.
  - [x] event-driven implementation automated-validated
  - [x] physical disconnect/reconnect recovery validation
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
- [x] Build the `focusSurface` as a separate minimal frontend entry/bundle that does not import dashboard/reports/settings/editor code.
- [x] Measure floating-only steady-state CPU and process memory with the main webview destroyed/closed and no active animations.
  - [x] repeatable process-tree harness automated-validated by Windows CI #66
  - [x] three physical 30s-warmup / 60s-sample runs with zero process churn and `steadyStateValid: true`
- [x] Record measurements and obvious WebView2/process contributors in `STATUS.md`.
- [x] Decide the M1 floating performance baseline supports the current Tauri + WebView2 `focusSurface` architecture; retain native Win32/WinUI overlay only as a measured fallback.
- [x] Add a minimal smoke-test harness for Rust commands/events.
  - [x] harness created and compiles in Windows CI
  - [ ] explicit standalone interactive harness invocation remains optional/deferred; equivalent runtime paths were physically exercised during M1 validation

Acceptance criteria:

- `main` and `focusSurface` both project the same authoritative Rust application state
- Focus Panel -> Floating Timer -> Focus Panel does not create parallel secondary webviews or reset state
- Floating Timer remains above normal Windows apps and can be moved
- Focus Panel can move to selected monitor edge
- display connect/disconnect does not require app restart and cannot strand the focus surface off-screen
- one confirmed global shortcut registers and fires
- tray/background lifecycle, notification, and autostart registration/toggling/restart launch work locally
- SQLite migration v1 runs cleanly on a fresh app-data directory
- floating-only idle CPU is stable/near-idle with no unexplained polling loop
- floating-only memory is measured and documented; if clearly unacceptable, stop and evaluate a native Win32/WinUI overlay before product UI work

**Gate A result: PASS / proceed with current Tauri 2 + WebView2 architecture.** Targeted M1 physical capability and performance evidence is now complete. Later lifecycle checks are release-candidate revalidation, not unresolved M1 architecture proof.

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

- [ ] Reconcile confirmed production omissions discovered after Gate E without redoing the validated M5 foundation:
  - [ ] A1 List Duplicate: production wiring plus durable independent list/task identities.
  - [ ] A2 Render persisted local list icons on active/archive list surfaces with safe fallback.
  - [ ] A3 Top-of-lane `+` creates at highest priority atomically.
  - [ ] A4 Normal task create accepts optional EST atomically using existing duration validation.
  - [ ] A5 Main board task completion and explicit permanent-delete confirmation use validated persistence/session/report semantics.
  - [ ] A6 Pointer/keyboard completion into Done without treating Done as a normal planning reorder lane.
  - [ ] A7 Re-enable safe identity-based per-task edits in All Lists; aggregate reorder remains disabled.
  - [ ] A8 Search matched-substring highlighting with unchanged keyboard/focus behavior.
  - [ ] A9 Remove normal-main diagnostic JSON projection while preserving the user-facing Pomodoro resume prompt.
  - [ ] A19 Done lane shows the documented local-month completion count.
  - [ ] Evolve temporary static tests that encoded these earlier absences into final safety/product invariants.

**Gate E status: REOPENED by new repository-backed parity evidence on 2026-09-26.** The original 28 slices remain historically validated; this reconciliation gate must pass before Milestone 5 is again complete.

## Milestone 6 — Blitz Mode / Focus Panel

- [x] Start Blitz from eligible Today tasks.
- [x] Auto-select top eligible Today task.
- [x] Reproduce Focus Panel hierarchy: list selector, Today, quick controls, aggregate EST/progress, active live card, remaining queue, Add Task, scheduled group, done group.
- [x] Render current task and authoritative timer with fixed/tabular timer geometry.
- [x] Show remaining/scheduled/done sections matching documented focus workflow.
- [x] Implement break, notes, pause/resume, skip, finish.
- [x] Implement subtasks/progress in focus mode.
- [x] Permit EST/Time Taken editing only while paused.
- [x] Implement selected-monitor and left/right Focus Panel placement.
- [x] React to monitor/display changes while Focus Mode is open.
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

**Gate F result: PASS / proceed to Milestone 7.** All 16 Milestone 6 items are validated. PR #116 exact head `f0e02570308d86416861c53e1d296e5edb309ef8` passed Windows CI #445; expected-head guarded squash merge `ab5818fa92970655b63323839111a1977a5837a7` passed resulting-main Windows CI #446.

### 2026-09-26 parity/reliability reconciliation

- [ ] Reconcile confirmed Focus production omissions discovered after Gate F:
  - [ ] A10 Ordinary Focus rows expose the documented source-backed task actions with reserved geometry and keyboard/focus equivalents.
  - [ ] A11 Rocket / Make Live switches through authoritative timer/session APIs and preserves prior work.
  - [ ] A12 Focus queue reorder reuses validated persisted task ordering and stable IDs.
  - [ ] A13 Ordinary-row delete, schedule, notes and non-live completion reuse validated Main/domain boundaries.
  - [ ] A14 Replace disabled Focus `+ ADD TASK` with persistence-first creation; All Lists requires explicit owning-list choice.
  - [ ] A15 Focus Home exits the Focus surface through existing lifecycle without silently resetting timer/session state.
  - [ ] A16 Live-task title editing is available only through Notes and reuses stale-safe title persistence.
  - [ ] A17 Time's Up exposes Extend using the existing authoritative `timer_extend` transition.
  - [ ] Evolve temporary M6 static tests that froze placeholder/non-mutating controls.

**Gate F status: REOPENED by new repository-backed parity evidence on 2026-09-26.** The original 16 slices remain historically validated; this reconciliation gate must pass before Milestone 6 is again complete.


## Milestone 7 — Floating Timer mode

- [x] Implement compact mode by transforming the existing `focusSurface` window; do not create a third persistent webview.
- [x] Make it movable, always-on-top, and absent from normal taskbar presentation where appropriate.
  - [x] Native drag affordance, focusSurface-scoped drag capability, exact-head PR CI, guarded merge, and resulting-main CI are automated-validated.
  - [x] Physical Windows validation: Drag PASS; Return button PASS; Always-on-top PASS; no normal taskbar button PASS.
- [x] Implement collapsed state matching the supplied compact screenshot: title, live timer, subtask progress, add, expand.
- [x] Implement expanded action strip for Break, Notes, Pause/Resume, Skip, Done, return-to-panel.
- [ ] Implement expanded subtask rows with completion, title editing, reorder, delete and progress.
  - [x] Completion/reopen, reorder, delete, add and progress were automated-validated in the original M7 expanded-content slice.
  - [ ] A18 parity reconciliation: expanded Floating Timer must support stale-safe subtask title editing using the existing authoritative subtask mutation boundary.
- [x] Keep icon hit targets stable and show tooltips without changing window width.
- [ ] Implement Focus Panel <-> Floating Timer content transition with short one-shot opacity/transform motion; do not animate native window geometry in a high-frequency JS loop.
  - [x] Initial native hidden-stage transition correction, finite 150ms content motion, reduced-motion contract, exact-head PR CI, guarded merge and resulting-main CI are automated-validated.
  - [x] Physical-fail corrective candidate is automated-validated: target-edge DPI staging, focus-surface horizontal overflow suppression, and paint-gated collapsed/expanded resize publication; PR #122 exact-head CI #471 and resulting-main CI #472 PASS.
  - [x] Motion-smoothing corrective candidate is automated-validated: keyed Panel/Timer exit-before-native sequencing in both directions plus finite collapsed/expanded exit/resize/entrance sequencing; PR #123 exact-head CI #476 and resulting-main CI #477 PASS.
  - [x] Physical-fail compositor corrective candidate is automated-validated: settled Focus content is fully masked before native Panel/Timer geometry, collapsed/expanded resize uses an explicit hidden `resizing` phase, and a finite two-frame presented-frame barrier brackets native geometry; PR #124 exact-head CI #479 and resulting-main CI #480 PASS.
  - [x] Physical Windows CI #480 re-test evidence recorded: Panel -> Timer PASS; Timer -> Panel borderline/functional PASS; right-side return PASS; normal-size horizontal overflow PASS; timer/session continuity PASS; Expand/Collapse FAIL with repeated stale/duplicated action-strip pixels.
  - [x] Native hidden-resize corrective candidate: target hierarchy stays visibility-hidden through native hide/resize/show and a post-show frame opportunity, with physical-size/visibility rollback on error; PR #125 exact-head CI #486, guarded merge `a7161ac`, and resulting-main CI #487 PASS. Physical re-test remains open.
  - [x] Transition completion now observes the actual opacity animation or verified no-animation state for both mode changes and Timer expand/collapse; executable cancellation/no-transition tests and PR #136 exact-head CI #501 PASS. Guarded merge `0fc7401` has an identical tree; automatic main CI #502 was cancelled as redundant. Its later physical finding is recorded below.
  - [x] CI #501 physical retest found the expanded action strip still mounted alongside the collapsed heading. PR #138 gives action and subtask siblings distinct React keys; a three-cycle executable Edge DOM test passes and fails against the original duplicate keys. Exact-head CI #503 PASS; guarded merge `5e0e0c1` has an identical tree, and duplicate main CI #504 was cancelled. The physical result is recorded below.
  - [x] CI #503 physical retest: three native expand/collapse cycles, including visible subtask controls, showed no stale/duplicated action strip or collapsed-state pixels; Panel/Timer session continuity and normal-size no-overflow passed. Continuous transition smoothness and the unavailable display conditions remain open; see the 2026-09-25 work log.
  - [x] CI #507 follow-up: settled expand/collapse and session continuity again passed, but two 20 fps Panel→Timer captures showed blank/pale staging frames before Timer content rendered. The continuous no-flash criterion is FAIL; see `work-log/2026-09-25-codex-m7-panel-timer-flash-reproduction.md`.
  - [x] With actual Windows animations Off on CI #507, Panel→Timer and Timer→Panel both showed blank frames before the target content; nonessential translation was absent. Visual no-flash criterion remains FAIL; see `work-log/2026-09-25-codex-m7-os-reduced-motion-physical.md`.
  - [x] PR #140 keeps a usable collapse control after the last live task ends while Timer is expanded and avoids empty Pomodoro notification write locks. Executable Edge click and Rust contention tests passed CI #505; guarded merge `aafa7de` has the identical source tree and duplicate main CI #506 was cancelled. Physical keyboard collapse to native 356×118 PASS.
  - [x] Hidden-publication corrective source is automated-validated: native prepare/reveal now keeps the host hidden while React synchronously publishes a prepainted target root before reveal, with explicit previous-mode recovery on frame/reveal/cancellation failure. PR #145 exact head `f901fa907b550e921daf32123ec84a49aebb7006` passed Windows CI #513; expected-head guarded squash merge `c875b4894e90cc75c04c9ff9508ef1dc1a176ad5` passed resulting-main Windows CI #514. Physical Windows re-validation remains open.
  - [x] User-provided 60 fps CI #514 physical recording confirms the hidden-publication correction still FAILS the continuous criterion: with normal Windows animations the mode switch exposes transient target loading/staging content; after `Show animations in Windows` is visibly switched Off, Panel/Timer transitions around ~32.8s and ~34.3s expose blank white target-host frames before content. PR #147 adds one-shot native transparent host prewarm so WebView2 is actually visible/painting at alpha 0 before the existing two-frame barrier and reveal. Exact head `8f173cd37fc8d1506ec546feb2248e92db81cebe` passed Windows CI #516; guarded merge `f59e4d16a49659832ea562c3718cc5ba748b74fb` passed resulting-main CI #517. Physical retest from #517 remains open.
  - [x] CI #517 user-provided 60 fps retest narrowed the remaining failure to renderer readiness: the native blank-host flash is gone, but Panel→Timer briefly reveals `No active focus task` around ~4.55s before live task `fas` appears at ~4.60s, and Timer→Panel briefly reveals `Loading Focus Panel…` around ~20.25s before the settled Panel at ~20.30s. PR #148 gates Panel reveal on settled board+timer projections (exact-head CI #518 PASS; resulting-main CI #519 PASS). PR #150 gates Timer reveal on settled timer projection plus matching live-task board snapshot (exact head `a4dd2839a84fc4cd69c2d7ed55beb224cc6d811f`, CI #520 PASS; merged main `445aa37b9b8441c9351d5dd87ff353690b3050c2`, resulting-main CI #521 PASS). Physical retest from #521 remains open.
  - [x] CI #521 user-provided 60 fps physical retest remains FAIL for Panel↔Timer continuity. With normal Windows animations, ~8.300s briefly shows `No active focus task` before live task `fas` at ~8.333s and ~10.600s shows `Loading Focus Panel…` before the settled Panel at ~10.633s; equivalent loading/staging remains with actual Windows animations Off around ~35.267s and ~40.700s. The readiness gates were ordered after transparent prewarm, so PR #151 reorders both success and recovery to `prepare -> publish -> readiness while hidden -> transparent prewarm -> presented-frame barrier -> reveal`. Exact head `077c2ea4b74e1f346a7ca3b9e9ec7cb76b2ca451` passed Windows CI #522; merged main source `8c3a108ec2c8ebdea0e5c1aa2b234490d718aff2` passed resulting-main CI #523. Physical Panel↔Timer confirmation remains open and may be batched with the later M7 manual matrix; it is not counted as PASS.
  - [x] CI #530 exact-build physical re-test on 2026-09-26: three settled Panel→Timer→Panel shortcut cycles retained one Focus window and paused task, but continuous capture with Windows animations On visibly exposed a pale empty focus frame and then desktop before Timer. Gate 7 visual continuity remains **FAIL**. See `work-log/2026-09-26-codex-m7-ci530-panel-timer-physical-fail.md`; animations Off and the rest of the latest-build matrix were not run.
  - [x] Independent second audit of the same CI #521 recording, rechecked frame-by-frame, confirms a separate Expand/Collapse continuity failure not covered by PR #151: with animations On, Expand around ~9.53–9.65s exposes an enlarged mostly empty Timer before expanded controls; Collapse around ~17.2s hides expanded content before the native surface finishes shrinking and then republishes collapsed content. The same class reproduces with Windows animations Off around ~43.02–43.13s on Expand and ~37.38s on Collapse. Treat this as a distinct resize visibility/readiness issue. #151 resulting-main validation is complete; by explicit user direction, the Panel↔Timer physical retest may be batched later, so this independently evidenced corrective slice may proceed now without marking the deferred manual gate PASS.
  - [x] Expand/Collapse empty-surface corrective source is automated-validated: PR #153 replaces the visible child fade/hide resize sequence with an atomic transparent-host swap (`cloak -> native resize -> synchronous target publish -> finite frame barrier -> uncloak`) while preserving native geometry/rollback authority and the solved duplicate-key/stale-pixel behavior. Exact head `ed046af079038952f5877b19324b6bf36912e69f` passed Windows CI #527; merged main `57a18a2b9ffd81b1b2d968c54bf1e997311c0cd8` passed Windows CI #528. Physical Expand/Collapse confirmation remains open and is batched with the remaining M7 Windows matrix.
  - [ ] Physical Windows re-validation: no left/staging flash, no horizontal focus-surface scrollbar, no stale/duplicated expanded pixels during expand/collapse, and no abrupt return flicker.
- [ ] Implement shortcut to alternate Focus Panel/Floating Timer.
  - [x] Ctrl+Shift+T implementation passed PR #126 exact-head CI #488, guarded merge `77e535f`, and resulting-main CI #489.
  - [x] Concurrent native registration/retry and diagnostic publication are serialized; executable Rust concurrency/conflict/rollback tests and frontend retry-state tests passed PR #143 exact-head CI #507. Guarded merge `fce15f8` has the same tree; duplicate main CI #508 was cancelled. Scoped physical results appear below.
  - [x] Physical Panel/Timer shortcut use and session continuity passed on CI #503; one rapid repeated press settled to one Timer window.
  - [x] Physical CI #507 Ctrl+Shift+T, rapid repeated press, both-chord ownership conflict and retry after release passed with one Focus window and the same paused session. Further transition-boundary stress remains open.
- [ ] Implement shortcut to locate/animate Floating Timer using a restrained finite attention pulse.
  - [x] Ctrl+Shift+P and finite attention pulse passed PR #127 exact-head CI #490, guarded merge `53c0376`, and resulting-main CI #491.
  - [x] The shared PR #143 registration/retry state machine and executable concurrency/conflict/rollback tests passed exact-head CI #507; guarded merge `fce15f8` has the identical tree. Scoped current-build physical results appear below.
  - [x] Physical visible/hidden Timer and Panel-mode shortcut behavior passed on CI #503; pulses ended in about 729/726 ms, or about 186 ms with reduced-motion media emulation.
  - [x] Physical CI #507 visible-Timer Ctrl+Shift+P pulse and Panel-mode no-op passed; native-hidden Timer on this exact build was not retested.
  - [x] Physical Windows OS animations Off: visible-Timer Ctrl+Shift+P gave one finite pulse and returned to settled state on CI #507. The original OS setting was restored.
  - [ ] Repeated native-hidden/Panel interactions and post-fix reduced-motion retest remain open.
- [ ] Persist a safe last position and recover after monitor changes/restart.
  - [x] Native SQLite placement/relative recovery passed PR #128 exact-head CI #492, expected-head guarded merge `778a1bc`, and resulting-main CI #493.
  - [x] Visible Timer topology recovery now fits and repositions the measured outer window, including when no saved placement exists; PR #134 exact-head CI #499, guarded merge `c9ae591`, and resulting-main CI #500 PASS.
  - [x] Physical drag, Panel return/reopen, and same-monitor process restart restored the Timer at the moved position with the same paused session on CI #503.
  - [ ] Physical secondary-monitor/topology change and no-saved-position recovery checks remain open.
- [ ] Validate always-on-top against normal maximized and borderless full-screen Windows apps; document exclusive-fullscreen limitations if any.
  - [x] Document the Windows DirectFlip/Independent Flip composition caveat and separate exclusive-fullscreen observation in `docs/M7_FLOATING_RUNTIME_VALIDATION.md`.
  - [x] Physical stacking above maximized Edge and Edge F11 fullscreen passed on CI #503.
  - [ ] Physical independent borderless-app and optional exclusive-fullscreen stacking checks remain open.
- [ ] Verify expanded content remains on-screen when the widget is close to bottom/taskbar; reposition/anchor safely rather than overflowing unusably.
  - [x] Native hidden-resize work-area anchoring passed PR #130 exact-head CI #494, expected-head guarded merge `50cef42`, and resulting-main CI #495.
  - [x] Constrained work-area recovery fits native outer size before placement and keeps expanded controls scrollable at narrow/short DPI-scaled sizes; PR #132 exact-head CI #497, guarded merge `59bdc2d`, and resulting-main CI #498 PASS.
  - [x] Restore and live display-change paths reuse measured native fit/placement, with rollback on failure; PR #134 exact-head CI #499, guarded merge `c9ae591`, and resulting-main CI #500 PASS.
  - [x] Physical primary-work-area bottom expansion fitted the 356×308 native outer window at y=772 with lowest controls reachable and collapse usable on CI #503.
  - [ ] Physical non-default taskbar, secondary-monitor, constrained work area and high-DPI checks remain open.
- [x] Verify no decorative animation runs continuously while idle.
  - [x] Static Floating Timer motion audit: finite attention pulse and transitions only; live timer sampling is conditional on active states. The only `infinite` title scroll belongs to the Focus Panel. See `work-log/2026-09-24-codex-m7-idle-motion-audit.md`.
  - [x] Physical CI #503 collapsed/expanded paused idle: zero running DOM animations/pulse nodes, and paired settled screenshots byte-identical. True-idle collapsed CI #505 also showed zero animations. Revalidate if later source changes idle motion.
- [x] Re-run Milestone 1 floating-only CPU/memory measurements after final UI is present.
  - [x] CI #505 executable on Windows 10 with `main` destroyed: three valid 30s/60s runs per collapsed/expanded true-idle state, zero churn, idle CPU median 0.000% of one core in each state; separate running-timer run averaged 0.155%. Working set medians were 429.76/421.39 MiB, private medians 375.19/327.56 MiB. See 2026-09-25 work log for per-run ranges, warm-state caveat, source/artifact identity, and profile restoration. Re-measure after future performance-relevant source changes.

Acceptance criteria:

- switching modes never resets/duplicates session
- timer remains synchronized with authoritative Rust state
- no second focus webview is created during normal switching
- collapsed/expanded states visually match the supplied hierarchy and density
- saved position survives restart when still valid
- lost/off-screen position is recoverable
- final floating UI has no unexplained idle CPU or major memory regression versus Milestone 1 baseline
- reduced-motion mode removes nonessential translation/scale while preserving clear feedback

## Milestone 8 — Windows shortcuts and preferences

- [ ] Implement confirmed Windows in-app shortcuts.
- [ ] Implement confirmed Windows global shortcuts plus per-global enable toggles.
- [ ] Add conflict/error feedback for unavailable global shortcuts.
- [ ] Implement Preferences sections evidenced in screenshots/docs: monitor/side, hide times, EST parsing, theme, timezone, Pomodoro, break/work durations, scrolling title, timed alerts, sounds/previews, timer flash, notification alerts, schedule reminders, completion celebration.
- [ ] Ensure Start Break shortcut pauses the current task, starts break, and follows documented resume/skip behavior.
- [ ] Preserve conditional/nested setting behavior without disruptive scroll jumps.
- [ ] Use Windows locale for date/time presentation by default.
- [ ] Persist preferences in SQLite or a versioned local settings layer.

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
- [ ] Run the complete screenshot-fidelity checklist in `docs/UI_UX_SPEC.md` in dark/light themes where applicable.
- [ ] Confirm animation does not cause task-row/card geometry changes or persistent idle CPU work.
- [ ] Cross-check source-product anti-regressions in `docs/SOURCE_AUDIT.md` and `docs/BLITZIT_HISTORY_RISK_INDEX.md`: no lost tracked time, no duplicate tasks from reorder/schedule moves, no wrong-day schedule shifts, no restart-required monitor hotplug, no surprise URL launch, and no post-pause/manual-edit timer-vs-ledger divergence.
- [ ] Update `README.md`, `STATUS.md`, and `TODO.md` for release-candidate reality.

## Post-parity candidates — recorded, not scheduled

Do not implement these until Milestones 1–10 parity/reliability work is stable or the user explicitly changes scope:

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
