# M7 Focus transition corrective re-test — partial physical FAIL

Date: 2026-09-23
Milestone: 7 — Floating Timer mode
Item: 7/14
State: PARTIAL PHYSICAL PASS / MOTION CORRECTIVE SLICE REQUIRED

## Exact build tested

Source SHA:

`91a28ba7c5389130b6edb45deabe62a9e01f9d08`

Resulting-main Windows CI #472:

- run `35887924927`;
- job `107272742116`;
- runtime artifact `10763339801`;
- digest `sha256:2a763e673486fa60fd87b2af358846db1a5a00e7d7c9b7658ef3cb3301239c94`.

## Physical observations

- Left/staging flicker: **PASS**. The prior opposite-edge flash is no longer visible.
- Position: **PASS**. Focus Panel returns directly to the configured right-side position.
- Horizontal scrollbar: **PASS at normal product-controlled sizes**. Manual host-window resizing can expose scrollbars; that is outside the ordinary fixed native Panel/Timer geometry path.
- Session: **PASS**. Timer/session continues correctly through mode and presentation switches.
- Expand/Collapse: **FAIL**.
- Overall Transition UX: **FAIL**. A very small flicker/instantaneous swap remains when restoring Panel; user notes the source product appears to use a short smooth animation.

## Screenshot interpretation

The final expanded Timer shown in the physical screenshots uses the established 340x300 viewport with action strip and subtask area. Repository evidence already validates that size. The empty vertical region when there are no subtasks is therefore not independently treated as a geometry bug in this slice.

The remaining evidence-backed problem is motion sequencing.

## Engineering implication

Current source performs:
- native mode transition before renderer mode publication, followed only by entrance motion;
- collapsed/expanded resize with an opacity cut while the native window changes size.

The next narrow correction is:
- finite 150ms content exit before native Panel/Timer mode swap, then existing entrance;
- finite inline exit before native collapsed/expanded resize, final hierarchy commit while hidden, then inline entrance;
- reduced motion remains 1ms with zero displacement;
- no high-frequency JS native window geometry loop, polling, timer/session authority or new webview.

Item 7 remains M7 **6/14** and slice **4/5** until the new candidate passes automated and physical Windows validation.
