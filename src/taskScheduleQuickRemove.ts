import type { ListBoardTask } from "./listBoardApi";
import type { TaskSchedule, TaskScheduleEditorSnapshot } from "./taskScheduleApi";

type ScheduleRemovalTask = Pick<
  ListBoardTask,
  "id" | "listId" | "completedAt" | "scheduledLocalDate"
  | "scheduledLocalTime" | "recurrenceRuleId" | "recurrenceParentTaskId"
>;

export function canQuickRemoveSchedule(task: ScheduleRemovalTask): boolean {
  return task.completedAt === null
    && task.scheduledLocalDate !== null
    && !task.recurrenceRuleId;
}

/**
 * Read-only revalidation before invoking the existing atomic expected-schedule
 * mutation. A generated child may unschedule independently; a recurring parent
 * cannot be detached through an ordinary scheduled-child control.
 */
export function expectedQuickRemoveSchedule(
  task: ScheduleRemovalTask,
  latest: TaskScheduleEditorSnapshot,
): TaskSchedule | null {
  if (!canQuickRemoveSchedule(task)
    || latest.taskId !== task.id
    || latest.listId !== task.listId
    || latest.recurrence !== null
    || latest.recurrenceParentTaskId !== (task.recurrenceParentTaskId ?? null)) return null;

  if (latest.schedule.kind === "none") return null;
  if (latest.schedule.local_date !== task.scheduledLocalDate) return null;
  if (latest.schedule.kind === "date_only") {
    return task.scheduledLocalTime === null ? latest.schedule : null;
  }
  return latest.schedule.local_time === task.scheduledLocalTime ? latest.schedule : null;
}
