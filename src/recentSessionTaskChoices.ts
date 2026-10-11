import type { SearchPaletteTaskResult } from "./searchPaletteApi";

/**
 * Narro-local "Recent Tasks" contract: most recently *modified* saved task
 * first, never lane order. Do not change Search Palette's own ordering or any
 * persisted task sort_rank. Original Blitzit recency algorithm is unobserved.
 *
 * Use comparable absolute instants to handle DST/offsets. An absent or invalid
 * historical update timestamp sorts last, preserving prior source-order ties.
 */
export function orderRecentSessionTasks(
  tasks: readonly SearchPaletteTaskResult[],
): SearchPaletteTaskResult[] {
  const entries = tasks.map((task, index) => {
    const milliseconds = Date.parse(task.updatedAt ?? "");
    return {
      task,
      index,
      updatedMillis: Number.isFinite(milliseconds) ? milliseconds : null,
    };
  });

  entries.sort((left, right) => {
    if (left.updatedMillis === null) {
      return right.updatedMillis === null ? left.index - right.index : 1;
    }
    if (right.updatedMillis === null) return -1;
    if (left.updatedMillis !== right.updatedMillis) {
      return left.updatedMillis > right.updatedMillis ? -1 : 1;
    }
    return left.index - right.index;
  });

  return entries.map(({ task }) => task);
}
