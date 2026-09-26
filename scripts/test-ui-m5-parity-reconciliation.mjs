import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const listStore = read("src-tauri/src/persistence/lists.rs");
const listEditor = read("src-tauri/src/list_editor.rs");
const shell = read("src/AppShell.tsx");
const home = read("src/HomeDashboard.tsx");
const archived = read("src/ArchivedListsPanel.tsx");
const tasks = read("src-tauri/src/persistence/tasks.rs");
const boardEditor = read("src-tauri/src/board_task_editor.rs");
const boardMutation = read("src-tauri/src/board_task_mutation.rs");
const board = read("src/ListBoard.tsx");
const card = read("src/TaskCard.tsx");
const search = read("src/SearchPalette.tsx");
const main = read("src/main.tsx");
const prompt = read("src/PomodoroResumePrompt.tsx");
const boardProjection = read("src-tauri/src/list_board.rs");

for (const [haystack, needle, label] of [
  [listStore, "pub fn duplicate_list(", "A1 durable List Duplicate boundary"],
  [listStore, "TaskId::generate()", "A1 independent task identities"],
  [listEditor, "duplicate_owned_icon", "A1/A2 independent managed icon copy"],
  [shell, "duplicateListFromHome(list.id)", "A1 Home duplicate wiring"],
  [home, "<ListIcon", "A2 active-list icon rendering"],
  [archived, "<ListIcon", "A2 archived-list icon rendering"],
  [tasks, "pub fn create_task_at_top(", "A3 atomic top-create boundary"],
  [boardEditor, "insert_at_top: bool", "A3 typed create position"],
  [board, 'data-board-add-task-top={pendingLane}', "A3 top create affordance"],
  [boardEditor, "est_seconds: Option<u32>", "A4 EST create input"],
  [board, 'data-task-create-est="true"', "A4 EST create UI"],
  [boardMutation, "complete_list_board_task", "A5/A6 board completion command"],
  [tasks, "pub fn permanently_delete_task_confirmed(", "A5 confirmed permanent delete boundary"],
  [card, 'data-task-completion-control="complete"', "A6 pointer/keyboard completion control"],
  [board, "<TaskDeleteConfirmDialog", "A5 explicit destructive confirmation"],
  [board, "listId: editorState.listId", "A7 real owning-list identity for aggregate edit"],
  [board, "mutable: Boolean(taskSubtaskPanel.snapshot?.mutable)", "A7 aggregate subtask mutation"],
  [board, "readOnly: false", "A7 aggregate Notes mutation"],
  [search, 'data-search-match="true"', "A8 search matched-text highlighting"],
  [main, "<PomodoroResumePrompt />", "A9 normal-main resume prompt"],
  [prompt, "payload?.awaitingResume", "A9 authoritative awaiting-resume state"],
  [prompt, "resumeTimer()", "A9 authoritative resume mutation"],
  [boardProjection, "done_month_completion_count", "A19 Rust local-month projection"],
  [board, "completed this month", "A19 Done monthly presentation"],
]) {
  requireText(haystack, needle, label);
}

if (main.includes("TimerSessionProjection")) {
  throw new Error("A9 regression: normal Main must not mount diagnostic TimerSessionProjection.");
}
if (main.includes("JSON.stringify")) {
  throw new Error("A9 regression: normal Main must not render diagnostic JSON.");
}
if (!board.includes("target.kind === \"list\"") || !board.includes("interactionReorderEnabled")) {
  throw new Error("A7 regression: aggregate edits must not enable aggregate reorder.");
}

console.log("M5 parity reconciliation contract checks passed.");
