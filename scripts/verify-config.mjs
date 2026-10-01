import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

function invariant(condition, message) {
  if (!condition) {
    throw new Error(`Configuration invariant failed: ${message}`);
  }
}

async function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  try {
    return JSON.parse(await readFile(absolutePath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to parse ${relativePath}: ${error.message}`, { cause: error });
  }
}

async function readText(relativePath) {
  const absolutePath = path.join(root, relativePath);
  try {
    return await readFile(absolutePath, "utf8");
  } catch (error) {
    throw new Error(`Unable to read ${relativePath}: ${error.message}`, { cause: error });
  }
}

async function requireFile(relativePath) {
  try {
    await access(path.join(root, relativePath));
  } catch (error) {
    throw new Error(`Required repository file is missing: ${relativePath}`, { cause: error });
  }
}

const [packageJson, tauriConfig, tauriCiConfig, tauriPhysicalConfig, capability, ciWorkflow] = await Promise.all([
  readJson("package.json"),
  readJson("src-tauri/tauri.conf.json"),
  readJson("src-tauri/tauri.ci.conf.json"),
  readJson("src-tauri/tauri.physical.conf.json"),
  readJson("src-tauri/capabilities/default.json"),
  readText(".github/workflows/ci.yml"),
]);

invariant(packageJson.name === "narro", "package name must remain 'narro'");
invariant(tauriConfig.productName === "Narro", "Tauri productName must remain 'Narro'");
invariant(
  typeof tauriConfig.identifier === "string" && tauriConfig.identifier.trim().length > 0,
  "Tauri identifier must be non-empty",
);
invariant(
  packageJson.version === tauriConfig.version,
  "package.json and tauri.conf.json versions must match",
);
invariant(tauriConfig.build?.frontendDist === "../dist", "frontendDist must be ../dist");
invariant(
  tauriConfig.build?.beforeBuildCommand === "npm run build",
  "normal Tauri builds must retain the frontend beforeBuildCommand",
);
invariant(
  tauriCiConfig.build?.beforeBuildCommand === null,
  "CI Tauri override must reuse the preflight-built frontend instead of rebuilding it",
);
invariant(
  packageJson.scripts?.["tauri:ci"] === "tauri build --config src-tauri/tauri.ci.conf.json",
  "tauri:ci must build with the CI config override",
);
invariant(
  packageJson.scripts?.["tauri:physical-ci"] === "tauri build --config src-tauri/tauri.physical.conf.json",
  "tauri:physical-ci must build with the production-window physical config overlay",
);
invariant(
  tauriPhysicalConfig.build?.beforeBuildCommand === null
    && tauriPhysicalConfig.app === undefined,
  "physical CI config must not override production window URLs",
);
invariant(tauriConfig.bundle?.active === true, "Windows bundle generation must remain enabled");

for (const contract of [
  ["validation-gate:", "CI must retain the main-tree validation gate"],
  ["skip-full-ci:", "CI gate must publish the duplicate-validation decision"],
  ['context.eventName !== "push"', "CI gate must only deduplicate main push runs"],
  ["pull.merge_commit_sha === currentSha", "CI gate must bind the main commit to the merged PR"],
  ["mainCommit.data.commit.tree.sha !== prHeadCommit.data.commit.tree.sha", "CI gate must compare exact Git trees"],
  ["github.rest.actions.getWorkflowRun", "CI gate must resolve the current workflow identity"],
  ["run.workflow_id === currentRun.workflow_id", "CI gate must bind exact-head validation to the same workflow ID"],
  ['run.conclusion === "success"', "CI gate must require successful exact-head PR validation"],
  ['filename === ".github/workflows/ci.yml"', "workflow changes must force one full main validation"],
  ["/(^|\\/)Cargo\\.(toml|lock)$/", "Rust dependency changes must force main cache warmup"],
  ["Swatinem/rust-cache@6323deb102c322ba6fcbdcafc7e3dddab59af2b6", "Rust cache action must remain pinned"],
  ["ref: ${{ github.event_name == 'pull_request' && github.event.pull_request.head.sha || github.sha }}", "pull_request CI must checkout the exact PR head while push CI checks the pushed SHA"],
  ["workspaces: './src-tauri -> target'", "Rust cache must target the Tauri Cargo workspace"],
  ["save-if: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}", "only trusted main pushes may save the reusable Rust cache"],
  ["Verify Reused Frontend Dist", "CI must verify frontend build output before Tauri packaging"],
  ["run: npm run tauri:ci", "instrumented CI release build must reuse the preflight frontend output"],
  ["Build Physical Validation Release", "CI must rebuild a production-window binary after packaged runtime capture"],
  ['$env:CARGO_TARGET_DIR = Join-Path $PWD "src-tauri/target-physical"', "physical build must use an isolated Cargo target directory"],
  ["npm run tauri:physical-ci", "physical build must use the production-window config overlay"],
  ["Verify Physical Validation Build", "physical build must pass an isolated-profile runtime smoke check"],
  ["verify-physical-validation-build.ps1", "CI must verify that the physical binary cannot seed capture fixtures"],
  ["name: narro-m7-physical-windows-x64", "CI must upload a dedicated production-config physical artifact"],
  ["src-tauri/target-physical/release/narro.exe", "physical artifact must come from the isolated production-config target"],
]) {
  invariant(ciWorkflow.includes(contract[0]), contract[1]);
}
invariant(
  !ciWorkflow.includes("run.pull_requests"),
  "CI dedup must not depend on workflow_run.pull_requests metadata, which can be empty after merge",
);

const windows = tauriConfig.app?.windows;
invariant(Array.isArray(windows), "Tauri app.windows must be an array");
invariant(windows.length === 2, "Narro must define exactly main and one persistent focusSurface WebView");

const labels = windows.map((window) => window.label);
invariant(new Set(labels).size === labels.length, "Tauri window labels must be unique");
invariant(
  [...labels].sort().join(",") === "focusSurface,main",
  "window labels must be exactly main and focusSurface",
);

for (const window of windows) {
  invariant(
    Number.isFinite(window.width) && window.width > 0,
    `window '${window.label}' width must be positive and finite`,
  );
  invariant(
    Number.isFinite(window.height) && window.height > 0,
    `window '${window.label}' height must be positive and finite`,
  );
}

const mainWindow = windows.find((window) => window.label === "main");
const focusWindow = windows.find((window) => window.label === "focusSurface");
invariant(mainWindow?.url === "index.html", "main must load index.html");
invariant(focusWindow?.url === "focus.html", "focusSurface must load focus.html");
invariant(focusWindow?.visible === false, "focusSurface must start hidden");
invariant(focusWindow?.decorations === false, "focusSurface must remain frameless");
invariant(focusWindow?.transparent === true, "focusSurface must retain a transparent native/WebView canvas");
invariant(
  focusWindow?.width === 340 && focusWindow?.height === 700,
  "focusSurface must use the validated fixed 340x700 logical host",
);
invariant(
  focusWindow?.alwaysOnTop !== true,
  "focusSurface starts in Panel presentation and must not start topmost",
);

const capabilityWindows = capability.windows;
invariant(Array.isArray(capabilityWindows), "capability windows must be an array");
invariant(
  new Set(capabilityWindows).size === capabilityWindows.length,
  "capability window labels must be unique",
);
invariant(
  [...capabilityWindows].sort().join(",") === "focusSurface,main",
  "default capability must cover exactly main and focusSurface",
);

await Promise.all([
  requireFile("index.html"),
  requireFile("focus.html"),
  requireFile("src-tauri/icons/narro-tray-64.png"),
  requireFile("scripts/verify-physical-validation-build.ps1"),
]);

console.log("Repository configuration invariants: PASS");
