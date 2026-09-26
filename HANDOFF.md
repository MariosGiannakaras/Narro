# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, newest immutable `work-log/`, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT VALIDATED SOURCE BASELINE

M5/Main parity reconciliation is complete.

- PR #156 exact validated head: `2cde42c10389c2417e1b6e356eae59150ebff8ce`.
- PR Windows CI #539: PASS.
- Required visual artifact: `narro-m5-visual-regression` / artifact id `10905522707`.
- Required diagnostic harness artifact: `narro-m1-runtime-harness-windows-x64`.
- Expected-head guarded squash merge: `4e315f551737d729f76e5f561dd8d7404717e157`.
- Resulting-main Windows CI #540: PASS through the repository identical-tree validation gate.
- The validated source baseline is `4e315f551737d729f76e5f561dd8d7404717e157`. Later markdown-only tracking commits do not replace it.

## CURRENT ORDERED WORK

The repository-backed parity audit reopened M5 and M6 without erasing their historical validated slices.

Current order:
1. **M5 parity/reliability reconciliation (A1–A9, A19): COMPLETE.**
2. **M6 Focus reconciliation (A10–A17): ACTIVE NEXT WORK.**
3. **STOP before M7 after M6 is fully validated and tracked.** The user explicitly has another instruction to provide before any M7 work resumes.
4. M7/A18/compositor work remains preserved but untouched until that user instruction.
5. M8 remains blocked on eventual M7 completion.

Roadmap completion is now **5/10 milestones**. Do not increment to 6/10 until the reopened M6 gate has implementation, exact-head Windows CI, guarded merge, resulting-main validation, and tracking reconciliation.

## M5 RECONCILIATION — COMPLETED CAPABILITIES

A1–A9 and A19 are implemented and validated:

- A1 durable List Duplicate with independent list/task identities and no completed-history cloning;
- A2 persisted owned list-icon rendering on active/archive surfaces with safe fallback;
- A3 atomic top-priority create without create-then-reorder partial success;
- A4 optional EST in the same create persistence operation;
- A5/A6 authoritative completion and explicit confirmed permanent deletion, with live completion remaining timer/session-authoritative and Done excluded from planning reorder;
- A7 safe identity-based All Lists per-task edits while aggregate create/reorder remain disabled;
- A8 matched-text Search highlighting without keyboard/focus regression;
- A9 normal Main split from diagnostic timer JSON while preserving the user-facing Pomodoro resume workflow;
- A19 display-timezone local-month Done completion count;
- obsolete static and visual contracts were converted to positive final invariants.

Do not reopen these items without new evidence.

## ACTIVE M6 RECONCILIATION BATCH

Implement A10–A17 as one coherent Focus reconciliation batch:

- A10 ordinary Focus rows expose the documented source-backed task actions with reserved geometry and keyboard/focus equivalents;
- A11 Rocket / Make Live switches through authoritative timer/session APIs and preserves prior work;
- A12 Focus queue reorder reuses validated persisted ordering and stable task identities;
- A13 ordinary-row delete, schedule, Notes and non-live completion reuse validated Main/domain boundaries;
- A14 replace disabled Focus `+ ADD TASK` with persistence-first creation; All Lists requires explicit owning-list choice;
- A15 Focus Home exits the Focus surface through existing lifecycle without silently resetting timer/session state;
- A16 live-task title editing is available only through Notes and reuses stale-safe title persistence;
- A17 Time's Up exposes Extend through the existing authoritative `timer_extend` transition;
- evolve temporary M6 static tests that froze placeholder/non-mutating controls into positive final invariants.

Preserve authoritative Rust/domain/session/scheduling ownership. Do not introduce renderer timer authority, renderer-side scheduling classification, identity cloning, polling, or create-then-reorder partial success.

## AUDIT CLASSIFICATION

- A1–A9, A19: COMPLETE and validated in M5 reconciliation.
- A10–A17: ACTIVE M6 reconciliation.
- A18: M7 parity sub-gap; do not implement yet.
- B1: unresolved task-menu fidelity requirement; no implementation without stronger evidence or explicit decision.
- B2/B3: visual-fidelity questions; defer to the final parity/fidelity pass unless stronger evidence promotes them.
- B4: Done auto-start-next remains unresolved in source evidence; preserve current behavior.
- Audit section C intentional Narro deviations remain binding.

## OPEN M7 PR — PRESERVE, DO NOT TOUCH YET

PR #155 `M7: cover focus transitions with a temporary native visual hold` remains open and draft.

- exact head: `2755d598ad2b13b974cda02760ebf44cd5e60b13`;
- Windows CI #532: PASS;
- physical compositor validation: NOT RUN;
- after the M5 merge, GitHub reports it non-mergeable against the newer `main`;
- do not merge, rebase, rewrite, or contaminate it during M6 reconciliation;
- after M6 is complete, stop and await the user's instruction before taking any M7 action.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains local-only Windows software with Tauri 2 + React/TypeScript, SQLite, and authoritative Rust/domain state.
- `main` and reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust remains monitor/work-area/DPI/window-position authority.
- persistence-first mutation boundaries remain authoritative for list/task/subtask/note/scheduling/archive state.
- stable task identities, tracked Time Taken, date-only/timezone/recurrence semantics, and All Lists aggregate semantics must remain intact.
- future-timed Today tasks remain ineligible until due.
- Focus entry and task switching cannot duplicate or silently reset live sessions.
- Break/Pause-Resume/Skip/Done/Extend/Make Live must reuse authoritative timer/session transitions.
- Notes URLs require explicit activation.
- hover/focus actions must retain reserved geometry, accessibility, and reduced-motion usability.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- diagnostics remain gated rather than shown in normal product surfaces.

## EXACT NEXT ACTION

A zero-context agent must reconstruct current `main`, confirm this M5 tracking reconciliation is present, inspect live PR/CI state, then start/resume the coherent **M6 A10–A17 Focus reconciliation** from the validated source baseline. Do not start M7.

## USER ACTION REQUIRED

No user decision blocks M6 reconciliation.

After M6 reconciliation is fully validated, merged, main-validated, and tracked, **stop before M7**. The user explicitly said they have another instruction to provide first.
