import fs from "node:fs";
import { isRetryableDevToolsPortReadError } from "./edgeCdpDevToolsPortErrors.mjs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus action-slot contract failed: ${message}`);
}

const titleModule = read("src/FocusTaskRowTitle.tsx");
const slotCss = read("src/focusActionSlots.css");
const panelCss = read("src/focusPanel.css");
const panelSource = read("src/FocusPanel.tsx");
const rowTitleCss = read("src/focusTaskRowTitle.css");
const subtasks = read("src/TaskSubtasks.tsx");
const liveActions = read("src/FocusLiveActions.tsx");
const fixture = read("src/focusPanelVisualFixture.tsx");
const visualValidator = read("scripts/validate-focus-action-slot-captures.mjs");
const pkg = JSON.parse(read("package.json"));

invariant(titleModule.includes('import "./focusActionSlots.css";'), "Focus surface must load the reserved-slot stylesheet");
invariant(slotCss.includes(".focus-panel__subtasks .list-board-task__subtask-actions"), "reserved subtask action rail must be scoped to Focus");
invariant(slotCss.includes("min-width: 5.75rem"), "hidden Focus subtask controls must retain their reserved width");
invariant(slotCss.includes("flex: none"), "reserved Focus subtask action width must not flex with title content");
invariant(slotCss.includes("opacity: 0"), "resting Focus subtask actions must reveal without insertion into layout");
invariant(slotCss.includes("pointer-events: none"), "visually hidden Focus subtask actions must not keep pointer hit targets active");
invariant(slotCss.includes(".list-board-task__subtask-row:hover .list-board-task__subtask-actions"), "pointer hover must reveal the reserved action rail");
invariant(slotCss.includes(".list-board-task__subtask-row:focus-within .list-board-task__subtask-actions"), "keyboard/child focus must reveal the same reserved action rail");
invariant(slotCss.includes("opacity: 1"), "revealed action rail must become visible in place");
invariant(slotCss.includes("pointer-events: auto"), "revealed action rail must restore pointer hit targets");
invariant(!slotCss.includes("display: none"), "reserved action rail must never be removed from layout");
const subtaskSlotCss = slotCss.slice(0, slotCss.indexOf(".focus-panel__row-action-slot"));
invariant(!subtaskSlotCss.includes("position: absolute"), "Focus subtask action rail must reuse the existing fixed grid column rather than a second geometry model");
invariant(!slotCss.includes("margin-left"), "action reveal must not move sibling content with margins");
invariant(!slotCss.includes("transform:"), "action reveal must not translate or scale hit targets");
invariant(!slotCss.includes("transition:"), "item 13 must not add motion that needs a separate reduced-motion contract");
invariant(panelCss.includes("grid-template-columns: 1.75rem minmax(0, 1fr) 5.75rem"), "Focus subtask rows must reserve a fixed action column beside flexible text");
invariant(panelCss.includes("width: 5.75rem"), "Focus subtask action rail must retain fixed width in the base layout");
invariant(panelCss.includes("grid-template-columns: repeat(3, 1.75rem)"), "Focus subtask action positions must remain fixed-size hit slots");
// Live-action slot stability and full-label fit are measured in the rendered
// Focus fixtures across running/paused states and themes, rather than requiring
// equal CSS columns that truncate Resume/Extend at the production width.
invariant(panelCss.includes("grid-template-columns: 1.75rem minmax(0, 1fr) 7.75rem"), "ordinary Focus rows must reserve completion, title, and action columns");
invariant(slotCss.includes("width: 7.75rem"), "ordinary Focus action rail must reserve fixed geometry");
invariant(slotCss.includes("grid-template-columns: repeat(4, 1.75rem)"), "ordinary Focus primary actions must use fixed keyboard/pointer hit slots");
invariant(slotCss.includes(".focus-panel__task-row:hover .focus-panel__row-actions"), "ordinary Focus pointer hover must reveal actions in place");
invariant(slotCss.includes(".focus-panel__task-row:focus-within .focus-panel__row-actions"), "ordinary Focus keyboard focus must reveal the same actions");
invariant(slotCss.includes(".focus-panel__live-actions > button"), "live action controls need an explicit slot-filling rule");
invariant(slotCss.includes("width: 100%"), "each live action control must fill its existing grid slot without changing grid geometry");
invariant(subtasks.includes('className="list-board-task__subtask-actions"'), "shared subtask action rail markup must remain the reused production path");
invariant(subtasks.includes('data-task-subtask-control="move-up"'), "existing Move up Focus subtask control must remain present");
invariant(subtasks.includes('data-task-subtask-control="move-down"'), "existing Move down Focus subtask control must remain present");
invariant(subtasks.includes('data-task-subtask-control="delete"'), "existing Delete Focus subtask control must remain present");
invariant(liveActions.includes('className="focus-panel__live-actions"'), "existing live action strip must remain the production path");
invariant(rowTitleCss.includes("-webkit-line-clamp: 2"), "item-12 two-line ordinary title contract must remain intact");
invariant(rowTitleCss.includes("flex: 1 1 auto"), "item-12 flexible title slot must remain intact");
invariant(fixture.includes('actions: optionalBox(".focus-panel__live-actions")'), "Windows visual fixture must keep measuring live action geometry whenever a live surface exists");
invariant(visualValidator.includes("baselineActionWidth"), "Windows visual validator must compare Focus action width across captures");
invariant(visualValidator.includes("baselineActionHeight"), "Windows visual validator must compare Focus action height across captures");
invariant(visualValidator.includes('["break", "notes", "pause-resume", "skip", "done"]'), "B50 captured Focus must require five ordinary actions");
invariant(visualValidator.includes("contract.actionLabels.length === 5"), "B50 capture count must match contextual-five-slot layout");
invariant(visualValidator.includes('!dom.includes(\'data-focus-action="extend"\')'), "B50 ordinary fixture must reject dormant Extend");
invariant(pkg.scripts["test:ui-focus-action-slots"] === "node scripts/test-ui-focus-action-slots.mjs", "package script registration differs");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-action-slots"), "frontend preflight must run the Focus action-slot contract");
invariant(pkg.scripts["test:visual-regression:windows"].includes("validate-focus-action-slot-captures.mjs"), "Windows visual validation must compare stable Focus action geometry");

