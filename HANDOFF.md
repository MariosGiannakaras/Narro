# HANDOFF.md

This file is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, the relevant `STATUS.md` section, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/PRODUCT_SPEC.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

- Milestone 1 / Gate A: COMPLETE / PASS.
- Milestone 2 / Gate B: COMPLETE / PASS.
- Milestone 3 / Gate C: COMPLETE / PASS.
- Milestone 4: ACTIVE / PARTIALLY IMPLEMENTED.
- Milestones 5–10: NOT STARTED.

Do not start M5+ while M4 remains open unless the user explicitly changes roadmap order.

## WORK-STATE SEMANTICS

Milestone states: **NOT STARTED**, **ACTIVE**, **COMPLETE**.

Implementation-slice states: **NOT STARTED**, **ACTIVE**, **PR VALIDATED**, **MERGED / MAIN VALIDATION PENDING**, **VALIDATED / RECONCILIATION PENDING**, **COMPLETE / RECONCILED**.

A later-milestone prerequisite implemented early is **FOUNDATION ONLY**. Scaffolds, schema fields, old branches, historical PRs, reusable notification/window/preferences capability, or file existence do not mark a later milestone started.

An open implementation PR must be recorded below. Resume an ACTIVE slice/PR before starting competing work. Before closing superseded PRs, compare their required behavior against the authoritative implementation.

## ACTIVE WORK RECORD

- Active milestone: **Milestone 4**.
- Latest completed source slice: **recurrence execution/materialization core — COMPLETE / RECONCILED**.
- Active source slice: **one-off local reminder durable core — ACTIVE**.
- Active implementation branch: **`ai/m4-one-off-reminders`**.
- Active implementation PR: **None yet**.
- Current source candidate: **not committed yet**.
- Pending validation: **source/test candidate, exact-head Windows PR CI, final review, guarded merge, resulting-main Windows CI, reconciliation**.
- Latest fully main-validated source baseline: **`2135e40fe6953cf730d73edd184378510e2057aa`**.
- Small-slice progress: **1/6**.
- Later milestones M5–M10: **NOT STARTED**.

The reminder slice must be resumed before any other source slice if this chat disappears.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 1/6 ολοκληρωμένες.**

Reminder slice checkpoints:

1. product/risk/schema audit plus branch start;
2. durable one-off reminder domain/persistence/due-query candidate plus regression review;
3. exact PR-head Windows CI success including preflight, release build and artifact;
4. final semantic/diff review of the exact validated head;
5. guarded merge using the validated expected head;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation.

Do not increment a checkpoint from code presence alone.

## LATEST VALIDATED SOURCE BASELINE

`2135e40fe6953cf730d73edd184378510e2057aa`

This contains the validated recurrence materialization implementation from PR #40 and semantics-neutral PR #41 revalidation repair.

Authoritative main validation:

- Windows CI #215 / run `33982239289` / job `101349403398`: SUCCESS on exact SHA `2135e40fe6953cf730d73edd184378510e2057aa`;
- repository preflight: PASS;
- Tauri release build: PASS;
- artifact upload: PASS;
- artifact ID `9974264032`;
- digest `sha256:b88ffabf27cd8d736ea17c2a78739f78b28b537036f97f49ed78e3d4ce4f3e67`.

Markdown-only commits newer than this SHA do not replace the validated source baseline.

## VALIDATED M4 CAPABILITIES

### Scheduling / eligibility — PR #36

- Monday-starting week classification;
- official Today / Later today (+2h) / Tomorrow / Next week (+7d) / custom-date shortcuts;
- scheduled Today / This Week / Backlog projection;
- future-timed Today focus gating;
- date-only calendar semantics and stable task identity through schedule changes.

### Timezone / DST — PR #37

- IANA timezone validation/resolution via `jiff`;
- stable-instant timed schedules and timezone reprojection;
- strict rejection of DST gaps and folds;
- date-only schedules stay outside UTC conversion.

### Recurrence execution/materialization — PR #40/#41

- day/week/month/year interval occurrence evaluation;
- weekday masks and monthly calendar-date rules;
- Monday-through-Sunday materialization window;
- recurring parent normalized to unscheduled Backlog;
- stable child task IDs with recurrence-parent linkage;
- transactional task + `recurrence_occurrences` persistence;
- durable same-week duplicate prevention;
- strict timed recurrence timezone/DST validation;
- inactive-rule no-op and rollback on failed materialization.

