import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus empty-state contract failed: ${message}`);
}

const panel = read("src/FocusPanel.tsx");
const css = read("src/focusPanel.css");
const fixture = read("src/focusPanelVisualFixture.tsx");
const capture = read("scripts/capture-focus-panel-fixtures.ps1");
const validator = read("scripts/validate-focus-visual-state-captures.mjs");
const pkg = JSON.parse(read("package.json"));

invariant(
  panel.includes('const noEligibleVisualState = liveTask === null && remainingTasks.length === 0 && scheduledTasks.length > 0;'),
  "no-eligible state must reuse the validated Remaining/Scheduled partition",
);
invariant(
  panel.includes('const emptyTodayState = liveTask === null && remainingTasks.length === 0 && scheduledTasks.length === 0;'),
  "genuinely empty Today state must require no live, Remaining, or Scheduled work",
);
invariant(
  panel.includes('const emptyStateKind = noEligibleVisualState ? "no-eligible" : emptyTodayState ? "empty" : "none";'),
  "empty-state marker must keep no-eligible and genuinely empty distinct",
);
invariant(panel.includes('data-focus-empty-state={emptyStateKind}'), "empty-state semantic marker is missing");
invariant(panel.includes(">Nothing eligible yet<"), "no-eligible heading is missing");
invariant(
  panel.includes(">Scheduled tasks will be ready when due.<"),
  "no-eligible guidance must explain why visible scheduled work is not active yet",
);
invariant(panel.includes(">All Clear<"), "screenshot-backed empty heading is missing");
invariant(
  panel.includes(">No Today tasks left to focus on.<"),
  "genuinely empty Today guidance is missing",
);
invariant(
  panel.includes(">No live task in this view<"),
  "generic idle copy must remain available when queued work exists but is not live in this view",
);

for (const forbidden of [
  "startTimerTask(",
  "pauseTimer(",
  "resumeTimer(",
  "startManualBreakTimer(",
  "completeTimerTask(",
  "switchTimerTask(",
  "start_blitz",
]) {
  invariant(!panel.includes(forbidden), `empty-state rendering must not become timer/session authority via ${forbidden}`);
}

invariant(css.includes(".focus-panel__empty-state {"), "empty-state content needs a scoped layout rule");
for (const forbidden of ["transform:", "animation:", "position: absolute"]) {
  const emptyRule = css.slice(css.indexOf(".focus-panel__empty-state {"), css.indexOf(".focus-panel__live-heading"));
  invariant(!emptyRule.includes(forbidden), `empty-state styling must not introduce motion/overlay behavior via ${forbidden}`);
}

invariant(fixture.includes('"empty",'), "visual fixture is missing the genuinely empty scenario");
invariant(
  fixture.includes('scenario === "no-eligible" ? [scheduledTask] : scenario === "empty" ? [] : normalTodayTasks'),
  "fixture must distinguish future-scheduled work from genuinely empty Today work",
);
invariant(
  fixture.includes('const noLiveScenario = scenario === "no-eligible" || scenario === "empty";'),
  "empty fixtures must not fabricate a live timer",
);
invariant(
  capture.includes('Name = "empty"; Suffix = "-empty"; Query = "&scenario=empty"; VirtualTimeBudgetMs = 0'),
  "Windows capture harness is missing the empty scenario",
);
invariant(validator.includes('readCapture(theme, "empty")'), "Windows validator must inspect the empty scenario");
invariant(validator.includes('data-focus-empty-state="no-eligible"'), "validator must lock no-eligible semantics");
invariant(validator.includes('data-focus-empty-state="empty"'), "validator must lock genuinely empty semantics");

invariant(
  pkg.scripts["test:ui-focus-empty-states"] === "node scripts/test-ui-focus-empty-states.mjs",
  "package script registration differs",
);
invariant(
  pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-empty-states"),
  "frontend preflight must run the Focus empty-state contract",
);

console.log("Focus empty/no-eligible behavior and scope contracts passed.");
