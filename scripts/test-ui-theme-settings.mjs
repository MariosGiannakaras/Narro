import { readFile } from "node:fs/promises";

function invariant(condition, message) {
  if (!condition) throw new Error(`Theme settings invariant failed: ${message}`);
}

async function read(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

const [
  rust,
  lib,
  domain,
  themeCss,
  api,
  runtime,
  panel,
  shell,
  main,
  focus,
  fixture,
  fixtureHtml,
  vite,
  capture,
  validator,
] = await Promise.all([
  read("src-tauri/src/theme_settings.rs"),
  read("src-tauri/src/lib.rs"),
  read("src-tauri/src/domain/preferences.rs"),
  read("src/theme.css"),
  read("src/themeApi.ts"),
  read("src/ThemeRuntime.tsx"),
  read("src/ThemeSettingsPanel.tsx"),
  read("src/AppShell.tsx"),
  read("src/main.tsx"),
  read("src/focus.tsx"),
  read("src/themeSettingsVisualFixture.tsx"),
  read("theme-settings-fixture.html"),
  read("vite.config.ts"),
  read("scripts/capture-theme-settings-fixtures.ps1"),
  read("scripts/validate-theme-settings-captures.mjs"),
]);

for (const [source, needle, label] of [
  [domain, "pub enum ThemePreference", "persisted ThemePreference domain"],
  [domain, "theme: ThemePreference::System", "System default"],
  [rust, "pub fn get_theme_preference", "theme read command"],
  [rust, "pub fn set_theme_preference", "theme write command"],
  [rust, '"theme-preference-changed"', "cross-webview event"],
  [rust, "preferences.general.theme = theme;", "theme-only payload mutation"],
  [rust, "save_preferences(&mut connection, preferences, now)?", "existing preference persistence"],
  [lib, "pub mod theme_settings;", "theme module registration"],
  [lib, "theme_settings::get_theme_preference", "read command registration"],
  [lib, "theme_settings::set_theme_preference", "write command registration"],
  [api, 'invoke<ThemePreference>("get_theme_preference")', "renderer read invoke"],
  [api, 'invoke<ThemePreference>("set_theme_preference"', "renderer write invoke"],
  [runtime, "ThemeRuntimeProvider", "shared runtime provider"],
  [runtime, "THEME_PREFERENCE_CHANGED_EVENT", "event listener"],
  [runtime, "document.documentElement.dataset.theme = theme", "root theme projection"],
  [main, "<ThemeRuntimeProvider>", "main runtime installation"],
  [focus, "<ThemeRuntimeProvider>", "focus runtime installation"],
  [panel, "Preferences", "Preferences heading"],
  [panel, "General", "General section"],
  [panel, "System", "System option"],
  [panel, "Dark", "Dark option"],
  [panel, "Light", "Light option"],
  [panel, 'role="group" aria-label="Theme"', "accessible segmented theme group"],
  [shell, '<ThemeSettingsPanel />', "production Settings destination"],
  [fixture, 'dataset.themeSettingsFixtureReady = "true"', "fixture readiness marker"],
  [fixtureHtml, "/src/themeSettingsVisualFixture.tsx", "fixture entry module"],
  [vite, 'themeSettingsFixture: "theme-settings-fixture.html"', "Vite fixture input"],
  [capture, "theme-settings-fixture.html", "Windows Edge capture wiring"],
  [validator, 'data-theme-settings="true"', "captured production surface validation"],
]) {
  invariant(source.includes(needle), `${label} is missing`);
}

const setStart = rust.indexOf("pub fn set_theme_preference");
const committed = rust.indexOf("let committed = save(", setStart);
const emitted = rust.indexOf("app_handle.emit", setStart);
invariant(setStart >= 0 && committed > setStart && emitted > committed, "theme event must be emitted only after committed persistence");
invariant(rust.includes("if let Err(error) = app_handle.emit"), "post-commit event failure must be best-effort/logged");

for (const token of ["system", "dark", "light"]) {
  invariant(rust.includes(`\"${token}\"`), `Rust theme parser must accept ${token}`);
  invariant(themeCss.includes(`data-theme=\"${token}\"`), `CSS must expose ${token} theme selector`);
}
invariant(themeCss.includes("@media (prefers-color-scheme: dark)"), "System theme must follow the OS/browser color scheme without polling");
invariant(!runtime.includes("setInterval"), "theme runtime must not poll");
invariant(!runtime.includes("matchMedia(") || themeCss.includes("prefers-color-scheme"), "System resolution must remain CSS-owned");

for (const forbidden of [
  "Timezone",
  "Pomodoro",
  "Timed alerts",
  "Schedule reminders",
  "Celebrate task completion",
  "Blitz Panel Side",
  "Hide EST",
  "Auto-parse",
]) {
  invariant(!panel.includes(forbidden), `item 27 must not absorb later preference family: ${forbidden}`);
}

invariant(!focus.includes('background: "#222"'), "focus surface must not hard-code a dark background");
invariant(!focus.includes('color: "red"'), "focus error state must consume semantic theme tokens");

console.log("Theme settings/runtime contract: PASS");
