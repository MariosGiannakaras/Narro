# 2026-10-10 — B49 Edge focus reveal: real failure diagnosis, CSS fallback, bounded visual settlement

## Accepted baseline (do not overcount)

Pre-Codex ChatGPT coding campaign **6/8** accepted, I01–I06 exact-head full green and guarded merged; #280 B67 merge `c1633c9edb372228ad597fde686575b58b8437fb`. Remaining I07 B49 and I08 B63 are jointly implemented on **existing PR #301** (`implementation/m6-b63-inline-focus-success-20261009`), still **not accepted**. Codex physical validation pending; source comparison M11 dormant.

## Exact failure evidence

- #301 source head `c7ff3795ab69ebff79a1d5311dbf757dc18a16d3`, Windows CI `38028676924`: validation+fast SUCCESS, Windows failed in `Capture Visual Regression Fixtures` for `focus-panel-live-actions-focus-light`. Uploaded complete failure diagnostic ZIP artifact `11661083388`; light capture showed real Pause pill and active-card region. The dark HTML pass and screenshot varied, so generic capture failure did not establish missing semantics.
- #301 fixture-diagnostic head `657920b2df19d53d536c6e5d5270ba140d403b6f`, Windows CI `38029857004`: validation+fast SUCCESS, Windows failed SAME B49 capture, but newly precise error: `action-rail-opacity=0, heading-opacity=1` while all OTHER strict conditions passed (focus ownership, label visible, card/rail geometry within 1px). Upload `narro-visual-regression-failure-diagnostics` artifact `11661354700` from that run. Downloaded actual artifact and inspected both light/dark HTML and PNG: in light failed HTML, active Paused button is present and focused action expectation ran, screenshot subsequently visibly shows **icon+Pause pill overlay** with header hidden, while dark HTML pass flag was present and dark screenshot presented ordinary heading. This is inconsistent style/paint timing and/or Edge dynamic `:has` invalidation, not a proven missing product action, and it is unacceptable to simply delete visual assertions.
- Strict original user-visible intent: action rail appears on pointer hover **and** focus, replacing heading without geometry reflow; icon/pill accessible, keyboard support, reduced-motion, all five real B50 action slots preserved.

## Narrow corrective work on the SAME existing #301 branch

Final current head **`77748f99e99a46d427dac8f9ba3178ec842faf55`**; started new CI run **`38033418891`** (queued at checkpoint, not PASS). Changed exactly three files:
1. `src/focusPanel.css`: retained evidenced `:has(...:focus-within)` and hover selectors, added native ancestor `.focus-panel__live-card:focus-within` fallback in both heading fade and action-rail reveal. This avoids relying only on dynamic `:has` reevaluation in Edge. No change to B50 actions/semantics or approved design.
2. `src/focusPanelVisualFixture.tsx`: replaced one unconditional 300ms arbitrary capture delay with bounded **1500ms** condition-based style settlement. It still requires computed rail opacity exactly `1`, heading opacity exactly `0`, real focused action, visible pill, no card/rail movement over 1px; old detailed assertions remain.
3. `scripts/test-ui-focus-action-slots.mjs`: fast preflight guard requires direct keyboard fallback and bounded visual-settlement fixture; fixed declaration order of `focusedFixture` before use (avoid false fast-gate TDZ). This is test hardening, **not loosening**.

Need review new exact-head fast/Windows jobs. If failure persists, inspect named error + artifact, fix only true first cause. Once three SUCCESS, verify latest exact PR head and unchanged source overlay, guarded squash merge PR301. Because one PR carries both B49 and B63, increment X from 6/8 to **8/8 only after that single validated guarded merge**. Then reconcile TODO/HANDOFF/STATUS and hand Codex the latest Windows candidate with native gates explicitly NOT RUN. Do not tight-poll CI or request M11.
