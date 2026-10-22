import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const pickerSource = readFileSync(new URL("src/BoardListPicker.tsx", root), "utf8");
const css = readFileSync(new URL("src/boardListPicker.css", root), "utf8");

const jsx = (type, props) => ({type, props: props ?? {}});
const react = {
  useEffect() {},
  useId: () => ":picker-a11y:",
  useRef: () => ({current: null}),
  useState: initial => [initial, () => {}],
};
const compiled = ts.transpileModule(pickerSource, {compilerOptions:{
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
  target: ts.ScriptTarget.ES2022,
}}).outputText;
const module = {exports:{}};
vm.runInNewContext(compiled, {
  module, exports: module.exports,
  require(id) {
    if (id === "react") return react;
    if (id === "react/jsx-runtime") return {jsx, jsxs:jsx, Fragment:"fragment"};
    if (id === "./ActionIcon") return {ActionIcon() {}};
    if (id === "./ListIcon") return {ListIcon() {}};
    if (id === "./listSpectrumColor") return {listIconContrast: () => "#ffffff"};
    if (id.endsWith(".css")) return {};
    throw Error("Unexpected picker production import: "+id);
  },
}, {filename:"BoardListPicker.transpiled.cjs"});

function* traverse(node) {
  if (Array.isArray(node)) {for (const child of node) yield* traverse(child); return;}
  if (!node || typeof node !== "object" || !("props" in node)) return;
  yield node;
  yield* traverse(node.props.children);
}
function render(target, variant, options, disabled=false) {
  const element = module.exports.BoardListPicker({
    selectedTarget:target, variant, options, disabled,
    onTargetChange: () => {},
  });
  const nodes=[...traverse(element)];
  const button=nodes.find(node => node.type==="button" &&
    node.props.className?.includes("board-list-picker__trigger"));
  assert.ok(button, "The production list selector must still be a real button");
  const current=nodes.find(node => node.type==="span" &&
    node.props.className==="board-list-picker__current");
  assert.ok(current, "Current selection must have a real description node");
  assert.equal(button.props["aria-describedby"], current.props.id,
    "The trigger must reference the *present* current selection");
  assert.equal(current.props.id, ":picker-a11y:-selection");
  assert.equal(button.props["aria-label"], variant==="focus" ? "Focus list" : "Planning list",
    "Preserve the established accessible trigger name and visual-fixture selectors");
  assert.equal(button.props["aria-haspopup"],"listbox");
  assert.equal(button.props["aria-controls"],":picker-a11y:");
  assert.equal(button.props["aria-expanded"],false);
  assert.equal(button.props.disabled,disabled);
  return current.props.children;
}
const lists=[{id:"one",title:"Project with a long descriptive name",color:null},
  {id:"two",title:"Second List",color:null}];
for (const variant of ["focus","board"]) {
  assert.equal(render("one",variant,lists),lists[0].title);
  assert.equal(render("two",variant,lists),lists[1].title,
    "Changing the authoritative selection must update the spoken description");
  assert.equal(render("__all_lists__",variant,lists),"All Lists");
  assert.equal(render("one",variant,lists,true),lists[0].title);
}
const focusCss=css.match(/\.board-list-picker--focus \.board-list-picker__current\s*\{([^}]+)\}/)?.[1];
assert.ok(focusCss,"Focus has a scoped current-label presentation");
for(const declaration of [
  "position: absolute", "width: 1px", "height: 1px", "overflow: hidden",
  "clip-path: inset(50%)", "white-space: nowrap",
]) assert.ok(focusCss.split(";").some(x=>x.trim()===declaration),
  "Selected title must be visually clipped but accessible: "+declaration);
assert.doesNotMatch(focusCss,/display\s*:\s*none|visibility\s*:\s*hidden/,
  "Do not erase the current selection from the accessibility tree");
assert.match(css,/\.board-list-picker__current,\s*\.board-list-picker__option-title\s*\{/,
  "Board text ellipsis and narrow-menu contracts must be preserved");
console.log("Production Board/Focus selector: dynamic accessible selected list, focus clipping and keyboard names PASS");
