import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("src/ListBoard.tsx", "utf8").replace(/\r\n/g, "\n");
const start = source.indexOf("  const refreshAfterMutation = async (taskId: string) => {");
const end = source.indexOf("\n  const handleCommittedRefreshFailure", start);
assert(start >= 0 && end > start, "Actual Board post-mutation readback handler must exist");
const extracted = source.slice(start, end).replace("taskId: string", "taskId");
assert.match(extracted, /\+\+externalRefreshRevisionRef\.current/,
  "saved mutations must invalidate older initial/invalidation reads");
assert.match(extracted, /revision !== externalRefreshRevisionRef\.current/,
  "a superseded saved-mutation response must not publish a stale snapshot");
const committedTarget = source.slice(
  source.indexOf("  const committedTargetKeyRef = useRef("),
  source.indexOf("  const pointerDragCleanup"),
);
assert(committedTarget.includes("useLayoutEffect(")
  && committedTarget.includes("++externalRefreshRevisionRef.current"),
"board target changes must invalidate pending readbacks at the committed DOM boundary");

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function harness() {
  const revision = { current: 0 };
  const pending = [];
  const accepted = [];
  const settling = [];
  const context = {
    externalRefreshRevisionRef: revision,
    target: { kind: "list", id: "list-A" },
    getListBoardSnapshot: () => {
      const read = deferred();
      pending.push(read);
      return read.promise;
    },
    setSnapshot: (value) => accepted.push(value),
    markSettling: (taskId) => settling.push(taskId),
  };
  const refresh = vm.runInNewContext(`${extracted}\nrefreshAfterMutation;`, context);
  return { revision, pending, accepted, settling, refresh };
}

// A cross-window invalidation that accepted a newer snapshot must not be
// overwritten by a late response from a committed mutation's older read.
{
  const h = harness();
  const stale = h.refresh("task-A");
  h.revision.current += 1;
  const newer = { version: 2 };
  h.accepted.push(newer);
  h.pending[0].resolve({ version: 1 });
  await assert.rejects(stale, /board changed while confirming/);
  assert.equal(h.accepted.at(-1), newer);
  assert.deepEqual(h.settling, []);
}

// Two simultaneous readbacks: the most recent generation wins regardless of
// network resolution order; stale success must be reported as uncertain.
{
  const h = harness();
  const older = h.refresh("task-A");
  const latest = h.refresh("task-B");
  const fresh = { version: 4 };
  h.pending[1].resolve(fresh);
  await latest;
  h.pending[0].resolve({ version: 3 });
  await assert.rejects(older, /board changed while confirming/);
  assert.equal(h.accepted.length, 1);
  assert.equal(h.accepted[0], fresh);
  assert.deepEqual(h.settling, ["task-B"]);
}

// With no competing read, the same actual handler must accept the committed
// result and preserve the original settling path.
{
  const h = harness();
  const result = h.refresh("task-C");
  const current = { version: 1 };
  h.pending[0].resolve(current);
  await result;
  assert.equal(h.accepted[0], current);
  assert.deepEqual(h.settling, ["task-C"]);
}
console.log("Board committed-read freshness/target fence actual-handler regressions passed.");
