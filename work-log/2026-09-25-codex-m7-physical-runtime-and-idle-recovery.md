# 2026-09-25 — M7 Windows runtime and idle recovery

## Source and machine

- CI #503 / run `36046718991`, PR #138 head `7900825ca474c49fdf297a8d7a42cff043ea325c`, runtime artifact `10829228469` (`sha256:6670cdf19365cbfe381fa0f6ff488556595942038cac9b16bd3d5626f310a0ec`), executable SHA256 `63D5E16DE00D998D4CFDF4FC226EC6CB95D370849C3CADC66811BC3753B2DC79`. This is the physically retested DOM-key fix.
- CI #505 / run `36101936170`, PR #140 head `7f446d59070baee64a19314889fb94c0e141cd52`, runtime artifact `10850405881` (`sha256:eb58b673d3d448664cb12bfd280e9c5d3dc98cd0ebd13882e65064e978fd8bd8`), executable SHA256 `DA44F457E9DC52FF0A6914DBD1FBC72614D0FCC248DDCFBD5463578C72D79BF3`. Repository preflight (including Rust tests), Edge visual fixtures, and Tauri release passed. Guarded squash merge `aafa7de082e39afad34f32730f7c83a532805b15` has the same tree as the PR head, `4c63c18da98b07f164a71fed685ef8aff1736863`. Duplicate main CI #506 / run `36130415229` was cancelled after tree identity.
- Windows 10 Pro build 19045; Radeon RX 570; 12 logical processors; one primary `DISPLAY1`, 2560×1080, 96 DPI / 100% scaling, full 2560×1080 working area, bottom auto-hide taskbar. No secondary monitor or alternative DPI/taskbar arrangement was available. The UI checks used the actual CI executables on the active desktop. The performance runs used the same release executables with WebView2 local remote debugging enabled for diagnostic access; this is a measurement caveat.
- The existing roaming database was backed up before testing. Original SHA256: `8271B4CFE1190D2E5952D3C6A969ED71FE4650ACBA2B12F0A7061A310C0F1F4E`. All task/subtask/session changes in this entry used that temporary test copy; restoration is recorded below.

## Physical behavior

| M7 item | Observed result | Remaining boundary |
| --- | --- | --- |
| 7 transition/resize | **Partial PASS.** On #503, three complete real Timer expand/collapse cycles showed one expanded action strip with six buttons and zero collapsed headings, then zero action strips/buttons and one collapsed heading; the native heights were 308 and 118 px. Repeated collapsed screenshots were pixel-identical, with no stale action strip. A subtask was also visible in the expanded state, then absent on collapse and present again on re-expand. Panel ↔ Timer retained the session and had no horizontal overflow at the normal size. | Continuous transition capture, subjective left flash/return flicker, and physical reduced-motion mode transition remain to be completed. |
| 8 alternate shortcut | **Partial PASS.** Ctrl+Shift+T switched Panel/Timer, a rapid repeated press settled to one Timer window, and the paused session ID/elapsed value stayed continuous. | Hotkey ownership conflict/retry diagnostic and more transition-boundary repetition were not completed. |
| 9 Find Timer | **Partial PASS.** Ctrl+Shift+P pulsed the visible Timer once and restored/pulsed the hidden Timer in the same window; Panel mode remained Panel. Pulse nodes disappeared after about 729/726 ms. A real keypress with CDP `prefers-reduced-motion: reduce` emulation produced one pulse removed after about 186 ms. | Windows OS reduced-motion preference itself was not changed. |
| 10 placement | **Partial PASS.** A dragged Timer reopened at the saved position after Panel return and after process restart, with the same paused session ID. | Display topology/resolution/scaling change and no-saved-position physical recovery were not tested. |
| 11 topmost | **Partial PASS.** Timer remained visibly above maximized Edge and Edge F11 fullscreen; the temporary Edge test window was closed afterward. | An independent borderless game/application and exclusive fullscreen were not tested. |
| 12 work area | **Partial PASS.** With a collapsed native Timer near the bottom at `(1800,950)` in the 2560×1080 work area, expand moved the 356×308 outer window to `(1800,772)` so its bottom stayed at 1080; controls remained visible and collapse remained usable. | Secondary monitor, non-default taskbar, narrow/short work area, and high DPI were unavailable. |
| 13 idle motion | **Physical PASS for this one-display configuration.** With `main` destroyed, paused collapsed and expanded surfaces each had zero running DOM animations/pulse nodes and pairs of idle screenshots were byte-identical. The true-idle collapsed surface also had zero running animations. | Recheck after any future visual source change. |

On the #140 executable, an active task was expanded, the native `timer_skip_task` command moved the authoritative session to `idle`, and the real WebView exposed one enabled `Collapse Timer` fallback control. Pressing Enter on it returned the same native Focus window to 356×118 with no action strip, one heading, no horizontal overflow, and timer state still `idle`. This closes the concrete idle-expanded trap found during the #503 session; it does not close the full M7 item-7 gate.

## Resource evidence and interpretation

