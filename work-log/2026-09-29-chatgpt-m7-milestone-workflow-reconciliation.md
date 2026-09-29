# M7 milestone/workflow reconciliation — 2026-09-29

## Scope

Process/tracking-only reconciliation requested by the user. No application implementation work was performed in this slice.

The purpose is to clarify how the active M7 replacement interacts with already validated milestones and future roadmap execution without reorganizing the 10-milestone roadmap.

## Durable decisions

1. **The 10 milestones and their order remain unchanged.** No new milestone is added and no completed milestone is reopened merely because a later corrective slice replaces a shared implementation foundation.
2. **M7 remains the active corrective milestone.** Its current replacement may change Focus foundation code originally created during M1 and M6 because Gate 7/12 evidence requires a different presentation composition.
3. **M1 and M6 remain completed roadmap milestones.** Their materially affected validated behavior becomes an explicit regression obligation of the M7 replacement. Historical PASS evidence validates the superseded implementation, not the new replacement code.
4. **M2–M5 remain outside the rewrite** unless a direct dependency is demonstrated.
5. **Already validated M8 work remains validated and must not be reimplemented.** Remaining M8 implementation is sequencing-blocked until the M7 replacement is completed, later authorized for testing, validated, and tracking-reconciled.
6. **M10 gains an explicit cross-milestone regression responsibility**: when a later milestone replaced an earlier shared foundation, the release-candidate regression pass must rerun the materially affected earlier acceptance criteria.
7. **The post-M10 Final Comprehensive Review also reconciles cross-milestone replacements** and may not use historical PASS records as proof of replacement-code validity.
8. **Repeated-failure escalation remains a general project rule**, not an M7-only exception: repeated CI-validated physical failure of the same acceptance criterion requires reassessment of the mechanism and a materially different scoped alternative before more micro-fixes.

## Current-state reconciliation

The top-level current-state section of `STATUS.md` had stale counters and phase wording. It is now reconciled to:
- roadmap: 6/10 milestones complete;
- M7: 12/14 top-level items validated, Gate 7 and Gate 12 open;
- M8: 6/8 top-level items validated, remaining work blocked behind M7 closure;
- M9–M10: not started.

The current validated merged application source baseline remains:
`e3a9abf8f769297d56295d7afe8a3f3aeb5d27ed`.

PR #191 experimental source `4e4960b221f4aad310080ab0b07379e059b52fdc` passed Windows CI #639 but physically failed strict Gate 7 and remains unmerged.

The active `plan/m7-single-focus` replacement is explicitly recorded as **implementation in progress and unvalidated**. A stale HANDOFF sentence claiming that no replacement code had been implemented was corrected.

## Files changed in this process slice

- `AGENTS.md`
  - added a general cross-milestone replacement rule;
  - preserves the existing repeated-failure escalation rule.
- `TODO.md`
  - clarified M7 corrective scope without reopening M1/M6;
  - blocked only remaining M8 work behind M7 closure;
  - added cross-milestone regression obligations under the existing M10 regression item;
  - added matching final-review reconciliation under the existing end-to-end review item;
  - updated stale wording from "planned, not implemented" to "implementation in progress and unvalidated".
- `docs/M7_SINGLE_FOCUS_SURFACE_PLAN.md`
  - clarified that implementation has started but remains unvalidated;
  - made the M1/M6 regression-obligation semantics explicit.
- `HANDOFF.md`
  - corrected current progress context to active M7 (12/14);
  - removed the contradiction about whether replacement implementation had started;
  - clarified M8 sequencing and cross-milestone scope.
- `STATUS.md`
  - reconciled stale current counters/current baseline wording;
  - recorded the process semantics above.

## Validation

By explicit user direction for the active M7 implementation phase:
- tests/builds/CI/app launch/physical validation: **NOT RUN**;
- no application source/config/test file was intentionally changed in this process slice;
- no milestone checkbox was promoted or demoted;
- no roadmap denominator changed.

## Exact continuation

Continue the incomplete single-Focus M7 replacement on `plan/m7-single-focus` from the latest repository state. Preserve the process rules above. Do not run tests/builds/CI/app launch/physical checks until the implementation is complete and the user explicitly authorizes the validation phase. Do not start remaining M8 work while M7 Gate 7/12 remain unresolved.
