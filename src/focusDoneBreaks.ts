import { invoke } from "@tauri-apps/api/core";
import {
  addReportDays,
  reportDateKeyInTimeZone,
  zonedReportDateStartIso,
} from "./reportOverviewPresentation";

/** Durable closed Break-session projection, never a completed task. */
export type FocusDoneBreak = {
  id: string;
  endedAt: string;
  durationSeconds: string;
};

/** Use the saved board timezone and local calendar day; DST boundaries are not 24h offsets. */
export function focusDoneBreakRangeForDay(dayKey: string, timeZone: string) {
  return {
    dayKey,
    startAt: zonedReportDateStartIso(todayKey, timeZone),
    endAt: zonedReportDateStartIso(addReportDays(dayKey, 1), timeZone),
  };
}

export function focusDoneBreakDayRange(now: Date, timeZone: string) {
  return focusDoneBreakRangeForDay(reportDateKeyInTimeZone(now, timeZone), timeZone);
}

/** One bounded, read-only native query. A list scope never falls back to All Lists. */
export function getFocusDoneBreaks(
  range: { startAt: string; endAt: string },
  listId: string | null,
): Promise<FocusDoneBreak[]> {
  return invoke<FocusDoneBreak[]>("get_focus_done_breaks", {
    startAt: range.startAt,
    endAt: range.endAt,
    listId,
  });
}
