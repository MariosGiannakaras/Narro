import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDirectory = path.resolve(root, process.argv[2] ?? "artifacts/visual-regression");
const themes = ["light", "dark"];

function invariant(condition, message) {
  if (!condition) throw new Error(`Visual fixture validation failed: ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

for (const theme of themes) {
  const screenshotPath = path.join(outputDirectory, `${theme}.png`);
  const domPath = path.join(outputDirectory, `${theme}.html`);
  const baselinePath = path.join(root, "tests", "visual-fixtures", `${theme}.json`);

  invariant(fs.existsSync(screenshotPath), `${theme} screenshot is missing`);
  invariant(fs.statSync(screenshotPath).size > 10_000, `${theme} screenshot is unexpectedly small`);

  const pngHeader = fs.readFileSync(screenshotPath).subarray(0, 8);
  invariant(pngHeader.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), `${theme} capture is not a PNG`);

  const dom = fs.readFileSync(domPath, "utf8");
  invariant(dom.includes('data-visual-fixture-ready="true"'), `${theme} fixture did not report ready state`);

  const match = dom.match(/<script id="visual-contract" type="application\/json">([\s\S]*?)<\/script>/);
  invariant(match, `${theme} visual contract was not present in captured DOM`);

  const actual = JSON.parse(match[1]);
  const expected = readJson(baselinePath);
  invariant(stableJson(actual) === stableJson(expected), `${theme} geometry/style contract differs from baseline\nExpected: ${JSON.stringify(expected, null, 2)}\nActual: ${JSON.stringify(actual, null, 2)}`);
}

console.log("Captured visual fixture contracts: PASS");
