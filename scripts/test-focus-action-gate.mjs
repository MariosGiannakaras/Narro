import assert from "node:assert/strict";
import fs from "node:fs";
import { createFocusActionGate } from "../src/focusActionGate.ts";

const source = fs.readFileSync("src/FocusLiveActions.tsx", "utf8");

assert.match(source, /if \(!beginMutation\(action\)\) return;/);
assert.match(source, /if \(!beginMutation\("skip"\)\) return;/);
assert.match(source, /if \(!beginMutation\("done"\)\) return;/);
assert.match(source, /actionGate\.tryBegin\(action\)/);
assert.match(source, /actionGate\.finish\(action\)/);
assert.match(source, /if \(fixtureMode \|\| busy \|\| actionGate\.current\(\) !== null\) return;/);

const gate = createFocusActionGate();
assert.equal(gate.current(), null);
assert.equal(gate.tryBegin("done"), true);
assert.equal(gate.current(), "done");
for (const other of ["done", "skip", "pause_resume", "break", "extend"]) {
  assert.equal(gate.tryBegin(other), false, `second ${other} must not enter while Done is active`);
}
gate.finish("skip"); // An unrelated completion must not clear the real owner's lock.
assert.equal(gate.current(), "done");
gate.finish("done");
assert.equal(gate.current(), null);
assert.equal(gate.tryBegin("pause_resume"), true);
gate.finish("pause_resume");
assert.equal(gate.current(), null);

const inFlight = createFocusActionGate();
let completeMutation;
const blockMutation = new Promise((resolve) => { completeMutation = resolve; });
let writes = 0;
async function run(action, work) {
  if (!inFlight.tryBegin(action)) return false;
  try {
    await work();
    return true;
  } finally {
    inFlight.finish(action);
  }
}
const first = run("done", async () => { await blockMutation; writes += 1; });
const duplicate = run("done", async () => { writes += 1; });
const competing = run("skip", async () => { writes += 1; });
assert.equal(await duplicate, false, "same-tick duplicate must be rejected before React state publishes");
assert.equal(await competing, false, "different same-tick action must be rejected");
assert.equal(writes, 0, "no duplicate mutation can reach backend while initial call waits");
completeMutation();
assert.equal(await first, true);
assert.equal(writes, 1);
assert.equal(inFlight.current(), null);

const errorGate = createFocusActionGate();
await assert.rejects(runWithFailure(errorGate), /transient failure/);
assert.equal(errorGate.current(), null, "rejection must not permanently lock live actions");
assert.equal(errorGate.tryBegin("extend"), true, "actions can recover from a failed mutation");
errorGate.finish("extend");

async function runWithFailure(g) {
  if (!g.tryBegin("break")) return;
  try {
    await Promise.reject(new Error("transient failure"));
  } finally {
    g.finish("break");
  }
}

console.log("Focus live-action synchronous exclusion, release and rejection recovery passed.");
