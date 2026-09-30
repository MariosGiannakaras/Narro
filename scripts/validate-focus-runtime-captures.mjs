import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/focus-runtime-visual");

function invariant(condition, message) {
  if (!condition) throw new Error(`Packaged Focus runtime visual validation failed: ${message}`);
}

function pngSize(filePath) {
  invariant(fs.existsSync(filePath), `${path.basename(filePath)} is missing`);
  const png = fs.readFileSync(filePath);
  invariant(png.length >= 24, `${path.basename(filePath)} is incomplete`);
  invariant(png.subarray(0, 8).toString("hex") === "89504e470d0a1a0a", `${path.basename(filePath)} is not a PNG`);
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

function readJson(name) {
  const filePath = path.join(outputDirectory, name);
  invariant(fs.existsSync(filePath), `${name} is missing`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function near(actual, expected, tolerance = 2) {
  return Math.abs(actual - expected) <= tolerance;
}

function validateDom(dom, label, presentation) {
  invariant(dom?.hydrated === "true", `${label} is not presentation-hydrated`);
  invariant(dom.presentation === presentation, `${label} presentation is ${dom.presentation}, expected ${presentation}`);
  invariant(dom.unintendedScrollers?.length === 0, `${label} has document/root overflow: ${JSON.stringify(dom.unintendedScrollers)}`);
  for (const [surface, metrics] of [["documentElement", dom.documentElement], ["body", dom.body], ["root", dom.root], ["coordinator", dom.coordinator]]) {
    invariant(metrics, `${label} is missing ${surface} metrics`);
    invariant(metrics.scrollWidth <= metrics.clientWidth, `${label} ${surface} horizontally scrolls (${metrics.scrollWidth} > ${metrics.clientWidth})`);
    invariant(metrics.scrollHeight <= metrics.clientHeight, `${label} ${surface} vertically scrolls (${metrics.scrollHeight} > ${metrics.clientHeight})`);
  }
  for (const [surface, metrics] of [["documentElement", dom.documentElement], ["body", dom.body], ["root", dom.root]]) {
    invariant(metrics.overflowX === "hidden" && metrics.overflowY === "hidden", `${label} ${surface} must own no document scrolling`);
  }
  invariant(dom.visibleTextLength > 0, `${label} rendered no visible text`);
}

function validateNative(native, label, visibleLogicalHeight) {
  invariant(native?.visible === true, `${label} Focus HWND is not visible`);
  invariant(Number.isFinite(native.dpi) && native.dpi >= 96, `${label} reported invalid DPI ${native?.dpi}`);
  const scale = native.dpi / 96;
  const expectedHostWidth = Math.round(340 * scale);
  const expectedHostHeight = Math.round(700 * scale);
  const expectedVisibleHeight = Math.round(visibleLogicalHeight * scale);
  invariant(near(native.window.width, expectedHostWidth), `${label} HWND width ${native.window.width} != ${expectedHostWidth} at ${native.dpi} DPI`);
  invariant(near(native.window.height, expectedHostHeight), `${label} HWND host height ${native.window.height} != ${expectedHostHeight} at ${native.dpi} DPI`);
  invariant(native.regionKind > 0 && native.region, `${label} has no native visible region`);
  invariant(near(native.region.width, expectedHostWidth), `${label} native region width ${native.region.width} != ${expectedHostWidth}`);
  invariant(near(native.region.height, expectedVisibleHeight), `${label} native region height ${native.region.height} != ${expectedVisibleHeight}`);
}

function validateSettled(name, presentation, logicalHeight) {
  const metadata = readJson(`${name}.json`);
  validateDom(metadata.dom, name, presentation);
  validateNative(metadata.native, name, logicalHeight);
  const size = pngSize(path.join(outputDirectory, `${name}.png`));
  invariant(size.width === 340 && size.height === logicalHeight, `${name}.png must be 340x${logicalHeight}, got ${size.width}x${size.height}`);
}

function validateTransition(name, startPresentation, endPresentation) {
  const directory = path.join(outputDirectory, name);
  const contractPath = path.join(directory, "frames.json");
  invariant(fs.existsSync(contractPath), `${name}/frames.json is missing`);
  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  invariant(Array.isArray(contract.frames) && contract.frames.length >= 10, `${name} has too few captured frames`);
  const observed = contract.frames.map((frame) => frame.dom?.presentation).filter(Boolean);
  invariant(observed.includes(startPresentation), `${name} never captured ${startPresentation}`);
  invariant(contract.settled?.presentation === endPresentation, `${name} did not settle in ${endPresentation}`);
  for (const frame of contract.frames) {
    const size = pngSize(path.join(directory, frame.fileName));
    invariant(size.width === 340 && size.height === 700, `${name}/${frame.fileName} must be 340x700`);
    invariant(frame.dom?.unintendedScrollers?.length === 0, `${name}/${frame.fileName} exposed document/root overflow`);
    invariant(frame.dom?.visibleTextLength > 0, `${name}/${frame.fileName} has no rendered text`);
  }
}

invariant(fs.existsSync(outputDirectory), `output directory is missing: ${outputDirectory}`);
readJson("manifest.json");
validateSettled("focus-panel-runtime", "panel", 700);
validateSettled("floating-timer-runtime", "timerCompact", 110);
validateSettled("floating-timer-expanded-runtime", "timerExpanded", 300);
validateTransition("panel-to-timer-runtime", "panel", "timerCompact");
validateTransition("timer-to-panel-runtime", "timerCompact", "panel");
console.log("Packaged Focus runtime screenshots, DOM overflow contracts, native HWND/DPI regions, and transition frame captures passed.");
