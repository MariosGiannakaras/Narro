import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`M6 parity reconciliation missing ${label}: ${needle}`);
}

const panel = read("src/FocusPanel.tsx");
const focusPointerDrag = read("src/focusTaskPointerDrag.ts");
const quickPreferences = read("src/FocusQuickPreferences.tsx");
const quickPreferencesCss = read("src/focusQuickPreferences.css");
const actions = read("src/FocusLiveActions.tsx");
const entry = read("src/BlitzEntryButton.tsx");
const boardCss = read("src/listBoard.css");
const notes = read("src/TaskNotes.tsx");
const timerApi = read("src/timerSessionApi.ts");
const coordinator = read("src/FocusSurfaceCoordinator.tsx");
const timerService = read("src-tauri/src/timer_service.rs");
const native = read("src-tauri/src/lib.rs");
const morph = read("src-tauri/src/main_focus_morph.rs");
const panelCss = read("src/focusPanel.css");
const visualStatesCss = read("src/focusVisualStates.css");
const slotCss = read("src/focusActionSlots.css");
const visualFixture = read("src/focusPanelVisualFixture.tsx");
const visualValidator = read("scripts/validate-focus-panel-captures.mjs");

for (const [haystack, needle, label] of [
  [panel, 'data-focus-row-action="complete"', "A10 ordinary completion control"],
  [panel, 'data-focus-row-action="make-live"', "P3-M6-05 Rocket / Make Live control"],
  [panel, 'data-focus-row-action="subtasks"', "P3-M6-05 direct Subtasks control"],
  [panel, 'data-focus-row-action="notes"', "P3-M6-05 direct Notes control"],
  [panel, 'data-focus-row-action="more"', "P3-M6-05 stable overflow action control"],
  [panel, 'tabIndex={ordinary && canReorder ? 0 : undefined}', "P3-M6-05 focusable keyboard reorder/reveal entry"],
  [panel, 'onPointerDown={ordinary && canReorder && !moreOpen ? onPointerReorder : undefined}', "P3-M6-05 no drag while overflow is open"],
  [panel, 'onKeyDown={ordinary && canReorder && !moreOpen ? (event) => {', "P3-M6-05 no keyboard reorder while overflow is open"],
  [panel, "<FocusLiveSubtasks", "P3-M6-05 validated subtask surface reuse"],
  [panel, "changeListBoardTask({", "P3-M6-05 validated Change list boundary"],
  [panel, "duplicateListBoardTask({", "P3-M6-05 validated Duplicate boundary"],
  [panel, "<TaskChangeListDialog", "P3-M6-05 validated Change list dialog reuse"],
  [panel, "beginFocusTaskPointerDrag({", "P3-M6-05 pointer-drag Focus reorder"],
  [panel, 'event.target.closest("button, input, select, textarea, [contenteditable]")', "P3-M6-05 keyboard action/editor guard"],
  [panel, 'if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;', "P3-M6-05 keyboard reorder alternative"],
  [panel, 'canReorder={index !== undefined && notesTaskId !== task.id && subtasksTaskId !== task.id}', "P3-M6-05 expanded editor reorder guard"],
  [focusPointerDrag, 'data-focus-reorder-zone="true"', "P3-M6-05 scoped Focus reorder zone"],
  [focusPointerDrag, "Math.hypot(x - options.x, y - options.y) < 6", "P3-M6-05 drag activation threshold"],
  [focusPointerDrag, "source.setPointerCapture(pointerId)", "P3-M6-05 stable pointer capture"],
  [focusPointerDrag, 'event.key !== "Escape"', "P3-M6-05 Escape cancellation"],
  [slotCss, "width: 7.75rem", "A10 reserved row action geometry"],
  [slotCss, '.focus-panel__task-row:hover .focus-panel__row-action--complete', "P3-M6-05 hover-revealed completion control"],
  [slotCss, '.focus-panel__task-drag-preview', "P3-M6-05 lightweight Focus drag preview"],
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
  [panel, 'data-focus-preferences-control="true"', "M6 Focus Quick Preferences active gear"],
  [panel, 'onClick={() => setQuickPreferencesOpen(true)}', "M6 Focus Quick Preferences entry"],
  [quickPreferences, 'data-focus-quick-preferences="true"', "M6 source-evidenced Quick Preferences surface"],
  [quickPreferences, 'PreferenceSettingsRuntimeProvider', "M6 Quick Preferences reuses validated preference authority"],
  [quickPreferences, 'onSave({ hideTaskTimes: !snapshot.general.hideTaskTimes }, "hideTaskTimes")', "M6 Quick Preferences hide-times mutation"],
  [quickPreferences, 'onSave({ selectedMonitorKey: monitor.key }, "monitor")', "M6 Quick Preferences monitor mutation"],
  [quickPreferences, 'data-focus-quick-screen-dimensions="true"', "M6 Quick Preferences monitor dimensions"],
  [quickPreferences, 'onSave({ focusPanelSide: side }, "side")', "M6 Quick Preferences panel-side mutation"],
  [quickPreferences, 'onSave({ pomodoroEnabled: !snapshot.focus.pomodoroEnabled }, "pomodoro")', "M6 Quick Preferences Pomodoro mutation"],
  [quickPreferences, 'onSave({ timedAlertsEnabled: !snapshot.alerts.timedAlertsEnabled }, "timedAlerts")', "M6 Quick Preferences timed-alert mutation"],
  [quickPreferences, 'onSave({ notificationAlertsEnabled: !snapshot.alerts.notificationAlertsEnabled }, "notificationAlerts")', "M6 Quick Preferences notification mutation"],
  [quickPreferences, 'onSave({ showSuccessScreen: !snapshot.celebration.showSuccessScreen }, "successScreen")', "M6 Quick Preferences success-screen mutation"],
  [quickPreferences, 'snapshot.celebration.showSuccessScreen ? (', "M6 Quick Preferences nested success option"],
  [quickPreferences, 'onSave({ funGif: !snapshot.celebration.funGif }, "funGif")', "M6 Quick Preferences Fun GIF mutation"],
  [quickPreferencesCss, ".focus-quick-preferences__screen--selected", "M6 selected-monitor visual treatment"],
  [quickPreferencesCss, "border-color: var(--color-accent-end);", "M6 calibrated selected-monitor accent outline"],
  [native, "async fn focus_surface_exit_to_main", "A15 native Focus exit command"],
  [native, "show_or_recreate_main(app_handle.clone()).await?;", "A15 existing Main lifecycle reuse"],
  [native, "focus_surface_hide(app_handle)", "A15 Focus hide without timer reset"],
  [panel, "await pauseTimerForFocusHome();", "P3-M6-06 guarded Home pause"],
  [panel, "await waitForPresentedFrame();", "P3-M6-06 visible PAUSED frame before exit"],
  [panel, "await resumeTimerFromFocusHome();", "P3-M6-06 guarded Home exit rollback"],
  [timerApi, 'committedOptionalTimerMutation("timer_pause_for_focus_home")', "P3-M6-06 typed optional Home pause API"],
  [timerApi, 'committedOptionalTimerMutation("timer_resume_focus_home_pause")', "P3-M6-06 typed optional guarded resume API"],
  [timerService, "struct FocusHomePauseLease", "P3-M6-06 one-shot pause provenance"],
  [timerService, "lease.take()", "P3-M6-06 one-shot resume ownership"],
  [timerService, "payload.revision == lease.revision", "P3-M6-06 exact revision guard"],
  [timerService, "payload.runtime.timer.task_id == Some(lease.task_id)", "P3-M6-06 exact task guard"],
  [timerService, "payload.runtime.open_session_id == Some(lease.session_id)", "P3-M6-06 exact session guard"],
  [coordinator, "const handleBlitzPanelRequest = useCallback(async () => {", "P3-M6-06 Blitz-only resume coordinator"],
  [coordinator, 'await requestModeRef.current("panel");', "P3-M6-06 Panel settlement before resume"],
  [coordinator, "await resumeTimerFromFocusHome();", "P3-M6-06 guarded post-reveal resume"],
  [native, "fn request_blitz_panel_after_reveal(", "P3-M6-06 native post-reveal handshake"],
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
  [entry, 'window.matchMedia("(prefers-reduced-motion: reduce)").matches', "P3-M6-01 reduced-motion bypass flag"],
  [entry, "await presentFocusForBlitz(reducedMotion);", "P3-M6-01 native presentation after authoritative start"],
  [native, "const BLITZ_MAIN_MORPH_MS: u64 = 220;", "P3-M6-01 calibrated native morph duration"],
  [native, "focus_frame_capture::capture(main.clone()).await", "P3-M6-01 frozen Main WebView capture"],
  [native, "focus_frame_hold::begin(&main, visible, &frame)", "P3-M6-01 finite Main raster hold"],
  [native, "animate_main_focus_rect(", "P3-M6-01 native geometry morph"],
  [native, "restore_main_after_blitz_morph(&main, main_snapshot)", "P3-M6-01 exact Main rollback"],
  [morph, "SetWindowPos(", "P3-M6-01 native outer-rect ownership"],
  [morph, "safe_restored_state", "P3-M6-01 maximized/fullscreen/minimized bypass"],
  [notes, "recognizedUrlParts", "P3-M6-02 automatic http(s) recognition"],
  [notes, "autoLinkEditorUrls", "P3-M6-02 live editor auto-linking"],
  [notes, 'data-note-url-activation="explicit"', "P3-M6-02 explicit browser activation retained"],
  [visualStatesCss, "linear-gradient(115deg, var(--color-accent-start), var(--color-accent-end)) border-box", "P3-M6-03 calibrated Focus live edge"],
  [visualStatesCss, "0 0 8px color-mix(in srgb, var(--color-accent-start) 12%, transparent)", "P3-M6-03 restrained live glow"],
]) {
  requireText(haystack, needle, label);
}

