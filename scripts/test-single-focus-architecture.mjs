import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const invariant = (condition, message) => {
  if (!condition) throw new Error(`Single-Focus architecture contract failed: ${message}`);
};

const config = JSON.parse(read("src-tauri/tauri.conf.json"));
const capability = JSON.parse(read("src-tauri/capabilities/default.json"));
const lib = read("src-tauri/src/lib.rs");
const focusWebview = read("src-tauri/src/focus_webview.rs");
const region = read("src-tauri/src/timer_region.rs");
const placement = read("src-tauri/src/floating_placement.rs");
const topology = read("src-tauri/src/windows/topology.rs");
const shortcuts = read("src-tauri/src/shortcuts/mod.rs");
const focusEntry = read("src/focus.tsx");
const coordinator = read("src/FocusSurfaceCoordinator.tsx");
const coordinatorCss = read("src/focusSurfaceCoordinator.css");
const completionSuccess = read("src/FocusCompletionSuccess.tsx");
const completionSuccessCss = read("src/focusCompletionSuccess.css");
const presentationTransition = read("src/focusPresentationTransition.ts");
const modeApi = read("src/focusSurfaceModeApi.ts");
const events = read("src/focusWindowEvents.ts");
const appShell = read("src/AppShell.tsx");
const focusEntryApi = read("src/focusEntryApi.ts");
const blitzEntry = read("src/BlitzEntryButton.tsx");
const verifyConfig = read("scripts/verify-config.mjs");
const ci = read(".github/workflows/ci.yml");

const windows = config.app.windows;
invariant(windows.length === 2, "runtime must define exactly two WebViews");
invariant(
  windows.map((window) => window.label).sort().join(",") === "focusSurface,main",
  "runtime WebViews must be main + focusSurface only",
);
for (const file of ['src-tauri/tauri.conf.json', 'src-tauri/tauri.ci.conf.json', 'src-tauri/tauri.diagnostic.conf.json']) {
  const host = JSON.parse(read(file)).app.windows.find(w => w.label === 'focusSurface');
  invariant(host.shadow === false && host.resizable === false && host.maximizable === false, file + ': fixed region host must have no shadow insets or native resize/maximize affordance');
}
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
  coordinator.includes("inert={!panelActive}")
    && coordinator.includes("inert={!timerActive || completionSuccess !== null}")
    && coordinator.includes("completionSuccessContent={inlineSuccess && completionSuccess ? ("),
  "inactive/preparing presentations and modal backgrounds must be removed from interaction and accessibility navigation",
);
invariant(
  coordinatorCss.includes('data-focus-visibility="preparing"')
    && coordinatorCss.includes("z-index: 1")
    && coordinatorCss.includes("opacity: 1")
    && coordinatorCss.includes("pointer-events: none"),
  "incoming presentation must be fully prepainted underneath the committed view",
);

