import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const executable = path.resolve(root, process.argv[2] ?? "src-tauri/target/release/narro.exe");
const outputDirectory = path.resolve(root, process.argv[3] ?? "artifacts/focus-runtime-visual");
const debugPort = Number.parseInt(process.env.NARRO_FOCUS_CDP_PORT ?? "9223", 10);
const focusTitle = "Narro - Focus";

function invariant(condition, message) {
  if (!condition) throw new Error(`Packaged Focus runtime capture failed: ${message}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitUntil(label, callback, timeoutMs = 15000, intervalMs = 100) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const value = await callback();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await sleep(intervalMs);
  }
  throw new Error(`${label} did not become ready within ${timeoutMs}ms${lastError ? `: ${lastError}` : ""}`);
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`);
  return response.json();
}

class CdpSession {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", () => reject(new Error(`Could not open CDP websocket ${url}`)), { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      void this.#handleMessage(event.data);
    });
    this.socket.addEventListener("close", () => {
      for (const { reject } of this.pending.values()) reject(new Error("CDP websocket closed"));
      this.pending.clear();
    });
  }

  async #handleMessage(data) {
    let text;
    if (typeof data === "string") text = data;
    else if (data instanceof Blob) text = await data.text();
    else text = Buffer.from(data).toString("utf8");
    const message = JSON.parse(text);
    if (!message.id) return;
    const pending = this.pending.get(message.id);
    if (!pending) return;
    this.pending.delete(message.id);
    if (message.error) pending.reject(new Error(`${message.error.message} (${message.error.code})`));
    else pending.resolve(message.result ?? {});
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (response.exceptionDetails) {
      const description = response.exceptionDetails.exception?.description
        ?? response.exceptionDetails.text
        ?? "unknown Runtime.evaluate failure";
      throw new Error(description);
    }
    return response.result?.value;
  }

  async screenshot(filePath, width, height) {
    const response = await this.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    });
    invariant(typeof response.data === "string" && response.data.length > 0, `CDP returned no PNG data for ${path.basename(filePath)}`);
    fs.writeFileSync(filePath, Buffer.from(response.data, "base64"));
  }

  close() {
    this.socket.close();
  }
}

function readNativeMetadata() {
  const script = path.join(root, "scripts", "read-focus-window-metadata.ps1");
  const stdout = execFileSync("powershell.exe", [
    "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass",
    "-File", script,
    "-Title", focusTitle,
  ], { cwd: root, encoding: "utf8" });
  const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
  return JSON.parse(lines.at(-1));
}

const snapshotExpression = `(() => {
  const metrics = (element) => {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      visibility: style.visibility,
      display: style.display,
      opacity: style.opacity,
    };
  };
  const coordinator = document.querySelector('.focus-surface-coordinator');
  const active = document.querySelector('.focus-surface-coordinator__presentation[data-focus-visibility="active"]');
  const preparing = [...document.querySelectorAll('.focus-surface-coordinator__presentation[data-focus-visibility="preparing"]')];
  const unintendedScrollers = [...document.querySelectorAll('html, body, #root, .focus-surface-coordinator')]
    .filter((element) => element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight)
    .map((element) => ({ tag: element.tagName, id: element.id, className: element.className, metrics: metrics(element) }));
  return {
    now: performance.now(),
    href: location.href,
    title: document.title,
    viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
    documentElement: metrics(document.documentElement),
    body: metrics(document.body),
    root: metrics(document.getElementById('root')),
    coordinator: metrics(coordinator),
    active: metrics(active),
    activePresentation: active?.getAttribute('data-focus-presentation') ?? null,
    preparingPresentations: preparing.map((element) => element.getAttribute('data-focus-presentation')),
    presentation: coordinator?.getAttribute('data-focus-presentation') ?? null,
    hydrated: coordinator?.getAttribute('data-focus-presentation-hydrated') ?? null,
    transitionPending: coordinator?.getAttribute('data-focus-transition-pending') ?? null,
    geometryMotion: {
      from: coordinator?.getAttribute('data-focus-geometry-motion-from') ?? null,
      to: coordinator?.getAttribute('data-focus-geometry-motion-to') ?? null,
      phase: coordinator?.getAttribute('data-focus-geometry-motion-phase') ?? null,
    },
    floatingExpanded: document.querySelector('.floating-timer-foundation')?.getAttribute('data-floating-expanded') ?? null,
    floatingRegionExpanded: document.querySelector('.floating-timer-foundation')?.getAttribute('data-floating-region-expanded') ?? null,
    visibleTextLength: (document.body?.innerText ?? '').trim().length,
    unintendedScrollers,
  };
})()`;

async function waitForPresentation(session, presentation) {
  return waitUntil(`Focus presentation ${presentation}`, async () => {
    const snapshot = await session.evaluate(snapshotExpression);
    return snapshot?.hydrated === "true" && snapshot.presentation === presentation && snapshot.activePresentation === (presentation === "panel" ? "panel" : "timer") ? snapshot : null;
  });
}

async function invoke(session, command, args = {}) {
  const expression = `(async () => {
    if (!window.__TAURI_INTERNALS__?.invoke) throw new Error('Tauri internals invoke bridge is unavailable');
    return await window.__TAURI_INTERNALS__.invoke(${JSON.stringify(command)}, ${JSON.stringify(args)});
  })()`;
  return session.evaluate(expression);
}

