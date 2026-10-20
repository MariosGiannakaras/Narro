import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const source = readFileSync(new URL("src/SoundPreferenceControl.tsx", root), "utf8");
const sections = readFileSync(new URL("src/PreferenceSettingsSections.tsx", root), "utf8");

for (const [volume, toggle] of [
  ["taskAlertVolumePercent", "timedAlertsEnabled"],
  ["notificationVolumePercent", "notificationAlertsEnabled"],
  ["successSoundVolumePercent", "successSoundEnabled"],
]) {
  assert.match(sections, new RegExp(
    "volumePercent=\\{snapshot\\.[\\s\\S]*?\\." + volume + "\\}\\s+" +
    "disabled=\\{!snapshot\\.[\\s\\S]*?\\." + toggle + "\\}\\s+saving=\\{busy\\}"),
    volume + " must separate a pending save from a disabled parent setting");
}

const compiled = ts.transpileModule(source, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const slots = [];
let slot = 0;
const refs = [];
let refSlot = 0;
const hooks = {
  useState(initial) {
    const index = slot++;
    if (!(index in slots)) slots[index] = initial;
    return [slots[index], value => {
      slots[index] = typeof value === "function" ? value(slots[index]) : value;
    }];
  },
  useRef(initial) {
    const index = refSlot++;
    if (!(index in refs)) refs[index] = { current: initial };
    return refs[index];
  },
  useEffect() {},
  useId() { return "test-sound-volume"; },
};
const jsx = (type, props) => ({ type, props: props ?? {} });
const module = { exports: {} };
vm.runInNewContext(compiled, {
  module, exports: module.exports,
  require(id) {
    if (id === "react") return hooks;
    if (id === "react/jsx-runtime") return { jsx, jsxs: jsx };
    if (id === "./ActionIcon") return { ActionIcon: () => null };
    if (id === "./localSoundCatalog") return {
      LOCAL_SOUND_OPTIONS: [{ id: "tone", label: "Tone" }],
      playLocalSoundPreview: async () => {},
    };
    throw Error("Unexpected mocked dependency: " + id);
  },
}, { filename: "SoundPreferenceControl.transpiled.cjs" });

const SoundPreferenceControl = module.exports.SoundPreferenceControl;
const children = node => [node?.props?.children].flat(Infinity).filter(Boolean);
function find(node, predicate) {
  if (!node || typeof node !== "object") return null;
  if (predicate(node)) return node;
  for (const child of children(node)) {
    const match = find(child, predicate);
    if (match) return match;
  }
  return null;
}
let commits = 0;
let releaseCommit;
const pendingCommit = new Promise(resolve => { releaseCommit = resolve; });
const props = {
  selectedSound: "tone", defaultSound: "tone", volumePercent: 50,
  disabled: false, saving: false,
  soundLabel: "Task alert sound", volumeLabel: "Task alert volume",
  onSoundChange() {},
  onVolumeCommit() { commits++; return pendingCommit; },
};
function render(overrides = {}) {
  slot = 0;
  refSlot = 0;
  return SoundPreferenceControl({ ...props, ...overrides });
}
const trigger = tree => find(tree, n => n.props["data-sound-volume-trigger"] === "true");
const popover = tree => find(tree, n => n.props["data-sound-volume-popover"] === "true");
const range = tree => find(tree, n => n.type === "input" && n.props.type === "range");

let tree = render();
assert.equal(popover(tree), null);
trigger(tree).props.onClick();
tree = render();
assert.ok(popover(tree), "Speaker click must open an anchored volume popover");
range(tree).props.onChange({ target: { value: "55" } });
tree = render();
range(tree).props.onKeyUp({ key: "ArrowUp" });
assert.equal(commits, 1, "Keyboard adjustment must save exactly once");
tree = render({ saving: true });
assert.ok(popover(tree), "Pending native save must not unmount the open popover");
assert.equal(range(tree).props.disabled, false, "Pending save must keep the focused slider mounted and enabled");
assert.equal(range(tree).props["aria-disabled"], true, "Pending slider state must be announced");
assert.equal(trigger(tree).props.disabled, true, "Pending save must block duplicate speaker actions");
assert.equal(find(tree, n => n.type === "select").props.disabled, true,
  "Pending save must block concurrent sound-choice mutations");
let prevented = false;
range(tree).props.onKeyDown({ key: "ArrowUp", preventDefault() { prevented = true; } });
assert.ok(prevented, "Pending-save arrow presses must not change the controlled slider value");
range(tree).props.onChange({ target: { value: "60" } });
tree = render({ saving: true });
assert.equal(range(tree).props.value, 55, "Pending keyboard changes must not overwrite the saved draft");
range(tree).props.onKeyUp({ key: "ArrowUp" });
assert.equal(commits, 1, "Pending save must not send overlapping persistence writes");
releaseCommit(true);
await pendingCommit;
await Promise.resolve();
tree = render({ saving: false });
assert.ok(popover(tree), "Successful save must preserve popover until explicit dismissal");
refs[1].current = { focus() { this.focused = true; } };
popover(tree).props.onKeyDown({
  key: "Escape", preventDefault() {}, stopPropagation() {},
});
tree = render({ saving: false });
assert.equal(popover(tree), null, "Escape must dismiss the child popover");
assert.ok(refs[1].current.focused, "Escape must restore focus to the speaker trigger");
// Rejecting a native save must restore the last committed volume without
// accidentally closing the still-open child dialog or admitting an extra write.
props.onVolumeCommit = async () => false;
trigger(render()).props.onClick();
tree = render();
range(tree).props.onChange({ target: { value: "75" } });
tree = render();
range(tree).props.onKeyUp({ key: "End" });
await Promise.resolve();
await Promise.resolve();
tree = render();
assert.ok(popover(tree), "A failed native save must retain the volume surface");
assert.equal(range(tree).props.value, 50, "Rejected save must restore the committed value");

// A thrown/typed native error follows the other error path, preserving the
// original input value and presenting localized control feedback.
props.onVolumeCommit = async () => { throw Error("native backend refused save"); };
range(tree).props.onChange({ target: { value: "90" } });
tree = render();
range(tree).props.onKeyUp({ key: "Home" });
await Promise.resolve();
await Promise.resolve();
tree = render();
assert.equal(range(tree).props.value, 50, "Thrown save must roll back the draft");
assert.ok(find(tree, n => n.props.role === "status"),
  "Thrown save must show visible error feedback");
assert.ok(popover(tree), "Rejected volume save may not silently dismiss its popover");

// An actual disabled parent differs from a temporary save: its volume
// popover must not be exposed, and no new native write may be admitted.
tree = render({ disabled: true, saving: false });
assert.equal(popover(tree), null, "Parent-OFF suppresses the child popup");
assert.equal(trigger(tree).props.disabled, true, "Parent-OFF disables speaker trigger");
assert.equal(find(tree, n => n.type === "select").props.disabled, true,
  "Parent-OFF disables sound selector");
console.log("Production sound volume keyboard, pending save, focus, rollback, disabled owner and Escape: PASS");
