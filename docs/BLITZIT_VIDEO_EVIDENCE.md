# Blitzit Video / Transcript Evidence Index

Status: **INITIAL CORPUS INGESTION COMPLETE — 19/19 pairs analyzed, reconciled, and dispositioned on 2026-09-27**

Raw source location:

- `reference/original-blitzit-videos/inbox/`

Coverage tracker:

- `docs/BLITZIT_VIDEO_ANALYSIS_TRACKER.md`

Methodology:

- `docs/INTERACTION_CAPTURE_GUIDE.md`

Related evidence:

- `docs/RESEARCH_EVIDENCE.md`
- `docs/SOURCE_AUDIT.md`
- `docs/BLITZIT_HISTORY_RISK_INDEX.md`
- `docs/UI_UX_SPEC.md`
- `docs/BEHAVIOR_MATRIX.md`

## Purpose and interpretation rule

This document is the durable index for user-supplied Blitzit videos and transcripts. It exists so interaction evidence is not trapped in chat history and so later agents can trace UI/UX, motion, behavior, reliability, and parity decisions to source files and timestamps.

Raw uploads are **tutorial/source evidence, not automatically product requirements**. Narration may explain marketing, pricing, accounts, integrations, future plans, personal workflow advice, or behavior that is not actually demonstrated in-product. Those sections are not Narro gaps unless product behavior is independently evidenced and relevant to Narro's scope.

For every material observation:

- **VIDEO-DIRECT** — visible/audible directly in the recording.
- **TRANSCRIPT-CLAIM** — stated in narration/transcript but not independently established by the visible recording.
- **CORROBORATED** — agrees with another recording, supplied screenshot, official documentation, or established repository evidence.
- **CONFLICT** — materially disagrees with another source.
- **INFERENCE** — reasoned interpretation that the source does not directly establish.
- **NARRO-DECISION** — product/implementation choice after applying Narro invariants and evidence precedence.

Never promote a transcript claim or inference to direct observation.

## Corpus manifest

All 38 raw files were inventoried. Every MP4 has a same-basename SRT; there are no unpaired files.

| ID | Video / transcript pair | Video metadata | Material workflows | Final state |
| --- | --- | --- | --- | --- |
| VE-001 | `Blitzit Explained Simplify Your Tasks and Stay in Flow.{mp4,srt}` | 02:19.088, 1920×1080, 30 fps | core loop, Focus/Floating, completion, preferences; marketing/context | DISPOSITIONED |
| VE-002 | `Blitzit Tutorial Add Estimated Time Directly in Task Name.{mp4,srt}` | 01:21.633, 426×240, 30 fps | EST suffix parsing | DISPOSITIONED |
| VE-003 | `Blitzit Tutorial Blitz Mode.{mp4,srt}` | 03:15.651, 1920×1080, 60 fps | Focus queue, Panel↔Timer, completion success flow | DISPOSITIONED |
| VE-004 | `Blitzit Tutorial Getting Started with Blitzit.{mp4,srt}` | 04:09.870, 1920×1080, 60 fps | onboarding, Home/List/Focus overview; account/pricing context | DISPOSITIONED |
| VE-005 | `Blitzit Tutorial How to Add & Manage Tasks and Lists in Blitzit.{mp4,srt}` | 03:38.848, 1920×1080, 60 fps | lists, board, task menu, EST/Time Taken, Done | DISPOSITIONED |
| VE-006 | `Blitzit Tutorial How to Delete & Archive Tasks and Lists.{mp4,srt}` | 01:23.963, 1920×1080, 60 fps | permanent task delete, list archive/restore/delete, archived Done | DISPOSITIONED |
| VE-007 | `Blitzit Tutorial How to Schedule Task Reminders.{mp4,srt}` | 02:52.803, 1920×1080, 60 fps | schedule date/time, recurrence presets, update/remove | DISPOSITIONED |
| VE-008 | `Blitzit Tutorial How to Set Up Recurring Tasks.{mp4,srt}` | 02:46.905, 1920×1080, 60 fps | recurrence parent/children/materialization/remove | DISPOSITIONED |
| VE-009 | `Blitzit Tutorial How to Use Custom Recurring Schedules.{mp4,srt}` | 02:39.893, 1920×1080, 60 fps | custom day/week/month/year recurrence | DISPOSITIONED |
| VE-010 | `Blitzit Tutorial How to Use Notes.{mp4,srt}` | 01:13.561, 1920×1080, 60 fps | rich notes, link handling | DISPOSITIONED |
| VE-011 | `Blitzit Tutorial How to Use Reports.{mp4,srt}` | 03:10.450, 1920×1080, 60 fps | report filters, metrics, charts, productive-time cards | DISPOSITIONED |
| VE-012 | `Blitzit Tutorial How to Use Reports -Update Improved Sessions and Stats.{mp4,srt}` | 06:56.357, 1920×1080, 30 fps | session-derived report metrics, daily graph, Done timing | DISPOSITIONED |
| VE-013 | `Blitzit Tutorial How to Use Subtasks in Blitzit.{mp4,srt}` | 02:20.109, 1920×1080, 60 fps | subtask add/reorder/delete/complete, Focus limitation, integrations context | DISPOSITIONED |
| VE-014 | `Blitzit Tutorial Preferences.{mp4,srt}` | 02:48.484, 1920×1080, 60 fps | Blitz Panel, General, Blitz mode, Alerts, Celebration | DISPOSITIONED |
| VE-015 | `Blitzit Tutorial Sessions Walkthrough.{mp4,srt}` | 02:56.216, 1920×1080, 60 fps | Sessions filters, inline/edit panel, add/delete, export surface | DISPOSITIONED |
| VE-016 | `Blitzit Tutorial Timer Modes.{mp4,srt}` | 02:55.380, 1920×1080, 60 fps | EST/Time's Up/Extend, Pomodoro, count-up, Time Taken | DISPOSITIONED |
| VE-017 | `Blitzit Tutorial Update Recurring Schedules.{mp4,srt}` | 02:50.063, 1920×1080, 60 fps | replace/delete existing children, detachment | DISPOSITIONED |
| VE-018 | `Daniel's Productive Planning Workflow with Blitzit.{mp4,srt}` | 03:33.090, 1920×1080, 60 fps | planning workflow, priority, Focus/break | DISPOSITIONED |
| VE-019 | `Oct Update Light mode and more!🚀.{mp4,srt}` | 02:52.989, 1920×1080, 30 fps | historical Floating subtasks, settings/theme update | DISPOSITIONED |

