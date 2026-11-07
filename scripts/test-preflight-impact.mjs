import assert from "node:assert/strict";
import { selectImpactedTests, selectLearningRisks, learningControls, parseChangedPaths } from "./preflight-impact.mjs";
import { readFileSync } from "node:fs";
const bodies = new Map([
 ["scripts/test-ui-focus-panel.mjs", 'const css = read("src/focusPanel.css");'],
 ["scripts/test-ui-icon-control-geometry.mjs", 'const css = read("src/focusPanel.css");'],
 ["scripts/test-finding33-large-notes-escape.mjs", 'import { navigate } from "./finding33NavigationAck.mjs"'],
 ["scripts/test-ui-task-notes-large.mjs", 'const driver = read("scripts/test-finding33-large-notes-escape.mjs");'],
 ["scripts/test-finding33-navigation-retry.mjs", 'import { navigate } from "./finding33NavigationAck.mjs"'],
 ["scripts/test-ui-action-icons.mjs", 'const board = read("src/TaskCard.tsx")'],
]);
const scripts = Object.fromEntries([...bodies.keys()].map(file => ["test:"+file.slice(8,-4), "node "+file]));
let r = selectImpactedTests(["src/focusPanel.css"], bodies, scripts);
assert.deepEqual(r.tests,["test:test-ui-focus-panel","test:test-ui-icon-control-geometry"]);
assert.deepEqual(r.unmapped,[]);
r = selectImpactedTests(["scripts/finding33NavigationAck.mjs"],bodies,scripts);
assert.deepEqual(r.tests,["test:test-finding33-large-notes-escape", "test:test-finding33-navigation-retry", "test:test-ui-task-notes-large"]);
assert.deepEqual(r.unmapped,[]);
r = selectImpactedTests(["src/TaskCard.tsx"],bodies,scripts);
assert.deepEqual(r.tests,["test:test-ui-action-icons"]);
r = selectImpactedTests(["src/UnknownVisual.tsx"],bodies,scripts);
assert.deepEqual(r.unmapped,["src/UnknownVisual.tsx"]);
r = selectImpactedTests(["scripts/test-ui-action-icons.mjs"],bodies,scripts);
assert.deepEqual(r.tests,["test:test-ui-action-icons"]);
assert.deepEqual(parseChangedPaths(["--files","src/TaskCard.tsx,scripts/finding33NavigationAck.mjs"],()=>{throw Error("git should not run")}).changed,["src/TaskCard.tsx","scripts/finding33NavigationAck.mjs"]);
const p = parseChangedPaths(["--base","main"], args => args[0] === "ls-files"?{status:0,stdout:"scripts/new-test-helper.mjs\0",stderr:""}:args.includes("HEAD")?{status:0,stdout:"src/TaskCard.tsx\0",stderr:""}:{status:0,stdout:"scripts/finding33NavigationAck.mjs\0",stderr:""});
assert.deepEqual(p.changed,["scripts/finding33NavigationAck.mjs","src/TaskCard.tsx","scripts/new-test-helper.mjs"]);
assert.throws(()=>parseChangedPaths(["--wrong"],()=>({})),/Unknown/);
console.log("Pre-push impact: CSS, transitive CDP helper, task SVG, unmapped and git diff PASS");

const rustRisk = selectLearningRisks(["src-tauri\\src\\persistence\\sessions.rs"]);
assert.deepEqual(rustRisk.riskFamiliesToReview, ["NER-003", "NER-009", "NER-012", "NER-014", "NER-015"]);
assert.equal(rustRisk.mandatoryRustFormatOnRun, true);
assert.deepEqual(rustRisk.additionalRustChecksToRunWhereAvailable,
  ["check:rust", "check:rust:clippy", "test:rust"]);
const fixtureRisk = selectLearningRisks(["scripts/capture-focus-runtime.mjs"]);
assert.ok(fixtureRisk.riskFamiliesToReview.includes("NER-004"));
const toolingRisk = selectLearningRisks([".github/workflows/ci-learning.yml"]);
assert.ok(toolingRisk.riskFamiliesToReview.includes("NER-011"));
assert.ok(toolingRisk.riskFamiliesToReview.includes("NER-012"));
const trackingRisk = selectLearningRisks(["HANDOFF.md"]);
assert.deepEqual(trackingRisk.riskFamiliesToReview, ["NER-005", "NER-006"]);
// All current workflow/instruction entrypoints must prompt a review of
// current-truth/branch protections; immutable past receipts do not.
for (const file of [
  "AGENTS.md",
  "ENGINEERING_QUALITY.md",
  "AI_START_HERE.md",
  "AGENT_WORKFLOW.md",
  "docs/TRACKER_STATUS_INDEX.md",
  "docs/CI_VALIDATION_STRATEGY.md",
  "docs/DEEP_ANALYSIS_IMPLEMENTATION_WORKFLOW.md",
  "docs/CODEX_M5_M9_RECORDING_PACKET_2026-10-27.md",
  "docs/CURRENT_WINDOWS_RESIDUAL_PHYSICAL_SESSION.md",
  ".github/copilot-instructions.md",
  "docs\\TRACKER_STATUS_INDEX.md",
]) {
  assert.deepEqual(selectLearningRisks([file]).riskFamiliesToReview,
    ["NER-005", "NER-006"], "missed workflow-risk routing: " + file);
}
assert.deepEqual(selectLearningRisks(["work-log/2026-10-23-frozen.md"]).riskFamiliesToReview, []);
const physicalRisk = selectLearningRisks(["scripts/prepare-m7-physical-session.ps1"]);
assert.deepEqual(physicalRisk.riskFamiliesToReview,
  ["NER-003", "NER-005", "NER-006", "NER-011", "NER-012"]);
for (const path of ["scripts/test-ci-tiering.mjs",
  "scripts/test-merged-prephysical-ci-coverage.mjs"]) {
  const risk = selectLearningRisks([path]);
  for (const id of ["NER-003", "NER-011", "NER-012"]) {
    assert.ok(risk.riskFamiliesToReview.includes(id), path + ": " + id);
  }
}


assert.equal(trackingRisk.mandatoryRustFormatOnRun, false);
assert.deepEqual(selectLearningRisks([]).riskFamiliesToReview, []);
const register = readFileSync(new URL("../docs/NARRO_ENGINEERING_RISK_REGISTER.md", import.meta.url), "utf8");
for (const id of new Set([
  ...rustRisk.riskFamiliesToReview,
  ...fixtureRisk.riskFamiliesToReview,
  ...toolingRisk.riskFamiliesToReview,
  ...trackingRisk.riskFamiliesToReview,
  ...selectLearningRisks(["src-tauri/src/focus_layered_raster.rs"]).riskFamiliesToReview
])) assert.ok(register.includes("| **" + id + "** |"), "risk ID missing from register: " + id);
console.log("Pre-push risk learning: historical family routing and executable Rustfmt admission PASS");

const controls = learningControls(rustRisk.riskFamiliesToReview, register);
assert.deepEqual(controls.map(row => row.id), rustRisk.riskFamiliesToReview);
assert.ok(controls.find(row => row.id === "NER-015").preventionGuard.includes("multi-operation"));
assert.ok(controls.every(row => row.state && row.trigger && row.preventionGuard));
assert.throws(() => learningControls(["NER-999"], register), /Missing or duplicated/);
assert.throws(() => learningControls(["NER-003"], register + "\n" +
  register.split("\n").find(line => line.startsWith("| **NER-003** |"))), /Missing or duplicated/);
console.log("Pre-push learning: live prevention text and stale/missing risk-ID failure PASS");
