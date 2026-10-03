import assert from "node:assert/strict";
import test from "node:test";
import {
  FocusPresentationRecoveryError,
  commitPreparedFocusPresentation,
} from "../src/focusPresentationTransition.ts";

function harness(previousPresentation = "panel", targetPresentation = "timerCompact", concurrent = false) {
  const calls = [];
  const failures = new Map();

  const transition = {
    previousPresentation,
    targetPresentation,
    waitForTargetReady: async () => {
      calls.push(`ready:${targetPresentation}`);
      const failure = failures.get("ready");
      if (failure) throw failure;
    },
    beforeNativeCommit: async () => {
      calls.push(`before:${targetPresentation}`);
      const failure = failures.get("before");
      if (failure) throw failure;
    },
    applyNativePresentation: async (presentation) => {
      calls.push(`native:${presentation}`);
      const failure = failures.get(`native:${presentation}`) ?? failures.get("native");
      if (failure) throw failure;
    },
    afterNativeCommit: async () => {
      calls.push(`after:${targetPresentation}`);
      const failure = failures.get("after");
      if (failure) throw failure;
    },
    commitRendererPresentation: (presentation) => {
      calls.push(`renderer:${presentation}`);
      const failure = failures.get(`renderer:${presentation}`) ?? failures.get("renderer");
      if (failure) throw failure;
    },
  };

  if (concurrent) {
    transition.animateNativePresentation = async (presentation) => {
      calls.push(`animated:${presentation}`);
      const failure = failures.get("animated");
      if (failure) throw failure;
    };
    transition.runConcurrentMotion = async () => {
      calls.push(`motion:${targetPresentation}`);
      const failure = failures.get("motion");
      if (failure) throw failure;
    };
  }

  return { calls, failures, transition };
}

test("prepared Panel to Timer waits, commits native state, then transfers renderer ownership", async () => {
  const h = harness();
  assert.equal(await commitPreparedFocusPresentation(h.transition), true);
  assert.deepEqual(h.calls, [
    "ready:timerCompact",
    "before:timerCompact",
    "native:timerCompact",
    "after:timerCompact",
    "renderer:timerCompact",
  ]);
});

test("prepared Timer to Panel uses the same ordered commit", async () => {
  const h = harness("timerExpanded", "panel");
  assert.equal(await commitPreparedFocusPresentation(h.transition), true);
  assert.deepEqual(h.calls, [
    "ready:panel",
    "before:panel",
    "native:panel",
    "after:panel",
    "renderer:panel",
  ]);
});

test("requesting the committed presentation is a no-op", async () => {
  const h = harness("timerCompact", "timerCompact");
  assert.equal(await commitPreparedFocusPresentation(h.transition), false);
  assert.deepEqual(h.calls, []);
});

test("Panel/Timer prepaint completes before concurrent native position and renderer geometry", async () => {
  const h = harness("panel", "timerCompact", true);
  assert.equal(await commitPreparedFocusPresentation(h.transition), true);
  assert.deepEqual(h.calls, [
    "ready:timerCompact",
    "before:timerCompact",
    "animated:timerCompact",
    "motion:timerCompact",
    "renderer:timerCompact",
  ]);
});

test("native clipping and motion cannot start before the promoted target has painted", async () => {
  const h = harness("panel", "timerCompact", true);
  let releasePaint;
  let enteredPaint;
  const paintEntered = new Promise((resolve) => { enteredPaint = resolve; });
  h.transition.beforeNativeCommit = () => new Promise((resolve) => {
    h.calls.push("promoted-target-paint");
    releasePaint = resolve;
    enteredPaint();
  });
  const pending = commitPreparedFocusPresentation(h.transition);
  await paintEntered;
  assert.deepEqual(h.calls, ["ready:timerCompact", "promoted-target-paint"]);
  releasePaint();
  assert.equal(await pending, true);
  assert.deepEqual(h.calls.slice(2), ["animated:timerCompact", "motion:timerCompact", "renderer:timerCompact"]);
});

test("promoted target paint failure leaves native presentation untouched", async () => {
  const h = harness("panel", "timerCompact", true);
  const failure = new Error("target did not paint");
  h.failures.set("before", failure);
  await assert.rejects(commitPreparedFocusPresentation(h.transition), failure);
  assert.deepEqual(h.calls, ["ready:timerCompact", "before:timerCompact"]);
});

