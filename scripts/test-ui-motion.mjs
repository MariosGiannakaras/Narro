import { readFile } from "node:fs/promises";

function invariant(condition, message) {
  if (!condition) {
    throw new Error(`UI motion invariant failed: ${message}`);
  }
}

function escapedPattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const [motionCss, appCss] = await Promise.all([
  readFile(new URL("../src/motion.css", import.meta.url), "utf8"),
  readFile(new URL("../src/App.css", import.meta.url), "utf8"),
]);

const expectedTokens = new Map([
  ["--motion-duration-press", "80ms"],
  ["--motion-duration-hover-focus", "120ms"],
  ["--motion-duration-tooltip", "140ms"],
  ["--motion-delay-tooltip-intent", "400ms"],
  ["--motion-duration-popover", "150ms"],
  ["--motion-duration-inline", "180ms"],
  ["--motion-duration-modal", "200ms"],
  ["--motion-duration-reorder", "180ms"],
  ["--motion-duration-completion", "220ms"],
  ["--motion-duration-chart-filter", "300ms"],
  ["--motion-duration-focus-surface", "150ms"],
  ["--motion-ease-enter", "cubic-bezier(0.2, 0.8, 0.2, 1)"],
  ["--motion-ease-exit", "cubic-bezier(0.4, 0, 1, 1)"],
  ["--motion-distance-lift", "0.0625rem"],
  ["--motion-distance-overlay", "0.25rem"],
  ["--motion-scale-press", "0.98"],
  ["--motion-scale-drag", "1.0125"],
]);

for (const [token, value] of expectedTokens) {
  const declaration = new RegExp(`${escapedPattern(token)}\\s*:\\s*${escapedPattern(value)}\\s*;`, "g");
  const declarationCount = [...motionCss.matchAll(declaration)].length;
  invariant(declarationCount === 1, `${token} must equal ${value} exactly once; found ${declarationCount}`);
}

const durationBands = new Map([
  ["--motion-duration-press", [70, 90]],
  ["--motion-duration-hover-focus", [110, 140]],
  ["--motion-duration-tooltip", [120, 150]],
  ["--motion-delay-tooltip-intent", [350, 500]],
  ["--motion-duration-popover", [130, 160]],
  ["--motion-duration-inline", [160, 200]],
  ["--motion-duration-modal", [180, 220]],
  ["--motion-duration-reorder", [160, 200]],
  ["--motion-duration-completion", [200, 260]],
  ["--motion-duration-chart-filter", [250, 400]],
  ["--motion-duration-focus-surface", [120, 180]],
]);

for (const [token, [minimum, maximum]] of durationBands) {
  const match = motionCss.match(new RegExp(`${escapedPattern(token)}\\s*:\\s*(\\d+)ms\\s*;`));
  invariant(match, `${token} must be expressed in milliseconds`);
  const value = Number(match[1]);
  invariant(value >= minimum && value <= maximum, `${token}=${value}ms is outside ${minimum}-${maximum}ms`);
}

for (const selector of [
  ".motion-interactive",
  ".motion-overlay",
  ".motion-inline",
  ".motion-modal",
  ".motion-reorder",
  ".motion-completion",
  ".motion-focus-surface",
  ".motion-exit",
]) {
  invariant(motionCss.includes(selector), `missing reusable motion selector ${selector}`);
}

const allowedTransitionProperties = new Set([
  "color",
  "background-color",
  "border-color",
  "opacity",
  "box-shadow",
  "transform",
]);

for (const match of motionCss.matchAll(/transition-property:\s*([^;]+);/g)) {
  const properties = match[1].split(",").map((property) => property.trim());
  invariant(properties.length > 0, "transition-property must list at least one property");
  for (const property of properties) {
    invariant(allowedTransitionProperties.has(property), `unsafe transition property ${property}`);
  }
}

invariant(!/transition\s*:\s*all\b/i.test(motionCss), "transition: all is prohibited");
invariant(!/@keyframes\b/i.test(motionCss), "shared motion foundation must not define keyframes");
invariant(!/animation(?:-\w+)?\s*:/i.test(motionCss), "shared motion foundation must not start animations");
invariant(!/backdrop-filter\s*:/i.test(motionCss), "shared motion foundation must not animate backdrop filters");
invariant(
  !/prefers-reduced-motion/i.test(motionCss),
  "reduced-motion behavior is the next separate ordered M5 item, not part of this slice",
);

invariant(
  /^@import "\.\/theme\.css";\r?\n@import "\.\/typography\.css";\r?\n@import "\.\/geometry\.css";\r?\n@import "\.\/motion\.css";/.test(
    appCss,
  ),
  "App.css must import theme, typography, geometry, then motion primitives",
);

invariant(
  motionCss.includes("transition-timing-function: var(--motion-ease-exit)"),
  "exit modifier must consume the dedicated exit easing token",
);

console.log("UI motion foundation contract: PASS");
