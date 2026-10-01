import fs from "node:fs";

const workflow = fs.readFileSync(".github/workflows/ci.yml", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

function invariant(condition, message) {
  if (!condition) throw new Error(`CI tiering contract failed: ${message}`);
}

const validationIndex = workflow.indexOf("  validation-gate:");
const fastIndex = workflow.indexOf("  fast-gate:");
const candidateIndex = workflow.indexOf("  windows-candidate:");

invariant(validationIndex >= 0, "validation-gate job is missing");
invariant(fastIndex > validationIndex, "fast-gate must follow the dedup validation gate");
invariant(candidateIndex > fastIndex, "windows-candidate must follow the fast gate");

const fastBlock = workflow.slice(fastIndex, candidateIndex);
const candidateBlock = workflow.slice(candidateIndex);

for (const required of [
  "runs-on: ubuntu-latest",
  "npm run preflight:frontend",
  "npm run check:rust:fmt",
  "narro-fast-frontend-dist",
  "retention-days: 1",
]) {
  invariant(fastBlock.includes(required), `fast-gate is missing ${required}`);
}

invariant(
  !fastBlock.includes("test:visual-regression:windows")
    && !fastBlock.includes("tauri:ci")
    && !fastBlock.includes("tauri:physical-ci"),
  "fast-gate must not perform expensive Windows visual/release work",
);

for (const required of [
  "needs: [validation-gate, fast-gate]",
  "needs.fast-gate.result == 'success'",
  "runs-on: windows-latest",
  "actions/download-artifact@v4",
  "narro-fast-frontend-dist",
  "npm run check:rust",
  "npm run check:rust:clippy",
  "npm run test:rust",
  "npm run test:performance-harness",
  "npm run test:visual-regression:windows",
  "npm run tauri:ci",
  "npm run tauri:physical-ci",
  "Verify Physical Validation Build",
  "narro-m7-physical-windows-x64",
]) {
  invariant(candidateBlock.includes(required), `windows-candidate is missing ${required}`);
}

const rustCheckIndex = candidateBlock.indexOf("npm run check:rust");
const visualIndex = candidateBlock.indexOf("npm run test:visual-regression:windows");
const releaseIndex = candidateBlock.indexOf("npm run tauri:ci");
const physicalIndex = candidateBlock.indexOf("npm run tauri:physical-ci");
invariant(
  rustCheckIndex >= 0 && visualIndex > rustCheckIndex && releaseIndex > visualIndex && physicalIndex > releaseIndex,
  "candidate ordering must validate Rust before visual capture and package only after those gates pass",
);

invariant(
  !candidateBlock.includes("npm run preflight\n")
    && !candidateBlock.includes("npm run preflight:frontend"),
  "windows-candidate must reuse the fast gate instead of repeating the full frontend/static suite",
);

invariant(
  packageJson.scripts?.["preflight:frontend"]?.includes("npm run test:ci-tiering"),
  "CI tiering contract must run in the fast frontend preflight",
);

console.log("CI fast/candidate tiering contracts passed.");
