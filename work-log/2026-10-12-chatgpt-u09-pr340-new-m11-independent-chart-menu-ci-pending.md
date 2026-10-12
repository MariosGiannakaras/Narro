# 2026-10-12 — U09 functional chart options PR340 open, exact CI pending; U06 resulting-main Windows active

## Existing implementation baseline and owner safety

- U06 PR339 completed exact head `9c0cea03bb85af074b35ebc293e1ad84e36bbb90` [CI 38239596149](https://github.com/MariosGiannakaras/Narro/actions/runs/38239596149) **3/3 SUCCESS**, expected-head guarded squash merged `c32e71a17164cb70dcb77463d0473d6eb8a09ce8` and 10/10 exact source blobs matched. Its resulting-main [Windows run 38244820979](https://github.com/MariosGiannakaras/Narro/actions/runs/38244820979) **validation+fast passed, Windows in progress** at this immutable checkpoint, so new U06 production artifact/hash not yet accepted.
- U09 [PR340](https://github.com/MariosGiannakaras/Narro/pull/340), source branch `feat/u09-reports-chart-options-local-menu`, exact proposed head `3759e7e8bf388602e12874e1e42d691989a8a0f2`. Branch started after U06 guarded merge + verified 10/10 main source blobs, from main `b09d973119f614c1dec351b7556184a630c8d89c`; no competing older stale branch/PR. U09 [initial workflow run 38245931584](https://github.com/MariosGiannakaras/Narro/actions/runs/38245931584) IN PROGRESS / NOT PASS at this checkpoint.

## Actual U09 source (7 paths, read-only)
1. New `src/reportChartSeriesPreset.ts`: pure, deterministic `"all" | "tasks" | "breaks" | "total"` maps to three visibility booleans; always at least one enabled.
2. `src/ReportsOverviewView.tsx::ReportChart`: replace prior disabled `data-report-chart-options="unavailable"` fake ellipsis with REAL `Menu` + four `MenuItem` action buttons and `data-report-chart-options="available"`. Reuses `src/overlayPrimitives.tsx` existing WAI/menu focus/arrow/home/end/Escape/outside and calibrated overlay tokens; no handwritten competing popover. Inferred Narro-local menu, **NOT proven original Blitzit action**.
3. `src/ReportsOverview.tsx`: `applyChartSeriesPreset` sets the same single React `visibleSeries` already used by legend; not independent state/SQL/report query. Existing legend still enforces at least one visible series when toggling.
4. `src/reportsOverview.css`: reuses original 32x28 chart ellipsis geometry via existing `.overlay-trigger` style, no arbitrary colors/effects.
5. `scripts/test-report-overview-presentation.mjs`: imports actual new production helper, checks four exact masks/non-empty.
6. `scripts/test-ui-reports-overview.mjs`: reconciles obsolete disabled fake-control expectations with real menu, four real actions and accessible control.
7. `scripts/test-ui-reports-overview-runtime.mjs`: requires actual runtime React state wiring. All affected registered preflight consumers explicitly reviewed. No Rust/session/task/time data touched.

## Status / next
- Previous bounded U12/U40/U35/U21 **4/4 accepted**, separate U06 **1/1 source/PR merged**, U06 final resulting-main CI/production package pending. Separate U09 **0/1 accepted** (PR open CI pending). Mandatory physical Windows PA-01–09 USER-PAUSED, milestones 3/10, M10 blocked, optional live Blitzit M11 dormant; Narro must work without it. User-owned Spectrum Core List Editor color/upload/218 icons untouched.
- NEXT: inspect CI 38245931584 exact validation/fast/windows jobs. If red fetch *first failing step/log* and fix ONLY causal issue (do not assume flaky). If full 3/3 green reverify exact PR head, live main PRs, expected-head guarded merge, and all source blob hashes; separately verify resulting-main Windows package. Also monitor U06 resulting-main 38244820979 independently. Record immutable evidence and repin physical candidate only after latest executable source fully validated.
