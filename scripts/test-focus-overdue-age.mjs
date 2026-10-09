import { focusOverdueAge } from "../src/focusOverdueAge.ts";
function eq(actual, expected, label) {
  if (actual !== expected) throw new Error("B31 " + label + ": expected " + expected + " got " + actual);
}
const at = (iso) => new Date(iso);
eq(focusOverdueAge("2026-10-08", "Europe/Athens", at("2026-10-09T08:00:00Z")), "1d ago", "one local day");
eq(focusOverdueAge("2026-10-07", "Europe/Athens", at("2026-10-09T08:00:00Z")), "2d ago", "source two local days");
eq(focusOverdueAge("2026-09-30", "Europe/Athens", at("2026-10-09T08:00:00Z")), "9d ago", "month rollover");
eq(focusOverdueAge("2025-12-31", "Europe/Athens", at("2026-01-02T12:00:00Z")), "2d ago", "year rollover");
eq(focusOverdueAge("2026-03-28", "Europe/Athens", at("2026-03-30T09:00:00Z")), "2d ago", "spring DST");
eq(focusOverdueAge("2026-10-24", "Europe/Athens", at("2026-10-26T10:00:00Z")), "2d ago", "fall DST");
eq(focusOverdueAge("2026-10-08", "America/Los_Angeles", at("2026-10-09T01:00:00Z")), null, "still same local day");
eq(focusOverdueAge("2026-10-08", "Europe/Athens", at("2026-10-08T22:00:00Z")), "1d ago", "local day ahead of UTC");
eq(focusOverdueAge("2026-10-09", "Europe/Athens", at("2026-10-09T08:00:00Z")), null, "timed overdue same day generic");
eq(focusOverdueAge("2026-10-10", "Europe/Athens", at("2026-10-09T08:00:00Z")), null, "future never aged");
for (const date of ["2026-02-30", "2026-13-01", "2026-2-08", "invalid", ""]) {
  eq(focusOverdueAge(date, "Europe/Athens", at("2026-10-09T08:00:00Z")), null, "invalid stored " + date);
}
eq(focusOverdueAge("2026-10-08", "not/a_timezone", at("2026-10-09T08:00:00Z")), null, "invalid timezone");
eq(focusOverdueAge("2026-10-08", "Europe/Athens", new Date(NaN)), null, "invalid time");
console.log("B31 Focus local-calendar overdue-age contracts passed.");
