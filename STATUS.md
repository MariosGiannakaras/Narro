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

`6c9217f90f3b7db46a30393548e640faf671fb55`

This SHA is the guarded squash merge of PR #49, the M4 recurrence detachment slice.

### PR #49 exact-head validation

Exact validated PR head:

`d7e41e69ed3e69647ad1b67a5d07efaa0d034784`

- Windows PR CI #238 / run `34016467394` / job `101440990105`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9984212532`.
- Digest `sha256:f04e43e3d06e487dd7d37ea6414f3a739a139e2b9ec48c33514fa4c13363505d`.
- Final exact-head semantic/diff review: **PASS**.
- PR #49 had no unresolved review threads.

Guarded squash merge with expected head `d7e41e69ed3e69647ad1b67a5d07efaa0d034784` produced:

`6c9217f90f3b7db46a30393548e640faf671fb55`

### Resulting-main validation

- Windows main CI #239 / run `34017068364` / job `101442607083`: **SUCCESS** on exact source SHA `6c9217f90f3b7db46a30393548e640faf671fb55`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9984403460`.
- Digest `sha256:d8426b78e8e2cb7ed4c509be41e8de1bdf3688f892bb202b7787b4279bc82409`.

Markdown-only reconciliation commits newer than this SHA do not replace the validated source baseline.

## Milestone 1 — Gate A complete

**PASS.** Tauri 2 + WebView2 architecture retained after physical Windows capability/performance validation. Key evidence remains under `work-log/2026-09-03-*`.

## Milestone 2 — Gate B complete

**PASS.** Durable SQLite/domain identity, CRUD, ordering, archive/delete, task metadata, recurrence/reminder/session schema, preferences and persistence-first mutation invariants are validated. Completion evidence: `work-log/2026-09-03-chatgpt-m2-completion.md`.

## Milestone 3 — Gate C complete

**PASS.** Authoritative timer/session engine, recovery, persistence boundaries, Pomodoro effects, large-elapsed safety and Windows sleep accounting are validated. Final M3 source baseline: `5eaf7f0eba1770112d41744377ea134ad5d41e33`.

## Milestone 4 — active validated state

Seven coherent M4 source slices are now validated:

1. scheduling / eligibility core — PR #36;
2. timezone / DST correctness — PR #37;
3. recurrence execution/materialization core — PR #40/#41;
4. durable one-off reminder core — PR #43;
5. tray/background one-off reminder delivery source — PR #45;
6. Replace Existing Tasks — PR #47;
7. recurrence detachment semantics — PR #49.

### PR #49 — recurrence detachment

Validated:

- ordinary recurrence removal reuses the canonical persistence mutation rather than a second recurrence authority;
- generated child task identities survive recurrence removal;
- edited title plus notes/subtasks/reminders/sessions survive;
- completed and archived generated children survive;
- already detached/independent children remain unchanged;
- parent recurrence link is cleared;
- still-linked child recurrence-parent links are cleared;
- rule-owned occurrence rows are removed with the deleted rule while child tasks remain;
- removed rules cannot materialize future children;
- forced delete failure rolls back child/parent link changes and occurrence cleanup;
- repeated detach returns typed `NotFound` without mutating preserved tasks.

Evidence: `work-log/2026-09-06-chatgpt-m4-recurrence-detachment-reconciliation.md`.

### M4 progress boundary

The recurrence detachment source slice is:

**Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες.**

Do not reset the small counter until a genuinely new source slice begins and its denominator is recorded.

Still open in M4:

- physical visible one-off due-reminder acceptance in tray/background mode; source implementation remains validated;
- startup/resume/date-change recurrence orchestration and missed-day catch-up;
- Windows locale/system 12/24-hour visible formatting;
- remaining combined M4 regression matrix, including repeated startup/missed days/reminder delivery;
- explicit scheduled-lane movement anti-duplication regression at the M4 behavior layer.

The next ordered source implementation slice is **startup/resume/date-change recurrence orchestration and missed-day catch-up — NOT STARTED**. Physical reminder acceptance can be captured independently without changing the validated source baseline unless it reveals a defect.

## Durable correctness decisions

Future work must preserve:

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities and one-open-session invariant;
- renderer-independent timer accounting;
- date-only calendar semantics and Monday week boundaries;
- explicit IANA timezone resolution with fail-closed DST gap/fold handling;
- deterministic/idempotent recurrence while a rule exists;
- Replace Existing deletes only pristine applicable generated children;
- completed/archived and detached/independent recurrence history survives replacement;
- ordinary detachment never deletes child tasks or user history;
- removing recurrence leaves no active materialization authority for the removed rule;
- reminder due evaluation remains side-effect free;
- reminder `fired_at` is written only after successful OS notification submission;
- failed reminder submission remains retryable;
- renderer owns no authoritative reminder/timer state;
- reminder processing cadence remains bounded and background-owned;
- async `main` recreation remains intact to avoid the historical Windows WebView2 deadlock.

## Multi-agent continuation rule

Repository state must be sufficient for a zero-context implementation agent. Use `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, `HANDOFF.md`, `TODO.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, and newest `work-log/*.md` entries as the continuation source of truth.
