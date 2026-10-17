import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
const themes = ["light", "dark"];
const expectedCapture = { width: 1280, height: 720 };
const geometry = new Map();
const states = [
  "normal",
  "action_revealed",
  "scheduled",
  "overdue",
  "done",
  "inline_create",
  "notes_expanded",
  "subtasks_expanded",
  "paused_editable",
  "destructive_confirm",
];

function invariant(condition, message) {
  if (!condition) throw new Error(`Task-card state capture validation failed: ${message}`);
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

for (const theme of themes) {
  const label = `task-card-states-${theme}`;
  const screenshotPath = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  validatePng(screenshotPath, label);
  invariant(fs.existsSync(domPath), `${label} captured DOM is missing`);

  const dom = fs.readFileSync(domPath, "utf8");
  invariant(dom.includes('data-visual-fixture-ready="true"'), `${label} fixture did not report ready state`);
  invariant(dom.includes('data-task-card-state-fixture="true"'), `${label} task-card fixture root is missing`);

  for (const state of states) {
    invariant(
      dom.includes(`data-task-card-fixture="${state}"`),
      `${label} wrapper for ${state} is missing`,
    );
    invariant(
      dom.includes(`data-task-card-state="${state}"`),
      `${label} rendered ${state} state is missing`,
    );
  }

  const productionRails = dom.match(/data-task-actions="source-hover-rail"/g) ?? [];
  const actionReadyCards = dom.match(/data-task-actions-available="true"/g) ?? [];
  invariant(productionRails.length >= 2, `${label} normal/revealed production action rails are missing`);
  invariant(actionReadyCards.length >= 2, `${label} normal/revealed action-ready card markers are missing`);
  invariant(dom.includes('aria-label="Subtasks"'), `${label} Subtasks action is missing`);
  invariant(dom.includes('aria-label="Notes"'), `${label} Notes action is missing`);
  invariant(dom.includes('aria-label="Move task one lane left"'), `${label} lane-left action is missing`);
  invariant(dom.includes('aria-label="Move task one lane right"'), `${label} lane-right action is missing`);
  invariant(dom.includes('data-task-action-slot="reserved"'), `${label} reserved action slot marker is missing`);

  for (const body of ["inline-create", "notes-expanded", "subtasks-expanded", "paused-editable", "destructive-confirm"]) {
    invariant(
      dom.includes(`data-fixture-only-body="${body}"`),
      `${label} fixture-only ${body} body is missing`,
    );
  }
  invariant(dom.includes("Links open only after explicit activation."), `${label} explicit-only notes URL policy is missing`);
  invariant(dom.includes("Paused · editable"), `${label} paused/editable state is missing`);
  invariant(dom.includes("This presentation does not perform a deletion."), `${label} non-mutating destructive-confirm copy is missing`);

  const match = dom.match(/<script id="visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(match, `${label} visual contract is missing`);
  const contract = JSON.parse(match[1]);
  invariant(contract.fixture === "task-card-states", `${label} fixture identity differs`);
  invariant(contract.theme === theme, `${label} theme identity differs`);
  invariant(contract.viewport?.width === 1280 && contract.viewport?.height === 720, `${label} viewport contract differs`);
  invariant(contract.shell?.width === 960 && contract.shell?.height === 560, `${label} shell geometry differs`);
  invariant(contract.gallery?.width > 0 && contract.gallery?.height > 0, `${label} gallery geometry is invalid`);

  for (const [name, node] of [
    ["normal card", contract.normalCard],
    ["action card", contract.actionCard],
    ["normal title row", contract.normalTitleRow],
    ["action title row", contract.actionTitleRow],
    ["action slot", contract.actionSlot],
    ["notes card", contract.notesCard],
    ["subtasks card", contract.subtasksCard],
    ["destructive card", contract.destructiveCard],
  ]) {
    invariant(node?.width > 0 && node?.height > 0, `${label} ${name} geometry is invalid`);
  }

  invariant(contract.normalCard.width === contract.actionCard.width, `${label} action reveal changed card width`);
  invariant(contract.normalCard.height === contract.actionCard.height, `${label} action reveal changed card height`);
  invariant(contract.normalTitleRow.width === contract.actionTitleRow.width, `${label} action reveal changed title-row width`);
  invariant(contract.normalTitleRow.height === contract.actionTitleRow.height, `${label} action reveal changed title-row height`);
  invariant(contract.actionSlot.width === 56, `${label} reserved action slot width changed`);
  invariant(contract.actionSlot.height === 20, `${label} reserved action slot height changed`);
  invariant(contract.normalCard.borderRadius === "10px", `${label} normal card radius differs from task-card contract`);
  invariant(contract.actionCard.borderRadius === contract.normalCard.borderRadius, `${label} action state changed card radius`);
  invariant(contract.notesCard.height > contract.normalCard.height, `${label} notes expansion does not expand card`);
  invariant(contract.subtasksCard.height > contract.normalCard.height, `${label} subtasks expansion does not expand card`);
  invariant(contract.destructiveCard.height > contract.normalCard.height, `${label} destructive confirmation does not expand card`);

  geometry.set(theme, {
    gallery: contract.gallery,
    normalCard: contract.normalCard,
    actionCard: contract.actionCard,
    normalTitleRow: contract.normalTitleRow,
    actionTitleRow: contract.actionTitleRow,
    actionSlot: contract.actionSlot,
    notesCard: contract.notesCard,
    subtasksCard: contract.subtasksCard,
    destructiveCard: contract.destructiveCard,
  });
}

invariant(
  stableJson(geometry.get("light")) === stableJson(geometry.get("dark")),
  "task-card state geometry differs between light and dark themes",
);

// B45: inspect the real, opened production TaskCard overflow menu on a
// fixture-only recurring parent. This is visible-control evidence, not a
// completed persistence lifecycle or an authorization for physical Windows PA.
const recurringMenus = new Map();
for (const theme of themes) {
  const label = `task-recurring-menu-${theme}`;
  validatePng(path.join(outputDirectory, `${label}.png`), label);
  const domPath = path.join(outputDirectory, `${label}.html`);
  invariant(fs.existsSync(domPath), `${label} captured DOM is missing`);
  const dom = fs.readFileSync(domPath, "utf8");
  invariant(dom.includes('data-visual-fixture-ready="true"'), `${label} did not report ready`);
  invariant(dom.includes('data-task-recurring-menu-fixture="true"'), `${label} recurring fixture not mounted`);
  invariant(dom.includes('data-task-recurrence="parent"'), `${label} card is not a recurring parent`);
  invariant(dom.includes('aria-label="Task actions"'), `${label} overflow trigger not accessible`);
  invariant(dom.includes('aria-expanded="true"'), `${label} overflow trigger not expanded`);
  invariant(dom.includes('class="overlay-menu motion-overlay" data-align="end" data-open="true"'), `${label} actual menu is not open`);
  for (const labelText of ["Update Recurring", "Remove Recurring", "Change List", "Duplicate", "Delete"]) {
    invariant(dom.includes(`>${labelText}</button>`), `${label} missing real enabled menu choice: ${labelText}`);
  }
  invariant(!dom.includes(">Update Schedule</button>"), `${label} showed occurrence schedule instead of parent recurring edit`);
  invariant(!dom.includes(">Remove schedule</button>"), `${label} parent exposes wrong occurrence quick-remove`);
  const match = dom.match(/<script id="visual-contract" type="application\\/json">([\\s\\S]*?)<\\/script>/);
  invariant(match, `${label} visual geometry contract missing`);
  const contract = JSON.parse(match[1]);
  invariant(contract.fixture === "task-recurring-menu", `${label} incorrect fixture identity`);
  invariant(contract.theme === theme, `${label} wrong theme`);
  invariant(contract.parentCard?.width > 0 && contract.parentCard?.height > 0, `${label} recurring card not rendered`);
  invariant(contract.menu?.width > 0 && contract.menu?.height > 0, `${label} open menu has no visible geometry`);
  recurringMenus.set(theme, {parentCard: contract.parentCard, menu: contract.menu});
}
invariant(stableJson(recurringMenus.get("light")) === stableJson(recurringMenus.get("dark")),
  "Recurring overflow menu/card geometry differs across light and dark themes");

console.log("Task-card state captured visual contracts: PASS");
