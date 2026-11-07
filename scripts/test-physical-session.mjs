import assert from "node:assert/strict";
import vm from "node:vm";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { admitCandidate, collect, digest, request } from "./physical-session.mjs";
import { physicalTracePlugin } from "./physical-trace-vite.mjs";

const root = await mkdtemp(join(tmpdir(), "narro-physical-session-test-"));
let assertions = 0;
try {
  // Real immutable Tauri-style internals: observation must not monkey-patch them.
  const batches = [], calls = [], intervals = new Map(), listeners = new Map();
  let intervalId = 0;
  const original = async (command, args, options) => {
    calls.push({ command, args, options });
    if (command.endsWith("|batch")) { batches.push(...structuredClone(args.records)); return; }
    if (command.endsWith("|hello")) return { pid: 12, runId: "r" };
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
  assert.equal(success.args, args); assert.equal(success.options.headers.get("x-existing"), "yes");
  assert.ok(success.options.headers.get("x-narro-trace-id")); assertions += 5;
  await trace.drain();
  assert.ok(batches.some(x => x.event === "ipc-result"));
  assert.ok(batches.some(x => x.event === "ipc-error"));
  assert.ok(batches.some(x => x.event === "page-end"));
  assert.ok(calls.some(x => x.command.endsWith("|drained") && x.args.queued === 0 && x.args.inFlight === 0));
  assert.ok(!JSON.stringify(batches).includes("private task")); assertions += 5;
  trace.resume();
  for (let i = 0; i < 1100; i++) trace.record("stress", { i });
  assert.ok(trace.health().lost > 0, "bounded frontend queue must expose drops"); assertions++;
  await trace.drain();
  const shutdown = await readFile("src-tauri/src/normal_shutdown.rs", "utf8");
  assert.ok(shutdown.indexOf("prepare_exit(&app)") < shutdown.indexOf("let result = complete_after_checkpoint"),
    "diagnostic draining must precede the final authoritative timer checkpoint"); assertions++;
  const plugin = physicalTracePlugin(true);
  assert.match(plugin.resolveId("@tauri-apps/api/core", "src/App.tsx"), /physicalInvoke\.ts$/);
  assert.equal(plugin.resolveId("@tauri-apps/api/core", "src/physicalInvoke.ts"), null);
  assert.equal(physicalTracePlugin(false).resolveId("@tauri-apps/api/core", "src/App.tsx"), null); assertions += 3;

  const exe = join(root, "narro.exe"); await writeFile(exe, "fixture executable bytes");
  const manifestPath = join(root, "physical.json");
  const manifest = { schema: "narro-ci-artifact-provenance/v1", kind: "physical", sourceSha: "a".repeat(40),
    observationFeatures: ["physical-observability"], githubRunId: "123", githubRunAttempt: 1,
    files: [{ path: "src-tauri/target-physical/release/narro.exe", bytes: 24, sha256: await digest(exe) }] };
  manifest.files[0].bytes = (await readFile(exe)).length;
  await writeFile(manifestPath, JSON.stringify(manifest));
  const admitted = await admitCandidate(exe, manifestPath);
  assert.equal(admitted.sourceSha, manifest.sourceSha);
  await writeFile(exe, "changed"); await assert.rejects(admitCandidate(exe, manifestPath), /bytes\/hash/);
  manifest.observationFeatures = []; await writeFile(manifestPath, JSON.stringify(manifest));
  await assert.rejects(admitCandidate(exe, manifestPath), /old packages/); assertions += 3;

  const packet = join(root, "packet"), logs = join(packet, "logs", "process-12");
  await mkdir(logs, { recursive: true }); await mkdir(join(packet, "media")); await mkdir(join(packet, "control"));
  const session = { schema: "narro-physical-session/v1", id: "fixture", state: "FROZEN", candidate: admitted,
    recording: { file: "media/desktop.mkv", exitCode: 0 }, processes: [{ pid: 12 }] };
  const write = (file, value) => writeFile(file, JSON.stringify(value));
  await write(join(packet, "session.json"), session);
  await write(join(logs, "process.json"), { pid: 12, sourceSha: admitted.sourceSha });
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
  await writeRows(rows.filter(x => x.seq !== 3));
  index = await collect(packet);
  assert.ok(index.gaps.some(x => /Native trace incomplete/.test(x)));
  assert.ok(index.gaps.some(x => /Frontend tail/.test(x))); assertions += 2;
  await writeRows(rows); await write(join(logs, "health.json"), { state: "OPEN", lost: 2, written: 4, produced: 6 });
  index = await collect(packet); assert.ok(index.gaps.some(x => /Native trace incomplete/.test(x))); assertions++;
  session.state = "CAPTURING"; await write(join(packet, "session.json"), session);
  await assert.rejects(collect(packet), /active session/);
  await write(join(packet, "supervisor-health.json"), { id: "fixture", utc: new Date(0).toISOString() });
  await assert.rejects(request(packet, "mark", "PA-01"), /liveness is stale/); assertions += 2;
  session.state = "INCOMPLETE"; session.activeOwnedNarroPid = 12; await write(join(packet, "session.json"), session);
  await assert.rejects(collect(packet), /live-process ownership/); assertions++;
  console.log(`Physical session observer, admission, freeze/recovery and integrity regressions: PASS (${assertions} assertions; no Narro/desktop launched)`);
} finally { await rm(root, { recursive: true, force: true }); }
