import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
const expectedCapture = { width: 1280, height: 720 };
const geometryByTheme = new Map();

function invariant(condition, message) {
  if (!condition) throw new Error(`Task reorder capture validation failed: ${message}`);
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
  const label = `task-reorder-${theme}`;
  const screenshotPath = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  validatePng(screenshotPath, label);
  invariant(fs.existsSync(domPath), `${label} captured DOM is missing`);

  const dom = fs.readFileSync(domPath, "utf8");
  invariant(dom.includes('data-visual-fixture-ready="true"'), `${label} fixture did not report ready state`);
  invariant(dom.includes('data-task-reorder-fixture="true"'), `${label} reorder fixture identity is missing`);
  invariant(dom.includes('data-task-dragging="true"'), `${label} dragging source state is missing`);
  invariant(dom.includes('data-task-drop-placeholder="true"'), `${label} drop placeholder is missing`);
  invariant(dom.includes('data-task-settling="true"'), `${label} settling state is missing`);
  invariant(dom.includes('data-drop-active="true"'), `${label} target lane feedback is missing`);

  const contractMatch = dom.match(/<script id="task-reorder-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(contractMatch, `${label} geometry contract is missing`);
  const contract = JSON.parse(contractMatch[1]);
  invariant(contract.theme === theme, `${label} theme identity differs`);
  invariant(contract.viewport?.width === 1280 && contract.viewport?.height === 720, `${label} viewport contract differs`);
  invariant(contract.placeholder?.width > 0 && contract.placeholder?.height > 0, `${label} placeholder geometry is invalid`);
  invariant(contract.draggingShell?.width > 0 && contract.draggingShell?.height > 0, `${label} dragging shell geometry is invalid`);
  invariant(contract.settlingShell?.width > 0 && contract.settlingShell?.height > 0, `${label} settling shell geometry is invalid`);
  invariant(contract.scheduledReorderable === "false", `${label} scheduled task became manually reorderable`);
  invariant(contract.dropLaneActive === "true", `${label} drop target lane is not active`);

  geometryByTheme.set(theme, {
    placeholder: contract.placeholder,
    draggingShell: contract.draggingShell,
    settlingShell: contract.settlingShell,
  });
}

invariant(
  stableJson(geometryByTheme.get("light")) === stableJson(geometryByTheme.get("dark")),
  "task reorder geometry differs between light and dark themes",
);

console.log("Task reorder captured visual contracts: PASS");
