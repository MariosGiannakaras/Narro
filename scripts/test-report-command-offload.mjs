import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Each real Tauri command must own the offload, not merely call a helper that
// happens to exist elsewhere. Blocking SQLite/IO belongs after the move closure.
const rust = readFileSync(new URL("../src-tauri/src/report_commands.rs", import.meta.url), "utf8")
  .replace(/\r\n?/g, "\n");
const readCommands = [
  "get_report_history",
  "get_report_overview",
  "get_focus_done_breaks",
  "get_report_sessions",
  "get_report_task_sessions",
  "export_report_sessions_csv",
  "export_report_overview_pdf",
];
const writeCommands = [
  "create_manual_report_session",
  "edit_report_session",
  "delete_report_session",
];
function commandBody(name) {
  const signature = "pub async fn " + name + "(";
  const start = rust.indexOf(signature);
  assert(start >= 0, name + " must be async (not a blocking Tauri command)");
  const end = rust.indexOf("\n}\n", start);
  assert(end > start);
  const body = rust.slice(start, end);
  assert(!rust.includes("pub fn " + name + "("), "sync duplicate for " + name);
  return body;
}
for (const name of readCommands) {
  const body = commandBody(name);
  assert.match(body, /crate::blocking_read::read\("[^"]+", move \|\| \{/,
    name + " must move blocking work to the existing bounded worker");
  assert.match(body, /\n    \.await\??;?|\n    \.await\b/,
    name + " must await the read result");
  const worker = body.indexOf("move || {");
  const database = body.indexOf("app_database(&app_handle)");
  if (database >= 0) {
    assert(database > worker, name + " database open must happen on the worker");
  }
  if (name === "export_report_overview_pdf") {
    assert(body.indexOf("write_unique_export(") > worker,
      "PDF persistence must occur after capture and off the async input loop");
  }
}
for (const name of writeCommands) {
  const body = commandBody(name);
  assert.match(body, /run_manual_session_write\(move \|\| \{/,
    name + " must use the same native-thread-safe committed-result worker");
  assert.match(body, /\.await\b/);
  assert(body.indexOf("app_database(&app_handle)") > body.indexOf("move || {"),
    name + " database transaction must be on the blocking worker");
}
const edit = commandBody("edit_report_session");
const remove = commandBody("delete_report_session");
for (const body of [edit, remove]) {
  assert(body.indexOf("invalidate_live_time_taken(&app_handle)") > body.indexOf(".map_err(map_session_error)?"),
    "post-commit invalidation must remain after a successful versioned mutation");
  assert.match(body, /expected_updated_at/, "CAS version must remain in command path");
}
assert.match(rust, /locked_manual_write_yields_and_commits_once_before_returning/,
  "real SQLite contention and durable one-write regression must remain");
assert.match(rust, /manual_write_worker_preserves_domain_errors/,
  "worker cannot flatten domain/rejection errors");
console.log("Report command offload: all read/export/edit/delete owners, CAS and existing real-lock worker regression contracts PASS");
