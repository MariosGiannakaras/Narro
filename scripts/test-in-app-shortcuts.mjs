import fs from "node:fs";
import { resolveInAppShortcut } from "../src/inAppShortcuts.ts";

function invariant(condition, message) {
  if (!condition) throw new Error(`In-app shortcut contract failed: ${message}`);
}

function chord(key, overrides = {}) {
  return {
    key,
    ctrlKey: true,
    altKey: true,
    shiftKey: false,
    metaKey: false,
    repeat: false,
    ...overrides,
  };
}

const cases = new Map([
  ["t", "create-task"],
  ["b", "start-break"],
  ["p", "pause-resume"],
  ["s", "skip-task"],
  ["f", "finish-task"],
  ["n", "notes"],
]);

for (const [key, expected] of cases) {
  invariant(resolveInAppShortcut(chord(key)) === expected, `Ctrl+Alt+${key.toUpperCase()} must resolve to ${expected}`);
}
invariant(
  resolveInAppShortcut(chord("f", { altKey: false })) === "search",
  "Ctrl+F must resolve to search",
);
invariant(resolveInAppShortcut(chord("f", { ctrlKey: false })) === null, "Ctrl is required");
invariant(resolveInAppShortcut(chord("t", { shiftKey: true })) === null, "Shift variants must not alias");
invariant(resolveInAppShortcut(chord("t", { metaKey: true })) === null, "Meta variants must not alias");
invariant(resolveInAppShortcut(chord("t", { repeat: true })) === null, "held keys must not repeat destructive actions");
invariant(resolveInAppShortcut(chord("x")) === null, "unknown Ctrl+Alt chords must remain free");

const appShell = fs.readFileSync("src/AppShell.tsx", "utf8");
const focusActions = fs.readFileSync("src/FocusLiveActions.tsx", "utf8");
const focusEntry = fs.readFileSync("src/focus.tsx", "utf8");
const searchPalette = fs.readFileSync("src/SearchPalette.tsx", "utf8");

invariant(
  appShell.includes('resolveInAppShortcut(event)')
    && appShell.includes('shortcut === "create-task"')
    && appShell.includes('shortcut === "search"')
    && appShell.includes('initialMode={searchMode}'),
  "Main must route Ctrl+Alt+T to task-create and Ctrl+F to SearchPalette",
);
for (const shortcut of ["start-break", "pause-resume", "skip-task", "finish-task", "notes"]) {
  invariant(
    focusActions.includes(`case "${shortcut}"`),
    `Focus action shortcut ${shortcut} is not wired`,
  );
}
for (const authority of [
  "startManualBreakTimer",
  "pauseTimer",
  "resumeTimer",
  "skipTimerTask",
  "completeTimerTask",
]) {
  invariant(focusActions.includes(authority), `Focus shortcuts must reuse authoritative API ${authority}`);
}
invariant(
  focusEntry.includes('shortcut === "create-task"')
    && focusEntry.includes('shortcut === "search"')
    && focusEntry.includes('taskCreateOnly')
    && focusEntry.includes("Search is unavailable while Focus mode is open."),
  "Focus surface must support quick task creation and explicitly reject Search",
);
invariant(
  searchPalette.includes("taskCreateOnly")
    && searchPalette.includes('initialMode === "task-create"')
    && searchPalette.includes("onRequestClose"),
  "Focus quick-create must reuse SearchPalette without exposing Search mode",
);

console.log("In-app shortcut contracts passed.");
