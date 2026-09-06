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
- Active source slice: **combined M4 scheduling/recurrence regression matrix — ACTIVE**.
- Active implementation branch: **`ai/m4-scheduling-regression-matrix`**.
- Active implementation PR: **None yet**.
- Latest fully main-validated source baseline: **`cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`**.
- Branch base is tracking-only `main` **`053c2367eb0913888a6bde48255c731975ccf0c1`**; Markdown-only descendants do not replace the validated source baseline.
- Startup/risk audit and existing-test inventory are complete. Existing tests already cover DST gap/fold fail-closed behavior, Monday week boundaries, display-timezone changes, future-time eligibility, date-only timezone stability, repeated recurrence passes, same-week date change, and missed-week catch-up.
- Missing coverage identified for this slice: explicit weekend/date-only boundary behavior and missed non-Monday day/startup progression without duplicate recurrence children.
- Local project preflight is NOT RUN in the connector-only environment; authoritative Windows CI is required for the exact PR head.

## USER-FACING PROGRESS

**`M-4/10 | 1/6 | 11/15`**

Regression-matrix checkpoints:

1. mandatory startup + current risk/test inventory + branch start + fresh denominator — COMPLETE;
2. add only missing scheduling/recurrence regressions + candidate diff review — PENDING;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — PENDING;
4. final exact-head semantic/diff review — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## LATEST VALIDATED SOURCE BASELINE

`cadcf8b2d6d25d8cdd20652f11a426edbb21c91d`

PR #54 exact head `73010ed9777d70123eee966c736ab1528173258c` passed Windows CI #248 / run `34032151067` / job `101483547592`; guarded squash merge produced the source baseline above. Resulting-main Windows CI #249 / run `34038489647` / job `101500825881` also passed repository preflight, Tauri release build and artifact upload. Main artifact ID `9991119217`, digest `sha256:769419c27a7c02624a6891ea692ecc218e42600aa4a2cbbe57e922b3b9c5e7e9`.

## CURRENT REGRESSION COVERAGE INVENTORY

Already validated in repository tests:

- Monday-based week classification across every weekday and Sunday->Monday rollover;
- strict IANA timezone resolution;
- DST gap/fold local datetimes fail closed rather than selecting an implicit instant;
- timed schedules retain their instant while display timezone changes;
- date-only schedules remain calendar-stable across timezone changes;
- future-timed Today tasks are visible Today but focus-ineligible until the due instant;
- recurrence first startup avoids arbitrary historical backfill;
- repeated same-startup/same-day passes are idempotent;
- same-week local-date change remains idempotent;
- missed weeks catch up in Monday order without duplicates;
- timed recurrence resolves current local date in each rule's own timezone.

This slice must not duplicate those tests merely to satisfy wording in `TODO.md`. Add narrowly targeted coverage only for missing weekend/date-only and missed-day/startup progression behavior, then use the combined evidence to close the top-level regression-matrix item.

## NEXT AGENT ACTION — IMPLEMENT ACTIVE SLICE

1. Add a focused scheduling regression proving a date-only weekend task keeps the intended local calendar date and crosses the Monday boundary correctly without UTC/timezone reinterpretation.
2. Add a recurrence orchestration regression proving missed non-Monday days/repeated startup progression do not create duplicate children and only the next Monday-based occurrence advances the occurrence set.
3. Review the exact candidate diff for accidental production behavior changes. This slice should be tests/tracking only unless a failing regression reveals an evidence-backed defect.
4. Open one implementation PR and accept Windows CI only for its exact head.

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
