import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/overlayPrimitives.tsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const css = fs.readFileSync(new URL("../src/overlayPrimitives.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const appCss = fs.readFileSync(new URL("../src/App.css", import.meta.url), "utf8").replace(/\r\n/g, "\n");

const requireText = (haystack, needle, label) => {
  if (!haystack.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
};

for (const [needle, label] of [
  ['role="tooltip"', "tooltip role"],
  ['aria-describedby', "tooltip description relationship"],
  ['aria-haspopup="dialog"', "popover trigger semantics"],
  ['role="dialog"', "popover dialog role"],
  ['aria-haspopup="menu"', "menu trigger semantics"],
  ['role="menu"', "menu role"],
  ['role="menuitem"', "menu item role"],
  ['event.key === "Escape"', "Escape handling"],
  ['event.key === "ArrowDown"', "ArrowDown menu navigation"],
  ['event.key === "ArrowUp"', "ArrowUp menu navigation"],
  ['event.key === "Home"', "Home menu navigation"],
  ['event.key === "End"', "End menu navigation"],
  ['document.addEventListener("pointerdown"', "outside pointer dismissal"],
  ['target.closest(\'[role="menuitem"]:not(:disabled)\')', "menu selection dismissal"],
  ['triggerRef.current?.focus()', "focus restoration"],
]) {
  requireText(source, needle, label);
}

for (const [needle, label] of [
  ["position: absolute;", "overlay geometry isolation"],
  ["position: relative;", "anchor positioning"],
  ["pointer-events: none;", "closed overlay pointer isolation"],
  ['[data-open="true"]', "explicit open state styling"],
  ["var(--motion-duration-tooltip)", "tooltip motion token"],
  ["var(--motion-distance-overlay)", "overlay motion distance token"],
  ["@media (prefers-reduced-motion: reduce)", "reduced-motion override"],
  ["transform: none;", "reduced-motion transform removal"],
]) {
  requireText(css, needle, label);
}

requireText(appCss, '@import "./overlayPrimitives.css";', "primitive stylesheet import");

console.log("Overlay primitive contract checks passed.");
