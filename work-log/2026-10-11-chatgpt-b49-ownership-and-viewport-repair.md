# 2026-10-11 — User ownership reassignment; #321 B49 viewport-before-navigation correction

## User instruction and scope

The user explicitly clarified that **ChatGPT alone is responsible for every coding implementation, source fix, automation/test, CI inspection and merge** in Narro. Codex is **only** responsible for the already paused later physical Windows desktop acceptance. All historical references to a separate #321 implementation owner are superseded. Resume the **existing PR #321 on its original branch**; do not create duplicate work.

This slice changes only #321's Edge CDP capture ordering and its regression test, without changing Narro product behavior, CSS, appearance, Rust, production IPC or screenshot acceptance thresholds.

## Exact root-evidence boundary

Before repair, #321 head `f129c37b30b27897971f3aa8452c563f8f955111` Windows [run 38092529298](https://github.com/MariosGiannakaras/Narro/actions/runs/38092529298) had validation/fast SUCCESS, windows-candidate FAILURE at **Capture Visual Regression Fixtures**; later upload failure was downstream. Actual dark B49 fixture diagnostic: ready=true, pass=false, focusOwner=false, activeTag=SPAN, action rail opacity 0, heading opacity 1, contract error "Revealing queued actions moved title, card or targets". The light B49 CDP screenshot succeeded in the same run. The existing real strict pixel/DOM checks correctly **rejected** the dark capture.

Source inspection confirms `scripts/capture-focus-action-cdp.mjs` launched Chromium directly on the fixture URL and called `Emulation.setDeviceMetricsOverride(420×720)` only after the page had started running. The queued-row tooltip/geometry measurement is asynchronous and intentionally precedes the last B49 action refocus. This creates an evidenced **viewport-after-load race risk**, consistent with the measured dark failure; **not yet proven to be the sole cause** without fresh Windows CI.

## Changes on existing branch

- `scripts/capture-focus-action-cdp.mjs`: Edge launches `about:blank`, attaches to that single page, sets final 420×720 CDP viewport **before** `Page.navigate({url: options.url})` loads the fixture, and rejects CDP navigation errors. Keep original strict ready/focus/opacity assertions, two rendered frames, screenshot and DOM from same CDP page, captured failure diagnostics.
- `scripts/test-ui-focus-action-slots.mjs`: mandatory preflight assertion fixes launch-before-viewport-before-fixture-navigation ordering without relaxing focus or painted-pixel semantics.
- Original PR files otherwise unchanged. New existing-branch commits `ded8bf79523c1b74bac235f8f4b0626218af83dd` and `940ce10e3b3eed83513ea127286d98960d0d12d3`.
- Checked all seven changed PR paths against its original base `8868932959c8f2fcf3dd535c97a5800d3d4e7046` and current `main`: all pre-existing main paths have **identical Git blob SHA** versus PR base, and all four PR-new paths remain absent on main. No overlapping source change identified. Preserve newer main documentation.

## CI / verification checkpoint (not full pass)

[PR #321 CI 38141136444](https://github.com/MariosGiannakaras/Narro/actions/runs/38141136444) for exact current head `940ce10e3b3eed83513ea127286d98960d0d12d3`: validation-gate **SUCCESS**, fast-gate **SUCCESS**, windows-candidate **IN PROGRESS / NOT PASS** at this checkpoint. Local Windows Edge/PowerShell, full Node/Rust compile not run in connector environment. Windows source/packaged screenshots still require actual candidate result.

Re-downloaded pre-#321 resulting-main artifact `11697127517` and independently verified locally: ZIP `74696defe7963e629878a70ae4fb820734d1aba20958d3714d385ca81579e1d6`, `narro.exe` `8292d9e4cf27742332a4a970f005e5a23713f58a0375f93ed4542a21a5adc0c9`, NSIS `c1b8a8bf5c650f43a1aa452bd8ddddb1813cdc6434da30775a64692755cc5379`, MSI `d2880877304caa13b21d794c5a75bde7668ed0c9806c3d838ea053b008ad043b`. This remains **intermediate pre-#321 evidence**, not final Q12.

## Exact next action and acceptance conditions

1. Inspect actual Windows job on run `38141136444` once result is available. If RED, inspect its first causal failure and fix only that cause **on the same PR branch**; do not weaken painted action-rail pixel delta, focus owner, tooltip geometry or fixture-error rejection.
2. Once exact-head validation+fast+windows **3/3 SUCCESS**, recheck current PR head/base and `main`; expected-head guarded squash merge PR #321 and verify all changed Git blobs equal resulting main. Progress becomes **11/11 source+CI** only after this proof.
3. Q12: verify **new resulting-main** push CI 3/3 and download the final combined production ZIP; SHA256 hash the actual ZIP, uncompressed `narro.exe`, NSIS, MSI. Prior `c91c5dd...` candidate cannot be relabeled final.
4. Keep Codex exclusively for explicitly resumed physical Windows tests. M1/M5/M6/M7/M8/M9 native/canonical gates OPEN, M10 blocked and opt-in M11 dormant.

Separate current-truth direct-main `HANDOFF.md`, `TODO.md`, `STATUS.md` and post-audit action queue were reconciled with the user's ownership correction. No fabricated native/Blitzit parity PASS.
