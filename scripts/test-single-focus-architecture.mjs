import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const invariant = (condition, message) => {
  if (!condition) throw new Error(`Single-Focus architecture contract failed: ${message}`);
};

const config = JSON.parse(read("src-tauri/tauri.conf.json"));
const capability = JSON.parse(read("src-tauri/capabilities/default.json"));
const lib = read("src-tauri/src/lib.rs");
const region = read("src-tauri/src/timer_region.rs");
const placement = read("src-tauri/src/floating_placement.rs");
const topology = read("src-tauri/src/windows/topology.rs");
const shortcuts = read("src-tauri/src/shortcuts/mod.rs");
const focusEntry = read("src/focus.tsx");
const coordinator = read("src/FocusSurfaceCoordinator.tsx");
const coordinatorCss = read("src/focusSurfaceCoordinator.css");
const modeApi = read("src/focusSurfaceModeApi.ts");
const events = read("src/focusWindowEvents.ts");
const appShell = read("src/AppShell.tsx");
const verifyConfig = read("scripts/verify-config.mjs");
const ci = read(".github/workflows/ci.yml");

const windows = config.app.windows;
invariant(windows.length === 2, "runtime must define exactly two WebViews");
invariant(
  windows.map((window) => window.label).sort().join(",") === "focusSurface,main",
  "runtime WebViews must be main + focusSurface only",
);
const focus = windows.find((window) => window.label === "focusSurface");
invariant(
  focus.width === 340 && focus.height === 700 && focus.visible === false,
  "focusSurface must start as a hidden fixed 340x700 host",
);
invariant(
  [...capability.windows].sort().join(",") === "focusSurface,main",
  "capabilities must not resurrect a Timer window",
);

for (const source of [lib, placement, topology, shortcuts, appShell, modeApi, events]) {
  invariant(!source.includes('"floatingTimer"'), "production contracts must not contain a floatingTimer runtime label");
  invariant(!source.includes('"timer.html"'), "production contracts must not contain a timer.html runtime entry");
}
for (const path of [
  "timer.html",
  "src/timer.tsx",
  "src/focusPanelWindow.tsx",
  "src/floatingTimerWindow.tsx",
  "src/persistentFocusWindowTransition.ts",
  "src-tauri/src/focus_visual_hold.rs",
  "src-tauri/src/focus_window_dwm.rs",
]) {
  invariant(!existsSync(path), `superseded split/visual-hold file must stay retired: ${path}`);
}

invariant(
  focusEntry.includes("<FocusSurfaceCoordinator />"),
  "focus.html must mount one FocusSurfaceCoordinator",
);
invariant(
  coordinator.includes('type FocusSurfacePresentation')
    || modeApi.includes('type FocusSurfacePresentation = "panel" | "timerCompact" | "timerExpanded"'),
  "coordinator must use explicit Panel/compact/expanded presentation state",
);
invariant(
  coordinator.includes("connectLiveTimerSessionProjection(")
    && coordinator.includes("sharedTimerProjection={sharedTimerProjection}"),
  "one coordinator must own and share the continuous authoritative timer projection",
);
invariant(
  coordinator.includes("commitPreparedFocusPresentation({")
    && coordinator.includes("waitForTargetReady: () => waitForReady(targetMode)")
    && coordinator.includes("applyNativePresentation: applyFocusSurfacePresentation")
    && coordinator.includes("commitRendererPresentation: (next) =>"),
  "production coordinator must delegate prepaint -> native commit -> renderer ownership ordering to the tested transition helper",
);
invariant(
  coordinator.includes("inert={!panelActive}") && coordinator.includes("inert={!timerActive}"),
  "inactive/preparing presentations must be removed from interaction and accessibility navigation",
);
invariant(
  coordinatorCss.includes('data-focus-visibility="preparing"')
    && coordinatorCss.includes("z-index: 1")
    && coordinatorCss.includes("opacity: 1")
    && coordinatorCss.includes("pointer-events: none"),
  "incoming presentation must be fully prepainted underneath the committed view",
);

