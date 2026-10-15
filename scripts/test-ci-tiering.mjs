import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const workflow = fs.readFileSync(".github/workflows/ci.yml", "utf8").replace(/\r\n/g, "\n");
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

// Execute the actual checkout patterns against Git. Both jobs must keep all
// build/test inputs while excluding only the large raw evidence corpora.
const checkoutPatterns = (block) => {
  invariant(block.includes("sparse-checkout-cone-mode: false"), "evidence exclusions need non-cone sparse checkout");
  const match = block.match(/        sparse-checkout: \|\n((?:          [^\n]+\n)+)/);
  invariant(match, "checkout patterns missing");
  return match[1].split("\n").map(line => line.trim()).filter(Boolean);
};
const fastPatterns = checkoutPatterns(fastBlock);
const candidatePatterns = checkoutPatterns(candidateBlock);
invariant(JSON.stringify(fastPatterns) === JSON.stringify(candidatePatterns), "fast/candidate checkout inputs differ");
const tempRoot = fs.realpathSync(os.tmpdir());
const probe = fs.mkdtempSync(path.join(tempRoot, "narro-ci-checkout-"));
try {
  const required = ["package.json", "src/card.tsx", "src-tauri/src/lib.rs", "src-tauri/icons/icon.ico",
    "scripts/check.mjs", "tests/visual-fixtures/dark.json", "assets/branding/logo.png",
    "docs/M7_AUTOMATIC_VALIDATION_LOGGING.md", ".github/workflows/ci.yml", "focus-editor-fixture.html"];
  const excluded = ["work-log/evidence/clip.mp4", "reference/original-blitzit-screenshots/source.png"];
  for (const file of [...required, ...excluded]) {
    const target = path.join(probe, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, "fixture\n");
  }
  const git = (...args) => execFileSync("git", args, { cwd: probe, stdio: ["pipe", "pipe", "pipe"] });
  git("init", "--quiet");
  git("add", ".");
  git("-c", "user.name=Narro test", "-c", "user.email=narro-test@localhost", "-c", "commit.gpgsign=false", "commit", "--quiet", "-m", "fixture");
  execFileSync("git", ["sparse-checkout", "set", "--no-cone", "--stdin"], {
    cwd: probe, input: fastPatterns.join("\n") + "\n", stdio: ["pipe", "pipe", "pipe"],
  });
  for (const file of required) invariant(fs.existsSync(path.join(probe, file)), "checkout excluded required input " + file);
  for (const file of excluded) invariant(!fs.existsSync(path.join(probe, file)), "checkout retained raw evidence " + file);
} finally {
  invariant(path.dirname(fs.realpathSync(probe)) === tempRoot, "temporary checkout escaped its intended directory");
  fs.rmSync(probe, { recursive: true, force: true });
}

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
    && !fastBlock.includes("tauri:physical-ci")
    && !fastBlock.includes("tauri:diagnostic-ci"),
  "fast-gate must not perform expensive Windows visual/release work",
);

for (const required of [
  "needs: [validation-gate, fast-gate]",
  "needs.fast-gate.result == 'success'",
  "runs-on: windows-latest",
  "actions/download-artifact@v4",
  "narro-fast-frontend-dist",
  "npm run prepare:icons",
  "npm run check:rust",
  "npm run check:rust:clippy",
  "npm run test:rust",
  "npm run test:performance-harness",
  "npm run test:visual-regression:windows",
  "npm run tauri:ci",
  "npm run tauri:physical-ci",
  "Verify Physical Validation Build",
  "narro-m7-physical-windows-x64",
  "npm run tauri:diagnostic-ci",
  "narro-m1-diagnostic-windows-x64",
]) {
  invariant(candidateBlock.includes(required), `windows-candidate is missing ${required}`);
}

const packagingPrepIndex = candidateBlock.indexOf("npm run prepare:icons");
const rustCheckIndex = candidateBlock.indexOf("npm run check:rust");
const visualIndex = candidateBlock.indexOf("npm run test:visual-regression:windows");
const releaseIndex = candidateBlock.indexOf("npm run tauri:ci");
const physicalIndex = candidateBlock.indexOf("npm run tauri:physical-ci");
const diagnosticIndex = candidateBlock.indexOf("npm run tauri:diagnostic-ci");
invariant(
  packagingPrepIndex >= 0
    && rustCheckIndex > packagingPrepIndex
    && visualIndex > rustCheckIndex
    && releaseIndex > visualIndex
    && physicalIndex > releaseIndex
    && diagnosticIndex > physicalIndex,
  "candidate ordering must regenerate packaging icons, validate Rust, capture visuals, package production artifacts, then build diagnostics",
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
