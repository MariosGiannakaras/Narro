import assert from "node:assert/strict";
import {
  MOTION_V4_DURATION_MS,
  MOTION_V4_REDUCED_DURATION_MS,
  isMotionV4Route,
  motionV4Duration,
  motionV4Progress,
  sampleMotionV4,
} from "../src/focusMotionV4.ts";

const routes = [
  ["panel", "timerCompact", 700, 110],
  ["timerCompact", "timerExpanded", 110, 300],
  ["timerExpanded", "timerCompact", 300, 110],
  ["timerCompact", "panel", 110, 700],
  ["timerExpanded", "panel", 300, 700],
];

assert.equal(MOTION_V4_DURATION_MS, 500);
assert.equal(MOTION_V4_REDUCED_DURATION_MS, 1);
assert.equal(motionV4Duration(true), 1);
assert.equal(motionV4Duration(false), 500);
assert.equal(motionV4Progress(250), 0.5);
assert.equal(motionV4Progress(500), 1);
assert.equal(motionV4Progress(900), 1);
assert.equal(motionV4Progress(1, true), 1);
assert.equal(motionV4Progress(0), 0);
for (const bad of [NaN, Infinity, -1]) {
  assert.throws(() => motionV4Progress(bad), RangeError);
}

for (const [from, to, startHeight, endHeight] of routes) {
  const route = { from, to };
  assert.equal(isMotionV4Route(route), true);
  const frames = Array.from({ length: 101 }, (_, tick) =>
    sampleMotionV4(route, tick / 100, [182, 218, 254, 290]),
  );
  assert.equal(frames[0].visibleHeight, startHeight);
  assert.equal(frames[100].visibleHeight, endHeight);
  assert.equal(frames[0].progress, 0);
  assert.equal(frames[100].progress, 1);
  assert.equal(frames[50].easedProgress, 0.5);
  assert.deepEqual(frames[50].subtaskRowOpacity.length, 4);
  for (const frame of frames) {
    assert.ok(Number.isFinite(frame.visibleHeight));
    for (const key of [
      "easedProgress", "panelAmount", "expandedAmount",
      "sharedAnchorFraction", "panelChromeOpacity", "activeCardOpacity",
      "liveMetadataOpacity", "queueOpacity", "actionsOpacity",
    ]) assert.ok(frame[key] >= 0 && frame[key] <= 1, key);
    for (const opacity of frame.subtaskRowOpacity) {
      assert.ok(opacity >= 0 && opacity <= 1);
    }
    if (to === "timerCompact" || to === "timerExpanded") {
      assert.ok(frame.visibleHeight >= Math.min(startHeight, endHeight));
      assert.ok(frame.visibleHeight <= Math.max(startHeight, endHeight));
    }
  }
  for (let i = 1; i < frames.length; i++) {
    assert.ok(frames[i].easedProgress >= frames[i - 1].easedProgress);
    const direction = Math.sign(endHeight - startHeight);
    assert.ok((frames[i].visibleHeight - frames[i - 1].visibleHeight) * direction >= -1e-8);
  }
}
for (const bad of [NaN, Infinity, -0.1, 1.1]) {
  assert.throws(() => sampleMotionV4({ from: "panel", to: "timerCompact" }, bad), RangeError);
}
assert.equal(isMotionV4Route({ from: "panel", to: "timerExpanded" }), false);
assert.equal(isMotionV4Route({ from: "timerExpanded", to: "panel" }), true);
assert.throws(() => sampleMotionV4({ from: "panel", to: "timerExpanded" }, 0.5), RangeError);
assert.throws(() => sampleMotionV4({ from: "panel", to: "panel" }, 0.5), RangeError);
assert.throws(() => sampleMotionV4({ from: "timerCompact", to: "timerExpanded" }, 0.5, [Infinity]), RangeError);

// No premature row pixels: row opacity remains zero until the entire row
// is within the visible region, with a small bounded threshold cushion.
const open = { from: "timerCompact", to: "timerExpanded" };
const close = { from: "timerExpanded", to: "timerCompact" };
const bottoms = [182, 218, 254, 290];
for (let tick = 0; tick <= 100; tick++) {
  const expansion = sampleMotionV4(open, tick / 100, bottoms);
  const contraction = sampleMotionV4(close, 1 - tick / 100, bottoms);
  assert.ok(Math.abs(expansion.visibleHeight - contraction.visibleHeight) <= 1e-8);
  assert.ok(Math.abs(expansion.actionsOpacity - contraction.actionsOpacity) <= 1e-8);
  bottoms.forEach((bottom, index) => {
    if (expansion.visibleHeight <= bottom) {
      assert.equal(expansion.subtaskRowOpacity[index], 0);
    }
    assert.ok(Math.abs(
      expansion.subtaskRowOpacity[index] - contraction.subtaskRowOpacity[index],
    ) <= 1e-8);
  });
}
assert.equal(sampleMotionV4(open, 0, bottoms).actionsOpacity, 0);
assert.equal(sampleMotionV4(open, 1, bottoms).actionsOpacity, 1);
assert.deepEqual(sampleMotionV4(open, 1, bottoms).subtaskRowOpacity, [1, 1, 1, 1]);
assert.deepEqual(sampleMotionV4(close, 1, bottoms).subtaskRowOpacity, [0, 0, 0, 0]);
for (const [from, to] of routes) {
  const frames = [0, 0.25, 0.5, 0.75, 1].map((progress) =>
    sampleMotionV4({ from, to }, progress).sharedAnchorFraction,
  );
  assert.equal(frames[0], 0, `${from}→${to} shared anchor must start at source`);
  assert.equal(frames.at(-1), 1, `${from}→${to} shared anchor must end at destination`);
  for (let i = 1; i < frames.length; i++) {
    assert.ok(frames[i] >= frames[i - 1], "shared semantic anchor cannot reverse direction");
  }
}
assert.deepEqual(
  sampleMotionV4(open, 1, [299, 300, 301]).subtaskRowOpacity,
  [1, 1, 0],
  "dynamic row endpoint must fully reveal only rows that fit in the real native height",
);
const justBeforeEnd = sampleMotionV4(open, 0.999, [300]);
assert.equal(justBeforeEnd.subtaskRowOpacity[0], 0);
assert.deepEqual(
  sampleMotionV4(open, 1, Array.from({length: 12}, (_, i) => 100 + i * 16)).subtaskRowOpacity,
  Array.from({length: 12}, () => 1),
  "many physically fitting rows must not be permanently hidden by index-based staging",
);

// At one-third expansion actions are already visible, rows are not.
assert.ok(sampleMotionV4(open, 0.40, bottoms).actionsOpacity >
  sampleMotionV4(open, 0.40, bottoms).subtaskRowOpacity[0]);

console.log("Motion v4 pure choreography/geometry/regression: PASS");
