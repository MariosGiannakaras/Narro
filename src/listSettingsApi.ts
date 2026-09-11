import { invoke } from "@tauri-apps/api/core";

export type ArchivedListSummary = {
  id: string;
  title: string;
  color: string | null;
  archivedAt: string;
};

export function getArchivedListsForSettings(): Promise<ArchivedListSummary[]> {
  return invoke<ArchivedListSummary[]>("get_archived_lists_for_settings");
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
