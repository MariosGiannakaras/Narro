# M7 CI #799 physical smoke boundary correction

Date: 2026-10-01

## Incoming state

PR #192 had already advanced beyond the initial artifact-validity split:
- `907d1f97949153b5ccb181ad0ed3d9784efd4605` — split instrumented automated capture and production-config physical build;
- `5bda58516f9d1010d5d5b7b7f9abac76408c3db9` — initial physical runtime smoke;
- `ea75601f3fca2cc4bd577d35750738b4d998a955` / `2f64d8d223d3c2deec23b33c7e24df293758611a` — WAL-aware hardening of that initial DB scan.

CI #797 on `5bda5851...` was cancelled by the newer head. Exact CI #799 / run `36825786468` ran on `2f64d8d223d3c2deec23b33c7e24df293758611a`.

## CI #799 evidence

Windows CI #799: **FAIL**

The following passed before the failure:
- repository preflight;
- visual regression;
- instrumented Tauri release build;
- packaged Focus runtime capture;
- packaged Focus runtime visual artifact upload;
- **production-config physical validation build** in isolated `src-tauri/target-physical`.

The only failing step was:
`Verify Physical Validation Build`

Failure:
`Physical validation build did not create narro.db in the isolated APPDATA/LOCALAPPDATA profile.`

This did not establish a product or production-build defect. The smoke assumed that overriding process `APPDATA` / `LOCALAPPDATA` would redirect Tauri's Windows `app_data_dir()` resolver into the test directory. That assumption is not sufficiently portable/authoritative for hosted Windows.

## Correct boundary

The exact artifact-validity defect to prevent is activation of the renderer visual driver, which occurs only when Focus loads:
`focus.html?runtimeVisual=1`

The native checkpoint transport is independently gated by:
`NARRO_FOCUS_CAPTURE_DIR`

Therefore the production physical binary can be tested directly:
1. launch the production-config physical EXE with `NARRO_FOCUS_CAPTURE_DIR` deliberately set to an empty test directory;
2. keep it running for an observation window;
3. fail if any `checkpoint-*.json` appears.

If the binary accidentally contains the CI Focus URL, `startFocusRuntimeVisualDriver()` activates and produces capture checkpoints. A correct production-config build loads plain `focus.html`; the driver remains dormant even though the native capture environment is available.

This verifies the exact renderer activation boundary without relying on Windows app-data redirection or SQLite file-location assumptions.

## Correction

Commit:
`7962411435bcb2ebf71c775963711273220a5186`

Changes only:
- `scripts/verify-physical-validation-build.ps1`;
- `scripts/test-focus-runtime-visual-harness.mjs`.

The new smoke:
- deliberately sets `NARRO_FOCUS_CAPTURE_DIR`;
- launches the production physical EXE;
- requires the process to remain alive;
- observes for 8 seconds;
- fails on any `checkpoint-*.json`;
- no longer assumes `APPDATA`, `LOCALAPPDATA` or `narro.db` redirection.

No production/runtime product source changed.

## Current gate

PR #192 exact head:
`7962411435bcb2ebf71c775963711273220a5186`

Windows CI #800 / run `36833625252`: **IN PROGRESS** at this checkpoint.

Do not issue a physical build until #800 passes and the new `narro-m7-physical-windows-x64` artifact is reviewed.
