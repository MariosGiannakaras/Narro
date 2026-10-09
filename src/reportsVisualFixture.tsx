import { useEffect, useRef, useState } from "react";
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
import {
  ReportAddSessionDialog,
  ReportTaskSessionsDialog,
  focusableDialogElements,
  ReportsSessionsView,
  type ReportsSessionViewRow,
  type ReportsTaskDetailView,
} from "./ReportsSessionsView";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "light" ? "light" : "dark";
const requestedMode = params.get("mode");
const mode = [
  "overview",
  "list-filter",
  "date-picker",
  "series-toggle",
  "lower",
  "sessions-empty",
  "sessions-populated",
  "sessions-detail",
  "sessions-add",
  "sessions-add-keyboard",
  "sessions-detail-keyboard",
].includes(requestedMode ?? "")
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

const sessionRows: ReportsSessionViewRow[] = [
  {
    id: "session-04",
    taskId: "task-roadmap",
    taskTitle: "Project roadmap video",
    listTitle: "Content",
    listColor: "#d986ff",
    kind: "work",
    ordinalLabel: "Session 04",
    dateKey: "2025-12-04",
    dateLabel: "Dec 04, 2025",
    startLabel: "3:54 PM",
    endLabel: "5:54 PM",
    endTimeValue: "17:54",
    durationLabel: "2hr",
    updatedAt: "2025-12-04T17:54:00Z",
  },
  {
    id: "session-03",
    taskId: "task-email",
    taskTitle: "Email newsletter",
    listTitle: "Blitzit",
    listColor: "#48d6c5",
    kind: "work",
    ordinalLabel: "Session 03",
    dateKey: "2025-12-04",
    dateLabel: "Dec 04, 2025",
    startLabel: "12:39 PM",
    endLabel: "2:51 PM",
    endTimeValue: "14:51",
    durationLabel: "2hr 11min",
    updatedAt: "2025-12-04T14:51:00Z",
    initiallyEditing: mode === "sessions-detail",
  },
  {
    id: "session-break",
    taskId: "task-email",
    taskTitle: "Break",
    listTitle: "Blitzit",
    listColor: "#48d6c5",
    kind: "break",
    ordinalLabel: null,
    dateKey: "2025-12-04",
    dateLabel: "Dec 04, 2025",
    startLabel: "12:20 PM",
    endLabel: "12:30 PM",
    endTimeValue: "12:30",
    durationLabel: "10min",
    updatedAt: "2025-12-04T12:30:00Z",
  },
  {
    id: "session-02",
    taskId: "task-email",
    taskTitle: "Email newsletter",
    listTitle: "Blitzit",
    listColor: "#48d6c5",
    kind: "work",
    ordinalLabel: "Session 02",
    dateKey: "2025-11-02",
    dateLabel: "Nov 02, 2025",
    startLabel: "7:19 PM",
    endLabel: "7:20 PM",
    endTimeValue: "19:20",
    durationLabel: "0min",
    updatedAt: "2025-11-02T19:20:00Z",
  },
];

const taskDetail: ReportsTaskDetailView = {
  taskId: "task-email",
  taskTitle: "Email newsletter",
  listTitle: "Blitzit",
  listColor: "#48d6c5",
  totalTime: "2hr 13min",
  totalSessions: "3",
  rows: [
    sessionRows[1],
    sessionRows[3],
    {
      ...sessionRows[3],
      id: "session-01",
      ordinalLabel: "Session 01",
      startLabel: "7:15 PM",
      endLabel: "7:16 PM",
      endTimeValue: "19:16",
      durationLabel: "1min",
      updatedAt: "2025-11-02T19:16:00Z",
      initiallyEditing: false,
    },
  ],
};

