# M7 programmatic hardening — Windows CI #693

Date: 2026-09-30

## Trigger and evidence boundary

The user no longer has access to the Windows system used for the physical M7 Gate 7 / Gate 12 recording, so the previously requested supplemental physical batch cannot currently be produced.

This does **not** convert missing physical evidence into a physical PASS. The last direct physical evidence remains CI #684 recording `2026-09-30 02-02-23.mp4` (SHA-256 `72360756a44ab94ac95aaf245beeadf1069fc91385268b68853bb17f570fd412`), which cleared both previously observed #679 defect signatures but did not contain every repetition/direction required by the strict protocol.

The purpose of this slice was therefore to inspect M7 programmatically and logically, compare the transition/DPI implementation with current Windows WebView2/Tauri guidance, harden evidence-backed weak points, and obtain authoritative exact-head Windows CI.

## Architecture verdict

No radical architecture replacement is justified by the current evidence.

The retained design remains:
- exactly `main` + one persistent `focusSurface` HWND/WebView;
- Panel, compact Timer and expanded Timer are presentations inside that one Focus WebView;
- nominal fixed host 340×700 logical px;
- native DPI-aware visible regions 340×700 / 340×110 / 340×300;
- one React `FocusSurfaceCoordinator`;
- one authoritative Rust timer/session projection;
- serialized rollback-safe native presentation transactions;
- no production `floatingTimer` WebView and no `timer.html`.

The separate persistent Timer WebView experiment in closed PR #191 remains rejected historical evidence: it reduced earlier resize artifacts but still produced overlap and materially increased floating-only memory. Nothing in the #684 physical capture or current code review supports reviving it.

## Engineering research finding

The remaining implementation-level weakness was not the one-WebView architecture itself. It was that Narro moved the parent Focus HWND programmatically in several paths without explicitly informing WebView2 that the parent/ancestor position had changed.

Microsoft WebView2 exposes `CoreWebView2Controller.NotifyParentWindowPositionChanged` specifically for this parent/ancestor movement case. WebView2 also treats rasterization scale as the monitor-DPI-dependent raw-pixel scale for the WebView. Tauri 2 exposes the native controller through `WebviewWindow::with_webview`, and documents that code using this lower-level native handle should pin the Tauri version sufficiently tightly because the platform webview types can change across Tauri releases.

The existing #684 bounded 50 ms cross-DPI clipped-settle guard is retained. It already has clean physical evidence and protects against exposing the full Panel while WebView2 completes a target-monitor viewport update. Removing it without new physical evidence would be speculative.

## Implemented hardening

Exact PR: #192, branch `plan/m7-single-focus`.

Final exact source head for this slice:
`22e86c5788416ebbdf249c123baf549b1820b10b`

Changes:
1. Added `src-tauri/src/focus_webview.rs` with one shared `set_physical_position` helper.
   - Moves the persistent Focus parent HWND.
   - On Windows, immediately schedules a native WebView2 `NotifyParentWindowPositionChanged()` through Tauri `with_webview`.
   - Notification failure is diagnostic and does not falsely roll back a parent move that Windows already completed.
2. Routed the central `lib.rs` Focus position helper through this WebView2-aware path.
3. Routed Focus native rollback position through the same path.
4. Routed all programmatic Timer placement and display-recovery rollback moves in `floating_placement.rs` through the same helper.
5. Confirmed there are no remaining direct `.set_position(...)` calls in the M7 `lib.rs` / `floating_placement.rs` programmatic movement paths.
6. Pinned Tauri to `~2.11.5` because M7 now intentionally uses the lower-level native `with_webview` controller API.
7. Strengthened static architecture/transition contracts so future changes must preserve parent-move notification and the Tauri minor pin.
8. Added transition failure coverage for:
   - animated native failure rollback;
   - renderer commit failure after successful animated native work;
   - 250 repeated Panel↔Timer transitions with alternating compact/expanded Timer targets and deterministic commit ordering.
9. Preserved:
   - the #684 pre-clip before Panel→Timer movement;
   - interactive/programmatic display-recovery suspension;
   - the bounded 50 ms clipped cross-DPI Panel reveal guard;
   - saved Timer placement;
   - session/time authority and continuity;
   - transparent Focus document canvas;
   - no hide/show/create/destroy/ordinary-resize mode-switch mechanism.

## CI evidence

### CI #691 — non-behavioral formatting failure

Run `36677796375`, head `2bfe662afac4b2bdf61c974fb81074222790a485`.

- frontend/M7 contracts passed;
- the new 250-cycle transition stress test passed;
- failure was only `cargo fmt --check` requesting the new helper signature in rustfmt form.

No behavioral defect was identified.

### CI #692 — compile-shape failure

Run `36678058481`, head `c3a509278cf0946648413f612e64473d658a1702`.

- formatting passed;
- frontend/M7 contracts passed;
- `cargo check` found two type mismatches in display-recovery rollback calls: owned `WebviewWindow` values were passed where the helper requires `&WebviewWindow`.
- both calls were corrected by borrowing the existing window value.

No runtime/behavioral defect was identified.

### CI #693 — authoritative exact-head PASS

Run `36678327585`, exact head
`22e86c5788416ebbdf249c123baf549b1820b10b`.

PASS:
- validation gate;
- Repository Preflight;
- frontend contracts and production build;
- Rust fmt;
- Rust check;
- Rust clippy;
- Rust tests;
- performance harness;
- Windows visual regression;
- reused frontend-dist verification;
- Tauri release build;
- required artifact uploads.

Artifacts:
- runtime: `narro-m1-runtime-harness-windows-x64`
  - id `11080808573`
  - size 13,719,246 bytes
  - digest `sha256:ff04c3fbaf66a95c00d486ea08d66ff7f21fc8fabf27c980d9b7ebce3eb30b3c`
- visual: `narro-m5-visual-regression`
  - id `11081246096`
  - size 3,095,811 bytes
  - digest `sha256:871dc6a5ccf186e7a7ee069ede1fc76c2d23ec0d3e5a94249164174e805317d7`

## Current M7 confidence boundary

There is currently **no known M7 defect reproduced by the latest physical evidence**:
- the #679 full-height transparent host tail is absent in #684;
- the #679 stale cross-DPI viewport/browser-scrollbar flash is absent in #684;
- #684 preserved correct 125% compact/expanded geometry and the same task/session/time;
- #693 adds explicit WebView2 parent-move synchronization and passes the complete automated Windows pipeline.

However, CI #693 has not itself been physically recorded. Therefore:
- Gate 7 is not labeled physical PASS;
- Gate 12 is not labeled physical PASS;
- the strict supplemental cycle-count/direction protocol remains unavailable rather than failed;
- no roadmap/milestone completion counter advances from this evidence alone;
- PR #192 remains open and must not be described as merged or physically accepted.

## Exact continuation action

No further source change is justified without new evidence.

If a Windows physical environment becomes available again, the minimum remaining evidence is a short exact-current-build batch covering the missing strict repetitions/direction. Until then, preserve PR #192 at its automated-green source, do not revive the split-window architecture, and do not invent a physical PASS.

If a future physical recording reproduces a viewport/DPI artifact despite the explicit parent-position notification, the next escalation should investigate direct WebView2 DPI/rasterization synchronization or a renderer/native readiness acknowledgement. It should not automatically reintroduce a second Timer WebView.
