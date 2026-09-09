import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const rust = read("src-tauri/src/list_board.rs");
const rustProduction = rust.split("#[cfg(test)]")[0];
const lib = read("src-tauri/src/lib.rs");
const component = read("src/ListBoard.tsx");
const taskCard = read("src/TaskCard.tsx");
const css = read("src/listBoard.css");
const api = read("src/listBoardApi.ts");
const shell = read("src/AppShell.tsx");
const home = read("src/HomeDashboard.tsx");
const fixtures = read("src/visualFixtures.tsx");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-visual-fixtures.mjs");

for (const [haystack, needle, label] of [
  [rust, "active_lists(conn)?", "validated active-list persistence read"],
  [rust, "active_tasks_in_bucket(conn, list.id, manual_lane)?", "validated active task-bucket persistence read"],
  [rust, "scheduling::effective_planning_lane_at(", "M4 effective planning-lane projection"],
  [rust, "HashSet::new()", "stable identity projection guard"],
  [rust, "DuplicateTaskProjection", "duplicate task projection failure"],
  [rust, "checked_add(u64::from(seconds))", "checked aggregate estimate arithmetic"],
  [rust, "u64::try_from(self.tasks.len())", "checked task-count conversion"],
  [rust, "completed_at IS NOT NULL", "Done read excludes unfinished tasks"],
  [rust, "archived_at IS NULL", "board excludes archived tasks"],
  [rust, "get_preferences(conn)?", "persisted timezone preference read"],
  [rust, "scheduling::validate_timezone_identifier", "fail-closed timezone validation"],
  [rust, "pub fn get_list_board_snapshot", "renderer board snapshot command"],
  [lib, "pub mod list_board;", "list board module registration"],
  [lib, "list_board::get_list_board_snapshot,", "list board command registration"],
  [api, 'invoke<ListBoardSnapshot>("get_list_board_snapshot"', "typed board IPC"],
  [api, "Intl.DateTimeFormat().resolvedOptions().timeZone", "Windows WebView display-timezone fallback"],
  [component, '{ key: "backlog", title: "Backlog", mutationLane: "backlog" }', "Backlog lane"],
  [component, '{ key: "thisWeek", title: "This Week", mutationLane: "this_week" }', "This Week lane"],
  [component, '{ key: "today", title: "Today", mutationLane: "today" }', "Today lane"],
  [component, '{ key: "done", title: "Done", mutationLane: null }', "Done lane"],
  [component, 'data-board-lane-count={LANES.length}', "four-lane board contract"],
  [component, 'data-board-add-slot="reserved"', "future add-action geometry reservation"],
  [component, "<TaskCard", "task-card presentation projection"],
  [component, "actions={taskActions}", "task-card callback action projection"],
  [taskCard, 'data-board-task="task-card"', "task-card identity"],
  [component, 'data-board-list-selector="true"', "confirmed board list selector"],
  [component, 'aria-label="Planning list"', "accessible board selector"],
  [component, 'invoke<HomeSnapshot>("get_home_snapshot")', "reuse of validated active-list option projection"],
  [component, "onTargetChange", "selector target-change callback"],
  [component, "getListBoardSnapshot(target)", "authoritative board read"],
  [component, 'data-board-reorder-enabled={interactionReorderEnabled ? "true" : "false"}', "ordered reorder interaction gate"],
  [shell, "openBoardTarget", "shared board navigation target"],
  [shell, "onTargetChange={openBoardTarget}", "real selector target switching"],
  [shell, "onOpenAllLists={openAllListsBoard}", "All Lists Home navigation"],
  [shell, "onOpen: () => openListBoard(list)", "real list-card Open target"],
  [home, "onOpenAllLists", "aggregate card Open callback"],
  [fixtures, 'fixture === "list-board"', "individual board fixture route"],
  [fixtures, 'fixture === "list-board-all"', "aggregate board fixture route"],
  [capture, '"list-board"', "individual board Edge capture"],
  [capture, '"list-board-all"', "aggregate board Edge capture"],
  [validator, "validateListBoardFixture", "captured board validation"],
  [validator, 'data-board-lane-count="4"', "captured four-lane validation"],
  [css, "grid-template-columns: repeat(4, minmax(9.5rem, 1fr));", "stable four-column geometry"],
  [css, ".list-board__selector select", "selector geometry contract"],
  [css, "border-radius: var(--radius-task-card);", "shared task-card radius"],
]) {
  requireText(haystack, needle, label);
}

for (const forbidden of [
  "ADD TASK",
  ">+<",
  "onComplete",
  "onDelete",
  "onSchedule",
]) {
  if (component.includes(forbidden)) {
    throw new Error(`List-board hierarchy must not activate an unordered later task interaction: ${forbidden}`);
  }
}

for (const forbidden of ["create_task", "move_task", "update_task", "complete_task", "reopen_task"]) {
  if (rustProduction.includes(forbidden)) {
    throw new Error(`List-board read model must not call a task mutation: ${forbidden}`);
  }
}

for (const forbidden of ["onDuplicate: () =>", "onArchive: () =>"]) {
  if (shell.includes(forbidden)) {
    throw new Error(`List-board slice must not activate a later list-card target: ${forbidden}`);
  }
}

for (const forbidden of ["--color-text-muted", "--motion-duration-interactive", "--motion-distance-interactive"]) {
  if (css.includes(forbidden)) {
    throw new Error(`List board must use validated shared tokens only; found ${forbidden}.`);
  }
}

console.log("List board contract checks passed.");
