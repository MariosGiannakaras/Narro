import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
const expectedCapture = { width: 1280, height: 720 };
const geometryByTheme = new Map();

function invariant(condition, message) {
  if (!condition) throw new Error(`Task subtask capture validation failed: ${message}`);
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
  const label = `task-subtasks-${theme}`;
  const screenshotPath = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  validatePng(screenshotPath, label);
  invariant(fs.existsSync(domPath), `${label} captured DOM is missing`);

  const dom = fs.readFileSync(domPath, "utf8");
  invariant(dom.includes('data-task-subtasks-fixture-ready="true"'), `${label} fixture did not report ready state`);
  invariant(dom.includes('data-task-subtasks-visual-fixture="true"'), `${label} fixture identity is missing`);
  invariant(dom.includes('data-task-subtasks-visual="expanded"'), `${label} expanded state is missing`);
  invariant(dom.includes('data-task-subtasks-visual="editing"'), `${label} editing state is missing`);
  invariant(dom.includes('data-task-subtasks-visual="readonly"'), `${label} read-only state is missing`);
  invariant(dom.includes('data-task-subtask-panel="true"'), `${label} production expanded panel is missing`);
  invariant(dom.includes('data-task-subtask-control="toggle"'), `${label} expand/collapse control is missing`);
  invariant(dom.includes('data-task-subtask-control="complete"'), `${label} completion control is missing`);
  invariant(dom.includes('data-task-subtask-control="edit"'), `${label} title edit control is missing`);
  invariant(dom.includes('data-task-subtask-control="title-input"'), `${label} inline title input is missing`);
  invariant(dom.includes('data-task-subtask-control="move-up"'), `${label} move-up control is missing`);
  invariant(dom.includes('data-task-subtask-control="move-down"'), `${label} move-down control is missing`);
  invariant(dom.includes('data-task-subtask-control="delete"'), `${label} delete control is missing`);
  invariant(dom.includes('data-task-subtask-control="create"'), `${label} create control is missing`);
  invariant(dom.includes("Completed tasks keep subtasks as read-only history."), `${label} read-only history guidance is missing`);
  invariant(dom.includes('data-task-subtasks-expanded="true"'), `${label} production TaskCard expansion marker is missing`);

  const contractMatch = dom.match(/<script id="task-subtasks-visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(contractMatch, `${label} geometry contract is missing`);
  const contract = JSON.parse(contractMatch[1]);
  invariant(contract.fixture === "task-subtasks", `${label} fixture contract identity differs`);
  invariant(contract.theme === theme, `${label} theme identity differs`);
  invariant(contract.viewport?.width === 1280 && contract.viewport?.height === 720, `${label} viewport contract differs`);

  for (const key of [
    "expandedCard",
    "editingCard",
    "readonlyCard",
    "expandedTitleRow",
    "editingTitleRow",
    "readonlyTitleRow",
    "expandedActionSlot",
    "editingActionSlot",
    "readonlyActionSlot",
    "expandedPanel",
    "editingInput",
  ]) {
    invariant(contract[key]?.width > 0 && contract[key]?.height > 0, `${label} ${key} geometry is invalid`);
  }

  invariant(contract.expandedCard.width === contract.editingCard.width, `${label} inline subtask edit changed card width`);
  invariant(contract.expandedCard.width === contract.readonlyCard.width, `${label} read-only subtask state changed card width`);
  invariant(contract.expandedTitleRow.width === contract.editingTitleRow.width, `${label} inline subtask edit changed title-row width`);
  invariant(contract.expandedTitleRow.width === contract.readonlyTitleRow.width, `${label} read-only subtask state changed title-row width`);
  invariant(contract.expandedTitleRow.height === contract.editingTitleRow.height, `${label} inline subtask edit changed title-row height`);
  invariant(contract.expandedTitleRow.height === contract.readonlyTitleRow.height, `${label} read-only subtask state changed title-row height`);
  invariant(contract.expandedActionSlot.width === 68, `${label} expanded state lost the reserved 4.25rem action slot`);
  invariant(contract.editingActionSlot.width === 68, `${label} editing state lost the reserved 4.25rem action slot`);
  invariant(contract.readonlyActionSlot.width === 68, `${label} read-only state lost the reserved 4.25rem action slot`);
  invariant(contract.expandedActionSlot.height === contract.editingActionSlot.height, `${label} action-slot height changed during subtask edit`);
  invariant(contract.expandedActionSlot.height === contract.readonlyActionSlot.height, `${label} action-slot height changed in read-only state`);

  geometryByTheme.set(theme, {
    expandedCard: contract.expandedCard,
    editingCard: contract.editingCard,
    readonlyCard: contract.readonlyCard,
    expandedTitleRow: contract.expandedTitleRow,
    editingTitleRow: contract.editingTitleRow,
    readonlyTitleRow: contract.readonlyTitleRow,
    expandedActionSlot: contract.expandedActionSlot,
    editingActionSlot: contract.editingActionSlot,
    readonlyActionSlot: contract.readonlyActionSlot,
    expandedPanel: contract.expandedPanel,
    editingInput: contract.editingInput,
  });
}

invariant(
  stableJson(geometryByTheme.get("light")) === stableJson(geometryByTheme.get("dark")),
  "task subtask title/action geometry differs between light and dark themes",
);

console.log("Task subtask captured visual contracts: PASS");