const addTasks = [
  {
    id: "task-finding30-long",
    listId: "work",
    listTitle: "Work",
    listColor: "#55c2d0",
    title: "Finding30LongUnbrokenTaskTitleABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    lane: "Today" as const,
  },
  { id: "task-roadmap", listId: "content", listTitle: "Content", listColor: "#8cdd6b", title: "Project roadmap video", lane: "Today" as const },
  { id: "task-report", listId: "work", listTitle: "Work", title: "Prepare weekly report", lane: "This Week" as const },
  { id: "task-ugc", listId: "content", listTitle: "Content", title: "Launch UGC campaign", lane: "Backlog" as const },
  { id: "task-car", listId: "personal", listTitle: "Personal", title: "Repair car", lane: "Today" as const },
  { id: "task-gift", listId: "personal", listTitle: "Personal", title: "Order a gift for Alex", lane: "Backlog" as const },
];

const addDraft = {
  taskId: "",
  dateKey: "2025-12-04",
  startTime: "15:54",
  endTime: "17:54",
  durationLabel: "2hr",
};

function ReportsAddSessionKeyboardFixture() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    triggerRef.current?.focus();
    setOpen(true);
  }, []);

  return (
    <>
      <button ref={triggerRef} type="button" data-report-add-keyboard-trigger="true" onClick={() => setOpen(true)}>
        + Add Session
      </button>
      <button
        type="button"
        hidden
        aria-pressed={pending}
        data-report-add-keyboard-pending="true"
        onClick={() => setPending((value) => !value)}
      >
        Toggle pending fixture
      </button>
      {open ? (
        <ReportAddSessionDialog
          tasks={addTasks}
          draft={addDraft}
          pending={pending}
          error={null}
          onDraftChange={() => undefined}
          onClose={() => setOpen(false)}
          onCommit={() => undefined}
        />
      ) : null}
    </>
  );
}


