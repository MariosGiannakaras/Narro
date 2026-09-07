import { readFile } from "node:fs/promises";

function invariant(condition, message) {
  if (!condition) {
    throw new Error(`UI typography invariant failed: ${message}`);
  }
}

function escapedPattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const [typographyCss, appCss, timerProjection] = await Promise.all([
  readFile(new URL("../src/typography.css", import.meta.url), "utf8"),
  readFile(new URL("../src/App.css", import.meta.url), "utf8"),
  readFile(new URL("../src/TimerSessionProjection.tsx", import.meta.url), "utf8"),
]);

const requiredTokens = [
  "--font-family-ui",
  "--font-size-page-title",
  "--font-size-section-title",
  "--font-size-task-title",
  "--font-size-metadata",
  "--font-size-live-timer",
  "--font-weight-regular",
  "--font-weight-medium",
  "--font-weight-semibold",
  "--font-weight-bold",
  "--line-height-body",
  "--line-height-page-title",
  "--line-height-section-title",
  "--line-height-task-title",
  "--line-height-metadata",
  "--line-height-live-timer",
];

for (const token of requiredTokens) {
  const declarationCount = [
    ...typographyCss.matchAll(new RegExp(`${escapedPattern(token)}\\s*:`, "g")),
  ].length;
  invariant(declarationCount === 1, `${token} must be declared exactly once; found ${declarationCount}`);
}

invariant(
  typographyCss.includes(
    '--font-family-ui: "Segoe UI Variable", "Segoe UI", system-ui, sans-serif;',
  ),
  "Windows-first Segoe UI Variable / Segoe UI / system fallback stack is missing",
);

for (const selector of [
  ".type-page-title",
  ".type-section-title",
  ".type-task-title",
  ".type-metadata",
  ".type-live-timer",
  ".timer-numerals",
  '[data-timer-numerals="true"]',
]) {
  invariant(typographyCss.includes(selector), `missing reusable typography selector ${selector}`);
}

invariant(
  typographyCss.includes("font-variant-numeric: tabular-nums"),
  "timer numeral primitive must enable tabular figures",
);
invariant(
  typographyCss.includes('font-feature-settings: "tnum" 1'),
  "timer numeral primitive must explicitly request the OpenType tnum feature",
);

invariant(
  /^@import "\.\/theme\.css";\r?\n@import "\.\/typography\.css";/.test(appCss),
  "App.css must import theme first and shared typography second",
);
invariant(
  appCss.includes("font-family: var(--font-family-ui)"),
  "shared application styles must consume the UI font-family token",
);
invariant(
  !/\b(?:Inter|Avenir|Helvetica)\b/.test(appCss),
  "legacy non-Windows scaffold font families must not remain in App.css",
);

invariant(
  timerProjection.includes('className="type-metadata"'),
  "timer projection must consume the metadata typography role",
);
invariant(
  timerProjection.includes('className="timer-numerals"'),
  "timer projection must exercise the tabular timer numeral primitive",
);
invariant(
  timerProjection.includes('data-timer-numerals="true"'),
  "timer projection must expose the reusable timer numeral data hook",
);

console.log("UI typography contract: PASS");
