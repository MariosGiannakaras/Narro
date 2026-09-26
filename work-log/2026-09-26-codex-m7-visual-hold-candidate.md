# M7 transition visual-hold candidate — 2026-09-26

## Evidence and mechanism

CI #530's exact runtime physically failed Gate 7: `work-log/2026-09-26-codex-m7-ci530-panel-timer-physical-fail.md` retains a pale Panel frame and an exposed desktop frame before Timer appears. The current `FocusSurfaceTransition` deliberately reaches opacity zero and the sole native `focusSurface` is hidden during native geometry and renderer replacement. Readiness-before-prewarm protects against stale task/loading text but cannot preserve pixels while that one window is absent. The previous source contracts actually required the hide/zero-opacity sequence, so they did not test the missing visual invariant.

## Candidate change

- Before the outgoing UI begins its finite exit, capture the current Focus rectangle into a short-lived native bitmap window. It is click-through, non-activating, tool-window-only, and contains no WebView or domain state.
- Keep that copy visible during hidden geometry, target projection readiness, transparent-host prewarm, and initial target composition. Remove it after reveal and a DWM composition barrier.
- Apply the same cover to Timer Expand/Collapse. Explicit native ownership rejects a second simultaneous cover; frontend guards serialize mode/resize requests.
- Cleanup runs on success and on transition/resize failure. The TypeScript hold owner has executable tests for duplicate acquisition, release during in-flight acquisition, failed acquisition and cleanup retry.

## Validation status

- `npm run test:focus-visual-hold-owner`: PASS (4 executable tests).
- `npm run test:ui-focus-surface-transition`, `npm run test:ui-floating-expanded`, `npm run test:ui-floating-collapsed`: PASS.
- TypeScript `tsc --noEmit`: PASS; Rust `cargo fmt --check`: PASS.
- Local `cargo check --locked`: NOT RUN to completion because this PC has no MSVC `link.exe`; the dependency build failed before checking Narro source. Windows CI must compile and test the native change.
- Native screenshot/composition behavior and M7 physical acceptance: NOT RUN on this candidate. The CI #530 failure remains authoritative until a new exact executable is recorded without blank/desktop/stale frames.

## Remaining risk and continuation

This is a candidate, not a physical PASS. In particular, desktop capture of the outgoing Focus rectangle assumes it is unobstructed when transition begins; test shortcut invocation from another foreground app and both mode directions. Review native resource cleanup and actual `STATIC` bitmap window presentation in Windows CI/runtime. If the candidate fails any physical criterion, revise it on this PR before merging. Run the full consolidated M7 matrix on a passing exact build; M7 stays 8/14 and M8 remains blocked.