## Timestamped observations and Narro reconciliation

### VE-001 — product explainer

#### 00:00:32–00:01:19 — core planning → Focus → completion loop

- **Starting state:** task/list planning UI and board are shown as the narration moves from organization into focused work.
- **Trigger:** user starts Blitz/focus work; later completes the live task.
- **Immediate feedback / result:** visible live timer/Focus presentation, compact floating timer, notes/subtasks, and a completion celebration are shown in montage form.
- **Window behavior:** Focus Panel is shown beside another application; a compact timer is shown as a persistent work companion.
- **Motion:** montage/cuts prevent trustworthy duration/easing measurement.
- **Evidence:** VIDEO-DIRECT for the shown states; TRANSCRIPT-CLAIM for the full causal detail described by narration.
- **Narro comparison:** core plan→focus→complete loop is already represented by M5/M6/M7; completion celebration belongs to active M8.
- **Disposition:** CORROBORATED / already correct or already planned.

#### 00:01:21–00:02:16 — integrations, future roadmap, community, pricing

- Narration discusses Notion/Google Calendar, future integrations, mobile, AI, list sharing, community and commercial plans.
- **Evidence:** TRANSCRIPT-CLAIM/tutorial context, not Narro product behavior evidence.
- **Narro comparison:** accounts/cloud/integrations/AI/mobile/subscriptions are explicit Narro exclusions.
- **Disposition:** irrelevant to Narro product scope; no gap.

### VE-002 — EST suffix parsing

#### 00:00:17.920–00:01:00.879 — parse estimate from title suffix

- **Starting state:** inline task creation exposes a title field and a separate EST field.
- **Trigger:** user types estimate-like suffixes at the end of the task title, including `28 m`, `1 HR`, and `2 HR 15 m`.
- **Immediate feedback:** the EST field updates to the parsed duration.
- **Final state:** direct frame evidence around 00:00:31 shows the saved card title as `Prepare slides` while the estimate is shown separately as `28 min`; the parsed suffix is not retained in the visible persisted title.
- **Layout/state:** parsing occurs inside the existing create row; no separate modal or disruptive layout transition is visible.
- **Evidence:** VIDEO-DIRECT + TRANSCRIPT-CLAIM; CORROBORATED with existing screenshot/docs evidence that EST auto-parse is preference-controlled.
- **Narro comparison:** `PreferencesPayload.general.auto_parse_est_from_title` exists, but the runtime parser is an open M8 consumer. `BEHAVIOR_MATRIX.md` previously left exact title normalization unresolved.
- **Disposition:** **real missing active-M8 behavior; exact title normalization is now resolved by direct evidence.** When parsing is enabled and a supported terminal duration is successfully parsed, store the duration as EST and normalize the title by removing that parsed suffix; preserve ordinary titles and explicit EST editing.

### VE-003 — Blitz mode / Focus Panel / Floating Timer