function ReportsDetailKeyboardFixture() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    triggerRef.current?.focus();
    setDetailOpen(true);
  }, []);

  return (
    <>
      <button ref={triggerRef} type="button" data-report-detail-keyboard-trigger="true"
        onClick={() => setDetailOpen(true)}>Open task session detail</button>
      <button hidden type="button" aria-pressed={pending} data-report-detail-keyboard-pending="true"
        onClick={() => setPending((previous) => !previous)}>Toggle pending</button>
      {detailOpen && !addOpen ? (
        <ReportTaskSessionsDialog
          detail={taskDetail}
          returnFocusTarget={triggerRef.current}
          pendingSessionId={pending ? "session-01" : null}
          onClose={() => setDetailOpen(false)}
          onAddSession={() => setAddOpen(true)}
          onCommitEndTime={async () => true}
          onDelete={() => undefined}
        />
      ) : null}
      {addOpen ? (
        <ReportAddSessionDialog
          tasks={[...addTasks, {
            id: "task-email", listId: "blitzit", listTitle: "Blitzit",
            listColor: "#48d6c5", title: "Email newsletter", lane: "Today" as const,
          }]}
          draft={{ ...addDraft, taskId: "task-email" }}
          pending={false}
          error={null}
          onDraftChange={() => undefined}
          onClose={() => setAddOpen(false)}
          onCommit={() => setAddOpen(false)}
        />
      ) : null}
    </>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Reports fixture root is missing.");

flushSync(() => {
  const sessionMode = mode.startsWith("sessions-");
  createRoot(root).render(
    mode === "sessions-detail-keyboard" ? (
      <ReportsDetailKeyboardFixture />
    ) : mode === "sessions-add-keyboard" ? (
      <ReportsAddSessionKeyboardFixture />
    ) : sessionMode ? (
      <>
        <ReportsSessionsView
          summary={mode === "sessions-empty"
            ? { totalTime: "0min", totalTasks: "2", totalSessions: "0" }
            : { totalTime: "17hr 22min", totalTasks: "39", totalSessions: "23" }}
          groups={mode === "sessions-empty" ? [] : [
            { dateKey: "2025-12-04", label: "Dec 04, 2025", rows: sessionRows.slice(0, 3) },
            { dateKey: "2025-11-02", label: "Nov 02, 2025", rows: sessionRows.slice(3) },
          ]}
          listLabel="All Lists"
          selectedListIds={[]}
          listOptions={listOptions}
          rangeLabel="Nov 27, 2025 – Dec 04, 2025"
          calendarMonths={[august, september]}
          showBreakSessions
          listFilterOpen={false}
          datePickerOpen={false}
          pendingSessionId={null}
          onOpenOverview={() => undefined}
          onOpenAddSession={() => undefined}
          onToggleBreakSessions={() => undefined}
          onToggleListFilter={() => undefined}
          onToggleListSelection={() => undefined}
          onToggleDatePicker={() => undefined}
          onSelectDatePreset={() => undefined}
          onSelectCalendarDay={() => undefined}
          onPreviousCalendarMonth={() => undefined}
          onNextCalendarMonth={() => undefined}
          onCancelDateRange={() => undefined}
          onApplyDateRange={() => undefined}
          onCommitEndTime={async () => true}
          onOpenDetail={() => undefined}
          onDelete={() => undefined}
        />
        {mode === "sessions-detail" ? (
          <ReportTaskSessionsDialog
            detail={taskDetail}
            pendingSessionId={null}
            onClose={() => undefined}
            onAddSession={() => undefined}
            onCommitEndTime={async () => true}
            onDelete={() => undefined}
          />
        ) : null}
        {mode === "sessions-add" ? (
          <ReportAddSessionDialog
            tasks={addTasks}
            draft={addDraft}
            pending={false}
            error={null}
            onDraftChange={() => undefined}
            onClose={() => undefined}
            onCommit={() => undefined}
          />
        ) : null}
      </>
    ) : (
      <ReportsOverviewView
        metrics={metrics}
        chartDays={chartDays}
        productive={{ hour: "10 AM", day: "Thursday", month: "August" }}
        timeByList={timeByList}
        doneTasks={doneTasks}
        listLabel="All Lists"
        selectedListIds={[]}
        listOptions={listOptions}
        rangeLabel="Aug 07, 2026  –  Aug 14, 2026"
        calendarMonths={[august, september]}
        listFilterOpen={mode === "list-filter"}
        datePickerOpen={mode === "date-picker"}
        tooltipDayId={mode === "overview" || mode === "list-filter" ? "aug-10" : null}
        visibleSeries={{ tasks: true, breaks: true, total: mode !== "series-toggle" }}
        punctuality={{ earlyPercent: 67.25, latePercent: 32.75 }}
      />
    ),
  );
});

const markReady = () => {
  document.documentElement.dataset.reportsFixtureReady = "true";
};

const wait = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
const requireFixture = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

async function waitForElement<T extends HTMLElement>(selector: string, present = true): Promise<T | null> {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const element = document.querySelector<T>(selector);
    if (present ? Boolean(element) : !element) return element;
    await wait(25);
  }
  throw new Error(`Timed out waiting for Reports fixture selector ${selector} present=${present}`);
}

function dispatchFixtureKey(target: HTMLElement, key: string, shiftKey = false) {
  target.dispatchEvent(new KeyboardEvent("keydown", {
    key,
    shiftKey,
    bubbles: true,
    cancelable: true,
  }));
}

