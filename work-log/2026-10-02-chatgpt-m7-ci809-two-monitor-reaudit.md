# M7 CI #809 two-monitor physical re-audit — corrected evidence map

Date: 2026-10-02

## Why this entry exists

This immutable entry supersedes the **interpretation** in
`work-log/2026-10-01-chatgpt-m7-ci809-partial-physical-audit.md`.

The earlier audit treated the 4480×1080 recording too much like one surface and
used an incorrect 50/50 monitor split. The user clarified, and the pixels
confirm, that the recording is one synchronized desktop canvas containing two
monitors. The actual horizontal layout is 1920 px + 2560 px.

The earlier work log remains immutable evidence of the first interpretation; it
is not overwritten.

## Evidence

User recording:
- file: `2026-10-01 19-03-32.mp4`
- SHA-256: `2da82409caa7b1dc4ad74f1d188ae230d5bd8566f6939f388fb4abe7058096a6`
- duration: 161.05 s
- frame size: 4480×1080
- capture character: both monitors are recorded simultaneously in one frame

Test context is the supplied CI #809 production physical candidate:
- artifact id `11163439039`
- artifact ZIP digest `sha256:39ca0a91d7aa54be79ca35c509f82f25049a15a3fc4ffff199699eab309557a5`
- expected standalone EXE SHA-256 `a4b8e163539f429769540480a7aa0b5db9ca6fa2c356d6742f78d687b5cb5675`
- source `2767b3827670603d1ab259b6a843c2e0da82d85d`

The recording itself does not display `Get-FileHash`; exact executable identity
therefore comes from the operator/test context, not from a pixel-readable hash.

## Corrected event map

### C4 — corrected Timer compositor boundary: PHYSICAL PASS

At least six animations-On compact ↔ expanded sequences were inspected with
dense transition sampling, approximately:
- 13.6–15.0 s
- 15.8–17.7 s
- 19.1–21.3 s
- 21.9–23.4 s
- 25.1–28.7 s
- 33.3–35.0 s

The CI #806 expanded→compact white L/outline / blank-region failure does not
recur. Populated Timer content remains painted through the native-region swaps.
No blank, pale, loading, stale, duplicate, clipped or partially painted Timer
frame was found at the corrected boundary. Settled compact/expanded endpoints
show no document scrollbar.

PR #208's exact corrected behavior is therefore physically accepted.

### C4 — Blitz now → Focus Panel: PHYSICAL PASS

Around 5.2–5.4 s the Main-window `Blitz now` button is visibly activated. Its
copy changes to `Starting Blitz...`, then Main reports the active Blitz state,
and the existing Focus surface presents the Focus Panel at the right edge.

This closes B5 physical semantics. The recording does not show a new competing
Focus window.

### C4 — active continuity and projection reconciliation: PHYSICAL PASS

Across Panel, compact Timer and expanded Timer presentations:
- the active task/session identity remains coherent;
- live time remains coherent;
- expanded Timer retains task/title/time;
- no document/root scrollbar is observed.

Later, task completion is reflected by Focus reaching `All Clear` while Main
shows the completed task in Done. This is real simultaneous cross-window
projection reconciliation and closes the physical observation behind
M7-PHYS-05 and M7-PHYS-06.

### C5 — mixed-DPI crossing: PHYSICAL PASS

The two monitors are not equal halves of the 4480 px canvas:
- left monitor: 1920 px wide;
- right monitor: 2560 px wide.

Around 116–122 s the compact Timer is physically dragged from the left display
to the right display. On the left it measures approximately 425 physical px
wide; on the right it settles at approximately 340 physical px. That 1.25 ratio
matches the fixed 340 logical-px Timer crossing 125% → 100%.

Around 133.5–134.4 s Windows Display settings visibly show the selected
2560×1080 display at `100% (Recommended)` with `Extend these displays`.

The Timer remains correctly scaled and usable before, during and after the
cross-monitor move. This closes the physical mixed-DPI finding M7-PHYS-02.

### C5 — edge/taskbar constrained placement: PHYSICAL PASS

