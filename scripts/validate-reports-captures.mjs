import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const output = path.join(root, "artifacts", "visual-regression");

function invariant(condition, message) {
  if (!condition) throw new Error("Reports captured visual validation failed: " + message);
}

function readDom(label) {
  const file = path.join(output, label + ".html");
  invariant(fs.existsSync(file), label + " captured DOM is missing");
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

function validatePng(label) {
  const file = path.join(output, label + ".png");
  invariant(fs.existsSync(file), label + " screenshot is missing");
  const png = fs.readFileSync(file);
  invariant(png.length > 10_000, label + " screenshot is unexpectedly small");
  invariant(
    png.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    label + " is not a PNG",
  );
  invariant(
    png.readUInt32BE(16) === 1280 && png.readUInt32BE(20) === 720,
    label + " capture must remain 1280x720",
  );
}

function common(dom, label) {
  invariant(dom.includes('data-reports-overview="true"'), label + " Reports Overview surface is missing");
  invariant(dom.includes(">Reports<"), label + " Reports title is missing");
  invariant(dom.includes('role="tablist"'), label + " Reports tablist is missing");
  invariant(dom.includes(">Overview<"), label + " Overview tab is missing");
  invariant(dom.includes("Sessions"), label + " Sessions tab is missing");
  invariant(dom.includes("Export PDF"), label + " Overview PDF action is missing");
  invariant(dom.includes('data-report-list-filter="true"'), label + " list filter is missing");
  invariant(dom.includes('data-report-date-range="true"'), label + " date-range control is missing");
  invariant((dom.match(/class="reports-overview__metric"/g) ?? []).length === 4, label + " must render four summary metric cards");
  invariant(dom.includes("Total work days"), label + " work-days metric is missing");
  invariant(dom.includes("Total tasks done"), label + " tasks-done metric is missing");
  invariant(dom.includes("Total time worked"), label + " total-time metric is missing");
  invariant(dom.includes("Avg. Time per task"), label + " average-task metric is missing");
  invariant(dom.includes('aria-label="Daily Tasks, Breaks and Total session time"'), label + " accessible productivity chart is missing");
  invariant((dom.match(/data-report-chart-day=/g) ?? []).length === 8, label + " must render eight deterministic chart days");
  invariant(dom.includes("Most Productive hour"), label + " productive-hour card is missing");
  invariant(dom.includes("Most Productive day"), label + " productive-day card is missing");
  invariant(dom.includes("Most Productive month"), label + " productive-month card is missing");
  invariant(dom.includes("Time By List"), label + " Time By List panel is missing");
  invariant(dom.includes("Done Tasks"), label + " Done Tasks panel is missing");
  invariant(!dom.includes("Upgrade Now"), label + " must not reproduce excluded account/upgrade controls");
}

function sessionsCommon(dom, label) {
  invariant(dom.includes('data-reports-sessions="true"'), label + " Sessions surface is missing");
  invariant(dom.includes(">Reports<"), label + " Reports title is missing");
  invariant(dom.includes('role="tablist"'), label + " Reports tablist is missing");
  invariant(dom.includes(">Overview<"), label + " Overview tab is missing");
  invariant(dom.includes("Sessions"), label + " Sessions tab is missing");
  invariant(dom.includes("Beta"), label + " Sessions Beta badge is missing");
  invariant(dom.includes("+ Add Session"), label + " Add Session action is missing");
  invariant(dom.includes("Export .csv"), label + " current CSV export label is missing");
  invariant(dom.includes("Hide Break sessions"), label + " break visibility filter is missing");
  invariant(dom.includes('data-report-session-list-filter="true"'), label + " Sessions list filter is missing");
  invariant(dom.includes('data-report-session-date-range="true"'), label + " Sessions date range is missing");
  invariant(dom.includes("Total Time"), label + " Total Time summary is missing");
  invariant(dom.includes("Total Tasks"), label + " Total Tasks summary is missing");
  invariant(dom.includes("Total Sessions"), label + " Total Sessions summary is missing");
  invariant(!dom.includes("Upgrade Now"), label + " must not reproduce excluded account/upgrade controls");
}

for (const theme of ["light", "dark"]) {
  for (const mode of ["overview", "list-filter", "date-picker", "series-toggle", "lower"]) {
    const label = "reports-" + mode + "-" + theme;
    validatePng(label);
    const dom = readDom(label);
    common(dom, label);
    invariant(dom.includes('data-reports-fixture-mode="' + mode + '"'), label + " fixture mode marker differs");

    if (mode === "overview") {
      invariant(dom.includes('data-report-chart-tooltip="true"'), label + " chart tooltip is missing");
      invariant(dom.includes('role="tooltip"'), label + " chart tooltip semantics are missing");
      invariant(dom.includes("TASKS:"), label + " chart tooltip task value is missing");
      invariant(dom.includes("BREAKS:"), label + " chart tooltip break value is missing");
      invariant(dom.includes("TOTAL:"), label + " chart tooltip total value is missing");
    }

    if (mode === "list-filter") {
      invariant(dom.includes('data-report-list-menu="true"'), label + " list filter menu is missing");
      invariant(dom.includes('role="listbox"'), label + " list filter listbox semantics are missing");
      invariant(dom.includes('aria-multiselectable="true"'), label + " list filter must remain multi-select");
      invariant(dom.includes('role="option" aria-selected="true"'), label + " All Lists selected state is missing");
      for (const option of ["All Lists", "Job Preparation", "ReArrange", "STUDY"]) {
        invariant(dom.includes(option), label + " list filter option is missing: " + option);
      }
    }

    if (mode === "series-toggle") {
      invariant(dom.includes('aria-pressed="false"'), label + " hidden Total legend state is missing");
      invariant(dom.includes('data-visible-series-count="2"'), label + " chart must reflow to two visible series");
    }

    if (mode === "date-picker") {
      invariant(dom.includes('data-report-date-picker="true"'), label + " date picker is missing");
      invariant(dom.includes('aria-label="Choose report date range"'), label + " date picker dialog label is missing");
      for (const preset of ["Today", "Yesterday", "This week", "Last 30 days", "Last 60 days", "Last 90 days"]) {
        invariant(dom.includes(preset), label + " date preset is missing: " + preset);
      }
      invariant(dom.includes("Aug 2026"), label + " first calendar month is missing");
      invariant(dom.includes("Sep 2026"), label + " second calendar month is missing");
      invariant(dom.includes(">Cancel<"), label + " date picker Cancel action is missing");
      invariant(dom.includes(">Apply<"), label + " date picker Apply action is missing");
    }

    if (mode === "lower") {
      invariant(dom.includes('data-report-lower-panels="true"'), label + " lower panel region is missing");
      invariant(dom.includes('data-reports-lower-viewport-ready="true"'), label + " lower panels were not fully visible in the capture viewport");
      invariant(dom.includes('data-report-list-donut="true"'), label + " populated Time By List donut is missing");
      invariant(dom.includes('data-report-done-group="true"'), label + " Done Tasks date grouping is missing");
      invariant(dom.includes("67.25%"), label + " punctuality percentage is missing");
      invariant(dom.includes("Prepare interview notes"), label + " representative Done row is missing");
      invariant(dom.includes("Time Taken"), label + " Done row Time Taken is missing");
      invariant(dom.includes("10min early"), label + " early completion state is missing");
      invariant(dom.includes("15min late"), label + " late completion state is missing");
    }
  }
}


for (const theme of ["light", "dark"]) {
  for (const mode of ["sessions-empty", "sessions-populated", "sessions-detail", "sessions-add", "sessions-add-keyboard", "sessions-detail-keyboard"]) {
    const label = "reports-" + mode + "-" + theme;
    validatePng(label);
    const dom = readDom(label);
    invariant(dom.includes('data-reports-fixture-mode="' + mode + '"'), label + " fixture mode marker differs");
    if (mode === "sessions-detail-keyboard") {
      invariant(dom.includes('data-reports-detail-keyboard-pass="true"'),
        label + " detail-to-Add, pending, Escape, Tab and focus ownership regression did not pass");
      invariant(!dom.includes('data-report-session-detail-dialog="true"'),
        label + " detail Escape did not dismiss its dialog");
      continue;
    }
    if (mode === "sessions-add-keyboard") {
      invariant(dom.includes('data-reports-add-keyboard-pass="true"'), label + " keyboard modal regression did not pass");
      invariant(dom.includes('data-reports-add-initial-focus="true"'), label + " initial focus regression did not pass");
      invariant(dom.includes('data-reports-add-tab-contained="true"'), label + " Tab containment regression did not pass");
      invariant(dom.includes('data-reports-add-escape-dismissed="true"'), label + " Escape dismissal regression did not pass");
      invariant(dom.includes('data-reports-add-focus-restored="true"'), label + " focus restoration regression did not pass");
      invariant(dom.includes('data-reports-add-pending-guard="true"'), label + " pending dismissal/containment regression did not pass");
      continue;
    }
    sessionsCommon(dom, label);

    if (mode === "sessions-empty") {
      invariant(dom.includes(">0min<"), label + " empty Total Time state is missing");
      invariant(dom.includes(">2<"), label + " empty-range task summary is missing");
      invariant(!dom.includes('data-report-session-row='), label + " empty Sessions state must not invent rows");
    }

    if (mode === "sessions-populated") {
      invariant(dom.includes("Project roadmap video"), label + " representative task row is missing");
      invariant(dom.includes("Email newsletter"), label + " repeated task row is missing");
      invariant(dom.includes("Session 04"), label + " task-relative ordinal is missing");
      invariant(dom.includes(">Break<"), label + " break row treatment is missing");
      invariant(dom.includes("17hr 22min"), label + " populated summary is missing");
      invariant(dom.includes('data-session-kind="break"'), label + " visible break row is missing");
    }

    if (mode === "sessions-detail") {
      invariant(dom.includes('data-report-session-detail="true"'), label + " task-detail modal is missing");
      invariant(dom.includes("3 Sessions"), label + " task-detail aggregate count is missing");
      invariant(dom.includes("2hr 13min"), label + " task-detail aggregate time is missing");
      invariant(dom.includes('aria-label="Save session end time"'), label + " inline edit green-check commit is missing");
      invariant(dom.includes('type="time"'), label + " inline time editor is missing");
    }

    if (mode === "sessions-add") {
      invariant(dom.includes('data-report-add-session="true"'), label + " Add Session dialog is missing");
      invariant(dom.includes('data-report-task-picker-open="true"'), label + " conditional Recent Tasks popover did not open");
      invariant(dom.includes('placeholder="Select tasks..."'), label + " Add Session task search is missing");
      invariant(dom.includes(">Recent Tasks<"), label + " Recent Tasks group is missing");
      invariant(dom.includes("Project roadmap video"), label + " representative Recent Task is missing");
      invariant(dom.includes("Finding30LongUnbrokenTaskTitleABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), label + " long-title overflow fixture is missing");
      invariant(dom.includes('data-reports-task-picker-bounded="true"'), label + " Recent Tasks picker is not horizontally bounded");
    }
  }
}

console.log("Reports Overview + Sessions captured visual contracts: PASS");
