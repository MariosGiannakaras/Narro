import test from "node:test";
import assert from "node:assert/strict";
import { signalFromLog, makeFingerprint, repeatGroups } from "./ci-learning.mjs";

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
