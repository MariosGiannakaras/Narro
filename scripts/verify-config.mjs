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

const [packageJson, tauriConfig, tauriCiConfig, capability, ciWorkflow] = await Promise.all([
  readJson("package.json"),
  readJson("src-tauri/tauri.conf.json"),
  readJson("src-tauri/tauri.ci.conf.json"),
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
invariant(tauriConfig.bundle?.active === true, "Windows bundle generation must remain enabled");

for (const contract of [
  ["validation-gate:", "CI must retain the main-tree validation gate"],
  ["skip-full-ci:", "CI gate must publish the duplicate-validation decision"],
  ['context.eventName !== "push"', "CI gate must only deduplicate main push runs"],
  ["pull.merge_commit_sha === currentSha", "CI gate must bind the main commit to the merged PR"],
  ["mainCommit.data.commit.tree.sha !== prHeadCommit.data.commit.tree.sha", "CI gate must compare exact Git trees"],
  ['run.name === context.workflow', "CI gate must require the same Windows CI workflow"],
  ['run.conclusion === "success"', "CI gate must require successful exact-head PR validation"],
  ['filename === ".github/workflows/ci.yml"', "workflow changes must force one full main validation"],
  ["/(^|\\/)Cargo\\.(toml|lock)$/", "Rust dependency changes must force main cache warmup"],
  ["Swatinem/rust-cache@6323deb102c322ba6fcbdcafc7e3dddab59af2b6", "Rust cache action must remain pinned"],
  ["ref: ${{ github.event_name == 'pull_request' && github.event.pull_request.head.sha || github.sha }}", "pull_request CI must checkout the exact PR head while push CI checks the pushed SHA"],
  ["workspaces: './src-tauri -> target'", "Rust cache must target the Tauri Cargo workspace"],
  ["save-if: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}", "only trusted main pushes may save the reusable Rust cache"],
  ["Verify Reused Frontend Dist", "CI must verify frontend build output before Tauri packaging"],
  ["run: npm run tauri:ci", "CI release build must reuse the preflight frontend output"],
]) {
  invariant(ciWorkflow.includes(contract[0]), contract[1]);
}

const windows = tauriConfig.app?.windows;
invariant(Array.isArray(windows), "Tauri app.windows must be an array");
invariant(windows.length === 2, "Milestone 1 must define exactly two initial webview windows");

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
]);

console.log("Repository configuration invariants: PASS");
