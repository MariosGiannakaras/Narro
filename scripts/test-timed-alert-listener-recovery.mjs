import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute the actual production function extracted by the TypeScript parser;
// never validate a second invented retry implementation.
const api = fs.readFileSync("src/timedAlertApi.ts", "utf8");
const ast = ts.createSourceFile("src/timedAlertApi.ts", api, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const entry = ast.statements.find(node => ts.isFunctionDeclaration(node)
  && node.name?.text === "connectTimedAlertEffectsWithRecovery");
assert.ok(entry, "Timed-alert registration needs a finite recovery owner");
assert.match(api, /TIMED_ALERT_LISTENER_RETRY_DELAYS_MS\s*=\s*\[250,\s*750\]/);
assert.match(api, /return listen<TimedAlertEffectPayload>/);

function harness(outcomes) {
  const timers = new Map();
  const callbacks = [];
  const warnings = [];
  const received = [];
  let created = 0;
  let nextTimer = 1;
  const environment = {
    TIMED_ALERT_LISTENER_RETRY_DELAYS_MS: [250, 750],
    connectTimedAlertEffects(onEffect) {
      callbacks.push(onEffect);
      created++;
      assert.ok(outcomes.length > 0, "Unbounded or unexpected listener attempt");
      return outcomes.shift()();
    },
    setTimeout(callback, ms) {
      const id = nextTimer++;
      timers.set(id, {callback, ms});
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
  };
  const javascript = ts.transpileModule(
    "globalThis.__tested = " + entry.getText(ast).replace(/^export\s+/, "") + ";",
    {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None}},
  ).outputText;
  vm.runInNewContext(javascript, environment, {filename: "src/timedAlertApi.ts"});
  return {
    connect: (onEffect = event => received.push(event)) =>
      environment.__tested(onEffect, error => warnings.push(error)),
    received, warnings, timers, callbacks,
    get created() { return created; },
    fireNext(expectedMs) {
      const pair = timers.entries().next().value;
      assert.ok(pair, "Expected scheduled bounded listener retry");
      assert.equal(pair[1].ms, expectedMs);
      timers.delete(pair[0]);
      pair[1].callback();
    },
  };
}

async function drain() {
  for (let i = 0; i < 5; i++) await Promise.resolve();
}

let unlistens = 0;
const recovered = harness([
  () => Promise.reject(Error("temporary native bridge unavailable")),
  () => Promise.reject(Error("native event bridge restarting")),
  () => Promise.resolve(() => { unlistens++; }),
]);
const stopRecovered = recovered.connect();
await drain();
assert.equal(recovered.created, 1);
assert.equal(recovered.timers.size, 1);
recovered.fireNext(250);
await drain();
assert.equal(recovered.created, 2);
recovered.fireNext(750);
await drain();
assert.equal(recovered.created, 3);
assert.equal(recovered.warnings.length, 0, "Transient failures must not trigger terminal diagnostic");
assert.equal(recovered.timers.size, 0, "Success must stop reconnect attempts");
const sample = {taskId: "task-1"};
recovered.callbacks[2](sample);
assert.equal(recovered.received.length, 1);
stopRecovered();
stopRecovered();
assert.equal(unlistens, 1, "Double cleanup must unlisten once");
recovered.callbacks[2](sample);
assert.equal(recovered.received.length, 1, "Late events after disposal must be ignored");

const exhausted = harness([
  () => Promise.reject(Error("native permissions denied")),
  () => Promise.reject(Error("native permissions denied")),
  () => Promise.reject(Error("native permissions denied")),
]);
const stopExhausted = exhausted.connect();
await drain();
exhausted.fireNext(250);
await drain();
exhausted.fireNext(750);
await drain();
assert.equal(exhausted.created, 3);
assert.equal(exhausted.warnings.length, 1);
assert.match(String(exhausted.warnings[0]), /permissions denied/);
assert.equal(exhausted.timers.size, 0);
stopExhausted();

const paused = harness([() => Promise.reject(Error("bridge temporarily unavailable"))]);
const stopPaused = paused.connect();
await drain();
assert.equal(paused.timers.size, 1);
stopPaused();
assert.equal(paused.timers.size, 0, "Unmount must cancel a pending retry");
assert.equal(paused.created, 1);
assert.equal(paused.warnings.length, 0);

let resolveLate;
let lateStops = 0;
const late = harness([() => new Promise(resolve => { resolveLate = resolve; })]);
const stopLate = late.connect();
stopLate();
resolveLate(() => { lateStops++; });
await drain();
assert.equal(lateStops, 1, "A late Tauri unlisten must be invoked exactly once");
late.callbacks[0]({taskId: "late"});
assert.equal(late.received.length, 0);
assert.equal(late.warnings.length, 0);

for (const file of ["src/TimedAlertSoundRuntime.tsx", "src/TimedAlertFlashRuntime.tsx"]) {
  const source = fs.readFileSync(file, "utf8");
  assert.match(source, /connectTimedAlertEffectsWithRecovery\(/,
    file + " must use bounded recovery");
  assert.match(source, /stopListening\(\)/,
    file + " must dispose the real listener");
  assert.match(source, /console\.warn\(/,
    file + " must diagnose terminal listener failure");
  assert.doesNotMatch(source, /setInterval\(/,
    file + " must not poll the native event stream");
}
console.log("Timed-alert actual listener retry, terminal failure and lifecycle regressions: PASS");
