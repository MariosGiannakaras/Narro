import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`M6 parity reconciliation missing ${label}: ${needle}`);
}

const panel = read("src/FocusPanel.tsx");
const actions = read("src/FocusLiveActions.tsx");
const entry = read("src/BlitzEntryButton.tsx");
const boardCss = read("src/listBoard.css");
const notes = read("src/TaskNotes.tsx");
const timerApi = read("src/timerSessionApi.ts");
const native = read("src-tauri/src/lib.rs");
const panelCss = read("src/focusPanel.css");
const visualStatesCss = read("src/focusVisualStates.css");
const slotCss = read("src/focusActionSlots.css");
const visualFixture = read("src/focusPanelVisualFixture.tsx");
const visualValidator = read("scripts/validate-focus-panel-captures.mjs");

for (const [haystack, needle, label] of [
  [panel, 'data-focus-row-action="complete"', "A10 ordinary completion control"],
  [panel, 'data-focus-row-action="make-live"', "A10 Rocket / Make Live control"],
  [panel, 'data-focus-row-action="move-up"', "A10 keyboard/pointer Move up control"],
  [panel, 'data-focus-row-action="move-down"', "A10 keyboard/pointer Move down control"],
  [panel, 'data-focus-row-action="more"', "A10 stable overflow action control"],
  [slotCss, "width: 7.75rem", "A10 reserved row action geometry"],
  [panelCss, "grid-template-columns: 1.75rem minmax(0, 1fr) 7.75rem", "A10 non-shifting row grid"],
  [panel, "snapshotTimerSession()", "A11 fresh timer authority read"],
  [panel, "switchTimerTask(task.id, mode)", "A11 authoritative live-task switch"],
  [panel, "focusModeForTask(authoritative.runtime.timer.mode, task)", "A11 source-consistent timer mode resolution"],
  [panel, "reorderListBoardTask({", "A12 validated persisted queue reorder boundary"],
  [panel, 'sourceLane: "today"', "A12 Today bucket identity"],
  [panel, 'const reorderableTasks = target.kind === "list"', "A12 aggregate reorder remains disabled"],
  [panel, "completeListBoardTask({", "A13 validated non-live completion boundary"],
  [panel, "permanentlyDeleteListBoardTask({", "A13 confirmed permanent-delete boundary"],
  [panel, "<TaskDeleteConfirmDialog", "A13 explicit permanent-delete confirmation"],
  [panel, "<TaskScheduleDialog", "A13 validated scheduling UI"],
  [panel, "<TaskNotes", "A13 validated ordinary-row Notes UI"],
  [panel, "createListBoardTask({", "A14 persistence-first Focus task create"],
  [panel, 'data-focus-add-task-list="true"', "A14 explicit All Lists owner selection"],
  [panel, 'lane: "today"', "A14 Today creation target"],
  [panel, 'invoke<void>("focus_surface_exit_to_main")', "A15 renderer Home lifecycle invocation"],
  [native, "async fn focus_surface_exit_to_main", "A15 native Focus exit command"],
  [native, "show_or_recreate_main(app_handle.clone()).await?;", "A15 existing Main lifecycle reuse"],
  [native, "focus_surface_hide(app_handle)", "A15 Focus hide without timer reset"],
  [notes, "updateListBoardTaskTitle({", "A16 stale-safe live-title persistence"],
  [notes, 'data-task-note-title-editor="true"', "A16 title editor lives inside Notes"],
  [actions, 'allowTitleEdit={!fixtureMode && presentation === "panel"}', "A16 title edit limited to Focus Panel Notes"],
  [actions, "onTitleCommitted={onTaskMutationCommitted}", "A16 authoritative Focus refresh after title save"],
  [timerApi, 'committedTimerMutation("timer_extend")', "A17 typed authoritative committed Extend API"],
  [actions, 'extendEnabled: timer.state === "time_up"', "A17 Time's Up-only Extend state"],
  [actions, 'data-focus-action="extend"', "A17 visible Extend action"],
  [actions, 'run("extend", extendTimer', "A17 authoritative Extend mutation"],
  [visualFixture, 'rowActionSlot: optionalBox(', "M6 ordinary-row visual measurement"],
  [visualValidator, "ordinary row action slot must reserve 7.75rem/124px", "M6 Windows row geometry validator"],
  [entry, "const BLITZ_BOARD_FADE_MS = 250;", "P3-M6-01 measured board-fade duration"],
  [entry, "restoreBoard = await fadeBoardBeforeFocusPresentation();", "P3-M6-01 board fade before Focus"],
  [entry, 'window.matchMedia("(prefers-reduced-motion: reduce)").matches', "P3-M6-01 reduced-motion bypass"],
  [boardCss, '.list-board[data-blitz-focus-transition="fading"]', "P3-M6-01 board fade selector"],
  [boardCss, "transition: opacity 250ms var(--motion-ease-exit);", "P3-M6-01 finite board fade"],
  [notes, "recognizedUrlParts", "P3-M6-02 automatic http(s) recognition"],
  [notes, "autoLinkEditorUrls", "P3-M6-02 live editor auto-linking"],
  [notes, 'data-note-url-activation="explicit"', "P3-M6-02 explicit browser activation retained"],
  [visualStatesCss, "linear-gradient(115deg, var(--color-accent-start), var(--color-accent-end)) border-box", "P3-M6-03 calibrated Focus live edge"],
  [visualStatesCss, "0 0 8px color-mix(in srgb, var(--color-accent-start) 12%, transparent)", "P3-M6-03 restrained live glow"],
]) {
  requireText(haystack, needle, label);
}

