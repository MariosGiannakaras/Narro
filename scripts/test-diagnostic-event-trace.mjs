import { readFile } from "node:fs/promises";

const read = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [trace, lib, topology, placement, app, api, config, workflow] = await Promise.all([
  read("src-tauri/src/diagnostic_trace.rs"),
  read("src-tauri/src/lib.rs"),
  read("src-tauri/src/windows/topology.rs"),
  read("src-tauri/src/floating_placement.rs"),
  read("src/App.tsx"),
  read("src/diagnosticApi.ts"),
  read("src-tauri/tauri.diagnostic.conf.json"),
  read(".github/workflows/ci.yml"),
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

for (const required of [
  'const DIAGNOSTIC_IDENTIFIER: &str = "com.mariosg.Narro.M1Diagnostic"',
  'std::env::temp_dir()',
  '.join("Narro-M1-Diagnostic")',
  'mpsc::channel::<String>()',
  '.name("narro-diagnostic-trace".to_owned())',
  'TRACE_ACTIVE.load(Ordering::Acquire)',
  '"schemaVersion": 1',
  '"runId": &session.run_id',
  '"sequence": session.next_sequence',
  '"utc": chrono::Utc::now().to_rfc3339()',
  '"elapsedMs": session.started.elapsed().as_secs_f64() * 1000.0',
  '"kind": kind',
  '"trace_started"',
  '"trace_stopped"',
  '"operator_marker"',
]) {
  invariant(trace.includes(required), `diagnostic trace writer is missing: ${required}`);
}

for (const forbidden of [
  "taskTitle",
  "listTitle",
  "noteContent",
  "subtaskTitle",
  "payload_json",
]) {
  invariant(!trace.includes(forbidden), `diagnostic trace writer must not contain user-content field: ${forbidden}`);
}

invariant(
  config.includes('"identifier": "com.mariosg.Narro.M1Diagnostic"'),
  "diagnostic trace must remain bound to the isolated M1 diagnostic identifier",
);

for (const required of [
  "pub mod diagnostic_trace;",
  "fn diagnostic_trace_start(",
  "fn diagnostic_trace_status(",
  "fn diagnostic_trace_mark(",
  "fn diagnostic_trace_snapshot(",
  "fn diagnostic_trace_stop(",
  '"runtime_snapshot"',
  '"monitor_enumeration"',
  '"focus_panel_position_requested"',
  '"focus_panel_position_committed"',
  '"focus_panel_placement_probe"',
  '"focus_presentation_requested"',
  '"focus_presentation_committed"',
  '"focus_presentation_failed"',
]) {
  invariant(lib.includes(required), `Rust diagnostic trace integration is missing: ${required}`);
}

for (const command of [
  "diagnostic_trace_start,",
  "diagnostic_trace_status,",
  "diagnostic_trace_mark,",
  "diagnostic_trace_snapshot,",
  "diagnostic_trace_stop,",
]) {
  invariant(lib.includes(command), `Tauri invoke handler is missing trace command: ${command}`);
}

for (const required of [
  '"windows_enter_size_move"',
  '"windows_exit_size_move"',
  '"windows_dpi_changed"',
  '"windows_display_geometry_changed"',
  '"display_recovery_requested"',
  '"display_recovery_completed"',
  '"dpi_region_refresh_requested"',
  '"dpi_region_refresh_applied"',
  'record_diagnostic_runtime_snapshot(',
  '"display-recovery-before"',
  '"display-recovery-after"',
]) {
  invariant(topology.includes(required), `Windows topology trace is missing: ${required}`);
}

for (const required of [
  '"timer_placement_saved"',
  '"timer_placement_restore_requested"',
  '"timer_placement_restored"',
  '"timer_display_recovery_plan"',
  '"timer_display_recovery_completed"',
  '"timer_display_recovery_failed"',
]) {
  invariant(placement.includes(required), `Floating placement trace is missing: ${required}`);
}

for (const required of [
  "type DiagnosticTraceStatus",
  "type DiagnosticRuntimeSnapshot",
]) {
  invariant(api.includes(required), `diagnostic TypeScript API is missing: ${required}`);
}

for (const required of [
  'invoke<DiagnosticTraceStatus>("diagnostic_trace_start")',
  'invoke<DiagnosticTraceStatus>("diagnostic_trace_stop")',
  'invoke<void>("diagnostic_trace_mark"',
  'invoke<DiagnosticRuntimeSnapshot>("diagnostic_trace_snapshot"',
  "Native Event Trace",
  "Capture Native Snapshot",
  "Mark Before Monitor Change",
  "Mark After Monitor Change",
  "No task/list titles, notes, or other user content are",
]) {
  invariant(app.includes(required), `diagnostic Main trace UI is missing: ${required}`);
}

const diagnosticStartup = app.slice(
  app.indexOf("if (diagnosticMode) {"),
  app.indexOf("return () =>", app.indexOf("if (diagnosticMode) {")),
);
invariant(
  diagnosticStartup.includes("void startDiagnosticTrace();"),
  "diagnostic trace must auto-start only inside the explicit diagnostic-mode startup block",
);

invariant(
  workflow.includes("docs/M1_DIAGNOSTIC_EVENT_TRACE.md"),
  "diagnostic artifact must include the native event trace procedure",
);

console.log("M1 diagnostic native event trace contracts passed.");
