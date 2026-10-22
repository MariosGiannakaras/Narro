#!/usr/bin/env node
// Immutable per-run identities for the exact Windows binaries and scripts
// uploaded by ci.yml. This is provenance evidence, not a code-signing claim.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, resolve, relative, sep, posix } from "node:path";
import { fileURLToPath } from "node:url";

const definitions = Object.freeze({
  physical: {
    required: ["src-tauri/target-physical/release/narro.exe"],
    bundles: [
      { directory: "src-tauri/target-physical/release/bundle/msi", extension: ".msi" },
      { directory: "src-tauri/target-physical/release/bundle/nsis", extension: ".exe" },
    ],
  },
  validation: {
    required: [
      "artifacts/m7-validation/narro-m7-validation.exe",
      "artifacts/m7-validation/README-M7-VALIDATION.md",
    ],
    bundles: [],
  },
  diagnostic: {
    required: [
      "src-tauri/target/release/narro.exe",
      "scripts/measure-floating.ps1",
      "scripts/run-m1-floating-performance-batch.ps1",
      "scripts/verify-m1-floating-performance-scenario.ps1",
      "docs/M1_FLOATING_PERFORMANCE_MEASUREMENT.md",
      "docs/M1_WINDOWS_RUNTIME_VALIDATION.md",
      "docs/M1_DISPLAY_TOPOLOGY_VALIDATION.md",
    ],
    bundles: [],
  },
});

function assertIdentity(sourceSha, runId, attempt) {
  if (!/^[a-fA-F0-9]{40}$/.test(sourceSha || "")) {
    throw Error("CI provenance requires the exact 40-hex source commit SHA");
  }
  if (!/^[1-9][0-9]*$/.test(String(runId ?? ""))) {
    throw Error("CI provenance requires a positive GitHub Actions run ID");
  }
  if (!/^[1-9][0-9]*$/.test(String(attempt ?? ""))) {
    throw Error("CI provenance requires a positive GitHub Actions run attempt");
  }
}

function within(root, entry) {
  const absolute = resolve(root, entry);
  const rel = relative(root, absolute);
  if (!rel || rel === ".." || rel.startsWith(".." + sep) || rel.startsWith(sep)) {
    throw Error("CI provenance path escapes the repository: " + entry);
  }
  return { absolute, relativePath: rel.split(sep).join(posix.sep) };
}

export function buildArtifactManifest(kind, { root, sourceSha, runId, attempt }) {
  const definition = definitions[kind];
  if (!definition) throw Error("Unsupported CI artifact family: " + kind);
  assertIdentity(sourceSha, runId, attempt);
  const repositoryRoot = resolve(root);
  const entries = [...definition.required];
  for (const group of definition.bundles) {
    const folder = within(repositoryRoot, group.directory).absolute;
    const found = readdirSync(folder, { withFileTypes: true })
      .filter(item => item.isFile() && item.name.toLowerCase().endsWith(group.extension))
      .map(item => join(group.directory, item.name)).sort();
    if (found.length === 0) throw Error("CI artifact family missing required " + group.extension + " bundle: " + group.directory);
    entries.push(...found);
  }
  const seen = new Set();
  const files = entries.map(entry => {
    const { absolute, relativePath } = within(repositoryRoot, entry);
    if (seen.has(relativePath)) throw Error("Duplicate CI artifact path: " + relativePath);
    seen.add(relativePath);
    const stat = statSync(absolute);
    if (!stat.isFile() || stat.size <= 0) throw Error("Empty or non-file CI artifact: " + relativePath);
    const digest = createHash("sha256").update(readFileSync(absolute)).digest("hex");
    return { path: relativePath, bytes: stat.size, sha256: digest };
  }).sort((a, b) => a.path.localeCompare(b.path, "en"));

  return {
    schema: "narro-ci-artifact-provenance/v1",
    kind,
    sourceSha: sourceSha.toLowerCase(),
    githubRunId: String(runId),
    githubRunAttempt: Number(attempt),
    files,
  };
}

export function writeArtifactManifest(kind, options) {
  const record = buildArtifactManifest(kind, options);
  const output = within(resolve(options.root), "artifacts/ci-provenance/" + kind + ".json").absolute;
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(record, null, 2) + "\n", { encoding: "utf8", flag: "w" });
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const destination = writeArtifactManifest(process.argv[2], {
      root: process.cwd(),
      sourceSha: process.env.NARRO_CI_SOURCE_SHA,
      runId: process.env.GITHUB_RUN_ID,
      attempt: process.env.GITHUB_RUN_ATTEMPT,
    });
    console.log("CI artifact provenance recorded: " + destination);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
