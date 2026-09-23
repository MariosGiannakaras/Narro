# M7 Focus surface transition — automated validation complete

Date: 2026-09-23
Milestone: 7 — Floating Timer mode
Item: 7/14
State: IMPLEMENTED / AUTOMATED-VALIDATED / PHYSICAL WINDOWS OBSERVATION PENDING

## Problem evidence

Earlier physical Windows validation showed that returning from Floating Timer to a right-side Focus Panel could briefly flash the Panel at the left/work-area staging position before it settled at the correct right-side final position.

Automated CI cannot prove the absence of this transient desktop flash.

## Implemented correction

PR #121 `M7: fix Focus surface transition flicker` keeps native/Rust as geometry authority and changes transition ordering narrowly:

- hides a currently visible `focusSurface` before activating mode geometry changes;
- keeps target-monitor DPI staging hidden;
- applies Panel geometry and final edge placement before show/focus/mode publication;
- best-effort restores the previous visible Panel position if hidden staging fails;
- adds a keyed one-shot renderer content entrance using the existing finite 150ms opacity/transform motion primitive;
- inherits the existing reduced-motion 1ms/zero-displacement contract.

No third webview, timer/session/task/scheduling mutation change, persistence work, shortcut work, polling, keyframe loop or high-frequency JS native-window geometry animation was introduced.

## PR validation

Exact PR head:

`f53efc250b20149aee920e9831e21173ffd618eb`

Windows CI #468:

- run `35871031356`;
- job `107214857096`;
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10754608474`, digest `sha256:6d4df7b273cadbf916b4fdb5e972673f27e8199231c4df694619efe285639b20`;
- runtime artifact `10755089049`, digest `sha256:730c6eaa28ac8c4da5e7714474fccb11a25ec358629a830ecc17874962d0225e`.

Final review: exact head unchanged, six expected files, no PR discussion comments/reviews, mergeable clean.

Expected-head guarded squash merge:

`c6f28fcfede74c02afff875b6322e4743ed01549`

Tree:

`06f56b2bb2e16a111900b8c1209460a03b897145`

## Resulting-main validation

Windows CI #469:

- run `35878281929`;
- job `107239838245`;
- exact main source SHA `c6f28fcfede74c02afff875b6322e4743ed01549`;
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10760500725`, digest `sha256:fb14171a4d5fe3b001c553a21a81068851af9f8e5e22603bb6746ff145b3e040`;
- runtime artifact `10760351396`, digest `sha256:a2a8a43ae013e9897f376d6f85535945cf54673656662def7f27f48e1f9614f0`.

## Remaining validation boundary

Item 7 remains open. The exact resulting-main runtime build must be physically observed on Windows.

PASS requires the Timer -> Panel transition to show no visible left/staging-position flash and to appear directly at the correct final Panel position. Mode switching must retain the existing session without reset/duplication/switching.

Until that physical observation is PASS:

- M7 remains 6/14;
- item-7 slice remains 4/5;
- item 8 must not start.
