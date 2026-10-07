import { readFile } from "node:fs/promises";

const [rust, lib, api, button, main, board, preferences, windows, topology, region, coordinator, morph, capture] = await Promise.all([
  readFile(new URL("../src-tauri/src/focus_entry.rs", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/lib.rs", import.meta.url), "utf8"),
  readFile(new URL("../src/focusEntryApi.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/BlitzEntryButton.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/main.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/ListBoard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/domain/preferences.rs", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/windows/mod.rs", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/windows/topology.rs", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/timer_region.rs", import.meta.url), "utf8"),
  readFile(new URL("../src/FocusSurfaceCoordinator.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/main_focus_morph.rs", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/focus_frame_capture.rs", import.meta.url), "utf8"),
]);

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

for (const [haystack, needle, label] of [
  [rust, "scheduling::focus_eligibility_at", "authoritative M4 Focus eligibility reuse"],
  [rust, "active_lists(conn)?", "active-list priority source"],
  [rust, "ACTIVE_MANUAL_LANES", "scheduled task projection across manual lanes"],
  [rust, "left.list_rank", "list priority ordering"],
  [rust, "left.task.sort_rank", "task priority ordering"],
  [rust, "FocusEligibility::Eligible", "eligible-only candidate selection"],
  [rust, "preferences.focus.pomodoro_enabled", "Pomodoro preference precedence"],
  [rust, "TimerMode::EstCountdown", "EST countdown mode"],
  [rust, "TimerMode::CountUp", "count-up fallback mode"],
  [rust, "NoEligibleTodayTasks", "typed no-eligible result"],
  [rust, "AlreadyActive", "idempotent active-session result"],
  [rust, "timer_service.snapshot()", "authoritative runtime snapshot gate"],
  [lib, "pub mod focus_entry;", "Focus entry module registration"],
  [lib, "focus_entry::start_blitz,", "Start Blitz command registration"],
  [lib, "fn load_focus_panel_placement_preferences(", "native placement preference read boundary"],
  [lib, "persistence::preferences::get_preferences(&connection)", "persisted placement preference source"],
  [lib, "preferences.general.selected_monitor_key", "selected monitor preference"],
  [lib, "preferences.general.focus_panel_side", "Focus Panel side preference"],
  [lib, "Some(monitor_key) =>", "saved monitor branch"],
  [lib, "resolve_monitor_by_key(app_handle, &monitor_key)?", "saved monitor resolution"],
  [lib, "fn parse_persisted_monitor_name(", "persisted monitor identity parser"],
  [lib, "descriptor.name.as_deref() == Some(saved_name.as_str())", "DPI/work-area tolerant selected-monitor identity"],
  [lib, ".primary_monitor()", "primary monitor fallback when no monitor is selected"],
  [lib, "monitor_descriptor(0, &monitor)?", "validated primary monitor descriptor"],
  [lib, "descriptor.scale_factor", "target-monitor DPI scale propagation"],
  [lib, "fit_focus_host_for_target_scale(", "deterministic target-monitor host sizing"],
  [lib, "timer_region::apply_full_host(window)", "Panel full-host region independent of stale window DPI"],
  [lib, "fn apply_panel_native(", "single-host native Panel geometry boundary"],
  [lib, "focus_panel_edge_position(", "validated M1 edge geometry reuse"],
  [lib, "fn position_focus_panel(", "explicit diagnostic/Preferences Panel positioning command"],
  [lib, "fn present_focus_panel(app_handle: tauri::AppHandle)", "production native Focus presentation command"],
  [lib, "preferred_focus_panel_work_area(app_handle)", "preference-aware production placement"],
  [lib, "pub(crate) fn revalidate_open_focus_panel_after_display_change(", "open-panel display revalidation boundary"],
  [lib, "current_focus_surface_mode() != Some(FocusSurfaceMode::Panel)", "Panel-mode revalidation guard"],
  [lib, ".is_visible()", "visible Focus-surface revalidation guard"],
  [lib, "position_focus_panel,", "Panel positioning command registration"],
  [lib, "present_focus_panel", "production Panel presentation registration"],
  [lib, 'const FOCUS_PANEL_REQUEST_EVENT: &str = "focus-panel-requested";', "visible Blitz target-Panel coordinator request"],
  [coordinator, 'subscribe<boolean>("focus-panel-requested"', "persistent coordinator Blitz Panel request listener"],
  [coordinator, 'deferredPanelRequestRef.current = true', "Blitz Panel request transition deferral"],
  [lib, "Err(CommandError::stale_monitor_selection())", "stale selected-monitor rejection"],
  [preferences, "selected_monitor_key: None", "safe no-selection default"],
  [preferences, "focus_panel_side: FocusPanelSide::Right", "default right side"],
  [windows, "pub fn focus_panel_edge_position(", "M1 physical work-area edge helper"],
  [windows, "supports_monitors_with_negative_desktop_coordinates", "negative desktop coordinate regression"],
  [topology, "WM_DISPLAY_CHANGE", "event-driven display-change trigger"],
  [topology, "WM_DPICHANGED", "event-driven DPI trigger"],
  [topology, "WM_ENTERSIZEMOVE", "native interactive-move entry trigger"],
  [topology, "WM_EXITSIZEMOVE", "native interactive-move exit trigger"],
  [topology, "display_recovery_suspended()", "DPI recovery deferral during active movement"],
  [topology, "RECOVERY_DIRTY.load(Ordering::Acquire)", "deferred recovery replay after movement"],
  [topology, "WM_SETTING_CHANGE", "event-driven work-area trigger"],
  [topology, "SPI_SETWORKAREA", "work-area setting filter"],
  [topology, "is_power_resume_event(wparam)", "resume-triggered display revalidation"],
  [topology, "recover_visible_windows(&recovery_handle)", "generic Main visible-area recovery first"],
  [topology, "crate::revalidate_open_focus_panel_after_display_change(&recovery_handle)", "presentation-aware open Panel revalidation"],
  [topology, "crate::revalidate_open_timer_after_display_change(", "presentation-aware open Timer revalidation"],
  [topology, "OBSERVED_WINDOW_LABELS: [&str; 1] = [FOCUS_SURFACE_LABEL]", "single Focus HWND display observer"],
  [topology, 'RECOVERABLE_WINDOW_LABELS: [&str; 1] = ["main"]', "generic recovery excludes presentation-aware Focus host"],
  [topology, "display_geometry_messages_schedule_recovery", "native trigger regression test"],
  [topology, "only_resume_power_events_request_display_revalidation", "resume trigger regression test"],
  [region, "FOCUS_HOST_WIDTH_LOGICAL: f64 = 340.0", "validated single-host width"],
  [region, "FOCUS_HOST_HEIGHT_LOGICAL: f64 = 700.0", "validated single-host maximum height"],
  [api, 'invoke<StartBlitzOutcome>("start_blitz"', "typed Start Blitz IPC"],
  [api, 'invoke<void>("present_focus_for_blitz", { reducedMotion })', "reduced-motion-aware native Blitz Focus presentation IPC"],
  [button, 'data-start-blitz="true"', "explicit Start Blitz control"],
  [button, "const outcome = await startBlitz();", "click-only authoritative start request"],
  [button, 'outcome.status === "no_eligible_today_tasks"', "no-eligible UI handling"],
  [button, 'window.matchMedia("(prefers-reduced-motion: reduce)").matches', "reduced-motion native morph bypass flag"],
  [button, "await presentFocusForBlitz(reducedMotion);", "post-commit native Focus presentation"],
  [lib, "const BLITZ_MAIN_MORPH_MS: u64 = 220;", "source-calibrated finite Board-to-Focus duration"],
  [lib, "focus_frame_capture::capture(main.clone()).await", "Main WebView CapturePreview path"],
  [lib, "focus_frame_hold::begin(&main, visible, &frame)", "finite frozen Main raster hold"],
  [lib, "animate_main_focus_rect(", "native Main rect morph"],
  [lib, "restore_main_after_blitz_morph(&main, main_snapshot)", "Main geometry rollback/restoration"],
  [lib, "main_focus_morph::safe_restored_state(&main)?", "unsafe Main state direct-handoff guard"],
  [morph, "SetWindowPos(", "native top-level rect authority"],
  [morph, "DwmFlush()", "finite compositor-step flush"],
  [morph, ".is_maximized()", "maximized Main morph bypass"],
  [morph, ".is_fullscreen()", "fullscreen Main morph bypass"],
  [capture, "MAX_CAPTURE_PNG_BYTES", "bounded large Main WebView capture limit"],
  [capture, "png_bytes.len() as u64 > MAX_CAPTURE_PNG_BYTES", "same bounded Main capture limit through decode"],
  [lib, "let transition = match tauri::async_runtime::spawn_blocking", "morph worker failure enters common recovery path"],
  [button, "Focus session is active", "committed-start presentation failure distinction"],
  [board, 'laneKey === "today" ? <BlitzEntryButton /> : null', "production Today-lane entry surface"],
]) {
  requireText(haystack, needle, label);
}

if (main.includes("<BlitzEntryButton />")) {
  throw new Error("Blitz entry must live in the Today lane rather than a global post-App strip.");
}

if (button.includes("useEffect") || api.includes("useEffect")) {
  throw new Error("Start Blitz must require an explicit user action and cannot run from a render effect.");
}
for (const source of [rust, api, button]) {
  if (source.includes("openUrl") || source.includes("plugin-opener")) {
    throw new Error("Focus entry must not open task-note URLs or introduce opener side effects.");
  }
}
for (const forbidden of [
  "present_focus_panel",
  "focus_surface_mode_panel",
  "focus_surface_focus",
  "available_monitors",
  "primary_monitor",
  "focus_panel_edge_position",
  "set_position",
]) {
  if (api.includes(forbidden)) {
    throw new Error(`Production Focus entry renderer must not own native placement via ${forbidden}.`);
  }
}

const startCall = button.indexOf("const outcome = await startBlitz();");
const presentationCall = button.indexOf("await presentFocusForBlitz(reducedMotion);", startCall);
if (startCall < 0 || presentationCall < startCall) {
  throw new Error("Focus presentation must occur only after authoritative Start Blitz resolves.");
}
for (const forbidden of [
  "fadeBoardBeforeFocusPresentation",
  "BLITZ_BOARD_FADE_MS",
  "data-blitz-focus-transition",
]) {
  if (button.includes(forbidden)) {
    throw new Error(`Board-to-Focus entry must not retain renderer fade behavior: ${forbidden}`);
  }
}

const savedMonitorBranch = lib.indexOf("Some(monitor_key) =>");
const savedMonitorResolution = lib.indexOf("resolve_monitor_by_key(app_handle, &monitor_key)?", savedMonitorBranch);
const primaryFallback = lib.indexOf(".primary_monitor()", savedMonitorResolution);
if (savedMonitorBranch < 0 || savedMonitorResolution < savedMonitorBranch || primaryFallback < savedMonitorResolution) {
  throw new Error("Saved monitor selection must resolve exactly before the no-selection primary-monitor fallback.");
}

const genericRecovery = topology.indexOf("recover_visible_windows(&recovery_handle)");
const panelRevalidation = topology.indexOf(
  "crate::revalidate_open_focus_panel_after_display_change(&recovery_handle)",
);
const timerRevalidation = topology.indexOf(
  "crate::revalidate_open_timer_after_display_change(",
  panelRevalidation,
);
const timerSave = topology.indexOf("save_if_timer_visible(&recovery_handle)", timerRevalidation);
if (
  genericRecovery < 0
  || panelRevalidation < genericRecovery
  || timerRevalidation < panelRevalidation
  || timerSave < timerRevalidation
) {
  throw new Error("Main recovery must precede presentation-aware Panel/Timer revalidation and Timer placement persistence.");
}

const revalidationStart = lib.indexOf("pub(crate) fn revalidate_open_focus_panel_after_display_change(");
const revalidationEnd = lib.indexOf("pub(crate) fn revalidate_open_timer_after_display_change(", revalidationStart);
const revalidationBlock = lib.slice(revalidationStart, revalidationEnd);
if (
  revalidationStart < 0
  || revalidationEnd < revalidationStart
  || revalidationBlock.includes("set_focus")
  || revalidationBlock.includes(".show()")
) {
  throw new Error("Display-change Panel revalidation must not show or focus the Focus surface.");
}

const applyPresentationStart = lib.indexOf("fn apply_focus_surface_presentation_internal(");
const applyPresentationEnd = lib.indexOf("fn focus_runtime_capture_checkpoint(", applyPresentationStart);
const applyPresentationBlock = lib.slice(applyPresentationStart, applyPresentationEnd);
const applyNativeTargetStart = lib.indexOf("fn apply_focus_native_target(");
const applyNativeTargetEnd = lib.indexOf("fn planned_focus_presentation_position(", applyNativeTargetStart);
const applyNativeTargetBlock = lib.slice(applyNativeTargetStart, applyNativeTargetEnd);
if (
  applyPresentationStart < 0
  || applyPresentationEnd < applyPresentationStart
  || applyNativeTargetStart < 0
  || applyNativeTargetEnd < applyNativeTargetStart
  || !applyPresentationBlock.includes("previous == target && target != FocusSurfacePresentation::Panel")
  || !applyPresentationBlock.includes("apply_focus_native_target(app_handle, &window, previous, target, compact_frame)")
  || !applyNativeTargetBlock.includes("FocusSurfacePresentation::Panel => preferred_focus_panel_work_area(app_handle)")
  || !applyNativeTargetBlock.includes("apply_panel_native(window, work_area, scale_factor, side)")
) {
  throw new Error("Explicit Panel presentation must reapply current monitor/side preferences even when Panel is already the committed mode.");
}

const blitzPresentationStart = lib.indexOf("async fn present_focus_for_blitz(");
const blitzPresentationEnd = lib.indexOf("pub(crate) fn revalidate_open_focus_panel_after_display_change(", blitzPresentationStart);
const blitzPresentation = lib.slice(blitzPresentationStart, blitzPresentationEnd);
const visibleBranchStart = blitzPresentation.indexOf("if visible {");
const hiddenBranchStart = blitzPresentation.indexOf("// Prepare the retained hidden Focus host", visibleBranchStart);
const visibleBranch = blitzPresentation.slice(visibleBranchStart, hiddenBranchStart);
const hiddenBranch = blitzPresentation.slice(hiddenBranchStart);
if (
  blitzPresentationStart < 0
  || blitzPresentationEnd < blitzPresentationStart
  || visibleBranchStart < 0
  || hiddenBranchStart < visibleBranchStart
  || !visibleBranch.includes("set_focus()")
  || !visibleBranch.includes("request_blitz_panel_after_reveal(&app_handle)")
  || visibleBranch.includes("apply_focus_surface_presentation_internal")
  || !hiddenBranch.includes("apply_focus_surface_presentation_internal(")
  || !hiddenBranch.includes("FocusSurfacePresentation::Panel")
  || !hiddenBranch.includes("show_focus_after_blitz_entry(&app_handle, &main, &focus)")
  || !hiddenBranch.includes("focus_frame_capture::capture(main.clone()).await")
  || !hiddenBranch.includes("animate_main_focus_rect(")
) {
  throw new Error("Blitz Focus entry must preserve the visible coordinator path and use the bounded native morph only for hidden Focus.");
}

const sourceHandoffComment = hiddenBranch.indexOf("// Match the source-backed handoff:");
const successHide = hiddenBranch.lastIndexOf("if let Err(error) = main.hide()", sourceHandoffComment);
const successRestore = hiddenBranch.indexOf(
  "restore_main_after_blitz_morph(&main, main_snapshot)",
  sourceHandoffComment,
);
const successFocusReveal = hiddenBranch.indexOf("show_and_focus(&focus)", successRestore);
const successPanelRequest = hiddenBranch.indexOf(
  "request_blitz_panel_after_reveal(&app_handle)",
  successFocusReveal,
);
if (
  sourceHandoffComment < 0
  || successHide < 0
  || successHide > sourceHandoffComment
  || successRestore < sourceHandoffComment
  || successFocusReveal < successRestore
  || successPanelRequest < successFocusReveal
) {
  throw new Error(
    "P3-M6-01/06 success handoff must hide Main, restore while hidden, reveal Focus, then request the Blitz Panel handshake.",
  );
}

const panelRequestHelperStart = lib.indexOf("fn request_blitz_panel_after_reveal(");
const panelRequestHelperEnd = lib.indexOf("fn show_focus_after_blitz_entry(", panelRequestHelperStart);
const panelRequestHelper = lib.slice(panelRequestHelperStart, panelRequestHelperEnd);
if (
  panelRequestHelperStart < 0
  || panelRequestHelperEnd < panelRequestHelperStart
  || !panelRequestHelper.includes("emit(FOCUS_PANEL_REQUEST_EVENT, true)")
) {
  throw new Error("Blitz Panel handshake must use the existing coordinator-only request event.");
}
for (const required of [
  "const handleBlitzPanelRequest = useCallback(async () => {",
  'await requestModeRef.current("panel");',
  "await waitForPresentedFrame();",
  "await resumeTimerFromFocusHome();",
  "deferredPanelRequestRef.current = true",
  "void handleBlitzPanelRequest();",
]) {
  if (!coordinator.includes(required)) {
    throw new Error(`P3-M6-06 coordinator re-entry handshake is missing: ${required}`);
  }
}

const handler = lib.indexOf(".invoke_handler(tauri::generate_handler![");
const registeredPresentation = lib.indexOf("present_focus_for_blitz", handler);
if (handler < 0 || registeredPresentation < handler) {
  throw new Error("The coordinator-safe Blitz Focus presentation command must be registered in Tauri IPC.");
}

console.log("Single-host Focus entry, placement, and display-revalidation contracts passed.");
