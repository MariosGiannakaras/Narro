import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
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

test("raster is retained through native commit and released only after renderer paint acknowledgement", async () => {
  const h = harness("timerCompact", "panel", true);
  h.transition.afterRendererCommit = async () => { h.calls.push("paint:panel"); h.calls.push("release:raster"); };
  await commitPreparedFocusPresentation(h.transition);
  assert.deepEqual(h.calls, ["ready:panel", "before:panel", "animated:panel", "motion:panel", "renderer:panel", "paint:panel", "release:raster"]);
});

for (const failedStage of ["before", "animated", "paint"]) {
  test(`raster ${failedStage} failure paints the prior renderer before releasing native protection`, async () => {
    const h = harness("timerCompact", "panel", true);
    const failure = new Error(`raster ${failedStage} failed`);
    if (failedStage === "paint") h.transition.afterRendererCommit = async () => { h.calls.push("paint:panel"); throw failure; };
    else h.failures.set(failedStage, failure);
    h.transition.beforeNativeRollback = async () => { h.calls.push("rollback-paint:timerCompact"); };
    await assert.rejects(commitPreparedFocusPresentation(h.transition), failure);
    const painted = h.calls.indexOf("rollback-paint:timerCompact");
    const restored = h.calls.indexOf("native:timerCompact");
    assert.ok(painted >= 0 && painted < restored);
    assert.equal(h.calls.filter((call) => call === "native:timerCompact").length, 1);
  });
}

test("failed rollback paint preserves its error and does not uncover an unpainted native state", async () => {
  const h = harness("panel", "timerCompact", true);
  const failure = new Error("animation failed");
  const recovery = new Error("rollback paint failed");
  h.failures.set("animated", failure);
  h.transition.beforeNativeRollback = async () => { throw recovery; };
  await assert.rejects(commitPreparedFocusPresentation(h.transition), (error) => {
    assert.ok(error instanceof FocusPresentationRecoveryError);
    assert.equal(error.transitionFailure, failure);
    assert.equal(error.recoveryFailure, recovery);
    return true;
  });
  assert.equal(h.calls.includes("native:panel"), false);
});

test("a failed raster acquisition cannot initiate a second native placement of the already-committed presentation", async () => {
  const coordinator = fs.readFileSync(
    new URL("../src/FocusSurfaceCoordinator.tsx", import.meta.url), "utf8",
  );
  assert.match(coordinator, /rasterToken = await prepareFocusSurfaceModeRaster\(targetPresentation\)/);
  assert.match(coordinator, /\} else if \(next !== previousPresentation\) \{\s*\/\/ Raster acquisition failed before native geometry changed/);
  const h = harness("panel", "timerCompact", true);
  let nativeHeld = false;
  const failure = new Error("native outgoing capture failed");
  h.transition.beforeNativeCommit = async () => { h.calls.push("acquire-failed"); throw failure; };
  h.transition.beforeNativeRollback = async () => { h.calls.push("paint-previous"); };
  h.transition.applyNativePresentation = async (requested) => {
    if (nativeHeld || requested !== h.transition.previousPresentation) h.calls.push(`native:${requested}`);
  };
  await assert.rejects(commitPreparedFocusPresentation(h.transition), (error) => error === failure);
  assert.deepEqual(h.calls, ["ready:timerCompact", "acquire-failed", "paint-previous", "renderer:panel"]);
  // The equivalent prepared native-lease failure path must still restore
  // geometry rather than skipping legitimate rollback.
  const acquired = harness("panel", "timerCompact", true);
  acquired.transition.beforeNativeCommit = async () => {
    nativeHeld = true;
    throw failure;
  };
  acquired.transition.beforeNativeRollback = async () => { acquired.calls.push("paint-previous"); };
  acquired.transition.applyNativePresentation = async (requested) => {
    if (nativeHeld || requested !== acquired.transition.previousPresentation) acquired.calls.push(`native:${requested}`);
  };
  await assert.rejects(commitPreparedFocusPresentation(acquired.transition), (error) => error === failure);
  assert.ok(acquired.calls.indexOf("native:panel") > acquired.calls.indexOf("paint-previous"));
});



