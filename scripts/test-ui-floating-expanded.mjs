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
const coordinator = read("src/FocusSurfaceCoordinator.tsx");
const foundation = read("src/FloatingTimerFoundation.tsx");
const subtasks = read("src/FocusLiveSubtasks.tsx");
const actions = read("src/FocusLiveActions.tsx");
const css = read("src/floatingTimerFoundation.css");
const fixture = read("src/floatingTimerVisualFixture.tsx");
const capture = read("scripts/capture-floating-timer-fixtures.ps1");
const validator = read("scripts/validate-floating-timer-captures.mjs");
const pkg = JSON.parse(read("package.json"));

const nativeTimer = slice(lib, "fn apply_timer_native(", "fn apply_focus_surface_presentation_internal(");
invariant(
  nativeTimer.includes("safe_position_for_timer_region")
    && nativeTimer.includes("timer_region::apply(window, target.region())")
    && !nativeTimer.includes("COMPACT_TIMER_ORIGIN"),
  "expanded/compact transition must keep its safe origin without cached bottom-edge snapback",
);
invariant(
  !nativeTimer.includes(".hide()") && !nativeTimer.includes(".show()") && !nativeTimer.includes(".set_size("),
  "ordinary Timer expansion must not hide/show/resize the Focus WebView",
);
const expansionMove = nativeTimer.indexOf(
  'set_focus_position(window, desired, "move Timer before expanded region")?;',
);
const expansionRegion = nativeTimer.indexOf(
  "timer_region::apply_without_redraw(window, target.region())?;",
  expansionMove,
);
const collapseRegion = nativeTimer.indexOf(
  "timer_region::apply_without_redraw(window, target.region())?;",
  expansionRegion + "timer_region::apply_without_redraw(window, target.region())?;".length,
);
const collapseRestore = nativeTimer.indexOf(
  'set_focus_position(window, desired, "keep safe compact Timer position")?;',
  collapseRegion,
);
invariant(
  expansionMove >= 0
    && expansionRegion > expansionMove
    && collapseRegion > expansionRegion
    && collapseRestore > collapseRegion,
  "expansion near the taskbar must move compact geometry before revealing the larger region",
);
invariant(
  nativeTimer.includes("timer_region::apply_without_redraw(window, target.region())?;"),
  "Timer-to-Timer region swaps must avoid forcing a native redraw over prepainted WebView content",
);
invariant(
  collapseRegion >= 0 && collapseRestore > collapseRegion,
  "collapse must clip before any topology-required position correction",
);
invariant(
  region.includes("TIMER_EXPANDED_HEIGHT_LOGICAL: f64 = 300.0")
    && region.includes("TIMER_COMPACT_HEIGHT_LOGICAL: f64 = 110.0")
    && region.includes("SetWindowRgn")
    && region.includes("let redraw = if redraw { 1 } else { 0 };")
    && region.includes("pub fn apply_without_redraw("),
  "native Timer regions must remain DPI-aware 340x110/340x300",
);
invariant(placement.includes("safe_position_for_timer_region"), "region changes must fit the active monitor work area");
invariant(
  modeApi.includes('applyFocusSurfacePresentation(expanded ? "timerExpanded" : "timerCompact", compactFrame)'),
  "renderer expansion API must use the unified presentation command",
);
invariant(
  coordinator.includes("const requestTimerExpanded = useCallback")
    && coordinator.includes("commitPreparedFocusPresentation({")
    && coordinator.includes('target: FocusSurfacePresentation = expanded ? "timerExpanded" : "timerCompact"'),
  "coordinator must serialize compact/expanded commits through the same recovery helper",
);

