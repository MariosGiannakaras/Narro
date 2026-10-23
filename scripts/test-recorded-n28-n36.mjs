import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise the actual committed handler AST, not an independently copied
// popover state machine or a source-string-only success toast assertion.
const read = (path) => fs.readFileSync(path, "utf8");
function productionArrow(file, name, context) {
  const source = read(file);
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found = null;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node)
      && node.name.getText(ast) === name && node.initializer
      && ts.isArrowFunction(node.initializer)) found = node.initializer;
    ts.forEachChild(node, visit);
  };
  visit(ast);
  assert.ok(found, `Missing real handler ${file}::${name}`);
  const compiled = ts.transpileModule(
    "globalThis.__handler = " + found.getText(ast) + ";",
    {compilerOptions: {target:ts.ScriptTarget.ES2022, module:ts.ModuleKind.None}},
  ).outputText;
  const sandbox = {...context};
  vm.runInNewContext(compiled, sandbox, {filename:file, timeout:3000});
  return sandbox.__handler;
}

// N28: opening either filter atomically dismisses its sibling, but only the
// list selection/date Apply handler changes persisted/queried filter content.
const state = {list:false,date:false,draft:0,month:0};
const setter = (field) => (next) => {
  state[field] = typeof next === "function" ? next(state[field]) : next;
};
const handlers = () => ({
  listFilterOpen:state.list, datePickerOpen:state.date,
  setListFilterOpen:setter("list"),setDatePickerOpen:setter("date"),
  appliedRange:{startDateKey:"2026-10-01",endDateKey:"2026-10-24"},
  setDraftRange:() => {state.draft++;},
  setCalendarAnchor:() => {state.month++;},
  reportMonthStart:(key) => key.slice(0,7)+"-01",
});
productionArrow("src/ReportsOverview.tsx","toggleListFilter",handlers())();
assert.deepEqual({list:state.list,date:state.date}, {list:true,date:false});
productionArrow("src/ReportsOverview.tsx","toggleDatePicker",handlers())();
assert.deepEqual({list:state.list,date:state.date}, {list:false,date:true});
assert.equal(state.draft,1,"Opening date keeps the existing draft initialize path");
assert.equal(state.month,1);
productionArrow("src/ReportsOverview.tsx","toggleListFilter",handlers())();
assert.deepEqual({list:state.list,date:state.date}, {list:true,date:false});
productionArrow("src/ReportsOverview.tsx","toggleListFilter",handlers())();
assert.deepEqual({list:state.list,date:state.date}, {list:false,date:false});

// Render the actual pure ReportsOverviewView with JSX as a tree to exercise
// the listbox, trigger and Escape event handlers as shipped.
const viewSource=read("src/ReportsOverviewView.tsx");
const ast=ts.createSourceFile("ReportsOverviewView.tsx",viewSource,
  ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
let viewNode=null;
for(const item of ast.statements) if(ts.isFunctionDeclaration(item)
  && item.name?.text==="ReportsOverviewView") viewNode=item;
assert.ok(viewNode,"Production ReportsOverviewView declaration missing");
const code=ts.transpileModule(
  viewNode.getText(ast).replace(/^export function /,"function ")
    + "\nmodule.exports = ReportsOverviewView;",
  {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
    jsx:ts.JsxEmit.ReactJSX}},
).outputText;
const jsx=(type,props)=>({type,props:props??{}});
const effects=[];
const module={exports:{}};
vm.runInNewContext(code,{
  module,exports:module.exports,
  require:(id)=>{if(id==="react/jsx-runtime")
    return {jsx,jsxs:jsx,Fragment:"fragment"};
    throw Error("Unexpected production Reports dependency: "+id);},
  useRef:(value)=>({current:value}),
  useEffect:(effect)=>effects.push(effect),
  formatDuration:()=>"0min",
  ReportListBadges:()=>null,ActionIcon:()=>null,ReportChart:()=>null,
  DateRangePicker:()=>null,
}, {filename:"ReportsOverviewView.N28.cjs",timeout:3000});
let dismiss=0;
const tree=module.exports({
  metrics:[],chartDays:[],productive:{hour:"",day:"",month:""},
  timeByList:[],doneTasks:[],listLabel:"All Lists",
  selectedListIds:[],listOptions:[{id:null,title:"All Lists",color:null}],
  rangeLabel:"Last 30 days",calendarMonths:[],listFilterOpen:true,
  datePickerOpen:false,punctuality:{earlyPercent:0,latePercent:0},
  onToggleListFilter:()=>{dismiss++;},
});
function* nodes(node) {
  if(Array.isArray(node)){for(const item of node)yield* nodes(item);return;}
  if(!node || typeof node!=="object" || !("props" in node))return;
  yield node;yield* nodes(node.props.children);
}
const all=[...nodes(tree)];
const trigger=all.find(x=>x.props["data-report-list-filter"]==="true");
const menu=all.find(x=>x.props["data-report-list-menu"]==="true");
const first=all.find(x=>x.type==="button"&&x.props.role==="option");
assert.ok(trigger?.props.ref&&menu&&first?.props.ref,"Popup, trigger and first option must stay keyboard reachable");
assert.equal(trigger.props["aria-controls"],menu.props.id);
const focus=[];
trigger.props.ref.current={focus:(options)=>focus.push(["trigger",options])};
first.props.ref.current={focus:(options)=>focus.push(["option",options])};
for(const effect of effects)effect();
assert.equal(focus[0]?.[0],"option","Opening keyboard listbox focuses its first option");
let prevented=0,stopped=0;
const escape=()=>({key:"Escape",preventDefault:()=>prevented++,
  stopPropagation:()=>stopped++});