Around 106.5–112 s the Timer is exercised near the lower work-area edge/taskbar.
The expanded presentation remains inside the usable work area, controls stay
visible, and the collapse/return remains usable without browser scrollbars or
clipping.

### C5 — topology/display-removal recovery: PHYSICAL PASS for the required hotplug/recovery behavior

Around 133.5 s Display settings show the extended two-display configuration.
Around 136.5–139.5 s Windows performs a real display-topology change; the left
portion of the combined capture becomes unavailable/black while the surviving
display remains active. Display settings subsequently show a single-display
configuration (`Show only on 1`).

By approximately 142 s the Narro Focus surface/Timer is safely visible and usable
on the surviving display. It is not stranded off-screen and Narro is not
restarted to recover.

The residual checklist described reconnect as `if practical`; the authoritative
`docs/M7_CLOSURE_PLAN.md` requires topology/hotplug recovery rather than a
specific remove-then-reconnect choreography. The observed real removal/recovery
therefore satisfies that platform behavior.

### C5 — topmost over maximized application: PHYSICAL PASS

Around 116–121 s a maximized Notepad++ window occupies the left display while
the compact Timer remains visibly above it during the cross-monitor movement.

The residual checklist explicitly allows a maximized **or** borderless-fullscreen
application. This satisfies the topmost observation.

### Windows animations

The recording visibly changes Windows `Show animations in Windows` from On to
Off around 101–103 s and restores it to On around 130–132 s. Timer operations
are exercised while animations are disabled.

The residual operational checklist requested two complete Off
compact→expanded→compact stress cycles, but `docs/M7_CLOSURE_PLAN.md` is the
authoritative closure controller and does not define that count as an
independent C4 checkpoint. The already accepted standard-motion compositor
boundary plus the observed reduced-motion/Off behavior are retained as evidence;
no extra Off-cycle count is invented as a milestone blocker.

## Evidence that is supportive but not pixel-conclusive

### Single-instance ownership

At the beginning of the recording the CI809 Narro desktop launcher is activated
and only one Narro application entry is seen in later Alt-Tab views; no duplicate
Narro UI or shortcut-conflict card is observed.

PR #206's already-validated runtime boundary also registers
`tauri_plugin_single_instance` before setup and routes a secondary launch to
`request_show_or_recreate_main` without initializing a second persistence,
timer, background-service or shortcut authority.

However, the recording does not show Task Manager process count and does not
visibly establish that a primary Narro process was already alive immediately
before the launcher activation. Therefore the pixels alone do not prove the
second-launch condition. M7-PHYS-04 remains the only C4 ownership observation
that is not independently pixel-conclusive.

### Idle Ctrl+Shift+T / Ctrl+Shift+P no-op

The task is completed, Focus reaches `All Clear`, and the remainder of the
recording does not surface a placeholder/stale Timer. B6 is already
automated-validated and the observed idle outcome is consistent with the fix.

The two global keypress identities are not rendered on screen and no key marker
was inserted, so the video cannot independently prove which shortcuts were
pressed. This remains a narrow operator-input evidence gap rather than a product
failure.

### Drag/save/restart placement

The recording contains extensive live Timer dragging, cross-monitor placement,
edge placement and topology recovery, but it does not contain an unambiguous
normal tray Quit followed by same-build relaunch and saved-position recovery.

This remains the only clearly missing C5 choreography from the current
replacement-host physical matrix.

## Result

No new product/runtime defect is found.

Physically accepted from this recording:
- PR #208 corrected compositor boundary;
- repeated presentation continuity;
- task/session/time continuity;
- no document scrollbar;
- Blitz now → Panel;
- expanded Timer title/time;
- Main/Focus completion reconciliation;
- 125%↔100% mixed-DPI crossing;
- lower-edge/taskbar constrained expansion;
- real display-removal/topology recovery;
- topmost over a maximized application.

Still not independently pixel-conclusive:
- second-launch single-instance ownership;
- identities of the two idle global-shortcut inputs;
- drag → tray Quit → relaunch → saved-placement recovery.

C4/C5 are therefore **not closed yet** from pixels alone. No source corrective PR
is justified.

Counters remain:
`4/10M || 2/5 | 11/19`
