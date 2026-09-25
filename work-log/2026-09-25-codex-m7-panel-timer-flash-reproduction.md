# 2026-09-25 — M7 Panel→Timer staging flash reproduced

## Evidence

- Agent: Codex. Source remains PR #143 head `9b80ee19c6678fca998b58740410f94c821cff26`, guarded merge `fce15f8ed7a70cd83e05f3b9448d627413b719e7`, identical tree `608aec06f64a3184568bc0d171adc1b085220fa9`. Exact CI #507 runtime `narro.exe` SHA-256 `1285EC257AF2D45682D96702F815B86E6CC971127264A09EB6D609CAFB56A17A` was used.
- Second unobstructed visible-desktop recording at 20 fps physically reproduced the Panel→Timer blank/staging interval from the prior work log. Outgoing Panel faded in frames 278–280; frame 282 displayed an empty Timer-sized WebView with a scrollbar, and frame 284 had the Timer content. The repeat capture is machine-local under the Codex task `work/panel-to-timer-repro-frames/`, with `panel-to-timer-repro-contact.png`. This fails the no-staging-flash criterion in `docs/M7_FLOATING_RUNTIME_VALIDATION.md`. The capture method records visible desktop pixels and is not an occlusion-proof WebView capture; the target was unobstructed for this run.
- The paused authoritative session remained the same during the transition. This is a visual failure, not evidence of a session/domain failure.

## Source diagnosis and next implementation

`src/focus.tsx` waits for the outgoing opacity transition and a presented-frame barrier, then awaits `presentFloatingTimer()` before calling React `setMode("timer")`. `src-tauri/src/lib.rs` `configure_focus_surface_mode` hides, changes native geometry, and calls `window.show()` inside `present_floating_timer`. Thus the native window can be visible while the old root is hidden and before React has committed the new Timer DOM. This ordering directly permits the observed empty surface. It does not by itself prove whether the scrollbar/blank pixels are caused solely by that ordering or also by WebView2 composition latency.

Next agent action: design a coherent transition ownership/state-machine change that publishes the target renderer hierarchy at the appropriate hidden geometry boundary before native show, while preserving rollback on native/renderer failure, same reusable focusSurface, Rust geometry authority, reduced-motion behavior and session continuity. Avoid a timing-only delay. Add executable async/state tests for success, cancellation, failure and rollback. Run local preflight, one exact-head Windows CI validation, guarded merge/tree comparison, then retest the actual artifact physically. Timer→Panel continuous capture and OS-level reduced motion are still NOT RUN. M7 item 7 remains open; do not advance M8.

## Cleanup

The exact #507 test process was stopped. The original roaming `narro.db` was restored byte-for-byte from the pretest backup to SHA-256 `8271B4CFE1190D2E5952D3C6A969ED71FE4650ACBA2B12F0A7061A310C0F1F4E`. No Narro process remained. No source or user data change was made.
