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
- Active source slice: **startup/resume/date-change recurrence orchestration + missed-day catch-up — ACTIVE**.
- Active implementation branch: **`ai/m4-recurrence-orchestration`**.
- Active implementation PR: **None yet**.
- Latest fully main-validated source baseline: **`6c9217f90f3b7db46a30393548e640faf671fb55`**.
- Branch started from current tracking-only `main`; Markdown-only descendants do not replace the validated source baseline.
- Local Rust/Node preflight in this connector-only environment: **NOT RUN**.
- Current small-slice progress: **1/6**.

No open implementation PR existed when this slice began.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 1/6 ολοκληρωμένες.**

Recurrence orchestration checkpoints:

1. mandatory startup + product/risk/source/runtime audit + branch start — COMPLETE;
2. Rust-owned orchestration + deterministic startup/date-change/missed-week/idempotency tests + candidate diff review — PENDING;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — PENDING;
4. final semantic/diff review of exact validated head — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## PRODUCT / RELIABILITY CONTRACT

- startup must materialize all active recurrence rules for the current relevant local week;
- repeated startup/date-boundary processing must not duplicate children;
- if Narro was stopped or asleep across one or more Monday-based weeks, the next orchestration pass must catch up missed weeks deterministically;
- a rule with no prior materialization watermark starts from the current week rather than backfilling arbitrary historical time before Narro ever processed that rule;
- once a watermark exists, missed Monday weeks between the watermark and the current week are processed in order;
- the current week is always processed idempotently so repeated passes and local-date changes are safe;
- timed recurrence uses the recurrence rule's validated IANA timezone to determine its current local date;
- date-only recurrence uses the current Windows/system local calendar date and never converts through UTC;
- one failing recurrence rule must not prevent unrelated active rules from being processed on later/background cycles;
- no renderer owns recurrence orchestration authority;
- no second recurrence materialization engine or schema is introduced.

Current implementation direction: add a narrow Rust-owned recurrence orchestration service over the already validated `materialize_recurrence_week` primitive. Immediate startup execution plus a bounded low-frequency background date check will cover startup, sleep/resume catch-up and local-date changes without renderer polling. The service must reuse a separately configured SQLite connection, like reminder delivery, and preserve the existing transactional/idempotency boundary per materialized week.

## NEXT AGENT ACTION — ACTIVE BRANCH

1. Add deterministic orchestration logic for active-rule discovery, per-rule current-local-date resolution and ordered missed-week catch-up.
2. Add regressions for first startup, repeated pass, same-week date change, multi-week missed catch-up, independent rule failure and timed timezone date resolution.
3. Integrate one immediate background pass plus bounded date-change polling into Tauri startup using the durable database path; do not couple orchestration to a renderer.
4. Review the candidate diff and update this file to 2/6 only after the implementation/test contract is coherent.
5. Open one PR and accept Windows CI only for its exact head.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- `materialize_recurrence_week` remains the transactional child/occurrence creation primitive;
- occurrence uniqueness remains the duplicate-prevention boundary;
- ordinary detachment never deletes child history;
- recurrence removal leaves no active materialization authority for the removed rule;
- date-only schedules never convert through UTC;
- week starts Monday;
- strict IANA timezone/DST rules remain fail-closed;
- failed one-rule orchestration must remain retryable;
- reminder delivery submit-before-ack/retry semantics remain unchanged;
- no renderer owns authoritative recurrence/reminder/timer state;
- async `main` recreation remains intact.

## REMINDER ACCEPTANCE — INDEPENDENT PENDING EVIDENCE

PR #45 reminder source remains fully validated and reconciled. Physical installed-build observation of one actual due reminder in tray/background mode remains pending before the two reminder TODO parent items may be checked. Do not reopen PR #45 unless physical evidence reveals a defect.

## USER ACTION REQUIRED

None for recurrence orchestration implementation. Physical installed-build visible due-reminder observation remains independently pending for reminder acceptance.