#### 00:00:19.200–00:01:16 — enter Focus and manage the queue

- **Starting state:** prioritized Today tasks, highest priority at top.
- **Trigger:** `Blitz now`.
- **Immediate feedback:** Focus Panel opens with the top task live and remaining tasks queued below.
- **Interaction flow:** visible queue supports ordinary-task reorder/actions; Rocket/Make Live switches the live task; completed work remains visible in a Done area; list selector includes All Lists.
- **Evidence:** VIDEO-DIRECT, corroborated by transcript and M6 source evidence.
- **Narro comparison:** M6 A10–A17 already covers ordinary Focus actions, Make Live, All Lists semantics, add task, Home, Notes title editing and Time's Up Extend.
- **Disposition:** already correct; do not reopen M6 without a narrower contradictory finding.

#### 00:02:04–00:02:44 — Focus Panel → Floating Timer → Panel

- **Starting state:** full Focus Panel.
- **Trigger:** top-right compact/focus control.
- **Immediate feedback:** the same focus presentation collapses into a compact floating timer; reverse control returns to the panel.
- **Window behavior:** narration and direct video show draggable, always-on-top compact timer behavior.
- **Motion:** 100 ms frame sampling around 00:02:11 shows full panel at ~131.0–131.1 s, intermediate reduced geometry at ~131.2 s, and settled compact timer at ~131.3 s. A reliable coarse estimate is roughly **0.2–0.3 s** for the visible resize/reposition sequence. The recording does not reliably establish easing or an opacity fade.
- **Evidence:** VIDEO-DIRECT + CORROBORATED.
- **Narro comparison:** M7 source implementation is already automated-validated; physical continuity/animation/monitor checks remain OPEN.
- **Disposition:** use as M7 physical/fidelity evidence; do not mark deferred Windows checks PASS from the recording.

#### 00:02:45–00:02:56 — Done with success screen enabled

- **Starting state:** live task in Focus Panel.
- **Trigger:** user activates Done.
- **Immediate feedback:** the live card is shown completed/struck through and a success state appears with `Well done!`, celebratory imagery, completion text, `Next Task`, and `Take a Break`; EST/Taken summary remains visible.
- **Final state observed:** the next task becomes live only after the explicit `Next Task` action is activated in the recording.
- **Evidence:** VIDEO-DIRECT. Narration also says Blitz moves the user to the next task **or offers** a break.
- **Narro comparison:** current Narro `FocusLiveActions.handleDone()` commits completion and automatically starts the next eligible task. Repository docs explicitly kept this B4 behavior unresolved because earlier evidence was insufficient. M8 already owns `show_success_screen` and celebration settings.
- **Disposition:** **conditional conflict / real M8 behavior gap.** When the success screen preference is enabled, completion must not silently auto-start the next task before the success choice. `Next Task` is directly evidenced. A `Take a Break` control is directly visible, but this recording does not show its post-click timer/domain outcome; do not invent that unobserved transition. When the success screen is disabled, current auto-start behavior remains unresolved by this sequence and must not be changed solely from it.

### VE-004 — Getting Started

#### 00:01:24–00:03:20 — Home/list/task/Focus overview

- **VIDEO-DIRECT:** Home list creation, list edit/open, board lanes, task creation, task detail actions, Blitz/Focus entry, compact floating timer and basic live controls are shown.
- **TRANSCRIPT-CLAIM:** top task starts live on Blitz entry; notes/subtasks/EST are editable task details; compact timer exposes break/pause/skip/notes/Done.
- **Narro comparison:** these capabilities are already covered by M5–M7 and current docs.
- **Disposition:** corroboration only.

#### 00:00:39–00:01:22 and 00:03:38–00:03:55 — account/login/trial/pricing

- **Evidence:** tutorial/context material rather than relevant Narro UI behavior.
- **Disposition:** explicit Narro exclusions; no gaps.

### VE-005 — Add & Manage Tasks and Lists

#### 00:00:22–00:00:38 — create/edit list

- **VIDEO-DIRECT:** create-list modal exposes name, icon and color; list menu later provides edit.
- **Narro comparison:** M5 validated Create/Edit List, local icon handling and list presentation.
- **Disposition:** already correct.

#### 00:00:40–00:01:23 — board hierarchy and All Lists

- **VIDEO-DIRECT / TRANSCRIPT-CLAIM:** Backlog, This Week, Today and Done hierarchy; single-list vs All Lists; top-of-list priority.
- **Narro comparison:** board lanes/aggregate projection are validated; scheduled semantics remain governed by Narro's local-date rules.
- **Disposition:** already correct / corroborated.

#### 00:01:25–00:02:00 — task create, reorder and overflow menu

