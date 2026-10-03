import fs from "node:fs";
import { resolveInAppShortcut } from "../src/inAppShortcuts.ts";

const invariant = (condition, message) => {
  if (!condition) throw new Error(`In-app shortcut contract failed: ${message}`);
};

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
invariant(resolveInAppShortcut(chord("f", { altKey: false })) === "search", "Ctrl+F must resolve to search");
invariant(resolveInAppShortcut(chord("f", { ctrlKey: false })) === null, "Ctrl is required");
invariant(resolveInAppShortcut(chord("t", { shiftKey: true })) === null, "Shift variants must not alias");
invariant(resolveInAppShortcut(chord("t", { metaKey: true })) === null, "Meta variants must not alias");
invariant(resolveInAppShortcut(chord("t", { repeat: true })) === null, "held keys must not repeat destructive actions");
invariant(resolveInAppShortcut(chord("x")) === null, "unknown Ctrl+Alt chords must remain free");

for (const [key, expected] of cases) {
  const code = 'Key' + key.toUpperCase();
  invariant(resolveInAppShortcut(chord('τ', { code })) === expected, code + ' must resolve independently of translated Greek key');
  invariant(resolveInAppShortcut(chord(key, { code, repeat: true })) === null, 'physical held chords must not repeat');
}
invariant(resolveInAppShortcut(chord('φ', { code: 'KeyF', altKey: false })) === 'search', 'Greek physical Ctrl+F must resolve search');
invariant(resolveInAppShortcut(chord('t', { code: 'KeyX' })) === null, 'a known semantic key must not override a different physical key');
invariant(resolveInAppShortcut(chord('t', { code: 'Unidentified' })) === 'create-task', 'unknown physical codes retain semantic fallback');

const appShell = fs.readFileSync("src/AppShell.tsx", "utf8");
const coordinator = fs.readFileSync("src/FocusSurfaceCoordinator.tsx", "utf8");
const focusActions = fs.readFileSync("src/FocusLiveActions.tsx", "utf8");
const floating = fs.readFileSync("src/FloatingTimerFoundation.tsx", "utf8");
const searchPalette = fs.readFileSync("src/SearchPalette.tsx", "utf8");

invariant(
  appShell.includes("resolveInAppShortcut(event)")
    && appShell.includes('shortcut === "create-task"')
    && appShell.includes('shortcut === "search"')
    && appShell.includes("initialMode={searchMode}"),
  "Main must route quick-create and search to SearchPalette",
);
invariant(
  appShell.includes('emitTo("focusSurface", FOCUS_IN_APP_SHORTCUT_EVENT, shortcut)')
    && appShell.includes("snapshotTimerSession()")
    && !appShell.includes('emitTo("floatingTimer"')
    && !appShell.includes("pauseTimer(")
    && !appShell.includes("completeTimerTask("),
  "Main Focus actions must target the one focusSurface after a read-only authoritative snapshot",
);

for (const shortcut of ["start-break", "pause-resume", "skip-task", "finish-task", "notes"]) {
  invariant(focusActions.includes(`case "${shortcut}"`), `Focus action shortcut ${shortcut} is not wired`);
}
invariant(
  focusActions.includes("listen<InAppShortcut>(FOCUS_IN_APP_SHORTCUT_EVENT")
    && focusActions.includes("shortcutHandlerRef.current(event.payload)")
    && focusActions.includes("if (fixtureMode || !presentationActive) return;"),
  "only the committed presentation may listen for action shortcuts",
);
for (const authority of ["startManualBreakTimer", "pauseTimer", "resumeTimer", "skipTimerTask", "completeTimerTask"]) {
  invariant(focusActions.includes(authority), `Focus shortcuts must reuse authoritative API ${authority}`);
}
invariant(
  coordinator.includes('shortcut !== "create-task"')
    && coordinator.includes('shortcut === "search"')
    && coordinator.includes("setQuickTaskOpen(true)")
    && coordinator.includes('void requestModeRef.current("panel", true)'),
  "Focus coordinator must open quick-create directly in Panel or transition Timer -> Panel first",
);
invariant(
  coordinator.includes("transitionGateRef.current || timerResizePending"),
  "quick-create and global mode requests must be rejected during presentation mutation",
);
invariant(
  searchPalette.includes("taskCreateOnly")
    && searchPalette.includes('openingMode === "task-create"')
    && searchPalette.includes("onRequestClose"),
  "Focus quick-create must reuse SearchPalette without exposing Search mode",
);
invariant(
  floating.includes('data-floating-actions-controller="true"')
    && floating.includes('style={{ display: expanded ? "contents" : "none" }}')
    && floating.includes("onEnsureNotesVisible={() => requestExpanded(true)}"),
  "collapsed Timer must retain the action controller and safely expand for Notes",
);

console.log("Single-host in-app shortcut contracts passed.");
