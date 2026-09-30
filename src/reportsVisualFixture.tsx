import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import {
  ReportsOverviewView,
  type ReportsCalendarMonth,
  type ReportsChartDay,
  type ReportsDoneTask,
  type ReportsListOption,
  type ReportsListTime,
  type ReportsMetric,
} from "./ReportsOverviewView";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "light" ? "light" : "dark";
const requestedMode = params.get("mode");
const mode = ["overview", "list-filter", "date-picker", "lower"].includes(requestedMode ?? "")
  ? requestedMode!
  : "overview";

document.documentElement.dataset.theme = theme;
document.documentElement.dataset.reportsFixtureMode = mode;
document.body.classList.add("visual-fixture-body");

const metrics: ReportsMetric[] = [
  { label: "Total work days", value: "8", detail: "8 active days" },
  { label: "Total tasks done", value: "6", detail: "0.8 avg / active day" },
  { label: "Total time worked", value: "7hr 40min", detail: "58min avg / active day" },
  { label: "Avg. Time per task", value: "1hr 17min", detail: "includes partial tasks" },
];

const chartDays: ReportsChartDay[] = [
  { id: "aug-07", label: "Fri 07, Aug", taskSeconds: 2400, breakSeconds: 600 },
  { id: "aug-08", label: "Sat 08, Aug", taskSeconds: 3900, breakSeconds: 900 },
  { id: "aug-09", label: "Sun 09, Aug", taskSeconds: 1200, breakSeconds: 300 },
  { id: "aug-10", label: "Mon 10, Aug", taskSeconds: 5400, breakSeconds: 1200 },
  { id: "aug-11", label: "Tue 11, Aug", taskSeconds: 3000, breakSeconds: 600 },
  { id: "aug-12", label: "Wed 12, Aug", taskSeconds: 4200, breakSeconds: 900 },
  { id: "aug-13", label: "Thu 13, Aug", taskSeconds: 4800, breakSeconds: 600 },
  { id: "aug-14", label: "Fri 14, Aug", taskSeconds: 2700, breakSeconds: 600 },
];

const listOptions: ReportsListOption[] = [
  { id: null, title: "All Lists", color: "#48d6c5" },
  { id: "job-preparation", title: "Job Preparation", color: "#b7d96d" },
  { id: "rearrange", title: "ReArrange", color: "#48d6c5" },
  { id: "study", title: "STUDY", color: "#83a6ff" },
];

const timeByList: ReportsListTime[] = [
  { id: "job-preparation", title: "Job Preparation", color: "#b7d96d", seconds: 13200 },
  { id: "rearrange", title: "ReArrange", color: "#48d6c5", seconds: 8400 },
  { id: "study", title: "STUDY", color: "#83a6ff", seconds: 6000 },
];

const doneTasks: ReportsDoneTask[] = [
  {
    id: "done-1",
    title: "Prepare interview notes",
    listTitle: "Job Preparation",
    completionLabel: "Aug 12, 2026",
    timeTakenLabel: "1hr 05min",
    punctuality: "early",
    varianceLabel: "10min early",
  },
  {
    id: "done-2",
    title: "Refactor local archive flow",
    listTitle: "ReArrange",
    completionLabel: "Aug 13, 2026",
    timeTakenLabel: "1hr 30min",
    punctuality: "late",
    varianceLabel: "15min late",
  },
  {
    id: "done-3",
    title: "Review study plan",
    listTitle: "STUDY",
    completionLabel: "Aug 14, 2026",
    timeTakenLabel: "45min",
    punctuality: "none",
  },
];

type CalendarCellTuple = [
  key: string,
  label: string,
  muted?: boolean,
  selected?: boolean,
  edge?: "start" | "end",
];

function calendarMonth(
  label: string,
  values: CalendarCellTuple[],
): ReportsCalendarMonth {
  const cells = values.map(([key, dayLabel, muted = false, selected = false, edge]) => ({
    key,
    label: dayLabel,
    muted,
    selected,
    edge,
  }));
  const weeks: ReportsCalendarMonth["weeks"] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return { label, weeks };
}

