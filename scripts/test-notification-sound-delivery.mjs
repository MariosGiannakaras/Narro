import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync("src/notificationSoundDelivery.ts", "utf8");
const ast = ts.createSourceFile("delivery.ts", source, ts.ScriptTarget.Latest, true);
const entry = ast.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === "connectNotificationSounds");
const js = ts.transpileModule(`globalThis.start = ${entry.getText(ast).replace(/^export\s+/, "")};`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
const deferred = () => { let resolve, reject; const promise = new Promise((r, j) => { resolve=r; reject=j; }); return {promise, resolve, reject}; };
function harness(registrations = [Promise.resolve(() => {})]) {
  const timers = new Map(), played = [], warnings = [], callbacks = [], claims = [];
  let next = 1, attempts = 0, active = 0, maxActive = 0;
  const env = {
    console: {warn: (...args) => warnings.push(args)}, Number,
    listen: (name, callback) => { assert.equal(name, "notification-sound-ready"); callbacks.push(callback); attempts++; assert(registrations.length); return registrations.shift(); },
    invoke: async name => { assert.equal(name, "drain_notification_sounds"); active++; maxActive=Math.max(maxActive,active); try { return await (claims.shift() ?? []); } finally { active--; } },
    isLocalSoundId: id => ["futuristic-ding", "quick-chime", "melodic-bell", "victory-bell"].includes(id),
    playLocalSound: async (id, volume) => { played.push([id, volume]); },
    setTimeout: (callback, ms) => { const id=next++; timers.set(id,{callback,ms}); return id; },
    clearTimeout: id => timers.delete(id),
  };
  vm.runInNewContext(js, env);
  return {start: env.start, claims, played, warnings, callbacks, timers,
    get attempts(){return attempts;}, get maxActive(){return maxActive;},
    fire(ms){ const [id,timer]=timers.entries().next().value; assert.equal(timer.ms,ms); timers.delete(id); timer.callback(); }};
}

let stops=0;
const recovery=harness([Promise.reject(Error("bridge starting")), Promise.resolve(()=>stops++)]);
recovery.claims.push([{soundId:"quick-chime",volumePercent:100},{soundId:"futuristic-ding",volumePercent:0},{soundId:"remote-url",volumePercent:100}]);
const stop=recovery.start(); await flush(); recovery.fire(250); await flush();
assert.deepEqual(recovery.played, [["quick-chime",100]], "Recovered native backlog must use selected local tone/volume and preserve mute");
assert.equal(recovery.warnings.length,1,"Invalid native ID is diagnosed");
const pending=deferred(); recovery.claims.push(pending.promise, [{soundId:"melodic-bell",volumePercent:25}]);
recovery.callbacks[1](); recovery.callbacks[1](); recovery.callbacks[1]();
pending.resolve([]); await flush();
assert.equal(recovery.maxActive,1,"Overlapping wake hints must not race native claims");
assert.deepEqual(recovery.played.at(-1),["melodic-bell",25]);
recovery.callbacks[1](); await flush(); assert.equal(recovery.played.length,2,"Empty repeat wake must not replay audio");
stop(); stop(); assert.equal(stops,1);
recovery.callbacks[1](); await flush(); assert.equal(recovery.played.length,2);

const exhausted=harness([Promise.reject(Error("1")),Promise.reject(Error("2")),Promise.reject(Error("3"))]);
exhausted.start(); await flush(); exhausted.fire(250); await flush(); exhausted.fire(750); await flush();
assert.equal(exhausted.attempts,3); assert.equal(exhausted.timers.size,0); assert.equal(exhausted.warnings.length,1);
const late=deferred(); const disposed=harness([late.promise]); const stopLate=disposed.start(); stopLate(); late.resolve(()=>stops++); await flush(); assert.equal(stops,2);
const cancelled=harness([Promise.reject(Error("startup"))]); const cancel=cancelled.start(); await flush(); cancel(); assert.equal(cancelled.timers.size,0);
const failed=harness(); failed.claims.push(Promise.reject(Error("native claim failed"))); const end=failed.start(); await flush(); assert.equal(failed.warnings.length,1); failed.claims.push([{soundId:"victory-bell",volumePercent:60}]); failed.callbacks[0](); await flush(); assert.deepEqual(failed.played,[["victory-bell",60]]); end();
const delayedClaim=deferred(), abandoned=harness(); abandoned.claims.push(delayedClaim.promise); const abandon=abandoned.start(); await flush(); abandon(); delayedClaim.resolve([{soundId:"quick-chime",volumePercent:100}]); await flush(); assert.equal(abandoned.played.length,0,"Unmount during native claim must not play late audio");

const focus=fs.readFileSync("src/focus.tsx","utf8"), main=fs.readFileSync("src/main.tsx","utf8");
assert.equal((focus.match(/<NotificationSoundRuntime\s*\/>/g)??[]).length,1);
assert.doesNotMatch(main,/NotificationSoundRuntime/);
assert.doesNotMatch(source,/setInterval/);
const native=fs.readFileSync("src-tauri/src/notifications/sound.rs","utf8");
assert.match(native,/window\.label\(\) != "focusSurface"/);
assert.match(native,/SQLITE_OPEN_READ_ONLY/);
assert.match(native,/saturating_duration_since/);
assert.match(fs.readFileSync("src-tauri/src/notifications/mod.rs","utf8"),/sound::enqueue\(app_handle\)/);
// Catch unresolved logging crates even on hosts without the MSVC linker.
const cargo=fs.readFileSync("src-tauri/Cargo.toml","utf8");
for (const path of ["src-tauri/src/notifications/mod.rs","src-tauri/src/notifications/sound.rs"]) {
  for (const match of fs.readFileSync(path,"utf8").matchAll(/\b(\w+)::(?:warn|error|info|debug|trace)!/g)) {
    assert(new RegExp(`^${match[1]}\\s*=`,"m").test(cargo), `Undeclared native diagnostic dependency ${match[1]}`);
  }
}
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
assert(pkg.scripts["preflight:frontend"].includes("npm run test:notification-sound-delivery"));
console.log("Notification audio delivery: selected tone, mute, backlog, claim-once wakes, finite recovery, disposal and one renderer PASS.");
