import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { FocusPanel } from "./FocusPanel";
import type { ListBoardSnapshot, ListBoardTask } from "./listBoardApi";
import type { TimerSessionPayload } from "./timerSessionApi";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "light" ? "light" : "dark";
const scenario = params.get("scenario") === "paused-metrics" ? "paused-metrics" : "running";
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
const longTitleId = "21111111-1111-4111-8111-111111111113";
const longTitle = "Plan weekend errands and confirm the pickup route before leaving home";

const board: ListBoardSnapshot = {
  target: { kind: "all_lists", id: null, title: "All Lists", color: null },
  displayTimezone: "Europe/Athens",
  backlog: { tasks: [], count: 0, aggregateEstSeconds: 0 },
  thisWeek: { tasks: [], count: 0, aggregateEstSeconds: 0 },
  today: {
    count: 4,
    aggregateEstSeconds: 7800,
    tasks: [
      task(liveId, "Prepare BFCM strategy", workId, "Work", "#48d6c5", {
        estSeconds: 3600,
        timeTakenSeconds: "1320",
        subtaskTotalCount: 4,
        subtaskCompletedCount: 1,
      }),
      task("21111111-1111-4111-8111-111111111112", "Review campaign notes", workId, "Work", "#48d6c5", {
        estSeconds: 1800,
        scheduledLocalDate: "2026-09-11",
        isOverdue: true,
      }),
      task(longTitleId, longTitle, personalId, "Personal", "#b7d96d", {
        estSeconds: 900,
      }),
      task("21111111-1111-4111-8111-111111111114", "Client follow-up call", workId, "Work", "#48d6c5", {
        estSeconds: 1500,
        scheduledLocalDate: "2026-09-13",
        scheduledLocalTime: "18:30",
      }),
    ],
  },
  done: {
    count: 1,
    aggregateEstSeconds: 1200,
    tasks: [
      task("21111111-1111-4111-8111-111111111115", "Confirm morning agenda", workId, "Work", "#48d6c5", {
        estSeconds: 1200,
        timeTakenSeconds: "1260",
        completedAt: "2026-09-13T08:50:00Z",
      }),
    ],
  },
};

const timer: TimerSessionPayload = {
  revision: scenario === "paused-metrics" ? 8 : 7,
  runtime: {
    timer: {
      state: scenario === "paused-metrics" ? "paused" : "running",
      task_id: liveId,
      mode: { kind: "est_countdown", est_ms: 3_600_000 },
      work_elapsed_ms: 1_320_000,
      total_break_ms: 0,
      countdown_remaining_ms: 2_280_000,
      overtime_ms: 0,
      break_kind: null,
      break_remaining_ms: null,
    },
    open_session_id: "31111111-1111-4111-8111-111111111111",
  },
  awaitingResume: false,
  change: null,
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

function box(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) throw new Error(`Focus Panel fixture selector missing: ${selector}`);
  const rect = node.getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
}

function titleContract(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) throw new Error(`Focus Panel title fixture selector missing: ${selector}`);
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
  liveTimer: box(".focus-panel__live-timer"),
  metrics: box(".focus-panel__live-metrics"),
  metricRow: box(".focus-panel__metric-row"),
  metricInput: scenario === "paused-metrics" ? box(".focus-panel__metric-input") : null,
  subtasks: box(".focus-panel__subtasks"),
  subtaskRing: box(".focus-panel__subtask-ring"),
  actions: box(".focus-panel__live-actions"),
  firstRow: box('.focus-panel__task-row[data-focus-task-row="remaining"]'),
  longRow: box(longRowSelector),
  longTitle: titleContract(`${longRowSelector} [data-focus-task-title="true"]`),
  addTask: box(".focus-panel__add-task"),
};

const contractNode = document.createElement("script");
contractNode.id = "focus-panel-visual-contract";
contractNode.type = "application/json";
contractNode.textContent = JSON.stringify(contract);
document.body.append(contractNode);
document.documentElement.dataset.focusPanelFixtureReady = "true";
