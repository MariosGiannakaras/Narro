import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");
const invariant = (condition, message) => {
  if (!condition) throw new Error(message);
};

const api = read("src/reportsApi.ts");
const rust = read("src-tauri/src/reports_commands.rs");
const lib = read("src-tauri/src/lib.rs");
const pkg = JSON.parse(read("package.json"));

for (const [needle, label] of [
  ['invoke<ReportHistory>("get_report_history"', "typed report history read"],
  ['invoke<ReportSessionMutation>("create_report_manual_session"', "typed manual-session create"],
  ['invoke<ReportSessionMutation>("edit_report_session"', "typed historical-session edit"],
  ['invoke<ReportSessionMutation>("delete_report_session"', "typed historical-session delete"],
  ["durationSeconds: string", "string-safe persisted duration projection"],
  ["timeTakenSeconds: string", "string-safe Time Taken projection"],
]) {
  invariant(api.includes(needle), "Reports renderer API missing " + label);
}

for (const forbidden of ["fetch(", "axios", "http://", "https://", "localStorage", "sessionStorage"]) {
  invariant(!api.includes(forbidden), "Reports API must remain local Tauri IPC only: " + forbidden);
}

for (const [needle, label] of [
  ['pub fn get_report_history(', "history read command"],
  ['pub fn create_report_manual_session(', "manual session command"],
  ['pub fn edit_report_session(', "session edit command"],
  ['pub fn delete_report_session(', "session delete command"],
  ["create_manual_work_session(", "validated manual-session persistence reuse"],
  ["edit_closed_session_if_expected(", "validated stale-safe edit reuse"],
  ["delete_closed_session_if_expected(", "validated stale-safe delete reuse"],
  ['"REPORT_SESSION_LIVE"', "live-session protection code"],
  ['"REPORT_SESSION_STALE"', "stale-write code"],
  ['"REPORT_HISTORY_INVALID_STORED_DATA"', "fail-closed history code"],
]) {
  invariant(rust.includes(needle), "Reports Rust command boundary missing " + label);
}

for (const command of [
  "reports_commands::get_report_history",
  "reports_commands::create_report_manual_session",
  "reports_commands::edit_report_session",
  "reports_commands::delete_report_session",
]) {
  invariant(lib.includes(command), "Tauri handler missing " + command);
}

invariant(
  pkg.scripts["test:ui-reports-api"] === "node scripts/test-ui-reports-api.mjs",
  "Reports API contract script registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-reports-api"),
  "frontend preflight must include Reports API contract",
);

console.log("Reports local command/API contracts: PASS");
