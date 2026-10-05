# PR235 — one scoped drag/overlay correction batch

Exact source **d80978b8de54e280b191860fdf94905e447712c5**, [PR235](https://github.com/MariosGiannakaras/Narro/pull/235),13 source/test files **+323/-128**. [Full Windows CI952/run37257315398](https://github.com/MariosGiannakaras/Narro/actions/runs/37257315398) is running; no Windows/native PASS yet. Historical [CI950 whole evidence](evidence/m7-ci950-20261005/README.md) remains immutable. Current production process133416 is still paused/alive; OBS stopped.

## Evidence and scoped composition decision

CI950 confirmed-card-padding drag failed with both legacy input and verified SendInput, while explicit lane Move succeeded. Native handler/config corrections are present but do not establish working internal task movement. PR235 compares a materially different scoped input mechanism: Pointer Events and pointer capture, with an inert lifted preview and rendered lane/card hit testing. The existing persistence-first positional transaction, stable task identity, authoritative snapshots, keyboard moves and finite settle styling remain owners of product behavior. No framework or Focus-window composition change is involved.

The pointer session exists only during the gesture, begins after6px, updates the preview without a per-pixel React render, and cancels on Escape, pointer cancellation, blur, invalid/outside release, board invalidation and unmount. Edge-scroll frames exist only while an active gesture needs scrolling; listeners, capture, frames and preview are removed on completion. Interactive controls and scheduled/aggregate tasks remain excluded. Physical WebView2 lift/reflow/drop/settle is still open.

The actual unbroken PR233 title reproduces queue horizontal overflow **410px versus316px** in the production-component regression. Wrapping tooltip text corrects that failure while preserving the existing boundary/placement mechanism. Native queue/tooltip bounds remain open until exact-candidate retest.

The new rendered menu-occlusion assertion reproduced native failure at(776.594,267.359), hitting the disabled Schedule/Repeat button over the confirmation menu. Explicit z-order on the transformed action rail resolves the tested painting failure. This narrowly retains menu position, focus and card metadata; a portal remains an alternative only if the scoped correction fails actual acceptance. Native/source painting acceptance remains open.

## Validation achieved and limits

- Full frontend preflight/unit contracts/build PASS on unchanged final production code. Subsequent changes only refine the regression fixture's visible target placement and add keyboard coverage; final TypeScript PASS on exactd80978b8.
- Four final production-component/API regressions PASS: light/dark × normal/reduced motion, each at100%/125% CSS scale,1280×1080 viewport. Checks cover catalog delivery, last queue/menu/header access, actual long-title horizontal bounds, menu painting across an interior grid, retained metadata/geometry, destructive Cancel/Escape/failure/retry/exactly-once behavior and independent deletion identity.
- Pointer checks exercise cross-lane and positional same-lane movement, stable IDs/time, duplicate release, threshold, interactive/scheduled guards, Escape/pointercancel/blur/outside cancellation, invalidation/unmount cleanup and keyboard reorder after replacement. These use real rendered hit testing and production APIs with native IPC/storage mocked. They do not prove actual OS input, native drag, SQLite performance or physical DPI behavior.
- The light/reduced and dark/normal final images were directly inspected through Computer Use. The menu is unobscured in those rendered states. Whole native/source parity is not inferred.
- Build-generated tracked icons were restored; pre-existing untracked generated icons were preserved. No unrelated data or code was changed.

## Next exact-build physical matrix

Refresh current TODO/HANDOFF/crosswalk and the actual process/display inventory before inputs and after capture. Verify the CI952 artifact digest/EXE SHA256/source identity before launch. Ordinary version changes use targeted command/automation; a new C5 tray-Quit campaign is not implied or required by this unchanged Focus lifecycle.

|Milestone / affected gate|Planned exercise and adequate evidence|Preserved limit|
|---|---|---|
|M1|Both real monitors/scales and same Focus HWND during affected checks.|Unchanged936/942 topology/performance proofs; no new cable/sleep/quiet-performance claim.|
|M2 / M3|Read-only IDs/lane/order/session-time before/after pointer and metric edits.|Accepted writer/domain authority retained; do not count app downtime.|
|M4|Scheduled task excluded from manual drag; visible retained schedule metadata.|No new DST/recurrence acceptance inferred.|
|M5 /24/26/P3-03/04|Real confirmed-padding lift/reflow/drop/settle, initial/recreated Main,100%/125%,normal/reduced; cancel and keyboard alternatives. Retained menu opaque/unobscured with canonical VE00618s comparison.|HTML5 failure remains historical; no new PASS from fixture or configuration alone.|
|M6 /21/23|Long All queue and unbroken title, full keyboard last-row/menu access, tooltip/panel bounds and relevant canonical comparison.|Catalog22 already scoped PASS; whole Focus/entry parity remains open.|
|M7 /07/20/09/C4|Delayed Create feedback where sufficiently observable, actual reduced metric editing, affected Notes/title tooltip bounds and finite normal/reduced transitions on the same host.|C1–C3/C5 accepted; C4 open. A merely visible surface is insufficient.|
|M8|Already-implemented Preferences/shortcut acceptance where the same session actually exercises its requirements.|No unrelated M8 implementation or whole shortcut PASS.|
|M9|Reuse only if a relevant already-implemented report is actually exercised/compared.|Overview PDF and source acceptance stay open.|

Current **4/10M ||4/5 |14/19**. M10 hard entry remains blocked; optional M11 dormant. Tell the user explicitly when all required M1–M9 implementation/acceptance gates are complete before entering M10.
