const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH = /^(\d{4})-(\d{2})$/;

function utcDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
}

export function validCalendarDate(value: string): boolean {
  const found = DATE.exec(value);
  if (!found) return false;
  const year = Number(found[1]);
  const month = Number(found[2]);
  const day = Number(found[3]);
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  return utcDate(year, month, day).toISOString().slice(0, 10) === value;
}

function validCalendarMonth(value: string): boolean {
  const found = MONTH.exec(value);
  return Boolean(found && Number(found[1]) >= 1 && Number(found[1]) <= 9999
    && Number(found[2]) >= 1 && Number(found[2]) <= 12);
}

export type CalendarDay = { date: string; day: number; isCurrentMonth: boolean };

export function calendarMonthDays(month: string): CalendarDay[] {
  if (!validCalendarMonth(month)) return [];
  const year = Number(month.slice(0, 4));
  const index = Number(month.slice(5, 7));
  const first = utcDate(year, index, 1);
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, position) => {
    const date = utcDate(year, index, position + 1 - mondayOffset);
    const iso = date.toISOString().slice(0, 10);
    return { date: iso, day: date.getUTCDate(), isCurrentMonth: iso.slice(0, 7) === month };
  });
}

export function shiftCalendarMonth(month: string, delta: -1 | 1): string {
  if (!validCalendarMonth(month)) return month;
  const year = Number(month.slice(0, 4));
  const index = Number(month.slice(5, 7));
  if ((year === 1 && index === 1 && delta === -1)
    || (year === 9999 && index === 12 && delta === 1)) return month;
  return utcDate(year, index + delta, 1).toISOString().slice(0, 7);
}

export function calendarMonthLabel(month: string): string {
  if (!validCalendarMonth(month)) return month;
  const date = utcDate(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 1);
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "long", timeZone: "UTC" }).format(date);
}
