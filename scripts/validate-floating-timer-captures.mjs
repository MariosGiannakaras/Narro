import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
const baselines = new Map();

function invariant(condition, message) {
  if (!condition) throw new Error(`Floating Timer visual validation failed: ${message}`);
}

function readCapture(theme, state) {
  const label = state === "collapsed" ? `floating-timer-${theme}` : `floating-timer-expanded-${theme}`;
  const screenshot = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  const expectedHeight = state === "collapsed" ? 240 : 380;

  invariant(fs.existsSync(screenshot), `${label} screenshot is missing`);
  const png = fs.readFileSync(screenshot);
  invariant(png.length >= 24, `${label} PNG is incomplete`);
  invariant(png.subarray(0, 8).toString("hex") === "89504e470d0a1a0a", `${label} screenshot is not a PNG`);
  invariant(
    png.readUInt32BE(16) === 420 && png.readUInt32BE(20) === expectedHeight,
    `${label} screenshot must be 420x${expectedHeight}`,
  );
  invariant(fs.existsSync(domPath), `${label} DOM capture is missing`);
  return { label, dom: fs.readFileSync(domPath, "utf8") };
}

function readContract(dom, label) {
  const match = dom.match(/<script id="floating-timer-visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(match, `${label} geometry contract is missing`);
  return JSON.parse(match[1]);
}

function validateSharedDom(dom, label) {
  for (const needle of [
    'data-floating-timer-fixture-ready="true"',
    'data-floating-timer="foundation"',
    'data-floating-live-state="running"',
    'data-floating-subtask-progress="true"',
    'data-floating-subtask-control="add"',
    'data-floating-subtask-control="expand"',
  ]) {
    invariant(dom.includes(needle), `${label} is missing ${needle}`);
  }
}

function validateSharedGeometry(contract, label, theme, state) {
  invariant(contract.theme === theme, `${label} contract theme differs`);
  invariant(contract.state === state, `${label} contract state differs`);
  invariant(contract.subtaskToolbar?.height > 0, `${label} subtask toolbar geometry is invalid`);
  invariant(
    contract.subtaskRing?.width === 28 && contract.subtaskRing?.height === 28,
    `${label} subtask ring must be 28x28`,
  );
  for (const key of ["add", "expand"]) {
    invariant(
      contract[key]?.width === 32 && contract[key]?.height === 32,
      `${label} ${key} control must remain 32x32`,
    );
  }

  const geometryKeys = state === "collapsed"
    ? ["timer", "heading", "liveTimer", "subtaskToolbar", "subtaskRing", "add", "expand"]
    : ["timer", "actionStrip", "subtaskToolbar", "subtaskRing", "add", "expand", "returnToPanel", "subtaskPanel", "subtaskRow", "subtaskAction"];
  const baseline = baselines.get(state);
  if (!baseline) {
    baselines.set(state, contract);
    return;
  }
  for (const key of geometryKeys) {
    invariant(
      contract[key]?.width === baseline[key]?.width && contract[key]?.height === baseline[key]?.height,
      `${label} ${key} geometry differs across themes`,
    );
  }
}

function validateCollapsed(dom, contract, label) {
  for (const needle of [
    'data-floating-expanded="false"',
    "Prepare BFCM strategy",
    'data-floating-live-timer="true"',
    'aria-label="Running: 38:00 remaining"',
    ">38:00<",
    'aria-label="1 of 4 subtasks complete"',
    ">1/4 Subtasks<",
  ]) {
    invariant(dom.includes(needle), `${label} is missing ${needle}`);
  }
  invariant(!dom.includes('data-floating-action="return-to-panel"'), `${label} must keep the return action in expanded mode`);
  invariant(
    contract.timer?.width === 340 && contract.timer?.height === 110,
    `${label} collapsed timer must be exactly 340x110`,
  );
  invariant(contract.heading?.height > 0, `${label} heading geometry is invalid`);
  invariant(contract.title?.width > 0, `${label} title geometry is invalid`);
  invariant(contract.liveTimer?.width >= 48, `${label} live timer geometry is invalid`);
  invariant(contract.actionStrip === null, `${label} collapsed action strip must be absent`);
  invariant(contract.returnToPanel === null, `${label} collapsed return action must be absent`);
  invariant(contract.subtaskPanel === null, `${label} collapsed subtask panel must be absent`);
}

function validateExpanded(dom, contract, label) {
  for (const needle of [
    'data-floating-expanded="true"',
    'aria-label="Floating Timer actions"',
    'data-floating-action="break"',
    'data-floating-action="notes"',
    'data-floating-action="pause-resume"',
    'data-floating-action="skip"',
    'data-floating-action="done"',
    'data-floating-action="return-to-panel"',
    'aria-expanded="true"',
    'aria-label="3 of 4 subtasks complete"',
    ">3/4 Subtasks<",
    'data-floating-subtask-panel="true"',
    'data-floating-subtask-action="complete"',
    'data-floating-subtask-action="move-up"',
    'data-floating-subtask-action="move-down"',
    'data-floating-subtask-action="delete"',
    "Plan",
    "Contacts",
    "Affiliates",
    "Emails",
  ]) {
    invariant(dom.includes(needle), `${label} is missing ${needle}`);
  }
  invariant(
    contract.timer?.width === 340 && contract.timer?.height === 300,
    `${label} expanded timer must be exactly 340x300`,
  );
  invariant(contract.heading === null, `${label} expanded heading must be replaced by the action strip`);
  invariant(contract.title === null, `${label} expanded title must be absent`);
  invariant(contract.liveTimer === null, `${label} expanded timer text must be absent`);
  invariant(contract.actionStrip?.height >= 32, `${label} expanded action strip geometry is invalid`);
  invariant(
    contract.returnToPanel?.width === 32 && contract.returnToPanel?.height === 32,
    `${label} return action must remain 32x32`,
  );
  invariant(contract.subtaskPanel?.height > 0, `${label} expanded subtask panel geometry is invalid`);
  invariant(contract.subtaskRow?.height >= 32, `${label} expanded subtask row geometry is invalid`);
  invariant(
    contract.subtaskAction?.width === 32 && contract.subtaskAction?.height === 32,
    `${label} subtask actions must remain 32x32`,
  );
}

for (const state of ["collapsed", "expanded"]) {
  for (const theme of ["light", "dark"]) {
    const { label, dom } = readCapture(theme, state);
    validateSharedDom(dom, label);
    const contract = readContract(dom, label);
    validateSharedGeometry(contract, label, theme, state);
    if (state === "collapsed") validateCollapsed(dom, contract, label);
    else validateExpanded(dom, contract, label);
  }
}

const cyclePath = path.join(outputDirectory, "floating-timer-cycle.html");
invariant(fs.existsSync(cyclePath), "interactive resize lifecycle DOM capture is missing");
const cycleDom = fs.readFileSync(cyclePath, "utf8");
invariant(cycleDom.includes('data-floating-timer-cycle-ready="true"'), "interactive resize lifecycle did not finish");
const cycleMatch = cycleDom.match(/<script id="floating-timer-cycle-contract" type="application\/json">([\s\S]*?)<\/script>/);
invariant(cycleMatch, "interactive resize lifecycle contract is missing");
const observations = JSON.parse(cycleMatch[1]);
invariant(observations.length === 7, "interactive resize lifecycle must include three complete cycles");
for (const [index, observation] of observations.entries()) {
  const expanded = index % 2 === 1;
  invariant(observation.expanded === String(expanded), `cycle phase ${index} has the wrong expanded state`);
  invariant(observation.actionStrips === Number(expanded), `cycle phase ${index} retained or duplicated the action strip`);
  invariant(observation.headings === Number(!expanded), `cycle phase ${index} retained or duplicated the heading`);
  invariant(observation.subtaskPanels === Number(expanded), `cycle phase ${index} retained or duplicated the subtask panel`);
}

console.log("Floating Timer visual contracts and interactive resize lifecycle passed.");
