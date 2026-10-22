import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise the actual mounted HomeDashboard hooks and retry click callback.
// A failed initial read must neither render "No lists yet" nor require navigation.
const source = readFileSync("src/HomeDashboard.tsx", "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const jsx = (type, props) => ({ type, props: props ?? {} });
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
function harness() {
  const state = [], effects = [], calls = [];
  let stateIndex = 0, effectIndex = 0, queued = [], disposed = false, writesAfterUnmount = 0;
  const react = {
    useState(initial) {
      const index = stateIndex++;
      if (!(index in state)) state[index] = initial;
      return [state[index], (value) => {
        if (disposed) writesAfterUnmount++;
        state[index] = typeof value === "function" ? value(state[index]) : value;
      }];
    },
    useMemo(factory) { return factory(); },
    useEffect(fn, deps) {
      const index = effectIndex++;
      const saved = effects[index];
      if (!saved || deps.some((value, position) => !Object.is(value, saved.deps[position]))) {
        queued.push({ index, fn, deps });
      }
    },
  };
  const mod = { exports: {} };
  vm.runInNewContext(compiled, {
    module: mod, exports: mod.exports,
    require(id) {
      if (id === "react") return react;
      if (id === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
      if (id === "@tauri-apps/api/core") return { invoke: (command) => {
        assert.equal(command, "get_home_snapshot");
        const request = deferred();
        calls.push(request);
        return request.promise;
      } };
      if (id === "./diagnosticApi") return { formatInvokeError: (error) => String(error?.message ?? error) };
      if (id === "./ActionIcon") return { ActionIcon() {} };
      if (id === "./ListIcon") return { ListIcon() {} };
      if (id === "./listSpectrumColor") return { listIconContrast: () => "white" };
      if (id === "./overlayPrimitives") return { Menu() {}, MenuItem() {} };
      if (id.endsWith(".css")) return {};
      throw Error("Unexpected Home dependency: " + id);
    },
  }, { filename: "HomeDashboard.transpiled.cjs" });
  assert.equal(typeof mod.exports.HomeDashboard, "function");
  return {
    calls,
    render(props = {}) {
      stateIndex = 0;
      effectIndex = 0;
      queued = [];
      const tree = mod.exports.HomeDashboard({ refreshKey: 0, fixtureHour: 10, ...props });
      for (const { index, fn, deps } of queued) {
        effects[index]?.cleanup?.();
        effects[index] = { deps, cleanup: fn() };
      }
      return tree;
    },
    unmount() {
      disposed = true;
      for (const slot of effects) slot?.cleanup?.();
    },
    get writesAfterUnmount() { return writesAfterUnmount; },
  };
}
function* walk(node) {
  if (Array.isArray(node)) { for (const child of node) yield* walk(child); return; }
  if (!node || typeof node !== "object" || !("props" in node)) return;
  yield node;
  yield* walk(node.props.children);
}
function find(tree, predicate) { return [...walk(tree)].find(predicate); }
const byClass = (tree, value) => find(tree, node => (node.props.className ?? "").split(" ").includes(value));
const flush = async () => {
  await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
};

{
  const h = harness();
  let tree = h.render();
  assert.equal(h.calls.length, 1, "Mount issues one real SQLite-backed snapshot read");
  assert.ok(byClass(tree, "home-dashboard__loading"));
  h.calls[0].reject(new Error("temporary local database busy"));
  await flush();
  tree = h.render();
  assert.ok(byClass(tree, "home-dashboard__error"), "Read failure must remain explicit");
  assert.equal(byClass(tree, "home-dashboard__empty"), undefined, "Read error is not an empty list catalog");
  const retry = find(tree, node => node.props["data-home-read-retry"] === "true");
  assert.ok(retry, "Error provides a reachable in-place retry button");
  retry.props.onClick();
  tree = h.render();
  assert.equal(h.calls.length, 2, "Click starts exactly one fresh native read");
  assert.equal(byClass(tree, "home-dashboard__error"), undefined, "Retry clears stale failure");
  assert.ok(byClass(tree, "home-dashboard__loading"), "Pending retry visibly represents loading");
  h.calls[1].resolve({ lists: [], pendingCount: 0, aggregateEstSeconds: 0 });
  await flush();
  tree = h.render();
  assert.ok(byClass(tree, "home-dashboard__empty"), "Only a successful empty read may display an empty catalog");
  assert.equal(find(tree, node => node.props["data-home-read-retry"] === "true"), undefined);
  h.unmount();
}
{
  // External refresh supersedes the earlier read without stale data overriding it.
  const h = harness();
  h.render();
  h.render({ refreshKey: 1 });
  assert.equal(h.calls.length, 2);
  h.calls[0].reject(new Error("obsolete read failed"));
  await flush();
  let tree = h.render({ refreshKey: 1 });
  assert.equal(byClass(tree, "home-dashboard__error"), undefined);
  h.calls[1].resolve({ lists: [], pendingCount: 0, aggregateEstSeconds: 0 });
  await flush();
  tree = h.render({ refreshKey: 1 });
  assert.ok(byClass(tree, "home-dashboard__empty"));
  h.unmount();
}
{
  const h = harness();
  h.render();
  h.unmount();
  h.calls[0].resolve({ lists: [], pendingCount: 0, aggregateEstSeconds: 0 });
  await flush();
  assert.equal(h.writesAfterUnmount, 0, "Late successful read cannot update disposed Home");
}
{
  const h = harness();
  const snapshot = { lists: [], pendingCount: 0, aggregateEstSeconds: 0 };
  const tree = h.render({ fixtureSnapshot: snapshot });
  assert.equal(h.calls.length, 0, "Visual fixture must never call production storage");
  assert.ok(byClass(tree, "home-dashboard__empty"));
  h.unmount();
}
console.log("Actual Home read: failure, retry, successful empty, refresh supersession, fixture isolation and unmount PASS");
