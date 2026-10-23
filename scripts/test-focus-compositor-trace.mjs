import assert from "node:assert/strict";
import { correlateFocusTrace } from "./analyze-focus-compositor-trace.mjs";

const e = (qpcTicks, stage, step) => ({
  qpcTicks, qpcFrequency: 1_000_000, stage, rasterToken: 42,
  details: { data: { step, easedProgress: step / 10 } },
});
const ordered = [e(1200, "native.after-move", 2), e(800, "native.before-raster", 1), e(1050, "native.after-raster", 2)];
const input = { frames: [{
  index: 0, fileName: "frame-000.png",
  captureQpcBefore: 900, captureQpcAfter: 1100,
  captureQpcFrequency: 1_000_000, native: { dpi: 96 },
}, {
  index: 1, fileName: "frame-001.png",
  captureQpcBefore: 1250, captureQpcAfter: 1350,
  captureQpcFrequency: 1_000_000,
}] };
const result = correlateFocusTrace(ordered, input);
assert.equal(result.schemaVersion, 1);
assert.equal(result.frames.length, 2);
assert.equal(result.frames[0].prior.stage, "native.before-raster");
assert.equal(result.frames[0].nearest.stage, "native.after-raster");
assert.equal(result.frames[0].duringCapture[0].stage, "native.after-raster");
assert.equal(result.frames[0].following.stage, "native.after-move");
assert.equal(result.frames[0].bracketMs, 0.2);
assert.equal(result.frames[1].following, null);
assert.equal(result.outsideTraceBracket, 1);
assert.match(result.interpretation, /does not confirm DWM scanout/);
assert.deepEqual(correlateFocusTrace(ordered, input.frames).frames, result.frames);
assert.throws(() => correlateFocusTrace([], input), /QPC events missing/);
assert.throws(() => correlateFocusTrace([e(1, "a", 0)], []), /No screen/);
assert.throws(() => correlateFocusTrace([e(1, "a", 0), {...e(2, "b", 0), qpcFrequency: 999}], input), /inconsistent/);
assert.throws(() => correlateFocusTrace(ordered, {frames: [{...input.frames[0], captureQpcAfter: 500}]}), /missing, reversed/);
assert.throws(() => correlateFocusTrace(ordered, {frames: [{...input.frames[0], captureQpcFrequency: 8}]}), /different timebase/);
for (const field of ["captureQpcBefore", "captureQpcAfter", "captureQpcFrequency"]) {
  for (const invalid of [null, "", "0", undefined, Number.NaN, Number.POSITIVE_INFINITY,
    1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(
      () => correlateFocusTrace(ordered, {frames: [{...input.frames[0], [field]: invalid}]}),
      /missing, reversed, or from a different timebase/,
      `corrupt screen sample ${field}=${String(invalid)} must fail closed`,
    );
  }
}
// A completed prior native transition can flush its stage markers after the
// next transition begins; their timestamps must not contaminate A02 attribution.
const twoTransitions = [
  {...e(100, "native.begin", 0), rasterToken: 11},
  {...e(120, "native.after-move", 1), rasterToken: 11},
  {...e(1000, "native.begin", 0), rasterToken: 12},
  {...e(1040, "native.after-raster", 1), rasterToken: 12},
  {...e(1100, "native.after-move", 2), rasterToken: 11},
  {...e(1300, "native.after-move", 3), rasterToken: 12},
];
const secondCapture = {
  frames: [{index: 0, fileName: "a02.png", captureQpcBefore: 1060,
    captureQpcAfter: 1080, captureQpcFrequency: 1_000_000}],
};
const isolated = correlateFocusTrace(twoTransitions, secondCapture).frames[0];
assert.equal(isolated.activeRasterToken, 12);
assert.equal(isolated.prior.rasterToken, 12);
assert.equal(isolated.following.rasterToken, 12);
assert.equal(isolated.prior.stage, "native.after-raster");
assert.equal(isolated.following.qpcTicks, 1300);
assert.equal(isolated.claim, "native-call-phase-near-screen-sample; DWM-scanout-unconfirmed");
const crossing = correlateFocusTrace(twoTransitions, {
  frames: [{index:1, fileName:"begin-boundary.png",
    captureQpcBefore: 990, captureQpcAfter:1010,
    captureQpcFrequency:1_000_000}],
}).frames[0];
assert.equal(crossing.activeRasterToken, null);
assert.equal(crossing.transitionBoundaryWithinCapture, true);
assert.match(crossing.claim, /attribution-ambiguous/);
console.log("A02 native/QPC screen-frame correlation: PASS");
