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
const panelRoot = fs.readFileSync("src/focusPanelWindow.tsx", "utf8");
const timerRoot = fs.readFileSync("src/floatingTimerWindow.tsx", "utf8");
const searchPalette = fs.readFileSync("src/SearchPalette.tsx", "utf8");

invariant(
  appShell.includes('resolveInAppShortcut(event)')
    && appShell.includes('shortcut === "create-task"')
    && appShell.includes('shortcut === "search"')
    && appShell.includes('initialMode={searchMode}'),
  "Main must route Ctrl+Alt+T to task-create and Ctrl+F to SearchPalette",
);
invariant(
  appShell.includes('getFocusSurfaceMode().then((mode) =>')
    && appShell.includes('emitTo(mode === "timer" ? "floatingTimer" : "focusSurface", FOCUS_IN_APP_SHORTCUT_EVENT, shortcut)')
    && appShell.includes("snapshotTimerSession()")
    && !appShell.includes("pauseTimer(")
    && !appShell.includes("completeTimerTask("),
  "Main focus shortcuts must target the currently visible renderer after a read-only authoritative snapshot",
);
for (const shortcut of ["start-break", "pause-resume", "skip-task", "finish-task", "notes"]) {
  invariant(
    focusActions.includes(`case "${shortcut}"`),
    `Focus action shortcut ${shortcut} is not wired`,
  );
}
invariant(
  focusActions.includes("listen<InAppShortcut>(FOCUS_IN_APP_SHORTCUT_EVENT")
    && focusActions.includes("shortcutHandlerRef.current(event.payload)"),
  "Focus action shortcuts routed from Main must reach the same live-action handler",
);
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
  focusActions.includes('case "start-break"')
    && focusActions.includes("usePreferenceSettingsProjection(fixtureMode)")
    && focusActions.includes("startManualBreakTimer(defaultBreakMs)")
    && !focusActions.includes("DEFAULT_MANUAL_BREAK_MS")
    && focusActions.includes('timerState === "break"')
    && focusActions.includes("skipBreakTimer"),
  "Start Break and break-resume shortcuts must reuse the authoritative manual-break lifecycle with persisted M8 duration",
);
invariant(
  panelRoot.includes('shortcut !== "create-task"')
    && panelRoot.includes('shortcut === "search"')
    && panelRoot.includes('taskCreateOnly')
    && timerRoot.includes('shortcut !== "create-task"')
    && timerRoot.includes('shortcut === "search"'),
  "both Focus renderers must support quick-create and explicitly reject Search",
);
invariant(
  panelRoot.includes("isFocusActionShortcut(shortcut)")
    && timerRoot.includes("isFocusActionShortcut(shortcut)")
    && panelRoot.includes("No active Focus task is available for this shortcut.")
    && timerRoot.includes("No active Focus task is available for this shortcut."),
  "both Focus renderers must surface unavailable live-action shortcuts when no task is active",
);
invariant(
  timerRoot.includes("void requestPanel(true)")
    && timerRoot.includes('emitTo("focusSurface", FOCUS_MODE_REQUEST_EVENT, payload)')
    && panelRoot.includes("quickTaskAfterPanelRef.current = true")
    && panelRoot.includes("setQuickTaskOpen(true)"),
  "Ctrl+Alt+T from Floating Timer must transition to the usable Panel viewport before opening quick-create",
);
invariant(
  searchPalette.includes("taskCreateOnly")
    && searchPalette.includes('openingMode === "task-create"')
    && searchPalette.includes("onRequestClose"),
  "Focus quick-create must reuse SearchPalette without exposing Search mode",
);
const floating = fs.readFileSync("src/FloatingTimerFoundation.tsx", "utf8");
invariant(
  floating.includes('data-floating-actions-controller="true"')
    && floating.includes('style={{ display: expanded ? "contents" : "none" }}')
    && floating.includes("onEnsureNotesVisible={() => requestExpanded(true)}"),
  "Collapsed Floating Timer must keep the shortcut controller mounted and expand safely for Notes",
);

console.log("In-app shortcut contracts passed.");
