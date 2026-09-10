import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const subtaskStore = read("src-tauri/src/persistence/subtasks.rs");
const boardPersistence = read("src-tauri/src/persistence/subtask_board.rs");
const boardCommands = read("src-tauri/src/board_task_subtasks.rs");
const persistenceMod = read("src-tauri/src/persistence/mod.rs");
const listBoardRust = read("src-tauri/src/list_board.rs");
const lib = read("src-tauri/src/lib.rs");
const api = read("src/listBoardApi.ts");
const board = read("src/ListBoard.tsx");
const taskCard = read("src/TaskCard.tsx");
const subtasks = read("src/TaskSubtasks.tsx");
const css = read("src/listBoard.css");
const fixture = read("src/taskSubtasksVisualFixture.tsx");
const fixtureHtml = read("task-subtasks-fixture.html");
const vite = read("vite.config.ts");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-task-subtask-captures.mjs");
const packageJson = read("package.json");

for (const [haystack, needle, label] of [
  [persistenceMod, "pub mod subtask_board;", "board subtask persistence registration"],
  [subtaskStore, "ParentTaskArchived", "M2 archived-parent restriction"],
  [subtaskStore, "ParentTaskCompleted", "M2 completed-parent restriction"],
  [subtaskStore, "ParentListArchived", "M2 archived-list restriction"],
  [subtaskStore, "DuplicateReorderId", "M2 duplicate reorder defense"],
  [subtaskStore, "ReorderSetMismatch", "M2 exact-set reorder defense"],
  [boardPersistence, "TransactionBehavior::Immediate", "renderer mutation immediate transactions"],
  [boardPersistence, "ExpectedListMismatch", "expected parent-list guard"],
  [boardPersistence, "ExpectedParentMismatch", "expected parent-task guard"],
  [boardPersistence, "ExpectedTitleMismatch", "expected title guard"],
  [boardPersistence, "ExpectedCompletionMismatch", "expected completion guard"],
  [boardPersistence, "ExpectedUpdatedAtMismatch", "expected destructive version guard"],
  [boardPersistence, "ExpectedOrderMismatch", "expected exact-order guard"],
  [boardPersistence, "validate_parent_binding(&tx, task_id, expected_list_id, true)", "authoritative parent mutability check"],
  [boardPersistence, "current != expected_order", "stale order comparison"],
  [boardPersistence, "expected_set != requested_set", "reorder identity-set preservation"],
  [boardPersistence, "DELETE FROM subtasks", "atomic delete boundary"],
  [boardPersistence, "rewrite_ranks(&tx, expected_task_id, &remaining, now)", "post-delete rank compaction"],
  [listBoardRust, "pub subtask_total_count: u64", "authoritative subtask total projection"],
  [listBoardRust, "pub subtask_completed_count: u64", "authoritative subtask completed projection"],
  [listBoardRust, "subtasks_for_task(conn, task.id)?", "board subtask count read"],
  [lib, "pub mod board_task_subtasks;", "board subtask command module registration"],
  [lib, "board_task_subtasks::get_list_board_task_subtasks,", "subtask snapshot command registration"],
  [lib, "board_task_subtasks::create_list_board_subtask,", "subtask create command registration"],
  [lib, "board_task_subtasks::update_list_board_subtask_title,", "subtask title command registration"],
  [lib, "board_task_subtasks::set_list_board_subtask_completion,", "subtask completion command registration"],
  [lib, "board_task_subtasks::reorder_list_board_subtasks,", "subtask reorder command registration"],
  [lib, "board_task_subtasks::delete_list_board_subtask,", "subtask delete command registration"],
  [boardCommands, 'CommandError::new("SUBTASK_STALE"', "stable stale command code"],
  [boardCommands, 'CommandError::new("SUBTASK_NOT_ALLOWED"', "stable mutation restriction code"],
  [boardCommands, 'CommandError::new("SUBTASK_FAILED"', "stable generic subtask code"],
  [boardCommands, "mutable: task.archived_at.is_none()", "read snapshot mutable flag"],
  [boardCommands, "snapshot_is_read_only_after_parent_completion", "completed-parent read-only regression"],
  [api, 'invoke<BoardSubtaskSnapshot>("get_list_board_task_subtasks"', "typed subtask snapshot IPC"],
  [api, 'invoke<BoardSubtask>("create_list_board_subtask"', "typed subtask create IPC"],
  [api, 'invoke<BoardSubtask>("update_list_board_subtask_title"', "typed subtask title IPC"],
  [api, 'invoke<BoardSubtask>("set_list_board_subtask_completion"', "typed subtask completion IPC"],
  [api, 'invoke<BoardSubtask[]>("reorder_list_board_subtasks"', "typed subtask reorder IPC"],
  [api, 'invoke<void>("delete_list_board_subtask"', "typed subtask delete IPC"],
  [board, "const [subtaskPanel, setSubtaskPanel]", "single board subtask panel state"],
  [board, "&& subtaskPanel === null", "subtask interaction lock"],
  [board, "mutable: Boolean(taskSubtaskPanel.snapshot?.mutable) && !aggregateView", "aggregate read-only projection"],
  [board, "Promise.all([", "combined authoritative refresh"],
  [board, "getListBoardTaskSubtasks(taskId, listId)", "authoritative subtask refresh"],
  [board, "getListBoardSnapshot(target)", "authoritative board progress refresh"],
  [board, "Subtask change was saved, but authoritative task details could not refresh.", "committed subtask refresh-failure distinction"],
  [board, "setMutationRefreshBlocked(true)", "unsafe retry blocker"],
  [board, "[data-task-subtask-control]", "subtask-control parent drag isolation"],
  [board, 'data-board-subtask-panel={subtaskPanel?.taskId ?? "closed"}', "board subtask panel marker"],
  [taskCard, 'data-task-subtasks-expanded={subtaskExpanded ? "true" : "false"}', "task-card expansion marker"],
  [taskCard, "task.subtaskTotalCount ?? 0", "task-card total progress projection"],
  [taskCard, "task.subtaskCompletedCount ?? 0", "task-card completed progress projection"],
  [taskCard, "titleEditor || metricEditor || subtaskExpanded", "expanded panel parent action lock"],
  [subtasks, 'data-task-subtask-control="toggle"', "expand-collapse control"],
  [subtasks, 'data-task-subtask-control="complete"', "complete-reopen control"],
  [subtasks, 'data-task-subtask-control="edit"', "inline title edit control"],
  [subtasks, 'data-task-subtask-control="move-up"', "move-up control"],
  [subtasks, 'data-task-subtask-control="move-down"', "move-down control"],
  [subtasks, 'data-task-subtask-control="delete"', "delete control"],
  [subtasks, 'data-task-subtask-control="create"', "create control"],
  [subtasks, 'event.key === "Escape"', "keyboard cancel"],
  [subtasks, 'event.key === "Enter"', "keyboard save"],
  [subtasks, "Completed tasks keep subtasks as read-only history.", "completed-parent read-only message"],
  [css, "width: 4.25rem;", "fixed parent action slot"],
  [css, "width: var(--subtask-progress, 66.666%);", "data-driven subtask progress width"],
  [css, ".list-board-task__subtask-row", "subtask row styling"],
  [css, ".list-board-task__subtask-title-input:focus-visible", "subtask keyboard focus styling"],
  [fixtureHtml, "/src/taskSubtasksVisualFixture.tsx", "subtask visual fixture entry"],
  [fixture, 'data-task-subtasks-visual="expanded"', "production expanded fixture"],
  [fixture, 'data-task-subtasks-visual="editing"', "production editing fixture"],
  [fixture, 'data-task-subtasks-visual="readonly"', "production read-only fixture"],
  [fixture, 'fixture: "task-subtasks"', "subtask geometry contract"],
  [vite, 'taskSubtasksFixture: "task-subtasks-fixture.html"', "Vite subtask fixture registration"],
  [capture, 'task-subtasks-$theme', "Windows subtask fixture capture"],
  [validator, "task subtask title/action geometry differs between light and dark themes", "cross-theme geometry gate"],
]) {
  requireText(haystack, needle, label);
}