// B50: Time's Up substitutes Extend for Pause/Resume at the same Focus slot,
// matching the already-conditional Floating slot. Ordinary work must not
// leave a disabled sixth action that narrows live controls.
const panelActionStart = liveActions.indexOf('className="focus-panel__live-actions"');
const panelActionEnd = liveActions.indexOf('className="floating-timer-foundation__actions"', panelActionStart);
invariant(panelActionStart >= 0 && panelActionEnd > panelActionStart, "Focus live action-strip location");
const panelActions = liveActions.slice(panelActionStart, panelActionEnd);
invariant(panelActions.includes("{state.extendEnabled ? (") &&
  panelActions.includes('data-focus-action="extend"') &&
  panelActions.includes('data-focus-action="pause-resume"'),
"Time's Up must substitute Extend for Pause in the same logical Focus action slot");
invariant(liveActions.includes('extendEnabled: timer.state === "time_up"'),
  "Extend disclosure must derive only from authoritative Time's Up timer state");
invariant(panelActions.indexOf('data-focus-action="extend"') < panelActions.indexOf('data-focus-action="skip"'),
  "contextual Extend must occupy the third action position before Skip");
invariant(panelCss.includes("grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr) minmax(0, 1.4fr) minmax(0, 0.85fr) minmax(0, 1fr);"),
  "Focus must reserve exactly five stable slots with space for Resume/Extend");
invariant(!panelCss.includes("minmax(0, 1.25fr) minmax(0, 1fr);"),
  "sixth always-visible Extend slot must not reappear");

// B49: title/timer and the five real interactive action targets swap in-place.
// Keyboard action focus must reveal the same row; no sixth inert Extend reappears.
for (const icon of ['kind="break"', 'kind="notes"', 'kind="skip"', 'kind="done"']) {
  invariant(panelActions.includes("<FloatingActionIcon " + icon), "B49 accessible icon missing " + icon);
}
invariant(panelActions.includes('kind={state.pauseResumeLabel === "Resume" ? "resume" : "pause"}'),
  "B49 Pause/Resume must use timer state to select the correct icon");
invariant(panelActions.includes('className="focus-panel__live-action-label"'),
  "B49 icons require optional targeted text pills");
