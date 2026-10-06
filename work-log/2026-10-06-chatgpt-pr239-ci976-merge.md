# 2026-10-06 — PR239 CI976 validation and merge

## Scope

Close the source/automated portion of supplemental finding36 after the final regression-harness correction.

## Exact evidence

- PR239 final exact head: `955a6e124130ae9abae9be3fff242f881abadfc5`.
- CI975/run `37445464188` reached the Windows candidate but failed the visual integration harness because the new regression queried Floating Done with the Panel selector `data-focus-action="done"`.
- Production Floating actions use `data-floating-action`; the harness selector was corrected in one test-only line.
- Windows CI976/run `37450668638`: **PASS** on the corrected exact head.
- CI976 published unexpired M7 validation/physical/runtime-visual artifacts.
- PR239 was expected-head-guarded squash-merged as `88cd58e0357f9ab368716eb4504711aaf5cb0687`.
- Resulting-main identity check: all five changed source/test blobs are exactly identical to the validated PR head:
  - `scripts/test-ui-focus-panel.mjs`
  - `src/FloatingTimerFoundation.tsx`
  - `src/FocusPanel.tsx`
  - `src/FocusSurfaceCoordinator.tsx`
  - `src/m7IntegrationRegression.tsx`
- GitHub automatically started duplicate push CI977/run `37454647074` on the squash result. Its result is not required to establish source identity because the changed executable/test blobs already match the exact CI976 head and workflow/build semantics were unchanged.

## Acceptance boundary

Finding36 is integrated and automated-validated. No separate physical/source-parity gate is converted to PASS by CI or blob identity. M7 remains 4/5 at the top-level acceptance ledger.

## Continuation

Begin finding35 from `work-log/2026-10-06-chatgpt-finding35-time-up-analysis.md`. Current slice progress resets to `3/10M || 0/3 | 4/5`: implementation, deterministic regression/targeted validation, exact-head CI+integration.
