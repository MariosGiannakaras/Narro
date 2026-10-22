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
const measured = { themeSettingsShortcutsDialog: "true",
  themeSettingsShortcutsLayoutPass: "true", themeSettingsModalCloseGeometryPass: "true" };
assert.equal(complete({ url, dataset: measured }), false);
assert.equal(complete({ url, dataset: { ...measured, themeSettingsFixtureReady: "true" } }), true);
assert.throws(() => complete({ url, dataset: { ...measured, themeSettingsShortcutsLayoutPass: "false" } }), /overflow/);
assert.equal(complete({ url, dataset: {
  ...measured, themeSettingsModalCloseGeometryPass: undefined, themeSettingsFixtureReady: "true",
}}), false, "Shortcuts must not capture until real modal SVG geometry is confirmed");
assert.throws(() => complete({ url, dataset: {
  ...measured, themeSettingsModalCloseGeometryPass: "false", themeSettingsFixtureReady: "true",
}}), /modal close icon/, "misaligned modal icon fails before capture, not after screenshot");
const preferencesUrl = "http://127.0.0.1:4173/theme-settings-fixture.html?preferencesDialog=1";
const completePreferences = new Function("options", "fixtureUrl", "integration", "events",
  source.slice(from, to) + "\nreturn complete;")(
    { kind: "preferences", url: preferencesUrl }, new URL(preferencesUrl), false, []);
const prefsReady = {
  themeSettingsFixtureReady: "true", themeSettingsKeyboardPass: "true",
  themeSettingsDialogContainmentPass: "true",
};
assert.equal(completePreferences({ url: preferencesUrl, dataset: prefsReady }), false,
  "Preferences with its real modal must also prove close icon geometry");
assert.equal(completePreferences({ url: preferencesUrl, dataset: {
  ...prefsReady, themeSettingsModalCloseGeometryPass: "true",
}}), true);
assert.throws(() => completePreferences({ url: preferencesUrl, dataset: {
  ...prefsReady, themeSettingsModalCloseGeometryPass: "false",
}}), /modal close icon/);

assert.equal(complete({ url, dataset: { themeSettingsShortcutsDialog: "true", themeSettingsFixtureReady: "true" } }), false);
// Regression for the exact failed Windows run 39582866897: immediately
// following CDP Page.navigate the interim document may have NO root <html>.
// The capture must observe NOT READY, then keep all existing geometry gates.
const stateStart = source.indexOf("async function state() {");
const stateEnd = source.indexOf("\nfunction complete(value) {", stateStart);
assert.ok(stateStart >= 0 && stateEnd > stateStart);
const observationSource = source.slice(stateStart, stateEnd);
const expression = observationSource.match(/return evaluate\(`([\s\S]*?)`\);/)?.[1];
assert.ok(expression, "capture must retain an inspectable real document state expression");
const observe = (doc, href) =>
  new Function("document", "location", "innerWidth", "innerHeight",
    "return " + expression)(doc, { href }, 1000, 700);
const preHtml = observe({
  documentElement: null,
  getElementById: () => null,
  activeElement: null,
  readyState: "loading",
}, url);
assert.deepEqual(preHtml.dataset, {}, "navigation before root creation must be safe");
assert.equal(preHtml.rootChildren, undefined);
assert.equal(complete(preHtml), false, "no HTML element can NEVER count as ready");
const realDoc = observe({
  documentElement: { dataset: {
    ...measured, themeSettingsFixtureReady: "true",
  } },
  getElementById: (id) => id === "root" ? { childElementCount: 1 } : null,
  activeElement: { outerHTML: "<button>Close</button>" },
  readyState: "complete",
}, url);
assert.equal(complete(realDoc), true,
  "valid real 10-row fixture must still complete once the DOM exists");
const overflowDoc = { ...realDoc, dataset: {
  ...realDoc.dataset, themeSettingsShortcutsLayoutPass: "false",
}};
assert.throws(() => complete(overflowDoc), /overflow/,
  "root navigation race fix cannot bypass an actual overflowing dialog");

console.log("Shortcut capture actual completion: loading, identity, missing geometry and overflow rejection PASS.");
