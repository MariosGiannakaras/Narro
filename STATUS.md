# STATUS.md

Last updated: 2026-09-06

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

`bdcb7729b291e76206ca5916d2a84587b060223b`

This SHA is the guarded squash merge of PR #47, the M4 Replace Existing Tasks recurrence slice.

### PR #47 exact-head validation

Exact validated PR head:

`ce4181be2216f7ee2333b03302062cb89f4a3b56`

- Windows PR CI #235 / run `33992278666` / job `101376509763`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9977163499`.
- Digest `sha256:aa17138190feccc6a4fb1ec5717d34aec4df462ce2f16125f093272bf763aa41`.
- Final exact-head semantic/diff review: **PASS**.
- PR #47 had no unresolved review threads.

Guarded squash merge with expected head `ce4181be2216f7ee2333b03302062cb89f4a3b56` produced:

`bdcb7729b291e76206ca5916d2a84587b060223b`

### Resulting-main validation

- Windows main CI #236 / run `33993051867` / job `101378588286`: **SUCCESS** on exact source SHA `bdcb7729b291e76206ca5916d2a84587b060223b`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9977373964`.
- Digest `sha256:66eaac71f2514d70274e23d69c1fdadaadd33501299b367391b4a44f539f4714`.

Markdown-only reconciliation commits newer than this SHA do not replace the validated source baseline.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

## Milestone 4 — active validated state

Six coherent M4 source slices are now validated.

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

### PR #47 — Replace Existing Tasks

Validated:

- explicit `replace_existing = true` boundary;
- SQLite `IMMEDIATE` transaction for the replacement mutation;
- pristine active generated children are the only children deleted by replacement;
- completed/archived historical children remain intact;
- already detached/independent children remain intact;
- edited/history-bearing active generated children are preserved and detached rather than cascade-deleted;
- preserved/detached children retain the old `recurrence_occurrences` reservation so the same occurrence cannot regenerate as a duplicate;
- recurrence materialization cursor resets and normal materialization creates only unreserved occurrences with new task identities;
- invalid recurrence pattern/date/time/timezone shape fails before mutation, including weekday masks above seven supported bits;
- forced rule-update failure rolls back child mutations;
- final semantic review caught and corrected the occurrence-reservation duplicate-regeneration risk before the accepted exact-head CI/merge.

Evidence: `work-log/2026-09-06-chatgpt-m4-replace-existing-reconciliation.md`.

### M4 progress boundary

The Replace Existing Tasks source slice is:

**Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες.**

Do not reset the small counter until a genuinely new source slice begins and its denominator is recorded.

Still open in M4:

- physical visible one-off due-reminder acceptance in tray/background mode; source implementation remains validated;
- recurrence detachment semantics;
- startup/resume/date-change recurrence orchestration and missed-day catch-up;
- Windows locale/system 12/24-hour visible formatting;
- remaining combined M4 regression matrix, including repeated startup/missed days/reminder delivery;
- explicit scheduled-lane movement anti-duplication regression at the M4 behavior layer.

The next ordered source implementation slice is **recurrence detachment semantics — NOT STARTED**. Physical reminder acceptance can be captured independently without changing the validated source baseline unless it reveals a defect.

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
- Replace Existing deletes only pristine applicable generated children;
- completed/archived and detached/independent recurrence history survives replacement;
- preserved edited/history-bearing children retain occurrence reservations against duplicate regeneration;
- reminder due evaluation remains side-effect free;
- reminder `fired_at` is written only after successful OS notification submission;
- failed reminder submission remains retryable;
- renderer owns no authoritative reminder/timer state;
- reminder processing cadence remains bounded and background-owned;
- async `main` recreation remains intact to avoid the historical Windows WebView2 deadlock.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and newest `work-log/*.md` entries as the continuation source of truth.
