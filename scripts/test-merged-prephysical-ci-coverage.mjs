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
// The expanded sequential native/focus regression must run to its semantic
// completion, rather than silently consuming the former 10s virtual budget.
// This guards CI wiring; actual CDP captures and the fixture own behavior.
const visualCapture = fs.readFileSync("scripts/capture-visual-fixtures.ps1", "utf8");
assert.match(visualCapture,
  /if \(\$Theme -like "focus-editor-m7-integration-\*"\)\s*\{[\s\S]*?capture-ready-fixture-cdp\.mjs[\s\S]*?--kind=m7-integration[\s\S]*?return\s*\}/,
  "M7 integration must use actual-readiness CDP capture before the CLI virtual-time path");
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

// Explicit source-vs-native PA-01–09 routing cannot fall back to the old
// C5-only or USER-PAUSED protocol; screenshots never certify transitions.
const physicalScript = fs.readFileSync("scripts/prepare-m7-physical-session.ps1", "utf8");
const generated = physicalScript.match(/\$checklist = @"\r?\n([\s\S]*?)\r?\n"@/);
assert(generated, "Physical preparation must include a generated PA checklist");
const checklist = generated[1];
let previous = -1;
for (const id of ["PA-01", "PA-02", "PA-03", "PA-04", "PA-05", "PA-06", "PA-07", "PA-08", "PA-09"]) {
  const offset = checklist.indexOf("## " + id + " —");
  assert(offset > previous, "Generated physical checklist must contain ordered " + id);
  previous = offset;
}
for (const phrase of [
  "PA-01–PA-09 ACTIVE", "OPEN/NOT RUN", "ChatGPT compares existing exact-build Windows screenshots",
  "Codex captures continuous time-stamped video", "DO NOT demand video solely", "125%",
  "HWND/UIA", "NSIS/MSI", "production", "M11 remains inactive",
]) assert(checklist.includes(phrase), "Missing resumed PA protocol guard: " + phrase);
assert(!checklist.includes("covers ONLY the remaining C5")
  && !checklist.includes("until the user expressly authorizes"),
  "Do not regress to obsolete C5-only or PA user-pause scope");
assert(physicalScript.includes("Get-FileHash -Algorithm SHA256")
  && physicalScript.includes("production-appdata-backup")
  && physicalScript.includes("if ($BackupProductionData -and $productionRoamingDataExists)")
  && physicalScript.includes("if ($Launch -and $productionDataExists)")
  && physicalScript.includes("$productionDataExists = $productionRoamingDataExists -or $productionLocalDataExists")
  && physicalScript.includes("if ($Launch -and [string]::IsNullOrWhiteSpace($ExpectedSha256))")
  && physicalScript.includes("if ($Launch)"),
  "Retain exact-executable SHA guard, separately opt-in backup, Roaming/Local isolation, and explicit launch opt-in");

console.log("Merged A01–A10 CI and resumed PA-01–PA-09 static/motion routing contracts passed.");