invariant(
  region.includes("FOCUS_HOST_WIDTH_LOGICAL: f64 = 340.0")
    && region.includes("FOCUS_HOST_HEIGHT_LOGICAL: f64 = 700.0")
    && region.includes("TIMER_COMPACT_HEIGHT_LOGICAL: f64 = 110.0")
    && region.includes("TIMER_EXPANDED_HEIGHT_LOGICAL: f64 = 300.0")
    && region.includes("SetWindowRgn"),
  "native region layer must implement the validated 340x700/110/300 geometry",
);
invariant(
  lib.includes("fn apply_focus_surface_presentation_internal(")
    && lib.includes("let _presentation_guard = presentation_guard()?")
    && lib.includes("restore_focus_native_snapshot")
    && lib.includes("FOCUS_PRESENTATION_RECOVERY_FAILED"),
  "native presentation changes must be serialized and rollback-safe",
);
invariant(
  lib.includes("static FOCUS_SURFACE_PRESENTATION_STATE: AtomicU8")
    && !lib.includes("FOCUS_SURFACE_MODE_STATE")
    && !lib.includes("static FLOATING_TIMER_EXPANDED"),
  "Panel/compact/expanded authority must be represented by one atomic native presentation state",
);
invariant(
  coordinator.includes("commitPreparedFocusPresentation({")
    && coordinator.includes("readinessWaitersRef.current[mode]")
    && coordinator.includes("getFocusSurfacePresentation()"),
  "renderer transitions must use tested commit recovery, per-mode readiness and authoritative event reconciliation",
);
invariant(
  coordinator.indexOf("listen<FocusPresentationChanged>(FOCUS_PRESENTATION_CHANGED_EVENT") >= 0
    && coordinator.indexOf("listen<FocusPresentationChanged>(FOCUS_PRESENTATION_CHANGED_EVENT")
      < coordinator.indexOf("const authoritative = await getFocusSurfacePresentation()"),
  "presentation projection must subscribe before its authoritative snapshot to avoid a listener/snapshot race",
);
invariant(
  coordinator.includes("presentationReconcileRevisionRef.current")
    && coordinator.includes("revision === presentationReconcileRevisionRef.current"),
  "out-of-order native presentation snapshots must not overwrite a newer renderer reconciliation",
);
invariant(
  lib.includes("floating_placement::save_if_timer_visible(app_handle)")
    && lib.indexOf("floating_placement::save_if_timer_visible(app_handle)") < lib.indexOf("let _save_guard = floating_placement::suspend_saves()"),
  "Timer placement must be saved before transition-time save suppression begins",
);
invariant(
  lib.includes("if previous == target && target != FocusSurfacePresentation::Panel")
    && lib.includes("if visible {")
    && lib.includes("floating_placement::restore_for_timer("),
  "visible same-Timer requests must preserve drag position while hidden Timer reshow restores placement against current topology",
);
invariant(
  !lib.includes("prepare_floating_timer")
    && !lib.includes("reveal_floating_timer")
    && !lib.includes("begin_focus_visual_hold")
    && !lib.includes("prewarm_focus_surface"),
  "old split-window/prewarm/bitmap transition commands must stay removed",
);
invariant(
  shortcuts.includes('const FOCUS_SURFACE_LABEL: &str = "focusSurface"')
    && !shortcuts.includes("FLOATING_TIMER_LABEL"),
  "global Focus shortcuts must resolve only focusSurface",
);
invariant(
  appShell.includes('emitTo("focusSurface", FOCUS_IN_APP_SHORTCUT_EVENT, shortcut)')
    && !appShell.includes('emitTo("floatingTimer"'),
  "Main in-app Focus actions must route to the single host",
);
invariant(
  topology.includes("const OBSERVED_WINDOW_LABELS: [&str; 1] = [FOCUS_SURFACE_LABEL]")
    && topology.includes("revalidate_open_timer_after_display_change"),
  "display recovery must observe and revalidate the one Focus HWND",
);
invariant(
  verifyConfig.includes("windows.length === 2")
    && !verifyConfig.includes("timer.html")
    && !ci.includes('"dist/timer.html"'),
  "repository config/CI contracts must enforce the two-entry production build",
);

console.log("Single-Focus architecture invariants passed.");
