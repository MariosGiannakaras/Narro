import assert from "node:assert/strict";
import { reportChartPrintLabelIndices as labels } from "../src/reportChartPrintLabels.ts";

for (const invalid of [0, -1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.equal(labels(invalid).size, 0);
for (let count = 1; count <= 3660; count++) {
  const indices = [...labels(count)];
  assert.equal(indices[0], 0);
  assert.equal(indices[indices.length - 1], count - 1);
  assert(indices.length <= 9, `unbounded print labels for ${count} days`);
  for (let i = 1; i < indices.length; i++) {
    assert(indices[i] - indices[i - 1] >= Math.ceil(count / 8), `crowded final labels at ${count}`);
  }
  for (const index of indices.slice(1, -1)) {
    assert(count <= 14 || index % 7 === 0, 'print thinning changed weekly cadence');
  }
}
assert(!labels(91).has(84), 'actual native Oct09/Oct15 overlap must not recur');
assert(labels(91).has(90));
console.log('Reports print endpoint/cadence/density: 3660 lengths PASS.');
