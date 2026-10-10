import assert from "node:assert/strict";
import fs from "node:fs";

// Regression must inspect the real production handler and its actual mount
// ownership. The previous test asserted failure-path cleanup only.
const palette = fs.readFileSync("src/SearchPalette.tsx", "utf8");
const shell = fs.readFileSync("src/AppShell.tsx", "utf8");
const boardTest = fs.readFileSync("scripts/test-board-create-single-flight.mjs", "utf8");
const start = palette.indexOf("  const submitQuickTask = async (");
const end = palette.indexOf("  const renderSearchSurface = (", start);
assert(start >= 0 && end > start, "real SearchPalette quick-create handler must exist");
const handler = palette.slice(start, end);
assert(shell.includes("      <SearchPalette") && shell.includes("        open={searchOpen}"),
  "Quick Task dialog is a persistently mounted child, not a fresh ref on each open");
assert(handler.includes("if (quickTaskPending || quickTaskInFlightRef.current) return;"),
  "same-render duplicate submit still requires immediate exclusivity");
assert(handler.indexOf("quickTaskInFlightRef.current = true;") <
  handler.indexOf("taskId = await createListBoardTask({"),
  "lock must be acquired before persistent create");
assert(handler.includes("quickTaskInFlightRef.current = false;\n      setQuickTaskPending(false);"),
  "rejected writes must release the gate to permit correction and retry");
const afterCommit = handler.slice(handler.indexOf("    // SearchPalette remains mounted"));
assert(afterCommit.includes("    try {") && afterCommit.includes("    } finally {"),
  "successful create also needs unconditional lifecycle cleanup");
assert(afterCommit.indexOf("onRequestClose();") < afterCommit.indexOf("onTaskCreated(quickTaskListId, taskId);"),
  "commit must close the palette before navigating to the created task");
assert(afterCommit.indexOf("onTaskCreated(quickTaskListId, taskId);") <
  afterCommit.lastIndexOf("quickTaskInFlightRef.current = false;"),
  "do not release the gate before synchronous close/navigation callbacks finish");
assert(afterCommit.lastIndexOf("quickTaskInFlightRef.current = false;") <
  afterCommit.lastIndexOf("setQuickTaskPending(false);"),
  "success must clear both ref and rendered pending state");
assert(boardTest.includes("quickTaskInFlightRef.current"),
  "the prior blocked same-render quick-create scenario remains covered");

// Deterministic lifetime model: same mounted palette -> create succeeds ->
// close -> reopen -> second create, plus both failure and navigation failure.
function createPersistentPalette() {
  let active = false;
  return {
    get active() { return active; },
    async submit(write, afterCommit) {
      if (active) return false;
      active = true;
      let created;
      try {
        created = await write();
      } catch (error) {
        active = false;
        throw error;
      }
      try {
        afterCommit(created);
      } finally {
        active = false;
      }
      return true;
    },
  };
}
const owner = createPersistentPalette();
let releaseFirst;
const waitFirst = new Promise(resolve => { releaseFirst = resolve; });
let writes = 0, closes = 0, navigations = 0;
const first = owner.submit(async () => {
  await waitFirst;
  writes++;
  return "task-1";
}, () => { closes++; navigations++; });
assert.equal(await owner.submit(async () => { writes++; }, () => {}), false,
  "duplicate event before the first commit must not create a second task");
releaseFirst();
assert.equal(await first, true);
assert.equal(owner.active, false, "completed create must release persistent owner");
assert.equal(await owner.submit(async () => { writes++; return "task-2"; },
  () => { closes++; navigations++; }), true,
  "same SearchPalette instance must permit a second create after reopening");
assert.equal(writes, 2);
assert.equal(closes, 2);
assert.equal(navigations, 2);
await assert.rejects(owner.submit(async () => {
  throw new Error("database unavailable");
}, () => {}), /database unavailable/);
assert.equal(owner.active, false);
await assert.rejects(owner.submit(async () => "task-3", () => {
  throw new Error("navigation unavailable");
}), /navigation unavailable/);
assert.equal(owner.active, false, "callback failure must not deadlock a later palette reopen");
assert.equal(await owner.submit(async () => "task-4", () => {}), true);

console.log("Persistent Search quick-create success→close→reopen and both failure cleanup contracts passed.");
