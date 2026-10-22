import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute the exact ReportsAddSessionDialog keyboard handler, with a real
// focused search input versus an already focused listbox option.
const view = readFileSync("src/ReportsSessionsView.tsx", "utf8").replace(/\r\n/g, "\n");
const first = view.indexOf("  function handlePickerKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {");
const last = view.indexOf("  function closePicker()", first);
assert.ok(first >= 0 && last > first, "Recent Tasks picker handler not found");
const handler = view.slice(first,last);
const compiled = ts.transpileModule(
  `(() => {\n${handler}\nreturn handlePickerKeyDown;\n})()`,
  {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}
).outputText;
const calls = {clicks:[],focus:[],scroll:[]};
const options = Array.from({length:3},(_,i)=>({
  click(){calls.clicks.push(i);},
  focus(){calls.focus.push(i); ctx.document.activeElement=this;},
  scrollIntoView(){calls.scroll.push(i);},
}));
const search = { type:"search" };
const ctx = {
  pending:false,
  document:{activeElement:search},
  pickerRef:{current:{querySelectorAll(){return options;}}},
};
const keydown = vm.runInNewContext(compiled,ctx,{timeout:3000});
function event(key) {
  let prevented = false;
  return {key,preventDefault(){prevented=true;},get prevented(){return prevented;}};
}
let key=event("Enter"); keydown(key);
assert.equal(key.prevented,true);
assert.deepEqual(calls.clicks,[0],"Enter from search selects first ranked visible result");
ctx.document.activeElement=options[2];
key=event("Enter");keydown(key);
assert.deepEqual(calls.clicks,[0,2],"Enter on focused option preserves intentional choice");
ctx.document.activeElement=search;
key=event("ArrowDown");keydown(key);
assert.equal(key.prevented,true);
assert.deepEqual(calls.focus,[0]);
assert.deepEqual(calls.scroll,[0]);
ctx.document.activeElement=options[0];
key=event("ArrowUp");keydown(key);
assert.equal(key.prevented,true);
assert.deepEqual(calls.focus,[0,2],"ArrowUp wraps correctly");
ctx.document.activeElement=search;
key=event("Home");keydown(key); assert.equal(ctx.document.activeElement,options[0]);
key=event("End");keydown(key); assert.equal(ctx.document.activeElement,options[2]);
ctx.pickerRef.current.querySelectorAll=()=>[];
key=event("Enter");keydown(key);
assert.equal(key.prevented,false,"No matches cannot accidentally select a stale result");
assert.deepEqual(calls.clicks,[0,2]);
ctx.pending=true;
ctx.pickerRef.current.querySelectorAll=()=>options;
key=event("Enter");keydown(key);
assert.equal(key.prevented,false,"Pending mutation must reject list selection");
assert.deepEqual(calls.clicks,[0,2]);
assert.ok(view.includes('className="reports-sessions__task-picker-empty" role="status"'),
  "Empty search must announce absence of matches accessibly");
assert.ok(view.includes('filtered.length === 0 ? ('), "Empty state must only appear when no task matches");
console.log("Actual Reports picker Enter/Search/Arrow/Home/End/empty/pending handler regressions PASS");