Evidence: `work-log/2026-09-05-chatgpt-m4-recurrence-materialization-reconciliation.md`.

## ACTIVE REMINDER SLICE CONTRACT

Product evidence in `docs/PRODUCT_SPEC.md` §5.4:

- system schedule reminders;
- reminder timing such as 10 minutes before;
- local OS notifications;
- tray/background process should support reliable reminders while the desktop session is active.

Existing durable foundation:

- `ReminderId` already exists;
- migration `0002_domain_foundation.sql` already defines `reminders(id, task_id, remind_local_date, remind_local_time, timezone, fired_at, dismissed_at, created_at, updated_at)` and `reminders_due_idx`;
- Windows notification transport already exists in `src-tauri/src/notifications/mod.rs`;
- strict IANA/DST local datetime resolution already exists in `src-tauri/src/scheduling/mod.rs`;
- preferences already contain schedule-reminder fields as FOUNDATION ONLY for later Preferences UI.

This slice implements **durable one-off reminder state and deterministic due evaluation only**. It must provide a safe persistence boundary that a later background dispatcher can consume.

Required invariants for this slice:

- create/update validates RFC3339 mutation timestamps, YYYY-MM-DD, HH:MM, known IANA timezone, and strict gap/fold-free local datetime;
- reminder task must exist and be active (not completed/archived; archived-list behavior must fail closed);
- pending due evaluation is deterministic by resolved instant and does not itself perform notification side effects;
- `fired_at` is only written by an explicit successful-delivery acknowledgment path and is idempotent;
- dismissed/fired reminders are excluded from pending-due results;
- persistence must not create a second reminder storage model or hidden polling loop.

Explicitly out of scope for this slice:

- tray/background polling or delivery orchestration;
- claiming exactly-once OS delivery across a crash between OS submission and `fired_at` acknowledgment;
- Preferences UI / Milestone 8;
- Main-window reminder UI / Milestone 5;
- recurrence reminder generation;
- notification sound/preview behavior.

## M4 TODO STATE

Already validated:

- Monday week classification;
- official scheduling shortcuts;
- scheduled lane classification;
- future-timed Today eligibility;
- date-only no-day-shift semantics;
- recurrence interval/unit/weekday execution;
- recurring parent Backlog + Monday-of-due-week child materialization.

Still open:

- one-off local reminders (**active slice**);
- Replace Existing Tasks;
- recurrence detachment;
- startup/resume/date-change recurrence orchestration and missed-day catch-up;
- tray/background due-reminder processing;
- Windows locale/system 12/24-hour formatting;
- combined M4 regression matrix including repeated startup/missed days/reminders;
- explicit scheduled-lane movement anti-duplication regression.

Do not check the one-off reminder TODO merely because persistence CRUD exists if delivery semantics still require the separate background slice; reconcile the checkbox only against evidence-backed product behavior after validation.

## NEXT AGENT ACTION — ACTIVE REMINDER SLICE

1. Continue on `ai/m4-one-off-reminders`.
2. Implement domain reminder records/input plus `persistence/reminders.rs` using the existing schema.
3. Add deterministic pending-due evaluation and explicit idempotent fired/dismiss transitions.
4. Add integration regressions for timezone/DST validation, due ordering, fired/dismiss exclusion and inactive task/list handling.
5. Review the actual diff and open one implementation PR.
6. Require exact-head Windows CI before any merge.

## IMPORTANT INVARIANTS

- persistence-first mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- week starts Monday;
- timed local datetimes resolve through explicit IANA timezone rules and fail closed on gap/fold;
- recurrence generation remains deterministic/idempotent;
- `recurrence_occurrences` remains the recurrence duplicate-prevention boundary;
- renderer owns no authoritative timer/reminder state;
- process restart downtime is not counted as work;
- one-open-session database invariant remains enforced;
- preserve async `main` recreation that avoids the historical Windows WebView2 deadlock.

## HISTORICAL / SUPERSEDED WORK

PR #2 and PR #3 are historical alternate M1 shortcut implementations. PR #4/current main contains the required authoritative behavior; no source recovery from #2/#3 is pending.

Old branches may remain for history and do not imply active work.

## USER ACTION REQUIRED

None.
