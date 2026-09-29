import assert from "node:assert/strict";
import test from "node:test";
import {
  FocusPresentationRecoveryError,
  commitPreparedFocusPresentation,
} from "../src/focusPresentationTransition.ts";

function harness(previousPresentation = "panel", targetPresentation = "timerCompact") {
  const calls = [];
  const failures = new Map();

  return {
    calls,
    failures,
    transition: {
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
    },
  };
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
