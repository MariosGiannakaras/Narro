# M7 item 7 — compositor paint-barrier correction automated validation

Date: 2026-09-24
Agent/tool: ChatGPT / GitHub connector
Milestone/item: M7 item 7, Focus Panel <-> Floating Timer transition and collapsed/expanded resize
Result: **AUTOMATED PASS / PHYSICAL WINDOWS RE-TEST PENDING**

## Triggering physical evidence

The user manually re-tested the exact resulting-main CI #477 build after Computer Use could not capture valid visual evidence.

Observed results:

- Panel -> Timer: PASS.
- Timer -> Panel: functional PASS, with a remaining small flicker.
- Expand/Collapse: FAIL.
- Panel returned to the configured right side: PASS.
- No horizontal scrollbar at normal product-controlled geometry: PASS.
- Timer/session continuity: PASS.
- Overall smoothness was not accepted because transition artifacts remained.

The supplied screenshots showed stale/duplicated expanded action-strip pixels while the native Timer window was resizing and old expanded pixels surviving into collapsed geometry. The evidence points to transient WebView/compositor presentation around native resize, not to the established final `340 x 300` expanded geometry.

## Narrow correction

Branch: `m7-item7-compositor-paint-barrier`.

Final PR head:

`2db045ef82286d8364d77a3ba9654842b9a66eb3`

Final source tree:

`a8108fc403e94ab90dc9a85c2070b8852667109f`

PR #124 changed exactly nine files:

- `src/presentationFrame.ts`;
- `src/focus.tsx`;
- `src/FocusSurfaceTransition.tsx`;
- `src/focusSurfaceTransition.css`;
- `src/FloatingTimerFoundation.tsx`;
- `src/floatingTimerFoundation.css`;
- `scripts/test-ui-floating-collapsed.mjs`;
- `scripts/test-ui-floating-expanded.mjs`;
- `scripts/test-ui-focus-surface-transition.mjs`.

Behavioral change:

- after finite mode exit completes, the outgoing Focus root enters a settled hidden state before native Panel/Timer geometry;
- a shared finite two-`requestAnimationFrame` barrier gives that hidden state a compositor presentation opportunity before native geometry;
- Floating Timer resize adds an explicit hidden `resizing` phase after the finite exit;
- one hidden presented-frame barrier occurs before native resize;
- final expanded/collapsed hierarchy publishes while hidden, another finite presented-frame barrier occurs, then the existing entrance runs;
- reduced-motion tokens remain authoritative;
- no polling, timeout loop, continuous animation, high-frequency native geometry loop, third focus webview, renderer native-position authority, or timer/session/task/scheduling mutation was added.

## Validation

Connector-side deterministic source-contract review before PR: **PASS**.

Local checkout/npm/Rust preflight: **NOT RUN** in this environment.

PR CI #478 / run `35929521412`: **FAIL** at Repository Preflight only because `scripts/test-ui-floating-collapsed.mjs` still asserted the superseded inline single-rAF helper. Production code was not implicated. The stale contract was corrected in forward test-only commit `2db045ef82286d8364d77a3ba9654842b9a66eb3`.

PR #124 exact final head CI #479:

- run `35929764331`;
- job `107413269935`;
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10781122135`, digest `sha256:ddeeeb085aeea61a438d204d386c31dc0eb474567114914178d3ec0ebc5d5971`;
- runtime artifact `10781486137`, digest `sha256:e0ee9c832e1a770e10460b4b85f9815b406759ebf34ed0194bbdf89c008832c1`.

PR review state: nine expected changed files; no PR comments, reviews or unresolved review threads.

Squash merge:

`6f99e9b1869b927e5a792cc569b6c8131859c7d8`

The merge tree is `a8108fc403e94ab90dc9a85c2070b8852667109f`, byte-identical to the exact validated PR-head tree.

Resulting-main CI #480:

- run `35931208957`;
- job `107417960065`;
- Repository Preflight: PASS;
- Windows visual regression: PASS;
- Tauri Release: PASS;
- visual artifact `10781109686`, digest `sha256:9d81fc5ce5c6041797a8f8754cb501fe91599c71a6f76411028ceed05eda752f`;
- runtime artifact `10781866423`, digest `sha256:2c203f4c5cc62a645781fdb4ad341527bed6d60f8d0cb3b3cec2139be37c9f29`.

## Tracking and continuation

M7 item 7 remains open. Progress remains `6/10M || 4/5 | 6/14` because automated validation cannot prove transient real-desktop compositor behavior.

Use the exact resulting-main CI #480 runtime artifact `10781866423` for physical Windows re-test. Full PASS requires both mode directions and expand/collapse to be visually smooth without stale/duplicated pixels or the small return flicker, while right-side return, normal-size overflow behavior and timer/session continuity remain correct. Do not start M7 item 8 until that physical gate passes.
