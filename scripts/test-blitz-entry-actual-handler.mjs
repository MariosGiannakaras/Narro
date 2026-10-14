import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise the REAL production handler body, not an independently written
// mutex model. The React pending value intentionally stays stale across
// same-render calls, while the production ref and delayed IPC are shared.
const source = fs.readFileSync("src/BlitzEntryButton.tsx", "utf8").replace(/\r\n/g, "\n");
const begin = source.indexOf("  const handleStart = async () => {");
const end = source.indexOf("\n  return (\n", begin);
assert(begin >= 0 && end > begin, "Missing production Blitz handleStart callback");
const handlerSource = source.slice(begin, end);
assert(handlerSource.includes("startInFlightRef.current = true;")
  && handlerSource.indexOf("startInFlightRef.current = true;")
  < handlerSource.indexOf("const outcome = await startBlitz();"),
  "Production owner must claim BEFORE authoritative IPC");
assert(handlerSource.includes("} finally {\n      startInFlightRef.current = false;"),
  "Production handler must release owner on every outcome");
const executable = ts.transpileModule(
  `(() => {\n${handlerSource}\nreturn handleStart;\n})()`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } },
).outputText;

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function harness({ start, present, reduced = false } = {}) {
  const calls = { start: 0, present: 0, reducedFlags: [], pending: [], statuses: [], errors: [] };
  const ctx = {
    pending: false, // stale value from the SAME React render
    startInFlightRef: { current: false },
    setPending: value => calls.pending.push(value),
    setStatus: value => calls.statuses.push(value),
    setError: value => calls.errors.push(value),
    startBlitz: async () => {
      calls.start++;
      return start ? await start() : { status: "started" };
    },
    presentFocusForBlitz: async motion => {
      calls.present++;
      calls.reducedFlags.push(motion);
      if (present) await present(motion);
    },
    formatInvokeError: error => String(error?.message ?? error),
    window: { matchMedia: query => {
      assert.equal(query, "(prefers-reduced-motion: reduce)");
      return { matches: reduced };
    } },
  };
  const handleStart = vm.runInNewContext(executable, ctx, { timeout: 3000 });
  return { ctx, calls, handleStart };
}
async function withTimeout(promise, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(
      () => reject(new Error(`Timed out awaiting actual Blitz handler: ${label}`)), 2_000,
    )),
  ]);
}

// Same-render double Start is excluded BEFORE start IPC resolves; the
// exclusive owner survives the committed session through native presentation.
{
  const ipc = deferred(), morph = deferred(), enteredMorph = deferred();
  const h = harness({
    reduced: true,
    start: () => ipc.promise,
    present: motion => { enteredMorph.resolve(motion); return morph.promise; },
  });
  const first = h.handleStart();
  await h.handleStart();
  assert.equal(h.calls.start, 1, "A second same-render handler must not persist another Start");
  assert.equal(h.calls.present, 0);
  ipc.resolve({ status: "started" });
  assert.equal(await withTimeout(enteredMorph.promise, "native presentation reached"), true);
  assert.equal(h.calls.present, 1);
  await h.handleStart();
  assert.equal(h.calls.start, 1, "The owner must remain held while native morph is pending");
  assert.equal(h.ctx.startInFlightRef.current, true);
  morph.resolve();
  await first;
  assert.equal(h.ctx.startInFlightRef.current, false);
  assert.deepEqual(h.calls.pending, [true, false]);
  assert(h.calls.statuses.includes("Blitz started."));
  assert.deepEqual(h.calls.reducedFlags, [true]);
}

// No eligible tasks MUST NOT open native Focus and must release for a valid
// later user command. Already-active is a committed session and may present.
{
  let attempts = 0;
  const h = harness({ start: async () =>
    ++attempts === 1
      ? { status: "no_eligible_today_tasks" }
      : { status: "already_active" },
  });
  await h.handleStart();
  assert.equal(h.calls.present, 0);
  assert(h.calls.statuses.includes("No eligible Today task is ready yet."));
  assert.equal(h.ctx.startInFlightRef.current, false);
  await h.handleStart();
  assert.equal(h.calls.start, 2);
  assert.equal(h.calls.present, 1);
  assert(h.calls.statuses.includes("Blitz is already active."));
  assert.deepEqual(h.calls.reducedFlags, [false]);
  assert.equal(h.ctx.startInFlightRef.current, false);
}

// A rejected authoritative Start permits retry; a committed Start whose
// native Focus window cannot be shown must NOT claim persistence failed.
{
  let attempts = 0;
  const h = harness({
    start: async () => {
      if (++attempts === 1) throw new Error("start IPC unavailable");
      return { status: "started" };
    },
    present: async () => { throw new Error("native panel unavailable"); },
  });
  await h.handleStart();
  assert.match(String(h.calls.errors.at(-1)), /Blitz could not start.*start IPC unavailable/);
  assert.equal(h.calls.present, 0);
  assert.equal(h.ctx.startInFlightRef.current, false);
  await h.handleStart();
  assert.equal(h.calls.start, 2);
  assert.equal(h.calls.present, 1);
  assert.match(String(h.calls.errors.at(-1)),
    /Focus session is active, but the Focus Panel could not be shown.*native panel unavailable/);
  assert(h.calls.statuses.includes("Blitz started."));
  assert.equal(h.ctx.startInFlightRef.current, false);
  assert.deepEqual(h.calls.pending, [true, false, true, false]);
}
console.log("Actual Blitz entry handler: same-render exclusion, committed morph, no-eligible and retry passed.");
