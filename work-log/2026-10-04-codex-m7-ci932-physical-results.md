# CI932 M7 physical results and native-composition decision

PR228 exact head `a6af4ef15bd827ad751b023df21ab64e565e2c8e` PASSed all Windows CI932/run37167015466 jobs and guarded-squash merged as `587af0a0f87283b8adc56e53e166289da77833b3`. Runtime/build/test/workflow identity is verified; duplicate main CI933 was cancelled after proof. Artifact11290666183 EXE SHA256: `31ac41768872319ba717e07af27138009ee9fd82f75de4fff93b42ea40ed71ef`.

| Scope | Verdict | Evidence and limit |
| --- | --- | --- |
| Saved-origin drift | PASS | Twelve Panel→Timer returns across100%/125%, normal/reduced, retain the safe origin:100% `(1100,780)`,125% `(-1702,705)`. |
| C5 restart | PASS | Real378.8px drag→tray Quit ofPID13932→same EXE PID23128→real Ctrl+Shift+T explicitly reveals compact Timer at `(1466,638)`. Same own task restored paused04:10/250 durable seconds; native evaluator PASS. Automatic Focus at startup is not claimed. |
| Collapse continuity | FAIL | Consecutive frames show classic `Narro - Focus` caption replacing Timer pixels, even with unchanged100% coordinates. |
| Native identity | PASS in sampled transitions | Correct bounded sampler preserves HWND/visibility/340×700 client and outer size/style14CA0000/exstyle40118; only110/300 region changes. No hung/ghost HWND observed. Earlier wrong-button trace executed no transition. |
| Large Notes | Observed bounded path | Own draft retained/reopened/saved;324×284 large editor fits340×300 region. Inline Notes has an internal vertical scroller. Full source/keyboard acceptance remains open. |
| Source hover/shell | VALIDATION_OPEN | Six real hover actions captured. VE003 Break icon is a gamepad; Narro compact icon is a coffee cup, requiring P3-M7-01 correction. Exterior shadow remains an explicit unresolved native reliability deviation. |
| Formal replacement M1 B/C/D and performance | NOT RUN on CI932 | Production paused observations and historical evidence do not substitute for isolated diagnostic protocol. |

Continuous official OBS recording:4480×1080 two displays,60fps,2026-10-04T01:31:23.471Z→02:21:24.955Z. Full local evidence is `artifacts/m7-ci932-physical-20261004/run-final`; repository package preparation remains active. Exporting consecutive frames does not imply review of every exported sequence or long idle footage.

## Repeated-failure comparison before further implementation

Caption removal/WS_CLIPCHILDREN/both, repeated region with redraw, parent validation and disabled DWM transitions/nonclient rendering all retain the failure. Nonclient rendering was already disabled. Child repaint can remove the caption but leaves the whole Timer absent for consecutive frames. Reject these as fixes. Third region-redraw cycle aborted in the harness: INCONCLUSIVE. WS_EX_COMPOSITED is explicitly ineligible on Tao's class23/CS_OWNDC; it was not applied. WS_EX_NOREDIRECTIONBITMAP was not retained on readback; no alternative transition was executed. Original styles/DWM policies restored.

A materially different temporary native bitmap child inside the same Focus HWND preserves Timer pixels in three held cycles while the three matching controls lose them.180ms early release still exposes partial incoming layout;500ms controlled hold maintains pixels through release. Temporary children/GDI objects are destroyed in finally and OBS stops normally. This is modified-runtime diagnostic evidence, not product acceptance, smoothness PASS or a third persistent WebView.

Chosen corrective mechanism: prepaint the complete incoming compact React layout before native clipping, then retain its own-surface pixels with a bounded one-shot native child on the same HWND. Cleanup must cover rollback, superseding modes, Focus exit and expiry; no GUI-thread sleep/domain blocking, host hide/resize, recurring capture, parallel timer authority or new persistent Focus WebView. The measured settling bound is a Narro reliability decision, not confirmed Blitzit motion. Verify capture ownership and resource lifetime; if own WebView pixels cannot be captured reliably, use WebView2 CapturePreview rather than display unrelated desktop content. Batch the source-evidenced Break gamepad correction with this native change. Required acceptance: exact-build normal/reduced two-DPI/bottom-edge capture, canonical comparison and idle CPU/memory.

Counters remain `3/10M || 3/5 | 14/19`. Separate M6/M9 work is preserved.
