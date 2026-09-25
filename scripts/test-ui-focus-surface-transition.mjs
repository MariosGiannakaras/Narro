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
const coordinator = read("src/focusModeTransition.ts");
const transition = read("src/FocusSurfaceTransition.tsx");
const presentationFrame = read("src/presentationFrame.ts");
const transitionCss = read("src/focusSurfaceTransition.css");
const motionCss = read("src/motion.css");
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
    && configure.includes("if reveal_after_configuration {\n        record_focus_surface_mode(mode);"),
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
    && position.includes("let hide_for_transition = presentation_transition")
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

const preparePanel = slice(lib, "fn prepare_focus_panel(", "#[tauri::command]\nfn reveal_focus_panel");
const revealPanel = slice(lib, "fn reveal_focus_panel(", "#[tauri::command]\nfn present_focus_panel");
const prepareTimer = slice(lib, "fn prepare_floating_timer(", "#[tauri::command]\nfn reveal_floating_timer");
const revealTimer = slice(lib, "fn reveal_floating_timer(", "#[tauri::command]\nfn present_floating_timer");
invariant(
  preparePanel.includes("FocusPanelPlacementIntent::Prepare")
    && prepareTimer.includes("prepare_focus_surface_mode(&window, FocusSurfaceMode::Timer)"),
  "both product modes must expose hidden native prepare commands",
);
invariant(
  revealPanel.indexOf(".show()") < revealPanel.indexOf(".set_focus()")
    && revealPanel.indexOf(".set_focus()") < revealPanel.indexOf("record_focus_surface_mode(FocusSurfaceMode::Panel)")
    && revealTimer.indexOf(".show()") < revealTimer.indexOf("record_focus_surface_mode(FocusSurfaceMode::Timer)"),
  "reveal commands must publish native visibility before authoritative presentation mode",
);
for (const command of [
  "prepare_floating_timer",
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
    && !requestMode.includes("prepareFloatingTimer")
    && !requestMode.includes("prepareFocusPanel"),
  "mode request must only begin the outgoing renderer exit",
);
invariant(
  commitMode.includes("await coordinateFocusModeTransition({")
    && commitMode.includes("await prepareFloatingTimer()")
    && commitMode.includes("await prepareFocusPanel()")
    && commitMode.includes("flushSync(() => {")
    && commitMode.includes("setPreparedMode(nextMode)")
    && commitMode.includes("setPendingMode(null)")
    && commitMode.includes("setMode(nextMode)")
    && commitMode.includes("waitForPresentedFrame")
    && commitMode.includes("await revealFloatingTimer()")
    && commitMode.includes("await revealFocusPanel()"),
  "mode commit must prepare hidden geometry, synchronously publish a prepainted target, pass a frame barrier, then reveal",
);
invariant(
  focus.includes('prepainted={preparedMode === "timer"}')
    && focus.includes('prepainted={preparedMode === "panel"}'),
  "target roots must mount already visible while the native host is hidden",
);

invariant(
  coordinator.indexOf("await prepareMode(targetMode)") < coordinator.indexOf("publishMode(targetMode)")
    && coordinator.indexOf("publishMode(targetMode)") < coordinator.indexOf("await waitForPresentedFrame()")
    && coordinator.indexOf("await waitForPresentedFrame()") < coordinator.indexOf("await revealMode(targetMode)"),
  "coordinator success order must be prepare -> publish -> frame -> reveal",
);
const recovery = coordinator.indexOf("await prepareMode(previousMode)");
invariant(
  recovery > coordinator.indexOf("catch (transitionFailure)")
    && recovery < coordinator.indexOf("publishMode(previousMode)", recovery)
    && coordinator.indexOf("publishMode(previousMode)", recovery) < coordinator.indexOf("await revealMode(previousMode)", recovery)
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
    && pkg.scripts["preflight:frontend"].includes("npm run test:focus-mode-transition")
    && pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-surface-transition"),
  "transition executable/static contracts must both run in frontend preflight",
);

console.log("Focus surface transition contracts passed.");
