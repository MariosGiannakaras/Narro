# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/PRODUCT_SPEC.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

- Milestone 1 / Gate A: COMPLETE / PASS.
- Milestone 2 / Gate B: COMPLETE / PASS.
- Milestone 3 / Gate C: COMPLETE / PASS.
- Milestone 4: ACTIVE / PARTIALLY IMPLEMENTED.
- Milestones 5–10: NOT STARTED.

Do not start M5+ while M4 remains open unless the user explicitly changes roadmap order.

## ACTIVE WORK RECORD

- Active milestone: **Milestone 4**.
- Latest completed source slice: **durable one-off reminder core — COMPLETE / RECONCILED**.
- Active source slice: **tray/background OS reminder delivery orchestration — ACTIVE**.
- Active implementation branch: **`ai/m4-reminder-delivery`**.
- Active implementation PR: **None yet**.
- Latest fully main-validated source baseline: **`3ba3203fa567234665f5caa2e1e6bede98805d64`**.
- Current small-slice progress: **1/6**.
- Later milestones M5–M10: **NOT STARTED**.

The branch was created after reminder-core reconciliation. No source delivery code has been committed yet. Resume this exact branch before starting any other source slice.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 1/6 ολοκληρωμένες.**

Reminder-delivery slice checkpoints:

1. product/risk/runtime ownership audit plus branch start;
2. Rust-owned tray/background dispatcher + deterministic tests + candidate diff review;
3. exact PR-head Windows CI success including repository preflight, Tauri release and artifact;
4. final semantic/diff review of the exact validated head;
5. guarded merge using the validated expected head;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation.

Do not increment a checkpoint from code presence alone.

## LATEST VALIDATED SOURCE BASELINE

`3ba3203fa567234665f5caa2e1e6bede98805d64`

- PR #43 exact head `e7ad0e936bda7bd55bf6146eeed9834342dec4c3` passed Windows CI #221 / run `33984170905` / job `101354563375`; artifact `9974807441`, digest `sha256:3d427309eb210efbee385a09a3fdba65ff1e595fd99bd0623374658bd18f5db9`.
- Guarded squash merge produced `3ba3203fa567234665f5caa2e1e6bede98805d64`.
- Resulting-main Windows CI #222 / run `33984813779` / job `101356279605` passed preflight, release build and artifact upload; artifact `9974997335`, digest `sha256:c82b91fe12b797f6b95a6257d558741203c3a194fa6d4f3737fbdd25a6bea7c4`.

Markdown-only commits newer than the source SHA do not replace the validated source baseline.

## VALIDATED REMINDER FOUNDATION

PR #43 established:

- typed one-off reminder persistence using the existing M2 `reminders` table;
- strict RFC3339/local-date/local-time/IANA timezone validation and DST gap/fold rejection;
- active task/list checks on creation;
- side-effect-free `pending_due_reminders` ordered by resolved instant;
- fired/dismissed and inactive task/list reminders excluded from pending selection;
- conditional/idempotent `mark_reminder_fired` and `dismiss_reminder` terminal transitions.

The reminder core deliberately does not submit OS notifications. The M4 one-off reminder TODO and tray/background due-processing TODO remain open until this active slice is validated and reconciled.

## ACTIVE DELIVERY CONTRACT

Implement the narrowest Rust-owned dispatcher using existing process/tray/runtime infrastructure:

1. Reuse `src-tauri/src/notifications/mod.rs` for Windows notification submission; do not add renderer polling.
2. Reuse the persisted reminder core; do not create a second reminder storage model.
3. Background processing owns a separately configured SQLite connection rather than borrowing renderer state.
4. For each due reminder, submit the OS notification first. Persist `fired_at` only after successful submission.
5. On submission failure, leave the reminder pending for later retry and log the failure without terminating the app.
6. Acknowledge the unavoidable crash window between successful OS submission and `fired_at` persistence; do not claim exactly-once delivery unless a stronger durable protocol is implemented and validated.
7. Exclude completed/archived task/list reminders through the existing due query.
8. Avoid high-frequency work; use a bounded background cadence suitable for minute-resolution reminders.
9. Tests must deterministically prove: successful delivery is acknowledged; failed submission stays pending; repeated processing after acknowledgment does not resubmit; multiple due reminders are handled in deterministic due order; terminal/inactive rows are skipped; dispatcher persistence failure is explicit and does not masquerade as successful acknowledgment.

Historical reliability context: Blitzit mobile release history includes late/duplicate/missed reminder fixes. Treat restart/retry and duplicate-risk behavior as an explicit M4 regression class.

## M4 TODO STATE

Already validated/checked:

- Monday week classification;
- official scheduling shortcuts;
- scheduled lane classification;
- future-timed Today eligibility;
- date-only no-day-shift semantics;
- recurrence interval/unit/weekday execution;
- recurring parent Backlog + Monday-of-due-week child materialization.

Still open:

- product-level one-off local reminders (**active delivery slice**);
- Replace Existing Tasks;
- recurrence detachment;
- startup/resume/date-change recurrence orchestration and missed-day catch-up;
- tray/background due-reminder processing (**active delivery slice**);
- Windows locale/system 12/24-hour formatting;
- combined M4 regression matrix including repeated startup/missed days/reminder delivery;
- explicit scheduled-lane movement anti-duplication regression.

## NEXT AGENT ACTION — ACTIVE BRANCH

1. Inspect reminder persistence, notification transport, `TimerService` background pattern, task lookup/title fields and persistence connection configuration.
2. Implement the dispatcher and tests on `ai/m4-reminder-delivery`.
3. Review the entire candidate diff before opening the PR.
4. Record unavailable local checks as NOT RUN; Windows GitHub Actions is authoritative for Rust/Tauri validation in this connector-only environment.
5. Open one implementation PR, validate its exact head, final-review the same head, guarded-merge it, validate resulting main, then reconcile tracking.

## IMPORTANT INVARIANTS

- persistence-first authoritative mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- week starts Monday;
- strict IANA timezone/DST resolution for timed data;
- recurrence remains deterministic/idempotent;
- reminder due evaluation remains side-effect free;
- never mark a reminder fired before successful notification submission;
- fired/dismissed reminder transitions remain terminal/idempotent;
- renderer owns no authoritative reminder/timer state;
- do not introduce an unbounded/high-frequency background polling loop;
- preserve async `main` recreation and current tray/background lifecycle.

## USER ACTION REQUIRED

None.
