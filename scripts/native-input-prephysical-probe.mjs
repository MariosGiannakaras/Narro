#!/usr/bin/env node
// Read-only P09/P11 Windows WebView2 input delivery probe.
// Run against an already launched, isolated-profile Narro with CDP enabled.
// Never injects a key, moves a window, changes app state or captures task text.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

function classifyChord({ code, ctrlKey, altKey, shiftKey, metaKey, repeat }) {
  if (!ctrlKey || shiftKey || metaKey || repeat) return null;
  if (code === "KeyF" && !altKey) return "search";
  if (code === "KeyT" && altKey) return "create-task";
  return null;
}

function installInPage(classify) {
  if (window.__narroPhysicalInputProbe) {
    return { ready: true, alreadyInstalled: true, page: location.pathname };
  }

  const events = [];
  let dropped = 0;
  let dragging = false;
  let lastMove = 0;
  const add = (entry) => {
    if (events.length === 200) { events.shift(); dropped += 1; }
    events.push({ time: performance.now(), ...entry });
  };
  const hasModal = () => Array.from(document.querySelectorAll(
    '[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"], dialog[open]'
  )).some(el => !el.closest('[hidden], [inert], [aria-hidden="true"]')
    && el.getClientRects().length > 0 && getComputedStyle(el).visibility === "visible");
  const editable = (target) => target instanceof Element
    && Boolean(target.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']"));
  const keydown = (event) => {
    const action = classify(event);
    if (!action) return; // No logging of arbitrary typing/shortcut keys.
    const base = {
      type: "keydown-capture", action, code: event.code,
      ctrl: event.ctrlKey, alt: event.altKey, shift: event.shiftKey,
      targetEditable: editable(event.target), activeEditable: editable(document.activeElement),
      modal: hasModal(), documentFocused: document.hasFocus(),
      defaultPreventedAtCapture: event.defaultPrevented,
    };
    add(base);
    window.setTimeout(() => add({
      type: "keydown-after-dispatch", action, defaultPrevented: event.defaultPrevented,
      documentFocused: document.hasFocus(), modal: hasModal(),
    }), 0);
  };
  const pointer = (event) => {
    const root = document.querySelector('[data-floating-timer="foundation"]');
    const element = event.target instanceof Element ? event.target : null;
    const within = Boolean(root && element && root.contains(element));
    if (event.type === "pointerdown") dragging = within && event.button === 0;
    if (!within && !dragging) return;
    if (event.type === "pointermove") {
      if (!dragging || event.buttons !== 1 || performance.now() - lastMove < 70) return;
      lastMove = performance.now();
    }
    // Only structural hit-test information: never task labels, DOM HTML, values or IDs.
    const owner = element?.closest('[data-tauri-drag-region="true"]') ?? null;
    add({
      type: event.type, button: event.button, buttons: event.buttons,
      pointerType: event.pointerType, x: Math.round(event.clientX), y: Math.round(event.clientY),
      insideTimer: within, exactDragMarker: element?.getAttribute("data-tauri-drag-region") === "true",
      ancestorDragMarker: Boolean(owner), hitTag: element?.tagName ?? null,
      hitClass: element?.classList.contains("floating-timer-foundation__drag-handle") ? "drag-handle"
        : element?.classList.contains("floating-timer-foundation__heading") ? "heading"
        : element?.tagName === "BUTTON" ? "button" : "other",
      hitPointerEvents: element ? getComputedStyle(element).pointerEvents : null,
      compactActions: root?.getAttribute("data-floating-compact-actions") ?? null,
      resizePending: root?.getAttribute("data-floating-resize-pending") ?? null,
      documentFocused: document.hasFocus(),
    });
    if (event.type === "pointerup" || event.type === "pointercancel") dragging = false;
  };
  window.addEventListener("keydown", keydown, true);
  for (const name of ["pointerdown", "pointermove", "pointerup", "pointercancel"]) {
    window.addEventListener(name, pointer, true);
  }

  window.__narroPhysicalInputProbe = {
    drain() {
      const root = document.querySelector('[data-floating-timer="foundation"]');
      const rect = root?.getBoundingClientRect();
      const batch = events.splice(0);
      const lost = dropped; dropped = 0;
      return {
        events: batch, dropped: lost,
        state: {
          path: location.pathname, ready: document.readyState,
          focused: document.hasFocus(), visibility: document.visibilityState,
          modal: hasModal(), activeEditable: editable(document.activeElement),
          timerPresent: Boolean(root),
          timerRect: rect ? [rect.x, rect.y, rect.width, rect.height].map(Math.round) : null,
          screenPosition: [window.screenX, window.screenY],
          compactActions: root?.getAttribute("data-floating-compact-actions") ?? null,
        },
      };
    },
    dispose() {
      window.removeEventListener("keydown", keydown, true);
      for (const name of ["pointerdown", "pointermove", "pointerup", "pointercancel"]) {
        window.removeEventListener(name, pointer, true);
      }
      delete window.__narroPhysicalInputProbe;
    },
  };
  return { ready: true, alreadyInstalled: false, page: location.pathname };
}

function parseOptions(argv) {
  const options = {};
  for (const raw of argv) {
    const match = /^--([a-z]+)=(.+)$/.exec(raw);
    if (!match || Object.hasOwn(options, match[1])) throw new Error("Invalid or duplicate option: " + raw);
    options[match[1]] = match[2];
  }
  const target = options.target ?? "both";
  const port = Number(options.port ?? "9234");
  const seconds = Number(options.seconds ?? "45");
  if (!["main", "focus", "both"].includes(target)) throw new Error("Invalid --target");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid --port");
  if (!Number.isInteger(seconds) || seconds < 1 || seconds > 180) throw new Error("Invalid --seconds");
  if (!options.out || !path.isAbsolute(options.out)) {
    throw new Error("Provide an absolute --out path within an isolated evidence directory");
  }
  for (const k of Object.keys(options)) {
    if (!["target", "port", "seconds", "out"].includes(k)) throw new Error("Unknown option --" + k);
  }
  return { target, port, seconds, out: options.out };
}

async function connect(page) {
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("CDP handshake timeout")), 8000);
    ws.addEventListener("open", () => { clearTimeout(timeout); resolve(); }, { once: true });
    ws.addEventListener("error", () => { clearTimeout(timeout); reject(new Error("CDP handshake failed")); }, { once: true });
  });
  let serial = 0;
  const pending = new Map();
  ws.addEventListener("message", event => {
    let data;
    try { data = JSON.parse(event.data); } catch { return; }
    const receiver = pending.get(data.id);
    if (receiver) { pending.delete(data.id); receiver(data); }
  });
  async function evaluate(expression) {
    const id = ++serial;
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id); reject(new Error("CDP Runtime.evaluate timeout"));
      }, 7000);
      pending.set(id, data => { clearTimeout(timeout); resolve(data); });
      ws.send(JSON.stringify({
        id, method: "Runtime.evaluate",
        params: { expression, returnByValue: true },
      }));
    });
    if (response.error || response.result?.exceptionDetails) {
      throw new Error("CDP evaluation failed: " + JSON.stringify(response.error ?? response.result.exceptionDetails));
    }
    return response.result?.result?.value;
  }
  return { page: page.url, evaluate, close: () => ws.close() };
}

