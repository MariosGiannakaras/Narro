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

**`M-4/10 | 6/6 | 13/15`**

The compact progress line is presentation-only: field 1 is active milestone / roadmap milestones, field 2 is the current/latest completed slice checkpoints, and field 3 is completed top-level items / all top-level items in the active milestone.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`438b28a36dfba58b35fa221557ff37d776453f23`

This SHA is the guarded squash merge of PR #58, the diagnostic-only M4 physical due-reminder acceptance-harness slice.

### PR #58 exact-head validation

Initial PR head `6278197d4afcf59a1a592a9dfcde9aa15f9f04c5` failed Windows CI #254 / run `34056067473` / job `101548078178` only at `cargo fmt --check`. Frontend/config/date-formatting checks passed; release/artifact steps were skipped. Only the formatter-required line wrapping was changed and the failed run did not increment progress.

Exact validated PR head:

`8f73abf919f7babcfba76c2dd17c73d7a4fd138f`

- Windows PR CI #256 / run `34056230438` / job `101548519396`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9996212916`.
- Digest `sha256:5eb8bcff58f8da58fa3aa8190d2159a351d205617bd7bc0641f7090a2e608d35`.
- Final exact-head semantic/diff review: **PASS**.
- PR #58 had no comments, review submissions or review threads.

Guarded squash merge with expected head `8f73abf919f7babcfba76c2dd17c73d7a4fd138f` produced:

`438b28a36dfba58b35fa221557ff37d776453f23`

### Resulting-main validation

- Windows main CI #257 / run `34059656511` / job `101557789155`: **SUCCESS** on exact source SHA `438b28a36dfba58b35fa221557ff37d776453f23`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9997215512`.
- Artifact name `narro-m1-runtime-harness-windows-x64`.
- Digest `sha256:d0192494bd8bdfca957109c28d969b1e6ea21c4a5a185393d6de08a9e8a1229a`.
- Artifact contains `narro.exe` and generated NSIS/MSI installers.

Markdown-only reconciliation commits newer than this SHA do not replace the validated source/test baseline.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

## Milestone 4 — active validated state

Eleven coherent M4 source/test slices are now validated:

1. scheduling / eligibility core — PR #36;
2. timezone / DST correctness — PR #37;
3. recurrence execution/materialization core — PR #40/#41;
4. durable one-off reminder core — PR #43;
5. tray/background one-off reminder delivery source — PR #45;
6. Replace Existing Tasks — PR #47;
7. recurrence detachment semantics — PR #49;
8. recurrence startup/resume/date-change orchestration + missed-week catch-up — PR #51;
9. Windows locale/system visible date/time formatting — PR #54;
10. combined scheduling/recurrence regression-matrix completion — PR #56;
11. persisted physical due-reminder acceptance harness — PR #58.

### Scheduling/recurrence regression matrix

The top-level M4 regression requirement is fully covered by the combined validated test set:

- Monday/week classification and Sunday -> Monday rollover;
- strict IANA timezone resolution and fail-closed DST gap/fold handling;
- timed-schedule display-timezone changes without changing the represented instant;
- date-only schedules remain local-calendar values across timezone changes;
- future-timed Today tasks remain focus-ineligible until due;
- recurrence first startup avoids arbitrary historical backfill;
- repeated startup/same-week date changes remain idempotent;
- missed weeks catch up in Monday order without duplicate occurrences;
- timed recurrence resolves the current local date in each rule's own timezone;
- persisted weekend/date-only behavior remains stable across display timezones and Monday rollover.

### Scheduled-lane anti-duplication coverage

`src-tauri/tests/scheduled_lane_move_regression.rs`, introduced by commit `16bb8b3e2fc2ac44c23c31268ad92bf1cdf8b7a3`, performs 32 repeated reorder + Backlog -> Today -> Backlog cycles and proves stable task IDs/count, preserved schedule fields and one-bucket membership. Repository preflight runs `cargo test --all-targets --locked`, so this regression continues to be exercised by current Windows validation.

### Reminder acceptance harness

PR #58 adds the narrow manual-test seam required to validate the two remaining M4 reminder items without external SQLite manipulation and without prematurely implementing Milestone 5 scheduling UI.

Validated contract:

- isolated Rust acceptance module `src-tauri/src/reminder_acceptance.rs`;
- one Tauri command `schedule_reminder_acceptance_probe`;
- one existing-diagnostic-surface control `Schedule Real Reminder Probe (+2 min)`;
- renderer supplies only near-future local date/time plus its resolved IANA timezone;
- Rust validates local date/time, timezone and strict DST resolution before writes;
- diagnostic list + Today task + actual reminder are persisted atomically in one SQLite transaction;
- deterministic tests prove the reminder becomes visible to the real `pending_due_reminders` boundary;
- deterministic forced reminder-insert failure proves atomic rollback;
- invalid timezone is rejected before writes;
- the command never calls the notification API;
- `reminder_service` and notification transport are unchanged, so the existing Rust-owned tray/background dispatcher is the only path that can deliver and acknowledge the probe.

The expected physical notification is title `Task reminder`, body `Reminder acceptance probe - expected once`. The background cadence remains 30 seconds.

### M4 progress boundary

**`M-4/10 | 6/6 | 13/15`**

The only open top-level M4 items remain:

- `Implement one-off local reminders.`
- `Add tray/background due-reminder processing while process is running.`

Their source implementation plus a usable physical acceptance harness are now fully main-validated. They remain unchecked solely because visible installed-Windows delivery of one actual due reminder while Narro stays in tray/background mode has not yet been physically observed and returned as evidence.

Use main CI #257 / artifact `9997215512` / source SHA `438b28a36dfba58b35fa221557ff37d776453f23` for that acceptance. The artifact contains installers; installed-build notification identity is the required physical path.

Do not begin Milestone 5 before the physical reminder acceptance is recorded and Milestone 4 is reconciled complete. If the physical check fails, reopen only the evidence-backed reminder defect path.

## Durable correctness decisions

Future work must preserve:

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities and one-open-session invariant;
- renderer-independent timer accounting;
- date-only calendar semantics and Monday week boundaries;
- visible date/time formatting follows Windows/system locale by default without changing stored scheduling semantics;
- explicit IANA timezone resolution with fail-closed DST gap/fold handling;
- deterministic/idempotent recurrence while a rule exists;
- recurrence startup/resume/date-change orchestration remains Rust-owned and bounded;
- no-watermark recurrence orchestration starts from the current week rather than arbitrary historical backfill;
- missed weeks catch up in Monday-based order from the durable watermark;
- Replace Existing deletes only pristine applicable generated children;
- completed/archived and detached/independent recurrence history survives replacement;
- ordinary detachment never deletes child tasks or user history;
- removing recurrence leaves no active materialization authority for the removed rule;
- reminder due evaluation remains side-effect free until dispatch;
- reminder `fired_at` is written only after successful OS notification submission;
- failed reminder submission remains retryable;
- reminder delivery does not claim crash-proof exactly-once semantics across the post-submit/pre-ack crash window;
- acceptance harness is diagnostic-only and must never directly submit a notification;
- renderer owns no authoritative recurrence/reminder/timer state;
- reminder and recurrence background processing cadences remain bounded;
- scheduling/move operations preserve task identity count;
- async `main` recreation remains intact to avoid the historical Windows WebView2 deadlock.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and newest `work-log/*.md` entries as the continuation source of truth.
