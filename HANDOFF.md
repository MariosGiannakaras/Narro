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

- Latest completed source slice: **tray/background one-off reminder delivery source — COMPLETE / RECONCILED**.
- Active source slice: **Replace Existing Tasks behavior — ACTIVE**.
- Active implementation branch: **`ai/m4-recurrence-replace-existing`**.
- Active implementation PR: **None yet**.
- Branch base: tracking main `e5db579c4c0dd812bf7fb6d6c917c05a4d0f5b10`, whose latest validated source ancestor is `cd30ffafbe3e9cb0431f4bc8230c095451a106ca`.
- Latest fully main-validated source baseline: **`cd30ffafbe3e9cb0431f4bc8230c095451a106ca`**.
- Local Rust/Node preflight in this connector-only environment: **NOT RUN**.
- Current small-slice progress: **1/6**.

No open implementation PR existed when this slice began.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 1/6 ολοκληρωμένες.**

Replace Existing Tasks checkpoints:

1. product/risk/schema audit plus branch start — COMPLETE;
2. transactional replace-existing implementation + deterministic tests + candidate diff review — PENDING;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — PENDING;
4. final semantic/diff review of exact validated head — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## PRODUCT / RELIABILITY CONTRACT

Evidence-backed semantics:

- editing recurrence supports explicit Replace Existing Tasks;
- explicit replace resets the recurring pattern and old generated tasks may be removed/replaced by new generated tasks;
- ordinary recurrence edits preserve historical children unless explicit replacement is chosen;
- detached/independent children must never be silently overwritten by replacement;
- Narro preserves historical child work and avoids duplicate regeneration;
- replacement must be transactional and must not create accidental extra task identities.

Narro's narrow applicability rule for this slice:

- only active, incomplete, unarchived generated children that still have an authoritative `recurrence_occurrences` row for the same rule **and** still point at the same recurrence parent are replaceable;
- completed or archived generated children are historical and remain untouched;
- children without the authoritative occurrence linkage, or whose recurrence-parent linkage no longer matches, are treated as independent/detached and remain untouched;
- explicit replacement removes applicable old generated children transactionally, resets the rule's `last_materialized_local_date` cursor, then normal materialization may generate the new pattern without duplicate occurrence identities;
- replacement never reuses a deleted child identity.

This rule is deliberately conservative where source evidence says "applicable" generated children may be replaced but requires historical edits/independent children to survive.

## REMINDER ACCEPTANCE — INDEPENDENT PENDING EVIDENCE

PR #45 source is fully validated and reconciled. Physical installed-build observation of one actual due reminder in tray/background mode remains pending before the two reminder TODO parent items may be checked. Do not reopen PR #45 unless physical evidence reveals a defect.

## NEXT AGENT ACTION — ACTIVE BRANCH

1. Inspect recurrence persistence/materialization/schema and existing regression fixtures.
2. Implement Replace Existing Tasks transactionally on `ai/m4-recurrence-replace-existing`.
3. Add regressions proving active generated children are replaced, completed/archived/detached children survive, cursor reset enables deterministic rematerialization, repeated replacement cannot duplicate identities, and a failed mutation rolls back.
4. Review full branch-vs-main diff before opening a PR.
5. Validate exact PR head on authoritative Windows CI; then final-review, guarded-merge, validate resulting main, and reconcile tracking.

## IMPORTANT INVARIANTS

- stable task identities; replacement explicitly deletes old applicable generated IDs and creates new IDs only through normal materialization;
- completed/archived history survives replacement;
- detached/independent children survive replacement;
- `recurrence_occurrences` remains the authoritative generated-occurrence/idempotency boundary;
- date-only schedules never convert through UTC;
- week starts Monday;
- strict IANA timezone/DST rules remain fail-closed;
- all replace operations are transactional;
- no renderer owns authoritative recurrence/reminder/timer state;
- reminder delivery submit-before-ack/retry semantics remain unchanged.

## USER ACTION REQUIRED

None for Replace Existing Tasks implementation. Physical reminder acceptance remains independently pending.
