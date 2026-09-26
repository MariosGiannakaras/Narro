import assert from "node:assert/strict";
import test from "node:test";
import { FocusVisualHoldOwner } from "../src/focusVisualHoldOwner.ts";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test("one visual copy is acquired before a mode change and released once", async () => {
  const events = [];
  const begin = deferred();
  const owner = new FocusVisualHoldOwner(
    async () => { events.push("begin"); await begin.promise; },
    async () => { events.push("end"); },
  );
  const acquiring = owner.acquire();
  await assert.rejects(owner.acquire(), /already in use/);
  assert.deepEqual(events, ["begin"]);
  begin.resolve();
  await acquiring;
  await Promise.all([owner.release(), owner.release()]);
  await owner.release();
  assert.deepEqual(events, ["begin", "end"]);
});

test("release during acquisition waits for acquisition and removes the copy", async () => {
  const begin = deferred();
  let ended = 0;
  const owner = new FocusVisualHoldOwner(() => begin.promise, async () => { ended++; });
  const acquiring = owner.acquire();
  const releasing = owner.release();
  begin.resolve();
  await Promise.all([acquiring, releasing]);
  assert.equal(ended, 1);
});

test("failed acquisition leaves no owned copy and can be retried", async () => {
  let attempts = 0;
  let ended = 0;
  const owner = new FocusVisualHoldOwner(
    async () => { if (++attempts === 1) throw new Error("capture failed"); },
    async () => { ended++; },
  );
  await assert.rejects(owner.acquire(), /capture failed/);
  await owner.release();
  assert.equal(ended, 0);
  await owner.acquire();
  await owner.release();
  assert.equal(ended, 1);
});

test("failed cleanup retains ownership for a later retry", async () => {
  let attempts = 0;
  const owner = new FocusVisualHoldOwner(
    async () => {},
    async () => { if (++attempts === 1) throw new Error("destroy failed"); },
  );
  await owner.acquire();
  await assert.rejects(owner.release(), /destroy failed/);
  await assert.rejects(owner.acquire(), /already in use/);
  await owner.release();
  assert.equal(attempts, 2);
});