async function validateAddSessionKeyboardFixture() {
  const dialog = await waitForElement<HTMLElement>(".reports-sessions__add-dialog");
  requireFixture(dialog, "Add Session keyboard fixture did not open.");
  await wait(30);

  const pickerTrigger = dialog!.querySelector<HTMLButtonElement>('[data-report-task-selector-trigger="true"]');
  requireFixture(document.activeElement === pickerTrigger, "Add Session did not move initial focus to the collapsed task selector.");
  document.documentElement.dataset.reportsAddInitialFocus = "true";
  pickerTrigger!.click();
  await wait(30);
  const search = dialog!.querySelector<HTMLInputElement>('input[type="search"]');
  requireFixture(document.activeElement === search, "Opening the Add Session task picker did not focus its search.");
  requireFixture(pickerTrigger!.getAttribute("aria-expanded") === "true", "Add Session task picker did not disclose.");
  dispatchFixtureKey(search!, "Escape");
  await wait(30);
  requireFixture(document.querySelector(".reports-sessions__add-dialog"), "Picker Escape dismissed the whole Add Session modal.");
  requireFixture(document.activeElement === pickerTrigger, "Picker Escape did not restore trigger focus.");
  requireFixture(pickerTrigger!.getAttribute("aria-expanded") === "false", "Picker Escape did not close the list.");

  const focusable = Array.from(dialog!.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.hasAttribute("hidden"));
  requireFixture(focusable.length >= 3, "Add Session keyboard fixture needs multiple focusable controls.");
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  last.focus();
  dispatchFixtureKey(last, "Tab");
  requireFixture(document.activeElement === first, "Add Session Tab escaped instead of wrapping to first control.");

  first.focus();
  dispatchFixtureKey(first, "Tab", true);
  requireFixture(document.activeElement === last, "Add Session Shift+Tab escaped instead of wrapping to last control.");
  document.documentElement.dataset.reportsAddTabContained = "true";

  dispatchFixtureKey(last, "Escape");
  await waitForElement(".reports-sessions__add-dialog", false);
  await wait(30);
  const trigger = document.querySelector<HTMLButtonElement>('[data-report-add-keyboard-trigger="true"]');
  requireFixture(document.activeElement === trigger, "Add Session dismissal did not restore opener focus.");
  document.documentElement.dataset.reportsAddEscapeDismissed = "true";
  document.documentElement.dataset.reportsAddFocusRestored = "true";

  const pendingToggle = document.querySelector<HTMLButtonElement>('[data-report-add-keyboard-pending="true"]');
  requireFixture(trigger && pendingToggle, "Add Session keyboard fixture controls are missing.");
  pendingToggle!.click();
  for (let attempt = 0; attempt < 20 && pendingToggle!.getAttribute("aria-pressed") !== "true"; attempt += 1) {
    await wait(10);
  }
  requireFixture(pendingToggle!.getAttribute("aria-pressed") === "true", "Pending fixture state did not settle.");

  trigger!.focus();
  trigger!.click();
  const pendingDialog = await waitForElement<HTMLElement>(".reports-sessions__add-dialog");
  requireFixture(pendingDialog, "Pending Add Session fixture did not reopen.");
  await wait(30);
  requireFixture(document.activeElement === pendingDialog, "Pending Add Session did not move focus to its dialog shell.");
  dispatchFixtureKey(pendingDialog!, "Escape");
  await wait(30);
  requireFixture(document.querySelector(".reports-sessions__add-dialog"), "Pending Escape dismissed Add Session.");

  dispatchFixtureKey(pendingDialog!, "Tab");
  requireFixture(document.activeElement === pendingDialog, "Pending Add Session allowed Tab to escape with all controls disabled.");

  pendingToggle!.click();
  for (let attempt = 0; attempt < 20 && pendingToggle!.getAttribute("aria-pressed") !== "false"; attempt += 1) {
    await wait(10);
  }
  requireFixture(pendingToggle!.getAttribute("aria-pressed") === "false", "Pending fixture did not return to interactive state.");
  await wait(30);
  requireFixture(document.activeElement === pendingDialog, "Add Session unexpectedly moved focus after pending settled.");
  const restoredFocusable = Array.from(pendingDialog!.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.hasAttribute("hidden"));
  requireFixture(restoredFocusable.length >= 3, "Restored Add Session needs multiple focusable controls.");
  const restoredLast = restoredFocusable[restoredFocusable.length - 1];
  dispatchFixtureKey(pendingDialog!, "Tab", true);
  requireFixture(
    document.activeElement === restoredLast,
    "Add Session Shift+Tab escaped after pending focus returned to the dialog shell.",
  );

  document.documentElement.dataset.reportsAddPendingGuard = "true";
  document.documentElement.dataset.reportsAddKeyboardPass = "true";
}

