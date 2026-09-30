import fs from "node:fs";

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus runtime visual harness contract failed: ${message}`);
}

const capture = fs.readFileSync("scripts/capture-focus-runtime.mjs", "utf8");
const nativeProbe = fs.readFileSync("scripts/read-focus-window-metadata.ps1", "utf8");
const nativeCapture = fs.readFileSync("scripts/capture-focus-window.ps1", "utf8");
const nativeSequence = fs.readFileSync("scripts/capture-focus-window-sequence.ps1", "utf8");
const nativeMotionSampler = fs.readFileSync("scripts/sample-focus-window-motion.ps1", "utf8");
const driver = fs.readFileSync("src/focusRuntimeVisualDriver.ts", "utf8");
const rust = fs.readFileSync("src-tauri/src/lib.rs", "utf8");
const validator = fs.readFileSync("scripts/validate-focus-runtime-captures.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/ci.yml", "utf8");
const ciConfig = JSON.parse(fs.readFileSync("src-tauri/tauri.ci.conf.json", "utf8"));
const packageJson = fs.readFileSync("package.json", "utf8");

for (const required of [
  "NARRO_FOCUS_CAPTURE_DIR",
  "capture-focus-window.ps1",
  "panel-to-timer-runtime",
  "timer-to-panel-runtime",
  "read-focus-window-metadata.ps1",
]) invariant(capture.includes(required), `capture harness is missing ${required}`);

for (const required of ["GetWindowRect", "GetWindowRgnBox", "GetDpiForWindow", "Narro - Focus"]) {
  invariant(nativeProbe.includes(required), `native metadata probe is missing ${required}`);
}
for (const required of ["CopyFromScreen", "GetWindowRgnBox", "Narro - Focus"]) {
  invariant(nativeCapture.includes(required), `native screenshot capture is missing ${required}`);
}
for (const required of ["CopyFromScreen", "FrameCount", "IntervalMs", "GetWindowRect", "ReadyFile"]) {
  invariant(nativeSequence.includes(required), `native transition sequence capture is missing ${required}`);
}
for (const required of ["SampleCount", "IntervalMs", "GetWindowRect", "ReadyFile", "elapsedMs"]) {
  invariant(nativeMotionSampler.includes(required), `native motion sampler is missing ${required}`);
}
invariant(capture.includes("capture-focus-window-sequence.ps1"), "transition capture must use the single-process Win32 sequence probe");
invariant(capture.includes("sample-focus-window-motion.ps1"), "transition capture must run a high-frequency Win32 geometry sampler");
invariant(capture.includes("ack-") && capture.includes("sequence-ready.txt"), "capture harness must handshake with renderer checkpoints before state changes");
for (const required of [
  "main_window_hide",
  "present_focus_for_blitz",
  "focus_runtime_capture_checkpoint",
  "focus_runtime_capture_acknowledged",
  "focus_runtime_capture_seed_timer_placement",
  "waitForCaptureAck",
  "data-focus-compact-control",
  "Return to Focus Panel",
  "timerExpanded",
]) invariant(driver.includes(required), `renderer capture driver is missing ${required}`);

invariant(
  rust.includes("NARRO_FOCUS_CAPTURE_DIR")
    && rust.includes("focus_runtime_capture_checkpoint")
    && rust.includes("focus_runtime_capture_acknowledged")
    && rust.includes("focus_runtime_capture_seed_timer_placement")
    && rust.includes("safe_position_for_timer_region")
    && rust.includes("save_if_timer_visible")
    && rust.includes("FOCUS_RUNTIME_CAPTURE_DISABLED"),
  "Rust capture checkpoint must be environment-gated",
);

for (const required of [
  'validateSettled("focus-panel-runtime", "panel", 700)',
  'validateSettled("floating-timer-runtime", "timerCompact", 110)',
  'validateSettled("floating-timer-expanded-runtime", "timerExpanded", 300)',
  'unintendedScrollers?.length === 0',
  "native.client.width",
  'presentation === "panel"',
  "native.region.height",
  "captured no native HWND movement",
  "fewer than two intermediate native HWND positions",
  "native HWND motion duration",
]) invariant(validator.includes(required), `runtime validator is missing ${required}`);

const ciWindows = ciConfig.app?.windows ?? [];
invariant(ciWindows.length === 2, "CI config must preserve both production window definitions when overriding the windows array");
const mainWindow = ciWindows.find((window) => window.label === "main");
const focusWindow = ciWindows.find((window) => window.label === "focusSurface");
invariant(mainWindow?.url === "index.html", "CI config must preserve the production Main document URL");
invariant(
  focusWindow?.url === "focus.html?runtimeVisual=1",
  "CI-only Focus URL must activate the native packaged visual driver",
);
invariant(
  ciWindows.every((window) => window.additionalBrowserArgs === undefined),
  "packaged runtime capture must not depend on WebView2 DevTools arguments",
);

invariant(packageJson.includes('"test:focus-runtime-visual-harness"'), "frontend preflight contract test is not registered");
invariant(packageJson.includes('"test:focus-runtime-visual:windows"'), "packaged runtime visual command is not registered");
const buildIndex = workflow.indexOf("- name: Build Tauri Release");
const captureIndex = workflow.indexOf("- name: Capture Packaged Focus Runtime");
const uploadIndex = workflow.indexOf("name: narro-m7-focus-runtime-visual");
invariant(buildIndex >= 0 && captureIndex > buildIndex, "packaged runtime capture must run after the Tauri release build");
invariant(uploadIndex > captureIndex, "packaged runtime visual artifact must be uploaded after capture");
console.log("Focus packaged-runtime visual harness contracts passed.");
