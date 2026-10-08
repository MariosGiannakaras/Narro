export type RecurrencePreset = "none" | "daily" | "weekdays" | "weekly" | "monthly" | "custom";
export type RecurrenceUnit = "day" | "week" | "month" | "year";
export type MonthPattern = "date" | "weekdays";

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

function dateParts(date: string): { weekday: string; monthDay: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return null;
  return {
    weekday: WEEKDAY_NAMES[(parsed.getUTCDay() + 6) % 7],
    monthDay: parsed.getUTCDate(),
  };
}

function ordinal(day: number): string {
  const remainder100 = day % 100;
  const suffix = remainder100 >= 11 && remainder100 <= 13 ? "th"
    : day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : day % 10 === 3 ? "rd" : "th";
  return `${day}${suffix}`;
}

function weekdayList(mask: number): string {
  return WEEKDAY_NAMES.filter((_, index) => (mask & (1 << index)) !== 0).join(", ");
}

/** Presentation only: does not alter persisted recurrence rules or materialization. */
export function recurrencePresetLabels(startDate: string): { weekly: string; monthly: string } {
  const date = dateParts(startDate);
  return {
    weekly: date ? `Every ${date.weekday}` : "Every chosen weekday",
    monthly: date ? `Every month on ${ordinal(date.monthDay)}` : "Every month on chosen date",
  };
}

export function recurrenceSummary(input: {
  preset: RecurrencePreset;
  startDate: string;
  interval: number;
  unit: RecurrenceUnit;
  weekdayMask: number;
  monthPattern: MonthPattern;
  monthDay: number;
}): string {
  const { preset, startDate, interval, unit, weekdayMask, monthPattern, monthDay } = input;
  if (preset === "none") return "No repeat";
  if (preset === "daily") return "Every day";
  if (preset === "weekdays") return "Every weekday";
  const date = dateParts(startDate);
  if (preset === "weekly") return date ? `Every ${date.weekday}` : "Choose a start date";
  if (preset === "monthly") return date ? `Every month on ${ordinal(date.monthDay)}` : "Choose a start date";
  if (!Number.isInteger(interval) || interval < 1 || interval > 365) return "Choose a valid interval";
  const suffix = interval === 1 ? unit : `${unit}s`;
  const every = `Every ${interval === 1 ? "" : `${interval} `}${suffix}`;
  if (unit === "week") {
    const selected = weekdayList(weekdayMask);
    return selected ? `${every} on ${selected}` : "Choose at least one weekday";
  }
  if (unit === "month") {
    if (monthPattern === "date") {
      return Number.isInteger(monthDay) && monthDay >= 1 && monthDay <= 31
        ? `${every} on ${ordinal(monthDay)}` : "Choose a valid day of month";
    }
    const selected = weekdayList(weekdayMask);
    // Existing Rust monthly mask means every selected weekday in eligible
    // months, NOT the nth weekday shown in Blitzit (unimplemented B20).
    return selected ? `${every} on each ${selected}` : "Choose at least one weekday";
  }
  return every;
}