invariant(panelCss.includes('.focus-panel__live-card:hover .focus-panel__live-actions')
  && panelCss.includes('.focus-panel__live-card:has(.focus-panel__live-actions:focus-within) .focus-panel__live-actions'),
  "B49 pointer and keyboard must reveal the same action controls");
invariant(panelSource.includes('onFocusCapture={(event) => {')
  && panelSource.includes('onBlurCapture={(event) => {')
  && panelSource.includes('event.currentTarget.dataset.focusActionsKeyboard = "true"')
  && panelSource.includes('delete event.currentTarget.dataset.focusActionsKeyboard')
  && panelCss.includes('.focus-panel__live-card[data-focus-actions-keyboard="true"] .focus-panel__live-heading')
  && panelCss.includes('.focus-panel__live-card[data-focus-actions-keyboard="true"] .focus-panel__live-actions'),
  "B49 keyboard action reveal must use explicit focus state in addition to CSS pseudo-classes");
invariant(panelCss.includes('.focus-panel__live-card:focus-within .focus-panel__live-heading')
  && panelCss.includes('.focus-panel__live-card:focus-within .focus-panel__live-actions'),
  "B49 keyboard focus must reveal heading-swap without depending solely on Edge dynamic :has invalidation");
invariant(panelCss.includes('position: absolute;') && panelCss.includes('pointer-events: none;')
  && panelCss.includes('.focus-panel__live-action-label { display: none;'),
  "B49 action rail must be overlaid, not an always-visible second row");
invariant(panelCss.includes('width: calc(100% - 2 * var(--space-3))')
  && panelCss.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr) minmax(0, 1.4fr) minmax(0, 0.85fr) minmax(0, 1fr);'),
  "B49 preserves five stable Focus action hit slots");
invariant(panelCss.includes("@media (prefers-reduced-motion: reduce)"),
  "B49 reveal must honor reduced motion");

const focusedFixture = read("src/focusPanelVisualFixture.tsx");
invariant(focusedFixture.includes('const tooltipDeadline = performance.now() + 2_000;')
  && focusedFixture.includes('document.activeElement === title')
  && focusedFixture.includes('focusedTooltip?.dataset.open !== "true"')
  && focusedFixture.includes('Focused queued title tooltip did not open before containment measurement:'),
  "B49 queued-title geometry must wait for actual keyboard tooltip render, with bounded timeout and strict focus owner");

invariant(focusedFixture.includes("revealDeadline = performance.now() + 1_500")
  && focusedFixture.includes('getComputedStyle(rail).opacity !== "1"')
  && focusedFixture.includes('getComputedStyle(heading).opacity !== "0"'),
  "B49 Edge capture must await the same strict final visual state, not sample transition mid-frame");
const focusedCapture = read("scripts/capture-focus-panel-fixtures.ps1");
const cdpCapture = read("scripts/capture-focus-action-cdp.mjs");
const transientPortReadError = (code) => Object.assign(new Error(`Edge port file ${code}`), { code });
for (const code of ["ENOENT", "EACCES", "EBUSY"]) {
  invariant(isRetryableDevToolsPortReadError(transientPortReadError(code)),
    `B49 transient Edge DevToolsActivePort read ${code} must retry within the existing deadline`);
}
for (const code of ["EISDIR", "EINVAL", "ENOTDIR", "EPERM"]) {
  invariant(!isRetryableDevToolsPortReadError(transientPortReadError(code)),
    `B49 unexpected DevToolsActivePort read ${code} must fail instead of hiding a real fault`);
}
invariant(!isRetryableDevToolsPortReadError(null) && !isRetryableDevToolsPortReadError(new Error("unknown")),
  "B49 untyped/unexpected exceptions must not be swallowed");
invariant(cdpCapture.includes("isRetryableDevToolsPortReadError(error)")
  && cdpCapture.includes("while (Date.now() < deadline)")
  && cdpCapture.includes("await sleep(100)"),
  "B49 actual CDP bootstrap must use the bounded transient-read retry, without changing capture/visual gates");

