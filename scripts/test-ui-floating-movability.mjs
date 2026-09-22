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
const foundation = read("src/FloatingTimerFoundation.tsx");
const foundationCss = read("src/floatingTimerFoundation.css");
const modeApi = read("src/focusSurfaceModeApi.ts");
const pkg = JSON.parse(read("package.json"));

const focusWindow = tauriConfig.app.windows.find((window) => window.label === "focusSurface");
invariant(focusWindow, "focusSurface Tauri window config is missing");
invariant(focusWindow.decorations === false, "focusSurface must remain frameless for the compact surface");
invariant(focusWindow.alwaysOnTop === true, "focusSurface must retain the existing always-on-top foundation");

invariant(
  defaultCapability.windows.includes("focusSurface"),
  "focusSurface must retain the default core capability",
);
invariant(
  !defaultCapability.permissions.includes("core:window:allow-start-dragging"),
  "native drag permission must not be broadened to every default-capability window",
);
invariant(
  focusCapability.windows.length === 1 && focusCapability.windows[0] === "focusSurface",
  "native drag capability must be scoped only to focusSurface",
);
invariant(
  focusCapability.permissions.includes("core:window:allow-start-dragging"),
  "focusSurface native start-dragging permission is missing",
);

invariant(
  lib.includes("FocusSurfaceMode::Timer => (340.0, 110.0, true, true)"),
  "Timer mode must retain the validated always-on-top and skip-taskbar native properties",
);
invariant(
  lib.includes(".set_always_on_top(always_on_top)")
    && lib.includes(".set_skip_taskbar(skip_taskbar)"),
  "native focus-surface mode application must remain authority for topmost/taskbar state",
);

const dragRegionMatches = foundation.match(/data-tauri-drag-region="true"/g) ?? [];
invariant(
  dragRegionMatches.length >= 3,
  "compact surface must expose native drag regions across its non-interactive content",
);
const returnButtonStart = foundation.indexOf('data-floating-return-to-panel="true"');
invariant(returnButtonStart >= 0, "return-to-panel button marker is missing");
const returnButtonEnd = foundation.indexOf("</button>", returnButtonStart);
const returnButtonSlice = foundation.slice(returnButtonStart, returnButtonEnd);
invariant(
  !returnButtonSlice.includes("data-tauri-drag-region"),
  "interactive return-to-panel control must not become a window drag region",
);

for (const forbidden of [
  "@tauri-apps/api/window",
  "startDragging",
  "pointermove",
  "mousemove",
  "touchmove",
  "setPosition",
]) {
  invariant(
    !foundation.includes(forbidden) && !modeApi.includes(forbidden),
    `renderer must not own window geometry through ${forbidden}`,
  );
}

invariant(
  foundationCss.includes('[data-tauri-drag-region="true"]')
    && foundationCss.includes("cursor: grab")
    && foundationCss.includes("user-select: none"),
  "native drag regions need an explicit non-selecting drag affordance",
);
invariant(
  foundationCss.includes(".floating-timer-foundation__return")
    && foundationCss.includes("cursor: pointer"),
  "interactive return control must remain visually distinct from drag regions",
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
