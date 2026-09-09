import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
const expectedCapture = { width: 1280, height: 720 };
const geometryByTheme = new Map();

function invariant(condition, message) {
  if (!condition) throw new Error(`Task scheduling capture validation failed: ${message}`);
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
  invariant(
    png.readUInt32BE(16) === expectedCapture.width && png.readUInt32BE(20) === expectedCapture.height,
    `${label} screenshot dimensions differ from 1280x720`,
  );
}

for (const theme of ["light", "dark"]) {
  const label = `task-scheduling-${theme}`;
  const screenshotPath = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  validatePng(screenshotPath, label);
  invariant(fs.existsSync(domPath), `${label} captured DOM is missing`);

  const dom = fs.readFileSync(domPath, "utf8");
  invariant(dom.includes('data-task-schedule-fixture-ready="true"'), `${label} fixture did not report ready state`);
  invariant(dom.includes('data-task-schedule-visual-fixture="true"'), `${label} fixture identity is missing`);
  invariant(dom.includes('data-task-schedule-state="ready"'), `${label} production scheduling dialog did not load`);
  invariant(dom.includes('data-task-schedule-shortcut="today"'), `${label} Today shortcut is missing`);
  invariant(dom.includes('data-task-schedule-shortcut="later_today"'), `${label} Later today shortcut is missing`);
  invariant(dom.includes('data-task-schedule-shortcut="tomorrow"'), `${label} Tomorrow shortcut is missing`);
  invariant(dom.includes('data-task-schedule-shortcut="next_week"'), `${label} Next week shortcut is missing`);
  invariant(dom.includes('data-task-schedule-control="time-toggle"'), `${label} optional schedule-time control is missing`);
  invariant(dom.includes('data-task-recurrence-control="preset"'), `${label} recurrence preset selector is missing`);
  invariant(dom.includes('data-task-recurrence-control="replace-existing"'), `${label} Replace Existing Tasks control is missing`);
  invariant(dom.includes('data-task-recurrence-weekday="monday"'), `${label} custom recurrence weekday controls are missing`);
  invariant(dom.includes('Date-only schedules never round-trip through UTC.'), `${label} date-only semantic explanation is missing`);
  invariant(dom.includes('modified/history-bearing children remain independent'), `${label} replace-existing preservation warning is missing`);

  const contractMatch = dom.match(/<script id="task-schedule-visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(contractMatch, `${label} geometry contract is missing`);
  const contract = JSON.parse(contractMatch[1]);
  invariant(contract.fixture === "task-scheduling", `${label} fixture contract identity differs`);
  invariant(contract.theme === theme, `${label} theme identity differs`);
  invariant(contract.viewport?.width === 1280 && contract.viewport?.height === 720, `${label} viewport contract differs`);

  for (const key of [
    "dialog",
    "header",
    "scheduleSection",
    "recurrenceSection",
    "shortcuts",
    "replaceExisting",
    "footer",
  ]) {
    invariant(contract[key]?.width > 0 && contract[key]?.height > 0, `${label} ${key} geometry is invalid`);
  }

  invariant(contract.dialog.width >= 560 && contract.dialog.width <= 760, `${label} dialog width left the compact desktop range`);
  invariant(contract.dialog.height <= 680, `${label} dialog no longer fits the 720px capture viewport`);
  invariant(contract.dialog.x >= 0 && contract.dialog.y >= 0, `${label} dialog begins outside the viewport`);
  invariant(
    contract.dialog.x + contract.dialog.width <= 1280 && contract.dialog.y + contract.dialog.height <= 720,
    `${label} dialog extends outside the viewport`,
  );
  invariant(contract.header.width === contract.dialog.width, `${label} sticky header width differs from dialog width`);
  invariant(contract.footer.width === contract.dialog.width, `${label} sticky footer width differs from dialog width`);

  geometryByTheme.set(theme, contract);
}

const light = geometryByTheme.get("light");
const dark = geometryByTheme.get("dark");
invariant(
  stableJson({ ...light, theme: undefined }) === stableJson({ ...dark, theme: undefined }),
  "scheduling editor geometry differs between light and dark themes",
);

console.log("Task scheduling captured visual contracts: PASS");
