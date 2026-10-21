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
  return { changed: [...new Set((diff.stdout + pending.stdout).split("\0").filter(Boolean))], run, base, explicit: false };
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
  console.log(JSON.stringify({ base, explicit, changed, ...result,
    mandatoryAggregate: "npm run preflight:frontend",
    hint: "Review unmapped and indirect CSS/runtime consumers manually; local PASS is not CI/physical PASS" }, null, 2));
  if (!run) return;
  if (result.unmapped.length) throw Error("Unmapped runtime files; classify manually before --run: " + result.unmapped.join(", "));
  for (const script of [...result.tests, "preflight:frontend"]) {
    const child = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", script], { cwd: root, stdio: "inherit" });
    if (child.status !== 0) throw Error(`Local pre-push ${script} FAILED: ${child.status ?? child.error}`);
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
