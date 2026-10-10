import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("src/ListBoard.tsx", "utf8");
const section = (start, end) => {
  const a = source.indexOf(start);
  const b = source.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `Missing Board implementation boundary: ${start}`);
  return source.slice(a, b);
};
const create = section("const submitCreate = async () => {", "const submitTitleEdit = async () => {");
const duplicate = section("const duplicateTaskFromBoard = async", "const handleCommittedSubtaskRefreshFailure");
const quickTask = fs.readFileSync("src/SearchPalette.tsx", "utf8");
assert(quickTask.includes("const quickTaskInFlightRef = useRef(false);")
  && quickTask.includes("if (quickTaskPending || quickTaskInFlightRef.current) return;")
  && quickTask.indexOf("quickTaskInFlightRef.current = true;") < quickTask.indexOf("await createListBoardTask(")
  && quickTask.includes("quickTaskInFlightRef.current = false;\n      setQuickTaskPending(false);"),
  "Quick task create must synchronously exclude same-tick duplicate submissions and allow retry after failure");
assert(source.includes("const createInFlightRef = useRef(false);"));
assert(source.includes("const duplicateInFlightRef = useRef(false);"));
assert(create.includes("|| createInFlightRef.current") &&
  create.indexOf("createInFlightRef.current = true;") < create.indexOf("await createListBoardTask("));
assert(create.includes("createInFlightRef.current = false;\n      setEditorMutationPending(false);"),
  "failed create must release the lock for corrected input and retry");
assert(create.includes("} finally {\n      createInFlightRef.current = false;"),
  "saved create must keep the lock across authoritative refresh and release afterward");
assert(duplicate.includes("|| duplicateInFlightRef.current") &&
  duplicate.indexOf("duplicateInFlightRef.current = true;") < duplicate.indexOf("await duplicateListBoardTask("));
assert(duplicate.includes("} finally {\n      duplicateInFlightRef.current = false;"),
  "failed/saved duplicate must release the lock after refresh");

// Deterministic same-render, blocked-IPC model. React setState can be deferred;
// a synchronous owner must reject a second request before that render occurs.
function exclusive() {
  let pending = false;
  return {
    async run(mutation, refresh) {
      if (pending) return false;
      pending = true;
      try {
        await mutation();
        await refresh();
        return true;
      } finally {
        pending = false;
      }
    },
    get pending() { return pending; },
  };
}
const barrier = () => {
  let resolve;
  const promise = new Promise((r) => { resolve = r; });
  return { promise, resolve };
};
const gate = exclusive();
const blocked = barrier();
let writes = 0;
let refreshes = 0;
const first = gate.run(async () => { await blocked.promise; writes += 1; }, async () => { refreshes += 1; });
assert.equal(gate.pending, true);
const second = gate.run(async () => { writes += 1; }, async () => { refreshes += 1; });
assert.equal(await second, false, "same-tick second submit must be ignored before React re-render");
blocked.resolve();
assert.equal(await first, true);
assert.equal(writes, 1);
assert.equal(refreshes, 1);
assert.equal(gate.pending, false);

const failed = barrier();
const rejected = gate.run(async () => { await failed.promise; throw new Error("storage busy"); }, async () => {});
assert.equal(await gate.run(async () => { writes += 1; }, async () => {}), false);
failed.resolve();
await assert.rejects(rejected, /storage busy/);
assert.equal(gate.pending, false, "failed IPC must release for retry");
assert.equal(await gate.run(async () => { writes += 1; }, async () => {}), true);
assert.equal(writes, 2);

const refreshGate = exclusive();
const refreshBarrier = barrier();
const saved = refreshGate.run(async () => { writes += 1; }, async () => { await refreshBarrier.promise; });
assert.equal(await refreshGate.run(async () => { writes += 1; }, async () => {}), false,
  "mutation lock must remain held after persistence until authoritative refresh");
refreshBarrier.resolve();
assert.equal(await saved, true);
assert.equal(refreshGate.pending, false);
assert.equal(writes, 3);

const refreshError = exclusive();
await assert.rejects(refreshError.run(async () => { writes += 1; }, async () => {
  throw new Error("read-after-commit unavailable");
}), /read-after-commit unavailable/);
assert.equal(refreshError.pending, false, "failed post-commit refresh must release the synchronous guard");
console.log("Board/Search create/duplicate synchronous exclusion, delayed-refresh guard and retry contracts passed.");