const paintValidator = read("scripts/focus-png-pixels.mjs");
const focusedValidator = read("scripts/validate-focus-visual-state-captures.mjs");
invariant(focusedCapture.includes('if ($scenario.Name -eq "running" -or $scenario.Name -eq "live-actions-focus" -or $scenario.Name -eq "live-actions-done-focus")')
  && focusedCapture.includes('$mode = if ($scenario.Name -eq "running") { "running" } else { "focused" }')
  && focusedCapture.includes('"--mode=$mode"')
  && cdpCapture.includes('const mode = options.mode ?? "focused"')
  && cdpCapture.includes('mode === "running" ? waitForRunningFixture : waitForFocusedFixture')
  && cdpCapture.includes('const focusLayoutViewport = { width: 492, height: 628 }')
  && cdpCapture.includes('const screenshotClip = { x: 0, y: 0, width: 420, height: 720, scale: 1 }')
  && cdpCapture.includes('observed?.viewport?.[0] === focusLayoutViewport.width && observed?.viewport?.[1] === focusLayoutViewport.height')
  && cdpCapture.includes('...focusLayoutViewport, deviceScaleFactor: 1, mobile: false')
  && cdpCapture.includes('clip: screenshotClip,')
  && cdpCapture.includes('observed?.keyboardMarker === null && observed?.railOpacity === "0"')
  && cdpCapture.includes('observed?.headingOpacity === "1"'),
  "B49 both resting and focused painted rail screenshots must use identical actual CDP viewport and strict state ownership");
const blankPageLaunch = cdpCapture.indexOf('  "about:blank",');
const viewportOverride = cdpCapture.indexOf('await command("Emulation.setDeviceMetricsOverride"');
const foregroundPage = cdpCapture.indexOf('await command("Page.bringToFront")');
const fixtureNavigate = cdpCapture.indexOf('await command("Page.navigate", { url: options.url })');
invariant(blankPageLaunch >= 0 && viewportOverride >= 0
  && foregroundPage > viewportOverride && fixtureNavigate > foregroundPage
  && cdpCapture.includes('entry.url === "about:blank"')
  && cdpCapture.includes('foreground: document.hasFocus()')
  && cdpCapture.includes('observed?.focusOwner && observed?.foreground')
  && !cdpCapture.includes('  options.url,\n], { windowsHide: true, stdio: "ignore" });'),
  "B49 must foreground Edge page after final viewport and before real keyboard/tooltip fixture navigation");
invariant(focusedCapture.includes('Name = "live-actions-focus"; Suffix = "-live-actions-focus"; Query = "&scenario=live-actions-focus"')
  && focusedCapture.includes('scripts/capture-focus-action-cdp.mjs')
  && cdpCapture.includes('await waitForState();')
  && cdpCapture.includes('Page.captureScreenshot')
  && cdpCapture.includes('document.documentElement.outerHTML'),
  "B49 screenshot and focus-ready DOM must come from the same actual Edge CDP page");
invariant(focusedFixture.includes('focusActionPaintRegion:')
  && focusedValidator.includes('differentFocusPixels(')
  && focusedValidator.includes('minimumChanged')
  && paintValidator.includes('inflateSync'),
  "B49 actual decoded action-rail pixels must differ from ordinary running despite HTML contract PASS");

invariant(focusedFixture.includes('"live-actions-focus"')
    && focusedFixture.includes("dataset.focusActionRevealPass"),
  "B49 production keyboard-focus reveal must have a real browser visual fixture");
invariant(focusedCapture.includes('Name = "live-actions-focus"; Suffix = "-live-actions-focus"; Query = "&scenario=live-actions-focus"')
    && focusedValidator.includes('readCapture(theme, "live-actions-focus")')
    && focusedValidator.includes('data-focus-action-reveal-pass="true"'),
  "B49 focused icon actions must be captured and checked in both Windows theme screenshots");

invariant(focusedFixture.includes('"live-actions-done-focus"')
  && focusedFixture.includes('focusDoneEdge ? \'[data-focus-action="done"]\'')
  && focusedFixture.includes('done-pill-escapes-action-rail')
  && focusedCapture.includes('Name = "live-actions-done-focus"; Suffix = "-live-actions-done-focus"; Query = "&scenario=live-actions-done-focus"')
  && focusedValidator.includes('readCapture(theme, "live-actions-done-focus")')
  && focusedValidator.includes("doneChangedPixels"),
  "B49 right-edge Done focus must use the real production action, same-viewport Edge pixels and strict containment");

await import("./test-b49-actual-png-pixels.mjs");
console.log("Focus reserved action-slot and stable hit-target contracts passed.");
