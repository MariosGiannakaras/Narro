# 2026-09-26 — M7 visual-hold reconciliation + A18 batch

## Baseline and continuation

This continues the existing M7 PR #155 rather than replacing it.

- original PR #155 visual-hold candidate head: `2755d598ad2b13b974cda02760ebf44cd5e60b13`;
- original candidate Windows CI #532: PASS;
- physical visual-hold validation: NOT RUN;
- newer `main` contained the validated M5/M6 parity reconciliation and evidence/tracking changes.

The branch was reconciled with current main through a forward merge commit, preserving both histories rather than force-resetting or recreating the PR.

## Source scope

### CI #530 Panel/Timer visual discontinuity candidate

Preserved the existing PR #155 approach:

- capture the outgoing Focus surface into a short-lived native bitmap/tool window before renderer/native transition hiding;
- keep that non-WebView visual copy during geometry/readiness/prewarm/reveal work;
- release after the target is visibly composed;
- serialize ownership and run cleanup on success/failure;
- use the same hold around Floating Timer expand/collapse.

The candidate remains an automated-source candidate until a later physical continuous-capture check. Missing/deferred manual evidence does not block independent source implementation.

### A18 parity reconciliation

Expanded Floating Timer subtasks now reuse the existing authoritative stale-safe title mutation boundary:

- click the subtask title to edit;
- preserve `expectedTitle` from the loaded authoritative subtask snapshot;
- Enter or Save commits through `updateListBoardSubtaskTitle`;
- Escape or Cancel abandons the edit;
- saved mutations reuse the existing subtask + board authoritative refresh and committed-refresh failure handling;
- completion/move/delete controls remain geometry-reserved while the editing row exposes cancel/save actions.

## Tests/contracts

- existing visual-hold owner and transition contracts are retained on the reconciled branch;
- `scripts/test-ui-floating-expanded.mjs` now requires `updateListBoardSubtaskTitle`, `expectedTitle`, editing controls, keyboard save/cancel, and preserved action-rail geometry;
- frontend preflight includes `test:focus-visual-hold-owner` without dropping the later M5/M6 parity gates.

## Validation state

Exact-head Windows CI on the final reconciled/A18 branch: PENDING.

Do not mark A18 complete or the visual continuity/manual gate PASS until the required evidence exists.
