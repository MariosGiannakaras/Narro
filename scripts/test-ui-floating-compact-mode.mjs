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
const actions = read("src/FocusLiveActions.tsx");
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
  lib.includes("FocusSurfaceMode::Timer => (340.0, 110.0, true, true)"),
  "compact mode must retain the current validated collapsed geometry/top/taskbar foundation",
);
const diagnosticTimer = functionSlice(
  lib,
  "fn focus_surface_mode_timer(app_handle: tauri::AppHandle) -> CommandResult<()>",
  "#[tauri::command]\nfn list_windows",
);
invariant(
  diagnosticTimer.includes("present_floating_timer(app_handle)"),
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
const requestMode = functionSlice(
  focusEntry,
  "function requestMode(targetMode: FocusSurfaceMode)",
  "async function commitPendingModeTransition()",
);
const commitMode = functionSlice(
  focusEntry,
  "async function commitPendingModeTransition()",
  "function enterCompactMode()",
);
invariant(
  requestMode.includes("setPendingMode(targetMode)")
    && !requestMode.includes("presentFloatingTimer")
    && !requestMode.includes("presentFocusPanel"),
  "renderer mode request must begin presentation exit without invoking native geometry immediately",
);
invariant(
  commitMode.indexOf('await presentFloatingTimer();') < commitMode.indexOf("setMode(targetMode);")
    && commitMode.indexOf('await presentFocusPanel();') < commitMode.indexOf("setMode(targetMode);"),
  "renderer must publish compact/panel UI only after the corresponding native transition succeeds",
);
invariant(
  focusEntry.includes('requestMode("timer")')
    && focusEntry.includes('requestMode("panel")'),
  "explicit compact/return callbacks must delegate to the shared transition request path",
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
  foundation.includes("onReturnToPanel={onReturnToPanel}")
    && actions.includes('action="return-to-panel"')
    && actions.includes('label="Return to Focus Panel"'),
  "expanded compact shell must provide an accessible reversible return path",
);
invariant(
  foundation.includes('data-floating-fallback-action="return-to-panel"')
    && foundation.includes('aria-label="Return to Focus Panel"'),
  "a missing/finished live task must retain an explicit return-to-panel escape path",
);
invariant(
  !/animation\s*:\s*[^;]*infinite/.test(foundationCss)
    && (foundationCss.match(/@keyframes/g) ?? []).length === 1
    && foundationCss.includes("animation: floating-timer-attention 720ms ease-out 1;")
    && foundationCss.includes("@media (prefers-reduced-motion: reduce)"),
  "the only decorative Floating Timer motion must be the finite Find Timer pulse with a reduced-motion path",
);

invariant(
  pkg.scripts["test:ui-floating-compact-mode"] === "node scripts/test-ui-floating-compact-mode.mjs",
  "package script registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-floating-compact-mode"),
  "frontend preflight must run the compact-mode foundation contract",
);

console.log("Floating Timer same-window compact-mode foundation contracts passed.");
