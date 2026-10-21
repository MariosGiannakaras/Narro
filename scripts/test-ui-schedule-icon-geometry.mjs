import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const css = read("src/taskScheduleDialog.css");
const calendar = read("src/ScheduleCalendarStep.tsx");
const dialog = read("src/TaskScheduleDialog.tsx");
const fixture = read("src/taskScheduleVisualFixture.tsx");
const capture = read("scripts/capture-visual-fixtures.ps1");
const actionIcon = read("src/ActionIcon.tsx");

// Scope the declaration check to each actual CSS selector, not unrelated
// properties elsewhere in the stylesheet. Existing rem values are preserved.
function declarations(selector) {
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rule = [...cleaned.matchAll(/([^{}]+)\\{([^{}]*)\\}/g)].find((match) =>
    match[1].split(",").map((part) => part.trim()).includes(selector));
  assert.ok(rule, "Production Schedule CSS selector missing: " + selector);
  return rule[2].split(";").map((line) => line.trim()).filter(Boolean);
}
function expectDeclarations(selector, entries) {
  const actual = declarations(selector);
  for (const entry of entries) {
    assert.ok(actual.includes(entry), selector + " missing geometry invariant: " + entry);
  }
}
const arrowSelector = ".task-schedule-dialog__calendar-navigation button";
expectDeclarations(arrowSelector, [
  "box-sizing: border-box",
  "display: inline-grid",
  "place-items: center",
  "width: 2.25rem", "min-width: 2.25rem",
  "height: 2.25rem", "min-height: 2.25rem",
  "padding: 0",
  "border: 1px solid var(--color-border-subtle)",
]);
expectDeclarations(".task-schedule-dialog__pick-date", [
  "display: inline-flex", "align-items: center", "gap: var(--space-1)",
  "justify-self: start", "min-height: 2.2rem",
]);
expectDeclarations(".task-schedule-dialog__text-action", [
  "display: inline-flex", "align-items: center",
  "justify-content: center", "gap: var(--space-1)",
]);
expectDeclarations(".task-schedule-dialog__shortcut", [
  "min-height: 2rem",
  "padding: 0 var(--space-3)",
  "background: var(--color-surface-interactive)",
]);
for (const [ariaLabel, name, handler] of [
  ["Previous calendar month", "chevron-left", "shiftCalendarMonth(current, -1)"],
  ["Next calendar month", "chevron-right", "shiftCalendarMonth(current, 1)"],
]) {
  assert.ok(calendar.includes('aria-label="' + ariaLabel + '"'));
  assert.ok(calendar.includes('<ActionIcon name="' + name + '" />'));
  assert.ok(calendar.includes(handler), "Month arrow must retain its original date transition");
}
assert.ok(calendar.includes('disabled={disabled || month === "0001-01"}') &&
  calendar.includes('disabled={disabled || month === "9999-12"}'),
  "Native calendar bounds and disabled behavior must not be altered");
assert.ok(dialog.includes('className="task-schedule-dialog__pick-date motion-interactive"') &&
  dialog.includes('data-task-schedule-control="pick-date"') &&
  dialog.includes('onClick={() => setCalendarStep("date")}') &&
  dialog.includes('<ActionIcon name="chevron-left" /> PICK DATE'),
  "Icon/text alignment may not change the Back-to-date owner or label");
assert.ok(dialog.includes('className="task-schedule-dialog__text-action motion-interactive"') &&
  dialog.includes('data-task-schedule-control="time-toggle"') &&
  dialog.includes('scheduleUseTime ? <><ActionIcon name="close" /> REMOVE</> : <><ActionIcon name="plus" /> ADD</>'),
  "Add/Remove Time keeps both action glyphs and authoritative handlers");
assert.ok(actionIcon.includes('viewBox: "0 0 24 24"') &&
  actionIcon.includes('width: size') && actionIcon.includes('height: size'),
  "Shared SVG glyph geometry is unchanged");
assert.ok(fixture.includes("TaskScheduleDialog") &&
  fixture.includes('import "./taskScheduleDialog.css"') &&
  capture.includes("task-schedule"),
  "Actual Schedule fixture/capture consumer remains connected");
console.log("Schedule icon geometry, 36px month chevrons, icon/label baselines and existing navigation: PASS");
