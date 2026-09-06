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

- Latest completed source slice: **Windows locale/system 12/24-hour visible date/time formatting — COMPLETE / RECONCILED**.
- Active source slice: **combined M4 scheduling/recurrence regression matrix — ACTIVE / CANDIDATE READY**.
- Active implementation branch: **`ai/m4-scheduling-regression-matrix`**.
- Active implementation PR: **None yet**.
- Latest fully main-validated source baseline: **`cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`**.
- Branch base is tracking-only `main` **`053c2367eb0913888a6bde48255c731975ccf0c1`**; Markdown-only descendants do not replace the validated source baseline.
- Existing tests already cover DST gap/fold fail-closed behavior, Monday week boundaries, display-timezone changes, future-time eligibility, date-only timezone stability, recurrence first startup, repeated passes, same-week date changes, missed-week catch-up, and recurrence rule-local timezone resolution.
- Candidate adds only the missing persisted weekend/date-only boundary coverage; no production code changes are required. The existing recurrence tests already cover missed-day/startup progression strongly enough, so duplicating them was intentionally avoided.
- Local project preflight is NOT RUN in the connector-only environment; authoritative Windows CI is required for the exact PR head.

## USER-FACING PROGRESS

**`M-4/10 | 2/6 | 11/15`**

Regression-matrix checkpoints:

1. mandatory startup + current risk/test inventory + branch start + fresh denominator — COMPLETE;
2. add only missing scheduling/recurrence regressions + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — PENDING;
4. final exact-head semantic/diff review — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## CANDIDATE CONTRACT

New integration regression `src-tauri/tests/scheduling_weekend_date_only.rs` proves:

- a persisted Sunday `DateOnly` schedule retains exactly `2026-09-13` with no local time or timezone fields;
- at one absolute instant, display-timezone changes may change whether that local calendar date is Today vs This Week, but may not reinterpret or mutate the stored date-only value;
- Saturday -> Sunday -> Monday projection keeps the Sunday task This Week, then Today, then overdue Today according to existing scheduling rules;
- the task identity set remains exactly one task across this projection-only boundary.

Candidate diff contains only `HANDOFF.md` tracking plus the new integration test. It changes no production Rust/domain/schema/scheduling behavior and does not close the separate scheduled-lane movement anti-duplication TODO item.

## LATEST VALIDATED SOURCE BASELINE

`cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`

PR #54 exact head `73010ed9777d70123eee966c736ab1528173258c` passed Windows CI #248 / run `34032151067` / job `101483547592`; guarded squash merge produced the source baseline above. Resulting-main Windows CI #249 / run `34038489647` / job `101500825881` also passed repository preflight, Tauri release build and artifact upload. Main artifact ID `9991119217`, digest `sha256:769419c27a7c02624a6891ea692ecc218e42600aa4a2cbbe57e922b3b9c5e7e9`.

## NEXT AGENT ACTION — PR VALIDATION

1. Open one PR from `ai/m4-scheduling-regression-matrix` and record its exact head SHA.
2. Accept Windows CI only for that exact head; on failure inspect the exact failing step/log and fix only evidence-backed problems.
3. On success, record run/job/artifact/digest and perform final exact-head semantic/diff review.
4. Guarded-merge only the validated expected head.
5. Validate resulting main on authoritative Windows CI.
6. Reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and create one new immutable work-log entry.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- date-only schedules never convert through UTC;
- visible date/time formatting follows Windows/system locale by default without changing stored scheduling semantics;
- strict IANA timezone/DST rules remain fail-closed;
- week starts Monday;
- occurrence uniqueness remains the recurrence duplicate-prevention boundary;
- recurrence startup/resume/date-change orchestration remains Rust-owned, bounded and idempotent;
- reminder delivery submit-before-ack/retry semantics remain unchanged;
- no renderer owns authoritative recurrence/reminder/timer state;
- async `main` recreation remains intact.

## REMINDER ACCEPTANCE — INDEPENDENT PENDING EVIDENCE

PR #45 reminder source remains fully validated and reconciled. Physical installed-build observation of one actual due reminder in tray/background mode remains pending before the two reminder TODO parent items may be checked. Do not reopen PR #45 unless physical evidence reveals a defect.

## USER ACTION REQUIRED

None for this regression source slice. Physical installed-build visible due-reminder observation remains independently pending for reminder acceptance.
