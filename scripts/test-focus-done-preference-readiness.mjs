import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute source-derived admission and actual production Done handler, not an
// independent Done imitation. No Tauri process, user AppData or OS changes.
const src = fs.readFileSync("src/FocusLiveActions.tsx", "utf8");
const file = ts.createSourceFile("FocusLiveActions.tsx", src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const vars = new Map();
function visit(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
    vars.set(node.name.text, node.initializer.getText(file));
  }
  ts.forEachChild(node, visit);
}
visit(file);
for (const name of ["doneSettingsPending", "showSuccessScreen", "handleDone"]) {
  assert.ok(vars.has(name), "Production Done preference admission missing: " + name);
}
assert.equal((src.match(/disabled=\{busy \|\| !state\.doneEnabled \|\| doneSettingsPending\}/g) ?? []).length, 2,
  "Panel and Floating Done must both wait for preference readiness.");
const compile = (code) => ts.transpileModule(code, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;
function derived(snapshot, settled, fixtureMode = false) {
  return vm.runInNewContext(compile(
    "const doneSettingsPending = " + vars.get("doneSettingsPending") + ";\n" +
    "const showSuccessScreen = " + vars.get("showSuccessScreen") + ";\n" +
    "({ doneSettingsPending, showSuccessScreen });"
  ), { preferences: { snapshot, settled }, fixtureMode });
}
const handlerCode = compile("globalThis.testedDone = " + vars.get("handleDone") + ";");
function harness(snapshot, settled, fixtureMode = false) {
  const flags = derived(snapshot, settled, fixtureMode);
  const task = { id: "task-a", title: "Alpha", listId: "list-a", estSeconds: 600, timeTakenSeconds: "120" };
  const board = { today: { tasks: [] }, done: { tasks: [task] } };
  const native = { runtime: { timer: { state: "running", mode: { kind: "count_up" }, task_id: task.id } } };
  const saved = { runtime: { timer: { state: "idle", mode: { kind: "count_up" }, task_id: null } } };
  const log = { begins: 0, commits: 0, read: 0, sounds: [], success: [], advances: [], failures: [], payloads: [], finished: 0 };
  const ctx = {
    ...flags, preferences: { snapshot, settled }, task, target: { kind: "all" },
    beginMutation: (kind) => { assert.equal(kind, "done"); log.begins++; return true; },
    finishMutation: (kind) => { assert.equal(kind, "done"); log.finished++; },
    getListBoardSnapshot: async () => { log.read++; return board; },
    snapshotTimerSession: async () => native,
    assertExpectedLiveTask: (payload, id) => assert.equal(payload.runtime.timer.task_id, id),
    nextEligibleTask: () => null,
    focusModeForTask: () => ({ kind: "count_up" }),
    onAutomaticAdvance: (value) => log.advances.push(value),
    completeTimerTask: async () => { log.commits++; return saved; },
    DEFAULT_SUCCESS_SOUND: "victory-bell",
    playLocalSound: async (...args) => { log.sounds.push(args); },
    onCompletionSuccess: (value) => log.success.push(value),
    onTaskMutationCommitted: async () => {},
    applyPayload: (payload) => log.payloads.push(payload),
    setNotesExpanded: () => {},
    setStatus: () => {},
    fail: (failure) => log.failures.push(failure),
    formatInvokeError: (failure) => String(failure),
    console: { warn: () => {} },
  };
  vm.runInNewContext(handlerCode, ctx);
  return { log, flags, done: ctx.testedDone };
}
const offSoundOn = { celebration: {
  showSuccessScreen: false, successSoundEnabled: true,
  successSound: "victory-bell", successSoundVolumePercent: 35, funGif: false,
} };
const onSoundOff = { celebration: {
  showSuccessScreen: true, successSoundEnabled: false,
  successSound: "victory-bell", successSoundVolumePercent: 80, funGif: true,
} };
// Native settings not yet returned: no irreversible completion or guessed
// success/audio policy may run. The visible Done buttons must also be disabled.
{
  const h = harness(null, false);
  assert.equal(h.flags.doneSettingsPending, true);
  await h.done();
  assert.equal(h.log.begins, 0);
  assert.equal(h.log.commits, 0);
  assert.equal(h.log.sounds.length, 0);
  assert.equal(h.log.success.length, 0);
}
// Once the exact saved OFF/ON snapshot arrives, work commits once, plays only
// the enabled sound, and takes the no-success-screen auto-advance path.
{
  const h = harness(offSoundOn, true);
  assert.equal(h.flags.doneSettingsPending, false);
  assert.equal(h.flags.showSuccessScreen, false);
  await h.done();
  assert.equal(h.log.commits, 1);
  assert.equal(h.log.sounds.length, 1);
  assert.deepEqual(Array.from(h.log.sounds[0]), ["victory-bell", 35]);
  assert.equal(h.log.success.length, 0);
  assert.equal(h.log.failures.length, 0);
  assert.equal(h.log.finished, 1);
}
// Saved ON/OFF requests the success screen, never plays sound, and never
// auto-starts a phantom session after the saved Done.
{
  const h = harness(onSoundOff, true);
  assert.equal(h.flags.showSuccessScreen, true);
  await h.done();
  assert.equal(h.log.commits, 1);
  assert.equal(h.log.sounds.length, 0);
  assert.equal(h.log.success.length, 1);
  assert.equal(h.log.success[0].completedTaskId, "task-a");
  assert.equal(h.log.failures.length, 0);
}
// A failed initial Preferences read must not lock native Done forever. The
// conservative unknown snapshot renders no optional success UI/audio.
{
  const h = harness(null, true);
  assert.equal(h.flags.doneSettingsPending, false);
  assert.equal(h.flags.showSuccessScreen, false);
  await h.done();
  assert.equal(h.log.commits, 1);
  assert.equal(h.log.success.length, 0);
  assert.equal(h.log.sounds.length, 0);
  assert.equal(h.log.failures.length, 0);
}
// Approved visual fixtures are pure presentation. Don't block fixture mode.
assert.equal(derived(null, true, true).showSuccessScreen, true);
console.log("Real Done handler: pending Preferences gate, saved ON/OFF sound/screen and failed-read fallback PASS.");
