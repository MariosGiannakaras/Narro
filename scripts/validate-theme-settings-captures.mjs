import { readFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";
import { resolve } from "node:path";

function invariant(condition, message) {
  if (!condition) throw new Error(`Theme settings capture invariant failed: ${message}`);
}

const root = resolve(process.cwd(), "artifacts", "visual-regression");

async function read(label) {
  return readFile(resolve(root, `${label}.html`), "utf8");
}

async function assertRenderedScreenshot(label) {
  const png = await readFile(resolve(root, `${label}.png`));
  invariant(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${label} is not a PNG`);
  const idat = [];
  for (let at = 8; at + 12 <= png.length;) {
    const size = png.readUInt32BE(at);
    const end = at + 12 + size;
    invariant(end <= png.length, `${label} PNG chunk is truncated`);
    const kind = png.toString("ascii", at + 4, at + 8);
    if (kind === "IDAT") idat.push(png.subarray(at + 8, at + 8 + size));
    at = end;
    if (kind === "IEND") break;
  }
  invariant(idat.length > 0, `${label} PNG contains no image data`);
  const pixels = inflateSync(Buffer.concat(idat));
  // Detect the exact previously accepted failure: a single background color
  // still produced a valid PNG and complete Preferences DOM. The Edge PNGs
  // are filtered 8-bit RGB; truly rendered UI has substantially more diversity.
  const distinct = new Set();
  for (const value of pixels) {
    distinct.add(value);
    if (distinct.size > 16) break;
  }
  invariant(distinct.size > 16, `${label} screenshot is visually blank/monochrome despite ready DOM`);
}

function assertShortcutLabelsHidden(dom, label) {
  invariant(dom.includes('data-theme-settings-shortcut-labels-hidden="true"'),
    `${label} renders accessible-only toggle labels into the visible layout`);
}

for (const preference of ["system", "dark", "light"]) {
  const label = `theme-settings-${preference}`;
  const dom = await read(label);
  invariant(dom.includes('data-theme-settings-fixture-ready="true"'), `${label} did not reach fixture readiness`);
  invariant(dom.includes('data-theme-settings="true"'), `${label} production settings surface is missing`);
  invariant(dom.includes(`data-theme="${preference}"`), `${label} root theme token is incorrect`);
  invariant(dom.includes(`data-theme-settings-preference="${preference}"`), `${label} fixture preference marker is incorrect`);
  assertShortcutLabelsHidden(dom, label);
  invariant(dom.includes("Preferences"), `${label} Preferences heading is missing`);
  invariant(dom.includes("General"), `${label} General section is missing`);
  invariant(dom.includes('role="group" aria-label="Theme"'), `${label} accessible Theme group is missing`);
  invariant(dom.includes('data-theme-option="system"'), `${label} System option is missing`);
  invariant(dom.includes('data-theme-option="dark"'), `${label} Dark option is missing`);
  invariant(dom.includes('data-theme-option="light"'), `${label} Light option is missing`);
  invariant(dom.includes('data-windows-shortcut-settings="true"'), `${label} Windows Shortcuts section is missing`);
  for (const shortcut of ["goToNarro", "toggleFocusMode", "findFocusTimer"]) {
    invariant(dom.includes(`data-global-shortcut-kind="${shortcut}"`), `${label} is missing shortcut row ${shortcut}`);
  }
  invariant(dom.includes("Ctrl + Shift + B"), `${label} Go to Narro chord is missing`);
  invariant(dom.includes("Ctrl + Shift + T"), `${label} alternate Focus chord is missing`);
  invariant(dom.includes("Ctrl + Shift + P"), `${label} Find Timer chord is missing`);

  const selected = new RegExp(`data-theme-option="${preference}"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*data-theme-option="${preference}"`);
  invariant(selected.test(dom), `${label} selected theme is not exposed through aria-pressed`);
  invariant(dom.includes("Blitz Panel"), `${label} Blitz Panel section is missing`);
  invariant(dom.includes("Timezone"), `${label} timezone preference is missing`);
  invariant(dom.includes("Pomodoros"), `${label} Pomodoro preference is missing`);
  invariant(dom.includes("Timed alerts during a task"), `${label} timed-alert preference is missing`);
}

const errorDom = await read("theme-settings-error");
invariant(errorDom.includes('data-theme="system"'), "error state must preserve the prior System theme");
invariant(errorDom.includes('role="alert"'), "error state must expose an alert");
invariant(errorDom.includes("THEME_PREFERENCE_FAILED"), "error state must retain the persistence failure code");
invariant(/data-theme-option="system"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*data-theme-option="system"/.test(errorDom), "error state must keep System selected after a failed save");

const shortcutConflictDom = await read("theme-settings-shortcut-conflict");
assertShortcutLabelsHidden(shortcutConflictDom, "theme-settings-shortcut-conflict");
invariant(shortcutConflictDom.includes('data-theme-settings-shortcut-conflict="true"'), "shortcut conflict fixture marker is missing");
invariant(shortcutConflictDom.includes('data-global-shortcut-kind="findFocusTimer"'), "Find Timer row is missing in conflict state");
invariant(shortcutConflictDom.includes('data-global-shortcut-enabled="true"'), "conflicted shortcut must retain enabled preference intent");
invariant(shortcutConflictDom.includes('data-global-shortcut-registered="false"'), "conflicted shortcut must expose unavailable native state");
invariant(shortcutConflictDom.includes("Shortcut conflict"), "shortcut conflict status is missing");
invariant(shortcutConflictDom.includes("Retry"), "shortcut conflict state must expose retry");
invariant(shortcutConflictDom.includes('role="alert"'), "shortcut conflict must be announced as an alert");

for (const section of ["upper", "middle", "lower"]) {
  await assertRenderedScreenshot(`theme-settings-preferences-${section}`);
  const dom = await read(`theme-settings-preferences-${section}`);
  assertShortcutLabelsHidden(dom, `theme-settings-preferences-${section}`);
  invariant(dom.includes('data-theme-settings-fixture-ready="true"'), `Preferences ${section} capture did not reach readiness`);
  invariant(dom.includes(`data-theme-settings-section="${section}"`), `Preferences ${section} marker is missing`);
  invariant(dom.includes("Blitz Panel"), `Preferences ${section} Blitz Panel section is missing`);
  invariant(dom.includes("General"), `Preferences ${section} General section is missing`);
  invariant(dom.includes("Blitz mode settings"), `Preferences ${section} Blitz Mode section is missing`);
  invariant(dom.includes("Alerts"), `Preferences ${section} Alerts section is missing`);
  invariant(dom.includes("Celebrate task completion"), `Preferences ${section} Celebration section is missing`);
  invariant(dom.includes('data-windows-shortcut-settings="true"'), `Preferences ${section} Windows Shortcuts section is missing`);
  invariant(dom.includes("data-local-sound-control=\"true\""), `Preferences ${section} local sound controls are missing`);
  for (const sound of ["Futuristic Ding", "Melodic Bell", "Quick Chime", "Victory Bell"]) {
    invariant(dom.includes(sound), `Preferences ${section} is missing local sound option ${sound}`);
  }
}
const upperDom = await read("theme-settings-preferences-upper");
invariant(upperDom.includes("Secondary display"), "Preferences upper capture monitor inventory is missing");
invariant(upperDom.includes('data-panel-side="right"'), "Preferences upper capture Panel side control is missing");
invariant(upperDom.includes("Europe/Athens"), "Preferences upper capture timezone value is missing");

const middleDom = await read("theme-settings-preferences-middle");
invariant(middleDom.includes("Default break length"), "Preferences middle capture default break control is missing");
invariant(middleDom.includes("Scrolling title on live timer"), "Preferences middle capture scrolling-title control is missing");
invariant(middleDom.includes("Schedule reminders"), "Preferences middle capture reminder control is missing");

const lowerDom = await read("theme-settings-preferences-lower");
invariant(lowerDom.includes("Show success screen"), "Preferences lower capture success-screen control is missing");
invariant(lowerDom.includes("Fun GIF"), "Preferences lower capture nested GIF control is missing");
invariant(lowerDom.includes("Success sound"), "Preferences lower capture success-sound state is missing");

// SS-C17 is a dedicated modal, not the shortcut section scrolled into Preferences.
for (const theme of ["dark", "light"]) {
  const label = `theme-settings-shortcuts-dialog-${theme}`;
  await assertRenderedScreenshot(label);
  const dom = await read(label);
  assertShortcutLabelsHidden(dom, label);
  invariant(dom.includes('data-theme-settings-fixture-ready="true"'), `${label} did not reach readiness`);
  invariant(dom.includes(`data-theme="${theme}"`), `${label} source theme is missing`);
  invariant(dom.includes('data-theme-settings-shortcuts-dialog="true"'), `${label} fixture did not select the dedicated dialog`);
  invariant(dom.includes('data-windows-shortcuts-dialog="true"'), `${label} must capture the actual WindowsShortcutsDialog wrapper`);
  invariant(dom.includes('role="dialog"') && dom.includes('aria-modal="true"'), `${label} accessible modal semantics missing`);
  invariant(dom.includes('data-windows-shortcuts-close="true"'), `${label} close control missing`);
  invariant(dom.includes("Windows Shortcuts"), `${label} heading missing`);
  invariant(dom.includes('data-windows-shortcut-settings="true"'), `${label} shortcut controls missing`);
  invariant(!dom.includes('data-theme-settings="true"'), `${label} wrongly captured the Preferences panel instead of the standalone modal`);
  for (const shortcut of ["goToNarro", "toggleFocusMode", "findFocusTimer"]) {
    invariant(dom.includes(`data-global-shortcut-kind="${shortcut}"`), `${label} global row missing: ${shortcut}`);
  }
  for (const shortcut of ["create-task", "start-break", "pause-resume", "skip-task", "finish-task", "notes", "search"]) {
    invariant(dom.includes(`data-app-shortcut="${shortcut}"`), `${label} app shortcut missing: ${shortcut}`);
  }
}

for (const theme of ["dark", "light"]) {
  const label = `theme-settings-preferences-dialog-${theme}`;
  const dom = await read(label);
  await assertRenderedScreenshot(label);
  invariant(dom.includes('data-theme-settings-dialog-containment-pass="true"'), `${label} parent containment/scroll/Escape/reopen did not pass`);
  invariant(dom.includes('data-preferences-dialog="true"'), `${label} actual parent dialog missing`);
}
console.log("Theme settings + Windows shortcuts + Preferences Edge capture contract: PASS");
