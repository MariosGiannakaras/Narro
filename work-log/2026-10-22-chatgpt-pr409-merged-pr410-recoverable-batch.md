# ChatGPT — PR409 integrated and one coherent PR410 recoverability batch (2026-10-22)

## Validated evidence
- PR409 head `0bbb58aac1f602c30f17075261cb3f37000c0be9`, run `39762674590`: validation/fast/Windows-candidate **3/3 SUCCESS**.
- Expected-head guarded squash merge `6b7ef2f74a1b82130e8d5f3e1beeb18f85f9eacc`. Exact blob match **5/5** for Home component/styles, two existing contracts and new actual Home regression.
- Resulting-main Windows CI `39766772841` **IN PROGRESS, NOT PASS** at this evidence checkpoint.

## New bounded batch (ChatGPT owner)
- SearchPalette: in-place authoritative catalog retry for both Search/Quick Task, false No Matching result suppressed on read error.
- TaskScheduleDialog: in-place reload of authoritative editor state; native mutation and protected controls unchanged.
- ReportsOverview: independently retry failed initial Home catalog or report aggregation while retaining date/list filter identity, usable Back.
- ReportsSessions: independently retry initial Home/search catalog and session aggregation; preserve revision guards and Back.
- Exact PR410 head `910ce968020357798418f1343893cb19ea14dc0a`, 6 changed files (4 components, shared regression script, mandatory existing preflight import).
- New `scripts/test-recoverable-local-reads.mjs` extracts/exercises actual production click callbacks using TS AST + VM with guard cases and effect dependency claims, already wired to `test:ui-search-palette`.
- Source diff read and verified, local full npm preflight **NOT RUN** due absent checkout/dependencies. PR-head CI **PENDING** at this checkpoint; neither source acceptance nor physical PASS.
- Safe next: CI exact head -> first actual failure or guarded merge on 3/3, followed by resulting-main validation. Do not modify other-owned native PR389; 4/8 physical FAIL persists.

## Project boundaries
Mandatory milestones 4/10 accepted; 41/41 Narro-local uncertainty coverage, 9/9 original gaps accepted, optional M11/M12 dormant. No Windows native PA operations, personal AppData, Spectrum Core picker/upload/218 icons changes.
