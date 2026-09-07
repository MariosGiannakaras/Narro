import { readFile } from "node:fs/promises";

function invariant(condition, message) {
  if (!condition) {
    throw new Error(`UI reduced-motion invariant failed: ${message}`);
  }
}

function escapedPattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const [motionCss, appCss] = await Promise.all([
  readFile(new URL("../src/motion.css", import.meta.url), "utf8"),
  readFile(new URL("../src/App.css", import.meta.url), "utf8"),
]);

const reducedMotionMarker = "@media (prefers-reduced-motion: reduce)";
const markerCount = motionCss.split(reducedMotionMarker).length - 1;
invariant(markerCount === 1, `expected one reduced-motion media query; found ${markerCount}`);

const reducedMotionIndex = motionCss.indexOf(reducedMotionMarker);
const normalMotionCss = motionCss.slice(0, reducedMotionIndex);
const reducedMotionCss = motionCss.slice(reducedMotionIndex);

invariant(
  /--motion-duration-reduced\s*:\s*1ms\s*;/.test(normalMotionCss),
  "normal motion root must define a 1ms reduced duration token",
);

for (const token of [
  "--motion-duration-press",
  "--motion-duration-hover-focus",
  "--motion-duration-tooltip",
  "--motion-duration-popover",
  "--motion-duration-inline",
  "--motion-duration-modal",
  "--motion-duration-reorder",
  "--motion-duration-completion",
  "--motion-duration-chart-filter",
  "--motion-duration-focus-surface",
]) {
  invariant(
    new RegExp(
      `${escapedPattern(token)}\\s*:\\s*var\\(--motion-duration-reduced\\)\\s*;`,
    ).test(reducedMotionCss),
    `${token} must collapse to the reduced duration token`,
  );
}

invariant(
  !/--motion-delay-tooltip-intent\s*:/.test(reducedMotionCss),
  "tooltip intent delay must remain independent from reduced animation duration",
);

for (const [token, value] of [
  ["--motion-distance-lift", "0rem"],
  ["--motion-distance-overlay", "0rem"],
  ["--motion-scale-press", "1"],
  ["--motion-scale-drag", "1"],
]) {
  invariant(
    new RegExp(`${escapedPattern(token)}\\s*:\\s*${escapedPattern(value)}\\s*;`).test(
      reducedMotionCss,
    ),
    `${token} must reduce to ${value}`,
  );
}

const reducedTransitionProperties = [
  ...reducedMotionCss.matchAll(/transition-property:\s*([^;]+);/g),
];
invariant(
  reducedTransitionProperties.length === 3,
  `expected three reduced transition-property declarations; found ${reducedTransitionProperties.length}`,
);

for (const match of reducedTransitionProperties) {
  const properties = match[1].split(",").map((property) => property.trim());
  invariant(!properties.includes("transform"), "reduced motion must not interpolate transform");
}

invariant(
  reducedMotionCss.includes(
    "transition-property: color, background-color, border-color, opacity, box-shadow;",
  ),
  "interactive reduced motion must preserve stable visual-state properties without transform",
);
invariant(
  reducedMotionCss.includes("transition-property: opacity;"),
  "overlay/inline/modal/reorder/focus reduced motion must retain immediate opacity state projection",
);
invariant(
  reducedMotionCss.includes("transition-property: color, opacity;"),
  "completion reduced motion must retain color/opacity state projection without transform",
);

for (const selector of [
  ".motion-interactive",
  ".motion-overlay",
  ".motion-inline",
  ".motion-modal",
  ".motion-reorder",
  ".motion-completion",
  ".motion-focus-surface",
]) {
  invariant(reducedMotionCss.includes(selector), `missing reduced-motion coverage for ${selector}`);
}

invariant(
  (reducedMotionCss.match(/transition-delay:\s*0ms\s*;/g) ?? []).length === 1,
  "shared reduced-motion primitives must clear transition delay exactly once",
);
invariant(!/transform\s*:/.test(reducedMotionCss), "reduced-motion block must not force transform state");
invariant(!/display\s*:\s*none\b/i.test(reducedMotionCss), "reduced motion must not hide state with display:none");
invariant(
  !/visibility\s*:\s*hidden\b/i.test(reducedMotionCss),
  "reduced motion must not hide state with visibility:hidden",
);
invariant(!/animation(?:-\w+)?\s*:/i.test(reducedMotionCss), "reduced motion must not start animations");

invariant(
  /^@import "\.\/theme\.css";\r?\n@import "\.\/typography\.css";\r?\n@import "\.\/geometry\.css";\r?\n@import "\.\/motion\.css";/.test(
    appCss,
  ),
  "App.css must continue to import the shared motion layer after theme/typography/geometry",
);

console.log("UI reduced-motion contract: PASS");
