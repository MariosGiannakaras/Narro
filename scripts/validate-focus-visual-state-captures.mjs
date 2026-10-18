import fs from "node:fs";
import path from "node:path";
import { readEdgePng, differentFocusPixels } from "./focus-png-pixels.mjs";

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
  invariant(!contract.error, `${label} rendered fixture failed: ${contract.error}`);
  invariant(contract.theme === theme, `${label} contract theme differs`);
  invariant(contract.scenario === scenario, `${label} contract scenario differs`);
  invariant(contract.panel?.width === 340, `${label} Focus Panel width changed from the validated 340px geometry`);
  // This reader covers every Focus scenario in both themes, not only the B49
  // pair. The Windows artifact proved a mixed DOM viewport is a false geometry
  // regression even if every PNG has the required 420x720 dimensions.
  invariant(contract.layoutViewport?.width === 492 && contract.layoutViewport?.height === 628,
    `${label} actual inner viewport differs from the shared Focus 492x628 layout: ${JSON.stringify(contract.layoutViewport)}`);
  return { label, dom, contract, screenshot };
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
  invariant(
    (running.contract.liveCardStyle?.backgroundImage?.match(/linear-gradient/g) ?? []).length >= 2,
    `${running.label} running live card must expose the calibrated layered cyan→mint/lime edge`,
  );
  invariant(running.contract.liveCardStyle?.boxShadow !== "none", `${running.label} running live card glow is missing`);
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

  // Test the true production calendar-day metadata, not the generic fixture
  // fallback. Fixed Athens 2026-09-13 against persisted 2026-09-11 => 2d.
  const aged = readCapture(theme, "overdue-age");
  const age = aged.contract.overdueAge;
  invariant(aged.dom.includes('data-focus-overdue-age="2d ago">2d ago</span>')
    && aged.dom.includes('data-focus-overdue="true"')
    && age?.text === "2d ago"
    && age.width > 0 && age.height > 0
    && age.withinRow && age.notClipped
    && age.color !== age.ordinaryColor,
    `${aged.label} must visibly render warm 2d overdue calendar age inside its original task row`);

  const paused = readCapture(theme, "paused-metrics");
  requireLiveState(paused, "paused");
  requireDistinctCardState(paused, running);
  invariant(paused.dom.includes('data-focus-metrics-editable="true"'), `${paused.label} paused metrics are not editable`);
  invariant(paused.dom.includes(">Resume<"), `${paused.label} paused state must expose Resume`);

  const breakState = readCapture(theme, "break");
  requireLiveState(breakState, "break");
  invariant(running.dom.includes("Est: 2hr 10min")
    && breakState.dom.includes("Est: 2hr 20min"),
    breakState.label + " must add the full planned 10min active Break to Today EST (not 7min remaining or 3min elapsed)");

  invariant(breakState.dom.includes('data-focus-break-card="true"'),
    `${breakState.label} must render an explicit Break live card`);
  invariant(breakState.dom.includes('data-focus-break-suspended-work="true"'),
    `${breakState.label} must visibly retain suspended work in the queue`);
  const liveBreakTag = breakState.dom.match(/<article\b[^>]*data-focus-break-card="true"[^>]*>/)?.[0] ?? "";
  const suspendedMarkup = breakState.dom.match(/<article\b[^>]*data-focus-break-suspended-work="true"[^>]*>[\s\S]*?<\/article>/)?.[0] ?? "";
  const workTaskId = 'data-task-id="21111111-1111-4111-8111-111111111111"';
  invariant(liveBreakTag.includes(workTaskId) && suspendedMarkup.includes(workTaskId),
    breakState.label + " must preserve the authoritative work identity in both Break and suspended views");
  invariant(suspendedMarkup.includes('data-focus-reorderable="false"')
    && !suspendedMarkup.includes('data-focus-drag-task='),
    breakState.label + " must prevent any persisted reorder of suspended work");
  const suspendedButtons = [...suspendedMarkup.matchAll(/<button\b[^>]*>/g)].map(match => match[0]);
  invariant(suspendedButtons.length === 5 && suspendedButtons.every(button => /\sdisabled(?:=""|\s|>)/.test(button)),
    breakState.label + " must disable every queued work action during Break");
  const runningDoneFraction = running.dom.match(/data-focus-done-count="true"[^>]*>([^<]+)</)?.[1];
  const breakDoneFraction = breakState.dom.match(/data-focus-done-count="true"[^>]*>([^<]+)</)?.[1];
  invariant(runningDoneFraction && breakDoneFraction === runningDoneFraction,
    breakState.label + " must not change authoritative completed-task progress");

  invariant(breakState.dom.includes('data-focus-done-break-session-id="41111111-1111-4111-8111-111111111111"'),
    breakState.label + " must render the fixture's persisted closed Break identity in Focus Done");
  invariant(breakState.dom.includes('aria-label="Completed Break, 10min"'),
    breakState.label + " must expose a readable completed Break and duration");
  invariant(breakState.dom.includes(">2 Done<") && running.dom.includes(">1 Done<"),
    breakState.label + " Done heading counts Break history without changing the separate task fraction");
  invariant(!running.dom.includes('data-focus-done-break-session-id='),
    running.label + " must not fabricate Break history without a persisted Break row");
  requireDistinctCardState(breakState, running);
  invariant(breakState.dom.includes('aria-label="Break: 07:00 remaining"'), `${breakState.label} break timer label differs`);
  invariant(breakState.dom.includes(">07:00<"), `${breakState.label} break timer value differs`);
  invariant(breakState.dom.includes(">Resume<"), `${breakState.label} break state must expose Resume`);

  // Source VE-016: POMO remains on the active card during both Pomodoro
  // countdown and its Break, even if the task's persisted EST is zero.
  const pomoWork = readCapture(theme, "pomodoro-work");
  const pomoBreak = readCapture(theme, "pomodoro-break");
  requireLiveState(pomoWork, "running");
  requireLiveState(pomoBreak, "break");
  invariant(!running.dom.includes('data-focus-pomodoro-badge="true"')
    && !breakState.dom.includes('data-focus-pomodoro-badge="true"'),
    `${theme} ordinary timers and manual Break must not advertise Pomodoro`);
  for (const capture of [pomoWork, pomoBreak]) {
    const badge = capture.contract.pomodoroBadge;
    invariant(capture.dom.includes('data-focus-pomodoro-badge="true"')
      && capture.dom.includes('aria-label="Pomodoro mode"')
      && capture.dom.includes('data-focus-live-timer-mode="pomodoro"')
      && badge?.text === "POMO" && badge.width > 0 && badge.height > 0
      && badge.visible && badge.fitsCard && badge.notClipped
      && badge.color !== "rgba(0, 0, 0, 0)"
      && badge.borderColor !== "rgba(0, 0, 0, 0)",
      `${capture.label} POMO chip must paint uncut in its authoritative active-card state`);
  }
  invariant(pomoWork.dom.includes('aria-label="Pomodoro work: 18:00 remaining"')
    && pomoWork.dom.includes('>18:00<')
    && pomoWork.dom.includes('Est: 1hr 10min'),
    `${pomoWork.label} zero-EST Pomodoro must count down without replacing saved EST`);
  invariant(pomoBreak.dom.includes('aria-label="Pomodoro break: 03:00 remaining"')
    && pomoBreak.dom.includes('>03:00<')
    && pomoBreak.dom.includes('data-focus-break-card="true"')
    && pomoBreak.dom.includes('data-focus-break-suspended-work="true"')
    && pomoBreak.dom.includes('data-focus-reorderable="false"'),
    `${pomoBreak.label} Pomodoro Break must retain visible POMO, live Break and inert work identity`);

  const timeUp = readCapture(theme, "time-up");
  requireLiveState(timeUp, "time_up");
  requireDistinctCardState(timeUp, running);
  invariant(timeUp.dom.includes("aria-label=\"Time's Up\""), `${timeUp.label} Time's Up accessible label is missing`);
  invariant(timeUp.dom.includes(">00:00<"), `${timeUp.label} Time's Up zero display is missing`);

  const overtime = readCapture(theme, "overtime");
  requireLiveState(overtime, "overtime_running");
  requireDistinctCardState(overtime, running);
  invariant(overtime.dom.includes('aria-label="Overtime: -00:07:00"'), `${overtime.label} overtime accessible label differs`);
  invariant(overtime.dom.includes(">-00:07:00<"), `${overtime.label} overtime display is missing`);

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

  const focusedActions = readCapture(theme, "live-actions-focus");
  requireLiveState(focusedActions, "running");
  invariant(focusedActions.dom.includes('data-focus-action-reveal-pass="true"'),
    `${focusedActions.label} real keyboard focus reveal did not pass stable geometry contract`);
  invariant(focusedActions.dom.includes('aria-label="Pause"')
    && focusedActions.dom.includes('focus-panel__live-action-label'),
    `${focusedActions.label} focused icon needs its original accessible action name and label`);
  invariant(focusedActions.contract.liveCard?.height === running.contract.liveCard?.height,
    `${focusedActions.label} focusing actions must not reflow active card height`);
  // B49 source/CI finding Q01: a passing HTML marker previously accompanied
  // screenshots that were byte-for-byte the ordinary running state. Inspect
  // the *actual painted action pixels*, not merely a DOM/CSS declaration.
  // Real Windows Edge renders ALL 22 Focus scenario captures at a 492x628
  // inner DOM viewport despite producing a 420x720 PNG. Keep B49 at the same
  // page layout as paused, break, Notes, and other cross-state geometry checks.
  // The pixel clip remains 420x720; never resample or translate painted pixels.
  for (const capture of [running, focusedActions]) {
    invariant(capture.contract.layoutViewport?.width === 492
      && capture.contract.layoutViewport?.height === 628,
      `${capture.label} actual DOM viewport must be 492x628 before comparing real rail pixels; got ${JSON.stringify(capture.contract.layoutViewport)}`);
  }
  const region = focusedActions.contract.focusActionPaintRegion;
  const baselineRegion = running.contract.focusActionPaintRegion;
  invariant(region && baselineRegion
    && Math.abs(region.x - baselineRegion.x) <= 1
    && Math.abs(region.y - baselineRegion.y) <= 1
    && Math.abs(region.width - baselineRegion.width) <= 1
    && Math.abs(region.height - baselineRegion.height) <= 1,
    `${focusedActions.label} action rail moved between resting and focused captures`);
  const changedPixels = differentFocusPixels(
    readEdgePng(running.screenshot), readEdgePng(focusedActions.screenshot), region,
  );
  const minimumChanged = Math.max(200, Math.ceil(region.width * region.height * 0.02));
  invariant(changedPixels >= minimumChanged,
    `${focusedActions.label} B49 FALSE VISUAL PASS: focused action screenshot looks like running in its actual rail (${changedPixels} changed pixels; need ${minimumChanged})`);

  const success = readCapture(theme, "success");
  invariant(success.contract.queueTitleLayout?.successQueueInert === true,
    `focus-panel-success-${theme} must show the queued titles while blocking their focus during committed success`);
  invariant(success.dom.includes('data-focus-success-inline-card="true"'),
    `${success.label} must place committed success inside the active card`);
  invariant(success.dom.includes('data-focus-success-placement="inline"'),
    `${success.label} must use nonmodal inline success semantics`);
  invariant(!success.dom.includes('aria-modal="true"'),
    `${success.label} must not mask the visible Focus queue as a modal`);
  invariant(success.dom.includes('aria-label="Today progress"')
    && success.dom.includes('data-focus-group="remaining"'),
    `${success.label} must preserve header and remaining queue`);
  invariant(success.dom.includes('data-focus-success-action="next-task"')
    && success.dom.includes('data-focus-success-action="close"'),
    `${success.label} must retain next/close controls after committed Done`);
  invariant(success.contract.liveCard?.height > 120
    && success.contract.liveTimer === null
    && success.contract.actions === null,
    `${success.label} must replace the active card without a stale running timer/actions`);

  // B65: test true rendered success copy, not merely BigInt formatting.
  for (const spec of [
    { scenario: "success", text: "38 minutes early", est: "1hr", taken: "22min" },
    { scenario: "success-late", text: "1 minute late", est: "10min", taken: "11min" },
    { scenario: "success-equal", text: "Right on time", est: "10min", taken: "10min" },
    { scenario: "success-no-est", text: null, est: "—", taken: "10min" },
  ]) {
    const captured = spec.scenario === "success" ? success : readCapture(theme, spec.scenario);
    invariant(captured.contract.queueTitleLayout?.successQueueInert === true
      && captured.contract.liveTimer === null
      && captured.contract.actions === null
      && captured.dom.includes('data-focus-success-placement="inline"'),
      `${captured.label} must retain committed success and inactive queue`);
    invariant(captured.dom.includes(`<span>EST <strong>${spec.est}</strong></span>`)
      && captured.dom.includes(`<span>Taken <strong>${spec.taken}</strong></span>`),
      `${captured.label} must show accurate EST/Taken`);
    if (spec.text === null) {
      invariant(captured.contract.successTiming === null
        && !captured.dom.includes('data-focus-success-timing="true"'),
        `${captured.label} missing EST must suppress invented delta`);
    } else {
      invariant(captured.dom.includes(`data-focus-success-timing="true">${spec.text}</p>`)
        && captured.contract.successTiming?.text === spec.text
        && captured.contract.successTiming.width > 0
        && captured.contract.successTiming.height > 0
        && captured.contract.successTiming.fitsCard
        && captured.contract.successTiming.notClipped,
        `${captured.label} timing must render and fit in the production card`);
    }
  }

  // D2 native Windows evidence shows the optional offline celebration only
  // when Fun GIF is enabled. Capture both preferences, not merely its DOM
  // component source, and reject an invisible/overflowing decorative SVG.
  const funGif = readCapture(theme, "success-fun-gif");
  invariant(!success.dom.includes('data-focus-success-reaction="true"'),
    `${success.label} disabled Fun GIF must not leak the decoration`);
  invariant(funGif.dom.includes('data-focus-success-reaction="true"')
    && funGif.dom.includes('data-focus-success-placement="inline"')
    && !funGif.dom.includes('aria-modal="true"'),
    `${funGif.label} enabled Fun GIF must appear inside production inline success`);
  invariant(funGif.contract.queueTitleLayout?.successQueueInert === true
    && funGif.contract.liveTimer === null
    && funGif.contract.actions === null
    && funGif.dom.includes('data-focus-success-action="next-task"')
    && funGif.dom.includes('data-focus-success-action="take-break"')
    && funGif.dom.includes('data-focus-success-action="close"'),
    `${funGif.label} reaction must retain safe committed state and actions`);
  const reaction = funGif.contract.successReaction;
  invariant(reaction?.fitsCard && reaction.svgVisible && reaction.notClipped,
    `${funGif.label} enabled decorative vector is missing or clipped`);
  const reactionRegion = reaction.paintRegion;
  invariant(reactionRegion.width > 80 && reactionRegion.height >= 90
    && reactionRegion.x >= 0 && reactionRegion.y >= 0
    && reactionRegion.x + reactionRegion.width <= 420
    && reactionRegion.y + reactionRegion.height <= 720,
    `${funGif.label} reaction must be visibly inside actual screenshot dimensions`);
  const changed = differentFocusPixels(
    readEdgePng(success.screenshot), readEdgePng(funGif.screenshot), reactionRegion,
  );
  invariant(changed >= 200,
    `${funGif.label} enabled reaction screenshot was indistinguishable from disabled state (${changed} changed pixels)`);

  const noEligible = readCapture(theme, "no-eligible");
  invariant(noEligible.dom.includes('data-focus-live-card="false"'), `${noEligible.label} must not fabricate a live card`);
  invariant(noEligible.dom.includes('data-focus-live-state="no-eligible"'), `${noEligible.label} no-eligible visual marker is missing`);
  invariant(noEligible.dom.includes('data-focus-empty-state="no-eligible"'), `${noEligible.label} no-eligible semantic marker is missing`);
  invariant(noEligible.dom.includes("Nothing eligible yet"), `${noEligible.label} no-eligible heading is missing`);
  invariant(noEligible.dom.includes("Scheduled tasks will be ready when due."), `${noEligible.label} no-eligible guidance is missing`);
  invariant(noEligible.dom.includes("1 Scheduled task"), `${noEligible.label} future scheduled work must remain visible`);
  invariant(noEligible.dom.includes("Client follow-up call"), `${noEligible.label} scheduled task fixture is missing`);
  invariant(!noEligible.dom.includes('data-focus-live-actions="true"'), `${noEligible.label} must not fabricate live actions`);
  invariant(!noEligible.dom.includes('data-focus-live-timer="true"'), `${noEligible.label} must not fabricate a live timer`);
  invariant(noEligible.contract.liveTimer === null, `${noEligible.label} live timer geometry must be absent`);
  invariant(noEligible.contract.actions === null, `${noEligible.label} action-strip geometry must be absent`);
  invariant(noEligible.contract.liveCardStyle?.borderStyle === "dashed", `${noEligible.label} no-eligible card must use the restrained dashed state treatment`);

  const empty = readCapture(theme, "empty");
  invariant(empty.dom.includes('data-focus-live-card="false"'), `${empty.label} must not fabricate a live card`);
  invariant(empty.dom.includes('data-focus-live-state="idle"'), `${empty.label} must remain an idle timer projection`);
  invariant(empty.dom.includes('data-focus-empty-state="empty"'), `${empty.label} genuinely empty semantic marker is missing`);
  invariant(empty.dom.includes("All Clear"), `${empty.label} All Clear heading is missing`);
  invariant(empty.dom.includes("No Today tasks left to focus on."), `${empty.label} empty Today guidance is missing`);
  invariant(empty.dom.includes("0 Scheduled tasks"), `${empty.label} scheduled group must remain structurally present`);
  invariant(!empty.dom.includes("Client follow-up call"), `${empty.label} must not contain future scheduled fixture work`);
  invariant(!empty.dom.includes('data-focus-live-actions="true"'), `${empty.label} must not fabricate live actions`);
  invariant(!empty.dom.includes('data-focus-live-timer="true"'), `${empty.label} must not fabricate a live timer`);
  invariant(empty.contract.liveTimer === null, `${empty.label} live timer geometry must be absent`);
  invariant(empty.contract.actions === null, `${empty.label} action-strip geometry must be absent`);
  invariant(empty.contract.liveCardStyle?.borderStyle !== "dashed", `${empty.label} genuinely empty state must remain visually distinct from no-eligible`);
}

console.log("Focus active, paused, break, Time's Up/overtime, overdue, Notes-expanded, no-eligible, and empty visual captures validated.");
