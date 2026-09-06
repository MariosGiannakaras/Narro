# HANDOFF.md

This is the canonical zero-context continuation state for Narro. Start with `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, this file, the active Milestone 4 section in `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, `docs/PRODUCT_SPEC.md`, and the newest relevant immutable `work-log/*.md` entries.

## CURRENT MILESTONE

**Milestone 4 — Scheduling, recurrence, reminders, eligibility.**

- Milestone 1 / Gate A: COMPLETE / PASS.
- Milestone 2 / Gate B: COMPLETE / PASS.
- Milestone 3 / Gate C: COMPLETE / PASS.
- Milestone 4: ACTIVE / PARTIALLY IMPLEMENTED.
- Milestones 5–10: NOT STARTED.

## ACTIVE WORK RECORD

- Latest completed source slice: **recurrence detachment semantics — COMPLETE / RECONCILED**.
- Active source slice: **None**.
- Active implementation branch: **None**.
- Active implementation PR: **None**.
- Pending source CI/main validation: **None**.
- Latest fully main-validated source baseline: **`6c9217f90f3b7db46a30393548e640faf671fb55`**.
- Next ordered source slice: **startup/resume/date-change recurrence orchestration and missed-day catch-up — NOT STARTED**.
- Physical reminder acceptance still pending: **visible due reminder while Narro remains in tray/background mode**.

Markdown-only reconciliation commits newer than the validated source SHA do not replace that source baseline.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες** for the recurrence detachment slice.

Do not reset the small counter until a genuinely new source slice begins and its denominator is stated.

Recurrence detachment checkpoints:

1. product/risk/schema/source audit plus branch start — COMPLETE;
2. detachment implementation contract + deterministic regressions + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — COMPLETE;
4. final semantic/diff review of exact validated head — COMPLETE;
5. guarded merge with expected validated head — COMPLETE;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — COMPLETE after the tracking PR carrying this file is merged.

## LATEST VALIDATED SOURCE BASELINE

`6c9217f90f3b7db46a30393548e640faf671fb55`

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
- Unresolved inline review threads: **none**.

PR #49 was guarded-squash-merged with expected head `d7e41e69ed3e69647ad1b67a5d07efaa0d034784` and produced:

`6c9217f90f3b7db46a30393548e640faf671fb55`

### Resulting-main validation

- Windows main CI #239 / run `34017068364` / job `101442607083`: **SUCCESS** on exact source SHA `6c9217f90f3b7db46a30393548e640faf671fb55`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9984403460`.
- Digest `sha256:d8426b78e8e2cb7ed4c509be41e8de1bdf3688f892bb202b7787b4279bc82409`.

Evidence: `work-log/2026-09-06-chatgpt-m4-recurrence-detachment-reconciliation.md`.

## VALIDATED RECURRENCE DETACHMENT CONTRACT

- ordinary recurrence removal reuses the canonical persistence mutation rather than introducing a second recurrence authority;
- generated child task identities survive recurrence removal;
- edited titles and task-owned notes/subtasks/reminders/sessions survive;
- completed and archived generated children survive;
- children already independent before recurrence removal remain unchanged;
- parent recurrence link is cleared;
- still-linked generated children lose their recurrence-parent link and become independent;
- deleting the removed rule also removes its occurrence rows, but never child tasks;
- a removed rule cannot materialize future children;
- forced delete failure rolls back child/parent link changes and occurrence cleanup;
- repeated detach returns typed `NotFound` without mutating preserved tasks.

## REMINDER ACCEPTANCE — INDEPENDENT PENDING EVIDENCE

PR #45 reminder source remains fully validated and reconciled. Physical installed-build observation of one actual due reminder in tray/background mode remains pending before the two reminder TODO parent items may be checked. Do not reopen PR #45 unless physical evidence reveals a defect.

## NEXT AGENT ACTION — NOT STARTED

Remain inside Milestone 4.

The next ordered source implementation item is **startup/resume/date-change recurrence orchestration and missed-day catch-up**.

Before changing source:

1. run the mandatory startup sequence from repository state;
2. confirm no open implementation PR and confirm current main descends from validated source baseline `6c9217f90f3b7db46a30393548e640faf671fb55`;
3. inspect recurrence materialization watermark/orchestration ownership, process startup, tray/background lifecycle, and date-change/resume hooks;
4. consult `docs/BLITZIT_HISTORY_RISK_INDEX.md` for missed/duplicate scheduling reliability risks;
5. create one narrow source branch from current main and record a fresh small-slice denominator immediately;
6. make repeated startup/resume/date-change idempotent and cover missed-day catch-up without duplicate children;
7. validate exact PR head on authoritative Windows CI, perform final semantic review, guarded-merge, validate resulting main, then reconcile tracking.

Physical reminder acceptance may be captured independently. If it exposes a defect, stop the recurrence slice and address the evidence-backed reminder defect first.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- completed/archived recurrence history survives replacement/detachment;
- ordinary detachment never deletes child tasks or user history;
- recurrence removal leaves no active materialization authority for the removed rule;
- repeated materialization remains idempotent;
- date-only schedules never convert through UTC;
- week starts Monday;
- strict IANA timezone/DST rules remain fail-closed;
- recurrence mutations are transactional;
- reminder due evaluation remains side-effect free;
- reminder delivery remains submit-before-ack and failed submissions remain retryable;
- no renderer owns authoritative recurrence/reminder/timer state;
- async `main` recreation remains intact to avoid the historical Windows WebView2 deadlock.

## USER ACTION REQUIRED

None for the next recurrence source slice. Physical installed-build visible due-reminder observation remains independently pending for reminder acceptance.
