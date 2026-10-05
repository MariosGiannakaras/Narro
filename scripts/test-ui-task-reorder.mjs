import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const rust = read("src-tauri/src/board_task_mutation.rs");
const lib = read("src-tauri/src/lib.rs");
const board = read("src/ListBoard.tsx");
const pointer = read("src/boardTaskPointerDrag.ts");
const api = read("src/listBoardApi.ts");
const css = read("src/taskReorder.css");
const appCss = read("src/App.css");
const fixture = read("src/taskReorderVisualFixture.tsx");
const vite = read("vite.config.ts");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-task-reorder-captures.mjs");

for (const [haystack, needle, label] of [
  [rust, "reorder_active_bucket", "validated M2 exact-set reorder reuse"],
  [rust, "before_task_id: Option<String>", "cross-lane positional anchor IPC"],
  [rust, "target_ids.insert(insertion_index, id);", "transactional target insertion"],
  [rust, "ScheduledTask(TaskId)", "scheduled manual-move rejection"],
  [rust, "ExpectedLaneMismatch", "stale source-lane guard"],
  [rust, "InvalidAnchor", "same-bucket reorder anchor guard"],
  [rust, "same_lane_reorder_uses_exact_set_and_keeps_scheduled_rows_singular", "same-lane identity regression"],
  [rust, "scheduled_task_manual_reorder_is_rejected_without_position_write", "scheduled rejection regression"],
  [rust, "cross_lane_move_inserts_before_anchor_atomically_and_preserves_identity_set", "cross-lane positional identity regression"],
  [rust, "stale_source_lane_and_wrong_anchor_fail_without_mutation", "stale mutation regression"],
  [lib, "pub mod board_task_mutation;", "Rust mutation module registration"],
  [lib, "board_task_mutation::reorder_list_board_task", "Tauri reorder command registration"],
  [lib, "board_task_mutation::move_list_board_task", "Tauri move command registration"],
  [api, 'committedBoardMutation<void>("reorder_list_board_task", request)', "typed committed renderer reorder command"],
  [api, "beforeTaskId: string | null;", "typed cross-lane positional anchor"],
  [api, 'committedBoardMutation<void>("move_list_board_task", request)', "typed committed renderer move command"],
  [board, 'data-board-reorder-enabled={interactionReorderEnabled ? "true" : "false"}', "individual-board interaction gate"],
  [board, "snapshot.target.kind === \"list\"", "aggregate All Lists read-only gate"],
  [board, "task.scheduledLocalDate === null", "scheduled task drag exclusion"],
  [board, "draggable={false}", "internal movement excludes competing native/OLE drag"],
  [board, "onPointerDown={reorderable && interactionReorderEnabled", "guarded pointer drag activation"],
  [pointer, "y < bounds.top + bounds.height / 2", "same-lane and cross-lane pointer insertion targeting"],
  [pointer, "beforeTaskId: before?.dataset.boardDragTask ?? null", "blank-lane append targeting"],
  [board, "showLaneEndPlaceholder", "cross-lane append placeholder"],
  [board, "beforeTaskId,", "selected cross-lane position persistence"],
  [board, "await reorderListBoardTask", "persistence-first same-lane mutation"],
  [board, "await moveListBoardTask", "persistence-first cross-lane mutation"],
  [board, "await refreshAfterMutation(taskId)", "authoritative snapshot refresh after mutation"],
  [board, "mutationRefreshBlocked", "refresh-failure interaction lock"],
  [board, "Task change was saved, but the board could not refresh.", "committed-mutation refresh failure distinction"],
  [board, "event.altKey", "keyboard reorder modifier"],
  [board, 'event.key === "ArrowUp"', "keyboard upward reorder"],
  [board, 'event.key === "ArrowLeft" || event.key === "ArrowRight"', "keyboard cross-lane move"],
  [board, "<DropPlaceholder height={dragState?.sourceHeight} />", "source-height placeholder presentation"],
  [pointer, "preview.classList.add('list-board-task-drag-preview')", "lifted internal drag preview"],
  [pointer, "options.onLift(initial.height)", "live source reflow height capture"],
  [pointer, "preview.inert = true", "noninteractive/accessibility-excluded preview"],
  [pointer, "source.setPointerCapture(pointerId)", "pointer capture across lanes"],
  [pointer, "window.removeEventListener('pointermove', move)", "finite listener cleanup"],
  [pointer, "event.key === 'Escape'", "cancel without positional mutation"],
  [css, 'data-task-dragging="true"', "dragging source collapse selector"],
  [css, "height: 0;", "live source reflow collapse"],
  [css, "var(--task-drop-placeholder-height, 4.5rem)", "card-height insertion placeholder"],
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
const mutationEnd = board.indexOf("const submitCreate", mutationStart);
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

const refreshFailureStart = board.indexOf("const handleCommittedRefreshFailure =");
const refreshFailureEnd = board.indexOf("const commitDrop = async", refreshFailureStart);
if (refreshFailureStart < 0 || refreshFailureEnd < 0) {
  throw new Error("Could not isolate shared committed-refresh failure boundary.");
}
const refreshFailure = board.slice(refreshFailureStart, refreshFailureEnd);
for (const required of [
  "Task change was saved, but the board could not refresh.",
  "setMutationRefreshBlocked(true)",
]) {
  if (!refreshFailure.includes(required)) {
    throw new Error(`Committed-refresh failure boundary is missing ${required}.`);
  }
}
if (!mutation.includes("Could not reorder") || !mutation.includes("handleCommittedRefreshFailure(failure)")) {
  throw new Error("Task reorder must distinguish persistence failure from post-commit refresh failure through the shared boundary.");
}

for (const forbidden of ["setInterval("]) {
  if (board.includes(forbidden) || pointer.includes(forbidden) || css.includes(forbidden)) {
    throw new Error(`Task reorder must not add continuous presentation work; found ${forbidden}`);
  }
}

if (!pointer.includes("preview?.remove()") || !pointer.includes("window.cancelAnimationFrame(scrollFrame)")) {
  throw new Error("Internal drag preview and edge-scroll frames require cancellation cleanup.");
}

console.log("Task reorder/move contract checks passed.");
