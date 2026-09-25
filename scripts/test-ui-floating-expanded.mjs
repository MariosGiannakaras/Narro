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
const resizeCoordinator = read("src/floatingTimerResizeTransition.ts");
const presentationFrame = read("src/presentationFrame.ts");
const actions = read("src/FocusLiveActions.tsx");
const subtasks = read("src/FocusLiveSubtasks.tsx");
const overlay = read("src/overlayPrimitives.tsx");
const css = read("src/floatingTimerFoundation.css");
const fixture = read("src/floatingTimerVisualFixture.tsx");
const capture = read("scripts/capture-floating-timer-fixtures.ps1");
const validator = read("scripts/validate-floating-timer-captures.mjs");
const pkg = JSON.parse(read("package.json"));

invariant(lib.includes("fn set_floating_timer_expanded("), "legacy native expanded-size command is missing");
for (const command of [
  "prepare_floating_timer_expanded",
  "reveal_floating_timer_expanded",
  "rollback_floating_timer_expanded",
  "set_floating_timer_expanded",
]) {
  invariant(lib.includes(command), `native resize command ${command} is missing`);
}
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
invariant(
  modeApi.includes('invoke<void>("prepare_floating_timer_expanded", { expanded })')
    && modeApi.includes('invoke<void>("reveal_floating_timer_expanded")')
    && modeApi.includes('invoke<void>("rollback_floating_timer_expanded")')
    && modeApi.includes('invoke<void>("set_floating_timer_expanded", { expanded })'),
  "renderer API must expose transactional resize boundaries while retaining the legacy command",
);

const restoreFnStart = lib.indexOf("fn restore_floating_timer_after_failed_resize(");
const prepareFnStart = lib.indexOf("fn prepare_floating_timer_expanded_impl(");
const revealFnStart = lib.indexOf("fn reveal_floating_timer_expanded_impl(");
const rollbackFnStart = lib.indexOf("fn rollback_floating_timer_expanded_impl(");
const commandFnStart = lib.indexOf("#[tauri::command(rename_all = \"camelCase\")]\nfn prepare_floating_timer_expanded(");
const restoreFn = lib.slice(restoreFnStart, prepareFnStart);
const prepareFn = lib.slice(prepareFnStart, revealFnStart);
const revealFn = lib.slice(revealFnStart, rollbackFnStart);
const rollbackFn = lib.slice(rollbackFnStart, commandFnStart);
const nativeHide = prepareFn.indexOf(".hide()");
const nativeResize = prepareFn.indexOf(".set_size(", nativeHide);
const nativePlacement = prepareFn.indexOf("keep_resized_timer_in_work_area", nativeResize);
const nativeSnapshotStore = prepareFn.indexOf("store_floating_timer_resize_snapshot", nativePlacement);
invariant(
  restoreFnStart >= 0
    && prepareFnStart > restoreFnStart
    && prepareFn.includes("begin_floating_timer_resize_transaction()")
    && nativeHide >= 0
    && nativeHide < nativeResize
    && nativeResize < nativePlacement
    && nativePlacement < nativeSnapshotStore
    && !prepareFn.includes('"reveal resized Timer"')
    && restoreFn.includes("tauri::Size::Physical(previous_size)")
    && restoreFn.includes('"restore Timer visibility"'),
  "native prepare must snapshot, hide, resize, fit and remain hidden with exact rollback state",
);
invariant(
  revealFn.includes("prepared_floating_timer_resize_snapshot()")
    && revealFn.indexOf(".show()") < revealFn.indexOf("clear_floating_timer_resize_transaction()"),
  "native reveal must show only a prepared resize and clear the transaction after success",
);
invariant(
  rollbackFn.includes("prepared_floating_timer_resize_snapshot()")
    && rollbackFn.includes("restore_floating_timer_after_failed_resize")
    && rollbackFn.indexOf("restore_floating_timer_after_failed_resize") < rollbackFn.indexOf("clear_floating_timer_resize_transaction()"),
  "native rollback must restore the exact previous size/position/visibility before clearing transaction state",
);
invariant(
  lib.includes('"FLOATING_TIMER_RESIZE_BUSY"')
    && lib.includes('"FLOATING_TIMER_RESIZE_NOT_PREPARED"')
    && lib.includes('"FLOATING_TIMER_RESIZE_RECOVERY_FAILED"'),
  "native resize transaction must reject overlap and surface explicit recovery failures",
);

