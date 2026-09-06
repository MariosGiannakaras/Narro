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

**`M-4/10 | 6/6 | 11/15`**

The compact progress line is presentation-only: field 1 is active milestone / roadmap milestones, field 2 is the current or latest completed slice checkpoints, and field 3 is completed top-level items / all top-level items in the active milestone.

## Current validated source baseline

Latest fully main-validated **source** baseline:

`cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`

This SHA is the guarded squash merge of PR #54, the M4 Windows locale/system visible date/time formatting slice.

### PR #54 exact-head validation

Exact validated PR head:

`73010ed9777d70123eee966c736ab1528173258c`

- Windows PR CI #248 / run `34032151067` / job `101483547592`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9989152398`.
- Digest `sha256:5d40ce11808defb18602cd5aa8d18077d59986181841b876f7167ea18aa9849f`.
- Final exact-head semantic/diff review: **PASS**.
- PR #54 had no unresolved review threads or comments.

Guarded squash merge with expected head `73010ed9777d70123eee966c736ab1528173258c` produced:

`cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`

### Resulting-main validation

- Windows main CI #249 / run `34038489647` / job `101500825881`: **SUCCESS** on exact source SHA `cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9991119217`.
- Digest `sha256:769419c27a7c02624a6891ea692ecc218e42600aa4a2cbbe57e922b3b9c5e7e9`.

Markdown-only reconciliation commits newer than this SHA do not replace the validated source baseline.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

## Milestone 4 — active validated state

Nine coherent M4 source slices are now validated:

1. scheduling / eligibility core — PR #36;
2. timezone / DST correctness — PR #37;
3. recurrence execution/materialization core — PR #40/#41;
4. durable one-off reminder core — PR #43;
5. tray/background one-off reminder delivery source — PR #45;
6. Replace Existing Tasks — PR #47;
7. recurrence detachment semantics — PR #49;
8. recurrence startup/resume/date-change orchestration + missed-week catch-up — PR #51;
9. Windows locale/system visible date/time formatting — PR #54.

### Windows locale/system visible formatting

Validated:

- `src/dateTimeFormat.ts` is the shared visible date/time formatting boundary for both webviews;
- production/default formatting leaves locale and 12/24-hour convention to WebView2/Intl runtime defaults, so Windows/system locale settings are respected;
- date-only `YYYY-MM-DD` values remain local-calendar values and are not converted through UTC;
- local clock values are strict `HH:mm` before locale formatting;
- deterministic tests exercise the actual TypeScript formatter, including leap-day/date validity, invalid clocks, date-only component preservation, explicit 12-hour/24-hour locales and default runtime resolution;
- formatter contract testing is part of repository preflight before the frontend build;
- the shared diagnostic projection proves both existing webviews consume the same formatter boundary;
- no Rust/domain/schema/scheduling/timezone semantics changed in this slice.

Evidence: `work-log/2026-09-06-chatgpt-m4-windows-locale-formatting-reconciliation.md`.

### M4 progress boundary

The Windows locale-formatting source slice is fully reconciled after its tracking PR merges:

**`M-4/10 | 6/6 | 11/15`**

Still open in M4:

- physical visible one-off due-reminder acceptance in tray/background mode; source implementation remains validated;
- remaining combined M4 regression matrix: DST, Monday/week boundaries, timezone changes, repeated startup, missed days, future-time eligibility, weekend and date-only behavior;
- explicit scheduled-lane movement anti-duplication regression at the M4 behavior layer.

The next ordered **unblocked source** implementation slice is the combined M4 scheduling/recurrence regression matrix. The reminder top-level items remain open only because physical installed-build notification acceptance is still pending; this independent physical evidence does not block later source work unless it reveals a defect.

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
- async `main` recreation remains intact to avoid the historical Windows WebView2 deadlock.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and newest `work-log/*.md` entries as the continuation source of truth.
