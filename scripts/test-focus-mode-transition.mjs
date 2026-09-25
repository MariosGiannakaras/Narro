import assert from "node:assert/strict";
import test from "node:test";
import {
  FocusModeTransitionCancelledError,
  FocusModeTransitionRecoveryError,
  coordinateFocusModeTransition,
} from "../src/focusModeTransition.ts";

function harness(overrides = {}) {
  const calls = [];
  let cancel = false;
  const failures = {
    prepare: new Map(),
    prewarm: new Map(),
    ready: new Map(),
    frame: [],
    reveal: new Map(),
  };

  return {
    calls,
    failures,
    cancel() {
      cancel = true;
    },
    deps: {
      previousMode: "panel",
      targetMode: "timer",
      async prepareMode(mode) {
        calls.push(`prepare:${mode}`);
        const failure = failures.prepare.get(mode);
        if (failure) throw failure;
      },
      publishMode(mode) {
        calls.push(`publish:${mode}`);
      },
      async prewarmMode(mode) {
        calls.push(`prewarm:${mode}`);
        const failure = failures.prewarm.get(mode);
        if (failure) throw failure;
      },
      async waitForModeReady(mode) {
        calls.push(`ready:${mode}`);
        const failure = failures.ready.get(mode);
        if (failure) throw failure;
      },
      async waitForPresentedFrame() {
        calls.push("frame");
        const failure = failures.frame.shift();
        if (failure) throw failure;
      },
      async revealMode(mode) {
        calls.push(`reveal:${mode}`);
        const failure = failures.reveal.get(mode);
        if (failure) throw failure;
      },
      isCancelled() {
        return cancel;
      },
      ...overrides,
    },
  };
}

test("success prepares hidden geometry, publishes target, paints, then reveals", async () => {
  const h = harness();
  await coordinateFocusModeTransition(h.deps);
  assert.deepEqual(h.calls, [
    "prepare:timer",
    "publish:timer",
    "ready:timer",
    "prewarm:timer",
    "frame",
    "reveal:timer",
  ]);
});

test("prepare failure leaves renderer unpublished and does not run recovery", async () => {
  const h = harness();
  const failure = new Error("prepare failed");
  h.failures.prepare.set("timer", failure);
  await assert.rejects(coordinateFocusModeTransition(h.deps), failure);
  assert.deepEqual(h.calls, ["prepare:timer"]);
});

test("transparent prewarm failure occurs only after target readiness and recovers the previous renderer", async () => {
  const h = harness();
  const failure = new Error("prewarm failed");
  h.failures.prewarm.set("timer", failure);
  await assert.rejects(coordinateFocusModeTransition(h.deps), failure);
  assert.deepEqual(h.calls, [
    "prepare:timer",
    "publish:timer",
    "ready:timer",
    "prewarm:timer",
    "prepare:panel",
    "publish:panel",
    "ready:panel",
    "prewarm:panel",
    "frame",
    "reveal:panel",
  ]);
});

test("target readiness failure never prewarms or reveals the unready target", async () => {
  const h = harness();
  const failure = new Error("target not ready");
  h.failures.ready.set("timer", failure);
  await assert.rejects(coordinateFocusModeTransition(h.deps), failure);
  assert.deepEqual(h.calls, [
    "prepare:timer",
    "publish:timer",
    "ready:timer",
    "prepare:panel",
    "publish:panel",
    "ready:panel",
    "prewarm:panel",
    "frame",
    "reveal:panel",
  ]);
});


test("presented-frame failure restores previous hidden geometry and renderer before reveal", async () => {
  const h = harness();
  const failure = new Error("paint failed");
  h.failures.frame.push(failure);
  await assert.rejects(coordinateFocusModeTransition(h.deps), failure);
  assert.deepEqual(h.calls, [
    "prepare:timer",
    "publish:timer",
    "ready:timer",
    "prewarm:timer",
    "frame",
    "prepare:panel",
    "publish:panel",
    "ready:panel",
    "prewarm:panel",
    "frame",
    "reveal:panel",
  ]);
});

test("reveal failure rolls back through the same prepare-publish-frame-reveal sequence", async () => {
  const h = harness();
  const failure = new Error("reveal failed");
  h.failures.reveal.set("timer", failure);
  await assert.rejects(coordinateFocusModeTransition(h.deps), failure);
  assert.deepEqual(h.calls, [
    "prepare:timer",
    "publish:timer",
    "ready:timer",
    "prewarm:timer",
    "frame",
    "reveal:timer",
    "prepare:panel",
    "publish:panel",
    "ready:panel",
    "prewarm:panel",
    "frame",
    "reveal:panel",
  ]);
});

test("cancellation after native prepare recovers the previous presentation", async () => {
  const h = harness({
    async prepareMode(mode) {
      h.calls.push(`prepare:${mode}`);
      if (mode === "timer") h.cancel();
    },
  });
  await assert.rejects(
    coordinateFocusModeTransition(h.deps),
    FocusModeTransitionCancelledError,
  );
  assert.deepEqual(h.calls, [
    "prepare:timer",
    "prepare:panel",
    "publish:panel",
    "ready:panel",
    "prewarm:panel",
    "frame",
    "reveal:panel",
  ]);
});

test("recovery failure is explicit and retains the original transition failure", async () => {
  const h = harness();
  const transitionFailure = new Error("target reveal failed");
  const recoveryFailure = new Error("panel prepare failed");
  h.failures.reveal.set("timer", transitionFailure);
  h.failures.prepare.set("panel", recoveryFailure);

  await assert.rejects(
    coordinateFocusModeTransition(h.deps),
    (error) => {
      assert.ok(error instanceof FocusModeTransitionRecoveryError);
      assert.equal(error.code, "FOCUS_SURFACE_TRANSITION_RECOVERY_FAILED");
      assert.equal(error.transitionFailure, transitionFailure);
      assert.equal(error.recoveryFailure, recoveryFailure);
      return true;
    },
  );
});
