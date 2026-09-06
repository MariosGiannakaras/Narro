import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const sourceUrl = new URL("../src/dateTimeFormat.ts", import.meta.url);
const source = await readFile(sourceUrl, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    strict: true,
  },
  fileName: "dateTimeFormat.ts",
  reportDiagnostics: true,
});

if (transpiled.diagnostics?.some((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)) {
  const details = transpiled.diagnostics
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"))
    .join("\n");
  throw new Error(`dateTimeFormat transpile failed:\n${details}`);
}

const module = { exports: {} };
const context = vm.createContext({ module, exports: module.exports, Intl, Date, RangeError });
vm.runInContext(transpiled.outputText, context, { filename: "dateTimeFormat.js" });

const {
  formatVisibleDate,
  formatVisibleDateTime,
  formatVisibleTime,
  parseLocalCalendarDate,
  resolveVisibleDateTimePreferences,
} = module.exports;

const leapDay = parseLocalCalendarDate("2024-02-29");
assert.equal(leapDay.getFullYear(), 2024);
assert.equal(leapDay.getMonth(), 1);
assert.equal(leapDay.getDate(), 29);
assert.throws(() => parseLocalCalendarDate("2025-02-29"), RangeError);
assert.throws(() => parseLocalCalendarDate("2026-2-03"), RangeError);
assert.throws(() => formatVisibleTime("24:00", "en-GB"), RangeError);
assert.throws(() => formatVisibleTime("09:60", "en-GB"), RangeError);

const usTime = formatVisibleTime("21:05", "en-US");
const gbTime = formatVisibleTime("21:05", "en-GB");
assert.match(usTime, /9:05.*PM/i);
assert.match(gbTime, /21:05/);

const usPreferences = resolveVisibleDateTimePreferences("en-US");
const gbPreferences = resolveVisibleDateTimePreferences("en-GB");
assert.equal(usPreferences.hour12, true);
assert.equal(gbPreferences.hour12, false);
assert.ok(usPreferences.locale.toLowerCase().startsWith("en-us"));
assert.ok(gbPreferences.locale.toLowerCase().startsWith("en-gb"));

const systemPreferences = resolveVisibleDateTimePreferences();
assert.ok(systemPreferences.locale.length > 0);
assert.ok(systemPreferences.calendar.length > 0);
assert.ok(systemPreferences.timeZone.length > 0);
assert.equal(typeof systemPreferences.hour12, "boolean");
assert.ok(formatVisibleDate("2026-09-07").length > 0);
assert.ok(formatVisibleTime("09:05").length > 0);
assert.ok(formatVisibleDateTime("2026-09-07", "09:05").length > 0);

console.log("Visible date/time locale contract: PASS");