for (const forbidden of [
  "BLITZ_BOARD_FADE_MS",
  "fadeBoardBeforeFocusPresentation",
  'data-blitz-focus-transition="fading"',
]) {
  if (entry.includes(forbidden) || boardCss.includes(forbidden)) {
    throw new Error(`P3-M6-01 must not retain the legacy renderer fade: ${forbidden}`);
  }
}

const exitStart = native.indexOf("async fn focus_surface_exit_to_main");
const exitEnd = native.indexOf("#[tauri::command]", exitStart + 1);
const exitCommand = native.slice(exitStart, exitEnd);
for (const forbidden of ["timer_complete", "timer_skip", "timer_pause", "timer_resume", "timer_start", "timer_switch"]) {
  if (exitCommand.includes(forbidden)) {
    throw new Error(`A15 Focus Home must not mutate timer/session state via ${forbidden}`);
  }
}

const homeStart = panel.indexOf("const exitFocusHome");
const homeEnd = panel.indexOf("const submitAddTask", homeStart);
const home = panel.slice(homeStart, homeEnd);
const homePause = home.indexOf("await pauseTimerForFocusHome();");
const homeFrame = home.indexOf("await waitForPresentedFrame();", homePause);
const homeExit = home.indexOf('await invoke<void>("focus_surface_exit_to_main");', homeFrame);
if (homeStart < 0 || homeEnd < homeStart || homePause < 0 || homeFrame < homePause || homeExit < homeFrame) {
  throw new Error("P3-M6-06 must visibly commit PAUSED before Focus Home exits.");
}
if (home.includes("pauseTimer()") || home.includes("resumeTimer()")) {
  throw new Error("P3-M6-06 must never use generic Pause/Resume for Home provenance.");
}

