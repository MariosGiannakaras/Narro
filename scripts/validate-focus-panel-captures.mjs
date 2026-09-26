import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
let baselineLiveTimerWidth = null;
let baselineSubtaskRingWidth = null;
let baselineMetricsWidth = null;
let baselinePausedMetricInputWidth = null;

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

function readCapture(label) {
  const screenshot = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  validatePng(screenshot, label);
  invariant(fs.existsSync(domPath), `${label} DOM capture is missing`);
  return fs.readFileSync(domPath, "utf8");
}

function readContract(dom, label) {
  const match = dom.match(/<script id="focus-panel-visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(match, `${label} geometry contract is missing`);
  return JSON.parse(match[1]);
}

function validateSharedGeometry(contract, label, theme) {
  invariant(contract.theme === theme, `${label} contract theme differs`);
  invariant(contract.panel?.width === 340, `${label} panel width is ${contract.panel?.width}; expected 340px`);
  invariant(
    contract.layoutViewport?.width > 0 && contract.layoutViewport?.height > 0,
    `${label} measured DOM layout viewport is missing or invalid`,
  );
  invariant(
    contract.panel?.height >= contract.layoutViewport.height,
    `${label} panel height ${contract.panel?.height}px does not fill measured DOM layout viewport height ${contract.layoutViewport.height}px (PNG capture remains 420x720)`,
  );
  invariant(contract.topbar?.height > 0, `${label} top bar geometry is invalid`);
  invariant(contract.summary?.height > 0, `${label} summary geometry is invalid`);
  invariant(contract.liveCard?.height >= 210, `${label} live card/metric/subtask/action geometry is too small`);
  invariant(
    contract.liveTimer?.width >= 72 && contract.liveTimer?.width <= 96,
    `${label} live timer width ${contract.liveTimer?.width}px is outside the fixed compact slot`,
  );
  invariant(contract.liveTimer?.height > 0, `${label} live timer geometry is invalid`);
  if (baselineLiveTimerWidth === null) baselineLiveTimerWidth = contract.liveTimer.width;
  invariant(
    contract.liveTimer.width === baselineLiveTimerWidth,
    `${label} live timer width ${contract.liveTimer.width}px differs from the baseline ${baselineLiveTimerWidth}px`,
  );
  invariant(contract.metrics?.width > 0 && contract.metrics?.height >= 64, `${label} live metric surface geometry is invalid`);
  if (baselineMetricsWidth === null) baselineMetricsWidth = contract.metrics.width;
  invariant(
    contract.metrics.width === baselineMetricsWidth,
    `${label} live metric width ${contract.metrics.width}px differs from the baseline ${baselineMetricsWidth}px`,
  );
  invariant(contract.metricRow?.width > 0 && contract.metricRow?.height >= 32, `${label} live metric row geometry is invalid`);
  invariant(contract.subtasks?.width > 0 && contract.subtasks?.height >= 36, `${label} live subtask surface geometry is invalid`);
  invariant(
    contract.subtaskRing?.width >= 34 && contract.subtaskRing?.width <= 38 && contract.subtaskRing?.height === contract.subtaskRing?.width,
    `${label} live subtask progress ring geometry is invalid`,
  );
  if (baselineSubtaskRingWidth === null) baselineSubtaskRingWidth = contract.subtaskRing.width;
  invariant(
    contract.subtaskRing.width === baselineSubtaskRingWidth,
    `${label} subtask ring width ${contract.subtaskRing.width}px differs from the baseline ${baselineSubtaskRingWidth}px`,
  );
  invariant(contract.actions?.width > 0 && contract.actions?.height >= 30, `${label} live action geometry is invalid`);
  invariant(contract.firstRow?.height >= 50, `${label} remaining row geometry is too small`);
  invariant(contract.rowActionSlot?.width === 124, `${label} ordinary row action slot must reserve 7.75rem/124px`);
  invariant(contract.rowActionSlot?.height === 28, `${label} ordinary row action slot height must remain 1.75rem/28px`);
  invariant(contract.addTask?.height >= 34, `${label} Add Task geometry is too small`);
}

function validateSharedDom(dom, label) {
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
  invariant(dom.includes('data-focus-live-timer="true"'), `${label} authoritative live timer marker is missing`);
  invariant(dom.includes('data-focus-live-timer-mode="est_countdown"'), `${label} EST countdown mode marker is missing`);
  invariant(dom.includes('data-timer-numerals="true"'), `${label} tabular timer numeral marker is missing`);
  invariant(dom.includes('data-focus-live-actions="true"'), `${label} live action wrapper is missing`);
  invariant(dom.includes('data-focus-live-metrics="true"'), `${label} live metric surface is missing`);
  invariant(dom.includes('aria-label="Live task time details"'), `${label} live metric accessible name is missing`);
  invariant(dom.includes('data-focus-metric="estimate"'), `${label} EST metric row is missing`);
  invariant(dom.includes('data-focus-metric="time_taken"'), `${label} Time Taken metric row is missing`);
  invariant(dom.includes('data-focus-subtasks="collapsed"'), `${label} collapsed live subtask surface is missing`);
  invariant(dom.includes('data-focus-subtask-progress="true"'), `${label} live subtask progress ring is missing`);
  invariant(dom.includes('aria-label="1 of 4 subtasks complete"'), `${label} live subtask progress accessible value is missing`);
  invariant(dom.includes('data-focus-subtask-control="toggle"'), `${label} live subtask expand/collapse control is missing`);
  invariant(dom.includes('data-focus-subtask-control="add"'), `${label} live subtask add control is missing`);
  invariant(dom.includes(">1/4 Subtasks<"), `${label} live subtask count is missing`);
  invariant(dom.includes('aria-label="Live task actions"'), `${label} live action group accessible name is missing`);
  for (const action of ["break", "notes", "pause-resume", "skip", "extend", "done"]) {
    invariant(dom.includes(`data-focus-action="${action}"`), `${label} ${action} Focus action is missing`);
  }
  invariant(dom.includes(">Break<"), `${label} Break action label is missing`);
  invariant(dom.includes(">Notes<"), `${label} Notes action label is missing`);
  invariant(dom.includes(">Skip<"), `${label} Skip action label is missing`);
  invariant(dom.includes(">Extend<"), `${label} Extend action label is missing`);
  invariant(dom.includes(">Done<"), `${label} Done action label is missing`);
  for (const action of ["complete", "make-live", "move-up", "move-down", "more"]) {
    invariant(dom.includes(`data-focus-row-action="${action}"`), `${label} ordinary row ${action} action is missing`);
  }
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
    'data-focus-live-metrics="true"',
    'data-focus-subtasks="collapsed"',
    'class="focus-panel__live-actions"',
    'data-focus-group="remaining"',
    'class="focus-panel__add-task"',
    'data-focus-group="scheduled"',
    'data-focus-group="done"',
  ].map((needle) => dom.indexOf(needle));
  invariant(order.every((index) => index >= 0), `${label} one or more hierarchy markers are missing`);
  invariant(order.every((index, position) => position === 0 || index > order[position - 1]), `${label} hierarchy order differs from source evidence`);
}

