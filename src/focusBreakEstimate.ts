import type { TimerSnapshot } from "./timerSessionApi";

/**
 * View-only Today EST: include the active Break's original planned duration,
 * never the moving remaining/elapsed timers or cumulative prior Break ledger.
 * This value is not written to tasks, board snapshots, or session persistence.
 */
export function focusHeaderEstimateSeconds(
  todayEstSeconds: number,
  timer: TimerSnapshot | null,
  liveTaskBelongsToToday: boolean,
): number {
  if (!liveTaskBelongsToToday || timer?.state !== "break") return todayEstSeconds;
  const plannedMs = timer.break_planned_ms;
  if (!Number.isSafeInteger(todayEstSeconds) || todayEstSeconds < 0
    || typeof plannedMs !== "number" || !Number.isSafeInteger(plannedMs) || plannedMs <= 0) {
    return todayEstSeconds;
  }
  const plannedSeconds = Math.ceil(plannedMs / 1_000);
  if (!Number.isSafeInteger(plannedSeconds)
    || todayEstSeconds > Number.MAX_SAFE_INTEGER - plannedSeconds) {
    return todayEstSeconds;
  }
  return todayEstSeconds + plannedSeconds;
}
