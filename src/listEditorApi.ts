import { invoke } from "@tauri-apps/api/core";

export type ListIconUploadRequest = {
  filename: string;
  bytes: number[];
};

export type ListEditorRequest = {
  title: string;
  color: string | null;
  iconUpload: ListIconUploadRequest | null;
};

export type PersistedList = {
  id: string;
  title: string;
  color: string | null;
  iconAsset: string | null;
  sortRank: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function createListFromEditor(request: ListEditorRequest): Promise<PersistedList> {
  return invoke<PersistedList>("create_list_from_editor", { request });
}

export function updateListFromEditor(
  listId: string,
  request: ListEditorRequest,
): Promise<PersistedList> {
  return invoke<PersistedList>("update_list_from_editor", { listId, request });
}
