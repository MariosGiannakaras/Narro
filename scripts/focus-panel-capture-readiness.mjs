import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const READY_MARKER = 'data-focus-panel-fixture-ready="true"';
const CONTRACT_PATTERN = /<script id="focus-panel-visual-contract" type="application\/json">([\s\S]*?)<\/script>/;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

/**
 * Distinguish an incomplete browser capture from a rendered product error.
 * The existing strict visual/pixel validators still decide acceptance.
 */
export function inspectFocusPanelCapture({ html, png, theme, scenario }) {
  if (typeof html !== "string" || !html.includes(READY_MARKER)) {
    return { status: "retry", reason: "React fixture has not reported ready" };
  }
  const match = html.match(CONTRACT_PATTERN);
  if (!match) return { status: "fail", reason: "ready fixture is missing its JSON contract" };
  let contract;
  try {
    contract = JSON.parse(match[1]);
  } catch {
    return { status: "fail", reason: "ready fixture contains invalid JSON contract" };
  }
  if (typeof contract !== "object" || contract === null || Array.isArray(contract)) {
    return { status: "fail", reason: "ready fixture contract is not an object" };
  }
  if (contract.error) {
    return { status: "fail", reason: "React fixture error: " + String(contract.error).slice(0, 300) };
  }
  if (contract.theme !== theme || contract.scenario !== scenario) {
    return { status: "fail", reason: "fixture identity mismatch: expected " + theme + "/" + scenario + ", got " + String(contract.theme) + "/" + String(contract.scenario) };
  }
  if (!Buffer.isBuffer(png) || png.length < 10_000) {
    return { status: "retry", reason: "screenshot is missing or was taken before visual paint" };
  }
  if (png.length < 24 || !png.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { status: "fail", reason: "screenshot is not a PNG" };
  }
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width !== 420 || height !== 720) {
    return { status: "fail", reason: "unexpected screenshot dimensions: " + width + "x" + height };
  }
  return { status: "ready", reason: "React fixture and screenshot are ready for strict visual validation" };
}

function run(argv) {
  if (argv.length !== 4) {
    console.error("Usage: node scripts/focus-panel-capture-readiness.mjs <html> <png> <theme> <scenario>");
    return 2;
  }
  const [htmlPath, pngPath, theme, scenario] = argv;
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf8") : "";
  const png = fs.existsSync(pngPath) ? fs.readFileSync(pngPath) : null;
  const result = inspectFocusPanelCapture({ html, png, theme, scenario });
  const message = result.status + ": " + theme + "/" + scenario + ": " + result.reason;
  if (result.status === "ready") {
    console.log(message);
    return 0;
  }
  if (result.status === "retry") {
    console.warn(message);
    return 75;
  }
  console.error(message);
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = run(process.argv.slice(2));
}
