import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
let baseline = null;

function invariant(condition, message) {
  if (!condition) throw new Error(`Floating Timer visual validation failed: ${message}`);
}

function readCapture(theme) {
  const label = `floating-timer-${theme}`;
  const screenshot = path.join(outputDirectory, `${label}.png`);
  const domPath = path.join(outputDirectory, `${label}.html`);
  invariant(fs.existsSync(screenshot), `${label} screenshot is missing`);
  const png = fs.readFileSync(screenshot);
  invariant(png.length >= 24, `${label} PNG is incomplete`);
  invariant(png.subarray(0, 8).toString("hex") === "89504e470d0a1a0a", `${label} screenshot is not a PNG`);
  invariant(
    png.readUInt32BE(16) === 420 && png.readUInt32BE(20) === 240,
    `${label} screenshot must be 420x240`,
  );
  invariant(fs.existsSync(domPath), `${label} DOM capture is missing`);
  return { label, dom: fs.readFileSync(domPath, "utf8") };
}

function readContract(dom, label) {
  const match = dom.match(/<script id="floating-timer-visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(match, `${label} geometry contract is missing`);
  return JSON.parse(match[1]);
}

for (const theme of ["light", "dark"]) {
  const { label, dom } = readCapture(theme);

  for (const needle of [
    'data-floating-timer-fixture-ready="true"',
    'data-floating-timer="foundation"',
    'data-floating-live-state="running"',
    "Prepare BFCM strategy",
    'data-floating-live-timer="true"',
    'aria-label="Running: 38:00 remaining"',
    ">38:00<",
    'data-floating-subtask-progress="true"',
    'aria-label="1 of 4 subtasks complete"',
    ">1/4 Subtasks<",
    'data-floating-subtask-control="add"',
    'data-floating-subtask-control="expand"',
    'data-floating-return-to-panel="true"',
  ]) {
    invariant(dom.includes(needle), `${label} is missing ${needle}`);
  }

  const contract = readContract(dom, label);
  invariant(contract.theme === theme, `${label} contract theme differs`);
  invariant(
    contract.timer?.width === 340 && contract.timer?.height === 110,
    `${label} collapsed timer must be exactly 340x110`,
  );
  invariant(contract.heading?.height > 0, `${label} heading geometry is invalid`);
  invariant(contract.title?.width > 0, `${label} title geometry is invalid`);
  invariant(contract.liveTimer?.width >= 48, `${label} live timer geometry is invalid`);
  invariant(contract.subtaskToolbar?.height > 0, `${label} subtask toolbar geometry is invalid`);
  invariant(
    contract.subtaskRing?.width === 28 && contract.subtaskRing?.height === 28,
    `${label} subtask ring must be 28x28`,
  );
  for (const key of ["add", "expand", "returnToPanel"]) {
    invariant(
      contract[key]?.width === 32 && contract[key]?.height === 32,
      `${label} ${key} control must remain 32x32`,
    );
  }

  if (baseline === null) {
    baseline = contract;
  } else {
    for (const key of [
      "timer",
      "heading",
      "liveTimer",
      "subtaskToolbar",
      "subtaskRing",
      "add",
      "expand",
      "returnToPanel",
    ]) {
      invariant(
        contract[key].width === baseline[key].width && contract[key].height === baseline[key].height,
        `${label} ${key} geometry differs across themes`,
      );
    }
  }
}

console.log("Floating Timer collapsed light/dark visual contracts passed.");
