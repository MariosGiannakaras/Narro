const LOCAL_CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MILLISECONDS_PER_DAY = 86_400_000;

/** Calendar-day difference in Board display timezone, not elapsed 24-hour
 * periods: DST may have 23/25-hour days. Read-only UI projection only.
 */
export function focusOverdueAge(
  scheduledLocalDate: string,
  displayTimezone: string,
  now: Date,
): string | null {
  if (!LOCAL_CALENDAR_DATE.test(scheduledLocalDate) || !Number.isFinite(now.getTime())) return null;
  const scheduled = new Date(`${scheduledLocalDate}T00:00:00.000Z`);
  if (!Number.isFinite(scheduled.getTime())
    || scheduled.toISOString().slice(0, 10) !== scheduledLocalDate) return null;

  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone: displayTimezone,
      calendar: "gregory",
      numberingSystem: "latn",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
  } catch {
    return null;
  }
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  const deltaDays = (Date.UTC(year, month - 1, day) - scheduled.getTime()) / MILLISECONDS_PER_DAY;
  return Number.isSafeInteger(deltaDays) && deltaDays > 0 ? `${deltaDays}d ago` : null;
}
