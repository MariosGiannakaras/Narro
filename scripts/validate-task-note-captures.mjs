import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
const expectedCapture = { width: 1280, height: 720 };
const geometryByTheme = new Map();

function invariant(condition, message) {
  if (!condition) throw new Error(`Task note capture validation failed: ${message}`);
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
  const label = `task-notes-${theme}`;
  const screenshotPath = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  validatePng(screenshotPath, label);
  invariant(fs.existsSync(domPath), `${label} captured DOM is missing`);

  const dom = fs.readFileSync(domPath, "utf8");
  invariant(dom.includes('data-task-notes-fixture-ready="true"'), `${label} fixture did not report ready state`);
  invariant(dom.includes('data-task-notes-visual-fixture="true"'), `${label} fixture identity is missing`);
  invariant(dom.includes('data-task-notes-visual="editable"'), `${label} editable state is missing`);
  invariant(dom.includes('data-task-notes-visual="readonly"'), `${label} read-only state is missing`);
  invariant(dom.includes('data-task-note-editor="true"'), `${label} production rich editor is missing`);
  invariant(dom.includes('data-task-note-viewer="true"'), `${label} production saved-note viewer is missing`);
  invariant(dom.includes('data-task-note-control="format"'), `${label} rich formatting controls are missing`);
  invariant(dom.includes('data-task-note-control="save"'), `${label} explicit save control is missing`);
  invariant(dom.includes('data-task-note-control="delete"'), `${label} explicit delete control is missing`);
  invariant(dom.includes('data-task-note-control="open-link"'), `${label} explicit saved-link control is missing`);
  invariant(dom.includes('data-task-notes-expanded="true"'), `${label} production TaskCard Notes expansion marker is missing`);
  invariant(dom.includes("All Lists shows Notes as read-only."), `${label} aggregate read-only guidance is missing`);
  invariant(dom.includes("launch notes"), `${label} rich linked text is missing`);
  invariant(!dom.includes("dangerouslySetInnerHTML"), `${label} captured Notes surface contains unsafe HTML marker`);

  const contractMatch = dom.match(/<script id="task-notes-visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(contractMatch, `${label} geometry contract is missing`);
  const contract = JSON.parse(contractMatch[1]);
  invariant(contract.fixture === "task-notes", `${label} fixture contract identity differs`);
  invariant(contract.theme === theme, `${label} theme identity differs`);
  invariant(contract.viewport?.width === 1280 && contract.viewport?.height === 720, `${label} viewport contract differs`);

  for (const key of [
    "editableCard",
    "readonlyCard",
    "editableTitleRow",
    "readonlyTitleRow",
    "editableActionSlot",
    "readonlyActionSlot",
    "editor",
    "readonlyViewer",
  ]) {
    invariant(contract[key]?.width > 0 && contract[key]?.height > 0, `${label} ${key} geometry is invalid`);
  }

  invariant(contract.editableCard.width === contract.readonlyCard.width, `${label} Notes state changed task-card width`);
  invariant(contract.editableTitleRow.width === contract.readonlyTitleRow.width, `${label} Notes state changed title-row width`);
  invariant(contract.editableTitleRow.height === contract.readonlyTitleRow.height, `${label} Notes state changed title-row height`);
  invariant(contract.editableActionSlot.width === 68, `${label} editable Notes lost the reserved 4.25rem action slot`);
  invariant(contract.readonlyActionSlot.width === 68, `${label} read-only Notes lost the reserved 4.25rem action slot`);
  invariant(contract.editableActionSlot.height === contract.readonlyActionSlot.height, `${label} Notes state changed action-slot height`);
  invariant(contract.formattingControls >= 8, `${label} expected rich formatting controls are incomplete`);
  invariant(contract.explicitLinkControls >= 2, `${label} saved links are not exposed through explicit controls in both states`);

  geometryByTheme.set(theme, {
    editableCard: contract.editableCard,
    readonlyCard: contract.readonlyCard,
    editableTitleRow: contract.editableTitleRow,
    readonlyTitleRow: contract.readonlyTitleRow,
    editableActionSlot: contract.editableActionSlot,
    readonlyActionSlot: contract.readonlyActionSlot,
    editor: contract.editor,
    readonlyViewer: contract.readonlyViewer,
  });
}

invariant(
  stableJson(geometryByTheme.get("light")) === stableJson(geometryByTheme.get("dark")),
  "task-note geometry differs between light and dark themes",
);

console.log("Task note captured visual contracts: PASS");
