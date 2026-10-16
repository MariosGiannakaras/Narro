import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.join(root, "artifacts", "visual-regression");
fs.mkdirSync(outputDirectory, { recursive: true });

const baseUrl = process.argv[2] ?? "http://127.0.0.1:4173";
const edgeExecutable = process.argv[3];
if (process.platform !== "win32") {
  throw new Error("Finding33 large Notes Escape regression is Windows/Edge-only.");
}
if (!edgeExecutable || !fs.existsSync(edgeExecutable)) {
  throw new Error("Finding33 regression requires the resolved Microsoft Edge executable path.");
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitFor(predicate, description, timeoutMs = 20_000, intervalMs = 100) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const value = await predicate();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Timed out waiting for ${description}${lastError ? `: ${lastError}` : ""}`);
}

function killTree(processHandle) {
  if (!processHandle?.pid) return;
  spawnSync("taskkill.exe", ["/PID", String(processHandle.pid), "/T", "/F"], {
    stdio: "ignore",
    windowsHide: true,
  });
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
    this.socket = null;
    this.onEvent = null;
  }

  async connect() {
    await new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url);
      this.socket = socket;
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
      socket.addEventListener("message", (event) => {
        const message = JSON.parse(String(event.data));
        if (!message.id) {
          this.onEvent?.(message);
          return;
        }
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        clearTimeout(pending.timeout);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
      });
      socket.addEventListener("close", () => {
        for (const pending of this.pending.values()) {
          clearTimeout(pending.timeout);
          pending.reject(new Error("CDP socket closed before response."));
        }
        this.pending.clear();
      });
    });
  }

  send(method, params = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error("CDP socket is not open."));
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Finding33 CDP command timed out: ${method}`));
      }, 8_000);
      this.pending.set(id, { resolve, reject, timeout });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket?.close();
  }
}

async function evaluate(client, expression) {
  const response = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    throw new Error(
      response.exceptionDetails.exception?.description
      ?? response.exceptionDetails.text
      ?? "Runtime.evaluate failed.",
    );
  }
  return response.result?.value;
}

async function key(client, keyName, code, virtualKeyCode) {
  await client.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: keyName,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    nativeVirtualKeyCode: virtualKeyCode,
  });
  await client.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: keyName,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    nativeVirtualKeyCode: virtualKeyCode,
  });
}

const debugPort = await freePort();
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "narro-finding33-"));
const pageUrl = `${baseUrl}/task-notes-fixture.html?theme=dark&presentation=large`;
let edge;
let client;
let edgeStderr = "";
let phase = "before-navigation";
const requestUrls = new Map();
const browserEvents = [];
const record = (entry) => {
  browserEvents.push(entry);
  if (browserEvents.length > 60) browserEvents.shift();
};
function captureEvent(message) {
  const { method, params = {} } = message;
  if (method === "Network.requestWillBeSent") {
    requestUrls.set(params.requestId, params.request?.url ?? null);
  } else if (method === "Network.loadingFailed") {
    record({ method, url: requestUrls.get(params.requestId) ?? null,
      reason: params.errorText ?? null, canceled: params.canceled ?? false });
  } else if (method === "Network.responseReceived" && params.response?.status >= 400) {
    record({ method, url: params.response.url, status: params.response.status });
  } else if (method === "Runtime.exceptionThrown") {
    record({ method, message: params.exceptionDetails?.exception?.description
      ?? params.exceptionDetails?.text ?? null });
  } else if (method === "Log.entryAdded" && ["error", "warning"].includes(params.entry?.level)) {
    record({ method, level: params.entry.level, message: params.entry.text ?? null,
      url: params.entry.url ?? null });
  }
}

