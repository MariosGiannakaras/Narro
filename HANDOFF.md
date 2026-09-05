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
- Active implementation PR: **#43 — `M4: add durable one-off reminder core`**.
- Reviewed source candidate before this tracking commit: **`06b1623b3648b0382b8d7d160179d699da2d7d93`**.
- Current PR head: **must be re-read after this tracking commit before accepting CI or merging**.
- Pending validation: **exact-head Windows PR CI, final semantic/diff review, guarded merge, resulting-main Windows CI, reconciliation**.
- Latest fully main-validated source baseline: **`2135e40fe6953cf730d73edd184378510e2057aa`**.
- Small-slice progress: **2/6**.
- Later milestones M5–M10: **NOT STARTED**.

A new chat must resume PR #43, inspect its exact current head and latest Windows CI, and must not start another source slice first.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 2/6 ολοκληρωμένες.**

Reminder slice checkpoints:

1. product/risk/schema audit plus branch start;
2. durable one-off reminder domain/persistence/due-query candidate plus regression/diff review;
3. exact PR-head Windows CI success including preflight, release build and artifact;
4. final semantic/diff review of the exact validated head;
5. guarded merge using the validated expected head;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation.

Do not increment a checkpoint from code presence alone.

## LATEST VALIDATED SOURCE BASELINE

`2135e40fe6953cf730d73edd184378510e2057aa`

Authoritative validation:

- Windows main CI #215 / run `33982239289` / job `101349403398`: SUCCESS on exact SHA `2135e40fe6953cf730d73edd184378510e2057aa`;
- repository preflight: PASS;
- Tauri release build: PASS;
- artifact upload: PASS;
- artifact ID `9974264032`;
- digest `sha256:b88ffabf27cd8d736ea17c2a78739f78b28b537036f97f49ed78e3d4ce4f3e67`.

Markdown-only commits newer than this source SHA do not replace the validated source baseline.

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

## ACTIVE REMINDER SLICE — PR #43

Product contract from `docs/PRODUCT_SPEC.md` §5.4:

- system schedule reminders;
- reminder timing such as 10 minutes before;
- local OS notifications;
- tray/background process should support reliable reminders while the desktop session is active.

Existing foundation reused by this slice:

- `ReminderId`;
- existing `reminders` table and `reminders_due_idx` from migration `0002_domain_foundation.sql`;
- Windows notification transport in `src-tauri/src/notifications/mod.rs`;
- strict IANA/DST local datetime resolution in `src-tauri/src/scheduling/mod.rs`.

Implemented candidate behavior, **not yet CI-validated**:

- typed `ReminderRecord` / `NewReminderInput` domain contract;
- reminder create/get/list persistence using the existing table;
- strict RFC3339 mutation-time validation;
- strict YYYY-MM-DD / HH:MM parsing;
- IANA timezone validation and strict DST gap/fold rejection before insert;
- creation rejected for completed/archived tasks and archived-list tasks;
- pending-due reminders are selected only for active task/list contexts;
- due comparison/order uses resolved absolute instants, not local clock text;
- pending-due query is side-effect free;
- `mark_reminder_fired` is conditional and idempotent;
- `dismiss_reminder` is conditional and idempotent;
- fired/dismissed reminders are terminal and excluded from pending-due selection;
- tests cover round trip, timezone instant boundary/order, invalid timezone, New York DST gap/fold, terminal idempotency and inactive contexts.

Candidate files:

- `src-tauri/src/domain/reminders.rs`;
- `src-tauri/src/domain/mod.rs`;
- `src-tauri/src/persistence/reminders.rs`;
- `src-tauri/src/persistence/mod.rs`;
- `src-tauri/tests/reminder_persistence.rs`;
- `HANDOFF.md` tracking only.

Explicitly out of scope for PR #43:

- tray/background polling and OS-notification delivery orchestration;
- exactly-once OS delivery across a crash between notification submission and `fired_at` acknowledgment;
- Preferences UI / Milestone 8;
- Main-window reminder UI / Milestone 5;
- recurrence reminder generation;
- notification sound/preview behavior.

Do **not** check the M4 one-off reminder TODO solely from PR #43 persistence-core completion unless repository/product reconciliation proves that item is meant to include no delivery path. The separate tray/background reminder TODO remains open in all cases until implemented.

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

- one-off local reminders (**PR #43 active durable-core slice**);
- Replace Existing Tasks;
- recurrence detachment;
- startup/resume/date-change recurrence orchestration and missed-day catch-up;
- tray/background due-reminder processing;
- Windows locale/system 12/24-hour formatting;
- combined M4 regression matrix including repeated startup/missed days/reminders;
- explicit scheduled-lane movement anti-duplication regression.

## NEXT AGENT ACTION — ACTIVE PR #43

1. Inspect PR #43 exact current head after the latest HANDOFF tracking commit.
2. Inspect the latest Windows CI for that exact head; ignore CI tied to older heads.
3. If CI fails, read the exact failing log and fix only evidence-backed issues on the same branch/PR.
4. If CI succeeds, record run/job/artifact evidence and perform final semantic/diff review of the exact validated head.
5. Guarded-merge only that validated expected head.
6. Validate the resulting main source SHA with Windows CI.
7. Only then update TODO/STATUS/HANDOFF and create a new immutable reminder work-log entry.

## IMPORTANT INVARIANTS

- persistence-first mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- week starts Monday;
- timed local datetimes resolve through explicit IANA timezone rules and fail closed on gap/fold;
- reminder due evaluation must not perform hidden notification side effects;
- `fired_at` is an explicit successful-delivery acknowledgment boundary for the future dispatcher;
- recurrence generation remains deterministic/idempotent;
- renderer owns no authoritative timer/reminder state;
- process restart downtime is not counted as work;
- one-open-session database invariant remains enforced;
- preserve async `main` recreation that avoids the historical Windows WebView2 deadlock.

## HISTORICAL / SUPERSEDED WORK

PR #2 and PR #3 are historical alternate M1 shortcut implementations. PR #4/current main contains the required authoritative behavior; no source recovery from #2/#3 is pending.

Old branches may remain for history and do not imply active work.

## USER ACTION REQUIRED

None.
