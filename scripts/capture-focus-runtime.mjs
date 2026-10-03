import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const executable = path.resolve(root, process.argv[2] ?? "src-tauri/target/release/narro.exe");
const outputDirectory = path.resolve(root, process.argv[3] ?? "artifacts/focus-runtime-visual");
const focusTitle = "Narro - Focus";

function invariant(condition, message) {
  if (!condition) throw new Error(`Packaged Focus runtime capture failed: ${message}`);
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitUntil(label, callback, timeoutMs = 15000, intervalMs = 25) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const value = await callback();
      if (value) return value;
    } catch (error) { lastError = error; }
    await sleep(intervalMs);
  }
  throw new Error(`${label} did not become ready within ${timeoutMs}ms${lastError ? `: ${lastError}` : ""}`);
}

function readNativeMetadata() {
  const stdout = execFileSync("powershell.exe", [
    "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass",
    "-File", path.join(root, "scripts", "read-focus-window-metadata.ps1"),
    "-Title", focusTitle,
  ], { cwd: root, encoding: "utf8" });
  return JSON.parse(stdout.trim().split(/\r?\n/).filter(Boolean).at(-1));
}

function captureWindow(filePath, width, height, hostHeight = false) {
  const args = [
    "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass",
    "-File", path.join(root, "scripts", "capture-focus-window.ps1"),
    "-Title", focusTitle, "-Output", filePath,
    "-OutputWidth", String(width), "-OutputHeight", String(height),
  ];
  if (hostHeight) args.push("-HostHeight");
  execFileSync("powershell.exe", args, { cwd: root, stdio: "pipe" });
}

function checkpointPath(phase) {
  return path.join(outputDirectory, `checkpoint-${phase}.json`);
}

function ackPath(phase) {
  return path.join(outputDirectory, `ack-${phase}.ready`);
}

function acknowledge(phase) {
  fs.writeFileSync(ackPath(phase), "ready\n");
}

async function waitCheckpoint(phase, timeoutMs = 30000) {
  return waitUntil(`Focus runtime checkpoint ${phase}`, () => {
    const file = checkpointPath(phase);
    if (fs.existsSync(file)) {
      const payload = JSON.parse(fs.readFileSync(file, "utf8"));
      if (payload.error) throw new Error(payload.error);
      return payload;
    }
    if (phase !== "complete" && fs.existsSync(checkpointPath("complete"))) {
      const complete = JSON.parse(fs.readFileSync(checkpointPath("complete"), "utf8"));
      if (complete.error) throw new Error(complete.error);
    }
    return null;
  }, timeoutMs);
}

async function captureSettled(name, phase, presentation, width, height) {
  const checkpoint = await waitCheckpoint(phase);
  const png = path.join(outputDirectory, `${name}.png`);
  captureWindow(png, width, height);
  const native = readNativeMetadata();
  const metadata = { name, presentation, dom: checkpoint.snapshot, native };
  fs.writeFileSync(path.join(outputDirectory, `${name}.json`), `${JSON.stringify(metadata, null, 2)}\n`);
  acknowledge(phase);
  return metadata;
}

