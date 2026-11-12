# M7 Timer native four-corner snapping — scoped source implementation

**Date:** 2026-10-27. **Owner:** ChatGPT, independent Timer geometry feature, not the PR431/PR389/PR419 native physical-acceptance owners. **Base:** open PR431 head `6dce8daa27e386823abb704d31a8ffa2a7b004de` (CI40502071920 3/3 PASS only for the **unsnapped** original). **Work branch:** `feature/m7-timer-four-corner-snap-20261027`, created directly from that exact commit. **Feature status:** SOURCE IMPLEMENTED / AUTOMATED VALIDATION NOT YET RUN / NATIVE ACCEPTANCE NOT RUN. This log is immutable historical evidence for this implementation and may be supplemented by new logs after CI.

## Decision/ownership

User-approved behavior: free dragging everywhere, soft magnetic snapping in all four work-area corners near the Panel's established edge margin; otherwise no forced snap. This is not a new global window placement policy. Source analysis found the Focus Timer uses one native `focusSurface` HWND and existing `data-tauri-drag-region`; the logical 340×700 host uses a Win32 clipped visible region (340×110 compact; 340×300 expanded, DPI-scaled), while placement/session writes are owned by `floating_placement.rs`. Existing `WM_ENTERSIZEMOVE`/`WM_EXITSIZEMOVE` are already intercepted in `windows/topology.rs`. No React/CSS pointer loop, extra HWND, placement schema, preference, session/task mutation or motion compositor changes are necessary.

## Implemented change

- `src-tauri/src/windows/mod.rs`: pure `timer_corner_snap_position` uses the **visible** region, work-area offsets and symmetric inset; bounded corner-radius acceptance on **both axes**; safe coordinates on negative monitors, work-area-too-small no-snap, overflow/invalid dimension handling. Four direct Rust test groups cover four corners, compact/expanded, unsnapped edges/thresholds, negative origins/scaled inset, cramped/invalid/overflow geometry.
- `src-tauri/src/windows/topology.rs`: during `WM_MOVING` **only in Timer mode with an active native interactive move**, read actual clipped region with `GetWindowRgnBox`, select monitor from proposed *visible* bounds with `MonitorFromRect` and `GetMonitorInfoW`, obtain current window DPI, and modify the proposed RECT in place; no programmatic `SetWindowPos`, no asynchronous geometry loop, no persistence call while pointer is down. If native region, monitor, DPI or arithmetic cannot be confirmed, preserve ordinary Windows drag.
- `src-tauri/src/lib.rs`: expose the existing 16-DIP Panel inset within the crate as the single authority; snapping radius is twice that inset in physical pixels, not a second unrelated design token.
- `scripts/test-ui-floating-movability.mjs`: include native integration/region/DPI/corner-geometry contracts alongside the already existing anti-JS-drag and Focus HWND ownership guards.
- [Additive native acceptance](../docs/M7_TIMER_CORNER_SNAPPING_NATIVE_ACCEPTANCE_2026-10-27.md): eight distinct physical observations to batch with the existing M7 Windows session while retaining strict PR389/PR419 A/B holds separately.

## Affected surfaces and boundaries

Actual drag start→WM_MOVING→drag finish→session save, compact/expanded clipping, monitor work area/taskbar, DPI/negative virtual coordinates, topology and Escape-cancel; retained process-only default OFF and optional restart persistence ON. The new source does not rewrite `floating_placement.rs`, `timer_region.rs`, `FloatingTimerFoundation.tsx`, compositor, keyboard handling, settings, database or protected Create/Edit List icon/color/image features. Static code review cannot establish actual Win32 callback delivery, accessibility, physical cursor feel, complete motion, multi-monitor behavior or Blitzit parity. Original PR431 physical candidate is unchanged; this separate candidate requires its **own** exact-head CI and physical run before any merge. 

## Validation at the time of this source checkpoint

Four Rust geometry suites **ADDED, NOT RUN**. Existing `test:ui-floating-movability` source contract **EXTENDED, NOT RUN**. Local Node/Cargo checkout unavailable, so local frontend preflight, `rustfmt`, Rust unit/check/clippy and physical Windows testing are **NOT RUN**. No CI PASS claim made for this new feature. Existing PR431 candidate 3/3 PASS belongs exclusively to parent source and cannot validate the changed branch.

**One next operation:** open a clearly dependency-held draft PR, use CI on its own exact SHA, inspect first failed job/step/log and repair the same branch if needed. Keep PR431/PR389/PR419 unmerged native holds unchanged; add source+CI result receipt after actual evidence.
