import fs from "node:fs/promises";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { isRetryableDevToolsPortReadError } from "./edgeCdpDevToolsPortErrors.mjs";
import { waitForOwnedBlankPage } from "./edgeCdpPageReadiness.mjs";

// These sequential DOM/focus regressions require live frame progression and
// their actual completion marker, not the CLI virtual-time screenshot deadline.
// Keep this separate from B49's calibrated 492x628/420x720 capture contract.
const options = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const split = arg.indexOf("=");
  if (!arg.startsWith("--") || split < 3) throw new Error(`Invalid option ${arg}`);
  return [arg.slice(2, split), arg.slice(split + 1)];
}));
for (const key of ["edge", "url", "profile", "png", "html", "kind"]) {
  if (!options[key]) throw new Error(`Missing --${key}`);
}
if (!["preferences", "print", "m7-integration"].includes(options.kind)) throw new Error("Unknown ready-fixture kind");
const fixtureUrl = new URL(options.url);
if (fixtureUrl.hostname !== "127.0.0.1" || fixtureUrl.protocol !== "http:") throw new Error("Fixture must be local HTTP");
const integration = options.kind === "m7-integration";
const integrationMotion = fixtureUrl.searchParams.get("motion")?.toLowerCase();
if (integration && (fixtureUrl.searchParams.get("scenario") !== "m7-integration"
  || !["true", "false"].includes(integrationMotion))) throw new Error("M7 capture requires exact scenario and motion identity");
