import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { commitProtectedTimerResize } from "../src/protectedTimerResize.ts";
import { waitForPresentedFrameOrThrow, waitForPresentedFrameWithin, waitForTimerRasterReady } from "../src/presentationFrame.ts";
import { FocusPresentationRecoveryError } from "../src/focusPresentationTransition.ts";

function harness(previous = "timerCompact", target = "timerExpanded") {
  const calls = [], failures = new Map();
  let paint = 0, releases = 0;
  const run = (name) => { calls.push(name); if (failures.has(name)) throw failures.get(name); };
  return { calls, failures, ops: {
    previous, target,
    protectOutgoing: async (next) => { run(`protect:${next}`); return 41; },
    prepareRenderer: (next) => run(`prepare:${next}`),
    waitForPaint: async () => run(`paint:${++paint}`),
    animate: async (next, token) => run(`animate:${next}:${token}`),
    publish: (next) => run(`publish:${next}`),
    restoreNative: async (token) => run(`restore:${token}`),
    release: async (token) => run(`release:${token}:${++releases}`),
  }};
}

for (const [from, to] of [["timerCompact", "timerExpanded"], ["timerExpanded", "timerCompact"]]) {
  test(`${from} protects before geometry and releases only after publication paint`, async () => {
    const h = harness(from, to);
    assert.equal(await commitProtectedTimerResize(h.ops), true);
    assert.deepEqual(h.calls, [`protect:${to}`, `prepare:${to}`, "paint:1", `animate:${to}:41`,
      `publish:${to}`, "paint:2", "release:41:1"]);
  });
}
test("same presentation does not acquire or mutate", async () => {
  const h = harness("timerCompact", "timerCompact");
  assert.equal(await commitProtectedTimerResize(h.ops), false); assert.deepEqual(h.calls, []);
});
test("failed outgoing acquisition cannot touch renderer/native state", async () => {
  const h = harness(), failure = Error("capture failed"); h.failures.set("protect:timerExpanded", failure);
  await assert.rejects(commitProtectedTimerResize(h.ops), (error) => error === failure);
  assert.deepEqual(h.calls, ["protect:timerExpanded"]);
});
for (const phase of ["prepare:timerExpanded", "paint:1", "animate:timerExpanded:41", "publish:timerExpanded", "paint:2", "release:41:1"]) {
  test(`${phase} failure restores renderer under lease before native rollback/release`, async () => {
    const h = harness(), failure = Error(phase); h.failures.set(phase, failure);
    await assert.rejects(commitProtectedTimerResize(h.ops), (error) => error === failure);
    const start = h.calls.indexOf("prepare:timerCompact");
    const recovery = h.calls.slice(start);
    assert.equal(recovery[0], "prepare:timerCompact");
    assert.match(recovery[1], /^paint:/);
    assert.deepEqual(recovery.slice(2, 4), ["restore:41", "publish:timerCompact"]);
    assert.match(recovery[4], /^paint:/); assert.match(recovery[5], /^release:41:/);
  });
}
test("rollback failure retains both causes and does not release unsafe pixels", async () => {
  const h = harness(), primary = Error("animate"), secondary = Error("restore");
  h.failures.set("animate:timerExpanded:41", primary); h.failures.set("restore:41", secondary);
  await assert.rejects(commitProtectedTimerResize(h.ops), (error) => error instanceof FocusPresentationRecoveryError
    && error.transitionFailure === primary && error.recoveryFailure === secondary);
  assert.equal(h.calls.some((call) => call.startsWith("release:")), false);
});
test("delayed target paint cannot start animation early", async () => {
  const h = harness(); let resolve; const gate = new Promise((done) => { resolve = done; });
  const original = h.ops.waitForPaint; let first = true;
  h.ops.waitForPaint = async () => { await original(); if (first) { first = false; await gate; } };
  const pending = commitProtectedTimerResize(h.ops);
  await new Promise((done) => setImmediate(done));
  assert.deepEqual(h.calls, ["protect:timerExpanded", "prepare:timerExpanded", "paint:1"]);
  resolve(); await pending;
});

