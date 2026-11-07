import test from "node:test";
import assert from "node:assert/strict";
import { signalFromLog, failedStepLog, makeFingerprint, repeatGroups, selectSpreadRuns } from "./ci-learning.mjs";

test("real Windows EPERM error normalizes temporary paths and timestamps", () => {
  const log = "2026-10-09T08:21:03.5084179Z Error: EPERM, Permission denied: C:\\Users\\Runner\\Temp\\abc\n" +
    "2026-10-09T08:21:03.5799501Z ##[error]Process completed with exit code 1.";
  assert.deepEqual(signalFromLog(log), { kind: "os-error", value: "EPERM" });
});
test("a failed Rust test dominates a later artifact error", () => {
  assert.deepEqual(signalFromLog("test a::b::c ... FAILED\n##[error]No files were found"),
    { kind: "rust-test", value: "a::b::c" });
});
test("anonymized Node syntax errors are grouped by real frontend script and stable message", () => {
  const first = "2026-10-21T18:32:14.3056497Z SyntaxError: Unexpected token ','\n" +
    "2026-10-21T18:32:14.3057673Z     at harness (file:///home/runner/work/Narro/Narro/scripts/test-archive-read-retry.mjs:49:6)\n" +
    "2026-10-21T18:32:14.3058161Z     at file:///home/runner/work/Narro/Narro/scripts/test-archive-read-retry.mjs:123:19";
  const second = "2026-10-21T19:00:15.0000000Z SyntaxError: Unexpected token ','\n" +
    "2026-10-21T19:00:15.0001000Z     at harness (file:///home/runner/work/Narro/Narro/scripts/test-archive-read-retry.mjs:64:3)";
  const a = signalFromLog(first);
  assert.equal(a.kind, "node-syntax");
  assert.deepEqual(a, signalFromLog(second));
  assert.ok(a.value.startsWith("scripts/test-archive-read-retry.mjs:"));
  assert.ok(!a.value.includes("Unexpected token"));
  assert.ok(!a.value.includes("/home/"));
  assert.notEqual(a.value, signalFromLog(first.replace("Unexpected token ','", "Unexpected token '}'")).value);
});

test("a Node frontend contract failure is recognized without publishing assertion content", () => {
  const message = "Missing real archive fixture keyboard arrow/focus coverage: data-archive-tabs-keyboard-pass";
  const log = "2026-10-21T18:36:43.8262048Z Error: " + message + "\n" +
    "2026-10-21T18:36:43.8262693Z     at requireText (file:///home/runner/work/Narro/Narro/scripts/test-ui-archives.mjs:7:41)";
  const observed = signalFromLog(log);
  assert.equal(observed.kind, "node-contract");
  assert.match(observed.value, /^scripts\/test-ui-archives\.mjs:[0-9a-f]{12}$/);
  assert.ok(!observed.value.includes("archive-tabs"));
  assert.equal(observed.value, signalFromLog(log.replace(":7:41", ":30:4")).value);
});

test("Node AssertionError is distinct from generic contract failure", () => {
  const observed = signalFromLog("AssertionError [ERR_ASSERTION]: expected redacted value\n" +
    "    at file:///home/runner/work/Narro/Narro/scripts/test-shortcut-accessibility-and-admission.mjs:82:8");
  assert.equal(observed.kind, "node-assertion");
  assert.ok(!observed.value.includes("redacted"));
});

test("bare Node-style errors and downstream uploads are not treated as reliable families", () => {
  assert.equal(signalFromLog("Error: Missing fixture\n##[error]Process completed with exit code 1"), null);
  assert.equal(signalFromLog("SyntaxError: Unexpected token ','\n at node:vm:117:7"), null);
  assert.equal(signalFromLog("##[error]No files were found with the provided path"), null);
});

test("explicit Rust diagnostics remain preferred over incidental Node stack lines", () => {
  const mixed = "error[E0308]: mismatched types\nError: secondary error\n" +
    "    at file:///home/runner/work/Narro/Narro/scripts/test-ui-archives.mjs:2:2";
  assert.deepEqual(signalFromLog(mixed), { kind: "rust-compiler", value: "E0308" });
});

test("generic exit failures are not sufficient evidence", () => {
  assert.equal(signalFromLog("test a::b ... ok\n##[error]Process completed with exit code 1"), null);
  assert.equal(makeFingerprint("windows-candidate", "Run Rust Tests", null), null);
});
test("different failed steps are distinct families", () => {
  const s = { kind: "os-error", value: "EPERM" };
  assert.notEqual(makeFingerprint("windows-candidate", "Visual Fixtures", s),
    makeFingerprint("windows-candidate", "Rust Tests", s));
});
test("attempts of one run never meet recurrence threshold", () => {
  const base = { fingerprint: "same", signal: { kind: "rust-test", value: "a::b" } };
  assert.equal(repeatGroups([{ ...base, runId: 9, attempt: 1 },
    { ...base, runId: 9, attempt: 2 }]).length, 0);
  const groups = repeatGroups([{ ...base, runId: 9, attempt: 2 },
    { ...base, runId: 10, attempt: 1 }, { ...base, runId: 9, attempt: 1 }]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].occurrences.size, 2);
  assert.equal(groups[0].occurrences.get(9).attempt, 1);
});

test("high-volume sample retains freshest failures and spreads through history", () => {
  const runs = Array.from({ length: 200 }, (_, i) => ({ id: 500 - i }));
  const sampled = selectSpreadRuns(runs, 40);
  assert.equal(sampled.length, 40);
  assert.deepEqual(sampled.slice(0, 20).map(x => x.id), runs.slice(0, 20).map(x => x.id));
  assert.ok(sampled.at(-1).id < 350);
  assert.equal(new Set(sampled.map(x => x.id)).size, 40);
});

