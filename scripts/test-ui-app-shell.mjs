import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const shell = read("src/AppShell.tsx");
const preferencesDialog = read("src/PreferencesDialog.tsx");
const preferencesCss = read("src/preferencesDialog.css");
const reportsWorkspace = read("src/ReportsWorkspace.tsx");
const css = read("src/appShell.css");
const app = read("src/App.tsx");
const lightLogo = read("assets/branding/narro-logo-horizontal-light.svg");
const darkLogo = read("assets/branding/narro-logo-horizontal-dark.svg");
const symbol = read("assets/branding/narro-symbol.svg");
for (const [asset, label] of [[lightLogo, "light"], [darkLogo, "dark"], [symbol, "symbol"]]) {
  if (!asset.startsWith("<svg") || !asset.includes("<path")) {
    throw new Error("Sidebar brand must use a standalone canonical vector: " + label);
  }
}
if (shell.includes('app-shell__brand-mark" aria-hidden="true">N</span>')) {
  throw new Error("The obsolete N lettermark must not reappear in the production sidebar.");
}


for (const [haystack, needle, label] of [
  [shell, 'data-app-shell="main"', "shell identity"],
  [shell, 'import narroLogoLight from "../assets/branding/narro-logo-horizontal-light.svg";', "canonical light logo import"],
  [shell, 'import narroLogoDark from "../assets/branding/narro-logo-horizontal-dark.svg";', "canonical dark logo import"],
  [shell, 'import narroSymbol from "../assets/branding/narro-symbol.svg";', "canonical narrow symbol import"],
  [shell, 'src={narroLogoLight} alt="" aria-hidden="true"', "light brand asset"],
  [shell, 'src={narroLogoDark} alt="" aria-hidden="true"', "dark brand asset"],
  [shell, 'src={narroSymbol} alt="" aria-hidden="true"', "small screen symbol"],
  [shell, 'className="app-shell__brand" role="img" aria-label="Narro"', "one accessible brand identity"],
  [css, '.app-shell__brand-logo--dark', "light/dark responsive branding"],
  [css, ':root[data-theme="dark"] .app-shell__brand-logo--light', "explicit dark-theme logo choice"],
  [css, ':root[data-theme="system"] .app-shell__brand-logo--dark', "system theme choice"],
  [css, ':root .app-shell__brand .app-shell__brand-logo', "narrow brand sizing"],
  [css, '.app-shell__brand-symbol', "mobile standalone brand mark"],
  [shell, 'aria-label="List navigation"', "list navigation landmark"],
  [shell, 'aria-label="Primary"', "primary navigation landmark"],
  [shell, 'aria-label="Utilities"', "utility action group"],
  [shell, 'label="+ Create new list"', "create-list entry"],
  [shell, 'label="All my lists"', "all-lists entry"],
  [shell, 'label="Archived lists"', "archive entry"],
  [shell, 'label="Home"', "Home primary destination"],
  [shell, 'label="Reports"', "Reports primary destination"],
  [shell, '<ReportsWorkspace onBack={() => setActiveDestination("home")} />', "production Reports workspace destination"],
  [reportsWorkspace, "<ReportsOverview", "Overview workspace tab"],
  [reportsWorkspace, "<ReportsSessions", "Sessions workspace tab"],
  [shell, 'label="Search"', "Search utility destination"],
  [shell, 'label="Settings"', "Settings utility destination"],
  [shell, 'setPreferencesOpen(true)', "Settings opens over preserved destination"],
  [shell, 'setPreferencesOpen(false)', "Preferences may dismiss without changing Board"],
  [shell, '<PreferencesDialog onRequestClose={() => setPreferencesOpen(false)}>', "Settings uses overlay owner"],
  [shell, '<ThemeSettingsPanel onOpenShortcuts=', "production Preferences section preserved within overlay"],
  [preferencesDialog, 'role="dialog"', "modal semantic boundary"],
  [preferencesDialog, 'aria-modal="true"', "modal focus and shortcut ownership"],
  [preferencesDialog, 'aria-labelledby="theme-settings-title"', "modal labels visible Preferences heading"],
  [preferencesDialog, 'data-preferences-dialog="true"', "stable Preferences overlay identity"],
  [preferencesDialog, 'event.key === "Escape"', "Escape restores originating workspace"],
  [preferencesDialog, 'onRequestClose()', "close and outside click dismissal"],
  [preferencesDialog, 'button:not([disabled])', "nested Settings controls in Tab cycle"],
  [preferencesCss, '.preferences-dialog__backdrop', "dimmed preserved Board/Home backdrop"],
  [preferencesCss, '.preferences-dialog__scroll', "bounded internal Preferences scroll"],
  [shell, 'aria-current={active ? "page" : undefined}', "active-page semantics"],
  [css, "grid-template-columns: 13rem minmax(0, 1fr);", "stable sidebar geometry"],
  [css, "grid-template-rows: 4rem minmax(0, 1fr) 3.5rem;", "stable workspace geometry"],
  [css, '.app-shell__nav-button[aria-current="page"]', "active navigation state"],
  [css, "@media (prefers-reduced-motion: reduce)", "reduced-motion shell behavior"],
  [app, 'get("diagnostics") === "1"', "explicit diagnostic-mode gate"],
  [app, "if (diagnosticMode) {", "diagnostic-only startup probes"],
  [app, 'invoke<DiagnosticStoragePaths>("diagnostic_storage_paths"', "resolved diagnostic storage path probe"],
  [app, "Expected isolated Tauri identifier: com.mariosg.Narro.M1Diagnostic", "diagnostic identity disclosure"],
  [app, "Storage isolation (native identifier + resolved paths)", "diagnostic path-verification disclosure"],
  [app, "diagnosticStoragePaths?.isolationPass === true", "native diagnostic identifier/path isolation verdict"],
  [app, '? "PASS"', "diagnostic storage isolation verdict"],
  [app, 'invoke<FocusPanelPlacementProbe>("focus_panel_placement_probe"', "native Focus Panel placement probe"],
  [app, "Available monitors: {monitors.length}", "diagnostic monitor count"],
  [app, 'Placement probe: <strong>{placementProbe.pass ? "PASS" : "FAIL"}</strong>', "diagnostic placement verdict"],
  [app, "Run all monitor Left/Right probes", "one-click placement matrix action"],
  [app, "data-m1-placement-matrix-step", "current placement matrix step evidence"],
  [app, "data-m1-placement-matrix-result", "placement matrix evidence payload"],
  [app, 'Placement matrix: <strong>{placementMatrix.pass ? "PASS" : "FAIL"}</strong>', "placement matrix verdict"],
  [app, "<AppShell>", "product shell as default main surface"],
]) {
  requireText(haystack, needle, label);
}

