import assert from "node:assert/strict";
import fs from "node:fs";

// Production-source guard wiring is checked separately from the asynchronous
// interleaving model, so synthetic tests cannot silently prove unused locks.
const source = fs.readFileSync("src/FocusPanel.tsx", "utf8");
const anchor = "const focusMutationOwnerRef = useRef<";
assert(source.includes(anchor) && source.includes('"row" | "add" | "make-live" | "change-list" | "delete" | "home" | null'),
  "All Focus write/exit paths must share one per-mounted synchronous owner");
const blocks = [
  ["row", "  const commitRowMutation = async (", "  const makeTaskLive = async (", "await mutation();"],
  ["make-live", "  const makeTaskLive = async (", "  const requestTaskChangeList = ", "await snapshotTimerSession();"],
  ["change-list", "  const confirmTaskChangeList = async () => {", "  const duplicateTask = ", "await changeListBoardTask({"],
  ["home", "  const exitFocusHome = async () => {", "  const submitAddTask = async () => {", "await pauseTimerForFocusHome();"],
  ["add", "  const submitAddTask = async () => {", "  const confirmDelete = async () => {", "await createListBoardTask({"],
  ["delete", "  const confirmDelete = async () => {", "  const statusError = ", "await permanentlyDeleteListBoardTask({"],
];
for (const [owner, start, end, write] of blocks) {
  const from = source.indexOf(start), to = source.indexOf(end, from + start.length);
  assert(from >= 0 && to > from, `${owner} must have real source handler boundaries`);
  const block = source.slice(from, to);
  const check = "if (focusMutationOwnerRef.current !== null) return;";
  const combinedCheck = "|| focusMutationOwnerRef.current !== null";
  const checkIndex = block.indexOf(check) >= 0 ? block.indexOf(check) : block.indexOf(combinedCheck);
  const claim = `focusMutationOwnerRef.current = "${owner}";`;
  const claimIndex = block.indexOf(claim), commandIndex = block.indexOf(write);
  const releaseIndex = block.lastIndexOf("focusMutationOwnerRef.current = null;");
  assert(checkIndex >= 0 && claimIndex > checkIndex && commandIndex > claimIndex,
    `${owner} must synchronously exclude competing mutations before first authoritative I/O`);
  assert(releaseIndex > commandIndex && block.slice(commandIndex).includes("} finally {"),
    `${owner} must unconditionally release after write/refetch/rollback lifecycle`);
  assert(block.includes("setError") || block.includes("setDeleteError"),
    `${owner} must retain visible error reporting`);
}
const del = source.slice(source.indexOf("  const confirmDelete = async"),source.indexOf("  const statusError = "));
assert(del.indexOf("setDeleteTarget(null);") < del.indexOf("await refreshBoard();"),
  "Successful delete must dismiss its modal before a fallible committed refetch");
assert(del.lastIndexOf("setDeletePending(false);") > del.lastIndexOf("await refreshBoard();"),
  "Delete must not free the rendered pending state while refetch is still in flight");
const live = source.slice(source.indexOf("  const makeTaskLive = async"),source.indexOf("  const requestTaskChangeList = "));
assert(live.includes("Task is live, but Focus could not refresh."),
  "Successful live switch must not be misreported as a failed timer mutation");
const home = source.slice(source.indexOf("  const exitFocusHome = async"),source.indexOf("  const submitAddTask = "));
assert(home.includes("await waitForPresentedFrame();")
  && home.includes('await invoke<void>("focus_surface_exit_to_main");')
  && home.includes("await resumeTimerFromFocusHome();"),
  "Home retains native pause->frame->exit and rollback ordering");

// Deterministic execution model: two separate event handlers in the same
// React render, a write that has committed but still awaits authoritative
// reread, and native Home rollback all use the same ownership contract.
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {resolve = yes; reject = no;});
  return {promise, resolve, reject};
}
function createGate() {
  let owner = null;
  return {
    current: () => owner,
    async invoke(next, write, refetch = async () => {}) {
      if (owner !== null) return false;
      owner = next;
      try {
        await write();
        await refetch();
        return true;
      } finally {
        owner = null;
      }
    },
  };
}
const names = blocks.map(x=>x[0]);
for (const name of names) {
  const gate = createGate(), write = deferred(), refresh = deferred();
  let writes = 0;
  const first = gate.invoke(name, async () => {await write.promise; writes++;}, async () => {await refresh.promise;});
  for (const competing of names) {
    assert.equal(await gate.invoke(competing, async () => {writes++;}), false,
      `${name} must block simultaneous ${competing}`);
  }
  write.resolve();
  await Promise.resolve(); await Promise.resolve();
  assert.equal(writes, 1, `${name} must perform exactly one committed request`);
  for (const competing of names) {
    assert.equal(await gate.invoke(competing, async () => {writes++;}), false,
      `${name} must keep lock through post-commit refresh against ${competing}`);
  }
  refresh.resolve();
  assert.equal(await first, true);
  assert.equal(gate.current(), null);
  const failure = deferred();
  const firstFailed = gate.invoke(name, async () => {await failure.promise;});
  assert.equal(await gate.invoke("home", async () => {writes++;}), false);
  failure.reject(new Error("native command rejected"));
  await assert.rejects(firstFailed, /native command rejected/);
  assert.equal(gate.current(), null, `${name} must release ownership on failed command`);
  assert.equal(await gate.invoke("home", async () => {writes++;}), true);
  assert.equal(gate.current(), null);
}
const rollbackGate = createGate();
const rollback = deferred();
const homeRun = rollbackGate.invoke("home", async () => {
  try {
    throw new Error("native exit rejected after pause");
  } catch {
    await rollback.promise;
    throw new Error("native exit rejected after guarded resume");
  }
});
assert.equal(await rollbackGate.invoke("make-live", async () => {}), false,
  "Home rollback must retain ownership until it completes");
rollback.resolve();
await assert.rejects(homeRun, /guarded resume/);
assert.equal(rollbackGate.current(), null);
console.log("Focus shared command exclusion, cross-owner delayed read, native rollback and recovery passed.");
