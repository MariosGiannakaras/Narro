import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const srcRoot = path.join(root, "src");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r\n/g, "\n");

function rendererSources(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return rendererSources(absolute);
    if (!entry.isFile() || !entry.name.endsWith(".tsx") || /fixture/i.test(entry.name)) return [];
    return [absolute];
  });
}

function relativePath(absolute) {
  return path.relative(root, absolute).split(path.sep).join("/");
}

const excludedControlTerms = [
  ["account control", /\baccount\b/i],
  ["trial control", /\btrial\b/i],
  ["upgrade control", /\bupgrade\b/i],
  ["profile identity control", /\bprofile\b/i],
  ["avatar identity control", /\bavatar\b/i],
  ["integration control", /\bintegrations?\b/i],
  ["billing control", /\bbilling\b/i],
  ["subscription control", /\bsubscriptions?\b/i],
  ["cloud control", /\bcloud\b/i],
  ["Blitzy/AI source-product control", /\bblitzy\b/i],
  ["AI assistant control", /\bAI\s+(?:assistant|agent|control)\b/i],
  ["sign-in control", /\bsign[ -]?in\b/i],
  ["login control", /\b(?:log[ -]?in|login)\b/i],
];

const violations = [];
for (const absolute of rendererSources(srcRoot)) {
  const source = fs.readFileSync(absolute, "utf8").replace(/\r\n/g, "\n");
  for (const [label, pattern] of excludedControlTerms) {
    const match = pattern.exec(source);
    if (!match) continue;
    const line = source.slice(0, match.index).split("\n").length;
    violations.push(`${relativePath(absolute)}:${line} contains excluded ${label}: ${JSON.stringify(match[0])}`);
  }
}

if (violations.length > 0) {
  throw new Error(`Excluded service/account controls must be omitted, not stubbed:\n${violations.join("\n")}`);
}

const shell = read("src/AppShell.tsx");
const app = read("src/App.tsx");

for (const [needle, label] of [
  ['label="Search"', "Search utility"],
  ['label="Settings"', "Settings utility"],
  ['label="Reports"', "Reports navigation"],
]) {
  if (!shell.includes(needle)) {
    throw new Error(`Exclusion cleanup must preserve the local ${label}: ${needle}`);
  }
}

if (!app.includes('get("diagnostics") === "1"')) {
  throw new Error("Exclusion cleanup must preserve the explicit ?diagnostics=1 gate.");
}

console.log("Excluded service/account control absence checks passed.");
