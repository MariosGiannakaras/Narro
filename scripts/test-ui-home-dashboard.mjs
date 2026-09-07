import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const rust = read("src-tauri/src/home_snapshot.rs");
const lib = read("src-tauri/src/lib.rs");
const component = read("src/HomeDashboard.tsx");
const css = read("src/homeDashboard.css");
const shell = read("src/AppShell.tsx");
const fixtures = read("src/visualFixtures.tsx");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-visual-fixtures.mjs");

for (const [haystack, needle, label] of [
  [rust, "active_lists(conn)?", "reuse of validated active-list persistence read"],
  [rust, "active_tasks_in_bucket(conn, list.id, lane)?", "reuse of validated task-bucket persistence read"],
  [rust, "const PREVIEW_TASK_LIMIT: usize = 4;", "four-row list preview limit"],
  [rust, "PlanningLane::Today", "Today-first Home preview ordering"],
  [rust, "PlanningLane::ThisWeek", "This Week Home preview ordering"],
  [rust, "PlanningLane::Backlog", "Backlog Home preview ordering"],
  [rust, ".checked_add(", "checked Home aggregate arithmetic"],
  [rust, "snapshot_uses_active_lists_and_caps_preview_without_losing_totals", "Home read-model regression coverage"],
  [lib, "pub mod home_snapshot;", "Home read-model module registration"],
  [lib, "fn get_home_snapshot", "renderer-facing read-only Home command"],
  [lib, '"HOME_SNAPSHOT_FAILED"', "typed Home command error code"],
  [lib, "get_home_snapshot,", "Home command handler registration"],
  [component, 'invoke<HomeSnapshot>("get_home_snapshot")', "Home SQLite snapshot load"],
  [component, 'data-home-dashboard="main"', "Home surface identity"],
  [component, "Good morning", "time-based morning greeting"],
  [component, "Good afternoon", "time-based afternoon greeting"],
  [component, "Good evening", "time-based evening greeting"],
  [component, "Your Lists", "Your Lists hierarchy"],
  [component, "Lists with your upcoming tasks", "Home helper copy"],
  [component, 'title: "All Lists"', "All Lists aggregate card"],
  [component, "fixtureSnapshot", "fixture-only deterministic data injection"],
  [component, "HEX_COLOR", "safe list-color projection"],
  [component, 'className="home-list-card__action-slot"', "reserved action geometry"],
  [css, "grid-template-columns: 2rem minmax(0, 1fr) 2rem;", "stable card header action slot"],
  [css, "grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));", "responsive Home card grid"],
  [shell, "homeContent ?? <HomeDashboard />", "Home as default shell content"],
  [fixtures, 'fixture === "home"', "Home visual fixture route"],
  [fixtures, "homeFixtureSnapshot", "deterministic Home fixture snapshot"],
  [capture, "fixture=home", "real Edge Home capture"],
  [validator, 'data-home-dashboard="main"', "captured Home semantic validation"],
]) {
  requireText(haystack, needle, label);
}

if (component.includes("iconAsset") && component.includes("<img")) {
  throw new Error("Home baseline must not render unvalidated stored icon paths directly as image sources.");
}

if (css.includes("--color-text-muted")) {
  throw new Error("Home styles must use the validated semantic theme-token contract only.");
}

console.log("Home dashboard/list-card contract checks passed.");
