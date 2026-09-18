import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { FocusPanel } from "./FocusPanel";
import type {
  BoardTaskNoteSnapshot,
  ListBoardSnapshot,
  ListBoardTask,
  NoteDocument,
} from "./listBoardApi";
import type { TimerSessionPayload, TimerStateKind } from "./timerSessionApi";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "light" ? "light" : "dark";
const requestedScenario = params.get("scenario") ?? "running";
const scenarios = [
  "running",
  "paused-metrics",
  "break",
  "time-up",
  "overtime",
  "notes-expanded",
  "no-eligible",
  "empty",
] as const;
type Scenario = (typeof scenarios)[number];
const scenario: Scenario = scenarios.includes(requestedScenario as Scenario)
  ? requestedScenario as Scenario
  : "running";

document.documentElement.dataset.theme = theme;
document.body.style.margin = "0";
document.body.style.minHeight = "100vh";
document.body.style.background = "var(--color-canvas)";

function task(
  id: string,
  title: string,
  listId: string,
  listTitle: string,
  listColor: string,
  options: Partial<ListBoardTask> = {},
): ListBoardTask {
  return {
    id,
    listId,
    listTitle,
    listColor,
    title,
    estSeconds: 1800,
    timeTakenSeconds: "0",
    subtaskTotalCount: 0,
    subtaskCompletedCount: 0,
    scheduledLocalDate: null,
    scheduledLocalTime: null,
    isOverdue: false,
    completedAt: null,
    ...options,
  };
}

const workId = "11111111-1111-4111-8111-111111111111";
const personalId = "11111111-1111-4111-8111-111111111112";
const liveId = "21111111-1111-4111-8111-111111111111";
const overdueId = "21111111-1111-4111-8111-111111111112";
const longTitleId = "21111111-1111-4111-8111-111111111113";
const scheduledId = "21111111-1111-4111-8111-111111111114";
const longTitle = ["Plan weekend errands", "and confirm the pickup route before leaving home"].join(" ");

const liveTask = task(liveId, "Prepare BFCM strategy", workId, "Work", "#48d6c5", {
  estSeconds: 3600,
  timeTakenSeconds: "1320",
  subtaskTotalCount: 4,
  subtaskCompletedCount: 1,
});
const overdueTask = task(overdueId, "Review campaign notes", workId, "Work", "#48d6c5", {
  estSeconds: 1800,
  scheduledLocalDate: "2026-09-11",
  isOverdue: true,
});
const longTitleTask = task(longTitleId, longTitle, personalId, "Personal", "#b7d96d", {
  estSeconds: 900,
});
const scheduledTask = task(scheduledId, "Client follow-up call", workId, "Work", "#48d6c5", {
  estSeconds: 1500,
  scheduledLocalDate: "2026-09-15",
  scheduledLocalTime: "18:30",
});
const doneTask = task("21111111-1111-4111-8111-111111111115", "Confirm morning agenda", workId, "Work", "#48d6c5", {
  estSeconds: 1200,
  timeTakenSeconds: "1260",
  completedAt: "2026-09-13T08:50:00Z",
});

const normalTodayTasks = [liveTask, overdueTask, longTitleTask, scheduledTask];
const todayTasks = scenario === "no-eligible" ? [scheduledTask] : scenario === "empty" ? [] : normalTodayTasks;
const board: ListBoardSnapshot = {
  target: { kind: "all_lists", id: null, title: "All Lists", color: null },
  displayTimezone: "Europe/Athens",
  backlog: { tasks: [], count: 0, aggregateEstSeconds: 0 },
  thisWeek: { tasks: [], count: 0, aggregateEstSeconds: 0 },
  today: {
    count: todayTasks.length,
    aggregateEstSeconds: todayTasks.reduce((total, item) => total + (item.estSeconds ?? 0), 0),
    tasks: todayTasks,
  },
  done: {
    count: 1,
    aggregateEstSeconds: 1200,
    tasks: [doneTask],
  },
};

function timerState(): TimerStateKind {
  switch (scenario) {
    case "paused-metrics":
      return "paused";
    case "break":
      return "break";
    case "time-up":
      return "time_up";
    case "overtime":
      return "overtime_running";
    default:
      return "running";
  }
}

const state = timerState();
const noLiveScenario = scenario === "no-eligible" || scenario === "empty";
const timer: TimerSessionPayload | null = noLiveScenario ? null : {
  revision: scenarios.indexOf(scenario) + 7,
  runtime: {
    timer: {
      state,
      task_id: liveId,
      mode: { kind: "est_countdown", est_ms: 3_600_000 },
      work_elapsed_ms: 1_320_000,
      total_break_ms: state === "break" ? 180_000 : 0,
      countdown_remaining_ms: state === "time_up" || state.startsWith("overtime") ? 0 : 2_280_000,
      overtime_ms: state.startsWith("overtime") ? 420_000 : 0,
      break_kind: state === "break" ? "manual" : null,
      break_remaining_ms: state === "break" ? 420_000 : null,
    },
    open_session_id: "31111111-1111-4111-8111-111111111111",
  },
  awaitingResume: false,
  change: null,
};

