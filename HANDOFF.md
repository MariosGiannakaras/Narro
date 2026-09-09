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

Branch base / main tracking tip when created:

`24a476408c9b8c0e3ab224f4c117acbcc7673c4a`

Latest source candidate after checkpoint-2 implementation and semantic/diff review:

`e519b546617d37a80a95da957ce860e96e572196`

The current branch tip may be a markdown-only descendant of that source candidate because this HANDOFF update is itself a tracking commit. No source/test validation has been claimed for that descendant yet.

No implementation PR existed at the time this checkpoint was recorded. The next action is to open the PR from this branch and validate its exact head on Windows CI.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 17/28`**

Current five checkpoints:

1. mandatory inspection + narrow scheduling/recurrence mutation and UX contract — **COMPLETE**;
2. authoritative scheduling/recurrence command/frontend implementation + deterministic static/Rust/visual coverage + semantic/diff review — **COMPLETE / candidate ready for PR CI**;
3. exact PR-head Windows CI — PENDING;
4. final exact-head review + expected-head merge — PENDING;
5. resulting-main Windows CI + tracking reconciliation — PENDING.

## CHECKPOINT 2 IMPLEMENTED CAPABILITIES

### Authoritative schedule editing

- `src-tauri/src/persistence/task_schedule_edit.rs` provides expected-list + expected-schedule guarded schedule mutation under an immediate SQLite transaction.
- Existing `TaskSchedule` normalization and strict local date/time/timezone DST validation remain authoritative; renderer code does not recreate those semantics.
- `resolve_list_board_schedule_shortcut` delegates Today / Later today / Tomorrow / Next week behavior to the Rust scheduling module and selected display timezone.
- Date-only schedules stay calendar dates and never round-trip through UTC.

### Authoritative recurrence editing

- `src-tauri/src/board_task_schedule.rs` exposes renderer-facing read/save/remove commands over the existing recurrence persistence/materialization system.
- Create is rejected for generated recurrence occurrences and for stale task/rule bindings.
- Existing rule updates require the expected rule ID and expected `updated_at`.
- A semantic review found and fixed a TOCTOU stale-write window: update, remove, and Replace Existing now validate the expected recurrence version **inside** an immediate persistence transaction.
- `persistence::recurrence` now exposes `update_recurrence_rule_if_expected` and `delete_recurrence_rule_if_expected` while preserving the existing non-guarded internal APIs for validated non-renderer callers.
- `persistence::recurrence_replace` now exposes `replace_existing_tasks_if_expected`; the stale-version check happens before any child scan/detach/delete in the same immediate transaction.
- `src-tauri/tests/recurrence_stale_version_guards.rs` proves a stale Replace Existing request leaves recurrence metadata and generated children untouched.
- Existing modified/history-bearing child detachment and occurrence-reservation semantics remain unchanged.
- Recurrence create/update materialization is post-commit best effort; a materialization failure is returned as a warning rather than misreporting the committed mutation as failed.

### List Board / task-card UX

- Real individual List Boards expose `Schedule / Repeat` from the existing task metadata area; All Lists remains read-only.
- Scheduled rows themselves open the editor without changing title/action geometry.
- Live tasks and completed tasks do not expose scheduling mutations in this Main-window slice.
- Opening the schedule editor locks reorder/create/title/metric/list-switch interactions; schedule controls are excluded from drag initiation.
- Successful schedule/recurrence mutation closes the dialog and performs an authoritative board snapshot refresh.
- Commit-success/refresh-failure uses the existing `Task change was saved, but the board could not refresh` safety path and blocks unsafe follow-up mutations.
- The board projection now exposes authoritative `recurrenceRuleId` / `recurrenceParentTaskId` identity so closed cards can visibly distinguish `Repeats` parents and generated `Occurrence` tasks without per-card polling or renderer inference.

### Schedule / Repeat dialog

- Production `TaskScheduleDialog` supports Unscheduled, Today, Later today, Tomorrow, Next week, custom local date and optional local time.
- Timed schedules show/use the authoritative display timezone.
- Recurrence presets cover every day, every weekday, weekly on start weekday, monthly on start date, and custom day/week/month/year intervals with weekday/month-day selectors as applicable.
- Existing recurrence can be edited, explicitly `Replace Existing Tasks`, or removed.
- Generated occurrences can edit their individual schedule but cannot create a nested recurrence rule.
- Escape, Cancel, close button, Tab/Shift+Tab focus containment and opener focus restoration are implemented; explicit `:focus-visible` states are present.

## DETERMINISTIC COVERAGE ADDED

- Rust schedule-edit regressions cover metadata preservation, stale schedule rejection, and ambiguous/nonexistent local-time rejection.
- Rust recurrence stale-version regressions cover update/delete and destructive Replace Existing before-write rejection.
- `scripts/test-ui-task-scheduling.mjs` statically gates command registration, atomic expected-state boundaries, recurrence detachment/replace paths, task-card recurrence projection, interaction locking, refresh semantics, drag isolation, dialog controls, no renderer polling, and no reminder-scope leakage.
- `src/taskScheduleVisualFixture.tsx`, `task-schedule-fixture.html`, capture wiring and `validate-task-schedule-captures.mjs` provide deterministic production-dialog Windows captures and geometry/theme parity checks.
- `package.json` includes the scheduling static check in `preflight:frontend` and the schedule capture validator in the Windows visual regression chain.

## SEMANTIC / DIFF REVIEW

Reviewed candidate `e519b546617d37a80a95da957ce860e96e572196` against branch base `24a476408c9b8c0e3ab224f4c117acbcc7673c4a`.

Scope is limited to:

- scheduling/recurrence command and persistence boundaries;
- recurrence identity projection required for closed-card status;
- List Board / TaskCard / dialog production UX;
- deterministic Rust/static/visual coverage;
- build/capture registration and branch tracking.

No reminder UI, notes, subtasks, completion/delete/archive flows, timer/session accounting rewrite, list settings, search, Settings, Reports, Focus Panel/Floating Timer product UI, or later-milestone feature was added.

## INVARIANTS THAT MUST NOT REGRESS

- date-only schedules remain calendar dates and never round-trip through UTC;
- local date-time schedules retain explicit IANA timezone semantics and reject DST gaps/folds through the existing strict boundary;
- Monday week boundaries and future-time eligibility remain authoritative;
- schedule/recurrence mutations preserve task identity and cannot duplicate/alias tasks;
- expected renderer state is checked atomically for schedule update and recurrence update/remove/replace;
- recurrence materialization stays deterministic/idempotent and preserves validated parent/child, Replace Existing and detachment behavior;
- modified/history-bearing generated children are preserved and occurrence reservations prevent duplicate regeneration;
- persistence-first mutation remains the success boundary;
- a committed mutation plus failed board refresh/materialization side effect is not reported as an authoritative mutation failure;
- All Lists remains an aggregate read projection;
- tracked time/timer/session state is not rewritten by scheduling/recurrence edits;
- task-card title/action geometry and keyboard accessibility remain stable.

## NEXT AGENT ACTION

1. Verify the exact current branch tip and confirm no competing open PR.
2. Open the implementation PR from `m5-scheduling-recurrence-ui` to `main`.
3. Record the exact PR head SHA.
4. Require authoritative Windows PR CI to PASS on that exact SHA: Repository Preflight, frontend/Rust tests, visual capture + artifact upload, Tauri Release, diagnostic artifact upload.
5. If CI fails, inspect the exact failure log and fix only evidence-backed failures; do not increment progress.
6. After exact-head CI PASS, perform final diff/review/comment reconciliation, then merge only the validated expected head.
7. Validate resulting main on Windows CI, then update `TODO.md`, `STATUS.md`, `HANDOFF.md` and add a new immutable `work-log/*.md` entry. Only then mark `Scheduling UI and recurrence editor` complete and advance M5 from 17/28 to 18/28.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user blocker is known.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
- Windows GitHub Actions remains authoritative for frontend, Rust/Tauri, visual and artifact validation.
