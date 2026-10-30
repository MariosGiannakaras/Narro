/** Conservative pre-push impact planner. Does not replace full preflight / CI.
 * node scripts/preflight-impact.mjs --base main [--run]
 * node scripts/preflight-impact.mjs --files src/TaskCard.tsx,scripts/finding33NavigationAck.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function selectImpactedTests(changed, bodies, npmScripts) {
  const runnable = new Map();
  for (const [label, cmd] of Object.entries(npmScripts)) {
    if (!label.startsWith("test:") || typeof cmd !== "string") continue;
    const name = cmd.match(/\bscripts\/(test-[\w-]+\.mjs)\b/)?.[1];
    if (name) runnable.set(`scripts/${name}`, label);
  }
  const references = (body, relative) => {
    const basename = path.posix.basename(relative);
    const stem = basename.replace(/\.(tsx|ts|jsx|js|mjs|css|json)$/, "");
    return body.includes(relative) || body.includes(basename)
      || (stem.length >= 7 && body.includes(stem));
  };
  const scripts = [...bodies.entries()].filter(([file]) => file.startsWith("scripts/") && file.endsWith(".mjs"));
  const frontier = [...new Set(changed.map(x => x.replaceAll("\\", "/")))];
  const seen = new Set(frontier), mapped = new Set(), consumers = new Map();
  for (let index = 0; index < frontier.length; index++) {
    const relative = frontier[index];
    if (runnable.has(relative)) mapped.add(runnable.get(relative));
    for (const [consumer, body] of scripts) {
      if (consumer === relative || !references(body, relative)) continue;
      if (!consumers.has(relative)) consumers.set(relative, new Set());
      consumers.get(relative).add(consumer);
      if (!seen.has(consumer)) { seen.add(consumer); frontier.push(consumer); }
      if (runnable.has(consumer)) mapped.add(runnable.get(consumer));
    }
  }
  const unmapped = changed.filter(file => !runnable.has(file)
    && !(consumers.get(file)?.size > 0)
    && /^(src\/|src-tauri\/|scripts\/)/.test(file));
  return { tests: [...mapped].sort(), unmapped, consumers: Object.fromEntries([...consumers]
    .map(([source, files]) => [source, [...files].sort()])) };
}

/**
 * Conservative, source-path-based routing into the already documented
 * engineering risk families. It is an admission aid, not proof that a guard
 * passed or that the affected architecture has been completely mapped.
 * Keep the source of detailed prevention rules in the risk register.
 */
export function selectLearningRisks(changed) {
  const paths = changed.map(file => file.replaceAll("\\", "/"));
  const any = pattern => paths.some(file => pattern.test(file));
  const rust = any(/^(src-tauri\/.*\.rs|src-tauri\/Cargo\.(toml|lock))$/);
  const ci = any(/^(\.github\/workflows\/|scripts\/(ci-learning|test-ci-learning|preflight-impact|test-preflight-impact)\.mjs$)/);
  const runtime = any(/^(src\/|src-tauri\/|scripts\/|\.github\/workflows\/)/);
  const harness = any(/^scripts\/.*(capture|visual|fixture|readiness|navigation|preflight)/i);
  const state = any(/^(src\/|src-tauri\/).*(timer|session|report|task|board|focus)/i);
  const native = any(/^src-tauri\/src\/.*(floating|overlay|raster|placement|monitor|window)/i);
  const tracking = any(/^(HANDOFF|STATUS|TODO|AI_START_HERE|AGENT_WORKFLOW)\.md$|^docs\/(TRACKER_STATUS_INDEX|CI_VALIDATION_STRATEGY)\.md$/);
  const ids = new Set();
  if (runtime) ids.add("NER-003");
  if (harness) ids.add("NER-004");
  if (tracking) { ids.add("NER-005"); ids.add("NER-006"); }
  if (state) { ids.add("NER-009"); ids.add("NER-014"); }
  if (native) { ids.add("NER-001"); ids.add("NER-010"); }
  if (ci) { ids.add("NER-003"); ids.add("NER-011"); ids.add("NER-012"); }
  if (runtime) ids.add("NER-012");
  return {
    riskFamiliesToReview: [...ids].sort(),
    mandatoryRustFormatOnRun: rust,
    additionalRustChecksToRunWhereAvailable: rust
      ? ["check:rust", "check:rust:clippy", "test:rust"] : [],
    learningLimit: "Path matching cannot prove semantic coverage or a PASS; review applicable register entries, related failed logs, and unmapped consumers."
  };
}

export function parseChangedPaths(argv, git) {
  let base = "main", files = null, run = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--base") base = argv[++i];
    else if (argv[i] === "--files") files = argv[++i]?.split(",").filter(Boolean);
    else if (argv[i] === "--run") run = true;
    else throw Error("Unknown or incomplete preflight-impact option: " + argv[i]);
  }
  if (files) return { changed: files, run, base, explicit: true };
  if (!base || base.startsWith("-")) throw Error("Invalid base git reference");
  const diff = git(["diff", "--name-only", "-z", `${base}...HEAD`]);
  if (diff.status !== 0) throw Error("Cannot derive branch impact from " + base + ": " + diff.stderr);
  const pending = git(["diff", "--name-only", "-z", "HEAD"]);
  if (pending.status !== 0) throw Error("Cannot inspect working-tree changes: " + pending.stderr);
  const untracked = git(["ls-files", "--others", "--exclude-standard", "-z"]);
  if (untracked.status !== 0) throw Error("Cannot inspect untracked worktree files: " + untracked.stderr);
  return { changed: [...new Set((diff.stdout + pending.stdout + untracked.stdout).split("\0").filter(Boolean))], run, base, explicit: false };
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const git = args => spawnSync("git", args, { cwd: root, encoding: "utf8" });
  const { changed, run, base, explicit } = parseChangedPaths(process.argv.slice(2), git);
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const bodies = new Map(readdirSync(path.join(root, "scripts"))
    .filter(name => name.endsWith(".mjs"))
    .map(name => [`scripts/${name}`, readFileSync(path.join(root, "scripts", name), "utf8")]));
  const result = selectImpactedTests(changed, bodies, pkg.scripts);
  const learning = selectLearningRisks(changed);
  console.log(JSON.stringify({ base, explicit, changed, ...result, ...learning,
    mandatoryAggregate: "npm run preflight:frontend",
    hint: "Review unmapped and indirect CSS/runtime consumers manually; local PASS is not CI/physical PASS" }, null, 2));
  if (!run) return;
  // Execute the known cheap Rust guard even when other Rust consumers still
  // need manual impact classification; never silently skip it.
  if (learning.mandatoryRustFormatOnRun) {
    const check = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm",
      ["run", "check:rust:fmt"], { cwd: root, stdio: "inherit" });
    if (check.status !== 0)
      throw Error("Local pre-push check:rust:fmt FAILED or NOT RUN (Rust toolchain unavailable): " +
        (check.status ?? check.error));
  }
  if (result.unmapped.length) throw Error("Unmapped runtime files; classify manually before --run: " + result.unmapped.join(", "));
  for (const script of [...result.tests, "preflight:frontend"]) {
    const child = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", script], { cwd: root, stdio: "inherit" });
    if (child.status !== 0) throw Error(`Local pre-push ${script} FAILED: ${child.status ?? child.error}`);
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