try {
  // HTML availability alone is not enough: a failed module/bootstrap can leave
  // <div id="root"></div> while navigation and readyState appear successful.
  const previewResponse = await fetch(pageUrl);
  if (!previewResponse.ok) {
    throw new Error(`Finding33 fixture URL is unavailable: HTTP ${previewResponse.status}`);
  }
  const previewHtml = await previewResponse.text();
  const modules = [...previewHtml.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"]+)"/g)];
  if (modules.length === 0) throw new Error("Finding33 preview HTML has no executable module entry.");
  for (const module of modules) {
    const assetUrl = new URL(module[1], pageUrl);
    const response = await fetch(assetUrl);
    if (!response.ok) throw new Error(`Finding33 entry module returned HTTP ${response.status}: ${assetUrl.pathname}`);
  }

  edge = spawn(edgeExecutable, [
    "--headless=new",
    "--disable-gpu",
    "--disable-background-networking",
    "--no-first-run",
    "--force-device-scale-factor=1",
    "--force-prefers-no-reduced-motion",
    "--window-size=1280,720",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ], {
    cwd: root,
    stdio: ["ignore", "ignore", "pipe"],
    windowsHide: true,
  });
  // Drain stderr: an unconsumed child pipe can deadlock headless Edge.
  edge.stderr?.on("data", (chunk) => {
    edgeStderr = (edgeStderr + String(chunk)).slice(-8_000);
  });

  // Attach event listeners BEFORE navigating. Attaching to the already loaded
  // fixture loses its initial JS/network errors, hiding the exact bootstrap cause.
  const target = await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
    if (!response.ok) return null;
    const targets = await response.json();
    return targets.find((candidate) =>
      candidate.type === "page"
      && candidate.url === "about:blank"
      && candidate.webSocketDebuggerUrl
    ) ?? null;
  }, "Finding33 blank Edge CDP page target");

  client = new CdpClient(target.webSocketDebuggerUrl);
  client.onEvent = captureEvent;
  await client.connect();
  await client.send("Runtime.enable");
  await client.send("Page.enable");
  await client.send("Network.enable");
  await client.send("Log.enable");
  await client.send("Page.bringToFront");
  phase = "navigating";
  const navigation = await client.send("Page.navigate", { url: pageUrl });
  phase = "navigated";
  if (navigation.errorText) throw new Error(`Finding33 Edge navigation failed: ${navigation.errorText}`);

  await waitFor(
    () => evaluate(client, 'document.documentElement.dataset.taskNotesFixtureReady === "true"'),
    "Finding33 large Notes fixture readiness",
  );

  phase = "fixture-ready";
  const initial = await evaluate(client, `(() => {
    const shell = document.querySelector('[data-task-notes-visual="editable"] [data-task-note-presentation="large"]');
    const editor = shell?.querySelector('[data-task-note-control="editor"]');
    if (!(shell instanceof HTMLElement)) throw new Error("Finding33 large Notes shell is missing.");
    if (!(editor instanceof HTMLElement)) throw new Error("Finding33 contenteditable editor is missing.");
    const trace = [];
    window.__NARRO_FINDING33_KEY_TRACE__ = trace;
    shell.addEventListener("keydown", (event) => {
      trace.push({
        key: event.key,
        code: event.code,
        targetIsEditor: event.target === editor,
        shellContainsTarget: event.target instanceof Node && shell.contains(event.target),
        defaultPreventedAtCapture: event.defaultPrevented,
        presentationAtCapture: shell.dataset.taskNotePresentation ?? null,
      });
    }, true);
    editor.focus({ preventScroll: true });
    return {
      foreground: document.hasFocus(),
      activeIsEditor: document.activeElement === editor,
      presentation: shell.dataset.taskNotePresentation ?? null,
      role: shell.getAttribute("role"),
      ariaModal: shell.getAttribute("aria-modal"),
    };
  })()`);

  assert.equal(initial.foreground, true, "Finding33 Edge page lacks real browser focus for keyboard input.");
  assert.equal(initial.activeIsEditor, true, "Finding33 could not establish contenteditable keyboard focus.");
  assert.equal(initial.presentation, "large", "Finding33 fixture did not start in large Notes.");
  assert.equal(initial.role, "dialog", "Finding33 large Notes lost dialog semantics.");
  assert.equal(initial.ariaModal, "true", "Finding33 large Notes lost modal semantics.");

  phase = "keyboard-input";
  await key(client, "Escape", "Escape", 27);
  phase = "keyboard-dispatched";

  await waitFor(
    () => evaluate(client, `(() => {
      const shell = document.querySelector('[data-task-notes-visual="editable"] [data-task-note-editor="true"]');
      return shell?.getAttribute("data-task-note-presentation") === "compact";
    })()`),
    "Finding33 large Notes Escape close",
    5_000,
    50,
  );

  await new Promise((resolve) => setTimeout(resolve, 100));
  const finalState = await evaluate(client, `(() => {
    const shell = document.querySelector('[data-task-notes-visual="editable"] [data-task-note-editor="true"]');
    const editor = shell?.querySelector('[data-task-note-control="editor"]');
    const presentation = shell?.querySelector('[data-task-note-control="presentation"]');
    return {
      presentation: shell?.getAttribute("data-task-note-presentation") ?? null,
      editorStillMounted: Boolean(editor),
      activeIsPresentationControl: document.activeElement === presentation,
      trace: (window.__NARRO_FINDING33_KEY_TRACE__ ?? []).slice(),
    };
  })()`);

  assert.equal(finalState.presentation, "compact", "Real Edge Escape did not return large Notes to compact presentation.");
  assert.equal(finalState.editorStillMounted, true, "Finding33 Escape remounted or removed the shared editor.");
  assert.ok(
    finalState.trace.some((event) =>
      event.key === "Escape"
      && event.targetIsEditor === true
      && event.shellContainsTarget === true
      && event.presentationAtCapture === "large"
    ),
    "Finding33 real Escape did not reach the large Notes editor shell from the focused contenteditable.",
  );
  assert.equal(
    finalState.activeIsPresentationControl,
    true,
    "Finding33 Escape did not restore focus to the presentation control.",
  );

  const result = {
    candidate: "finding33-large-notes-real-escape",
    initial,
    finalState,
    assertions: {
      contenteditableFocused: true,
      realEscapeReachedLargeShell: true,
      escapeClosedLargePresentation: true,
      editorRemainedMounted: true,
      focusRestoredToPresentationControl: true,
    },
  };
  fs.writeFileSync(
    path.join(outputDirectory, "finding33-large-notes-escape.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log("Finding33 large Notes real Edge Escape regression: PASS");
} catch (error) {
  // Never label a blank React root as an application/keyboard regression
  // without preserving module delivery, JS exceptions, and real page state.
  let pageState = null;
  if (client) {
    try {
      pageState = await evaluate(client, `(() => {
        const shell = document.querySelector('[data-task-notes-visual="editable"] [data-task-note-editor="true"]');
        const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const entryScripts = Array.from(document.querySelectorAll("script[src]"))
          .map(node => ({src: node.src, type: node.type}));
        const loadedResources = performance.getEntriesByType("resource")
          .filter(entry => entry.name.includes("/assets/"))
          .slice(-30).map(entry => ({
            name: entry.name, duration: entry.duration,
            transferSize: entry.transferSize, decodedBodySize: entry.decodedBodySize,
          }));
        return {
          url: location.href,
          readyState: document.readyState,
          foreground: document.hasFocus(),
          htmlDataset: { ...document.documentElement.dataset },
          rootChildren: document.getElementById("root")?.childElementCount ?? null,
          presentation: shell?.getAttribute("data-task-note-presentation") ?? null,
          activeOuterHtml: active?.outerHTML?.slice(0, 500) ?? null,
          entryScripts,
          loadedResources,
          keyTrace: (window.__NARRO_FINDING33_KEY_TRACE__ ?? []).slice(),
        };
      })()`);
    } catch (inspectionError) {
      record({ method: "CDP.DiagnosticFailure", reason: String(inspectionError) });
    }
  }
  const failure = {
    category: "finding33-real-edge-bootstrap-or-keyboard-failure",
    pageUrl,
    reason: String(error),
    phase,
    pageState,
    browserEvents,
    browserStderrTail: edgeStderr,
  };
  fs.writeFileSync(
    path.join(outputDirectory, "finding33-large-notes-escape-failure.json"),
    JSON.stringify(failure, null, 2) + "\n",
  );
  console.error("Finding33 real Edge failure diagnostics:", JSON.stringify(failure, null, 2));
  throw error;
} finally {
  client?.close();
  killTree(edge);
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 125 });
}
