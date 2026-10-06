import assert from "node:assert/strict";
import {
  findSelectedMonitor,
  isValidMonitorSelection,
} from "../src/diagnosticApi.ts";

function monitorKey({
  name,
  x,
  y,
  width,
  height,
  workX,
  workY,
  workWidth,
  workHeight,
  scaleBits,
}) {
  return [
    name,
    x,
    y,
    width,
    height,
    workX,
    workY,
    workWidth,
    workHeight,
    scaleBits,
  ].join("|");
}

function descriptor({
  name = String.raw`\\.\DISPLAY1`,
  x = 0,
  y = 0,
  width = 1920,
  height = 1080,
  workX = x,
  workY = y,
  workWidth = width,
  workHeight = height - 40,
  scaleFactor = 1,
  scaleBits = "3ff0000000000000",
  index = 0,
} = {}) {
  return {
    key: monitorKey({
      name,
      x,
      y,
      width,
      height,
      workX,
      workY,
      workWidth,
      workHeight,
      scaleBits,
    }),
    index,
    name,
    scaleFactor,
    position: { x, y },
    size: { width, height },
    workArea: {
      position: { x: workX, y: workY },
      size: { width: workWidth, height: workHeight },
    },
  };
}

const current = descriptor();
const savedAt125Percent = monitorKey({
  name: String.raw`\\.\DISPLAY1`,
  x: 0,
  y: 0,
  width: 1920,
  height: 1080,
  workX: 0,
  workY: 0,
  workWidth: 1536,
  workHeight: 832,
  scaleBits: "3ff4000000000000",
});

assert.equal(findSelectedMonitor(current.key, [current]), current);
assert.equal(findSelectedMonitor(savedAt125Percent, [current]), current);
assert.equal(isValidMonitorSelection(savedAt125Percent, [current]), true);

const movedAndResizedSameDisplay = descriptor({
  x: -2560,
  y: 120,
  width: 2560,
  height: 1440,
  workX: -2560,
  workY: 120,
  workWidth: 2560,
  workHeight: 1400,
});
assert.equal(findSelectedMonitor(savedAt125Percent, [movedAndResizedSameDisplay]), movedAndResizedSameDisplay);

const differentDisplay = descriptor({ name: String.raw`\\.\DISPLAY2` });
assert.equal(findSelectedMonitor(savedAt125Percent, [differentDisplay]), null);
assert.equal(isValidMonitorSelection(savedAt125Percent, [differentDisplay]), false);
assert.equal(findSelectedMonitor("malformed-monitor-key", [current]), null);

const duplicateNamedDisplays = [
  descriptor({ index: 0 }),
  descriptor({ index: 1, x: 1920 }),
];
assert.equal(findSelectedMonitor(savedAt125Percent, duplicateNamedDisplays), null);

const pipedName = descriptor({ name: "DISPLAY|ALIAS" });
const pipedSaved = monitorKey({
  name: "DISPLAY|ALIAS",
  x: 0,
  y: 0,
  width: 1920,
  height: 1080,
  workX: 0,
  workY: 0,
  workWidth: 1536,
  workHeight: 832,
  scaleBits: "3ff4000000000000",
});
assert.equal(findSelectedMonitor(pipedSaved, [pipedName]), pipedName);

const unnamed = descriptor({ name: "" });
const unnamedSaved = monitorKey({
  name: "",
  x: 0,
  y: 0,
  width: 1920,
  height: 1080,
  workX: 0,
  workY: 0,
  workWidth: 1536,
  workHeight: 832,
  scaleBits: "3ff4000000000000",
});
assert.equal(findSelectedMonitor(unnamedSaved, [unnamed]), null);

console.log("Monitor selection identity regressions passed.");
