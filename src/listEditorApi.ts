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

export function createListFromEditor(request: ListEditorRequest): Promise<void> {
  return invoke<void>("create_list_from_editor", { request });
}

export function updateListFromEditor(
  listId: string,
  request: ListEditorRequest,
): Promise<void> {
  return invoke<void>("update_list_from_editor", { listId, request });
}
