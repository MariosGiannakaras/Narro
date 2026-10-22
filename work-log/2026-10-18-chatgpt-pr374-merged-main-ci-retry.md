# 2026-10-18 — PR374 enabled Focus success reaction: exact head + resulting-main retry ledger

**Owner:** ChatGPT Narro implementation track. **Scope:** deterministic production-Focus rendered Windows visual regression of existing offline Fun GIF behavior. No production UI/state/API/CSS/SQLite changes, no manual native Windows session, no Blitzit M11 or M12.

## Scope and implementation identity

Already merged PR297 implements an offline Narro-owned, deterministic vector success reaction, controlled by the saved `celebration.funGif` preference. PR374 adds only six test/fixture/capture/validator paths: `scripts/capture-focus-panel-fixtures.ps1`, `scripts/test-focus-success-timing.mjs`, `scripts/test-ui-focus-empty-states.mjs`, `scripts/test-ui-focus-visual-states.mjs`, `scripts/validate-focus-visual-state-captures.mjs`, `src/focusPanelVisualFixture.tsx`. Uses the real production `FocusPanel` / inline `FocusCompletionSuccess` with identical committed-success queue and timer-state invariants in optional reaction ON/OFF variants. Verifies actual DOM/paint, reaction card containment, un-clipped SVG, safe inert queue/actions and pixel distinction in light/dark rather than mere static component presence. The production vector is **not a claim of the source's actual changing GIF media, pixels or rotation semantics**.

Two early PR heads `ca2412f9be407cc86db7ff6e6db4b6f56592bb74` / CI `39073587950` and `331a062f039df23bc58906c3d0b0d5b9f4d28351` / CI `39073695802` had fast-gate FAIL / Windows SKIPPED due obsolete fixed-string fixture-consumer assumptions. Third `eeb1ebbdf71279896d7008740fb6385e229cd978` / CI `39073798385` did not receive overall 3/3 success. Subsequent validated head `1646618a5f2809386506a7c0fe87d83ede47bc85` adds a real Node syntax check for the Windows-only capture validator and retains all semantic assertions; never treat any earlier failed SHA as accepted.

- [Exact PR CI run 39074852563](https://github.com/MariosGiannakaras/Narro/actions/runs/39074852563): **validation-gate SUCCESS, fast-gate SUCCESS, windows-candidate SUCCESS**.
- Expected-head guarded squash merged [PR374](https://github.com/MariosGiannakaras/Narro/pull/374) as `fe36d6dfb1fa1a7053066c8aab7ff4c690956e19`.
- All **6/6 exact changed Git blob SHA** compared and MATCHED between green head and merged-main source files:
  - `scripts/capture-focus-panel-fixtures.ps1`: `f05d73d61e5f083b8df8d2b29f05eee5c6fb9702`
  - `scripts/test-focus-success-timing.mjs`: `a44907aa9f7fe52992dc928f479fc6b8338bba35`
  - `scripts/test-ui-focus-empty-states.mjs`: `dcc93ca7a7d0c46b5b45e2c36cf3209c3adfb7ed`
  - `scripts/test-ui-focus-visual-states.mjs`: `ac4d06dbf454e1f904f15a266572762b8f195397`
  - `scripts/validate-focus-visual-state-captures.mjs`: `a7fb0fc3e4a503302134d13c82600fc0c262a38f`
  - `src/focusPanelVisualFixture.tsx`: `9b8d14711813019723d5fef8bc4f47d91a96a345`

## Exact resulting-main CI: BOTH attempts retained, not retroactively repaired

[GitHub push/main run 39107733025](https://github.com/MariosGiannakaras/Narro/actions/runs/39107733025) source SHA `fe36d6dfb1fa1a7053066c8aab7ff4c690956e19`.

- **Attempt 1: validation/fast SUCCESS, Windows candidate FAIL.** First failing step `Capture Visual Regression Fixtures`, actual GitHub job `117617299825`. The unrelated **Finding33 Large Notes real Escape** headless Edge CDP navigation timed out during `Page.navigate` before any input, on both the primary isolated browser and in-job fresh-browser retry. Diagnostic `rootChildren=0`, `loadedResources=[]`, empty event/key trace or diagnostic `Runtime.evaluate` timeout; preview URL/module fetched successfully by preflight. No observed Escape/keyboarding product failure; classed Edge/headless bootstrap/runner failure rather than a proven Narro UI defect. Later `Upload Packaged Focus Runtime Visual Artifact` failed because capture aborted before that artifact was produced (**cascading**, not independent app failure). Kept artifact `narro-visual-regression-failure-diagnostics` ID `12129048466`. This attempt remains **FAIL**, historically immutable.
- **Attempt 2: validation/fast/Windows candidate 3/3 SUCCESS** on *exact same source SHA*, after **one rerun of only the failed Windows job** on a fresh runner. Actual `Capture Visual Regression Fixtures` completed SUCCESS at 2026-10-18 07:49:56 UTC, including the real Finding33 Edge Escape assertion; Tauri release, packaged Focus runtime, M7 physical/automatic validation build/logging and M1 diagnostic storage isolation completed SUCCESS. This new successful attempt validates replacement source with intact tests, not a retroactive PASS for attempt 1.
- Resulting-main artifacts: visual regression `12129816255`, packaged Focus visual `12128834786`, M7 physical build `12130235261`, M7 automatic validation build `12130255187`, M1 diagnostic `12129937368`; fast dist `12128654900`. Artifacts generated in GitHub Actions, not physical PA execution.

## Independently checked visual pixels and contracts

Downloaded actual head archive `12117036536` and merged-main attempt-2 visual archive `12129816255`. In all four `focus-panel-success-(fun-gif-)?(light|dark).png` images, final PNG bytes are **identical head↔merge**, not merely equivalent DOM. At both themes, reaction `paintRegion` `{x:101,y:210,width:292,height:107}` inside 420×720 browser capture. Browser contracts `fitsCard=true`, `svgVisible=true`, `notClipped=true`. Distinct actual RGB changed pixels in enabled region vs disabled: **30,242 light**, **30,234 dark**. No newer source GIF/pixel, native animation or personal OS interaction inferred.

**Status:** PR374 source/test Windows fixture **merged, PR-head automated PASS, resulting-main attempt-2 3/3 PASS, scoped visual evidence PASS**; original-source GIF/media/motion + physical Windows acceptance OPEN. Current mandatory milestone count still **4/10**, M5–M9 unclosed, M10 one-time holistic sweep only at its proper gate, PA-01–09 USER-PAUSED, optional M11/M12 dormant, approved Spectrum Core picker/image upload/218 offline icons untouched, PR344 other-owner work untouched.

**Next:** bounded M6 B65 numeric early/late/equal/missing-EST success-feedback copy review from actual production source and already validated source/Windows fixture, with a new code PR only if a concrete unowned defect is found.
