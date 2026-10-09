import type { ListBoardTask } from "./listBoardApi";

type TodayPresentationTask = Pick<ListBoardTask, "completedAt" | "recurrenceRuleId">;

/**
 * Visual cue only: a linked recurrence parent is not an actionable Today task.
 * This is NOT the authoritative eligibility rule for starting Blitz. The Rust
 * start_blitz command retains full authority and may reject even when this
 * presentation returns true (e.g. concurrent changes or an active session).
 * Source evidence shows a subdued empty CTA but does not prove disabled click.
 */
export function hasActionableTodayPreview(tasks: readonly TodayPresentationTask[]): boolean {
  return tasks.some((task) => task.completedAt === null && !task.recurrenceRuleId);
}
