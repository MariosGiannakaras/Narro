import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("../", import.meta.url).pathname);
const output = path.join(root, "artifacts", "visual-regression");

function readCapture(mode, theme) {
  const capturePath = path.join(output, `search-palette-${mode}-${theme}.html`);
  if (!fs.existsSync(capturePath)) throw new Error(`Missing search palette capture: ${capturePath}`);
  const html = fs.readFileSync(capturePath, "utf8");
  if (!html.includes('data-search-palette-fixture-ready="true"')) {
    throw new Error(`Search palette fixture did not reach ready state: ${mode}/${theme}`);
  }
  if (!html.includes('data-search-palette="main"') || !html.includes('role="dialog"') || !html.includes('aria-modal="true"')) {
    throw new Error(`Search palette dialog semantics missing: ${mode}/${theme}`);
  }
  if (html.includes("Archived done tasks")) {
    throw new Error(`Later archive scope leaked into search palette fixture: ${mode}/${theme}`);
  }
  return html;
}

function requireText(html, needle, label) {
  if (!html.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

for (const theme of ["light", "dark"]) {
  const empty = readCapture("empty", theme);
  for (const [needle, label] of [
    ['placeholder="Search for tasks, lists"', "search placeholder"],
    ["Ctrl+F", "Ctrl+F hint"],
    ["Quick actions", "Quick actions heading"],
    ["Add new task", "Add new task action"],
    ["Add new list", "Add new list action"],
    ["Go to Reports", "Go to Reports action"],
  ]) requireText(empty, needle, `${label} (${theme})`);

  const results = readCapture("results", theme);
  for (const [needle, label] of [
    ['data-search-palette-results="true"', "results projection"],
    ['data-search-result-kind="list"', "list result"],
    ['data-search-result-kind="task"', "task result"],
    ["Project Atlas", "matching list title"],
    ["Draft project update", "matching task title"],
  ]) requireText(results, needle, `${label} (${theme})`);

  const noResults = readCapture("no-results", theme);
  requireText(noResults, 'data-search-palette-empty="true"', `empty result marker (${theme})`);
  requireText(noResults, "No matching tasks or lists.", `empty result copy (${theme})`);

  const taskCreate = readCapture("task-create", theme);
  for (const [needle, label] of [
    ['data-search-palette-mode="task-create"', "task-create mode"],
    ['data-search-task-field="title"', "task title field"],
    ['data-search-task-field="list"', "explicit list field"],
    ['data-search-task-field="lane"', "explicit lane field"],
    ["Choose a list", "list placeholder"],
    ["Choose a lane", "lane placeholder"],
    ["Add task", "task submit action"],
  ]) requireText(taskCreate, needle, `${label} (${theme})`);
}

console.log("Search palette capture validation passed.");
