import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (file) => readFileSync(new URL(file, root), "utf8").replace(/\r\n/g, "\n");
const app = read("src/App.css");
const modalCss = read("src/preferencesDialog.css");
const pickerCss = read("src/boardListPicker.css");
const shortcutDialogCss = read("src/windowsShortcutsDialog.css");
const modal = read("src/PreferencesDialog.tsx");
const picker = read("src/BoardListPicker.tsx");
const shortcutDialog = read("src/WindowsShortcutsDialog.tsx");
const icons = read("src/ActionIcon.tsx");
const fixture = read("src/themeSettingsVisualFixture.tsx");
const board = read("src/ListBoard.tsx");
const focus = read("src/FocusPanel.tsx");

function declarations(sheet, selector) {
  const clean = sheet.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const match of clean.matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
    if (!match[1].split(",").map(value => value.trim()).includes(selector)) continue;
    return new Map(match[2].split(";").map(value => value.trim()).filter(Boolean).map(value => {
      const colon = value.indexOf(":");
      assert.ok(colon > 0, "Malformed CSS declaration in " + selector);
      return [value.slice(0, colon).trim(), value.slice(colon + 1).trim()];
    }));
  }
  throw Error("Missing CSS selector " + selector);
}
function verify(rule, entries) {
  for (const [key, expected] of Object.entries(entries))
    assert.equal(rule.get(key), expected, "Wrong " + key + " for icon geometry");
}
const base = declarations(app, "button");
assert.equal(base.get("padding"), "var(--space-2) var(--space-3)",
  "Global button padding is nonzero and must not leak into small icon-only controls");
const close = declarations(modalCss, ".preferences-dialog__close");
verify(close, {
  "box-sizing": "border-box",
  "display": "grid",
  "place-items": "center",
  "width": "2rem", "min-width": "2rem",
  "height": "2rem", "min-height": "2rem",
  "padding": "0",
  "border": "1px solid var(--color-border-subtle)",
});
assert.ok(!["transform", "translate", "scale"].some(key => close.has(key)),
  "Geometry must be centered by layout, not arbitrary transforms");
assert.match(modal, /aria-label="Close Preferences"/);
assert.match(modal, /data-preferences-close="true"/);
assert.match(modal, /<ActionIcon name="close" \/>/);
assert.match(modal, /onClick=\{onRequestClose\}/);
assert.match(modal, /if \(event.key === "Escape"\)/);
assert.match(modal, /aria-modal="true"/);
assert.match(fixture, /<PreferencesDialog\b/,
  "The actual Settings fixture must exercise the production Preferences Dialog");

// The dedicated light-appearance shortcut dialog is a second modal close
// owner, not a special-case padded 32px icon. Guard the same 16px SVG fit.
const shortcutClose = declarations(shortcutDialogCss, ".windows-shortcuts-dialog__close");
verify(shortcutClose, {
  "box-sizing": "border-box",
  "display": "grid",
  "place-items": "center",
  "flex": "0 0 2rem",
  "width": "2rem", "min-width": "2rem",
  "height": "2rem", "min-height": "2rem",
  "padding": "0",
  "border": "1px solid var(--color-border-subtle)",
});
assert.match(shortcutDialog, /data-windows-shortcuts-close="true"/);
assert.match(shortcutDialog, /aria-label="Close Windows Shortcuts"/);
assert.match(shortcutDialog, /<ActionIcon name="close" \/>/);
assert.match(shortcutDialog, /onClick=\{onRequestClose\}/);
assert.match(shortcutDialog, /aria-modal="true"/);
assert.ok(!["transform", "translate", "scale"].some(key => shortcutClose.has(key)));
assert.match(fixture, /<WindowsShortcutsDialog\b/,
  "Both production modal icon close controls must have a visual fixture");

const check = declarations(pickerCss, ".board-list-picker__check");
verify(check, {
  "display": "inline-grid", "place-items": "center",
  "width": "1rem", "min-width": "1rem",
  "color": "var(--color-accent-solid)",
});
assert.ok(![..."width height padding translate transform".split(" ")].some(key =>
  ["padding", "transform", "translate"].includes(key) && check.has(key)),
  "Selected checkmark must keep existing 16px footprint without nudges");
assert.match(picker, /className="board-list-picker__check">\{selectedTarget === option.id \? <ActionIcon name="check" \/> : null\}/);
assert.match(picker, /aria-selected=\{selectedTarget === option.id\}/);
assert.match(picker, /role="listbox"/);
assert.match(picker, /role="option"/);
assert.match(picker, /onClick=\{\(\) => choose\(option.id\)\}/);
assert.match(picker, /event.key === "ArrowDown"/);
assert.match(picker, /event.key === "Escape"/);
assert.ok(board.includes("BoardListPicker") && focus.includes("BoardListPicker"),
  "Both Planning Board and Focus reuse the same centered picker option");
assert.ok(icons.includes("width: size") && icons.includes("height: size")
  && icons.includes('viewBox: "0 0 24 24"'),
  "Decorative shared SVG and the locked offline List Editor icon catalog must remain unchanged");
console.log("Preferences + Windows Shortcuts 32px close and Board/Focus picker 16px check geometry PASS");
