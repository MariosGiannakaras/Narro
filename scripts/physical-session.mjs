// Windows physical campaign supervisor and portable, offline evidence collector.
// Nothing imports this from the product. Generated packets stay outside tracked Git.
import { spawn, spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { access, appendFile, mkdir, readFile, readdir, realpath, rename, stat, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const schema = "narro-physical-session/v1";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const utc = () => new Date().toISOString();
async function uploadFrozenEvidence(root) {
  await save(join(root, "UPLOAD_STATUS.json"), { status: "UPLOAD_PENDING", utc: utc() });
  const result = spawnSync("python", [fileURLToPath(new URL("./upload-physical-evidence.py", import.meta.url)), "--root", root], { stdio: "inherit", windowsHide: true });
  if (result.error || result.status !== 0) throw Error("Frozen evidence upload pending; preserve local packet and retry upload-physical-evidence.py: " + (result.error?.message || result.status));
  await save(join(root, "UPLOAD_STATUS.json"), { status: "UPLOADED_VERIFIED", utc: utc() });
}
// Only the supervisor's own finalizer may collect before its PID exits.
const finalizingSupervisor = Symbol("closed recorder / supervisor finalizer");

export function verifyPacketWritersStopped(session, { probe = pid => process.kill(pid, 0), supervisorPid = null } = {}) {
  const owners = [["supervisor", session.supervisorPid], ["recorder", session.recording?.recorderPid],
    ...(session.processes || []).map(x => ["Narro", x.pid])];
  for (const [name, pid] of owners) {
    if (!Number.isSafeInteger(pid) || pid <= 0) throw Error(`Unknown ${name} PID ownership; preserve the packet for inspection.`);
    if (name === "supervisor" && pid === supervisorPid) continue;
    try { probe(pid); }
    catch (error) {
      if (error.code === "ESRCH") continue;
      throw Error(`Cannot prove ${name} PID ${pid} exited; preserve the packet: ${error.message}`);
    }
    // A reused live PID is conservatively blocked too. Never kill it or infer
    // death from a stale heartbeat, filename, or serialized session state.
    throw Error(`${name} PID ${pid} is still live; resolve it before collection/recovery.`);
  }
}

async function closedWithin(closed, ms) {
  let timer;
  try { return await Promise.race([closed.then(() => true), new Promise(done => { timer = setTimeout(() => done(false), ms); })]); }
  finally { clearTimeout(timer); }
}

export async function stopOwnedRecorder(recorder, closed, { graceMs = 10000, killMs = 5000 } = {}) {
  // Diagnostic sink failure is independent from process liveness. Always stop
  // this owned child, even after ENOSPC/EPIPE, without an unbounded final wait.
  recorder.stdin?.on("error", () => {});
  if (recorder.exitCode === null && recorder.signalCode === null) {
    try { recorder.stdin?.write("q\n"); } catch { /* bounded termination below */ }
  }
  if (await closedWithin(closed, graceMs)) return { closed: true, forced: false };
  try { recorder.kill(); } catch { /* report unresolved ownership below */ }
  return { closed: await closedWithin(closed, killMs), forced: true };
}
export async function digest(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}
async function json(file) { return JSON.parse((await readFile(file, "utf8")).replace(/^\uFEFF/, "")); }
async function exists(file) { try { await access(file); return true; } catch { return false; } }
async function save(file, value) {
  const temp = file + "." + randomUUID() + ".tmp";
  await writeFile(temp, JSON.stringify(value, null, 2) + "\n", { flag: "wx" });
  await rename(temp, file);
}
function inside(root, file) {
  const rel = relative(root, file);
  if (!rel || rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel)) throw Error("Path outside session: " + file);
  return rel.split(sep).join("/");
}
async function filesUnder(root, folder = root) {
  const output = [];
  for (const item of await readdir(folder, { withFileTypes: true })) {
    if (item.isSymbolicLink()) throw Error("Session contains a link; refusing external evidence: " + item.name);
    const file = join(folder, item.name);
    if (item.isDirectory()) output.push(...await filesUnder(root, file));
    else if (item.isFile()) output.push(file);
  }
  return output.sort();
}

export async function admitCandidate(executable, manifestFile) {
  const exe = await realpath(executable);
  if (basename(exe).toLowerCase() !== "narro.exe") throw Error("Preserve the admitted narro.exe filename; validation-name mode requires separate admission.");
  const manifest = await json(manifestFile);
  if (manifest.schema !== "narro-ci-artifact-provenance/v1" || manifest.kind !== "physical"
      || !/^[a-f0-9]{40}$/.test(manifest.sourceSha || "")
      || !manifest.observationFeatures?.includes("physical-observability")) {
    throw Error("Require a physical CI manifest with exact source and physical-observability feature; old packages cannot supply this coverage.");
  }
  const hash = await digest(exe), bytes = (await stat(exe)).size;
  const match = manifest.files?.find(x => /\/release\/narro\.exe$/i.test(x.path) && x.sha256 === hash && x.bytes === bytes);
  if (!match) throw Error("Executable bytes/hash do not match the admitted physical CI manifest.");
  return { executable: exe, sha256: hash, bytes, sourceSha: manifest.sourceSha,
    githubRunId: manifest.githubRunId, githubRunAttempt: manifest.githubRunAttempt,
    observationFeatures: manifest.observationFeatures, manifestSha256: await digest(manifestFile) };
}

function windowsProcesses() {
  const result = spawnSync("powershell.exe", ["-NoLogo", "-NoProfile", "-Command",
    "[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false); @(Get-CimInstance Win32_Process -Filter \"Name='narro.exe'\" | Select-Object ProcessId,ExecutablePath,CreationDate) | ConvertTo-Json -Compress"],
  { encoding: "utf8", windowsHide: true, timeout: 15000 });
  if (result.error || result.status !== 0) throw Error("Cannot verify native process identity: " + (result.error?.message || result.stderr));
  const text = result.stdout.trim();
  if (!text) return [];
  const parsed = JSON.parse(text); return Array.isArray(parsed) ? parsed : [parsed];
}
function observeEnvironment() {
  const script = `$ErrorActionPreference='Stop'; [Console]::OutputEncoding=[Text.UTF8Encoding]::new($false); $os=Get-CimInstance Win32_OperatingSystem;
Add-Type -AssemblyName System.Windows.Forms;
@{ observedUtc=[DateTime]::UtcNow.ToString('o'); windows=@{caption=$os.Caption;version=$os.Version;build=$os.BuildNumber};
monitors=@([System.Windows.Forms.Screen]::AllScreens | ForEach-Object { @{name=$_.DeviceName;primary=$_.Primary;
bounds=@{x=$_.Bounds.X;y=$_.Bounds.Y;width=$_.Bounds.Width;height=$_.Bounds.Height};
workArea=@{x=$_.WorkingArea.X;y=$_.WorkingArea.Y;width=$_.WorkingArea.Width;height=$_.WorkingArea.Height}} }) } | ConvertTo-Json -Depth 8 -Compress`;
  const result = spawnSync("powershell.exe", ["-NoLogo", "-NoProfile", "-Command", script],
    { encoding: "utf8", windowsHide: true, timeout: 20000 });
  if (result.error || result.status !== 0) throw Error("Cannot observe session environment: " + (result.error?.message || result.stderr));
  return JSON.parse(result.stdout);
}
async function processIdentity(child, expected) {
  const running = windowsProcesses();
  const actual = running.find(x => x.ProcessId === child.pid);
  if (running.length !== 1 || !actual?.ExecutablePath
      || (await realpath(actual.ExecutablePath)).toLowerCase() !== expected.executable.toLowerCase()
      || await digest(actual.ExecutablePath) !== expected.sha256) throw Error("Running PID/path/hash does not match the sole admitted Narro candidate.");
  return actual;
}

export async function request(root, action, label) {
  root = await realpath(root);
  const session = await json(join(root, "session.json"));
  if (session.schema !== schema || session.state !== "CAPTURING") throw Error("No active capturing session at this root.");
  const health = await json(join(root, "supervisor-health.json"));
  if (health.id !== session.id || !Number.isFinite(Date.parse(health.utc)) || Date.now() - Date.parse(health.utc) > 5000) throw Error("Supervisor liveness is stale/unknown; inspect and recover instead of queuing actions.");
  if (!["launch", "mark", "finish"].includes(action)) throw Error("Unsupported supervisor action.");
  if (action === "mark" && (!label || label.length > 300)) throw Error("Marker requires a concise case/action label (max300 characters).");
  // Atomic command files avoid partially consumed commands and preserve the operator journal.
  const id = randomUUID();
  await save(join(root, "control", id + ".json"), { id, sessionId: session.id, action, label, requestedUtc: utc() });
  const resultFile = join(root, "control", id + ".json.result");
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (await exists(resultFile)) {
      const result = await json(resultFile);
      if (result.state !== "DONE") throw Error("Supervisor rejected " + action + ": " + result.error);
      return { id, ...result };
    }
    await sleep(100);
  }
  throw Error("Command queued but acknowledgement not observed; inspect " + resultFile + " before retrying.");
}

