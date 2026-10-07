import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const component = read("src/TaskCard.tsx");
const board = read("src/ListBoard.tsx");
const pointer = read("src/boardTaskPointerDrag.ts");
const css = read("src/listBoard.css");
const overlay = read("src/overlayPrimitives.tsx");
const api = read("src/listBoardApi.ts");
const rust = read("src-tauri/src/board_task_mutation.rs");
const lib = read("src-tauri/src/lib.rs");
const changeListDialog = read("src/TaskChangeListDialog.tsx");
const validator = read("scripts/validate-task-card-state-captures.mjs");
const focusEditorFixture = read("src/focusEditorsVisualFixture.tsx");
const finding28Fixture = read("src/finding28PostDragFixture.tsx");
const finding28Driver = read("scripts/test-finding28-post-drag-action-rail.mjs");
const packageJson = read("package.json");

for (const [haystack, needle, label] of [
  [component, 'import { Menu, MenuItem, Tooltip } from "./overlayPrimitives";', "shared overlay primitive reuse"],
  [component, 'data-task-action-slot="reserved"', "reserved action slot marker"],
  [component, 'data-task-actions="source-hover-rail"', "production reorder/overflow action rail"],
  [component, 'label="Subtasks"', "Subtasks accessible action"],
  [component, 'label="Notes"', "Notes accessible action"],
  [component, 'triggerLabel="Task actions"', "accessible overflow trigger"],
  [component, 'data-task-action-position="lane-left"', "fixed lane-left action position"],
  [component, 'data-task-action-position="lane-right"', "fixed lane-right action position"],
  [component, 'data-task-action-position="overflow"', "fixed overflow action position"],
  [component, "onPointerDown={(event) => event.stopPropagation()}", "pointer action drag isolation"],
  [component, "onClick={action}", "callback-gated pointer action"],
  [pointer, '[data-task-action], [data-task-title-control], [data-task-metric-control], [data-task-schedule-control], [data-task-note-control], [data-task-subtask-control]', "parent drag-start interactive-control guard including notes and subtasks"],
  [board, "const handleMoveWithinLane = (", "shared keyboard within-lane helper"],
  [board, "const handleMoveAcrossLane = (", "shared pointer lane-move helper"],
  [board, "actions={taskActions}", "production TaskCard callback wiring"],
  [board, "onMoveAcrossLane={handleMoveAcrossLane}", "source lane-arrow callback wiring"],
  [board, "onChangeListTask={requestTaskChangeList}", "Change List board wiring"],
  [board, "onDuplicateTask={(task) => void duplicateTaskFromBoard(task)}", "Duplicate board wiring"],
  [board, "await changeListBoardTask({", "persistence-first Change List mutation"],
  [board, "await duplicateListBoardTask({", "persistence-first Duplicate mutation"],
  [board, "<TaskChangeListDialog", "explicit Change List chooser"],
  [api, 'committedBoardMutation<void>("change_list_board_task"', "typed committed Change List IPC"],
  [api, 'committedBoardMutation<string>("duplicate_list_board_task"', "typed committed Duplicate IPC"],
  [rust, "fn change_board_task_list(", "Change List command boundary"],
  [rust, "fn duplicate_board_task(", "Duplicate command boundary"],
  [rust, "ensure_no_open_session(conn, id)?;", "live-session command guard"],
  [rust, "change_list_preserves_identity_schedule_recurrence_and_session_history", "Change List metadata/history regression"],
  [rust, "change_list_and_duplicate_reject_stale_or_live_source_without_writing", "stale/live rejection regression"],
  [lib, "board_task_mutation::change_list_board_task,", "Change List Tauri registration"],
  [lib, "board_task_mutation::duplicate_list_board_task,", "Duplicate Tauri registration"],
  [changeListDialog, 'data-task-change-list-dialog="true"', "accessible Change List dialog"],
  [changeListDialog, 'data-task-change-list-select="true"', "destination-list chooser"],
  [board, 'handleMoveWithinLane(task, lane, "up")', "keyboard Move up helper reuse"],
  [board, 'handleMoveWithinLane(task, lane, "down")', "keyboard Move down helper reuse"],
  [board, "void commitDrop(task.id, lane, lane", "validated persistence-first reorder helper reuse"],
  [css, "grid-template-columns: 1rem minmax(0, 1fr) 6.25rem;", "fixed reserved title/action columns"],
  [css, "min-height: 1.25rem;", "validated title-row slot baseline"],
  [css, "height: 1.25rem;", "fixed reserved action-slot baseline height"],
  [css, "position: absolute;", "overlay action rail positioning"],
  [css, "width: 6.25rem;", "fixed action-slot/rail width"],
  [css, "grid-template-columns: repeat(5, 1rem);", "five-position compact source rail"],
  [css, "height: 1.75rem;", "fixed overlay action rail/button height"],
  [css, "opacity: 0;", "rest-state hidden action rail"],
  [css, "visibility: hidden;", "rest-state non-visible action rail"],
  [css, "pointer-events: none;", "rest-state inert action rail"],
  [css, ".list-board-task:hover .list-board-task__actions", "pointer hover reveal"],
  [css, ".list-board-task:focus-within .list-board-task__actions", "keyboard child-focus reveal"],
  [css, ".list-board-task-drag-shell:focus-visible .list-board-task__actions", "keyboard card-focus reveal"],
  [css, "transition-property: opacity;", "layout-stable action reveal transition"],
  [overlay, 'role="tooltip"', "accessible Tooltip semantics"],
  [overlay, 'role="menu"', "accessible Menu semantics"],
  [overlay, 'role="menuitem"', "accessible MenuItem semantics"],
  [validator, "action reveal changed card width", "captured card-width no-reflow validation"],
  [validator, "action reveal changed card height", "captured card-height no-reflow validation"],
  [validator, "action reveal changed title-row width", "captured title-row-width no-reflow validation"],
  [validator, "action reveal changed title-row height", "captured title-row-height no-reflow validation"],
  [validator, "reserved action slot width changed", "captured fixed action-slot width validation"],
  [validator, "reserved action slot height changed", "captured fixed action-slot height validation"],
  [focusEditorFixture, 'scenario === "finding28-post-drag"', "Finding28 rendered fixture route"],
  [finding28Fixture, "<ListBoard target={{ kind: \"list\", id: listId }} />", "Finding28 production ListBoard fixture"],
  [finding28Fixture, 'command === "reorder_list_board_task"', "Finding28 real reorder authority mock"],
  [finding28Driver, '"Input.dispatchMouseEvent"', "Finding28 browser pointer input"],
  [finding28Driver, "new PointerEvent", "Finding28 deterministic production pointer transport"],
  [finding28Driver, "isTrusted", "Finding28 synthetic drag transport disclosure"],
  [finding28Driver, '"Input.dispatchKeyEvent"', "Finding28 browser keyboard input"],
  [finding28Driver, 'probeCard?.matches(":focus-within")', "Finding28 focus-within observation"],
  [finding28Driver, 'probeShell?.matches(":focus-visible")', "Finding28 shell focus-visible observation"],
  [finding28Driver, 'getComputedStyle(rail)', "Finding28 computed rail style observation"],
  [finding28Driver, 'probeCard?.matches(":hover")', "Finding28 actual hover observation"],
  [finding28Driver, '"finding28-post-drag-action-rail.json"', "Finding28 durable rendered result"],
  [packageJson, '"test:finding28-post-drag-action-rail"', "Finding28 Windows regression package route"],
  [packageJson, "npm run test:finding28-post-drag-action-rail", "Finding28 Windows visual-gate execution"],
]) {
  requireText(haystack, needle, label);
}

