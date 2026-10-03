export type ReportDateRange = {
  startDateKey: string;
  endDateKey: string;
};

export type ReportDatePreset =
  | "Today"
  | "Yesterday"
  | "This week"
  | "Last 30 days"
  | "Last 60 days"
  | "Last 90 days";

export type ReportCalendarMonth = {
  label: string;
  weeks: Array<Array<{
    key: string;
    label: string;
    dateKey: string;
    muted?: boolean;
    selected?: boolean;
    edge?: "start" | "end";
  }>>;
};

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

function dateParts(dateKey: string): { year: number; month: number; day: number } {
  const match = DATE_KEY.exec(dateKey);
  if (!match) throw new Error(`Invalid report date key: ${dateKey}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year
    || probe.getUTCMonth() !== month - 1
    || probe.getUTCDate() !== day
  ) {
    throw new Error(`Invalid report date key: ${dateKey}`);
  }
  return { year, month, day };
}

function keyFromUtcDate(date: Date): string {
  return [
    date.getUTCFullYear().toString().padStart(4, "0"),
    (date.getUTCMonth() + 1).toString().padStart(2, "0"),
    date.getUTCDate().toString().padStart(2, "0"),
  ].join("-");
}

function utcDateFromKey(dateKey: string): Date {
  const { year, month, day } = dateParts(dateKey);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addReportDays(dateKey: string, days: number): string {
  const date = utcDateFromKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return keyFromUtcDate(date);
}

export function reportMonthStart(dateKey: string): string {
  const { year, month } = dateParts(dateKey);
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-01`;
}

export function addReportMonths(dateKey: string, months: number): string {
  const { year, month } = dateParts(reportMonthStart(dateKey));
  return keyFromUtcDate(new Date(Date.UTC(year, month - 1 + months, 1)));
}

function zonedParts(timestampMs: number, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const values = Object.fromEntries(
    formatter
      .formatToParts(new Date(timestampMs))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

export function reportDateKeyInTimeZone(now: Date, timeZone: string): string {
  const parts = zonedParts(now.getTime(), timeZone);
  return [
    parts.year.toString().padStart(4, "0"),
    parts.month.toString().padStart(2, "0"),
    parts.day.toString().padStart(2, "0"),
  ].join("-");
}

export function zonedReportDateStartIso(dateKey: string, timeZone: string): string {
  const { year, month, day } = dateParts(dateKey);
  const desiredWallClock = Date.UTC(year, month - 1, day, 0, 0, 0);
  let candidate = desiredWallClock;

  for (let index = 0; index < 4; index += 1) {
    const observed = zonedParts(candidate, timeZone);
    const observedWallClock = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
      observed.second,
    );
    const correction = desiredWallClock - observedWallClock;
    if (correction === 0) break;
    candidate += correction;
  }

  return new Date(candidate).toISOString();
}

export function reportRangeRequestBounds(range: ReportDateRange, timeZone: string) {
  return {
    startAt: zonedReportDateStartIso(range.startDateKey, timeZone),
    endAt: zonedReportDateStartIso(addReportDays(range.endDateKey, 1), timeZone),
  };
}

export function defaultReportDateRange(todayKey: string): ReportDateRange {
  return {
    startDateKey: addReportDays(todayKey, -30),
    endDateKey: todayKey,
  };
}

export function reportPresetRange(
  preset: ReportDatePreset,
  todayKey: string,
): ReportDateRange {
  switch (preset) {
    case "Today":
      return { startDateKey: todayKey, endDateKey: todayKey };
    case "Yesterday": {
      const yesterday = addReportDays(todayKey, -1);
      return { startDateKey: yesterday, endDateKey: yesterday };
    }
    case "This week": {
      const date = utcDateFromKey(todayKey);
      const sundayBased = date.getUTCDay();
      const mondayOffset = sundayBased === 0 ? 6 : sundayBased - 1;
      return {
        startDateKey: addReportDays(todayKey, -mondayOffset),
        endDateKey: todayKey,
      };
    }
    case "Last 30 days":
      return { startDateKey: addReportDays(todayKey, -30), endDateKey: todayKey };
    case "Last 60 days":
      return { startDateKey: addReportDays(todayKey, -60), endDateKey: todayKey };
    case "Last 90 days":
      return { startDateKey: addReportDays(todayKey, -90), endDateKey: todayKey };
  }
}

export function normalizeReportDateRange(
  firstDateKey: string,
  secondDateKey: string,
): ReportDateRange {
  dateParts(firstDateKey);
  dateParts(secondDateKey);
  return firstDateKey <= secondDateKey
    ? { startDateKey: firstDateKey, endDateKey: secondDateKey }
    : { startDateKey: secondDateKey, endDateKey: firstDateKey };
}

export function formatReportRangeLabel(
  range: ReportDateRange,
  locale: string,
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${formatter.format(utcDateFromKey(range.startDateKey))} – ${formatter.format(utcDateFromKey(range.endDateKey))}`;
}

export function formatReportDayLabel(dateKey: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(utcDateFromKey(dateKey));
}

export function formatReportCompletionDate(
  timestamp: string,
  locale: string,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone,
  }).format(new Date(timestamp));
}

export function formatReportDuration(seconds: string | number | null): string {
  if (seconds === null) return "—";
  let numeric: number;
  if (typeof seconds === "number") {
    numeric = seconds;
  } else {
    try {
      const parsed = BigInt(seconds);
      const capped = parsed > BigInt(Number.MAX_SAFE_INTEGER)
        ? BigInt(Number.MAX_SAFE_INTEGER)
        : parsed;
      numeric = Number(capped);
    } catch {
      return "—";
    }
  }
  if (!Number.isFinite(numeric) || numeric < 0) return "—";
  const totalMinutes = Math.max(0, Math.round(numeric / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}hr`;
  return `${hours}hr ${minutes}min`;
}

export function reportSecondsNumber(seconds: string): number {
  try {
    const parsed = BigInt(seconds);
    if (parsed < 0n) return 0;
    return Number(parsed > BigInt(Number.MAX_SAFE_INTEGER)
      ? BigInt(Number.MAX_SAFE_INTEGER)
      : parsed);
  } catch {
    return 0;
  }
}

export function formatProductiveHour(
  localHourStart: number | null,
  locale: string,
): string {
  if (localHourStart === null) return "—";
  const format = (hour: number) => new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2026, 0, 5, hour)));
  return `${format(localHourStart)}–${format((localHourStart + 1) % 24)}`;
}

