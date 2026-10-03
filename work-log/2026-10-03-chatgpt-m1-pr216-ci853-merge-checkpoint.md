# M1 final monitor evidence automation — PR #216 exact-head / CI #853 / merge checkpoint

Date: 2026-10-03

## Scope

PR #216:
`M1: automate final monitor evidence and placement persistence reopen`

Exact validated head:
`306dfc50d68477059ceb65a45c5806558db6abbf`

This slice reduces the remaining real-Windows Milestone 1 burden without
changing production planning/timer/session behavior.

Material additions:
- one-click diagnostic **Run all monitor Left/Right probes** matrix;
- native expected-vs-actual placement verification for every enumerated
  monitor × Left/Right side;
- stale matrix invalidation after monitor refresh/manual selection/individual
  placement;
- visible ~750 ms hold at every matrix placement so a recording can prove the
  physical edge rather than only a JSON result;
- SQLite close/reopen regression proving Floating Timer placement survives a
  real database reopen;
- renderer/capture acknowledgement window alignment at a bounded 30 s for the
  CI-only `runtimeVisual=1` driver;
- PowerShell syntax coverage for the final M7 physical-session preparer.

## Exact-head Windows validation

Windows CI #853 / run `37044645690`: **PASS**.

All jobs/stages passed:
- validation gate;
- fast frontend/contract gate;
- Rust formatting/check/clippy/tests;
- performance-harness validation;
- visual-regression suite;
- Tauri release;
- packaged Focus runtime capture/validation;
- production physical release verification/upload;
- M1 diagnostic release/upload.

Artifacts:
- Focus runtime artifact id `11244290826`,
  digest `sha256:fa47826a223cd0e758471be0f1edd363a3d2a3fe5ffd35dd0c36a2cb8b298e7b`;
- diagnostic artifact id `11244174942`,
  digest `sha256:f68866ae46da694d28858217aedc6d08999ce765fc19c0226a32710fe5b78570`;
- production physical artifact id `11244666504`,
  digest `sha256:1cdc5e0a262d9b8b2a88baac445ed906dbdecbf85615ece819c98d96614a719b`.

The downloaded ZIP SHA-256 values independently match GitHub's artifact
digests.

Contained PR-head diagnostic `narro.exe` SHA-256:
`6f7e6667ec392b8fe7fbf79dc6374489a1e3b1d9f1e036902db9c74f17d4a56c`.

## Packaged Focus motion inspection

The exact-head runtime artifact was inspected rather than accepting the green
job status alone.

`panel-to-timer-runtime/frames.json`:
- first native position: `(668,0)`;
- target native position: `(388,80)`;
- observed change at ~109 ms;
- final sample remains `(388,80)`.

`timer-to-panel-runtime/frames.json`:
- first native position: `(388,80)`;
- target native position: `(668,0)`;
- observed change at ~134 ms;
- final sample remains `(668,0)`.

The artifact therefore contains real source→target HWND movement in both
directions. PR #216's 30 s ACK/capture-window correction did not weaken the
actual movement assertion.

## Data-safety / diagnostic isolation

The merged physical tooling now explicitly protects real user data:

- production M7 preparer resolves
  `%APPDATA%\\com.mariosg.Narro`;
- it requires Narro to be fully stopped before preparation;
- it snapshots the complete production app-data directory into the session
  evidence folder and records file lengths/SHA-256 values;
- diagnostic candidate identifier is
  `com.mariosg.Narro.M1Diagnostic`, isolating its Tauri app-data namespace
  from production lists/tasks;
- B/C/D remain invalid if the diagnostic runtime storage-identity UI does not
  report isolation PASS.

## Merge

PR #216 was expected-head guarded-squash-merged as:
`007a999e688144122362ad1a4012a22b310e66f2`.

Resulting-main Windows CI #854 / run `37069188509` started automatically and
was still running when this immutable checkpoint was written.

Do not promote the PR-head diagnostic artifact to final Candidate B until
#854 succeeds and the resulting-main diagnostic artifact identity is recorded.

## Progress

No physical gate closes from this tooling/CI work.

`4/10M || 4/5 | 14/19`
