# M1 final replacement physical batch

This procedure batches the remaining real-Windows validation for the reopened
single-`focusSurface` Milestone 1 so the user does not need multiple separate
sessions.

Use the current production runtime baseline from CI #809. PR #209 changed only a
static regression contract and no production/runtime source, so the accepted
CI #809 physical executable remains valid for these observations.

## Candidate

- CI #809 run: `36865451660`
- physical artifact id: `11163439039`
- artifact digest:
  `sha256:39ca0a91d7aa54be79ca35c509f82f25049a15a3fc4ffff199699eab309557a5`
- standalone `narro.exe` SHA-256:
  `a4b8e163539f429769540480a7aa0b5db9ca6fa2c356d6742f78d687b5cb5675`
- production runtime source:
  `2767b3827670603d1ab259b6a843c2e0da82d85d`

PR #209 / CI #811 regression-lock evidence:
- PR head `5384ea7384d304a843771e225bfb50cd9394bf43`
- Windows CI #811 / run `36973948214`: PASS
- merged test-contract commit:
  `c84013dbafbce6c8d581e3e12e1793bb12281fd1`
- production runtime bytes unchanged

## Batch A — saved Timer placement across normal restart

This is the only remaining M7 C5 observation.

1. Start/keep one real active task and show the compact Floating Timer.
2. Drag it to an obvious safe non-default location.
3. Use tray **Quit Narro**.
4. Relaunch the same CI #809 `narro.exe`.
5. Show/reopen the Timer for the recovered/live task as applicable.
6. PASS if the Timer returns to a safe visible saved position and is not
   stranded/off-screen.

A short continuous recording is sufficient.

## Batch B — Focus Panel selected-monitor left/right placement

Use two enabled monitors.

1. Show Focus Panel.
2. Refresh/select monitor 1 and position Panel Left, then Right.
3. Select monitor 2 and position Panel Left, then Right.
4. PASS if the same persistent `focusSurface` moves to the chosen monitor's
   correct work-area edge each time and remains fully reachable.
5. Confirm only `main` + `focusSurface` exist; no third Timer WebView.

Record:
- monitor 1 Left: PASS/FAIL
- monitor 1 Right: PASS/FAIL
- monitor 2 Left: PASS/FAIL
- monitor 2 Right: PASS/FAIL

## Batch C — reconnect / re-enumeration closure

CI #809 already proves real display removal and safe recovery. Only the
reconnect/re-enumeration side of the strict M1 wording remains.

1. Start from two displays enabled.
2. With Narro still running, disable/disconnect the secondary display.
3. Re-enable/reconnect it without restarting Narro.
4. Refresh monitor enumeration.
5. PASS if Narro remains responsive, both displays are listed again with
   plausible geometry/scaling, and Focus Panel can be placed Left/Right on the
   reconnected display.

If convenient, change the reconnected display from right-of-primary to
left-of-primary before refreshing; negative desktop coordinates are valid.

## Batch D — replacement floating-only CPU/RAM

This is measurement evidence, not a screen recording.

Run from the repository on a real Windows 10/11 x64 machine using the validated
runtime:

1. Launch Narro and let startup settle.
2. Put `focusSurface` in Floating Timer presentation.
3. Leave timer/session inactive; no animations or user interaction.
4. Destroy `main` through the diagnostic/runtime harness; do not merely hide it.
5. Confirm exactly one `narro.exe` root process.
6. Run:

```powershell
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts/measure-floating.ps1 -WarmupSeconds 30 -SampleSeconds 60 -IntervalSeconds 1
```

Repeat until **three valid runs** satisfy:
- `scenario = floating-only-main-destroyed`;
- `steadyStateValid = true`;
- `churnIntervalCount = 0`.

Return the three generated `summary.json` files. Raw CSVs are useful only if a
run fails or needs diagnosis.

The agent will compute/report:
- per-run average/min/max CPU % of one core and total capacity;
- working-set and private-byte averages/min/max;
- median run averages;
- WebView2/Narro process contributors;
- comparison against the historical superseded baseline;
- whether the replacement two-WebView architecture is acceptably lightweight
  or warrants the documented native-overlay fallback review.

## Closure order

If Batch A passes:
- M7 C5 can close immediately after tracking reconciliation.

Milestone 1 itself remains open until B/C/D are also complete.

Do not repeat already accepted CI #809 tests:
- compositor/white-L transition;
- Panel/Timer continuity;
- Blitz now;
- idle shortcuts;
- second launch;
- mixed-DPI Timer crossing;
- bottom-edge expansion;
- display-removal recovery;
- topmost over maximized app.