- **Starting state:** task card on the board.
- **Trigger:** hover reveals card actions; overflow menu is opened.
- **Immediate feedback:** menu directly shows `Schedule`, `Change List`, `Duplicate`, `Delete`.
- **Final result:** narration explicitly describes moving a task to another list and duplicating it as current actions.
- **Evidence:** VIDEO-DIRECT + TRANSCRIPT-CLAIM, now stronger than the older screenshot-only evidence used for prior audit B1.
- **Narro comparison:** durable M2 task duplication exists, but current production `TaskCard`/`ListBoard` exposes reorder/delete/schedule and does not expose a task `Change List`/`Duplicate` renderer path or corresponding Tauri commands for those actions.
- **Disposition:** **real missing behavior discovered after M5 validation.** Track as a narrow evidence-backed corrective slice; do not reopen or re-audit unrelated M5 work. Duplicate must create a new independent identity; Change List must move the same task identity atomically and preserve schedule/session invariants.

#### 00:02:02–00:02:40 — EST / Time Taken

- **VIDEO-DIRECT / TRANSCRIPT-CLAIM:** EST can be entered through task metrics and during create; live-task EST edits require pause; Time Taken tracks actual work and can be manually adjusted.
- **Narro comparison:** M3/M5/M6 already enforce authoritative time/session state and paused live metric editing.
- **Disposition:** already correct.

#### 00:02:45–00:03:18 — completion and success feedback

- **VIDEO-DIRECT:** board checkbox moves task to Done; Focus Done presents success feedback including early/late-versus-EST information and next/break choice.
- **Narro comparison:** completion is implemented; success-screen behavior routes to active M8 as recorded under VE-003.
- **Disposition:** corroborates VE-F002; no duplicate TODO.

### VE-006 — Delete & Archive

#### 00:00:10–00:00:23 — permanent task delete

- **VIDEO-DIRECT:** task overflow delete action.
- **TRANSCRIPT-CLAIM:** deletion is permanent and deleted tasks do not appear in reports.
- **Narro comparison:** permanent-delete/report-exclusion semantics are validated in M2/M5.
- **Disposition:** already correct.

#### 00:00:26–00:00:58 — list archive / restore / delete forever

- **VIDEO-DIRECT:** list menu archive, Archived Lists surface, restore/unarchive and permanent delete controls.
- **Narro comparison:** M5 list settings/archive flows already implement persistence-first archive/restore/delete.
- **Disposition:** already correct.

#### 00:00:59–00:01:08 — Done tasks older than 60 days

- **TRANSCRIPT-CLAIM:** completed tasks older than 60 days are automatically archived. The video shows the Archived Done surface but does not independently prove the 60-day automation trigger.
- **Narro comparison:** do not create a new Narro auto-archive requirement from narration alone; current explicit archive/report rules remain authoritative.
- **Disposition:** ambiguous source policy, no Narro change.

### VE-007 — Schedule Task Reminders

#### 00:00:12–00:01:02 — schedule date/time

- **VIDEO-DIRECT:** task overflow opens schedule UI; date selection and a subsequent time step are visible.
- **TRANSCRIPT-CLAIM:** quick choices include Today, Later Today (+2h), Tomorrow and Next Week (+7d); date-only task moves into Today on due date.
- **Narro comparison:** M4 date-only/local-time scheduling and due-lane semantics are already validated.
- **Disposition:** already correct; quick-preset exact labels are fidelity evidence, not a new correctness model.

#### 00:01:06–00:02:30 — recurrence, update and remove schedule

- **VIDEO-DIRECT / TRANSCRIPT-CLAIM:** recurrence presets, parent/child model, Update Schedule, and X removal while retaining task identity.
- **Narro comparison:** M4 covers these boundaries with idempotent materialization and stable IDs.
- **Disposition:** already correct / corroborated.

### VE-008 — recurring task setup

#### 00:00:26–00:01:53 — recurrence presets and weekly materialization

- **VIDEO-DIRECT / TRANSCRIPT-CLAIM:** schedule menu offers daily, weekday, selected weekday and monthly recurrence; parent remains Backlog; children materialize for the due week and behave like normal tasks.
- **Narro comparison:** M4 implements recurrence presets, recurring parent and Monday-of-due-week child materialization.
- **Disposition:** already correct.

#### 00:02:00–00:02:25 — update/remove recurrence

- **VIDEO-DIRECT / TRANSCRIPT-CLAIM:** Update Schedule changes recurrence; removing recurrence from parent leaves existing children.
- **Narro comparison:** M4 detachment semantics preserve modified/independent children.
- **Disposition:** already correct.

### VE-009 — custom recurring schedules

#### 00:00:25–00:02:14 — custom interval editor

