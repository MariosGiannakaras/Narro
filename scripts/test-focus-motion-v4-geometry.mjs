import assert from "node:assert/strict";
import fs from "node:fs";
import { assertMotionV4TaskIdentity, createMotionV4TimerLayout, measureMotionV4Timer } from "../src/focusMotionV4Geometry.ts";
import { commitPreparedFocusPresentation } from "../src/focusPresentationTransition.ts";

const rect = (x, y, width, height) => ({ x, y, width, height });
assert.doesNotThrow(() => assertMotionV4TaskIdentity("one", "one"));
assert.doesNotThrow(() => assertMotionV4TaskIdentity(null, null));
assert.throws(() => assertMotionV4TaskIdentity("one", "two"), /live Focus task changed/);
assert.throws(() => assertMotionV4TaskIdentity("one", null), /live Focus task changed/);
assert.throws(() => assertMotionV4TaskIdentity(null, "two"), /live Focus task changed/);
const taskId = "isolated-synthetic-task";
const compact = {
  taskId, expanded: false,
  title: rect(10, 12, 150, 18), timer: rect(240, 12, 85, 18),
  toolbar: rect(12, 70, 310, 28), actions: null, rows: [],
};
const expanded = {
  taskId, expanded: true,
  title: rect(12, 12, 150, 18), timer: rect(240, 12, 85, 18),
  toolbar: rect(12, 96, 310, 28),
  actions: rect(12, 44, 310, 32),
  rows: [rect(12, 142, 310, 36), rect(12, 264, 310, 36)],
};
const opening = createMotionV4TimerLayout(compact, expanded);
assert.deepEqual(opening.title, {from: compact.title, to: expanded.title});
assert.deepEqual(opening.toolbar, {from: compact.toolbar, to: expanded.toolbar});
assert.deepEqual(opening.rows, expanded.rows);
assert.deepEqual(opening.actions, expanded.actions);
const collapsing = createMotionV4TimerLayout(expanded, compact);
assert.deepEqual(collapsing.timer, {from: expanded.timer, to: compact.timer});
assert.deepEqual(collapsing.rows, expanded.rows);
assert.equal(createMotionV4TimerLayout(compact, {...expanded, taskId:"other-task"}), null);
assert.equal(createMotionV4TimerLayout(compact, compact), null);
assert.equal(createMotionV4TimerLayout(null, expanded), null);
assert.equal(createMotionV4TimerLayout(expanded, null), null);
assert.equal(createMotionV4TimerLayout(
  {...compact, title:rect(10,100,120,20)}, expanded), null);
assert.equal(createMotionV4TimerLayout(
  compact, {...expanded, toolbar:rect(10,295,120,15)}), null);
assert.equal(createMotionV4TimerLayout(
  compact, {...expanded, rows:[rect(10,280,100,30)]}), null);
assert.equal(createMotionV4TimerLayout(
  compact, {...expanded, timer: rect(140,12,85,18)}), null,
  "overlapping title/time sprites must fallback instead of double painting");
assert.equal(createMotionV4TimerLayout(
  compact, {...expanded, rows:[rect(12,141,310,36),rect(12,145,310,36)]}), null,
  "overlapping row sprites must fallback");
assert.equal(createMotionV4TimerLayout(
  {...compact, toolbar:rect(10,18,140,28)}, expanded), null,
  "overlap in outgoing compact pixels must fallback");


const el = (bounds) => ({getBoundingClientRect: () =>
  ({left:bounds.x, top:bounds.y, width:bounds.width, height:bounds.height,
    right:bounds.x+bounds.width, bottom:bounds.y+bounds.height})});
