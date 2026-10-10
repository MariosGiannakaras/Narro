import assert from "node:assert/strict";
import fs from "node:fs";

// CSV is not a harmless duplicate GET: every successful IPC export creates a
// distinct local Downloads file through write_unique_export.
const reports = fs.readFileSync("src/ReportsSessions.tsx", "utf8");
const native = fs.readFileSync("src-tauri/src/report_commands.rs", "utf8");
const open = reports.indexOf("  const exportSessions = async () => {");
const close = reports.indexOf("  const toggleListSelection =", open);
assert(open >= 0 && close > open, "production Reports export boundary missing");
const handler = reports.slice(open, close);
const nativeStart = native.indexOf("pub fn export_report_sessions_csv(");
const nativeEnd = native.indexOf("#[tauri::command", nativeStart + 1);
assert(nativeStart >= 0 && nativeEnd > nativeStart
  && native.slice(nativeStart, nativeEnd).includes("write_unique_export("),
"duplicate exports have an observable extra-file side effect and need a synchronous gate");
assert(reports.includes("const exportInFlightRef = useRef(false);"),
  "Reports CSV export must have a per-mounted immediate guard");
assert(handler.includes("if (exportPending || exportInFlightRef.current) return;"),
  "second keyboard/pointer event in same React render must not export again");
assert(handler.indexOf("const request = currentRequest();") <
  handler.indexOf("exportInFlightRef.current = true;"),
  "missing/invalid range must not take ownership of the export gate");
assert(handler.indexOf("exportInFlightRef.current = true;") <
  handler.indexOf("await exportReportSessionsCsv(request)"),
  "export lock must be acquired before creating any filesystem side effects");
assert(handler.includes("} finally {\n      exportInFlightRef.current = false;")
  && handler.includes("setExportPending(false);"),
  "both rejected and successful native exports must release ref and rendered pending");
assert(handler.includes("setExportError(formatInvokeError(failure));"),
  "existing user-visible export diagnostics must not disappear");

// Same-render double press, persist through a long-running filesystem save,
// failure recovery, and a second deliberate export after a completed first.
function waitable() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return {promise, resolve, reject};
}
function gate() {
  let active = false;
  return {
    get active() { return active; },
    async request(write) {
      if (active) return false;
      active = true;
      try { await write(); return true; }
      finally { active = false; }
    },
  };
}
const owner = gate();
let createdFiles = 0;
const slowWrite = waitable();
const first = owner.request(async () => { await slowWrite.promise; createdFiles++; });
assert.equal(await owner.request(async () => { createdFiles++; }), false,
  "two same-render Export presses must not create two files");
assert.equal(createdFiles, 0);
slowWrite.resolve();
assert.equal(await first, true);
assert.equal(owner.active, false);
assert.equal(createdFiles, 1);
assert.equal(await owner.request(async () => { createdFiles++; }), true,
  "a subsequent, deliberate Export must be available after the first finishes");
assert.equal(createdFiles, 2);

const failure = waitable();
const failing = owner.request(async () => { await failure.promise; createdFiles++; });
assert.equal(await owner.request(async () => { createdFiles++; }), false);
failure.reject(new Error("Downloads directory unavailable"));
await assert.rejects(failing, /Downloads directory unavailable/);
assert.equal(owner.active, false, "native export failure must not strand the owner");
assert.equal(await owner.request(async () => { createdFiles++; }), true);
assert.equal(createdFiles, 3, "only actual successful export attempts may write output files");
console.log("Reports CSV exclusive local-file export, same-render, failure recovery, repeat success passed.");
