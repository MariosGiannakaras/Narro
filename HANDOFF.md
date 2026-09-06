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
- Current small-slice progress: **2/6**.

No open implementation PR existed when this slice began.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 2/6 ολοκληρωμένες.**

Recurrence orchestration checkpoints:

1. mandatory startup + product/risk/source/runtime audit + branch start — COMPLETE;
2. Rust-owned orchestration + deterministic startup/date-change/missed-week/idempotency tests + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — PENDING;
4. final semantic/diff review of exact validated head — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## CANDIDATE CONTRACT

- `src-tauri/src/recurrence_service.rs` owns active-rule discovery and orchestration; no renderer polling or second materialization engine exists.
- `materialize_recurrence_week` remains the transactional child/occurrence primitive.
- no prior watermark => current week only, avoiding arbitrary historical backfill;
- existing watermark => each missed Monday-based week is processed in order, then the current local date is processed idempotently;
- repeated same-day/same-week/date-change cycles rely on occurrence uniqueness and create no duplicates;
- timed rules resolve current date in their own validated IANA timezone;
- date-only rules use Windows/system local calendar date without UTC conversion;
- one broken active rule is recorded as a per-rule failure and does not block unrelated rules;
- successful earlier missed-week commits remain durable if a later week fails; retry resumes safely from the monotonic watermark;
- a dedicated configured SQLite connection runs one immediate cycle at startup and repeats every 60 seconds, naturally covering post-sleep/resume and local-date changes while Narro remains alive;
- startup wiring only registers the service and reuses the already-required durable database path.

Deterministic regressions cover first startup without historical backfill, repeated pass, same-week date change, multi-week catch-up, cross-rule failure isolation, timed-zone date resolution and corrupt active-rule identity.

## NEXT AGENT ACTION — PR VALIDATION

1. Open one implementation PR from `ai/m4-recurrence-orchestration` and read its exact head SHA.
2. Accept Windows CI only for that exact head. If it fails, inspect the exact failing log and fix only evidence-backed problems.
3. On full preflight/release/artifact success, record run/job/artifact/digest and perform final exact-head semantic/diff review.
4. Guarded-merge only the validated expected head.
5. Validate resulting main on Windows CI.
6. Reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and create one new immutable recurrence-orchestration work-log entry.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- occurrence uniqueness remains the duplicate-prevention boundary;
- date-only schedules never convert through UTC;
- week starts Monday;
- strict IANA timezone/DST rules remain fail-closed;
- recurrence mutations are transactional per materialized week;
- failed one-rule orchestration remains retryable;
- reminder delivery submit-before-ack/retry semantics remain unchanged;
- no renderer owns authoritative recurrence/reminder/timer state;
- async `main` recreation remains intact.

## REMINDER ACCEPTANCE — INDEPENDENT PENDING EVIDENCE

PR #45 reminder source remains fully validated and reconciled. Physical installed-build observation of one actual due reminder in tray/background mode remains pending before the two reminder TODO parent items may be checked. Do not reopen PR #45 unless physical evidence reveals a defect.

## USER ACTION REQUIRED

None for recurrence orchestration implementation. Physical installed-build visible due-reminder observation remains independently pending for reminder acceptance.
