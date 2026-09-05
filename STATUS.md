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

`3ba3203fa567234665f5caa2e1e6bede98805d64`

This SHA is the guarded squash merge of PR #43, the M4 durable one-off reminder core.

### PR #43 validation

Exact validated PR head:

`e7ad0e936bda7bd55bf6146eeed9834342dec4c3`

- Windows PR CI #221 / run `33984170905` / job `101354563375`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9974807441`.
- Digest `sha256:3d427309eb210efbee385a09a3fdba65ff1e595fd99bd0623374658bd18f5db9`.

Guarded squash merge result:

`3ba3203fa567234665f5caa2e1e6bede98805d64`

### Resulting-main validation

- Windows main CI #222 / run `33984813779` / job `101356279605`: **SUCCESS** on exact source SHA `3ba3203fa567234665f5caa2e1e6bede98805d64`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9974997335`.
- Digest `sha256:c82b91fe12b797f6b95a6257d558741203c3a194fa6d4f3737fbdd25a6bea7c4`.

Markdown-only reconciliation commits newer than this SHA do not replace the validated source baseline.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

## Milestone 4 — active validated state

Four coherent M4 source slices are now validated:

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

Validated:

- typed `ReminderRecord` / `NewReminderInput` contract using the existing M2 reminder table;
- strict RFC3339 mutation timestamps, `YYYY-MM-DD`, `HH:MM`, IANA timezone and DST gap/fold validation;
- creation rejected for completed/archived tasks and archived-list contexts;
- deterministic side-effect-free pending-due evaluation using resolved absolute instants rather than local clock text;
- pending selection excludes fired, dismissed and inactive task/list reminders;
- conditional/idempotent `mark_reminder_fired` and `dismiss_reminder` terminal transitions;
- integration coverage for instant ordering across timezones, invalid timezone, New York DST gap/fold, terminal idempotency and inactive contexts.

The core deliberately does **not** perform OS notification delivery and does not claim exactly-once delivery across a crash between notification submission and `fired_at` acknowledgment.

Evidence: `work-log/2026-09-05-chatgpt-m4-reminder-core-reconciliation.md`.

### M4 progress boundary

The durable one-off reminder core slice is:

**Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες.**

No source slice is active after this reconciliation. The next ordered source slice is **NOT STARTED** and must receive a new explicit denominator when implementation begins.

The top-level `TODO.md` item **Implement one-off local reminders** remains unchecked because end-to-end reminder delivery is not complete. The next reminder slice must connect the validated due-query core to the existing Windows notification transport in tray/background mode and persist `fired_at` only after successful delivery submission.

Still open in M4:

- end-to-end one-off local reminder delivery / tray-background due processing;
- Replace Existing Tasks execution;
- recurrence detachment semantics;
- startup/resume/date-change recurrence orchestration and missed-day catch-up;
- Windows locale/system 12/24-hour visible formatting;
- remaining combined M4 regression matrix, including repeated startup/missed days/reminder delivery;
- explicit scheduled-lane movement anti-duplication regression at the M4 behavior layer.

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
- reminder `fired_at` is written only after an explicit successful delivery acknowledgment path;
- renderer owns no authoritative reminder/timer state;
- async `main` recreation remains intact to avoid the historical Windows WebView2 deadlock.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and newest `work-log/*.md` entries as the continuation source of truth.
