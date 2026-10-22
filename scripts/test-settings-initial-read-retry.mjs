import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise real production retry admission callbacks without OS/AppData.
function source(path) { return readFileSync(path, "utf8"); }
function retryExpression(path) {
  const file = ts.createSourceFile(path, source(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = [];
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === "retryInitialLoad"
      && node.initializer && ts.isArrowFunction(node.initializer)) found.push(node.initializer.getText(file));
    ts.forEachChild(node, visit);
  };
  visit(file);
  assert.equal(found.length, 1, "Expected exactly one real initial-load callback in " + path);
  return found[0];
}
function recorder() {
  const events = [];
  const setter = (key) => (value) => events.push([key, typeof value === "function" ? value(2) : value]);
  return { events, setter };
}
function execute(expression, variables) {
  const cb = vm.runInNewContext("(" + expression + ")", variables);
  assert.equal(typeof cb, "function");
  cb();
}
{
  const path = "src/PreferenceSettingsRuntime.tsx", s = source(path);
  assert.ok(s.includes("}, [loadAttempt]);"), "Preferences retry must rerun the source read effect");
  assert.ok(s.includes("stopListening?.();"), "Repeated effect must clean up native event subscription");
  assert.ok(s.includes("initialReadInFlightRef.current = false;"), "Completed load must release retry admission");
  const theme = source("src/ThemeSettingsPanel.tsx");
  assert.ok(theme.includes('data-preferences-retry="true"') && theme.includes("onClick={preferences.retryInitialLoad}"),
    "Preferences error UI must connect to the real callback");
  for (const [loading, snapshot, error, saveInFlight, retryInFlight, allowed] of [
    [false, null, "database busy", false, false, true],
    [true, null, "database busy", false, false, false],
    [false, {}, "database busy", false, false, false],
    [false, null, null, false, false, false],
    [false, null, "database busy", true, false, false],
    [false, null, "database busy", false, true, false],
  ]) {
    const r = recorder(), initialReadInFlightRef = { current: retryInFlight };
    execute(retryExpression(path), {
      loading, snapshot, error,
      saveInFlightRef: { current: saveInFlight }, initialReadInFlightRef,
      setError: r.setter("error"), setLoading: r.setter("loading"),
      setLoadAttempt: r.setter("attempt"),
    });
    assert.deepEqual(r.events, allowed
      ? [["error", null], ["loading", true], ["attempt", 3]] : []);
    assert.equal(initialReadInFlightRef.current, allowed || retryInFlight,
      "Preferences admission must be synchronous and single-flight");
  }
}
{
  const path = "src/WindowsShortcutSettingsPanel.tsx", s = source(path);
  assert.ok(s.includes("}, [initialReadAttempt]);"), "Shortcuts retry must reload authoritative settings");
  assert.equal((s.match(/initialReadInFlightRef.current = false/g) || []).length, 2,
    "Native shortcuts read must release retry lock on both success and failure");
  assert.ok(s.includes('data-windows-shortcuts-retry-load="true"') &&
    s.includes("onRetryLoad={retryInitialLoad}"), "Shortcuts unavailable surface must wire a real retry");
  assert.ok(s.includes("stopListening?.();"), "Native shortcut diagnostics subscription must clean up");
  for (const [loading, snapshot, error, retryInFlight, writeInFlight, allowed] of [
    [false, null, "read unavailable", false, false, true],
    [true, null, "read unavailable", false, false, false],
    [false, {}, "read unavailable", false, false, false],
    [false, null, null, false, false, false],
    [false, null, "read unavailable", true, false, false],
    [false, null, "read unavailable", false, true, false],
  ]) {
    const r = recorder(), initialReadInFlightRef = { current: retryInFlight };
    execute(retryExpression(path), {
      loading, snapshot, error, initialReadInFlightRef,
      shortcutWriteInFlightRef: { current: writeInFlight },
      setError: r.setter("error"), setLoading: r.setter("loading"),
      setInitialReadAttempt: r.setter("attempt"),
    });
    assert.deepEqual(r.events, allowed
      ? [["error", null], ["loading", true], ["attempt", 3]] : []);
    assert.equal(initialReadInFlightRef.current, allowed || retryInFlight,
      "Shortcut retry admission must be synchronous and single-flight");
  }
}
console.log("Actual initial-load recovery callbacks: Preferences and Shortcuts single-flight, lifecycle and disabled states PASS");
