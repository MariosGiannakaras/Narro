import type { TimerStateKind } from "./timerSessionApi";

/**
 * A running Break is a Focus presentation, not a new task or a change to
 * authoritative timer.task_id. Keep the paused work task visible in the
 * ordinary queue without allowing it to be mutated/reordered as queued work.
 */
export function focusBreakPresentation(
  state: TimerStateKind | null,
  activeTaskId: string | null,
  taskTitle: string | null,
): { showBreakCard: boolean; liveTitle: string; suspendedTaskId: string | null } {
  const showBreakCard = state === "break" && activeTaskId !== null && taskTitle !== null;
  return {
    showBreakCard,
    liveTitle: showBreakCard ? "Break" : taskTitle ?? "",
    suspendedTaskId: showBreakCard ? activeTaskId : null,
  };
}
