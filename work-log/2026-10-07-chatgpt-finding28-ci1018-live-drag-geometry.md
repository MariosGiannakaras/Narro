# Finding28 — CI1018 live drag geometry correction

Date: 2026-10-07

Status: **REGRESSION HARNESS ACTIVE / NO PRODUCT VERDICT**

## Exact CI1018 result

PR245 exact head: `2ffff75f77635e28ed0ab59319f82a9259669954`  
Windows CI1018/run: `37614336393`

PASS before Finding28:
- validation gate;
- fast frontend/contract gate;
- Rust check, Clippy, Rust tests;
- floating performance validation;
- every pre-existing Windows visual capture/validator, including the 50-scenario focus-editor regression set.

The shared Finding28 fixture then mounted correctly:
- `data-finding28-fixture-ready=true`;
- production `ListBoard` rendered in main state;
- three reorderable Today tasks were present.

The dedicated Finding28 test failed before any action-rail assertion with:
`Timed out waiting for one committed Finding28 reorder`.

Therefore CI1018 is **not** evidence about the post-drag focus/action-rail behavior.

## Evidence-backed driver correction

The driver captured the destination task rectangle before pointer lift. Production drag lift collapses the source shell and reflows the lane, making that pre-lift destination coordinate stale.

PR245 head `731211e033bd9cb684c34120a5fdb47748ba28a5` now:
- dispatches the same real Edge/CDP pointer input;
- waits until the production source reports `data-task-dragging=true` and the real drag preview exists;
- only then remeasures the destination task in the live post-lift layout;
- verifies that live point is inside a production drop lane before releasing.

No production source/CSS behavior changed.

Exact-head CI1021/run `37616846376` is active.

Acceptance boundary: no Finding28 production change until the regression completes the real reorder and reaches focus/pseudo-class/computed-style assertions.

Progress remains `3/10M || 0/3 | 17/18`.
