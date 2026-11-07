# J05 owned-overlay correction and local preflight — 2026-10-29

Final source: `1dd54ed8c3144498a2aaedaa9d59e2caa13731c7`, existing PR437, Codex source/Windows ownership explicitly reassigned by user. Exact CI40862716381 validation/fast PASS, Windows IN PROGRESS at checkpoint. No final CI/native PASS, no merge or milestone closure.

## Cause and scoped alternative

[Actual DOM, native child and original video trace](evidence/pr437-causal-transition-20261029/README.md) shows preparing WebView content exposed while the GDI child hold still exists. A fallback-image-only fix does not cover that boundary. The candidate uses a finite owned native popup for mode/resize transactions above the same persistent Focus HWND; ordinary short region-boundary holds remain children. This is a materially different scoped composition mechanism, requiring physical comparison before acceptance.

Changes: `focus_frame_hold.rs` owns popup/child selection, exact owner/class/thread/handle lookup, negative physical coordinates, GUI-thread batched parent/overlay movement, byte/lifetime validation and bounded release/expiry. `lib.rs` supplies animation position with the corresponding raster frame. `focus_webview.rs` exposes the existing parent-position notification to preserve the WebView2 contract after real movement. Stationary frames avoid redundant host moves/notifications. Existing semantic compositor, timing, one persistent WebView, timer/session authority and preferences are retained.

## Actual validation

- Complete final local `npm run preflight:frontend`: PASS, including configured component/contracts, TypeScript and production build. Log: `E:\SystemFiles\Desktop\Narro-Workspace\Narro-Physical-20261029-PR437\source-validation\frontend-final.log`; result JSON exit0.
- Narrow transition ordering/rollback: 27/27 PASS; protected resize: 21/21 PASS; Motion v4 pure model and single-host contracts PASS. Rust formatting PASS.
- New actual Win32 regression cases cover installed owned popup vs child styles, paired negative-origin position/extent, stationary movement result, expired/other-owner isolation and invalid pixels/lifetime. Final local native execution NOT RUN: an independent tiny rustc executable fails because `link.exe` is absent.
- Predecessor a4a15709 exact CI40861510741 passed validation/fast, Windows Rust compile/Clippy/tests including the initial three Win32 tests. Whole run was superseded/cancelled before final packaging when position notification/stationary-move followup was added. Do not call it whole-run PASS or apply it to the final SHA.
- Windows CRLF-sensitive extraction failures were resolved in the affected transition test's five source reads. Aggregate preflight ran on Git-canonical LF source text; original unmodified checkout line endings and generated tracked icon bytes were restored afterward. Only six intended source/test paths differ across the two commits. No user source or approved picker/upload/icons were changed.
- An old zero-byte Git index lock was renamed reversibly only after verifying no Git process and a stale age. No reset or user-file deletion.

## Impact and remaining native proof

Affected: protected Panel/Timer and compact/expanded mode transactions, parent position/DPI notification, rollback, exact release/expiry, taskbar/topmost/input and occluded WebView paint. No runtime/domain/persistence changes. M7 affected gates remain open. Existing J01 naming and U-R03 topology policy are unchanged and their sufficiently scoped native evidence remains reusable. Persistent-host/idle architecture remains; physically verify no residual overlay after transition before declaring performance unaffected.

Exact-build physical comparison must exercise ordinary and reduced motion at100%/125%: Panel→compact→expanded→compact→Panel, same HWND/task/clock, no duplicate/blank text or desktop/white gap, complete content, interactive target and released overlay. Real HDMI remains separate; A/PR389 and B/PR419 comparator holds and PR431/436/437 dependent holds remain independent. M1–M4 accepted4/10, M5–M9 OPEN; M10 gated and M11/M12 inactive.

## Normal-motion environment capability

Previous client-area animation setting changed after app launch left the live WebView reduced=true. Fresh isolated launch with the real native setting enabled before process start returned `{"reduced":false,"dpr":1}` at UTC2026-10-29T11:04:38.554Z. The native API is documented by [Microsoft SystemParametersInfoW](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-systemparametersinfow). No debugger media emulation was retried. This capability check used old verified EXE3c14067a; it is not normal-motion acceptance of the new candidate. Original flag false restored and original profile hash identical at11:04:46.873913Z. Local receipt: `E:\SystemFiles\Desktop\Narro-Workspace\Narro-Physical-20261029-PR437\session-normal-capability-03\normal-cold-media.json`.

Next: exact final CI/artifact, then the focused physical comparison. No app or recorder is currently running.
