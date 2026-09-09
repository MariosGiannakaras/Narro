# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 5 section in `TODO.md`, relevant `STATUS.md`, `docs/UI_UX_SPEC.md`, `docs/PRODUCT_SPEC.md`, `docs/BEHAVIOR_MATRIX.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 5 — Design system and Main window product UI.**

- Milestones 1–4: COMPLETE / PASS.
- Milestone 5: ACTIVE / **17 of 28** top-level items validated.
- Milestones 6–10: NOT STARTED.

## CURRENT VALIDATED SOURCE BASELINE

Latest fully main-validated source/test SHA:

`2c4ec648490764cfdd5b0f793f9f68ed73657037`

Source tree: `a1d562c3153fa6c0f169eaf9d587285e7141301d`.

This is the squash-merged result of PR #89 — `M5: add EST and Time Taken editing`. PR Windows CI #341 and resulting-main Windows CI #342 are both **SUCCESS**. Detailed evidence: `work-log/2026-09-09-1858-chatgpt-m5-task-metrics.md`.

Markdown-only tracking descendants do not replace this validated source/test baseline.

## ACTIVE IMPLEMENTATION

**M5 Main UI — Scheduling UI and recurrence editor.**

Active branch: `m5-scheduling-recurrence-ui`

Branch base / main tracking tip when created: `24a476408c9b8c0e3ab224f4c117acbcc7673c4a`

Latest branch tracking commit before source implementation: `8848706a84bf002bb5c4173697336502e1a7da82`

No implementation PR exists yet.

## USER-FACING PROGRESS

**`M-5/10 | 1/5 | 17/28`**

Current five checkpoints:

1. mandatory inspection + narrow scheduling/recurrence mutation and UX contract — **COMPLETE**;
2. authoritative scheduling/recurrence command/frontend implementation + deterministic static/Rust/visual coverage + semantic/diff review — **IN PROGRESS**;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + tracking reconciliation — PENDING.

## CHECKPOINT 1 — INSPECTED AUTHORITATIVE BOUNDARIES

### Scheduling

- `domain::tasks::TaskSchedule` already distinguishes `None`, `DateOnly` and `LocalDateTime`.
- `scheduling::resolve_schedule_shortcut` owns Today / Later Today (+2h) / Tomorrow / Next Week (+7d) / Custom Date behavior.
- `scheduling::effective_planning_lane_at` owns Backlog / This Week / Today projection and Monday-week semantics; React must not reproduce this classification.
- `scheduling::focus_eligibility_at` owns future-timed Today eligibility.
- `task_metadata::set_task_schedule` owns schedule normalization and strict date/time/timezone validation, including ambiguous/nonexistent DST local times.
- Current `ListBoard` already projects scheduled tasks through the M4 effective-lane boundary without rewriting `manual_lane`, excludes scheduled tasks from manual reorder, and reads the authoritative display timezone.

### Recurrence

- `persistence::recurrence` owns rule shape validation and transactional create/update/disable/delete with stable rule/parent links.
- Weekday masks use Monday as bit 0.
- `recurrence::materialize_recurrence_week` owns deterministic occurrence evaluation, parent normalization to unscheduled Backlog, child identity generation and unique occurrence idempotency.
- `recurrence_service` owns repeated/catch-up orchestration and timezone-specific rule-local date evaluation.
- `persistence::recurrence_replace::replace_existing_tasks` is the mandatory edit path when `replace_existing=true`: pristine generated children are removed, modified/history-bearing children are detached and their occurrence reservations remain so they cannot be regenerated as duplicates.
- Removing a recurrence rule uses the validated delete/detach path: future materialization stops while existing child tasks/history survive independently.

## NARROW IMPLEMENTATION CONTRACT

### Renderer read model

Extend the existing List Board task projection only with scheduling/recurrence metadata needed to render and stale-guard the editor:

- schedule kind and schedule timezone in addition to the already projected local date/time;
- recurrence parent task identity for generated occurrences;
- optional recurrence-rule summary for a recurring parent, including rule ID, interval/unit/selectors/start/time/timezone/replace flag/active state/`updated_at`.

