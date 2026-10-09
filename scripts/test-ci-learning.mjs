import test from "node:test";
import assert from "node:assert/strict";
import { signalFromLog, makeFingerprint, repeatGroups, selectSpreadRuns } from "./ci-learning.mjs";

test("real Windows EPERM error normalizes temporary paths and timestamps", () => {
  const log = "2026-10-09T08:21:03.5084179Z Error: EPERM, Permission denied: C:\\Users\\Runner\\Temp\\abc\n" +
    "2026-10-09T08:21:03.5799501Z ##[error]Process completed with exit code 1.";
  assert.deepEqual(signalFromLog(log), { kind: "os-error", value: "EPERM" });
});
test("a failed Rust test dominates a later artifact error", () => {
  assert.deepEqual(signalFromLog("test a::b::c ... FAILED\n##[error]No files were found"),
    { kind: "rust-test", value: "a::b::c" });
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