async function captureSettled(session, name, presentation, width, height) {
  const dom = await waitForPresentation(session, presentation);
  const png = path.join(outputDirectory, `${name}.png`);
  await session.screenshot(png, width, height);
  const native = readNativeMetadata();
  const metadata = { name, presentation, dom, native };
  fs.writeFileSync(path.join(outputDirectory, `${name}.json`), `${JSON.stringify(metadata, null, 2)}\n`);
  return metadata;
}

async function captureTransition(session, name, triggerExpression, expectedPresentation) {
  const directory = path.join(outputDirectory, name);
  fs.rmSync(directory, { recursive: true, force: true });
  fs.mkdirSync(directory, { recursive: true });
  await session.evaluate(triggerExpression);
  const frames = [];
  const started = Date.now();
  for (let index = 0; index < 20; index += 1) {
    const dom = await session.evaluate(snapshotExpression);
    const fileName = `frame-${String(index).padStart(3, "0")}.png`;
    await session.screenshot(path.join(directory, fileName), 340, 700);
    frames.push({ index, elapsedMs: Date.now() - started, fileName, dom });
    await sleep(20);
  }
  const settled = await waitForPresentation(session, expectedPresentation);
  fs.writeFileSync(path.join(directory, "frames.json"), `${JSON.stringify({ name, expectedPresentation, settled, frames }, null, 2)}\n`);
  return { name, expectedPresentation, settled, frames };
}

invariant(process.platform === "win32", "this harness must run on Windows");
invariant(Number.isInteger(debugPort) && debugPort >= 1024 && debugPort <= 65535, "NARRO_FOCUS_CDP_PORT is invalid");
invariant(fs.existsSync(executable), `packaged executable is missing: ${executable}`);
fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

const stdoutPath = path.join(outputDirectory, "narro.stdout.log");
const stderrPath = path.join(outputDirectory, "narro.stderr.log");
const stdout = fs.openSync(stdoutPath, "w");
const stderr = fs.openSync(stderrPath, "w");
const additionalArguments = [
  process.env.WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS,
  `--remote-debugging-port=${debugPort}`,
  "--remote-allow-origins=*",
].filter(Boolean).join(" ");

const app = spawn(executable, [], {
  cwd: path.dirname(executable),
  env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: additionalArguments },
  windowsHide: false,
  detached: false,
  stdio: ["ignore", stdout, stderr],
});

let mainSession;
let focusSession;
try {
  const targets = await waitUntil("WebView2 DevTools targets", async () => {
    const list = await fetchJson(`http://127.0.0.1:${debugPort}/json/list`);
    const main = list.find((target) => target.type === "page" && /(?:\/|^)index\.html(?:[?#]|$)/.test(target.url));
    const focus = list.find((target) => target.type === "page" && /(?:\/|^)focus\.html(?:[?#]|$)/.test(target.url));
    return main?.webSocketDebuggerUrl && focus?.webSocketDebuggerUrl ? { main, focus } : null;
  }, 20000, 150);

  mainSession = new CdpSession(targets.main.webSocketDebuggerUrl);
  focusSession = new CdpSession(targets.focus.webSocketDebuggerUrl);
  await Promise.all([mainSession.ready, focusSession.ready]);
  await Promise.all([
    mainSession.send("Runtime.enable"),
    focusSession.send("Runtime.enable"),
    focusSession.send("Page.enable"),
    focusSession.send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } }),
  ]);

  await waitUntil("main document", () => mainSession.evaluate("document.readyState === 'complete'"));
  await waitUntil("focus document", () => focusSession.evaluate("document.readyState === 'complete'"));
  await invoke(mainSession, "present_focus_for_blitz");
  await waitForPresentation(focusSession, "panel");

  const panel = await captureSettled(focusSession, "focus-panel-runtime", "panel", 340, 700);

  const panelToTimer = await captureTransition(
    focusSession,
    "panel-to-timer-runtime",
    `(() => { const button = document.querySelector('[data-focus-compact-control="true"]'); if (!button) throw new Error('Compact view button missing'); button.click(); return true; })()`,
    "timerCompact",
  );
  const compact = await captureSettled(focusSession, "floating-timer-runtime", "timerCompact", 340, 110);

  await invoke(focusSession, "focus_surface_apply_presentation", { presentation: "timerExpanded" });
  const expanded = await captureSettled(focusSession, "floating-timer-expanded-runtime", "timerExpanded", 340, 300);

  await invoke(focusSession, "focus_surface_apply_presentation", { presentation: "timerCompact" });
  await waitForPresentation(focusSession, "timerCompact");
  const timerToPanel = await captureTransition(
    focusSession,
    "timer-to-panel-runtime",
    `(() => { const button = document.querySelector('[aria-label="Return to Focus Panel"]'); if (!button) throw new Error('Return to Focus Panel button missing'); button.click(); return true; })()`,
    "panel",
  );

  const browserVersion = await focusSession.send("Browser.getVersion");
  const manifest = {
    executable,
    debugPort,
    browserVersion,
    targets: { main: targets.main.url, focus: targets.focus.url },
    captures: {
      panel: panel.name,
      compact: compact.name,
      expanded: expanded.name,
      panelToTimer: panelToTimer.name,
      timerToPanel: timerToPanel.name,
    },
  };
  fs.writeFileSync(path.join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Packaged Focus runtime visual captures written to ${outputDirectory}`);
} finally {
  mainSession?.close();
  focusSession?.close();
  fs.closeSync(stdout);
  fs.closeSync(stderr);
  if (!app.killed) {
    spawnSync("taskkill.exe", ["/PID", String(app.pid), "/T", "/F"], { stdio: "ignore" });
  }
}
