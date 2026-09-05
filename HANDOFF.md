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
- Active implementation PR: **#45 — `M4: deliver due reminders in tray background runtime`**.
- Latest fully main-validated source baseline: **`3ba3203fa567234665f5caa2e1e6bede98805d64`**.
- Current source candidate is implemented and diff-reviewed; exact PR head must be re-read after this HANDOFF commit before accepting CI or merging.
- Local Rust/Node preflight in this connector-only environment: **NOT RUN**.
- Pending validation: **exact-head Windows PR CI, final exact-head semantic/diff review, guarded merge, resulting-main Windows CI, reconciliation**.
- Current small-slice progress: **2/6**.
- Later milestones M5–M10: **NOT STARTED**.

Resume PR #45 before any other source slice. Ignore CI tied to older heads.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 2/6 ολοκληρωμένες.**

Reminder-delivery checkpoints:

1. product/risk/runtime ownership audit plus branch start — COMPLETE;
2. Rust-owned tray/background dispatcher + deterministic tests + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including repository preflight, Tauri release and artifact — PENDING;
4. final semantic/diff review of the exact validated head — PENDING;
5. guarded merge using the validated expected head — PENDING;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## LATEST VALIDATED SOURCE BASELINE

`3ba3203fa567234665f5caa2e1e6bede98805d64`

- PR #43 exact head `e7ad0e936bda7bd55bf6146eeed9834342dec4c3` passed Windows CI #221 / run `33984170905` / job `101354563375`; artifact `9974807441`, digest `sha256:3d427309eb210efbee385a09a3fdba65ff1e595fd99bd0623374658bd18f5db9`.
- Guarded squash merge produced `3ba3203fa567234665f5caa2e1e6bede98805d64`.
- Resulting-main Windows CI #222 / run `33984813779` / job `101356279605` passed preflight, release and artifact upload; artifact `9974997335`, digest `sha256:c82b91fe12b797f6b95a6257d558741203c3a194fa6d4f3737fbdd25a6bea7c4`.

Markdown-only commits newer than this source SHA do not replace the validated source baseline.

## PR #45 CANDIDATE BEHAVIOR — NOT YET CI VALIDATED

The candidate reuses the PR #43 durable reminder core and existing Windows notification transport.

Implemented:

- `src-tauri/src/reminder_service.rs` owns reminder dispatch in Rust;
- a separately configured SQLite connection is opened for reminder background processing;
- startup performs an immediate due-reminder catch-up, then repeats at a bounded 30-second cadence;
- `pending_due_reminders` remains the side-effect-free deterministic due selector;
- task/list state is rechecked immediately before submission;
- notification submission happens before `fired_at` acknowledgment;
- failed Windows submissions remain pending for retry and do not terminate the process;
- successful acknowledgment excludes the row from later delivery cycles;
- notification task-title bodies are bounded to 200 Unicode characters;
- deterministic tests cover success/no-resubmit, failure/retry, resolved-instant order, inactive completed-task exclusion and explicit acknowledgment failure;
- `lib.rs` integration is narrow: module registration, durable database-path extraction and startup installation of the reminder background worker.

Reliability boundary:

- do **not** claim exactly-once notification delivery across the unavoidable crash window after successful OS submission but before `fired_at` persistence;
- no renderer polling or renderer-owned reminder authority;
- no second reminder schema/storage model;
- no high-frequency polling loop.

## M4 TODO STATE

Already validated/checked:

- Monday week classification;
- official scheduling shortcuts;
- scheduled lane classification;
- future-timed Today eligibility;
- date-only no-day-shift semantics;
- recurrence interval/unit/weekday execution;
- recurring parent Backlog + Monday-of-due-week child materialization.

Still open until required validation/reconciliation:

- product-level one-off local reminders (**PR #45 active**);
- tray/background due-reminder processing (**PR #45 active**);
- Replace Existing Tasks;
- recurrence detachment;
- startup/resume/date-change recurrence orchestration and missed-day catch-up;
- Windows locale/system 12/24-hour formatting;
- combined M4 regression matrix including repeated startup/missed days/reminder delivery;
- explicit scheduled-lane movement anti-duplication regression.

## NEXT AGENT ACTION — PR #45

1. Re-read PR #45 exact current head after this tracking commit.
2. Inspect Windows CI only for that exact head.
3. If CI fails, read the exact failing job log and fix only evidence-backed failures on the same branch/PR.
4. If CI succeeds, record run/job/artifact/digest and perform final semantic/diff review of the same exact head.
5. Guarded-merge only that validated expected head.
6. Validate the resulting main source SHA with Windows CI.
7. Reconcile TODO/STATUS/HANDOFF and create a new immutable reminder-delivery work-log entry. Interactive visible due-reminder behavior must not be claimed from CI alone.

## IMPORTANT INVARIANTS

- persistence-first authoritative mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- week starts Monday;
- strict IANA timezone/DST resolution for timed data;
- recurrence remains deterministic/idempotent;
- reminder due evaluation remains side-effect free;
- never mark a reminder fired before successful notification submission;
- fired/dismissed transitions remain terminal/idempotent;
- renderer owns no authoritative reminder/timer state;
- do not introduce an unbounded/high-frequency background polling loop;
- preserve async `main` recreation and current tray/background lifecycle.

## USER ACTION REQUIRED

None during automated PR/main validation. Physical Windows observation will be requested only if needed to close the interactive notification-delivery acceptance evidence.
