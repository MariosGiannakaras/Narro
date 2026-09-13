import { readFile } from "node:fs/promises";

const [rust, lib, api, button, main, preferences, windows, topology] = await Promise.all([
  readFile(new URL("../src-tauri/src/focus_entry.rs", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/lib.rs", import.meta.url), "utf8"),
  readFile(new URL("../src/focusEntryApi.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/BlitzEntryButton.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/main.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/domain/preferences.rs", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/windows/mod.rs", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/windows/topology.rs", import.meta.url), "utf8"),
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
  [lib, "domain::preferences::FocusPanelSide::Left => FocusPanelSide::Left", "left side mapping"],
  [lib, "domain::preferences::FocusPanelSide::Right => FocusPanelSide::Right", "right side mapping"],
  [lib, "Some(monitor_key) =>", "saved monitor branch"],
  [lib, "resolve_monitor_by_key(app_handle, &monitor_key)?", "exact saved monitor resolution"],
  [lib, ".primary_monitor()", "primary monitor fallback when no monitor is selected"],
  [lib, "monitor_descriptor(0, &monitor)?.work_area", "validated primary monitor work area"],
  [lib, "fn position_focus_panel_in_work_area(", "shared native panel positioning boundary"],
  [lib, "focus_panel_edge_position(", "validated M1 edge geometry reuse"],
  [lib, "FocusPanelPlacementIntent::Present", "explicit activating placement intent"],
  [lib, "FocusPanelPlacementIntent::Revalidate", "explicit non-activating revalidation intent"],
  [lib, "pub(crate) fn revalidate_open_focus_panel_after_display_change(", "open-panel display revalidation boundary"],
  [lib, "current_focus_surface_mode() != Some(FocusSurfaceMode::Panel)", "Panel-mode guard"],
  [lib, ".is_visible()", "visible Focus surface guard"],
  [lib, "fn present_focus_panel(app_handle: tauri::AppHandle)", "production native Focus presentation command"],
  [lib, "preferred_focus_panel_work_area(&app_handle)?", "preference-aware production placement"],
  [lib, "position_focus_panel,", "diagnostic placement command registration"],
  [lib, "present_focus_panel", "production placement command registration"],
  [lib, "Err(CommandError::stale_monitor_selection())", "stale selected-monitor rejection"],
  [preferences, "selected_monitor_key: None", "safe no-selection default"],
  [preferences, "focus_panel_side: FocusPanelSide::Right", "default right side"],
  [windows, "pub fn focus_panel_edge_position(", "M1 physical work-area edge helper"],
  [windows, "supports_monitors_with_negative_desktop_coordinates", "negative desktop coordinate regression"],
  [topology, "WM_DISPLAY_CHANGE", "event-driven display-change trigger"],
  [topology, "WM_DPICHANGED", "event-driven DPI trigger"],
  [topology, "WM_SETTING_CHANGE", "event-driven work-area trigger"],
  [topology, "SPI_SETWORKAREA", "work-area setting filter"],
  [topology, "is_power_resume_event(wparam)", "resume-triggered display revalidation"],
  [topology, "recover_visible_windows(&recovery_handle)", "M1 generic visible-area recovery first"],
  [topology, "crate::revalidate_open_focus_panel_after_display_change(&recovery_handle)", "preference-aware open Panel revalidation"],
  [topology, "display_geometry_messages_schedule_recovery", "native trigger regression test"],
  [topology, "only_resume_power_events_request_display_revalidation", "resume trigger regression test"],
  [api, 'invoke<StartBlitzOutcome>("start_blitz"', "typed Start Blitz IPC"],
  [api, 'invoke<void>("present_focus_panel")', "preference-aware native Focus presentation IPC"],
  [button, 'data-start-blitz="true"', "explicit Start Blitz control"],
  [button, "const outcome = await startBlitz();", "click-only authoritative start request"],
  [button, 'outcome.status === "no_eligible_today_tasks"', "no-eligible UI handling"],
  [button, "await presentFocusPanel();", "post-commit focus presentation"],
  [button, "Focus session is active", "committed-start presentation failure distinction"],
  [main, "<BlitzEntryButton />", "production main entry surface"],
]) {
  requireText(haystack, needle, label);
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
const presentationCall = button.indexOf("await presentFocusPanel();", startCall);
if (startCall < 0 || presentationCall < startCall) {
  throw new Error("Focus Panel presentation must occur only after authoritative Start Blitz resolves.");
}

const savedMonitorBranch = lib.indexOf("Some(monitor_key) =>");
const savedMonitorResolution = lib.indexOf("resolve_monitor_by_key(app_handle, &monitor_key)?", savedMonitorBranch);
const primaryFallback = lib.indexOf(".primary_monitor()", savedMonitorResolution);
if (
  savedMonitorBranch < 0 ||
  savedMonitorResolution < savedMonitorBranch ||
  primaryFallback < savedMonitorResolution
) {
  throw new Error("Saved monitor selection must resolve exactly before the no-selection primary-monitor fallback.");
}

const genericRecovery = topology.indexOf("recover_visible_windows(&recovery_handle)");
const panelRevalidation = topology.indexOf(
  "crate::revalidate_open_focus_panel_after_display_change(&recovery_handle)",
);
if (genericRecovery < 0 || panelRevalidation < genericRecovery) {
  throw new Error("Generic visible-area recovery must run before selected-monitor Focus Panel revalidation.");
}

const revalidationStart = lib.indexOf("pub(crate) fn revalidate_open_focus_panel_after_display_change(");
const revalidationEnd = lib.indexOf("\nfn build_main_window", revalidationStart);
const revalidationBlock = lib.slice(revalidationStart, revalidationEnd);
if (
  revalidationStart < 0 ||
  revalidationEnd < revalidationStart ||
  revalidationBlock.includes("set_focus") ||
  revalidationBlock.includes(".show()")
) {
  throw new Error("Display-change revalidation must not show or focus the Focus Panel.");
}

const handler = lib.indexOf(".invoke_handler(tauri::generate_handler![");
const registeredPresentation = lib.indexOf("present_focus_panel", handler);
if (handler < 0 || registeredPresentation < handler) {
  throw new Error("The native production Focus presentation command must be registered in Tauri IPC.");
}

console.log("Focus entry, placement, and display-revalidation contract checks passed.");
