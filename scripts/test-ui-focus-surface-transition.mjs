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
const transition = read("src/FocusSurfaceTransition.tsx");
const presentationFrame = read("src/presentationFrame.ts");
const transitionCss = read("src/focusSurfaceTransition.css");
const motionCss = read("src/motion.css");
const pkg = JSON.parse(read("package.json"));

const configure = slice(
  lib,
  "fn configure_focus_surface_mode(",
  "fn position_focus_panel_in_work_area(",
);
const applyMode = configure.indexOf("apply_focus_surface_mode(window, mode)");
invariant(
  configure.indexOf(".hide()") < applyMode
    && applyMode < configure.indexOf(".show()"),
  "Timer-mode native transition must hide before reconfiguration and show only after mode geometry is applied",
);
invariant(
  configure.includes("let was_visible = window")
    && configure.includes("if was_visible")
    && configure.includes("let _ = window.show();"),
  "failed native Timer reconfiguration must make a best-effort restoration of a previously visible surface",
);

const position = slice(
  lib,
  "fn position_focus_panel_in_work_area(",
  "fn position_focus_panel(",
);
const stagePosition = position.indexOf("let staging_position = focus_panel_edge_position(");
const stageMove = position.indexOf("x: staging_position.x");
const finalMove = position.indexOf("x: final_position.x");
const show = position.indexOf(".show()", finalMove);
const record = position.indexOf("record_focus_surface_mode(FocusSurfaceMode::Panel)", show);
const focusWindow = position.indexOf(".set_focus()", record);
invariant(
  position.includes("let hide_for_present = intent == FocusPanelPlacementIntent::Present")
    && position.includes("let previous_position = if hide_for_present")
    && stagePosition >= 0
    && position.indexOf(".hide()") < stagePosition
    && stagePosition < stageMove,
  "activating Panel transition must capture recovery position, hide, and calculate target-edge DPI staging before the staging move",
);
invariant(
  position.includes("if let Err(error) = placement_result")
    && position.includes("window.set_position(tauri::Position::Physical(previous_position))")
    && position.includes("let _ = window.show();"),
  "failed hidden Panel staging must best-effort restore the prior visible position",
);
invariant(
  position.indexOf("apply_focus_surface_mode(&window, FocusSurfaceMode::Panel)?") > stageMove
    && finalMove > position.indexOf("apply_focus_surface_mode(&window, FocusSurfaceMode::Panel)?")
    && !position.includes("x: work_area.position.x"),
  "Panel transition must stage on the configured edge before resize and must not expose the raw work-area origin",
);
invariant(
  finalMove >= 0 && show > finalMove && record > show && focusWindow > record,
  "Panel must reach its final edge position before show, mode publication and focus",
);
invariant(
  !position.includes("configure_focus_surface_mode(&window, FocusSurfaceMode::Panel)"),
  "Panel presenter must not show the staging position through the generic mode helper",
);

const revalidate = slice(
  lib,
  "pub(crate) fn revalidate_open_focus_panel_after_display_change(",
  "fn build_main_window(",
);
invariant(!revalidate.includes(".show()"), "display revalidation must remain non-activating");
invariant(!revalidate.includes(".set_focus()"), "display revalidation must not steal focus");