- **VIDEO-DIRECT / TRANSCRIPT-CLAIM:** custom recurrence selects interval unit (days/weeks/months/years) and count; weekly rules select weekdays; monthly rules choose same calendar date or ordinal weekday; yearly rules repeat same date with interval count. Human-readable summaries are shown below controls.
- **Narro comparison:** M4 implements custom interval/unit/weekday rules and current docs already include monthly/yearly semantics.
- **Disposition:** already correct; retain as M4 regression/fidelity evidence.

### VE-010 — Notes

#### 00:00:21–00:00:44 — rich note editing

- **VIDEO-DIRECT:** Notes expansion, typing, bold/italic/strike/bullets and undo/redo toolbar.
- **Narro comparison:** M5 rich notes intentionally use a constrained local format and validated editor behavior.
- **Disposition:** already correct.

#### 00:00:45–00:01:00 — note URL behavior

- **VIDEO-DIRECT:** pasted URL becomes a clickable-looking link; around the live transition the browser appears without a visible explicit link activation in the inspected frame sequence.
- **TRANSCRIPT-CLAIM:** links automatically open in the default browser when the task goes live.
- **CORROBORATED:** this matches previously documented Blitzit auto-open behavior/risk.
- **Narro comparison:** Narro deliberately requires explicit pointer/keyboard activation for note URLs to avoid surprise navigation and timer coupling.
- **Disposition:** **intentional Narro deviation; do not copy source behavior.** No gap.

### VE-011 — Reports

#### 00:00:11–00:01:39 — reports filters, headline metrics and daily graph

- **VIDEO-DIRECT:** Reports navigation, list/date-range filters, metric cards and daily graph with selectable series.
- **TRANSCRIPT-CLAIM:** metrics include total work days, tasks done, total hours and average time/task; graph separates task, break and total session time.
- **Narro comparison:** M9 remains future work; its report totals must derive from the authoritative session ledger rather than a mutable parallel cache.
- **Disposition:** route as M9 implementation/fidelity evidence; do not front-run M9 during M8.

#### 00:01:40–00:03:00 — productive-time cards / time by list / Done rows

- **VIDEO-DIRECT:** most productive hour/day/month, time-by-list visualization and Done-task rows are shown.
- **Narro comparison:** already represented in M9 scope/spec.
- **Disposition:** future M9 evidence, no current source change.

### VE-012 — improved Reports / session-derived statistics

#### 00:00:23–00:03:55 — session-derived headline metrics and daily graph

- **VIDEO-DIRECT / TRANSCRIPT-CLAIM:** update is explicitly framed as improving report accuracy by recording daily task/break sessions; cards derive work days, tasks done, total hours and average time/task; graph exposes task/break/total.
- **Narro comparison:** strongly corroborates the M9 decision to derive reports from the same durable session ledger as M3.
- **Disposition:** future M9 evidence; reliability invariant already aligned.

#### 00:03:55–00:06:47 — productive-time, time-by-list, Done early/late metrics

- **VIDEO-DIRECT:** productive hour/day/month, time-by-list and Done rows with durations/early-late presentation.
- **TRANSCRIPT-CLAIM:** zero tracked time can occur when a task is simply marked Done without recorded session time; early/late ratio is calculated from accumulated early/late duration.
- **Narro comparison:** M9 may reproduce useful presentation but must not reintroduce Blitzit's historical tracked-time-loss failure class.
- **Disposition:** M9 evidence; no current change.

### VE-013 — Subtasks

#### 00:00:11–00:00:59 — board subtasks

- **VIDEO-DIRECT:** expand/add, up/down reorder, delete, completion checkbox and progress indicator update.
- **Narro comparison:** M5/M6 subtask identity/mutation paths already cover add/edit/reorder/delete/complete.
- **Disposition:** already correct.

#### 00:01:01–00:01:22 — Focus subtasks and source limitation

- **VIDEO-DIRECT / TRANSCRIPT-CLAIM:** Focus can show/manage subtasks; narration states at least one existing subtask is currently needed before the Focus controls become available.
- **CONFLICT/HISTORICAL:** VE-019 (Nov 2024 update) describes the same source limitation. Narro's validated Focus/Floating implementation intentionally supports the complete local subtask workflow without needing to reproduce that source limitation.
- **Disposition:** source limitation, not a Narro gap; do not regress Narro.

#### 00:01:23–00:02:02 — Notion/integration behavior

- **Evidence:** tutorial context about synced checkbox properties and integration limitations.
- **Disposition:** integrations are outside Narro scope.

### VE-014 — Preferences

#### 00:00:08–00:00:59 — entry, Blitz Panel and General

