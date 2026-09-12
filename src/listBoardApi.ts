import { invoke } from "@tauri-apps/api/core";
import { getArchiveSnapshot } from "./listSettingsApi";

export type ListBoardTargetKind = "list" | "all_lists";

export type ListBoardTarget = {
  kind: ListBoardTargetKind;
  id: string | null;
  title: string;
  color: string | null;
};

export type ListBoardTask = {
  id: string;
  listId: string;
  listTitle: string;
  listColor: string | null;
  title: string;
  estSeconds: number | null;
  timeTakenSeconds: string;
  subtaskTotalCount?: number;
  subtaskCompletedCount?: number;
  scheduledLocalDate: string | null;
  scheduledLocalTime: string | null;
  recurrenceRuleId?: string | null;
  recurrenceParentTaskId?: string | null;
  isOverdue: boolean;
  completedAt: string | null;
};

export type ListBoardLane = {
  tasks: ListBoardTask[];
  count: number;
  aggregateEstSeconds: number;
};

export type ListBoardSnapshot = {
  target: ListBoardTarget;
  displayTimezone: string;
  backlog: ListBoardLane;
  thisWeek: ListBoardLane;
  today: ListBoardLane;
  done: ListBoardLane;
};

export type ListBoardRequestTarget =
  | { kind: "all" }
  | { kind: "list"; id: string };

export type PlanningLaneToken = "backlog" | "this_week" | "today";

export type NoteTextRun = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  link?: string | null;
};

export type NoteListItem = {
  runs: NoteTextRun[];
};

export type NoteBlock =
  | { kind: "paragraph"; runs: NoteTextRun[] }
  | { kind: "bullet_list"; items: NoteListItem[] }
  | { kind: "numbered_list"; items: NoteListItem[] };

export type NoteDocument = {
  blocks: NoteBlock[];
};

export type BoardTaskNote = {
  taskId: string;
  editorFormatVersion: number;
  document: NoteDocument;
  updatedAt: string;
};

export type BoardTaskNoteSnapshot = {
  taskId: string;
  listId: string;
  mutable: boolean;
  note: BoardTaskNote | null;
};

export type BoardSubtask = {
  id: string;
  taskId: string;
  title: string;
  sortRank: number;
  completedAt: string | null;
  updatedAt: string;
};

export type BoardSubtaskSnapshot = {
  taskId: string;
  listId: string;
  mutable: boolean;
  subtasks: BoardSubtask[];
};

export type CreateListBoardTaskRequest = {
  listId: string;
  lane: PlanningLaneToken;
  title: string;
};

export type UpdateListBoardTaskTitleRequest = {
  taskId: string;
  listId: string;
  expectedTitle: string;
  title: string;
};

export type UpdateListBoardTaskEstimateRequest = {
  taskId: string;
  listId: string;
  expectedEstSeconds: number | null;
  estSeconds: number | null;
};

export type UpdateListBoardTaskTimeTakenRequest = {
  taskId: string;
  listId: string;
  expectedTotalSeconds: string;
  totalSeconds: number;
};

export type ReorderListBoardTaskRequest = {
  taskId: string;
  listId: string;
  sourceLane: PlanningLaneToken;
  beforeTaskId: string | null;
};

export type MoveListBoardTaskRequest = {
  taskId: string;
  listId: string;
  sourceLane: PlanningLaneToken;
  targetLane: PlanningLaneToken;
};

export type SaveListBoardTaskNoteRequest = {
  taskId: string;
  listId: string;
  expectedUpdatedAt: string | null;
  document: NoteDocument;
};

export type DeleteListBoardTaskNoteRequest = {
  taskId: string;
  listId: string;
  expectedUpdatedAt: string;
};

export type CreateListBoardSubtaskRequest = {
  taskId: string;
  listId: string;
  title: string;
};

export type UpdateListBoardSubtaskTitleRequest = {
  subtaskId: string;
  taskId: string;
  listId: string;
  expectedTitle: string;
  title: string;
};

