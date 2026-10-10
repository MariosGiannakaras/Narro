import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("src/ReportsSessions.tsx", "utf8");
const start = source.indexOf("  const commitAddSession = async () => {");
const end = source.indexOf("  const exportSessions = async () => {", start);
assert(start >= 0 && end > start, "actual Reports manual Add Session must have a stable owner boundary");
const section = source.slice(start, end);
assert(source.includes("const sessionMutationInFlightRef = useRef(false);"),
  "manual Add Session must own one synchronous lock per mounted Reports Sessions view");
assert(section.includes("mutationPendingId || sessionMutationInFlightRef.current")
  && section.indexOf("sessionMutationInFlightRef.current = true;") < section.indexOf("await createManualReportSession(")
  && section.includes("finally {\n      sessionMutationInFlightRef.current = false;"),
  "real Add Session must claim before write and release on both failure and committed refresh");
assert(section.includes('setAddOpen(false);')
  && section.includes('await afterMutation("Session added successfully!", addDraft.taskId);'),
  "successful manual Add must retain existing dialog dismissal and authoritative refetch");

function barrier() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function sessionGate() {
  let active = false;
  return {
    async commit(write, refresh) {
      if (active) return false;
      active = true;
      try {
        await write();
        await refresh();
        return true;
      } finally {
        active = false;
      }
    },
    isActive() { return active; },
  };
}
const gate = sessionGate();
const persistence = barrier(), refresh = barrier();
let writes = 0, reads = 0;
const first = gate.commit(async () => { await persistence.promise; writes++; },
  async () => { await refresh.promise; reads++; });
assert.equal(gate.isActive(), true);
assert.equal(await gate.commit(async () => { writes++; }, async () => { reads++; }), false,
  "same-render second manual Add must not create a second session");
persistence.resolve();
await Promise.resolve();
assert.equal(writes, 1);
assert.equal(gate.isActive(), true, "write has committed, but lock must hold until authoritative refresh");
assert.equal(await gate.commit(async () => { writes++; }, async () => {}), false);
refresh.resolve();
assert.equal(await first, true);
assert.equal(reads, 1);
assert.equal(gate.isActive(), false);

const failed = barrier();
const retry = gate.commit(async () => { await failed.promise; }, async () => {});
assert.equal(await gate.commit(async () => { writes++; }, async () => {}), false);
failed.reject(new Error("SQLite busy"));
await assert.rejects(retry, /SQLite busy/);
assert.equal(gate.isActive(), false);
assert.equal(await gate.commit(async () => { writes++; }, async () => {}), true);
assert.equal(writes, 2, "a retry after failed persistence must be permitted exactly once");
const failedRefresh = gate.commit(async () => { writes++; }, async () => { throw new Error("read delayed"); });
await assert.rejects(failedRefresh, /read delayed/);
assert.equal(gate.isActive(), false, "failed post-write refresh must not strand the lock");
await import("./test-reports-session-write-owners.mjs");
console.log("Reports Add Session single-flight, delayed-refetch exclusion and failed-write retry passed.");
