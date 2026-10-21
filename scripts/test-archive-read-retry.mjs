import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const jsx = (type, props) => ({ type, props: props ?? {} });

function createArchiveHarness(file, componentName) {
  const state = [], refs = [], effectSlots = [], readCalls = [];
  let stateIndex = 0, refIndex = 0, effectIndex = 0, scheduled = [], writesAfterDispose = 0, disposed = false;
  const react = {
    useState(initial) {
      const index = stateIndex++;
      if (!(index in state)) state[index] = initial;
      return [state[index], (value) => {
        if (disposed) writesAfterDispose++;
        state[index] = typeof value === "function" ? value(state[index]) : value;
      }];
    },
    useRef(initial) {
      const index = refIndex++;
      if (!(index in refs)) refs[index] = { current: initial };
      return refs[index];
    },
    useMemo(factory) { return factory(); },
    useEffect(effect, deps) {
      const index = effectIndex++;
      const current = effectSlots[index];
      if (!current || deps.some((value, position) => !Object.is(value, current.deps[position]))) {
        scheduled.push({ index, effect, deps });
      }
    },
  };
  const getArchive = () => new Promise((resolve, reject) => readCalls.push({ resolve, reject }));
  const sources = {
    "./diagnosticApi": { formatInvokeError: (error) => String(error?.message ?? error) },
    "./listSettingsApi": {
      getArchiveSnapshot: getArchive, getArchivedListsForSettings: getArchive,
      permanentlyDeleteListFromSettings: async () => {},
      restoreListFromSettings: async () => {},
      permanentlyDeleteArchivedDoneTaskFromSettings: async () => {},
    },
    "./ListIcon": { ListIcon() {} },
    "./ActionIcon": { ActionIcon() {} },
    "./listSpectrumColor": { listIconContrast: () => "white" },
    "./ListMutationConfirmDialog": { ListMutationConfirmDialog() {} },
  };
  const compiled = ts.transpileModule(readFileSync(new URL(file, root), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports,
    require(id) {
      if (id === "react") return react;
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
      if (id.endsWith(".css")) return {};
      if (id in sources) return sources[id];
      throw Error("Unexpected archive dependency: " + id);
    },
  }, { filename: file });
  const Component = module.exports[componentName];
  assert.equal(typeof Component, "function", "Must exercise the production component, not a copy");
  return {
    readCalls,
    render() {
      stateIndex = 0; refIndex = 0; effectIndex = 0; scheduled = [];
      const tree = Component({});
      for (const { index, effect, deps } of scheduled) {
        effectSlots[index]?.cleanup?.();
        effectSlots[index] = { deps, cleanup: effect() };
      }
      return tree;
    },
    unmount() {
      disposed = true;
      for (const slot of effectSlots) slot?.cleanup?.();
    },
    get writesAfterDispose() { return writesAfterDispose; },
  };
}

function* walk(node) {
  if (Array.isArray(node)) { for (const child of node) yield* walk(child); return; }
  if (!node || typeof node !== "object" || !("props" in node)) return;
  yield node;
  yield* walk(node.props.children);
}
function nodeWith(tree, attribute, value = "true") {
  return [...walk(tree)].find((item) => item.props[attribute] === value);
}
async function flush() {
  await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
}
for (const { file, name, marker, success, emptyMarker } of [
  {
    file: "src/ArchivedListsPanel.tsx", name: "ArchivedListsPanel",
    marker: "lists", success: [], emptyMarker: "data-archived-lists-empty",
  },
  {
    file: "src/ArchivedDoneTasksPanel.tsx", name: "ArchivedDoneTasksPanel",
    marker: "done", success: { lists: [], doneTasks: [], filterLists: [] },
    emptyMarker: "data-archived-done-empty",
  },
]) {
  const h = createArchiveHarness(file, name);
  let view = h.render();
  assert.equal(h.readCalls.length, 1, name + " starts one authoritative native read");
  assert.ok(!nodeWith(view, "data-archive-retry", marker));
  h.readCalls[0].reject(Error("temporary native read error"));
  await flush();
  view = h.render();
  const retry = nodeWith(view, "data-archive-retry", marker);
  assert.ok(retry, name + " exposes retry on read failure");
  assert.equal(nodeWith(view, emptyMarker), undefined, "Read failure must never mean empty archive");
  retry.props.onClick();
  view = h.render();
  assert.equal(h.readCalls.length, 2, "Retry starts one fresh authoritative read");
  assert.equal(nodeWith(view, "data-archive-retry", marker), undefined, "Retry clears the old error");
  h.readCalls[1].resolve(success);
  await flush();
  view = h.render();
  assert.ok(nodeWith(view, emptyMarker), "A successfully empty archive is different from a failed read");
  assert.equal(nodeWith(view, "data-archive-retry", marker), undefined);
  h.unmount();

  const unmounted = createArchiveHarness(file, name);
  unmounted.render();
  unmounted.unmount();
  unmounted.readCalls[0].resolve(success);
  await flush();
  assert.equal(unmounted.writesAfterDispose, 0, "Late response after unmount must not mutate state");
}
console.log("Archive read failure, same-tab retry, true empty state and unmount guards: PASS");