menu.props.onKeyDown(escape());
assert.equal(dismiss,1);
assert.equal(prevented,1);
assert.equal(stopped,1);
assert.equal(focus.at(-1)?.[0],"trigger","Esc restores focus to list filter opener");
trigger.props.onKeyDown(escape());
assert.equal(dismiss,2,"Esc on opener must also dismiss");
assert.equal(prevented,2);
assert.equal(stopped,2);
menu.props.onKeyDown({key:"ArrowDown",preventDefault:()=>{throw Error("Stole ArrowDown");},
  stopPropagation:()=>{throw Error("Stopped ArrowDown");}});
assert.equal(dismiss,2);

// N36: same actual Focus handler dispatches the existing authoritative
// skip_break IPC and reports Paused, never falsely claims running work.
let status=null,inFlight=false,callCount=0,published=null;
const payload={runtime:{timer:{state:"paused"}}};
let release;
const waiting=new Promise(resolve=>{release=resolve;});
const run=productionArrow("src/FocusLiveActions.tsx","run",{
  beginMutation:()=>{if(inFlight)return false;inFlight=true;return true;},
  finishMutation:()=>{inFlight=false;},
  applyPayload:(value)=>{published=value;},
  setStatus:(value)=>{status=value;},
  fail:(error)=>{throw error;},
});
const skipBreakTimer=()=>{callCount++;return waiting;};
const handler=productionArrow("src/FocusLiveActions.tsx","handlePauseResume",{
  timer:{runtime:{timer:{state:"break"}}},skipBreakTimer,
  resumeTimer:()=>{throw Error("Wrong resume API for Break");},
  pauseTimer:()=>{throw Error("Wrong pause API for Break");},
  run,
});
handler();
handler();
assert.equal(callCount,1,"Same-render repeated Break Skip must be single-flight");
assert.equal(status,null,"Do not announce success before native completion");
release(payload);
await new Promise(resolve=>setImmediate(resolve));
assert.equal(published,payload,"Authoritative committed timer payload must be published");
assert.equal(status,"Break skipped. Work paused.");
assert.equal(inFlight,false,"Break action gate must release after settled mutation");
assert.ok(!read("src/FocusLiveActions.tsx").includes("Break skipped. Work resumed."),
  "No other misleading Break skip feedback may remain");
const engine=read("src-tauri/src/timer/mod.rs");
assert.ok(engine.includes("skipped_manual_break_leaves_task_paused")
  && engine.includes("assert_eq!(skipped.state, TimerStateKind::Paused)"),
  "The native skipped-break invariant must still be Paused");
console.log("N28 actual Reports overlay state/keyboard/focus and N36 authoritative Break Skip feedback: PASS");
