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
const transitionCss = read("src/focusSurfaceTransition.css");
const motionCss = read("src/motion.css");
const pkg = JSON.parse(read("package.json"));

const configure = slice(
  lib,
  "fn configure_focus_surface_mode(",
  "fn position_focus_panel_in_work_area(",
);
invariant(
  configure.indexOf(".hide()") < configure.indexOf("apply_focus_surface_mode(window, mode)?")
    && configure.indexOf("apply_focus_surface_mode(window, mode)?") < configure.indexOf(".show()"),
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
  "#[tauri::command(rename_all = \"camelCase\")]\nfn position_focus_panel(",
);
const stageMove = position.indexOf("x: work_area.position.x");
const finalMove = position.indexOf("x: final_position.x");
const show = position.indexOf(".show()", finalMove);
const record = position.indexOf("record_focus_surface_mode(FocusSurfaceMode::Panel)", show);
const focusWindow = position.indexOf(".set_focus()", record);
invariant(
  position.includes("let hide_for_present = intent == FocusPanelPlacementIntent::Present")
    && position.indexOf(".hide()") < stageMove,
  "activating Panel transition must hide before the DPI staging move",
);
invariant(
  position.indexOf("apply_focus_surface_mode(&window, FocusSurfaceMode::Panel)?") > stageMove
    && finalMove > position.indexOf("apply_focus_surface_mode(&window, FocusSurfaceMode::Panel)?"),
  "Panel transition must preserve move-before-resize/DPI staging and physical final edge calculation",
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

invariant(
  focus.includes('<FocusSurfaceTransition key="timer" mode="timer">')
    && focus.includes('<FocusSurfaceTransition key="panel" mode="panel">'),
  "Panel and Timer product roots must each mount through a keyed transition surface",
);
invariant(
  focus.indexOf("await presentFloatingTimer();") < focus.indexOf('setMode("timer");')
    && focus.indexOf("await presentFocusPanel();") < focus.indexOf('setMode("panel");'),
  "renderer mode publication must remain after successful native transition",
);

invariant(
  transition.includes("window.requestAnimationFrame(() => setEntered(true))")
    && transition.includes("window.cancelAnimationFrame(frame)"),
  "content entrance must use one cancellable paint-boundary frame",
);
for (const forbidden of ["setInterval(", "setTimeout(", "@tauri-apps/api/window", "setPosition("]) {
  invariant(!transition.includes(forbidden), `transition wrapper must not introduce ${forbidden}`);
}
invariant(
  transition.includes('className="focus-surface-transition motion-focus-surface"'),
  "transition must reuse the shared focus-surface motion primitive",
);
invariant(
  transitionCss.includes("opacity: 0")
    && transitionCss.includes("transform: translateY(var(--motion-distance-overlay))")
    && transitionCss.includes("opacity: 1")
    && transitionCss.includes("transform: translateY(0)"),
  "transition presentation must be opacity/transform only",
);
for (const forbidden of ["animation:", "@keyframes", "width:", "height:"]) {
  if (forbidden === "width:" || forbidden === "height:") continue;
  invariant(!transitionCss.includes(forbidden), `transition CSS must not start keyframe/decorative animation via ${forbidden}`);
}
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
