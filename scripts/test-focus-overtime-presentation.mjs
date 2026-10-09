import { formatOvertimeClock, focusTimerPresentation } from "../src/focusTimerPresentation.ts";

function ok(value, reason) {
  if (!value) throw new Error("B67 overtime contract: " + reason);
}
const base = {
  state: "overtime_running",
  task_id: "task-a",
  mode: { kind: "est_countdown", est_ms: 60_000 },
  work_elapsed_ms: 121_000,
  total_break_ms: 0,
  countdown_remaining_ms: 0,
  overtime_ms: 61_000,
  break_kind: null,
  break_remaining_ms: null,
};
for (const [ms, expected] of [
  [0, "-00:00:00"], [61_000, "-00:01:01"], [62_999, "-00:01:02"],
  [3_600_000, "-01:00:00"], [36_061_000, "-10:01:01"],
]) ok(formatOvertimeClock(ms) === expected, ms + " renders " + expected);
for (const state of ["overtime_running", "overtime_paused"]) {
  const value = focusTimerPresentation({ ...base, state });
  ok(value.text === "-00:01:01", "signed " + state);
  ok(value.label.includes(value.text), "accessible " + state + " label");
}
focusTimerPresentation(base);
ok(base.overtime_ms === 61_000, "presentation never mutates authoritative positive ledger");
ok(formatOvertimeClock(-1) === "--:--", "invalid negative overtime fails closed");
ok(formatOvertimeClock(Number.MAX_SAFE_INTEGER) === "--:--", "unsafe overtime fails closed");
ok(focusTimerPresentation({ ...base, state: "time_up" }).text === "00:00", "Time's Up is distinct");
ok(focusTimerPresentation({ ...base, state: "paused", countdown_remaining_ms: 60_000 }).text === "01:00", "paused countdown unaffected");
ok(focusTimerPresentation({ ...base, state: "break", break_remaining_ms: 60_000 }).text === "01:00", "break clock unaffected");
ok(focusTimerPresentation({ ...base, state: "running", mode: { kind: "count_up" } }).text === "02:01", "count-up unaffected");
console.log("B67 signed overtime presentation contracts passed.");
