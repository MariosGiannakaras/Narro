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
  for (const [surface, metrics] of [["documentElement", dom.documentElement], ["body", dom.body], ["root", dom.root]]) {
    invariant(metrics, `${label} is missing ${surface} metrics`);
    invariant(metrics.scrollWidth <= metrics.clientWidth, `${label} ${surface} horizontally scrolls (${metrics.scrollWidth} > ${metrics.clientWidth})`);
    invariant(metrics.scrollHeight <= metrics.clientHeight, `${label} ${surface} vertically scrolls (${metrics.scrollHeight} > ${metrics.clientHeight})`);
  }
  for (const [surface, metrics] of [["documentElement", dom.documentElement], ["body", dom.body], ["root", dom.root]]) {
    invariant(metrics.overflowX === "hidden" && metrics.overflowY === "hidden", `${label} ${surface} must own no document scrolling`);
  }
  invariant(dom.coordinator?.overflowX === "hidden" && dom.coordinator?.overflowY === "hidden", `${label} coordinator must clip presentation overflow`);
  invariant(dom.visibleTextLength > 0, `${label} rendered no visible text`);
}

function validateNative(native, label, presentation, visibleLogicalHeight) {
  invariant(native?.visible === true, `${label} Focus HWND is not visible`);
  invariant(Number.isFinite(native.dpi) && native.dpi >= 96, `${label} reported invalid DPI ${native?.dpi}`);
  const scale = native.dpi / 96;
  const expectedClientWidth = Math.round(340 * scale);
  const expectedClientHeight = Math.round(700 * scale);
  const expectedVisibleHeight = Math.round(visibleLogicalHeight * scale);
  invariant(near(native.client.width, expectedClientWidth), `${label} client width ${native.client.width} != ${expectedClientWidth} at ${native.dpi} DPI`);
  invariant(near(native.client.height, expectedClientHeight), `${label} client host height ${native.client.height} != ${expectedClientHeight} at ${native.dpi} DPI`);
  invariant(native.window.width >= native.client.width && native.window.height >= native.client.height, `${label} outer HWND is smaller than its client area`);
  invariant(native.window.width - native.client.width <= Math.ceil(32 * scale), `${label} outer/client width delta is unexpectedly large`);
  invariant(native.window.height - native.client.height <= Math.ceil(32 * scale), `${label} outer/client height delta is unexpectedly large`);
  invariant(native.regionKind > 0 && native.region, `${label} has no native visible region`);
  if (presentation === "panel") {
    invariant(near(native.region.width, native.window.width), `${label} Panel region width ${native.region.width} != outer width ${native.window.width}`);
    invariant(near(native.region.height, native.window.height), `${label} Panel region height ${native.region.height} != outer height ${native.window.height}`);
  } else {
    invariant(near(native.region.width, expectedClientWidth), `${label} Timer region width ${native.region.width} != ${expectedClientWidth}`);
    invariant(near(native.region.height, expectedVisibleHeight), `${label} Timer region height ${native.region.height} != ${expectedVisibleHeight}`);
  }
}
function validateSettled(name, presentation, logicalHeight) {
  const metadata = readJson(`${name}.json`);
  validateDom(metadata.dom, name, presentation);
  validateNative(metadata.native, name, presentation, logicalHeight);
  const size = pngSize(path.join(outputDirectory, `${name}.png`));
  invariant(size.width === 340 && size.height === logicalHeight, `${name}.png must be 340x${logicalHeight}, got ${size.width}x${size.height}`);
}

