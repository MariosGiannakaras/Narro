# M7 Floating Timer four-corner snapping — additive native acceptance

**Status:** NOT RUN. Owner: independent M7 Timer snapping implementation; base source PR431 exact `6dce8daa27e386823abb704d31a8ffa2a7b004de`. This packet is additive to, not a replacement for, [PR431 scoped physical cases](PR431_SCOPED_NATIVE_ACCEPTANCE_2026-10-27.md), compositor PR389/PR419 strict 8/8 holds, and the existing M7 acceptance matrix. Record actual candidate SHA, executable SHA256, PID, OS/work-area bounds, monitor DPI and exact input path before scoring. Reuse unchanged accepted evidence, but never upgrade old binary results to the new candidate.

## Behavior

A genuine native `WM_MOVING` event on the one `focusSurface` HWND in Timer mode snaps the **visible** Timer rectangle, not the full 340×700 logical HWND, to the nearest of four work-area corners when **both axes** are within a radius of **2 × the existing 16-DIP Panel margin**, scaled by the current window DPI. All four corner anchors use the same 16-DIP inset as the Panel, reduced symmetrically if the work area is too small. Away from corners, native drag stays unrestricted. The work area excludes the Windows taskbar. Snap does not occur in Panel mode, through JS pointer loops, while simply opening/resizing the Timer, or if Win32 cannot supply a reliable monitor/DPI/window region; those failures preserve ordinary native drag.

No new persistence setting: a completed snapped drag follows existing current-session placement and the existing default-OFF opt-in cross-restart setting. Escape-cancel and transient topology recovery must not synthesize a saved user drag.

## Combined M7 physical cases (all OPEN / NOT RUN)

| Case | Physical action and independent expected observation |
| --- | --- |
| SNAP-01 | Compact Timer native drag near top-left and top-right of a normal work area; it moves to the measured Panel-equivalent top and side inset, not screen zero |
| SNAP-02 | Compact Timer drag near bottom-left and bottom-right; visible 110-DIP bottom (not 700-DIP host) ends inset above work-area/taskbar boundary; all controls remain visible |
| SNAP-03 | Drag/release in center and alongside left/right/top edges but away from any corner; position stays where released; no forced edge or center snap |
| SNAP-04 | Native drag across the radius boundary (inside/outside), retry same corner, and Escape-cancel; no oscillation, stuck pointer, phantom completion or changed saved location after a genuinely canceled move |
| SNAP-05 | Expand Timer near each bottom corner (300-DIP clipped region), contract again, return to Panel/Timer; no clipping, host resize/position regression, drag-only persistence or unsolicited reposition |
| SNAP-06 | Secondary monitor with non-zero/negative virtual coordinates and different DPI (including 125% if present); inset and radius scale in physical pixels, selecting the visible-region monitor without a jump/scrollbars |
| SNAP-07 | Different taskbar edges, reduced-height work area or work-area change without invasive OS changes; boundary remains safe, snapping degrades without overflow if room insufficient; use already available environment evidence if possible |
| SNAP-08 | One real completed snapped drag, switch Panel/Timer and restart: retained in-process; after Quit/relaunch preference OFF starts by Panel monitor/side/inset, ON restores opted-in location; no legacy deletion or new DB state |

For each, capture native pointer move/release including intermediate frames and final visible bounds. Grade separately **PASS / FAIL / INCONCLUSIVE / NOT RUN**, with exact evidence; keyboard hit targets/always-on-top and native compositor strict A/B tests remain independently OPEN unless valid evidence addresses those exact claims. No personal AppData/OS settings modification is implied by this packet.
