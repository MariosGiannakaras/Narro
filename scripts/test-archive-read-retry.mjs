import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const root = new URL("../", import.meta.url);

function harness(relative, componentName, readCommand) {
  const source = readFileSync(new URL(relative, root), "utf8");
  const pending = [];
  const slots = [];
  const refs = [];
  const effects = [];
  const cleanups = [];
  let stateIndex = 0;
  let refIndex = 0;
  let mounting = true;
  const react = {
    useState(initial) {
      const index = stateIndex++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (next) => {
        slots[index] = typeof next === "function" ? next(slots[index]) : next;
      }];
    },
    useRef(initial) {
      const index = refIndex++;
      if (!(index in refs)) refs[index] = { current: initial };
      return refs[index];
    },
    useEffect(effect) {
      if (mounting) effects.push(effect);
    },
    useMemo(compute) { return compute(); },
  };
  const jsx = (type, props) => ({ type, props: props ?? {} });
  const api = {
    [readCommand]: () => new Promise((resolve, reject) => pending.push({ resolve, reject })),
    restoreListFromSettings: async () => {},
    permanentlyDeleteListFromSettings: async () => {},
    permanentlyDeleteArchivedDoneTaskFromSettings: async () => {},
  };
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(compiled, {
    module: mod,
    exports: mod.exports,
    require(id) {
      if (id === "react") return react;
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
      if (id === "./diagnosticApi") return { formatInvokeError: (failure) => String(failure) };
      if (id === "./listSettingsApi") return api;
      if (id === "./listSpectrumColor") return { listIconContrast: () => "#000000" };
      if (id === "./ListIcon") return { ListIcon: () => null };
      if (id === "./ActionIcon") return { ActionIcon: () => null };
      if (id === "./ListMutationConfirmDialog") return { ListMutationConfirmDialog: () => null };
      if (id.endsWith(".css")) return {};
      throw Error("Unexpected production import in archive retry test: " + id);
    },
  }, { filename: relative + ".transpiled.cjs" });
  const props = {};
  function render() {
    stateIndex = 0;
    refIndex = 0;
    return mod.exports[componentName](props);
  }
  const initialTree = render();
  mounting = false;
  for (const effect of effects) {
    const cleanup = effect();
    if (typeof cleanup === "function") cleanups.push(cleanup);
  }
  return {
    initialTree,
    render,
    pending,
    snapshot: () => slots[0],
    unmount: () => cleanups.forEach((cleanup) => cleanup()),
  };
}

function* walk(node) {
  if (Array.isArray(node)) {
    for (const child of node) yield* walk(child);
    return;
  }
  if (!node || typeof node !== "object" || !("props" in node)) return;
  yield node;
  yield* walk(node.props.children);
}

function findData(tree, attribute) {
  return [...walk(tree)].find((element) => element.props[attribute] === "true");
}

const settle = async () => {
  await new Promise((resolve) => setImmediate(resolve));
};

for (const [source, component, api, retryAttribute, emptyAttribute, success] of [
  [
    "src/ArchivedListsPanel.tsx",
    "ArchivedListsPanel",
    "getArchivedListsForSettings",
    "data-archived-lists-retry",
    "data-archived-lists-empty",
    [{ id: "retained", title: "Recovered list", color: null, iconAsset: null,
      iconId: null, archivedAt: "2026-10-01T00:00:00Z", previewTasks: [] }],
  ],
  [
    "src/ArchivedDoneTasksPanel.tsx",
    "ArchivedDoneTasksPanel",
    "getArchiveSnapshot",
    "data-archived-done-retry",
    "data-archived-done-empty",
    { lists: [], doneTasks: [], filterLists: [] },
  ],
]) {
  const subject = harness(source, component, api);
  assert.equal(subject.pending.length, 1, component + " starts one authoritative read");
  assert.equal(findData(subject.initialTree, retryAttribute), undefined, "No retry before read failure");

  subject.pending[0].reject(Error("disk temporarily busy"));
  await settle();
  let tree = subject.render();
  const retry = findData(tree, retryAttribute);
  assert.ok(retry, component + " must expose a retry action after failed read");
  assert.equal(findData(tree, emptyAttribute), undefined,
    component + " must not claim an empty archive after a failed read");
  retry.props.onClick();
  retry.props.onClick();
  assert.equal(subject.pending.length, 2, component + " excludes same-render duplicate retries");
  tree = subject.render();
  assert.equal(findData(tree, retryAttribute), undefined, "Loading hides stale retry error");

  subject.pending[1].reject(Error("retry still busy"));
  await settle();
  const retryAgain = findData(subject.render(), retryAttribute);
  assert.ok(retryAgain, "Failed retry remains recoverable");
  retryAgain.props.onClick();
  assert.equal(subject.pending.length, 3, "Retry after rejection starts a new owned read");
  subject.pending[2].resolve(success);
  await settle();
  tree = subject.render();
  assert.equal(findData(tree, retryAttribute), undefined, "Successful reload dismisses retry");
  assert.ok(subject.snapshot() !== null, "Successful read publishes authoritative archive data");
  if (component === "ArchivedDoneTasksPanel") {
    assert.ok(findData(tree, emptyAttribute), "A truly empty successful read may show empty state");
  }
  subject.unmount();

  const disposed = harness(source, component, api);
  disposed.pending[0].reject(Error("initial read failed"));
  await settle();
  findData(disposed.render(), retryAttribute).props.onClick();
  assert.equal(disposed.pending.length, 2);
  disposed.unmount();
  disposed.pending[1].resolve(success);
  await settle();
  assert.equal(disposed.snapshot(), null, "Late retry cannot write archive state after unmount");
}

console.log("Mounted archived-list/done-task read failures, retry, duplicate exclusion and unmount: PASS");
