import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { ListBoard } from "./ListBoard";
import type { ListBoardSnapshot, ListBoardTask } from "./listBoardApi";
import type { TimerSessionPayload } from "./timerSessionApi";

const listId = "28111111-1111-4111-8111-111111111111";
const tasks: ListBoardTask[] = [1, 2, 3].map((index) => ({
  id: `28333333-3333-4333-8333-${String(index).padStart(12, "0")}`,
  listId,
  listTitle: "Finding28",
  listColor: null,
  title: `Finding28 task ${index}`,
  estSeconds: null,
  timeTakenSeconds: "0",
  subtaskTotalCount: 0,
  subtaskCompletedCount: 0,
  scheduledLocalDate: null,
  scheduledLocalTime: null,
  isOverdue: false,
  completedAt: null,
}));

let orderedTasks = [...tasks];
let mutationCount = 0;
let callbackId = 0;
const callbacks = new Map<number, (value: unknown) => void>();
const listeners = new Map<number, { event: string; handler: number }>();

const timer: TimerSessionPayload = {
  revision: 1,
  awaitingResume: false,
  change: null,
  runtime: {
    open_session_id: null,
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
  },
};

function boardSnapshot(): ListBoardSnapshot {
  return {
    target: { kind: "list", id: listId, title: "Finding28", color: null },
    displayTimezone: "Europe/Athens",
    backlog: { tasks: [], count: 0, aggregateEstSeconds: 0 },
    thisWeek: { tasks: [], count: 0, aggregateEstSeconds: 0 },
    today: { tasks: [...orderedTasks], count: orderedTasks.length, aggregateEstSeconds: 0 },
    done: { tasks: [], count: 0, aggregateEstSeconds: 0 },
    todayCompletionCount: 0,
    thisWeekCompletionCount: 0,
    doneMonthCompletionCount: 0,
  };
}

function reorder(taskId: string, beforeTaskId: string | null) {
  const task = orderedTasks.find((candidate) => candidate.id === taskId);
  if (!task) throw new Error(`Finding28 fixture received unknown task ${taskId}`);
  orderedTasks = orderedTasks.filter((candidate) => candidate.id !== taskId);
  const before = beforeTaskId
    ? orderedTasks.findIndex((candidate) => candidate.id === beforeTaskId)
    : -1;
  orderedTasks.splice(before < 0 ? orderedTasks.length : before, 0, task);
  mutationCount += 1;
}

type NativeFixtureWindow = Window & {
  __TAURI_INTERNALS__: {
    transformCallback: (callback: (value: unknown) => void) => number;
    invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
  };
  __TAURI_EVENT_PLUGIN_INTERNALS__: {
    unregisterListener: (_event: string, id: number) => void;
  };
  __NARRO_FINDING28_FIXTURE__: {
    read: () => {
      mutationCount: number;
      order: string[];
      taskIds: string[];
      titleEditorOpen: boolean;
    };
  };
};

export async function mountFinding28PostDragFixture(container: HTMLElement) {
  const native = window as unknown as NativeFixtureWindow;
  native.__TAURI_EVENT_PLUGIN_INTERNALS__ = {
    unregisterListener: (_event, id) => {
      listeners.delete(id);
    },
  };
  native.__TAURI_INTERNALS__ = {
    transformCallback(callback) {
      callbacks.set(++callbackId, callback);
      return callbackId;
    },
    async invoke(command, args = {}) {
      if (command === "plugin:event|listen") {
        const handler = Number(args.handler);
        listeners.set(handler, { event: String(args.event), handler });
        return handler;
      }
      if (command === "plugin:event|emit") {
        for (const listener of [...listeners.values()]) {
          if (listener.event !== args.event) continue;
          callbacks.get(listener.handler)?.({
            event: listener.event,
            id: listener.handler,
            payload: args.payload ?? null,
          });
        }
        return;
      }
      if (command.startsWith("plugin:event|")) return;
      if (command === "get_archived_lists_for_settings") {
        return { lists: [], doneTasks: [], filterLists: [] };
      }
      if (command === "get_home_snapshot") {
        return {
          lists: [{ id: listId, title: "Finding28" }],
          pendingCount: orderedTasks.length,
          aggregateEstSeconds: 0,
        };
      }
      if (command === "get_preference_settings") {
        return {
          general: { hideTaskTimes: false, autoParseEstFromTitle: false },
          focus: { scrollingTitle: false, defaultBreakSeconds: 600 },
          celebration: { showSuccessScreen: false },
        };
      }
      if (command === "get_list_board_snapshot") return boardSnapshot();
      if (command === "timer_session_snapshot") return timer;
      if (command === "reorder_list_board_task") {
        reorder(String(args.taskId), args.beforeTaskId == null ? null : String(args.beforeTaskId));
        return;
      }
      if (command === "move_list_board_task") {
        throw new Error("Finding28 fixture must remain a same-lane reorder probe.");
      }
      throw new Error(`Unexpected Finding28 fixture command: ${command}`);
    },
  };

  native.__NARRO_FINDING28_FIXTURE__ = {
    read: () => ({
      mutationCount,
      order: orderedTasks.map((task) => task.id),
      taskIds: tasks.map((task) => task.id),
      titleEditorOpen: Boolean(document.querySelector(".list-board-task__title-input")),
    }),
  };

  flushSync(() => {
    createRoot(container).render(<ListBoard target={{ kind: "list", id: listId }} />);
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const shells = container.querySelectorAll('[data-board-drag-task][data-task-reorderable="true"]');
    if (shells.length === tasks.length) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      document.documentElement.dataset.finding28FixtureReady = "true";
      return;
    }
    await new Promise<void>((resolve) => window.setTimeout(resolve, 25));
  }
  throw new Error("Finding28 production ListBoard fixture did not become interactive.");
}
