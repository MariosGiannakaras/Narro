import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus Panel visual validation failed: ${message}`);
}

function validatePng(filePath, label) {
  invariant(fs.existsSync(filePath), `${label} screenshot is missing`);
  const png = fs.readFileSync(filePath);
  invariant(png.length > 10_000, `${label} screenshot is unexpectedly small`);
  invariant(png.length >= 24, `${label} PNG is incomplete`);
  invariant(png.readUInt32BE(16) === 420 && png.readUInt32BE(20) === 720, `${label} screenshot must be 420x720`);
}

for (const theme of ["light", "dark"]) {
  const label = `focus-panel-${theme}`;
  const screenshot = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  validatePng(screenshot, label);
  invariant(fs.existsSync(domPath), `${label} DOM capture is missing`);
  const dom = fs.readFileSync(domPath, "utf8");
  invariant(dom.includes('data-focus-panel-fixture-ready="true"'), `${label} ready marker is missing`);
  invariant(dom.includes('data-focus-panel="main"'), `${label} production Focus Panel marker is missing`);
  invariant(dom.includes('data-focus-target="all_lists"'), `${label} All Lists target is missing`);
  invariant(dom.includes('data-focus-list-selector="true"'), `${label} list selector is missing`);
  invariant(dom.includes('aria-label="Focus list"'), `${label} list selector accessible name is missing`);
  invariant(dom.includes(">Today<"), `${label} Today title is missing`);
  invariant(dom.includes('aria-label="Preferences"'), `${label} Preferences quick control is missing`);
  invariant(dom.includes('aria-label="Home"'), `${label} Home quick control is missing`);
  invariant(dom.includes('aria-label="Compact view"'), `${label} compact quick control is missing`);
  invariant(dom.includes("Est: 2hr 10min"), `${label} aggregate EST is missing`);
  invariant(dom.includes("1/5 Done"), `${label} completion count is missing`);
  invariant(dom.includes('data-focus-live-card="true"'), `${label} active live card is missing`);
  invariant(dom.includes("Prepare BFCM strategy"), `${label} active task title is missing`);
  invariant(dom.includes('data-focus-task-row="remaining"'), `${label} remaining queue is missing`);
  invariant(dom.includes("Review campaign notes"), `${label} overdue remaining task is missing`);
  invariant(dom.includes("Plan weekend errands"), `${label} second remaining task is missing`);
  invariant(dom.includes("Personal"), `${label} All Lists origin chip is missing`);
  invariant(dom.includes("+ ADD TASK"), `${label} Add Task hierarchy row is missing`);
  invariant(dom.includes('data-focus-group="scheduled"'), `${label} scheduled group is missing`);
  invariant(dom.includes("1 Scheduled task"), `${label} scheduled count is missing`);
  invariant(dom.includes("Client follow-up call"), `${label} scheduled task is missing`);
  invariant(dom.includes('data-focus-group="done"'), `${label} Done group is missing`);
  invariant(dom.includes("Confirm morning agenda"), `${label} Done row is missing`);
  invariant(dom.includes("21min"), `${label} Done Time Taken is missing`);

  const order = [
    'class="focus-panel__topbar"',
    'class="focus-panel__summary"',
    'data-focus-live-card="true"',
    'data-focus-group="remaining"',
    'class="focus-panel__add-task"',
    'data-focus-group="scheduled"',
    'data-focus-group="done"',
  ].map((needle) => dom.indexOf(needle));
  invariant(order.every((index) => index >= 0), `${label} one or more hierarchy markers are missing`);
  invariant(order.every((index, position) => position === 0 || index > order[position - 1]), `${label} hierarchy order differs from source evidence`);

  const match = dom.match(/<script id="focus-panel-visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(match, `${label} geometry contract is missing`);
  const contract = JSON.parse(match[1]);
  invariant(contract.theme === theme, `${label} contract theme differs`);
  invariant(contract.panel?.width === 340, `${label} panel width is ${contract.panel?.width}; expected 340px`);
  invariant(contract.panel?.height >= 700, `${label} panel height is unexpectedly short`);
  invariant(contract.topbar?.height > 0, `${label} top bar geometry is invalid`);
  invariant(contract.summary?.height > 0, `${label} summary geometry is invalid`);
  invariant(contract.liveCard?.height >= 80, `${label} live card emphasis geometry is too small`);
  invariant(contract.firstRow?.height >= 50, `${label} remaining row geometry is too small`);
  invariant(contract.addTask?.height >= 34, `${label} Add Task geometry is too small`);
}

console.log("Focus Panel visual captures validated.");