const makeLiveStart = panel.indexOf("const makeTaskLive");
const makeLiveEnd = panel.indexOf("const exitFocusHome", makeLiveStart);
const makeLive = panel.slice(makeLiveStart, makeLiveEnd);
requireText(makeLive, "snapshotTimerSession()", "A11 stale-state guard");
requireText(makeLive, "switchTimerTask(task.id, mode)", "A11 switch path");
if (makeLive.includes("completeTimerTask") || makeLive.includes("skipTimerTask")) {
  throw new Error("A11 Rocket must switch the current work segment rather than complete/skip it.");
}

const reorderStart = panel.indexOf("const commitFocusTaskReorder");
const reorderEnd = panel.indexOf("const renderTaskRow", reorderStart);
const reorder = panel.slice(reorderStart, reorderEnd);
if (!reorder.includes("reorderListBoardTask({") || reorder.includes("moveListBoardTask")) {
  throw new Error("A12 Focus queue reorder must reuse the validated reorder boundary only.");
}

for (const forbidden of ['data-focus-row-action="move-up"', 'data-focus-row-action="move-down"']) {
  if (panel.includes(forbidden)) {
    throw new Error(`P3-M6-05 ordinary Focus rail must not expose board-style reorder controls: ${forbidden}`);
  }
}

