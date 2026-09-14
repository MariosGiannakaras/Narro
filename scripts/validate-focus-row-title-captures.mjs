import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
let baselineLongTitleHeight = null;
let baselineLongRowWidth = null;

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus row-title visual validation failed: ${message}`);
}

function readCapture(label) {
  const domPath = path.join(outputDirectory, `${label}.html`);
  invariant(fs.existsSync(domPath), `${label} DOM capture is missing`);
  return fs.readFileSync(domPath, "utf8");
}

function readContract(dom, label) {
  const match = dom.match(/<script id="focus-panel-visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(match, `${label} geometry contract is missing`);
  return JSON.parse(match[1]);
}

for (const label of [
  "focus-panel-light",
  "focus-panel-dark",
  "focus-panel-paused-metrics-light",
  "focus-panel-paused-metrics-dark",
]) {
  const dom = readCapture(label);
  invariant(
    dom.includes("Plan weekend errands and confirm the pickup route before leaving home"),
    `${label} overflowing ordinary title fixture is missing`,
  );
  invariant(dom.includes('data-focus-task-title="true"'), `${label} ordinary title marker is missing`);
  invariant(dom.includes('tabindex="0"'), `${label} ordinary title keyboard focus target is missing`);
  invariant(dom.includes('role="tooltip"'), `${label} accessible full-title tooltip is missing`);

  const contract = readContract(dom, label);
  invariant(contract.longRow?.width > 0 && contract.longRow?.height > 0, `${label} long ordinary row geometry is invalid`);
  invariant(contract.longTitle?.width > 0, `${label} long ordinary title width is invalid`);
  invariant(
    contract.longTitle?.height >= 32 && contract.longTitle?.height <= 48,
    `${label} long ordinary title height ${contract.longTitle?.height}px does not represent a compact two-line title`,
  );
  invariant(contract.longTitle?.lineClamp === "2", `${label} computed line clamp is ${contract.longTitle?.lineClamp}; expected 2`);
  invariant(contract.longTitle?.whiteSpace === "normal", `${label} long ordinary title must wrap with normal white-space`);
  invariant(contract.longTitle?.overflow === "hidden", `${label} long ordinary title overflow must remain hidden after two lines`);
  invariant(contract.longTitle?.tabIndex === 0, `${label} long ordinary title must remain keyboard focusable`);
  invariant(Boolean(contract.longTitle?.describedBy), `${label} long ordinary title must be associated with tooltip content`);
  invariant(
    contract.longRow.height > contract.firstRow.height,
    `${label} long title row must grow vertically instead of compressing the title back to one line`,
  );
  invariant(
    contract.longRow.width === contract.firstRow.width,
    `${label} long title must not change ordinary row width or horizontal geometry`,
  );

  if (baselineLongTitleHeight === null) baselineLongTitleHeight = contract.longTitle.height;
  invariant(
    contract.longTitle.height === baselineLongTitleHeight,
    `${label} long title height ${contract.longTitle.height}px differs from baseline ${baselineLongTitleHeight}px`,
  );
  if (baselineLongRowWidth === null) baselineLongRowWidth = contract.longRow.width;
  invariant(
    contract.longRow.width === baselineLongRowWidth,
    `${label} long row width ${contract.longRow.width}px differs from baseline ${baselineLongRowWidth}px`,
  );
}

console.log("Focus ordinary row-title visual captures validated.");
