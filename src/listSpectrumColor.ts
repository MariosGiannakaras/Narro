export type WheelPoint = Readonly<{ hue: number; radius: number }>;

export function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function hsvToRgb(hue: number, saturation: number, brightness: number): [number, number, number] {
  const h = (((hue % 360) + 360) % 360) / 60;
  const s = clampUnit(saturation);
  const v = clampUnit(brightness);
  const chroma = v * s;
  const x = chroma * (1 - Math.abs((h % 2) - 1));
  const m = v - chroma;
  const segment: [number, number, number] = h < 1 ? [chroma, x, 0]
    : h < 2 ? [x, chroma, 0] : h < 3 ? [0, chroma, x]
      : h < 4 ? [0, x, chroma] : h < 5 ? [x, 0, chroma] : [chroma, 0, x];
  return segment.map((n) => Math.round((n + m) * 255)) as [number, number, number];
}

export function hsvToHex(h: number, s: number, v: number): string {
  return "#" + hsvToRgb(h, s, v).map((n) => n.toString(16).padStart(2, "0")).join("");
}

export function colorAtWheel(point: WheelPoint): string {
  const r = clampUnit(point.radius);
  // One calibrated HSV plane: center white, half-radius full hue, edge black.
  return hsvToHex(point.hue, r <= 0.5 ? r * 2 : 1, r <= 0.5 ? 1 : 2 - 2 * r);
}

export function nearestWheelPoint(hex: string): WheelPoint {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return { hue: 0, radius: 0 };
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const hi = Math.max(r, g, b);
  const low = Math.min(r, g, b);
  const delta = hi - low;
  let sector = 0;
  if (delta !== 0) {
    if (hi === r) sector = ((g - b) / delta) % 6;
    else if (hi === g) sector = (b - r) / delta + 2;
    else sector = (r - g) / delta + 4;
  }
  const hue = (sector * 60 + 360) % 360;
  const saturation = hi === 0 ? 0 : delta / hi;
  return { hue, radius: hi >= 0.999 ? saturation / 2 : 0.5 + (1 - hi) / 2 };
}

export function wheelPointAt(x: number, y: number, size = 184): WheelPoint {
  const deltaX = x - size / 2;
  const deltaY = y - size / 2;
  return {
    hue: ((Math.atan2(deltaY, deltaX) * 180 / Math.PI) + 450) % 360,
    radius: clampUnit(Math.hypot(deltaX, deltaY) / (size * 0.485)),
  };
}

export function listIconContrast(hex: string): "#181a19" | "#ffffff" {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return "#181a19";
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const linear = channels.map((n) => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722 > 0.179 ? "#181a19" : "#ffffff";
}