test("PowerShell Reports fixture assertion is a stable candidate without log text disclosure", () => {
  const log1 = "2026-10-09T11:30:19.516Z Reports fixture reports-sessions-detail-keyboard-light assertion: Detail Shift+Tab escaped the active modal.\n" +
    "At D:\\a\\Narro\\scripts\\capture-reports-fixtures.ps1:91 char:21\n" +
    "    + FullyQualifiedErrorId : Reports fixture reports-sessions-detail-keyboard-light assertion: Detail Shift+Tab escaped the active modal.\n";
  const log2 = "2026-10-09T12:23:28.800Z Reports fixture reports-sessions-detail-keyboard-light assertion: Detail Shift+Tab escaped the active modal.\n";
  const a = signalFromLog(log1), b = signalFromLog(log2);
  assert.deepEqual(a, b);
  assert.equal(a.kind, "visual-fixture-assertion");
  assert.ok(a.value.startsWith("reports-sessions-detail-keyboard-light:"));
  assert.ok(!a.value.includes("Shift+Tab"));
  assert.equal(makeFingerprint("windows-candidate", "Capture Visual Regression Fixtures", a),
    makeFingerprint("windows-candidate", "Capture Visual Regression Fixtures", b));
});

test("separate Reports fixture readiness and assertion failures", () => {
  const notReady = signalFromLog("Reports fixture 'reports-sessions-detail-keyboard-light' did not report ready after 2 captures.");
  assert.deepEqual(notReady, { kind: "visual-fixture-readiness", value: "reports-sessions-detail-keyboard-light" });
  const assertion = signalFromLog("Reports fixture reports-sessions-detail-keyboard-light assertion: Detail Shift+Tab escaped the active modal.");
  assert.notEqual(notReady.kind, assertion.kind);
});

test("rustfmt file difference is independent of runner path and line number", () => {
  const first = signalFromLog("Diff in /home/runner/work/Narro/Narro/src-tauri/src/session_reporting.rs:582:");
  const second = signalFromLog("Diff in D:\\a\\Narro\\Narro\\src-tauri\\src\\session_reporting.rs:600:");
  assert.deepEqual(first, { kind: "rustfmt-file", value: "src-tauri/src/session_reporting.rs" });
  assert.deepEqual(first, second);
});

test("Reports post-capture screenshot validation is detected separately from fixture assertions", () => {
  const first = signalFromLog("2026-10-09T12:46:16.4339772Z Error: Reports captured visual validation failed: reports-sessions-detail-keyboard-light screenshot is unexpectedly small");
  const second = signalFromLog("2026-10-09T14:53:17.555Z Error: Reports captured visual validation failed: reports-sessions-detail-keyboard-light screenshot is unexpectedly small");
  assert.deepEqual(first, second);
  assert.equal(first.kind, "reports-captured-contract");
  assert.ok(first.value.startsWith("reports-sessions-detail-keyboard-light:"));
  assert.ok(!first.value.includes("unexpectedly small"));
  assert.notEqual(first.kind, signalFromLog("Reports fixture reports-sessions-detail-keyboard-light assertion: Detail Shift+Tab escaped the active modal.").kind);
});

test("only the actual failed step contributes a diagnostic, not earlier successful steps", () => {
  const log = [
    "2026-10-30T09:38:40.000Z error[E0433]: harmless prior diagnostic in a completed step",
    "2026-10-30T09:39:36.500Z ##[group]Run npm run check:rust:fmt",
    "2026-10-30T09:39:37.491Z Diff in /home/runner/work/Narro/Narro/src-tauri/src/persistence/sessions.rs:590:",
    "2026-10-30T09:39:38.100Z ##[error]Process completed with exit code 1.",
    "2026-10-30T09:39:40.000Z ##[error]No files were found with the provided path",
  ].join("\n");
  const step = { started_at: "2026-10-30T09:39:36Z", completed_at: "2026-10-30T09:39:39Z" };
  const scoped = failedStepLog(log, step);
  assert.ok(scoped.includes("Diff in"));
  assert.ok(!scoped.includes("E0433"));
  assert.ok(!scoped.includes("No files"));
  assert.deepEqual(signalFromLog(scoped),
    { kind: "rustfmt-file", value: "src-tauri/src/persistence/sessions.rs" });
  assert.deepEqual(signalFromLog(log), { kind: "rust-compiler", value: "E0433" });
});

test("missing, malformed and empty step timestamps fail closed, not full-job fallback", () => {
  const log = "2026-10-30T09:39:37.000Z Diff in /home/runner/work/Narro/Narro/src-tauri/src/lib.rs:12:";
  assert.equal(failedStepLog(log, {}), null);
  assert.equal(failedStepLog(log, { started_at: "2026-10-30T09:39:39Z",
    completed_at: "2026-10-30T09:39:36Z" }), null);
  assert.equal(failedStepLog(log, { started_at: "2026-10-30T09:40:00Z",
    completed_at: "2026-10-30T09:41:00Z" }), null);
  assert.equal(failedStepLog("Diff in /tmp/src-tauri/src/lib.rs:12:",
    { started_at: "2026-10-30T09:39:36Z", completed_at: "2026-10-30T09:39:38Z" }), null);
});

test("failed-step completion timestamp includes subsecond diagnostics", () => {
  const s = failedStepLog(
    "2026-10-30T09:39:37.7214429Z Diff in /tmp/src-tauri/src/lib.rs:7:\n" +
    "2026-10-30T09:39:38.0100000Z Error: later cleanup",
    { started_at: "2026-10-30T09:39:37Z", completed_at: "2026-10-30T09:39:37Z" }
  );
  assert.match(s, /Diff in/);
  assert.ok(!s.includes("later cleanup"));
});
