import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function invariant(condition, message) {
  if (!condition) throw new Error(`Focus icon-tooltip contract failed: ${message}`);
}

function occurrences(source, needle) {
  return source.split(needle).length - 1;
}

const panel = read("src/FocusPanel.tsx");
const liveSubtasks = read("src/FocusLiveSubtasks.tsx");
const liveMetrics = read("src/FocusLiveMetrics.tsx");
const sharedSubtasks = read("src/TaskSubtasks.tsx");
const notes = read("src/TaskNotes.tsx");
const overlay = read("src/overlayPrimitives.tsx");
const slotCss = read("src/focusActionSlots.css");
const panelCss = read("src/focusPanel.css");
const metricCss = read("src/focusLiveMetrics.css");
const pkg = JSON.parse(read("package.json"));
const quickDisabledCss = slotCss.match(
  /\.focus-panel__quick-controls button\[aria-disabled="true"\] \{([\s\S]*?)\}/,
)?.[1] ?? "";

invariant(panel.includes('import { Tooltip } from "./overlayPrimitives";'), "Focus quick controls must reuse the shared Tooltip primitive");
invariant(panel.includes('<Tooltip content="Preferences">'), "Preferences icon must expose a shared tooltip");
invariant(panel.includes('aria-disabled="true" aria-label="Preferences" data-focus-placeholder-control="preferences"'), "Preferences placeholder must retain an accessible disabled name without becoming active");
invariant(panel.includes('<Tooltip content="Compact view">'), "Compact-view icon must expose a shared tooltip");
invariant(panel.includes('aria-disabled="true" aria-label="Compact view" data-focus-placeholder-control="compact-view"'), "Compact-view placeholder must retain an accessible disabled name without becoming active");
invariant(occurrences(panel, 'data-focus-placeholder-control=') === 2, "only the two icon-only quick placeholders should use the tooltip-discoverable aria-disabled contract");
invariant(!panel.includes('title="Preferences"'), "Preferences must not stack a native title tooltip on top of the shared tooltip");
invariant(!panel.includes('title="Compact view"'), "Compact view must not stack a native title tooltip on top of the shared tooltip");
invariant(panel.includes('<button type="button" disabled aria-label="Home" title="Home">Home</button>'), "text-labeled Home placeholder must remain outside the icon-only tooltip slice");
invariant(!panel.includes('data-focus-placeholder-control="preferences" onClick='), "Preferences placeholder must not gain behavior in item 14");
invariant(!panel.includes('data-focus-placeholder-control="compact-view" onClick='), "Compact-view placeholder must not gain behavior in item 14");

invariant(liveSubtasks.includes('import { Tooltip } from "./overlayPrimitives";'), "Focus live subtasks must reuse the shared Tooltip primitive");
invariant(liveSubtasks.includes('<Tooltip content="Add subtask">'), "icon-only Focus subtask add control needs a tooltip");
invariant(liveSubtasks.includes('data-focus-subtask-control="add"'), "Focus subtask add control must remain the established control");
invariant(liveSubtasks.includes('aria-label={`Add subtask for ${task.title}`}'), "Focus subtask add control must retain its contextual accessible name");

invariant(liveMetrics.includes('import { Tooltip } from "./overlayPrimitives";'), "paused metric icon controls must reuse the shared Tooltip primitive");
invariant(liveMetrics.includes('<Tooltip content={`Cancel ${metricLabel(metric)} edit`}>'), "metric cancel icon needs a contextual tooltip");
invariant(liveMetrics.includes('<Tooltip content={`Save ${metricLabel(metric)}`}>'), "metric save icon needs a contextual tooltip");
invariant(liveMetrics.includes('aria-label={`Cancel ${metricLabel(metric)} edit`}'), "metric cancel icon must retain its accessible name");
invariant(liveMetrics.includes('aria-label={`Save ${metricLabel(metric)}`}'), "metric save icon must retain its accessible name");

invariant(sharedSubtasks.includes('<Tooltip content={completed ? "Reopen subtask" : "Complete subtask"}>'), "existing complete/reopen subtask tooltip must remain intact");
invariant(sharedSubtasks.includes('<Tooltip content="Move subtask up">'), "existing Move up subtask tooltip must remain intact");
invariant(sharedSubtasks.includes('<Tooltip content="Move subtask down">'), "existing Move down subtask tooltip must remain intact");
invariant(sharedSubtasks.includes('<Tooltip content="Delete subtask">'), "existing Delete subtask tooltip must remain intact");
invariant(notes.includes('import { Tooltip } from "./overlayPrimitives";'), "existing Notes icon tooltips must remain on the shared primitive");

invariant(overlay.includes('"aria-describedby": describedBy'), "shared Tooltip must associate content with its trigger");
invariant(overlay.includes("onPointerEnter: mergeHandler("), "shared Tooltip must support pointer discovery");
invariant(overlay.includes("onFocus: mergeHandler("), "shared Tooltip must support keyboard-focus discovery");
invariant(overlay.includes('if (event.key === "Escape")'), "shared Tooltip must remain dismissible with Escape");

invariant(quickDisabledCss.length > 0, "keyboard-discoverable quick placeholders must keep disabled visual treatment");
invariant(quickDisabledCss.includes("cursor: default"), "quick placeholders must remain visually non-actionable");
invariant(quickDisabledCss.includes("opacity: 0.65"), "quick placeholders must retain disabled emphasis");
invariant(!quickDisabledCss.includes("pointer-events: none"), "quick placeholder triggers must stay hover-discoverable for tooltips");
invariant(panelCss.includes("grid-template-columns: minmax(88px, 1fr) auto minmax(112px, 1fr)"), "Focus topbar geometry must remain unchanged");
invariant(panelCss.includes(".focus-panel__quick-controls { display: flex; justify-content: flex-end; gap: var(--space-1); }"), "quick-control slot geometry must remain stable");
invariant(metricCss.includes("grid-template-columns: repeat(2, 2.25rem)"), "metric action hit slots must remain fixed while adding tooltips");
invariant(metricCss.includes("width: 4.75rem"), "metric action rail width must remain unchanged");

invariant(pkg.scripts["test:ui-focus-icon-tooltips"] === "node scripts/test-ui-focus-icon-tooltips.mjs", "package script registration differs");
invariant(pkg.scripts["preflight:frontend"].includes("npm run test:ui-focus-icon-tooltips"), "frontend preflight must run the Focus icon-tooltip contract");

console.log("Focus icon-only tooltip, accessibility, and stable-geometry contracts passed.");
