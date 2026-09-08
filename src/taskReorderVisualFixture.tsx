import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { AppShell } from "./AppShell";
import { ListBoard } from "./ListBoard";
import type { ListBoardSnapshot, ListBoardTask } from "./listBoardApi";
import "./visualFixtures.css";

const theme = new URLSearchParams(window.location.search).get("theme") === "dark" ? "dark" : "light";
document.documentElement.dataset.theme = theme;
document.body.classList.add("visual-fixture-body");

function task(
  id: string,
  title: string,
  estSeconds: number,
  presentation: Partial<Pick<ListBoardTask, "scheduledLocalDate" | "scheduledLocalTime" | "isOverdue">> = {},
): ListBoardTask {
  return {
    id,
    listId: "81111111-1111-4111-8111-111111111111",
    listTitle: "Work",
    listColor: "#48d6c5",
    title,
    estSeconds,
    timeTakenSeconds: "0",
    scheduledLocalDate: presentation.scheduledLocalDate ?? null,
    scheduledLocalTime: presentation.scheduledLocalTime ?? null,
    isOverdue: presentation.isOverdue ?? false,
    completedAt: null,
  };
}

const draggingId = "82111111-1111-4111-8111-111111111111";
const settlingId = "82111111-1111-4111-8111-111111111116";

const snapshot: ListBoardSnapshot = {
  target: {
    kind: "list",
    id: "81111111-1111-4111-8111-111111111111",
    title: "Work",
    color: "#48d6c5",
  },
  displayTimezone: "Europe/Athens",
  backlog: {
    count: 2,
    aggregateEstSeconds: 5400,
    tasks: [
      task(draggingId, "Prepare quarterly outline", 3600),
      task("82111111-1111-4111-8111-111111111112", "Review research notes", 1800),
    ],
  },
  thisWeek: {
    count: 2,
    aggregateEstSeconds: 4500,
    tasks: [
      task("82111111-1111-4111-8111-111111111113", "Refine presentation", 2700),
      task("82111111-1111-4111-8111-111111111114", "Send scheduled project update", 1800, {
        scheduledLocalDate: "2026-09-11",
      }),
    ],
  },
  today: {
    count: 2,
    aggregateEstSeconds: 4500,
    tasks: [
      task("82111111-1111-4111-8111-111111111115", "Prepare project review", 3600, {
        scheduledLocalDate: "2026-09-07",
        isOverdue: true,
      }),
      task(settlingId, "Reply to client notes", 900),
    ],
  },
  done: {
    count: 0,
    aggregateEstSeconds: 0,
    tasks: [],
  },
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Task reorder fixture root is missing.");

flushSync(() => {
  createRoot(rootElement).render(
    <AppShell
      fixtureMode
      homeContent={
        <ListBoard
          target={{ kind: "list", id: snapshot.target.id! }}
          fixtureSnapshot={snapshot}
          fixtureReorderState={{
            draggingTaskId: draggingId,
            sourceLane: "backlog",
            dropLane: "thisWeek",
            beforeTaskId: null,
            settlingTaskId: settlingId,
          }}
        />
      }
    />,
  );
});

document.documentElement.dataset.visualFixtureReady = "true";
document.documentElement.dataset.taskReorderFixture = "true";
