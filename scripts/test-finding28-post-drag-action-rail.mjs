import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";

const root = path.resolve(new URL("../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const outputDirectory = path.join(root, "artifacts", "visual-regression");
fs.mkdirSync(outputDirectory, { recursive: true });

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

function edgePath() {
  const candidates = [
    path.join(process.env["ProgramFiles(x86)"] ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
    path.join(process.env.ProgramFiles ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
  ];
  const found = candidates.find((candidate) => candidate && fs.existsSync(candidate));
  if (!found) throw new Error("Finding28 regression requires Microsoft Edge on Windows.");
  return found;
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
  if (process.platform === "win32") {
    spawnSync("taskkill.exe", ["/PID", String(processHandle.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    });
  } else {
    try { processHandle.kill("SIGTERM"); } catch { /* already gone */ }
  }
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
    this.socket = null;
  }

  async connect() {
    await new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url);
      this.socket = socket;
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
      socket.addEventListener("message", (event) => {
        const message = JSON.parse(String(event.data));
        if (!message.id) return;
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
      });
      socket.addEventListener("close", () => {
        for (const pending of this.pending.values()) {
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
      this.pending.set(id, { resolve, reject });
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
    throw new Error(response.exceptionDetails.exception?.description
      ?? response.exceptionDetails.text
      ?? "Runtime.evaluate failed.");
  }
  return response.result?.value;
}

async function sleep(client, milliseconds) {
  await evaluate(client, `new Promise(resolve => setTimeout(resolve, ${milliseconds}))`);
}

async function dispatchPointer(client, type, x, y, button, buttons, targetMode = "window") {
  return evaluate(client, `(() => {
    const x = ${JSON.stringify(x)};
    const y = ${JSON.stringify(y)};
    const mode = ${JSON.stringify(targetMode)};
    const sourceId = window.__NARRO_FINDING28_FIXTURE__.read().taskIds[0];
    const target = mode === "source"
      ? document.querySelector('[data-board-drag-task="' + sourceId + '"]')
      : mode === "hit"
        ? document.elementFromPoint(x, y)
        : window;
    if (!target) throw new Error("Finding28 pointer transport target is missing.");
    const event = new PointerEvent(${JSON.stringify(type)}, {
      pointerId: 41,
      pointerType: "mouse",
      isPrimary: true,
      button: ${JSON.stringify(button)},
      buttons: ${JSON.stringify(buttons)},
      clientX: x,
      clientY: y,
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    return {
      dispatched: target.dispatchEvent(event),
      target: target instanceof Element ? target.outerHTML.slice(0, 220) : "window",
    };
  })()`);
}

async function key(client, keyName, code, virtualKeyCode, modifiers = 0) {
  await client.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: keyName,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    nativeVirtualKeyCode: virtualKeyCode,
    modifiers,
  });
  await client.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: keyName,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    nativeVirtualKeyCode: virtualKeyCode,
    modifiers,
  });
}

async function shiftTab(client) {
  await client.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Shift",
    code: "ShiftLeft",
    windowsVirtualKeyCode: 16,
    nativeVirtualKeyCode: 16,
    modifiers: 8,
  });
  await key(client, "Tab", "Tab", 9, 8);
  await client.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Shift",
    code: "ShiftLeft",
    windowsVirtualKeyCode: 16,
    nativeVirtualKeyCode: 16,
    modifiers: 0,
  });
}

