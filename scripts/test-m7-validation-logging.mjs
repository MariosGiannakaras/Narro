import fs from "node:fs";

function invariant(condition, message) {
  if (!condition) throw new Error(`M7 validation logging contract failed: ${message}`);
}

const logger = fs.readFileSync("src-tauri/src/validation_log.rs", "utf8");
const lib = fs.readFileSync("src-tauri/src/lib.rs", "utf8");
const placement = fs.readFileSync("src-tauri/src/floating_placement.rs", "utf8");
const workflow = fs.readFileSync(".github/workflows/ci.yml", "utf8");
const smoke = fs.readFileSync("scripts/verify-m7-validation-logging.ps1", "utf8");
const docs = fs.readFileSync("docs/M7_AUTOMATIC_VALIDATION_LOGGING.md", "utf8");

for (const required of [
  'const VALIDATION_EXE_STEM: &str = "narro-m7-validation"',
  'const LOG_ROOT_NAME: &str = "Narro-M7-Logs"',
  "events.jsonl",
  "m7-c5-latest-result.json",
  "pending-c5.json",
  '"PASS"',
  '"FAIL"',
  '"INCONCLUSIVE"',
  "QUALIFYING_MOVE_PX",
  "RESTORE_TOLERANCE_PX",
  "monitor_snapshots",
  "record_timer_move",
  "focus-window-moved",
  "acceptedForPersistence",
  "record_focus_close_requested",
  "record_placement_saved",
  "record_tray_quit_completed",
  "record_timer_restore",
  "topology_signature",
  "NARRO_VALIDATION_SOURCE_SHA",
  "executable_fingerprint",
  "executableFingerprint",
  "validation-executable-bytes-changed-between-quit-and-restart",
]) invariant(logger.includes(required), `logger is missing ${required}`);

invariant(
  logger.includes("validation_executable()")
    && logger.includes("eq_ignore_ascii_case(VALIDATION_EXE_STEM)"),
  "logging activation must be fail-closed to the explicitly renamed validation executable",
);

for (const forbidden of [
  "task_title",
  "taskTitle",
  "task_description",
  "list_name",
  "listName",
  "board_task",
  "reqwest",
  "ureq",
  "http://",
  "https://",
]) {
  invariant(!logger.includes(forbidden), `validation logger must not capture product content or network telemetry: ${forbidden}`);
}

for (const required of [
  "validation_log::initialize(app)",
  "validation_log::record_single_instance_attempt(app_handle)",
  "validation_log::record_timer_move(",
  "validation_log::record_focus_close_requested(window.app_handle())",
  "validation_log::record_tray_quit_requested(app_handle)",
  "validation_log::record_tray_quit_completed(",
  "validation_log::record_presentation(app_handle, presentation.event_name())",
]) invariant(lib.includes(required), `runtime boundary is missing validation hook ${required}`);

invariant(
  placement.includes("crate::validation_log::record_placement_saved(app_handle, &saved)")
    && placement.includes("crate::validation_log::record_timer_restore("),
  "placement persistence and restore must feed the structured evaluator directly",
);

for (const required of [
  "NARRO_VALIDATION_SOURCE_SHA",
  "narro-m7-validation.exe",
  "Verify M7 Automatic Validation Logging",
  "scripts/verify-m7-validation-logging.ps1",
  "narro-m7-validation-windows-x64",
]) invariant(workflow.includes(required), `Windows CI packaging is missing ${required}`);

for (const required of [
  "validation-start",
  "session.json",
  "events.jsonl",
  "m7-c5-result.json",
  "localOnly",
  "uploadsAutomatically",
  "recordsTaskContent",
]) invariant(smoke.includes(required), `Windows smoke is missing ${required}`);

invariant(
  docs.includes("PASS")
    && docs.includes("FAIL")
    && docs.includes("INCONCLUSIVE")
    && docs.includes("No PowerShell setup is required")
    && docs.includes("does **not** record task titles"),
  "user procedure must explain automatic logging, privacy, and evaluator semantics",
);

console.log("M7 automatic validation logging contracts passed.");
