import { fileURLToPath } from "node:url";
const core = fileURLToPath(new URL("../src/physicalInvoke.ts", import.meta.url));
const event = fileURLToPath(new URL("../src/physicalEvent.ts", import.meta.url));
export function physicalTracePlugin(enabled) {
  return { name: "narro-physical-trace", enforce: "pre", resolveId(source, importer) {
    if (!enabled || !importer || /[/\\]physical(?:Invoke|Event)\.ts$/.test(importer)) return null;
    if (source === "@tauri-apps/api/core") return core;
    if (source === "@tauri-apps/api/event") return event;
    return null;
  } };
}
