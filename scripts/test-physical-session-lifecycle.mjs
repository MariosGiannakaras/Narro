import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFile } from "node:fs/promises";
import { stopOwnedRecorder, verifyPacketWritersStopped } from "./physical-session.mjs";

const limits = { graceMs: 3, killMs: 3 };
for (const mode of ["normal", "sink-error", "force", "stuck", "pipe-throw", "already-closed"]) {
  let resolve, q = 0, kills = 0;
  const closed = new Promise(done => { resolve = done; });
  const child = { exitCode: null, signalCode: null, stdin: new EventEmitter(), kill() {
    kills++; if (mode !== "stuck") resolve();
  } };
  child.stdin.write = value => {
    assert.equal(value, "q\n"); q++;
    if (mode === "pipe-throw") throw Error("EPIPE");
    if (["normal", "sink-error"].includes(mode)) resolve();
  };
  if (mode === "already-closed") { child.exitCode = 0; resolve(); }
  const result = await stopOwnedRecorder(child, closed, limits);
  assert.equal(result.closed, mode !== "stuck");
  assert.equal(q, mode === "already-closed" ? 0 : 1);
  assert.equal(kills, ["force", "stuck", "pipe-throw"].includes(mode) ? 1 : 0);
  assert.equal(result.forced, kills !== 0);
}
const source = (await readFile(new URL("./physical-session.mjs", import.meta.url), "utf8")).replace(/\r\n/g, "\n");
const from = source.indexOf("  finally {\n    const stopped = await stopOwnedRecorder"), to = source.indexOf("\n  if (failure) throw", from);
assert(from >= 0 && to > from);
// Execute the real supervisor finalizer with a failed diagnostic sink and a
// still-running owned recorder. No application or desktop is involved.
const body = source.slice(from + "  finally {".length, to).replace(/\n  }$/, "");
const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
let stopped = false, collected = false, uploaded = false;
const session = { recording: {} };
await new AsyncFunction("stopOwnedRecorder", "recorder", "recorderClosed", "recordingError", "recordingExit", "framesSeen", "session", "failure", "current", "save", "join", "root", "journal", "collect", "ffprobe", "finalizingSupervisor", "utc", "logClosures", "closedWithin", "uploadFrozenEvidence", body)(
  async () => { stopped = true; return { closed: true, forced: false }; }, {}, Promise.resolve(), "ENOSPC fixture", 0, 6,
  session, undefined, null, async () => {}, (...parts) => parts.join("/"), "fixture", async () => {}, async () => { collected = true; }, null, Symbol(), () => "fixture-time", [], async () => true, async () => { assert(collected); uploaded = true; });
assert(stopped && collected && uploaded); assert.equal(session.state, "INCOMPLETE"); assert.match(session.error, /ENOSPC/);

const packet = { supervisorPid: 101, recording: { recorderPid: 102 }, processes: [{ pid: 103 }] };
const gone = () => { throw Object.assign(Error("exited"), { code: "ESRCH" }); };
verifyPacketWritersStopped(packet, { probe: gone });
for (const livePid of [101, 102, 103]) {
  assert.throws(() => verifyPacketWritersStopped(packet, { probe: pid => { if (pid !== livePid) gone(); } }), /still live/);
}
assert.throws(() => verifyPacketWritersStopped(packet, { probe: () => { throw Object.assign(Error("denied"), { code: "EPERM" }); } }), /Cannot prove/);
assert.throws(() => verifyPacketWritersStopped({ ...packet, recording: {} }, { probe: gone }), /Unknown recorder/);
console.log("Recorder bounded shutdown, actual failed-sink finalizer and live/unknown writer exclusion: PASS");
