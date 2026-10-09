import fs from "node:fs";
import { hasActionableTodayPreview } from "../src/blitzEntryPresentation.ts";

function assert(condition, label) {
  if (!condition) throw new Error("Empty Today presentation contract: " + label);
}
const pending = { completedAt: null, recurrenceRuleId: null };
const completed = { completedAt: "2026-10-09T09:00:00Z", recurrenceRuleId: null };
const parent = { completedAt: null, recurrenceRuleId: "repeat-a" };
assert(!hasActionableTodayPreview([]), "empty Today has no actionable preview task");
assert(!hasActionableTodayPreview([completed]), "completed task cannot brighten CTA");
assert(!hasActionableTodayPreview([parent]), "recurring parent cannot brighten CTA");
assert(!hasActionableTodayPreview([completed, parent]), "non-actionable mix remains muted");
assert(hasActionableTodayPreview([pending]), "ordinary pending Today task can brighten CTA");
assert(hasActionableTodayPreview([parent, { ...pending, recurrenceRuleId: null }]), "generated child can brighten CTA");
const input = Object.freeze([Object.freeze({ ...pending })]);
assert(hasActionableTodayPreview(input), "read-only input accepted");
assert(input[0].completedAt === null, "presentation must not mutate tasks");

const board = fs.readFileSync("src/ListBoard.tsx", "utf8");
const button = fs.readFileSync("src/BlitzEntryButton.tsx", "utf8");
const css = fs.readFileSync("src/blitzEntryButton.css", "utf8");
assert(board.includes('pendingLane !== null ? "All Clear" : "No tasks"'), "empty pending lanes source copy");
assert(board.includes("!hasActionableTodayPreview(lane.tasks)"), "Today display cue is scoped to visible board");
assert(button.includes("data-blitz-entry-muted={visuallyMuted"), "display-only DOM marker");
assert(button.includes("disabled={pending}"), "do not disable based on unverified source click");
assert(button.includes("await startBlitz()"), "Rust start command remains authoritative");
assert(button.includes('outcome.status === "no_eligible_today_tasks"'), "safe authoritative no-op acknowledgement retained");
assert(css.includes('[data-blitz-entry-muted="true"]'), "subdued empty state styling");
console.log("Empty Today/source-uncertainty presentation contracts: PASS");
