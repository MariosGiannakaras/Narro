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
- Current small-slice progress: **2/6**.

No open implementation PR existed when this slice began.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 2/6 ολοκληρωμένες.**

Recurrence detachment checkpoints:

1. product/risk/schema/source audit plus branch start — COMPLETE;
2. detachment implementation contract + deterministic regressions + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — PENDING;
4. final semantic/diff review of exact validated head — PENDING;
5. guarded merge with expected validated head — PENDING;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — PENDING.

## PRODUCT / RELIABILITY CONTRACT

- recurrence can be detached/removed while preserving prior independent child tasks;
- ordinary detachment is not Replace Existing and must not delete generated child tasks merely because recurrence is removed;
- stable child IDs, edits, notes, subtasks, reminders, sessions, completion/archive state and schedule metadata survive;
- children already independent before recurrence removal remain untouched;
- parent ends with `recurrence_rule_id = NULL` and linked generated children end with `recurrence_parent_task_id = NULL`;
- deleting the removed rule's `recurrence_occurrences` rows is valid because no rule authority remains, but child tasks must not cascade-delete;
- no future materialization can occur using the removed rule;
- mutation is transactional; forced rule-delete failure must roll back child and parent link changes;
- repeated removal reports typed `NotFound` and must not mutate preserved tasks.

Existing `delete_recurrence_rule` is the canonical persistence mutation and already implements the correct relationship/FK semantics. This slice deliberately validates and hardens that existing boundary instead of creating a second recurrence authority.

## CANDIDATE

New `src-tauri/tests/recurrence_detachment.rs` proves:

- four generated child identities survive recurrence removal;
- edited title plus note/subtask/reminder/session history survives;
- completed and archived generated children survive and detach;
- a child already detached before recurrence removal remains independent and its `updated_at` is not rewritten;
- parent recurrence link is cleared;
- recurrence occurrence rows are removed with the deleted rule while child tasks remain;
- the removed rule cannot materialize new children;
- a forced `BEFORE DELETE` SQLite trigger failure rolls back all child/parent link changes and preserves occurrence rows;
- a repeated detach returns typed `RecurrenceStoreError::NotFound` without mutating the preserved child.

## NEXT AGENT ACTION — ACTIVE BRANCH

1. Open the implementation PR from `ai/m4-recurrence-detachment` and re-read its exact head SHA.
2. Accept Windows CI only for that exact head. If it fails, inspect the exact failing log and fix only evidence-backed problems.
3. On full preflight/release/artifact success, record run/job/artifact/digest and perform final exact-head semantic/diff review.
4. Guarded-merge only the validated expected head.
5. Validate resulting main on Windows CI.
6. Reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and create one new immutable detachment work-log entry.

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
