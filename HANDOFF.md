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

Open implementation PR:

**PR #90 — `M5: add scheduling and recurrence editor`**

Latest source/test candidate after evidence-backed CI fixes and exact rustfmt reconciliation:

`b42f8b4ad198f9fe41506cda08c9ad2bcf827812`

The branch tip after this HANDOFF write is a markdown-only descendant of that source/test candidate. It has not yet passed authoritative Windows CI and must be validated as the exact PR head before merge.

## USER-FACING PROGRESS

**`M-5/10 | 2/5 | 17/28`**

Current five checkpoints:

1. mandatory inspection + narrow scheduling/recurrence mutation and UX contract — **COMPLETE**;
2. authoritative scheduling/recurrence command/frontend implementation + deterministic static/Rust/visual coverage + semantic/diff review — **COMPLETE**;
3. exact PR-head Windows CI — **IN PROGRESS; no successful exact-head run yet**;
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
- Semantic review found and fixed a TOCTOU stale-write window: recurrence update, remove, and Replace Existing now validate expected rule version **inside** an immediate persistence transaction.
- `persistence::recurrence` exposes `update_recurrence_rule_if_expected` and `delete_recurrence_rule_if_expected` while preserving existing non-guarded APIs for validated non-renderer callers.
- `persistence::recurrence_replace` exposes `replace_existing_tasks_if_expected`; the stale-version check happens before child scan/detach/delete in the same immediate transaction.
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
- The board projection exposes authoritative `recurrenceRuleId` / `recurrenceParentTaskId` identity so closed cards visibly distinguish `Repeats` parents and generated `Occurrence` tasks without per-card polling or renderer inference.

### Schedule / Repeat dialog

- Production `TaskScheduleDialog` supports Unscheduled, Today, Later today, Tomorrow, Next week, custom local date and optional local time.
- Timed schedules show/use the authoritative display timezone.
- Recurrence presets cover every day, every weekday, weekly on start weekday, monthly on start date, and custom day/week/month/year intervals with weekday/month-day selectors as applicable.
- Existing recurrence can be edited, explicitly `Replace Existing Tasks`, or removed.
- Generated occurrences can edit their individual schedule but cannot create a nested recurrence rule.
- Escape, Cancel, close button, Tab/Shift+Tab focus containment and opener focus restoration are implemented; explicit `:focus-visible` states are present.

## DETERMINISTIC COVERAGE

- Rust schedule-edit regressions cover metadata preservation, stale schedule rejection, and ambiguous/nonexistent local-time rejection.
- Rust recurrence stale-version regressions cover update/delete and destructive Replace Existing before-write rejection.
- `scripts/test-ui-task-scheduling.mjs` gates command registration, atomic expected-state boundaries, recurrence detachment/replace paths, task-card recurrence projection, interaction locking, refresh semantics, drag isolation, dialog controls, no renderer polling, and no reminder-scope leakage.
- `src/taskScheduleVisualFixture.tsx`, `task-schedule-fixture.html`, capture wiring and `validate-task-schedule-captures.mjs` provide deterministic production-dialog Windows captures and geometry/theme parity checks.
- `package.json` includes scheduling static validation in `preflight:frontend` and schedule capture validation in the Windows visual-regression chain.

## PR #90 WINDOWS CI EVIDENCE SO FAR

No failed run below increments progress.

- **#343** — run `34398165967`, job `102623064917`, head `1611ec7d89f445feae49dc3143e532e769e6f31d`: Repository Preflight failed because the old List Board static guard still forbade the newly ordered `onSchedule` interaction. Fixed narrowly in `scripts/test-ui-list-board.mjs`.
- **#344** — run `34398496464`, job `102624198270`, head `96178df3efd384413a29401103febf322cf7674d`: the List Board guard passed; preflight then found the old hover-action drag selector omitted scheduling controls. Fixed by requiring `[data-task-schedule-control]` in the drag-exclusion contract.
- **#345** — run `34398737273`, job `102625003810`, head `a1082c2661c1af77ce520831a625ee5487306ef7`: prior guards passed; preflight then found `test-ui-task-create-edit.mjs` still forbade the ordered scheduling interaction. Fixed narrowly while retaining completion/delete exclusions and requiring schedule-control drag isolation.
- **#346** — run `34399578287`, job `102627830258`, head `556c8c4e3885afa6466eeffdc7afae0985540fb9`: all frontend/static checks and the TypeScript/Vite production build passed. Preflight then failed only at `cargo fmt --all -- --check`. Windows runner used Rust `1.98.1` / rustfmt `1.9.0-stable` and emitted formatter-only diffs in four files.
- The exact #346 rustfmt output was applied in four formatter-only commits, ending at source/test candidate `b42f8b4ad198f9fe41506cda08c9ad2bcf827812`.
- Diff review from `556c8c4e3885afa6466eeffdc7afae0985540fb9` to `b42f8b4ad198f9fe41506cda08c9ad2bcf827812` shows only the four rustfmt-targeted files. Individual commit diffs match the #346 formatter output; no semantic change is present.

## SEMANTIC / DIFF REVIEW

Current slice remains limited to:

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

1. Fetch PR #90 and verify its exact current head SHA; this HANDOFF write should be the latest markdown-only descendant of source/test candidate `b42f8b4ad198f9fe41506cda08c9ad2bcf827812` unless newer repository evidence supersedes it.
2. Require authoritative Windows PR CI to PASS on that exact SHA: Repository Preflight, frontend/Rust tests, visual capture + artifact upload, Tauri Release, diagnostic artifact upload.
3. If CI fails, inspect the exact failure log and fix only evidence-backed failures; do not increment progress.
4. After exact-head CI PASS, record run/job/artifact evidence, perform final exact-head diff/review/comment reconciliation, and merge only with an expected-head guard.
5. Validate the resulting main source SHA on Windows CI.
6. Only after resulting-main PASS, update `TODO.md`, `STATUS.md`, `HANDOFF.md` and add a new immutable `work-log/*.md` entry; then mark `Scheduling UI and recurrence editor` complete and advance M5 from 17/28 to 18/28. The next ordered M5 item is `Subtasks UI`.

## USER ACTION REQUIRED

**None.**

## BLOCKERS / NOT RUN

- No product/user blocker is known.
- Local checkout/toolchain validation in this connector-only environment: **NOT RUN**.
- Windows GitHub Actions remains authoritative for frontend, Rust/Tauri, visual and artifact validation.
