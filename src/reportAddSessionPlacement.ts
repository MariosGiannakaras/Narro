// SS-H17 shows the Add Session card anchored to its activating control.
// Keep placement deterministic and viewport bounded; the modal's focus trap,
// task selection and native write authority live elsewhere.
export type AddSessionRect = { left: number; top: number; right: number; bottom: number };
export type AddSessionSize = { width: number; height: number };

export function positionReportAddSession(
  anchor: AddSessionRect,
  panel: AddSessionSize,
  viewport: AddSessionSize,
): { left: number; top: number } {
  const edge = 16;
  const spacing = 8;
  const availableLeft = Math.max(edge, viewport.width - panel.width - edge);
  const left = Math.min(availableLeft, Math.max(edge, anchor.left));

  const below = anchor.bottom + spacing;
  const above = anchor.top - panel.height - spacing;
  const availableTop = Math.max(edge, viewport.height - panel.height - edge);
  const preferredTop = below + panel.height <= viewport.height - edge
    ? below
    : above >= edge ? above : below;
  return { left, top: Math.min(availableTop, Math.max(edge, preferredTop)) };
}
