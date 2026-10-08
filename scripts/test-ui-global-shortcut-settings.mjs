import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error("Global shortcut settings contract failed: " + message);
}

const domain = read("src-tauri/src/domain/preferences.rs");
const persistence = read("src-tauri/src/persistence/preferences.rs");
const themeSettings = read("src-tauri/src/theme_settings.rs");
const shortcuts = read("src-tauri/src/shortcuts/mod.rs");
const shortcutSettings = read("src-tauri/src/shortcut_settings.rs");
const lib = read("src-tauri/src/lib.rs");
const api = read("src/globalShortcutSettingsApi.ts");
const panel = read("src/WindowsShortcutSettingsPanel.tsx");
const settings = read("src/ThemeSettingsPanel.tsx");
const css = read("src/windowsShortcutSettingsPanel.css");
const fixture = read("src/themeSettingsVisualFixture.tsx");
const capture = read("scripts/capture-theme-settings-fixtures.ps1");
const validator = read("scripts/validate-theme-settings-captures.mjs");
const pkg = JSON.parse(read("package.json"));

for (const needle of [
  "pub const PREFERENCES_SCHEMA_VERSION: u32 = 5",
  "pub struct ShortcutPreferences",
  "go_to_narro_enabled: true",
  "toggle_focus_mode_enabled: true",
  "find_focus_timer_enabled: true",
  "legacy_payload_without_shortcuts_defaults_all_global_shortcuts_enabled",
]) {
  invariant(domain.includes(needle), "preference schema/default is missing " + needle);
}

invariant(
  /#\[serde\(default\)\]\s+pub shortcuts: ShortcutPreferences/.test(domain),
  "preference schema/default is missing serde default on PreferencesPayload.shortcuts",
);

invariant(
  persistence.includes("pub fn mutate_preferences(")
    && persistence.includes("let mut payload = get_preferences(&tx)?")
    && persistence.includes("mutate(&mut payload)")
    && persistence.includes("tx.commit()?"),
  "preference mutations must be atomic read-modify-write transactions",
);
invariant(
  themeSettings.includes("mutate_preferences(&mut connection, now"),
  "theme writes must reuse the atomic preference mutation boundary",
);

for (const needle of [
  "pub enum GlobalShortcutKind",
  "pub fn unregister_focus_toggle",
  "pub fn unregister_find_timer",
  "pub fn set_native_enabled",
  "fn unregister_focus_shortcut<Resource>",
  "rollback default registration",
  "rollback default unregistration",
]) {
  invariant(shortcuts.includes(needle), "native symmetric toggle authority is missing " + needle);
}
for (const pref of [
  "preferences.go_to_narro_enabled",
  "preferences.toggle_focus_mode_enabled",
  "preferences.find_focus_timer_enabled",
]) {
  invariant(shortcuts.includes(pref), "startup must honor " + pref);
}
invariant(
  lib.includes("shortcut_settings::load_from_connection")
    && lib.includes("shortcuts::install(app, &shortcut_preferences)")
    && lib.indexOf("shortcut_settings::load_from_connection") < lib.indexOf("shortcuts::install(app, &shortcut_preferences)"),
  "startup must load persisted shortcut intent before native registration",
);

for (const needle of [
  'CommandError::new("SHORTCUT_PREFERENCE_FAILED"',
  "static SHORTCUT_SETTINGS_GATE: Mutex<()>",
  "previous_registered != enabled",
  "mutate_preferences(&mut connection",
  "set_enabled(&mut payload.shortcuts, kind, enabled)",
  "get_global_shortcut_settings",
  "set_global_shortcut_enabled",
]) {
  invariant(shortcutSettings.includes(needle), "persisted/native coherence boundary is missing " + needle);
}

invariant(
  /set_native_enabled\([\s\S]*?kind,\s*previous_registered,/.test(shortcutSettings),
  "persistence failure must restore the previous native registration state",
);
invariant(
  lib.includes("shortcut_settings::get_global_shortcut_settings")
    && lib.includes("shortcut_settings::set_global_shortcut_enabled"),
  "shortcut settings commands must be registered",
);

for (const needle of [
  '"goToNarro"',
  '"toggleFocusMode"',
  '"findFocusTimer"',
  '"get_global_shortcut_settings"',
  '"set_global_shortcut_enabled"',
]) {
  invariant(api.includes(needle), "renderer API is missing " + needle);
}

for (const label of ["Go to Narro", "Alternate Focus Mode", "Find focus timer"]) {
  invariant(panel.includes(label), "product shortcut label is missing " + label);
}
for (const chord of ["Ctrl + Shift + B", "Ctrl + Shift + T", "Ctrl + Shift + P"]) {
  invariant(panel.includes(chord), "product shortcut chord is missing " + chord);
}
for (const behavior of [
  'type="checkbox"',
  "Loading…",
  "Saving…",
  "Shortcut conflict",
  "Unavailable",
  "Retry",
  'listen<ShortcutDiagnostics>("shortcut-diagnostic-changed"',
  "await refresh()",
]) {
  invariant(panel.includes(behavior), "shortcut loading/error/retry behavior is missing " + behavior);
}
invariant(
  settings.includes("<WindowsShortcutSettingsPanel />"),
  "Windows shortcuts must be exposed through the existing product Settings route",
);
invariant(
  panel.includes("export function WindowsShortcutSettingsPanelView")
    && fixture.includes("<WindowsShortcutSettingsPanelView")
    && fixture.includes("SHORTCUT_CONFLICT"),
  "Windows shortcut Settings need a deterministic production-view conflict fixture",
);
invariant(
  capture.includes("shortcut-conflict")
    && validator.includes("theme-settings-shortcut-conflict")
    && validator.includes("Shortcut conflict")
    && validator.includes("Retry"),
  "Windows visual regression must capture and validate shortcut conflict/retry state",
);
invariant(
  css.includes("@media (max-width: 720px)")
    && css.includes("@media (prefers-reduced-motion: reduce)")
    && css.includes(":focus-visible"),
  "shortcut settings must cover adaptive, reduced-motion, and keyboard focus states",
);

invariant(
  pkg.scripts["test:ui-global-shortcut-settings"] === "node scripts/test-ui-global-shortcut-settings.mjs",
  "package shortcut-settings test registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-global-shortcut-settings"),
  "frontend preflight must run global shortcut settings contracts",
);

console.log("Global shortcut preference, rollback, startup, and product UI contracts passed.");