const exitStart = foundation.indexOf('setResizePhase("exiting");');
const exitWait = foundation.indexOf('await waitForOpacityTransition(content, 0.45);', exitStart);
const coordinatorCall = foundation.indexOf("await coordinateFloatingTimerResize({", exitWait);
const prepareWire = foundation.indexOf("prepareResize: prepareFloatingTimerExpanded", coordinatorCall);
const publishWire = foundation.indexOf("publishExpanded: (candidateExpanded)", prepareWire);
const flushPublish = foundation.indexOf("flushSync(() => {", publishWire);
const paintWire = foundation.indexOf("waitForPresentedFrame,", flushPublish);
const revealWire = foundation.indexOf("revealResize: revealFloatingTimerExpanded", paintWire);
const rollbackWire = foundation.indexOf("rollbackResize: rollbackFloatingTimerExpanded", revealWire);
invariant(
  foundation.includes('data-floating-resize-pending={resizePending ? "true" : "false"}')
    && foundation.includes("data-floating-resize-phase={resizePhase}")
    && exitStart >= 0
    && exitStart < exitWait
    && exitWait < coordinatorCall
    && coordinatorCall < prepareWire
    && prepareWire < publishWire
    && publishWire < flushPublish
    && flushPublish < paintWire
    && paintWire < revealWire
    && revealWire < rollbackWire,
  "expanded resize must keep bounded outgoing content visible, then prepaint the target while native geometry is hidden before reveal",
);
invariant(
  resizeCoordinator.indexOf("await prepareResize(targetExpanded)") < resizeCoordinator.indexOf("publishExpanded(targetExpanded)")
    && resizeCoordinator.indexOf("publishExpanded(targetExpanded)") < resizeCoordinator.indexOf("await waitForPresentedFrame()")
    && resizeCoordinator.indexOf("await waitForPresentedFrame()") < resizeCoordinator.indexOf("await revealResize()"),
  "resize coordinator success order must be prepare -> publish -> frame -> reveal",
);
const resizeRecovery = resizeCoordinator.indexOf("publishExpanded(previousExpanded)");
invariant(
  resizeRecovery > resizeCoordinator.indexOf("catch (transitionFailure)")
    && resizeRecovery < resizeCoordinator.indexOf("await waitForPresentedFrame()", resizeRecovery)
    && resizeCoordinator.indexOf("await waitForPresentedFrame()", resizeRecovery) < resizeCoordinator.indexOf("await rollbackResize()", resizeRecovery)
    && resizeCoordinator.includes("FloatingTimerResizeRecoveryError"),
  "resize failure must republish the previous hierarchy while hidden before exact native rollback",
);
invariant(
  foundation.includes("waitForOpacityTransition(content, 0.45)")
    && css.includes('[data-floating-resize-phase="exiting"]')
    && css.includes("opacity: 0.45")
    && !css.includes('[data-floating-resize-phase="resizing"]')
    && !css.includes('[data-floating-resize-phase="entering"]')
    && css.includes("transition-duration: var(--motion-duration-inline)")
    && css.includes("transition-timing-function: var(--motion-ease-exit)"),
  "expanded resize must retain finite opacity/transform motion without a visible blank hierarchy",
);
invariant(
  pkg.scripts["test:floating-timer-resize-transition"] === "node --experimental-strip-types scripts/test-floating-timer-resize-transition.mjs"
    && pkg.scripts["preflight:frontend"].includes("npm run test:floating-timer-resize-transition"),
  "floating resize coordinator behavioral tests must run in frontend preflight",
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
  "setListBoardSubtaskCompletion",
  "reorderListBoardSubtasks",
  "deleteListBoardSubtask",
]) {
  invariant(subtasks.includes(mutation), `expanded subtasks are missing authoritative behavior ${mutation}`);
}
for (const field of ["expectedCompletedAt", "expectedOrder", "orderedIds", "expectedUpdatedAt"]) {
  invariant(subtasks.includes(field), `expanded subtask mutation is missing concurrency field ${field}`);
}
invariant(
  subtasks.includes("getListBoardTaskSubtasks(task.id, task.listId)")
    && subtasks.includes("getListBoardSnapshot(target)")
    && subtasks.includes("onTaskProjection?.(projectedTask)"),
  "saved subtask changes must refresh and reconcile both subtask and board projections",
);
for (const action of ["complete", "move-up", "move-down", "delete"]) {
  invariant(subtasks.includes(`data-floating-subtask-action="${action}"`), `expanded subtask action ${action} is missing`);
}
for (const tooltip of ["Complete subtask", "Move subtask up", "Move subtask down", "Delete subtask"]) {
  invariant(subtasks.includes(tooltip), `expanded subtask tooltip ${tooltip} is missing`);
}
invariant(
  subtasks.includes("{completed ? <s>{subtask.title}</s> : subtask.title}"),
  "completed expanded subtasks must retain a screenshot-backed strikethrough",
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