export type SetListBoardSubtaskCompletionRequest = {
  subtaskId: string;
  taskId: string;
  listId: string;
  expectedCompletedAt: string | null;
  completed: boolean;
};

export type ReorderListBoardSubtasksRequest = {
  taskId: string;
  listId: string;
  expectedOrder: string[];
  orderedIds: string[];
};

export type DeleteListBoardSubtaskRequest = {
  subtaskId: string;
  taskId: string;
  listId: string;
  expectedUpdatedAt: string;
};

export function systemDisplayTimezone(): string {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone?.trim();
  if (!timezone) {
    throw new Error("Windows display timezone could not be resolved.");
  }
  return timezone;
}

export async function getListBoardSnapshot(
  target: ListBoardRequestTarget,
): Promise<ListBoardSnapshot> {
  await getArchiveSnapshot();
  return invoke<ListBoardSnapshot>("get_list_board_snapshot", {
    listId: target.kind === "list" ? target.id : null,
    displayTimezone: systemDisplayTimezone(),
  });
}

export function createListBoardTask(request: CreateListBoardTaskRequest): Promise<string> {
  return invoke<string>("create_list_board_task", request);
}

export function updateListBoardTaskTitle(request: UpdateListBoardTaskTitleRequest): Promise<void> {
  return invoke<void>("update_list_board_task_title", request);
}

export function updateListBoardTaskEstimate(
  request: UpdateListBoardTaskEstimateRequest,
): Promise<void> {
  return invoke<void>("update_list_board_task_estimate", request);
}

export function updateListBoardTaskTimeTaken(
  request: UpdateListBoardTaskTimeTakenRequest,
): Promise<void> {
  return invoke<void>("update_list_board_task_time_taken", request);
}

export function reorderListBoardTask(request: ReorderListBoardTaskRequest): Promise<void> {
  return invoke<void>("reorder_list_board_task", request);
}

export function moveListBoardTask(request: MoveListBoardTaskRequest): Promise<void> {
  return invoke<void>("move_list_board_task", request);
}

export function getListBoardTaskNote(
  taskId: string,
  listId: string,
): Promise<BoardTaskNoteSnapshot> {
  return invoke<BoardTaskNoteSnapshot>("get_list_board_task_note", { taskId, listId });
}

export function saveListBoardTaskNote(
  request: SaveListBoardTaskNoteRequest,
): Promise<BoardTaskNote> {
  return invoke<BoardTaskNote>("save_list_board_task_note", request);
}

export function deleteListBoardTaskNote(
  request: DeleteListBoardTaskNoteRequest,
): Promise<void> {
  return invoke<void>("delete_list_board_task_note", request);
}

export function getListBoardTaskSubtasks(
  taskId: string,
  listId: string,
): Promise<BoardSubtaskSnapshot> {
  return invoke<BoardSubtaskSnapshot>("get_list_board_task_subtasks", { taskId, listId });
}

export function createListBoardSubtask(
  request: CreateListBoardSubtaskRequest,
): Promise<BoardSubtask> {
  return invoke<BoardSubtask>("create_list_board_subtask", request);
}

export function updateListBoardSubtaskTitle(
  request: UpdateListBoardSubtaskTitleRequest,
): Promise<BoardSubtask> {
  return invoke<BoardSubtask>("update_list_board_subtask_title", request);
}

export function setListBoardSubtaskCompletion(
  request: SetListBoardSubtaskCompletionRequest,
): Promise<BoardSubtask> {
  return invoke<BoardSubtask>("set_list_board_subtask_completion", request);
}

export function reorderListBoardSubtasks(
  request: ReorderListBoardSubtasksRequest,
): Promise<BoardSubtask[]> {
  return invoke<BoardSubtask[]>("reorder_list_board_subtasks", request);
}

export function deleteListBoardSubtask(
  request: DeleteListBoardSubtaskRequest,
): Promise<void> {
  return invoke<void>("delete_list_board_subtask", request);
}
