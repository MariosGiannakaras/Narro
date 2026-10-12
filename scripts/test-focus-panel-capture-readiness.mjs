import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspectFocusPanelCapture } from "./focus-panel-capture-readiness.mjs";

const theme = "light";
const scenario = "notes-expanded";
const png = Buffer.alloc(11_000);
Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(png);
png.writeUInt32BE(420, 16);
png.writeUInt32BE(720, 20);
const html = '<html data-focus-panel-fixture-ready="true"><div id="root"><main /></div><script id="focus-panel-visual-contract" type="application/json">' + JSON.stringify({ theme, scenario }) + '</script></html>';
const check = (h, p) => inspectFocusPanelCapture({ html: h, png: p, theme, scenario });
assert.equal(check(html, png).status, "ready");
assert.deepEqual(check('<html><div id="root"></div></html>', Buffer.alloc(2353)), {
  status: "retry", reason: "React fixture has not reported ready",
}, "unloaded React root must never pass as screenshot evidence");
assert.equal(check(html, Buffer.alloc(2353)).status, "retry");
assert.equal(check(html, null).status, "retry");
assert.equal(check(html.replace('data-focus-panel-fixture-ready="true"', 'data-focus-panel-fixture-ready="false"'), png).status, "retry");
assert.equal(check(html.replace(JSON.stringify({theme,scenario}), JSON.stringify({theme,scenario,error:"Renderer failed"})), png).status, "fail", "real product fixture errors must fail immediately");
assert.equal(check(html.replace(JSON.stringify({theme,scenario}), JSON.stringify({theme,scenario:"break"})), png).status, "fail");
assert.equal(check(html.replace(JSON.stringify({theme,scenario}), '{'), png).status, "fail");
assert.equal(check(html.replace('</script>', ''), png).status, "fail");
const wrongWidth = Buffer.from(png);
wrongWidth.writeUInt32BE(492, 16);
assert.equal(check(html, wrongWidth).status, "fail", "wrong viewport must never pass");
const invalidPng = Buffer.from(png);
invalidPng[0] = 0;
assert.equal(check(html, invalidPng).status, "fail");
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "narro-focus-capture-check-"));
try {
  const domPath = path.join(directory, "focus.html");
  const pngPath = path.join(directory, "focus.png");
  const scriptPath = fileURLToPath(new URL("./focus-panel-capture-readiness.mjs", import.meta.url));
  fs.writeFileSync(domPath, html);
  fs.writeFileSync(pngPath, png);
  assert.equal(spawnSync(process.execPath, [scriptPath, domPath, pngPath, theme, scenario], {encoding:"utf8"}).status, 0);
  fs.writeFileSync(domPath, '<html><div id="root"></div></html>');
  assert.equal(spawnSync(process.execPath, [scriptPath, domPath, pngPath, theme, scenario], {encoding:"utf8"}).status, 75);
  fs.writeFileSync(domPath, html.replace(JSON.stringify({theme,scenario}), JSON.stringify({theme,scenario,error:"Boom"})));
  assert.equal(spawnSync(process.execPath, [scriptPath, domPath, pngPath, theme, scenario], {encoding:"utf8"}).status, 2);
} finally {
  fs.rmSync(directory, {recursive: true, force: true});
}
console.log("Focus Panel rendered-capture readiness/retry vs real-failure gate: PASS");