- **VIDEO-DIRECT:** Preferences opens from the main app and Focus cog; narrow settings surface shows Blitz Panel monitor selection, left/right side, `General`, hide task times, and System/Dark/Light theme.
- **TRANSCRIPT-CLAIM:** hidden EST/Time Taken remain available on task hover.
- **Narro comparison:** monitor/side, hide-times and theme are already represented in typed preferences; Theme is validated, remaining consumers are active M8.
- **Disposition:** active M8 evidence. Preserve hover disclosure when task times are hidden.

#### 00:01:00–00:01:23 — Blitz mode settings and conditional Pomodoro children

- **Starting state:** Pomodoro disabled.
- **Trigger:** enable Pomodoro.
- **Immediate feedback:** `Work Sprint` and `Break Time` child controls become visible in-place. Default break length and scrolling-title controls remain separate.
- **Motion/layout:** the recording shows nested controls appearing inside the same scroll surface; no viewport reset is observed. Exact easing/duration is not measurable reliably.
- **Narro comparison:** active M8 explicitly requires nested behavior without disruptive scroll jumps.
- **Disposition:** active M8, directly corroborated.

#### 00:01:24–00:02:05 — Alerts

- **VIDEO-DIRECT:** timed-alert toggle with nested timing/sound/preview/volume-like controls and animated-flash toggle; Notification Alerts with nested sound selection.
- **TRANSCRIPT-CLAIM:** notification-alert family covers due tasks, task/break time and Pomodoro sprint end.
- **Narro comparison:** typed Alerts payload exists; local sound catalog may be unavailable. Handoff already requires explicit unavailable feedback rather than invented remote assets.
- **Disposition:** active M8. No remote sound dependency.

#### 00:02:06–00:02:25 — completion celebration

- **VIDEO-DIRECT:** `Show success screen`; enabling it reveals nested `Fun gif on success screen` and a success-sound row/control.
- **TRANSCRIPT-CLAIM:** success message appears after completion and selected celebration sound plays.
- **Narro comparison:** typed Celebration payload exists and validation already forbids `fun_gif` without success screen; runtime/UI behavior is open M8.
- **Disposition:** active M8. Pair with VE-003 completion-state evidence.

### VE-015 — Sessions walkthrough

#### 00:00:18–00:01:26 — Sessions overview and filters

- **VIDEO-DIRECT:** Reports → Sessions tab; Total Time/Total Tasks/Total Sessions; list filter, break-session visibility, date range; chronological rows with task/list/session/date/start/end/duration.
- **Narro comparison:** M9 Sessions/report scope already includes session history and filtering.
- **Disposition:** future M9 evidence.

#### 00:01:28–00:02:21 — edit/delete/add session

- **VIDEO-DIRECT / TRANSCRIPT-CLAIM:** inline date/time/duration editing, expanded Edit panel, delete action, and Add Session flow are shown/described.
- **Narro comparison:** M9 should edit the authoritative durable session ledger and reconcile totals deterministically.
- **Disposition:** future M9 evidence.

#### 00:02:22–00:02:39 — Export PDF

- **VIDEO-DIRECT:** an Export PDF control exists on the Sessions surface.
- **TRANSCRIPT-CLAIM:** narration says formatted PDF export is “available soon” while Sessions is beta; the recording does not prove a working export result.
- **Narro comparison:** Narro's local export requirement comes from its own M9 product decision/spec, not from treating this source control as proof of current Blitzit functionality.
- **Disposition:** separate direct UI evidence from roadmap claim; no change to M9 scope.

### VE-016 — Timer modes

#### 00:00:17–00:01:03 — EST countdown / Time's Up / Extend

- **VIDEO-DIRECT / TRANSCRIPT-CLAIM:** EST entry, paused-only live EST editing, Time's Up state, Skip/Done/Extend choices, and overtime after Extend.
- **Narro comparison:** M3 engine and M6 UI already implement these authoritative transitions.
- **Disposition:** already correct.

#### 00:01:20–00:01:47 — Pomodoro and break lifecycle

- **VIDEO-DIRECT / TRANSCRIPT-CLAIM:** Pomodoro is preference-controlled; work countdown ends in break alert/break and later return-to-work notification; floating timer remains visible.
- **Narro comparison:** M3 has authoritative Pomodoro work→break→awaiting-resume and exactly-once boundary effects; M8 still needs Preferences UI/runtime consumer wiring.
- **Disposition:** engine correct; preference exposure belongs to M8.

#### 00:01:50–00:02:27 — count-up and actual Time Taken

- **TRANSCRIPT-CLAIM + visible timer/metric states:** no EST + Pomodoro off uses count-up; actual Time Taken is recorded independently and may be adjusted manually.
- **Narro comparison:** M3/M5/M6 already separate displayed timer mode from actual work ledger and protect paused manual edits.
- **Disposition:** already correct.

