import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
const themes = ["light", "dark"];

function invariant(condition, message) {
  if (!condition) throw new Error(`Task create/edit capture validation failed: ${message}`);
}

function readDom(label) {
  const filePath = path.join(outputDirectory, `${label}.html`);
  invariant(fs.existsSync(filePath), `${label} captured DOM is missing`);
  return fs.readFileSync(filePath, "utf8");
}

function occurrenceCount(value, needle) {
  return value.split(needle).length - 1;
}

for (const theme of themes) {
  const individual = readDom(`list-board-${theme}`);
  invariant(
    occurrenceCount(individual, "data-board-add-task=") === 3,
    `list-board-${theme} must expose exactly three pending-lane Add Task targets`,
  );
  for (const lane of ["backlog", "thisWeek", "today"]) {
    invariant(
      individual.includes(`data-board-add-task="${lane}"`),
      `list-board-${theme} is missing the ${lane} Add Task target`,
    );
  }
  invariant(!individual.includes('data-board-add-task="done"'), `list-board-${theme} must not expose Done task creation`);
  invariant(occurrenceCount(individual, "ADD TASK") === 3, `list-board-${theme} Add Task labels differ from the three pending lanes`);

  const aggregate = readDom(`list-board-all-${theme}`);
  invariant(!aggregate.includes("data-board-add-task="), `list-board-all-${theme} must keep aggregate task creation read-only`);
  invariant(!aggregate.includes("ADD TASK"), `list-board-all-${theme} must not expose Add Task labels`);

  const taskCards = readDom(`task-card-states-${theme}`);
  invariant(
    taskCards.includes('data-fixture-only-body="inline-create"'),
    `task-card-states-${theme} lost the screenshot-backed inline-create presentation`,
  );
  invariant(taskCards.includes("Est. time"), `task-card-states-${theme} lost the deferred EST visual evidence`);
}

console.log("Task creation/editing captured visual contracts: PASS");
