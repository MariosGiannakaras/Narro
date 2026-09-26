# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, newest immutable `work-log/`, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT ORDERED WORK

New repository-backed parity evidence on 2026-09-26 reopens Milestone 5 and Milestone 6 acceptance without erasing their historical validated slices.

Current ordered implementation is:
1. M5 parity/reliability reconciliation (A1–A9, A19).
2. M6 Focus reconciliation (A10–A17).
3. Return to M7, including A18 plus the existing physical/compositor gates.
4. M8 only after M7 is complete.

Roadmap completion is therefore currently 4/10 milestones until the reopened M5/M6 gates are revalidated.

## AUDIT CLASSIFICATION

Verified against current main:
- A1–A19: still applicable production/UI omissions.
- B1: unresolved task-menu fidelity requirement; no implementation without stronger evidence/decision.
- B2/B3: visual-fidelity questions; defer to existing parity/fidelity work unless promoted by stronger evidence.
- B4: current Done auto-start-next behavior is explicitly unresolved in source evidence; preserve it for now rather than silently changing product semantics.
- Audit section C intentional Narro deviations remain unchanged.

## OPEN M7 PR — PRESERVE

PR #155 `M7: cover focus transitions with a temporary native visual hold` remains open.
- exact head `2755d598ad2b13b974cda02760ebf44cd5e60b13`;
- Windows CI #532 PASS;
- physical compositor validation NOT RUN;
- do not merge merely because CI passed.

The M5/M6 reconciliation work is independent of #155's compositor hypothesis and may proceed while the physical gate remains open.

## FIRST CORRECTIVE BATCH

Build a coherent M5/Main batch rather than micro-PRs:
- A1 List Duplicate;
- A2 stored list icon rendering;
- A3 atomic top-priority create;
- A4 create-with-EST;
- A5/A6 board completion/delete/Done transitions;
- A7 safe All Lists per-task edits while aggregate reorder stays disabled;
- A8 search result matched-text highlighting;
- A9 split normal user-facing Pomodoro resume from diagnostic JSON;
- A19 Done monthly count;
- evolve obsolete static tests into positive final invariants.

Reuse existing list/task/session/scheduling/note/subtask persistence boundaries. Do not introduce create-then-reorder partial success or renderer authority.

## FOLLOWING BATCHES

M6 batch: A10–A17 ordinary Focus row actions, Rocket/make-live, reorder, completion/delete/schedule/Notes, Add Task, Home exit, live title edit through Notes, Time's Up Extend.

M7 parity sub-gap: A18 Floating Timer subtask title editing. Fold into a compatible M7 batch when #155's physical result allows it; do not contaminate the compositor candidate before its physical evidence.

## USER ACTION REQUIRED

PR #155 ultimately needs physical Windows validation, but it does not block the independent M5/M6 reconciliation requested by the user.