const requestExpanded = slice(foundation, "const requestExpanded = async", "const applyTaskProjection =");
const expandBranch = slice(requestExpanded, "if (nextExpanded) {", "} else {");
const collapseBranch = slice(requestExpanded, "} else {", "return true;");
invariant(
  expandBranch.indexOf("setExpanded(true)") < expandBranch.indexOf("await waitForPresentedFrame()")
    && expandBranch.indexOf("await waitForPresentedFrame()") < expandBranch.indexOf("onRequestExpanded"),
  "expanded React content must prepaint before native region exposure",
);
invariant(
  expandBranch.indexOf("onRequestExpanded") < expandBranch.indexOf('setResizePhase("revealing-start")')
    && expandBranch.indexOf('setResizePhase("revealing-start")') < expandBranch.indexOf('setResizePhase("revealing")')
    && expandBranch.indexOf('setResizePhase("revealing")') < expandBranch.indexOf("waitForFloatingTimerGeometryMotion"),
  "expanded Timer must reveal finite painted geometry only after native region exposure",
);
invariant(
  collapseBranch.indexOf('setResizePhase("contracting-start")')
    < collapseBranch.indexOf('setResizePhase("contracting")')
    && collapseBranch.indexOf('setResizePhase("contracting")')
      < collapseBranch.indexOf("waitForFloatingTimerGeometryMotion")
    && collapseBranch.indexOf("waitForFloatingTimerGeometryMotion")
      < collapseBranch.indexOf('setResizePhase("clipping")')
    && collapseBranch.indexOf('setResizePhase("clipping")')
      < collapseBranch.indexOf("onRequestExpanded"),
  "collapse must finish finite same-WebView geometry contraction before native clipping",
);
const collapseClip = collapseBranch.indexOf('setResizePhase("clipping")');
const collapsePresented = collapseBranch.indexOf("await waitForPresentedFrame()", collapseClip);
const collapseNativeCommit = collapseBranch.indexOf("onRequestExpanded", collapseClip);
invariant(
  collapseClip >= 0
    && collapsePresented > collapseClip
    && collapseNativeCommit > collapsePresented,
  "collapse must present the fully contracted compact frame before native region clipping",
);
invariant(
  collapseBranch.indexOf("setExpanded(false)") < collapsePresented
    && collapsePresented < collapseNativeCommit,
  "collapse must present the actual compact layout before capturing/clipping its native frame",
);
invariant(
  requestExpanded.includes("resizeRequestInFlightRef.current")
    && requestExpanded.includes("onResizePendingChange?.(true)")
    && requestExpanded.includes("onResizePendingChange?.(false)")
    && requestExpanded.includes("if (!nativeRegionCommitted)"),
  "resize requests must serialize, expose busy state and roll back uncommitted renderer state",
);
invariant(
  foundation.includes("resizePending || (!expanded && !compactActionsVisible)")
    && foundation.includes("contentInert={resizePending || (expanded && !regionExpanded)}")
    && subtasks.includes("inert={contentInert}"),
  "prepainted/in-motion controls outside committed Timer geometry must be keyboard/accessibility inert",
);
invariant(
  foundation.includes("const FLOATING_TIMER_GEOMETRY_MOTION_MS = 270")
    && foundation.includes("prefers-reduced-motion: reduce")
    && css.includes("--floating-timer-geometry-motion-duration: 270ms")
    && css.includes('data-floating-resize-phase="revealing"')
    && css.includes('data-floating-resize-phase="contracting"')
    && css.includes("clip-path: inset(0 0 190px 0 round 16px)")
    && css.includes("--floating-timer-geometry-motion-duration: 1ms"),
  "compact/expanded Timer must keep finite reduced-motion-safe same-WebView geometry motion",
);
invariant(
  css.includes("height: 110px")
    && css.includes('data-floating-expanded="true"')
    && css.includes("height: 300px"),
  "React compact/expanded content must match native visible geometry",
);
for (const forbidden of ["beginFocusVisualHold", "prewarmFocusSurface", "setPosition", "setInterval("]) {
  invariant(!foundation.includes(forbidden), `Timer renderer must not use ${forbidden}`);
}

invariant(
  foundation.includes('key="timer-heading"')
    && !foundation.includes("{!regionExpanded || !liveTask || !timer ? (")
    && foundation.indexOf('key="timer-heading"') < foundation.indexOf('data-floating-actions-controller="true"')
    && css.includes("grid-template-rows: auto auto minmax(0, 1fr);"),
  "expanded Timer must keep current task/title above actions and subtasks",
);
invariant(
  foundation.includes("<FocusLiveActions") && foundation.includes("<FocusLiveSubtasks")
    && foundation.includes("onTaskProjection={applyTaskProjection}"),
  "expanded Timer must retain authoritative actions and task projection",
);
for (const action of ["break", "notes", "pause-resume", "skip", "done", "return-to-panel"]) {
  invariant(actions.includes(`action="${action}"`), `expanded action ${action} is missing`);
}
for (const mutation of ["startManualBreakTimer", "pauseTimer", "resumeTimer", "skipBreakTimer", "switchTimerTask", "skipTimerTask", "completeTimerTask", "startTimerTask"]) {
  invariant(actions.includes(mutation), `expanded actions must retain ${mutation}`);
}
invariant(
  fixture.includes('fixtureState === "expanded"') && fixture.includes("fixtureExpanded={expanded}")
    && fixture.includes('title: "Prepare BFCM strategy"')
    && fixture.includes('state: "running"'),
  "visual fixture must cover the production expanded surface",
);
invariant(
  capture.includes('"floating-timer-expanded-$theme"')
    && validator.includes("expanded timer must be exactly 340x300"),
  "Windows visual regression must preserve 340x300 expanded captures",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-floating-expanded"),
  "frontend preflight must retain expanded Timer coverage",
);

console.log("Floating Timer single-host expanded behavior contracts passed.");