export function formatProductiveWeekday(
  weekdayFromMonday: number | null,
  locale: string,
): string {
  if (weekdayFromMonday === null) return "—";
  const monday = new Date(Date.UTC(2026, 0, 5 + weekdayFromMonday));
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    timeZone: "UTC",
  }).format(monday);
}

export function formatProductiveMonth(
  monthKey: string | null,
  locale: string,
): string {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) return "—";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${monthKey}-01T00:00:00Z`));
}

export function buildReportCalendarMonths(
  anchorMonthKey: string,
  selectedRange: ReportDateRange,
  locale: string,
): ReportCalendarMonth[] {
  return [0, 1].map((monthOffset) => {
    const monthStartKey = addReportMonths(anchorMonthKey, monthOffset);
    const monthStart = utcDateFromKey(monthStartKey);
    const gridStart = new Date(monthStart);
    gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay());
    const monthIndex = monthStart.getUTCMonth();

    const cells = Array.from({ length: 42 }, (_, index) => {
      const cellDate = new Date(gridStart);
      cellDate.setUTCDate(gridStart.getUTCDate() + index);
      const dateKey = keyFromUtcDate(cellDate);
      const selected = dateKey >= selectedRange.startDateKey
        && dateKey <= selectedRange.endDateKey;
      return {
        key: `${monthStartKey}:${dateKey}`,
        label: cellDate.getUTCDate().toString(),
        dateKey,
        muted: cellDate.getUTCMonth() !== monthIndex,
        selected,
        edge: dateKey === selectedRange.startDateKey
          ? "start" as const
          : dateKey === selectedRange.endDateKey
            ? "end" as const
            : undefined,
      };
    });
    const weeks = [];
    for (let index = 0; index < cells.length; index += 7) {
      weeks.push(cells.slice(index, index + 7));
    }
    return {
      label: new Intl.DateTimeFormat(locale, {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(monthStart),
      weeks,
    };
  });
}
