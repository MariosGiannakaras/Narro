import assert from "node:assert/strict";
import { waitForOpacityTransition } from "../src/opacityTransition.ts";

const frames = [];
globalThis.requestAnimationFrame = (callback) => {
  frames.push(callback);
  return frames.length;
};
globalThis.getComputedStyle = (element) => ({ opacity: element.opacity });

function frame() {
  const callbacks = frames.splice(0);
  assert.ok(callbacks.length > 0, "a phase must wait for its render frame");
  for (const callback of callbacks) callback(0);
}

function deferred() {
  let resolve;
  let reject;
  const finished = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { finished, resolve, reject };
}

function element(opacity, animations = []) {
  return { opacity, getAnimations: () => animations };
}

{
  const root = element("0");
  const completion = waitForOpacityTransition(root, 0);
  frame();
  await completion;
}

{
  const exit = deferred();
  const root = element("0.5", [
    { transitionProperty: "opacity", finished: exit.finished },
    { transitionProperty: "transform", finished: new Promise(() => {}) },
  ]);
  let completed = false;
  const completion = waitForOpacityTransition(root, 0).then(() => { completed = true; });
  frame();
  await Promise.resolve();
  assert.equal(completed, false, "native work must wait for the opacity exit");
  root.opacity = "0";
  exit.resolve();
  await completion;
  assert.equal(completed, true);
}

{
  const cancelled = deferred();
  const root = element("1", [{ transitionProperty: "opacity", finished: cancelled.finished }]);
  const completion = waitForOpacityTransition(root, 1);
  frame();
  await Promise.resolve();
  cancelled.reject(new Error("CSS transition cancelled"));
  await completion;
}

{
  const cancelled = deferred();
  const root = element("0.4", [{ transitionProperty: "opacity", finished: cancelled.finished }]);
  const completion = waitForOpacityTransition(root, 0);
  frame();
  await Promise.resolve();
  cancelled.reject(new Error("CSS transition cancelled"));
  await assert.rejects(completion, /did not reach 0/);
}

{
  const root = element("1");
  const completion = waitForOpacityTransition(root, 0);
  frame();
  await assert.rejects(completion, /did not reach 0/);
}

console.log("Opacity transition completion behavioral tests passed");
