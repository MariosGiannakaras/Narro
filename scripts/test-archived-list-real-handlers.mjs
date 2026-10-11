import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Q11: execute the exact ArchivedListsPanel production callback bodies.
// The component's React pending flags remain stale in a single render; its
// synchronous per-mounted ref must independently serialize Restore/Delete.
const source = fs.readFileSync("src/ArchivedListsPanel.tsx", "utf8");
const first = source.indexOf("  async function restoreList(");
const last = source.indexOf("\n  return (\n", first);
assert(first >= 0 && last > first, "Missing real Archived Restore/Delete callbacks");
const fragment = source.slice(first, last);
for (const needle of ["async function restoreList(", "function requestDelete(",
  "async function confirmDelete()", "archiveMutationInFlightRef.current = true;",
  "archiveMutationInFlightRef.current = false;"]) {
  assert(fragment.includes(needle), `Missing required production Archive behavior: ${needle}`);
}
const executable = ts.transpileModule(
  `(() => {\n${fragment}\nreturn {restoreList,requestDelete,confirmDelete};\n})()`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const list = { id: "archived-a", title: "Archived A" }, other = { id: "archived-b", title: "Archived B" };
function harness({ restore, remove } = {}) {
  const calls = { restores: [], deletes: [], pendingRestore: [], pendingDelete: [],
    modal: [], errors: [], deleteErrors: [], listUpdates: [] };
  let lists = [list, other];
  const ctx = {
    pendingRestoreId: null, deletePending: false, deleteTarget: list, // stale render flags
    archiveMutationInFlightRef: { current: false },
    restoreListFromSettings: async id => {
      calls.restores.push(id);
      if (restore) await restore(id);
    },
    permanentlyDeleteListFromSettings: async id => {
      calls.deletes.push(id);
      if (remove) await remove(id);
    },
    setPendingRestoreId: value => calls.pendingRestore.push(value),
    setDeletePending: value => calls.pendingDelete.push(value),
    setLoadError: value => calls.errors.push(value),
    setDeleteError: value => calls.deleteErrors.push(value),
    setDeleteTarget: value => calls.modal.push(value),
    setLists: update => {
      lists = typeof update === "function" ? update(lists) : update;
      calls.listUpdates.push(lists.map(row => row.id));
    },
    formatInvokeError: error => String(error?.message ?? error),
  };
  const callbacks = vm.runInNewContext(executable, ctx, { timeout: 3000 });
  return { ...callbacks, ctx, calls, lists: () => lists };
}
// A pending Restore excludes another Restore, Delete and requestDelete on
// the same React render, even before visible pending state is republished.
{
  const wait = deferred();
  const h = harness({ restore: () => wait.promise });
  const firstRestore = h.restoreList(list);
  await h.restoreList(other);
  await h.confirmDelete();
  h.requestDelete(other);
  assert.deepEqual(h.calls.restores, ["archived-a"]);
  assert.deepEqual(h.calls.deletes, []);
  assert.deepEqual(h.calls.modal, []);
  assert.equal(h.ctx.archiveMutationInFlightRef.current, true);
  wait.resolve();
  await firstRestore;
  assert.deepEqual(h.lists().map(item => item.id), ["archived-b"]);
  assert.equal(h.ctx.archiveMutationInFlightRef.current, false);
  assert.deepEqual(h.calls.pendingRestore, ["archived-a", null]);
}
// Permanent Delete is irreversible only after accepted native write. Keep
// confirmation modal until then, and exclude Restore even on stale UI flags.
{
  const wait = deferred();
  const h = harness({ remove: () => wait.promise });
  const deleting = h.confirmDelete();
  await h.confirmDelete();
  await h.restoreList(other);
  h.requestDelete(other);
  assert.deepEqual(h.calls.deletes, ["archived-a"]);
  assert.equal(h.calls.modal.length, 0, "Cannot dismiss destructive dialog before commit");
  assert.equal(h.ctx.archiveMutationInFlightRef.current, true);
  wait.resolve();
  await deleting;
  assert.deepEqual(h.calls.modal, [null]);
  assert.deepEqual(h.lists().map(item => item.id), ["archived-b"]);
  assert.equal(h.ctx.archiveMutationInFlightRef.current, false);
  assert.deepEqual(h.calls.pendingDelete, [true, false]);
}
// A native error does not mutate the archived list projection, does not
// dismiss the confirmation, and releases exclusivity for a valid retry.
{
  let attempts = 0;
  const h = harness({ remove: async () => {
    if (++attempts === 1) throw new Error("native permanent delete rejected");
  } });
  await h.confirmDelete();
  assert.match(String(h.calls.deleteErrors.at(-1)), /native permanent delete rejected/);
  assert.deepEqual(h.calls.modal, []);
  assert.deepEqual(h.lists().map(item => item.id), ["archived-a", "archived-b"]);
  assert.equal(h.ctx.archiveMutationInFlightRef.current, false);
  await h.confirmDelete();
  assert.deepEqual(h.calls.deletes, ["archived-a", "archived-a"]);
  assert.deepEqual(h.calls.modal, [null]);
  assert.equal(h.ctx.archiveMutationInFlightRef.current, false);
}
{
  let attempts = 0;
  const h = harness({ restore: async () => {
    if (++attempts === 1) throw new Error("native restore rejected");
  } });
  await h.restoreList(list);
  assert.match(String(h.calls.errors.at(-1)), /native restore rejected/);
  assert.equal(h.ctx.archiveMutationInFlightRef.current, false);
  await h.restoreList(list);
  assert.deepEqual(h.calls.restores, ["archived-a", "archived-a"]);
  assert.deepEqual(h.lists().map(item => item.id), ["archived-b"]);
}
console.log("Actual Archive Restore/Delete handlers: same-render ownership, committed modal and retry passed.");
