import fs from "node:fs";

const read = (name) => fs.readFileSync(new URL(name, import.meta.url), "utf8");
const source = read("../src/builtinListIconCatalog.ts");
const component = read("../src/BuiltinListIcon.tsx");
const rust = read("../src-tauri/src/list_builtin_icons.rs");
const match = source.match(/export const BUILTIN_LIST_ICONS: readonly BuiltinIconDefinition\[\] = (\[[^\n]*\]);/);
if (!match) throw new Error("Trusted compile-time icon registry must be a fixed JSON literal");
const icons = JSON.parse(match[1]);
if (icons.length !== 218) throw new Error("Expected 15 original and 203 local SVG icons");
const ids = icons.map((entry) => entry.id);
if (new Set(ids).size !== icons.length) throw new Error("Duplicate stable icon ID");
for (const entry of icons) {
  if (!/^[a-z0-9-]+$/.test(entry.id) || !entry.name || !entry.category) {
    throw new Error("Invalid or unnamed icon: " + entry.id);
  }
  if (!/^(?:<(?:path|rect|circle)\s[^<>]+\/>)+$/.test(entry.markup)) {
    throw new Error("Unexpected SVG markup for " + entry.id);
  }
  if (!rust.includes(`"${entry.id}",`)) {
    throw new Error("Rust builtin icon whitelist is missing " + entry.id);
  }
}
const rustIds = [...rust.matchAll(/^    "([^"]+)",$/gm)].map((m) => m[1]);
if (rustIds.length !== ids.length || rustIds.some((id) => !ids.includes(id))) {
  throw new Error("Frontend SVG and backend icon ID whitelist diverged");
}
if (!source.includes("CC BY 4.0") || source.includes("fetch(")
  || !component.includes("BUILTIN_LIST_ICONS") || !component.includes("dangerouslySetInnerHTML")) {
  throw new Error("Offline attribution or no-network contract missing");
}
console.log("218 local whitelisted list icon geometries match Rust IDs.");