export async function supervise(options) {
  if (process.platform !== "win32") throw Error("Desktop supervisor requires Windows; collection/self-tests are portable.");
  if (!options.exe || !options.manifest || !options.ffmpeg || !options.root) throw Error("start requires --exe --manifest --ffmpeg --root");
  const candidate = await admitCandidate(options.exe, options.manifest);
  if (windowsProcesses().length) throw Error("Resolve existing Narro process/session before starting another.");
  const environment = observeEnvironment();
  const ffmpeg = await realpath(options.ffmpeg);
  const ffprobe = join(dirname(ffmpeg), "ffprobe.exe");
  const id = randomUUID(), root = resolve(options.root, new Date().toISOString().replace(/[:.]/g, "-") + "-" + id.slice(0, 8));
  await mkdir(join(root, "control"), { recursive: true });
  await mkdir(join(root, "logs")); await mkdir(join(root, "media"));
  await save(join(root, "admission.json"), candidate);
  await save(join(root, "environment.json"), environment);
  const monotonicStart = process.hrtime.bigint();
  const session = { schema, id, state: "STARTING", createdUtc: utc(), supervisorPid: process.pid,
    candidate, ffmpeg: { path: ffmpeg, sha256: await digest(ffmpeg) }, processes: [],
    recording: { file: "media/desktop.mkv", audio: "NOT CAPTURED; no audio acceptance",
      clock: "frame-zero UTC is bounded by recorderStartedUtc and firstFrameObservedUtc; use actual video PTS within that bound, not a frame-exact UTC claim" },
    consumer: "current physical acceptance and combined video/full-stack analysis", retirement: "verified replacement and no remaining unique consumer" };
  await save(join(root, "session.json"), session);
  const journal = row => appendFile(join(root, "actions.jsonl"), JSON.stringify({ utc: utc(),
    elapsedUs: ((process.hrtime.bigint() - monotonicStart) / 1000n).toString(), ...row }) + "\n");
  let recordingExit = null, recordingError = null, firstFrame = null, current = null, finished = false, handling = false;
  let framesSeen = 0, lastFrameAt = Date.now();
  const logClosures = [];
  const logStream = file => {
    const output = createWriteStream(file);
    logClosures.push(new Promise(done => { output.on("finish", done); output.on("close", done); output.on("error", done); }));
    output.on("error", error => { recordingError = "Diagnostic stream write failed: " + error.message; });
    return output;
  };
  const diagnostics = logStream(join(root, "recorder.stderr.log"));
  session.recording.recorderStartedUtc = utc();
  const recorder = spawn(ffmpeg, ["-hide_banner", "-y", "-f", "gdigrab", "-framerate", "60", "-draw_mouse", "1",
    "-i", "desktop", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "18", "-pix_fmt", "yuv420p",
    "-progress", "pipe:3", join(root, session.recording.file)], { stdio: ["pipe", "ignore", "pipe", "pipe"], windowsHide: true });
  session.recording.recorderPid = recorder.pid ?? null;
  recorder.stdin.on("error", () => {});
  recorder.stderr.pipe(diagnostics);
  const recorderClosed = new Promise(done => {
    recorder.on("error", e => { recordingError = e.message; done(); });
    recorder.on("close", code => { recordingExit = code; done(); });
  });
  const progress = createInterface({ input: recorder.stdio[3] });
  progress.on("line", line => {
    const match = /^frame=\s*(\d+)/.exec(line);
    if (match && Number(match[1]) > framesSeen) {
      framesSeen = Number(match[1]); lastFrameAt = Date.now(); if (!firstFrame) firstFrame = utc();
    }
  });
  let failure;
  async function launch() {
    if (current && current.exitCode === null && !current.killed) throw Error("Owned Narro is still alive; do not duplicate the process.");
    if (windowsProcesses().length) throw Error("A Narro process already exists; inspect it before relaunch.");
    if (await digest(candidate.executable) !== candidate.sha256) throw Error("Candidate bytes changed since admission.");
    const segment = { startedUtc: utc(), pid: null, exitCode: null, identity: null };
    const child = spawn(candidate.executable, [], { cwd: dirname(candidate.executable), windowsHide: false,
      env: { ...process.env, NARRO_PHYSICAL_SESSION_DIR: join(root, "logs"),
        NARRO_PHYSICAL_LOGGING_PROBE: "0",
        NARRO_TIMER_DIAGNOSTICS_DIR: join(root, "legacy-timer-logs"), NARRO_NATIVE_MOVE_TRACE_DIR: join(root, "legacy-move-logs") },
      stdio: ["ignore", "pipe", "pipe"] });
    current = child; segment.pid = child.pid; session.processes.push(segment);
    child.stdout.pipe(logStream(join(root, `process-${child.pid}.stdout.log`)));
    child.stderr.pipe(logStream(join(root, `process-${child.pid}.stderr.log`)));
    child.on("error", error => { segment.error = error.message; });
    child.on("close", code => { segment.exitCode = code; segment.exitedUtc = utc(); });
    await save(join(root, "session.json"), session);
    await journal({ event: "process-created", pid: child.pid, executable: candidate.executable });
    await sleep(1000);
    segment.identity = await processIdentity(child, candidate);
    // Wait for actual instrumentation, not merely an empty directory or successful launch.
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      const dirs = await readdir(join(root, "logs"), { withFileTypes: true });
      for (const item of dirs.filter(x => x.isDirectory())) {
        const file = join(root, "logs", item.name, "process.json");
        if (!await exists(file)) continue;
        const info = await json(file);
        if (info.pid !== child.pid) continue;
        if (info.sourceSha !== candidate.sourceSha || info.feature !== "physical-observability") throw Error("Observed trace source/feature differs from candidate admission.");
        const healthFile = join(dirname(file), "health.json");
        if (!await exists(healthFile)) continue;
        let health; try { health = await json(healthFile); } catch { continue; }
        if (health.state === "FAILED" || health.lost > 0) throw Error("Trace writer unhealthy at admission.");
        const rows = await traceRows(dirname(file));
        if (rows.some(x => x.event === "frontend" && x.data?.record?.event === "backend-clock-handshake" && x.data.record.data?.ready === true)) {
          segment.traceDirectory = inside(root, dirname(file));
          segment.admittedUtc = utc(); await save(join(root, "session.json"), session);
          await journal({ event: "logging-admitted", pid: child.pid, traceDirectory: segment.traceDirectory }); return;
        }
      }
      if (child.exitCode !== null || segment.error) throw Error("Narro exited before logging admission.");
      await sleep(250);
    }
    throw Error("No live frontend/backend logging handshake within20s. Freeze diagnostics; do not score acceptance.");
  }
  try {
    // Persist ownership before waiting for a frame or launching the product.
    await save(join(root, "session.json"), session);
    const deadline = Date.now() + 20000;
    while (!firstFrame && recordingExit === null && !recordingError && Date.now() < deadline) await sleep(100);
    if (!firstFrame) throw Error(recordingError || "Recorder produced no first frame; application was not launched.");
    session.recording.firstFrameObservedUtc = firstFrame;
    session.state = "CAPTURING";
    await save(join(root, "session.json"), session);
    await save(join(root, "supervisor-health.json"), { id, pid: process.pid, utc: utc() });
    await journal({ event: "recorder-first-frame", firstFrameObservedUtc: firstFrame });
    console.log("SESSION_ROOT=" + root);
    await launch();
    const handled = new Set();
    let nextHealthCheck = 0;
    while (!finished) {
      if (recordingExit !== null || recordingError) throw Error(recordingError || "Recorder stopped unexpectedly; capture coverage is incomplete.");
      if (Date.now() - lastFrameAt > 10000) throw Error("Recorder produced no new frame for10s; freeze the stalled capture for analysis.");
      if (current?.exitCode === null && Date.now() >= nextHealthCheck) {
        nextHealthCheck = Date.now() + 1000;
        const owned = session.processes.at(-1);
        if (owned?.traceDirectory) {
          const healthFile = join(root, owned.traceDirectory, "health.json");
          // A concurrent health write can briefly be incomplete; retry once before diagnosing a gap.
          let health;
          try { health = await json(healthFile); } catch { await sleep(30); health = await json(healthFile); }
          if (health.state === "FAILED" || health.lost > 0 || !Number.isFinite(Date.parse(health.utc)) || Date.now() - Date.parse(health.utc) > 5000)
            throw Error("Live trace health failed/stalled/dropped records; freeze this session for analysis.");
        }
      }
      await save(join(root, "supervisor-health.json"), { id, pid: process.pid, utc: utc(), framesSeen, lastFrameAt });
      const commands = [];
      for (const item of (await readdir(join(root, "control"))).filter(x => x.endsWith(".json"))) {
        if (!handled.has(item)) commands.push({ item, value: await json(join(root, "control", item)) });
      }
      commands.sort((a,b) => String(a.value.requestedUtc).localeCompare(String(b.value.requestedUtc)) || a.item.localeCompare(b.item));
      for (const { item, value: command } of commands) {
        if (handled.has(item) || handling) continue;
        handling = true;
        try {
          if (command.sessionId !== id) throw Error("Control command belongs to another session.");
          await journal({ event: "operator-command", ...command });
          if (command.action === "launch") await launch();
          else if (command.action === "finish") {
            if (windowsProcesses().some(x => x.ProcessId === current?.pid)) throw Error("Quit Narro normally before finishing; the supervisor never silently kills a persistence case.");
            finished = true;
          } else if (command.action !== "mark") throw Error("Unknown control action");
          handled.add(item);
          await save(join(root, "control", item + ".result"), { state: "DONE", utc: utc() });
        } catch (error) {
          handled.add(item);
          await save(join(root, "control", item + ".result"), { state: "REJECTED", utc: utc(), error: error.message });
          await journal({ event: "control-rejected", error: error.message });
        } finally { handling = false; }
      }
      await sleep(250);
    }
    await sleep(500); // Keep the actual process exit visible before final recorder stop.
  } catch (error) { failure = error; }
  finally {
    const stopped = await stopOwnedRecorder(recorder, recorderClosed);
    if ((!current || current.exitCode !== null) && !await closedWithin(Promise.all(logClosures), 5000))
      failure ||= Error("Diagnostic streams did not drain within bounded shutdown.");
    if (recordingError) failure ||= Error(recordingError);
    if (stopped.forced) failure ||= Error("Recorder required forced termination; verify the surviving media.");
    if (!stopped.closed) failure ||= Error("Recorder did not close within bounded shutdown; preserve its ownership and files.");
    session.recording.closed = stopped.closed;
    session.recording.exitCode = recordingExit;
    session.recording.framesSeen = framesSeen;
    session.state = failure ? "INCOMPLETE" : "FROZEN";
    session.endedUtc = utc(); session.error = failure?.message;
    session.activeOwnedNarroPid = current?.exitCode === null ? current.pid : null;
    await save(join(root, "session.json"), session);
    await journal({ event: "supervisor-end", state: session.state, activeOwnedNarroPid: session.activeOwnedNarroPid });
    if (!session.activeOwnedNarroPid && stopped.closed) {
      await collect(root, { ffprobe }, finalizingSupervisor);
      await uploadFrozenEvidence(root);
    }
    else console.error("Packet writer ownership remains unresolved. Preserve all files; Quit Narro normally if live, inspect the owned recorder, then use recover --root " + root);
  }
  if (failure) throw Error(failure.message + "; preserved session: " + root);
  return root;
}

