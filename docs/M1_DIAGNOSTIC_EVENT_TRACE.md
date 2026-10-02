# M1 diagnostic native event trace

The isolated M1 diagnostic build can record a machine-readable native event trace
alongside the physical screen recording.

Purpose: make real-Windows validation evidence two-layered:

1. **video** — what the user actually sees;
2. **JSONL trace** — what the Narro native/runtime layer actually observed and
   committed at the same time.

The trace does not replace a physical visual gate. It makes ambiguous failures,
monitor changes, placement decisions, DPI transitions and rollback paths
diagnosable without guessing from pixels alone.

## Isolation

Tracing is gated to the exact Tauri identifier:

`com.mariosg.Narro.M1Diagnostic`

The normal production identifier `com.mariosg.Narro` cannot start a trace
session through the diagnostic command.

The diagnostic Main starts tracing automatically. Runtime hooks have an atomic
inactive fast-path, so normal production runs return before taking the trace
mutex or queue.

Trace output is written under the current user's temporary directory:

`%TEMP%\Narro-M1-Diagnostic\<run-id>\events.jsonl`

The diagnostic UI displays the exact run id, directory and trace path.

## Privacy/content boundary

The trace records native/runtime metadata only. Do not add:
- task titles;
- list titles;
- notes;
- subtask text;
- reminder text;
- arbitrary persisted payloads.

It may record:
- window labels;
- presentation names;
- physical positions/sizes;
- monitor descriptors, work areas and scale factors;
- native display/DPI event metadata;
- placement save/restore geometry;
- pass/fail probe results;
- stable machine error codes/messages;
- process id and diagnostic app version;
- operator markers chosen from the fixed diagnostic UI.

Monitor names may be present because they are part of Windows topology identity.

## Record format

One JSON object per line.

Common envelope:

```json
{
  "schemaVersion": 1,
  "runId": "20261002-120000Z-<uuid>",
  "sequence": 42,
  "utc": "2026-10-02T12:00:05.123Z",
  "elapsedMs": 5123.4,
  "kind": "focus_panel_placement_probe",
  "data": {}
}
```

The writer runs on a background thread and flushes each complete line. Native
Windows callbacks enqueue trace data; they do not perform synchronous file I/O.

## Event families

### Session / operator correlation
- `trace_started`
- `trace_stopped`
- `operator_marker`
- `runtime_snapshot`
- `runtime_snapshot_failed`

### Focus presentation
- `focus_presentation_requested`
- `focus_presentation_committed`
- `focus_presentation_noop`
- `focus_presentation_restored_hidden_timer`
- `focus_presentation_failed`

### Monitor / Panel placement
- `monitor_enumeration`
- `focus_panel_position_requested`
- `focus_panel_position_committed`
- `focus_panel_placement_probe`

The placement probe records the selected monitor descriptor, requested side,
expected position, actual HWND position/size, visibility, committed
presentation, edge alignment, work-area containment and final PASS/FAIL.

### Windows topology / DPI
- `windows_enter_size_move`
- `windows_exit_size_move`
- `windows_dpi_changed`
- `windows_display_geometry_changed`
- `display_recovery_requested`
- `display_recovery_completed`
- `dpi_region_refresh_requested`
- `dpi_region_refresh_applied`
- `dpi_region_refresh_failed`
- `display_recovery_timer_save_failed`

A `runtime_snapshot` is recorded before and after display recovery so monitor
enumeration and Focus HWND geometry can be compared directly.

### Floating Timer placement
- `timer_placement_saved`
- `timer_placement_restore_requested`
- `timer_placement_restored`
- `timer_display_recovery_plan`
- `timer_display_recovery_completed`
- `timer_display_recovery_failed`

These events contain only geometry/topology metadata.

## Physical-use procedure

For selected-monitor placement / reconnect testing:

1. launch the current validated **M1 diagnostic artifact**;
2. expand **Windows diagnostic controls**;
3. confirm **Native Event Trace = recording**;
4. optionally click **Capture Native Snapshot**;
5. immediately before a manual display change click
   **Mark Before Monitor Change**;
6. perform the physical action;
7. after Windows settles click **Mark After Monitor Change**;
8. continue the normal placement probe;
9. click **Stop Trace** before closing Narro;
10. return both:
   - the screen recording;
   - the trace run's `events.jsonl`.

The video and JSONL use independent timestamps. The trace includes UTC and
monotonic elapsed milliseconds so the two sources can be correlated by visible
operator markers/actions.

## Performance measurement exception

Stop the event trace **before** the M1 floating-only CPU/RAM batch.

Performance evidence must use
`scripts/run-m1-floating-performance-batch.ps1` with the Main webview destroyed.
That sampler already produces precise process-tree CPU/memory evidence. Keeping a
diagnostic trace writer alive during the steady-state sample would add avoidable
measurement overhead.

## Acceptance semantics

Trace evidence can:
- prove exact monitor geometry/DPI observed by Narro;
- prove which presentation was committed;
- prove native placement expected vs actual values;
- prove save/restore geometry and recovery decisions;
- identify exact failure/rollback paths;
- disambiguate otherwise unclear visual recordings.

Trace evidence alone does **not** convert a required physical visual observation
to PASS. Where the milestone requires a real desktop observation, both layers
remain part of the evidence package.
