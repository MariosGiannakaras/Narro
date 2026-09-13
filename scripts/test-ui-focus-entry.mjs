import { readFile } from "node:fs/promises";

const [rust, lib, api, button, main, preferences, windows] = await Promise.all([
  readFile(new URL("../src-tauri/src/focus_entry.rs", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/lib.rs", import.meta.url), "utf8"),
  readFile(new URL("../src/focusEntryApi.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/BlitzEntryButton.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/main.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/domain/preferences.rs", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/windows/mod.rs", import.meta.url), "utf8"),
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
  [lib, "Some(monitor_key) => resolve_monitor_by_key(app_handle, &monitor_key)?.1.work_area", "exact saved monitor resolution"],
  [lib, ".primary_monitor()", "primary monitor fallback when no monitor is selected"],
  [lib, "monitor_descriptor(0, &monitor)?.work_area", "validated primary monitor work area"],
  [lib, "fn position_focus_panel_in_work_area(", "shared native panel positioning boundary"],
  [lib, "focus_panel_edge_position(", "validated M1 edge geometry reuse"],
  [lib, "fn present_focus_panel(app_handle: tauri::AppHandle)", "production native Focus presentation command"],
  [lib, "preferred_focus_panel_work_area(&app_handle)?", "preference-aware production placement"],
  [lib, "present_focus_panel\n        ])", "production placement command registration"],
  [lib, "Err(CommandError::stale_monitor_selection())", "stale selected-monitor rejection"],
  [preferences, "selected_monitor_key: None", "safe no-selection default"],
  [preferences, "focus_panel_side: FocusPanelSide::Right", "default right side"],
  [windows, "pub fn focus_panel_edge_position(", "M1 physical work-area edge helper"],
  [windows, "supports_monitors_with_negative_desktop_coordinates", "negative desktop coordinate regression"],
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

const savedMonitorBranch = lib.indexOf("Some(monitor_key) => resolve_monitor_by_key");
const primaryFallback = lib.indexOf(".primary_monitor()", savedMonitorBranch);
if (savedMonitorBranch < 0 || primaryFallback < savedMonitorBranch) {
  throw new Error("Saved monitor selection must be resolved exactly before the no-selection primary-monitor fallback.");
}

console.log("Focus entry and native selected-monitor/side placement contract checks passed.");
