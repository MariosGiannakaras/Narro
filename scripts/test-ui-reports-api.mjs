import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const commands = read("src-tauri/src/report_commands.rs");
const reporting = read("src-tauri/src/reporting.rs");
const sessions = read("src-tauri/src/persistence/sessions.rs");
const sessionReporting = read("src-tauri/src/session_reporting.rs");
const lib = read("src-tauri/src/lib.rs");
const api = read("src/reportsApi.ts");
const packageJson = read("package.json");

for (const [haystack, needle, label] of [
  [commands, "report_history_snapshot(&connection, range)", "validated history read delegation"],
  [commands, "report_overview(&connection, range, &display_timezone)", "validated Overview aggregation delegation"],
  [commands, "load_sessions_report(&connection, range, show_break_sessions)", "validated Sessions projection delegation"],
  [commands, '"REPORT_EXPORT_FAILED"', "stable local report export failure code"],
  [commands, "app_handle.path().download_dir()", "local Downloads export target"],
  [commands, "OpenOptions::new().write(true).create_new(true)", "non-overwriting local export creation"],
  [commands, "load_task_sessions_detail(&connection, task_id)", "all-history task Sessions detail delegation"],
  [commands, "create_manual_work_session(", "manual-session persistence delegation"],
  [commands, "edit_closed_session_if_expected(", "stale-safe edit persistence delegation"],
  [commands, "delete_closed_session_if_expected(", "stale-safe delete persistence delegation"],
  [commands, 'CommandError::new("REPORT_READ_FAILED"', "stable report read failure code"],
  [commands, '"displayTimezone"', "stable display-timezone invalid-argument field"],
  [commands, 'CommandError::new("REPORT_SESSION_STALE"', "stable stale session code"],
  [commands, 'CommandError::new("REPORT_SESSION_LIVE"', "stable live session protection code"],
  [commands, 'CommandError::new("REPORT_SESSION_MUTATION_FAILED"', "stable mutation failure code"],
  [commands, "chrono::Utc::now().to_rfc3339()", "Rust-owned mutation timestamp"],
  [commands, "duration_seconds: value.duration_seconds.to_string()", "lossless session duration IPC"],
  [commands, "updated_at: value.updated_at", "historical session version IPC"],
  [commands, "time_taken_seconds: value.time_taken_seconds.to_string()", "lossless Time Taken IPC"],
  [reporting, "pub fn report_history_snapshot(", "validated report history boundary"],
  [reporting, "pub fn report_overview(", "validated report Overview aggregation boundary"],
  [reporting, "pub list_ids: Vec<ListId>", "multi-select report range authority"],
  [sessionReporting, "pub fn load_sessions_report(", "validated Sessions read boundary"],
  [sessionReporting, "pub fn load_task_sessions_detail(", "validated task Sessions detail boundary"],
  [sessionReporting, "sessions_for_task(conn, task_id)", "all-history session ordinal authority"],
  [sessionReporting, "task_session_ordinal", "task-relative session ordinal contract"],
  [sessionReporting, "rows.reverse();", "reverse-chronological Sessions presentation"],
  [sessions, "pub fn create_manual_work_session(", "validated manual session boundary"],
  [sessions, "pub fn edit_closed_session_if_expected(", "validated historical edit boundary"],
  [sessions, "pub fn delete_closed_session_if_expected(", "validated historical delete boundary"],
  [sessions, "OpenSessionMutation", "open live session mutation protection"],
  [lib, "pub mod report_commands;", "report command module registration"],
  [lib, "report_commands::get_report_history,", "history command registration"],
  [lib, "report_commands::get_report_overview,", "Overview command registration"],
  [lib, "report_commands::get_report_sessions,", "Sessions command registration"],
  [lib, "report_commands::export_report_sessions_csv,", "Sessions CSV export registration"],
  [lib, "report_commands::get_report_task_sessions,", "task Sessions detail command registration"],
  [lib, "report_commands::create_manual_report_session,", "manual session command registration"],
  [lib, "report_commands::edit_report_session,", "session edit command registration"],
  [lib, "report_commands::delete_report_session,", "session delete command registration"],
  [api, 'invoke<ReportHistory>("get_report_history"', "typed history invoke"],
  [api, 'invoke<ReportOverview>("get_report_overview"', "typed Overview invoke"],
  [api, 'invoke<ReportSessions>("get_report_sessions"', "typed Sessions invoke"],
  [api, 'invoke<ReportExportResult>("export_report_sessions_csv"', "typed Sessions CSV export invoke"],
  [api, 'invoke<ReportTaskSessionsDetail>("get_report_task_sessions"', "typed task Sessions detail invoke"],
  [api, "listIds: string[];", "typed multi-select report filter"],
  [api, "taskSessionOrdinal: string | null;", "lossless task-relative session ordinal type"],
  [api, 'invoke<ReportSessionMutation>("create_manual_report_session"', "typed manual session invoke"],
  [api, 'invoke<ReportSessionMutation>("edit_report_session"', "typed session edit invoke"],
  [api, 'invoke<ReportSessionMutation>("delete_report_session"', "typed session delete invoke"],
  [api, "durationSeconds: string;", "lossless output duration type"],
  [api, "updatedAt: string;", "stale-safe historical session version token"],
  [api, "timeTakenSeconds: string;", "lossless completed-task total type"],
  [api, "totalTimeSeconds: string;", "lossless Overview total-time type"],
  [api, "workSeconds: string;", "lossless Time By List duration type"],
  [api, "differenceSeconds: string;", "lossless punctuality difference type"],
  [packageJson, '"test:ui-reports-api"', "reports API preflight script"],
]) {
  requireText(haystack, needle, label);
}

for (const forbidden of [
  "INSERT INTO sessions",
  "UPDATE sessions",
  "DELETE FROM sessions",
]) {
  if (commands.includes(forbidden)) {
    throw new Error(`Renderer-facing report commands must not own raw session SQL: ${forbidden}`);
  }
}

if (api.includes("setInterval") || api.includes("setTimeout")) {
  throw new Error("Reports API must remain invoke-driven and must not add renderer polling.");
}

if (commands.includes("TimerService") || commands.includes("timer_")) {
  throw new Error("Historical report commands must not mutate or proxy the live timer authority.");
}

console.log("Reports history/session command API contracts passed.");
