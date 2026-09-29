import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const invariant = (condition, message) => {
  if (!condition) throw new Error(`Focus toggle shortcut contract failed: ${message}`);
};

const shortcuts = read("src-tauri/src/shortcuts/mod.rs");
const lib = read("src-tauri/src/lib.rs");
const coordinator = read("src/FocusSurfaceCoordinator.tsx");
const floating = read("src/FloatingTimerFoundation.tsx");
const app = read("src/App.tsx");
const diagnosticApi = read("src/diagnosticApi.ts");
const pkg = JSON.parse(read("package.json"));

invariant(
  shortcuts.includes('FOCUS_TOGGLE_CHORD: &str = "Ctrl+Shift+T"')
    && shortcuts.includes('FOCUS_TOGGLE_EVENT: &str = "focus-surface-toggle-requested"')
    && shortcuts.includes("const FOCUS_TOGGLE_HOTKEY_ID:")
    && shortcuts.includes("const VK_T: u32 = 0x54")
    && shortcuts.includes("MOD_CONTROL | MOD_SHIFT | MOD_NOREPEAT"),
  "Ctrl+Shift+T must use the existing native no-repeat RegisterHotKey observer",
);
invariant(
  shortcuts.includes("register_focus_toggle(app.handle(), manager.inner())")
    && shortcuts.includes("wparam == FOCUS_TOGGLE_HOTKEY_ID as usize")
    && shortcuts.includes("unregister_hot_key(hwnd, FOCUS_TOGGLE_HOTKEY_ID)"),
  "focus toggle must register at startup, dispatch through WM_HOTKEY, and unregister at HWND destruction",
);

const handlerStart = shortcuts.indexOf("fn schedule_focus_toggle_trigger()");
const handlerEnd = shortcuts.indexOf("fn schedule_find_timer_trigger()", handlerStart);
const handler = shortcuts.slice(handlerStart, handlerEnd);
const show = handler.indexOf("crate::show_and_focus(&window)");
const trigger = handler.indexOf("manager.record_focus_toggle_trigger()", show);
const emit = handler.indexOf(".emit(FOCUS_TOGGLE_EVENT, payload.focus_toggle_trigger_count)", trigger);
invariant(
  handlerStart >= 0 && handlerEnd > handlerStart
    && show >= 0 && show < trigger && trigger < emit
    && handler.includes("crate::current_focus_surface_mode().is_none()")
    && handler.includes("get_webview_window(FOCUS_SURFACE_LABEL)")
    && !handler.includes("FLOATING_TIMER_LABEL")
    && handler.includes("record_and_report_focus_toggle_error"),
  "shortcut must bring the one Focus host forward before emitting a revisioned presentation request",
);
invariant(
  shortcuts.includes("map_register_error_for_chord(error, FOCUS_TOGGLE_CHORD)")
    && shortcuts.includes("focus_toggle_last_error")
    && lib.includes("fn global_focus_toggle_register(")
    && lib.includes("global_focus_toggle_register,"),
  "registration conflicts must be reported locally and remain explicitly retryable",
);

invariant(
  coordinator.includes('subscribe<number>("focus-surface-toggle-requested"')
    && coordinator.includes("sequence <= lastToggleRequestRef.current")
    && coordinator.includes('currentMode === "panel" ? "timer" : "panel"')
    && coordinator.includes("transitionGateRef.current")
    && coordinator.includes("commitPreparedFocusPresentation({"),
  "global toggle must be deduplicated and serialized through the single-host coordinator",
);
invariant(
  coordinator.includes("waitForTargetReady: () => waitForReady(targetMode)")
    && coordinator.includes("applyNativePresentation: applyFocusSurfacePresentation"),
  "global toggle must prepaint before the native presentation transaction commits",
);
invariant(
  floating.includes("onResizePendingChange?.(true)")
    && floating.includes("onResizePendingChange?.(false)")
    && floating.includes("resizeRequestInFlightRef.current"),
  "Timer resize must expose an immediate busy boundary so global toggles cannot race it",
);
invariant(
  coordinator.includes("transitionGateRef.current || timerResizePending"),
  "coordinator must reject conflicting mode/quick-create work during Timer resize or presentation commit",
);

invariant(
  diagnosticApi.includes("focusToggleLastError: ShortcutErrorSnapshot | null")
    && app.includes("shortcutDiagnostics?.focusToggleLastError")
    && app.includes('invoke<ShortcutDiagnostics>("global_focus_toggle_register")')
    && app.includes("Retry shortcut"),
  "a registration failure must be visible and retryable in the local app",
);
for (const forbidden of ["timer_pause(", "timer_resume(", "timer_start_task(", "setInterval("]) {
  invariant(!handler.includes(forbidden), `shortcut must not mutate timer/session authority through ${forbidden}`);
}
invariant(
  pkg.scripts["test:ui-focus-toggle-shortcut"] === "node scripts/test-ui-focus-toggle-shortcut.mjs"
    && pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-toggle-shortcut"),
  "the focus toggle contract must run in frontend preflight",
);

console.log("Single-host Focus toggle shortcut contracts passed.");
