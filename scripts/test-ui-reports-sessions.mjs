import fs from "node:fs";

function invariant(condition, message) {
  if (!condition) throw new Error("Reports Sessions production contract failed: " + message);
}

const workspace = fs.readFileSync("src/ReportsWorkspace.tsx", "utf8");
const overview = fs.readFileSync("src/ReportsOverview.tsx", "utf8");
const sessions = fs.readFileSync("src/ReportsSessions.tsx", "utf8");
const view = fs.readFileSync("src/ReportsSessionsView.tsx", "utf8");
const api = fs.readFileSync("src/reportsApi.ts", "utf8");
const reporting = fs.readFileSync("src-tauri/src/reporting.rs", "utf8");
const commands = fs.readFileSync("src-tauri/src/report_commands.rs", "utf8");
const shell = fs.readFileSync("src/AppShell.tsx", "utf8");
const searchApi = fs.readFileSync("src/searchPaletteApi.ts", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

for (const [haystack, needle, label] of [
  [workspace, '<ReportsSessions', "production Sessions workspace branch"],
  [workspace, '<ReportsOverview', "production Overview workspace branch"],
  [overview, "onOpenSessions={onOpenSessions}", "Overview-to-Sessions tab routing"],
  [shell, '<ReportsWorkspace', "Reports destination workspace routing"],
  [sessions, "getReportSessions(", "authoritative Sessions read"],
  [sessions, "getReportTaskSessions(", "all-history task detail read"],
  [sessions, "createManualReportSession(", "authoritative Add Session mutation"],
  [sessions, "editReportSession(", "authoritative session edit mutation"],
  [sessions, "deleteReportSession(", "authoritative session delete mutation"],
  [sessions, "expectedUpdatedAt: raw.updatedAt", "stale-safe edit/delete token use"],
  [sessions, "await refreshSessions()", "authoritative Sessions refetch after mutation"],
  [sessions, "await refreshDetail(detailTaskId)", "authoritative detail refetch after mutation"],
  [sessions, "usePreferenceSettingsProjection()", "Preferences timezone projection"],
  [sessions, "zonedReportDateTimeIso(", "timezone-correct local session mutation"],
  [sessions, "getSearchPaletteData()", "reuse of authoritative task picker data"],
  [searchApi, 'getListBoardSnapshot({ kind: "all" })', "existing All Lists task index reuse"],
  [view, ">Sessions <span>Beta</span>", "Sessions Beta tab"],
  [view, "Export .csv", "current Sessions export label"],
  [view, "Hide Break sessions", "break visibility filter"],
  [view, 'placeholder="Select tasks..."', "Add Session task search"],
  [view, ">Recent Tasks<", "Add Session recent task heading"],
  [sessions, "row.taskSessionOrdinal", "task-relative session presentation"],
  [view, 'type="time"', "inline time editing"],
  [view, 'aria-label="Save session end time"', "explicit green-check commit affordance"],
  [view, "ReportTaskSessionsDialog", "task session-detail overlay"],
  [reporting, "pub updated_at: String", "read-model session version token"],
  [reporting, "s.updated_at", "SQLite session version projection"],
  [commands, "updated_at: value.updated_at", "version token Tauri serialization"],
  [api, "updatedAt: string;", "typed version token"],
]) {
  invariant(haystack.includes(needle), label);
}

invariant(
  !sessions.includes("setInterval("),
  "Sessions must not poll or become a second report authority",
);
invariant(
  !sessions.includes("totalFocusSeconds +") && !sessions.includes("totalSessions +"),
  "Sessions totals must be refetched rather than client-mutated",
);
invariant(
  view.includes('row.ordinalLabel ?? (row.kind === "break" ? "Break" : "—")'),
  "break rows must not invent a task-session ordinal",
);
invariant(
  pkg.scripts["test:ui-reports-sessions"] === "node scripts/test-ui-reports-sessions.mjs",
  "Sessions test script registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-reports-sessions"),
  "frontend preflight must include production Sessions contracts",
);

console.log("Reports Sessions production contracts: PASS");
