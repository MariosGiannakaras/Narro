import assert from "node:assert/strict";
import test from "node:test";
import {
  FloatingTimerResizeRecoveryError,
  coordinateFloatingTimerResize,
} from "../src/floatingTimerResizeTransition.ts";

function harness(overrides = {}) {
  const calls = [];
  const failures = {
    prepare: null,
    frame: [],
    reveal: null,
    rollback: null,
  };

  return {
    calls,
    failures,
    deps: {
      previousExpanded: false,
      targetExpanded: true,
      async prepareResize(expanded) {
        calls.push(`prepare:${expanded}`);
        if (failures.prepare) throw failures.prepare;
      },
      publishExpanded(expanded) {
        calls.push(`publish:${expanded}`);
      },
      async waitForPresentedFrame() {
        calls.push("frame");
        const failure = failures.frame.shift();
        if (failure) throw failure;
      },
      async revealResize() {
        calls.push("reveal");
        if (failures.reveal) throw failures.reveal;
      },
      async rollbackResize() {
        calls.push("rollback");
        if (failures.rollback) throw failures.rollback;
      },
      ...overrides,
    },
  };
}

test("success hides/resizes natively, publishes target, paints, then reveals", async () => {
  const h = harness();
  await coordinateFloatingTimerResize(h.deps);
  assert.deepEqual(h.calls, [
    "prepare:true",
    "publish:true",
    "frame",
    "reveal",
  ]);
});

test("prepare failure leaves renderer untouched and needs no rollback", async () => {
  const h = harness();
  const failure = new Error("prepare failed");
  h.failures.prepare = failure;
  await assert.rejects(coordinateFloatingTimerResize(h.deps), failure);
  assert.deepEqual(h.calls, ["prepare:true"]);
});

test("frame failure republishes previous hierarchy before native rollback", async () => {
  const h = harness();
  const failure = new Error("paint failed");
  h.failures.frame.push(failure);
  await assert.rejects(coordinateFloatingTimerResize(h.deps), failure);
  assert.deepEqual(h.calls, [
    "prepare:true",
    "publish:true",
    "frame",
    "publish:false",
    "frame",
    "rollback",
  ]);
});

test("reveal failure restores previous hierarchy and exact native snapshot", async () => {
  const h = harness();
  const failure = new Error("reveal failed");
  h.failures.reveal = failure;
  await assert.rejects(coordinateFloatingTimerResize(h.deps), failure);
  assert.deepEqual(h.calls, [
    "prepare:true",
    "publish:true",
    "frame",
    "reveal",
    "publish:false",
    "frame",
    "rollback",
  ]);
});

test("rollback failure is explicit and preserves the original transition failure", async () => {
  const h = harness();
  const transitionFailure = new Error("reveal failed");
  const recoveryFailure = new Error("rollback failed");
  h.failures.reveal = transitionFailure;
  h.failures.rollback = recoveryFailure;

  await assert.rejects(
    coordinateFloatingTimerResize(h.deps),
    (error) => {
      assert.ok(error instanceof FloatingTimerResizeRecoveryError);
      assert.equal(error.code, "FLOATING_TIMER_RESIZE_RECOVERY_FAILED");
      assert.equal(error.transitionFailure, transitionFailure);
      assert.equal(error.recoveryFailure, recoveryFailure);
      return true;
    },
  );
});
