import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, root), "utf8").replace(/\r\n/g, "\n");

function requireText(haystack, needle, label) {
  if (!haystack.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

const rust = read("src-tauri/src/list_board.rs");
const rustProduction = rust.split("#[cfg(test)]")[0];
const component = read("src/TaskCard.tsx");
const board = read("src/ListBoard.tsx");
const css = read("src/listBoard.css");
const api = read("src/listBoardApi.ts");
const fixtures = read("src/visualFixtures.tsx");
const fixtureCss = read("src/visualFixtures.css");
const capture = read("scripts/capture-visual-fixtures.ps1");
const validator = read("scripts/validate-task-card-state-captures.mjs");

for (const [haystack, needle, label] of [
  [rust, "task_time_taken_seconds(conn, task.id)?", "authoritative Time Taken read"],
  [rust, "scheduled_local_date: projected.task.scheduled_local_date", "schedule date projection"],
  [rust, "scheduled_local_time: projected.task.scheduled_local_time", "schedule time projection"],
  [rust, "task_is_overdue_at", "read-only overdue projection"],
  [rust, "FocusEligibility::Eligible", "validated M4 timed-overdue semantics"],
  [rust, "ScheduleKind::DateOnly", "date-only overdue semantics"],
  [api, "timeTakenSeconds: string", "lossless renderer Time Taken representation"],
  [api, "scheduledLocalDate: string | null", "typed schedule-date projection"],
  [api, "scheduledLocalTime: string | null", "typed schedule-time projection"],
  [api, "isOverdue: boolean", "typed overdue projection"],
  [component, 'data-board-task="task-card"', "task-card identity"],
  [component, "data-task-card-state={state}", "explicit task-card state marker"],
  [component, '"action_revealed"', "action-revealed state"],
  [component, '"inline_create"', "inline-create state"],
  [component, '"notes_expanded"', "notes-expanded state"],
  [component, '"subtasks_expanded"', "subtasks-expanded state"],
  [component, '"paused_editable"', "paused/editable state"],
  [component, '"destructive_confirm"', "destructive-confirm state"],
  [component, "formatVisibleDateTime", "Windows-locale schedule formatting"],
  [component, "BigInt(rawSeconds)", "lossless Time Taken formatting"],
  [component, 'data-task-actions="reorder"', "production reorder action rail"],
  [component, 'data-task-action-slot="reserved"', "reserved action slot marker"],
  [component, 'aria-label={label}', "accessible action labels"],
  [component, 'data-fixture-only-body="notes-expanded"', "fixture-only notes expansion"],
  [component, "Links open only after explicit activation.", "explicit-only note URL policy"],
  [component, "This presentation does not perform a deletion.", "non-mutating destructive confirmation"],
  [board, "actions={taskActions}", "production board task-card action callbacks"],
  [css, "grid-template-columns: 1rem minmax(0, 1fr) 4.25rem;", "reserved production action geometry"],
  [css, ".list-board-task__action-slot", "stable action slot"],
  [css, 'data-task-card-state="overdue"', "overdue visual state"],
  [css, 'data-task-card-state="done"', "done visual state"],
  [fixtures, 'requestedFixture === "task-card-states"', "task-card fixture route"],
  [fixtures, "taskCardFixtureStates", "complete deterministic state list"],
  [fixtures, "<TaskCard task={taskForFixtureState(state, index)} aggregateView fixtureState={state} />", "fixture-only state override"],
  [fixtureCss, "grid-template-columns: repeat(4, minmax(0, 1fr));", "capture-safe state gallery"],
  [capture, '"task-card-states"', "task-card Edge capture"],
  [validator, "action reveal changed card width", "no-reflow width validation"],
  [validator, "action reveal changed card height", "no-reflow height validation"],
  [validator, "task-card state geometry differs between light and dark themes", "theme-stable state geometry validation"],
]) {
  requireText(haystack, needle, label);
}

for (const state of [
  "normal",
  "action_revealed",
  "scheduled",
  "overdue",
  "done",
  "inline_create",
  "notes_expanded",
  "subtasks_expanded",
  "paused_editable",
  "destructive_confirm",
]) {
  requireText(fixtures, `"${state}"`, `${state} deterministic fixture state`);
}

for (const forbidden of [
  "invoke(",
  "onDoubleClick=",
  "onDragStart=",
  "onDrop=",
]) {
  if (component.includes(forbidden)) {
    throw new Error(`TaskCard must not own native/domain mutation or drag/drop behavior; found ${forbidden}`);
  }
}

for (const forbidden of [
  "create_task",
  "update_task",
  "move_task",
  "complete_task",
  "reopen_task",
  "archive_task",
  "delete_task",
]) {
  if (rustProduction.includes(forbidden)) {
    throw new Error(`Task-card read projection must not call task mutation ${forbidden}`);
  }
}

for (const forbidden of ["href=", "window.open", "openUrl", "@tauri-apps/plugin-opener"]) {
  if (component.includes(forbidden)) {
    throw new Error(`Task-card presentation must not activate note URLs; found ${forbidden}`);
  }
}

for (const forbidden of ["--color-text-muted", "--motion-duration-interactive", "--motion-distance-interactive"]) {
  if (css.includes(forbidden)) {
    throw new Error(`Task-card styles must use validated shared tokens only; found ${forbidden}.`);
  }
}

console.log("Task-card state-model contract checks passed.");
