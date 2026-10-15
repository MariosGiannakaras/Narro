import assert from "node:assert/strict";
import { waitForOwnedBlankPage } from "./edgeCdpPageReadiness.mjs";

const target = { type: "page", url: "about:blank", webSocketDebuggerUrl: "ws://127.0.0.1:1/owned" };
function environment(listPages, isAlive = () => true) {
  let time = 0;
  return { listPages, isAlive, now: () => time, sleep: async (ms) => { time += ms; }, deadline: 200 };
}
let reads = 0;
assert.equal(await waitForOwnedBlankPage(environment(async () => ++reads < 3 ? [] : [target])), target.webSocketDebuggerUrl);
assert.equal(reads, 3, "port-before-page startup must await actual target");
reads = 0;
assert.equal(await waitForOwnedBlankPage(environment(async () => {
  if (++reads === 1) throw Object.assign(new Error("server starting"), { cause: { code: "ECONNREFUSED" } });
  return [target];
})), target.webSocketDebuggerUrl);
await assert.rejects(waitForOwnedBlankPage(environment(async () => [target, { ...target }])), /ambiguous/);
await assert.rejects(waitForOwnedBlankPage(environment(async () => [target], () => false)), /exited/);
await assert.rejects(waitForOwnedBlankPage(environment(async () => [{ ...target, url: "https://unrelated.invalid" }])) , /deadline/);
await assert.rejects(waitForOwnedBlankPage(environment(async () => { throw new SyntaxError("malformed debugger JSON"); })), /malformed debugger JSON/);
console.log("Ready-fixture port/target race, ownership, exit, deadline and unexpected-error boundaries: 6/6 PASS.");
