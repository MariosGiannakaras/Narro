import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const invariant = (condition, message) => {
  if (!condition) throw new Error(`Focus presentation transition contract failed: ${message}`);
};
const slice = (source, begin, end) => {
  const start = source.indexOf(begin);
  invariant(start >= 0, `${begin} is missing`);
  const stop = source.indexOf(end, start + begin.length);
  return source.slice(start, stop < 0 ? undefined : stop);
};

const lib = read("src-tauri/src/lib.rs");
const focusWebview = read("src-tauri/src/focus_webview.rs");
const cargoToml = read("src-tauri/Cargo.toml");
const coordinator = read("src/FocusSurfaceCoordinator.tsx");
const coordinatorCss = read("src/focusSurfaceCoordinator.css");
const focusEntry = read("src/focus.tsx");
const focusDocumentCss = read("src/focusDocument.css");
const transition = read("src/focusPresentationTransition.ts");
const events = read("src/focusWindowEvents.ts");
const modeApi = read("src/focusSurfaceModeApi.ts");
const region = read("src-tauri/src/timer_region.rs");
const placement = read("src-tauri/src/floating_placement.rs");
const topology = read("src-tauri/src/windows/topology.rs");
const pkg = JSON.parse(read("package.json"));

const setFocusPosition = slice(
  lib,
  "fn set_focus_position(",
  "fn set_focus_presentation_attributes(",
);
const animatedNativeCommit = slice(
  lib,
  "fn animate_focus_surface_presentation_internal(",
  "fn apply_focus_surface_presentation_internal(",
);
const nativeCommit = slice(
  lib,
  "fn apply_focus_surface_presentation_internal(",
  "#[tauri::command(rename_all = \"camelCase\")]\nfn focus_surface_apply_presentation",
);
// Scope ordering checks to the corrective helper itself; global lib.rs ordering
// is unrelated because other presentation paths also apply native regions.
// This keeps the contract strict without treating unrelated earlier calls as ordering failures.
const crossDpiPanelHelper = slice(
  lib,
  "fn apply_panel_native_after_animated_cross_dpi_move(",
  "fn apply_timer_native(",
);

invariant(
  nativeCommit.includes("let _presentation_guard = presentation_guard()?"),
  "native presentation commits must be serialized",
);
invariant(
  setFocusPosition.includes("focus_webview::set_physical_position(window, point.x, point.y)")
    && focusWebview.includes(".with_webview(")
    && focusWebview.includes("NotifyParentWindowPositionChanged()")
    && focusWebview.includes(".set_position(")
    && placement.includes("crate::focus_webview::set_physical_position(")
    && !setFocusPosition.includes(".set_position(")
    && !placement.includes(".set_position(")
    && cargoToml.includes('tauri = { version = "~2.11.5", features = ["tray-icon"] }'),
  "all programmatic Focus/Timer parent moves must notify WebView2 and native-handle access must pin the Tauri minor",
);
invariant(
  nativeCommit.includes("capture_focus_native_snapshot")
    && nativeCommit.includes("restore_focus_native_snapshot")
    && nativeCommit.includes("FOCUS_PRESENTATION_RECOVERY_FAILED"),
  "native presentation commits must be rollback-safe",
);
for (const forbidden of [".hide()", ".show()", ".destroy()", ".close()"]) {
  invariant(!nativeCommit.includes(forbidden), `ordinary presentation switching must not use ${forbidden}`);
  invariant(!animatedNativeCommit.includes(forbidden), `animated presentation switching must not use ${forbidden}`);
}
invariant(
  nativeCommit.includes("apply_focus_native_target")
    && lib.includes("fn apply_focus_native_target(")
    && lib.includes("apply_panel_native")
    && lib.includes("apply_timer_native"),
  "single native target transaction must own Panel and Timer presentation geometry",
);
invariant(
  lib.includes("static FOCUS_SURFACE_PRESENTATION_STATE: AtomicU8")
    && !lib.includes("FOCUS_SURFACE_MODE_STATE")
    && !lib.includes("static FLOATING_TIMER_EXPANDED"),
  "native presentation authority must be one atomic state, not split mode/expanded flags",
);

