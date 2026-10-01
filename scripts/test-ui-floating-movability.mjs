import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const invariant = (condition, message) => {
  if (!condition) throw new Error(`Floating Timer movability contract failed: ${message}`);
};

const tauriConfig = JSON.parse(read("src-tauri/tauri.conf.json"));
const defaultCapability = JSON.parse(read("src-tauri/capabilities/default.json"));
const focusCapability = JSON.parse(read("src-tauri/capabilities/focus-surface.json"));
const lib = read("src-tauri/src/lib.rs");
const placement = read("src-tauri/src/floating_placement.rs");
const foundation = read("src/FloatingTimerFoundation.tsx");
const actions = read("src/FocusLiveActions.tsx");
const foundationCss = read("src/floatingTimerFoundation.css");
const modeApi = read("src/focusSurfaceModeApi.ts");
const pkg = JSON.parse(read("package.json"));

const focusWindow = tauriConfig.app.windows.find((window) => window.label === "focusSurface");
invariant(focusWindow, "focusSurface Tauri window config is missing");
invariant(
  focusWindow.url === "focus.html"
    && focusWindow.width === 340
    && focusWindow.height === 700
    && focusWindow.decorations === false
    && focusWindow.transparent === true,
  "single Focus host must remain the frameless transparent 340x700 surface",
);
invariant(!tauriConfig.app.windows.some((window) => window.label === "floatingTimer"), "movable Timer must not create a second window");

invariant(
  !defaultCapability.permissions.includes("core:window:allow-start-dragging"),
  "native drag permission must not be broadened to every default-capability window",
);
invariant(
  focusCapability.windows.length === 1
    && focusCapability.windows[0] === "focusSurface"
    && focusCapability.permissions.includes("core:window:allow-start-dragging"),
  "native drag capability must target only the persistent Focus host",
);

invariant(
  lib.includes('const FOCUS_SURFACE_LABEL: &str = "focusSurface"')
    && placement.includes('const FOCUS_SURFACE_LABEL: &str = "focusSurface"')
    && !lib.includes('const FLOATING_TIMER_LABEL')
    && !placement.includes('const FLOATING_TIMER_LABEL'),
  "native Timer placement must target only focusSurface",
);
for (const needle of [
  "save_if_timer_visible",
  "restore_for_timer",
  "safe_position_for_timer_region",
  "note_timer_moved",
  "suspend_saves",
]) {
  invariant(placement.includes(needle), `placement layer is missing ${needle}`);
}
invariant(
  lib.includes("set_always_on_top(timer)") && lib.includes("set_skip_taskbar(timer)"),
  "topmost/taskbar state must be presentation attributes, not static second-window config",
);

const dragRegionMatches = foundation.match(/data-tauri-drag-region="true"/g) ?? [];
invariant(dragRegionMatches.length >= 3, "compact surface must expose native drag regions across non-interactive content");
const returnButtonStart = actions.indexOf('action="return-to-panel"');
invariant(returnButtonStart >= 0, "return-to-panel button marker is missing");
const returnButtonEnd = actions.indexOf("/>", returnButtonStart);
invariant(!actions.slice(returnButtonStart, returnButtonEnd).includes("data-tauri-drag-region"), "interactive return control must not become a drag region");

for (const forbidden of ["@tauri-apps/api/window", "startDragging", "pointermove", "mousemove", "touchmove", "setPosition"]) {
  invariant(!foundation.includes(forbidden) && !modeApi.includes(forbidden), `renderer must not own placement through ${forbidden}`);
}
invariant(
  foundationCss.includes('[data-tauri-drag-region="true"]')
    && foundationCss.includes("cursor: grab")
    && foundationCss.includes("user-select: none"),
  "native drag regions need an explicit non-selecting affordance",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-floating-movability"),
  "frontend preflight must retain Floating Timer movability coverage",
);

console.log("Floating Timer single-host movability/topmost/taskbar contracts passed.");
