# M7 Focus surface transition corrective candidate — automated validation

Date: 2026-09-23
Milestone: 7 — Floating Timer mode
Item: 7/14
State: CORRECTIVE SOURCE AUTOMATED-VALIDATED / PHYSICAL RE-TEST PENDING

## Triggering physical evidence

The first item-7 candidate, exact source `c6f28fcfede74c02afff875b6322e4743ed01549`, passed automated CI but physically failed on Windows:

- Timer -> Panel flicker: FAIL;
- final configured right-side Panel position: PASS;
- session/timer continuity: PASS;
- transition UX: FAIL;
- screenshots showed horizontal focus-surface scrollbars;
- expanded Timer showed a visible enlarged compact/intermediate state before final expanded content.

Blitzit evidence supports Panel -> Floating Timer and a separate collapsed <-> expanded action, not a required third intermediate presentation.

## Corrective implementation

PR #122 changed only the evidence-backed transition/overflow boundaries:

- native target-monitor DPI staging now uses the configured Panel edge rather than raw work-area origin;
- final Panel placement is still recalculated after native Panel resize from physical outer size;
- focus-surface transition suppresses horizontal overflow while preserving Panel vertical scrolling;
- Timer transition is isolated from document scrolling;
- collapsed/expanded resize is paint-gated: current presentation hidden, native resize performed, final React hierarchy published, then revealed;
- exactly one finite rAF paint-boundary helper is permitted; no rAF loop, polling clock, renderer native-position ownership, new webview or timer/session/task/scheduling authority was introduced.

## Failed intermediate CI evidence

Windows CI #470 / run `35884992614` on previous head `3f66457a0f7164ecbb0d16601a2ee8408394ee92` failed Repository Preflight only because the existing collapsed deterministic test still prohibited all `requestAnimationFrame` use.

The test was corrected to allow exactly one finite `nextPaint()` helper while continuing to prohibit renderer clock/loop ownership. No production source change was required for that failure.

## Exact PR validation

Final PR head:

`b5d65917ea75f50ab351b20fe750c56366923ae6`

Windows CI #471 / run `35885188470` / job `107263411613`: PASS.

- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10761689991`, digest `sha256:442ad79b52565c9481379987b66dc81a996a794ffd40dfed95bf380283fa8b2c`;
- runtime artifact `10763131609`, digest `sha256:6a06cc70202189f620ee30ada78afa4769ba04befa3509e7e8e0da657535af84`.

Final review: exact head unchanged, seven expected files, no PR discussion comments/reviews, mergeable clean.

Expected-head guarded squash merge:

`91a28ba7c5389130b6edb45deabe62a9e01f9d08`

Tree:

`e4ecb48ab3ca84915d4d7972e83f7bfd5ed5ad78`

## Resulting-main validation

Windows CI #472 / run `35887924927` / job `107272742116`: PASS on exact main source SHA `91a28ba7c5389130b6edb45deabe62a9e01f9d08`.

- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10763618553`, digest `sha256:8f25127a7b924fbada100d85826ae553a9e92f755554e6a6f20c985b32b16710`;
- runtime artifact `10763339801`, digest `sha256:2a763e673486fa60fd87b2af358846db1a5a00e7d7c9b7658ef3cb3301239c94`.

## Remaining boundary

Item 7 remains open at M7 **6/14** and slice **4/5**.

Automated Windows CI cannot prove absence of transient real-desktop flicker, browser/window scrollbars in the native WebView2 presentation, or the absence of a one-frame expand/collapse intermediate presentation.

Physical re-test of exact CI #472 runtime artifact is required before item 7 can be marked complete or item 8 can start.