async function validateDetailSessionKeyboardFixture() {
  let detail = await waitForElement<HTMLElement>('[data-report-session-detail-dialog="true"]');
  requireFixture(detail, "Task detail keyboard fixture did not open.");
  await wait(30);
  let close = detail!.querySelector<HTMLButtonElement>('button[aria-label="Close task session detail"]');
  let add = detail!.querySelector<HTMLButtonElement>(".reports-sessions__detail-actions button");
  requireFixture(close && add, "Detail keyboard controls are missing.");
  requireFixture(document.activeElement === close, "Task detail initial focus did not reach its Close control.");

  const focusable = focusableDialogElements(detail!);
  requireFixture(focusable.length >= 3, "Detail needs multiple focusable controls.");
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  last.focus();
  requireFixture(document.activeElement === last, "Last detail tab stop could not receive actual focus.");
  dispatchFixtureKey(last, "Tab");
  requireFixture(document.activeElement === first, "Detail Tab escaped the active modal.");
  first.focus();
  dispatchFixtureKey(first, "Tab", true);
  requireFixture(document.activeElement === last, "Detail Shift+Tab escaped the active modal.");

  add!.click();
  const nested = await waitForElement<HTMLElement>(".reports-sessions__add-dialog");
  requireFixture(nested, "Detail to Add Session transfer did not open.");
  requireFixture(!document.querySelector('[data-report-session-detail-dialog="true"]'),
    "Detail remained mounted as a second aria-modal during Add Session.");
  requireFixture(document.querySelectorAll('[aria-modal="true"]').length === 1,
    "Add Session transfer has competing modal owners.");
  await wait(30);
  requireFixture(document.activeElement === nested!.querySelector('[data-report-task-selector-trigger="true"]'),
    "Transferred Add Session did not take focus.");

  const cancel = nested!.querySelector<HTMLButtonElement>("footer button");
  requireFixture(cancel, "Add Session Cancel control is missing.");
  cancel!.click();
  detail = await waitForElement<HTMLElement>('[data-report-session-detail-dialog="true"]');
  await wait(30);
  close = detail!.querySelector<HTMLButtonElement>('button[aria-label="Close task session detail"]');
  add = detail!.querySelector<HTMLButtonElement>(".reports-sessions__detail-actions button");
  requireFixture(document.querySelectorAll('[aria-modal="true"]').length === 1,
    "Detail was not restored as the sole owner after Add Session Cancel.");
  requireFixture(document.activeElement === close, "Detail did not reacquire focus after nested Cancel.");

  add!.click();
  const commitDialog = await waitForElement<HTMLElement>(".reports-sessions__add-dialog");
  requireFixture(document.querySelectorAll('[aria-modal="true"]').length === 1,
    "Detail and Add Session overlapped during commit path.");
  const commit = commitDialog!.querySelector<HTMLButtonElement>("footer .reports-sessions__primary");
  requireFixture(commit && !commit.disabled, "Preselected Add Session is not commit-ready.");
  commit!.click();
  detail = await waitForElement<HTMLElement>('[data-report-session-detail-dialog="true"]');
  await wait(30);
  requireFixture(document.querySelectorAll('[aria-modal="true"]').length === 1,
    "Detail was not restored as the sole owner after Add Session Commit.");

  const pendingToggle = document.querySelector<HTMLButtonElement>('[data-report-detail-keyboard-pending="true"]');
  requireFixture(pendingToggle, "Detail pending fixture control is missing.");
  pendingToggle!.click();
  await wait(30);
  close = detail!.querySelector<HTMLButtonElement>('button[aria-label="Close task session detail"]');
  add = detail!.querySelector<HTMLButtonElement>(".reports-sessions__detail-actions button");
  requireFixture(close?.disabled && add?.disabled, "Pending detail allowed Close/Add Session mutation overlap.");
  requireFixture(document.activeElement === detail, "Pending detail did not place focus on its shell.");
  dispatchFixtureKey(detail!, "Escape");
  await wait(30);
  requireFixture(document.querySelector('[data-report-session-detail-dialog="true"]'),
    "Pending Escape dismissed task detail.");
  pendingToggle!.click();
  await wait(30);
  requireFixture(close && !close.disabled, "Detail remained disabled after pending ended.");

  dispatchFixtureKey(detail!, "Escape");
  await waitForElement('[data-report-session-detail-dialog="true"]', false);
  await wait(30);
  const trigger = document.querySelector<HTMLButtonElement>('[data-report-detail-keyboard-trigger="true"]');
  requireFixture(document.activeElement === trigger, "Task detail dismissal did not restore opener focus.");

  // Keep the modal visible for the screenshot *after* exercising close/focus
  // restoration. A completed keyboard test alone used to capture a blank page.
  trigger!.click();
  const visuallyOpen = await waitForElement<HTMLElement>('[data-report-session-detail-dialog="true"]');
  requireFixture(visuallyOpen, "Detail keyboard screenshot has no reopened dialog.");
  await wait(30);
  const visualClose = visuallyOpen!.querySelector<HTMLButtonElement>('button[aria-label="Close task session detail"]');
  requireFixture(document.activeElement === visualClose, "Reopened detail did not acquire initial focus.");
  requireFixture(document.querySelectorAll('[aria-modal="true"]').length === 1,
    "Reopened detail screenshot has competing modal owners.");
  document.documentElement.dataset.reportsDetailKeyboardVisualReady = "true";
  document.documentElement.dataset.reportsDetailKeyboardPass = "true";
}

