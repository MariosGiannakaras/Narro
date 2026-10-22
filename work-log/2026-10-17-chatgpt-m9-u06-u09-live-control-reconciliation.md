# 2026-10-17 — M9 Reports chart menu/date chevrons current-source reconciliation

**Owner:** ChatGPT implementation; documentation-only independent side action while PR373 resulting-main Windows candidate runs. **No source, tests, config, PA, AppData or canonical recording changes.**

## Chart options (U09 / A3 SS-C12)
The older `TODO.md` claimed disabled chart ellipsis. Current `src/ReportsOverviewView.tsx` shows `<Menu triggerLabel="Chart options">` and four actual `MenuItem` callbacks: all series, tasks only, breaks only, total only. Current `src/ReportsOverview.tsx` updates its existing `visibleSeries` state for the corresponding preset and existing legend remains accessible. Already integrated [PR340](https://github.com/MariosGiannakaras/Narro/pull/340), head `3759e7e8bf388602e12874e1e42d691989a8a0f2`, exact-head run `38245931584` SUCCESS, squash merge `2c25281a21e0e19c71a33e15bfe2294a77dfc3a1`, resulting-main run `38248985335` SUCCESS. The four Narro-owned behaviors are deterministic and not presented as Blitzit-original menu actions.

## Date chevrons (U06 / A2 SS-C02)
The older `TODO.md` claimed both Reports calendars had only month arrows. Actual `src/ReportsOverviewView.tsx` and `src/ReportsSessionsView.tsx` render both single (month) and double (year) arrow buttons with accessible roles and live `onPreviousYear`/`onNextYear` callbacks. `ReportsOverview.tsx` and `ReportsSessions.tsx` already add -12/+12 months for those buttons (and -1/+1 for single). Source/test coverage in `scripts/test-ui-reports-overview.mjs` and `scripts/test-ui-reports-sessions.mjs` guards actual wiring. Integrated [PR339](https://github.com/MariosGiannakaras/Narro/pull/339), head `9c0cea03bb85af074b35ebc293e1ad84e36bbb90` (head run `38239596149` 3/3 SUCCESS), merge `c32e71a17164cb70dcb77463d0473d6eb8a09ce8` (main `38244820979` SUCCESS). Exact original Blitzit double-arrow behavior beyond appearance is not source-proven; Narro-local safe function is accepted without pretending that conjecture is source parity.

## Disposition
Replaced stale code-missing assertions in exactly two preexisting `TODO.md` unchecked M9 source-parity lines, preserving OPEN exact original source behavior/physical-native acceptance. Added a concise `STATUS.md` current-truth note. No new feature PR, code change, source-version redraw or physical capture. All initial progress counts unchanged, M9 and M10 mandatory milestones still OPEN.

**Primary active task unchanged:** PR373 guarded merge `355d9a6feb774b89845532de7f028a0ee7ead3d4`, resulting-main run `39071099958` was **IN PROGRESS / Windows candidate not yet PASS** when this independent documentation started. Check live outcome next and finalize B45 tracker only on actual 3/3 result.
