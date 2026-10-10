import assert from "node:assert/strict";
import fs from "node:fs";

const reports = fs.readFileSync("src/ReportsSessions.tsx", "utf8");
function region(start, end) {
  const i = reports.indexOf(start), j = reports.indexOf(end, i + start.length);
  assert(i >= 0 && j > i, `Missing actual Reports handler boundaries: ${start}`);
  return reports.slice(i, j);
}
assert(reports.includes("const sessionMutationInFlightRef = useRef(false);"),
  "Add/Edit/Delete need a shared owner, not one lock per action");
const edit = region("  const commitEndTime = async (", "  const deleteSession = async");
const del = region("  const deleteSession = async", "  const openAddSession = ");
const add = region("  const commitAddSession = async", "  const exportSessions = async");
for (const [name, source, mutation] of [
  ["Edit End Time", edit, "await editReportSession({"],
  ["Delete Session", del, "await deleteReportSession({"],
  ["Add Session", add, "await createManualReportSession({"],
]) {
  const guard = source.indexOf("sessionMutationInFlightRef.current");
  const acquire = source.indexOf("sessionMutationInFlightRef.current = true;");
  const call = source.indexOf(mutation);
  const release = source.lastIndexOf("sessionMutationInFlightRef.current = false;");
  assert(guard >= 0 && acquire > guard && call > acquire,
    `${name} must acquire the same immediate owner before the IPC command`);
  assert(release > call && source.includes("} finally {"),
    `${name} must release after persistence and authoritative refresh even on failure`);
  assert(source.includes("setMutationPendingId(null);"),
    `${name} must clear the displayed pending status on completion`);
}
assert(edit.includes("return false;") && edit.includes("durationSeconds === null"),
  "invalid end-time input must remain rejected before side effects");
assert(reports.includes('mutationPendingId !== "add" && !sessionMutationInFlightRef.current'),
  "Add Session modal cannot be dismissed by a second same-render cancel while committing");

// Bounded async model for shared Add/Edit/Delete interaction across two DOM
// handlers before React renders pending, and during a blocked read-after-write.
function hold() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return {promise, resolve, reject};
}
function owner() {
  let current = null;
  return {
    current: () => current,
    async commit(action, write, refresh = async () => {}) {
      if (current !== null) return false;
      current = action;
      try { await write(); await refresh(); return true; }
      finally { current = null; }
    },
  };
}
const actions = ["add", "edit", "delete"];
for (const action of actions) {
  const gate = owner(), writeWait = hold(), readWait = hold();
  let committed = 0;
  const pending = gate.commit(action, async () => {
    await writeWait.promise;
    committed++;
  }, async () => { await readWait.promise; });
  for (const competing of actions) {
    assert.equal(await gate.commit(competing, async () => {committed++;}), false,
      `${action} must exclude concurrent ${competing} before React pending state renders`);
  }
  writeWait.resolve();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(committed, 1);
  assert.equal(gate.current(), action);
  for (const competing of actions) {
    assert.equal(await gate.commit(competing, async () => {committed++;}), false,
      `${action} must exclude ${competing} while authoritative refresh is pending`);
  }
  readWait.resolve();
  assert.equal(await pending, true);
  assert.equal(committed, 1);
  assert.equal(gate.current(), null);

  const blocked = hold();
  const rejected = gate.commit(action, async () => { await blocked.promise; });
  assert.equal(await gate.commit("delete", async () => {committed++;}), false);
  blocked.reject(new Error("write failed"));
  await assert.rejects(rejected, /write failed/);
  assert.equal(gate.current(), null, `${action} failed write must release owner`);
  await assert.rejects(gate.commit(action, async () => {}, async () => {
    throw new Error("refresh failed");
  }), /refresh failed/);
  assert.equal(gate.current(), null, `${action} failed refresh must release owner`);
  assert.equal(await gate.commit(action, async () => {committed++;}), true);
  assert.equal(committed, 2);
}
console.log("Reports Edit/Delete/Add shared mutation exclusion and post-write recovery passed.");