if (mode === "sessions-detail-keyboard") {
  void validateDetailSessionKeyboardFixture()
    .then(markReady)
    .catch((error: unknown) => {
      document.documentElement.dataset.reportsFixtureError = error instanceof Error ? error.message : String(error);
      throw error;
    });
} else if (mode === "sessions-add-keyboard") {
  void validateAddSessionKeyboardFixture()
    .then(markReady)
    .catch((error: unknown) => {
      document.documentElement.dataset.reportsFixtureError = error instanceof Error ? error.message : String(error);
      throw error;
    });
} else if (mode === "sessions-add") {
  window.requestAnimationFrame(() => {
    const trigger = document.querySelector<HTMLButtonElement>('[data-report-task-selector-trigger="true"]');
    if (!trigger) throw new Error("Reports Add Session task selector trigger is missing.");
    trigger.click();
    window.setTimeout(() => {
      const picker = document.querySelector<HTMLElement>(".reports-sessions__task-picker");
      if (!picker) throw new Error("Reports Add Session task picker did not disclose.");
      if (picker.scrollWidth > picker.clientWidth + 1) {
        throw new Error(`Reports Recent Tasks picker has horizontal overflow: ${picker.scrollWidth} > ${picker.clientWidth}`);
      }
      document.documentElement.dataset.reportsTaskPickerBounded = "true";
      markReady();
    }, 50);
  });
} else if (mode === "lower") {
  window.requestAnimationFrame(() => {
    const lowerPanels = document.querySelector<HTMLElement>(".reports-overview__lower-grid");
    if (!lowerPanels) throw new Error("Reports lower-panel fixture region is missing.");

    lowerPanels.scrollIntoView({ block: "start" });
    window.requestAnimationFrame(() => {
      const bounds = lowerPanels.getBoundingClientRect();
      if (bounds.top < 0 || bounds.bottom > window.innerHeight) return;

      document.documentElement.dataset.reportsLowerViewportReady = "true";
      markReady();
    });
  });
} else {
  window.requestAnimationFrame(markReady);
}