async function traceRows(root) {
  const rows = [];
  for (const item of (await readdir(root)).filter(x => /^events-\d+\.jsonl$/.test(x)).sort()) {
    const reader = createInterface({ input: createReadStream(join(root, item)), crlfDelay: Infinity });
    for await (const line of reader) if (line.trim()) rows.push(JSON.parse(line));
  }
  return rows;
}

export async function collect(root, { ffprobe } = {}, finalizer) {
  root = await realpath(root);
  const session = await json(join(root, "session.json"));
  if (session.schema !== schema) throw Error("Not a Narro physical session.");
  if (["CAPTURING", "STARTING"].includes(session.state)) throw Error("Freeze or recover the active session before collection; do not rewrite in-flight evidence.");
  if (session.activeOwnedNarroPid) throw Error("Session has unresolved live-process ownership; use recover after normal Quit.");
  verifyPacketWritersStopped(session, { supervisorPid: finalizer === finalizingSupervisor ? process.pid : null });
  const gaps = [], processes = [], timeline = [], applicationFailures = [];
  if (session.state !== "FROZEN") gaps.push("Supervisor did not finish normally: " + session.state);
  for (const directory of (await readdir(join(root, "logs"), { withFileTypes: true })).filter(x => x.isDirectory())) {
    const folder = join(root, "logs", directory.name);
    try {
      const info = await json(join(folder, "process.json"));
      const panicFile = join(folder, "panic.jsonl");
      if (await exists(panicFile)) {
        const lines = (await readFile(panicFile, "utf8")).split(/\r?\n/);
        for (const [offset, line] of lines.entries()) {
          if (!line.trim()) continue;
          try {
            const panic = JSON.parse(line);
            if (info.sourceSha !== session.candidate.sourceSha || !session.processes?.some(x => x.pid === info.pid)
                || panic.pid !== info.pid || panic.event !== "rust-panic" || !Number.isFinite(Date.parse(panic.utc)))
              throw Error("panic source/PID/event/time does not match the admitted process");
            const failure = { ...panic, source: inside(root, panicFile), line: offset + 1 };
            timeline.push(failure); applicationFailures.push(failure);
          } catch (error) { gaps.push(`Invalid panic record ${inside(root, panicFile)}:${offset + 1}: ${error.message}`); }
        }
      }
      const health = await json(join(folder, "health.json"));
      const rows = await traceRows(folder), sequences = new Set(rows.map(x => x.seq));
      if (info.sourceSha !== session.candidate.sourceSha) gaps.push("Source mismatch for PID " + info.pid);
      if (health.state !== "CLOSED" || health.lost || health.produced !== health.written
          || sequences.size !== health.produced || rows.length !== sequences.size
          || !sequences.has(1) || !sequences.has(health.produced)
          || !rows.some(x => x.event === "process-end")) gaps.push("Native trace incomplete for PID " + info.pid);
      if (rows.some(x => /drain-(?:timeout|eval-failed)/.test(x.event))) gaps.push("Frontend shutdown drain failed for PID " + info.pid);
      if (rows.some(x => x.event === "quit-cancelled-observer-resume")) gaps.push("Frontend observation briefly paused during cancelled Quit for PID " + info.pid);
      for (const receipt of rows.filter(x => x.event === "frontend-drained").map(x => x.data?.receipt)) {
        if (!receipt || receipt.lost || receipt.queued || receipt.inFlight) gaps.push("Frontend shutdown acknowledgement incomplete for PID " + info.pid);
      }
      const frontend = new Map(), starts = new Set(), outcomes = new Set(), dispatched = new Set();
      for (const row of rows) {
        if (row.event === "backend-dispatch" && row.traceId) dispatched.add(row.traceId);
        const record = row.event === "frontend" ? row.data?.record : null;
        if (record) {
          if (record.event === "ipc-start") starts.add(record.data?.traceId);
          if (["ipc-result", "ipc-error"].includes(record.event)) outcomes.add(record.data?.traceId);
          const page = frontend.get(record.page) || { sequences: new Set(), lost: 0, started: false, ended: false };
          page.sequences.add(record.seq); page.lost = Math.max(page.lost, record.lost || 0);
          page.started ||= record.event === "frontend-start"; page.ended ||= record.event === "page-end";
          frontend.set(record.page, page);
          timeline.push({ utc: record.utc, pid: info.pid, page: record.page, seq: record.seq, event: record.event,
            traceId: record.data?.traceId, actionId: record.actionId, data: record.data });
        } else timeline.push({ utc: row.utc, pid: info.pid, seq: row.seq, event: row.event, traceId: row.traceId, data: row.data });
      }
      for (const id of dispatched) if (!starts.has(id)) gaps.push("Backend request has no originating frontend record: " + id);
      for (const id of starts) if (!outcomes.has(id)) gaps.push("Frontend request has no observed outcome: " + id);
      for (const [id, page] of frontend) {
        let last = 0;
        for (const sequence of page.sequences) last = Math.max(last, sequence);
        if (!page.started || !page.ended || page.lost || page.sequences.size !== last)
          gaps.push("Frontend tail/sequence coverage incomplete for page " + id);
      }
      if (!frontend.size) gaps.push("No frontend trace for PID " + info.pid);
      processes.push({ pid: info.pid, directory: inside(root, folder), records: rows.length, health,
        frontendPages: frontend.size, asyncCausality: "Only explicit traceId is causal; thread/timestamp proximity alone is not." });
    } catch (error) { gaps.push(directory.name + ": " + error.message); }
  }
  if (!processes.length) gaps.push("No readable application trace packets.");
  for (const owned of session.processes || []) if (!processes.some(x => x.pid === owned.pid)) gaps.push("Missing trace for launched PID " + owned.pid);
  const actionsFile = join(root, "actions.jsonl");
  if (await exists(actionsFile)) for (const line of (await readFile(actionsFile, "utf8")).trim().split("\n")) {
    if (line) timeline.push({ ...JSON.parse(line), event: "operator:" + JSON.parse(line).event });
  }
  timeline.sort((a, b) => Date.parse(a.utc) - Date.parse(b.utc) || (a.seq || 0) - (b.seq || 0));
  await writeFile(join(root, "TIMELINE.jsonl"), timeline.map(x => JSON.stringify(x)).join("\n") + "\n");
  const media = join(root, session.recording.file);
  let probe = null;
  if (!await exists(media) || !(await stat(media)).size) gaps.push("Recording missing or empty.");
  else if (ffprobe && await exists(ffprobe)) {
    const result = spawnSync(ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", media],
      { encoding: "utf8", windowsHide: true, timeout: 30000 });
    if (result.status !== 0) gaps.push("ffprobe could not read the recording.");
    else {
      probe = JSON.parse(result.stdout); await save(join(root, "media", "ffprobe.json"), probe);
      const pts = createWriteStream(join(root, "media", "video-pts.csv"));
      const frames = spawn(ffprobe, ["-v", "error", "-select_streams", "v:0", "-show_frames", "-show_entries",
        "frame=best_effort_timestamp_time", "-of", "csv=p=0", media], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
      let probeError = null, probeCode = null;
      const diagnostic = createWriteStream(join(root, "media", "pts-probe.stderr.log"));
      const sinks = [pts, diagnostic].map(output => new Promise(done => {
        output.on("finish", done); output.on("close", done);
        output.on("error", error => { probeError = error.message; frames.kill(); done(); });
      }));
      frames.stdout.pipe(pts); frames.stderr.pipe(diagnostic);
      const probeClosed = new Promise(done => {
        frames.on("error", error => { probeError = error.message; done(); });
        frames.on("close", code => { probeCode = code; done(); });
      });
      if (!await closedWithin(probeClosed, 30000)) {
        frames.kill(); probeError = "PTS probe timed out";
        if (!await closedWithin(probeClosed, 5000)) throw Error("PTS probe still live; preserve the packet and retry after it exits.");
      }
      if (!await closedWithin(Promise.all(sinks), 5000)) throw Error("PTS probe streams still open; preserve the packet.");
      if (probeError || probeCode !== 0 || !(await stat(join(root, "media", "video-pts.csv"))).size) gaps.push("Frame PTS extraction incomplete: " + (probeError || probeCode));
    }
  } else gaps.push("Recording readability/PTS not probed; provide --ffprobe.");
  if (session.recording.exitCode !== 0) gaps.push("Recorder did not exit successfully.");
  const inventory = [];
  for (const file of await filesUnder(root)) {
    const path = inside(root, file);
    if (["EVIDENCE_INDEX.json", "ANALYSIS_BRIEF.md", "UPLOAD_STATUS.json", "UPLOAD_RECEIPT.json"].includes(path) || path.endsWith(".tmp")) continue;
    inventory.push({ path, bytes: (await stat(file)).size, sha256: await digest(file) });
  }
  const index = { schema, id: session.id, collectedUtc: utc(), candidate: session.candidate,
    coverage: gaps.length ? "INCOMPLETE" : "COMPLETE", gaps, processes, applicationFailures,
    video: { ...session.recording, probe: probe ? "media/ffprobe.json" : null, framePts: probe ? "media/video-pts.csv" : null },
    timeline: "TIMELINE.jsonl", files: inventory,
    verdict: "NOT RUN — packet integrity/coverage does not grade product acceptance",
    analysis: "Read this index and brief, then inspect original video intervals/PTS together with matching timeline/trace records; log absence is not failure absence." };
  // Upload status/receipt are not frozen evidence, and repeat collection must
  // not create a new remote evidence identity when the actual packet is unchanged.
  // Preserve the initial collection timestamp only for byte-identical inventories
  // and identical computed coverage/case metadata. Real source/log changes reindex.
  const indexPath = join(root, "EVIDENCE_INDEX.json");
  if (await exists(indexPath)) {
    let prior;
    try { prior = await json(indexPath); } catch { /* regenerate malformed metadata */ }
    if (prior?.schema === schema && prior.id === session.id
        && typeof prior.collectedUtc === "string" && Number.isFinite(Date.parse(prior.collectedUtc))
        && JSON.stringify({ ...prior, collectedUtc: null }) === JSON.stringify({ ...index, collectedUtc: null })) {
      index.collectedUtc = prior.collectedUtc;
    }
  }
  await save(indexPath, index);
  await writeFile(join(root, "ANALYSIS_BRIEF.md"), `# Physical session ${session.id}\n\nSource: ${session.candidate.sourceSha}\nEXE SHA256: ${session.candidate.sha256}\nTrace coverage: **${index.coverage}**\n\nApplication failures: **${applicationFailures.length}** (packet completeness is not product success).\n${applicationFailures.map(x => `- ${x.utc} PID ${x.pid}: ${x.event} at ${x.location || "unknown location"}; ${x.source}:${x.line}`).join("\n")}\n\nStart with EVIDENCE_INDEX.json and TIMELINE.jsonl. All raw inputs have path/size/SHA256. Compare original video and actual PTS with action, IPC, state, SQLite and native observations. Preserve independent PASS/FAIL/INCONCLUSIVE/NOT RUN per requirement.\n\n${gaps.map(x => "- " + x).join("\n") || "No detected packet-integrity gap."}\n\nIPC success and SQLite commit-request are not visual or durable-state acceptance. Async/thread/time proximity is not causal linkage. Coalesced DOM observations are not every paint. No audio is recorded. Follow the normal retention policy after the named consumer closes.\n`);
  return index;
}

export async function recover(root, options = {}) {
  root = await realpath(root);
  const session = await json(join(root, "session.json"));
  if (session.schema !== schema) throw Error("Not a physical session.");
  if (process.platform !== "win32") throw Error("Ownership recovery requires the original Windows host.");
  verifyPacketWritersStopped(session);
  const live = windowsProcesses();
  if (live.some(x => session.processes?.some(p => p.pid === x.ProcessId)))
    throw Error("An owned Narro PID is still running; inspect identity and Quit it normally before recovery.");
  const healthPath = join(root, "supervisor-health.json");
  if (await exists(healthPath)) {
    const health = await json(healthPath);
    if (Date.now() - Date.parse(health.utc) < 5000) throw Error("Supervisor may still be live; resolve it before recovery.");
  }
  session.state = "INCOMPLETE"; session.activeOwnedNarroPid = null; session.recoveredUtc = utc();
  await save(join(root, "session.json"), session);
  return collect(root, options);
}

function argumentsFor(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    if (!argv[i]?.startsWith("--") || !argv[i + 1]) throw Error("Expected --name value pairs.");
    options[argv[i].slice(2)] = argv[i + 1];
  }
  return options;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const command = process.argv[2], options = argumentsFor(process.argv.slice(3));
    if (command === "start") await supervise(options);
    else if (command === "collect") { console.log(JSON.stringify(await collect(options.root, options), null, 2)); await uploadFrozenEvidence(options.root); }
    else if (command === "recover") { console.log(JSON.stringify(await recover(options.root, options), null, 2)); await uploadFrozenEvidence(options.root); }
    else if (["launch", "mark", "finish"].includes(command)) console.log(await request(options.root, command, options.label));
    else throw Error("Use start, launch, mark, finish, collect or recover with --root and required arguments.");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
