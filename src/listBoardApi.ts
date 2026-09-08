import { invoke } from "@tauri-apps/api/core";

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
  scheduledLocalDate: string | null;
  scheduledLocalTime: string | null;
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

export function systemDisplayTimezone(): string {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone?.trim();
  if (!timezone) {
    throw new Error("Windows display timezone could not be resolved.");
  }
  return timezone;
}

export function getListBoardSnapshot(
  target: ListBoardRequestTarget,
): Promise<ListBoardSnapshot> {
  return invoke<ListBoardSnapshot>("get_list_board_snapshot", {
    listId: target.kind === "list" ? target.id : null,
    displayTimezone: systemDisplayTimezone(),
  });
}
