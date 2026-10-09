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

test("recurrent Reports modal keyboard fixture is classified without logging arbitrary assertion text", () => {
  const message = "2026-10-09T11:30:19.5164327Z Reports fixture reports-sessions-detail-keyboard-light assertion: Detail Shift+Tab escaped the active modal.\\n" +
    "2026-10-09T11:30:19.5871738Z ##[error]Process completed with exit code 1.";
  const signal = signalFromLog(message);
  assert.equal(signal?.kind, "visual-fixture");
  assert.match(signal?.value || "", /^reports-sessions-detail-keyboard-light:[0-9a-f]{12}$/);
  assert.ok(!signal.value.includes("Shift+Tab"));
  assert.deepEqual(signal, signalFromLog(message.replace("2026-10-09T11:30:19.5164327Z", "2026-10-09T12:23:28.7998562Z")));
});

test("two independent Reports fixture failures recur, but differing assertions do not combine", () => {
  const a = signalFromLog("Reports fixture reports-sessions-detail-keyboard-light assertion: Detail Shift+Tab escaped the active modal.");
  const b = signalFromLog("Reports fixture reports-sessions-detail-keyboard-light assertion: Detail Tab escaped the active modal.");
  assert.notEqual(makeFingerprint("windows-candidate", "Capture Visual Regression Fixtures", a),
    makeFingerprint("windows-candidate", "Capture Visual Regression Fixtures", b));
  const fingerprint = makeFingerprint("windows-candidate", "Capture Visual Regression Fixtures", a);
  assert.equal(repeatGroups([
    { runId: 37921875076, attempt: 1, fingerprint },
    { runId: 37927679782, attempt: 1, fingerprint }
  ]).length, 1);
  assert.equal(signalFromLog("Reports fixture waiting for ready; retrying capture (1/8)."), null);
});