const exitStart = native.indexOf("async fn focus_surface_exit_to_main");
const exitEnd = native.indexOf("#[tauri::command]", exitStart + 1);
const exitCommand = native.slice(exitStart, exitEnd);
for (const forbidden of ["timer_complete", "timer_skip", "timer_pause", "timer_resume", "timer_start", "timer_switch"]) {
  if (exitCommand.includes(forbidden)) {
    throw new Error(`A15 Focus Home must not mutate timer/session state via ${forbidden}`);
  }
}

const makeLiveStart = panel.indexOf("const makeTaskLive");
const makeLiveEnd = panel.indexOf("const exitFocusHome", makeLiveStart);
const makeLive = panel.slice(makeLiveStart, makeLiveEnd);
requireText(makeLive, "snapshotTimerSession()", "A11 stale-state guard");
requireText(makeLive, "switchTimerTask(task.id, mode)", "A11 switch path");
if (makeLive.includes("completeTimerTask") || makeLive.includes("skipTimerTask")) {
  throw new Error("A11 Rocket must switch the current work segment rather than complete/skip it.");
}

const reorderStart = panel.indexOf("const moveFocusTask");
const reorderEnd = panel.indexOf("const renderTaskRow", reorderStart);
const reorder = panel.slice(reorderStart, reorderEnd);
if (!reorder.includes("reorderListBoardTask({") || reorder.includes("moveListBoardTask")) {
  throw new Error("A12 Focus queue reorder must reuse the validated reorder boundary only.");
}

if (actions.includes('allowTitleEdit={true}')) {
  throw new Error("A16 live-title editing must remain constrained to the Focus Panel Notes presentation.");
}

for (const forbidden of ['label="Add link"', "window.prompt(", 'command("createLink"']) {
  if (notes.includes(forbidden)) {
    throw new Error(`P3-M6-02 source toolbar must use automatic URL recognition rather than ${forbidden}.`);
  }
}

const toolbarOrder = [
  'label="Bold"',
  'label="Italic"',
  'label="Strikethrough"',
  'label="Bulleted list"',
  'label="Numbered list"',
  'label="Undo"',
  'label="Redo"',
];
let previousToolbarIndex = -1;
for (const label of toolbarOrder) {
  const index = notes.indexOf(label);
  if (index <= previousToolbarIndex) {
    throw new Error(`P3-M6-02 Notes toolbar order differs at ${label}.`);
  }
  previousToolbarIndex = index;
}

const startBlitz = entry.indexOf("const outcome = await startBlitz();");
const boardFade = entry.indexOf("restoreBoard = await fadeBoardBeforeFocusPresentation();", startBlitz);
const focusPresent = entry.indexOf("await presentFocusForBlitz();", boardFade);
if (startBlitz < 0 || boardFade < startBlitz || focusPresent < boardFade) {
  throw new Error("P3-M6-01 must keep domain start authoritative, then fade the board, then present Focus.");
}

console.log("M6 Focus parity reconciliation contract checks passed.");
