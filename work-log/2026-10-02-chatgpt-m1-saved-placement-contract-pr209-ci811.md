# M1 saved-placement contract hardening — PR #209 / CI #811

Date: 2026-10-02

## Trigger

M7 C4 is physically PASS on CI #809. C5 is narrowed to the single remaining
physical observation: drag Timer -> normal tray Quit -> relaunch -> safe saved
placement.

The production runtime already contained both halves of that lifecycle:
- tray `Quit Narro` calls `floating_placement::save_if_timer_visible(app_handle)`
  before `app_handle.exit(0)`;
- hidden Timer presentation restore uses `floating_placement::restore_for_timer`
  against current monitor topology before reveal.

The tray-Quit ordering was not explicitly regression-locked by the existing
single-Focus architecture contract.

## Change

PR #209, branch `m1/saved-placement-quit-contract`:
- exact head: `5384ea7384d304a843771e225bfb50cd9394bf43`;
- changed only `scripts/test-single-focus-architecture.mjs`;
- added a static contract requiring:
  1. the tray `quit` branch to exist;
  2. `save_if_timer_visible(app_handle)` to occur inside that branch;
  3. `app_handle.exit(0)` to occur after the save.

No production Rust/React/config/runtime behavior changed.

A direct semantic check against the exact branch source found:
- quit branch index: 62831;
- placement save index: 62900;
- process exit index: 63084;
- ordering: PASS;
- existing hidden-Timer `restore_for_timer` contract: PASS.

## Exact-head validation

Windows CI #811 / run `36973948214`: **PASS**.

All required jobs/stages passed:
- validation-gate;
- fast-gate;
- Windows Rust check;
- clippy;
- Rust tests;
- performance harness self-test;
- visual regression capture/validation;
- Tauri release build;
- packaged Focus runtime capture;
- production physical validation release;
- physical-build verification and artifact upload.

Artifacts:
- `narro-fast-frontend-dist` id `11213290144`, digest
  `sha256:fb22a9107d2ca6a47d3ba54edc6a7a929b7742b15d9014fdaa7e3c9bdddcebc5`;
- `narro-m5-visual-regression` id `11213476162`, digest
  `sha256:aae53d37ad99ad6d12bd1704d915ddb0434ddbea8e9f85eee537dc48f3cef829`;
- `narro-m7-focus-runtime-visual` id `11212628958`, digest
  `sha256:60ca095fd35d5f42ecba654d0d7c0340f3c2042c83f940c525a72cd49a9269c4`;
- `narro-m7-physical-windows-x64` id `11213427991`, digest
  `sha256:6c33fa76f0e452d57e5407fac5facf980d83a1dac1d73bf9c0ad17b9ebd6761c`.

## Merge / main evidence

PR #209 was expected-head guarded squash-merged as:
`c84013dbafbce6c8d581e3e12e1793bb12281fd1`.

The GitHub connector does not expose push-triggered Actions runs for the merge
commit, so no resulting-main workflow run is invented.

Instead, integration evidence is explicit:
- merged main is exactly one commit ahead of prior main `6763aa3e...`;
- the only changed path is `scripts/test-single-focus-architecture.mjs`;
- the merged-main blob SHA for that file is
  `a0a53bff38605f1437bbb6c62868c735cb535542`;
- the exact-green PR-head blob SHA is the same
  `a0a53bff38605f1437bbb6c62868c735cb535542`.

Thus the merged test contract is byte-identical to the exact-head CI #811
validated contract. No production executable/runtime source changed.

## Gate effect

This hardening does **not** close C5 and does not substitute automated evidence
for saved-placement physical observation.

M7 remains:
- C1 PASS
- C2 PASS
- C3 PASS
- C4 PASS
- C5 OPEN only for saved placement across normal Quit/relaunch + final tracking
  reconciliation.

The exact CI #809 artifact remains the accepted physical candidate because PR
#209 changed no production runtime source.

Progress remains:
`4/10M || 4/5 | 14/19`.