### VE-017 — Update recurring schedules

#### 00:00:34–00:01:10 — Replace Existing Tasks

- **VIDEO-DIRECT:** parent task → Update recurring → custom weekdays; `Replace existing tasks` option is visible.
- **TRANSCRIPT-CLAIM:** checked replaces applicable existing generated children with the new pattern; unchecked keeps old children while future/new schedule changes, so both sets can coexist.
- **Narro comparison:** M4 implements Replace Existing Tasks transactionally while protecting modified/history-bearing children.
- **Disposition:** already correct; explicit coexistence is allowed when chosen, but accidental duplicate occurrence creation remains forbidden.

#### 00:01:16–00:02:25 — No Repeat / Delete Existing / detachment

- **VIDEO-DIRECT:** `No repeat` and `Delete existing tasks` controls are shown.
- **TRANSCRIPT-CLAIM:** removing recurrence without deleting children detaches them; creating a later new schedule can place new generated entries alongside detached old tasks and “can lead to duplicates,” preserving prior child customizations.
- **Narro comparison:** Narro's idempotency invariant concerns accidental duplication of a recurrence occurrence. It should preserve intentionally detached independent children and not overwrite their history merely to mimic a cleaner source list.
- **Disposition:** source reliability-sensitive behavior already accounted for by M4's protected-child/detachment model; no new rewrite.

### VE-018 — Daniel's planning workflow

#### 00:00:13–00:02:42 — personal planning routine

- **VIDEO-DIRECT:** list-based organization, This Week planning, EST, moving selected tasks to Today, Backlog, priority reorder, Blitz entry, Focus and break.
- **TRANSCRIPT-CLAIM:** personal advice about not overloading Today and working one task at a time.
- **Narro comparison:** product controls corroborate existing board/focus behavior; personal planning advice is contextual, not a product requirement.
- **Disposition:** no new Narro requirement.

### VE-019 — Oct 2024 update (historical)

#### 00:00:07–00:00:58 — Floating/live subtasks

- **VIDEO-DIRECT:** subtasks expand in Floating Timer, existing subtasks can be managed while live.
- **TRANSCRIPT-CLAIM:** this update newly allowed always-visible live subtasks but retained a limitation that a task with zero subtasks could not add its first subtask while live.
- **Evidence precedence:** the video identifies its changelog as Friday Nov 1, 2024, so this is historical evidence. Newer supplied tutorials and Narro's validated local design outrank its accidental limitation.
- **Disposition:** corroborates historical source evolution; do not regress Narro's complete live subtask workflow.

#### 00:01:01–00:01:45 — settings shortcut and theme

- **VIDEO-DIRECT:** Settings becomes directly accessible in navigation; System/Dark/Light theme switching is demonstrated.
- **Narro comparison:** theme is already validated; current Preferences evidence is stronger in VE-014.
- **Disposition:** historical corroboration only.

#### 00:02:17–00:02:30 — Windows signing/security discussion

- **TRANSCRIPT-CLAIM:** source-product installer certificate/security update.
- **Disposition:** historical Blitzit distribution context, not a Narro product behavior requirement. Narro packaging/signing remains governed by its own release milestone.

## Findings register

| Finding | Evidence | Area | Narro comparison | Classification | Disposition / tracking |
| --- | --- | --- | --- | --- | --- |
| VE-F001 | VE-002 00:00:17.920–00:01:00.879; direct frame ~00:00:31 | EST suffix parser | preference field exists; runtime parser open | real missing active-M8 behavior | M8 Preferences/runtime consumer; strip successfully parsed terminal suffix from saved title and set EST |
| VE-F002 | VE-003 00:02:45–00:02:56; VE-005 00:03:03–00:03:18; VE-014 00:02:06–00:02:25 | completion celebration | Narro currently auto-starts next task after Done; success screen open in M8 | conditional conflict / missing M8 behavior | with success screen enabled, gate next-task start behind success state; exact Take-a-Break post-click effect remains unresolved |
| VE-F003 | VE-005 00:01:56–00:02:00 plus direct menu frames | task overflow | persistence can duplicate tasks, production board lacks Change List/Duplicate path | real missing behavior in previously validated M5 surface | narrow corrective source slice; same-ID atomic Change List + independent-ID Duplicate |
| VE-F004 | VE-010 00:00:45–00:01:00 | Notes URLs | source auto-opens on live transition; Narro requires explicit activation | intentional Narro deviation | preserve Narro behavior; no correction |
| VE-F005 | VE-017 00:00:47–00:02:25 | recurrence updates | Narro protects modified/history children and idempotent occurrences | reliability-sensitive source behavior | preserve explicit detached-child coexistence; never permit accidental duplicate occurrence creation |
| VE-F006 | VE-011/012/015 | Reports/Sessions | M9 not started; M3 ledger authoritative | future milestone evidence | route to M9; totals/editing must reconcile same durable session ledger |
| VE-F007 | VE-003 ~00:02:11 | Panel↔Timer motion | M7 source validated, physical matrix open | visual/interaction evidence | use ~0.2–0.3 s source sequence as fidelity evidence; physical Windows checks remain OPEN |
| VE-F008 | VE-014 00:00:48–00:02:25 | Preferences | typed fields exist; broad UI/runtime slice open | confirmed active-M8 hierarchy | implement conditional children in-place; hidden times disclose on hover; local/unavailable sound behavior per Narro policy |
| VE-F009 | VE-013 00:01:01–00:01:22; VE-019 00:00:35–00:00:58 | live subtasks | Narro supports a more complete local workflow | source limitation / historical | do not copy limitation |