const timerRoot = slice(focus, 'if (mode === "timer") {', '\n  return (');
const panelRoot = slice(focus, 'key="panel"', '\n      <FocusPanel');
for (const [name, mode, root] of [["Timer", "timer", timerRoot], ["Panel", "panel", panelRoot]]) {
  invariant(
    root.includes(`key="${mode}"`)
      && root.includes(`mode="${mode}"`)
      && root.includes('exiting={pendingMode !== null}')
      && root.includes('onExitComplete={() => void commitPendingModeTransition()}'),
    `${name} product root must stay keyed and complete exit before native mode sequencing`,
  );
}
const requestMode = slice(focus, "function requestMode(", "async function commitPendingModeTransition()");
const commitMode = slice(focus, "async function commitPendingModeTransition()", "function enterCompactMode()");
invariant(
  requestMode.includes("setTransitionPending(true)")
    && requestMode.includes("setPendingMode(targetMode)")
    && !requestMode.includes("presentFloatingTimer")
    && !requestMode.includes("presentFocusPanel"),
  "mode request must begin renderer exit without invoking native geometry immediately",
);
const paintBarrier = commitMode.indexOf("await waitForPresentedFrame();");
invariant(
  paintBarrier >= 0
    && paintBarrier < commitMode.indexOf('await presentFloatingTimer();')
    && paintBarrier < commitMode.indexOf('await presentFocusPanel();')
    && commitMode.indexOf('await presentFloatingTimer();') < commitMode.indexOf("setMode(targetMode);")
    && commitMode.indexOf('await presentFocusPanel();') < commitMode.indexOf("setMode(targetMode);"),
  "native mode switch must wait for a presented hidden frame, then publish renderer mode only after native success",
);

invariant(
  transition.includes("window.requestAnimationFrame(() => setEntered(true))")
    && transition.includes("window.cancelAnimationFrame(frame)")
    && transition.includes('data-focus-surface-exiting={exiting ? "true" : "false"}')
    && transition.includes('data-focus-surface-exit-settled={exitSettled ? "true" : "false"}')
    && transition.includes("setExitSettled(true)")
    && transition.includes("onTransitionEnd")
    && transition.includes("onExitComplete?.()")
    && !transition.includes("onTransitionCancel"),
  "content transition must provide cancellable entrance plus transition-end exit completion",
);
for (const forbidden of ["setInterval(", "setTimeout(", "@tauri-apps/api/window", "setPosition("]) {
  invariant(!transition.includes(forbidden), `transition wrapper must not introduce ${forbidden}`);
}
invariant(
  transition.includes('className="focus-surface-transition motion-focus-surface"'),
  "transition must reuse the shared focus-surface motion primitive",
);
invariant(
  transitionCss.includes("width: 100%")
    && transitionCss.includes("min-width: 0")
    && transitionCss.includes("overflow-x: clip")
    && transitionCss.includes('[data-focus-surface-transition="timer"]')
    && transitionCss.includes("position: fixed")
    && transitionCss.includes("overflow: hidden"),
  "focus-surface transition must prevent horizontal overflow and keep Timer mode out of document scrolling",
);
invariant(
  transitionCss.includes("opacity: 0")
    && transitionCss.includes("transform: translateY(var(--motion-distance-overlay))")
    && transitionCss.includes("opacity: 1")
    && transitionCss.includes("transform: translateY(0)")
    && transitionCss.includes('[data-focus-surface-exiting="true"]')
    && transitionCss.includes('[data-focus-surface-exit-settled="true"]')
    && transitionCss.includes("visibility: hidden")
    && transitionCss.includes("transition-timing-function: var(--motion-ease-exit)"),
  "transition presentation must provide finite opacity/transform entrance and exit",
);
for (const forbidden of ["animation:", "@keyframes"]) {
  invariant(!transitionCss.includes(forbidden), `transition CSS must not start keyframe/decorative animation via ${forbidden}`);
}
invariant(
  focus.includes('import { waitForPresentedFrame } from "./presentationFrame";')
    && (presentationFrame.match(/requestAnimationFrame\(/g) ?? []).length === 2
    && !presentationFrame.includes("setInterval(")
    && !presentationFrame.includes("setTimeout("),
  "mode transition must use the shared finite two-frame compositor barrier",
);
invariant(
  motionCss.includes(".motion-focus-surface")
    && motionCss.includes("--motion-duration-focus-surface: 150ms")
    && motionCss.includes("--motion-distance-overlay: 0rem"),
  "shared motion/reduced-motion foundation must provide the finite 150ms transition and zero reduced displacement",
);

invariant(
  pkg.scripts["test:ui-focus-surface-transition"] === "node scripts/test-ui-focus-surface-transition.mjs",
  "package transition contract registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-surface-transition"),
  "frontend preflight must run the focus-surface transition contract",
);

console.log("Focus surface transition contracts passed.");
