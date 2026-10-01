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

const [packageJson, tauriConfig, tauriCiConfig, tauriPhysicalConfig, capability] = await Promise.all([
  readJson("package.json"),
  readJson("src-tauri/tauri.conf.json"),
  readJson("src-tauri/tauri.ci.conf.json"),
  readJson("src-tauri/tauri.physical.conf.json"),
  readJson("src-tauri/capabilities/default.json"),
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

invariant(
  packageJson.scripts?.["test:ci-tiering"] === "node scripts/test-ci-tiering.mjs",
  "CI tiering contract test must be registered",
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
  requireFile("scripts/prepare-m7-physical-session.ps1"),
  requireFile("scripts/test-ci-tiering.mjs"),
]);

console.log("Repository configuration invariants: PASS");
