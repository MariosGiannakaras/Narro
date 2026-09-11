import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const rust = read("src-tauri/src/list_settings.rs");
const persistence = read("src-tauri/src/persistence/lists.rs");
const lib = read("src-tauri/src/lib.rs");
const api = read("src/listSettingsApi.ts");
const shell = read("src/AppShell.tsx");
const home = read("src/HomeDashboard.tsx");
const panel = read("src/ArchivedListsPanel.tsx");
const dialog = read("src/ListMutationConfirmDialog.tsx");
const fixture = read("src/listSettingsVisualFixture.tsx");
const vite = read("vite.config.ts");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-list-settings-captures.mjs");
const packageJson = read("package.json");

for (const [haystack, needle, label] of [
  [persistence, "pub fn archive_list(", "M2 archive persistence boundary"],
  [persistence, "pub fn restore_list(", "M2 restore persistence boundary"],
  [persistence, "pub fn permanently_delete_list(", "M2 permanent-delete persistence boundary"],
  [persistence, "MustArchiveBeforePermanentDelete", "archive-first permanent-delete guard"],
  [rust, "archive_list(&mut connection, id, now)?;", "settings archive reuse of persistence boundary"],
  [rust, "restore_list(&mut connection, id, now)?;", "settings restore reuse of persistence boundary"],
  [rust, "permanently_delete_list(&mut connection, id)?;", "settings delete reuse of persistence boundary"],
  [rust, "cleanup_owned_icon_after_commit", "post-commit owned icon cleanup"],
  [rust, "refusing to remove non-owned list icon path", "non-owned icon cleanup refusal"],
  [rust, '"LIST_SETTINGS_MUST_ARCHIVE"', "typed archive-first renderer failure"],
  [rust, "pub fn get_archived_lists_for_settings", "archived-list renderer command"],
  [rust, "pub fn archive_list_from_settings", "archive renderer command"],
  [rust, "pub fn restore_list_from_settings", "restore renderer command"],
  [rust, "pub fn permanently_delete_list_from_settings", "permanent-delete renderer command"],
  [lib, "pub mod list_settings;", "list settings module registration"],
  [lib, "list_settings::get_archived_lists_for_settings,", "archived-list handler registration"],
  [lib, "list_settings::archive_list_from_settings,", "archive handler registration"],
  [lib, "list_settings::restore_list_from_settings,", "restore handler registration"],
  [lib, "list_settings::permanently_delete_list_from_settings,", "delete handler registration"],
  [api, 'invoke<ArchivedListSummary[]>("get_archived_lists_for_settings")', "archived-list frontend IPC"],
  [api, 'invoke<void>("archive_list_from_settings"', "archive frontend IPC"],
  [api, 'invoke<void>("restore_list_from_settings"', "restore frontend IPC"],
  [api, 'invoke<void>("permanently_delete_list_from_settings"', "delete frontend IPC"],
  [shell, "onArchive: () => requestArchive(list)", "real Home Archive target"],
  [shell, "await archiveListFromSettings(archiveTarget.id);", "persistence-first active archive"],
  [shell, 'activeDestination === "archived-lists"', "production archived-list destination"],
  [shell, "<ArchivedListsPanel />", "production archived-list management surface"],
  [home, "actions?.onArchive", "callback-gated Archive List menu action"],
  [panel, "await restoreListFromSettings(list.id);", "persistence-first restore"],
  [panel, "await permanentlyDeleteListFromSettings(deleteTarget.id);", "persistence-first permanent delete"],
  [panel, 'data-archived-lists-panel="true"', "archived-list panel marker"],
  [panel, "Permanently delete", "archived permanent-delete control"],
  [dialog, 'role="dialog"', "confirmation dialog semantics"],
  [dialog, 'aria-modal="true"', "confirmation modal semantics"],
  [dialog, 'event.key === "Escape"', "confirmation Escape handling"],
  [dialog, 'event.key !== "Tab"', "confirmation Tab containment"],
  [dialog, "openerRef.current?.focus()", "confirmation focus restoration"],
  [fixture, 'mode === "delete"', "delete confirmation runtime fixture"],
  [vite, 'listSettingsFixture: "list-settings-fixture.html"', "list settings fixture build input"],
  [capture, "list-settings-archive", "archive confirmation Edge capture"],
  [capture, "list-settings-archived", "archived management Edge capture"],
  [capture, "list-settings-delete", "delete confirmation Edge capture"],
  [validator, "List settings captured DOM contracts: PASS", "captured DOM validator"],
  [packageJson, '"test:ui-list-settings": "node scripts/test-ui-list-settings.mjs"', "frontend list-settings preflight script"],
  [packageJson, "validate-list-settings-captures.mjs", "Windows captured-DOM validator wiring"],
]) {
  requireText(haystack, needle, label);
}

const deleteCall = rust.indexOf("permanently_delete_list(&mut connection, id)?;");
const cleanupCall = rust.indexOf("cleanup_owned_icon_after_commit(app_dir, relative);", deleteCall);
if (deleteCall < 0 || cleanupCall < deleteCall) {
  throw new Error("Owned icon cleanup must occur only after permanent list deletion commits successfully.");
}

const archiveAwait = shell.indexOf("await archiveListFromSettings(archiveTarget.id);");
const archivePublish = shell.indexOf("setArchiveTarget(null);", archiveAwait);
if (archiveAwait < 0 || archivePublish < archiveAwait) {
  throw new Error("Active-list archive UI must publish success only after persistence resolves.");
}

const restoreAwait = panel.indexOf("await restoreListFromSettings(list.id);");
const restorePublish = panel.indexOf("setLists((current)", restoreAwait);
if (restoreAwait < 0 || restorePublish < restoreAwait) {
  throw new Error("Archived-list restore UI must publish success only after persistence resolves.");
}

const deleteAwait = panel.indexOf("await permanentlyDeleteListFromSettings(deleteTarget.id);");
const deletePublish = panel.indexOf("setLists((current)", deleteAwait);
if (deleteAwait < 0 || deletePublish < deleteAwait) {
  throw new Error("Archived-list delete UI must publish success only after persistence resolves.");
}

for (const forbidden of ["Archived done tasks", "archive search", "list archive filter"]) {
  if (panel.includes(forbidden)) {
    throw new Error(`List-settings slice must not absorb later archive-surface scope: ${forbidden}`);
  }
}

if (shell.includes("onDuplicate: () =>")) {
  throw new Error("List-settings slice must not activate the separately ordered Duplicate target.");
}

console.log("List settings archive/delete contract checks passed.");
