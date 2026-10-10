import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Use the REAL ReportsSessions post-mutation callback body, not an imitation
// latest-wins gate. Filter effects and after-mutation refreshes are independent
// async producers and must share one request/revision acceptance condition.
const source = fs.readFileSync("src/ReportsSessions.tsx", "utf8");
const startMarker = "  const refreshSessions = useCallback(async () => {";
const endMarker = "\n  }, [currentRequest]);";
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
assert(start >= 0 && end > start, "production ReportsSessions refresh handler missing");
const inner = source.slice(start + startMarker.length, end);
const handlerScript = ts.transpileModule(
  "const refreshSessions = async () => {" + inner + "\n}; refreshSessions;",
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;

for (const [needle, message] of [
  ["useLayoutEffect(() => {\n    latestSessionsQueryKeyRef.current = sessionsQueryKey;", "the committed filter identity must be published before passive reads"],
  ["const revision = ++sessionsReadSequenceRef.current;", "all report read producers must share a revision clock"],
  ["if (disposed || revision !== sessionsReadSequenceRef.current", "the normal filter effect must reject stale completions"],
  ["key !== latestSessionsQueryKeyRef.current) setRefreshError", "stale filter read failure must not replace newer error state"],
]) {
  assert(source.includes(needle), message);
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
function createHarness() {
  const a = { startDate: "2026-10-01", endDate: "2026-10-07", listIds: ["list-A"], showBreakSessions: true };
  const b = { ...a, listIds: ["list-B"] };
  const keyRef = { current: JSON.stringify(a) };
  const revisionRef = { current: 0 };
  const reads = [];
  const published = [];
  const errors = [];
  const getReportSessions = (request) => {
    const next = deferred();
    reads.push({ request, ...next });
    return next.promise;
  };
  const makeHandler = (request) => vm.runInNewContext(handlerScript, {
    currentRequest: () => request,
    latestSessionsQueryKeyRef: keyRef,
    sessionsReadSequenceRef: revisionRef,
    getReportSessions,
    setSessions: (payload) => published.push(payload.id),
    setRefreshError: (error) => errors.push(error),
  });
  return { a, b, keyRef, revisionRef, reads, published, errors,
    aHandler: makeHandler(a), bHandler: makeHandler(b) };
}
// A mutation refresh starts for old list A, then user selects B and its
// request returns first. The slower old A result must not overwrite B.
{
  const h = createHarness();
  const old = h.aHandler();
  assert.equal(h.reads.length, 1);
  h.keyRef.current = JSON.stringify(h.b);
  const fresh = h.bHandler();
  assert.equal(h.reads.length, 2);
  h.reads[1].resolve({ id: "filtered-B" });
  assert.equal((await fresh).id, "filtered-B");
  h.reads[0].resolve({ id: "stale-A" });
  assert.equal(await old, null);
  assert.deepEqual(h.published, ["filtered-B"]);
  assert.equal(h.errors.length, 1);
}
// A stale render's post-mutation closure must not even request old A *after*
// newer B is committed, much less win by incrementing the shared revision.
{
  const h = createHarness();
  h.keyRef.current = JSON.stringify(h.b);
  assert.equal(await h.aHandler(), null);
  assert.equal(h.reads.length, 0);
  assert.equal(h.revisionRef.current, 0);
  const next = h.bHandler();
  h.reads[0].resolve({ id: "filtered-B" });
  assert.equal((await next).id, "filtered-B");
  assert.deepEqual(h.published, ["filtered-B"]);
}
// Even identical filter requests must accept only the newest completion.
{
  const h = createHarness();
  const first = h.aHandler(), second = h.aHandler();
  h.reads[1].resolve({ id: "newer-A" });
  await second;
  h.reads[0].resolve({ id: "older-A" });
  assert.equal(await first, null);
  assert.deepEqual(h.published, ["newer-A"]);
}
// If newest request fails, its failure is surfaced; owner stays usable on retry.
{
  const h = createHarness();
  const failed = h.aHandler();
  h.reads[0].reject(new Error("native report read unavailable"));
  await assert.rejects(failed, /native report read unavailable/);
  const retry = h.aHandler();
  h.reads[1].resolve({ id: "retried-A" });
  assert.equal((await retry).id, "retried-A");
  assert.deepEqual(h.published, ["retried-A"]);
}
console.log("ReportsSessions actual handler: stale filter, stale render, same-query inversion, failure retry PASSED.");
