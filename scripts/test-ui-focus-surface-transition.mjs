import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const invariant = (condition, message) => {
  if (!condition) throw new Error(`Focus presentation transition contract failed: ${message}`);
};
const slice = (source, begin, end) => {
  const start = source.indexOf(begin);
  invariant(start >= 0, `${begin} is missing`);
  const stop = source.indexOf(end, start + begin.length);
  return source.slice(start, stop < 0 ? undefined : stop);
};

const lib = read("src-tauri/src/lib.rs");
const panelRoot = read("src/focusPanelWindow.tsx");
const timerRoot = read("src/floatingTimerWindow.tsx");
const events = read("src/focusWindowEvents.ts");
const timer = read("src/FloatingTimerFoundation.tsx");
const panel = read("src/FocusPanel.tsx");
const coordinator = read("src/persistentFocusWindowTransition.ts");
const modeApi = read("src/focusSurfaceModeApi.ts");
const pkg = JSON.parse(read("package.json"));

const prepareTimer = slice(lib, "fn prepare_floating_timer(", "#[tauri::command]\nfn reveal_floating_timer");
const revealTimer = slice(lib, "fn reveal_floating_timer(", "#[tauri::command]\nfn present_floating_timer");
const preparePanel = slice(lib, "fn prepare_focus_panel(", "#[tauri::command]\nfn prewarm_focus_surface");
const revealPanel = slice(lib, "fn reveal_focus_panel(", "#[tauri::command]\nfn present_focus_panel");
invariant(prepareTimer.includes("FLOATING_TIMER_LABEL") && prepareTimer.includes(".hide()")
  && prepareTimer.includes("timer_region::apply"), "Timer must be positioned and clipped while hidden");
invariant(preparePanel.includes("FocusPanelPlacementIntent::Prepare"), "Panel preparation must leave its target HWND hidden");
invariant(revealTimer.indexOf(".show()") >= 0 && revealTimer.indexOf(".show()") < revealTimer.search(/panel\s*\.hide\(\)/)
  && revealPanel.indexOf(".show()") >= 0 && revealPanel.indexOf(".show()") < revealPanel.search(/timer\s*\.hide\(\)/),
"the prepared target must become visible before the source HWND is hidden in either direction");
invariant(revealTimer.indexOf("announce_focus_surface_mode") > revealTimer.search(/panel\s*\.hide\(\)/)
  && revealPanel.indexOf("announce_focus_surface_mode") > revealPanel.search(/timer\s*\.hide\(\)/),
"native mode authority must publish only after the target is visible and source hidden");
for (const block of [prepareTimer, revealTimer, preparePanel, revealPanel]) {
  invariant(!block.includes("focus_visual_hold") && !block.includes("configure_focus_surface_mode_visibility"),
    "persistent-window transitions must not use the failed bitmap or same-HWND mode reconfiguration path");
}

for (const command of ["prepare_floating_timer", "reveal_floating_timer", "prepare_focus_panel", "reveal_focus_panel", "present_floating_timer", "present_focus_panel"]) {
  invariant(modeApi.includes(`"${command}"`), `renderer transition bridge is missing ${command}`);
}
invariant(events.includes('FOCUS_MODE_REQUEST_EVENT = "focus-surface-mode-requested"')
  && events.includes('TIMER_PRESENTATION_READY_EVENT = "floating-timer-presentation-ready"')
  && events.includes('TIMER_PRESENTATION_QUERY_EVENT = "floating-timer-presentation-query"')
  && events.includes('FOCUS_MODE_CHANGED_EVENT = "focus-surface-mode-changed"'),
  "cross-window requests, readiness and committed mode updates need explicit event contracts");

const request = slice(panelRoot, "async function requestMode(", "requestModeRef.current = requestMode");
invariant(panelRoot.includes('subscribe<number>("focus-surface-toggle-requested"')
  && panelRoot.includes("sequence <= lastToggleRequestRef.current")
  && panelRoot.includes("busyRef.current")
  && request.includes("switchPersistentFocusWindows({"),
  "Panel must be the sole serialized coordinator for button and global shortcut mode requests");
invariant(request.includes("prepareFloatingTimer()") && request.includes("prepareFocusPanel()")
  && request.includes("revealFloatingTimer()") && request.includes("revealFocusPanel()")
  && request.includes("presentFloatingTimer()") && request.includes("presentFocusPanel()"),
  "Panel coordinator must support target preparation/reveal and source restoration");
invariant(coordinator.includes("await prepareMode(targetMode)")
  && coordinator.includes("await waitForModeReady(targetMode)")
  && coordinator.includes("await revealMode(targetMode)")
  && coordinator.includes("await restoreMode(previousMode)"),
  "coordinator must gate reveal on readiness and preserve rollback; executable tests verify order/failures");
invariant(panelRoot.includes("TIMER_PRESENTATION_QUERY_EVENT")
  && panelRoot.includes("TIMER_PRESENTATION_READY_EVENT")
  && panelRoot.includes("Floating Timer did not finish loading."),
  "Panel must wait for the other renderer and time out instead of showing an unready Timer");
invariant(timerRoot.includes("onPresentationReady={onPresentationReady}")
  && timerRoot.includes("await waitForPresentedFrame()")
  && timerRoot.includes("await snapshotTimerSession()")
  && timerRoot.includes("authoritative.revision !== rendered.revision")
  && timerRoot.includes('emitTo("focusSurface", TIMER_PRESENTATION_READY_EVENT, payload)'),
  "Timer must compare its rendered projection with authoritative state before announcing readiness");
invariant(timer.includes("timerSettledKey === refreshKey && boardSettledKey === refreshKey")
  && timer.includes("boardTaskId === liveTaskId")
  && timer.includes("onPresentationReady?.(timer)"),
  "Timer readiness must include authoritative timer state and matching task data");
invariant(panel.includes("onPresentationReady?.(timer)"), "Panel must retain its presentation readiness signal");
invariant(timerRoot.includes('emitTo("focusSurface", FOCUS_MODE_REQUEST_EVENT, payload)')
  && !timerRoot.includes("prepareFloatingTimer()") && !timerRoot.includes("revealFocusPanel()"),
  "Timer may request a mode change but must not race the Panel coordinator");
for (const source of [panelRoot, timerRoot, timer]) {
  invariant(!source.includes("beginFocusVisualHold") && !source.includes("prewarmFocusSurface"),
    "production renderers must not reintroduce the old same-HWND visual hold path");
}
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:focus-mode-transition")
  && pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-surface-transition"),
  "executable coordinator and cross-window integration contracts must remain in preflight");

console.log("Persistent Focus Panel/Timer transition contracts passed.");
