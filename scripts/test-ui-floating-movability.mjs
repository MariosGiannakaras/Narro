import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Floating Timer movability contract failed: ${message}`);
}

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

const timerWindow = tauriConfig.app.windows.find((window) => window.label === "floatingTimer");
invariant(timerWindow, "separate floatingTimer Tauri window config is missing");
invariant(timerWindow.url === "timer.html" && timerWindow.visible === false, "Timer must load its own entry while initially hidden");
invariant(timerWindow.decorations === false && timerWindow.transparent === true, "Timer must remain a frameless transparent surface");
invariant(timerWindow.alwaysOnTop === true && timerWindow.skipTaskbar === true, "Timer must remain topmost and absent from the taskbar");

invariant(defaultCapability.windows.includes("floatingTimer"), "Timer must retain the default core capability");
invariant(
  !defaultCapability.permissions.includes("core:window:allow-start-dragging"),
  "native drag permission must not be broadened to every default-capability window",
);
invariant(
  focusCapability.windows.length === 2
    && focusCapability.windows.includes("focusSurface")
    && focusCapability.windows.includes("floatingTimer"),
  "native drag capability must cover only Panel and Timer windows",
);
invariant(
  focusCapability.permissions.includes("core:window:allow-start-dragging"),
  "Panel/Timer native start-dragging permission is missing",
);

invariant(
  lib.includes('const FLOATING_TIMER_LABEL: &str = "floatingTimer"')
    && placement.includes('const FLOATING_TIMER_LABEL: &str = "floatingTimer"'),
  "native Timer placement must target the separate Timer window",
);

const dragRegionMatches = foundation.match(/data-tauri-drag-region="true"/g) ?? [];
invariant(dragRegionMatches.length >= 3, "compact surface must expose native drag regions across non-interactive content");
const returnButtonStart = actions.indexOf('action="return-to-panel"');
invariant(returnButtonStart >= 0, "return-to-panel button marker is missing");
const returnButtonEnd = actions.indexOf("/>", returnButtonStart);
const returnButtonSlice = actions.slice(returnButtonStart, returnButtonEnd);
invariant(!returnButtonSlice.includes("data-tauri-drag-region"), "interactive return control must not become a drag region");

for (const forbidden of ["@tauri-apps/api/window", "startDragging", "pointermove", "mousemove", "touchmove", "setPosition"]) {
  invariant(
    !foundation.includes(forbidden) && !modeApi.includes(forbidden),
    `renderer must not own window position through ${forbidden}`,
  );
}

invariant(
  foundationCss.includes('[data-tauri-drag-region="true"]')
    && foundationCss.includes("cursor: grab")
    && foundationCss.includes("user-select: none"),
  "native drag regions need an explicit non-selecting drag affordance",
);
invariant(
  foundationCss.includes(".floating-timer-foundation__action") && foundationCss.includes("cursor: pointer"),
  "interactive expanded controls must remain visually distinct from drag regions",
);

invariant(
  pkg.scripts["test:ui-floating-movability"] === "node scripts/test-ui-floating-movability.mjs",
  "package script registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-floating-movability"),
  "frontend preflight must run the Floating Timer movability contract",
);

console.log("Floating Timer native movability/topmost/taskbar contracts passed.");
