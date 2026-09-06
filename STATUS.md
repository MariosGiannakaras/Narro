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

**`M-4/10 | 6/6 | 10/15`**

Later-milestone scaffolds or reusable foundation do not count as starting those milestones. The compact progress line is presentation-only: field 1 is active milestone / roadmap milestones, field 2 is the current or latest completed slice checkpoints, and field 3 is completed top-level items / all top-level items in the active milestone.

## Current validated source baseline

Latest fully main-validated **source** baseline:

`83afcbee0583ef71dfc42c0e4c5266b0ed997fa0`

This SHA is the guarded squash merge of PR #51, the M4 recurrence startup/resume/date-change orchestration slice.

### PR #51 exact-head validation

Exact validated PR head:

`5adcb73099af418e007fe3d4b263d146d383c75e`

- Windows PR CI #241 / run `34018912013` / job `101447745275`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9984989563`.
- Digest `sha256:e899a6c05874cb50caabcc8d2e5db3b346a4a98f0e6cf269d9bbb5676fdf9643`.
- Final exact-head semantic/diff review: **PASS**.
- PR #51 had no unresolved review threads or comments.

Guarded squash merge with expected head `5adcb73099af418e007fe3d4b263d146d383c75e` produced:

`83afcbee0583ef71dfc42c0e4c5266b0ed997fa0`

### Resulting-main validation

- Windows main CI #244 / run `34022250016` / job `101456840746`: **SUCCESS** on exact source SHA `83afcbee0583ef71dfc42c0e4c5266b0ed997fa0`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9986069438`.
- Digest `sha256:41cade65815899a3c068f978f8f3e286eb75f0d0b3eb2e60267030bb6f201d4a`.

Markdown-only reconciliation commits newer than this SHA do not replace the validated source baseline.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

## Milestone 4 — active validated state

Eight coherent M4 source slices are now validated:

1. scheduling / eligibility core — PR #36;
2. timezone / DST correctness — PR #37;
3. recurrence execution/materialization core — PR #40/#41;
4. durable one-off reminder core — PR #43;
5. tray/background one-off reminder delivery source — PR #45;
6. Replace Existing Tasks — PR #47;
7. recurrence detachment semantics — PR #49;
8. recurrence startup/resume/date-change orchestration + missed-week catch-up — PR #51.

### PR #51 — recurrence orchestration

Validated:

- Rust owns recurrence orchestration; no renderer polling or second materialization engine exists;
- active recurrence rules are discovered from durable SQLite state;
- a rule with no materialization watermark starts with the current local week only, avoiding arbitrary historical backfill;
- an existing watermark catches up each missed Monday-based week in order before processing the current local date;
- repeated startup/same-day/same-week/date-change cycles create no duplicate child tasks because occurrence uniqueness remains the idempotency boundary;
- timed rules resolve their current local date through the rule's validated IANA timezone;
- date-only rules use the Windows/system local calendar date without UTC conversion;
- one failing active rule does not prevent unrelated active rules from being processed;
- successful earlier catch-up weeks remain durable if a later week fails, and retry resumes from the monotonic watermark;
- orchestration uses a separately configured SQLite connection;
- one immediate startup cycle plus a bounded 60-second background cycle covers normal startup, local date changes, and post-sleep/resume catch-up while Narro remains running;
- the existing `materialize_recurrence_week` transaction remains the only child/occurrence creation primitive.

Evidence: `work-log/2026-09-06-chatgpt-m4-recurrence-orchestration-reconciliation.md`.

### M4 progress boundary

The recurrence orchestration source slice is fully reconciled:

**`M-4/10 | 6/6 | 10/15`**

Do not reset the slice counter until a genuinely new source slice begins and its denominator is recorded.

Still open in M4:

- physical visible one-off due-reminder acceptance in tray/background mode; source implementation remains validated;
- Windows locale/system 12/24-hour visible formatting;
- remaining combined M4 regression matrix, including the still-open portions of DST/week/timezone/missed-day/future-time/weekend/date-only coverage;
- explicit scheduled-lane movement anti-duplication regression at the M4 behavior layer.

The next ordered **unblocked source** implementation slice is **Windows locale/system 12/24-hour visible date/time formatting**. The earlier reminder top-level items remain open only because physical installed-build notification acceptance is still pending; this independent physical evidence does not block later source work unless it reveals a defect.

## Durable correctness decisions

Future work must preserve:

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities and one-open-session invariant;
- renderer-independent timer accounting;
- date-only calendar semantics and Monday week boundaries;
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
- async `main` recreation remains intact to avoid the historical Windows WebView2 deadlock.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and newest `work-log/*.md` entries as the continuation source of truth.
