# M1 final replacement physical batch

This procedure batches the remaining real-Windows validation for the reopened
single-`focusSurface` Milestone 1 so the user does not need multiple separate
sessions.

Use **two intentionally separate candidates**:

- **Batch A / M7 saved-placement acceptance:** use the already accepted CI #809
  **production physical artifact**.
- **Batches B/C/D / reopened M1 diagnostics and measurement:** use the
  **current validated Candidate B diagnostic artifact listed below**. Never use
  an unvalidated PR-branch executable.

Do not swap these candidates. The diagnostic build is for M1 testing convenience
and does not replace the production candidate for M7 physical acceptance.

Before any Candidate B test, **fully quit Candidate A / any production Narro**.
The diagnostic build intentionally uses a different Tauri identifier so its
SQLite/WebView data is isolated, but both executables are still named
`narro.exe` and both can own global shortcuts. B/C/D evidence is valid only
with the diagnostic build as the sole Narro process.

After launching Candidate B, open **Diagnostic Build Identity** first and require:

- runtime identifier exactly `com.mariosg.Narro.M1Diagnostic`;
- **Storage isolation: PASS**;
- resolved app-data/local-data paths shown under the diagnostic namespace.

If that check fails, stop: do not run B/C/D and do not create/edit test data.

## Candidate A — M7 production physical artifact

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

## Candidate B — M1 diagnostic artifact

**PENDING final #212 resulting-main validation. Do not use the older CI #816
diagnostic artifact for B/C/D.**

CI #816 remains valid evidence for the earlier performance batch runner, but it
predates the diagnostic data-namespace isolation, runtime storage-identity
probe, native monitor placement verdict and floating-scenario preflight added by
PR #212.

Before physical B/C/D begins, this section must be reconciled with the exact
resulting-main artifact after #212 passes:
- exact merged implementation SHA;
- Windows main CI run;
- diagnostic artifact id/name;
- ZIP SHA-256;
- contained diagnostic `narro.exe` SHA-256.

Required Candidate B properties:
- runtime Tauri identifier `com.mariosg.Narro.M1Diagnostic`;
- Main `index.html?diagnostics=1`;
- product `focusSurface` `focus.html`;
- no `runtimeVisual`;
- native Focus Panel placement probe;
- runtime storage identifier/path probe;
- `measure-floating.ps1`;
- `run-m1-floating-performance-batch.ps1`;
- `verify-m1-floating-performance-scenario.ps1`;
- M1 Windows validation docs.

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

Use **Candidate B / current validated diagnostic artifact** with two enabled
monitors.

The diagnostic Monitor section shows:
- current **Available monitors** count;
- all native monitor descriptors/work areas;
- the selected monitor descriptor;
- after each Left/Right action, a read-only native **Placement probe** containing
  expected coordinates, actual `focusSurface` coordinates/size, edge alignment,
  work-area containment, current presentation/visibility and one PASS/FAIL.

Procedure:

1. Show Focus Panel.
2. Refresh Monitors and confirm both displays appear.
3. Select monitor 1 and click Position Focus Panel Left.
4. Record the visible Panel and require `Placement probe: PASS`.
5. Click Position Focus Panel Right and again require PASS.
6. Repeat Left/Right on monitor 2.

The native probe is evidence support, not a substitute for seeing that the Panel
is actually reachable on the intended physical display.

Record:
- monitor 1 Left: PASS/FAIL
- monitor 1 Right: PASS/FAIL
- monitor 2 Left: PASS/FAIL
- monitor 2 Right: PASS/FAIL

## Batch C — reconnect / re-enumeration closure

Use **Candidate B / current validated diagnostic artifact**. CI #809 already
proves real display removal and safe recovery; this batch closes the stricter
reconnect/re-enumeration wording.

1. Start from two displays enabled and press Refresh Monitors.
2. Confirm `Available monitors: 2` (or the actual enabled-display count) and
   keep the all-descriptors section visible for evidence.
3. With Narro still running, disable/disconnect the secondary display.
4. Press Refresh Monitors. The count/descriptors must update to the surviving
   topology; no stale placement PASS should remain.
5. Re-enable/reconnect the display without restarting Narro.
6. Press Refresh Monitors again. The restored display must reappear with
   plausible geometry/scaling.
7. Select the restored monitor and position Focus Panel Left and Right; each
   native Placement probe must report PASS and the Panel must be physically
   reachable on that display.

If convenient, change the reconnected display from right-of-primary to
left-of-primary before refreshing; negative desktop coordinates are valid and
will be visible directly in the monitor descriptors.

## Batch D — replacement floating-only CPU/RAM

Use **Candidate B / final #212 resulting-main diagnostic artifact**. This is
measurement evidence, not a screen recording.

The diagnostic artifact contains the single-run sampler, the preferred
three-run batch runner, and a native Win32 scenario preflight.

1. Fully quit the production Narro first; only the isolated diagnostic
   `narro.exe` may be running.
2. Launch the diagnostic build and let startup settle.
3. Put `focusSurface` in **compact Floating Timer** presentation.
4. Leave timer/session inactive; no animations or user interaction.
5. Click **Destroy Main** in diagnostic controls. Do not use Hide Main.
6. From the extracted artifact directory run one command, substituting the
   Candidate B EXE SHA-256 listed above:

```powershell
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File scripts/run-m1-floating-performance-batch.ps1 -RunCount 3 -WarmupSeconds 30 -SampleSeconds 60 -IntervalSeconds 1 -ExpectedExecutableSha256 <FINAL_CANDIDATE_B_EXE_SHA256>
```

Do not interact with Narro while the batch is running. Before every measurement,
the runner automatically rejects duplicate Narro roots, an existing Main HWND,
a hidden Focus window, or any Focus native region that is not the compact
340×110 logical Timer at the current DPI. It then performs the three required
measurements and rejects process churn/invalid summaries/hash mismatch. It
writes:

- `run-01/scenario-preflight.json` + `summary.json` + raw CSVs;
- `run-02/...`;
- `run-03/...`;
- one `batch-summary.json` containing all run metrics and median run averages.

Return `batch-summary.json`. If the runner fails, also return the failed
run directory / raw CSVs so the failure can be diagnosed.

The agent will report:
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
