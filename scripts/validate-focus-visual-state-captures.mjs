import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus visual-state validation failed: ${message}`);
}

function validatePng(filePath, label) {
  invariant(fs.existsSync(filePath), `${label} screenshot is missing`);
  const png = fs.readFileSync(filePath);
  invariant(png.length > 10_000, `${label} screenshot is unexpectedly small`);
  invariant(png.length >= 24, `${label} PNG is incomplete`);
  invariant(png.readUInt32BE(16) === 420 && png.readUInt32BE(20) === 720, `${label} screenshot must be 420x720`);
}

function suffixFor(scenario) {
  return scenario === "running" ? "" : `-${scenario}`;
}

function readCapture(theme, scenario) {
  const label = `focus-panel${suffixFor(scenario)}-${theme}`;
  const screenshot = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  validatePng(screenshot, label);
  invariant(fs.existsSync(domPath), `${label} DOM capture is missing`);
  const dom = fs.readFileSync(domPath, "utf8");
  invariant(dom.includes('data-focus-panel-fixture-ready="true"'), `${label} ready marker is missing`);
  const match = dom.match(/<script id="focus-panel-visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(match, `${label} visual contract is missing`);
  const contract = JSON.parse(match[1]);
  invariant(contract.theme === theme, `${label} contract theme differs`);
  invariant(contract.scenario === scenario, `${label} contract scenario differs`);
  invariant(contract.panel?.width === 340, `${label} Focus Panel width changed from the validated 340px geometry`);
  return { label, dom, contract };
}

function requireLiveState(capture, state) {
  invariant(capture.dom.includes('data-focus-live-card="true"'), `${capture.label} live card is missing`);
  invariant(capture.dom.includes(`data-focus-live-state="${state}"`), `${capture.label} ${state} state marker is missing`);
  invariant(capture.contract.liveTimer?.width > 0, `${capture.label} live timer geometry is missing`);
  invariant(capture.contract.actions?.width > 0, `${capture.label} live action geometry is missing`);
}

function requireDistinctCardState(capture, running) {
  invariant(
    capture.contract.liveCardStyle?.backgroundColor !== running.contract.liveCardStyle?.backgroundColor
      || capture.contract.liveCardStyle?.borderColor !== running.contract.liveCardStyle?.borderColor,
    `${capture.label} does not render a visually distinct live-card state`,
  );
  invariant(
    capture.contract.liveTimerStyle?.color !== running.contract.liveTimerStyle?.color,
    `${capture.label} timer color does not distinguish the state from running`,
  );
}

for (const theme of ["light", "dark"]) {
  const running = readCapture(theme, "running");
  requireLiveState(running, "running");
  invariant(running.dom.includes('aria-label="Running: 38:00 remaining"'), `${running.label} running timer label differs`);
  invariant(running.dom.includes(">38:00<"), `${running.label} running timer value differs`);

  invariant(running.dom.includes(`data-task-id="21111111-1111-4111-8111-111111111112"`), `${running.label} overdue fixture row is missing`);
  invariant(running.dom.includes('data-focus-overdue="true"'), `${running.label} overdue state marker is missing`);
  invariant(running.dom.includes(">Overdue<"), `${running.label} overdue label is missing`);
  invariant(
    running.contract.overdueRowStyle?.backgroundColor !== running.contract.longRowStyle?.backgroundColor
      || running.contract.overdueRowStyle?.borderColor !== running.contract.longRowStyle?.borderColor,
    `${running.label} overdue row is not visually distinct from an ordinary remaining row`,
  );

  const paused = readCapture(theme, "paused-metrics");
  requireLiveState(paused, "paused");
  requireDistinctCardState(paused, running);
  invariant(paused.dom.includes('data-focus-metrics-editable="true"'), `${paused.label} paused metrics are not editable`);
  invariant(paused.dom.includes(">Resume<"), `${paused.label} paused state must expose Resume`);

  const breakState = readCapture(theme, "break");
  requireLiveState(breakState, "break");
  requireDistinctCardState(breakState, running);
  invariant(breakState.dom.includes('aria-label="Break: 07:00 remaining"'), `${breakState.label} break timer label differs`);
  invariant(breakState.dom.includes(">07:00<"), `${breakState.label} break timer value differs`);
  invariant(breakState.dom.includes(">Resume<"), `${breakState.label} break state must expose Resume`);

  const timeUp = readCapture(theme, "time-up");
  requireLiveState(timeUp, "time_up");
  requireDistinctCardState(timeUp, running);
  invariant(timeUp.dom.includes("aria-label=\"Time's Up\""), `${timeUp.label} Time's Up accessible label is missing`);
  invariant(timeUp.dom.includes(">00:00<"), `${timeUp.label} Time's Up zero display is missing`);

  const overtime = readCapture(theme, "overtime");
  requireLiveState(overtime, "overtime_running");
  requireDistinctCardState(overtime, running);
  invariant(overtime.dom.includes('aria-label="Overtime: +07:00"'), `${overtime.label} overtime accessible label differs`);
  invariant(overtime.dom.includes(">+07:00<"), `${overtime.label} overtime display is missing`);

  const notes = readCapture(theme, "notes-expanded");
  requireLiveState(notes, "running");
  invariant(notes.dom.includes('data-task-notes="expanded"'), `${notes.label} Notes expansion marker is missing`);
  invariant(notes.dom.includes('data-task-note-panel="true"'), `${notes.label} Notes panel is missing`);
  invariant(notes.dom.includes('data-task-note-editor="true"'), `${notes.label} established Notes editor is missing`);
  invariant(notes.contract.notes?.height > 0, `${notes.label} Notes expanded geometry is missing`);
  invariant(notes.contract.notesStyle?.backgroundColor, `${notes.label} Notes expanded visual surface is missing`);
  invariant(
    notes.contract.liveCard?.height > running.contract.liveCard?.height,
    `${notes.label} Notes expansion must grow vertically inside the active card rather than overlaying task content`,
  );

  const noEligible = readCapture(theme, "no-eligible");
  invariant(noEligible.dom.includes('data-focus-live-card="false"'), `${noEligible.label} must not fabricate a live card`);
  invariant(noEligible.dom.includes('data-focus-live-state="no-eligible"'), `${noEligible.label} no-eligible visual marker is missing`);
  invariant(noEligible.dom.includes("No live task in this view"), `${noEligible.label} existing idle copy changed before item 16`);
  invariant(noEligible.dom.includes("1 Scheduled task"), `${noEligible.label} future scheduled work must remain visible`);
  invariant(noEligible.dom.includes("Client follow-up call"), `${noEligible.label} scheduled task fixture is missing`);
  invariant(!noEligible.dom.includes('data-focus-live-actions="true"'), `${noEligible.label} must not fabricate live actions`);
  invariant(!noEligible.dom.includes('data-focus-live-timer="true"'), `${noEligible.label} must not fabricate a live timer`);
  invariant(noEligible.contract.liveTimer === null, `${noEligible.label} live timer geometry must be absent`);
  invariant(noEligible.contract.actions === null, `${noEligible.label} action-strip geometry must be absent`);
  invariant(noEligible.contract.liveCardStyle?.borderStyle === "dashed", `${noEligible.label} no-eligible card must use the restrained dashed state treatment`);
}

console.log("Focus active, paused, break, Time's Up/overtime, overdue, Notes-expanded, and no-eligible visual captures validated.");
