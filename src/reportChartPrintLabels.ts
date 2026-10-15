/** Print-only thinning: retain range endpoints and weekly cadence where it
 * fits. Bound the number and spacing of visible labels, not the data/bar count.
 * Screen labels and accessible per-day names remain untouched. */
export function reportChartPrintLabelIndices(dayCount: number): Set<number> {
  const indices = new Set<number>();
  if (!Number.isSafeInteger(dayCount) || dayCount <= 0) return indices;
  const last = dayCount - 1;
  indices.add(0);
  const minimumGap = Math.ceil(dayCount / 8);
  const cadence = dayCount <= 14 ? 1 : 7;
  const step = Math.ceil(minimumGap / cadence) * cadence;
  for (let index = step; index < last - minimumGap; index += step) indices.add(index);
  indices.add(last);
  return indices;
}
