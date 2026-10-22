import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
import ts from "typescript";

// Mount the actual SoundPreferenceControl render/callbacks with synchronous
// state slots, then simulate Escape moving range focus to its opener.
const source = readFileSync("src/SoundPreferenceControl.tsx", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
} }).outputText;
const slots = [], refs = []; let stateIndex = 0, refIndex = 0;
const react = {
  useState(initial) { const i=stateIndex++; if (!(i in slots)) slots[i]=initial;
    return [slots[i], next => {slots[i] = typeof next === "function" ? next(slots[i]) : next;}]; },
  useRef(initial) { const i=refIndex++; if (!(i in refs)) refs[i]={current:initial}; return refs[i]; },
  useEffect() {},
  useId() { return "test-volume-dialog"; },
};
const jsx = (type, props) => ({ type, props: props ?? {} });
const module = { exports: {} };
vm.runInNewContext(compiled, {
  module, exports: module.exports,
  require(id) {
    if (id === "react") return react;
    if (id === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
    if (id === "./ActionIcon") return { ActionIcon() {} };
    if (id === "./localSoundCatalog") return {
      LOCAL_SOUND_OPTIONS: [{ id:"bell", label:"Bell" }],
      playLocalSoundPreview: async () => {},
    };
    throw Error("Unexpected SoundPreferenceControl import: " + id);
  },
}, { filename: "SoundPreferenceControl.transpiled.cjs" });
const saved = [];
const props = {
  selectedSound: null, defaultSound: "bell", volumePercent: 20,
  disabled: false, saving: false, soundLabel: "Alert sound",
  volumeLabel: "Alert volume", onSoundChange() {}, onVolumeCommit(value) {saved.push(value); return true;},
};
function render() { stateIndex=0; refIndex=0; return module.exports.SoundPreferenceControl(props); }
function* nodes(node) {
  if (Array.isArray(node)) { for (const part of node) yield* nodes(part); return; }
  if (!node || typeof node !== "object" || !("props" in node)) return;
  yield node;
  yield* nodes(node.props.children);
}
const match = (tree, pred) => [...nodes(tree)].find(pred);
function getTrigger(tree) {
  const element = match(tree, node => node.props["data-sound-volume-trigger"] === "true");
  assert.ok(element); return element;
}
function getRange(tree) {
  const element = match(tree, node => node.type === "input" && node.props.type === "range");
  assert.ok(element); return element;
}
let tree = render();
getTrigger(tree).props.onClick();
tree = render();
getRange(tree).props.onChange({ target: { value: "65" } });
tree = render();
let range = getRange(tree);
let popover = match(tree, node => node.props["data-sound-volume-popover"] === "true");
assert.ok(popover);
getTrigger(tree).props.ref.current = { focus: () => range.props.onBlur() };
let prevented = false, stopped = false;
popover.props.onKeyDown({ key:"Escape", preventDefault(){prevented=true;}, stopPropagation(){stopped=true;} });
assert.equal(prevented && stopped, true, "Escape is owned by the volume popover");
assert.deepEqual(saved, [], "Escape-driven range blur must not persist the unsaved volume");
tree = render();
assert.equal(match(tree, node => node.props["data-sound-volume-popover"] === "true"), undefined);
getTrigger(tree).props.onClick();
tree = render();
range = getRange(tree);
assert.equal(range.props.value, 20, "Reopened volume starts at committed preference, not canceled draft");
range.props.onChange({ target:{value:"75"} });
tree=render();range=getRange(tree);
await range.props.onBlur();
assert.deepEqual(saved, [75], "Normal range blur still commits a newly selected volume");
await range.props.onBlur();
assert.deepEqual(saved, [75], "Duplicate blur cannot double-save a committed range");
console.log("Real SoundPreferenceControl Escape cancels blur-save; normal blur and duplicate exclusion PASS");
