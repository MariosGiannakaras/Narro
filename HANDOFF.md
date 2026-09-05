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
- Active source slice: **None**.
- Active implementation branch: **None**.
- Active implementation PR: **None**.
- Pending source CI/main validation: **None**.
- Latest fully main-validated source baseline: **`bdcb7729b291e76206ca5916d2a84587b060223b`**.
- Next ordered source slice: **recurrence detachment semantics — NOT STARTED**.
- Physical reminder acceptance still pending: **visible due reminder while Narro remains in tray/background mode**.

Do not reopen or recreate PR #47. Its source work is validated, merged, main-validated and reconciled. Markdown-only reconciliation commits newer than the validated source SHA do not replace that source baseline.

## USER-FACING PROGRESS

**Γενική υλοποίηση: 3/10 milestones ολοκληρωμένα.**

**Μικρή τρέχουσα υλοποίηση: 6/6 ολοκληρωμένες** for the completed Replace Existing Tasks slice.

Do not reset the small counter until a genuinely new source slice begins and its denominator is stated.

Replace Existing Tasks checkpoints:

1. product/risk/schema audit plus branch start — COMPLETE;
2. transactional replace-existing implementation + deterministic tests + candidate diff review — COMPLETE;
3. exact PR-head Windows CI success including preflight, Tauri release and artifact — COMPLETE;
4. final semantic/diff review of exact validated head — COMPLETE;
5. guarded merge with expected validated head — COMPLETE;
6. resulting-main Windows CI plus TODO/STATUS/HANDOFF/new immutable work-log reconciliation — COMPLETE after the tracking PR carrying this file is merged.

## LATEST VALIDATED SOURCE BASELINE

`bdcb7729b291e76206ca5916d2a84587b060223b`

### PR #47 exact-head validation

Exact validated PR head:

`ce4181be2216f7ee2333b03302062cb89f4a3b56`

- Windows PR CI #235 / run `33992278666` / job `101376509763`: **SUCCESS**.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9977163499`.
- Digest `sha256:aa17138190feccc6a4fb1ec5717d34aec4df462ce2f16125f093272bf763aa41`.
- Final exact-head semantic/diff review: **PASS**.
- Unresolved inline review threads: **none**.

PR #47 was guarded-squash-merged with expected head `ce4181be2216f7ee2333b03302062cb89f4a3b56` and produced:

`bdcb7729b291e76206ca5916d2a84587b060223b`

### Resulting-main validation

- Windows main CI #236 / run `33993051867` / job `101378588286`: **SUCCESS** on exact source SHA `bdcb7729b291e76206ca5916d2a84587b060223b`.
- Repository preflight: **PASS**.
- Tauri release build: **PASS**.
- Artifact upload: **PASS**.
- Artifact ID `9977373964`.
- Digest `sha256:66eaac71f2514d70274e23d69c1fdadaadd33501299b367391b4a44f539f4714`.

Evidence: `work-log/2026-09-06-chatgpt-m4-replace-existing-reconciliation.md`.

## VALIDATED REPLACE EXISTING CONTRACT

- explicit `replace_existing = true` is required;
- mutation uses an SQLite `IMMEDIATE` transaction;
- only active, incomplete, unarchived generated children still linked to the same recurrence parent/rule are replacement candidates;
- pristine candidates may be deleted and receive new identities only through normal materialization;
- active edited/history-bearing children survive and are detached instead of cascade-deleted;
- preserved/detached children retain `recurrence_occurrences` as a durable occurrence reservation so the same occurrence cannot regenerate beside them;
- completed or archived generated children remain historical and untouched;
- already detached/independent children remain untouched;
- replacement resets `last_materialized_local_date`, then existing materialization creates only unreserved occurrences;
- replacement never reuses a deleted child task identity;
- invalid recurrence shape/date/time/timezone input fails before writes where possible;
- transaction rollback preserves rule/children if the rule update fails.

A successful intermediate CI head was deliberately rejected during implementation when semantic review found occurrence reservations were being deleted for preserved edited/history-bearing children. That duplicate-regeneration risk was corrected and directly regression-tested before the accepted head above.

## REMINDER ACCEPTANCE — INDEPENDENT PENDING EVIDENCE

PR #45 reminder source remains fully validated and reconciled. Physical installed-build observation of one actual due reminder in tray/background mode remains pending before the two reminder TODO parent items may be checked. Do not reopen PR #45 unless physical evidence reveals a defect.

## NEXT AGENT ACTION — NOT STARTED

Remain inside Milestone 4.

The next ordered source implementation item is **recurrence detachment semantics while preserving already modified independent children**.

Before changing source:

1. run the mandatory startup sequence from repository state;
2. confirm no open implementation PR and confirm current main descends from validated source baseline `bdcb7729b291e76206ca5916d2a84587b060223b`;
3. inspect recurrence materialization, task/occurrence ownership, `docs/PRODUCT_SPEC.md`, and relevant source-product reliability risks;
4. create one narrow source branch from current main and immediately record a fresh small-slice denominator in this file;
5. do not reuse Replace Existing deletion semantics for ordinary detachment unless product evidence explicitly requires it;
6. preserve stable task identities, user edits/history, and occurrence idempotency boundaries;
7. validate exact PR head on authoritative Windows CI, perform final semantic review, guarded-merge, validate resulting main, then reconcile tracking.

Physical reminder acceptance may be captured independently. If it exposes a defect, stop the new recurrence slice and address the evidence-backed reminder defect first.

## IMPORTANT INVARIANTS

- authoritative Rust/domain state and persistence-first mutations;
- stable task identities;
- completed/archived recurrence history survives replacement/detachment;
- edited/history-bearing and detached/independent children are never silently overwritten;
- `recurrence_occurrences` remains the authoritative generated-occurrence/idempotency boundary;
- preserved children retain occurrence reservations when needed to prevent duplicate regeneration;
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
