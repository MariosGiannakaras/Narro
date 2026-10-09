import { colorAtWheel, hsvToHex, hsvToRgb, listIconContrast, nearestWheelPoint, wheelPointAt } from "../src/listSpectrumColor.ts";

function assert(condition, why) {
  if (!condition) throw new Error("Spectrum Core test: " + why);
}

assert(colorAtWheel({ hue: 0, radius: 0 }) === "#ffffff", "white at center");
assert(colorAtWheel({ hue: 0, radius: 0.5 }) === "#ff0000", "pure red at half radius");
assert(colorAtWheel({ hue: 120, radius: 0.5 }) === "#00ff00", "pure green at half radius");
assert(colorAtWheel({ hue: 240, radius: 0.5 }) === "#0000ff", "pure blue at half radius");
assert(colorAtWheel({ hue: 42, radius: 1 }) === "#000000", "black at outer radius");
assert(hsvToHex(0, 0, 1) === "#ffffff", "HSV white");
assert(hsvToHex(0, 1, 0) === "#000000", "HSV black");
assert(hsvToRgb(360, 1, 1).join(",") === "255,0,0", "360° hue wrap");
assert(wheelPointAt(92, 92).radius === 0, "center pointer");
assert(wheelPointAt(92 + 184 * 0.485, 92).radius === 1, "radius normalized at right rim");
assert(nearestWheelPoint("#ff0000").radius === 0.5, "red recovered on exact plane");
const arbitrary = "#4180a9";
assert(colorAtWheel(nearestWheelPoint(arbitrary)) !== arbitrary,
  "some arbitrary HEX colors are outside HSV plane; HEX field must retain exact selection");
assert(listIconContrast("#ffffff") === "#181a19", "dark icon on light list");
assert(listIconContrast("#000000") === "#ffffff", "light icon on dark list");
console.log("Spectrum Core color geometry and HEX contracts passed.");
