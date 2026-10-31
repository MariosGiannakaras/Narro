import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as jsxRuntime from "react/jsx-runtime";
let state = { snapshot: null, monitors: [], loading: true, error: null, save() {}, refreshMonitors() {}, retryInitialLoad() {} };
const source = readFileSync(new URL("../src/ThemeSettingsPanel.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { module, exports: module.exports, require(id) {
 if (id === "react") return React;
 if (id === "react/jsx-runtime") return jsxRuntime;
 if (id === "./PreferenceSettingsRuntime") return { PreferenceSettingsRuntimeProvider: ({children}) => children, usePreferenceSettingsRuntime: () => state };
 if (id === "./ThemeRuntime") return { useThemeRuntime: () => ({ theme: "light", pending: false, error: null, saveTheme() {} }) };
 if (id === "./PreferenceSettingsSections") return Object.fromEntries(["BlitzPanelPreferenceSection", "GeneralPreferenceRows", "LowerPreferenceSections", "TimePreferenceRows"].map(name => [name, () => React.createElement("div", null, name)]));
 if (id === "./WindowsShortcutSettingsPanel") return { WindowsShortcutSettingsPanel: () => null };
 if (id.endsWith(".css")) return {};
 throw new Error("Unexpected module " + id);
}});
const render = () => renderToStaticMarkup(React.createElement(module.exports.ThemeSettingsPanel, {onOpenShortcuts() {}}));
let html = render();
assert.match(html, /data-preferences-skeleton="true"/);
assert.match(html, /aria-busy="true"/);
assert.doesNotMatch(html, /Loading Preferences|View shortcuts|BlitzPanelPreferenceSection|GeneralPreferenceRows/,
 "Initial load must present an inert skeleton without Loading text or premature controls");
state = {...state, loading: false, error: "offline"}; html = render();
assert.match(html, /role="alert"/); assert.match(html, /data-preferences-retry="true"/);
assert.doesNotMatch(html, /View shortcuts|GeneralPreferenceRows/);
state = {...state, snapshot: {}, error: null}; html = render();
assert.match(html, /BlitzPanelPreferenceSection/); assert.match(html, /GeneralPreferenceRows/);
assert.match(html, /View shortcuts/); assert.doesNotMatch(html, /data-preferences-skeleton|Loading Preferences/);
state = {...state, pendingKey: "monitor", error: "save failed"}; html = render();
assert.match(html, /GeneralPreferenceRows/); assert.match(html, /save failed/);
assert.doesNotMatch(html, /data-preferences-skeleton|Loading Preferences/);
const quickSource = readFileSync(new URL("../src/FocusQuickPreferences.tsx", import.meta.url), "utf8");
// Render the real Quick Preferences React owner under the same initial,
// rejected-load, ready, and saving states as Full Preferences. Merely matching
// source strings cannot establish that the loading branch is actually used.
let quickState = { snapshot: null, monitors: [], loading: true, error: null, pendingKey: null,
  save() {}, retryInitialLoad() {} };
const quickCompiled = ts.transpileModule(quickSource, { compilerOptions: {
  jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
} }).outputText;
const quickModule = { exports: {} };
vm.runInNewContext(quickCompiled, { module: quickModule, exports: quickModule.exports, require(id) {
 if (id === "react") return React;
 if (id === "react/jsx-runtime") return jsxRuntime;
 if (id === "./ActionIcon") return { ActionIcon: ({ name }) => React.createElement("i", { "data-icon": name }) };
 if (id === "./diagnosticApi") return {
   findSelectedMonitor: () => null, formatInvokeError: (error) => String(error),
 };
 if (id === "./focusSurfaceModeApi") return { applyFocusSurfacePresentation: async () => {} };
 if (id === "./quickPreferenceLivePlacement") return { saveQuickPreferenceWithLivePlacement: async () => true };
 if (id === "./PreferenceSettingsRuntime") return {
   PreferenceSettingsRuntimeProvider: ({ children }) => children,
   usePreferenceSettingsRuntime: () => quickState,
 };
 if (id.endsWith(".css")) return {};
 throw new Error("Unexpected Quick Preferences module " + id);
}});
const renderQuick = () => renderToStaticMarkup(
  React.createElement(quickModule.exports.FocusQuickPreferences, { onBack() {} }),
);
let quickHtml = renderQuick();
assert.match(quickHtml, /data-focus-quick-skeleton="true"/);
assert.match(quickHtml, /aria-label="Preparing Quick Preferences"/);
assert.doesNotMatch(quickHtml, /Loading Quick Preferences|role="radiogroup"|data-focus-quick-preferences-retry/,
  "Preparing Quick Preferences must not render interactive settings or Retry prematurely");
quickState = { ...quickState, loading: false, error: "Monitor list unavailable" };
quickHtml = renderQuick();
assert.match(quickHtml, /role="alert"/);
assert.match(quickHtml, /data-focus-quick-preferences-retry="true"/);
assert.doesNotMatch(quickHtml, /data-focus-quick-skeleton|role="radiogroup"/);
quickState = { ...quickState, snapshot: {
  general: { selectedMonitorKey: null, focusPanelSide: "right", hideTaskTimes: false },
  focus: { pomodoroEnabled: false },
  alerts: { timedAlertsEnabled: false, notificationAlertsEnabled: false },
  celebration: { showSuccessScreen: false, funGif: false },
}, error: null };
quickHtml = renderQuick();
assert.match(quickHtml, /role="radiogroup"/);
assert.match(quickHtml, /aria-label="Blitz Panel Side"/);
assert.doesNotMatch(quickHtml, /data-focus-quick-skeleton|data-focus-quick-preferences-retry|Loading Quick Preferences/);
quickState = { ...quickState, pendingKey: "side" };
quickHtml = renderQuick();
assert.match(quickHtml, /Saving…/);
assert.match(quickHtml, /data-focus-quick-preferences-back="true" disabled=""/);
assert.match(quickHtml, /role="radio"[^>]*disabled=""/);
const quickCss = readFileSync(new URL("../src/focusQuickPreferences.css", import.meta.url), "utf8");
const prefCss = readFileSync(new URL("../src/preferenceSettingsSections.css", import.meta.url), "utf8");
assert.match(quickSource, /data-focus-quick-skeleton="true"/);
assert.match(quickSource, /data-focus-quick-preferences-retry="true"/);
assert.doesNotMatch(quickSource, /Loading Quick Preferences/);
assert.match(quickCss, /prefers-reduced-motion: reduce/);
assert.match(prefCss, /prefers-reduced-motion: reduce/);
assert.match(prefCss, /narro-preferences-ready/);
console.log("Preferences and Quick Preferences stable skeleton/error/ready/reduced-motion contracts: PASS");
