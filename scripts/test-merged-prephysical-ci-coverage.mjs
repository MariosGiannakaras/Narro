import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Integration contract for the merged source tree: all real behavior/async
 * regressions from the two pre-physical audits must be reachable from the
 * aggregate frontend fast gate, not merely present as unused test files.
 *
 * This is CI harness wiring validation, not substitute runtime behavior proof.
 */
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const scripts = pkg.scripts;
const frontend = scripts["preflight:frontend"];
assert.equal(typeof frontend, "string");
const commands = frontend.split(" && ");

const requiredDirect = [
  "test:focus-action-gate",               // A01
  "test:ui-focus-panel",                  // A02, A03, A06, A07
  "test:board-create-single-flight",      // A04
  "test:ui-reports-sessions",             // A05
  "test:ui-focus-entry",                  // A08
  "test:focus-live-mutation-gates",       // A09
  "test:ui-list-settings",                // A10
];
for (const name of requiredDirect) {
  assert.equal(typeof scripts[name], "string", `Missing CI test script ${name}`);
  assert.equal(commands.filter(command => command === `npm run ${name}`).length, 1,
    `${name} must be run exactly once from the shared frontend CI preflight`);
  assert.match(scripts[name], /^node(?: --experimental-strip-types)? scripts\/[^ ]+\.mjs$/,
    `Unexpected executable test command for ${name}`);
  const file = scripts[name].split(" ").at(-1);
  assert(fs.statSync(file).isFile(), `${name} must point to a real test file`);
}

const indirect = [
  ["test:ui-focus-panel", "test-focus-panel-single-flight.mjs"],        // A06
  ["test:ui-focus-panel", "test-focus-panel-shared-mutation-owners.mjs"], // A07
  ["test:ui-reports-sessions", "test-reports-add-session-single-flight.mjs"], // A05
  ["test:ui-focus-entry", "test-blitz-entry-single-flight.mjs"],        // A08
  ["test:ui-list-settings", "test-archived-list-mutation-gate.mjs"],    // A10
];
for (const [parent, child] of indirect) {
  const file = scripts[parent].split(" ").at(-1);
  const text = fs.readFileSync(file, "utf8");
  assert(text.includes(`"./${child}"`),
    `${child} must be imported by its production-facing CI test ${parent}`);
  assert(fs.statSync(`scripts/${child}`).isFile(),
    `${child} missing despite apparent import wiring`);
}

const regressionFile = fs.readFileSync("src/m7IntegrationRegression.tsx", "utf8");
assert(regressionFile.includes("focusBoardStaleResponsesRejected: true")
  && regressionFile.includes("focusBoardReadWaiters[1](freshFocusBoard)")
  && regressionFile.includes("focusBoardReadWaiters[0](staleFocusBoard)"),
  "A03 delayed initial-board vs newer invalidation contract must remain in integrated fixture");

// Ensure the prephysical full candidate still produces a bundle after the
// concurrency regressions and uses the existing Windows fixture capture gate.
assert.equal(commands.at(-1), "npm run build",
  "Preflight must compile the merged React app after all focused regressions");
assert.match(scripts["test:visual-regression:windows"] || "", /capture-focus-panel-fixtures\.ps1/,
  "Rendered production Focus fixture must stay in the authoritative Windows visual gate");
console.log("Merged A01–A10 CI guard reachability and final build/visual fixture wiring passed.");
