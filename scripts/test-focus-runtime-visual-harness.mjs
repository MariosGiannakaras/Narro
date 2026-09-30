import fs from "node:fs";

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus runtime visual harness contract failed: ${message}`);
}

const capture = fs.readFileSync("scripts/capture-focus-runtime.mjs", "utf8");
const nativeProbe = fs.readFileSync("scripts/read-focus-window-metadata.ps1", "utf8");
const validator = fs.readFileSync("scripts/validate-focus-runtime-captures.mjs", "utf8");
const workflow = fs.readFileSync(".github/workflows/ci.yml", "utf8");
const ciConfig = JSON.parse(fs.readFileSync("src-tauri/tauri.ci.conf.json", "utf8"));
const packageJson = fs.readFileSync("package.json", "utf8");

for (const required of [
  "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
  "Page.captureScreenshot",
  "window.__TAURI_INTERNALS__.invoke",
  "present_focus_for_blitz",
  "focus_surface_apply_presentation",
  "data-focus-compact-control",
  "Return to Focus Panel",
  "panel-to-timer-runtime",
  "timer-to-panel-runtime",
  "read-focus-window-metadata.ps1",
]) {
  invariant(capture.includes(required), `capture harness is missing ${required}`);
}

for (const required of ["GetWindowRect", "GetWindowRgnBox", "GetDpiForWindow", "Narro - Focus"]) {
  invariant(nativeProbe.includes(required), `native metadata probe is missing ${required}`);
}

for (const required of [
  'validateSettled("focus-panel-runtime", "panel", 700)',
  'validateSettled("floating-timer-runtime", "timerCompact", 110)',
  'validateSettled("floating-timer-expanded-runtime", "timerExpanded", 300)',
  'unintendedScrollers?.length === 0',
  "native.region.height",
]) {
  invariant(validator.includes(required), `runtime validator is missing ${required}`);
}

const ciWindows = ciConfig.app?.windows ?? [];
invariant(ciWindows.length === 2, "CI config must preserve both production window definitions when overriding the windows array");
for (const window of ciWindows) {
  invariant(
    typeof window.additionalBrowserArgs === "string"
      && window.additionalBrowserArgs.includes("--remote-debugging-port=9223")
      && window.additionalBrowserArgs.includes("--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection"),
    `CI-only WebView ${window.label ?? "unknown"} must expose CDP while preserving Wry default disabled features`,
  );
}
invariant(packageJson.includes('"test:focus-runtime-visual-harness"'), "frontend preflight contract test is not registered");
invariant(packageJson.includes('"test:focus-runtime-visual:windows"'), "packaged runtime visual command is not registered");
const buildIndex = workflow.indexOf("- name: Build Tauri Release");
const captureIndex = workflow.indexOf("- name: Capture Packaged Focus Runtime");
const uploadIndex = workflow.indexOf("name: narro-m7-focus-runtime-visual");
invariant(buildIndex >= 0 && captureIndex > buildIndex, "packaged runtime capture must run after the Tauri release build");
invariant(uploadIndex > captureIndex, "packaged runtime visual artifact must be uploaded after capture");
console.log("Focus packaged-runtime visual harness contracts passed.");
