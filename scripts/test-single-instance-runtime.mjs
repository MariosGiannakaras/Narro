import fs from "node:fs";

const cargo = fs.readFileSync("src-tauri/Cargo.toml", "utf8").replace(/\r\n/g, "\n");
const lib = fs.readFileSync("src-tauri/src/lib.rs", "utf8").replace(/\r\n/g, "\n");
const packageJson = fs.readFileSync("package.json", "utf8").replace(/\r\n/g, "\n");

function invariant(condition, message) {
  if (!condition) throw new Error(`Single-instance runtime contract failed: ${message}`);
}

invariant(
  cargo.includes('tauri-plugin-single-instance = "=2.4.5"'),
  "the Windows foreground-fix single-instance plugin version must remain pinned",
);

const builder = lib.indexOf("tauri::Builder::default()");
const singleInstance = lib.indexOf(".plugin(tauri_plugin_single_instance::init(", builder);
const opener = lib.indexOf(".plugin(tauri_plugin_opener::init())", builder);
const notifications = lib.indexOf(".plugin(tauri_plugin_notification::init())", builder);
const autostart = lib.indexOf(".plugin(tauri_plugin_autostart::init(", builder);

invariant(builder >= 0 && singleInstance > builder, "single-instance plugin must be registered");
invariant(
  singleInstance < opener && singleInstance < notifications && singleInstance < autostart,
  "single-instance plugin must be the first registered Tauri plugin",
);

const callbackEnd = lib.indexOf("}))", singleInstance);
const callback = lib.slice(singleInstance, callbackEnd + 3);
invariant(
  callback.includes("request_show_or_recreate_main(app_handle.clone())"),
  "secondary launch must foreground/recreate the existing Main window",
);
for (const forbidden of [
  "initialize_persistence",
  "TimerService::recover",
  "install_background_orchestration",
  "install_background_delivery",
  "shortcuts::install",
]) {
  invariant(!callback.includes(forbidden), `secondary launch callback must not initialize competing authority via ${forbidden}`);
}

const setup = lib.indexOf(".setup(|app|", builder);
invariant(singleInstance < setup, "single-instance ownership must be established before persistence/background setup");
invariant(
  packageJson.includes('"test:single-instance-runtime"')
    && packageJson.includes("npm run test:single-instance-runtime"),
  "single-instance regression must run in repository frontend preflight",
);

console.log("Single-instance runtime ownership contracts passed.");