if (/Narro Diagnostic - Main Window/.test(app)) {
  throw new Error("The default main product surface must not retain the old diagnostic heading.");
}

const matrixStart = app.indexOf("async function runFocusPanelPlacementMatrix()");
const matrixEnd = app.indexOf("function handleMonitorSelection", matrixStart);
if (matrixStart < 0 || matrixEnd < 0 || matrixEnd <= matrixStart) {
  throw new Error("Could not isolate the Focus Panel placement matrix diagnostic flow.");
}
const matrixFlow = app.slice(matrixStart, matrixEnd);
for (const [needle, label] of [
  ['await invoke<void>("focus_surface_mode_panel")', "matrix forces Panel presentation"],
  ['await invoke<void>("focus_surface_show")', "matrix makes the Focus surface visible"],
  ["for (const monitor of discovered)", "matrix covers every enumerated monitor"],
  ['for (const side of ["left", "right"] as const)', "matrix covers both work-area edges"],
  ['await invoke<void>("position_focus_panel"', "matrix uses authoritative native placement"],
  ["window.setTimeout(resolve, 750)", "matrix keeps each native placement visibly settled for physical observation"],
  ['await invoke<FocusPanelPlacementProbe>("focus_panel_placement_probe"', "matrix verifies native expected-vs-actual placement"],
  ["passCount === entries.length", "matrix requires every probe to pass"],
]) {
  requireText(matrixFlow, needle, label);
}

console.log("App shell/navigation contract checks passed.");
