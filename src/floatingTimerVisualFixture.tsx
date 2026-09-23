import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { FloatingTimerFoundation } from "./FloatingTimerFoundation";
import type { ListBoardSnapshot, ListBoardTask } from "./listBoardApi";
import type { TimerSessionPayload } from "./timerSessionApi";

const params = new URLSearchParams(window.location.search);
const theme = params.get("theme") === "light" ? "light" : "dark";

document.documentElement.dataset.theme = theme;
document.body.style.margin = "0";
document.body.style.width = "420px";
document.body.style.height = "240px";
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
  subtaskCompletedCount: 1,
  scheduledLocalDate: null,
  scheduledLocalTime: null,
  isOverdue: false,
  completedAt: null,
};

const board: ListBoardSnapshot = {
  target: { kind: "all_lists", id: null, title: "All Lists", color: null },
  displayTimezone: "Europe/Athens",
  backlog: { tasks: [], count: 0, aggregateEstSeconds: 0 },
  thisWeek: { tasks: [], count: 0, aggregateEstSeconds: 0 },
  today: { tasks: [task], count: 1, aggregateEstSeconds: 3600 },
  done: { tasks: [], count: 0, aggregateEstSeconds: 0 },
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

const root = document.getElementById("root");
if (!root) throw new Error("Floating Timer fixture root is missing.");
root.style.width = "340px";
root.style.height = "110px";
root.style.margin = "20px";

flushSync(() => {
  createRoot(root).render(
    <FloatingTimerFoundation
      onReturnToPanel={() => undefined}
      fixtureBoard={board}
      fixtureTimer={timer}
    />,
  );
});

const renderedTimer = document.querySelector<HTMLElement>(".floating-timer-foundation");
if (!renderedTimer) throw new Error("Floating Timer fixture production surface is missing.");
renderedTimer.style.width = "340px";
renderedTimer.style.height = "110px";

function box(selector: string) {
  const node = document.querySelector<HTMLElement>(selector);
  if (!node) throw new Error(`Floating Timer fixture selector missing: ${selector}`);
  const rect = node.getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
}

const contract = {
  theme,
  timer: box(".floating-timer-foundation"),
  heading: box(".floating-timer-foundation__heading"),
  title: box(".floating-timer-foundation__title"),
  liveTimer: box(".floating-timer-foundation__timer"),
  subtaskToolbar: box(".floating-timer-foundation__subtask-toolbar"),
  subtaskRing: box(".floating-timer-foundation__subtask-ring"),
  add: box('[data-floating-subtask-control="add"]'),
  expand: box('[data-floating-subtask-control="expand"]'),
  returnToPanel: box('[data-floating-return-to-panel="true"]'),
};

const contractNode = document.createElement("script");
contractNode.id = "floating-timer-visual-contract";
contractNode.type = "application/json";
contractNode.textContent = JSON.stringify(contract);
document.body.append(contractNode);
document.documentElement.dataset.floatingTimerFixtureReady = "true";
