import assert from "node:assert/strict";
import { selectImpactedTests, parseChangedPaths } from "./preflight-impact.mjs";
const bodies = new Map([
 ["scripts/test-ui-focus-panel.mjs", 'const css = read("src/focusPanel.css");'],
 ["scripts/test-ui-icon-control-geometry.mjs", 'const css = read("src/focusPanel.css");'],
 ["scripts/test-finding33-large-notes-escape.mjs", 'import { navigate } from "./finding33NavigationAck.mjs"'],
 ["scripts/test-ui-task-notes-large.mjs", 'const driver = read("scripts/test-finding33-large-notes-escape.mjs");'],
 ["scripts/test-finding33-navigation-retry.mjs", 'import { navigate } from "./finding33NavigationAck.mjs"'],
 ["scripts/test-ui-action-icons.mjs", 'const board = read("src/TaskCard.tsx")'],
 // CSS is imported only by a production TSX or visual fixture; no script
 // mentions the CSS filename. The former script-only scanner missed both.
 ["src/ArchivedDoneTasksPanel.tsx", 'import "./archivePanel.css";'],
 ["scripts/test-ui-archives.mjs", 'const panel = read("src/ArchivedDoneTasksPanel.tsx");'],
 ["src/taskScheduleVisualFixture.tsx", 'import "./taskScheduleDialog.css";'],
 ["scripts/test-ui-task-scheduling.mjs", 'const fixture = read("src/taskScheduleVisualFixture.tsx");'],
 ["src/OrphanWidget.tsx", 'import "./OrphanWidget.css";'],
]);
const scripts = Object.fromEntries([...bodies.keys()].filter(file => file.startsWith("scripts/")).map(file => ["test:"+file.slice(8,-4), "node "+file]));
let r = selectImpactedTests(["src/focusPanel.css"], bodies, scripts);
assert.deepEqual(r.tests,["test:test-ui-focus-panel","test:test-ui-icon-control-geometry"]);
assert.deepEqual(r.unmapped,[]);
r = selectImpactedTests(["scripts/finding33NavigationAck.mjs"],bodies,scripts);
assert.deepEqual(r.tests,["test:test-finding33-large-notes-escape", "test:test-finding33-navigation-retry", "test:test-ui-task-notes-large"]);
assert.deepEqual(r.unmapped,[]);
r = selectImpactedTests(["src/TaskCard.tsx"],bodies,scripts);
assert.deepEqual(r.tests,["test:test-ui-action-icons"]);
r = selectImpactedTests(["src/archivePanel.css"], bodies, scripts);
assert.deepEqual(r.tests,["test:test-ui-archives"],
  "CSS imported by a React component must reach its transitive registered test");
assert.deepEqual(r.unmapped,[]);
assert.deepEqual(r.consumers["src/archivePanel.css"],["src/ArchivedDoneTasksPanel.tsx"]);

r = selectImpactedTests(["src/taskScheduleDialog.css"], bodies, scripts);
assert.deepEqual(r.tests,["test:test-ui-task-scheduling"],
  "CSS imported by a visual fixture must reach its transitive test");
assert.deepEqual(r.unmapped,[]);

r = selectImpactedTests(["src/OrphanWidget.css"], bodies, scripts);
assert.deepEqual(r.tests,[]);
assert.deepEqual(r.unmapped,["src/OrphanWidget.css"],
  "An import from untested production code is not runnable regression coverage");

r = selectImpactedTests(["src/UnknownVisual.tsx"],bodies,scripts);
assert.deepEqual(r.unmapped,["src/UnknownVisual.tsx"]);
r = selectImpactedTests(["scripts/test-ui-action-icons.mjs"],bodies,scripts);
assert.deepEqual(r.tests,["test:test-ui-action-icons"]);
assert.deepEqual(parseChangedPaths(["--files","src/TaskCard.tsx,scripts/finding33NavigationAck.mjs"],()=>{throw Error("git should not run")}).changed,["src/TaskCard.tsx","scripts/finding33NavigationAck.mjs"]);
const p = parseChangedPaths(["--base","main"], args => args[0] === "ls-files"?{status:0,stdout:"scripts/new-test-helper.mjs\0",stderr:""}:args.includes("HEAD")?{status:0,stdout:"src/TaskCard.tsx\0",stderr:""}:{status:0,stdout:"scripts/finding33NavigationAck.mjs\0",stderr:""});
assert.deepEqual(p.changed,["scripts/finding33NavigationAck.mjs","src/TaskCard.tsx","scripts/new-test-helper.mjs"]);
assert.throws(()=>parseChangedPaths(["--wrong"],()=>({})),/Unknown/);
console.log("Pre-push impact: direct and transitive component/CSS/fixture tests, orphan guard, CDP helper and worktree PASS");
