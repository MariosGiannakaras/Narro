import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute the exact production Reports Overview date picker, not a stand-in.
// Synthetic refs model the browser's focus transition and the effect cleanup.
const source = readFileSync("src/ReportsOverviewView.tsx", "utf8");
const start = source.indexOf("function DateRangePicker({");
const end = source.indexOf("\nexport function ReportsOverviewView(", start);
assert(start > 0 && end > start, "Cannot isolate production Overview date picker");
const actual = source.slice(start, end);
const compiled = ts.transpileModule(actual + "\nmodule.exports = { DateRangePicker };", {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022 },
}).outputText;
const effects = [];
const jsx = (type, props) => ({ type, props: props ?? {} });
const module = { exports: {} };
vm.runInNewContext(compiled, {
  module, exports: module.exports,
  require(id) {
    if (id === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
    throw Error("Unexpected date picker dependency: " + id);
  },
  useRef: value => ({ current: value }),
  useEffect: (effect) => effects.push(effect),
  ActionIcon: () => null,
}, { filename: "ReportsOverviewView.DateRangePicker.transpiled.cjs", timeout: 3000 });
const Picker = module.exports.DateRangePicker;
assert.equal(typeof Picker, "function");
const callbacks = [];
const focusCalls = [];
const opener = { isConnected: true, focus(options) { focusCalls.push({ target: "opener", options }); } };
const tree = Picker({
  months: [],
  onSelectPreset: () => {}, onSelectDay: () => {},
  onCancel: () => callbacks.push("cancel"), onApply: () => callbacks.push("apply"),
  returnFocusTarget: opener,
});
function* nodes(node) {
  if (Array.isArray(node)) { for (const item of node) yield* nodes(item); return; }
  if (!node || typeof node !== "object" || !("props" in node)) return;
  yield node;
  yield* nodes(node.props.children);
}
const parts=[...nodes(tree)];
const dialog=parts.find(node=>node.props["data-report-date-picker"]==="true");
assert.ok(dialog, "Production date picker must retain dialog semantics");
const today=parts.find(node=>node.type==="button"&&node.props.children==="Today");
assert.ok(today?.props.ref, "First preset must own keyboard focus on open");
today.props.ref.current={focus(options){focusCalls.push({ target: "Today", options });}};
assert.equal(effects.length, 1);
const cleanup=effects[0]();
assert.equal(focusCalls[0]?.target, "Today", "Popover must focus a useful date preset");
let prevented=false,stopped=false;
dialog.props.onKeyDown({
  key:"Escape", preventDefault(){prevented=true;}, stopPropagation(){stopped=true;},
});
assert.deepEqual(callbacks, ["cancel"]);
assert.equal(prevented && stopped, true, "Escape must not bubble to an unrelated parent modal");
dialog.props.onKeyDown({
  key:"ArrowDown", preventDefault(){throw Error("Unrelated keys must not be stolen");},
  stopPropagation(){throw Error("Unrelated keys must not be stopped");},
});
assert.deepEqual(callbacks, ["cancel"]);
cleanup();
assert.equal(focusCalls.at(-1)?.target, "opener", "Closing must return focus to original range trigger");
assert.equal(focusCalls.at(-1)?.options?.preventScroll, true);
opener.isConnected=false;
// Existing effect cleanup checks detached opener with the same actual cleanup.
const firstBefore=focusCalls.length;
const again=effects[0]();
again();
assert.equal(focusCalls.length,firstBefore+1,"Detached original trigger must not receive focus on cleanup");
assert.ok(source.includes("ref={rangeTriggerRef}") &&
  source.includes("returnFocusTarget={rangeTriggerRef.current}"),
  "Overview must pass its actual opening range button to the date picker");
console.log("Real Reports Overview date picker: initial focus, Escape cancel, propagation, opener restoration/detachment PASS");
