# M7 PR #192 CI #786 reconciliation-contract failure

Date: 2026-10-01

## Exact failed candidate

PR #192 head:
`0762aafd26dbf983f4208667f60381264956af4a`

Windows CI #786 / run `36785840236`: **FAIL**

## Failure

The build reached Repository Preflight. The following relevant contracts passed before the failure:
- single-instance runtime ownership;
- single-Focus architecture;
- packaged Focus runtime visual harness contract;
- Focus entry / B5 static contract;
- Focus Panel parity/state contracts;
- Focus presentation transition contracts;
- Focus toggle / B6 static contract;
- Reports history/session API contract;
- other preceding frontend contracts.

The failure was exclusively:
`scripts/test-ui-task-scheduling.mjs`

It required:
`$maxAttempts = if ($ReadyMarker) { 3 } else { 1 }`

The reconciled visual capture harness correctly carries the newer validated main policy:
`$maxAttempts = if ($ReadyMarker) { 4 } else { 1 }`
plus:
`Start-Sleep -Milliseconds (250 * $attempt)`

This M7-only scheduling regression had been added on the historical branch and therefore constituted a cross-file semantic reconciliation dependency: current main changed the capture harness policy without containing that branch-only test.

## Correction

Only `scripts/test-ui-task-scheduling.mjs` changed:
- expectation updated from 3 to 4 attempts;
- explicit expectation added for the validated linear retry backoff.

No runtime, Rust, Focus, timer/session, window, geometry, reporting, Cargo or fixture implementation changed.

New exact head:
`dce6933ff7a777c837822f7a5a83c37d47434e07`

Windows CI #787 / run `36786367870`: queued at checkpoint.

A complete three-way blob audit of all 59 M7-changed paths against original M7 base, historical M7 head and current main found only four true same-file overlaps:
- `package.json`
- `scripts/capture-visual-fixtures.ps1`
- `src-tauri/Cargo.toml`
- `src-tauri/src/lib.rs`

Those four already use explicit combined blobs. The #786 failure was not a missed same-file conflict; it was a branch-only test coupled to a main-changed dependency.

Do not merge or issue a physical artifact until #787 passes and its fresh artifacts are reviewed.
