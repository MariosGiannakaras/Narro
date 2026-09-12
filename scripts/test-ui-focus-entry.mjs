import { readFile } from "node:fs/promises";

const [rust, lib, api, button, main] = await Promise.all([
  readFile(new URL("../src-tauri/src/focus_entry.rs", import.meta.url), "utf8"),
  readFile(new URL("../src-tauri/src/lib.rs", import.meta.url), "utf8"),
  readFile(new URL("../src/focusEntryApi.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/BlitzEntryButton.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/main.tsx", import.meta.url), "utf8"),
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
  [api, 'invoke<StartBlitzOutcome>("start_blitz"', "typed Start Blitz IPC"],
  [api, 'invoke<void>("focus_surface_mode_panel")', "existing focusSurface panel presentation"],
  [api, 'invoke<void>("focus_surface_focus")', "focusSurface focus presentation"],
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

const startCall = button.indexOf("const outcome = await startBlitz();");
const presentationCall = button.indexOf("await presentFocusPanel();", startCall);
if (startCall < 0 || presentationCall < startCall) {
  throw new Error("Focus Panel presentation must occur only after authoritative Start Blitz resolves.");
}

console.log("Focus entry contract checks passed.");
