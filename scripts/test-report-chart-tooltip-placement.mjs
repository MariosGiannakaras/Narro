import assert from "node:assert/strict";
import { placeReportChartTooltip as place } from "../src/reportChartTooltipPlacement.ts";

let cases = 0;
for (const scale of [1, 1.25, 2]) {
  for (const left of [0, 180, -1200]) {
    for (const width of [80, 180, 320, 800]) {
      const clip = { left, top: 100, right: left + width * scale, bottom: 310 * scale };
      for (let fraction = -0.2; fraction <= 1.2; fraction += 0.025) {
        const anchor = { left: left + fraction * width * scale, right: left + (fraction * width + 24) * scale, top: 110, bottom: 290 * scale };
        const p = place(anchor, clip, 146 * scale, 104 * scale, scale);
        cases++;
        if (!p) {
          assert(anchor.right <= clip.left || anchor.left >= clip.right || clip.bottom - clip.top - 8 * scale < 104 * scale);
          continue;
        }
        const x = anchor.left + p.left * scale;
        const y = anchor.top + p.top * scale;
        const renderedWidth = Math.min(146, p.maxWidth) * scale;
        assert(x >= clip.left + 4 * scale - 1e-6 && x + renderedWidth <= clip.right - 4 * scale + 1e-6, "complete tooltip must stay horizontally inside scroll viewport");
        assert(y >= clip.top + 4 * scale - 1e-6 && y + 104 * scale <= clip.bottom - 4 * scale + 1e-6, "complete tooltip must stay vertically inside visible clipping viewport");
      }
    }
  }
}
const a = { left: 0, top: 0, right: 24, bottom: 180 };
assert.equal(place(a, { left: 0, top: 0, right: 320, bottom: 60 }, 146, 104), null, "a partially visible chart must not display a cut tooltip");
assert.equal(place({ ...a, left: NaN }, { left: 0, top: 0, right: 320, bottom: 220 }, 146, 104), null);
assert.equal(place(a, { left: 0, top: 0, right: 320, bottom: 220 }, 146, 104, 0), null);
console.log(`Reports tooltip scroll/edge/resize/DPI geometry: ${cases} cases PASS.`);
