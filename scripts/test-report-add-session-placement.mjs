import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { positionReportAddSession } from "../src/reportAddSessionPlacement.ts";

const viewport = { width: 1024, height: 768 };
const panel = { width: 520, height: 310 };
assert.deepEqual(positionReportAddSession(
  { left: 200, top: 60, right: 400, bottom: 100 }, panel, viewport),
  { left: 200, top: 108 },
  "Default Add Session placement stays below the source trigger");
assert.deepEqual(positionReportAddSession(
  { left: 960, top: 690, right: 1020, bottom: 740 }, panel, viewport),
  { left: 488, top: 372 },
  "Right/bottom trigger must flip upward and clamp inside available viewport");
assert.deepEqual(positionReportAddSession(
  { left: -20, top: -10, right: 0, bottom: 0 },
  { width: 800, height: 850 }, { width: 600, height: 580 }),
  { left: 16, top: 16 },
  "Oversized dialog preserves safe upper-left position with its internal scroll");
assert.deepEqual(positionReportAddSession(
  { left: 60, top: 350, right: 90, bottom: 370 },
  { width: 300, height: 300 }, { width: 400, height: 600 }),
  { left: 60, top: 42 },
  "Near-bottom dialog goes above the activating control rather than offscreen");

const root = new URL("../", import.meta.url);
const view = readFileSync(new URL("src/ReportsSessionsView.tsx", root), "utf8");
const css = readFileSync(new URL("src/reportsSessions.css", root), "utf8");
assert.match(view, /positionReportAddSession\(/, "production Add Session uses bounded placement");
assert.match(view, /returnFocusTarget\?\.getBoundingClientRect\(\)/,
  "anchor is the real clicked target, not a guessed constant");
assert.match(view, /data-report-add-anchored=\{anchorPosition \? "true" : "false"\}/,
  "fallback to centered modal exists when opener no longer exists");
assert.match(css, /\[data-report-add-anchored="true"\]/,
  "only anchored Add Session changes its absolute positioning");
assert.match(view, /aria-modal="true"/,
  "anchored card keeps modal keyboard and focus ownership");
assert.match(view, /onDraftChange\(\{ \.\.\.draft, taskId \}\)/,
  "session task selection stays bound to existing owner");
console.log("Anchored Add Session geometry, viewport clamping, focus and selected task contracts: PASS");
