import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { computeAnchoredOverlayPosition } from "../src/ui/overlayGeometry.ts";

function invariant(condition, message) {
  if (!condition) {
    throw new Error(`UI overlay invariant failed: ${message}`);
  }
}

const baseTrigger = {
  top: 100,
  right: 140,
  bottom: 120,
  left: 100,
  width: 40,
  height: 20,
};
const overlay = { width: 100, height: 50 };
const viewport = { width: 800, height: 600 };

assert.deepEqual(
  computeAnchoredOverlayPosition(baseTrigger, overlay, viewport, {
    preferredPlacement: "bottom",
    gap: 8,
    viewportPadding: 8,
  }),
  {
    top: 128,
    left: 70,
    placement: "bottom",
    transformOrigin: "center top",
  },
  "bottom placement must center below the trigger",
);

assert.deepEqual(
  computeAnchoredOverlayPosition(
    { ...baseTrigger, top: 550, bottom: 570 },
    overlay,
    viewport,
    { preferredPlacement: "bottom", gap: 8, viewportPadding: 8 },
  ),
  {
    top: 492,
    left: 70,
    placement: "top",
    transformOrigin: "center bottom",
  },
  "overlay must flip to the opposite side when preferred primary space is insufficient",
);

assert.equal(
  computeAnchoredOverlayPosition(
    { ...baseTrigger, left: 0, right: 40 },
    overlay,
    viewport,
    { preferredPlacement: "bottom", gap: 8, viewportPadding: 8 },
  ).left,
  8,
  "overlay must clamp to the viewport padding on the cross axis",
);

assert.deepEqual(
  computeAnchoredOverlayPosition(
    { top: 100, right: 780, bottom: 120, left: 740, width: 40, height: 20 },
    overlay,
    viewport,
    { preferredPlacement: "right", gap: 8, viewportPadding: 8 },
  ),
  {
    top: 85,
    left: 632,
    placement: "left",
    transformOrigin: "right center",
  },
  "right placement must flip left near the viewport edge",
);

const oversized = computeAnchoredOverlayPosition(
  baseTrigger,
  { width: 900, height: 700 },
  viewport,
  { preferredPlacement: "bottom", gap: 8, viewportPadding: 8 },
);
assert.equal(oversized.left, 8, "oversized overlays must fail-safe to left viewport padding");
assert.equal(oversized.top, 8, "oversized overlays must fail-safe to top viewport padding");

const [componentSource, cssSource] = await Promise.all([
  readFile(new URL("../src/ui/overlays.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/ui/overlays.css", import.meta.url), "utf8"),
]);

for (const requiredSource of [
  'role="tooltip"',
  '"aria-describedby"',
  '"aria-haspopup": "dialog"',
  '"aria-haspopup": "menu"',
  '"aria-expanded"',
  '"aria-controls"',
  'role="dialog"',
  'role="menu"',
  'role="menuitem"',
  'role="separator"',
  'event.key === "Escape"',
  'case "ArrowDown"',
  'case "ArrowUp"',
  'case "Home"',
  'case "End"',
  "createPortal(",
  "ResizeObserver",
  'addEventListener("resize"',
  'addEventListener("scroll"',
]) {
  invariant(componentSource.includes(requiredSource), `missing component contract: ${requiredSource}`);
}

invariant(
  componentSource.includes("itemRefs.current[activeIndex]?.focus()"),
  "menu keyboard navigation must project active item focus",
);
invariant(
  componentSource.includes("focusTrigger(triggerRef)"),
  "dismissal must support returning focus to the trigger",
);
invariant(
  componentSource.includes("firstEnabledIndex(items)") &&
    componentSource.includes("lastEnabledIndex(items)") &&
    componentSource.includes("nextEnabledIndex(items"),
  "menu navigation must skip disabled items through shared enabled-index helpers",
);
invariant(!/setInterval\s*\(/.test(componentSource), "overlay primitives must not poll with setInterval");
invariant(!/transition\s*:\s*all\b/i.test(cssSource), "overlay CSS must not use transition: all");

invariant(/\.ui-overlay\s*\{[^}]*position:\s*fixed\s*;/s.test(cssSource), "overlays must be fixed-positioned");
invariant(
  /\.ui-overlay\[data-unmeasured="true"\]\s*\{[^}]*visibility:\s*hidden\s*;/s.test(cssSource),
  "unmeasured portal content must not flash at an incorrect position",
);
invariant(
  /\.ui-tooltip\s*\{[^}]*pointer-events:\s*none\s*;/s.test(cssSource),
  "tooltips must not steal pointer interaction from their trigger",
);
invariant(
  /\.ui-popover,\s*\n\.ui-menu\s*\{[^}]*max-height:\s*calc\(100vh/s.test(cssSource),
  "interactive overlays must remain bounded by viewport height",
);
invariant(
  cssSource.includes("var(--elevation-overlay)") &&
    cssSource.includes("var(--radius-panel)") &&
    cssSource.includes("var(--color-border-subtle)"),
  "overlay primitives must consume existing semantic geometry/theme roles",
);

console.log("UI overlay primitives contract: PASS");
