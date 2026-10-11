import fs from "node:fs";
import { hasActionableTodayPreview } from "../src/blitzEntryPresentation.ts";

function assert(condition, label) {
  if (!condition) throw new Error("Empty Today presentation contract: " + label);
}
const pending = { completedAt: null, recurrenceRuleId: null, scheduledLocalTime: null, isOverdue: false };
const completed = { completedAt: "2026-10-09T09:00:00Z", recurrenceRuleId: null };
const parent = { ...pending, recurrenceRuleId: "repeat-a" };
const futureTimed = { ...pending, scheduledLocalTime: "15:00", isOverdue: false };
const dueTimed = { ...futureTimed, isOverdue: true };
assert(!hasActionableTodayPreview([]), "empty Today has no actionable preview task");
assert(!hasActionableTodayPreview([completed]), "completed task cannot brighten CTA");
assert(!hasActionableTodayPreview([parent]), "recurring parent cannot brighten CTA");
assert(!hasActionableTodayPreview([completed, parent]), "non-actionable mix remains muted");
assert(hasActionableTodayPreview([pending]), "ordinary pending Today task can brighten CTA");
assert(!hasActionableTodayPreview([futureTimed]), "future scheduled time must keep CTA muted");
assert(hasActionableTodayPreview([dueTimed]), "Rust-projected due timed task can brighten CTA");
assert(hasActionableTodayPreview([{ ...pending, scheduledLocalTime: null, isOverdue: false }]),
  "date-only or unscheduled Today task remains actionable");
assert(!hasActionableTodayPreview([{ ...futureTimed, completedAt: "2026-10-09T09:00:00Z", isOverdue: true }]),
  "completed timed task does not brighten CTA even when due");
assert(!hasActionableTodayPreview([{ ...dueTimed, recurrenceRuleId: "repeat-a" }]),
  "recurrence parent does not brighten CTA even after due time");
assert(hasActionableTodayPreview([futureTimed, pending]), "eligible ordinary task overrides future-only muted state");
assert(hasActionableTodayPreview([parent, { ...pending, recurrenceRuleId: null }]), "generated child can brighten CTA");
const input = Object.freeze([Object.freeze({ ...pending })]);
assert(hasActionableTodayPreview(input), "read-only input accepted");
assert(input[0].completedAt === null, "presentation must not mutate tasks");

const board = fs.readFileSync("src/ListBoard.tsx", "utf8");
const button = fs.readFileSync("src/BlitzEntryButton.tsx", "utf8");
const css = fs.readFileSync("src/blitzEntryButton.css", "utf8");
const backend = fs.readFileSync("src-tauri/src/list_board.rs", "utf8");
assert(backend.includes("ScheduleKind::LocalDateTime => Ok(matches!(")
  && backend.includes("FocusEligibility::Eligible"),
  "timed eligibility advisory comes from authoritative Rust board projection");
assert(board.includes('pendingLane !== null ? "All Clear" : "No tasks"'), "empty pending lanes source copy");
assert(board.includes("!hasActionableTodayPreview(lane.tasks)"), "Today display cue is scoped to visible board");
assert(button.includes("data-blitz-entry-muted={visuallyMuted"), "display-only DOM marker");
assert(button.includes("disabled={pending}"), "do not disable based on unverified source click");
assert(button.includes("await startBlitz()"), "Rust start command remains authoritative");
assert(button.includes('outcome.status === "no_eligible_today_tasks"'), "safe authoritative no-op acknowledgement retained");
assert(css.includes('[data-blitz-entry-muted="true"]'), "subdued empty state styling");
console.log("Empty Today/source-uncertainty presentation contracts: PASS");
