import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
let baselineActionWidth = null;
let baselineActionHeight = null;

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus action-slot visual validation failed: ${message}`);
}

function readContract(label) {
  const domPath = path.join(outputDirectory, `${label}.html`);
  invariant(fs.existsSync(domPath), `${label} DOM capture is missing`);
  const dom = fs.readFileSync(domPath, "utf8");
  const match = dom.match(/<script id="focus-panel-visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(match, `${label} geometry contract is missing`);
  invariant(dom.includes('aria-label="Live task actions"'), `${label} live action group is missing`);
  for (const action of ["break", "notes", "pause-resume", "skip", "extend", "done"]) {
    invariant(dom.includes(`data-focus-action="${action}"`), `${label} ${action} action is missing`);
  }
  const contract = JSON.parse(match[1]);
  invariant(contract.rowActionSlot?.width === 124, `${label} ordinary row action rail width differs from reserved 124px`);
  invariant(contract.rowActionSlot?.height === 28, `${label} ordinary row action rail height differs from reserved 28px`);
  return contract;
}

for (const label of [
  "focus-panel-light",
  "focus-panel-dark",
  "focus-panel-paused-metrics-light",
  "focus-panel-paused-metrics-dark",
]) {
  const contract = readContract(label);
  invariant(contract.actions?.width > 0, `${label} action-strip width is invalid`);
  invariant(contract.actions?.height >= 30, `${label} action-strip height is invalid`);
  if (baselineActionWidth === null) baselineActionWidth = contract.actions.width;
  if (baselineActionHeight === null) baselineActionHeight = contract.actions.height;
  invariant(
    contract.actions.width === baselineActionWidth,
    `${label} action-strip width ${contract.actions.width}px differs from baseline ${baselineActionWidth}px`,
  );
  invariant(
    contract.actions.height === baselineActionHeight,
    `${label} action-strip height ${contract.actions.height}px differs from baseline ${baselineActionHeight}px`,
  );
}

console.log("Focus action-slot visual geometry validated.");
