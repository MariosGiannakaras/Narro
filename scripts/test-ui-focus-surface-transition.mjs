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
const floatingTimer = read("src/FloatingTimerFoundation.tsx");
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
    && coordinator.includes("if (transitionGateRef.current || timerResizePendingRef.current)")
    && coordinator.includes("[presentationHydrated, completionSuccess]"),
  "B63 inline success must block new global quick-task shortcuts until next/close",
);
invariant(
  coordinator.includes("inert={!panelActive || transitionPending}")
    && coordinator.includes("inert={!timerActive || transitionPending || timerResizePending || completionSuccess !== null}")
    && coordinator.includes("completionSuccessContent={inlineSuccess && completionSuccess ? (")
    && coordinatorCss.includes('data-focus-visibility="preparing"')
    && coordinatorCss.includes("pointer-events: none"),
  "prepainted inactive content and modal backgrounds must be interaction/accessibility-inert",
);
invariant(
  coordinator.includes("animateNativePresentation: (next) =>")
    && coordinator.includes("animateFocusSurfacePresentation(next, motionDurationMs, rasterToken!)")
    && coordinator.includes("runConcurrentMotion: () =>")
    && coordinator.includes("runGeometryMotion(previousPresentation, targetPresentation)")
    && transition.includes("animateNativePresentation?: (presentation: TPresentation) => Promise<void>")
    && transition.includes("runConcurrentMotion?: () => Promise<void>")
    && coordinator.includes("motionV4Duration(")
    && coordinatorCss.includes("--focus-geometry-motion-duration: 500ms")
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
    && lib.includes("fn focus_motion_v4_easing(progress: f64)")
    && lib.includes("focus_motion_v4_raster::compose_panel(")
    && /render_mode_raster_frame\(\s*&window,\s*lease,\s*&incoming,\s*progress,\s*Some\(GeometryPoint/.test(animatedNativeCommit)
    && lib.includes("lease.hold.replace_transition_frame_at(")
    && frameHold.includes("BeginDeferWindowPos(2)")
    && frameHold.includes("EndDeferWindowPos(batch)")
    && !animatedNativeCommit.includes("focus_frame_hold::clear")
    && !animatedNativeCommit.includes("apply_focus_native_target"),
  "one measured finite timeline must own native movement, complete content and visible envelope without clearing protection",
);
invariant(
  prepareRaster.includes("focus_frame_capture::capture(window.clone()).await")
    && prepareRaster.includes("focus_frame_hold::begin_mode_transition(&window, visible, &png)")
    && coordinator.indexOf("await prepareFocusSurfaceModeRaster(targetPresentation)")
      < coordinator.indexOf("await prepareGeometryMotion(previousPresentation, targetPresentation)")
    && raster.includes("source_offset(outgoing, visible, x, y)")
    && raster.includes("source_offset(incoming, visible, x, y)")
    && !coordinatorCss.includes("inset(0 0 590px")
    && !coordinatorCss.includes("inset(0 0 400px"),
  "outgoing CapturePreview protection precedes target promotion; every intermediate image resamples the complete hierarchy instead of cropping incoming Panel rows",
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
    && frameHold.indexOf("image.bitmap = bitmap") < frameHold.indexOf("crate::timer_region::apply_native_rect(parent, visible, false)?")
    && region.includes("actual_win32_region_is_exact_and_identical_requests_do_not_replace_it")
    && frameHold.includes("begin_with_lifetime(window, visible, png, 8_000, true)")
    && frameHold.includes("begin_with_lifetime(window, visible, png, HOLD_MS, false)"),
  "release must follow renderer paint and validated final DPI capture; stale release is rejected, rollback is protected, GDI content precedes parent exposure and watchdog remains bounded",
);
invariant(
  frameHold.includes('const MODE_CLASS: &str = "NarroFocusTransitionFrame";')
    && frameHold.includes("if overlay { 0x080000a0 } else { 4 }")
    && frameHold.includes("if overlay { 0x80000000 } else { 0x44000000 }")
    && frameHold.includes("GetWindow(found, 4)")
    && frameHold.includes("owned.is_none_or(|id| found as usize == id)")
    && frameHold.includes("mode_raster_is_owned_nonactivating_popup_and_region_hold_stays_child")
    && frameHold.includes("paired_host_overlay_move_preserves_negative_screen_origin_and_extent")
    && frameHold.includes("expired_or_other_owner_raster_is_never_selected_for_cleanup"),
  "mode prepaint must be covered above WebView composition by an exact-owned nonactivating popup; regular region holds stay children and native regression cases remain present",
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

invariant(
  coordinator.includes("inert={!timerActive || transitionPending || timerResizePending || completionSuccess !== null}")
    && floatingTimer.includes("restoreResizeTriggerFocus")
    && floatingTimer.includes('document.activeElement.dataset.floatingSubtaskControl === "expand"')
    && floatingTimer.includes("!document.hasFocus()")
    && floatingTimer.includes('!trigger.closest("[inert]")')
    && floatingTimer.includes('trigger.focus({ preventScroll: true })')
    && floatingTimer.includes('document.activeElement !== document.body')
    && floatingTimer.includes('document.activeElement !== document.documentElement')
    && coordinator.includes('onResizePendingChange={setTimerResizeBusy}'),
  "native Timer resize must restore only the initiating keyboard control after the inert boundary clears",
);
