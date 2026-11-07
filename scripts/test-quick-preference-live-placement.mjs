import assert from "node:assert/strict";
import { saveQuickPreferenceWithLivePlacement } from "../src/quickPreferenceLivePlacement.ts";

const calls = [];
const save = async (patch, key) => {
  calls.push(["persist", key, patch]);
  return true;
};
const apply = async () => {
  calls.push(["native-panel-position"]);
};

assert.equal(await saveQuickPreferenceWithLivePlacement({ focusPanelSide: "left" }, "side", save, apply), true);
assert.deepEqual(calls.map(entry => entry[0]), ["persist", "native-panel-position"],
  "selected side must be durably saved before current Panel moves");
calls.length = 0;
assert.equal(await saveQuickPreferenceWithLivePlacement({ selectedMonitorKey: "DISPLAY2" }, "monitor", save, apply), true);
assert.deepEqual(calls.map(entry => entry[0]), ["persist", "native-panel-position"],
  "selected monitor must reposition immediately on the same Panel");
calls.length = 0;
assert.equal(await saveQuickPreferenceWithLivePlacement({ hideTaskTimes: true }, "hideTaskTimes", save, apply), true);
assert.deepEqual(calls.map(entry => entry[0]), ["persist"],
  "unrelated preference switches must not touch native Panel geometry");

calls.length = 0;
assert.equal(
  await saveQuickPreferenceWithLivePlacement({ focusPanelSide: "right" }, "side", async () => false, apply),
  false,
  "failed persistence must not request relocation",
);
assert.deepEqual(calls, []);
calls.length = 0;
await assert.rejects(
  saveQuickPreferenceWithLivePlacement({ focusPanelSide: "left" }, "side", save, async () => {
    throw new Error("native placement rejected");
  }),
  /native placement rejected/,
  "a committed preference with failed native relocation must remain an explicit retryable UI error",
);

const pending = [];
let finishNative;
const nativeBarrier = new Promise(resolve => { finishNative = resolve; });
const inProgress = saveQuickPreferenceWithLivePlacement(
  { selectedMonitorKey: "" },
  "monitor",
  async () => {
    pending.push("persist");
    return true;
  },
  async () => {
    pending.push("native-start");
    await nativeBarrier;
    pending.push("native-finished");
  },
);
await Promise.resolve();
await Promise.resolve();
assert.deepEqual(pending, ["persist", "native-start"],
  "live placement must remain awaited after the SQLite write before caller clears pending state");
finishNative();
assert.equal(await inProgress, true);
assert.deepEqual(pending, ["persist", "native-start", "native-finished"]);

console.log("Quick Preferences committed live Panel placement: PASS");
