import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

// B49 only: Chromium --screenshot and --dump-dom run on independent capture
// timelines. Attach to ONE Edge page and capture its pixels after the fixture's
// keyboard-focus DOM/opacity contract is true. No application CSS is changed.
const options = Object.fromEntries(process.argv.slice(2).map((entry) => {
  const i = entry.indexOf("=");
  if (!entry.startsWith("--") || i < 3) throw new Error(`Invalid option: ${entry}`);
  return [entry.slice(2, i), entry.slice(i + 1)];
}));
for (const name of ["edge", "url", "profile", "png", "html"]) {
  if (!options[name]) throw new Error(`Missing --${name}`);
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const deadline = Date.now() + 25_000;
const browser = spawn(options.edge, [
  "--headless=new", "--disable-gpu", "--disable-background-networking",
  "--hide-scrollbars", "--no-first-run", "--force-device-scale-factor=1",
  "--window-size=420,720", `--user-data-dir=${options.profile}`,
  "--remote-debugging-port=0",
  options.reducedMotion === "true" ? "--force-prefers-reduced-motion" : "--force-prefers-no-reduced-motion",
  // The fixture must not execute until CDP has established its final viewport.
  // Loading the URL first and resizing afterward races queued-row bounds checks.
  "about:blank",
], { windowsHide: true, stdio: "ignore" });
let socket;
const pending = new Map();
let serial = 0;

async function command(method, params = {}) {
  const id = ++serial;
  return await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Edge CDP timed out: ${method}`));
    }, 12_000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
function evaluate(expression, awaitPromise = false) {
  return command("Runtime.evaluate", { expression, returnByValue: true, awaitPromise });
}
async function waitForDebugger() {
  while (Date.now() < deadline) {
    if (browser.exitCode !== null) throw new Error(`Edge exited before debugger startup: ${browser.exitCode}`);
    try {
      const contents = await fs.readFile(path.join(options.profile, "DevToolsActivePort"), "utf8");
      const port = Number(contents.split(/\r?\n/)[0]);
      if (port > 0) return port;
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "EACCES") throw error;
    }
    await sleep(100);
  }
  throw new Error("Edge did not publish its DevTools port");
}
async function findPage(port) {
  while (Date.now() < deadline) {
    const pages = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(1500) })
      .then((response) => response.json()).catch(() => []);
    const page = pages.find((entry) => entry.type === "page" && entry.url === "about:blank");
    if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    await sleep(100);
  }
  throw new Error("No blank Edge CDP page was available before fixture navigation");
}
async function waitForFocusedFixture() {
  let observed = null;
  while (Date.now() < deadline) {
    const response = await evaluate(`(() => {
      const root = document.documentElement;
      const action = document.querySelector('[data-focus-action="pause-resume"]');
      const rail = document.querySelector(".focus-panel__live-actions");
      const heading = document.querySelector(".focus-panel__live-heading");
      const contract = document.querySelector("#focus-panel-visual-contract");
      const state = {
        ready: root.dataset.focusPanelFixtureReady === "true",
        pass: root.dataset.focusActionRevealPass === "true",
        focusOwner: Boolean(action && document.activeElement === action),
        activeTag: document.activeElement?.tagName ?? null,
        actionAvailable: Boolean(action && !action.disabled),
        keyboardMarker: document.querySelector('[data-focus-live-card="true"]')?.getAttribute("data-focus-actions-keyboard") ?? null,
        railOpacity: rail ? getComputedStyle(rail).opacity : null,
        railPointer: rail ? getComputedStyle(rail).pointerEvents : null,
        headingOpacity: heading ? getComputedStyle(heading).opacity : null,
        contractError: contract?.textContent?.slice(0, 700) ?? null,
        path: location.pathname,
      };
      return state;
    })()`);
    if (response.exceptionDetails) {
      throw new Error("B49 Focus fixture CDP evaluation exception: " + JSON.stringify(response.exceptionDetails));
    }
    observed = response.result?.value ?? null;
    if (observed?.ready && observed?.pass && observed?.focusOwner
      && observed?.railOpacity === "1" && observed?.headingOpacity === "0") return;
    await sleep(100);
  }
  throw new Error("B49 Focus actual visual state never became ready: " + JSON.stringify(observed));
}

async function preserveFocusedFailureEvidence() {
  // A failed readiness gate must be diagnosable from the retained Windows ZIP:
  // keep actual DOM and screenshot, NEVER mark them as passing evidence.
  try {
    const dom = (await evaluate("document.documentElement.outerHTML")).result?.value;
    if (typeof dom === "string") await fs.writeFile(options.html, dom, "utf8");
    const shot = await command("Page.captureScreenshot", {
      format: "png", fromSurface: true, captureBeyondViewport: false,
      clip: { x: 0, y: 0, width: 420, height: 720, scale: 1 },
    });
    if (typeof shot.data === "string") {
      await fs.writeFile(options.png, Buffer.from(shot.data, "base64"));
    }
  } catch (error) {
    process.stderr.write("B49 could not retain diagnostic DOM/PNG: " + String(error) + "\n");
  }
}

try {
  const port = await waitForDebugger();
  const pageUrl = await findPage(port);
  socket = new WebSocket(pageUrl);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Edge CDP WebSocket connect timeout")), 8000);
    socket.addEventListener("open", () => { clearTimeout(timeout); resolve(); }, { once: true });
    socket.addEventListener("error", () => { clearTimeout(timeout); reject(new Error("Edge CDP WebSocket failed")); }, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const response = JSON.parse(String(event.data));
    const item = pending.get(response.id);
    if (!item) return;
    clearTimeout(item.timeout);
    pending.delete(response.id);
    if (response.error) item.reject(new Error(`CDP ${response.id}: ${response.error.message}`));
    else item.resolve(response.result);
  });
  await command("Page.enable");
  await command("Runtime.enable");
  await command("Emulation.setDeviceMetricsOverride", {
    width: 420, height: 720, deviceScaleFactor: 1, mobile: false,
  });
  // Navigation occurs only after the final 420x720 viewport is established.
  // This prevents late CDP reflow from invalidating the queued-title geometry
  // check and stealing focus before the final strict B49 action-rail capture.
  const navigation = await command("Page.navigate", { url: options.url });
  if (navigation.errorText) throw new Error(`B49 fixture navigation failed: ${navigation.errorText}`);
  try {
    await waitForFocusedFixture();
  } catch (error) {
    await preserveFocusedFailureEvidence();
    throw error;
  }
  // The DOM marker is not a pixel capture. Force two presented frames AFTER
  // the strict focus/opacity contract and capture from the same page session.
  await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))", true);
  try {
    await waitForFocusedFixture();
  } catch (error) {
    await preserveFocusedFailureEvidence();
    throw error;
  }
  const shot = await command("Page.captureScreenshot", {
    format: "png", fromSurface: true, captureBeyondViewport: false,
    clip: { x: 0, y: 0, width: 420, height: 720, scale: 1 },
  });
  const png = Buffer.from(shot.data ?? "", "base64");
  if (png.length < 10_000 || png.subarray(1, 4).toString() !== "PNG") {
    throw new Error("B49 CDP capture returned no actual PNG pixels");
  }
  const domResult = await evaluate("document.documentElement.outerHTML");
  const dom = domResult.result?.value;
  if (typeof dom !== "string"
    || !dom.includes('data-focus-action-reveal-pass="true"')
    || !dom.includes('data-focus-panel-fixture-ready="true"')) {
    throw new Error("B49 focused screenshot and DOM did not share a ready page state");
  }
  await fs.writeFile(options.png, png);
  await fs.writeFile(options.html, dom, "utf8");
  process.stdout.write("B49 focused Edge CDP pixel+DOM capture: PASS\n");
} finally {
  for (const p of pending.values()) { clearTimeout(p.timeout); p.reject(new Error("Edge capture closed")); }
  pending.clear();
  socket?.close();
  browser.kill();
}