const noteDocument: NoteDocument = {
  blocks: [
    {
      kind: "paragraph",
      runs: [
        { text: "Confirm launch assumptions and review the ", bold: true },
        { text: "source brief", link: "https://example.com/narro-focus" },
        { text: " before finishing this task." },
      ],
    },
  ],
};
const noteSnapshot: BoardTaskNoteSnapshot = {
  taskId: liveId,
  listId: workId,
  mutable: true,
  note: {
    taskId: liveId,
    editorFormatVersion: 1,
    document: noteDocument,
    updatedAt: "2026-09-15T09:00:00Z",
  },
};

type TauriInternals = {
  invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
};

(window as unknown as { __TAURI_INTERNALS__: TauriInternals }).__TAURI_INTERNALS__ = {
  invoke: async (command, args) => {
    if (command === "get_list_board_task_note") {
      if (String(args?.taskId ?? "") !== liveId || String(args?.listId ?? "") !== workId) {
        throw new Error("Focus visual fixture requested a note for an unexpected task identity.");
      }
      return noteSnapshot;
    }
    throw new Error(`Unexpected Focus visual fixture invoke: ${command}`);
  },
};

const root = document.getElementById("root");
if (!root) throw new Error("Focus Panel fixture root is missing.");
root.style.minHeight = "100vh";
root.style.display = "flex";
root.style.justifyContent = "center";
root.style.alignItems = "flex-start";

flushSync(() => {
  createRoot(root).render(
    <FocusPanel
      fixtureBoard={board}
      fixtureLists={[
        { id: workId, title: "Work" },
        { id: personalId, title: "Personal" },
      ]}
      fixtureTimer={timer}
    />,
  );
});

if (scenario === "notes-expanded") {
  const notesButton = document.querySelector<HTMLButtonElement>('[data-focus-action="notes"]');
  if (!notesButton) throw new Error("Focus visual fixture Notes action is missing.");
  notesButton.click();
  await new Promise<void>((resolve) => window.setTimeout(resolve, 80));
}

function box(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) throw new Error(`Focus Panel fixture selector missing: ${selector}`);
  const rect = node.getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
}

function optionalBox(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
}

function styleContract(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) return null;
  const style = getComputedStyle(node);
  return {
    backgroundColor: style.backgroundColor,
    borderColor: style.borderColor,
    borderStyle: style.borderStyle,
    color: style.color,
    boxShadow: style.boxShadow,
  };
}

function titleContract(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  const style = getComputedStyle(node);
  return {
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    display: style.display,
    lineClamp: style.getPropertyValue("-webkit-line-clamp"),
    whiteSpace: style.whiteSpace,
    overflow: style.overflow,
    tabIndex: node.tabIndex,
    describedBy: node.getAttribute("aria-describedby"),
  };
}

const longRowSelector = `[data-task-id="${longTitleId}"]`;
const overdueSelector = `[data-task-id="${overdueId}"]`;
const contract = {
  theme,
  scenario,
  layoutViewport: {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  },
  panel: box(".focus-panel"),
  topbar: box(".focus-panel__topbar"),
  summary: box(".focus-panel__summary"),
  liveCard: box(".focus-panel__live-card"),
  liveCardStyle: styleContract(".focus-panel__live-card"),
  liveTimer: optionalBox(".focus-panel__live-timer"),
  liveTimerStyle: styleContract(".focus-panel__live-timer"),
  liveStateStyle: styleContract(".focus-panel__live-state"),
  metrics: optionalBox(".focus-panel__live-metrics"),
  metricRow: optionalBox(".focus-panel__metric-row"),
  metricInput: scenario === "paused-metrics" ? optionalBox(".focus-panel__metric-input") : null,
  subtasks: optionalBox(".focus-panel__subtasks"),
  subtaskRing: optionalBox(".focus-panel__subtask-ring"),
  actions: optionalBox(".focus-panel__live-actions"),
  notes: optionalBox(".focus-panel__notes:not([hidden])"),
  notesStyle: styleContract(".focus-panel__notes:not([hidden])"),
  firstRow: optionalBox('.focus-panel__task-row[data-focus-task-row="remaining"]'),
  overdueRow: optionalBox(overdueSelector),
  overdueRowStyle: styleContract(overdueSelector),
  longRow: optionalBox(longRowSelector),
  longRowStyle: styleContract(longRowSelector),
  longTitle: titleContract(`${longRowSelector} [data-focus-task-title="true"]`),
  scheduledRow: optionalBox(`[data-task-id="${scheduledId}"]`),
  addTask: box(".focus-panel__add-task"),
};

const contractNode = document.createElement("script");
contractNode.id = "focus-panel-visual-contract";
contractNode.type = "application/json";
contractNode.textContent = JSON.stringify(contract);
document.body.append(contractNode);
document.documentElement.dataset.focusPanelFixtureReady = "true";
