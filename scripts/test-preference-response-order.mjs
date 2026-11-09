import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise the actual compiled provider and IPC/event callbacks, not a
// substitute revision model. Every scenario has a new mounted provider.
const source = readFileSync(new URL("../src/PreferenceSettingsRuntime.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: {
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2022,
}}).outputText;
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const flush = async () => { for (let i = 0; i < 24; i++) await Promise.resolve(); };
const snapshot = (timezone) => ({ general: { timezone } });

function mountedProvider() {
  const state = [], refs = [], effects = [], writes = [], reads = [];
  let stateIndex = 0, refIndex = 0, listener = null;
  const react = {
    createContext: () => ({ Provider: "provider" }),
    useContext: () => { throw Error("no consumer in harness"); },
    useState(initial) {
      const index = stateIndex++;
      if (!(index in state)) state[index] = initial;
      return [state[index], next => {
        state[index] = typeof next === "function" ? next(state[index]) : next;
      }];
    },
    useRef(initial) {
      const index = refIndex++;
      if (!(index in refs)) refs[index] = { current: initial };
      return refs[index];
    },
    useEffect(effect) { effects.push(effect); },
  };
  const services = {
    PREFERENCES_CHANGED_EVENT: "preferences-changed",
    getPreferenceSettings() {
      const request = deferred();
      reads.push(request);
      return request.promise;
    },
    listPreferenceMonitors: async () => [],
    updatePreferenceSettings(patch) {
      const request = deferred();
      writes.push({ patch, ...request });
      return request.promise;
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports,
    require(id) {
      if (id === "react") return react;
      if (id === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }) };
      if (id === "@tauri-apps/api/event") return {
        listen: async (_name, callback) => {
          listener = callback;
          return () => { listener = null; };
        },
      };
      if (id === "./diagnosticApi") return { formatInvokeError: error => String(error.message ?? error) };
      if (id === "./preferencesApi") return services;
      throw Error("unexpected import: " + id);
    },
  }, { filename: "PreferenceSettingsRuntime.transpiled.cjs" });
  function render() {
    stateIndex = 0;
    refIndex = 0;
    const tree = module.exports.PreferenceSettingsRuntimeProvider({ children: null });
    return tree.props.value;
  }
  const current = render();
  const cleanup = effects[0]();
  return {
    current, reads, writes, render, cleanup,
    emit(payload) {
      assert(listener, "provider event listener must be mounted");
      listener({ payload });
    },
  };
}

// An older successful save reply is never allowed to regress a newer event.
// A post-write read resolves which of the event/save commits is actually latest.
{
  const h = mountedProvider();
  await flush();
  const pending = h.current.save({ timezone: "own" }, "timezone");
  h.emit(snapshot("newer-other-window"));
  h.writes[0].resolve(snapshot("older-save-reply"));
  await flush();
  assert.equal(h.render().snapshot.general.timezone, "newer-other-window");
  assert.equal(h.reads.length, 2, "event inversion requires authoritative post-commit reconciliation");
  h.reads[1].resolve(snapshot("newer-persisted"));
  assert.equal(await pending, true);
  assert.equal(h.render().snapshot.general.timezone, "newer-persisted");
  h.reads[0].resolve(snapshot("stale-initial"));
  await flush();
  assert.equal(h.render().snapshot.general.timezone, "newer-persisted");
  h.cleanup();
}

// An event can be older than OUR later durable save: the reply must not be
// discarded forever just because any event happened during the write.
{
  const h = mountedProvider();
  await flush();
  const pending = h.current.save({ timezone: "own-latest" }, "timezone");
  h.emit(snapshot("earlier-window-save"));
  h.writes[0].resolve(snapshot("own-latest"));
  await flush();
  h.reads[1].resolve(snapshot("own-latest"));
  assert.equal(await pending, true);
  assert.equal(h.render().snapshot.general.timezone, "own-latest");
  h.cleanup();
}

// Partial-save rejection triggers a recovery read; a newer broadcast delivered
// mid-read owns the view, even when the recovery resolves with stale data.
{
  const h = mountedProvider();
  await flush();
  const pending = h.current.save({ rememberTimerPositionOnRestart: true }, "timerPositionRestart");
  h.writes[0].reject(new Error("persisted toggle, position sync failed"));
  await flush();
  assert.equal(h.reads.length, 2);
  assert.match(h.render().error, /position sync failed/,
    "a rejected partial native commit must surface its original failure");
  h.emit(snapshot("newer-event-during-recovery"));
  h.reads[1].resolve(snapshot("outdated-recovery"));
  assert.equal(await pending, false);
  assert.equal(h.render().snapshot.general.timezone, "newer-event-during-recovery");
  assert.equal(h.render().error, null,
    "a later authoritative committed event clears an obsolete write error");
  h.cleanup();
}

// Without a concurrent broadcast, a successful response commits and excludes
// an older initial load; it should not manufacture an extra IPC read.
{
  const h = mountedProvider();
  await flush();
  const pending = h.current.save({ timezone: "saved" }, "timezone");
  h.writes[0].resolve(snapshot("saved"));
  assert.equal(await pending, true);
  assert.equal(h.reads.length, 1);
  h.reads[0].resolve(snapshot("old-initial"));
  await flush();
  assert.equal(h.render().snapshot.general.timezone, "saved");
  h.cleanup();
}

// A provider that has unmounted cannot publish a late save/read or event.
{
  const h = mountedProvider();
  await flush();
  const pending = h.current.save({ timezone: "in-flight" }, "timezone");
  h.cleanup();
  h.writes[0].resolve(snapshot("late"));
  assert.equal(await pending, true);
  assert.equal(h.render().snapshot, null);
}

// Rust adds a process-local commit revision. A late event carrying an older
// revision cannot overwrite a newer committed snapshot, even with reversed
// event delivery (which request-order guards alone cannot prevent).
{
  const h = mountedProvider();
  await flush();
  h.emit({ ...snapshot("revision-22"), commitRevision: "22" });
  h.emit({ ...snapshot("obsolete-revision-21"), commitRevision: "21" });
  assert.equal(h.render().snapshot.general.timezone, "revision-22");
  h.emit({ ...snapshot("revision-23"), commitRevision: "23" });
  assert.equal(h.render().snapshot.general.timezone, "revision-23");
  h.cleanup();
}

console.log("Actual Preferences provider: cross-window order, own-later commit, failed recovery, initial read and disposal PASS");