function validateTransition(name, startPresentation, endPresentation) {
  const directory = path.join(outputDirectory, name);
  const contractPath = path.join(directory, "frames.json");
  invariant(fs.existsSync(contractPath), `${name}/frames.json is missing`);
  const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  invariant(Array.isArray(contract.frames) && contract.frames.length >= 10, `${name} has too few captured frames`);
  invariant(contract.start?.presentation === startPresentation, `${name} did not start in ${startPresentation}`);
  invariant(contract.settled?.presentation === endPresentation, `${name} did not settle in ${endPresentation}`);
  invariant(contract.start?.unintendedScrollers?.length === 0, `${name} start exposed document/root overflow`);
  invariant(contract.settled?.unintendedScrollers?.length === 0, `${name} settled state exposed document/root overflow`);
  invariant(contract.start?.visibleTextLength > 0 && contract.settled?.visibleTextLength > 0, `${name} rendered no visible text`);
  const positions = [];
  for (const frame of contract.frames) {
    const size = pngSize(path.join(directory, frame.fileName));
    invariant(size.width === 340 && size.height === 700, `${name}/${frame.fileName} must be 340x700`);
    invariant(frame.native?.visible === true, `${name}/${frame.fileName} Focus HWND is not visible`);
    invariant(Number.isFinite(frame.native?.window?.x) && Number.isFinite(frame.native?.window?.y), `${name}/${frame.fileName} is missing HWND position`);
    positions.push(`${frame.native.window.x},${frame.native.window.y}`);
  }
  invariant(new Set(positions).size >= 2, `${name} captured no native HWND movement`);

  invariant(Array.isArray(contract.motionSamples) && contract.motionSamples.length >= 40, `${name} has too few high-frequency native motion samples`);
  const samples = contract.motionSamples.filter((sample) =>
    sample?.visible === true
      && Number.isFinite(sample?.elapsedMs)
      && Number.isFinite(sample?.window?.x)
      && Number.isFinite(sample?.window?.y));
  invariant(samples.length >= 40, `${name} high-frequency sampler returned invalid HWND samples`);

  const source = samples[0].window;
  const target = samples.at(-1).window;
  const pointKey = (sample) => `${sample.window.x},${sample.window.y}`;
  const uniquePoints = [];
  for (const sample of samples) {
    if (uniquePoints.length === 0 || pointKey(sample) !== pointKey(uniquePoints.at(-1))) {
      uniquePoints.push(sample);
    }
  }
  const reducedMotion = contract.start?.prefersReducedMotion === true;
  invariant(
    contract.settled?.prefersReducedMotion === reducedMotion,
    `${name} motion preference changed during the transition`,
  );

  const sourceKey = `${source.x},${source.y}`;
  const targetKey = `${target.x},${target.y}`;
  invariant(sourceKey !== targetKey, `${name} high-frequency sampler saw no net HWND movement`);

  const movedAt = samples.findIndex((sample) => pointKey(sample) !== sourceKey);
  const reachedAt = samples.findIndex((sample, index) => index >= movedAt && pointKey(sample) === targetKey);
  invariant(movedAt > 0 && reachedAt >= movedAt, `${name} could not bracket native HWND motion`);
  const motionStartMs = samples[movedAt - 1].elapsedMs;
  const motionEndMs = samples[reachedAt].elapsedMs;
  const observedDurationMs = motionEndMs - motionStartMs;

  if (reducedMotion) {
    invariant(uniquePoints.length >= 2, `${name} reduced-motion path captured no native HWND movement`);
    invariant(observedDurationMs <= 120, `${name} reduced-motion HWND transition took ${observedDurationMs}ms`);
  } else {
    invariant(uniquePoints.length >= 4, `${name} standard-motion path captured fewer than four distinct native HWND positions`);
    const intermediates = uniquePoints.filter((sample) => {
      const key = pointKey(sample);
      return key !== sourceKey && key !== targetKey;
    });
    invariant(intermediates.length >= 2, `${name} standard-motion path captured fewer than two intermediate native HWND positions`);
    invariant(observedDurationMs >= 120 && observedDurationMs <= 500, `${name} native HWND motion duration ${observedDurationMs}ms is outside the expected finite range`);
  }

  const xDirection = Math.sign(target.x - source.x);
  const yDirection = Math.sign(target.y - source.y);
  for (let index = 1; index < uniquePoints.length; index += 1) {
    const previous = uniquePoints[index - 1].window;
    const current = uniquePoints[index].window;
    if (xDirection !== 0) invariant((current.x - previous.x) * xDirection >= 0, `${name} native HWND x-axis motion reversed`);
    if (yDirection !== 0) invariant((current.y - previous.y) * yDirection >= 0, `${name} native HWND y-axis motion reversed`);
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
