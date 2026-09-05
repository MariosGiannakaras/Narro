# STATUS.md

Last updated: 2026-09-05

For zero-context continuation start with `AI_START_HERE.md` and `HANDOFF.md`.

## Current phase

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

- Milestone 1 / Gate A: **PASS**.
- Milestone 2 / Gate B: **PASS**.
- Milestone 3 / Gate C: **PASS**.
- Milestone 4: **ACTIVE / PARTIALLY IMPLEMENTED**.
- Milestones 5–10: **NOT STARTED**.

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

Later-milestone scaffolds or reusable foundation do not count as starting those milestones.

## Current validated source baseline

Latest fully main-validated **source** baseline:

`cd30ffafbe3e9cb0431f4bc8230c095451a106ca`

This SHA is the guarded squash merge of PR #45, the M4 tray/background one-off reminder delivery source slice.

### PR #45 exact-head validation

Exact validated PR head:

`61e7a473917cc3ae189228af63f3969f5fac361a`

- Windows PR CI #226 / run `33987769236` / job `101364389957`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9975828913`.
- Digest `sha256:5efad294c22a6cdc936830f87495ad014393b1c992271fae5445ee7e94624b2f`.
- PR #45 had no unresolved review threads at final exact-head review.

Guarded squash merge with expected head `61e7a473917cc3ae189228af63f3969f5fac361a` produced:

`cd30ffafbe3e9cb0431f4bc8230c095451a106ca`

### Resulting-main validation

- Windows main CI #227 / run `33988613427` / job `101366662297`: **SUCCESS** on exact source SHA `cd30ffafbe3e9cb0431f4bc8230c095451a106ca`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9976084645`.
- Digest `sha256:31bd024a7f4da25191582a0cb0812df53d8ba20aa31abcd6dbe39e0d492d5550`.

Markdown-only reconciliation commits newer than this SHA do not replace the validated source baseline.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

## Milestone 4 — active validated state

Five coherent M4 source slices are now validated.

### PR #36 — scheduling / eligibility core

Validated Monday-starting week classification, official schedule shortcuts, scheduled lane projection, date-only semantics, future-timed Today focus gating and stable task identity.

Evidence: `work-log/2026-09-05-1618-chatgpt-m4-scheduling-core.md`.

### PR #37 — timezone / DST correctness

Validated IANA timezone resolution, stable-instant timed scheduling, strict gap/fold rejection, timezone reprojection and date-only isolation from UTC conversion.

Evidence: `work-log/2026-09-05-chatgpt-m4-timezone-dst-reconciliation.md`.

### PR #40 / #41 — recurrence execution/materialization core

Validated day/week/month/year recurrence evaluation, weekday/calendar-date rules, Monday-through-Sunday materialization, Backlog parent normalization, transactional child/occurrence creation, strict timed DST handling and durable same-week idempotency.

Evidence: `work-log/2026-09-05-chatgpt-m4-recurrence-materialization-reconciliation.md`.

### PR #43 — durable one-off reminder core

Validated typed reminder persistence, strict schedule/timezone/DST validation, side-effect-free due evaluation, inactive-context exclusion and terminal fired/dismissed transitions.

Evidence: `work-log/2026-09-05-chatgpt-m4-reminder-core-reconciliation.md`.

### PR #45 — tray/background one-off reminder delivery source

Validated:

- Rust-owned reminder dispatcher using a separately configured SQLite connection;
- immediate startup catch-up plus bounded 30-second cadence while Narro remains running in tray/background mode;
- reuse of the validated side-effect-free `pending_due_reminders` selector;
- active task/list re-check immediately before notification submission;
- existing Windows notification transport reused rather than a parallel transport;
- notification submission occurs before durable `fired_at` acknowledgment;
- failed submissions remain pending for retry without terminating the process;
- acknowledged reminders are excluded from subsequent cycles;
- deterministic due-order, retry/no-resubmit, inactive-task and acknowledgment-failure regressions;
- bounded task-title notification body by Unicode character count;
- narrow Tauri startup integration with no renderer-owned timer/reminder authority.

Reliability boundary: the source does **not** claim mathematically exactly-once delivery across the unavoidable crash window after OS submission and before `fired_at` persistence. A crash in that interval can cause a retry/duplicate after restart; hiding that limitation would be incorrect.

Evidence: `work-log/2026-09-05-chatgpt-m4-reminder-delivery-reconciliation.md`.

### M4 progress boundary

The reminder-delivery source slice is:

**Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες.**

The implementation and authoritative Windows PR/main validation are complete. The top-level `TODO.md` reminder items intentionally remain unchecked until a physical installed-build observation confirms that an actual due reminder is visibly delivered while Narro is in tray/background mode. CI validates the source path but cannot substitute for that visible OS acceptance evidence.

Still open in M4:

- physical visible one-off due-reminder acceptance in tray/background mode;
- Replace Existing Tasks execution;
- recurrence detachment semantics;
- startup/resume/date-change recurrence orchestration and missed-day catch-up;
- Windows locale/system 12/24-hour visible formatting;
- remaining combined M4 regression matrix, including repeated startup/missed days/reminder delivery;
- explicit scheduled-lane movement anti-duplication regression at the M4 behavior layer.

The next source implementation slice is **Replace Existing Tasks behavior — NOT STARTED**. Physical reminder acceptance can be captured independently without changing the validated source baseline unless it reveals a defect.

## Later milestone status

Milestones 5–10 remain **NOT STARTED**. Existing window, notification, preference, schema or report foundations do not change that state.

## Durable correctness decisions

Future work must preserve:

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities and one-open-session invariant;
- renderer-independent timer accounting;
- date-only calendar semantics and Monday week boundaries;
- explicit IANA timezone resolution with fail-closed DST gap/fold handling;
- deterministic/idempotent recurrence with `recurrence_occurrences` as the duplicate-prevention boundary;
- reminder due evaluation remains side-effect free;
- reminder `fired_at` is written only after successful OS notification submission;
- failed reminder submission remains retryable;
- renderer owns no authoritative reminder/timer state;
- reminder processing cadence remains bounded and background-owned;
- async `main` recreation remains intact to avoid the historical Windows WebView2 deadlock.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and newest `work-log/*.md` entries as the continuation source of truth.
