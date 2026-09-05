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

## WORK-STATE SEMANTICS

Milestone states: **NOT STARTED**, **ACTIVE**, **COMPLETE**.

Implementation-slice states: **NOT STARTED**, **ACTIVE**, **PR VALIDATED**, **MERGED / MAIN VALIDATION PENDING**, **VALIDATED / RECONCILIATION PENDING**, **COMPLETE / RECONCILED**.

A later-milestone prerequisite implemented early is **FOUNDATION ONLY**. File existence, schema fields, old branches/PRs or reusable notification/window/preferences capability do not mark a later milestone started.

## ACTIVE WORK RECORD

- Active milestone: **Milestone 4**.
- Latest completed source slice: **durable one-off reminder core — COMPLETE / RECONCILED**.
- Active source slice: **None**.
- Active implementation branch: **None**.
- Active implementation PR: **None**.
- Pending source CI/main validation: **None**.
- Latest fully main-validated source baseline: **`3ba3203fa567234665f5caa2e1e6bede98805d64`**.
- Next M4 source slice: **tray/background OS reminder delivery orchestration — NOT STARTED**.
- Later milestones M5–M10: **NOT STARTED**.

A new chat must not reinterpret the validated reminder core as end-to-end reminder delivery. The product-level one-off reminder item remains open until due rows are reliably dispatched through the existing Windows notification transport while the process is running.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες** for the completed durable one-off reminder core slice.

Do not reset the small counter until a genuinely new source slice begins and its denominator is stated.

## LATEST VALIDATED SOURCE BASELINE

`3ba3203fa567234665f5caa2e1e6bede98805d64`

### PR #43 exact-head validation

Exact validated PR head:

`e7ad0e936bda7bd55bf6146eeed9834342dec4c3`

- Windows PR CI #221 / run `33984170905` / job `101354563375`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9974807441`.
- Digest `sha256:3d427309eb210efbee385a09a3fdba65ff1e595fd99bd0623374658bd18f5db9`.

PR #43 was guarded-squash-merged with expected head `e7ad0e936bda7bd55bf6146eeed9834342dec4c3` and produced:

`3ba3203fa567234665f5caa2e1e6bede98805d64`

### Resulting-main validation

- Windows main CI #222 / run `33984813779` / job `101356279605`: **SUCCESS** on exact source SHA `3ba3203fa567234665f5caa2e1e6bede98805d64`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9974997335`.
- Digest `sha256:c82b91fe12b797f6b95a6257d558741203c3a194fa6d4f3737fbdd25a6bea7c4`.

Markdown-only tracking commits newer than this SHA do not replace the validated source baseline.

## VALIDATED M4 CAPABILITIES

### Scheduling / eligibility — PR #36

- Monday-starting week classification.
- Official Today / Later today (+2h) / Tomorrow / Next week (+7d) / custom-date shortcuts.
- Scheduled Today / This Week / Backlog projection.
- Future-timed Today focus gating.
- Date-only calendar semantics and stable task identity through schedule changes.

### Timezone / DST — PR #37

- IANA timezone validation/resolution through `jiff`.
- Stable-instant timed schedules and timezone reprojection.
- Strict DST gap/fold rejection.
- Date-only schedules remain outside UTC conversion.

### Recurrence execution/materialization — PR #40/#41

- Day/week/month/year interval occurrence evaluation.
- Weekday masks and monthly calendar-date rules.
- Monday-through-Sunday materialization window.
- Recurring parent normalization to unscheduled Backlog.
- Stable child task IDs with recurrence-parent linkage.
- Transactional child + `recurrence_occurrences` creation.
- Durable same-week duplicate prevention.
- Strict timed recurrence timezone/DST validation.
- Inactive-rule no-op and rollback on failed materialization.

Evidence: `work-log/2026-09-05-chatgpt-m4-recurrence-materialization-reconciliation.md`.

### Durable one-off reminder core — PR #43

Validated:

- typed `ReminderRecord` / `NewReminderInput` using the existing M2 `reminders` table;
- strict RFC3339 mutation timestamp, local date/time, IANA timezone and DST gap/fold validation;
- reminder creation rejected for completed/archived tasks and archived-list contexts;
- side-effect-free pending-due evaluation by resolved absolute instant;
- due selection excludes fired/dismissed and inactive task/list rows;
- explicit conditional/idempotent `mark_reminder_fired` and `dismiss_reminder` terminal transitions;
- timezone instant-order, DST, terminal idempotency and inactive-context integration regressions.

Explicitly not implemented by PR #43:

- tray/background polling or due dispatch;
- OS notification submission for due reminders;
- exactly-once delivery across a crash window between OS submission and `fired_at` acknowledgment;
- Preferences/UI behavior, sounds/previews or recurring reminder generation.

Evidence: `work-log/2026-09-05-chatgpt-m4-reminder-core-reconciliation.md`.

## M4 TODO STATE

Validated and checked in `TODO.md`:

- Monday week classification;
- official scheduling shortcuts;
- scheduled lane classification;
- future-timed Today eligibility;
- date-only no-day-shift semantics;
- recurrence interval/unit/weekday execution;
- recurring parent Backlog + Monday-of-due-week child materialization.

Still open:

- product-level one-off local reminders (durable core validated, delivery still absent);
- Replace Existing Tasks;
- recurrence detachment;
- startup/resume/date-change recurrence orchestration and missed-day catch-up;
- tray/background due-reminder processing;
- Windows locale/system 12/24-hour formatting;
- combined M4 regression matrix including repeated startup/missed days/reminder delivery;
- explicit scheduled-lane movement anti-duplication regression.

## NEXT AGENT ACTION — NOT STARTED

Remain inside Milestone 4. There is no active source PR to resume after this reconciliation.

The next ordered implementation slice should complete reminder delivery using the already validated reminder core:

1. inspect `src-tauri/src/notifications/mod.rs`, tray/background lifecycle in `src-tauri/src/lib.rs`, and database/service ownership patterns;
2. create one narrow reminder-delivery branch from validated source baseline `3ba3203fa567234665f5caa2e1e6bede98805d64` (or current main whose source ancestry includes it);
3. set a fresh explicit small-slice denominator and immediately record the ACTIVE branch/PR here when source work begins;
4. consume `pending_due_reminders` without moving due evaluation into renderer code;
5. submit the OS notification first and persist `fired_at` only after successful delivery submission;
6. design restart/retry behavior against the historical late/duplicate/missed reminder risk without claiming exactly-once crash semantics unless proven;
7. validate exact PR head in Windows CI, guarded-merge, validate resulting main, then reconcile tracking.

Do not begin M5+ while M4 remains open.

## IMPORTANT INVARIANTS

- persistence-first mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- week starts Monday;
- timed local datetimes resolve through explicit IANA timezone rules and fail closed on gap/fold;
- recurrence remains deterministic/idempotent and `recurrence_occurrences` is the durable duplicate-prevention boundary;
- reminder due evaluation stays side-effect free;
- never mark a reminder fired before successful notification submission;
- fired/dismissed reminder transitions remain terminal/idempotent;
- renderer owns no authoritative timer/reminder state;
- process restart downtime is not counted as work;
- one-open-session database invariant remains enforced;
- preserve async `main` recreation that avoids the historical Windows WebView2 deadlock.

## HISTORICAL / SUPERSEDED WORK

PR #2 and PR #3 are historical alternate M1 shortcut implementations; PR #4/current main contains the authoritative required behavior. Old branches may remain for history and do not imply active work.

## USER ACTION REQUIRED

None.