async function captureTransition(name, startPhase, startPresentation, endPhase, endPresentation, acknowledgeEnd = false) {
  const directory = path.join(outputDirectory, name);
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
  const start = await waitCheckpoint(startPhase);
  const readyFile = path.join(directory, "sequence-ready.txt");
  const motionReadyFile = path.join(directory, "motion-ready.txt");
  const stopFile = path.join(directory, "transition-settled.stop");
  const sequence = spawn("powershell.exe", [
    "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass",
    "-File", path.join(root, "scripts", "capture-focus-window-sequence.ps1"),
    "-Title", focusTitle, "-OutputDirectory", directory,
    "-ReadyFile", readyFile,
    "-StopFile", stopFile,
    "-FrameCount", "30", "-IntervalMs", "15",
    "-MaxDurationMs", "30000",
  ], { cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let sequenceStdout = "";
  let sequenceStderr = "";
  sequence.stdout.setEncoding("utf8");
  sequence.stderr.setEncoding("utf8");
  sequence.stdout.on("data", (chunk) => { sequenceStdout += chunk; });
  sequence.stderr.on("data", (chunk) => { sequenceStderr += chunk; });
  const sequenceFinished = new Promise((resolve, reject) => {
    sequence.once("error", reject);
    sequence.once("close", (code) => {
      if (code === 0) resolve(sequenceStdout);
      else reject(new Error(`native sequence capture exited ${code}: ${sequenceStderr.trim()}`));
    });
  });

  const motion = spawn("powershell.exe", [
    "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass",
    "-File", path.join(root, "scripts", "sample-focus-window-motion.ps1"),
    "-Title", focusTitle,
    "-ReadyFile", motionReadyFile,
    "-StopFile", stopFile,
    "-SampleCount", "160", "-IntervalMs", "8",
    "-MaxDurationMs", "30000",
  ], { cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  let motionStdout = "";
  let motionStderr = "";
  motion.stdout.setEncoding("utf8");
  motion.stderr.setEncoding("utf8");
  motion.stdout.on("data", (chunk) => { motionStdout += chunk; });
  motion.stderr.on("data", (chunk) => { motionStderr += chunk; });
  const motionFinished = new Promise((resolve, reject) => {
    motion.once("error", reject);
    motion.once("close", (code) => {
      if (code === 0) resolve(motionStdout);
      else reject(new Error(`native motion sampler exited ${code}: ${motionStderr.trim()}`));
    });
  });

  await waitUntil(`native transition probes ${name}`, () =>
    fs.existsSync(readyFile) && fs.existsSync(motionReadyFile));
  acknowledge(startPhase);

  let settled;
  let settleFailure;
  try {
    settled = await waitCheckpoint(endPhase);
  } catch (error) {
    settleFailure = error;
  } finally {
    fs.writeFileSync(stopFile, "settled\n");
  }

  const [sequenceJson, motionJson] = await Promise.all([sequenceFinished, motionFinished]);
  if (settleFailure) throw settleFailure;

  const frames = JSON.parse(sequenceJson.trim().split(/\r?\n/).filter(Boolean).at(-1));
  const motionSamples = JSON.parse(motionJson.trim().split(/\r?\n/).filter(Boolean).at(-1));
  fs.writeFileSync(path.join(directory, "frames.json"), `${JSON.stringify({
    name, startPresentation, endPresentation,
    start: start.snapshot, settled: settled.snapshot, frames, motionSamples,
  }, null, 2)}\n`);
  if (acknowledgeEnd) acknowledge(endPhase);
  return {
    name, startPresentation, endPresentation,
    start: start.snapshot, settled: settled.snapshot, frames, motionSamples,
  };
}

invariant(process.platform === "win32", "this harness must run on Windows");
invariant(fs.existsSync(executable), `packaged executable is missing: ${executable}`);
fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

const stdout = fs.openSync(path.join(outputDirectory, "narro.stdout.log"), "w");
const stderr = fs.openSync(path.join(outputDirectory, "narro.stderr.log"), "w");
const app = spawn(executable, [], {
  cwd: path.dirname(executable),
  env: { ...process.env, NARRO_FOCUS_CAPTURE_DIR: outputDirectory },
  windowsHide: false, detached: false, stdio: ["ignore", stdout, stderr],
});

try {
  const panel = await captureSettled("focus-panel-runtime", "panel", "panel", 340, 700);
  const panelToTimer = await captureTransition(
    "panel-to-timer-runtime", "panel-to-timer-start", "panel", "timer-compact", "timerCompact",
  );
  const compact = await captureSettled("floating-timer-runtime", "timer-compact", "timerCompact", 340, 110);
  const expanded = await captureSettled("floating-timer-expanded-runtime", "timer-expanded", "timerExpanded", 340, 300);
  const timerToPanel = await captureTransition(
    "timer-to-panel-runtime", "timer-to-panel-start", "timerCompact", "panel-returned", "panel", true,
  );
  await waitCheckpoint("complete");

  const manifest = {
    executable,
    captureTransport: "win32-screen-plus-environment-gated-renderer-checkpoints",
    captures: {
      panel: panel.name, compact: compact.name, expanded: expanded.name,
      panelToTimer: panelToTimer.name, timerToPanel: timerToPanel.name,
    },
  };
  fs.writeFileSync(path.join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Packaged Focus runtime visual captures written to ${outputDirectory}`);
} finally {
  fs.closeSync(stdout);
  fs.closeSync(stderr);
  if (!app.killed) spawnSync("taskkill.exe", ["/PID", String(app.pid), "/T", "/F"], { stdio: "ignore" });
}
