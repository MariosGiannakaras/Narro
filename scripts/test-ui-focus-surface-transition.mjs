import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus surface transition contract failed: ${message}`);
}

function slice(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  invariant(start >= 0, `${startMarker} is missing`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  return source.slice(start, end >= 0 ? end : source.length);
}

const lib = read("src-tauri/src/lib.rs");
const focus = read("src/focus.tsx");
const panel = read("src/FocusPanel.tsx");
const floating = read("src/FloatingTimerFoundation.tsx");
const coordinator = read("src/focusModeTransition.ts");
const transition = read("src/FocusSurfaceTransition.tsx");
const presentationFrame = read("src/presentationFrame.ts");
const transitionCss = read("src/focusSurfaceTransition.css");
const motionCss = read("src/motion.css");
const visualHold = read("src-tauri/src/focus_visual_hold.rs");
const pkg = JSON.parse(read("package.json"));

const configure = slice(
  lib,
  "fn configure_focus_surface_mode_visibility(",
  "fn configure_focus_surface_mode(",
);
const applyMode = configure.indexOf("apply_focus_surface_mode(window, mode)");
const optionalShow = configure.indexOf("if reveal_after_configuration", applyMode);
invariant(
  configure.indexOf(".hide()") < applyMode
    && applyMode < optionalShow
    && optionalShow < configure.indexOf(".show()", optionalShow),
  "native geometry preparation must hide before reconfiguration and reveal only when explicitly requested",
);
invariant(
  configure.includes("let previous_mode = current_focus_surface_mode()")
    && configure.includes("set_size(tauri::Size::Physical(previous_size))")
    && configure.includes("set_position(tauri::Position::Physical(previous_position))")
    && configure.includes("set_always_on_top(previous_topmost)")
    && configure.includes("set_skip_taskbar(previous_mode == Some(FocusSurfaceMode::Timer))")
    && configure.includes("FOCUS_SURFACE_MODE_RECOVERY_FAILED")
    && configure.indexOf("if reveal_after_configuration {", applyMode) >= 0
    && configure.indexOf(
      "record_focus_surface_mode(mode);",
      configure.indexOf("if reveal_after_configuration {", applyMode),
    ) > configure.indexOf("if reveal_after_configuration {", applyMode),
  "native Timer preparation must retain rollback and must not publish mode authority while hidden",
);

const prepareNative = slice(
  lib,
  "fn prepare_focus_surface_mode(",
  "fn position_focus_panel_in_work_area(",
);
invariant(
  prepareNative.includes("configure_focus_surface_mode_visibility(window, mode, false)"),
  "hidden native prepare must reuse the validated mode configuration without revealing",
);

const position = slice(
  lib,
  "fn position_focus_panel_in_work_area(",
  "fn position_focus_panel(",
);
const stagePosition = position.indexOf("let staging_position = focus_panel_edge_position(");
const stageMove = position.indexOf("x: staging_position.x");
const finalMove = position.indexOf("x: final_position.x");
const presentShow = position.indexOf(".show()", finalMove);
invariant(
  position.includes("FocusPanelPlacementIntent::Present | FocusPanelPlacementIntent::Prepare")
    && position.includes("let recovery_snapshot = if presentation_transition")
    && position.includes("let hide_for_transition = recovery_snapshot")
    && position.includes(".is_some_and(|(_, _, _, was_visible)| *was_visible)")
    && stagePosition >= 0
    && position.indexOf(".hide()") < stagePosition
    && stagePosition < stageMove,
  "Panel prepare/present must share hidden target-edge staging",
);
invariant(
  position.indexOf("apply_focus_surface_mode(&window, FocusSurfaceMode::Panel)?") > stageMove
    && finalMove > position.indexOf("apply_focus_surface_mode(&window, FocusSurfaceMode::Panel)?"),
  "Panel target geometry must be final before any reveal",
);
invariant(
  position.includes("if intent == FocusPanelPlacementIntent::Present")
    && presentShow > finalMove
    && !position.includes("configure_focus_surface_mode(&window, FocusSurfaceMode::Panel)"),
  "Prepare must leave the Panel hidden while legacy Present retains the activating path",
);
invariant(
  position.includes("read size before Panel transition")
    && position.includes("restore size after Panel transition failure")
    && position.includes("restore position after Panel transition failure")
    && position.includes("restore topmost state after Panel transition failure")
    && position.includes("restore taskbar state after Panel transition failure")
    && position.includes("restore visibility after Panel transition failure")
    && position.includes("FOCUS_SURFACE_MODE_RECOVERY_FAILED"),
  "failed hidden Panel preparation must restore the complete prior native presentation",
);

const preparePanel = slice(lib, "fn prepare_focus_panel(", "#[tauri::command]\nfn prewarm_focus_surface");
const prewarmNative = slice(lib, "fn prewarm_focus_surface(", "#[tauri::command]\nfn clear_focus_surface_prewarm");
const clearPrewarmNative = slice(lib, "fn clear_focus_surface_prewarm(", "#[tauri::command]\nfn reveal_focus_panel");
const revealPanel = slice(lib, "fn reveal_focus_panel(", "#[tauri::command]\nfn present_focus_panel");
const prepareTimer = slice(lib, "fn prepare_floating_timer(", "#[tauri::command]\nfn reveal_floating_timer");
const revealTimer = slice(lib, "fn reveal_floating_timer(", "#[tauri::command]\nfn present_floating_timer");
invariant(
  preparePanel.includes("FocusPanelPlacementIntent::Prepare")
    && prepareTimer.includes("prepare_focus_surface_mode(&window, FocusSurfaceMode::Timer)"),
  "both product modes must expose hidden native prepare commands",
);
invariant(
  lib.includes("SetLayeredWindowAttributes")
    && lib.includes("set_layered_alpha(hwnd, 0)")
    && lib.includes("set_layered_alpha(hwnd, 255)")
    && prewarmNative.indexOf("focus_surface_prewarm::cloak(&window)") < prewarmNative.indexOf(".show()")
    && clearPrewarmNative.includes("focus_surface_prewarm::uncloak(&window)"),
  "native prewarm must show the real host fully transparent, then expose an explicit alpha cleanup boundary",
);
invariant(
  revealPanel.indexOf(".show()") < revealPanel.indexOf("focus_surface_prewarm::uncloak(&window)")
    && revealPanel.indexOf("focus_surface_prewarm::uncloak(&window)") < revealPanel.indexOf(".set_focus()")
    && revealPanel.indexOf(".set_focus()") < revealPanel.indexOf("record_focus_surface_mode(FocusSurfaceMode::Panel)")
    && revealTimer.indexOf(".show()") < revealTimer.indexOf("focus_surface_prewarm::uncloak(&window)")
    && revealTimer.indexOf("focus_surface_prewarm::uncloak(&window)") < revealTimer.indexOf("record_focus_surface_mode(FocusSurfaceMode::Timer)"),
  "reveal commands must remove the transparent prewarm before publishing authoritative presentation mode",
);
for (const command of [
  "prepare_floating_timer",
  "prewarm_focus_surface",
  "clear_focus_surface_prewarm",
  "reveal_floating_timer",
  "prepare_focus_panel",
  "reveal_focus_panel",
]) {
  invariant(lib.includes(command), `native transition command ${command} is missing`);
}

const requestMode = slice(focus, "function requestMode(", "async function commitPendingModeTransition()");
const commitMode = slice(focus, "async function commitPendingModeTransition()", "function enterCompactMode()");
invariant(
  requestMode.includes("setTransitionPending(true)")
    && requestMode.includes("setPendingMode(targetMode)")
    && requestMode.indexOf("visualHoldOwnerRef.current.acquire()") < requestMode.indexOf("setPendingMode(targetMode)")
    && !requestMode.includes("prepareFloatingTimer")
    && !requestMode.includes("prepareFocusPanel"),
  "mode request must only begin the outgoing renderer exit",
);
invariant(
  commitMode.includes("await clearVisualHold()")
    && focus.includes("async function failPendingModeTransition(failure: unknown)")
    && visualHold.includes("BitBlt(")
    && visualHold.includes("CreateWindowExW(")
    && visualHold.includes("DwmFlush()")
    && visualHold.includes("DestroyWindow(hold.window as Handle)"),
  "the outgoing native copy must cover the blank host through normal and failed transitions",
);
invariant(
  floating.indexOf("await beginFocusVisualHold()") < floating.indexOf("await prewarmFocusSurface()")
    && floating.indexOf("await clearFocusSurfacePrewarm()") < floating.indexOf("await endFocusVisualHold()"),
  "Timer resize must retain the previous bitmap until the resized target is visible",
);
invariant(
  commitMode.includes("await coordinateFocusModeTransition({")
    && commitMode.includes("await prepareFloatingTimer()")
    && commitMode.includes("await prepareFocusPanel()")
    && commitMode.includes("flushSync(() => {")
    && commitMode.includes("setPreparedMode(nextMode)")
    && commitMode.includes("setPendingMode(null)")
    && commitMode.includes("setMode(nextMode)")
    && commitMode.includes("await prewarmFocusSurface()")
    && commitMode.includes("waitForModeReady:")
    && commitMode.includes("await waitForPanelReady()")
    && commitMode.includes("await waitForTimerReady()")
    && commitMode.includes("waitForPresentedFrame")
    && commitMode.includes("await revealFloatingTimer()")
    && commitMode.includes("await revealFocusPanel()"),
  "mode commit must prepare hidden geometry, synchronously publish a prepainted target, wait for target projections while hidden, transparently prewarm the host, pass a frame barrier, then reveal",
);
invariant(
  focus.includes('onPresentationReady={markPanelReady}')
    && focus.includes('if (nextMode === "panel") resetPanelReady()')
    && panel.includes("onPresentationReady?: () => void")
    && panel.includes("setBoardReadyTargetKey(null)")
    && panel.includes("setBoardReadyTargetKey(targetKey(target))")
    && panel.includes("setTimerSettled(false)")
    && panel.includes("setTimerSettled(true)")
    && panel.includes("timerSettled && boardReadyTargetKey === currentTargetKey")
    && panel.includes("onPresentationReady?.()"),
  "Panel reveal must be gated until its requested board snapshot and timer projection have both settled",
);
invariant(
  focus.includes("timerReadyRef")
    && focus.includes("timerReadyWaitersRef")
    && focus.includes("resetTimerReady")
    && focus.includes("waitForTimerReady")
    && focus.includes('onPresentationReady={markTimerReady}')
    && floating.includes("onPresentationReady?: () => void")
    && floating.includes("setTimerSettled(false)")
    && floating.includes("setTimerSettled(true)")
    && floating.includes("setBoardTaskId(null)")
    && floating.includes("setBoardTaskId(liveTaskId)")
    && floating.includes("timerSettled && (liveTaskId === null || boardTaskId === liveTaskId)")
    && floating.includes("onPresentationReady?.()"),
  "Timer reveal must be gated until its timer projection and matching live-task board snapshot have settled",
);

invariant(
  focus.includes('prepainted={preparedMode === "timer"}')
    && focus.includes('prepainted={preparedMode === "panel"}'),
  "target roots must mount already visible while the native host is hidden",
);

invariant(
  coordinator.indexOf("await prepareMode(targetMode)") < coordinator.indexOf("publishMode(targetMode)")
    && coordinator.indexOf("publishMode(targetMode)") < coordinator.indexOf("await waitForModeReady(targetMode)")
    && coordinator.indexOf("await waitForModeReady(targetMode)") < coordinator.indexOf("await prewarmMode(targetMode)")
    && coordinator.indexOf("await prewarmMode(targetMode)") < coordinator.indexOf("await waitForPresentedFrame()")
    && coordinator.indexOf("await waitForPresentedFrame()") < coordinator.indexOf("await revealMode(targetMode)"),
  "coordinator success order must be prepare -> publish -> hidden target readiness -> transparent prewarm -> frame -> reveal",
);
const recovery = coordinator.indexOf("await prepareMode(previousMode)");
invariant(
  recovery > coordinator.indexOf("catch (transitionFailure)")
    && recovery < coordinator.indexOf("publishMode(previousMode)", recovery)
    && coordinator.indexOf("publishMode(previousMode)", recovery) < coordinator.indexOf("await waitForModeReady(previousMode)", recovery)
    && coordinator.indexOf("await waitForModeReady(previousMode)", recovery) < coordinator.indexOf("await prewarmMode(previousMode)", recovery)
    && coordinator.indexOf("await prewarmMode(previousMode)", recovery) < coordinator.indexOf("await revealMode(previousMode)", recovery)
    && coordinator.includes("FocusModeTransitionRecoveryError")
    && coordinator.includes("FocusModeTransitionCancelledError"),
  "coordinator must rollback hidden geometry and renderer state on failure/cancellation and report failed recovery explicitly",
);

invariant(
  transition.includes("const [entered, setEntered] = useState(prepainted)")
    && transition.includes('data-focus-surface-prepainted={prepainted ? "true" : "false"}')
    && transition.includes("window.requestAnimationFrame(() => setEntered(true))")
    && transition.includes("waitForOpacityTransition(root, 0)")
    && focus.includes("onExitFailure={failPendingModeTransition}"),
  "prepainted target roots must avoid an empty first frame without removing finite exit handling",
);
for (const forbidden of ["setInterval(", "setTimeout(", "@tauri-apps/api/window", "setPosition("]) {
  invariant(!transition.includes(forbidden), `transition wrapper must not introduce ${forbidden}`);
  invariant(!coordinator.includes(forbidden), `transition coordinator must not introduce ${forbidden}`);
}

invariant(
  transitionCss.includes("opacity: 0")
    && transitionCss.includes("transform: translateY(var(--motion-distance-overlay))")
    && transitionCss.includes("opacity: 1")
    && transitionCss.includes("transform: translateY(0)")
    && transitionCss.includes('[data-focus-surface-exiting="true"]')
    && transitionCss.includes('[data-focus-surface-exit-settled="true"]')
    && transitionCss.includes("visibility: hidden"),
  "focus-surface motion must retain bounded opacity/transform exit and hidden settled state",
);
invariant(
  focus.includes('import { waitForPresentedFrame } from "./presentationFrame";')
    && (presentationFrame.match(/requestAnimationFrame\(/g) ?? []).length === 2
    && !presentationFrame.includes("setInterval(")
    && !presentationFrame.includes("setTimeout("),
  "mode transition must retain the shared finite two-frame compositor barrier",
);
invariant(
  motionCss.includes(".motion-focus-surface")
    && motionCss.includes("--motion-duration-focus-surface: 150ms")
    && motionCss.includes("--motion-distance-overlay: 0rem"),
  "shared motion/reduced-motion foundation must retain finite timing and zero reduced displacement",
);

invariant(
  pkg.scripts["test:focus-mode-transition"] === "node --experimental-strip-types scripts/test-focus-mode-transition.mjs"
    && pkg.scripts["test:ui-focus-surface-transition"] === "node scripts/test-ui-focus-surface-transition.mjs"
    && pkg.scripts["preflight:frontend"].includes("npm run test:focus-visual-hold-owner")
    && pkg.scripts["preflight:frontend"].includes("npm run test:focus-mode-transition")
    && pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-surface-transition"),
  "transition executable/static contracts must both run in frontend preflight",
);

console.log("Focus surface transition contracts passed.");
