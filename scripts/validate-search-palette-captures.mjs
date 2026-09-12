import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");

function invariant(condition, message) {
  if (!condition) throw new Error(`Search palette capture validation failed: ${message}`);
}

function read(label) {
  const file = path.join(outputDirectory, `${label}.html`);
  invariant(fs.existsSync(file), `${label} captured DOM is missing`);
  const dom = fs.readFileSync(file, "utf8");
  invariant(dom.includes('data-search-palette-fixture-ready="true"'), `${label} fixture did not reach ready state`);
  invariant(dom.includes('data-search-palette="main"'), `${label} production palette is missing`);
  invariant(dom.includes('role="dialog"'), `${label} lacks dialog semantics`);
  invariant(dom.includes('aria-modal="true"'), `${label} lacks modal semantics`);
  invariant(!dom.includes("Archived done tasks"), `${label} absorbed later archive scope`);
  return dom;
}

for (const theme of ["light", "dark"]) {
  const empty = read(`search-palette-empty-${theme}`);
  invariant(empty.includes('placeholder="Search for tasks, lists"'), `${theme} search placeholder is missing`);
  invariant(empty.includes("Ctrl+F"), `${theme} Ctrl+F hint is missing`);
  invariant(empty.includes("Quick actions"), `${theme} Quick actions heading is missing`);
  invariant(empty.includes("Add new task"), `${theme} Add new task action is missing`);
  invariant(empty.includes("Add new list"), `${theme} Add new list action is missing`);
  invariant(empty.includes("Go to Reports"), `${theme} Go to Reports action is missing`);

  const results = read(`search-palette-results-${theme}`);
  invariant(results.includes('data-search-palette-results="true"'), `${theme} results projection is missing`);
  invariant(results.includes('data-search-result-kind="list"'), `${theme} list result is missing`);
  invariant(results.includes('data-search-result-kind="task"'), `${theme} task result is missing`);
  invariant(results.includes("Project Atlas"), `${theme} matching list title is missing`);
  invariant(results.includes("Draft project update"), `${theme} matching task title is missing`);

  const noResults = read(`search-palette-no-results-${theme}`);
  invariant(noResults.includes('data-search-palette-empty="true"'), `${theme} no-results marker is missing`);
  invariant(noResults.includes("No matching tasks or lists."), `${theme} no-results copy is missing`);

  const taskCreate = read(`search-palette-task-create-${theme}`);
  invariant(taskCreate.includes('data-search-palette-mode="task-create"'), `${theme} task-create mode is missing`);
  invariant(taskCreate.includes('data-search-task-field="title"'), `${theme} task title field is missing`);
  invariant(taskCreate.includes('data-search-task-field="list"'), `${theme} explicit list field is missing`);
  invariant(taskCreate.includes('data-search-task-field="lane"'), `${theme} explicit lane field is missing`);
  invariant(taskCreate.includes("Choose a list"), `${theme} list placeholder is missing`);
  invariant(taskCreate.includes("Choose a lane"), `${theme} lane placeholder is missing`);
  invariant(taskCreate.includes("Add task"), `${theme} task submit action is missing`);
}

console.log("Search palette capture validation passed.");