invariant(
  transition.indexOf("await waitForTargetReady()") < transition.indexOf("if (animateNativePresentation && runConcurrentMotion)")
    && transition.includes("await Promise.allSettled([")
    && transition.includes("animateNativePresentation(targetPresentation)")
    && transition.includes("runConcurrentMotion()")
    && transition.indexOf("await waitForTargetReady()") < transition.indexOf("commitRendererPresentation(targetPresentation)"),
  "prepared target must be ready before coordinated native/renderer motion and renderer ownership transfer",
);
invariant(
  transition.includes("await applyNativePresentation(previousPresentation)")
    && transition.includes("FocusPresentationRecoveryError"),
  "renderer commit failure after native success must restore the previous native presentation",
);
invariant(
  coordinator.includes("commitPreparedFocusPresentation({")
    && coordinator.includes("waitForTargetReady: () => waitForReady(targetMode)")
    && coordinator.includes("applyNativePresentation: applyFocusSurfacePresentation"),
  "production coordinator must use the tested transition helper",
);
invariant(
  coordinator.includes("useRef<Record<FocusSurfaceMode, Set<() => void>>>")
    && coordinator.includes("readinessWaitersRef.current[mode]"),
  "Panel and Timer readiness waiters must be isolated by presentation mode",
);
invariant(
  coordinator.includes("inert={!panelActive || completionSuccess !== null}")
    && coordinator.includes("inert={!timerActive || completionSuccess !== null}")
    && coordinatorCss.includes('data-focus-visibility="preparing"')
    && coordinatorCss.includes("pointer-events: none"),
  "prepainted inactive content and modal backgrounds must be interaction/accessibility-inert",
);
invariant(
  coordinator.includes("animateNativePresentation: (next) =>")
    && coordinator.includes("animateFocusSurfacePresentation(next, motionDurationMs)")
    && coordinator.includes("runConcurrentMotion: () =>")
    && coordinator.includes("runGeometryMotion(previousPresentation, targetPresentation, motionDurationMs)")
    && transition.includes("animateNativePresentation?: (presentation: TPresentation) => Promise<void>")
    && transition.includes("runConcurrentMotion?: () => Promise<void>")
    && coordinator.includes("const FOCUS_GEOMETRY_MOTION_MS = 250")
    && coordinatorCss.includes("--focus-geometry-motion-duration: 250ms")
    && coordinatorCss.includes("--focus-geometry-motion-ease: cubic-bezier(0.55, 0.55, 0, 1)")
    && coordinatorCss.includes('data-focus-geometry-motion-to="panel"'),
  "Panel/Timer transition must run finite native position and same-WebView geometry motion concurrently",
);
invariant(
  coordinatorCss.includes('data-focus-visibility="preparing"')
    && coordinatorCss.includes("opacity: 1")
    && coordinatorCss.includes("z-index: 1"),
  "incoming presentation must be fully painted underneath the committed presentation",
);

invariant(
  focusEntry.includes('import "./focusDocument.css";')
    && focusDocumentCss.includes(":root")
    && focusDocumentCss.includes("body")
    && focusDocumentCss.includes("#root")
    && focusDocumentCss.includes("width: 100%")
    && focusDocumentCss.includes("height: 100%")
    && focusDocumentCss.includes("min-width: 0")
    && focusDocumentCss.includes("min-height: 0")
    && focusDocumentCss.includes("overflow: hidden")
    && focusDocumentCss.includes("background: transparent")
    && !focusDocumentCss.includes("var(--color-canvas)"),
  "focus.html must keep an exact transparent non-scrolling document viewport so native region clipping cannot expose host pixels or browser scrollbars",
);

