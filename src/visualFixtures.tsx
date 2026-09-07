import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import "./App.css";
import "./visualFixtures.css";

const theme = new URLSearchParams(window.location.search).get("theme") === "dark" ? "dark" : "light";
document.documentElement.dataset.theme = theme;
document.body.classList.add("visual-fixture-body");

function VisualFixtureSurface() {
  return (
    <main className="visual-fixture" data-visual-fixture="foundation">
      <section className="visual-fixture__card">
        <div>
          <h1 className="visual-fixture__title type-section-title">Foundation fixture</h1>
          <p className="visual-fixture__meta type-metadata">Stable geometry · {theme} theme</p>
        </div>
        <p className="visual-fixture__timer type-live-timer" data-timer-numerals="true">
          12:34
        </p>
        <button type="button" className="visual-fixture__button motion-interactive">
          Primary action
        </button>
      </section>

      <section className="visual-fixture__states" aria-label="Semantic state colors">
        <div className="visual-fixture__swatch visual-fixture__swatch--accent" aria-label="Accent" />
        <div className="visual-fixture__swatch visual-fixture__swatch--success" aria-label="Success" />
        <div className="visual-fixture__swatch visual-fixture__swatch--warning" aria-label="Warning" />
        <div className="visual-fixture__swatch visual-fixture__swatch--destructive" aria-label="Destructive" />
      </section>
    </main>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Visual fixture root is missing.");
}

flushSync(() => {
  createRoot(rootElement).render(<VisualFixtureSurface />);
});

type VisualContractNode = {
  width?: number;
  height?: number;
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  fontSize?: string;
  lineHeight?: string;
  fontVariantNumeric?: string;
};

function readVisualNode(selector: string, fields: Array<keyof VisualContractNode>): VisualContractNode {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error(`Visual fixture selector is missing: ${selector}`);
  }

  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  const values: VisualContractNode = {};

  for (const field of fields) {
    if (field === "width") values.width = Math.round(rect.width);
    if (field === "height") values.height = Math.round(rect.height);
    if (field === "backgroundColor") values.backgroundColor = style.backgroundColor;
    if (field === "color") values.color = style.color;
    if (field === "borderRadius") values.borderRadius = style.borderRadius;
    if (field === "fontSize") values.fontSize = style.fontSize;
    if (field === "lineHeight") values.lineHeight = style.lineHeight;
    if (field === "fontVariantNumeric") values.fontVariantNumeric = style.fontVariantNumeric;
  }

  return values;
}

const visualContract = {
  theme,
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  canvas: readVisualNode("body", ["backgroundColor", "color"]),
  panel: readVisualNode(".visual-fixture", ["width", "height", "backgroundColor", "borderRadius"]),
  card: readVisualNode(".visual-fixture__card", ["width", "height", "backgroundColor", "borderRadius"]),
  button: readVisualNode(".visual-fixture__button", ["width", "height", "backgroundColor", "color", "borderRadius"]),
  timer: readVisualNode(".visual-fixture__timer", ["color", "fontSize", "lineHeight", "fontVariantNumeric"]),
};

const contractNode = document.createElement("script");
contractNode.id = "visual-contract";
contractNode.type = "application/json";
contractNode.textContent = JSON.stringify(visualContract);
document.body.append(contractNode);
document.documentElement.dataset.visualFixtureReady = "true";