const railOrder = [
  'data-focus-row-action="make-live"',
  'data-focus-row-action="subtasks"',
  'data-focus-row-action="notes"',
  'data-focus-row-action="more"',
];
let previousRailIndex = panel.indexOf('data-focus-row-action="complete"');
for (const marker of railOrder) {
  const index = panel.indexOf(marker);
  if (index <= previousRailIndex) throw new Error(`P3-M6-05 Focus rail order differs at ${marker}`);
  previousRailIndex = index;
}

const menuStart = panel.indexOf('className="focus-panel__row-menu"');
const menuEnd = panel.indexOf("</div>", menuStart);
const menu = panel.slice(menuStart, menuEnd);
for (const label of ["Schedule", "Change list", "Duplicate", "Delete"]) {
  requireText(menu, label, `P3-M6-05 overflow ${label}`);
}
if (!(menu.indexOf("Schedule") < menu.indexOf("Change list")
  && menu.indexOf("Change list") < menu.indexOf("Duplicate")
  && menu.indexOf("Duplicate") < menu.indexOf("Delete"))) {
  throw new Error("P3-M6-05 ordinary Focus overflow order differs from VE-003.");
}
if (menu.includes("Permanently delete") || menu.includes("Close Notes")) {
  throw new Error("P3-M6-05 overflow still contains pre-Pass-3 visible copy.");
}

if (focusPointerDrag.includes("reorderListBoardTask(") || focusPointerDrag.includes("moveListBoardTask(")) {
  throw new Error("P3-M6-05 pointer helper must stay visual/input-only; durable reorder authority remains in FocusPanel.");
}

if (panel.includes('data-focus-placeholder-control="preferences"')) {
  throw new Error("M6 Quick Preferences must not regress to the old non-mutating placeholder.");
}
if (quickPreferences.includes("invoke(")) {
  throw new Error("M6 Quick Preferences must reuse PreferenceSettingsRuntime rather than add a parallel native settings authority.");
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
const reducedMotion = entry.indexOf(
  'window.matchMedia("(prefers-reduced-motion: reduce)").matches',
  startBlitz,
);
const focusPresent = entry.indexOf("await presentFocusForBlitz(reducedMotion);", reducedMotion);
if (startBlitz < 0 || reducedMotion < startBlitz || focusPresent < reducedMotion) {
  throw new Error(
    "P3-M6-01 must keep domain start authoritative, resolve reduced-motion policy, then enter the native Focus presentation boundary.",
  );
}

console.log("M6 Focus parity reconciliation contract checks passed.");
