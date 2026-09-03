# 2026-09-03 — Floating-only performance measurement harness

## Scope

Prepared the repeatable Windows measurement harness for the remaining Milestone 1 floating-only CPU/RAM architecture gate. This slice does **not** claim physical performance results; those remain MANUAL NOT RUN until measured on a real Windows machine in the required runtime state.

## Implementation

- added `scripts/measure-floating.ps1`;
- resolves exactly one Narro `narro.exe` root by default, with explicit PID selection only when intentionally supplied;
- follows the Narro descendant process tree so Narro-owned WebView2 helper processes are included without summing unrelated Edge/WebView2 processes;
- records per-process CPU, working set, private bytes, PID/parent PID and start-time identity;
- derives CPU from cumulative process CPU-time deltas over real elapsed intervals;
- reports CPU both as percent of one logical core and percent of total logical CPU capacity;
- fingerprints the process tree by PID + start time and refuses to infer CPU across process churn;
- marks any run containing process-tree churn as invalid steady-state evidence and exits non-zero after preserving raw output;
- exports `summary.json`, `samples.csv` and `cpu-intervals.csv`;
- groups the last snapshot by process name so Narro/WebView2 contributors can be recorded explicitly;
- timestamped raw measurement directories are ignored by Git by default.

## Review fix before CI

Initial review found use of `$pid` as a local variable. PowerShell variable names are case-insensitive and `$PID` is a read-only automatic variable, so that form would fail at runtime. The harness was corrected to use `$processId` before CI validation.

The churn failure path also uses non-terminating `Write-Error` followed by explicit exit code `2`, so invalid steady-state evidence has a deterministic non-zero result after files are written.

## Deterministic validation contract

Added `npm run test:performance-harness`, executing:

`powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts/measure-floating.ps1 -SelfTest`

The command is included in `preflight:windows` and validates synthetic process-tree selection, memory aggregation, CPU interval math and churn detection.

## Physical measurement protocol

`docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md` defines the real Windows procedure: `focusSurface` in Floating Timer mode, timer/session inactive, `main` destroyed rather than hidden, no interaction during warm-up/sample, at least three valid runs, and reporting of all run averages plus their median. No numeric pass/fail threshold is invented because the repository currently defines none.

## Validation state at commit time

- source review: COMPLETE;
- local Windows PowerShell self-test in the current ChatGPT environment: NOT RUN;
- Windows repository preflight: pending PR CI;
- Tauri release packaging: pending PR CI;
- physical Windows floating-only CPU/RAM measurement: MANUAL NOT RUN.
