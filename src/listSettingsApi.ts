import { invoke } from "@tauri-apps/api/core";
import { emitBoardInvalidated } from "./boardInvalidation";

export type ArchivedListTaskPreview = {
  id: string;
  title: string;
};

export type ArchivedListSummary = {
  id: string;
  title: string;
  color: string | null;
  iconAsset: string | null;
  iconId?: string | null;
  archivedAt: string;
  previewTasks: ArchivedListTaskPreview[];
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
  hasNote: boolean;
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

export async function archiveListFromSettings(listId: string): Promise<void> {
  await invoke<void>("archive_list_from_settings", { listId });
  await emitBoardInvalidated();
}

export async function restoreListFromSettings(listId: string): Promise<void> {
  await invoke<void>("restore_list_from_settings", { listId });
  await emitBoardInvalidated();
}

export async function permanentlyDeleteListFromSettings(listId: string): Promise<void> {
  await invoke<void>("permanently_delete_list_from_settings", { listId });
  await emitBoardInvalidated();
}
