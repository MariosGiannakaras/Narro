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
  [rust, "mutate_preferences(&mut connection, now", "atomic preference persistence"],
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
  [shell, '<ThemeSettingsPanel onOpenShortcuts=', "production Settings destination"],
  [fixture, 'dataset.themeSettingsFixtureReady = "true"', "fixture readiness marker"],
  [fixture, 'shortcutsDialog ? (', "separate Windows Shortcuts modal fixture"],
  [fixture, 'settingsContent={(', "modal must render shared real shortcut rows with a fixture snapshot"],
  [capture, 'shortcutsDialog=1', "dedicated modal Windows capture routing"],
  [validator, 'data-windows-shortcuts-dialog="true"', "dedicated dialog must be validated independently of Preferences"],
  [validator, 'assertRenderedScreenshot', "pixel content check must reject blank Preferences/shortcut captures"],
  [validator, 'assertShortcutLabelsHidden', "shortcut accessible labels must not overlap rendered controls"],
  [fixture, 'dataset.themeSettingsShortcutLabelsHidden', "fixture must measure accessible-only label bounds"],
  [fixture, 'surface.style.transform', "section fixture must move visible DOM into viewport instead of scrolling past screenshot"],
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

invariant(panel.includes("beforeGeneral"), "ThemeSettingsPanelView must expose the pre-General Preferences slot");
invariant(panel.includes("generalChildren"), "ThemeSettingsPanelView must expose additional General preference rows");

for (const needle of [
  'data-theme-settings-fixture-ready="true"',
  "$maxAttempts = 4",
  "captured before it reported ready; retrying capture",
  "did not report ready after $maxAttempts captures",
]) {
  invariant(capture.includes(needle), `theme-settings capture readiness retry is missing ${needle}`);
}

invariant(!focus.includes('background: "#222"'), "focus surface must not hard-code a dark background");
invariant(!focus.includes('color: "red"'), "focus error state must consume semantic theme tokens");

// SS-C07: decorative information markers are visible on selected source-backed
// General/Blitz Panel rows without inventing tooltip, button or persistence actions.
const preferenceSections = await read("src/PreferenceSettingsSections.tsx");
const preferenceCss = await read("src/preferenceSettingsSections.css");
for (const snippet of [
  'infoGlyph?: boolean;',
  'className="preference-settings__info-glyph" aria-hidden="true"',
  '<Row infoGlyph title="Panel side"',
  '<Row infoGlyph title="Timezone"',
  '<Row infoGlyph title="Auto-parse EST from title"',
]) {
  invariant(preferenceSections.includes(snippet), `SS-C07 information-marker contract missing ${snippet}`);
}
// SS-C07 is an inventory, not a blanket marker rule: the Monitor and Hide
// EST rows are plain labels. Preserve exact positive AND negative evidence.
function rowHasInfoGlyph(title) {
  const markup = preferenceSections.match(new RegExp('<Row\\b[^>]*\\btitle="' + title + '"[^>]*>', "s"))?.[0];
  invariant(Boolean(markup), "SS-C07 row missing: " + title);
  return /\binfoGlyph\b/.test(markup);
}
for (const [title, expected] of [
  ["Panel side", true],
  ["Auto-parse EST from title", true],
  ["Timezone", true],
  ["Monitor", false],
  ["Hide EST / Time Taken", false],
]) {
  invariant(rowHasInfoGlyph(title) === expected,
    "SS-C07 marker inventory diverges for " + title);
}
invariant(panel.includes("data-preferences-time-section")
    && preferenceSections.includes("export function TimePreferenceRows("),
  "SS-C07 Time remains a separate visible section without changing the timezone selector");
invariant(preferenceCss.includes(".preference-settings__copy .preference-settings__info-glyph")
  && preferenceCss.includes("border-radius: 50%")
  && preferenceCss.includes("margin-inline-end: var(--space-2)"),
  "information marker must use the calibrated inline visual token treatment");
invariant(!preferenceSections.includes('aria-label="More information"')
  && !preferenceSections.includes('data-preference-info-trigger'),
  "SS-C07 does not establish a tooltip or clickable information action");

// B34 current Blitzit Preferences: one scroll surface, separated groups, no
// elevated sub-cards or decorative all-caps captions. Controls remain intact.
const sectionCss = await read("src/themeSettingsPanel.css");
const sectionRowsCss = await read("src/preferenceSettingsSections.css");
function styleBlock(styles, selector) {
  const offset = styles.indexOf(selector + " {");
  invariant(offset >= 0, `Missing style rule ${selector}`);
  const end = styles.indexOf("}", offset);
  invariant(end > offset, `Unterminated style rule ${selector}`);
  return styles.slice(offset, end);
}
const flatSection = styleBlock(sectionCss, ".theme-settings__section");
invariant(flatSection.includes("border-top: 1px solid var(--color-border-subtle)"), "Preferences groups need a shared source-like separator");
for (const value of ["border: 0;", "border-radius: 0;", "background: transparent;", "box-shadow: none;"]) {
  invariant(flatSection.includes(value), `Preferences sections must remain flat: ${value}`);
}
const groupHeading = styleBlock(sectionCss, ".theme-settings__section-heading");
invariant(!groupHeading.includes("border-bottom"), "Separators belong between sections, not under every heading");
const categoryCaption = sectionCss.slice(
  sectionCss.indexOf(".theme-settings__eyebrow,"),
  sectionCss.indexOf("}", sectionCss.indexOf(".theme-settings__eyebrow,")),
);
invariant(categoryCaption.includes("display: none;"), "Decorative category captions should not add rows");
const ordinaryRows = styleBlock(sectionRowsCss, ".preference-settings__row + .preference-settings__row");
invariant(!ordinaryRows.includes("border-top:"), "Preferences must not render per-row card dividers");
invariant(ordinaryRows.includes("padding-top: var(--space-3)"), "Preserve user-control spacing");
invariant(panel.includes('role="group" aria-label="Theme"'), "Theme segmented control must remain accessible");

await import("./test-ready-fixture-startup.mjs");
await import("./test-shortcut-fixture-readiness.mjs");
console.log("Theme settings/runtime contract: PASS");
