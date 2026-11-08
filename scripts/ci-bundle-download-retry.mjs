import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { appendFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function transientBundlerDownload(text) {
  const plain = text.replace(/\x1b\[[0-9;]*m/g, "");
  // Compiler/assertion/hash/installer failures must never become retryable just
  // because a preceding line mentioned an HTTP request.
  if (/error\[E\d+\]|error TS\d+:|could not compile|failed to run custom build command|error during build|error: linking|hash mismatch|checksum mismatch|AssertionError/i.test(plain)) return false;
  return /Downloading https:\/\/github\.com\/(?:wixtoolset\/wix3|tauri-apps\/binary-releases)\/releases\/download\//.test(plain)
    && /failed to bundle project:\s*`?http status:\s*(?:408|429|500|502|503|504)\b/i.test(plain);
}

export async function runBundleWithRetry({ command, args, logRoot, env = process.env,
  maxAttempts = 4, delay = ms => new Promise(done => setTimeout(done, ms)), echo = true }) {
  if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 4) throw Error("Require1–4 bounded bundle attempts");
  await mkdir(logRoot, { recursive: true });
  const attempts = [];
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const log = join(logRoot, `attempt-${attempt}.log`);
    await writeFile(log, "");
    let output = "", spawnError = null;
    const child = spawn(command, args, { env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    const consume = chunk => {
      appendFileSync(log, chunk); output += chunk.toString();
      if (echo) process.stdout.write(chunk);
    };
    child.stdout.on("data", consume); child.stderr.on("data", consume);
    const code = await new Promise(done => {
      child.on("error", error => { spawnError = error.message; });
      child.on("close", value => done(value ?? 1));
    });
    const retry = code !== 0 && !spawnError && transientBundlerDownload(output) && attempt < maxAttempts;
    attempts.push({ attempt, code, spawnError, retry, log, reason: retry ? "confirmed transient official bundler download" : null });
    await writeFile(join(logRoot, "ATTEMPTS.json"), JSON.stringify({ attempts }, null, 2) + "\n");
    if (!retry) return { code, attempts };
    if (echo) console.log(`Bundler download transient; retrying only the build step (${attempt + 1}/${maxAttempts}). Previous log: ${log}`);
    await delay(2000 * 2 ** (attempt - 1));
  }
  throw Error("Unreachable attempt state");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const kind = process.argv[2];
    const script = { normal: "tauri:ci", physical: "tauri:physical-ci" }[kind];
    if (!["normal", "physical"].includes(kind) || !script || !process.env.npm_execpath) throw Error("Use npm run ci:bundle:normal or ci:bundle:physical");
    // npm supplies its own JS entry point. No shell, npm.cmd quoting or user
    // command interpolation; Tauri retains its tool cache and hash checks.
    const result = await runBundleWithRetry({ command: process.execPath,
      args: [process.env.npm_execpath, "run", script], logRoot: resolve("artifacts/ci-bundle-downloads", kind) });
    process.exitCode = result.code;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