`scripts/measure-floating.ps1` used 30 seconds warm-up, 60 seconds sampling, one `narro.exe` root and six WebView2 helpers, `main` destroyed, zero process churn and `steadyStateValid: true`. Raw machine-local outputs are under the Codex task's `work/m7-perf-503/` and `work/m7-perf-140/` directories. The older #503 true-idle exploratory runs were expanded: 5.359% of one core, 427.1 MiB working set, 390.3 MiB private; collapsed: 4.561% of one core, 421.0 MiB working set, 372.6 MiB private. Two earlier paused-session expanded runs were 3.163% and 4.639% of one core and do not satisfy the inactive-timer protocol. A 5s/20s hidden-Focus diagnostic sample on #503 read 0% CPU; it is not a canonical floating-visible run. The visible #503 idle WebView had no running DOM animation and accrued negligible JavaScript task/layout/style time over a ten-second DevTools sample. These observations do not establish a single CPU root cause.

The #140 source removes an empty `BEGIN IMMEDIATE` SQLite transaction from each 250 ms notification check and retains a claim re-read under the write reservation when a deliverable effect exists. An executable Rust test holds a competing writer reservation and checks that three empty notification probes remain read-only. This is a contention/correctness improvement. Compare physical CPU below rather than attributing any full process-tree change to that one code change without profiling.

Three #140 **collapsed true-idle** 30s/60s runs were valid with zero churn. Run averages (% one core / working set / private bytes): run 1 `0.000% / 429.76 MiB / 375.19 MiB`; run 2 `0.000% / 429.78 MiB / 375.22 MiB`; run 3 `0.026% / 429.69 MiB / 375.10 MiB`. Medians: `0.000% / 429.76 MiB / 375.19 MiB`. Each run sampled 55 process snapshots.

Three #140 **expanded true-idle** 30s/60s runs were valid with zero churn. Run averages: run 1 `0.026% / 421.45 MiB / 327.56 MiB`; run 2 `0.000% / 421.39 MiB / 327.61 MiB`; run 3 `0.000% / 420.88 MiB / 327.07 MiB`. Medians: `0.000% / 421.39 MiB / 327.56 MiB`. Each run sampled 55 process snapshots. The expanded memory values are lower than the preceding collapsed runs after more process warm time; do not attribute that difference to expansion without a controlled alternating-order experiment.

Detailed run metrics below are **average/min/max**, respectively. CPU values are percentages; memory values are MiB. All six runs had `steadyStateValid: true`, `churnIntervalCount: 0`, and one Narro plus six WebView2 processes.

| State/run | CPU one core | CPU total capacity | Working set | Private bytes |
| --- | --- | --- | --- | --- |
| collapsed/1 | 0.000/0.000/0.000 | 0.0000/0.0000/0.0000 | 429.76/429.71/429.78 | 375.19/375.10/375.24 |
| collapsed/2 | 0.000/0.000/0.000 | 0.0000/0.0000/0.0000 | 429.78/429.77/429.79 | 375.22/375.20/375.25 |
| collapsed/3 | 0.026/0.000/1.396 | 0.0022/0.0000/0.1163 | 429.69/429.54/429.75 | 375.10/375.04/375.12 |
| expanded/1 | 0.026/0.000/1.401 | 0.0022/0.0000/0.1167 | 421.45/421.33/421.47 | 327.56/327.50/327.60 |
| expanded/2 | 0.000/0.000/0.000 | 0.0000/0.0000/0.0000 | 421.39/421.38/421.40 | 327.61/327.59/327.64 |
| expanded/3 | 0.000/0.000/0.000 | 0.0000/0.0000/0.0000 | 420.88/420.65/421.31 | 327.07/326.83/327.54 |

The separate #140 **expanded running count-up timer** run was valid with zero churn and 55 process snapshots: CPU one core `0.155/0.000/1.405%`, total logical capacity `0.0129/0.0000/0.1171%`, working set `432.60/432.00/434.50 MiB`, private bytes `354.86/354.18/355.74 MiB` (average/min/max).

The M1 scaffold medians were 0.026% of one core, 396.21 MiB working set, 325.40 MiB private. Final UI idle CPU on this machine is back near that baseline, while the running timer has a small measured cost. Aggregate working set/private memory are higher in the collapsed runs and closer to baseline in the later expanded runs; these values include shared WebView2 pages and are not unique RAM. There is no defined numeric pass/fail threshold, and the samples alone cannot attribute the CPU change between #503 and #505 solely to the SQLite change. The measured one-display architecture remains viable: no ongoing idle CPU or process churn was observed in the six final-UI idle runs. Re-measure if later source changes long-lived rendering/runtime behavior.

## Remaining M7 gate and profile restoration

Keep top-level M7 items 7–12 open for the stated untested conditions; do not advance to M8. Item 14's current final-UI measurement protocol is complete, subject to remeasurement after future performance-relevant source changes. Preserve the exact source/artifact linkage above.

After the measurements, the exact #505 test process PID `14568` was stopped. There were no Narro processes or SQLite WAL/SHM sidecars. The original roaming `narro.db` was restored from the pre-test backup and its SHA256 was verified as `8271B4CFE1190D2E5952D3C6A969ED71FE4650ACBA2B12F0A7061A310C0F1F4E`, byte-for-byte equal to the starting file. The backup remains available in the Codex task's `work/m7-profile-before-501/` folder. Machine-local generated icon files in the source worktree were kept untracked after an automatic approval review rejected their removal; they are not part of any commit or PR.
