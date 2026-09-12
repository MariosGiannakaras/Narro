import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const palette = read("src/SearchPalette.tsx");
const api = read("src/searchPaletteApi.ts");
const shell = read("src/AppShell.tsx");
const fixture = read("src/searchPaletteVisualFixture.tsx");
const vite = read("vite.config.ts");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-search-palette-captures.mjs");
const pkg = JSON.parse(read("package.json"));

for (const [haystack, needle, label] of [
  [api, 'invoke<HomeSnapshot>("get_home_snapshot")', "authoritative active-list read"],
  [api, 'getListBoardSnapshot({ kind: "all" })', "authoritative All Lists task read"],
  [api, '...board.backlog.tasks.map', "Backlog search projection"],
  [api, '...board.thisWeek.tasks.map', "This Week search projection"],
  [api, '...board.today.tasks.map', "Today search projection"],
  [api, '...board.done.tasks.map', "Done search projection"],
  [palette, 'role="dialog"', "dialog semantics"],
  [palette, 'aria-modal="true"', "modal semantics"],
  [palette, 'placeholder="Search for tasks, lists"', "source-shaped search placeholder"],
  [palette, 'aria-label="Control F"', "Ctrl+F hint"],
  [palette, '>Quick actions<', "Quick actions heading"],
  [palette, 'Add new task', "Add new task quick action"],
  [palette, 'Add new list', "Add new list quick action"],
  [palette, 'Go to Reports', "Go to Reports quick action"],
  [palette, 'normalized(list.title).includes(queryToken)', "local list-title matching"],
  [palette, 'normalized(task.title).includes(queryToken)', "local task-title matching"],
  [palette, 'event.key === "Escape"', "Escape dismissal"],
  [palette, 'event.key === "Tab"', "Tab containment"],
  [palette, 'event.key !== "ArrowDown" && event.key !== "ArrowUp"', "arrow traversal"],
  [palette, 'previousFocusRef.current?.focus()', "dismissal focus restoration"],
  [palette, 'data-search-result-kind="list"', "list search result identity"],
  [palette, 'data-search-result-kind="task"', "task search result identity"],
  [palette, 'data-search-task-field="title"', "explicit quick-task title"],
  [palette, 'data-search-task-field="list"', "explicit quick-task list"],
  [palette, 'data-search-task-field="lane"', "explicit quick-task lane"],
  [palette, 'taskId = await createListBoardTask({', "existing task-create persistence boundary"],
  [shell, 'destination === "search"', "Search utility overlay routing"],
  [shell, 'event.key.toLowerCase() !== "f"', "main-app Ctrl+F binding"],
  [shell, '<SearchPalette', "production palette mount"],
  [shell, 'onAddList={openCreateList}', "validated list-create reuse"],
  [fixture, 'dataset.searchPaletteFixtureReady', "fixture readiness marker"],
  [vite, 'searchPaletteFixture: "search-palette-fixture.html"', "Vite fixture input"],
  [capture, 'search-palette-fixture.html', "Windows Edge search fixture capture"],
  [validator, 'Search palette capture validation passed.', "captured-DOM validator"],
]) {
  requireText(haystack, needle, label);
}

const awaitCreate = palette.indexOf('taskId = await createListBoardTask({');
const publishCreate = palette.indexOf('onTaskCreated(quickTaskListId, taskId);');
if (awaitCreate < 0 || publishCreate < 0 || publishCreate < awaitCreate) {
  throw new Error("Quick task UI must publish success only after createListBoardTask resolves.");
}

for (const forbidden of ["fetch(", "axios", "http://", "https://", "ArchivedListsPanel", "Archived done tasks"]) {
  if (palette.includes(forbidden) || api.includes(forbidden)) {
    throw new Error(`Search palette must stay local and exclude later archive scope: ${forbidden}`);
  }
}

if (pkg.scripts["test:ui-search-palette"] !== "node scripts/test-ui-search-palette.mjs") {
  throw new Error("package.json must expose the search palette contract gate.");
}
if (!pkg.scripts["preflight:frontend"]?.includes("npm run test:ui-search-palette")) {
  throw new Error("Frontend preflight must run the search palette contract gate.");
}
if (!pkg.scripts["test:visual-regression:windows"]?.includes("validate-search-palette-captures.mjs")) {
  throw new Error("Windows visual regression must validate search palette captures.");
}

console.log("Search palette contract checks passed.");
