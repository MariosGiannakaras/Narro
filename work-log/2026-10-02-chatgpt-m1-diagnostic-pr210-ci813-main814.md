# M1 diagnostic artifact integration — PR #210 / CI #813 / main CI #814

Date: 2026-10-02

## Purpose

Prepare a current Windows diagnostic artifact for the remaining reopened
Milestone 1 physical checks without contaminating the production physical
candidate used for M7 saved-placement acceptance.

## PR #210

PR #210: `M1: publish isolated current diagnostic artifact`

Exact PR head:
`e5bf7081ec04af82635adad1366b4c6b8c489e08`

Changes:
- adds `src-tauri/tauri.diagnostic.conf.json`;
- diagnostic Main URL is `index.html?diagnostics=1`;
- `focusSurface` remains normal product `focus.html`;
- no `runtimeVisual` activation;
- adds `tauri:diagnostic-ci` raw-EXE build;
- CI builds/uploads production physical candidate first, then diagnostic build;
- diagnostic artifact includes raw EXE, performance script and M1 physical
  validation procedures;
- regression contracts enforce config isolation and CI ordering.

No Narro product/runtime domain behavior changed. The diagnostic config is a
test-artifact entrypoint only.

## Exact-head CI

Windows CI #813 / run `36976416729`: **PASS**.

Jobs:
- validation-gate PASS;
- fast-gate PASS;
- windows-candidate PASS.

Exact-head diagnostic artifact:
- artifact id `11214201794`;
- name `narro-m1-diagnostic-windows-x64`;
- digest `sha256:2e636b14c9a3ed336e09f2acd83a5d26e53127d8091c90bf4a308e84723424ca`.

The exact-head run also retained separate production physical and packaged-Focus
artifacts, proving the diagnostic build was appended rather than replacing the
production candidate path.

## Guarded merge

PR #210 was expected-head guarded squash-merged as:
`07210a7b490c01687304d19555abf9cf39542940`.

The merged-main blobs for every non-Markdown PR path are byte-identical to the
exact-green PR head:
- `.github/workflows/ci.yml`;
- `package.json`;
- `scripts/test-ci-tiering.mjs`;
- `scripts/test-focus-runtime-visual-harness.mjs`;
- `scripts/verify-config.mjs`;
- `src-tauri/tauri.diagnostic.conf.json`.

## Resulting-main validation

Because PR #210 changes the workflow, a full main warm-up was required rather
than relying only on PR-head tree identity.

Windows CI #814 / run `36981516292`, attempt 2, on merged main
`07210a7b490c01687304d19555abf9cf39542940`: **PASS**.

All stages passed:
- validation gate;
- fast gate;
- Rust check;
- clippy;
- Rust tests;
- performance-harness self-test;
- visual regression capture/validation;
- Tauri release build;
- packaged Focus runtime capture/upload;
- production physical validation release build/verification/upload;
- M1 diagnostic release build/upload.

Main CI #814 artifacts:
- `narro-fast-frontend-dist` id `11216005920`,
  digest `sha256:ebf7cf9a70b53ccab9b30b44972ea5fe5255bd197d8ff65135f255fc140f0db1`;
- `narro-m5-visual-regression` id `11216172699`,
  digest `sha256:22d1d254e8229410e05f38c998bc871b52f50409484d36c6247449c7b7acc505`;
- `narro-m7-focus-runtime-visual` id `11216811629`,
  digest `sha256:90f5a115f965143c9722405483e7d8fab165f2f9332e689d614c4cb50e98e2a3`;
- `narro-m7-physical-windows-x64` id `11216812727`,
  digest `sha256:f0359e91a4a61764ab38c60ee82ed9706265e348c5777aad12ff5569a6ff37a8`;
- `narro-m1-diagnostic-windows-x64` id `11217195491`,
  digest `sha256:e16e6e5b2da0e916678b9b34d3348fca8014774cc38d3cda8932c2d4cbfa726f`.

The main diagnostic ZIP was downloaded and independently hashed:
`e16e6e5b2da0e916678b9b34d3348fca8014774cc38d3cda8932c2d4cbfa726f`.

Contained diagnostic executable:
- path in artifact: `src-tauri/target/release/narro.exe`;
- SHA-256:
  `4453d403ed477c4dc3041b4ee3afe51a18b83819093d6b210525640431746bd2`.

The artifact also contains:
- `scripts/measure-floating.ps1`;
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`;
- `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`;
- `docs/M1_DISPLAY_TOPOLOGY_VALIDATION.md`.

## Candidate separation

M7 C5 saved-placement restart must continue to use the already accepted **CI
#809 production physical artifact**. The diagnostic artifact is not a
substitute for that production physical acceptance.

Remaining M1 diagnostic checks that need Main diagnostics / destroy-main /
monitor controls / performance harness should use the **CI #814 diagnostic
artifact** above.

This preserves candidate identity:
- production physical acceptance: CI #809 production artifact;
- M1 diagnostic/manual measurement: CI #814 diagnostic artifact.

## Progress

No physical counter advances from this infrastructure work.

Current progress remains:
`4/10M || 4/5 | 14/19`.

The remaining real-Windows work is consolidated in
`docs/M1_FINAL_REPLACEMENT_PHYSICAL_BATCH.md`.
