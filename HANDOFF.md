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
- Latest completed source slice: **tray/background one-off reminder delivery source — COMPLETE / RECONCILED**.
- Active source slice: **None**.
- Active implementation branch: **None**.
- Active implementation PR: **None**.
- Pending source CI/main validation: **None**.
- Latest fully main-validated source baseline: **`cd30ffafbe3e9cb0431f4bc8230c095451a106ca`**.
- Next ordered source slice: **Replace Existing Tasks behavior — NOT STARTED**.
- Physical acceptance still pending: **visible due reminder while Narro remains in tray/background mode**.
- Later milestones M5–M10: **NOT STARTED**.

A new chat must not reopen or recreate PR #45. Its source work is validated and merged. The only remaining reminder-specific evidence is physical installed-build observation; capture it without changing source unless the observation reveals a defect.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες** for the completed reminder-delivery source slice.

Do not reset the small counter until a genuinely new source slice begins and its denominator is stated.

Reminder-delivery checkpoints:

1. product/risk/runtime ownership audit plus branch start — COMPLETE;
2. Rust-owned tray/background dispatcher + deterministic tests + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including repository preflight, Tauri release and artifact — COMPLETE;
4. final semantic/diff review of the exact validated head — COMPLETE;
5. guarded merge using the validated expected head — COMPLETE;
6. resulting-main Windows CI plus STATUS/HANDOFF/new immutable work-log reconciliation — COMPLETE.

`TODO.md` is intentionally unchanged by this reconciliation because visible Windows due-notification acceptance has not yet been physically observed.

## LATEST VALIDATED SOURCE BASELINE

`cd30ffafbe3e9cb0431f4bc8230c095451a106ca`

### PR #45 exact-head validation

Exact validated PR head:

`61e7a473917cc3ae189228af63f3969f5fac361a`

- Windows PR CI #226 / run `33987769236` / job `101364389957`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9975828913`.
- Digest `sha256:5efad294c22a6cdc936830f87495ad014393b1c992271fae5445ee7e94624b2f`.
- Final exact-head review: no semantic blocker and no unresolved review threads.

PR #45 was guarded-squash-merged with expected head `61e7a473917cc3ae189228af63f3969f5fac361a` and produced:

`cd30ffafbe3e9cb0431f4bc8230c095451a106ca`

### Resulting-main validation

- Windows main CI #227 / run `33988613427` / job `101366662297`: **SUCCESS** on exact source SHA `cd30ffafbe3e9cb0431f4bc8230c095451a106ca`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9976084645`.
- Digest `sha256:31bd024a7f4da25191582a0cb0812df53d8ba20aa31abcd6dbe39e0d492d5550`.

Markdown-only reconciliation commits newer than this SHA do not replace the validated source baseline.

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

- typed reminder persistence using the existing reminder table;
- strict date/time/timezone/DST validation;
- side-effect-free pending-due evaluation by resolved absolute instant;
- inactive context exclusion;
- terminal/idempotent fired/dismissed transitions.

Evidence: `work-log/2026-09-05-chatgpt-m4-reminder-core-reconciliation.md`.

### Tray/background one-off reminder delivery source — PR #45

Validated:

- Rust-owned dispatcher with separately configured SQLite connection;
- immediate startup catch-up and bounded 30-second cadence;
- existing due-query and Windows notification transport reused;
- task/list active-state re-check before submit;
- OS notification submitted before `fired_at` persistence;
- failed submissions remain pending and retryable;
- successful acknowledgment prevents later resubmission;
- deterministic retry/no-resubmit, due-order, inactive-task and acknowledgment-failure coverage;
- Unicode-safe bounded task-title notification body;
- no renderer polling or second reminder authority/storage model.

Reliability boundary: exactly-once delivery cannot be guaranteed across a process crash after successful OS submission but before durable `fired_at` acknowledgment. Do not hide or overclaim this boundary.

Evidence: `work-log/2026-09-05-chatgpt-m4-reminder-delivery-reconciliation.md`.

## M4 TODO STATE

Validated and checked in `TODO.md` before this slice:

- Monday week classification;
- official scheduling shortcuts;
- scheduled lane classification;
- future-timed Today eligibility;
- date-only no-day-shift semantics;
- recurrence interval/unit/weekday execution;
- recurring parent Backlog + Monday-of-due-week child materialization.

Still open:

- one-off local reminders — source path validated, **physical visible due-notification acceptance still pending**;
- tray/background due-reminder processing — source path validated, **physical visible due-notification acceptance still pending**;
- Replace Existing Tasks;
- recurrence detachment;
- startup/resume/date-change recurrence orchestration and missed-day catch-up;
- Windows locale/system 12/24-hour formatting;
- combined M4 regression matrix including repeated startup/missed days/reminder delivery;
- explicit scheduled-lane movement anti-duplication regression.

## NEXT AGENT ACTION — NOT STARTED

Remain inside Milestone 4.

Source work should proceed with **Replace Existing Tasks behavior**, the next ordered unchecked implementation item after recurrence parent materialization/reminder source work.

Before changing source:

1. re-run the mandatory startup sequence from repository state;
2. confirm no open implementation PR and confirm main still descends from validated source `cd30ffafbe3e9cb0431f4bc8230c095451a106ca`;
3. inspect `docs/PRODUCT_SPEC.md` for exact Replace Existing Tasks semantics and relevant Blitzit reliability history;
4. create one narrow source branch from current main and set a fresh explicit small-slice denominator in this file immediately when implementation begins;
5. preserve recurrence child identity/history rules and do not infer ambiguous replacement behavior beyond documented product policy;
6. validate exact PR head on Windows, guarded-merge it, validate resulting main, then reconcile tracking.

Physical reminder acceptance may be captured independently. If it exposes a defect, stop the new slice and address the evidence-backed reminder defect first.

## IMPORTANT INVARIANTS

- persistence-first authoritative mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- week starts Monday;
- timed local datetimes resolve through explicit IANA timezone rules and fail closed on gap/fold;
- recurrence remains deterministic/idempotent and `recurrence_occurrences` remains the durable duplicate-prevention boundary;
- reminder due evaluation stays side-effect free;
- never mark a reminder fired before successful OS notification submission;
- failed reminder submission remains pending for retry;
- fired/dismissed reminder transitions remain terminal/idempotent;
- renderer owns no authoritative timer/reminder state;
- bounded reminder cadence; no high-frequency renderer/background polling;
- process restart downtime is not counted as work;
- one-open-session database invariant remains enforced;
- preserve async `main` recreation that avoids the historical Windows WebView2 deadlock.

## USER ACTION REQUIRED

Physical installed-build observation of one actual due reminder while Narro remains in tray/background mode is still needed before the two top-level reminder TODO items can be marked complete. No user decision is required for the next source implementation slice.
