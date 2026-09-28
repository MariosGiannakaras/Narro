import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const invariant = (condition, message) => {
  if (!condition) throw new Error(`Floating compact-mode contract failed: ${message}`);
};
const slice = (source, begin, end) => {
  const start = source.indexOf(begin);
  invariant(start >= 0, `${begin} is missing`);
  const stop = source.indexOf(end, start + begin.length);
  return source.slice(start, stop < 0 ? undefined : stop);
};

const config = JSON.parse(read("src-tauri/tauri.conf.json"));
const lib = read("src-tauri/src/lib.rs");
const modeApi = read("src/focusSurfaceModeApi.ts");
const panelRoot = read("src/focusPanelWindow.tsx");
const timerRoot = read("src/floatingTimerWindow.tsx");
const panel = read("src/FocusPanel.tsx");
const foundation = read("src/FloatingTimerFoundation.tsx");
const actions = read("src/FocusLiveActions.tsx");
const css = read("src/floatingTimerFoundation.css");
const pkg = JSON.parse(read("package.json"));

const windows = new Map(config.app.windows.map((window) => [window.label, window]));
invariant(windows.size === 3, "Panel and Timer need separate persistent WebViews beside Main");
invariant(windows.get("focusSurface")?.url === "focus.html", "Panel must keep its own entry");
invariant(windows.get("floatingTimer")?.url === "timer.html", "Timer must load its own entry");
invariant(windows.get("floatingTimer")?.visible === false, "Timer must start hidden until its renderer is ready");
invariant(windows.get("floatingTimer")?.width === 340 && windows.get("floatingTimer")?.height === 300,
  "Timer host must start at expanded geometry and clip compact content without a resize");

invariant(lib.includes("fn focus_surface_mode_snapshot() -> Option<&'static str>"), "native mode snapshot is missing");
invariant(lib.includes('Some(FocusSurfaceMode::Panel) => Some("panel")')
  && lib.includes('Some(FocusSurfaceMode::Timer) => Some("timer")'), "native mode snapshot must be limited to Panel/Timer");
const prepareTimer = slice(lib, "fn prepare_floating_timer(", "#[tauri::command]\nfn reveal_floating_timer");
const revealTimer = slice(lib, "fn reveal_floating_timer(", "#[tauri::command]\nfn present_floating_timer");
const revealPanel = slice(lib, "fn reveal_focus_panel(", "#[tauri::command]\nfn present_focus_panel");
invariant(prepareTimer.includes("FLOATING_TIMER_LABEL") && !prepareTimer.includes("FOCUS_SURFACE_LABEL"),
  "Timer preparation must target only the separate Timer HWND");
invariant(prepareTimer.includes("timer_region::apply"), "Timer must be clipped before it becomes visible");
invariant(revealTimer.includes(".show()") && revealTimer.indexOf(".show()") < revealTimer.search(/panel\s*\.hide\(\)/),
  "Timer must become visible before Panel is hidden");
invariant(revealPanel.includes("FLOATING_TIMER_LABEL")
  && revealPanel.indexOf(".show()") < revealPanel.search(/timer\s*\.hide\(\)/),
  "Panel must become visible before Timer is hidden");
invariant(!revealTimer.includes("focus_visual_hold") && !revealPanel.includes("focus_visual_hold"),
  "separate-window reveals must not use the failed bitmap-hold path");

invariant(modeApi.includes('invoke<FocusSurfaceMode | null>("focus_surface_mode_snapshot")'),
  "renderer must reconcile native presentation state");
for (const command of ["prepare_floating_timer", "reveal_floating_timer", "prepare_focus_panel", "reveal_focus_panel"]) {
  invariant(modeApi.includes(`"${command}"`), `renderer bridge is missing ${command}`);
}
for (const forbidden of ["timer_start_task", "timer_pause", "timer_resume", "timer_complete_task", "timer_switch_task"]) {
  invariant(!modeApi.includes(forbidden), `mode bridge must not become timer/session authority via ${forbidden}`);
}

invariant(panelRoot.includes("<FocusPanel") && panelRoot.includes('requestMode("timer")'),
  "Panel must have an explicit transition into compact Timer mode");
invariant(timerRoot.includes("<FloatingTimerFoundation") && timerRoot.includes("onReturnToPanel"),
  "Timer must have an explicit return path to Panel");
invariant(panel.includes('data-focus-compact-control="true"')
  && panel.includes("disabled={!onRequestCompact || compactTransitionPending}")
  && panel.includes("onClick={onRequestCompact}"), "Panel compact control must be actionable and busy-safe");
invariant(foundation.includes('data-floating-timer="foundation"')
  && foundation.includes('data-floating-task-title="true"')
  && foundation.includes('data-floating-live-timer="true"'), "Timer compact hierarchy is missing");
invariant(foundation.includes("onReturnToPanel={onReturnToPanel}")
  && actions.includes('action="return-to-panel"')
  && foundation.includes('aria-label="Return to Focus Panel"'), "Timer return must remain accessible even without a live task");
invariant(!/animation\s*:\s*[^;]*infinite/.test(css) && css.includes("@media (prefers-reduced-motion: reduce)"),
  "compact Timer must have only finite motion with reduced-motion support");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:ui-floating-compact-mode"),
  "frontend preflight must retain the compact Timer contract");

console.log("Floating Timer separate-window compact-mode contracts passed.");