for (const theme of ["light", "dark"]) {
  const label = `focus-panel-${theme}`;
  const dom = readCapture(label);
  validateSharedDom(dom, label);
  invariant(dom.includes('data-focus-live-state="running"'), `${label} running live state is missing`);
  invariant(dom.includes('aria-label="Running: 38:00 remaining"'), `${label} live timer accessible label is missing`);
  invariant(dom.includes(">38:00<"), `${label} authoritative EST countdown value is missing`);
  invariant(dom.includes('data-focus-metrics-editable="false"'), `${label} running metrics must remain read-only`);
  invariant(dom.includes('data-focus-metric-control="display"'), `${label} running metric display marker is missing`);
  invariant(!dom.includes('data-focus-metric-control="input"'), `${label} running fixture must not expose a metric input`);
  invariant(dom.includes(">1:00:00<"), `${label} live EST display value is missing`);
  invariant(dom.includes(">0:22:00<"), `${label} live Time Taken display value is missing`);
  invariant(dom.includes(">Pause<"), `${label} Pause action label is missing for running fixture`);

  const contract = readContract(dom, label);
  invariant(contract.scenario === "running", `${label} contract scenario differs`);
  invariant(contract.metricInput === null, `${label} running metric input geometry must be absent`);
  validateSharedGeometry(contract, label, theme);
}

for (const theme of ["light", "dark"]) {
  const label = `focus-panel-paused-metrics-${theme}`;
  const dom = readCapture(label);
  validateSharedDom(dom, label);
  invariant(dom.includes('data-focus-live-state="paused"'), `${label} paused live state is missing`);
  invariant(dom.includes('aria-label="Paused: 38:00 remaining"'), `${label} paused timer accessible label is missing`);
  invariant(dom.includes(">38:00<"), `${label} paused authoritative EST countdown value is missing`);
  invariant(dom.includes('data-focus-metrics-editable="true"'), `${label} paused metrics must be editable`);
  invariant(dom.includes('data-focus-metric-control="input"'), `${label} paused EST editor input is missing`);
  invariant(dom.includes('aria-label="EST duration in H:MM:SS"'), `${label} paused EST editor accessible name is missing`);
  invariant(dom.includes('data-focus-metric-control="cancel"'), `${label} paused metric cancel control is missing`);
  invariant(dom.includes('aria-label="Cancel EST edit"'), `${label} paused metric cancel accessible name is missing`);
  invariant(dom.includes('data-focus-metric-control="save"'), `${label} paused metric save control is missing`);
  invariant(dom.includes('aria-label="Save EST"'), `${label} paused metric save accessible name is missing`);
  invariant(dom.includes('aria-label="Edit Time Taken: 0:22:00"'), `${label} paused Time Taken edit affordance is missing`);
  invariant(dom.includes(">Resume<"), `${label} Resume action label is missing for paused fixture`);

  const contract = readContract(dom, label);
  invariant(contract.scenario === "paused-metrics", `${label} contract scenario differs`);
  validateSharedGeometry(contract, label, theme);
  invariant(
    contract.metricInput?.width >= 100 && contract.metricInput?.height >= 30,
    `${label} paused metric input geometry is invalid`,
  );
  if (baselinePausedMetricInputWidth === null) baselinePausedMetricInputWidth = contract.metricInput.width;
  invariant(
    contract.metricInput.width === baselinePausedMetricInputWidth,
    `${label} paused metric input width ${contract.metricInput.width}px differs from opposite theme ${baselinePausedMetricInputWidth}px`,
  );
}

console.log("Focus Panel visual captures validated.");