## Conflict and uncertainty register

1. **Done → next task:** previous docs marked this globally unresolved. VE-003 resolves only the **success-screen-enabled** case: the success state appears first and `Next Task` is explicit. It does not establish the success-screen-disabled path.
2. **Success `Take a Break`:** button presence is VIDEO-DIRECT; the recording does not show its post-click timer/session result. Do not infer a standalone-break domain transition without further evidence or a Narro product decision.
3. **EST title normalization:** previous docs left exact normalization unresolved. VE-002 direct frames resolve it for the shown parser path: the parsed suffix is removed from the visible saved title and the duration is placed in EST.
4. **60-day Done auto-archive:** VE-006 narration claims it; the visible archive screen does not prove the trigger. Do not promote the claim to a Narro requirement by itself.
5. **Subtask first-add while live:** historical/current source tutorials describe a limitation requiring an existing subtask before live controls. Narro's more complete validated behavior is retained.
6. **Report PDF:** VE-015 directly shows the button but narration says export was still coming soon; UI presence is not proof of functional availability.

## Visual / interaction synthesis

- The current tutorial corpus consistently uses dark, low-chroma charcoal panels with mint/teal success/action accents and a pink→mint gradient for the primary Blitz action. Light theme is directly demonstrated in VE-019 and theme choice in VE-014.
- Task/Focus action affordances are generally revealed in reserved row/card areas; the videos do not show a requirement for row reflow on hover. This corroborates Narro's fixed action-slot/no-layout-shift invariant.
- Preferences use a narrow vertical surface with section headings and nested children that appear beneath their controlling toggle. The source does not provide evidence for disruptive scroll repositioning; Narro should keep the current M8 no-scroll-jump requirement.
- The strongest measurable transition in the corpus is Focus Panel→Floating Timer in VE-003 at roughly 0.2–0.3 s. Other cuts/edits make exact easing or duration claims unreliable.
- No recording provides sufficient evidence to close Narro's deferred physical monitor/DPI/taskbar/fullscreen/Windows-animation matrix. Those checks remain OPEN/NOT RUN.
- Keyboard focus rings/accessibility semantics are not consistently visible enough in this corpus to infer exact source keyboard behavior. Narro's existing keyboard/focus/accessibility requirements therefore remain independent product invariants.

## Completion state for this ingestion pass

This initial uploaded-corpus pass is complete because:

- 38/38 raw files were inventoried;
- 19/19 videos were paired with 19/19 transcripts;
- every pair was reviewed for direct product evidence versus narration/context;
- every materially relevant sequence was routed to a Narro area/milestone and given a disposition;
- conflicts/ambiguities were retained rather than guessed;
- no tutorial-only account/cloud/integration/commerce/future-roadmap content was converted into a Narro gap;
- actionable findings VE-F001/2/3 are routed for narrow correction/active M8 implementation, while future Reports/Sessions evidence is routed to M9;
- deferred M7 physical checks remain OPEN.

The required post-M10 Final Comprehensive Review must still re-reference this corpus and verify end-state parity/reliability; completing this ingestion pass does not replace that final gate.


## VE-020 — user-supplied planning-board drag clip (2026-10-02)

A new uninterrupted 9.34 s / 60 fps source clip exposes planning-board details not captured by the original 19-video feature-level reconciliation: positional cross-lane insertion, remaining-EST arithmetic, live Today count progression and stronger Today/Blitz hierarchy.

Full frame-level record and implementation disposition: `docs/BLITZIT_SUPPLIED_CLIP_2026-10-02.md`.

This does not invalidate the original 19/19 ingestion; it tightens what “forensic complete” must mean. Future exhaustive review follows `docs/BLITZIT_MEDIA_FORENSIC_PLAN.md`.
