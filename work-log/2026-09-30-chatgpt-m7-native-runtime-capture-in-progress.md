# M7 packaged-runtime visual harness — native capture route checkpoint

Date: 2026-09-30

## Status

IN PROGRESS / NOT VALIDATED.

Current PR #192 branch head at this checkpoint: `fe5224fd3794a13b693490a9bb1a9ddf953c8391`.

## Evidence that changed the harness design

Windows CI #718 and #720 both built and launched the packaged `narro.exe` successfully, but the hosted runner never exposed the requested WebView2 DevTools endpoint. #720 failed only at `Capture Packaged Focus Runtime` with `WebView2 DevTools targets did not become ready ... fetch failed`. The uploaded failure artifact contained normal Narro startup output and no application crash signature.

## Native replacement

- Removed CDP as the packaged screenshot/control transport.
- CI-only Focus URL uses `?runtimeVisual=1`.
- The renderer driver invokes the same production `present_focus_for_blitz` / presentation paths used by Narro.
- `focus_runtime_capture_checkpoint` is environment-gated by `NARRO_FOCUS_CAPTURE_DIR`; outside the capture process it rejects use.
- Checkpoints include DOM overflow/presentation metrics.
- Win32 PowerShell probes capture HWND geometry/DPI and actual on-screen packaged pixels.
- Settled captures cover Panel 340×700, compact Timer 340×110 and expanded Timer 340×300.
- Panel→Timer and Timer→Panel each use one 20-frame PowerShell capture process so process startup cannot consume the 250ms motion window.
- Existing native/DOM validator contracts remain responsible for geometry, region, overflow and transition evidence.

## Current CI

CI #732 is running on parent head `553a88f0a94a970bac616ab9bb951abb27970d6a`. It is not exact-head evidence for `fe5224f...`.

## Continuation

Wait for an exact workflow run on the current PR head. Fix only observed compiler/harness failures. On PASS, download and inspect every settled PNG and both transition sequences before updating M7 automated evidence. Physical Gate 7/Gate 12 remain open.
