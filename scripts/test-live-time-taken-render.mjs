import assert from "node:assert/strict";
import vm from "node:vm";
import { createRequire } from "node:module";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Render the actual production component, stubbing only IPC and unrelated
// icon/tooltip shells. Formatting, task binding and editor initialization stay real.
const stubs = {
  diagnosticApi: "export const formatInvokeError=String;",
  listBoardApi: "export const getListBoardSnapshot=()=>{throw new Error('unexpected IPC')};",
  timerSessionApi: "export const setPausedTimerEstimate=()=>{throw new Error('unexpected IPC')};export const setPausedTimerTimeTaken=setPausedTimerEstimate;",
  overlayPrimitives: "export const Tooltip=({children})=>children;",
  ActionIcon: "export const ActionIcon=()=>null;",
};
const result = await build({
  entryPoints:["src/FocusLiveMetrics.tsx"],bundle:true,write:false,format:"cjs",platform:"node",
  external:["react","react/*"],loader:{".css":"empty"},jsx:"automatic",
  plugins:[{name:"isolated-metrics-ipc",setup(b){
    b.onResolve({filter:/^\.\/(diagnosticApi|listBoardApi|timerSessionApi|overlayPrimitives|ActionIcon)$/},args=>({path:args.path.slice(2),namespace:"stubs"}));
    b.onLoad({filter:/.*/,namespace:"stubs"},args=>({contents:stubs[args.path],loader:"js"}));
  }}],
});
const mod={exports:{}};
vm.runInNewContext(result.outputFiles[0].text,{require:createRequire(import.meta.url),module:mod,exports:mod.exports,console});
const {FocusLiveMetrics}=mod.exports;
const task={id:"active",listId:"list",title:"Same task",estSeconds:60,timeTakenSeconds:"900"};
const timer={revision:1,awaitingResume:false,change:null,runtime:{open_session_id:"session",timer:{task_id:"active",state:"running"}}};
const render=(payload,extra={})=>renderToStaticMarkup(React.createElement(FocusLiveMetrics,{
  task,target:{kind:"all"},timer:payload,fixtureMode:false,onTimerPayload(){},...extra,
}));
const live=(seconds,error=null,taskId="active")=>({...timer,liveTimeTaken:{taskId,seconds,error}});
assert.match(render(timer),/>0:15:00<\//,"legacy fixture uses durable total");
assert.match(render(live("901")),/>0:15:01<\//,"first native sample advances despite same board object");
assert.match(render(live("902")),/>0:15:02<\//,"subsequent sample owns display without a board fetch");
assert.match(render(live("5")),/>0:00:05<\//,"manual lower total is not replaced by raw lifetime runtime");
assert.match(render(live("999",null,"old-task")),/>0:15:00<\//,"stale other-task total is ignored");
for(const p of [live(null,"LIVE_TIME_TAKEN_UNAVAILABLE"),live("-1"),live("not-seconds")]){
  const html=render(p);assert.match(html,/Live Time Taken is temporarily unavailable/);
  assert.match(html,/>—<\//);assert.doesNotMatch(html,/>0:15:00<\//,"an owned error must not masquerade as a stale total");
}
assert.match(render(live("18446744073709551615")),/>5124095576030431:00:15<\//,"native integer text avoids Number precision loss");
const paused={...live("905"),runtime:{...timer.runtime,timer:{...timer.runtime.timer,state:"paused"}}};
assert.match(render(paused,{fixtureMode:true,fixtureEditor:"time_taken"}),/value="0:15:00"/,"edit draft/CAS remains durable900 rather than live905");
console.log("Production live Time Taken render: native samples, same-task binding, durable editor, read errors and integer precision PASS.");

// Exercise the real event/snapshot reducer with native history generations.
// Paused renderers do not poll, so a late response must not undo the one event.
const apiBundle=await build({
  entryPoints:["src/timerSessionApi.ts"],bundle:true,write:false,format:"cjs",platform:"node",
  plugins:[{name:"isolated-native-transport",setup(b){
    b.onResolve({filter:/^(@tauri-apps\/api\/(core|event)|\.\/boardInvalidation)$/},args=>({path:args.path,namespace:"transport"}));
    b.onLoad({filter:/.*/,namespace:"transport"},()=>({contents:"export const invoke=()=>{throw new Error('unexpected invoke')};export const listen=invoke;export const emitBoardInvalidated=invoke;",loader:"js"}));
  }}],
});
const apiMod={exports:{}};
vm.runInNewContext(apiBundle.outputFiles[0].text,{module:apiMod,exports:apiMod.exports,console});
const {applyTimerSessionProjection}=apiMod.exports;
const generation=(historyRevision,error=null)=>({...paused,liveTimeTaken:{taskId:"active",historyRevision,seconds:error?null:"905",error}});
const first=generation("9007199254740993"),next=generation("9007199254740994");
assert.equal(applyTimerSessionProjection(next,first),next,"late older history cannot overwrite current paused metric");
assert.equal(applyTimerSessionProjection(first,next),next,"newer history event accepted without a timer transition");
const pending=generation(next.liveTimeTaken.historyRevision,"LIVE_TIME_TAKEN_PENDING");
assert.equal(applyTimerSessionProjection(next,pending),next,"late pending snapshot cannot erase refreshed equal-history event");
assert.equal(applyTimerSessionProjection(pending,next),next,"ready event replaces pending equal-history snapshot");
const resumed={...first,revision:paused.revision+1};
assert.equal(applyTimerSessionProjection(next,resumed),resumed,"semantic timer revision keeps priority over history ordering");
assert.equal(applyTimerSessionProjection(resumed,next),resumed,"history ordering cannot resurrect an older timer revision");
console.log("Production Timer projection reducer: paused history events, late snapshots, semantic priority and lossless generations PASS.");
