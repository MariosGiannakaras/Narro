import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const component = read("src/TaskCard.tsx");
const board = read("src/ListBoard.tsx");
const css = read("src/listBoard.css");
const overlay = read("src/overlayPrimitives.tsx");
const validator = read("scripts/validate-task-card-state-captures.mjs");

for (const [haystack, needle, label] of [
  [component, 'import { Tooltip } from "./overlayPrimitives";', "shared Tooltip reuse"],
  [component, 'data-task-action-slot="reserved"', "reserved action slot marker"],
  [component, 'data-task-actions="reorder"', "production reorder action rail"],
  [component, 'label="Move task up"', "Move up accessible action"],
  [component, 'label="Move task down"', "Move down accessible action"],
  [component, "onPointerDown={(event) => event.stopPropagation()}", "pointer action drag isolation"],
  [component, "onClick={action}", "callback-gated pointer action"],
  [board, '"[data-task-action], [data-task-title-control], [data-task-metric-control], [data-task-schedule-control]"', "parent drag-start interactive-control guard"],
  [board, "const handleMoveWithinLane = (", "shared within-lane action helper"],
  [board, "actions={taskActions}", "production TaskCard callback wiring"],
  [board, "onMoveWithinLane={handleMoveWithinLane}", "BoardLane callback wiring"],
  [board, 'handleMoveWithinLane(task, lane, "up")', "keyboard Move up helper reuse"],
  [board, 'handleMoveWithinLane(task, lane, "down")', "keyboard Move down helper reuse"],
  [board, "void commitDrop(task.id, lane, lane", "validated persistence-first reorder helper reuse"],
  [css, "grid-template-columns: 1rem minmax(0, 1fr) 4.25rem;", "fixed reserved title/action columns"],
  [css, "min-height: 1.25rem;", "validated title-row slot baseline"],
  [css, "height: 1.25rem;", "fixed reserved action-slot baseline height"],
  [css, "position: absolute;", "overlay action rail positioning"],
  [css, "width: 4.25rem;", "fixed action-slot/rail width"],
  [css, "height: 1.75rem;", "fixed overlay action rail/button height"],
  [css, "opacity: 0;", "rest-state hidden action rail"],
  [css, "visibility: hidden;", "rest-state non-visible action rail"],
  [css, "pointer-events: none;", "rest-state inert action rail"],
  [css, ".list-board-task:hover .list-board-task__actions", "pointer hover reveal"],
  [css, ".list-board-task:focus-within .list-board-task__actions", "keyboard child-focus reveal"],
  [css, ".list-board-task-drag-shell:focus-visible .list-board-task__actions", "keyboard card-focus reveal"],
  [css, "transition-property: opacity;", "layout-stable action reveal transition"],
  [overlay, 'role="tooltip"', "accessible Tooltip semantics"],
  [validator, "action reveal changed card width", "captured card-width no-reflow validation"],
  [validator, "action reveal changed card height", "captured card-height no-reflow validation"],
  [validator, "action reveal changed title-row width", "captured title-row-width no-reflow validation"],
  [validator, "action reveal changed title-row height", "captured title-row-height no-reflow validation"],
  [validator, "reserved action slot width changed", "captured fixed action-slot width validation"],
  [validator, "reserved action slot height changed", "captured fixed action-slot height validation"],
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
for (const required of ["position: relative;", "width: 4.25rem;", "height: 1.25rem;"]) {
  if (!slotCss.includes(required)) {
    throw new Error(`Reserved task action slot must preserve validated baseline geometry; missing ${required}`);
  }
}

const helperStart = board.indexOf("const handleMoveWithinLane = (");
const helperEnd = board.indexOf("const handleTaskKeyDown = (", helperStart);
if (helperStart < 0 || helperEnd < 0) {
  throw new Error("Could not isolate shared within-lane action helper.");
}
const helper = board.slice(helperStart, helperEnd);
if (!helper.includes("commitDrop")) {
  throw new Error("Pointer reorder actions must reuse the validated commitDrop boundary.");
}
for (const forbidden of ["reorderListBoardTask(", "moveListBoardTask(", "setSnapshot("]) {
  if (helper.includes(forbidden)) {
    throw new Error(`Within-lane action helper must not create a parallel mutation/projection path; found ${forbidden}`);
  }
}

console.log("Task hover-action geometry contract checks passed.");
