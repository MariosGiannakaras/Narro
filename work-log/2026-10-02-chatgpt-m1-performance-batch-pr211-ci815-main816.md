# M1 floating-performance batch automation — PR #211 / CI #815 / main CI #816

Date: 2026-10-02

## Purpose

Reduce the remaining real-Windows M1 floating-only CPU/RAM validation from
three separately launched measurements plus manual median calculation to one
deterministic command, without changing Narro product/runtime behavior.

## PR #211

PR #211: `M1: automate floating performance evidence batch`

Exact PR head:
`735f5f157e354c7f1aaeed051ef0a2103d08f016`

Changes:
- adds `scripts/run-m1-floating-performance-batch.ps1`;
- invokes the existing canonical `measure-floating.ps1` for at least three
  consecutive runs;
- rejects child-run failure, process-tree churn, invalid summary shape,
  changed Narro PID/executable/logical-CPU context between runs, and optional
  executable SHA-256 mismatch;
- writes `batch-summary.json` with per-run CPU/memory metrics, median run
  averages, Windows version/build and processor model;
- extends `npm run test:performance-harness` to self-test both the sampler and
  the batch runner;
- requires the batch runner to be included in the isolated M1 diagnostic
  artifact;
- updates the M1 performance and final physical-batch procedures to one-command
  operation.

No production Rust/React/domain behavior changed.

## Exact-head CI

Windows CI #815 / run `36987461587`: **PASS**.

All jobs passed:
- validation-gate;
- fast-gate;
- windows-candidate.

The Windows candidate passed the new `Validate Performance Harness` step,
therefore both the existing sampler self-test and the new PowerShell batch-runner
self-test executed successfully on Windows.

The remaining standard gates also passed: Rust check/clippy/tests, visual
regression, Tauri release, packaged Focus runtime capture, production physical
build verification/upload, and M1 diagnostic build/upload.

## Merge and resulting-main validation

PR #211 merged as:
`c372ca29824c3c3839490a19e79f7ed3482cb360`.

Because PR #211 changes `.github/workflows/ci.yml`, a full resulting-main
warm-up was required.

Windows CI #816 / run `36989230905` on merged main
`c372ca29824c3c3839490a19e79f7ed3482cb360`: **PASS**.

All three jobs completed successfully, including the diagnostic build/upload
stage.

## Authoritative CI #816 diagnostic artifact

- artifact id: `11218838485`
- name: `narro-m1-diagnostic-windows-x64`
- GitHub/independently verified ZIP SHA-256:
  `cd03347215b684fc853aa450aa1903870ed5969ac6c7150edebda72a9048c2f9`
- contained `src-tauri/target/release/narro.exe` SHA-256:
  `f3ea39a540f46455ee8e8f1e078e168ef1745d2a7d5e6520617fa655a39ebc6b`

Artifact contents verified:
- `src-tauri/target/release/narro.exe`
- `scripts/measure-floating.ps1`
- `scripts/run-m1-floating-performance-batch.ps1`
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`
- `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`
- `docs/M1_DISPLAY_TOPOLOGY_VALIDATION.md`

The diagnostic executable hash differs from earlier CI #814 and is therefore the
only hash that should be supplied to the new batch runner for the current
Candidate B.

## Evidence semantics

This automation does **not** close the physical performance gate. Hosted CI only
validates the sampler/orchestrator logic.

Canonical M1 performance evidence still requires a real Windows desktop with:
- Main destroyed via the diagnostic UI;
- one persistent product `focusSurface` in idle Floating Timer presentation;
- no interaction during each 30 s warm-up / 60 s sample window;
- three valid runs;
- exact CI #816 diagnostic EXE hash verification.

## Progress

No physical counter advances from validation-tooling integration.

Progress remains:
`4/10M || 4/5 | 14/19`.

The remaining real-Windows work stays consolidated in
`docs/M1_FINAL_REPLACEMENT_PHYSICAL_BATCH.md`.
