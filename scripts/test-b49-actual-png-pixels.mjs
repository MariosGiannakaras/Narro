import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { deflateSync } from "node:zlib";
import { readEdgePng, differentFocusPixels } from "./focus-png-pixels.mjs";

// Deterministic exact-pixel regression: fail when focused action rail is
// visually unchanged, even if the HTML contract independently says PASS.
const makeChunk = (kind, payload) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(payload.length);
  return Buffer.concat([length, Buffer.from(kind), payload, Buffer.alloc(4)]);
};
function screenshot(file, draw) {
  const width = 30, height = 20, ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const row = y * (width * 4 + 1);
    raw[row] = y % 5; // Exercise all five PNG scanline filter decoders.
    for (let x = 0; x < width; x++) {
      const offset = row + 1 + x * 4;
      const pixel = draw(x, y);
      // Compute PNG filter bytes from the unfiltered pixel row.
      const left = x > 0 ? draw(x - 1, y) : [0, 0, 0, 0];
      const up = y > 0 ? draw(x, y - 1) : [0, 0, 0, 0];
      const upperLeft = x > 0 && y > 0 ? draw(x - 1, y - 1) : [0, 0, 0, 0];
      for (let channel = 0; channel < 4; channel++) {
        const a = left[channel], b = up[channel], c = upperLeft[channel];
        const estimate = a + b - c, dA = Math.abs(estimate - a),
          dB = Math.abs(estimate - b), dC = Math.abs(estimate - c);
        const predictor = raw[row] === 0 ? 0
          : raw[row] === 1 ? a : raw[row] === 2 ? b
          : raw[row] === 3 ? Math.floor((a + b) / 2)
          : dA <= dB && dA <= dC ? a : dB <= dC ? b : c;
        raw[offset + channel] = (pixel[channel] - predictor + 256) & 255;
      }
    }
  }
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", deflateSync(raw)),
    makeChunk("IEND", Buffer.alloc(0)),
  ]));
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "narro-b49-pixels-"));
try {
  const beforePath = path.join(temp, "normal.png"), samePath = path.join(temp, "same.png"),
    focusPath = path.join(temp, "focused.png");
  const resting = () => [40, 50, 60, 255];
  const revealed = (x, y) => x >= 3 && x < 27 && y >= 4 && y < 16
    ? [225, 238, 104, 255] : resting();
  screenshot(beforePath, resting);
  screenshot(samePath, resting);
  screenshot(focusPath, revealed);
  const before = readEdgePng(beforePath), same = readEdgePng(samePath),
    focused = readEdgePng(focusPath);
  const region = { x: 2, y: 3, width: 26, height: 14 };
  assert.equal(differentFocusPixels(before, same, region), 0,
    "same visual state must be rejected regardless of DOM markers");
  assert.equal(differentFocusPixels(before, focused, region), 24 * 12,
    "painted action surface must be visibly distinct");
  assert.throws(() => differentFocusPixels(before, focused, {x: 25,y:0,width:6,height:10}),
    /outside Edge screenshot bounds/);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
console.log("B49 decoded PNG scanlines, false identical capture, and focused rail change passed.");