test("a same-tick Timer resize blocks both direct presentation and keyboard task requests", async () => {
  const coordinator = fs.readFileSync(
    new URL("../src/FocusSurfaceCoordinator.tsx", import.meta.url), "utf8",
  );
  const extract = (startMarker, endMarker) => {
    const start = coordinator.indexOf(startMarker);
    const end = coordinator.indexOf(endMarker, start);
    assert.ok(start >= 0 && end > start, "actual Focus handler must be extractable");
    return ts.transpileModule(coordinator.slice(start, end), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
    }).outputText;
  };

  // React may batch setState during the resize's own input event. The parent's
  // synchronous ref is already true before the previous render's closures
  // observe timerResizePending=true.
  const messages = [];
  const ref = { current: true };
  const requestMode = vm.runInNewContext(
    extract("  const requestMode = useCallback(async (", "\n  requestModeRef.current = requestMode;")
      + "\nrequestMode;",
    {
      useCallback: (callback) => callback,
      // The extracted real callback's dependency array is evaluated when it is created.
      prepareGeometryMotion: () => {},
      publishPresentation: () => {},
      runGeometryMotion: () => {},
      waitForReady: () => {},
      presentationHydrated: true,
      quickTaskAfterPanelRef: { current: false },
      presentationRef: { current: "timerCompact" },
      focusSurfaceModeOf: (value) => value === "panel" ? "panel" : "timer",
      pendingModeRef: { current: null },
      transitionGateRef: { current: false },
      timerResizePending: false, // stale React state from previous render
      timerResizePendingRef: ref,
      setShortcutStatus: (value) => messages.push(value),
    },
  );
  await requestMode("panel", true);
  assert.deepEqual(messages, [
    "Quick task creation is unavailable while the Focus surface is changing.",
  ], "the immediate resize ref must reject a new transition before its first await");

  let startedTaskCreation = false;
  let requestedMode = false;
  const onKeyDown = vm.runInNewContext(
    extract("    const onKeyDown = (event: KeyboardEvent) => {",
      '    window.addEventListener("keydown", onKeyDown);')
      + "\nonKeyDown;",
    {
      resolveInAppShortcut: () => "create-task",
      completionSuccess: null,
      hasActiveModalShortcutBoundary: () => false,
      isEditableShortcutTarget: () => false,
      presentationHydrated: true,
      transitionGateRef: { current: false },
      timerResizePending: false, // same stale render's keyboard listener
      timerResizePendingRef: ref,
      setShortcutStatus: (value) => messages.push(value),
      setQuickTaskOpen: () => { startedTaskCreation = true; },
      requestModeRef: { current: () => { requestedMode = true; } },
      presentationRef: { current: "timerCompact" },
      focusSurfaceModeOf: () => "timer",
    },
  );
  const event = { defaultPrevented: false, target: null, preventDefault() { this.defaultPrevented = true; } };
  onKeyDown(event);
  assert.equal(event.defaultPrevented, true);
  assert.equal(startedTaskCreation, false);
  assert.equal(requestedMode, false);
  assert.equal(messages.length, 2);
  assert.equal(messages[1], "Quick task creation is unavailable while the Focus surface is changing.");
});


