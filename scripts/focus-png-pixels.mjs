import fs from "node:fs";
import { inflateSync } from "node:zlib";

// Minimal lossless PNG reader for Windows Edge 8-bit RGB/RGBA screenshots.
// Compare *decoded pixels*, not ZIP/PNG file bytes (compression can differ).
export function readEdgePng(filePath) {
  const png = fs.readFileSync(filePath);
  if (!png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error(`Invalid PNG signature: ${filePath}`);
  }
  let cursor = 8, width, height, channels;
  const compressed = [];
  while (cursor + 12 <= png.length) {
    const length = png.readUInt32BE(cursor);
    const kind = png.toString("ascii", cursor + 4, cursor + 8);
    const chunk = png.subarray(cursor + 8, cursor + 8 + length);
    cursor += length + 12;
    if (cursor > png.length) throw new Error(`Truncated PNG ${filePath}`);
    if (kind === "IHDR") {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      const depth = chunk[8], color = chunk[9], interlace = chunk[12];
      if (depth !== 8 || interlace !== 0 || ![2, 6].includes(color)) {
        throw new Error(`Unexpected Edge PNG format ${depth}/${color}/${interlace} in ${filePath}`);
      }
      channels = color === 6 ? 4 : 3;
    }
    if (kind === "IDAT") compressed.push(chunk);
    if (kind === "IEND") break;
  }
  if (!width || !height || !channels || compressed.length === 0) {
    throw new Error(`Missing Edge PNG IHDR/IDAT: ${filePath}`);
  }
  const rowBytes = width * channels;
  const source = inflateSync(Buffer.concat(compressed));
  if (source.length !== height * (rowBytes + 1)) {
    throw new Error(`Invalid PNG inflated dimensions: ${filePath}`);
  }
  const pixels = Buffer.alloc(rowBytes * height);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = source[src++];
    if (filter > 4) throw new Error(`Unsupported PNG scanline filter ${filter}`);
    const row = y * rowBytes;
    for (let i = 0; i < rowBytes; i++) {
      const left = i >= channels ? pixels[row + i - channels] : 0;
      const up = y > 0 ? pixels[row - rowBytes + i] : 0;
      const upperLeft = y > 0 && i >= channels ? pixels[row - rowBytes + i - channels] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      if (filter === 2) predictor = up;
      if (filter === 3) predictor = Math.floor((left + up) / 2);
      if (filter === 4) {
        const estimate = left + up - upperLeft;
        const a = Math.abs(estimate - left), b = Math.abs(estimate - up);
        const c = Math.abs(estimate - upperLeft);
        predictor = a <= b && a <= c ? left : b <= c ? up : upperLeft;
      }
      pixels[row + i] = (source[src++] + predictor) & 0xff;
    }
  }
  return { width, height, channels, pixels };
}

export function differentFocusPixels(before, after, region, channelThreshold = 40) {
  if (before.width !== after.width || before.height !== after.height) {
    throw new Error("Cannot compare Focus captures with different dimensions");
  }
  const { x, y, width, height } = region ?? {};
  if (![x, y, width, height].every(Number.isFinite)
    || x < 0 || y < 0 || width < 1 || height < 1
    || x + width > before.width || y + height > before.height) {
    throw new Error("Focus action region falls outside Edge screenshot bounds");
  }
  let count = 0;
  for (let py = y; py < y + height; py++) {
    for (let px = x; px < x + width; px++) {
      const a = (py * before.width + px) * before.channels;
      const b = (py * after.width + px) * after.channels;
      if (Math.max(
        Math.abs(before.pixels[a] - after.pixels[b]),
        Math.abs(before.pixels[a + 1] - after.pixels[b + 1]),
        Math.abs(before.pixels[a + 2] - after.pixels[b + 2]),
      ) >= channelThreshold) count++;
    }
  }
  return count;
}
