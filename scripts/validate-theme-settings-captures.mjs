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

  const selected = new RegExp(`data-theme-option="${preference}"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*data-theme-option="${preference}"`);
  invariant(selected.test(dom), `${label} selected theme is not exposed through aria-pressed`);
  invariant(!dom.includes("Timezone"), `${label} must not absorb timezone preferences`);
  invariant(!dom.includes("Pomodoro"), `${label} must not absorb Pomodoro preferences`);
  invariant(!dom.includes("Timed alerts"), `${label} must not absorb alert preferences`);
}

const errorDom = await read("theme-settings-error");
invariant(errorDom.includes('data-theme="system"'), "error state must preserve the prior System theme");
invariant(errorDom.includes('role="alert"'), "error state must expose an alert");
invariant(errorDom.includes("THEME_PREFERENCE_FAILED"), "error state must retain the persistence failure code");
invariant(/data-theme-option="system"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*data-theme-option="system"/.test(errorDom), "error state must keep System selected after a failed save");

console.log("Theme settings Windows Edge capture contract: PASS");