test("native Find Timer defers and replays the latest sequence across protected Focus transitions", () => {
  const coordinator = fs.readFileSync(
    new URL("../src/FocusSurfaceCoordinator.tsx", import.meta.url), "utf8",
  );
  const extract = (start, end) => {
    const begin = coordinator.indexOf(start);
    const finish = coordinator.indexOf(end, begin + start.length);
    assert.ok(begin >= 0 && finish > begin, "real Find handler/effect must be located");
    return ts.transpileModule(coordinator.slice(begin, finish), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
    }).outputText;
  };
  const pulses = [];
  const lastFindRequestRef = { current: 0 };
  const deferredFindSequenceRef = { current: null };
  const transitionGateRef = { current: true };
  const timerResizePendingRef = { current: false };
  const presentationRef = { current: "timerCompact" };
  let handleFind;
  const common = {
    lastFindRequestRef, deferredFindSequenceRef, transitionGateRef,
    timerResizePendingRef, presentationRef,
    focusSurfaceModeOf: (p) => p === "panel" ? "panel" : "timer",
    setFindTimerPulse: (value) => pulses.push(value),
  };
  vm.runInNewContext(
    extract('    void subscribe<number>("focus-timer-find-requested", (sequence) => {',
      "\n\n    return () => {\n      disposed = true;")
      + "\n",
    {
      ...common,
      presentationHydratedRef: { current: true },
      subscribe: (eventName, callback) => {
        assert.equal(eventName, "focus-timer-find-requested");
        handleFind = callback;
      },
    },
  );
  assert.equal(typeof handleFind, "function");
  handleFind(1);
  assert.equal(lastFindRequestRef.current, 0);
  assert.equal(deferredFindSequenceRef.current, 1);
  assert.deepEqual(pulses, []);

  const replay = (transitionPending, timerResizePending) => {
    vm.runInNewContext(
      extract(
        "  useEffect(() => {\n    if (!presentationHydrated || transitionPending || timerResizePending) return;",
        "\n\n  useEffect(() => {\n    if (\n      !presentationHydrated",
      ),
      {
        ...common,
        useEffect: (callback) => callback(),
        presentationHydrated: true,
        transitionPending,
        timerResizePending,
        deferredPanelResumeNonceRef: { current: undefined },
        deferredToggleSequenceRef: { current: null },
        lastToggleRequestRef: { current: 0 },
        timerProjectionRef: { current: null },
        handleBlitzPanelRequest: () => {},
      },
    );
  };
  replay(true, false);
  assert.deepEqual(pulses, []);
  transitionGateRef.current = false;
  replay(false, false);
  assert.deepEqual(pulses, [1]);
  assert.equal(lastFindRequestRef.current, 1);
  assert.equal(deferredFindSequenceRef.current, null);

  handleFind(1); // delivered sequence must not pulse twice
  assert.deepEqual(pulses, [1]);
  timerResizePendingRef.current = true;
  handleFind(2);
  handleFind(3); // coalesce repeated native trigger while resizing
  assert.equal(deferredFindSequenceRef.current, 3);
  assert.equal(lastFindRequestRef.current, 1);
  replay(false, true);
  assert.deepEqual(pulses, [1]);
  timerResizePendingRef.current = false;
  replay(false, false);
  assert.deepEqual(pulses, [1, 3]);
  assert.equal(lastFindRequestRef.current, 3);
  assert.equal(deferredFindSequenceRef.current, null);
});


