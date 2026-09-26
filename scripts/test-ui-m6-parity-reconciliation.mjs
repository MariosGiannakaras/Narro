import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const panel = read("src/FocusPanel.tsx");
const row = read("src/FocusTaskRow.tsx");
const actions = read("src/FocusLiveActions.tsx");
const notes = read("src/TaskNotes.tsx");
const timerApi = read("src/timerSessionApi.ts");
const lib = read("src-tauri/src/lib.rs");
const css = read("src/focusActionSlots.css");

for (const [haystack, needle, label] of [
  [row, 'data-focus-task-action="complete"', "A10/A13 ordinary completion control"],
  [row, 'data-focus-task-action="make-live"', "A10/A11 Rocket/Make Live control"],
  [row, 'data-focus-task-action="notes"', "A10/A13 ordinary Notes control"],
  [row, "Subtasks", "A10 ordinary Subtasks action"],
  [row, "Update Schedule", "A10/A13 schedule action"],
  [row, "Permanently delete", "A10/A13 destructive action"],
  [row, 'event.altKey', "A10/A12 keyboard queue movement"],
  [css, "grid-template-columns: repeat(3, 2rem)", "A10 stationary ordinary action slots"],
  [css, ".focus-panel__task-row:focus-within .focus-panel__task-actions", "A10 keyboard action reveal"],
  [panel, "snapshotTimerSession()", "A11 fresh authoritative timer read"],
  [panel, "switchTimerTask(task.id, mode)", "A11 authoritative live-task switch"],
  [panel, "startTimerTask(task.id, mode)", "A11 authoritative idle start"],
  [panel, "reorderListBoardTask({", "A12 persisted queue reorder"],
  [panel, 'sourceLane: "today"', "A12 Today queue identity"],
  [panel, "completeListBoardTask({", "A13 non-live completion boundary"],
  [panel, "permanentlyDeleteListBoardTask({", "A13 confirmed permanent-delete boundary"],
  [panel, "<TaskScheduleDialog", "A13 validated schedule editor reuse"],
  [row, "<TaskNotes", "A13 validated Notes reuse"],
  [panel, "createListBoardTask({", "A14 persistence-first Focus create"],
  [panel, 'aria-label="List for new Focus task"', "A14 explicit All Lists ownership"],
  [panel, 'insertAtTop: false', "A14 append semantics"],
  [panel, 'invoke<void>("exit_focus_to_main")', "A15 Focus Home lifecycle"],
  [lib, "async fn exit_focus_to_main(", "A15 native presentation-only exit command"],
  [lib, "show_or_recreate_main(app_handle.clone()).await?;", "A15 robust main lifecycle reuse"],
  [lib, "focus_surface_hide(app_handle)", "A15 Focus surface hide reuse"],
  [notes, "allowTaskTitleEdit", "A16 Notes-only live title gate"],
  [notes, "updateListBoardTaskTitle({", "A16 stale-safe title persistence reuse"],
  [notes, "expectedTitle: titleBaseline", "A16 expected-title stale guard"],
  [actions, "allowTaskTitleEdit={!floating}", "A16 title edit confined to Focus Panel Notes"],
  [timerApi, 'invoke<TimerSessionPayload>("timer_extend")', "A17 typed timer Extend API"],
  [actions, 'void run("extend", extendTimer, "Work extended into overtime.")', "A17 Time's Up Extend action"],
]) {
  requireText(haystack, needle, label);
}

if (row.includes("invoke<") || row.includes('invoke("')) {
  throw new Error("Ordinary Focus row presentation must remain callback-driven rather than native authority.");
}
if (panel.includes('invoke<TimerSessionPayload>("timer_')) {
  throw new Error("Focus Panel must use typed timerSessionApi boundaries instead of raw timer IPC.");
}
if (!panel.includes("aggregateView ? addTaskListId : board.target.id")) {
  throw new Error("All Lists Focus create must not infer an owning list.");
}
if (!panel.includes("aggregateView || task.scheduledLocalDate !== null")) {
  throw new Error("Aggregate/future-scheduled Focus reorder must remain disabled.");
}
if (lib.slice(lib.indexOf("async fn exit_focus_to_main("), lib.indexOf("fn main_window_show(", lib.indexOf("async fn exit_focus_to_main("))).includes("timer_")) {
  throw new Error("Focus Home lifecycle must not mutate timer/session state.");
}

console.log("M6 Focus parity reconciliation contract checks passed.");