// M7 runs the full sequential interaction corpus (~20s on the local Edge
// preflight), including controlled native waits. Keep a hard outer bound,
// while completion is still exclusively the fixture's actual semantic result.
const deadline = Date.now() + (integration ? 60_000 : 25_000);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const viewport = { width: 1280, height: integration ? 1080 : 720 };
const clip = { x: 0, y: 0, ...viewport, scale: 1 };
const events = [];
let stderr = "", socket, serial = 0, observed = null, failure = null;
const pending = new Map();
const browser = spawn(options.edge, [
  "--headless=new", "--disable-gpu", "--disable-background-networking",
  "--hide-scrollbars", "--no-first-run", "--force-device-scale-factor=1",
  `--window-size=${viewport.width},${viewport.height}`, `--user-data-dir=${options.profile}`,
  "--remote-debugging-port=0", "about:blank",
], { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
browser.stderr.on("data", (data) => { stderr = (stderr + data).slice(-16_000); });
browser.on("error", (error) => { failure = String(error); });

function command(method, params = {}) {
  const id = ++serial;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`Ready-fixture CDP timeout: ${method}`)); }, 8000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression, awaitPromise = false) {
  const result = await command("Runtime.evaluate", { expression, awaitPromise, returnByValue: true });
  if (result.exceptionDetails) throw new Error(`Fixture evaluation: ${JSON.stringify(result.exceptionDetails)}`);
  return result.result?.value;
}
async function connect() {
  let port;
  while (Date.now() < deadline && !port) {
    if (browser.exitCode !== null || failure) throw new Error(failure ?? `Edge exited ${browser.exitCode}`);
    try { port = Number((await fs.readFile(path.join(options.profile, "DevToolsActivePort"), "utf8")).split(/\r?\n/)[0]); }
    catch (error) { if (!isRetryableDevToolsPortReadError(error)) throw error; }
    if (!port) await sleep(50);
  }
  if (!port) throw new Error("Ready-fixture Edge never published DevToolsActivePort");
  const pageUrl = await waitForOwnedBlankPage({
    listPages: async () => {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(3000) });
      if (!response.ok) throw new Error(`Debugger page HTTP ${response.status}`);
      return response.json();
    },
    isAlive: () => browser.exitCode === null && !failure,
    now: Date.now, sleep, deadline,
  });
  socket = new WebSocket(pageUrl);
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id) {
      if (["Runtime.exceptionThrown", "Network.loadingFailed"].includes(message.method)) events.push(message);
      return;
    }
    const item = pending.get(message.id);
    if (!item) return;
    pending.delete(message.id); clearTimeout(item.timeout);
    if (message.error) item.reject(new Error(JSON.stringify(message.error)));
    else item.resolve(message.result);
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Ready-fixture WebSocket connect timeout")), 5000);
    socket.addEventListener("open", () => { clearTimeout(timeout); resolve(); }, { once: true });
    socket.addEventListener("error", () => { clearTimeout(timeout); reject(new Error("Ready-fixture WebSocket failed")); }, { once: true });
  });
}
async function state() {
  return evaluate(`({dataset:{...document.documentElement.dataset},rootChildren:document.getElementById('root')?.childElementCount,
    readyState:document.readyState,url:location.href,viewport:[innerWidth,innerHeight],focus:document.activeElement?.outerHTML.slice(0,300),
    contract:document.getElementById('focus-editor-contract') ? JSON.parse(document.getElementById('focus-editor-contract').textContent) : null})`);
}
function complete(value) {
  if (value?.url !== options.url) return false;
  const d = value?.dataset ?? {};
  const error = d.themeSettingsKeyboardError ?? d.reportsFixtureError;
  if (error) throw new Error(`Ready-fixture assertion: ${error}`);
  if (events.length) throw new Error("Ready-fixture renderer/network failure (see diagnostics)");
  if (integration) {
    if (value.contract?.error) throw new Error(`M7 integration assertion: ${value.contract.error}`);
    if (d.focusEditorFixtureReady !== "true") return false;
    const contract = value.contract;
    if (contract?.scenario !== "m7-integration" || contract.theme !== fixtureUrl.searchParams.get("theme")
      || contract.reducedMotion !== (integrationMotion === "true")) throw new Error("M7 completion identity mismatch");
    for (const key of ["subtaskRepeatFocusAfterNativeRefresh", "subtaskFailureDraftAndFocus", "subtaskExplicitFocusOwnership",
      "subtaskStaleRefreshFailClosed", "subtaskDisposedFocusSafe"]) {
      if (contract[key] !== true) throw new Error(`M7 completed fixture lacks ${key}`);
    }
    return true;
  }
  return options.kind === "preferences"
    ? d.themeSettingsFixtureReady === "true" && d.themeSettingsKeyboardPass === "true" && d.themeSettingsDialogContainmentPass === "true"
    : d.reportsFixtureReady === "true" && d.reportsPrintLayoutPass === "true";
}
try {
  await connect();
  await command("Page.enable"); await command("Runtime.enable"); await command("Network.enable");
  await command("Emulation.setDeviceMetricsOverride", { ...viewport, deviceScaleFactor: 1, mobile: false });
  if (options.kind === "print") await command("Emulation.setEmulatedMedia", { media: "print" });
  if (integration) await command("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: integrationMotion === "true" ? "reduce" : "no-preference" }],
  });
  await command("Page.bringToFront");
  const navigation = await command("Page.navigate", { url: options.url });
  if (navigation.errorText) throw new Error(`Fixture navigation: ${navigation.errorText}`);
  while (Date.now() < deadline) {
    observed = await state();
    if (complete(observed)) break;
    await sleep(50);
  }
  if (!complete(observed)) throw new Error("Ready-fixture deadline before actual completion");
  await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))", true);
  observed = await state();
  if (!complete(observed) || observed.viewport[0] !== viewport.width || observed.viewport[1] !== viewport.height) {
    throw new Error("Ready-fixture state or viewport changed before capture");
  }
} catch (error) {
  failure = String(error);
} finally {
  // Retain first-failure state before removing the browser/profile. A closed
  // modal in a small PNG must never hide an assertion/phase or become a PASS.
  if (socket?.readyState === WebSocket.OPEN) {
    try {
      await fs.writeFile(options.html, await evaluate("document.documentElement.outerHTML"), "utf8");
      const shot = await command("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false, clip });
      const png = Buffer.from(shot.data, "base64");
      await fs.writeFile(options.png, png);
      if (png.length < 1000 || png.subarray(1, 4).toString() !== "PNG"
        || png.readUInt32BE(16) !== viewport.width || png.readUInt32BE(20) !== viewport.height) {
        throw new Error("Ready-fixture screenshot has invalid pixels/viewport");
      }
    } catch (error) { failure ??= `Could not retain fixture DOM/PNG: ${error}`; }
  }
  try {
    await fs.writeFile(options.html + ".diagnostics.json", JSON.stringify({ failure, observed, events, stderr, kind: options.kind, url: options.url }, null, 2));
  } catch (error) {
    failure ??= `Could not write fixture diagnostics: ${error}`;
  } finally {
    for (const item of pending.values()) clearTimeout(item.timeout);
    pending.clear(); socket?.close();
    if (browser.pid && browser.exitCode === null) spawnSync("taskkill.exe", ["/PID", String(browser.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
  }
}
if (failure) throw new Error(failure);
console.log(`Ready-fixture ${options.kind} actual completion + DOM/PNG: PASS`);
