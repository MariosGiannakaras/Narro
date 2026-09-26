import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Floating Timer expanded contract failed: ${message}`);
}

const lib = read("src-tauri/src/lib.rs");
const modeApi = read("src/focusSurfaceModeApi.ts");
const foundation = read("src/FloatingTimerFoundation.tsx");
const presentationFrame = read("src/presentationFrame.ts");
const actions = read("src/FocusLiveActions.tsx");
const subtasks = read("src/FocusLiveSubtasks.tsx");
const overlay = read("src/overlayPrimitives.tsx");
const css = read("src/floatingTimerFoundation.css");
const fixture = read("src/floatingTimerVisualFixture.tsx");
const capture = read("scripts/capture-floating-timer-fixtures.ps1");
const validator = read("scripts/validate-floating-timer-captures.mjs");
const pkg = JSON.parse(read("package.json"));

invariant(lib.includes("fn set_floating_timer_expanded("), "native expanded-size command is missing");
invariant(
  lib.includes("current_focus_surface_mode() != Some(FocusSurfaceMode::Timer)")
    && lib.includes('"FOCUS_SURFACE_MODE_CONFLICT"'),
  "native resize must reject calls outside Timer mode with a typed error",
);
invariant(
  lib.includes("let height = if expanded { 300.0 } else { 110.0 }")
    && lib.includes("width: 340.0"),
  "native expanded/collapsed geometry must remain 340x300 and 340x110",
);
invariant(lib.includes("set_floating_timer_expanded,"), "native command is not registered");
invariant(
  modeApi.includes('invoke<void>("set_floating_timer_expanded", { expanded })'),
  "renderer resize API must use the typed native command",
);

const restoreFnStart = lib.indexOf("fn restore_floating_timer_after_failed_resize(");
const resizeFnStart = lib.indexOf("fn set_floating_timer_expanded(");
const resizeFnEnd = lib.indexOf("pub(crate) fn revalidate_open_focus_panel_after_display_change(", resizeFnStart);
const restoreFn = lib.slice(restoreFnStart, resizeFnStart);
const resizeFn = lib.slice(resizeFnStart, resizeFnEnd);
const nativeVisibilityRead = resizeFn.indexOf("let was_visible = window");
const nativeSizeRead = resizeFn.indexOf(".inner_size()", nativeVisibilityRead);
const nativeHide = resizeFn.indexOf(".hide()", nativeSizeRead);
const nativeResize = resizeFn.indexOf(".set_size(", nativeHide);
const nativeResizeRecovery = resizeFn.indexOf("restore_floating_timer_after_failed_resize(", nativeResize);
const nativeSuccessShow = resizeFn.indexOf('"show Timer after resize"', nativeResizeRecovery);
const nativeShowRecovery = resizeFn.indexOf("restore_floating_timer_after_failed_resize(", nativeSuccessShow);
invariant(
  restoreFnStart >= 0
    && restoreFnStart < resizeFnStart
    && nativeVisibilityRead >= 0
    && nativeVisibilityRead < nativeSizeRead
    && nativeSizeRead < nativeHide
    && nativeHide < nativeResize
    && nativeResize < nativeResizeRecovery
    && nativeResizeRecovery < nativeSuccessShow
    && nativeSuccessShow < nativeShowRecovery
    && resizeFn.includes("if was_visible")
    && resizeFn.includes('"hide Timer for resize"')
    && resizeFn.includes('"FLOATING_TIMER_RESIZE_RECOVERY_FAILED"')
    && restoreFn.includes("tauri::Size::Physical(previous_size)")
    && restoreFn.includes('"restore Timer visibility"'),
  "native Floating Timer resize must snapshot geometry, hide before resizing, show only after success, and restore both size and visibility after resize or show failure",
);

const prewarmCall = foundation.indexOf("await prewarmFocusSurface();");
const resizingPhase = foundation.indexOf('setResizePhase("resizing");', prewarmCall);
const resizeCall = foundation.indexOf("await setFloatingTimerExpanded(nextExpanded);", resizingPhase);
const nativeCommit = foundation.indexOf("nativeResizeCommitted = true;", resizeCall);
const publishTarget = foundation.indexOf("flushSync(() => {", nativeCommit);
const publishExpanded = foundation.indexOf("setExpanded(nextExpanded);", publishTarget);
const prewarmingPhase = foundation.indexOf('setResizePhase("prewarming");', publishExpanded);
const targetPaint = foundation.indexOf("await waitForPresentedFrame();", prewarmingPhase);
const revealCall = foundation.indexOf("await clearFocusSurfacePrewarm();", targetPaint);
const idlePhase = foundation.indexOf('setResizePhase("idle");', revealCall);
const revealedPaint = foundation.indexOf("await waitForPresentedFrame();", idlePhase);
invariant(
  foundation.includes('data-floating-resize-pending={resizePending ? "true" : "false"}')
    && foundation.includes("data-floating-resize-phase={resizePhase}")
    && prewarmCall >= 0
    && prewarmCall < resizingPhase
    && resizingPhase < resizeCall
    && resizeCall < nativeCommit
    && nativeCommit < publishTarget
    && publishTarget < publishExpanded
    && publishExpanded < prewarmingPhase
    && prewarmingPhase < targetPaint
    && targetPaint < revealCall
    && revealCall < idlePhase
    && idlePhase < revealedPaint,
  "resize must cloak the visible host before native geometry, publish the target only after native resize, prepaint it while cloaked, and reveal only after the target frame barrier",
);
invariant(
  /\[data-floating-resize-phase="resizing"\] \.floating-timer-foundation__content \{\s*visibility: hidden;/.test(css)
    && /\[data-floating-resize-phase="prewarming"\] \.floating-timer-foundation__content \{\s*visibility: visible;\s*opacity: 1;\s*transform: none;\s*transition-duration: 0ms;/.test(css),
  "resized Timer content must become fully paintable while the native host remains transparent",
);
invariant(
  foundation.includes("if (!nativeResizeCommitted)")
    && foundation.includes("setExpanded(expanded)")
    && foundation.includes('setResizePhase("prewarming")')
    && foundation.includes("if (prewarmActive)")
    && foundation.includes("resize prewarm cleanup failed")
    && foundation.includes("return nativeResizeCommitted;"),
  "failed native resize must restore the old hierarchy before uncloaking, while post-commit failure keeps the committed hierarchy and cleans native transparency",
);
invariant(
  foundation.includes("await prewarmFocusSurface()")
    && foundation.includes("await clearFocusSurfacePrewarm()")
    && !foundation.includes("waitForOpacityTransition(")
    && !foundation.includes('setResizePhase("exiting")')
    && !foundation.includes('setResizePhase("entering")'),
  "resize must use one native-transparent atomic swap instead of exposing blank content fade phases",
);

invariant(
  foundation.includes('presentation="floating"')
    && foundation.includes("<FocusLiveActions")
    && foundation.includes("<FocusLiveSubtasks"),
  "expanded state must reuse authoritative live action and subtask controllers",
);
invariant(
  foundation.includes("onTaskProjection={applyTaskProjection}"),
  "subtask mutations must reconcile the authoritative task progress projection",
);
for (const forbidden of ["setPosition", "@tauri-apps/api/window", "setInterval("]) {
  invariant(!foundation.includes(forbidden), `expanded renderer must not own native position/clock through ${forbidden}`);
}
invariant(
  foundation.includes('import { waitForPresentedFrame } from "./presentationFrame";')
    && (presentationFrame.match(/requestAnimationFrame\(/g) ?? []).length === 2
    && !presentationFrame.includes("setInterval(")
    && !presentationFrame.includes("setTimeout("),
  "expanded transition must use the shared two-frame compositor barrier without an animation loop",
);

for (const action of ["break", "notes", "pause-resume", "skip", "done", "return-to-panel"]) {
  invariant(actions.includes(`action="${action}"`), `expanded action ${action} is missing`);
}
for (const mutation of [
  "startManualBreakTimer",
  "pauseTimer",
  "resumeTimer",
  "skipBreakTimer",
  "switchTimerTask",
  "skipTimerTask",
  "completeTimerTask",
  "startTimerTask",
]) {
  invariant(actions.includes(mutation), `expanded action strip is missing authoritative timer behavior ${mutation}`);
}
invariant(
  actions.includes('label={state.pauseResumeLabel}')
    && actions.includes('icon={state.pauseResumeLabel === "Resume" ? "resume" : "pause"}'),
  "pause/resume action must derive label and icon from authoritative timer state",
);
invariant(actions.includes("<TaskNotes"), "expanded Notes action must reuse the saved TaskNotes workflow");
invariant(actions.includes('<Tooltip content={label} placement="bottom"'), "all expanded action icons need shared tooltips");

for (const mutation of [
  "createListBoardSubtask",
  "updateListBoardSubtaskTitle",
  "setListBoardSubtaskCompletion",
  "reorderListBoardSubtasks",
  "deleteListBoardSubtask",
]) {
  invariant(subtasks.includes(mutation), `expanded subtasks are missing authoritative behavior ${mutation}`);
}
for (const field of ["expectedTitle", "expectedCompletedAt", "expectedOrder", "orderedIds", "expectedUpdatedAt"]) {
  invariant(subtasks.includes(field), `expanded subtask mutation is missing concurrency field ${field}`);
}
invariant(
  subtasks.includes("getListBoardTaskSubtasks(task.id, task.listId)")
    && subtasks.includes("getListBoardSnapshot(target)")
    && subtasks.includes("onTaskProjection?.(projectedTask)"),
  "saved subtask changes must refresh and reconcile both subtask and board projections",
);
for (const action of ["complete", "edit", "title-input", "cancel-edit", "save-edit", "move-up", "move-down", "delete"]) {
  invariant(subtasks.includes(`data-floating-subtask-action="${action}"`), `expanded subtask action ${action} is missing`);
}
for (const tooltip of ["Complete subtask", "Cancel subtask edit", "Save subtask title", "Move subtask up", "Move subtask down", "Delete subtask"]) {
  invariant(subtasks.includes(tooltip), `expanded subtask tooltip ${tooltip} is missing`);
}
invariant(
  subtasks.includes("{completed ? <s>{subtask.title}</s> : subtask.title}"),
  "completed expanded subtasks must retain a screenshot-backed strikethrough",
);
invariant(
  subtasks.includes("expectedTitle: editor.expectedTitle")
    && subtasks.includes('event.key === "Escape"')
    && subtasks.includes('event.key === "Enter"')
    && subtasks.includes("setEditor(null)"),
  "Floating Timer subtask title editing must be stale-safe and support explicit keyboard save/cancel",
);
invariant(
  css.includes(".floating-timer-foundation__subtask-title-input")
    && css.includes("width: 104px")
    && css.includes("grid-template-columns: repeat(3, 32px)"),
  "Floating Timer subtask editing must preserve the reserved action rail and compact title geometry",
);
invariant(
  overlay.includes('type TooltipAlign = "start" | "center" | "end"')
    && overlay.includes('type TooltipPlacement = "top" | "bottom"'),
  "shared tooltip primitive must support compact-surface edge alignment and lower placement",
);

invariant(css.includes("grid-template-columns: repeat(6, 32px)"), "action strip must reserve six stable 32px slots");
invariant(
  css.includes("grid-template-columns: 32px minmax(0, 1fr) 104px")
    && css.includes("grid-template-columns: repeat(3, 32px)"),
  "subtask rows must reserve stable completion/title/action geometry",
);
invariant(css.includes("width: 32px") && css.includes("height: 32px"), "interactive targets must remain at least 32x32");

invariant(fixture.includes('fixtureState === "expanded"'), "expanded visual fixture state is missing");
invariant(fixture.includes("fixtureExpanded={expanded}"), "expanded fixture is not wired to the production surface");
invariant(
  fixture.includes("fixtureSubtasks={expanded ? subtaskSnapshot : null}"),
  "expanded fixture must render representative subtasks without changing the collapsed progress fixture",
);
invariant(capture.includes('"floating-timer-expanded-$theme"'), "expanded light/dark captures are missing");
invariant(validator.includes("expanded timer must be exactly 340x300"), "expanded geometry validation is missing");
invariant(validator.includes('data-floating-subtask-action="delete"'), "expanded DOM behavior validation is missing");

invariant(
  pkg.scripts["test:ui-floating-expanded"] === "node scripts/test-ui-floating-expanded.mjs",
  "package expanded contract registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-floating-expanded"),
  "frontend preflight must run the expanded Floating Timer contract",
);

console.log("Floating Timer expanded action/subtask contracts passed.");
