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

The compact progress line is presentation-only: field 1 is active milestone / roadmap milestones, field 2 is the current or latest completed slice checkpoints, and field 3 is completed top-level items / all top-level items in the active milestone.

## Current validated source baseline

Latest fully main-validated **source/test** baseline:

`9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`

This SHA is the guarded squash merge of PR #56, the M4 combined scheduling/recurrence regression-matrix slice.

### PR #56 exact-head validation

Exact validated PR head:

`0a632c0ccb0a6df4f617807069c5b04671631153`

- Windows PR CI #252 / run `34042286755` / job `101511100987`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9992229943`.
- Digest `sha256:c649584b0f2b24c14deb231f87b509057efe5d7209ab43632704af5ad1ef0912`.
- Final exact-head semantic/diff review: **PASS**.
- PR #56 had no unresolved review threads or comments.

Guarded squash merge with expected head `0a632c0ccb0a6df4f617807069c5b04671631153` produced:

`9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`

### Resulting-main validation

- Windows main CI #253 / run `34048631067` / job `101528105468`: **SUCCESS** on exact source SHA `9ece00dc1c2e2d06eb64fc3b1fe88a08954ad434`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9994050581`.
- Digest `sha256:59ecfea5477108de7bb1a754680df36bad3830650e5f7c3dca17a86545f52a70`.

Markdown-only reconciliation commits newer than this SHA do not replace the validated source/test baseline.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

## Milestone 4 — active validated state

Ten coherent M4 source/test slices are now validated:

1. scheduling / eligibility core — PR #36;
2. timezone / DST correctness — PR #37;
3. recurrence execution/materialization core — PR #40/#41;
4. durable one-off reminder core — PR #43;
5. tray/background one-off reminder delivery source — PR #45;
6. Replace Existing Tasks — PR #47;
7. recurrence detachment semantics — PR #49;
8. recurrence startup/resume/date-change orchestration + missed-week catch-up — PR #51;
9. Windows locale/system visible date/time formatting — PR #54;
10. combined scheduling/recurrence regression-matrix completion — PR #56.

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
- PR #56 adds the previously missing persisted weekend/date-only integration boundary: a Sunday date remains exactly the stored date, has no time/timezone fields, projects correctly across display timezones, and remains Today when overdue after Monday rollover.

No production scheduling, recurrence, schema, or renderer behavior changed in PR #56.

### Scheduled-lane anti-duplication coverage

The separate top-level M4 lane-move regression requirement was already implemented as reusable Milestone 2 reliability coverage in `src-tauri/tests/scheduled_lane_move_regression.rs`, introduced by commit `16bb8b3e2fc2ac44c23c31268ad92bf1cdf8b7a3`.

That regression performs 32 repeated reorder + Backlog -> Today -> Backlog cycles for a scheduled task and asserts throughout that:

- the same task ID is preserved;
- schedule kind/date/time/timezone are preserved;
- the scheduled task appears in exactly one active bucket at a time;
- the complete task set remains exactly three stable identities;
- persisted task-row count remains exactly three;
- exactly one row exists for the scheduled identity and schedule fields.

Repository preflight runs `cargo test --all-targets --locked`, so this regression was revalidated by both PR CI #252 and resulting-main CI #253. No duplicate source test was added merely to satisfy later milestone wording.

Evidence: `work-log/2026-09-06-chatgpt-m4-scheduling-regression-reconciliation.md` after the tracking reconciliation is merged.

### M4 progress boundary

The scheduling/recurrence regression slice is fully main-validated and reconciled after its tracking PR merges:

**`M-4/10 | 6/6 | 13/15`**

The only open top-level M4 items are:

- `Implement one-off local reminders.`
- `Add tray/background due-reminder processing while process is running.`

Their source implementations are already validated through PR #43/#45. They remain unchecked only because the required physical installed-build observation of one actual due reminder while Narro remains in tray/background mode has not yet been recorded. No further unblocked M4 source work remains unless that physical check reveals a defect. Do not begin Milestone 5 before Milestone 4 is actually completed under the ordered-roadmap rule.

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
- reminder due evaluation remains side-effect free;
- reminder `fired_at` is written only after successful OS notification submission;
- failed reminder submission remains retryable;
- renderer owns no authoritative recurrence/reminder/timer state;
- reminder and recurrence background processing cadences remain bounded;
- scheduling/move operations preserve task identity count;
- async `main` recreation remains intact to avoid the historical Windows WebView2 deadlock.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and newest `work-log/*.md` entries as the continuation source of truth.
