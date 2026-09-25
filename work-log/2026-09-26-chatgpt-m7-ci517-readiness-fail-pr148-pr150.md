# M7 CI #517 physical readiness failure and PR #148/#150 correction — 2026-09-26

## Scope

This immutable entry records the user-provided CI #517 60 fps physical evidence, the split Panel/Timer readiness corrections, exact-head/resulting-main Windows CI, and the next physical validation action. M7 item 7 remains open.

## Physical evidence

The CI #517 build already contained the native transparent prewarm from PR #147. The new recording shows that the earlier blank white native-host flash is no longer the dominant failure, but target renderer projections can still be revealed before they are authoritative-ready.

Observed frame-precise staging:
- Panel→Timer around ~4.55s: one visible Timer state says `No active focus task` even though the outgoing Panel already shows live task `fas`; around ~4.60s the Timer updates to `fas`.
- Timer→Panel around ~20.25s: the target says `Loading Focus Panel…`; around ~20.30s the real settled Panel is visible.

Scoped result for CI #517 item-7 continuous visual criterion: **FAIL**.

## Diagnosis

The native host is now prewarmed correctly. The remaining race is renderer-level projection settlement. React can synchronously mount the target hierarchy and WebView2 can paint it, yet the hierarchy may still contain intentionally temporary loading/empty projection content. Therefore final reveal must be gated on the target projection's own authoritative readiness, not only DOM mount/compositor readiness.

## PR #148 — Panel readiness

PR #148 exact head:
`d63d1f3ce49e77ceae99d7ce1c8e95d19e1aed42`

Windows CI #518: **PASS**.

Merged main:
`d462a85ba1fb91c1dfd1df09baa6cf33fb48dc86`

Resulting-main Windows CI #519: **PASS**.

The correction is Panel-only:
- FocusPanel tracks the currently requested board target;
- it reports readiness after that board snapshot settles and the live timer projection settles;
- the shared coordinator waits for Panel readiness before the final presented-frame barrier/reveal;
- no native geometry or prewarm semantics changed.

## PR #150 — Timer readiness

An overlapping broad branch/PR #149 was closed after #148 merged. A new narrow branch was created on validated #148 main.

PR #150 exact head:
`a4dd2839a84fc4cd69c2d7ed55beb224cc6d811f`

Tree:
`e90ad9af52f4f37fbda976b8839f8a69ab2f17c8`

Windows CI #520 / run `36197064882`: **PASS** on the exact PR head. Repository Preflight, visual regression, Tauri Release and required artifact uploads all succeeded.
- runtime artifact `10891141458`, digest `sha256:56589fbb9d0ad8be9b1346d0334b10c21932d7edf34b07a4d6a09f17adf95ad7`;
- visual artifact `10891300127`, digest `sha256:bfd98afd0b887a76bb298d59cfb2201fefb092092f191367e34c4a92b2fd52bc`.

Merged resulting-main source:
`445aa37b9b8441c9351d5dd87ff353690b3050c2`

Its tree is the same `e90ad9af52f4f37fbda976b8839f8a69ab2f17c8` as the exact PR head.

Resulting-main Windows CI #521 / run `36198699903`: **PASS**.
- runtime artifact `10890859242`, digest `sha256:88ffd7a3e838ec4199cfa8ac933d2451f785c530c564670f5d7fdbd4bdf674d4`;
- visual artifact `10890679899`, digest `sha256:b8cce0c7944d9a2e96208ad2a680ee93dfdb550dfa11dca5b6d0a20bd0d3a03f`.

PR #150 adds only Timer target readiness:
- timer projection must settle;
- if a live task exists, the matching board snapshot must settle before readiness;
- explicit board error state also settles readiness rather than hanging the transition forever;
- final reveal remains governed by the existing shared coordinator and transparent native prewarm.

No fixed delay, polling, extra webview, geometry rewrite, renderer timer/session authority or persistence change was added.

## Physical status

The new combined #148 + #150 source at CI #521 has **not yet been physically retested**.

Exact next action:
1. use CI #521 runtime artifact `10890859242`;
2. record Panel→Timer→Panel at 60 fps with normal Windows animations;
3. repeat with actual Windows animations Off and restore the OS setting;
4. inspect for any `No active focus task`, `Loading Focus Panel…`, blank/pale/staging frame or abrupt flicker;
5. include expand/collapse and session-continuity observation in the same short capture if practical.

M8 remains blocked until M7 acceptance is complete.
