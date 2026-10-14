export type TooltipBounds = { left: number; top: number; right: number; bottom: number };

/** Viewport coordinates in, anchor-local CSS coordinates out. */
export function placeReportChartTooltip(
  anchor: TooltipBounds,
  clip: TooltipBounds,
  width: number,
  height: number,
  scale = 1,
): { left: number; top: number; maxWidth: number } | null {
  const values = [anchor.left, anchor.top, anchor.right, anchor.bottom, clip.left, clip.top, clip.right, clip.bottom, width, height, scale];
  if (values.some((value) => !Number.isFinite(value)) || scale <= 0 || width <= 0 || height <= 0
    || anchor.right <= anchor.left || anchor.bottom <= anchor.top) return null;
  const inset = 4 * scale;
  const leftEdge = clip.left + inset;
  const rightEdge = clip.right - inset;
  const topEdge = clip.top + inset;
  const bottomEdge = clip.bottom - inset;
  if (rightEdge <= leftEdge || bottomEdge - topEdge < height
    || anchor.right <= clip.left || anchor.left >= clip.right
    || anchor.bottom <= clip.top || anchor.top >= clip.bottom) return null;
  const fittedWidth = Math.min(width, rightEdge - leftEdge);
  const left = Math.max(leftEdge, Math.min((anchor.left + anchor.right - fittedWidth) / 2, rightEdge - fittedWidth));
  const preferredTop = anchor.bottom - 45 * scale - height;
  const top = Math.max(topEdge, Math.min(preferredTop, Math.max(topEdge, bottomEdge - height)));
  return {
    left: (left - anchor.left) / scale,
    top: (top - anchor.top) / scale,
    maxWidth: (rightEdge - leftEdge) / scale,
  };
}
