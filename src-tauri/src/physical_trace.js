// Included only by Cargo's physical-observability feature, before application JS.
(() => {
  "use strict";
  if (window.__NARRO_PHYSICAL_TRACE__) return;
  const core = window.__TAURI_INTERNALS__;
  if (!core || typeof core.invoke !== "function") return;
  const invoke = core.invoke.bind(core);
  const prefix = "__narro_physical_trace_";
  const page = globalThis.crypto.randomUUID();
  const queue = [];
  let sequence = 0, invocation = 0, lost = 0, sending = false, action = null, stopped = false, inFlight = 0;
  const sensitive = /title|note|content|text|password|token|body|path|url/i;
  function safe(value, key = "", depth = 0, seen = new WeakSet(), budget = { remaining: 512 }) {
    if (--budget.remaining < 0) return { omitted: "node-budget" };
    if (depth > 10) return { omitted: "depth" };
    if (value === undefined) return null;
    if (typeof value === "string") return sensitive.test(key) || value.length > 256
      ? { redactedChars: value.length } : value;
    if (typeof value === "bigint") return value.toString();
    if (value === null || typeof value === "number" || typeof value === "boolean") return value;
    if (value instanceof Error) return { name: value.name, message: value.message.slice(0, 240),
      code: typeof value.code === "string" ? value.code.slice(0, 100) : null,
      stackFrames: String(value.stack || "").split("\n").slice(0, 12).map(x => x.slice(0, 240)) };
    if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) return { binaryBytes: value.byteLength };
    if (typeof value === "object") {
      if (seen.has(value)) return { omitted: "reference" };
      seen.add(value);
    }
    if (Array.isArray(value)) return { items: value.slice(0, 100).map(x => safe(x, "", depth + 1, seen, budget)), total: value.length };
    if (typeof value === "object") return Object.fromEntries(Object.entries(value).slice(0, 100)
      .map(([k, v]) => [k, safe(v, k, depth + 1, seen, budget)]));
    return { omitted: typeof value };
  }
  function record(event, data = {}) {
    if (stopped) return;
    try {
      const row = { page, seq: ++sequence, utc: new Date().toISOString(),
        performanceMs: performance.now(), event, actionId: action, lost, data: safe(data) };
      if (queue.length >= 1024) { lost++; return; }
      const bytes = JSON.stringify(row).length;
      if (bytes > 12000) row.data = { traceId: row.data?.traceId, command: row.data?.command,
        omitted: "record-size", originalChars: bytes };
      queue.push(row);
    } catch { lost++; } // Observation must never replace a product result/error with a logger exception.
  }
  async function flush() {
    if (sending || !queue.length) return;
    sending = true;
    const records = queue.splice(0, 64);
    try { await invoke(prefix + "batch", { records }); }
    catch { lost += records.length; }
    finally { sending = false; }
  }
  async function tracedInvoke(command, args, options) {
    if (command.startsWith(prefix)) return invoke(command, args, options);
    const traceId = page + ":" + (++invocation);
    const started = performance.now();
    inFlight++;
    record("ipc-start", { traceId, command, args });
    // Preserve the caller's headers/options; never modify command args or return values.
    let result;
    try {
      const headers = new Headers(options?.headers);
      headers.set("x-narro-trace-id", traceId);
      result = invoke(command, args, { ...options, headers: Object.fromEntries(headers.entries()) });
    }
    catch (error) { inFlight--; record("ipc-error", { traceId, command, error, durationMs: performance.now() - started }); throw error; }
    return Promise.resolve(result).then(value => {
      inFlight--;
      record("ipc-result", { traceId, command, value, durationMs: performance.now() - started });
      return value;
    }, error => {
      inFlight--;
      record("ipc-error", { traceId, command, error, durationMs: performance.now() - started });
      throw error;
    });
  }
  function target(node) {
    const el = node?.closest?.("button,input,select,textarea,a,[role],[data-testid]") || node;
    return el instanceof Element ? { tag: el.tagName, id: el.id, role: el.getAttribute("role"),
      type: el.getAttribute("type"), testId: el.getAttribute("data-testid"),
      disabled: el.hasAttribute("disabled"), checked: typeof el.checked === "boolean" ? el.checked : null } : null;
  }
  for (const type of ["pointerdown", "click", "input", "change", "submit", "focusin", "keydown"])
    document.addEventListener(type, event => {
      if (type === "keydown" && !["Enter", "Escape", "Tab", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      action = page + ":action:" + (sequence + 1);
      const current = action;
      record("ui-action", { type, target: target(event.target), key: type === "keydown" ? event.key : undefined });
      // Association is limited to the event turn, not guessed across arbitrary async work.
      setTimeout(() => { if (action === current) action = null; }, 0);
    }, true);
  window.addEventListener("error", event => record("js-error", { error: event.error,
    line: event.lineno, column: event.colno, filename: event.filename }));
  window.addEventListener("unhandledrejection", event => record("unhandled-rejection", { reason: event.reason }));
  for (const level of ["warn", "error"]) {
    const original = console[level].bind(console);
    console[level] = (...args) => { record("console-" + level, { args }); return original(...args); };
  }
  let mutations = 0, attributes = new Set();
  function observe() {
    new MutationObserver(records => {
      mutations += records.length;
      for (const item of records) if (item.attributeName) attributes.add(item.attributeName);
    }).observe(document.documentElement, { subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: ["class", "style", "hidden", "disabled", "aria-expanded", "aria-selected", "data-state"] });
    record("document-ready", { readyState: document.readyState });
  }
  if (document.documentElement) observe(); else document.addEventListener("DOMContentLoaded", observe, { once: true });
  function tick() {
    if (mutations) {
      record("dom-projection", { mutations, attributes: [...attributes], active: target(document.activeElement),
        visibility: document.visibilityState });
      mutations = 0; attributes = new Set();
    }
    void flush();
  }
  const pulse = () => record("frontend-heartbeat", { queued: queue.length, lost, readyState: document.readyState });
  let timer = setInterval(tick, 100);
  let heartbeat = setInterval(pulse, 1000);
  function endPage() {
    if (stopped) return;
    record("page-end", { queued: queue.length, lost, inFlight });
    stopped = true;
    clearInterval(timer); clearInterval(heartbeat); void flush();
  }
  window.addEventListener("pagehide", endPage);
  async function drain() {
    const deadline = performance.now() + 2000;
    while (inFlight && performance.now() < deadline) await new Promise(r => setTimeout(r, 10));
    endPage();
    while ((queue.length || sending) && performance.now() < deadline) {
      await flush(); await new Promise(r => setTimeout(r, 5));
    }
    await invoke(prefix + "drained", { page, lastSeq: sequence, lost, queued: queue.length, inFlight });
  }
  function resume() {
    if (!stopped) return;
    stopped = false; timer = setInterval(tick, 100); heartbeat = setInterval(pulse, 1000);
    record("frontend-resumed-after-cancelled-quit", { coverageGap: true });
  }
  window.__NARRO_PHYSICAL_TRACE__ = { schema: "narro-physical-trace/v1", page,
    invoke: tracedInvoke, record, drain, resume,
    marker: label => { record("operator-marker", { label }); void flush(); },
    health: () => ({ page, sequence, queued: queue.length, lost }) };
  record("frontend-start", { timeOrigin: performance.timeOrigin, readyState: document.readyState,
    devicePixelRatio: window.devicePixelRatio, viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches });
  function handshake() { return invoke(prefix + "hello").then(async value => {
    record("backend-clock-handshake", value);
    if (value.ready === false) { setTimeout(handshake, 50); return; }
    // CI-only feature-build lifecycle probe. Ordinary physical sessions never set this switch.
    if (value.probeMode && value.windowLabel === "main") {
      await tracedInvoke("get_state"); await tracedInvoke("get_home_snapshot");
      record("logging-probe-complete", { commands: 2 }); await flush();
      await invoke(prefix + "probe_exit");
    }
  }, error => record("trace-handshake-failed", { error })); }
  void handshake();
})();
