import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute the actual production reorder handler, not an invented mutex model.
// React's pending value is intentionally held at its previous render value.
const code = fs.readFileSync("src/ListBoard.tsx", "utf8").replace(/\r\n/g, "\n");
const start = code.indexOf("  const commitDrop = async (");
const end = code.indexOf("\n  const submitCreate = async", start);
assert(start >= 0 && end > start, "Production commitDrop boundary missing");
const handlerSource = code.slice(start, end);
for (const token of [
  "boardReorderInFlightRef.current",
  "boardReorderInFlightRef.current = true",
  "boardReorderInFlightRef.current = false",
  "await reorderListBoardTask(",
  "await moveListBoardTask(",
  "await refreshAfterMutation(taskId)",
]) assert(handlerSource.includes(token), `Missing real reorder admission/settlement: ${token}`);
const executable = ts.transpileModule(
  handlerSource + "\ncommitDrop;",
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
const harness = () => {
  const owner = { current: false };
  const writes = [], refreshes = [], errors = [], pendingValues = [];
  const ctx = {
    boardReorderInFlightRef: owner,
    interactionReorderEnabled: true,
    target: { kind: "list", id: "list-A" },
    mutationPendingTaskId: null,
    mutationRefreshBlocked: false,
    findTask: () => ({ id: "task-A", title: "Alpha" }),
    isManualReorderTask: () => true,
    LANES: [{ key: "thisWeek", title: "This Week" }],
    LANE_TOKEN: { backlog: "backlog", thisWeek: "this_week", today: "today" },
    setMutationPendingTaskId: (v) => pendingValues.push(v),
    setMutationError: (v) => { if (v) errors.push(v); },
    setMutationStatus: () => {},
    setMutationRefreshBlocked: () => {},
    reorderListBoardTask: () => { const d = deferred(); writes.push({ kind: "reorder", ...d }); return d.promise; },
    moveListBoardTask: () => { const d = deferred(); writes.push({ kind: "move", ...d }); return d.promise; },
    refreshAfterMutation: () => { const d = deferred(); refreshes.push(d); return d.promise; },
    handleCommittedRefreshFailure: (e) => errors.push(String(e)),
    formatInvokeError: (e) => String(e),
  };
  const drop = vm.runInNewContext(executable, ctx);
  return { drop, owner, writes, refreshes, errors, pendingValues };
};

// Same-render, rapid keyboard action after pointer (or a second keypress)
// must never enqueue a second mutation even before React commits disabled UI.
{
  const h = harness();
  const initial = h.drop("task-A", "backlog", "thisWeek", null);
  assert.equal(h.owner.current, true);
  assert.equal(h.writes.length, 1);
  assert.equal(await h.drop("task-A", "backlog", "today", null), "restored");
  assert.equal(h.writes.length, 1, "only one native move can be admitted");
  h.writes[0].resolve();
  await flush();
  assert.equal(h.refreshes.length, 1);
  assert.equal(await h.drop("task-A", "backlog", "today", null), "restored",
    "admission must remain closed after durable write until readback");
  h.refreshes[0].resolve();
  assert.equal(await initial, "settled");
  assert.equal(h.owner.current, false);
  const next = h.drop("task-A", "backlog", "today", null);
  assert.equal(h.writes.length, 2, "a later deliberate move is admitted after complete settlement");
  h.writes[1].resolve();
  await flush();
  h.refreshes[1].resolve();
  assert.equal(await next, "settled");
  assert.equal(h.owner.current, false);
}

// An authoritative write failure releases the owner, restores the drag, and
// admits a corrected user retry; a late promise cannot leak a permanent lock.
{
  const h = harness();
  const rejected = h.drop("task-A", "backlog", "backlog", "anchor-B");
  assert.equal(await h.drop("task-A", "backlog", "backlog", "anchor-C"), "restored");
  h.writes[0].reject(new Error("stale reorder"));
  assert.equal(await rejected, "restored");
  assert.equal(h.owner.current, false);
  assert.equal(h.errors.length, 1);
  const retry = h.drop("task-A", "backlog", "backlog", "anchor-C");
  assert.equal(h.writes.length, 2);
  h.writes[1].resolve(); await flush();
  h.refreshes[0].resolve();
  assert.equal(await retry, "settled");
}

// Persistence succeeded but readback failed: release the synchronous owner,
// keep the existing fail-closed refresh contract (tested separately).
{
  const h = harness();
  const saved = h.drop("task-A", "backlog", "thisWeek", null);
  h.writes[0].resolve(); await flush();
  h.refreshes[0].reject(new Error("saved but stale"));
  assert.equal(await saved, "needs_refresh");
  assert.equal(h.owner.current, false);
  assert.equal(h.errors.length, 1);
}
console.log("Board real reorder handler synchronous keyboard/pointer and readback admission passed.");
