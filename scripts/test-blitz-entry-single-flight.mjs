import assert from "node:assert/strict";
import fs from "node:fs";
const button = fs.readFileSync("src/BlitzEntryButton.tsx", "utf8");
const start = button.indexOf("  const handleStart = async () => {");
const end = button.indexOf("  return (", start);
assert(start >= 0 && end > start, "real Blitz event handler is required");
const code = button.slice(start, end);
assert(button.includes("const startInFlightRef = useRef(false);"));
assert(code.includes("if (pending || startInFlightRef.current) return;")
  && code.indexOf("startInFlightRef.current = true;") < code.indexOf("const outcome = await startBlitz();")
  && code.indexOf("startInFlightRef.current = true;") > code.indexOf("if (pending || startInFlightRef.current) return;"),
"Sync exclusion must precede authoritative StartBlitz");
assert(code.indexOf("await presentFocusForBlitz(reducedMotion);") > code.indexOf("const outcome = await startBlitz();"));
assert(code.includes("Focus session is active, but the Focus Panel could not be shown."));
assert(code.includes("} finally {\n      startInFlightRef.current = false;"), "owner must release on every exit");

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes,no)=>{resolve=yes;reject=no;});
  return {promise,resolve,reject};
}
function createEntry() {
  let busy = false;
  return {
    busy: () => busy,
    async click(startCommand, presentation) {
      if (busy) return "blocked";
      busy = true;
      try {
        const result = await startCommand();
        if (result === "no_eligible") return "no_eligible";
        try { await presentation(); return "shown"; }
        catch { return "committed_no_view"; }
      } finally { busy = false; }
    },
  };
}
const entry = createEntry(), save = deferred(), morph = deferred();
let started = 0, presented = 0;
const first = entry.click(async () => { await save.promise; started++; return "started"; },
  async () => { presented++; await morph.promise; });
assert.equal(await entry.click(async()=>{started++;},async()=>{presented++;}),"blocked");
save.resolve();
await Promise.resolve();await Promise.resolve();
assert.equal(started,1);
assert.equal(presented,1);
assert.equal(await entry.click(async()=>{started++;},async()=>{presented++;}),"blocked",
  "hold exclusion through native presentation, not only persisted start");
morph.resolve();
assert.equal(await first,"shown");
assert.equal(entry.busy(),false);
assert.equal(started,1); assert.equal(presented,1);
assert.equal(await entry.click(async()=>"no_eligible",async()=>{presented++;}),"no_eligible");
assert.equal(presented,1);
const failed = deferred();
const rejected = entry.click(async()=>{await failed.promise;return "started";},async()=>{presented++;});
assert.equal(await entry.click(async()=>"started",async()=>{}),"blocked");
failed.reject(new Error("start IPC offline"));
await assert.rejects(rejected,/start IPC offline/);
assert.equal(entry.busy(),false);
assert.equal(await entry.click(async()=>"already_active",async()=>{throw new Error("host unavailable");}),"committed_no_view");
assert.equal(entry.busy(),false);
console.log("Blitz entry single-flight native handoff and recovery passed.");
