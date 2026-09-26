import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus action-slot contract failed: ${message}`);
}

const titleModule = read("src/FocusTaskRowTitle.tsx");
const row = read("src/FocusTaskRow.tsx");
const slotCss = read("src/focusActionSlots.css");
const panelCss = read("src/focusPanel.css");
const rowTitleCss = read("src/focusTaskRowTitle.css");
const subtasks = read("src/TaskSubtasks.tsx");
const liveActions = read("src/FocusLiveActions.tsx");
const fixture = read("src/focusPanelVisualFixture.tsx");
const visualValidator = read("scripts/validate-focus-action-slot-captures.mjs");
const pkg = JSON.parse(read("package.json"));

invariant(titleModule.includes('import "./focusActionSlots.css";'), "Focus surface must load the reserved-slot stylesheet");
invariant(row.includes('className="focus-panel__task-actions"'), "ordinary task action rail must use the reserved production path");
invariant(row.includes('data-focus-task-action="make-live"'), "ordinary Make Live control must remain in a fixed slot");
invariant(row.includes('data-focus-task-action="notes"'), "ordinary Notes control must remain in a fixed slot");
invariant(slotCss.includes(".focus-panel__task-actions"), "ordinary Focus action rail must have a reserved stylesheet contract");
invariant(slotCss.includes("grid-template-columns: repeat(3, 2rem)"), "ordinary Focus action positions must stay fixed-size");
invariant(slotCss.includes("width: 6.5rem"), "ordinary Focus action rail must reserve fixed width");
invariant(slotCss.includes(".focus-panel__task-row:hover .focus-panel__task-actions"), "pointer hover must reveal ordinary actions in place");
invariant(slotCss.includes(".focus-panel__task-row:focus-within .focus-panel__task-actions"), "keyboard focus must reveal ordinary actions in place");
invariant(slotCss.includes(".focus-panel__subtasks .list-board-task__subtask-actions"), "reserved subtask action rail must be scoped to Focus");
invariant(slotCss.includes("min-width: 5.75rem"), "hidden Focus subtask controls must retain their reserved width");
invariant(slotCss.includes("flex: none"), "reserved Focus subtask action width must not flex with title content");
invariant(slotCss.includes("opacity: 0"), "resting Focus subtask actions must reveal without insertion into layout");
invariant(slotCss.includes("pointer-events: none"), "visually hidden Focus subtask actions must not keep pointer hit targets active");
invariant(slotCss.includes(".list-board-task__subtask-row:hover .list-board-task__subtask-actions"), "pointer hover must reveal the reserved action rail");
invariant(slotCss.includes(".list-board-task__subtask-row:focus-within .list-board-task__subtask-actions"), "keyboard/child focus must reveal the same reserved action rail");
invariant(slotCss.includes("opacity: 1"), "revealed action rail must become visible in place");
invariant(slotCss.includes("pointer-events: auto"), "revealed action rail must restore pointer hit targets");
invariant(!slotCss.includes("display: none"), "reserved action rail must never be removed from layout");
invariant(!slotCss.includes("position: absolute"), "Focus subtask action rail must reuse the existing fixed grid column rather than a second geometry model");
invariant(!slotCss.includes("margin-left"), "action reveal must not move sibling content with margins");
invariant(!slotCss.includes("transform:"), "action reveal must not translate or scale hit targets");
invariant(!slotCss.includes("transition:"), "item 13 must not add motion that needs a separate reduced-motion contract");
invariant(panelCss.includes("grid-template-columns: 1.75rem minmax(0, 1fr) 5.75rem"), "Focus subtask rows must reserve a fixed action column beside flexible text");
invariant(panelCss.includes("width: 5.75rem"), "Focus subtask action rail must retain fixed width in the base layout");
invariant(panelCss.includes("grid-template-columns: repeat(3, 1.75rem)"), "Focus subtask action positions must remain fixed-size hit slots");
invariant(panelCss.includes("grid-template-columns: repeat(5, minmax(0, 1fr))"), "live Focus actions must retain their stable five-slot grid");
invariant(slotCss.includes(".focus-panel__live-actions > button"), "live action controls need an explicit slot-filling rule");
invariant(slotCss.includes("width: 100%"), "each live action control must fill its existing grid slot without changing grid geometry");
invariant(subtasks.includes('className="list-board-task__subtask-actions"'), "shared subtask action rail markup must remain the reused production path");
invariant(subtasks.includes('data-task-subtask-control="move-up"'), "existing Move up Focus subtask control must remain present");
invariant(subtasks.includes('data-task-subtask-control="move-down"'), "existing Move down Focus subtask control must remain present");
invariant(subtasks.includes('data-task-subtask-control="delete"'), "existing Delete Focus subtask control must remain present");
invariant(liveActions.includes('className="focus-panel__live-actions"'), "existing live action strip must remain the production path");
invariant(rowTitleCss.includes("-webkit-line-clamp: 2"), "item-12 two-line ordinary title contract must remain intact");
invariant(rowTitleCss.includes("flex: 1 1 auto"), "item-12 flexible title slot must remain intact");
invariant(fixture.includes('actions: optionalBox(".focus-panel__live-actions")'), "Windows visual fixture must keep measuring live action geometry whenever a live surface exists");
invariant(visualValidator.includes("baselineActionWidth"), "Windows visual validator must compare Focus action width across captures");
invariant(visualValidator.includes("baselineActionHeight"), "Windows visual validator must compare Focus action height across captures");
invariant(pkg.scripts["test:ui-focus-action-slots"] === "node scripts/test-ui-focus-action-slots.mjs", "package script registration differs");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-action-slots"), "frontend preflight must run the Focus action-slot contract");
invariant(pkg.scripts["test:visual-regression:windows"].includes("validate-focus-action-slot-captures.mjs"), "Windows visual validation must compare stable Focus action geometry");

console.log("Focus reserved action-slot and stable hit-target contracts passed.");
