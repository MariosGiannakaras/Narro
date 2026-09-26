import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { FloatingTimerFoundation } from "./FloatingTimerFoundation";
import type { BoardSubtaskSnapshot, ListBoardSnapshot, ListBoardTask } from "./listBoardApi";
import type { TimerSessionPayload } from "./timerSessionApi";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "light" ? "light" : "dark";
const idleRecovery = params.get("state") === "idle-recovery";
const fixtureState = params.get("state") === "expanded" || idleRecovery ? "expanded" : "collapsed";
const expanded = fixtureState === "expanded";
const fixtureHeight = expanded ? 300 : 110;
const viewportHeight = expanded ? 380 : 240;

document.documentElement.dataset.theme = theme;
document.body.style.margin = "0";
document.body.style.width = "420px";
document.body.style.height = `${viewportHeight}px`;
document.body.style.overflow = "hidden";
document.body.style.background = "var(--color-canvas)";

const task: ListBoardTask = {
  id: "21111111-1111-4111-8111-111111111111",
  listId: "11111111-1111-4111-8111-111111111111",
  listTitle: "Work",
  listColor: "#48d6c5",
  title: "Prepare BFCM strategy",
  estSeconds: 3600,
  timeTakenSeconds: "1320",
  subtaskTotalCount: 4,
  subtaskCompletedCount: expanded ? 3 : 1,
  scheduledLocalDate: null,
  scheduledLocalTime: null,
  isOverdue: false,
  completedAt: null,
};

const subtaskSnapshot: BoardSubtaskSnapshot = {
  taskId: task.id,
  listId: task.listId,
  mutable: true,
  subtasks: [
    { id: "41111111-1111-4111-8111-111111111111", taskId: task.id, title: "Plan", sortRank: 1, completedAt: "2026-09-23T08:00:00Z", updatedAt: "2026-09-23T08:00:00Z" },
    { id: "41111111-1111-4111-8111-111111111112", taskId: task.id, title: "Contacts", sortRank: 2, completedAt: "2026-09-23T08:01:00Z", updatedAt: "2026-09-23T08:01:00Z" },
    { id: "41111111-1111-4111-8111-111111111113", taskId: task.id, title: "Affiliates", sortRank: 3, completedAt: "2026-09-23T08:02:00Z", updatedAt: "2026-09-23T08:02:00Z" },
    { id: "41111111-1111-4111-8111-111111111114", taskId: task.id, title: "Emails", sortRank: 4, completedAt: null, updatedAt: "2026-09-23T08:03:00Z" },
  ],
};

const board: ListBoardSnapshot = {
  target: { kind: "all_lists", id: null, title: "All Lists", color: null },
  displayTimezone: "Europe/Athens",
  backlog: { tasks: [], count: 0, aggregateEstSeconds: 0 },
  thisWeek: { tasks: [], count: 0, aggregateEstSeconds: 0 },
  today: { tasks: [task], count: 1, aggregateEstSeconds: 3600 },
  done: { tasks: [], count: 0, aggregateEstSeconds: 0 },
  doneMonthCompletionCount: 0,
};

