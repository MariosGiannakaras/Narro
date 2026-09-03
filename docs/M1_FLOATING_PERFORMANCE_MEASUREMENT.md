# Milestone 1 floating-only Windows performance measurement

This document defines the repeatable evidence protocol for the Milestone 1 architecture gate:

> Measure steady-state CPU and process memory with `main` destroyed, `focusSurface` left alive in Floating Timer mode, and no active animation or user interaction.

The measurement harness is `scripts/measure-floating.ps1`.

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

That executes `scripts/measure-floating.ps1 -SelfTest` and validates:

- descendant process-tree selection;
- memory-stat aggregation;
- CPU delta and percentage calculation;
- process-tree churn detection.

The self-test does not claim that real runtime CPU/RAM behavior passes the M1 gate. It validates only the measurement logic that can be proven deterministically without launching Narro.

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

From the repository root in Windows PowerShell:

```powershell
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts/measure-floating.ps1 -WarmupSeconds 30 -SampleSeconds 60 -IntervalSeconds 1
```

If exactly one `narro.exe` is running, the script resolves it automatically. If there is an intentional reason to target a specific known process, pass `-NarroPid <pid>`.

By default output is written under:

```text
performance/m1-floating/<UTC timestamp>/
```

Generated timestamped measurement directories are gitignored. Promote only the concise, reviewed evidence needed for `STATUS.md` / work-log documentation; do not commit machine-local raw output by default.

Each run produces:

- `summary.json` — aggregate statistics and final process-name breakdown;
- `samples.csv` — raw per-process samples;
- `cpu-intervals.csv` — CPU deltas and stability for every interval.

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

Capture at least three valid runs under the same conditions. For each run record:

- average/min/max `% of one core`;
- average/min/max `% total logical CPU capacity`;
- average/min/max working set MiB;
- average/min/max private bytes MiB;
- final process-name breakdown and process counts;
- Windows version, CPU/logical-processor count and the exact Narro commit/artifact used.

For the M1 summary, report all run averages and their median rather than selecting the best run. Record obvious Narro/WebView2 contributors from `lastProcessBreakdown`.

No arbitrary numeric pass/fail threshold is defined in the repository at this point. The evidence is used to decide whether the two-webview Tauri/WebView2 architecture is acceptably lightweight for Narro's floating-only state relative to its product goals and available fallback options. Do not invent a threshold after seeing the result merely to force a pass or fail.

## What CI does and does not prove

Windows CI proves that the harness self-test passes and that the Narro release still builds in the same validated source context.

Hosted CI runner CPU/RAM values are not canonical M1 performance evidence because hosted-runner load and virtualization are not controlled enough for the architecture decision. The actual floating-only measurements remain a physical Windows validation step.
