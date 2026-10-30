import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const workflow = fs.readFileSync(".github/workflows/ci.yml", "utf8").replace(/\r\n/g, "\n");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

function invariant(condition, message) {
  if (!condition) throw new Error(`CI tiering contract failed: ${message}`);
}

// Operator-preparation safety contract: a CI-green artifact may be used only
// in a disposable Windows profile, and private production AppData must never
// be copied merely by preparing a checklist.
const physicalPreparation = fs.readFileSync("scripts/prepare-m7-physical-session.ps1", "utf8");
for (const required of [
  '[switch]$BackupProductionData',
  'if ($BackupProductionData -and $productionRoamingDataExists) {',
  'if ($Launch -and $productionDataExists) {',
  '$productionDataExists = $productionRoamingDataExists -or $productionLocalDataExists',
  'if ($Launch -and [string]::IsNullOrWhiteSpace($ExpectedSha256)) {',
  'PA-01–PA-09 ACTIVE',
  'docs/CODEX_M5_M9_RECORDING_PACKET_2026-10-27.md',
]) invariant(physicalPreparation.includes(required),
  "physical session preparer missing user-data/exact-build guard: " + required);
invariant(
  /if \(\$BackupProductionData -and \$productionRoamingDataExists\) \{\s*Copy-Item -LiteralPath \$productionAppDataDir/.test(physicalPreparation),
  "production AppData copy must be explicitly opt-in",
);
invariant(
  !/if \(Test-Path \$productionAppDataDir -PathType Container\) \{\s*Copy-Item -LiteralPath \$productionAppDataDir/.test(physicalPreparation),
  "production AppData must never be copied by default",
);

// GitHub evaluates ordered positive/negative path patterns. Tracking-only
// Markdown must not launch expensive Windows CI; the docs actually shipped in
// validation artifacts must not be silently excluded.
const triggerBlock = workflow.slice(0, workflow.indexOf("\npermissions:"))
  .split("\n").filter(line => !line.trimStart().startsWith("#")).join("\n");
const requiredBundledDocs = [
  "docs/M7_AUTOMATIC_VALIDATION_LOGGING.md",
  "docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md",
  "docs/M1_WINDOWS_RUNTIME_VALIDATION.md",
  "docs/M1_DISPLAY_TOPOLOGY_VALIDATION.md",
];
for (const event of ["push", "pull_request"]) {
  const prefix = "  " + event + ":\n    branches: [ \"main\" ]\n    paths:\n"
    + '      - "**"\n      - "!**/*.md"\n';
  invariant(triggerBlock.includes(prefix), event + " must include source but exclude tracking Markdown");
  const start = triggerBlock.indexOf(prefix) + prefix.length;
  const nextEvent = event === "push" ? "pull_request" : "workflow_dispatch";
  const next = triggerBlock.indexOf("\n  " + nextEvent + ":", start);
  invariant(next >= 0, event + " trigger section is incomplete");
  const rules = triggerBlock.slice(start, next)
    .split("\n").map(line => line.trim()).filter(Boolean);
  invariant(rules.length === requiredBundledDocs.length,
    event + " must explicitly reinclude only bundled artifact Markdown");
  invariant(JSON.stringify(rules) === JSON.stringify(requiredBundledDocs.map(path => '- "' + path + '"')),
    event + " must reinclude every bundled artifact Markdown after the exclusion");
}
invariant(!triggerBlock.includes("paths-ignore:"), "CI triggers cannot blanket-ignore packaged Markdown");

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

const focusUpload = candidateBlock.slice(
  candidateBlock.indexOf("    - name: Upload Packaged Focus Runtime Visual Artifact"),
  candidateBlock.indexOf("    - name: Build Physical Validation Release"),
);
invariant(focusUpload.includes("if: success()") && focusUpload.includes("if-no-files-found: error"),
  "successful packaged Focus captures must fail if the required artifact is missing");
invariant(focusUpload.includes("if: failure()") && focusUpload.includes("if-no-files-found: warn")
  && focusUpload.includes("narro-m7-focus-runtime-failure-diagnostics"),
  "upstream Focus failures must not create a secondary missing-file failure");

// Every package uploaded for physical/native acceptance must carry a
// source SHA, GitHub run identity and content hash manifest. Never accept
// an empty required binary or a missing MSI/NSIS bundle as a green upload.
for (const [kind, artifactName, manifest] of [
  ["physical", "narro-m7-physical-windows-x64", "physical.json"],
  ["validation", "narro-m7-validation-windows-x64", "validation.json"],
  ["diagnostic", "narro-m1-diagnostic-windows-x64", "diagnostic.json"],
]) {
  const generate = candidateBlock.indexOf("node scripts/write-ci-artifact-manifest.mjs " + kind);
  const upload = candidateBlock.indexOf("name: " + artifactName);
  const path = candidateBlock.indexOf("artifacts/ci-provenance/" + manifest);
  invariant(generate >= 0 && path > generate && upload > generate,
    kind + " must generate identity before its artifact upload");
  invariant(path > upload, kind + " upload must include its own provenance manifest");
}
invariant(candidateBlock.includes("NARRO_CI_SOURCE_SHA:")
  && candidateBlock.includes("if ($LASTEXITCODE -ne 0) { throw"),
  "CI must pass an exact source SHA and fail immediately for manifest errors");
invariant(packageJson.scripts?.["test:ci-artifact-manifest"] === "node scripts/test-ci-artifact-manifest.mjs"
  && packageJson.scripts?.["preflight:frontend"]?.includes("npm run test:ci-artifact-manifest"),
  "CI artifact manifest positive/negative tests must run in the fast gate");

invariant(
  packageJson.scripts?.["preflight:frontend"]?.includes("npm run test:ci-tiering"),
  "CI tiering contract must run in the fast frontend preflight",
);

console.log("CI fast/candidate tiering contracts passed.");
