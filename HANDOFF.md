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
- Active implementation PR: **#47 — `M4: implement Replace Existing Tasks behavior`**.
- Branch base: tracking main `e5db579c4c0dd812bf7fb6d6c917c05a4d0f5b10`, whose latest validated source ancestor is `cd30ffafbe3e9cb0431f4bc8230c095451a106ca`.
- Reviewed source candidate before this tracking commit: **`013a99ff68ac679197cfc77c12d0504ca94bc04f`**.
- Exact PR head must be re-read after this HANDOFF commit before accepting CI or merging.
- Latest fully main-validated source baseline: **`cd30ffafbe3e9cb0431f4bc8230c095451a106ca`**.
- Local Rust/Node preflight in this connector-only environment: **NOT RUN**.
- Current small-slice progress: **2/6**.

Resume PR #47 before any other source slice. Ignore CI tied to superseded heads.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 2/6 ολοκληρωμένες.**

Replace Existing Tasks checkpoints:

1. product/risk/schema audit plus branch start — COMPLETE;
2. transactional replace-existing implementation + deterministic tests + candidate diff review — COMPLETE;
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

Narro's conservative applicability rule for this slice:

- only active, incomplete, unarchived generated children that still have an authoritative `recurrence_occurrences` row for the same rule and still point at the same recurrence parent are replacement candidates;
- pristine candidates are deleted transactionally and therefore receive new identities only through normal rematerialization;
- active candidates with user edits or owned history (subtasks, notes, reminders, sessions or task timer preferences) are preserved and detached instead of being cascade-deleted;
- completed or archived generated children are historical and remain untouched;
- children whose recurrence-parent linkage no longer matches are already independent/detached and remain untouched;
- explicit replacement resets the rule's `last_materialized_local_date` cursor; normal materialization then creates the new pattern through the existing unique occurrence boundary;
- replacement never reuses a deleted child identity.

## IMPLEMENTED CANDIDATE

- `src-tauri/src/persistence/recurrence_replace.rs` adds typed transactional Replace Existing behavior.
- `src-tauri/src/persistence/mod.rs` exports the recurrence replacement persistence module.
- `src-tauri/tests/recurrence_replace_existing.rs` covers:
  - pristine-child replacement and deterministic one-time rematerialization;
  - preservation/detachment of edited and session-history-bearing active children;
  - preservation of completed/archived historical children;
  - preservation of an already detached generated child;
  - transaction rollback when recurrence-rule update fails;
  - rejection when `replace_existing` is not explicitly enabled.

## REMINDER ACCEPTANCE — INDEPENDENT PENDING EVIDENCE

PR #45 source is fully validated and reconciled. Physical installed-build observation of one actual due reminder in tray/background mode remains pending before the two reminder TODO parent items may be checked. Do not reopen PR #45 unless physical evidence reveals a defect.

## NEXT AGENT ACTION — PR #47

1. Re-read PR #47 exact current head after this tracking commit.
2. Inspect Windows CI only for that exact head.
3. If CI fails, read the exact failing job log and fix only evidence-backed failures on the same branch/PR; progress remains 2/6.
4. If CI succeeds, record run/job/artifact/digest and perform final semantic/diff review of the same exact head.
5. Guarded-merge only that validated expected head.
6. Validate the resulting main source SHA with Windows CI.
7. Reconcile `TODO.md`, `STATUS.md`, `HANDOFF.md` and create a new immutable Replace Existing Tasks work-log entry.

## IMPORTANT INVARIANTS

- stable task identities; replacement explicitly deletes only pristine applicable generated IDs and creates new IDs only through normal materialization;
- completed/archived history survives replacement;
- edited/history-bearing and detached/independent children survive replacement;
- `recurrence_occurrences` remains the authoritative generated-occurrence/idempotency boundary;
- date-only schedules never convert through UTC;
- week starts Monday;
- strict IANA timezone/DST rules remain fail-closed;
- all replace operations are transactional;
- no renderer owns authoritative recurrence/reminder/timer state;
- reminder delivery submit-before-ack/retry semantics remain unchanged.

## USER ACTION REQUIRED

None for Replace Existing Tasks implementation. Physical reminder acceptance remains independently pending.
