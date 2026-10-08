import { invoke } from "@tauri-apps/api/core";
import { emitBoardInvalidated } from "./boardInvalidation";

export type TaskSchedule =
  | { kind: "none" }
  | { kind: "date_only"; local_date: string }
  | {
      kind: "local_datetime";
      local_date: string;
      local_time: string;
      timezone: string;
    };

export type ScheduleShortcut =
  | { kind: "today" }
  | { kind: "later_today" }
  | { kind: "tomorrow" }
  | { kind: "next_week" }
  | { kind: "custom_date"; local_date: string };

export type RecurrenceUnit = "day" | "week" | "month" | "year";

export type BoardRecurrenceRule = {
  id: string;
  intervalCount: number;
  unit: RecurrenceUnit;
  weekdayMask: number;
  monthDay: number | null;
  monthWeekdayOrdinal?: number | null;
  startsLocalDate: string;
  localTime: string | null;
  timezone: string | null;
  replaceExisting: boolean;
  isActive: boolean;
  updatedAt: string;
};

export type TaskScheduleEditorSnapshot = {
  taskId: string;
  listId: string;
  schedule: TaskSchedule;
  recurrenceParentTaskId: string | null;
  recurrence: BoardRecurrenceRule | null;
  deleteExistingEligibleCount: number;
  protectedExistingCount: number;
};

export type RecurrenceDraft = {
  intervalCount: number;
  unit: RecurrenceUnit;
  weekdayMask: number;
  monthDay: number | null;
  monthWeekdayOrdinal?: number | null;
  startsLocalDate: string;
  localTime: string | null;
  timezone: string | null;
  replaceExisting: boolean;
};

export type RecurrenceMutationResult = {
  materializationWarning: string | null;
};

export type RecurrenceRemovalResult = {
  removedExistingCount: number;
  preservedExistingCount: number;
};

export function getTaskScheduleEditor(taskId: string, listId: string): Promise<TaskScheduleEditorSnapshot> {
  return invoke<TaskScheduleEditorSnapshot>("get_list_board_task_schedule_editor", { taskId, listId });
}

export function resolveTaskScheduleShortcut(
  shortcut: ScheduleShortcut,
  timezone: string,
): Promise<TaskSchedule> {
  return invoke<TaskSchedule>("resolve_list_board_schedule_shortcut", { shortcut, timezone });
}


async function committedScheduleMutation<T>(
  command: string,
  args: Record<string, unknown>,
): Promise<T> {
  const result = await invoke<T>(command, args);
  await emitBoardInvalidated();
  return result;
}

export function updateTaskSchedule(request: {
  taskId: string;
  listId: string;
  expectedSchedule: TaskSchedule;
  schedule: TaskSchedule;
}): Promise<void> {
  return committedScheduleMutation<void>("update_list_board_task_schedule", request);
}

export function saveTaskRecurrence(request: {
  taskId: string;
  listId: string;
  expectedRuleId: string | null;
  expectedRuleUpdatedAt: string | null;
  recurrence: RecurrenceDraft;
}): Promise<RecurrenceMutationResult> {
  return committedScheduleMutation<RecurrenceMutationResult>("save_list_board_task_recurrence", request);
}

export function removeTaskRecurrence(request: {
  taskId: string;
  listId: string;
  expectedRuleId: string;
  expectedRuleUpdatedAt: string;
  deleteExistingTasks: boolean;
}): Promise<RecurrenceRemovalResult> {
  return committedScheduleMutation<RecurrenceRemovalResult>("remove_list_board_task_recurrence", request);
}
