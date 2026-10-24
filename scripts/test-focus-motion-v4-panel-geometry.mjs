import assert from "node:assert/strict";
import fs from "node:fs";
import {createMotionV4PanelLayout, measureMotionV4Panel,
  measureMotionV4PanelTimer} from "../src/focusMotionV4PanelGeometry.ts";

const rect = (x,y,width,height) => ({x,y,width,height});
const el = (r,text="") => ({
  textContent:text, getBoundingClientRect:()=>({left:r.x,top:r.y,width:r.width,height:r.height}),
  closest:()=>null,
});
const host=el(rect(0,0,340,700));
const panelTitle=el(rect(12,102,148,20),"Real task");
const panelClock=el(rect(228,102,84,22),"04:59");
const timerTitle=el(rect(12,10,148,20),"Real task");
const timerClock=el(rect(228,10,84,22),"04:59");
const card={
  dataset:{taskId:"task-a",focusBreakCard:"false"},
  querySelector:selector=>({
    ".focus-panel__live-title":panelTitle,
    ".focus-panel__live-timer":panelClock,
  }[selector]??null),
};
const floating={
  dataset:{floatingLiveTaskId:"task-a",floatingExpanded:"false"},
  querySelector:selector=>({
    '[data-floating-task-title="true"]':timerTitle,
    '[data-floating-live-timer="true"]':timerClock,
  }[selector]??null),
};
const tree={
  querySelector:selector=>({
    ".focus-surface-coordinator":host,
    '.focus-surface-coordinator__presentation[data-focus-presentation="panel"] .focus-panel__live-card[data-task-id]':card,
    '.focus-surface-coordinator__presentation[data-focus-presentation="timer"] .floating-timer-foundation[data-floating-timer="foundation"]':floating,
  }[selector]??null),
};
const panel=measureMotionV4Panel(tree);
const compact=measureMotionV4PanelTimer(tree,false);
assert.equal(panel?.taskId,"task-a");
assert.equal(compact?.taskId,"task-a");
assert.deepEqual(panel?.title,rect(12,102,148,20));
assert.deepEqual(compact?.timer,rect(228,10,84,22));
const opening=createMotionV4PanelLayout(panel,compact,700,110);
assert.deepEqual(opening?.title,{from:panel.title,to:compact.title});
assert.deepEqual(opening?.timer,{from:panel.timer,to:compact.timer});
assert.deepEqual(createMotionV4PanelLayout(compact,panel,110,700)?.title,
  {from:compact.title,to:panel.title});
assert.equal(createMotionV4PanelLayout(null,compact,700,110),null);
assert.equal(createMotionV4PanelLayout(panel,null,700,110),null);
assert.equal(createMotionV4PanelLayout(panel,compact,300,110),null);
assert.equal(createMotionV4PanelLayout(panel,compact,700,700),null);
assert.equal(createMotionV4PanelLayout(panel,{...compact,taskId:"other"},700,110),null);
assert.equal(createMotionV4PanelLayout(panel,{...compact,titleText:"different"},700,110),null);
assert.equal(createMotionV4PanelLayout(panel,{...compact,timerText:"04:58"},700,110),null);
assert.equal(createMotionV4PanelLayout(panel,
  {...compact,timer:rect(110,10,84,22)},700,110),null,
  "intersecting clock and title must not enter native v4");
assert.equal(createMotionV4PanelLayout(panel,
  {...compact,title:rect(12,100,148,20)},700,110),null,
  "native 110px height must clip invalid incoming pixels");
assert.equal(measureMotionV4PanelTimer(tree,true),null);
card.dataset.focusBreakCard="true";
assert.equal(measureMotionV4Panel(tree),null);
card.dataset.focusBreakCard="false";
panelTitle.closest=selector=>selector==='[data-focus-live-title-scroll="active"]' ? {}:null;
assert.equal(measureMotionV4Panel(tree),null);
panelTitle.closest=()=>null;
timerClock.textContent="04:58";
assert.equal(createMotionV4PanelLayout(measureMotionV4Panel(tree),
  measureMotionV4PanelTimer(tree,false),700,110),null);
timerClock.textContent="04:59";

const coordinator=fs.readFileSync("src/FocusSurfaceCoordinator.tsx","utf8");
const css=fs.readFileSync("src/focusSurfaceCoordinator.css","utf8");
const rust=fs.readFileSync("src-tauri/src/lib.rs","utf8");
const raster=fs.readFileSync("src-tauri/src/focus_motion_v4_raster.rs","utf8");
const api=fs.readFileSync("src/focusSurfaceModeApi.ts","utf8");
assert.ok(coordinator.includes("createMotionV4PanelLayout("));
assert.ok(coordinator.includes('await panelStage("source");'));
assert.ok(coordinator.includes('await panelStage("target", panelLayout)'));
assert.ok(coordinator.indexOf('await panelStage("source");') <
  coordinator.indexOf('await prepareGeometryMotion(previousPresentation, targetPresentation);'));
assert.ok(coordinator.indexOf('await panelStage("target", panelLayout)') <
  coordinator.indexOf('markFocusTransitionTrace("renderer.native-request"'));
assert.ok(coordinator.includes("assertSameModeTask();"));
assert.ok(css.includes('data-focus-v4-panel-plate="source"')
  && css.includes('data-focus-v4-panel-plate="target"')
  && css.includes("visibility: hidden !important"));
assert.ok(api.includes('invoke<void>("focus_surface_prepare_v4_panel_plate"'));
assert.ok(rust.includes("focus_surface_prepare_v4_panel_plate,"));
assert.ok(rust.includes("v4_panel_from_plate: None")
  && rust.includes("v4_panel_to_plate: None")
  && rust.includes("v4_panel_layout: None"));
assert.ok(rust.includes("focus_motion_v4_raster::compose_panel("));
assert.ok(raster.includes("pub(crate) fn compose_panel("));
assert.ok(raster.includes("panel_shared_pixels_use_one_semantic_source_and_exact_endpoints"));
console.log("Panel↔Timer source-measured native shared sprites, identity guards and stage ordering: PASS");