for (const forbidden of [
  "invoke(",
  "complete_task",
  "delete_task",
  "archive_task",
  "update_task",
  "moveListBoardTask",
  "reorderListBoardTask",
]) {
  if (component.includes(forbidden)) {
    throw new Error(`TaskCard hover actions must remain callback-gated presentation; found ${forbidden}`);
  }
}

const actionsStart = css.indexOf(".list-board-task__actions {");
const actionsEnd = css.indexOf("}\n\n.list-board-task:hover .list-board-task__actions", actionsStart);
if (actionsStart < 0 || actionsEnd < 0) {
  throw new Error("Could not isolate task hover-action rail styles.");
}
const actionRailCss = css.slice(actionsStart, actionsEnd);
for (const forbidden of ["display: none", "position: static", "grid-template-columns: 0", "width: 0", "height: 0"]) {
  if (actionRailCss.includes(forbidden)) {
    throw new Error(`Task hover-action rest state must retain overlay geometry; found ${forbidden}`);
  }
}

const slotStart = css.indexOf(".list-board-task__action-slot {");
const slotEnd = css.indexOf("}\n\n.list-board-task__actions", slotStart);
if (slotStart < 0 || slotEnd < 0) {
  throw new Error("Could not isolate reserved task action slot styles.");
}
const slotCss = css.slice(slotStart, slotEnd);
for (const required of ["position: relative;", "width: 6.25rem;", "height: 1.25rem;"]) {
  if (!slotCss.includes(required)) {
    throw new Error(`Reserved task action slot must preserve validated baseline geometry; missing ${required}`);
  }
}

const helperStart = board.indexOf("const handleMoveAcrossLane = (");
const helperEnd = board.indexOf("const handleTaskKeyDown = (", helperStart);
if (helperStart < 0 || helperEnd < 0) {
  throw new Error("Could not isolate shared within-lane action helper.");
}
const helper = board.slice(helperStart, helperEnd);
if (!helper.includes("commitDrop(task.id, sourceLane, targetLane, null)")) {
  throw new Error("Pointer lane actions must reuse the validated positional commitDrop boundary.");
}
for (const forbidden of ["reorderListBoardTask(", "moveListBoardTask(", "setSnapshot("]) {
  if (helper.includes(forbidden)) {
    throw new Error(`Direct lane action helper must not create a parallel mutation/projection path; found ${forbidden}`);
  }
}


// Actual menu ordering, retained confirmation, cancellation/failure/retry and
// task identity are exercised by the rendered m7-integration CI scenario.

for (const forbidden of ["setSnapshot(", "crypto.randomUUID(", "Math.random("]) {
  const changeStart = board.indexOf("const requestTaskChangeList");
  const changeEnd = board.indexOf("const handleCommittedSubtaskRefreshFailure", changeStart);
  const slice = board.slice(changeStart, changeEnd);
  if (slice.includes(forbidden)) {
    throw new Error(`Task menu mutations must publish only after authoritative persistence; found ${forbidden}`);
  }
}

console.log("Task hover/action-menu geometry and persistence contracts passed.");
