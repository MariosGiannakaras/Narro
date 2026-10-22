import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute the ACTUAL AppShell callbacks, not a copy of their gate logic.
// React state remains stale until a later render; the ref must acquire the
// write owner synchronously before either archive or duplicate IPC is called.
const shell = fs.readFileSync("src/AppShell.tsx", "utf8").replace(/\r\n/g, "\n");
const start = shell.indexOf("  async function archiveList(list: HomeListCardSnapshot) {");
const end = shell.indexOf("  function openBoardTarget(", start);
assert(start >= 0 && end > start, "Cannot locate Home Archive/Duplicate production handlers");
const source = shell.slice(start, end);
for (const token of [
  "async function archiveList(",
  "async function duplicateList(",
  "homeListMutationInFlightRef.current = true;",
  "homeListMutationInFlightRef.current = false;",
  "archivePendingId || duplicatePendingId || homeListMutationInFlightRef.current",
  "await archiveListFromSettings(list.id);",
  "await duplicateListFromHome(list.id);",
]) assert(source.includes(token), "Home list write owner lacks " + token);

assert(shell.includes("onArchive: archivePendingId || duplicatePendingId ? undefined"),
  "Home Archive action must be disabled while either list mutation runs");
assert(shell.includes("onDuplicate: archivePendingId || duplicatePendingId ? undefined"),
  "Home Duplicate action must be disabled while either list mutation runs");
assert(shell.includes("editorState || archivePendingId || duplicatePendingId || hasActiveModalShortcutBoundary()"),
  "Home keyboard shortcuts must respect both pending list mutations");

const compiled = ts.transpileModule(
  `(() => {\n${source}\nreturn { archiveList, duplicateList };\n})()`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;

const listA = { id: "list-a", title: "A" };
const listB = { id: "list-b", title: "B" };
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((good, bad) => { resolve = good; reject = bad; });
  return { promise, resolve, reject };
};
function harness({ archive, duplicate } = {}) {
  const calls = { archived: [], duplicated: [], pendingArchive: [], pendingDuplicate: [], errors: [], refreshes: 0, searchClosures: [] };
  const gate = { current: false };
  const context = {
    archivePendingId: null,
    duplicatePendingId: null, // intentionally stale captured React render
    homeListMutationInFlightRef: gate,
    archiveListFromSettings: async id => {
      calls.archived.push(id);
      if (archive) await archive(id);
    },
    duplicateListFromHome: async id => {
      calls.duplicated.push(id);
      if (duplicate) await duplicate(id);
    },
    setArchivePendingId: value => calls.pendingArchive.push(value),
    setDuplicatePendingId: value => calls.pendingDuplicate.push(value),
    setSearchOpen: value => calls.searchClosures.push(value),
    setHomeMutationError: value => calls.errors.push(value),
    setHomeRefreshKey: update => { calls.refreshes = update(calls.refreshes); },
    formatInvokeError: failure => String(failure?.message ?? failure),
  };
  const handlers = vm.runInNewContext(compiled, context, { timeout: 3000 });
  return { ...handlers, gate, calls };
}

// Same-tick Archive, second Archive and competing Duplicate must start only
// one real IPC, even though React state has not rerendered.
{
  const delay = deferred();
  const h = harness({ archive: () => delay.promise });
  const first = h.archiveList(listA);
  await h.archiveList(listA);
  await h.archiveList(listB);
  await h.duplicateList(listA);
  assert.deepEqual(h.calls.archived, ["list-a"]);
  assert.deepEqual(h.calls.duplicated, []);
  assert.equal(h.gate.current, true);
  assert.equal(h.calls.refreshes, 0, "No success refresh before the persisted write");
  delay.resolve();
  await first;
  assert.equal(h.gate.current, false);
  assert.equal(h.calls.refreshes, 1);
  assert.deepEqual(h.calls.pendingArchive, ["list-a", null]);
  await h.duplicateList(listB);
  assert.deepEqual(h.calls.duplicated, ["list-b"], "Independent action becomes available after write completion");
  assert.equal(h.calls.refreshes, 2);
}

// Duplicate owns the same serialization gate, even for a different list.
{
  const delay = deferred();
  const h = harness({ duplicate: () => delay.promise });
  const first = h.duplicateList(listA);
  await h.duplicateList(listA);
  await h.archiveList(listB);
  assert.deepEqual(h.calls.duplicated, ["list-a"]);
  assert.deepEqual(h.calls.archived, []);
  assert.equal(h.gate.current, true);
  delay.resolve();
  await first;
  assert.equal(h.gate.current, false);
  assert.deepEqual(h.calls.pendingDuplicate, ["list-a", null]);
  assert.equal(h.calls.refreshes, 1);
}

// Native failures must not publish success and must immediately permit a
// deliberate retry without assuming the pending React closure is refreshed.
for (const operation of ["archiveList", "duplicateList"]) {
  let attempts = 0;
  const failing = async () => { if (++attempts === 1) throw Error("native storage temporarily unavailable"); };
  const h = harness({ archive: failing, duplicate: failing });
  await h[operation](listA);
  assert.equal(h.calls.refreshes, 0, operation + " failed write cannot refresh as success");
  assert.equal(h.gate.current, false, operation + " must release even after native failure");
  assert.match(String(h.calls.errors.at(-1)), /native storage temporarily unavailable/);
  await h[operation](listA);
  assert.equal(attempts, 2, operation + " must allow corrected retry");
  assert.equal(h.calls.refreshes, 1);
  assert.equal(h.gate.current, false);
}

console.log("Real Home Archive/Duplicate callbacks: same-render exclusivity, cross-action gate, committed refresh and retry PASS.");
