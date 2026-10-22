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
const frameHold = read("src-tauri/src/focus_frame_hold.rs");
const layeredHold = read("src-tauri/src/focus_layered_raster.rs");
const raster = read("src-tauri/src/focus_mode_raster.rs");
const prepareRaster = slice(lib, "async fn focus_surface_prepare_mode_raster(", "async fn focus_surface_animate_presentation(");
const finishRaster = slice(lib, "async fn focus_surface_finish_mode_raster(", "fn position_focus_panel(");

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
    && coordinator.includes("await applyFocusSurfacePresentation(next)"),
  "production coordinator must use the tested transition helper",
);
invariant(
  coordinator.includes("useRef<Record<FocusSurfaceMode, Set<() => void>>>")
    && coordinator.includes("readinessWaitersRef.current[mode]"),
  "Panel and Timer readiness waiters must be isolated by presentation mode",
);
invariant(
  coordinator.includes("completionSuccess !== null || hasActiveModalShortcutBoundary()")
    && coordinator.includes("[presentationHydrated, timerResizePending, completionSuccess]"),
  "B63 inline success must block new global quick-task shortcuts until next/close",
);
invariant(
  coordinator.includes("inert={!panelActive || transitionPending}")
    && coordinator.includes("inert={!timerActive || transitionPending || completionSuccess !== null}")
    && coordinator.includes("completionSuccessContent={inlineSuccess && completionSuccess ? (")
    && coordinatorCss.includes('data-focus-visibility="preparing"')
    && coordinatorCss.includes("pointer-events: none"),
  "prepainted inactive content and modal backgrounds must be interaction/accessibility-inert",
);
invariant(
  coordinator.includes("animateNativePresentation: (next) =>")
    && coordinator.includes("animateFocusSurfacePresentation(next, motionDurationMs, rasterToken!)")
    && coordinator.includes("runConcurrentMotion: () =>")
    && coordinator.includes("runGeometryMotion(previousPresentation, targetPresentation, motionDurationMs)")
    && transition.includes("animateNativePresentation?: (presentation: TPresentation) => Promise<void>")
    && transition.includes("runConcurrentMotion?: () => Promise<void>")
    && coordinator.includes("const FOCUS_GEOMETRY_MOTION_MS = 250")
    && coordinatorCss.includes("--focus-geometry-motion-duration: 250ms")
    && coordinatorCss.includes("--focus-geometry-motion-ease: cubic-bezier(0.55, 0.55, 0, 1)")
    && coordinator.includes("prepareFocusSurfaceModeRaster(targetPresentation)"),
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
    && animatedNativeCommit.includes("std::time::Instant::now()")
    && animatedNativeCommit.includes("deadline.checked_sub(started.elapsed())")
    && animatedNativeCommit.includes("fluent_point_to_point_easing(elapsed)")
    && animatedNativeCommit.includes("render_mode_raster_frame(&window, lease, &incoming, progress)")
    && animatedNativeCommit.indexOf("render_mode_raster_frame(&window, lease, &incoming, progress)")
      < animatedNativeCommit.indexOf("set_focus_position(")
    && focusWebview.includes("crate::focus_layered_raster::sync_owner_position(window);")
    && !animatedNativeCommit.includes("focus_frame_hold::clear")
    && !animatedNativeCommit.includes("apply_focus_native_target"),
  "one measured finite timeline must own native movement, complete content and visible envelope without clearing protection",
);
invariant(
  prepareRaster.includes("focus_frame_capture::capture(window.clone()).await")
    && prepareRaster.includes("focus_layered_raster::begin_mode_transition(&window, visible, &png)")
    && coordinator.indexOf("await prepareFocusSurfaceModeRaster(targetPresentation)")
      < coordinator.indexOf("await prepareGeometryMotion(previousPresentation, targetPresentation)")
    && raster.includes("source_offset(image, visible, x, y)")
    && raster.includes("let growing =")
    && raster.includes("visible.height) > scaled_height")
    && !raster.includes("incoming_weight")
    && !coordinatorCss.includes("inset(0 0 590px")
    && !coordinatorCss.includes("inset(0 0 400px"),
  "outgoing protection precedes target promotion; one hierarchy is clipped at natural row spacing with uniform DPI scale and no crossblend",
);
invariant(
  coordinator.includes("afterRendererCommit: async () =>")
    && coordinator.includes("await finishFocusSurfaceModeRaster(rasterToken!)")
    && transition.includes("await afterRendererCommit?.()")
    && finishRaster.includes("focus_frame_capture::capture(window.clone()).await")
    && finishRaster.includes("focus_mode_raster::decode(")
    && finishRaster.indexOf("focus_mode_raster::decode(") < finishRaster.indexOf("lease.hold.release()?")
    && finishRaster.includes("restore_focus_native_snapshot_protected")
    && finishRaster.includes("lease.token != raster_token")
    && layeredHold.includes("UpdateLayeredWindow(")
    && layeredHold.includes("WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_NOACTIVATE | WS_EX_TOOLWINDOW")
    && layeredHold.includes("let shrinking = visible.height")
    && layeredHold.indexOf("if shrinking {") < layeredHold.indexOf("draw(owner as Handle, popup, visible, bytes, diameter)?")
    && layeredHold.indexOf("draw(owner as Handle, popup, visible, bytes, diameter)?") < layeredHold.indexOf("if !shrinking {")
    && layeredHold.includes("IsWindowVisible(owner)")
    && layeredHold.includes("IsIconic(owner)")
    && layeredHold.includes("MAX_LIFETIME")
    && region.includes("actual_win32_region_is_exact_and_identical_requests_do_not_replace_it"),
  "release must follow renderer paint and validated final DPI capture; stale release is rejected, rollback is protected, independent layered pixels own composition, shrink/grow ordering protects parent pixels, and watchdog remains bounded",
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
    && modeApi.includes('invoke<void>("focus_surface_animate_presentation", { presentation, durationMs, rasterToken })')
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
