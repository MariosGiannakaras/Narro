import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const rust = read("src-tauri/src/list_settings.rs");
const api = read("src/listSettingsApi.ts");
const boardApi = read("src/listBoardApi.ts");
const shell = read("src/AppShell.tsx");
const archivePanel = read("src/ArchivePanel.tsx");
const donePanel = read("src/ArchivedDoneTasksPanel.tsx");
const listPanel = read("src/ArchivedListsPanel.tsx");
const fixture = read("src/archiveVisualFixture.tsx");
const vite = read("vite.config.ts");
const capture = read("scripts/capture-archive-fixtures.ps1");
const validator = read("scripts/validate-archive-captures.mjs");
const packageJson = read("package.json");

for (const [haystack, needle, label] of [
  [rust, "const DONE_ARCHIVE_DAYS: i64 = 60;", "official 60-day done-task archive threshold"],
  [rust, "pub fn archive_stale_done_tasks_at(", "authoritative archive sweep"],
  [rust, "julianday(completed_at) < julianday(?2)", "strict older-than cutoff"],
  [rust, "lists.archived_at IS NULL", "archived-list task exclusion"],
  [rust, "InvalidStoredCompletedTimestamp", "fail-closed stored completion timestamp validation"],
  [rust, "pub struct ArchiveSnapshot", "archive snapshot boundary"],
  [rust, "pub struct ArchivedDoneTaskSummary", "archived done-task projection"],
  [rust, "task_time_taken_seconds(connection, task_id)?", "historical Time Taken projection"],
  [api, "export function getArchiveSnapshot()", "frontend archive snapshot API"],
  [api, 'invoke<ArchiveSnapshot>("get_archived_lists_for_settings")', "existing registered IPC reuse"],
  [boardApi, "await getArchiveSnapshot();", "stale Done sweep before board projection"],
  [shell, "<ArchivePanel />", "production archive destination"],
  [archivePanel, 'data-archive-tab="lists"', "Archived lists segment"],
  [archivePanel, 'data-archive-tab="done"', "Archived done tasks segment"],
  [archivePanel, "Archived done tasks", "source-evidenced done archive label"],
  [archivePanel, "<ArchivedListsPanel", "validated list archive lifecycle reuse"],
  [archivePanel, "<ArchivedDoneTasksPanel", "done archive surface composition"],
  [donePanel, 'placeholder="Search archived tasks"', "archived task search field"],
  [donePanel, "All Lists", "all-lists filter option"],
  [donePanel, 'role="listbox"', "accessible list filter popup"],
  [donePanel, 'data-archived-done-empty="true"', "archived done empty state"],
  [donePanel, "No Archived tasks found", "source-evidenced empty copy"],
  [donePanel, "Completed tasks older than 60 days", "archive age explanation"],
  [donePanel, "toLocaleLowerCase().includes", "renderer-local task/list search"],
  [listPanel, "await restoreListFromSettings(list.id);", "existing list restore behavior retained"],
  [listPanel, "await permanentlyDeleteListFromSettings(deleteTarget.id);", "existing archive-only list delete retained"],
  [fixture, 'mode === "done-results"', "populated archived task fixture"],
  [fixture, 'mode === "done-filter"', "filter-open archived task fixture"],
  [fixture, 'fixtureTab={tab}', "segmented archive fixture"],
  [vite, 'archiveFixture: "archive-fixture.html"', "archive fixture build input"],
  [capture, 'foreach ($archiveMode in @("lists-empty", "done-empty", "done-filter", "done-results"))', "archive Edge capture mode loop"],
  [capture, '$label = "archive-$archiveMode-$theme"', "archive capture label"],
  [validator, "Archive captured DOM contracts: PASS", "archive captured-DOM validator"],
  [packageJson, '"test:ui-archives": "node scripts/test-ui-archives.mjs"', "archive frontend preflight script"],
  [packageJson, "validate-archive-captures.mjs", "Windows archive captured-DOM validation wiring"],
]) {
  requireText(haystack, needle, label);
}

const sweepCall = boardApi.indexOf("await getArchiveSnapshot();");
const boardRead = boardApi.indexOf('invoke<ListBoardSnapshot>("get_list_board_snapshot"', sweepCall);
if (sweepCall < 0 || boardRead < sweepCall) {
  throw new Error("Board projection must run the authoritative done-task archive sweep before reading Done.");
}

for (const forbidden of [
  "restoreListFromSettings",
  "permanentlyDeleteListFromSettings",
  "archiveListFromSettings",
  "fetch(",
  "axios",
  "http://",
  "https://",
]) {
  if (donePanel.includes(forbidden)) {
    throw new Error(`Archived Done Tasks must remain read-only/local in item 26: ${forbidden}`);
  }
}

if (archivePanel.includes("System/Dark/Light") || archivePanel.includes("Reports")) {
  throw new Error("Archive slice must not absorb later theme or Reports implementation scope.");
}

console.log("Archive lists/done-task surface contract checks passed.");
