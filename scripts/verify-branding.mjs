import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

function invariant(condition, message) {
  if (!condition) {
    throw new Error(`Branding invariant failed: ${message}`);
  }
}

async function read(relativePath, encoding = null) {
  const data = await readFile(path.join(root, relativePath));
  return encoding ? data.toString(encoding) : data;
}

function pngInfo(buffer, relativePath) {
  const signature = "89504e470d0a1a0a";
  invariant(buffer.subarray(0, 8).toString("hex") === signature, `${relativePath} must be a PNG`);
  invariant(buffer.subarray(12, 16).toString("ascii") === "IHDR", `${relativePath} must contain an IHDR chunk`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer[24],
    colorType: buffer[25],
  };
}

const vectorFiles = [
  "assets/branding/narro-logo-master.svg",
  "assets/branding/narro-logo-stacked-light.svg",
  "assets/branding/narro-logo-stacked-dark.svg",
  "assets/branding/narro-logo-horizontal-light.svg",
  "assets/branding/narro-logo-horizontal-dark.svg",
  "assets/branding/narro-symbol.svg",
  "assets/branding/narro-app-icon-light.svg",
  "assets/branding/narro-app-icon-dark.svg",
];

for (const relativePath of vectorFiles) {
  const svg = await read(relativePath, "utf8");
  invariant(/<svg\b/i.test(svg), `${relativePath} must be SVG XML`);
  invariant(
    !/<(?:image|feImage|foreignObject|script|text)\b/i.test(svg),
    `${relativePath} must not contain embedded raster/script/live-text elements`,
  );
  invariant(!/data:image|base64,/i.test(svg), `${relativePath} must not contain embedded raster data`);
  invariant(
    !/(?:href|src)\s*=\s*["'](?!#|data:)[^"']+/i.test(svg),
    `${relativePath} must not reference external image/resources`,
  );
}

const [master, stackedLight] = await Promise.all([
  read("assets/branding/narro-logo-master.svg"),
  read("assets/branding/narro-logo-stacked-light.svg"),
]);
invariant(master.equals(stackedLight), "narro-logo-master.svg must remain the stacked-light compatibility alias");

const [lightApp, darkApp] = await Promise.all([
  read("assets/branding/narro-app-icon-light.svg", "utf8"),
  read("assets/branding/narro-app-icon-dark.svg", "utf8"),
]);
invariant(lightApp.includes('viewBox="0 0 1024 1024"'), "light app icon must use the 1024 square canvas");
invariant(darkApp.includes('viewBox="0 0 1024 1024"'), "dark app icon must use the 1024 square canvas");
invariant(lightApp.includes('#F4F4F4'), "light app icon must retain Narro Snow");
invariant(darkApp.includes('#171717'), "dark app icon must retain Narro Ink");

for (const [relativePath, expectedWidth, expectedHeight] of [
  ["assets/branding/narro-logo-master.png", 1536, 1536],
  ["assets/branding/narro-symbol-transparent.png", 1024, 1024],
  ["assets/branding/narro-app-icon-light.png", 1024, 1024],
  ["assets/branding/narro-app-icon-dark.png", 1024, 1024],
  ["src-tauri/icons/narro-tray-64.png", 64, 64],
]) {
  const info = pngInfo(await read(relativePath), relativePath);
  invariant(
    info.width === expectedWidth && info.height === expectedHeight,
    `${relativePath} must be ${expectedWidth}x${expectedHeight}, got ${info.width}x${info.height}`,
  );
}

const trayInfo = pngInfo(await read("src-tauri/icons/narro-tray-64.png"), "src-tauri/icons/narro-tray-64.png");
invariant(trayInfo.bitDepth === 8, "tray icon must use 8-bit PNG channels");
invariant(trayInfo.colorType === 6, "tray icon must be RGBA/transparent");

const packageJson = JSON.parse(await read("package.json", "utf8"));
invariant(
  packageJson.scripts?.["prepare:icons"] === "tauri icon assets/branding/narro-app-icon-light.svg",
  "Tauri icon generation must use the canonical square Narro vector app icon",
);
invariant(packageJson.scripts?.predev === "npm run prepare:icons", "dev startup must regenerate Narro platform icons");
invariant(packageJson.scripts?.prebuild === "npm run prepare:icons", "build startup must regenerate Narro platform icons");

try {
  await access(path.join(root, "scripts/sync-tray-icon.mjs"));
  invariant(false, "obsolete generic app-icon-to-tray synchronization script must remain removed");
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const libRs = await read("src-tauri/src/lib.rs", "utf8");
invariant(
  libRs.includes('include_image!("./icons/narro-tray-64.png")'),
  "runtime tray must use the dedicated Narro symbol-only tray asset",
);

console.log("Narro branding source/runtime invariants: PASS");