test("application wiring uses the protected path rather than the standalone fallback", () => {
  const coordinator = fs.readFileSync(new URL("../src/FocusSurfaceCoordinator.tsx", import.meta.url), "utf8");
  const foundation = fs.readFileSync(new URL("../src/FloatingTimerFoundation.tsx", import.meta.url), "utf8");
  const subtasks = fs.readFileSync(new URL("../src/FocusLiveSubtasks.tsx", import.meta.url), "utf8");
  const native = fs.readFileSync(new URL("../src-tauri/src/lib.rs", import.meta.url), "utf8");
  assert.ok(coordinator.includes("commitProtectedTimerResize({"));
  assert.ok(coordinator.includes("protectOutgoing: prepareFocusSurfaceModeRaster"));
  assert.ok(coordinator.includes("waitForTimerRasterReady("));
  assert.ok(coordinator.includes('data-floating-subtasks="expanded"][data-floating-subtasks-loading="true"]'));
  assert.ok(coordinator.includes("waitForPresentedFrameWithin,"));
  assert.ok(subtasks.includes("data-floating-subtasks-loading="));
  assert.ok(coordinator.includes("restoreNative: (token) => finishFocusSurfaceModeRaster(token, true)"));
  assert.ok(coordinator.includes("onRequestExpanded={requestTimerExpanded}"));
  const body = foundation.slice(foundation.indexOf("const requestExpanded = async"));
  assert.ok(body.indexOf("await onRequestExpanded(nextExpanded") < body.indexOf("if (nextExpanded) {"));
  assert.ok(native.includes("if snapshot.presentation == target {"));
  assert.ok(native.includes("else if lease.snapshot.presentation.mode() != FocusSurfaceMode::Timer"));
});

test("delayed native animation cannot publish or release early", async () => {
  const h = harness(); let resolve; const gate = new Promise((done) => { resolve = done; });
  const original = h.ops.animate;
  h.ops.animate = async (...args) => { await original(...args); await gate; };
  const pending = commitProtectedTimerResize(h.ops);
  await new Promise((done) => setImmediate(done));
  assert.equal(h.calls.some((call) => /^(publish|release):/.test(call)), false);
  resolve(); await pending;
});

test("expanded Timer waits for authoritative subtask hydration plus a final paint", async () => {
  let now = 0;
  let frames = 0;
  await waitForTimerRasterReady(
    "timerExpanded",
    () => frames < 3,
    async (remaining) => { assert.ok(remaining > 0); now += 16; frames += 1; return true; },
    () => now,
    150,
  );
  assert.equal(frames, 4, "one initial paint, hydration frames and one final paint");
});

test("compact Timer never waits for stale expanded subtask hydration", async () => {
  let frames = 0;
  await waitForTimerRasterReady(
    "timerCompact",
    () => true,
    async () => { frames += 1; return true; },
    () => 0,
    150,
  );
  assert.equal(frames, 2);
});

test("never-settling expanded subtasks fail closed instead of rasterizing loading text", async () => {
  let now = 0;
  let frames = 0;
  await assert.rejects(
    waitForTimerRasterReady(
      "timerExpanded",
      () => true,
      async () => { frames += 1; now += 100; return true; },
      () => now,
      250,
    ),
    /did not finish preparing for raster capture/,
  );
  assert.ok(frames <= 3, "a deadline must limit the hydration loop");
});

test("suspended renderer frames fail closed without unbounded requestAnimationFrame wait", async () => {
  await assert.rejects(
    waitForTimerRasterReady("timerExpanded", () => true, async () => false, () => 0, 250),
    /did not finish preparing for raster capture/,
  );
});

test("timed paint cancels abandoned rAF callbacks when the renderer is suspended", async () => {
  const previousWindow = globalThis.window;
  let fireTimeout;
  const canceled = [];
  globalThis.window = {
    setTimeout: (callback) => { fireTimeout = callback; return 11; },
    clearTimeout: () => undefined,
    requestAnimationFrame: () => 21,
    cancelAnimationFrame: (id) => { canceled.push(id); },
  };
  try {
    const wait = waitForPresentedFrameWithin(20);
    assert.equal(typeof fireTimeout, "function");
    fireTimeout();
    assert.equal(await wait, false);
    assert.ok(canceled.includes(21));
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("Focus presentation transaction rejects a suspended WebView after a finite frame deadline", async () => {
  const previousWindow = globalThis.window;
  let fireTimeout;
  let pendingCallback = 0;
  const canceled = [];
  globalThis.window = {
    setTimeout: (callback) => { fireTimeout = callback; return 41; },
    clearTimeout: () => undefined,
    requestAnimationFrame: () => ++pendingCallback,
    cancelAnimationFrame: (id) => { canceled.push(id); },
  };
  try {
    const paint = waitForPresentedFrameOrThrow(200);
    assert.equal(typeof fireTimeout, "function");
    fireTimeout();
    await assert.rejects(paint, /Focus presentation did not paint within the recovery deadline/);
    assert.deepEqual(canceled, [1, 0]);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("all critical Focus and Timer geometry paths use the finite presentation barrier", () => {
  for (const path of ["../src/FocusSurfaceCoordinator.tsx", "../src/FloatingTimerFoundation.tsx"]) {
    const body = fs.readFileSync(new URL(path, import.meta.url), "utf8");
    assert.match(body, /waitForPresentedFrameOrThrow\(\)/);
    assert.doesNotMatch(body, /(?<![A-Za-z])waitForPresentedFrame\(\)/);
  }
});
