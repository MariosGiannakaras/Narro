# Milestone 1 floating-only Windows performance measurement

This document defines the repeatable evidence protocol for the Milestone 1 architecture gate:

> Measure steady-state CPU and process memory with `main` destroyed, the **single persistent `focusSurface`** left alive in Floating Timer presentation, and no active animation or user interaction.

For the reopened single-Focus gate, the measured build must contain no separate persistent Timer WebView. Record the process tree/window list so the replacement cannot appear cheaper or more expensive because a stale `floatingTimer` renderer is still alive. The compact Timer may use a smaller native window region, but the underlying Focus host/WebView remains the fixed maximum host.

The single-run measurement harness is `scripts/measure-floating.ps1`. The preferred three-run physical workflow is `scripts/run-m1-floating-performance-batch.ps1`, which invokes the same harness repeatedly, rejects invalid runs, optionally verifies the sampled executable SHA-256, and writes one reviewed batch summary.

## What the harness measures

The script resolves the Narro root `narro.exe` process and follows only its descendant process tree from a Windows process snapshot. This is intentional: WebView2 helper processes belonging to Narro are included, while unrelated Edge/WebView2 processes elsewhere on the machine are excluded.

For each sample it records:

- the Narro process-tree fingerprint (`PID:start-time`) so process churn is detectable;
- cumulative CPU time for the full process tree;
- aggregate working set bytes;
- aggregate private bytes;
- per-process PID, parent PID, process name, CPU time, working set and private bytes.

CPU is derived from cumulative process CPU-time deltas across timed intervals. The report includes both:

- `% of one logical core`; and
- `% of total logical CPU capacity`.

Working set and private bytes are both retained because they describe different memory costs. Aggregate working set can count shared resident pages in more than one process; do not treat it as uniquely owned memory. Private bytes is the more useful companion measure for committed process-private memory.

## Deterministic harness validation

Windows preflight runs:

```powershell
npm run test:performance-harness
```

That executes both harness self-tests. The single-run self-test validates:

- descendant process-tree selection;
- memory-stat aggregation;
- CPU delta and percentage calculation;
- process-tree churn detection.

The batch-runner self-test validates:

- odd/even median calculation;
- SHA-256 input normalization/rejection;
- valid-summary acceptance;
- churn/invalid-summary rejection;
- MiB conversion used in the batch report.

The self-tests do not claim that real runtime CPU/RAM behavior passes the M1 gate. They validate only deterministic measurement/orchestration logic without launching Narro.

## Physical Windows measurement setup

Use a real Windows 10/11 x64 machine and a release build from a successfully validated Narro commit.

Before each run:

1. Launch Narro normally and allow startup work to settle.
2. Put `focusSurface` into Floating Timer mode.
3. Leave the timer/session inactive so there are no second-by-second state changes or other active animations.
4. Destroy `main` through the diagnostic harness. Do not merely hide it; the scenario being measured is the architecture proposal where the main webview is absent.
5. Do not open tray menus, press the global shortcut, move the floating surface, send notifications, toggle autostart, or otherwise interact with Narro during the warm-up and sample window.
6. Confirm there is only one `narro.exe` root process. If more than one exists, investigate the duplicate-instance condition instead of selecting one arbitrarily and calling the result valid.

## Run command

From the extracted diagnostic artifact on Windows, the preferred command is:

```powershell
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts/run-m1-floating-performance-batch.ps1 -RunCount 3 -WarmupSeconds 30 -SampleSeconds 60 -IntervalSeconds 1 -ExpectedExecutableSha256 <EXPECTED_DIAGNOSTIC_EXE_SHA256>
```

Use the exact diagnostic `narro.exe` SHA-256 recorded in `HANDOFF.md` /
`docs/M1_FINAL_REPLACEMENT_PHYSICAL_BATCH.md` for
`<EXPECTED_DIAGNOSTIC_EXE_SHA256>`. The runner resolves the single Narro root
process, performs all three runs without requiring interaction between them,
validates each generated `summary.json`, and rejects an executable hash
mismatch.

By default batch output is written under:

```text
performance/m1-floating-batch/<UTC timestamp>/
```

The batch directory contains:

- `run-01/summary.json`, raw samples and CPU intervals;
- `run-02/...`;
- `run-03/...`;
- `batch-summary.json` with all run metrics and median run averages.

For diagnosis or an intentionally isolated single run, the underlying command
remains available:

```powershell
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts/measure-floating.ps1 -WarmupSeconds 30 -SampleSeconds 60 -IntervalSeconds 1
```

If exactly one `narro.exe` is running, both paths resolve it automatically. If
there is an intentional reason to target a specific known process, pass
`-NarroPid <pid>`.

Generated measurement directories are gitignored. Promote only concise reviewed
evidence needed for `STATUS.md` / work-log documentation; do not commit
machine-local raw output by default.

## Validity rules

A run is valid steady-state evidence only when all of the following hold:

- `scenario` is `floating-only-main-destroyed`;
- `steadyStateValid` is `true`;
- `churnIntervalCount` is `0`;
- the physical setup above remained unchanged for the complete warm-up/sample period;
- the sampled root executable is the intended Narro release build;
- no duplicate Narro root process was present.

If the process fingerprint changes between samples, the script preserves raw data, marks the run invalid and exits non-zero. Do not average CPU across a process birth/death interval and present it as steady-state evidence.

If a process disappears while one snapshot is being assembled, the run fails instead of silently producing a partial process-tree total. Rerun after identifying whether the churn is transient startup work or a persistent runtime behavior relevant to the architecture decision.

## Repetition and reporting

The required evidence is at least three valid runs under identical conditions.
The preferred batch runner enforces a minimum `RunCount` of 3 and stops if any
child measurement exits non-zero, reports process churn, or produces an invalid
summary. When `-ExpectedExecutableSha256` is supplied, every sampled run must
also resolve to that exact executable hash.

For each run, retain:

- average/min/max `% of one core`;
- average/min/max `% total logical CPU capacity`;
- average/min/max working set MiB;
- average/min/max private bytes MiB;
- final process-name breakdown and process counts;
- Windows version, CPU/logical-processor count and exact Narro artifact identity.

`batch-summary.json` records the per-run values plus the median of the three
run averages for CPU, working set and private bytes. Report all run averages and
their median rather than selecting the best run. Record obvious Narro/WebView2
contributors from each run's `lastProcessBreakdown`.

No arbitrary numeric pass/fail threshold is defined in the repository. The
evidence is used to decide whether the two-webview Tauri/WebView2 architecture is
acceptably lightweight for Narro's floating-only state relative to its product
goals and available fallback options. Do not invent a threshold after seeing the
result merely to force a pass or fail.

## What CI does and does not prove

Windows CI proves that the harness self-test passes and that the Narro release still builds in the same validated source context.

Hosted CI runner CPU/RAM values are not canonical M1 performance evidence because hosted-runner load and virtualization are not controlled enough for the architecture decision. The actual floating-only measurements remain a physical Windows validation step.
