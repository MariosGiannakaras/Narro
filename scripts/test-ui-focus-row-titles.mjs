import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus row-title contract failed: ${message}`);
}

const panel = read("src/FocusPanel.tsx");
const title = read("src/FocusTaskRowTitle.tsx");
const css = read("src/focusTaskRowTitle.css");
const overlay = read("src/overlayPrimitives.tsx");
const fixture = read("src/focusPanelVisualFixture.tsx");
const pkg = JSON.parse(read("package.json"));

invariant(panel.includes('import { FocusTaskRowTitle } from "./FocusTaskRowTitle";'), "ordinary title component import is missing");
invariant((panel.match(/<FocusTaskRowTitle/g) ?? []).length === 1, "ordinary Focus rows must use one shared row-title component path");
invariant(panel.includes('<FocusLiveTitle title={liveTask.title} scrollingEnabled={scrollingTitleEnabled} />'), "active/live title path must remain separate");
invariant(title.includes('import { Tooltip } from "./overlayPrimitives";'), "full-title disclosure must reuse the validated Tooltip primitive");
invariant(title.includes('data-focus-task-title="true"'), "ordinary title marker is missing");
invariant(title.includes("tabIndex={0}"), "ordinary truncated title must be keyboard focusable");
invariant(title.includes("aria-label={`Task title: ${title}`}"), "ordinary title accessible label must expose full text");
invariant(overlay.includes('"aria-describedby": describedBy'), "Tooltip primitive must associate its content with the focused trigger");
invariant(overlay.includes("onFocus: mergeHandler("), "Tooltip primitive must support keyboard focus disclosure");
invariant(css.includes(".focus-panel__task-title-row > .overlay-anchor--inline"), "Tooltip wrapper must participate in the existing title-row flex slot");
invariant(css.includes("flex: 1 1 auto"), "Tooltip wrapper must not steal a fixed-width title slot");
invariant(css.includes("-webkit-line-clamp: 2"), "ordinary task titles must clamp to two lines");
invariant(css.includes("white-space: normal"), "ordinary task titles must allow wrapping");
invariant(css.includes("overflow: hidden"), "ordinary task titles must remain compact after two lines");
invariant(css.includes("overflow-wrap: anywhere"), "long unbroken titles must not overflow the row");
invariant(css.includes(":focus-visible"), "keyboard title focus needs a visible focus state");
invariant(!css.includes("animation:"), "ordinary row titles must not introduce continuous animation");
invariant(!css.includes("transform:"), "ordinary row-title wrapping must not move sibling geometry");
invariant(fixture.includes("Plan weekend errands and confirm the pickup route before leaving home"), "visual fixture must contain a deliberately overflowing ordinary title");
invariant(fixture.includes('longTitle: titleContract(`${longRowSelector} [data-focus-task-title="true"]`)'), "visual fixture must record long-title computed layout");
invariant(pkg.scripts["test:ui-focus-row-titles"] === "node scripts/test-ui-focus-row-titles.mjs", "package script registration differs");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-row-titles"), "frontend preflight must run the row-title contract");
invariant(pkg.scripts["test:visual-regression:windows"].includes("validate-focus-row-title-captures.mjs"), "Windows visual validation must check the two-line title fixture");

console.log("Focus ordinary row-title wrapping and accessible full-title contracts passed.");
