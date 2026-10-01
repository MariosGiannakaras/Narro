import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const invariant = (condition, message) => {
  if (!condition) throw new Error(`Floating compact-mode contract failed: ${message}`);
};

const config = JSON.parse(read("src-tauri/tauri.conf.json"));
const lib = read("src-tauri/src/lib.rs");
const region = read("src-tauri/src/timer_region.rs");
const modeApi = read("src/focusSurfaceModeApi.ts");
const coordinator = read("src/FocusSurfaceCoordinator.tsx");
const panel = read("src/FocusPanel.tsx");
const foundation = read("src/FloatingTimerFoundation.tsx");
const actions = read("src/FocusLiveActions.tsx");
const css = read("src/floatingTimerFoundation.css");
const pkg = JSON.parse(read("package.json"));

const windows = new Map(config.app.windows.map((window) => [window.label, window]));
invariant(windows.size === 2, "runtime must contain only Main and one persistent Focus WebView");
const focus = windows.get("focusSurface");
invariant(focus?.url === "focus.html" && focus?.visible === false, "focusSurface must own the single Focus entry and start hidden");
invariant(focus?.width === 340 && focus?.height === 700, "focusSurface host must remain fixed at 340x700 logical px");
invariant(focus?.alwaysOnTop === false, "Panel is the startup presentation and must not start topmost");
invariant(!windows.has("floatingTimer"), "compact Timer must not use a separate runtime WebView");

invariant(
  region.includes("TIMER_COMPACT_HEIGHT_LOGICAL: f64 = 110.0")
    && region.includes("SetWindowRgn"),
  "compact Timer must use a DPI-aware 340x110 native region on the persistent host",
);
invariant(
  lib.includes("FocusSurfacePresentation::TimerCompact")
    && lib.includes("set_focus_presentation_attributes")
    && lib.includes("set_always_on_top(timer)")
    && lib.includes("set_skip_taskbar(timer)"),
  "Timer topmost/taskbar semantics must be dynamic attributes of focusSurface",
);
invariant(
  modeApi.includes('"timerCompact"')
    && modeApi.includes('invoke<void>("focus_surface_apply_presentation", { presentation })'),
  "renderer compact mode must use the single native presentation boundary",
);
for (const forbidden of ["timer_start_task", "timer_pause", "timer_resume", "timer_complete_task", "timer_switch_task"]) {
  invariant(!modeApi.includes(forbidden), `presentation API must not become timer/session authority via ${forbidden}`);
}

invariant(
  coordinator.includes("<FloatingTimerFoundation")
    && coordinator.includes('targetPresentation = modePresentation(targetMode)')
    && coordinator.includes('return mode === "panel" ? "panel" : "timerCompact"'),
  "Panel -> Timer must enter compact mode inside the one coordinator",
);
invariant(
  panel.includes('data-focus-compact-control="true"')
    && panel.includes("disabled={!onRequestCompact || compactTransitionPending}")
    && panel.includes("onClick={onRequestCompact}"),
  "Panel compact control must remain explicit and transition-busy-safe",
);
invariant(
  foundation.includes('data-floating-timer="foundation"')
    && foundation.includes('data-floating-task-title="true"')
    && foundation.includes('data-floating-live-timer="true"'),
  "compact Timer hierarchy markers are missing",
);
invariant(
  foundation.includes("data-timed-alert-flash-task-id={liveTaskId ?? undefined}"),
  "Floating Timer must preserve the validated PREF-R02 authoritative task-id flash target",
);
invariant(
  foundation.includes("onReturnToPanel={onReturnToPanel}")
    && actions.includes('action="return-to-panel"')
    && foundation.includes('aria-label="Return to Focus Panel"'),
  "Timer return path must remain accessible even when no live task exists",
);
invariant(
  !/animation\s*:\s*[^;]*infinite/.test(css)
    && css.includes("@media (prefers-reduced-motion: reduce)"),
  "compact Timer motion must be finite and reduced-motion aware",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-floating-compact-mode"),
  "frontend preflight must retain compact Timer coverage",
);

console.log("Floating Timer single-host compact-mode contracts passed.");
