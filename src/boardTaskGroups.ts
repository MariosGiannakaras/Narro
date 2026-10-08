import type { ListBoardTask } from "./listBoardApi";

type GroupableTask = Pick<ListBoardTask, "recurrenceRuleId" | "scheduledLocalDate">;
export type BoardTaskSubgroup = "ordinary" | "recurring" | "scheduled";
export type PendingBoardLane = "backlog" | "thisWeek" | "today";

/** Preserve rank order *within* each group; only the Board presentation is regrouped. */
export function boardTaskSubgroup(task: GroupableTask): BoardTaskSubgroup {
  if (task.recurrenceRuleId) return "recurring";
  if (task.scheduledLocalDate) return "scheduled";
  return "ordinary";
}

export function groupedBoardTasks<T extends GroupableTask>(tasks: readonly T[]): T[] {
  const groups: Record<BoardTaskSubgroup, T[]> = {
    ordinary: [],
    recurring: [],
    scheduled: [],
  };
  for (const task of tasks) groups[boardTaskSubgroup(task)].push(task);
  return [...groups.ordinary, ...groups.recurring, ...groups.scheduled];
}

export function scheduledGroupHeading(count: number, lane: PendingBoardLane): string {
  const place = lane === "thisWeek" ? "this week"
    : lane === "today" ? "today" : "in backlog";
  return `${count} Scheduled ${count === 1 ? "task" : "tasks"} ${place}`;
}
