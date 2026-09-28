import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const invariant = (condition, message) => {
  if (!condition) throw new Error(`Floating Timer expanded contract failed: ${message}`);
};
const slice = (source, begin, end) => {
  const start = source.indexOf(begin);
  invariant(start >= 0, `${begin} is missing`);
  const stop = source.indexOf(end, start + begin.length);
  return source.slice(start, stop < 0 ? undefined : stop);
};

const lib = read("src-tauri/src/lib.rs");
const region = read("src-tauri/src/timer_region.rs");
const placement = read("src-tauri/src/floating_placement.rs");
const modeApi = read("src/focusSurfaceModeApi.ts");
const foundation = read("src/FloatingTimerFoundation.tsx");
const subtasks = read("src/FocusLiveSubtasks.tsx");
const actions = read("src/FocusLiveActions.tsx");
const css = read("src/floatingTimerFoundation.css");
const fixture = read("src/floatingTimerVisualFixture.tsx");
const capture = read("scripts/capture-floating-timer-fixtures.ps1");
const validator = read("scripts/validate-floating-timer-captures.mjs");
const pkg = JSON.parse(read("package.json"));

const nativeResize = slice(lib, "fn set_floating_timer_expanded(", "pub(crate) fn revalidate_open_focus_panel_after_display_change(");
invariant(nativeResize.includes("FOCUS_SURFACE_MODE_CONFLICT") && nativeResize.includes("FLOATING_TIMER_LABEL"),
  "only the active separate Timer window may expand");
invariant(nativeResize.includes("timer_region::apply(&window, true)")
  && nativeResize.includes("timer_region::apply(&window, false)"),
  "expand/collapse must change native clipping, not WebView dimensions");
invariant(!nativeResize.includes(".hide()") && !nativeResize.includes(".show()") && !nativeResize.includes(".set_size("),
  "ordinary Timer expansion must never hide, show, or resize the WebView");
invariant(nativeResize.indexOf("move_to(desired)") < nativeResize.indexOf("timer_region::apply(&window, true)")
  && nativeResize.indexOf("timer_region::apply(&window, false)") < nativeResize.indexOf("move_to(desired)", nativeResize.indexOf("timer_region::apply(&window, false)")),
  "bottom-edge expansion must move the compact region before exposing controls and collapse must clip before restoring position");
invariant(nativeResize.includes("TIMER_REGION_RECOVERY_FAILED")
  && nativeResize.indexOf("FLOATING_TIMER_EXPANDED.store(expanded") > nativeResize.indexOf("if let Err(error) = result"),
  "failed region/placement changes must roll back before the committed expansion state changes");
invariant(region.includes("SetWindowRgn") && region.includes("CreateRectRgn")
  && region.includes("clipped_height") && region.includes("110.0 * scale"),
  "native Timer clip must have a DPI-aware 110px compact height");
invariant(placement.includes("safe_position_for_timer_region"), "region changes must fit the chosen monitor work area");
invariant(modeApi.includes('invoke<void>("set_floating_timer_expanded", { expanded })'),
  "renderer must use the native region command");

const requestExpanded = slice(foundation, "const requestExpanded = async", "const applyTaskProjection =");
const expandBranch = slice(requestExpanded, "if (nextExpanded) {", "} else {");
const collapseBranch = slice(requestExpanded, "} else {", "return true;");
invariant(expandBranch.indexOf("setExpanded(true)") < expandBranch.indexOf("await waitForPresentedFrame()")
  && expandBranch.indexOf("await waitForPresentedFrame()") < expandBranch.indexOf("await setFloatingTimerExpanded(true)"),
  "expanded React content must be painted behind the compact clip before it is exposed");
invariant(collapseBranch.indexOf("await setFloatingTimerExpanded(false)") < collapseBranch.indexOf("setExpanded(false)"),
  "collapse must clip expanded content before compact React layout returns");
invariant(requestExpanded.includes("resizeRequestInFlightRef.current")
  && requestExpanded.includes("onResizePendingChange?.(true)")
  && requestExpanded.includes("onResizePendingChange?.(false)")
  && requestExpanded.includes("if (!nativeRegionCommitted)")
  && requestExpanded.includes("setExpanded(expanded)"),
  "region transition must serialize requests, report busy state and roll back uncommitted React content");
invariant(foundation.includes("inert={expanded && !regionExpanded}")
  && foundation.includes("contentInert={expanded && !regionExpanded}")
  && subtasks.includes("inert={contentInert}"),
  "prepainted controls hidden by the compact clip must not be keyboard-accessible");
invariant(css.includes("height: 110px") && css.includes('data-floating-expanded="true"') && css.includes("height: 300px"),
  "React compact and expanded content must occupy only their visible native regions");
for (const forbidden of ["beginFocusVisualHold", "prewarmFocusSurface", "clearFocusSurfacePrewarm", "setPosition", "setInterval("]) {
  invariant(!foundation.includes(forbidden), `Timer renderer must not use ${forbidden}`);
}

invariant(foundation.includes('<FocusLiveActions') && foundation.includes('<FocusLiveSubtasks')
  && foundation.includes("onTaskProjection={applyTaskProjection}"),
  "expanded Timer must retain authoritative actions and subtask projection");
for (const action of ["break", "notes", "pause-resume", "skip", "done", "return-to-panel"]) {
  invariant(actions.includes(`action="${action}"`), `expanded action ${action} is missing`);
}
for (const mutation of ["startManualBreakTimer", "pauseTimer", "resumeTimer", "skipBreakTimer", "switchTimerTask", "skipTimerTask", "completeTimerTask", "startTimerTask"]) {
  invariant(actions.includes(mutation), `expanded actions must retain ${mutation}`);
}
for (const mutation of ["createListBoardSubtask", "updateListBoardSubtaskTitle", "setListBoardSubtaskCompletion", "reorderListBoardSubtasks", "deleteListBoardSubtask"]) {
  invariant(subtasks.includes(mutation), `expanded subtasks must retain ${mutation}`);
}
invariant(actions.includes("<TaskNotes") && actions.includes("<Tooltip"), "Notes and action tooltips must remain usable");
invariant(css.includes("grid-template-columns: repeat(6, 32px)") && css.includes("grid-template-columns: 32px minmax(0, 1fr) 104px"),
  "action and subtask slots must retain stable expanded geometry");
invariant(fixture.includes('fixtureState === "expanded"') && fixture.includes("fixtureExpanded={expanded}"),
  "visual fixture must cover the production expanded surface");
invariant(capture.includes('"floating-timer-expanded-$theme"') && validator.includes("expanded timer must be exactly 340x300"),
  "Windows visual regression must preserve 340x300 expanded captures");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:ui-floating-expanded"),
  "frontend preflight must retain the expanded Timer contract");

console.log("Floating Timer fixed-host region and expanded behavior contracts passed.");