test("presentation listener rejection still hydrates from native authority and preserves an observable error", async () => {
  const coordinator = fs.readFileSync(
    new URL("../src/FocusSurfaceCoordinator.tsx", import.meta.url), "utf8",
  );
  const startMarker = "  useEffect(() => {\n    let disposed = false;\n    let stopListening: (() => void) | undefined;";
  const endMarker = "\n\n  useEffect(() => {\n    if (!presentationHydrated || transitionPending || timerResizePending) return;";
  const start = coordinator.indexOf(startMarker);
  const end = coordinator.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0 && end > start, "actual presentation listener lifecycle must exist");
  const realEffect = ts.transpileModule(coordinator.slice(start, end), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;

  const run = async (listenerFails, disposeImmediately = false) => {
    const order = [];
    const failures = [];
    let cleanup;
    const hydratedRef = { current: false };
    const listenerError = new Error("event listener unavailable");
    vm.runInNewContext(realEffect, {
      useEffect: (callback) => { cleanup = callback(); },
      listen: () => {
        order.push("listen");
        return listenerFails
          ? Promise.reject(listenerError)
          : Promise.resolve(() => { order.push("unlisten"); });
      },
      FOCUS_PRESENTATION_CHANGED_EVENT: "focus-surface-presentation-changed",
      getFocusSurfacePresentation: async () => {
        order.push("native-snapshot");
        return "timerCompact";
      },
      presentationReconcileRevisionRef: { current: 0 },
      transitionGateRef: { current: false },
      publishPresentation: (presentation) => order.push("renderer:" + presentation),
      presentationHydratedRef: hydratedRef,
      setPresentationHydrated: (hydrated) => order.push("hydrated:" + hydrated),
      setTransitionError: (message) => failures.push(message),
      formatInvokeError: (error) => error.message,
    });
    assert.equal(typeof cleanup, "function");
    if (disposeImmediately) cleanup();
    await new Promise((resolve) => setImmediate(resolve));
    if (!disposeImmediately) cleanup();
    return { order, failures, hydratedRef };
  };

  const normal = await run(false);
  assert.deepEqual(normal.order.slice(0, 4), [
    "listen", "native-snapshot", "renderer:timerCompact", "hydrated:true",
  ], "successful subscription must precede initial authoritative snapshot");
  assert.deepEqual(normal.failures, []);
  assert.equal(normal.hydratedRef.current, true);

  const failedListener = await run(true);
  assert.deepEqual(failedListener.order, [
    "listen", "native-snapshot", "renderer:timerCompact", "hydrated:true",
  ], "listener failure must not leave the surface inert if native snapshot succeeds");
  assert.deepEqual(failedListener.failures, ["event listener unavailable"]);
  assert.equal(failedListener.hydratedRef.current, true);

  const disposed = await run(true, true);
  assert.deepEqual(disposed.order, ["listen"]);
  assert.deepEqual(disposed.failures, []);
  assert.equal(disposed.hydratedRef.current, false);
});


test("live Timer projection publishes synchronous task revisions before batched React state commits", () => {
  const source = fs.readFileSync(
    new URL("../src/FocusSurfaceCoordinator.tsx", import.meta.url), "utf8",
  );
  const start = source.indexOf("  const publishTimerProjection = useCallback(");
  const end = source.indexOf("\n\n  const setTimerResizeBusy = useCallback(", start);
  assert.ok(start >= 0 && end > start, "real shared Timer projection publisher must be extractable");
  const actual = ts.transpileModule(source.slice(start, end), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;

  const latest = { current: null };
  const queued = [];
  const publish = vm.runInNewContext(actual + "\npublishTimerProjection;", {
    useCallback: (callback) => callback,
    timerProjectionRef: latest,
    applyTimerSessionProjection: (current, incoming) =>
      current === null || incoming.revision >= current.revision ? incoming : current,
    // Simulate a React root batching queued updates until *after* the native
    // listener has already delivered more than one session projection.
    setTimerProjection: (next) => { queued.push(next); },
  });

  const initial = { revision: 10, runtime: { timer: { task_id: "old-task" } } };
  const later = { revision: 12, runtime: { timer: { task_id: "next-task" } } };
  const outdated = { revision: 11, runtime: { timer: { task_id: "old-task" } } };
  publish(initial);
  assert.equal(latest.current, initial, "the first event must advance the task identity synchronously");
  publish(later);
  assert.equal(latest.current, later, "the new task must be immediately visible to raster/task guards");
  publish(outdated);
  assert.equal(latest.current, later, "an old event must not roll back the latest authority");
  assert.deepEqual(queued, [initial, later, later]);
  assert.ok(queued.every((value) => typeof value !== "function"),
    "the ref must not be mutated later inside a queued React functional updater");
  for (const required of [
    "publishTimerProjection(incoming)",
    "publishTimerProjection(resumed)",
    "publishTimerProjection(payload)",
  ]) {
    assert.ok(source.includes(required), "all three production session readers must share the synchronous owner: " + required);
  }
  assert.ok(!source.includes("setTimerProjection((current)"),
    "no alternative asynchronous updater may mutate the task identity ref");
});