test("failed motion waits for in-flight native commit before rollback", async () => {
  const h = harness("panel", "timerCompact", true);
  let releaseNative;
  let motionFailed;
  const motionFailureObserved = new Promise((resolve) => { motionFailed = resolve; });
  h.transition.animateNativePresentation = () => new Promise((resolve) => {
    h.calls.push("native-in-flight");
    releaseNative = () => { h.calls.push("native-complete"); resolve(); };
  });
  const failure = new Error("renderer motion failed");
  h.transition.runConcurrentMotion = async () => { motionFailed(); throw failure; };
  const pending = commitPreparedFocusPresentation(h.transition);
  await motionFailureObserved;
  await Promise.resolve();
  assert.equal(h.calls.includes("native:panel"), false);
  releaseNative();
  await assert.rejects(pending, failure);
  assert.deepEqual(h.calls.slice(-3), ["native-complete", "native:panel", "renderer:panel"]);
});

test("concurrent motion failure restores the previous native and renderer presentation", async () => {
  const h = harness("timerCompact", "panel", true);
  const failure = new Error("motion failed");
  h.failures.set("motion", failure);
  await assert.rejects(commitPreparedFocusPresentation(h.transition), failure);
  assert.deepEqual(h.calls, [
    "ready:panel",
    "before:panel",
    "animated:panel",
    "motion:panel",
    "native:timerCompact",
    "renderer:timerCompact",
  ]);
});

test("animated native failure restores the previous native and renderer presentation", async () => {
  const h = harness("panel", "timerCompact", true);
  const failure = new Error("animated native failed");
  h.failures.set("animated", failure);
  await assert.rejects(commitPreparedFocusPresentation(h.transition), failure);
  assert.deepEqual(h.calls, [
    "ready:timerCompact",
    "before:timerCompact",
    "animated:timerCompact",
    "motion:timerCompact",
    "native:panel",
    "renderer:panel",
  ]);
});

test("renderer failure after animated native success restores the previous presentation", async () => {
  const h = harness("timerExpanded", "panel", true);
  const failure = new Error("animated renderer commit failed");
  h.failures.set("renderer:panel", failure);
  await assert.rejects(commitPreparedFocusPresentation(h.transition), failure);
  assert.deepEqual(h.calls, [
    "ready:panel",
    "before:panel",
    "animated:panel",
    "motion:panel",
    "renderer:panel",
    "native:timerExpanded",
    "renderer:timerExpanded",
  ]);
});

test("repeated Panel/Timer transitions keep deterministic commit ordering", async () => {
  let current = "panel";
  for (let cycle = 0; cycle < 250; cycle += 1) {
    const target = current === "panel"
      ? (Math.floor(cycle / 2) % 2 === 0 ? "timerCompact" : "timerExpanded")
      : "panel";
    const h = harness(current, target, true);
    assert.equal(await commitPreparedFocusPresentation(h.transition), true);
    assert.deepEqual(h.calls, [
      `ready:${target}`,
      `before:${target}`,
      `animated:${target}`,
      `motion:${target}`,
      `renderer:${target}`,
    ]);
    current = target;
  }
});

for (const step of ["ready", "before", "native"]) {
  test(`${step} failure leaves renderer ownership on the previous presentation`, async () => {
    const h = harness();
    const failure = new Error(`${step} failed`);
    h.failures.set(step, failure);
    await assert.rejects(commitPreparedFocusPresentation(h.transition), failure);
    assert.equal(h.calls.includes("renderer:timerCompact"), false);
    assert.equal(h.calls.includes("native:panel"), false);
  });
}

test("post-native motion failure restores the previous native presentation", async () => {
  const h = harness();
  const failure = new Error("post-native motion failed");
  h.failures.set("after", failure);
  await assert.rejects(commitPreparedFocusPresentation(h.transition), failure);
  assert.deepEqual(h.calls, [
    "ready:timerCompact",
    "before:timerCompact",
    "native:timerCompact",
    "after:timerCompact",
    "native:panel",
    "renderer:panel",
  ]);
});

test("renderer commit failure after native success restores the previous native presentation", async () => {
  const h = harness();
  const failure = new Error("renderer commit failed");
  h.failures.set("renderer:timerCompact", failure);
  await assert.rejects(commitPreparedFocusPresentation(h.transition), failure);
  assert.deepEqual(h.calls, [
    "ready:timerCompact",
    "before:timerCompact",
    "native:timerCompact",
    "after:timerCompact",
    "renderer:timerCompact",
    "native:panel",
    "renderer:panel",
  ]);
});

test("failed renderer recovery preserves both failures for diagnosis", async () => {
  const h = harness();
  const transitionFailure = new Error("renderer commit failed");
  const recoveryFailure = new Error("native rollback failed");
  h.failures.set("renderer:timerCompact", transitionFailure);
  h.failures.set("native:panel", recoveryFailure);

  await assert.rejects(commitPreparedFocusPresentation(h.transition), (error) => {
    assert.ok(error instanceof FocusPresentationRecoveryError);
    assert.equal(error.transitionFailure, transitionFailure);
    assert.equal(error.recoveryFailure, recoveryFailure);
    return true;
  });
});