async function snapshot(client, label) {
  return evaluate(client, `(() => {
    const fixture = window.__NARRO_FINDING28_FIXTURE__.read();
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const ownerShell = active?.closest?.("[data-board-drag-task]") ?? null;
    const probeId = fixture.taskIds[0];
    const probeShell = document.querySelector('[data-board-drag-task="' + probeId + '"]');
    const probeCard = probeShell?.querySelector(".list-board-task");
    const rail = probeCard?.querySelector(".list-board-task__actions");
    const style = rail ? getComputedStyle(rail) : null;
    const activeKind = active?.matches?.("[data-task-title-control]") ? "title"
      : active?.matches?.("[data-board-drag-task]") ? "drag-shell"
      : active?.matches?.("[data-task-action]") ? "task-action"
      : active?.tagName?.toLowerCase() ?? null;
    return {
      label: ${JSON.stringify(label)},
      activeKind,
      activeTaskId: ownerShell?.getAttribute("data-board-drag-task") ?? null,
      activeOuterHtml: active?.outerHTML?.slice(0, 320) ?? null,
      cardFocusWithin: Boolean(probeCard?.matches(":focus-within")),
      shellFocusVisible: Boolean(probeShell?.matches(":focus-visible")),
      cardHover: Boolean(probeCard?.matches(":hover")),
      rail: style ? {
        opacity: style.opacity,
        visibility: style.visibility,
        pointerEvents: style.pointerEvents,
      } : null,
      fixture,
    };
  })()`);
}

function railVisible(observation) {
  return observation?.rail
    && Number.parseFloat(observation.rail.opacity) >= 0.99
    && observation.rail.visibility === "visible"
    && observation.rail.pointerEvents === "auto";
}

if (process.platform !== "win32") {
  throw new Error("Finding28 post-drag regression is Windows/Edge-only.");
}

