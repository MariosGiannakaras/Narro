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
console.log("A02 native/QPC screen-frame correlation: PASS");
