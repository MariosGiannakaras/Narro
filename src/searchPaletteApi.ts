import { invoke } from "@tauri-apps/api/core";
import type { HomeSnapshot } from "./HomeDashboard";
import { getListBoardSnapshot, type ListBoardTask } from "./listBoardApi";

export type SearchPaletteListResult = {
  id: string;
  title: string;
};

export type SearchPaletteTaskLane = "Backlog" | "This Week" | "Today" | "Done";

export type SearchPaletteTaskResult = {
  id: string;
  listId: string;
  listTitle: string;
  title: string;
  lane: SearchPaletteTaskLane;
};

export type SearchPaletteData = {
  lists: SearchPaletteListResult[];
  tasks: SearchPaletteTaskResult[];
};

function taskResult(task: ListBoardTask, lane: SearchPaletteTaskLane): SearchPaletteTaskResult {
  return {
    id: task.id,
    listId: task.listId,
    listTitle: task.listTitle,
    title: task.title,
    lane,
  };
}

export async function getSearchPaletteData(): Promise<SearchPaletteData> {
  const [home, board] = await Promise.all([
    invoke<HomeSnapshot>("get_home_snapshot"),
    getListBoardSnapshot({ kind: "all" }),
  ]);

  const seenTaskIds = new Set<string>();
  const orderedTasks = [
    ...board.backlog.tasks.map((task) => taskResult(task, "Backlog")),
    ...board.thisWeek.tasks.map((task) => taskResult(task, "This Week")),
    ...board.today.tasks.map((task) => taskResult(task, "Today")),
    ...board.done.tasks.map((task) => taskResult(task, "Done")),
  ];

  return {
    lists: home.lists.map((list) => ({ id: list.id, title: list.title })),
    tasks: orderedTasks.filter((task) => {
      if (seenTaskIds.has(task.id)) return false;
      seenTaskIds.add(task.id);
      return true;
    }),
  };
}
