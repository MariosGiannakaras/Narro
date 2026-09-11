import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const persistence = read("src-tauri/src/persistence/note_board.rs");
const commands = read("src-tauri/src/board_task_notes.rs");
const persistenceMod = read("src-tauri/src/persistence/mod.rs");
const lib = read("src-tauri/src/lib.rs");
const api = read("src/listBoardApi.ts");
const notes = read("src/TaskNotes.tsx");
const card = read("src/TaskCard.tsx");
const board = read("src/ListBoard.tsx");

for (const [haystack, needle, label] of [
  [persistenceMod, "pub mod note_board;", "note-board persistence registration"],
  [lib, "pub mod board_task_notes;", "task-note command module registration"],
  [lib, "board_task_notes::get_list_board_task_note,", "task-note read command registration"],
  [lib, "board_task_notes::save_list_board_task_note,", "task-note save command registration"],
  [lib, "board_task_notes::delete_list_board_task_note,", "task-note delete command registration"],
  [persistence, "TransactionBehavior::Immediate", "immediate note transaction boundary"],
  [persistence, "validate_expected_version(task_id, current.as_ref(), expected_updated_at)?;", "expected version guard"],
  [persistence, "ON CONFLICT(task_id) DO NOTHING", "create-only note insertion"],
  [persistence, "WHERE task_id = ?4 AND updated_at = ?5", "stale-safe note update"],
  [persistence, "DELETE FROM task_notes WHERE task_id = ?1 AND updated_at = ?2", "stale-safe note delete"],
  [commands, 'CommandError::new("NOTE_STALE"', "stable note stale code"],
  [commands, 'CommandError::new("NOTE_NOT_ALLOWED"', "stable note restriction code"],
  [commands, 'CommandError::new("NOTE_FAILED"', "stable note generic code"],
  [commands, "mutable: task.archived_at.is_none() && list.archived_at.is_none()", "completed-task note mutability"],
  [api, 'invoke<BoardTaskNoteSnapshot>("get_list_board_task_note"', "typed note read IPC"],
  [api, 'invoke<BoardTaskNote>("save_list_board_task_note"', "typed note save IPC"],
  [api, 'invoke<void>("delete_list_board_task_note"', "typed note delete IPC"],
  [notes, "function readSingleNode(node: Node)", "root text-node parser"],
  [notes, "blocks.push({ kind: \"paragraph\", runs: readSingleNode(node) });", "root text preservation"],
  [notes, "void getListBoardTaskNote(taskId, listId)", "lazy authoritative note load"],
  [notes, "payload.taskId === taskId && payload.listId === listId", "task/list identity gate"],
  [notes, "expectedUpdatedAt: snapshot.note?.updatedAt ?? null", "create/update version binding"],
  [notes, "expectedUpdatedAt: current.updatedAt", "delete version binding"],
  [notes, "Note change was saved, but authoritative task details could not refresh.", "committed note refresh-failure distinction"],
  [notes, "setLocallyBlocked(true)", "local unsafe retry blocker"],
  [notes, "void openUrl(link).catch", "explicit external link activation"],
  [notes, 'data-task-note-control="open-link"', "keyboard/pointer link control"],
  [notes, "<EditableDocument document={initialDocument} />", "structural rich-note editor rendering"],
  [notes, "<NoteViewer document={note.document} />", "structural saved-note viewer"],
  [card, "const noteExpanded = Boolean(notes?.expanded);", "task-card Notes expansion lock"],
  [card, "titleEditor || metricEditor || noteExpanded || subtaskExpanded", "action rail Notes geometry lock"],
  [board, "const [notePanelTaskId, setNotePanelTaskId]", "single board Notes panel state"],
  [board, "&& notePanelTaskId === null", "Notes interaction lock"],
  [board, "readOnly: aggregateView", "All Lists Notes read-only projection"],
  [board, 'data-board-note-panel={notePanelTaskId ?? "closed"}', "board Notes state marker"],
  [board, "setMutationRefreshBlocked(true);", "board unsafe retry blocker"],
  [board, '"[data-task-action], [data-task-title-control], [data-task-metric-control], [data-task-schedule-control], [data-task-note-control], [data-task-subtask-control]"', "parent drag isolation for note controls"],
]) {
  requireText(haystack, needle, label);
}

for (const forbidden of [
  "dangerouslySetInnerHTML",
  "fetch(",
  "XMLHttpRequest",
  "axios",
]) {
  if (notes.includes(forbidden)) {
    throw new Error(`Task Notes must not use unsafe HTML or remote preview/fetch behavior; found ${forbidden}`);
  }
}

const openUrlCalls = notes.match(/openUrl\(/g) ?? [];
if (openUrlCalls.length !== 1) {
  throw new Error(`Task Notes must have exactly one explicit opener call; found ${openUrlCalls.length}.`);
}
const linkHandler = notes.indexOf("onClick={() => {");
const openCall = notes.indexOf("void openUrl(link).catch");
if (linkHandler < 0 || openCall < linkHandler) {
  throw new Error("Task-note URL opening must remain inside an explicit click handler.");
}

const lazyLoadGuard = notes.indexOf("if (!expanded) return;");
const noteEffectStart = notes.lastIndexOf("useEffect(() => {", lazyLoadGuard);
const noteEffectEnd = notes.indexOf("}, [expanded, taskId, listId]);", lazyLoadGuard);
if (lazyLoadGuard < 0 || noteEffectStart < 0 || noteEffectEnd < 0) throw new Error("Could not isolate task-note lazy-load effect.");
if (notes.slice(noteEffectStart, noteEffectEnd).includes("openUrl(")) {
  throw new Error("Task-note lazy load must never open saved URLs.");
}

const boardNoteLockCount = (board.match(/notePanelTaskId === null/g) ?? []).length;
if (boardNoteLockCount < 3) {
  throw new Error(`Notes panel must lock reorder/create/subtask entry points; found ${boardNoteLockCount} locks.`);
}

console.log("Task Notes persistence, rich editor/viewer, and interaction contract checks passed.");