const makeTree = ({hover=false, loading=false, timeUp=false, rows=expanded.rows}={}) => {
  const map = {
    '[data-floating-task-title="true"]': el(expanded.title),
    '[data-floating-live-timer="true"]': el(expanded.timer),
    '.floating-timer-foundation__subtask-toolbar': el(expanded.toolbar),
    '.floating-timer-foundation__actions-wrap': el(expanded.actions),
  };
  const timer = {
    dataset: {floatingCompactActions: hover?"true":"false", floatingLiveTaskId:taskId,
      floatingExpanded:"true"},
    querySelector: (selector) => {
      if (selector === '[data-floating-time-up-label="true"]') return timeUp?{}:null;
      if (selector === '[data-floating-subtasks-loading="true"]') return loading?{}:null;
      return map[selector] ?? null;
    },
    querySelectorAll: (selector) => selector === "[data-floating-subtask-id]"
      ? rows.map(el) : [],
  };
  return {querySelector: (selector) =>
    selector === ".focus-surface-coordinator" ? el(rect(0,0,340,700))
    : selector === '.floating-timer-foundation[data-floating-timer="foundation"]' ? timer
    : null};
};
assert.deepEqual(measureMotionV4Timer(makeTree()), expanded);
assert.deepEqual(measureMotionV4Timer(makeTree({hover:true})), expanded,
  "real pointer-triggered expansion must retain measured anchors");
assert.equal(measureMotionV4Timer(makeTree({loading:true})), null);
assert.equal(measureMotionV4Timer(makeTree({timeUp:true})), null);
assert.equal(measureMotionV4Timer(makeTree({rows:[rect(325,142,20,36)]})), null);
assert.equal(measureMotionV4Timer(makeTree({rows:Array.from({length:65},()=>expanded.rows[0])})), null);

const coordinator=fs.readFileSync("src/FocusSurfaceCoordinator.tsx","utf8");
const foundation=fs.readFileSync("src/FloatingTimerFoundation.tsx","utf8");
const css=fs.readFileSync("src/focusSurfaceCoordinator.css","utf8");
const timerCss=fs.readFileSync("src/floatingTimerFoundation.css","utf8");
const api=fs.readFileSync("src/focusSurfaceModeApi.ts","utf8");
const rust=fs.readFileSync("src-tauri/src/lib.rs","utf8");
const compositor=fs.readFileSync("src-tauri/src/focus_motion_v4_raster.rs","utf8");
assert.ok(foundation.includes("measureMotionV4Timer(document)"));
assert.ok(foundation.includes("sourceAnchors);"));
assert.ok(foundation.includes("await waitForPresentedFrameOrThrow();\n        // The coordinator acquires"));
assert.ok(timerCss.includes('[data-floating-resize-pending="true"] .floating-timer-foundation__heading'));
assert.ok(timerCss.includes('[data-floating-compact-actions="true"][data-floating-resize-pending="true"] .floating-timer-foundation__heading'));
assert.ok(timerCss.indexOf('[data-floating-compact-actions="true"][data-floating-resize-pending="true"] .floating-timer-foundation__heading') > timerCss.indexOf('[data-floating-compact-actions="true"] .floating-timer-foundation__heading'));
assert.ok(coordinator.includes("createMotionV4TimerLayout(sourceAnchors, measureMotionV4Timer(document))"));
assert.ok(coordinator.includes("const sourceTaskId = sourceAnchors?.taskId"));
assert.ok(coordinator.includes("const assertSameModeTask = () => assertMotionV4TaskIdentity("));
assert.ok(coordinator.includes('assertSameModeTask();\n          markFocusTransitionTrace("renderer.target-prepared"'));
assert.ok(coordinator.includes('assertSameModeTask();\n          return animateFocusSurfacePresentation(next, motionDurationMs, rasterToken!).then'));
assert.ok(coordinator.includes('assertSameModeTask();\n            markFocusTransitionTrace("renderer.native-finished"'));
assert.ok(coordinator.includes("commitRendererPresentation: (next) => {"));
assert.ok(coordinator.includes('if (next === targetPresentation) assertSameModeTask();'),
  "task-race guard must not prevent the recovery helper from publishing previous presentation");
assert.ok(coordinator.includes("const assertSameRasterTask = () => assertMotionV4TaskIdentity("));
assert.ok(coordinator.includes('animate: async (next, token) => {\n          assertSameRasterTask();'));
assert.ok(coordinator.indexOf('assertSameRasterTask();\n          markFocusTransitionTrace("renderer.native-request", token);')
  > coordinator.indexOf('delete host.dataset.focusV4Plate'));
assert.ok(coordinator.includes('await animateFocusSurfacePresentation(next, duration, token);\n          assertSameRasterTask();'),
  'post-animation task change must roll back before publication');
