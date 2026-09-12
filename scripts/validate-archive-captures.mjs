import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const output = path.join(root, "artifacts", "visual-regression");

function read(label) {
  const file = path.join(output, `${label}.html`);
  if (!fs.existsSync(file)) throw new Error(`Missing captured archive DOM: ${file}`);
  return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function common(dom, label) {
  invariant(dom.includes('data-archive-panel="true"'), `${label} archive surface is missing`);
  invariant(dom.includes('role="tablist"'), `${label} archive tablist semantics are missing`);
  invariant(dom.includes("Archived lists"), `${label} Archived lists segment is missing`);
  invariant(dom.includes("Archived done tasks"), `${label} Archived done tasks segment is missing`);
  invariant(dom.includes('data-app-shell="main"'), `${label} production AppShell context is missing`);
}

for (const theme of ["light", "dark"]) {
  const listsEmpty = read(`archive-lists-empty-${theme}`);
  common(listsEmpty, `${theme} archived-lists empty`);
  invariant(listsEmpty.includes('data-archive-tab="lists"'), `${theme} lists segment marker is missing`);
  invariant(listsEmpty.includes('aria-selected="true"'), `${theme} lists segment is not selected`);
  invariant(listsEmpty.includes('data-archived-lists-panel="true"'), `${theme} embedded list archive panel is missing`);
  invariant(listsEmpty.includes('data-archived-lists-empty="true"'), `${theme} archived-list empty state is missing`);
  invariant(listsEmpty.includes("No archived lists found"), `${theme} archived-list empty copy is missing`);

  const doneEmpty = read(`archive-done-empty-${theme}`);
  common(doneEmpty, `${theme} archived-done empty`);
  invariant(doneEmpty.includes('data-archive-tab="done"'), `${theme} done segment marker is missing`);
  invariant(doneEmpty.includes('data-archived-done-panel="true"'), `${theme} archived done panel is missing`);
  invariant(doneEmpty.includes('placeholder="Search archived tasks"'), `${theme} archived task search is missing`);
  invariant(doneEmpty.includes('data-archive-list-filter="true"'), `${theme} archived task list filter is missing`);
  invariant(doneEmpty.includes('data-archived-done-empty="true"'), `${theme} archived done empty state is missing`);
  invariant(doneEmpty.includes("No Archived tasks found"), `${theme} archived done empty copy is missing`);

  const doneFilter = read(`archive-done-filter-${theme}`);
  common(doneFilter, `${theme} archived-done filter`);
  invariant(doneFilter.includes('data-archive-filter-menu="true"'), `${theme} archive filter popup is missing`);
  invariant(doneFilter.includes('role="listbox"'), `${theme} archive filter listbox semantics are missing`);
  for (const option of ["All Lists", "Work", "Study"]) {
    invariant(doneFilter.includes(option), `${theme} archive filter option is missing: ${option}`);
  }

  const doneResults = read(`archive-done-results-${theme}`);
  common(doneResults, `${theme} archived-done results`);
  invariant(doneResults.includes('data-archived-done-results="true"'), `${theme} archived task result region is missing`);
  invariant((doneResults.match(/data-archived-task-id=/g) ?? []).length === 2, `${theme} archive results must render two stable task identities`);
  invariant(doneResults.includes("Ship quarterly planning notes"), `${theme} first archived task is missing`);
  invariant(doneResults.includes("Review distributed systems chapter"), `${theme} second archived task is missing`);
  invariant(!doneResults.includes("Restoring…"), `${theme} archived done task surface must not expose list restore action`);
  invariant(!doneResults.includes("Permanently delete"), `${theme} archived done task surface must remain read-only in item 26`);
}

console.log("Archive captured DOM contracts: PASS");
