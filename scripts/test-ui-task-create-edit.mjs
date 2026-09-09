import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const rust = read("src-tauri/src/board_task_editor.rs");
const titlePersistence = read("src-tauri/src/persistence/task_title_edit.rs");
const titlePersistenceProduction = titlePersistence.split("#[cfg(test)]")[0];
const persistenceMod = read("src-tauri/src/persistence/mod.rs");
const lib = read("src-tauri/src/lib.rs");
const board = read("src/ListBoard.tsx");
const taskCard = read("src/TaskCard.tsx");
const css = read("src/listBoard.css");
const api = read("src/listBoardApi.ts");
const packageJson = read("package.json");
const captureValidator = read("scripts/validate-task-create-edit-captures.mjs");

for (const [haystack, needle, label] of [
  [rust, "create_task(", "M2 transactional task-create reuse"],
  [rust, "est_seconds: None", "title-only create leaves EST to the next ordered slice"],
  [rust, "update_task_title_if_expected(", "persistence title-edit boundary reuse"],
  [persistenceMod, "pub mod task_title_edit;", "task-title persistence module registration"],
  [titlePersistence, "let tx = conn.transaction()", "atomic inline-title transaction"],
  [titlePersistence, "SET title = ?1, updated_at = ?2", "title-only persistence write"],
  [titlePersistence, "AND list_id = ?4", "atomic expected-list precondition"],
  [titlePersistence, "AND title = ?5", "atomic expected-title precondition"],
  [titlePersistence, "AND archived_at IS NULL", "active-task write precondition"],
  [titlePersistence, "SELECT 1 FROM lists", "active-list write precondition"],
  [rust, 'CommandError::new("TASK_CREATE_STALE"', "stable stale-create error code"],
  [rust, 'CommandError::new("TASK_EDIT_STALE"', "stable stale-edit error code"],
  [rust, 'CommandError::new("TASK_EDIT_NOT_ALLOWED"', "stable edit-not-allowed error code"],
  [titlePersistence, "blank_title_edit_is_rejected_without_writing", "blank edit regression"],
  [titlePersistence, "stale_title_edit_is_rejected_without_clobbering_newer_authoritative_title", "stale-title regression"],
  [titlePersistence, "title_edit_preserves_identity_position_estimate_schedule_completion_and_time_metadata", "metadata preservation regression"],
  [lib, "pub mod board_task_editor;", "task editor module registration"],
  [lib, "board_task_editor::create_list_board_task,", "create command registration"],
  [lib, "board_task_editor::update_list_board_task_title,", "title-edit command registration"],
  [api, 'invoke<string>("create_list_board_task"', "typed create IPC"],
  [api, 'invoke<void>("update_list_board_task_title"', "typed title-edit IPC"],
  [board, 'data-board-add-slot="bottom"', "production bottom add region"],
  [board, "data-board-add-task={pendingLane}", "pending-lane add target"],
  [board, "> ADD TASK", "source-shaped Add Task label"],
  [board, "pendingLane !== null && !aggregateView", "Done and aggregate create exclusion"],
  [board, 'data-board-task-create="editor"', "production inline create editor"],
  [board, "createListBoardTask({", "production create mutation"],
  [board, "updateListBoardTaskTitle({", "production title-edit mutation"],
  [board, "expectedTitle,", "expected-title concurrency guard projection"],
  [board, "Task change was saved, but the board could not refresh.", "committed-refresh failure distinction"],
  [board, "setMutationRefreshBlocked(true)", "post-commit mutation block"],
  [board, '[data-task-action], [data-task-title-control], [data-task-metric-control], [data-task-schedule-control]', "task controls including scheduling excluded from drag start"],
  [board, "onScheduleEdit={canEditSchedule ? () => onStartScheduleEdit(task) : undefined}", "separately gated ordered scheduling interaction"],
  [taskCard, 'data-task-title-control="open"', "click title edit target"],
  [taskCard, 'data-task-title-editor="true"', "inline title editor identity"],
  [taskCard, 'data-task-title-control="input"', "title input identity"],
  [taskCard, 'data-task-title-control="cancel"', "cancel action"],
  [taskCard, 'data-task-title-control="save"', "save action"],
  [taskCard, 'event.key !== "Escape"', "Escape cancellation"],
  [taskCard, "onSubmit={handleSubmit}", "Enter/form title commit"],
  [taskCard, 'data-task-action-slot="reserved"', "reserved action geometry during edit"],
  [css, "grid-template-columns: 1rem minmax(0, 1fr) 4.25rem;", "stable title-row geometry"],
  [css, ".list-board-task__title-edit-actions", "overlay title-edit actions"],
  [css, ".list-board-task--inline-create", "production inline-create styling"],
  [captureValidator, "data-board-add-task", "captured production Add Task validation"],
  [captureValidator, "data-fixture-only-body", "captured inline-create evidence validation"],
  [packageJson, '"test:ui-task-create-edit"', "task create/edit preflight script"],
]) {
  requireText(haystack, needle, label);
}

if (rust.includes(".execute(")) {
  throw new Error("Board task editor must delegate persistence rather than own raw task SQL.");
}
if (titlePersistenceProduction.includes("update_task(")) {
  throw new Error("Inline title editing must not re-write EST through the generic title+EST update boundary.");
}
if (titlePersistenceProduction.includes("SET title = ?1, est_seconds")) {
  throw new Error("Title-only persistence must never assign EST.");
}

const createStart = board.indexOf("function InlineCreateEditor");
const createEnd = board.indexOf("function BoardLane", createStart);
if (createStart < 0 || createEnd < 0) throw new Error("Could not isolate production inline create editor.");
const createEditor = board.slice(createStart, createEnd);
for (const forbidden of ["Est. time", "Time Taken", "schedule", "recurrence"]) {
  if (createEditor.includes(forbidden)) {
    throw new Error(`Task create slice must not activate later task metadata UI: ${forbidden}`);
  }
}

for (const forbidden of ["onComplete", "onDelete"]) {
  if (board.includes(forbidden)) {
    throw new Error(`Task create/edit slice must not activate an unordered task action: ${forbidden}`);
  }
}

console.log("Task creation and inline editing contract checks passed.");
