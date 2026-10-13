# Scoped physical-failure correction plan

Baseline and proof: [PA01–08 aggregate report](WINDOWS_PA01_08_REPORT_2026-10-13.md), exact ec7673c executable. Source branch `fix/pa01-04-07-native-acceptance` in isolated `E:\SystemFiles\Desktop\Narro-PA-20261013`. Preserve concurrent PR344/345/346 and old dirty NarroUpload WIP.

## C4 whole-path reassessment and alternative

Existing mechanism A: incoming ready DOM is promoted before native movement; CSS clips/promotes independently over250ms. Native cross-DPI Timer→Panel deliberately retains the outgoing Timer region through move, host-DPI correction and a bounded compositor settle, then exposes full Panel. This necessarily lets incoming Panel header/card paint inside the old110px/300px extent. Current native capture proves the same acceptance criterion fails; do not describe every caption/desktop symptom as identical to historical CI1046 without frame comparison.

Candidate mechanism B: protect outgoing pixels before promoting the incoming subtree; acquire complete ready incoming pixels using the **existing WebView2 CapturePreview**, not parent/desktop GDI. A bounded native raster transition owns both its visible envelope and pixel composition on one timeline, using full-image scale/crossfade rather than cropping incoming semantic content. Keep its protection through target DPI/viewport readiness, then release after renderer publication/paint confirmation. Preserve existing two normal WebViews and the same Focus HWND; raster children are transient paint protection, not another domain/window authority. No hide/show/ordinary host resize switch.

Compare A/B on the same3 paired Panel↔Timer observations at primary100/LG125,3 compact/expanded pairs, normal/reduced motion, active/paused identity and Time's Up labels, native focus/hit targets and rollback. Continuous video must prove no clipped/stale/pale/desktop-contaminated frames. Quiet floating-only CPU/memory measurements are separate from recording. B is a **candidate**, not acceptance or a final architectural decision before exact-build physical comparison. Avoid another isolated CSS-height/sleep tweak to A.

## F29

Observed post-add focus is Back rather than +Add Session. The dialog currently samples `document.activeElement` in a passive effect; use an explicit trigger identity established at opening and validate with actual DOM events, delayed pending closure and returned focus. The4.2s native UIA provider gap now correlates with synchronous create_manual_report_session opening/writing SQLite on the command path. Offload only this manual Add write, await its durable typed result and add a real-lock worker/yield/one-write/error regression; exact replacement-binary keyboard/UIA responsiveness remains open. [Source checkpoint](../work-log/2026-10-13-pa-corrections-source-checkpoint.md).

## Normal shutdown

The actual tray handler saves Floating Timer placement then exits, without forcing the TimerService's authoritative runtime checkpoint. Force advance of automatic boundaries and durable timer checkpoint before normal exit; on checkpoint failure, keep the app alive and surface/log the failure rather than silently losing time. Controlled-time tests must preserve the final pre-exit elapsed interval, stable session/task IDs, paused recovery and exclusion of app downtime. Placement semantics unchanged.

## Acceptance dependencies

Historical source/CI/physical evidence stays immutable. Any replacement of Focus paint/region composition reopens affected current M1 monitor/DPI, M6/M7 transition/Time's Up/window interaction and M8 shortcut integration acceptance until the new exact binary is checked; unaffected source functionality is not reopened wholesale. Shutdown correction reopens its M7/M9 elapsed/persistence path only. M10 entry remains blocked, M11 excluded. Preserve Spectrum Core picker, image upload and218 icons.

Regression-first, coherent feature PR, exact-head Windows CI, guarded merge and resulting-main proof precede final physical acceptance. Available environment/capture deficiencies are repaired separately; blocked MSI and unavailable Windows Settings remain explicit manual/environment actions.
