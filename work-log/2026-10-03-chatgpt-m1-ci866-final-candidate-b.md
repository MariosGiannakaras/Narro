# M1 final Candidate B — CI #866 reconciliation

Date: 2026-10-03

## Validated source

Resulting-main source:
`f1a200c3624c3e25154a7023443c1dfc5be1e69d`

Authoritative Windows CI:
- run number: **#866**
- run id: `37078139295`
- conclusion: **PASS**
- checkout was the exact source SHA above.

The full Windows candidate passed:
- validation gate;
- fast gate;
- Rust check;
- Clippy;
- Rust tests;
- performance-harness validation;
- visual regression;
- packaged Focus runtime capture;
- physical production-build verification;
- M1 diagnostic build;
- **real M1 diagnostic storage-isolation smoke**;
- diagnostic artifact upload.

## Final Candidate B artifact

Artifact:
- name: `narro-m1-diagnostic-windows-x64`
- id: `11257763093`
- ZIP SHA-256:
  `0453b29656198a35863feca85f460fb540274f1ab826ff1a49ea29d90018f49e`
- contained diagnostic `narro.exe` SHA-256:
  `7168dbca6e72484d0782f0541460103144162d9dd5f0355cc7df8e321c6e45c3`

The artifact was downloaded and inspected after CI. It contains:
- `src-tauri/target/release/narro.exe`;
- `scripts/measure-floating.ps1`;
- `scripts/run-m1-floating-performance-batch.ps1`;
- `scripts/verify-m1-floating-performance-scenario.ps1`;
- `docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md`;
- `docs/M1_WINDOWS_RUNTIME_VALIDATION.md`;
- `docs/M1_DISPLAY_TOPOLOGY_VALIDATION.md`.

## Runtime storage-isolation evidence

CI #866 executed:
`scripts/verify-m1-diagnostic-storage-isolation.ps1 -Executable src-tauri/target/release/narro.exe -ResetDiagnosticData`

Observed result:
**M1 diagnostic storage isolation runtime smoke: PASS**

The diagnostic database resolved to:
`C:\Users\runneradmin\AppData\Roaming\com.mariosg.Narro.M1Diagnostic\narro.db`

CI reported diagnostic database SHA-256:
`ee44672ebde99d92d3942701cdc6be36ace56545f7f28cf71549b35feeaef3dc`

The same smoke reported both production namespaces unchanged:
- Roaming `com.mariosg.Narro`;
- Local `com.mariosg.Narro`.

This validates the final Candidate B storage-safety requirement and the bounded post-exit SQLite handle-release retry.

## Consequence

Repository-side Candidate B preparation is complete. Physical M1 B/C/D can now use this exact diagnostic artifact:
- selected-monitor Left/Right matrix;
- display disconnect/reconnect/re-enumeration matrix;
- three-run floating-only CPU/RAM batch using
  `-ExpectedExecutableSha256 7168dbca6e72484d0782f0541460103144162d9dd5f0355cc7df8e321c6e45c3`.

These are still real-Windows physical/measurement gates. No checkbox or progress counter advances from this reconciliation alone.

Current progress remains:
`4/10M || 4/5 | 14/19`.

PR #219 M7 automatic logging is an independent active slice and is not modified by this Candidate B reconciliation.
