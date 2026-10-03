import { emit, listen } from "@tauri-apps/api/event";

export const BOARD_INVALIDATED_EVENT = "board-data-invalidated";

export async function emitBoardInvalidated(): Promise<void> {
  try {
    await emit(BOARD_INVALIDATED_EVENT);
  } catch {
    // The persistence mutation has already committed. A secondary projection
    // notification failure must never turn success into a retryable mutation.
  }
}

export function listenForBoardInvalidation(callback: () => void) {
  return listen(BOARD_INVALIDATED_EVENT, () => callback());
}
