import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const viewSource = readFileSync(new URL("src/WindowsShortcutSettingsPanel.tsx", root), "utf8");
const css = readFileSync(new URL("src/windowsShortcutSettingsPanel.css", root), "utf8");
const dialogCss = readFileSync(new URL("src/windowsShortcutsDialog.css", root), "utf8");

const slots = [];
const refs = [];
let slotIndex = 0;
let refIndex = 0;
const react = {
  useState(initial) {
    const index = slotIndex++;
    if (!(index in slots)) slots[index] = initial;
    return [slots[index], next => {
      slots[index] = typeof next === "function" ? next(slots[index]) : next;
    }];
  },
  useRef(initial) {
    const index = refIndex++;
    if (!(index in refs)) refs[index] = { current: initial };
    return refs[index];
  },
  useEffect() {},
};
const jsx = (type, props) => ({ type, props: props ?? {} });
let writes = 0;
let reads = 0;
let pending = null;
const initial = {
  goToNarroEnabled: true,
  toggleFocusModeEnabled: true,
  findFocusTimerEnabled: true,
  diagnostics: {
    registered: true, focusToggleRegistered: true, findTimerRegistered: true,
    lastError: null, focusToggleLastError: null, findTimerLastError: null,
  },
};
const services = {
  getGlobalShortcutSettings: async () => { reads++; return initial; },
  setGlobalShortcutEnabled: async (kind, enabled) => {
    writes++;
    return new Promise((resolve, reject) => { pending = { resolve, reject, kind, enabled }; });
  },
};
const compiled = ts.transpileModule(viewSource, { compilerOptions: {
  module: ts.ModuleKind.CommonJS,
  jsx: ts.JsxEmit.ReactJSX,
  target: ts.ScriptTarget.ES2022,
}}).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, {
  module, exports: module.exports,
  require(id) {
    if (id === "react") return react;
    if (id === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
    if (id === "./diagnosticApi") return {
      applyNewerShortcutDiagnostics: (_, next) => next,
      formatInvokeError: failure => String(failure),
    };
    if (id === "./globalShortcutSettingsApi") return services;
    if (id === "@tauri-apps/api/event") return { listen: async () => () => {} };
    if (id.endsWith(".css")) return {};
    throw Error("Unanticipated production dependency " + id);
  },
}, { filename: "WindowsShortcutSettingsPanel.transpiled.cjs" });

function* descendants(node) {
  if (Array.isArray(node)) {
    for (const child of node) yield* descendants(child);
    return;
  }
  if (!node || typeof node !== "object" || !("props" in node)) return;
  yield node;
  yield* descendants(node.props.children);
}
const findClass = (tree, className) => [...descendants(tree)].filter(node =>
  typeof node.props.className === "string"
  && node.props.className.split(/\s+/).includes(className));

const view = module.exports.WindowsShortcutSettingsPanelView({
  snapshot: initial, onChange() {},
});
const chords = findClass(view, "windows-shortcuts__keycaps");
assert.equal(chords.length, 10, "All three global and seven app chords must be accessible");
assert.deepEqual([...chords].map(node =>
  findClass(node, "windows-shortcuts__accessible-chord")[0]?.props.children), [
    "Ctrl + Shift + B", "Ctrl + Shift + T", "Ctrl + Shift + P",
    "Ctrl + Alt + T", "Ctrl + Alt + B", "Ctrl + Alt + P",
    "Ctrl + Alt + S", "Ctrl + Alt + F", "Ctrl + Alt + N", "Ctrl + F",
  ], "Each visible keycap chord needs a single spoken, real-text equivalent");
for (const chord of chords) {
  assert.equal(chord.props["aria-label"], undefined,
    "Do not rely on aria-label on a generic span to expose the shortcut");
  const textNodes = findClass(chord, "windows-shortcuts__accessible-chord");
  assert.equal(textNodes.length, 1);
  const pieces = findClass(chord, "windows-shortcuts__keycap");
  assert.equal(pieces.length, textNodes[0].props.children.split(" + ").length);
  assert.ok(pieces.every(node => node.props["aria-hidden"] === "true"
    || node.props["aria-hidden"] === true),
    "Decorative visible keycaps must not be announced twice");
}
assert.match(css, /\.windows-shortcuts__accessible-chord \{/);
assert.match(css, /clip-path: inset\(50%\)/,
  "The accessible real-text chord must remain available to screen readers");
assert.match(dialogCss, /\.windows-shortcuts-dialog__surface/,
  "No visual changes to source-calibrated standalone shortcut dialog");

// Exercise the *actual* production component's native write callback without
// React commit: a second same-turn toggle must not register a competing chord.
function render() {
  slotIndex = 0;
  refIndex = 0;
  return module.exports.WindowsShortcutSettingsPanel();
}
let runtime = render();
runtime.props.onChange("goToNarro", false);
runtime.props.onChange("toggleFocusMode", false);
assert.equal(writes, 1, "Only the first same-event-turn native write is admitted");
assert.equal(pending.kind, "goToNarro");
runtime = render();
assert.equal(runtime.props.pendingKind, "goToNarro",
  "React pending UI and synchronous admission owner agree");
pending.reject(Error("Native shortcut registration conflict"));
await new Promise(resolve => setImmediate(resolve));
runtime = render();
assert.equal(runtime.props.pendingKind, null, "Failure unlocks new edits");
assert.match(runtime.props.error, /Native shortcut registration conflict/,
  "Native error must be visible after authoritative refresh");
assert.equal(reads, 1, "Failure reloads the authoritative saved shortcut state");
runtime.props.onChange("toggleFocusMode", false);
assert.equal(writes, 2, "The user can retry after failure");
assert.equal(pending.kind, "toggleFocusMode");
pending.resolve({ ...initial, toggleFocusModeEnabled: false });
await new Promise(resolve => setImmediate(resolve));
runtime = render();
assert.equal(runtime.props.pendingKind, null, "Committed write releases admission");
assert.equal(runtime.props.snapshot.toggleFocusModeEnabled, false,
  "Successful commit publishes the authoritative native response");
assert.equal(runtime.props.error, null, "Successful retry clears stale error");
console.log("Shortcuts: all ten spoken chords, keycap visuals, concurrent native saves, rollback, retry PASS");
