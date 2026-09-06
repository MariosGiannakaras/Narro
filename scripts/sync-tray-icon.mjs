import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const generatedIcon = fileURLToPath(
  new URL("../src-tauri/icons/64x64.png", import.meta.url),
);
const trayIcon = fileURLToPath(
  new URL("../src-tauri/icons/narro-tray-64.png", import.meta.url),
);

await copyFile(generatedIcon, trayIcon);
console.log("Synced Narro tray icon from the canonical generated 64px icon.");
