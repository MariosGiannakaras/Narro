import assert from "node:assert/strict";
import fs from "node:fs";

// Inspect actual production mutation handler boundaries, not a UI-only imitation.
const source = fs.readFileSync("src/FocusPanel.tsx", "utf8");
function section(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert(from >= 0 && to > from, `Missing Focus mutation boundary: ${start}`);
  return source.slice(from, to);
}
const row = section("  const commitRowMutation = async (", "  const makeTaskLive = async (");
const add = section("  const submitAddTask = async () => {", "  const confirmDelete = async () => {");
assert(source.includes("const rowMutationInFlightRef = useRef(false);")
  && source.includes("const addTaskInFlightRef = useRef(false);"),
"Actual Focus Panel needs synchronous, per-mounted owners for row mutation and add editor");
assert(row.includes("|| rowMutationInFlightRef.current) return;")
  && row.indexOf("rowMutationInFlightRef.current = true;") < row.indexOf("await mutation();"),
"Row duplicate/complete must lock before persistence, including same-render double action");
assert(row.includes("} finally {\n      rowMutationInFlightRef.current = false;"),
"Row lock must release even if persistence or authoritative refresh throws");
assert(row.includes("Task change was saved, but Focus could not refresh."),
"Persisted row changes may not be represented as failed writes");
assert(add.includes("|| addTaskInFlightRef.current) return;")
  && add.indexOf("addTaskInFlightRef.current = true;") < add.indexOf("await createListBoardTask({"),
"Focus Add Task must acquire synchronously before invoking the create command");
assert(add.includes("} finally {\n      addTaskInFlightRef.current = false;"),
"Add editor lock must release on both a rejected write and a committed refresh failure");
assert(add.indexOf("setAddTaskOpen(false);") > add.indexOf("await createListBoardTask({")
  && add.indexOf("setAddTaskOpen(false);") < add.indexOf("await refreshBoard();"),
"A committed task must dismiss create editor before any independently fallible reload");
assert(add.includes("Task was added, but Focus could not refresh."),
"Committed create plus failed refetch must not encourage duplicate retry");

// Deferred same-render event model; React setState is deliberately not a lock.
function barrier() {
  let resolve;
  let reject;
  const promise = new Promise((ok, no) => { resolve = ok; reject = no; });
  return { promise, resolve, reject };
}
function exclusive() {
  let writing = false;
  return {
    get busy() { return writing; },
    async run(write, refresh, committed = () => {}) {
      if (writing) return false;
      writing = true;
      try {
        await write();
        committed(); // Commit is acknowledged independently from a fallible refetch.
        try {
          await refresh();
        } catch {
          return "committed-refresh-failed";
        }
        return "committed";
      } finally {
        writing = false;
      }
    },
  };
}
const testCases = ["focus-row-duplicate", "focus-add-editor"];
for (const name of testCases) {
  const gate = exclusive();
  const blockWrite = barrier();
  const blockRefresh = barrier();
  let writes = 0, saved = 0, reloads = 0;
  const first = gate.run(
    async () => { await blockWrite.promise; writes += 1; },
    async () => { reloads += 1; await blockRefresh.promise; },
    () => { saved += 1; },
  );
  const sameRenderDuplicate = gate.run(async () => { writes += 1; }, async () => {});
  assert.equal(await sameRenderDuplicate, false, `${name} second event must be synchronously rejected`);
  assert.equal(writes, 0, `${name} must not persist before the blocked initial write`);
  blockWrite.resolve();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(await gate.run(async () => { writes += 1; }, async () => {}), false,
    `${name} guard must survive the post-write authoritative refresh`);
  blockRefresh.resolve();
  assert.equal(await first, "committed");
  assert.equal(writes, 1);
  assert.equal(saved, 1);
  assert.equal(reloads, 1);
  assert.equal(gate.busy, false);

  const broken = barrier();
  const rejected = gate.run(async () => { await broken.promise; }, async () => {});
  assert.equal(await gate.run(async () => { writes += 1; }, async () => {}), false);
  broken.reject(new Error("SQLite busy"));
  await assert.rejects(rejected, /SQLite busy/);
  assert.equal(gate.busy, false, `${name} failure must permit corrected user retry`);
  assert.equal(await gate.run(async () => { writes += 1; }, async () => {}), "committed");
  assert.equal(writes, 2);

  const refreshRejected = gate.run(async () => { writes += 1; }, async () => {
    throw new Error("connection lost after commit");
  }, () => { saved += 1; });
  assert.equal(await refreshRejected, "committed-refresh-failed");
  assert.equal(saved, 2, "successful create must not change to failed persistence after refresh error");
  assert.equal(gate.busy, false);
}
console.log("Focus Add/row exclusive synchronous submission, deferred refresh and committed-refresh failure contracts passed.");