const previewPort = await freePort();
const debugPort = await freePort();
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("npm_execpath is unavailable.");
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "narro-finding28-"));
const pageUrl = `http://127.0.0.1:${previewPort}/focus-editor-fixture.html?theme=dark&scenario=finding28-post-drag&motion=false`;
const preview = spawn(process.execPath, [
  npmCli,
  "run",
  "preview",
  "--",
  "--host",
  "127.0.0.1",
  "--port",
  String(previewPort),
  "--strictPort",
], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});
let edge;
let client;
try {
  await waitFor(async () => {
    const response = await fetch(pageUrl);
    return response.ok;
  }, "Vite preview");

  edge = spawn(edgePath(), [
    "--headless=new",
    "--disable-gpu",
    "--disable-background-networking",
    "--no-first-run",
    "--force-device-scale-factor=1",
    "--force-prefers-no-reduced-motion",
    "--window-size=1280,900",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    pageUrl,
  ], {
    cwd: root,
    stdio: ["ignore", "ignore", "pipe"],
    windowsHide: true,
  });

  const target = await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
    if (!response.ok) return null;
    const targets = await response.json();
    return targets.find((candidate) =>
      candidate.type === "page"
      && candidate.url.includes("scenario=finding28-post-drag")
      && candidate.webSocketDebuggerUrl
    ) ?? null;
  }, "Finding28 Edge page target");

  client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send("Runtime.enable");
  await client.send("Page.enable");

  await waitFor(async () => {
    const state = await evaluate(client, `(() => {
      const ready = document.documentElement.dataset.finding28FixtureReady === "true";
      if (ready) return { ready: true };
      const boardError = document.querySelector('[data-list-board="error"]');
      if (boardError) {
        return {
          ready: false,
          error: boardError.textContent?.trim() || "ListBoard rendered an unknown error",
        };
      }
      return {
        ready: false,
        error: document.documentElement.dataset.finding28FixtureError || null,
      };
    })()`);
    if (state?.error) {
      throw new Error(`Finding28 fixture failed before readiness: ${state.error}`);
    }
    return state?.ready === true;
  }, "Finding28 production ListBoard fixture", 20_000);

  await evaluate(client, `(() => {
    const trace = [];
    window.__NARRO_FINDING28_INPUT_TRACE__ = trace;
    const record = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const shell = target?.closest?.("[data-board-drag-task]") ?? null;
      trace.push({
        type: event.type,
        pointerId: "pointerId" in event ? event.pointerId : null,
        pointerType: "pointerType" in event ? event.pointerType : null,
        isPrimary: "isPrimary" in event ? event.isPrimary : null,
        button: "button" in event ? event.button : null,
        buttons: "buttons" in event ? event.buttons : null,
        clientX: "clientX" in event ? event.clientX : null,
        clientY: "clientY" in event ? event.clientY : null,
        defaultPrevented: event.defaultPrevented,
        isTrusted: event.isTrusted,
        taskId: shell?.getAttribute("data-board-drag-task") ?? null,
        target: target?.outerHTML?.slice(0, 220) ?? null,
      });
      if (trace.length > 24) trace.splice(0, trace.length - 24);
    };
    for (const type of ["pointerdown", "pointermove", "pointerup", "mousedown", "mousemove", "mouseup"]) {
      window.addEventListener(type, record);
    }
    return true;
  })()`);

  const initial = await evaluate(client, `(() => {
    const fixture = window.__NARRO_FINDING28_FIXTURE__.read();
    const shells = Array.from(document.querySelectorAll('[data-board-drag-task][data-task-reorderable="true"]'));
    if (shells.length < 3) throw new Error("Finding28 fixture needs three reorderable tasks.");
    const source = shells[0];
    const interactive = "button, a, input, select, textarea, [contenteditable], [data-task-action], [data-task-title-control], [data-task-metric-control], [data-task-schedule-control], [data-task-note-control], [data-task-subtask-control]";
    const bounds = source.getBoundingClientRect();
    let sourcePoint = null;
    for (const yFraction of [0.86, 0.72, 0.55, 0.34]) {
      for (const xFraction of [0.08, 0.22, 0.5, 0.82]) {
        const x = bounds.left + bounds.width * xFraction;
        const y = bounds.top + bounds.height * yFraction;
        const hit = document.elementFromPoint(x, y);
        if (hit && source.contains(hit) && !hit.closest(interactive)) {
          sourcePoint = { x, y, hit: hit.outerHTML.slice(0, 180) };
          break;
        }
      }
      if (sourcePoint) break;
    }
    if (!sourcePoint) throw new Error("No non-interactive drag point found.");
    return { fixture, sourcePoint };
  })()`);

  assert.equal(initial.fixture.mutationCount, 0, "Finding28 fixture must start without mutations.");

  await client.send("Input.dispatchMouseEvent", {
    type: "mouseMoved", x: initial.sourcePoint.x, y: initial.sourcePoint.y, button: "none", buttons: 0,
  });

  // CI1023 proved Edge/CDP mousePressed emits mousedown but not pointerdown in
  // this headless transport. The production board starts drag exclusively from
  // onPointerDown, so use deterministic PointerEvent transport for drag start/
  // move/finish while retaining real Edge input for the keyboard/hover probes
  // that decide Finding28's focus/action-rail behavior.
  const syntheticDown = await dispatchPointer(
    client,
    "pointerdown",
    initial.sourcePoint.x,
    initial.sourcePoint.y,
    0,
    1,
    "source",
  );
  assert.match(
    syntheticDown.target,
    /data-board-drag-task=/,
    "Finding28 deterministic pointerdown did not target the production reorder shell.",
  );
  await sleep(client, 40);
  const pressTrace = await evaluate(client, `(() => ({
    expectedTaskId: window.__NARRO_FINDING28_FIXTURE__.read().taskIds[0],
    events: (window.__NARRO_FINDING28_INPUT_TRACE__ ?? []).slice(),
  }))()`);
  const pointerDown = pressTrace.events.find((event) => event.type === "pointerdown" && event.buttons === 1);
  assert.ok(pointerDown, "Finding28 deterministic pointerdown did not reach the production drag shell.");
  assert.equal(pointerDown.pointerId, 41, "Finding28 deterministic pointerdown used an unexpected pointer id.");
  assert.equal(pointerDown.taskId, pressTrace.expectedTaskId, "Finding28 pointerdown missed the expected production drag shell.");
  assert.equal(pointerDown.isTrusted, false, "Finding28 harness must record its deterministic drag transport as synthetic.");

  await dispatchPointer(
    client,
    "pointermove",
    initial.sourcePoint.x + 12,
    initial.sourcePoint.y + 12,
    -1,
    1,
  );
  await sleep(client, 40);
  const moveTrace = await evaluate(client, "(window.__NARRO_FINDING28_INPUT_TRACE__ ?? []).slice()");
  assert.ok(
    moveTrace.some((event) => event.type === "pointermove" && event.buttons === 1),
    "Finding28 deterministic pressed pointermove did not reach the production drag session.",
  );

  await waitFor(async () => {
    return evaluate(client, `(() => {
      const sourceId = window.__NARRO_FINDING28_FIXTURE__.read().taskIds[0];
      const source = document.querySelector('[data-board-drag-task="' + sourceId + '"]');
      const preview = document.querySelector(".list-board-task-drag-preview");
      return source?.getAttribute("data-task-dragging") === "true" && Boolean(preview);
    })()`);
  }, "Finding28 pointer lift", 5_000, 50);

  const destinationPoint = await evaluate(client, `(() => {
    const fixture = window.__NARRO_FINDING28_FIXTURE__.read();
    const destination = document.querySelector('[data-board-drag-task="' + fixture.taskIds[1] + '"]');
    if (!(destination instanceof HTMLElement)) throw new Error("Finding28 destination task missing after pointer lift.");
    const bounds = destination.getBoundingClientRect();
    const x = bounds.left + bounds.width * 0.5;
    const y = bounds.top + bounds.height * 0.82;
    const hit = document.elementFromPoint(x, y);
    const lane = hit?.closest?.("[data-board-drop-lane]");
    if (!lane) throw new Error("Finding28 live destination point is outside a board drop lane.");
    return { x, y, hit: hit?.outerHTML?.slice(0, 180) ?? null };
  })()`);

  await dispatchPointer(
    client,
    "pointermove",
    destinationPoint.x,
    destinationPoint.y,
    -1,
    1,
  );
  await sleep(client, 80);
  await dispatchPointer(
    client,
    "pointerup",
    destinationPoint.x,
    destinationPoint.y,
    0,
    0,
  );

  await waitFor(async () => {
    const state = await evaluate(client, "window.__NARRO_FINDING28_FIXTURE__.read()");
    return state.mutationCount === 1 ? state : null;
  }, "one committed Finding28 reorder");
  await sleep(client, 180);

  await client.send("Input.dispatchMouseEvent", {
    type: "mouseMoved", x: 2, y: 2, button: "none", buttons: 0,
  });
  await sleep(client, 180);
  const postDrag = await snapshot(client, "post-drag");

  await evaluate(client, `(() => {
    const id = window.__NARRO_FINDING28_FIXTURE__.read().taskIds[0];
    const title = document.querySelector('[data-board-drag-task="' + id + '"] [data-task-title-control]');
    if (!(title instanceof HTMLElement)) throw new Error("Finding28 title control missing after drag.");
    title.focus({ preventScroll: true });
    return true;
  })()`);
  await sleep(client, 180);
  const titleFocused = await snapshot(client, "title-focused-after-drag");
  assert.equal(titleFocused.activeKind, "title", "Finding28 probe could not establish the observed title-focus state.");
  assert.equal(titleFocused.cardFocusWithin, true, "Focused title did not establish :focus-within on its task card.");
  assert.equal(railVisible(titleFocused), true, "Focused title did not reveal the task action rail.");

  await key(client, "Tab", "Tab", 9);
  await sleep(client, 180);
  const afterTab = await snapshot(client, "after-tab");

  await shiftTab(client);
  await sleep(client, 180);
  const afterShiftTab = await snapshot(client, "after-shift-tab");
  assert.equal(afterShiftTab.activeKind, "title", "Shift+Tab did not return to the focused title control.");
  assert.equal(afterShiftTab.cardFocusWithin, true, "Shift+Tab title focus did not retain :focus-within.");
  assert.equal(railVisible(afterShiftTab), true, "Shift+Tab title focus did not reveal the action rail.");

  const afterKeyboard = await evaluate(client, "window.__NARRO_FINDING28_FIXTURE__.read()");
  assert.equal(afterKeyboard.mutationCount, 1, "Tab/Shift+Tab caused an unexpected board mutation.");
  assert.deepEqual(afterKeyboard.order, initial.fixture.order.slice(1, 2)
    .concat(initial.fixture.order.slice(0, 1), initial.fixture.order.slice(2)),
  "Finding28 reorder identity/order changed during the keyboard probe.");
  assert.equal(afterKeyboard.titleEditorOpen, false, "Finding28 keyboard probe unexpectedly opened title editing.");

  await evaluate(client, "(document.activeElement instanceof HTMLElement) && document.activeElement.blur()");
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseMoved", x: 2, y: 2, button: "none", buttons: 0,
  });
  await sleep(client, 180);
  const beforeHover = await snapshot(client, "before-hover");
  assert.equal(beforeHover.cardFocusWithin, false, "Finding28 hover baseline retained card focus.");
  assert.equal(beforeHover.cardHover, false, "Finding28 hover baseline still matched :hover.");
  assert.equal(railVisible(beforeHover), false, "Finding28 action rail stayed visible with neither focus nor hover.");

  const hoverPoint = await evaluate(client, `(() => {
    const id = window.__NARRO_FINDING28_FIXTURE__.read().taskIds[0];
    const card = document.querySelector('[data-board-drag-task="' + id + '"] .list-board-task');
    if (!(card instanceof HTMLElement)) throw new Error("Finding28 probe card missing.");
    const rect = card.getBoundingClientRect();
    return { x: rect.left + rect.width * 0.55, y: rect.top + rect.height * 0.55 };
  })()`);
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseMoved", x: hoverPoint.x, y: hoverPoint.y, button: "none", buttons: 0,
  });
  await sleep(client, 180);
  const afterHover = await snapshot(client, "after-hover");
  assert.equal(afterHover.cardHover, true, "Actual Edge pointer movement did not establish :hover.");
  assert.equal(railVisible(afterHover), true, "Actual pointer hover did not reveal the task action rail.");

  const finalState = await evaluate(client, "window.__NARRO_FINDING28_FIXTURE__.read()");
  assert.equal(finalState.mutationCount, 1, "Pointer hover caused an unexpected board mutation.");
  assert.equal(finalState.titleEditorOpen, false, "Pointer hover unexpectedly opened title editing.");

  const result = {
    candidate: "finding28-post-drag-action-rail",
    deviceScaleFactor: 1,
    initial,
    observations: [postDrag, titleFocused, afterTab, afterShiftTab, beforeHover, afterHover],
    finalState,
    assertions: {
      committedReorderExactlyOnce: true,
      focusedTitleMatchesFocusWithin: true,
      focusedTitleRevealsRail: true,
      tabShiftTabNoMutation: true,
      shiftTabReturnsTitle: true,
      hoverBaselineHidden: true,
      actualPointerHoverRevealsRail: true,
      titleEditingUnaffected: true,
    },
  };
  fs.writeFileSync(
    path.join(outputDirectory, "finding28-post-drag-action-rail.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log("Finding28 post-drag keyboard/action-rail Edge regression: PASS");
} catch (error) {
  if (client) {
    try {
      const diagnostics = await evaluate(client, `(() => ({
        readyState: document.readyState,
        htmlDataset: { ...document.documentElement.dataset },
        boardState: document.querySelector("[data-list-board]")?.getAttribute("data-list-board") ?? null,
        boardText: document.querySelector("[data-list-board]")?.textContent?.trim().slice(0, 800) ?? null,
        rootHtml: document.querySelector("#root")?.innerHTML?.slice(0, 1800) ?? null,
        inputTrace: (window.__NARRO_FINDING28_INPUT_TRACE__ ?? []).slice(),
      }))()`);
      console.error("Finding28 fixture diagnostics:", JSON.stringify(diagnostics, null, 2));
    } catch {
      // Preserve the original failure when the page itself is unavailable.
    }
  }
  throw error;
} finally {
  client?.close();
  killTree(edge);
  killTree(preview);
  fs.rmSync(profile, { recursive: true, force: true });
}
