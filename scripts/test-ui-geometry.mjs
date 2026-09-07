import { readFile } from "node:fs/promises";

function invariant(condition, message) {
  if (!condition) {
    throw new Error(`UI geometry invariant failed: ${message}`);
  }
}

function escapedPattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const [geometryCss, appCss] = await Promise.all([
  readFile(new URL("../src/geometry.css", import.meta.url), "utf8"),
  readFile(new URL("../src/App.css", import.meta.url), "utf8"),
]);

const expectedTokens = new Map([
  ["--space-1", "0.25rem"],
  ["--space-2", "0.5rem"],
  ["--space-3", "0.75rem"],
  ["--space-4", "1rem"],
  ["--space-5", "1.25rem"],
  ["--space-6", "1.5rem"],
  ["--space-8", "2rem"],
  ["--radius-control", "0.5rem"],
  ["--radius-task-card", "0.625rem"],
  ["--radius-panel", "0.75rem"],
  ["--radius-modal", "0.875rem"],
  ["--radius-floating", "1rem"],
  ["--elevation-flat", "none"],
  ["--elevation-raised", "0 1px 2px rgba(0, 0, 0, 0.12)"],
  ["--elevation-overlay", "0 8px 24px rgba(0, 0, 0, 0.18)"],
]);

for (const [token, value] of expectedTokens) {
  const declaration = new RegExp(`${escapedPattern(token)}\\s*:\\s*${escapedPattern(value)}\\s*;`, "g");
  const declarationCount = [...geometryCss.matchAll(declaration)].length;
  invariant(declarationCount === 1, `${token} must equal ${value} exactly once; found ${declarationCount}`);
}

for (const selector of [".surface-raised", ".surface-floating"]) {
  invariant(geometryCss.includes(selector), `missing reusable surface selector ${selector}`);
}

invariant(
  geometryCss.includes("background: var(--color-surface-raised)"),
  "raised surface must consume the semantic raised-surface color",
);
invariant(
  geometryCss.includes("background: var(--color-surface-deep)"),
  "floating surface must consume the semantic deep-surface color",
);
invariant(
  geometryCss.match(/border: 1px solid var\(--color-border-subtle\)/g)?.length === 2,
  "raised and floating surfaces must use the semantic thin border",
);
invariant(
  geometryCss.includes("box-shadow: var(--elevation-raised)"),
  "raised surface must consume the restrained raised elevation",
);
invariant(
  geometryCss.includes("box-shadow: var(--elevation-overlay)"),
  "floating surface must consume the restrained overlay elevation",
);

invariant(
  /^@import "\.\/theme\.css";\r?\n@import "\.\/typography\.css";\r?\n@import "\.\/geometry\.css";/.test(
    appCss,
  ),
  "App.css must import theme, typography, then geometry primitives",
);

for (const reference of [
  "var(--radius-control)",
  "var(--space-1)",
  "var(--space-2)",
  "var(--space-3)",
]) {
  invariant(appCss.includes(reference), `App.css does not consume ${reference}`);
}

invariant(!appCss.includes("border-radius: 8px"), "shared control radius must use the radius token");
invariant(!appCss.includes("margin-right: 5px"), "shared spacing must use the 4px token scale");

console.log("UI spacing/radius/elevation contract: PASS");
