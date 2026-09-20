import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Floating compact-mode contract failed: ${message}`);
}

function functionSlice(source, marker, nextMarker) {
  const start = source.indexOf(marker);
  invariant(start >= 0, `${marker} is missing`);
  const end = nextMarker ? source.indexOf(nextMarker, start + marker.length) : -1;
  return source.slice(start, end >= 0 ? end : source.length);
}

const lib = read("src-tauri/src/lib.rs");
const focusEntry = read("src/focus.tsx");
const modeApi = read("src/focusSurfaceModeApi.ts");
const panel = read("src/FocusPanel.tsx");
const foundation = read("src/FloatingTimerFoundation.tsx");
const foundationCss = read("src/floatingTimerFoundation.css");
const pkg = JSON.parse(read("package.json"));

invariant(
  lib.includes("fn focus_surface_mode_snapshot() -> Option<&'static str>"),
  "native read-only focus-surface mode snapshot is missing",
);
invariant(
  lib.includes('Some(FocusSurfaceMode::Panel) => Some("panel")')
    && lib.includes('Some(FocusSurfaceMode::Timer) => Some("timer")'),
  "native mode snapshot must project only panel/timer presentation state",
);
const presentFloating = functionSlice(
  lib,
  "fn present_floating_timer(app_handle: tauri::AppHandle) -> CommandResult<()>",
  "pub(crate) fn revalidate_open_focus_panel_after_display_change",
);
invariant(
  presentFloating.includes("get_window(&app_handle, FOCUS_SURFACE_LABEL)?"),
  "production compact transition must reuse the existing focusSurface window",
);
invariant(
  presentFloating.includes("configure_focus_surface_mode(&window, FocusSurfaceMode::Timer)"),
  "production compact transition must reuse the validated native Timer-mode configuration",
);
invariant(
  !presentFloating.includes("WebviewWindowBuilder"),
  "production compact transition must never create another webview",
);
invariant(
  lib.includes("FocusSurfaceMode::Timer => (300.0, 100.0, true, true)"),
  "item 1 must retain the M1-validated compact window geometry/top/taskbar foundation until later visual sizing work",
);
invariant(
  lib.includes("fn focus_surface_mode_timer(app_handle: tauri::AppHandle) -> CommandResult<()> {\n    present_floating_timer(app_handle)"),
  "M1 diagnostic Timer command must delegate to the production same-window compact transition",
);
for (const command of ["focus_surface_mode_snapshot", "present_floating_timer", "present_focus_panel"]) {
  invariant(lib.includes(command), `native command ${command} is missing`);
}

invariant(
  modeApi.includes('invoke<FocusSurfaceMode | null>("focus_surface_mode_snapshot")'),
  "renderer must reconcile native presentation mode on mount",
);
invariant(
  modeApi.includes('invoke<void>("present_floating_timer")'),
  "renderer compact transition must use the production native boundary",
);
invariant(
  modeApi.includes('invoke<void>("present_focus_panel")'),
  "return transition must use the production preference-aware panel presenter",
);
for (const forbidden of ["timer_start_task", "timer_pause", "timer_resume", "timer_complete_task", "timer_switch_task"]) {
  invariant(!modeApi.includes(forbidden), `mode API must not become timer/session authority via ${forbidden}`);
}

invariant(focusEntry.includes("function FocusSurfaceProduct()"), "product focus-surface root is missing");
invariant(focusEntry.includes("void getFocusSurfaceMode()"), "product root must reconcile native mode on mount");
const enterCompact = functionSlice(focusEntry, "async function enterCompactMode()", "async function returnToPanel()");
const returnPanel = functionSlice(focusEntry, "async function returnToPanel()", "if (mode === null)");
invariant(
  enterCompact.indexOf("await presentFloatingTimer();") < enterCompact.indexOf('setMode("timer");'),
  "renderer must not publish compact UI before the native transition succeeds",
);
invariant(
  returnPanel.indexOf("await presentFocusPanel();") < returnPanel.indexOf('setMode("panel");'),
  "renderer must not publish panel UI before native panel presentation succeeds",
);
invariant(
  focusEntry.includes('mode === "timer"') && focusEntry.includes("<FloatingTimerFoundation"),
  "native timer mode must project the compact product root",
);
invariant(
  focusEntry.includes("<FocusPanel") && focusEntry.includes("onRequestCompact={() => void enterCompactMode()}"),
  "panel must enter compact mode only through the explicit product callback",
);
invariant(
  focusEntry.includes("{diagnostics ? <FocusDiagnostics /> : <FocusSurfaceProduct />}"),
  "M1 diagnostics must remain explicitly gated while normal focusSurface uses the product mode root",
);

invariant(panel.includes('data-focus-compact-control="true"'), "Focus Panel compact control marker is missing");
invariant(
  panel.includes("disabled={!onRequestCompact || compactTransitionPending}"),
  "compact control must remain disabled in fixtures/unwired states and while a transition is pending",
);
invariant(panel.includes("onClick={onRequestCompact}"), "compact control must use its explicit callback");
invariant(
  !panel.includes('data-focus-placeholder-control="compact-view"'),
  "Compact view must no longer be an inactive M6 placeholder",
);
invariant(
  panel.includes('data-focus-placeholder-control="preferences"'),
  "unrelated Preferences placeholder must remain unchanged",
);

invariant(
  foundation.includes('data-floating-timer="foundation"'),
  "item-1 compact product shell marker is missing",
);
invariant(
  foundation.includes('data-floating-return-to-panel="true"')
    && foundation.includes('aria-label="Return to Focus Panel"'),
  "minimal compact shell must provide an accessible reversible return path",
);
for (const laterScope of [
  "timerSessionApi",
  "FocusLiveActions",
  "FocusLiveSubtasks",
  "TaskSubtasks",
  "subtask progress",
  "data-focus-action=",
]) {
  invariant(!foundation.includes(laterScope), `item 1 must not absorb later Floating Timer content via ${laterScope}`);
}
for (const forbidden of ["animation:", "transition:", "position: absolute", "@keyframes"]) {
  invariant(!foundationCss.includes(forbidden), `foundation compact mode must not introduce decorative motion/overlay behavior via ${forbidden}`);
}

invariant(
  pkg.scripts["test:ui-floating-compact-mode"] === "node scripts/test-ui-floating-compact-mode.mjs",
  "package script registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-floating-compact-mode"),
  "frontend preflight must run the compact-mode foundation contract",
);

console.log("Floating Timer same-window compact-mode foundation contracts passed.");
