# Finding28 — CI1017 harness failure and motion-contract correction

Date: 2026-10-07

Scope: PR245 regression harness only. No Narro production behavior, CSS, TaskCard, ListBoard, persistence, timer, or native-window code changed.

## Exact result

- PR245 prior exact head: `43d401182e5c962933db079dcb750386f686811c`.
- Windows CI1017/run `37608595924`.
- validation-gate: PASS.
- fast-gate: PASS.
- Windows Rust check/clippy/tests, performance harness and all pre-existing visual regression captures/validators before Finding28: PASS.
- Finding28 regression: **NO BEHAVIOR VERDICT**. It timed out waiting for the production ListBoard fixture.
- Exact diagnostic state: document `readyState=complete`; `data-focus-editor-fixture-ready=true`; no Finding28-ready/error dataset; no board DOM; empty `#root`.

## Cause

The shared `focusEditorsVisualFixture.tsx` asserts that the requested `motion` query matches `prefers-reduced-motion` before it reaches the Finding28 scenario branch. Established `capture-visual-fixtures.ps1` calls always supply `motion=<true|false>` and force Edge's matching media preference. The new Finding28 CDP driver omitted both. That explains the observed pre-branch shared-fixture failure signature and is a test-infrastructure defect, not evidence about Finding28 runtime behavior.

## Correction

PR245 head `2ffff75f77635e28ed0ab59319f82a9259669954` changes only `scripts/test-finding28-post-drag-action-rail.mjs`:
- URL now includes `motion=false`;
- Edge now receives `--force-prefers-no-reduced-motion`.

This matches the established fixture contract without altering production source.

Exact-head CI1018/run `37614336393` is active.

## Acceptance boundary

Do not infer Finding28 product behavior from CI1017. Do not patch production behavior until the rendered regression reaches the focus/pseudo-class/computed-style/hover/mutation assertions.

Progress remains `3/10M || 0/3 | 17/18`.
