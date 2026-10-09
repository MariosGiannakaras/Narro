import { invoke } from "@tauri-apps/api/core";
import { emitBoardInvalidated } from "./boardInvalidation";

export type ListIconUploadRequest = {
  filename: string;
  bytes: number[];
};

export type ListIconSelection =
  | { kind: "keep" }
  | { kind: "letter" }
  | { kind: "builtin"; id: string }
  | { kind: "upload"; filename: string; bytes: number[] };

export type ListEditorRequest = {
  title: string;
  color: string | null;
  // Legacy direct upload remains accepted by the Rust boundary.
  iconUpload: ListIconUploadRequest | null;
  iconSelection?: ListIconSelection;
};

export async function createListFromEditor(request: ListEditorRequest): Promise<void> {
  await invoke<void>("create_list_from_editor", { request });
  await emitBoardInvalidated();
}

export async function updateListFromEditor(
  listId: string,
  request: ListEditorRequest,
): Promise<void> {
  await invoke<void>("update_list_from_editor", { listId, request });
  await emitBoardInvalidated();
}


export type ListIconAssetPayload = {
  mimeType: string;
  bytes: number[];
};

export async function duplicateListFromHome(listId: string): Promise<void> {
  await invoke<void>("duplicate_list_from_home", { listId });
  await emitBoardInvalidated();
}

export function getListIconAsset(listId: string): Promise<ListIconAssetPayload | null> {
  return invoke<ListIconAssetPayload | null>("get_list_icon_asset", { listId });
}
