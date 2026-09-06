const LOCAL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_TIME_PATTERN = /^(\d{2}):(\d{2})$/;

export type VisibleDateTimePreferences = {
  locale: string;
  calendar: string;
  hour12: boolean | null;
  timeZone: string;
};

function invalidValue(kind: "date" | "time", value: string): RangeError {
  return new RangeError(`Invalid local ${kind}: ${value}`);
}

export function parseLocalCalendarDate(value: string): Date {
  const match = LOCAL_DATE_PATTERN.exec(value);
  if (!match) {
    throw invalidValue("date", value);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw invalidValue("date", value);
  }

  return date;
}

function parseLocalClockTime(value: string): { hour: number; minute: number } {
  const match = LOCAL_TIME_PATTERN.exec(value);
  if (!match) {
    throw invalidValue("time", value);
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    throw invalidValue("time", value);
  }

  return { hour, minute };
}

function localClockDate(value: string): Date {
  const { hour, minute } = parseLocalClockTime(value);
  return new Date(2000, 0, 1, hour, minute, 0, 0);
}

function localDateTimeDate(localDate: string, localTime: string): Date {
  const date = parseLocalCalendarDate(localDate);
  const { hour, minute } = parseLocalClockTime(localTime);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function formatVisibleDate(
  localDate: string,
  locales?: Intl.LocalesArgument,
): string {
  return new Intl.DateTimeFormat(locales, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parseLocalCalendarDate(localDate));
}

export function formatVisibleTime(
  localTime: string,
  locales?: Intl.LocalesArgument,
): string {
  return new Intl.DateTimeFormat(locales, {
    hour: "numeric",
    minute: "2-digit",
  }).format(localClockDate(localTime));
}

export function formatVisibleDateTime(
  localDate: string,
  localTime: string,
  locales?: Intl.LocalesArgument,
): string {
  return new Intl.DateTimeFormat(locales, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(localDateTimeDate(localDate, localTime));
}

export function resolveVisibleDateTimePreferences(
  locales?: Intl.LocalesArgument,
): VisibleDateTimePreferences {
  const resolved = new Intl.DateTimeFormat(locales, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).resolvedOptions();

  return {
    locale: resolved.locale,
    calendar: resolved.calendar,
    hour12: resolved.hour12 ?? null,
    timeZone: resolved.timeZone,
  };
}
