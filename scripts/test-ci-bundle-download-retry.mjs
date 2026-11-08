import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { runBundleWithRetry, transientBundlerDownload } from "./ci-bundle-download-retry.mjs";

const wix = "Downloading https://github.com/wixtoolset/wix3/releases/download/wix3141rtm/wix314-binaries.zip\nfailed to bundle project: `http status: 504`";
const nsis = wix.replace("wixtoolset/wix3/releases/download/wix3141rtm/wix314-binaries.zip", "tauri-apps/binary-releases/releases/download/nsis-3.11/nsis-3.11.zip");
assert(transientBundlerDownload(wix)); assert(transientBundlerDownload(nsis));
for (const text of [wix.replace("504", "404"), wix.replace("504", "401"), "http status: 504",
  wix.replace("failed to bundle project", "test failed"), wix + "\nerror[E0308]: wrong type",
  wix + "\ncould not compile narro", wix + "\nAssertionError", wix + "\nchecksum mismatch"]) {
  assert.equal(transientBundlerDownload(text), false, text);
}
const root = await mkdtemp(join(tmpdir(), "narro-bundle-retry-test-"));
try {
  const fixture = join(root, "child.mjs");
  await writeFile(fixture, `import fs from 'node:fs'; const p=process.env.COUNT_FILE;
const n=fs.existsSync(p)?Number(fs.readFileSync(p,'utf8'))+1:1;fs.writeFileSync(p,String(n));
const rows=JSON.parse(process.env.FAILURES);if(n<=rows.length){console.error(rows[n-1]);process.exitCode=7;}else console.log('fixture bundle completed');`);
  async function run(name, failures) {
    return runBundleWithRetry({ command: process.execPath, args: [fixture], logRoot: join(root, name),
      env: { ...process.env, COUNT_FILE: join(root, name + ".count"), FAILURES: JSON.stringify(failures) },
      echo: false, delay: async () => {} });
  }
  const recovered = await run("wix-then-nsis", [wix, nsis]);
  assert.equal(recovered.code, 0); assert.equal(recovered.attempts.length, 3);
  assert.match(await readFile(recovered.attempts[0].log, "utf8"), /wix314-binaries/);
  assert.match(await readFile(recovered.attempts[1].log, "utf8"), /nsis-3.11/);
  for (const failure of ["error[E0308]: compile failed", wix + "\nAssertionError", wix.replace("504", "404"), "light.exe failed"]) {
    const failed = await run("fatal-" + Math.random().toString(36).slice(2), [failure]);
    assert.equal(failed.code, 7); assert.equal(failed.attempts.length, 1);
  }
  const exhausted = await run("exhausted", [wix, nsis, wix, nsis, wix]);
  assert.equal(exhausted.code, 7); assert.equal(exhausted.attempts.length, 4);
  assert.equal(exhausted.attempts.at(-1).retry, false);
  const manifest = JSON.parse(await readFile(join(root, "exhausted", "ATTEMPTS.json"), "utf8"));
  assert.equal(manifest.attempts.length, 4);
  const npmFixture = join(root, "npm-cli.mjs");
  await writeFile(npmFixture, `import fs from 'node:fs'; fs.writeFileSync(process.env.ARGS_FILE, JSON.stringify(process.argv.slice(2)));`);
  for (const [kind, script] of [["normal", "tauri:ci"], ["physical", "tauri:physical-ci"]]) {
    const argsFile = join(root, kind + "-args.json");
    await promisify(execFile)(process.execPath, [fileURLToPath(new URL("./ci-bundle-download-retry.mjs", import.meta.url)), kind],
      { cwd: root, env: { ...process.env, npm_execpath: npmFixture, ARGS_FILE: argsFile }, windowsHide: true });
    assert.deepEqual(JSON.parse(await readFile(argsFile, "utf8")), ["run", script], "real CLI must dispatch the unchanged native build command without a shell");
  }
  console.log("Bundler retry actual-child tests: transient WiX/NSIS recovery, retained first errors, fatal/no-retry and bounded exhaustion PASS");
} finally { await rm(root, { recursive: true, force: true }); }
