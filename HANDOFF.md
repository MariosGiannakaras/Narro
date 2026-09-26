# HANDOFF.md

Canonical continuation point. Read `AI_START_HERE.md`, `AGENTS.md`, `ENGINEERING_QUALITY.md`, `AGENT_WORKFLOW.md`, active `TODO.md`, relevant `STATUS.md`, `docs/BLITZIT_HISTORY_RISK_INDEX.md`, newest immutable `work-log/`, and live PR/CI state before implementation.

GitHub `main` is the durable source truth.

## CURRENT VALIDATED SOURCE BASELINE

M5/Main and M6/Focus parity reconciliation are complete.

- M5 validated source merge: `4e315f551737d729f76e5f561dd8d7404717e157` from PR #156; PR CI #539 PASS; resulting-main CI #540 PASS.
- M6 PR #158 exact validated head: `c13e7f6cfbec3accde4841fd4fd61b68d0924ff6`.
- M6 Windows CI #545 / run `36243619057`: PASS.
- Required M6 visual artifact: `narro-m5-visual-regression`, artifact id `10906627762`, digest `sha256:4f58feb6526ad3624e07897f58377b620936e4316f60fb64c9de0f83e45d671a`.
- Required M6 diagnostic artifact: `narro-m1-runtime-harness-windows-x64`, artifact id `10906727736`, digest `sha256:97dd86ad64f12ffa35da0ce5d0b10dadb1375df6f70178d0584751d234ec65ef`.
- M6 expected-head guarded squash merge: `b1ff5910abec82272c4ee57479a44eb62248a88f`.
- Resulting-main Windows CI #546 / run `36244258977`: PASS through the repository identical-tree validation gate.
- **Current validated source baseline:** `b1ff5910abec82272c4ee57479a44eb62248a88f`.

Markdown-only tracking commits after that source SHA do not replace the validated source baseline.

## CURRENT ORDERED WORK

The parity audit reconciliation is complete through M6.

1. **M5 parity/reliability reconciliation (A1–A9, A19): COMPLETE.**
2. **M6 Focus reconciliation (A10–A17): COMPLETE.**
3. **STOP before M7.** The user explicitly has another instruction to provide before any M7 work resumes.
4. M7/A18/compositor work remains preserved but untouched until that instruction.
5. M8 remains blocked on eventual M7 completion.

Roadmap completion is now **6/10 milestones** once this markdown-only tracking reconciliation is merged.

## M6 RECONCILIATION — COMPLETED CAPABILITIES

A10–A17 are implemented and validated:

- A10 ordinary Focus rows expose completion, Rocket/Make Live, reorder and overflow actions with fixed reserved geometry and keyboard/focus equivalents.
- A11 Rocket samples authoritative timer/session state and starts or switches through the timer service, preserving prior work instead of completing/skipping it.
- A12 individual-list Focus queue reorder reuses persisted stable task identities; aggregate All Lists reorder remains disabled.
- A13 ordinary-row Notes, scheduling, non-live completion and explicit permanent delete reuse validated Main/domain boundaries.
- A14 Focus `+ ADD TASK` persists first; All Lists requires an explicit owning-list choice.
- A15 Focus Home shows/recreates Main and hides Focus through native lifecycle without timer/session reset.
- A16 live-task title editing exists only inside Focus Panel Notes and reuses stale-safe persisted title mutation followed by authoritative refresh.
- A17 Time's Up exposes Extend through authoritative `timer_extend`.
- obsolete placeholder/static contracts were evolved into positive final invariants; Windows visual fixtures validate row/action geometry.

Do not reopen A10–A17 without new repository-backed evidence.

## AUDIT CLASSIFICATION

- A1–A9, A19: COMPLETE and validated in M5 reconciliation.
- A10–A17: COMPLETE and validated in M6 reconciliation.
- A18: M7 parity sub-gap; do not implement yet.
- B1: unresolved task-menu fidelity requirement; no implementation without stronger evidence or explicit decision.
- B2/B3: visual-fidelity questions; defer to the final parity/fidelity pass unless stronger evidence promotes them.
- B4: Done auto-start-next remains unresolved in source evidence; preserve current behavior.
- Audit section C intentional Narro deviations remain binding.

## OPEN M7 PR — PRESERVE, DO NOT TOUCH

PR #155 `M7: cover focus transitions with a temporary native visual hold` remains open and draft.

- exact head: `2755d598ad2b13b974cda02760ebf44cd5e60b13`;
- Windows CI #532: PASS;
- physical compositor validation: NOT RUN;
- GitHub reports it non-mergeable against the newer `main`;
- do not merge, rebase, rewrite, or contaminate it until the user explicitly resumes M7.

## INVARIANTS THAT MUST NOT REGRESS

- Narro remains local-only Windows software with Tauri 2 + React/TypeScript, SQLite, and authoritative Rust/domain state.
- `main` and reusable `focusSurface` remain the normal two-webview architecture.
- native/Rust remains monitor/work-area/DPI/window-position authority.
- persistence-first mutation boundaries remain authoritative for list/task/subtask/note/scheduling/archive state.
- stable task identities, tracked Time Taken, date-only/timezone/recurrence semantics, and All Lists aggregate semantics remain intact.
- future-timed Today tasks remain ineligible until due.
- Focus entry and task switching cannot duplicate or silently reset live sessions.
- Break/Pause-Resume/Skip/Done/Extend/Make Live reuse authoritative timer/session transitions.
- Focus Home cannot reset timer/session state.
- live-task title editing remains confined to Notes.
- aggregate All Lists reorder remains disabled.
- Notes URLs require explicit activation.
- hover/focus actions retain reserved geometry, accessibility, and reduced-motion usability.
- excluded account/trial/upgrade/profile/AI/integration controls remain absent.
- diagnostics remain gated rather than shown in normal product surfaces.

## EXACT NEXT ACTION

A zero-context agent must reconstruct current `main`, confirm this M6 tracking reconciliation is present, inspect live PR/CI state, and **stop before M7**. No M7 implementation, rebase, merge, physical compositor action, or A18 work should begin until the user provides the promised next instruction.

## USER ACTION REQUIRED

Further implementation is intentionally paused before M7 by explicit user direction. The next implementation step requires the user's next instruction; there is no unresolved decision blocking the already-completed M5/M6 reconciliation.
