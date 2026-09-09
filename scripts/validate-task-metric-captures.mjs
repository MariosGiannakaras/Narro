import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
const expectedCapture = { width: 1280, height: 720 };
const geometryByTheme = new Map();

function invariant(condition, message) {
  if (!condition) throw new Error(`Task metric capture validation failed: ${message}`);
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function validatePng(filePath, label) {
  invariant(fs.existsSync(filePath), `${label} screenshot is missing`);
  invariant(fs.statSync(filePath).size > 10_000, `${label} screenshot is unexpectedly small`);
  const png = fs.readFileSync(filePath);
  invariant(
    png.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    `${label} capture is not a PNG`,
  );
  invariant(png.length >= 24, `${label} PNG is missing IHDR dimensions`);
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  invariant(
    width === expectedCapture.width && height === expectedCapture.height,
    `${label} screenshot dimensions are ${width}x${height}, expected 1280x720`,
  );
}

for (const theme of ["light", "dark"]) {
  const label = `task-metrics-${theme}`;
  const screenshotPath = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  validatePng(screenshotPath, label);
  invariant(fs.existsSync(domPath), `${label} captured DOM is missing`);

  const dom = fs.readFileSync(domPath, "utf8");
  invariant(dom.includes('data-task-metric-fixture-ready="true"'), `${label} fixture did not report ready state`);
  invariant(dom.includes('data-task-metric-visual-fixture="true"'), `${label} fixture identity is missing`);
  invariant(dom.includes('data-task-metric-visual="display"'), `${label} normal metric display state is missing`);
  invariant(dom.includes('data-task-metric-visual="estimate-edit"'), `${label} EST edit state is missing`);
  invariant(dom.includes('data-task-metric-visual="time-taken-edit"'), `${label} Time Taken edit state is missing`);
  invariant(dom.includes('data-task-metric-input="estimate"'), `${label} production EST input is missing`);
  invariant(dom.includes('data-task-metric-input="time_taken"'), `${label} production Time Taken input is missing`);
  invariant(dom.includes('data-task-live-state="paused"'), `${label} paused live EST state is missing`);
  invariant(dom.includes('data-task-live-state="overtime_paused"'), `${label} overtime-paused Time Taken state is missing`);
  invariant(!dom.includes('data-fixture-only-body="paused-editable"'), `${label} must not rely on the fixture-only paused card body`);

  const contractMatch = dom.match(/<script id="task-metric-visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(contractMatch, `${label} geometry contract is missing`);
  const contract = JSON.parse(contractMatch[1]);
  invariant(contract.fixture === "task-metrics", `${label} fixture contract identity differs`);
  invariant(contract.theme === theme, `${label} theme identity differs`);
  invariant(contract.viewport?.width === 1280 && contract.viewport?.height === 720, `${label} viewport contract differs`);

  for (const key of [
    "displayCard",
    "estimateCard",
    "timeTakenCard",
    "displayTitleRow",
    "estimateTitleRow",
    "timeTakenTitleRow",
    "estimateActionSlot",
    "timeTakenActionSlot",
    "estimateMeta",
    "timeTakenMeta",
    "estimateInput",
    "timeTakenInput",
  ]) {
    invariant(contract[key]?.width > 0 && contract[key]?.height > 0, `${label} ${key} geometry is invalid`);
  }

  invariant(contract.displayCard.width === contract.estimateCard.width, `${label} opening EST edit changed card width`);
  invariant(contract.displayCard.width === contract.timeTakenCard.width, `${label} opening Time Taken edit changed card width`);
  invariant(contract.displayCard.height === contract.estimateCard.height, `${label} opening EST edit changed card height`);
  invariant(contract.displayCard.height === contract.timeTakenCard.height, `${label} opening Time Taken edit changed card height`);
  invariant(contract.displayTitleRow.width === contract.estimateTitleRow.width, `${label} EST edit changed title-row width`);
  invariant(contract.displayTitleRow.width === contract.timeTakenTitleRow.width, `${label} Time Taken edit changed title-row width`);
  invariant(contract.displayTitleRow.height === contract.estimateTitleRow.height, `${label} EST edit changed title-row height`);
  invariant(contract.displayTitleRow.height === contract.timeTakenTitleRow.height, `${label} Time Taken edit changed title-row height`);
  invariant(contract.estimateActionSlot.width === 68, `${label} EST edit lost the reserved 4.25rem action slot`);
  invariant(contract.timeTakenActionSlot.width === 68, `${label} Time Taken edit lost the reserved 4.25rem action slot`);
  invariant(contract.estimateActionSlot.height === contract.timeTakenActionSlot.height, `${label} metric action-slot heights differ`);
  invariant(contract.estimateMeta.height === contract.timeTakenMeta.height, `${label} EST and Time Taken editor rows have different heights`);
  invariant(contract.estimateInput.height === contract.timeTakenInput.height, `${label} metric input heights differ`);

  geometryByTheme.set(theme, {
    displayCard: contract.displayCard,
    estimateCard: contract.estimateCard,
    timeTakenCard: contract.timeTakenCard,
    displayTitleRow: contract.displayTitleRow,
    estimateTitleRow: contract.estimateTitleRow,
    timeTakenTitleRow: contract.timeTakenTitleRow,
    estimateActionSlot: contract.estimateActionSlot,
    timeTakenActionSlot: contract.timeTakenActionSlot,
    estimateMeta: contract.estimateMeta,
    timeTakenMeta: contract.timeTakenMeta,
    estimateInput: contract.estimateInput,
    timeTakenInput: contract.timeTakenInput,
  });
}

invariant(
  stableJson(geometryByTheme.get("light")) === stableJson(geometryByTheme.get("dark")),
  "task metric display/edit geometry differs between light and dark themes",
);

console.log("Task metric captured visual contracts: PASS");
