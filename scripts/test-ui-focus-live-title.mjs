import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus live-title scrolling contract failed: ${message}`);
}

const panel = read("src/FocusPanel.tsx");
const title = read("src/FocusLiveTitle.tsx");
const css = read("src/focusLiveTitle.css");
const rust = read("src-tauri/src/focus_preferences.rs");
const lib = read("src-tauri/src/lib.rs");
const preferences = read("src-tauri/src/domain/preferences.rs");
const pkg = JSON.parse(read("package.json"));

for (const [haystack, needle, label] of [
  [preferences, "pub scrolling_title: bool", "persisted Focus scrolling-title preference"],
  [preferences, "scrolling_title: false", "safe default-off preference"],
  [rust, "get_focus_scrolling_title_preference", "narrow native read command"],
  [rust, "get_preferences(&connection)", "persisted SQLite preference source"],
  [rust, "preferences.focus.scrolling_title", "Focus scrolling-title preference projection"],
  [rust, "scrolling_title_reads_default_and_persisted_value_without_mutation", "native persisted-value regression"],
  [lib, "pub mod focus_preferences;", "Focus preference module registration"],
  [lib, "focus_preferences::get_focus_scrolling_title_preference", "Tauri command registration"],
  [panel, 'invoke<boolean>("get_focus_scrolling_title_preference")', "production preference read"],
  [panel, "<FocusLiveTitle", "active-title-only component composition"],
  [title, "useLayoutEffect", "layout-synchronous overflow measurement"],
  [title, "text.scrollWidth - container.clientWidth", "actual horizontal overflow calculation"],
  [title, "new ResizeObserver(measure)", "event-driven resize revalidation"],
  [title, 'data-focus-live-title-scroll={scrollState}', "explicit scroll-state marker"],
  [css, 'data-focus-live-title-scroll="active"', "overflow-only active styling"],
  [css, "animation: focus-live-title-scroll 8s linear infinite alternate", "bounded transform animation contract"],
  [css, "transform: translateX(calc(-1 * var(--focus-live-title-overflow)))", "measured-distance transform"],
  [css, "@media (prefers-reduced-motion: reduce)", "reduced-motion override"],
  [css, "animation: none", "reduced-motion animation removal"],
  [css, "text-overflow: ellipsis", "static full-layout fallback"],
]) {
  invariant(haystack.includes(needle), `${label} is missing`);
}

invariant(!rust.includes("save_preferences("), "read-only native command must not mutate preferences");
invariant(!title.includes("setInterval("), "live-title scrolling must not use polling intervals");
invariant(!title.includes("requestAnimationFrame("), "live-title scrolling must not use a JavaScript animation loop");
invariant((panel.match(/<FocusLiveTitle/g) ?? []).length === 1, "scrolling component must apply only to the active/live title");
invariant(panel.includes('className="focus-panel__task-title"'), "ordinary Focus task-row title rendering must remain separate");
invariant(!css.includes("left:"), "scroll animation must not move layout geometry with left positioning");
invariant(!css.includes("margin-left:"), "scroll animation must not move layout geometry with margins");
invariant(pkg.scripts["test:ui-focus-live-title"] === "node scripts/test-ui-focus-live-title.mjs", "package script registration differs");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-live-title"), "frontend preflight does not run live-title contract test");

console.log("Focus live-title persisted preference, overflow scrolling, and reduced-motion contracts passed.");