const timer: TimerSessionPayload = {
  revision: 7,
  runtime: {
    timer: {
      state: "running",
      task_id: task.id,
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
const fixtureTimer: TimerSessionPayload = idleRecovery ? {
  ...timer,
  revision: timer.revision + 1,
  runtime: {
    timer: {
      state: "idle",
      task_id: null,
      mode: null,
      work_elapsed_ms: 0,
      total_break_ms: 0,
      countdown_remaining_ms: null,
      overtime_ms: 0,
      break_kind: null,
      break_remaining_ms: null,
    },
    open_session_id: null,
  },
} : timer;

const root = document.getElementById("root");
if (!root) throw new Error("Floating Timer fixture root is missing.");
root.style.width = "340px";
root.style.height = `${fixtureHeight}px`;
root.style.margin = "20px";

flushSync(() => {
  createRoot(root).render(
    <FloatingTimerFoundation
      onReturnToPanel={() => undefined}
      fixtureBoard={board}
      fixtureTimer={fixtureTimer}
      fixtureExpanded={expanded}
      fixtureSubtasks={expanded ? subtaskSnapshot : null}
    />,
  );
});

const renderedTimer = document.querySelector<HTMLElement>(".floating-timer-foundation");
if (!renderedTimer) throw new Error("Floating Timer fixture production surface is missing.");
renderedTimer.style.width = "340px";
renderedTimer.style.height = `${fixtureHeight}px`;

function box(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) throw new Error(`Floating Timer fixture selector missing: ${selector}`);
  const rect = node.getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
}

function optionalBox(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
}

if (!idleRecovery) {
const contract = {
  theme,
  state: fixtureState,
  timer: box(".floating-timer-foundation"),
  heading: optionalBox(".floating-timer-foundation__heading"),
  title: optionalBox(".floating-timer-foundation__title"),
  liveTimer: optionalBox(".floating-timer-foundation__timer"),
  actionStrip: optionalBox(".floating-timer-foundation__actions"),
  subtaskToolbar: box(".floating-timer-foundation__subtask-toolbar"),
  subtaskRing: box(".floating-timer-foundation__subtask-ring"),
  add: box('[data-floating-subtask-control="add"]'),
  expand: box('[data-floating-subtask-control="expand"]'),
  returnToPanel: optionalBox('[data-floating-action="return-to-panel"]'),
  subtaskPanel: optionalBox(".floating-timer-foundation__subtask-panel"),
  subtaskRow: optionalBox(".floating-timer-foundation__subtask-row"),
  subtaskAction: optionalBox(".floating-timer-foundation__subtask-action"),
};

const contractNode = document.createElement("script");
contractNode.id = "floating-timer-visual-contract";
contractNode.type = "application/json";
contractNode.textContent = JSON.stringify(contract);
document.body.append(contractNode);
document.documentElement.dataset.floatingTimerFixtureReady = "true";

if (params.get("state") === "cycle") {
  const observations: Array<{
    expanded: string | undefined;
    actionStrips: number;
    headings: number;
    subtaskPanels: number;
  }> = [];
  const visibleCount = (selector: string) => Array.from(
    renderedTimer.querySelectorAll<HTMLElement>(selector),
  ).filter((node) => {
    const rect = node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }).length;

  const observe = () => {
    observations.push({
      expanded: renderedTimer.dataset.floatingExpanded,
      actionStrips: visibleCount(".floating-timer-foundation__actions"),
      headings: visibleCount(".floating-timer-foundation__heading"),
      subtaskPanels: visibleCount(".floating-timer-foundation__subtask-panel"),
    });
  };
  const toggle = () => {
    const button = renderedTimer.querySelector<HTMLButtonElement>('[data-floating-subtask-control="expand"]');
    if (!button || button.disabled) throw new Error("Floating Timer resize control is unavailable");
    flushSync(() => button.click());
  };

  observe();
  for (let cycle = 0; cycle < 3; cycle += 1) {
    toggle();
    observe();
    toggle();
    observe();
  }

  const node = document.createElement("script");
  node.id = "floating-timer-cycle-contract";
  node.type = "application/json";
  node.textContent = JSON.stringify(observations);
  document.body.append(node);
  document.documentElement.dataset.floatingTimerCycleReady = "true";
}
} else {
  const observe = () => ({
    expanded: renderedTimer.dataset.floatingExpanded,
    liveState: renderedTimer.dataset.floatingLiveState,
    collapseButtons: renderedTimer.querySelectorAll('[data-floating-fallback-action="collapse"]').length,
    headings: renderedTimer.querySelectorAll(".floating-timer-foundation__heading").length,
  });
  const before = observe();
  const collapse = renderedTimer.querySelector<HTMLButtonElement>('[data-floating-fallback-action="collapse"]');
  if (!collapse || collapse.disabled) throw new Error("Idle expanded Timer has no usable collapse control");
  flushSync(() => collapse.click());
  const after = observe();
  const node = document.createElement("script");
  node.id = "floating-timer-idle-recovery-contract";
  node.type = "application/json";
  node.textContent = JSON.stringify({ before, after });
  document.body.append(node);
  document.documentElement.dataset.floatingTimerIdleRecoveryReady = "true";
}