invariant(
  coordinator.includes("const FOCUS_GEOMETRY_MOTION_MS = 250")
    && coordinator.includes("animateNativePresentation: (next) =>")
    && coordinator.includes("animateFocusSurfacePresentation(next, motionDurationMs)")
    && coordinator.includes("runConcurrentMotion: () =>")
    && presentationTransition.includes("animateNativePresentation?: (presentation: TPresentation) => Promise<void>")
    && presentationTransition.includes("runConcurrentMotion?: () => Promise<void>")
    && presentationTransition.includes("await Promise.allSettled([")
    && coordinatorCss.includes("--focus-geometry-motion-duration: 250ms")
    && coordinatorCss.includes("--focus-geometry-motion-ease: cubic-bezier(0.55, 0.55, 0, 1)")
    && lib.includes("FLUENT_POINT_TO_POINT_X1: f64 = 0.55")
    && lib.includes("fluent_point_to_point_easing")
    && coordinatorCss.includes('data-focus-geometry-motion-from="timerCompact"')
    && coordinatorCss.includes('data-focus-geometry-motion-from="timerExpanded"')
    && coordinatorCss.includes("clip-path: inset(0 0 590px 0 round 12px)")
    && coordinatorCss.includes("clip-path: inset(0 0 400px 0 round 12px)"),
  "Panel/Timer switching must coordinate finite Fluent point-to-point same-WebView geometry and native position continuity",
);
invariant(
  coordinatorCss.includes("--focus-visible-height: 700px")
    && coordinatorCss.includes('--focus-visible-height: 110px')
    && coordinatorCss.includes('--focus-visible-height: 300px')
    && completionSuccessCss.includes("height:var(--focus-visible-height,700px)")
    && completionSuccessCss.includes("max-height:100%")
    && completionSuccessCss.includes("overflow:auto")
    && completionSuccess.includes('role={inline ? "region" : "dialog"}')
    && completionSuccess.includes('data-focus-success-placement={inline ? "inline" : "overlay"}')
    && completionSuccess.includes("autoFocus"),
  "Focus completion success must stay inside the committed native visible region and keep its actions keyboard-accessible",
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
  lib.includes("pub mod focus_webview;")
    && lib.includes("focus_webview::set_physical_position(window, point.x, point.y)")
    && focusWebview.includes("NotifyParentWindowPositionChanged()")
    && focusWebview.includes(".with_webview("),
  "programmatic Focus HWND movement must explicitly synchronize WebView2 parent position",
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
const presentationListenerStart = coordinator.indexOf(
  "void listen<FocusPresentationChanged>(FOCUS_PRESENTATION_CHANGED_EVENT",
);
const presentationListenerInstalled = coordinator.indexOf(
  "stopListening = unlisten;",
  presentationListenerStart,
);
const initialPresentationSnapshot = coordinator.indexOf(
  "void reconcileAuthoritativePresentation();",
  presentationListenerInstalled,
);
invariant(
  presentationListenerStart >= 0
    && presentationListenerInstalled > presentationListenerStart
    && initialPresentationSnapshot > presentationListenerInstalled,
  "presentation projection must install its listener before invoking the initial authoritative snapshot",
);
invariant(
  coordinator.includes("presentationReconcileRevisionRef.current")
    && coordinator.includes("revision === presentationReconcileRevisionRef.current"),
  "out-of-order native presentation snapshots must not overwrite a newer renderer reconciliation",
);
invariant(
  coordinator.includes("presentationHydrated")
    && coordinator.includes('data-focus-presentation-hydrated={presentationHydrated ? "true" : "false"}')
    && coordinatorCss.includes('data-focus-presentation-hydrated="false"')
    && coordinatorCss.includes("visibility: hidden"),
  "Focus renderer must stay visually and interactively gated until the authoritative native presentation is hydrated",
);
invariant(
  coordinator.includes("presentationHydratedRef.current")
    && coordinator.includes("timerResizePendingRef.current")
    && coordinator.includes("deferredToggleSequenceRef.current")
    && coordinator.includes("deferredFindSequenceRef.current")
    && coordinator.includes('}, []);'),
  "native Focus shortcut listeners must stay stable and defer requests that arrive before authoritative hydration",
);
const applyPresentationStart = lib.indexOf("fn apply_focus_surface_presentation_internal(");
const applyPresentationEnd = lib.indexOf(
  '#[tauri::command(rename_all = "camelCase")]\nfn focus_surface_apply_presentation(',
  applyPresentationStart,
);
const applyPresentationBody = lib.slice(applyPresentationStart, applyPresentationEnd);
const timerToPanelSaveBranch = applyPresentationBody.indexOf(
  "if previous.mode() == FocusSurfaceMode::Timer && target == FocusSurfacePresentation::Panel {",
);
const timerToPanelSave = applyPresentationBody.indexOf(
  "floating_placement::save_if_timer_visible(app_handle)",
  timerToPanelSaveBranch,
);
const transitionSaveSuppression = applyPresentationBody.indexOf(
  "let _save_guard = floating_placement::suspend_saves();",
  timerToPanelSave,
);
invariant(
  applyPresentationStart >= 0
    && applyPresentationEnd > applyPresentationStart
    && timerToPanelSaveBranch >= 0
    && timerToPanelSave > timerToPanelSaveBranch
    && transitionSaveSuppression > timerToPanelSave,
  "Timer -> Panel transition must save placement before transition-time save suppression begins",
);
invariant(
  lib.includes("if previous == target && target != FocusSurfacePresentation::Panel")
    && lib.includes("if visible {")
    && lib.includes("floating_placement::restore_for_timer("),
  "visible same-Timer requests must preserve drag position while hidden Timer reshow restores placement against current topology",
);
invariant(
  lib.includes("identifier.eq_ignore_ascii_case(M1_DIAGNOSTIC_APP_IDENTIFIER)")
    && lib.includes("!storage_path_matches_identifier(&app_dir, identifier)")
    && lib.includes('"validate diagnostic app data isolation"')
    && lib.indexOf('"validate diagnostic app data isolation"') < lib.indexOf("std::fs::create_dir_all(&app_dir)"),
  "diagnostic persistence startup must fail closed before creating/opening SQLite outside the diagnostic app-data namespace",
);
const trayQuitBranch = lib.indexOf('} else if event.id() == "quit" {');
const trayQuitSave = lib.indexOf(
  "floating_placement::save_if_timer_visible(app_handle)",
  trayQuitBranch,
);
const trayQuitExit = lib.indexOf("app_handle.exit(0);", trayQuitSave);
invariant(
  trayQuitBranch >= 0
    && trayQuitSave > trayQuitBranch
    && trayQuitExit > trayQuitSave,
  "tray Quit must persist visible Timer placement before terminating the Narro process",
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
  focusEntryApi.includes('invoke<void>("present_focus_for_blitz", { reducedMotion })')
    && !focusEntryApi.includes('invoke<void>("present_focus_panel")')
    && blitzEntry.includes("await presentFocusForBlitz(reducedMotion);"),
  "production Blitz entry must use the coordinator-safe native entry boundary",
);
const blitzEntryNativeStart = lib.indexOf("async fn present_focus_for_blitz(");
const blitzEntryNativeEnd = lib.indexOf("pub(crate) fn revalidate_open_focus_panel_after_display_change(", blitzEntryNativeStart);
const blitzEntryNative = lib.slice(blitzEntryNativeStart, blitzEntryNativeEnd);
const blitzVisibleBranchStart = blitzEntryNative.indexOf("if visible {");
const blitzHiddenBranchStart = blitzEntryNative.indexOf(
  "// Prepare the retained hidden Focus host",
  blitzVisibleBranchStart,
);
const blitzVisibleBranch = blitzEntryNative.slice(blitzVisibleBranchStart, blitzHiddenBranchStart);
const blitzHiddenBranch = blitzEntryNative.slice(blitzHiddenBranchStart);
invariant(
  blitzEntryNativeStart >= 0
    && blitzVisibleBranchStart >= 0
    && blitzHiddenBranchStart > blitzVisibleBranchStart
    && blitzVisibleBranch.includes("set_focus()")
    && blitzVisibleBranch.includes("request_blitz_panel_after_reveal(&app_handle)")
    && !blitzVisibleBranch.includes("apply_focus_surface_presentation_internal")
    && blitzHiddenBranch.includes("apply_focus_surface_presentation_internal(")
    && blitzHiddenBranch.includes("FocusSurfacePresentation::Panel"),
  "Blitz re-entry must preserve a visible Focus presentation and only prepare Panel while hidden",
);
const blitzPanelRequestHelperStart = lib.indexOf("fn request_blitz_panel_after_reveal(");
const blitzPanelRequestHelperEnd = lib.indexOf("fn show_focus_after_blitz_entry(", blitzPanelRequestHelperStart);
const blitzPanelRequestHelper = lib.slice(blitzPanelRequestHelperStart, blitzPanelRequestHelperEnd);
invariant(
  blitzPanelRequestHelperStart >= 0
    && blitzPanelRequestHelperEnd > blitzPanelRequestHelperStart
    && blitzPanelRequestHelper.includes("focus_home_pause_nonce()?")
    && blitzPanelRequestHelper.includes("FocusPanelRequestPayload { resume_nonce }"),
  "Blitz Panel requests must stay centralized and bound to Home-pause provenance",
);

invariant(
  topology.includes("const OBSERVED_WINDOW_LABELS: [&str; 1] = [FOCUS_SURFACE_LABEL]")
    && topology.includes("revalidate_open_timer_after_display_change"),
  "display recovery must observe and revalidate the one Focus HWND",
);
invariant(
  lib.includes("struct DiagnosticStoragePaths")
    && lib.includes("fn diagnostic_storage_paths(")
    && lib.includes("app_handle.config().identifier.clone()")
    && lib.includes("app_handle.path().app_data_dir()")
    && lib.includes("app_handle.path().app_local_data_dir()")
    && lib.includes("diagnostic_storage_paths,"),
  "diagnostic build must expose its resolved data/local-data paths for physical isolation verification",
);
invariant(
  lib.includes("struct FocusPanelPlacementProbe")
    && lib.includes("fn focus_panel_placement_probe(")
    && lib.includes("window.outer_position()")
    && lib.includes("window.outer_size()")
    && lib.includes("focus_panel_edge_position(descriptor.work_area, actual_size, side)")
    && lib.includes("clamp_top_left(descriptor.work_area, actual_size, actual_position)")
    && lib.includes("fully_within_work_area")
    && lib.includes("edge_aligned")
    && lib.includes("focus_panel_placement_probe,"),
  "physical monitor diagnostics must read actual Focus HWND geometry, compare it with the selected monitor work-area edge, and remain registered",
);
invariant(
  topology.includes("WM_ENTERSIZEMOVE")
    && topology.includes("WM_EXITSIZEMOVE")
    && topology.includes("display_recovery_suspended()")
    && placement.includes("pub(crate) fn planned_timer_position(")
    && lib.includes("fn animate_focus_surface_presentation_internal(")
    && lib.includes("windows::suspend_focus_display_recovery()")
    && lib.includes("timer_region::apply(&window, target.region())")
    && lib.includes("fn apply_panel_native_after_animated_cross_dpi_move(")
    && lib.includes("FOCUS_CROSS_DPI_VIEWPORT_SETTLE_MS"),
  "interactive/programmatic cross-monitor movement must defer competing DPI recovery, clip Panel-to-Timer before motion, and defer cross-DPI Panel reveal until target viewport settlement",
);
invariant(
  verifyConfig.includes("windows.length === 2")
    && !verifyConfig.includes("timer.html")
    && !ci.includes('"dist/timer.html"'),
  "repository config/CI contracts must enforce the two-entry production build",
);

console.log("Single-Focus architecture invariants passed.");
