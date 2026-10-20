import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const source = readFileSync(new URL("src/PreferenceSettingsRuntime.tsx", root), "utf8");
const sections = readFileSync(new URL("src/PreferenceSettingsSections.tsx", root), "utf8");
assert.match(source, /saveInFlightRef\.current = true;/);
assert.match(source, /finally \{\s*saveInFlightRef\.current = false;/);
assert.match(sections, /saving=\{busy\}/,
  "Sound controls must preserve their pending-save focus through the shared runtime owner");

let slot = 0;
let refSlot = 0;
const slots = [];
const refs = [];
const react = {
  createContext() { return { Provider: "provider" }; },
  useContext() { throw Error("Consumer not mounted in test"); },
  useEffect() {},
  useRef(initial) {
    const index = refSlot++;
    if (!(index in refs)) refs[index] = { current: initial };
    return refs[index];
  },
  useState(initial) {
    const index = slot++;
    if (!(index in slots)) slots[index] = initial;
    return [slots[index], next => {
      slots[index] = typeof next === "function" ? next(slots[index]) : next;
    }];
  },
};
let pendingSave = null;
let writes = 0;
let reads = 0;
const completed = { general: { timezone: "Automatic" }, revision: 5 };
const services = {
  getPreferenceSettings: async () => { reads++; return completed; },
  listPreferenceMonitors: async () => [],
  PREFERENCES_CHANGED_EVENT: "preferences-changed",
  updatePreferenceSettings: async () => {
    writes++;
    return new Promise((resolve, reject) => { pendingSave = { resolve, reject }; });
  },
};
const compiled = ts.transpileModule(source, { compilerOptions: {
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2022,
}}).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, {
  module, exports: module.exports,
  require(id) {
    if (id === "react") return react;
    if (id === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }) };
    if (id === "@tauri-apps/api/event") return { listen: async () => () => {} };
    if (id === "./diagnosticApi") return { formatInvokeError: error => String(error) };
    if (id === "./preferencesApi") return services;
    throw Error("Unexpected dependency " + id);
  },
}, { filename: "PreferenceSettingsRuntime.transpiled.cjs" });

function render() {
  slot = 0;
  refSlot = 0;
  const tree = module.exports.PreferenceSettingsRuntimeProvider({ children: null });
  return tree.props.value;
}
let state = render();
const first = state.save({ taskAlertVolumePercent: 55 }, "taskAlertVolume");
assert.equal(writes, 1, "First preference save starts once, synchronously");
const racing = await state.save({ timezone: "Europe/Athens" }, "timezone");
assert.equal(racing, false, "Concurrent independent preference save must be rejected before rerender");
assert.equal(writes, 1, "Second write cannot enter native persistence concurrently");
state = render();
assert.equal(state.pendingKey, "taskAlertVolume", "Published pending state matches authoritative admitted write");
pendingSave.resolve(completed);
assert.equal(await first, true);
state = render();
assert.equal(state.pendingKey, null, "Successful save releases pending UI state");
const second = state.save({ timezone: "Europe/Athens" }, "timezone");
assert.equal(writes, 2, "Subsequent save admitted after successful settlement");
pendingSave.reject(Error("forced native rejection"));
assert.equal(await second, false);
state = render();
assert.equal(state.pendingKey, null, "Failed write also releases single-flight admission");
assert.match(state.error, /forced native rejection/,
  "Failure must surface an error without modifying the committed snapshot");
assert.equal(reads, 1, "Failed save refreshes authoritative native settings exactly once");
const third = state.save({ successSoundVolumePercent: 75 }, "successSoundVolume");
assert.equal(writes, 3, "Failed save may not lock out legitimate future changes");
pendingSave.resolve(completed);
assert.equal(await third, true);
state = render();
assert.equal(state.error, null, "New successful change clears stale failure feedback");
console.log("Production Preferences write ownership: reentrant event-turn writes, pending UI, rollback and retry PASS");
