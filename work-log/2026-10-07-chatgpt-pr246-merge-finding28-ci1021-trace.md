# PR246 integration + Finding28 CI1021 input-trace routing

Date: 2026-10-07

Progress: `3/10M || 0/3 | 17/18`

## PR246 / Findings29+30

PR246 exact head `7b47aacea282d5307633d0596f15e229b0c0feb2` passed full Windows CI1020/run `37615461397`: validation gate, fast gate, Windows Rust check/clippy/tests, performance harness, visual regressions, release build, physical-validation build and diagnostic build all PASS.

The PR was merged with an expected-head guard and squash method as resulting-main commit `dfefc9bf22837ce90be396217bae505b4dc61418`.

The six changed source/test blobs were re-read on resulting `main`; every blob SHA is identical to the validated PR head:
- `scripts/capture-reports-fixtures.ps1`
- `scripts/test-ui-reports-sessions.mjs`
- `scripts/validate-reports-captures.mjs`
- `src/ReportsSessionsView.tsx`
- `src/reportsSessions.css`
- `src/reportsVisualFixture.tsx`

Physical Windows acceptance for Finding29 and direct SS-H17/source-parity acceptance for Finding30 remain OPEN.

## Finding28 / CI1021

PR245 exact head `731211e033bd9cb684c34120a5fdb47748ba28a5` ran Windows CI1021/run `37616846376`.

Everything before the Finding28 regression passed: validation/fast gates, Windows Rust check/clippy/tests, performance harness, and all pre-existing visual captures/validators.

Finding28 then failed before any rail/focus assertion:
- fixture mounted and reported ready;
- production ListBoard rendered the expected three reorderable Today tasks;
- the driver timed out waiting for production pointer lift;
- no product behavior verdict was established.

The next PR245 head `71df77bec87b03352e562234741f53dbeb6a584e` changes only the regression driver. It adds non-invasive browser input tracing and explicit assertions for the expected production-shell `pointerdown` and left-button `pointermove`, including pointer identity, buttons, coordinates, default-prevention and target task in failure diagnostics.

Exact-head CI1023/run `37626644186` is active. Use its trace to select the next harness correction; do not patch production behavior until the regression reaches the post-drag focus/computed-style assertions.
