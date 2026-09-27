import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function invariant(condition, message) {
  if (!condition) throw new Error(`Theme settings capture invariant failed: ${message}`);
}

const root = resolve(process.cwd(), "artifacts", "visual-regression");

async function read(label) {
  return readFile(resolve(root, `${label}.html`), "utf8");
}

for (const preference of ["system", "dark", "light"]) {
  const label = `theme-settings-${preference}`;
  const dom = await read(label);
  invariant(dom.includes('data-theme-settings-fixture-ready="true"'), `${label} did not reach fixture readiness`);
  invariant(dom.includes('data-theme-settings="true"'), `${label} production settings surface is missing`);
  invariant(dom.includes(`data-theme="${preference}"`), `${label} root theme token is incorrect`);
  invariant(dom.includes(`data-theme-settings-preference="${preference}"`), `${label} fixture preference marker is incorrect`);
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
invariant(shortcutConflictDom.includes('data-theme-settings-shortcut-conflict="true"'), "shortcut conflict fixture marker is missing");
invariant(shortcutConflictDom.includes('data-global-shortcut-kind="findFocusTimer"'), "Find Timer row is missing in conflict state");
invariant(shortcutConflictDom.includes('data-global-shortcut-enabled="true"'), "conflicted shortcut must retain enabled preference intent");
invariant(shortcutConflictDom.includes('data-global-shortcut-registered="false"'), "conflicted shortcut must expose unavailable native state");
invariant(shortcutConflictDom.includes("Shortcut conflict"), "shortcut conflict status is missing");
invariant(shortcutConflictDom.includes("Retry"), "shortcut conflict state must expose retry");
invariant(shortcutConflictDom.includes('role="alert"'), "shortcut conflict must be announced as an alert");

for (const section of ["upper", "middle", "lower"]) {
  const dom = await read(`theme-settings-preferences-${section}`);
  invariant(dom.includes('data-theme-settings-fixture-ready="true"'), `Preferences ${section} capture did not reach readiness`);
  invariant(dom.includes(`data-theme-settings-section="${section}"`), `Preferences ${section} marker is missing`);
  invariant(dom.includes("Blitz Panel"), `Preferences ${section} Blitz Panel section is missing`);
  invariant(dom.includes("General"), `Preferences ${section} General section is missing`);
  invariant(dom.includes("Blitz Mode"), `Preferences ${section} Blitz Mode section is missing`);
  invariant(dom.includes("Alerts"), `Preferences ${section} Alerts section is missing`);
  invariant(dom.includes("Celebration"), `Preferences ${section} Celebration section is missing`);
  invariant(dom.includes('data-windows-shortcut-settings="true"'), `Preferences ${section} Windows Shortcuts section is missing`);
  invariant(dom.includes("Preview unavailable"), `Preferences ${section} must expose unavailable sound-preview feedback`);
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

console.log("Theme settings + Windows shortcuts + Preferences Edge capture contract: PASS");
