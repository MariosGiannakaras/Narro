import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = relative => readFileSync(new URL(relative, root), "utf8");

const app = read("src/App.css");
const reportsCss = read("src/reportsOverview.css");
const sessionsCss = read("src/reportsSessions.css");
const focusCss = read("src/focusPanel.css");
const overview = read("src/ReportsOverviewView.tsx");
const sessions = read("src/ReportsSessionsView.tsx");
const focus = read("src/FocusPanel.tsx");
const icon = read("src/ActionIcon.tsx");

function rules(source, selector) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").split("}").filter(rule => {
    const start = rule.lastIndexOf("{");
    const lead = rule.slice(0, start);
    const lastSelector = lead.slice(Math.max(lead.lastIndexOf("}"), lead.lastIndexOf("{")) + 1);
    return start >= 0 && lastSelector.split(",").map(x => x.trim()).includes(selector);
  }).map(rule => rule.slice(rule.lastIndexOf("{") + 1));
}
function singleRule(source, selector) {
  const match = rules(source, selector);
  assert.ok(match.length, "Missing production rule for " + selector);
  return match.join("\n");
}
function property(body, key, expected) {
  assert.ok(body.split(";").some(declaration =>
    declaration.trim() === key + ": " + expected),
    key + " must equal " + expected + " in actual scoped CSS");
}

assert.ok(app.includes("button,") &&
  app.includes("padding: var(--space-2) var(--space-3);"),
  "Base buttons have horizontal padding and calendar icons must override it");
assert.match(reportsCss, /grid-template-columns: 22px 22px minmax\(0, 1fr\) 22px 22px;/,
  "Both Reports calendars reserve exactly 22px for each chevron track");
const calendar = singleRule(reportsCss, ".reports-overview__calendar header button");
for (const [key, value] of Object.entries({
  "box-sizing": "border-box", width: "22px", "min-width": "0",
  height: "22px", "min-height": "0", padding: "0",
  display: "inline-grid", "place-items": "center",
})) property(calendar, key, value);

assert.ok(overview.includes('className="reports-overview__calendar"')
  && sessions.includes('className="reports-overview__calendar"'),
  "Both calendar panels must consume the same corrected selector");
assert.match(sessions, /import "\.\/reportsOverview\.css";/,
  "Sessions calendar must actually import the corrected shared stylesheet");
const inlineSave = singleRule(sessionsCss, ".reports-sessions__inline-confirm");
property(inlineSave, "display", "inline-grid");
property(inlineSave, "place-items", "center");
property(inlineSave, "padding", "0");
const detail = singleRule(sessionsCss, ".reports-sessions__detail-header > button");
const add = singleRule(sessionsCss, ".reports-sessions__add-dialog > header button");
for (const button of [detail, add]) {
  property(button, "display", "inline-grid");
  property(button, "place-items", "center");
  property(button, "padding", "0");
}
const quick = singleRule(focusCss, ".focus-panel__quick-controls button");
property(quick, "display", "inline-grid");
property(quick, "place-items", "center");
property(quick, "box-sizing", "border-box");
property(quick, "width", "32px");
property(quick, "height", "32px");
property(quick, "padding", "0");
assert.match(focus, /className="focus-panel__quick-controls"/);
assert.ok(icon.includes('width: size') && icon.includes('height: size')
  && icon.includes('viewBox: "0 0 24 24"'),
  "Only the controls change: shared SVG viewBox and approved icon catalog remain intact");
assert.ok(!focusCss.includes("translateY(") || !quick.includes("translateY("),
  "Do not mask icon geometry errors using arbitrary visual nudges");
console.log("Reports calendars (Overview/Sessions), Sessions close/save, Focus action center: PASS");
