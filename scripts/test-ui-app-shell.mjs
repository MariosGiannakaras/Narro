import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const shell = read("src/AppShell.tsx");
const css = read("src/appShell.css");
const app = read("src/App.tsx");

for (const [haystack, needle, label] of [
  [shell, 'data-app-shell="main"', "shell identity"],
  [shell, 'aria-label="List navigation"', "list navigation landmark"],
  [shell, 'aria-label="Primary"', "primary navigation landmark"],
  [shell, 'aria-label="Utilities"', "utility action group"],
  [shell, 'label="+ Create new list"', "create-list entry"],
  [shell, 'label="All my lists"', "all-lists entry"],
  [shell, 'label="Archived lists"', "archive entry"],
  [shell, 'label="Home"', "Home primary destination"],
  [shell, 'label="Reports"', "Reports primary destination"],
  [shell, 'label="Search"', "Search utility destination"],
  [shell, 'label="Settings"', "Settings utility destination"],
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
