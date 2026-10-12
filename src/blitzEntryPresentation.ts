import type { ListBoardTask } from "./listBoardApi";

type TodayPresentationTask = Pick<
  ListBoardTask,
  "completedAt" | "recurrenceRuleId" | "scheduledLocalTime" | "isOverdue"
>;

/**
 * Visual cue only: a linked recurrence parent is not an actionable Today task.
 * For a task scheduled at a specific clock time, reuse the Rust board's
 * isOverdue projection (which checks FocusEligibility) so future-only Today
 * work does not incorrectly brighten Blitz. Date-only tasks remain eligible.
 *
 * This is NOT authoritative start eligibility: snapshots may go stale and an
 * active session may already exist. The Rust start_blitz command still owns
 * all actual start/no-eligible/already-active outcomes. Historical source
 * evidence confirms muted empty CTA, not exact click/disabled behavior.
 */
export function hasActionableTodayPreview(tasks: readonly TodayPresentationTask[]): boolean {
  return tasks.some((task) =>
    task.completedAt === null
    && !task.recurrenceRuleId
    && (task.scheduledLocalTime === null || task.isOverdue),
  );
}
