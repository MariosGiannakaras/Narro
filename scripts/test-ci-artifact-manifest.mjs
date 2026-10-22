import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { buildArtifactManifest, writeArtifactManifest } from "./write-ci-artifact-manifest.mjs";

const root = mkdtempSync(join(tmpdir(), "narro-artifact-provenance-"));
const sourceSha = "a".repeat(40);
const options = { root, sourceSha, runId: "39662181572", attempt: "2" };
function seed(relative, content) {
  const destination = join(root, relative);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, content);
  return destination;
}
try {
  const bundleExe = seed("src-tauri/target-physical/release/narro.exe", "physical exe");
  seed("src-tauri/target-physical/release/bundle/nsis/Narro_0.1.exe", "nsis installer");
  seed("src-tauri/target-physical/release/bundle/msi/Narro_0.1.msi", "msi installer");
  seed("artifacts/m7-validation/narro-m7-validation.exe", "m7 exe");
  seed("artifacts/m7-validation/README-M7-VALIDATION.md", "m7 provenance doc");
  seed("src-tauri/target/release/narro.exe", "diagnostic exe");
  for (const relative of [
    "scripts/measure-floating.ps1",
    "scripts/run-m1-floating-performance-batch.ps1",
    "scripts/verify-m1-floating-performance-scenario.ps1",
    "docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md",
    "docs/M1_WINDOWS_RUNTIME_VALIDATION.md",
    "docs/M1_DISPLAY_TOPOLOGY_VALIDATION.md",
  ]) seed(relative, "diagnostic helper");

  const physical = buildArtifactManifest("physical", options);
  assert.equal(physical.schema, "narro-ci-artifact-provenance/v1");
  assert.equal(physical.sourceSha, sourceSha);
  assert.equal(physical.githubRunId, options.runId);
  assert.equal(physical.githubRunAttempt, 2);
  assert.equal(physical.files.length, 3, "physical upload requires EXE, MSI, NSIS");
  assert.deepEqual(physical.files.map(file => file.path), [...physical.files.map(file => file.path)].sort((a,b) => a.localeCompare(b,"en")));
  assert.equal(physical.files.find(x => x.path.endsWith("/release/narro.exe")).sha256,
    createHash("sha256").update(readFileSync(bundleExe)).digest("hex"));
  assert.ok(physical.files.every(f => f.bytes > 0 && /^[0-9a-f]{64}$/.test(f.sha256)));
  assert.equal(buildArtifactManifest("validation", options).files.length, 2);
  assert.equal(buildArtifactManifest("diagnostic", options).files.length, 7);

  const manifestPath = writeArtifactManifest("physical", options);
  assert.equal(readFileSync(manifestPath, "utf8"), JSON.stringify(physical, null, 2) + "\n",
    "published identity must be deterministic and machine-readable");

  const oldHash = physical.files.find(x => x.path.endsWith("/release/narro.exe")).sha256;
  writeFileSync(bundleExe, "different binary contents");
  assert.notEqual(buildArtifactManifest("physical", options).files.find(x => x.path.endsWith("/release/narro.exe")).sha256,
    oldHash, "binary changes must change the fingerprint");

  rmSync(join(root, "src-tauri/target-physical/release/bundle/msi/Narro_0.1.msi"));
  assert.throws(() => buildArtifactManifest("physical", options), /missing required \.msi bundle/);
  assert.throws(() => buildArtifactManifest("physical", { ...options, sourceSha: "unknown" }), /40-hex source/);
  assert.throws(() => buildArtifactManifest("physical", { ...options, runId: "0" }), /positive GitHub Actions run ID/);
  assert.throws(() => buildArtifactManifest("physical", { ...options, attempt: "bad" }), /positive GitHub Actions run attempt/);
  assert.throws(() => buildArtifactManifest("unknown", options), /Unsupported CI artifact family/);
  rmSync(join(root, "artifacts/m7-validation/narro-m7-validation.exe"));
  assert.throws(() => buildArtifactManifest("validation", options), /ENOENT/);
  seed("artifacts/m7-validation/narro-m7-validation.exe", "");
  assert.throws(() => buildArtifactManifest("validation", options), /Empty or non-file/);
  console.log("CI artifact provenance manifest source identity, binary hashes, Windows bundles, fail-closed and deterministic format: PASS");
} finally {
  rmSync(root, { recursive: true, force: true });
}
