import assert from "node:assert/strict";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { admitCandidate, collect, digest, request, recover, physicalEnvironment } from "./physical-session.mjs";
import { physicalTracePlugin } from "./physical-trace-vite.mjs";

const root = await mkdtemp(join(tmpdir(), "narro-physical-session-test-"));
let assertions = 0;
try {
  // Real immutable Tauri-style internals: observation must not monkey-patch them.
  const batches = [], calls = [], intervals = new Map(), listeners = new Map();
  let intervalId = 0;
  const original = async (command, args, options) => {
    calls.push({ command, args, options });
    if (command.endsWith("_batch")) { batches.push(...structuredClone(args.records)); return; }
    if (command.endsWith("_hello")) return { pid: 12, runId: "r" };
    if (command === "failure") throw Object.assign(new Error("expected"), { code: "WRITE_FAILED" });
    return args;
  };
  const internals = Object.defineProperties({}, { invoke: { value: original }, transformCallback: { value: () => 1 } });
  const element = class {};
  const document = { documentElement: {}, activeElement: null, readyState: "complete", visibilityState: "visible",
    addEventListener: (name, fn) => listeners.set("document:" + name, fn) };
  const window = { __TAURI_INTERNALS__: internals, addEventListener: (name, fn) => listeners.set("window:" + name, fn) };
  const context = vm.createContext({ window, document, Element: element, Headers, Date, ArrayBuffer, Error,
    crypto: { randomUUID }, performance, console: { warn() {}, error() {} },
    MutationObserver: class { observe() {} },
    setTimeout, clearTimeout, setInterval: (fn, ms) => { intervals.set(++intervalId, { fn, ms }); return intervalId; },
    clearInterval: id => intervals.delete(id), structuredClone });
  vm.runInContext(await readFile("src-tauri/src/physical_trace.js", "utf8"), context);
  const trace = window.__NARRO_PHYSICAL_TRACE__;
  assert.ok(trace); assert.equal(internals.invoke, original); assertions += 2;
  const args = { seconds: 12, paused: true, title: "private task" };
  assert.equal(await trace.invoke("success", args, { headers: { "x-existing": "yes" } }), args);
  await assert.rejects(trace.invoke("failure", {}), /expected/);
  const success = calls.find(x => x.command === "success");
  assert.equal(success.args, args); assert.equal(new Headers(success.options.headers).get("x-existing"), "yes");
  assert.ok(new Headers(success.options.headers).get("x-narro-trace-id")); assertions += 5;
  const cycle={}; cycle.self=cycle;
  assert.equal(await trace.invoke("cycle",cycle),cycle);
  const throwing = { get value() { throw Error("getter failed"); } };
  assert.equal(await trace.invoke("getter",throwing),throwing);
  assert.equal(typeof JSON.parse(JSON.stringify(success.options.headers))["x-narro-trace-id"],"string",
    "correlation and caller headers must survive Tauri's JSON/postMessage fallback"); assertions += 3;
  await trace.drain();
  assert.ok(batches.some(x => x.event === "ipc-result"));
  assert.ok(batches.some(x => x.event === "ipc-error"));
  assert.ok(batches.some(x => x.event === "page-end"));
  assert.ok(calls.some(x => x.command.endsWith("_drained") && x.args.queued === 0 && x.args.inFlight === 0));
  assert.ok(!JSON.stringify(batches).includes("private task")); assertions += 5;
  await trace.invoke("after-seal-1",{}); await trace.invoke("after-seal-2",{});
  const tail = calls.filter(x => x.command.startsWith("after-seal"));
  assert.notEqual(tail[0].options.headers["x-narro-trace-id"],tail[1].options.headers["x-narro-trace-id"],
    "request IDs must remain unique when a Quit drain has sealed frontend recording"); assertions++;
  trace.resume();
  for (let i = 0; i < 1100; i++) trace.record("stress", { i });
  assert.ok(trace.health().lost > 0, "bounded frontend queue must expose drops"); assertions++;
  await trace.drain();
  const shutdown = await readFile("src-tauri/src/normal_shutdown.rs", "utf8");
  assert.ok(shutdown.indexOf("prepare_exit(&app)") < shutdown.indexOf("let result = complete_after_checkpoint"),
    "diagnostic draining must precede the final authoritative timer checkpoint"); assertions++;
  const native = await readFile("src-tauri/src/lib.rs", "utf8");
  const registration = native.match(/tauri::generate_handler!\[([\s\S]*?)\]/)?.[1];
  assert.ok(registration, "physical observer must wrap the actual registered native commands");
  const commands = registration.split(",").map(x => x.trim()).filter(Boolean);
  assert.ok(commands.every(x => /^[A-Za-z_]\w*(?:::[A-Za-z_]\w*)*$/.test(x)),
    "every actual IPC registration must be comma-separated, including merged candidate commands");
  assert.equal(new Set(commands).size, commands.length); assertions += 3;
  const plugin = physicalTracePlugin(true);
  assert.match(plugin.resolveId("@tauri-apps/api/core", "src/App.tsx"), /physicalInvoke\.ts$/);
  assert.equal(plugin.resolveId("@tauri-apps/api/core", "src/physicalInvoke.ts"), null);
  assert.equal(physicalTracePlugin(false).resolveId("@tauri-apps/api/core", "src/App.tsx"), null); assertions += 3;

  const env1 = physicalEnvironment(root, 1, { KEEP: "yes", NARRO_FOCUS_CAPTURE_DIR: "outside", NARRO_PHYSICAL_LOGGING_PROBE: "1" });
  const env2 = physicalEnvironment(root, 2, {});
  assert.equal(env1.KEEP, "yes"); assert.equal(env1.NARRO_PHYSICAL_LOGGING_PROBE, "0");
  assert.equal(env1.NARRO_FOCUS_CAPTURE_DIR, join(root, "focus-compositor-logs", "launch-1"));
  assert.notEqual(env1.NARRO_FOCUS_CAPTURE_DIR, env2.NARRO_FOCUS_CAPTURE_DIR); assertions += 4;
  const exe = join(root, "narro.exe"); await writeFile(exe, "fixture executable bytes");
  const manifestPath = join(root, "physical.json");
  const manifest = { schema: "narro-ci-artifact-provenance/v1", kind: "physical", sourceSha: "a".repeat(40),
    observationFeatures: ["physical-observability"], githubRunId: "123", githubRunAttempt: 1,
    files: [{ path: "src-tauri/target-physical/release/narro.exe", bytes: 24, sha256: await digest(exe) }] };
  manifest.files[0].bytes = (await readFile(exe)).length;
  await writeFile(manifestPath, JSON.stringify(manifest));
  const admitted = await admitCandidate(exe, manifestPath);
  const renamed = join(root, "narro-m7-validation.exe"); await writeFile(renamed, await readFile(exe));
  await assert.rejects(admitCandidate(renamed, manifestPath), /filename/); assertions++;
  assert.equal(admitted.sourceSha, manifest.sourceSha);
  await writeFile(exe, "changed"); await assert.rejects(admitCandidate(exe, manifestPath), /bytes\/hash/);
  manifest.observationFeatures = []; await writeFile(manifestPath, JSON.stringify(manifest));
  await assert.rejects(admitCandidate(exe, manifestPath), /old packages/); assertions += 3;

  const exited = spawnSync(process.execPath, ["-e", ""], { windowsHide: true });
  assert.equal(exited.status, 0);
  const fixturePid = exited.pid;
  const packet = join(root, "packet"), logs = join(packet, "logs", "process-12");
  await mkdir(logs, { recursive: true }); await mkdir(join(packet, "media")); await mkdir(join(packet, "control"));
  const session = { schema: "narro-physical-session/v1", id: "fixture", state: "FROZEN", candidate: admitted, supervisorPid: fixturePid,
    recording: { file: "media/desktop.mkv", exitCode: 0, recorderPid: fixturePid }, processes: [{ pid: fixturePid }] };
  const write = (file, value) => writeFile(file, JSON.stringify(value));
  await write(join(packet, "session.json"), session);
  await write(join(logs, "process.json"), { pid: fixturePid, sourceSha: admitted.sourceSha });
  const rows = [
    { seq: 1, utc: "2026-11-07T10:00:00Z", event: "process-start" },
    { seq: 2, utc: "2026-11-07T10:00:01Z", event: "frontend", data: { record: { page: "p", seq: 1, event: "frontend-start", utc: "2026-11-07T10:00:01Z", lost: 0 } } },
    { seq: 3, utc: "2026-11-07T10:00:02Z", event: "frontend", data: { record: { page: "p", seq: 2, event: "page-end", utc: "2026-11-07T10:00:02Z", lost: 0 } } },
    { seq: 4, utc: "2026-11-07T10:00:03Z", event: "process-end" },
  ];
  const writeRows = async values => writeFile(join(logs, "events-00000.jsonl"), values.map(x => JSON.stringify(x)).join("\n") + "\n");
  await writeRows(rows); await write(join(logs, "health.json"), { state: "CLOSED", lost: 0, written: 4, produced: 4 });
  await writeFile(join(packet, "media", "desktop.mkv"), "fixture media — not physical proof");
  let index = await collect(packet);
  assert.equal(index.gaps.length, 1); assert.match(index.gaps[0], /not probed/);
  assert.equal(index.processes[0].records, 4);
  assert.ok(index.files.every(x => /^[a-f0-9]{64}$/.test(x.sha256))); assertions += 4;
  const focusLog = join(packet, "focus-compositor-logs", "launch-1", "focus-transition-trace.jsonl");
  await mkdir(join(packet, "focus-compositor-logs", "launch-1"), { recursive: true });
  const focusRow = { utc: "2026-11-07T10:00:01Z", processId: fixturePid, sourceSha: admitted.sourceSha,
    stage: "native.after-raster", rasterToken: 7, qpcTicks: 12345, qpcFrequency: 1000, details: { step: 2 } };
  await writeFile(focusLog, JSON.stringify(focusRow) + "\n");
  index = await collect(packet);
  const timeline = (await readFile(join(packet, "TIMELINE.jsonl"), "utf8")).trim().split("\n").map(JSON.parse);
  const focus = timeline.find(x => x.event === "focus-compositor:native.after-raster");
  assert.equal(focus.qpcTicks, 12345); assert.equal(focus.pid, fixturePid);
  assert.ok(index.files.some(x => x.path.endsWith("focus-transition-trace.jsonl")));
  assert.equal(index.gaps.length, 1); assertions += 4;
  await writeFile(focusLog, JSON.stringify({ ...focusRow, processId: 99 }) + "\n");
  index = await collect(packet);
  assert.ok(index.gaps.some(x => /unmatched compositor/.test(x))); assertions++;
  await writeFile(focusLog, JSON.stringify(focusRow) + "\n");
  const panic = { event: "rust-panic", pid: fixturePid, utc: "2026-11-07T10:00:02.500Z", traceId: "request-1", location: "fixture.rs:12", backtrace: "fixture stack" };
  await writeFile(join(logs, "panic.jsonl"), JSON.stringify(panic) + "\n");
  index = await collect(packet);
  assert.equal(index.applicationFailures.length, 1);
  assert.match(await readFile(join(packet, "TIMELINE.jsonl"), "utf8"), /fixture stack/);
  assert.match(await readFile(join(packet, "ANALYSIS_BRIEF.md"), "utf8"), /Application failures: \*\*1/);
  await writeFile(join(logs, "events-00000.jsonl"), "broken ordinary trace\n");
  const damagedTrace = await collect(packet);
  assert.equal(damagedTrace.applicationFailures.length, 1, "panic remains visible even if the ordinary trace is damaged");
  assert.equal(damagedTrace.coverage, "INCOMPLETE");
  await writeRows(rows);
  const recollected = await collect(packet);
  assert.equal(recollected.applicationFailures.length, 1);
  assert(!recollected.files.some(x => ["EVIDENCE_INDEX.json", "ANALYSIS_BRIEF.md"].includes(x.path)));
  await writeFile(join(logs, "panic.jsonl"), "broken JSON\n" + JSON.stringify({ ...panic, pid: -1 }) + "\n" + JSON.stringify(panic) + "\n");
  index = await collect(packet);
  assert.equal(index.applicationFailures.length, 1);
  assert.equal(index.gaps.filter(x => /Invalid panic record/.test(x)).length, 2);
  assert.equal(index.processes[0].records, 4, "invalid panic must not discard the ordinary trace");
  await rm(join(logs, "panic.jsonl"));
  const before = await readFile(join(packet, "EVIDENCE_INDEX.json"), "utf8");
  for (const owner of ["supervisor", "recorder"]) {
    const blocked = structuredClone(session);
    if (owner === "supervisor") blocked.supervisorPid = process.pid;
    else blocked.recording.recorderPid = process.pid;
    await write(join(packet, "session.json"), blocked);
    await assert.rejects(collect(packet, { supervisorPid: process.pid }), /still live/);
    if (process.platform === "win32") await assert.rejects(recover(packet), /still live/);
    assert.deepEqual(JSON.parse(await readFile(join(packet, "session.json"), "utf8")), blocked);
    assert.equal(await readFile(join(packet, "EVIDENCE_INDEX.json"), "utf8"), before);
  }
  if (process.platform === "win32") {
    await write(join(packet, "supervisor-health.json"), { id: "fixture", utc: new Date(0).toISOString() });
    await write(join(packet, "session.json"), { ...session, state: "INCOMPLETE", activeOwnedNarroPid: fixturePid });
    const recovered = await recover(packet);
    assert.equal(recovered.coverage, "INCOMPLETE");
    assert.equal(JSON.parse(await readFile(join(packet, "session.json"), "utf8")).activeOwnedNarroPid, null);
  }
  await write(join(packet, "session.json"), session);
  await writeRows(rows.filter(x => x.seq !== 3));
  index = await collect(packet);
  assert.ok(index.gaps.some(x => /Native trace incomplete/.test(x)));
  assert.ok(index.gaps.some(x => /Frontend tail/.test(x))); assertions += 2;
  await writeRows(rows); await write(join(logs, "health.json"), { state: "OPEN", lost: 2, written: 4, produced: 6 });
  index = await collect(packet); assert.ok(index.gaps.some(x => /Native trace incomplete/.test(x))); assertions++;
  await writeRows([...rows,{seq:5,utc:"2026-11-07T10:00:03Z",event:"backend-dispatch",traceId:"missing-origin"}]);
  await write(join(logs,"health.json"),{state:"CLOSED",lost:0,written:5,produced:5});
  index=await collect(packet);assert.ok(index.gaps.some(x=>/no originating frontend record/.test(x)));assertions++;
  session.state = "CAPTURING"; await write(join(packet, "session.json"), session);
  await assert.rejects(collect(packet), /active session/);
  await write(join(packet, "supervisor-health.json"), { id: "fixture", utc: new Date(0).toISOString() });
  await assert.rejects(request(packet, "mark", "PA-01"), /liveness is stale/); assertions += 2;
  session.state = "INCOMPLETE"; session.activeOwnedNarroPid = 12; await write(join(packet, "session.json"), session);
  await assert.rejects(collect(packet), /live-process ownership/); assertions++;
  console.log(`Physical session observer, admission, freeze/recovery and integrity regressions: PASS (base assertions: ${assertions}; plus panic/recollection/writer-exclusion cases; no Narro/desktop launched)`);
} finally { await rm(root, { recursive: true, force: true }); }

await import("./test-physical-session-lifecycle.mjs");
