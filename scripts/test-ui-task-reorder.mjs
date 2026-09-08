import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const rust = read("src-tauri/src/board_task_mutation.rs");
const lib = read("src-tauri/src/lib.rs");
const board = read("src/ListBoard.tsx");
const api = read("src/listBoardApi.ts");
const css = read("src/taskReorder.css");
const appCss = read("src/App.css");
const fixture = read("src/taskReorderVisualFixture.tsx");
const vite = read("vite.config.ts");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-task-reorder-captures.mjs");

for (const [haystack, needle, label] of [
  [rust, "reorder_active_bucket", "validated M2 exact-set reorder reuse"],
  [rust, "move_task(", "validated M2 transactional cross-lane move reuse"],
  [rust, "ScheduledTask(TaskId)", "scheduled manual-move rejection"],
  [rust, "ExpectedLaneMismatch", "stale source-lane guard"],
  [rust, "InvalidAnchor", "same-bucket reorder anchor guard"],
  [rust, "same_lane_reorder_uses_exact_set_and_keeps_scheduled_rows_singular", "same-lane identity regression"],
  [rust, "scheduled_task_manual_reorder_is_rejected_without_position_write", "scheduled rejection regression"],
  [rust, "cross_lane_move_appends_atomically_and_preserves_exact_global_identity_set", "cross-lane identity regression"],
  [rust, "stale_source_lane_and_wrong_anchor_fail_without_mutation", "stale mutation regression"],
  [lib, "pub mod board_task_mutation;", "Rust mutation module registration"],
  [lib, "board_task_mutation::reorder_list_board_task", "Tauri reorder command registration"],
  [lib, "board_task_mutation::move_list_board_task", "Tauri move command registration"],
  [api, 'invoke<void>("reorder_list_board_task", request)', "typed renderer reorder command"],
  [api, 'invoke<void>("move_list_board_task", request)', "typed renderer move command"],
  [board, 'data-board-reorder-enabled={interactionReorderEnabled ? "true" : "false"}', "individual-board interaction gate"],
  [board, "snapshot.target.kind === \"list\"", "aggregate All Lists read-only gate"],
  [board, "task.scheduledLocalDate === null", "scheduled task drag exclusion"],
  [board, "draggable={reorderable && interactionReorderEnabled", "pointer drag activation"],
  [board, "event.dataTransfer.effectAllowed = \"move\"", "native drag move intent"],
  [board, "event.clientY < bounds.top + bounds.height / 2", "same-lane before/after placeholder targeting"],
  [board, "setDropTarget({ lane, beforeTaskId: null });", "blank-lane append targeting"],
  [board, "showLaneEndPlaceholder", "cross-lane append placeholder"],
  [board, "await reorderListBoardTask", "persistence-first same-lane mutation"],
  [board, "await moveListBoardTask", "persistence-first cross-lane mutation"],
  [board, "await refreshAfterMutation(taskId)", "authoritative snapshot refresh after mutation"],
  [board, "mutationRefreshBlocked", "refresh-failure interaction lock"],
  [board, "Task change was saved, but the board could not refresh.", "committed-mutation refresh failure distinction"],
  [board, "event.altKey", "keyboard reorder modifier"],
  [board, 'event.key === "ArrowUp"', "keyboard upward reorder"],
  [board, 'event.key === "ArrowLeft" || event.key === "ArrowRight"', "keyboard cross-lane move"],
  [board, "<DropPlaceholder />", "stable placeholder presentation"],
  [css, "var(--motion-duration-reorder)", "validated reorder settle timing token"],
  [css, "list-board-task-drop-settle", "finite drop-settle animation"],
  [css, "@media (prefers-reduced-motion: reduce)", "reduced-motion reorder behavior"],
  [appCss, '@import "./taskReorder.css";', "runtime reorder style import"],
  [fixture, "fixtureReorderState", "deterministic reorder fixture state"],
  [fixture, 'dropLane: "thisWeek"', "cross-lane placeholder fixture"],
  [fixture, "scheduledReorderable", "scheduled read-only capture contract"],
  [vite, 'taskReorderFixture: "task-reorder-fixture.html"', "Vite reorder fixture entry"],
  [capture, 'task-reorder-$theme', "Windows Edge reorder capture"],
  [validator, "scheduled task became manually reorderable", "captured scheduled read-only validation"],
  [validator, "task reorder geometry differs between light and dark themes", "theme-stable reorder geometry validation"],
]) {
  requireText(haystack, needle, label);
}

const mutationStart = board.indexOf("const commitDrop = async");
const mutationEnd = board.indexOf("const handleDragStart", mutationStart);
if (mutationStart < 0 || mutationEnd < 0) throw new Error("Could not isolate task reorder mutation boundary.");
const mutation = board.slice(mutationStart, mutationEnd);
const firstSnapshotWrite = mutation.indexOf("setSnapshot(");
const firstPersistenceCall = Math.min(
  ...[mutation.indexOf("await reorderListBoardTask"), mutation.indexOf("await moveListBoardTask")]
    .filter((index) => index >= 0),
);
if (firstSnapshotWrite >= 0 && firstSnapshotWrite < firstPersistenceCall) {
  throw new Error("Task reorder must not optimistically rewrite board order before persistence succeeds.");
}

const savedRefreshMessage = mutation.indexOf("Task change was saved, but the board could not refresh.");
const persistenceFailureMessage = mutation.indexOf("Could not reorder");
if (savedRefreshMessage < 0 || persistenceFailureMessage < 0) {
  throw new Error("Task reorder must distinguish persistence failure from post-commit refresh failure.");
}

for (const forbidden of ["setInterval(", "requestAnimationFrame("]) {
  if (board.includes(forbidden) || css.includes(forbidden)) {
    throw new Error(`Task reorder must not add continuous presentation work; found ${forbidden}`);
  }
}

console.log("Task reorder/move contract checks passed.");
