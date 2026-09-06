import { readFile } from "node:fs/promises";

function invariant(condition, message) {
  if (!condition) {
    throw new Error(`UI theme token invariant failed: ${message}`);
  }
}

function escapedPattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const [themeCss, appCss] = await Promise.all([
  readFile(new URL("../src/theme.css", import.meta.url), "utf8"),
  readFile(new URL("../src/App.css", import.meta.url), "utf8"),
]);

const requiredTokens = [
  "--color-canvas",
  "--color-surface-raised",
  "--color-surface-deep",
  "--color-surface-interactive",
  "--color-surface-interactive-hover",
  "--color-border-subtle",
  "--color-border-strong",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-text-inverse",
  "--color-accent-start",
  "--color-accent-end",
  "--color-accent-solid",
  "--color-accent-contrast",
  "--color-accent-on-solid",
  "--color-success",
  "--color-success-surface",
  "--color-warning",
  "--color-warning-surface",
  "--color-destructive",
  "--color-destructive-surface",
];

for (const token of requiredTokens) {
  const declarationCount = [...themeCss.matchAll(new RegExp(`${escapedPattern(token)}\\s*:`, "g"))]
    .length;
  invariant(
    declarationCount === 3,
    `${token} must be declared for light, explicit dark, and system-dark values; found ${declarationCount}`,
  );
}

invariant(themeCss.includes(':root[data-theme="light"]'), "missing explicit light theme selector");
invariant(themeCss.includes(':root[data-theme="dark"]'), "missing explicit dark theme selector");
invariant(themeCss.includes(':root[data-theme="system"]'), "missing explicit system theme selector");
invariant(themeCss.includes("color-scheme: light"), "light theme must expose color-scheme: light");
invariant(themeCss.includes("color-scheme: dark"), "dark theme must expose color-scheme: dark");
invariant(
  themeCss.includes("@media (prefers-color-scheme: dark)"),
  "system theme must follow prefers-color-scheme",
);
invariant(
  themeCss.includes(":root:not([data-theme])"),
  "theme-less bootstrap must follow the Windows/browser color-scheme preference",
);

invariant(appCss.startsWith('@import "./theme.css";'), "App.css must import the shared theme tokens first");

const requiredConsumption = [
  "var(--color-canvas)",
  "var(--color-surface-interactive)",
  "var(--color-border-subtle)",
  "var(--color-text-primary)",
  "var(--color-text-secondary)",
  "var(--color-accent-solid)",
  "var(--color-accent-contrast)",
  "var(--color-destructive)",
];

for (const reference of requiredConsumption) {
  invariant(appCss.includes(reference), `App.css does not consume ${reference}`);
}

invariant(!appCss.includes(".logo.vite"), "obsolete Vite scaffold logo styling must be removed");
invariant(!appCss.includes(".logo.react"), "obsolete React scaffold logo styling must be removed");
invariant(
  !/#[0-9a-f]{3,8}\b/i.test(appCss),
  "shared App.css must consume semantic theme tokens instead of hard-coded hex colors",
);

console.log("UI semantic theme token contract: PASS");