const august = calendarMonth("Aug 2026", [
  ["jul-26", "26", true], ["jul-27", "27", true], ["jul-28", "28", true], ["jul-29", "29", true], ["jul-30", "30", true], ["jul-31", "31", true], ["aug-01", "1"],
  ["aug-02", "2"], ["aug-03", "3"], ["aug-04", "4"], ["aug-05", "5"], ["aug-06", "6"], ["aug-07", "7", false, true, "start"], ["aug-08", "8", false, true],
  ["aug-09", "9", false, true], ["aug-10", "10", false, true], ["aug-11", "11", false, true], ["aug-12", "12", false, true], ["aug-13", "13", false, true], ["aug-14", "14", false, true, "end"], ["aug-15", "15"],
  ["aug-16", "16"], ["aug-17", "17"], ["aug-18", "18"], ["aug-19", "19"], ["aug-20", "20"], ["aug-21", "21"], ["aug-22", "22"],
  ["aug-23", "23"], ["aug-24", "24"], ["aug-25", "25"], ["aug-26", "26"], ["aug-27", "27"], ["aug-28", "28"], ["aug-29", "29"],
  ["aug-30", "30"], ["aug-31", "31"], ["sep-01-prev", "1", true], ["sep-02-prev", "2", true], ["sep-03-prev", "3", true], ["sep-04-prev", "4", true], ["sep-05-prev", "5", true],
]);

const september = calendarMonth("Sep 2026", [
  ["aug-30-next", "30", true], ["aug-31-next", "31", true], ["sep-01", "1"], ["sep-02", "2"], ["sep-03", "3"], ["sep-04", "4"], ["sep-05", "5"],
  ["sep-06", "6"], ["sep-07", "7"], ["sep-08", "8"], ["sep-09", "9"], ["sep-10", "10"], ["sep-11", "11"], ["sep-12", "12"],
  ["sep-13", "13"], ["sep-14", "14"], ["sep-15", "15"], ["sep-16", "16"], ["sep-17", "17"], ["sep-18", "18"], ["sep-19", "19"],
  ["sep-20", "20"], ["sep-21", "21"], ["sep-22", "22"], ["sep-23", "23"], ["sep-24", "24"], ["sep-25", "25"], ["sep-26", "26"],
  ["sep-27", "27"], ["sep-28", "28"], ["sep-29", "29"], ["sep-30", "30"], ["oct-01", "1", true], ["oct-02", "2", true], ["oct-03", "3", true],
  ["oct-04", "4", true], ["oct-05", "5", true], ["oct-06", "6", true], ["oct-07", "7", true], ["oct-08", "8", true], ["oct-09", "9", true], ["oct-10", "10", true],
]);

const root = document.getElementById("root");
if (!root) throw new Error("Reports fixture root is missing.");

flushSync(() => {
  createRoot(root).render(
    <ReportsOverviewView
      metrics={metrics}
      chartDays={chartDays}
      productive={{ hour: "10 AM", day: "Thursday", month: "August" }}
      timeByList={timeByList}
      doneTasks={doneTasks}
      listLabel="All Lists"
      listOptions={listOptions}
      rangeLabel="Aug 07, 2026  –  Aug 14, 2026"
      calendarMonths={[august, september]}
      listFilterOpen={mode === "list-filter"}
      datePickerOpen={mode === "date-picker"}
      tooltipDayId={mode === "overview" || mode === "list-filter" ? "aug-10" : null}
    />,
  );
});

const markReady = () => {
  document.documentElement.dataset.reportsFixtureReady = "true";
};

if (mode === "lower") {
  window.requestAnimationFrame(() => {
    document.querySelector(".reports-overview__productive-grid")?.scrollIntoView({ block: "start" });
    window.requestAnimationFrame(markReady);
  });
} else {
  window.requestAnimationFrame(markReady);
}