invariant(
  animatedNativeCommit.includes("planned_focus_presentation_position")
    && animatedNativeCommit.includes("animate_focus_position")
    && lib.includes("FLUENT_POINT_TO_POINT_X1: f64 = 0.55")
    && lib.includes("FLUENT_POINT_TO_POINT_Y1: f64 = 0.55")
    && lib.includes("FLUENT_POINT_TO_POINT_X2: f64 = 0.0")
    && lib.includes("FLUENT_POINT_TO_POINT_Y2: f64 = 1.0")
    && lib.includes("fluent_point_to_point_easing")
    && animatedNativeCommit.includes("timer_region::apply(&window, target.region())")
    && animatedNativeCommit.indexOf("timer_region::apply(&window, target.region())")
      < animatedNativeCommit.indexOf("animate_focus_position")
    && animatedNativeCommit.includes("apply_panel_native_after_animated_cross_dpi_move")
    && animatedNativeCommit.includes("windows::suspend_focus_display_recovery()")
    && animatedNativeCommit.includes("restore_focus_native_snapshot"),
  "animated native transition must use finite eased point-to-point motion, clip Panel-to-Timer before movement, defer cross-DPI Panel reveal and retain rollback",
);
invariant(
  crossDpiPanelHelper.includes("timer_region::apply(window, previous.region())?")
    && crossDpiPanelHelper.includes("FOCUS_CROSS_DPI_VIEWPORT_SETTLE_MS")
    && crossDpiPanelHelper.indexOf("timer_region::apply(window, previous.region())?")
      < crossDpiPanelHelper.indexOf("std::thread::sleep(Duration::from_millis(FOCUS_CROSS_DPI_VIEWPORT_SETTLE_MS))")
    && crossDpiPanelHelper.indexOf("std::thread::sleep(Duration::from_millis(FOCUS_CROSS_DPI_VIEWPORT_SETTLE_MS))")
      < crossDpiPanelHelper.indexOf("timer_region::apply_full_host(window)?"),
  "cross-DPI Timer-to-Panel must keep the previous clipped region through target-size viewport settlement before full Panel reveal",
);
invariant(
  placement.includes("pub(crate) fn planned_timer_position(")
    && topology.includes("WM_ENTERSIZEMOVE")
    && topology.includes("WM_EXITSIZEMOVE")
    && topology.includes("display_recovery_suspended()")
    && topology.includes("should_refresh_timer_region_for_interactive_dpi")
    && topology.includes("schedule_focus_region_refresh_for_dpi")
    && topology.includes("PENDING_DPI_X")
    && region.includes("pub fn apply_with_scale(")
    && lib.includes("refresh_open_timer_region_for_dpi_change("),
  "saved Timer placement must defer full recovery during drag while interactive WM_DPICHANGED refreshes only the native visible region",
);

invariant(
  modeApi.includes('invoke<void>("focus_surface_apply_presentation", { presentation, compactFrame })')
    && modeApi.includes('invoke<void>("focus_surface_animate_presentation", { presentation, durationMs })')
    && !modeApi.includes("prepare_floating_timer")
    && !modeApi.includes("reveal_floating_timer"),
  "renderer bridge must expose ordinary and finite animated single-host presentation commands only",
);
invariant(
  events.includes('FOCUS_PRESENTATION_CHANGED_EVENT = "focus-surface-presentation-changed"')
    && !events.includes("floating-timer-presentation-ready")
    && !events.includes("focus-surface-mode-requested"),
  "cross-WebView readiness/request events must stay retired",
);
invariant(
  region.includes("FOCUS_HOST_WIDTH_LOGICAL: f64 = 340.0")
    && region.includes("FOCUS_HOST_HEIGHT_LOGICAL: f64 = 700.0")
    && region.includes("TIMER_COMPACT_HEIGHT_LOGICAL: f64 = 110.0")
    && region.includes("TIMER_EXPANDED_HEIGHT_LOGICAL: f64 = 300.0"),
  "native visible-region contract must retain validated 340x700/110/300 geometry",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:focus-mode-transition")
    && pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-surface-transition"),
  "transition unit and integration contracts must stay in frontend preflight",
);

console.log("Single-host Focus presentation transition contracts passed.");
