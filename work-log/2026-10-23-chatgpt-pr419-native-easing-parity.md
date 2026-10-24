# PR419 Motion v4 native Focus easing parity (2026-10-23)

**Owner:** ChatGPT source/CI track. **PR:** [#419](https://github.com/MariosGiannakaras/Narro/pull/419) OPEN/DRAFT; **new experimental head:** `faa47a672a45854e4bc1f9ecfd7f795bb4e1748d` (prior first-slice head `1fcabb725cafb534d4ed6c6796ef24f0c2f40802`). **B compositor baseline:** PR389 native `88baa42b02e79999d8b93f592ace9829c9ee1a88`, distinct from later PR389 offline-analyzer input-validation head `2b79a20993f7520272edb44cc9b96b27d5f6ca84`.

## Incremental source correction

The first experimental runtime slice connected real Focus/Timer presentation timing to the reviewed TS model but native Rust `animate_focus_surface_presentation_internal` still evaluated `fluent_point_to_point_easing(elapsed)`, not the pure Motion v4 `t*t*(3-2*t)` smoothstep. This would make the future shared semantic element drift away from the native region/position envelope despite a common duration.

- **Changed** `src-tauri/src/lib.rs`: added bounded `focus_motion_v4_easing` returning exactly the TS `motionV4Smoothstep` at finite [0,1], using it *only* for Focus Panel/Timer native raster geometry frames; Main/Blitz rect morph and existing Fluent easing remain untouched.
- **Added tests** inside Rust: 0/25/50/75/100% equality, endpoint clamp and 101-step monotonic bounded property.
- **Changed** `scripts/test-ui-focus-surface-transition.mjs`: bind source contract to native Focus-specific easing, pure TS sampler and preserved Fluent Main geometry separately.
- No new storage state, window, IPC clock, bitmap owner, toolbar behavior, app branding, icons, upload or Spectrum picker changes.

## Verification

Code push to PR419 source **verified by GitHub head**. Manual source-contract sanity checked; actual local Rust check/test or Node execution **NOT RUN** here. GitHub Actions exact-head run **NOT OBSERVED via connector after push**, therefore validation-gate/fast-gate/Windows-candidate are **NOT VERIFIED**; packaged experimental Windows executable and native physical normal/reduced 8/8 **NOT RUN**. Do not infer PASS from code reasoning.

**Remaining source work** is substantial: native compositor shared-element title/time pixels, real DOM anchor measurements, action-first controls, full subtask-row reveal and failure/reverse/native frame safety. This file does **not** close that acceptance or fix PR389 A02 ghosting. Preserve PR389 untouched as diagnostic control; no merge for PR419 until A baseline is separately accepted, B has its own exact CI and physical evidence. See [current handoff](../HANDOFF.md).
