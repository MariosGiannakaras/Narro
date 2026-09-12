import { invoke } from "@tauri-apps/api/core";

export type ArchivedListSummary = {
  id: string;
  title: string;
  color: string | null;
  archivedAt: string;
};

export type ArchiveListFilterSummary = {
  id: string;
  title: string;
  color: string | null;
};

export type ArchivedDoneTaskSummary = {
  id: string;
  listId: string;
  listTitle: string;
  listColor: string | null;
  title: string;
  completedAt: string;
  archivedAt: string;
  timeTakenSeconds: string;
};

export type ArchiveSnapshot = {
  lists: ArchivedListSummary[];
  doneTasks: ArchivedDoneTaskSummary[];
  filterLists: ArchiveListFilterSummary[];
};

export function getArchiveSnapshot(): Promise<ArchiveSnapshot> {
  return invoke<ArchiveSnapshot>("get_archived_lists_for_settings");
}

export async function getArchivedListsForSettings(): Promise<ArchivedListSummary[]> {
  const snapshot = await getArchiveSnapshot();
  return snapshot.lists;
}

export function archiveListFromSettings(listId: string): Promise<void> {
  return invoke<void>("archive_list_from_settings", { listId });
}

export function restoreListFromSettings(listId: string): Promise<void> {
  return invoke<void>("restore_list_from_settings", { listId });
}

export function permanentlyDeleteListFromSettings(listId: string): Promise<void> {
  return invoke<void>("permanently_delete_list_from_settings", { listId });
}