All Lists remains read-only. Completed tasks remain read-only for scheduling. Generated recurrence children may have their individual schedule edited, but this slice does **not** invent automatic child detachment; their existing M4 modified-child preservation semantics remain authoritative. A generated child cannot be turned into a nested recurrence parent from this UI.

### Schedule mutation boundary

Add a renderer-facing command over an **expected-state / immediate-transaction** schedule persistence boundary:

- expected list ID;
- expected schedule kind/date/time/timezone;
- requested `TaskSchedule`.

The command must reject stale renderer state instead of overwriting a newer schedule. It must reuse the existing schedule normalization/DST validation and change only schedule metadata + `updated_at`. Title, EST, Time Taken/session history, identity, manual lane, completion and recurrence links must remain unchanged.

Add a read-only renderer command that resolves schedule shortcuts through Rust/M4 logic using the board/display timezone. The renderer may present the returned draft but must not calculate Today/Tomorrow/+7d/+2h semantics itself.

### Recurrence mutation boundary

Add renderer-facing recurrence commands with expected parent/list/rule-version guards:

- create only when the task is not a generated child and still has no recurrence rule;
- update only when the expected rule ID and `updated_at` still match;
- when the saved update has `replace_existing=true`, route through `replace_existing_tasks`, never plain metadata update;
- remove only when the expected rule/version still match and route through the validated rule deletion/detachment boundary.

After a successful recurrence create/update, trigger the existing authoritative recurrence orchestration for that rule as a **secondary** best-effort refresh so the parent/children can project promptly. If this post-commit materialization fails, do not report the committed recurrence mutation as failed; return/report a warning and let the background orchestration retry.

### Production UX

- Individual real List Boards only; aggregate All Lists is read-only.
- Live tasks do not expose scheduling/recurrence editing in this Main-window slice.
- Unscheduled editable task cards expose a compact `Schedule` metadata action in already-reserved metadata geometry.
- Scheduled task date/time presentation becomes the schedule-editor trigger without changing the normal card width/title geometry.
- Recurring parents expose a recurrence marker/summary through the same scheduling metadata area.
- Editor is a compact accessible overlay/dialog, not a hover-reflow interaction.
- Schedule section supports Unscheduled, Today, Later today, Tomorrow, Next week, custom local date and optional local time. The selected board/display timezone is explicit for timed schedules.
- Recurrence section supports every day, every weekday, weekly on selected weekday, monthly on selected calendar date and custom day/week/month/year interval with relevant weekday/month-day selectors.
- Existing recurrence may be edited, `Replace Existing Tasks` may be selected explicitly, or recurrence may be removed.
- Save/Cancel/Escape and keyboard/focus-visible operation are required.
- Successful authoritative mutation is followed by an authoritative board snapshot refresh. A commit-success/refresh-failure keeps the existing `Task change was saved, but the board could not refresh` safety boundary and blocks unsafe retries.
- Drag initiation must exclude scheduling/editor controls.

### Explicit exclusions

Do not implement reminders/preferences UI, top-priority creation, subtasks, notes, task completion/delete/archive, list settings, search, archives, Settings, Reports/session editing, Focus Panel/Floating Timer product UI, or later milestones.

## INVARIANTS THAT MUST NOT REGRESS

- date-only schedules remain calendar dates and never round-trip through UTC;
- local date-time schedules retain explicit Windows-local/IANA timezone semantics and reject DST gaps/folds through the existing strict boundary;
- Monday week boundaries and future-time eligibility remain authoritative;
- schedule mutations preserve task identity and cannot duplicate/alias tasks;
- recurrence materialization stays deterministic/idempotent and preserves validated parent/child, replace-existing and detachment behavior;
- persistence-first mutation remains the success boundary;
- a committed mutation plus failed board refresh/materialization side effect is not reported as an authoritative mutation failure;
- All Lists remains an aggregate read projection;
- tracked time/timer/session state is not rewritten by scheduling/recurrence edits;
- card hover/focus geometry and keyboard accessibility remain stable.

## NEXT AGENT ACTION

Implement checkpoint 2 exactly to this contract, add deterministic Rust/static/Windows visual coverage, then perform semantic/diff review before opening a PR. Local checkout/toolchain remains unavailable here, so record local checks as NOT RUN and use exact PR-head Windows CI as the reproducible gate.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user blocker is known.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
