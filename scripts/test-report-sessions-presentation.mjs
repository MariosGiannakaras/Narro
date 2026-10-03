import {
  reportSessionDurationSeconds,
  reportTimestampInputParts,
  zonedReportDateTimeIso,
} from "../src/reportOverviewPresentation.ts";

function invariant(condition, message) {
  if (!condition) throw new Error("Reports Sessions presentation contract failed: " + message);
}

const utc = zonedReportDateTimeIso("2026-12-04", "15:54", "UTC");
invariant(utc === "2026-12-04T15:54:00.000Z", "UTC local timestamp mapping differs");
const utcParts = reportTimestampInputParts(utc, "UTC");
invariant(
  utcParts.dateKey === "2026-12-04" && utcParts.timeKey === "15:54",
  "UTC input round-trip differs",
);

const athens = zonedReportDateTimeIso("2026-12-04", "15:54", "Europe/Athens");
const athensParts = reportTimestampInputParts(athens, "Europe/Athens");
invariant(
  athensParts.dateKey === "2026-12-04" && athensParts.timeKey === "15:54",
  "IANA timezone local input round-trip differs",
);

invariant(
  reportSessionDurationSeconds(
    "2026-12-04T15:54:00.000Z",
    "2026-12-04T17:54:00.000Z",
  ) === 7200,
  "two-hour session duration differs",
);
invariant(
  reportSessionDurationSeconds(
    "2026-12-04T17:54:00.000Z",
    "2026-12-04T15:54:00.000Z",
  ) === null,
  "reversed session duration must fail closed",
);

let nonexistentTimeRejected = false;
try {
  zonedReportDateTimeIso("2026-03-08", "02:30", "America/New_York");
} catch {
  nonexistentTimeRejected = true;
}
invariant(nonexistentTimeRejected, "DST-skipped local time must fail closed");

console.log("Reports Sessions presentation contracts: PASS");
