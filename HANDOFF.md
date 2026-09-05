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

- Latest completed source slice: **Replace Existing Tasks behavior — COMPLETE / RECONCILED**.
- Active source slice: **recurrence detachment semantics — ACTIVE**.
- Active implementation branch: **`ai/m4-recurrence-detachment`**.
- Active implementation PR: **None yet**.
- Branch base: docs-only main `792c964f58572bf46040312838a0b0c967d50ce3`, whose latest fully main-validated source ancestor is `bdcb7729b291e76206ca5916d2a84587b060223b`.
- Latest fully main-validated source baseline: **`bdcb7729b291e76206ca5916d2a84587b060223b`**.
- Local Rust/Node preflight in this connector-only environment: **NOT RUN**.
- Current small-slice progress: **1/6**.

No open implementation PR existed when this slice began.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 1/6 ολοκληρωμένες.**

Recurrence detachment checkpoints:

1. product/risk/schema/source audit plus branch start — COMPLETE;
2. detachment implementation + deterministic regressions + candidate diff review — PENDING;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — PENDING;
4. final semantic/diff review of exact validated head — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## PRODUCT / RELIABILITY CONTRACT

Evidence-backed semantics:

- recurrence can be detached/removed while preserving prior independent child tasks;
- ordinary detachment is not Replace Existing and must not delete generated child tasks merely because recurrence is removed;
- stable child task identities, user edits, notes, subtasks, reminders, sessions, timer preferences, completion/archive state and schedule metadata must survive detachment;
- children already independent/detached before recurrence removal must remain untouched;
- once the recurrence rule is removed there is no active rule that may generate further occurrences;
- removing the rule may remove its internal `recurrence_occurrences` reservations because the rule itself no longer exists, but must never cascade-delete the child task;
- the parent must end with `recurrence_rule_id = NULL` and previously linked generated children must end with `recurrence_parent_task_id = NULL`;
- mutation must be transactional and fail without partial detachment.

Existing source already contains `delete_recurrence_rule`, which transactionally clears linked children then deletes the rule. The active slice is to make that detachment contract explicit, robust and regression-proven rather than introduce a second recurrence authority/model.

## NEXT AGENT ACTION — ACTIVE BRANCH

1. Inspect `delete_recurrence_rule`, FK behavior and existing recurrence fixtures in detail.
2. Make the narrowest source hardening needed for explicit detachment semantics; prefer reuse of the existing recurrence persistence boundary.
3. Add deterministic regressions proving stable IDs/data/history, completed/archived child preservation, already-detached child preservation, no remaining rule/parent linkage, no future materialization, repeated/missing behavior, and rollback on forced failure.
4. Review the full branch-vs-main diff before opening a PR.
5. Validate the exact PR head on authoritative Windows CI; then final-review, guarded-merge, validate resulting main and reconcile tracking.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- detachment never deletes child tasks or user history;
- already independent children remain independent and unchanged;
- recurrence removal leaves no active materialization authority for the removed rule;
- `recurrence_occurrences` remains the idempotency authority while a rule exists;
- date-only schedules never convert through UTC;
- week starts Monday;
- strict IANA timezone/DST rules remain fail-closed;
- recurrence mutations are transactional;
- reminder delivery submit-before-ack/retry semantics remain unchanged;
- no renderer owns authoritative recurrence/reminder/timer state.

## REMINDER ACCEPTANCE — INDEPENDENT PENDING EVIDENCE

PR #45 reminder source remains fully validated and reconciled. Physical installed-build observation of one actual due reminder in tray/background mode remains pending before the two reminder TODO parent items may be checked. Do not reopen PR #45 unless physical evidence reveals a defect.

## USER ACTION REQUIRED

None for recurrence detachment implementation. Physical installed-build visible due-reminder observation remains independently pending for reminder acceptance.