if (boardCommands.includes("INSERT INTO subtasks") || boardCommands.includes("UPDATE subtasks") || boardCommands.includes("DELETE FROM subtasks")) {
  throw new Error("Renderer-facing subtask commands must delegate raw persistence to subtask_board.");
}

if (subtasks.includes("setInterval") || board.includes("setInterval")) {
  throw new Error("Subtask UI must not introduce renderer polling.");
}

for (const forbidden of ["task_notes", "openUrl", "focus_surface", "archive_task", "delete_task"]) {
  if (subtasks.includes(forbidden)) {
    throw new Error(`Subtask component absorbed unrelated scope: ${forbidden}`);
  }
}

const refreshStart = board.indexOf("const refreshSubtasksAndBoard");
const refreshEnd = board.indexOf("const handleScheduleCommitted", refreshStart);
if (refreshStart < 0 || refreshEnd < 0) {
  throw new Error("Could not isolate authoritative subtask refresh flow.");
}
const refreshFlow = board.slice(refreshStart, refreshEnd);
if (!refreshFlow.includes("Promise.all([") || !refreshFlow.includes("setSnapshot(boardPayload)")) {
  throw new Error("Committed subtask mutation must refresh both subtask rows and board progress authoritatively.");
}

requireText(packageJson, '"test:ui-task-subtasks"', "subtask frontend preflight script");
requireText(packageJson, "validate-task-subtask-captures.mjs", "subtask Windows capture validator");

console.log("Task subtasks production contract checks passed.");