assert.ok(coordinator.indexOf('host.dataset.focusV4Plate = "true"') <
  coordinator.indexOf("await prepareFocusMotionV4Plate(token, layout)"));
assert.ok(coordinator.indexOf("await prepareFocusMotionV4Plate(token, layout)") <
  coordinator.indexOf("delete host.dataset.focusV4Plate"));
assert.ok(coordinator.indexOf("delete host.dataset.focusV4Plate") <
  coordinator.indexOf('markFocusTransitionTrace("renderer.native-request", token);',
    coordinator.indexOf("await prepareFocusMotionV4Plate(token, layout)")));
assert.ok(css.includes('.floating-timer-foundation__subtask-toolbar,'));
assert.ok(api.includes('invoke<void>("focus_surface_prepare_v4_plate", { rasterToken, layout })'));
assert.ok(rust.includes("focus_surface_prepare_v4_plate,"));
assert.ok(rust.includes("lease.snapshot.presentation.mode() != FocusSurfaceMode::Timer"));
assert.ok(rust.includes("lease.target.mode() != FocusSurfaceMode::Timer"));
assert.ok(rust.includes('"motion-v4-composite"'));
assert.ok(rust.includes("v4_plate: None") && rust.includes("v4_layout: None"));
assert.ok(rust.includes("focus_motion_v4_raster::compose("));
assert.ok(compositor.includes("let from_toolbar = layout.toolbar.from.interpolate("));
assert.ok(compositor.includes("focus_mode_raster::compose(plate, plate, visible, eased)?"));
assert.ok(compositor.includes("if eased <= 0.0 || eased >= 1.0"));
assert.ok(compositor.includes("fn validate_source_image(image: &Image) -> CommandResult<()>"));
assert.ok(compositor.includes("validate_source_image(outgoing)?;")
  && compositor.includes("validate_source_image(incoming)?;")
  && compositor.includes("validate_source_image(plate)?;"),
  "all BGRA sources need validation before unchecked staged blit indexing");
assert.ok(compositor.includes("malformed_intermediate_source_fails_without_bgra_out_of_bounds"));
assert.ok(compositor.includes("fn intersects(a: &Rect, b: &Rect) -> bool"));
assert.ok(compositor.includes("overlapping Motion v4 semantic pixel rectangles"));
// Exercise the real generic transaction helper with the production task
// identity invariant. Regression: a task change during native animation
// MUST release/restore the outgoing presentation rather than generating a
// secondary FocusPresentationRecoveryError during rollback publication.
for (const mutateAt of ["prepare", "native-end", "renderer-commit"]) {
  let taskId = "live-a";
  const operations = [];
  const assertTask = () => assertMotionV4TaskIdentity("live-a", taskId);
  const failure = await assert.rejects(
    () => commitPreparedFocusPresentation({
      previousPresentation: "panel",
      targetPresentation: "timerCompact",
      waitForTargetReady: async () => { operations.push("target-ready"); },
      beforeNativeCommit: async () => {
        operations.push("prepare");
        if (mutateAt === "prepare") taskId = "live-b";
        assertTask();
      },
      beforeNativeRollback: async () => { operations.push("restore-dom"); },
      applyNativePresentation: async (next) => { operations.push("restore-native:" + next); },
      animateNativePresentation: async () => {
        operations.push("native-animate");
        if (mutateAt === "native-end") taskId = "live-b";
        assertTask();
      },
      runConcurrentMotion: async () => { operations.push("renderer-motion"); },
      commitRendererPresentation: (next) => {
        if (mutateAt === "renderer-commit") taskId = "live-b";
        if (next === "timerCompact") assertTask();
        operations.push("publish:" + next);
      },
    }), /live Focus task changed/,
    "the first stale-task error must be preserved without blocking rollback",
  );
  assert.ok(failure === undefined);
  assert.ok(operations.includes("restore-dom"));
  assert.ok(operations.includes("restore-native:panel"));
  assert.ok(operations.includes("publish:panel"));
  assert.ok(!operations.includes("publish:timerCompact"));
}
console.log("Actual DOM anchor capture, guarded plate preparation and native staged source contracts: PASS");
