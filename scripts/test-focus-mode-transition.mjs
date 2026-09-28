import assert from "node:assert/strict";
import test from "node:test";
import {
  PersistentFocusWindowRecoveryError,
  switchPersistentFocusWindows,
} from "../src/persistentFocusWindowTransition.ts";

function harness(previousMode = "panel", targetMode = "timer") {
  const calls = [];
  const failures = new Map();
  const invoke = async (step, mode) => {
    calls.push(`${step}:${mode}`);
    const failure = failures.get(step);
    if (failure) throw failure;
  };
  return {
    calls,
    failures,
    deps: {
      previousMode,
      targetMode,
      prepareMode: (mode) => invoke("prepare", mode),
      waitForModeReady: (mode) => invoke("ready", mode),
      revealMode: (mode) => invoke("reveal", mode),
      restoreMode: (mode) => invoke("restore", mode),
    },
  };
}

test("Panel to Timer prepares and waits for target before revealing", async () => {
  const h = harness();
  await switchPersistentFocusWindows(h.deps);
  assert.deepEqual(h.calls, ["prepare:timer", "ready:timer", "reveal:timer"]);
});

test("Timer to Panel uses the same ordered transition", async () => {
  const h = harness("timer", "panel");
  await switchPersistentFocusWindows(h.deps);
  assert.deepEqual(h.calls, ["prepare:panel", "ready:panel", "reveal:panel"]);
});

test("a request for the current mode never touches either window", async () => {
  const h = harness("timer", "timer");
  await switchPersistentFocusWindows(h.deps);
  assert.deepEqual(h.calls, []);
});

for (const step of ["prepare", "ready", "reveal"]) {
  test(`${step} failure restores the previously visible presentation`, async () => {
    const h = harness();
    const failure = new Error(`${step} failed`);
    h.failures.set(step, failure);
    await assert.rejects(switchPersistentFocusWindows(h.deps), failure);
    assert.deepEqual(h.calls, [
      ...["prepare", "ready", "reveal"].slice(0, ["prepare", "ready", "reveal"].indexOf(step) + 1)
        .map((name) => `${name}:timer`),
      "restore:panel",
    ]);
  });
}

test("failed recovery preserves both errors for diagnosis", async () => {
  const h = harness();
  const transitionFailure = new Error("target reveal failed");
  const recoveryFailure = new Error("source restore failed");
  h.failures.set("reveal", transitionFailure);
  h.failures.set("restore", recoveryFailure);
  await assert.rejects(switchPersistentFocusWindows(h.deps), (error) => {
    assert.ok(error instanceof PersistentFocusWindowRecoveryError);
    assert.equal(error.transitionFailure, transitionFailure);
    assert.equal(error.recoveryFailure, recoveryFailure);
    return true;
  });
  assert.deepEqual(h.calls, ["prepare:timer", "ready:timer", "reveal:timer", "restore:panel"]);
});
