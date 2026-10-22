# 2026-10-21 — User-authorized no-CI independent Timer investigation

## Ownership and exact states
Owner: ChatGPT implementation agent; latest explicit instruction: **DO NOT START ANOTHER CI**. Preserve open PR #388, do not fast-forward its head or open another PR. Last directly confirmed PR #388 head `2d99bec37ccf7a74a1f2dcf326e48297ac3a8c57`, not merged. Historical CI for that head run `39502657787` last known IN_PROGRESS; no status polling or CI rerun performed during this operation. Existing automated gates/physical acceptance not inferred.

Independent changes isolated in unPR'd staging branch `fix/pr388-staged-evidence-calibration`, head `e8478d3ea9ea49c3ca4c785efaca50e52071521e` (after the timer test and documentation). GitHub `.github/workflows/ci.yml` has `push` only on `main`, `pull_request` only targeting `main`, and `workflow_dispatch`; source/test writes to this unPR'd staging branch alone do not start a new Windows CI.

## Latest physical evidence and source ownership
From the newest Codex recording `resume-segment-009-original.mkv`, already verified against the physical source `9e631952158c5c6b9763e0e0d79e33b79e8c7ca3` / captured EXE `bced8a9f533fedb726bedc7fa2d90eec98324b2f9b15db77b8f1ad1c79b5f909`: eight all-frame normal/reduced-motion bounded intervals, 1,099 decoded source frames, hashes/PTS in `work-log/evidence/capture57-analysis-20261020/m7-transitions/proof-index.json`. Reduced Expand briefly exposes old Panel 00:54 beneath current compact Timer 00:48, corrected ~46–62 ms later. Reduced Collapse exposes old Panel 00:54 beneath live Timer 00:40. These are compositor pixel freshness failures, not a second timer or corrupted timer state.

Production call chain:
- `FloatingTimerFoundation.requestExpanded(true)` flushSync prepaints target, waits double JS rAF; `FocusSurfaceCoordinator.requestTimerExpanded` calls transition helper with `waitForTargetReady: async () => {}`; `focus_surface_apply_presentation` invokes `apply_timer_native`.
- Native Expand moves safe compact position, calls `timer_region::apply_without_redraw(window, expanded.region())` using `SetWindowRgn(FALSE)`, then sets presentation attributes. **No validated incoming target pixel capture or protective lease before newly exposed 300px region.**
- Collapse does `focus_surface_capture_compact_frame` via async WebView2 CapturePreview after double rAF, then a finite 500ms `focus_frame_hold::begin` child and no-redraw clipping; PNG dimensions are checked but pixel *content generation* is not.
- Panel↔Timer uses a separate finite raster token/rollback/capture path: `focus_surface_prepare_mode_raster`, `focus_surface_animate_presentation`, `focus_surface_finish_mode_raster`. Token ensures transaction identity; does NOT guarantee composited frame freshness.
- Older forced native redraw produced blank/white frames. Do not flip redraw to TRUE, add arbitrary waits, resize/recreate persistent WebView HWND, or invent a success claim.

## Concrete code/test artifacts, isolated staging
1. `scripts/test-timer-freshness-regression-red.mjs`: **new intentionally RED** regression-first Node test, *not wired into npm preflight*; validates original eight intervals+1,099 frames, asserts no-redraw/raster/capture/renderer owners preserved, then demands a protected incoming expanded Timer frame before Win32 region exposure. This is an unmet safety precondition, not a test to disable.
2. `docs/TIMER_C26_C28_FRAME_FRESHNESS_REGRESSION_FIRST.md`: exact physical evidence, full React→Tauri→Win32 call chain, owner boundaries, safe alternative invariants, capture generation, fault recovery and user-paused physical retest requirements. Code changes do **not** fix Timer runtime.

Test execution: fetched the live production sources and RED script, evaluated equivalent Node assert/test body in **isolated V8** with source contents supplied as read-only maps; results: (a) original evidence coverage PASS, (b) historical safety invariants PASS, (c) freshness-before-region-change expected RED. This is **not** a full checked-out-repository `node --test` or physical Windows run. No new CI initiated.

## Acceptance and safe next operation
C26–C28/C35 original native visual FAIL remains **OPEN**. Need actual renderer-generation content receipt and native bounded raster handoff or comparably verified compositor protocol, coupled with deterministic rollback, no extra native state/persistence owner, tests for token mismatch, concurrent resize, timeout, DPI change, current content/old pixels, normal/reduced motion; any candidate must later undergo exact-build Windows gates and user-authorized physical retest. Physical PA-01–09 remain USER-PAUSED, M11 dormant, approved Spectrum Core picker/upload/218 icons unchanged.

**NEXT CHAT INSTRUCTION:** continue from staging `e8478d3ea9ea49c3ca4c785efaca50e52071521e` and the linked deep Timer fault tree, using code and regression tests but **DO NOT start another CI**. Keep the deliberate RED test off preflight and PR388 untouched while identifying an actual safe native/renderer pixel freshness patch. Run isolated/local tests when possible, not CI. If no defensible runtime fix is available without physical proof, keep FAIL open and develop independent non-overlapping tests/analysis. Do not rerun old acquisition or recreate PRs/branches needlessly.
