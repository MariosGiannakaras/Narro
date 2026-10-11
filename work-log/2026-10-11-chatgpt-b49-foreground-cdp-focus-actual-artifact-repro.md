# 2026-10-11 — Q01 #321 real failed artifact, local Chromium focus control, foreground repair

## Source of truth and owner

Latest inspected `main` was `e6f6708b3bb0eb1a87dfb192bc7b7e78b5d37308`, before this documentation-only checkpoint. User explicitly assigns all Narro source/test, PR, GitHub Actions and merges to ChatGPT; Codex only later user-paused **physical** Windows acceptance. Resume the original PR #321 branch `audit/20261011-b49-cdp-pixel-capture`, not a duplicate branch. User-facing source/test post-audit bounded campaign **10/11**, physical parity untouched.

## Actual Windows red and artifact

Exact PR #321 head `221558f80012342d7d3f9e1720c42a8e477c9c67`, [run 38143961415](https://github.com/MariosGiannakaras/Narro/actions/runs/38143961415) **validation SUCCESS, fast SUCCESS, Windows FAIL**. First causal red step **Capture Visual Regression Fixtures**, before missing Focus runtime upload (downstream). CI message:
`B49 Focus actual visual state never became ready: {"ready":true,"pass":false,"focusOwner":false,"activeTag":"SPAN","railOpacity":"0","headingOpacity":"1","contractError":"Uncaught Error: Focused queued title tooltip did not open before containment measurement: {focusOwner:true,activeTag:SPAN,tooltipOpen:false,rowVisible:true,viewport:[420,720]}"}`.

Downloaded actual [diagnostic ZIP 11704336328](https://github.com/MariosGiannakaras/Narro/actions/runs/38143961415/artifacts/11704336328), verified real ZIP SHA256 `0e623240e205366e68f4b563e6740b1d231703bd019b0da17bdf81c8736c2449`. Parsed captured `focus-panel-live-actions-focus-light.html`: real long queued title `tabindex=0`, tooltip `id=_r_c_` has `data-open=false`; contract is **error-only**; action rail not visible. Independent same-run ordinary `focus-panel-light.html`: **real queued-title tooltip `data-open=true`** with complete visual contract. Therefore neither a source product defect nor a passing action-rail screenshot is proven; just increasing nominal timeout to two seconds did **not** fix the actual capture.

## New independent local control

Downloaded **exact** fast-gate frontend `narro-fast-frontend-dist` artifact 11704390227, ZIP SHA256 `29f951feb867bc0e1887a4141ac19008e82b7bfea7390739caee61508619de49`. On Linux Chromium, ran 3 separate CDP browser probes: launching direct fixture URL reported `document.hasFocus()===true`, launching `about:blank` then `Emulation.setDeviceMetricsOverride` then `Page.navigate` reported `document.hasFocus()===false`, while calling `Page.bringToFront` before navigating restored `document.hasFocus()===true`. All probes `visibilityState=visible`, viewport 420x720. **Limitation:** local Chromium environment failed to mount the actual Narro React frontend (body active; no relevant fixture nodes); therefore this is a **CDP focus-state reproduction, not a local PASS for B49 application behavior or the Windows fixture.** This narrows the Windows issue to an unforegrounded CDP target that can leave a DOM element active without real browser focus; the next exact Windows CI is needed to confirm it fixes the fixture.

## Narrow same-PR correction, exact evidence gates preserved

On **existing** PR #321, commit `7180f5c922cb881cdfb843b36b6a8b289cbb21b0` updates `scripts/capture-focus-action-cdp.mjs`: after CDP page enable + 420x720 viewport override, invoke `Page.bringToFront` **before** real fixture navigation, and report/reject a focus-visual PASS unless `document.hasFocus()` is true in addition to the original true focus owner, opacity and heading checks. All original failure HTML+PNG retention, same-page CDP screenshot, strict actual painted action-rail pixel comparison and queued tooltip containment checks remain in place. Commit `9afe2c06f5a37aa4eccdcdc124c39265e2979e6d` strengthens mandatory `scripts/test-ui-focus-action-slots.mjs` static startup/focus order contract.

[CI 38148720131](https://github.com/MariosGiannakaras/Narro/actions/runs/38148720131), exact PR head `9afe2c06f5a37aa4eccdcdc124c39265e2979e6d`, **IN PROGRESS/NOT PASS** at checkpoint. Previous superseded intermediate head `7180f5...` run `38148704830` cancelled by GitHub concurrency. Local application production preflight and Windows physical interaction **NOT RUN** in this environment. No source product CSS/rendering change made. #321 remains OPEN.

## Exact next action

Inspect actual [run 38148720131](https://github.com/MariosGiannakaras/Narro/actions/runs/38148720131) three-job result; if red diagnose precise first causal Windows failure and fix only proven root on same branch, retaining strict pixel/focus/tooltip/geometry assertions. Do not count 11/11 until exact PR head 3/3 SUCCESS, expected-head guarded squash merge, and 7/7 PR changed blob SHA equality on resulting `main` after checking current Git state. Then execute Q12 from current resulting-main **real** production ZIP, `narro.exe`, NSIS, MSI SHA256 and main CI/tree-equivalence proof. Preserve Codex physical gate USER-PAUSED, M10 blocked, M11 optional dormant. Do not claim source Blitzit parity.
