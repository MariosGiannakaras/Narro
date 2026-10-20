import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Execute the real capture completion predicate: an about:blank/loading
// document must wait, while a fully measured overflowing dialog must fail.
const source = readFileSync(new URL("capture-ready-fixture-cdp.mjs", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const from = source.indexOf("function complete(value) {");
const to = source.indexOf("\ntry {", from);
assert.ok(from >= 0 && to > from);
const url = "http://127.0.0.1:4173/theme-settings-fixture.html?shortcutsDialog=1";
const complete = new Function("options", "fixtureUrl", "integration", "events",
  source.slice(from, to) + "\nreturn complete;")({ kind: "shortcuts", url }, new URL(url), false, []);
assert.equal(complete(null), false);
assert.equal(complete({ url: "about:blank", dataset: {} }), false);
assert.equal(complete({ url, dataset: {} }), false);
assert.throws(() => complete({ url, dataset: { themeSettingsShortcutsDialog: "false" } }), /dedicated shortcut dialog/);
const measured = { themeSettingsShortcutsDialog: "true", themeSettingsShortcutsLayoutPass: "true" };
assert.equal(complete({ url, dataset: measured }), false);
assert.equal(complete({ url, dataset: { ...measured, themeSettingsFixtureReady: "true" } }), true);
assert.throws(() => complete({ url, dataset: { ...measured, themeSettingsShortcutsLayoutPass: "false" } }), /overflow/);
assert.equal(complete({ url, dataset: { themeSettingsShortcutsDialog: "true", themeSettingsFixtureReady: "true" } }), false);
console.log("Shortcut capture actual completion: loading, identity, missing geometry and overflow rejection PASS.");