async function run() {
  const options = parseOptions(process.argv.slice(2));
  // Do not replace an existing source recording or evidence receipt.
  await fs.access(options.out).then(() => { throw new Error("Output already exists"); }, error => {
    if (error.code !== "ENOENT") throw error;
  });
  const response = await fetch("http://127.0.0.1:" + options.port + "/json/list", {
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error("CDP discovery failed: " + response.status);
  const pages = await response.json();
  const urls = {
    main: "http://tauri.localhost/",
    focus: "http://tauri.localhost/focus.html",
  };
  const requested = options.target === "both" ? ["main", "focus"] : [options.target];
  const selected = requested.map(name => {
    const page = pages.find(p => p.type === "page" && p.url === urls[name] && p.webSocketDebuggerUrl);
    if (!page) throw new Error("Missing exact Narro " + name + " CDP page; refuse unrelated targets");
    return { name, page };
  });
  const sockets = [];
  const receipt = {
    kind: "narro-p09-p11-dom-delivery-only",
    startedUtc: new Date().toISOString(), requested,
    limitations: [
      "DOM capture cannot prove an OS scan code was delivered if WebView2 consumes it first",
      "DOM pointer callbacks do not prove a Win32 held-button state or a native move loop",
      "Native WebView2 Find and actual HWND movement require separate original video/HWND evidence",
    ],
    observations: [], warnings: [],
  };
  let interrupted = false;
  const onSignal = () => { interrupted = true; };
  process.on("SIGINT", onSignal);
  try {
    for (const entry of selected) {
      const socket = await connect(entry.page);
      sockets.push({ name: entry.name, ...socket });
      const expression = "(" + installInPage.toString() + ")(" + classifyChord.toString() + ")";
      const installed = await socket.evaluate(expression);
      if (!installed?.ready || installed.alreadyInstalled) {
        throw new Error("Probe unavailable or already installed: " + entry.name);
      }
    }
    const stop = Date.now() + options.seconds * 1000;
    while (Date.now() < stop && !interrupted) {
      for (const socket of sockets) {
        const sample = await socket.evaluate(
          "window.__narroPhysicalInputProbe && window.__narroPhysicalInputProbe.drain()"
        );
        if (!sample || !Array.isArray(sample.events)) throw new Error("Probe lost in " + socket.name);
        receipt.observations.push({
          utc: new Date().toISOString(), window: socket.name,
          ...sample,
        });
        if (sample.dropped) receipt.warnings.push(socket.name + ": truncated " + sample.dropped + " events");
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  } finally {
    receipt.finishedUtc = new Date().toISOString();
    receipt.interrupted = interrupted;
    for (const socket of sockets) {
      try { await socket.evaluate("window.__narroPhysicalInputProbe?.dispose()"); } catch {}
      socket.close();
    }
    process.off("SIGINT", onSignal);
    await fs.mkdir(path.dirname(options.out), { recursive: true });
    await fs.writeFile(options.out, JSON.stringify(receipt, null, 2) + "\n", { flag: "wx" });
  }
  process.stdout.write("P09/P11 DOM input receipt written (no physical PASS assigned): " + options.out + "\n");
}

if (process.argv.length === 3 && process.argv[2] === "--self-test") {
  assert.equal(classifyChord({ code: "KeyF", ctrlKey: true }), "search");
  assert.equal(classifyChord({ code: "KeyT", ctrlKey: true, altKey: true }), "create-task");
  assert.equal(classifyChord({ code: "KeyF", ctrlKey: true, altKey: true }), null);
  assert.equal(classifyChord({ code: "KeyT", ctrlKey: true, altKey: true, shiftKey: true }), null);
  assert.equal(classifyChord({ code: "KeyT", ctrlKey: true, altKey: true, repeat: true }), null);
  assert.equal(classifyChord({ code: "KeyT", ctrlKey: false, altKey: true }), null);
  assert.throws(() => parseOptions(["--out=relative.json"]));
  assert.throws(() => parseOptions(["--out=/tmp/a.json", "--target=other"]));
  assert.throws(() => parseOptions(["--out=/tmp/a.json", "--seconds=0"]));
  assert.throws(() => parseOptions(["--out=/tmp/a.json", "--unknown=x"]));
  assert.match(installInPage.toString(), /pointerdown/);
} else {
  await run().catch(error => {
    process.stderr.write("Input probe NOT RUN/FAILED: " + String(error) + "\n");
    process.exitCode = 1;
  });
}
