import assert from "node:assert/strict";
import { focusShortcutRetryError } from "../src/diagnosticApi.ts";

const failure = { code: "SHORTCUT_CONFLICT", message: "owned by another app" };
const base = {
  observerInstalled: true,
  registered: false,
  chord: "Ctrl+Shift+B",
  triggerCount: 0,
  revision: 1,
  lastError: null,
  focusToggleRegistered: false,
  focusToggleChord: "Ctrl+Shift+T",
  focusToggleTriggerCount: 0,
  focusToggleLastError: null,
  findTimerRegistered: false,
  findTimerChord: "Ctrl+Shift+P",
  findTimerTriggerCount: 0,
  findTimerLastError: null,
};

assert.equal(
  focusShortcutRetryError(failure, base, "toggle"),
  "[SHORTCUT_CONFLICT] owned by another app",
  "a transport failure without a native diagnostic remains visible",
);
assert.equal(
  focusShortcutRetryError(failure, { ...base, focusToggleLastError: failure }, "toggle"),
  null,
  "the native conflict diagnostic owns the visible failure",
);
assert.equal(
  focusShortcutRetryError(failure, { ...base, focusToggleRegistered: true }, "toggle"),
  null,
  "a later successful retry clears the stale generic failure",
);
assert.equal(
  focusShortcutRetryError(failure, { ...base, findTimerRegistered: true }, "toggle"),
  "[SHORTCUT_CONFLICT] owned by another app",
  "another chord's registration cannot hide this failure",
);
assert.equal(
  focusShortcutRetryError(failure, { ...base, findTimerLastError: failure }, "findTimer"),
  null,
);
assert.equal(
  focusShortcutRetryError(failure, { ...base, findTimerRegistered: true }, "findTimer"),
  null,
);

console.log("Shortcut retry reconciliation behavioral tests passed.");
