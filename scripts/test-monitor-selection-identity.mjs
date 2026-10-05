import assert from "node:assert/strict";
import {
  findSelectedMonitor,
  isValidMonitorSelection,
  monitorMatchesSelectionKey,
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

const current = {
  key: monitorKey({
    name: String.raw`\\.\DISPLAY1`,
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    workX: 0,
    workY: 0,
    workWidth: 1920,
    workHeight: 1040,
    scaleBits: "3ff0000000000000",
  }),
  index: 0,
  name: String.raw`\\.\DISPLAY1`,
  scaleFactor: 1,
  position: { x: 0, y: 0 },
  size: { width: 1920, height: 1080 },
  workArea: {
    position: { x: 0, y: 0 },
    size: { width: 1920, height: 1040 },
  },
};

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

assert.equal(monitorMatchesSelectionKey(current, current.key), true);
assert.equal(monitorMatchesSelectionKey(current, savedAt125Percent), true);
assert.equal(isValidMonitorSelection(savedAt125Percent, [current]), true);
assert.equal(findSelectedMonitor(savedAt125Percent, [current]), current);

for (const staleKey of [
  monitorKey({
    name: String.raw`\\.\DISPLAY2`,
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    workX: 0,
    workY: 0,
    workWidth: 1920,
    workHeight: 1040,
    scaleBits: "3ff0000000000000",
  }),
  monitorKey({
    name: String.raw`\\.\DISPLAY1`,
    x: -1920,
    y: 0,
    width: 1920,
    height: 1080,
    workX: -1920,
    workY: 0,
    workWidth: 1920,
    workHeight: 1040,
    scaleBits: "3ff0000000000000",
  }),
  monitorKey({
    name: String.raw`\\.\DISPLAY1`,
    x: 0,
    y: 0,
    width: 2560,
    height: 1440,
    workX: 0,
    workY: 0,
    workWidth: 2560,
    workHeight: 1400,
    scaleBits: "3ff0000000000000",
  }),
  "malformed-monitor-key",
]) {
  assert.equal(monitorMatchesSelectionKey(current, staleKey), false);
  assert.equal(isValidMonitorSelection(staleKey, [current]), false);
  assert.equal(findSelectedMonitor(staleKey, [current]), null);
}

const pipedName = {
  ...current,
  key: monitorKey({
    name: "DISPLAY|ALIAS",
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    workX: 0,
    workY: 0,
    workWidth: 1920,
    workHeight: 1040,
    scaleBits: "3ff0000000000000",
  }),
  name: "DISPLAY|ALIAS",
};
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
assert.equal(monitorMatchesSelectionKey(pipedName, pipedSaved), true);

console.log("Monitor selection identity regressions passed.");
