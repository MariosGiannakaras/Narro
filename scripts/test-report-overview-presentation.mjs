import {
  addReportDays,
  buildReportCalendarMonths,
  defaultReportDateRange,
  normalizeReportDateRange,
  reportPresetRange,
  reportRangeRequestBounds,
  zonedReportDateStartIso,
} from "../src/reportOverviewPresentation.ts";

function invariant(condition, message) {
  if (!condition) throw new Error("Report Overview presentation contract failed: " + message);
}

invariant(addReportDays("2026-03-01", -1) === "2026-02-28", "date arithmetic must cross month boundaries");
invariant(
  JSON.stringify(defaultReportDateRange("2026-10-03"))
    === JSON.stringify({ startDateKey: "2026-09-03", endDateKey: "2026-10-03" }),
  "default range must follow the source-evidenced Last 30 days boundary",
);
invariant(
  JSON.stringify(reportPresetRange("This week", "2026-10-03"))
    === JSON.stringify({ startDateKey: "2026-09-28", endDateKey: "2026-10-03" }),
  "This week must start on Monday",
);
invariant(
  JSON.stringify(normalizeReportDateRange("2026-10-03", "2026-09-30"))
    === JSON.stringify({ startDateKey: "2026-09-30", endDateKey: "2026-10-03" }),
  "custom range endpoints must normalize in calendar order",
);
invariant(
  zonedReportDateStartIso("2026-07-01", "Europe/Athens") === "2026-06-30T21:00:00.000Z",
  "Athens summer local midnight must convert to the correct UTC instant",
);
invariant(
  zonedReportDateStartIso("2026-01-01", "Europe/Athens") === "2025-12-31T22:00:00.000Z",
  "Athens winter local midnight must convert to the correct UTC instant",
);
invariant(
  JSON.stringify(reportRangeRequestBounds(
    { startDateKey: "2026-09-03", endDateKey: "2026-10-03" },
    "UTC",
  )) === JSON.stringify({
    startAt: "2026-09-03T00:00:00.000Z",
    endAt: "2026-10-04T00:00:00.000Z",
  }),
  "report range must use an exclusive next-day end boundary",
);

const calendars = buildReportCalendarMonths(
  "2026-09-01",
  { startDateKey: "2026-09-28", endDateKey: "2026-10-03" },
  "en-US",
);
invariant(calendars.length === 2, "date picker must render exactly two adjacent months");
invariant(calendars[0].weeks.flat().length === 42, "first calendar must use a stable six-week grid");
invariant(calendars[1].weeks.flat().length === 42, "second calendar must use a stable six-week grid");
const selected = calendars.flatMap((month) => month.weeks.flat()).filter((day) => day.selected);
invariant(selected.some((day) => day.dateKey === "2026-09-28"), "selected range start must be represented");
invariant(selected.some((day) => day.dateKey === "2026-10-03"), "selected range end must be represented");

console.log("Report Overview presentation/date contracts: PASS");
