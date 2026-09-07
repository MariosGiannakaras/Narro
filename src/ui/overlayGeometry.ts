export type OverlayPlacement = "top" | "right" | "bottom" | "left";

export interface OverlayRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

export interface OverlaySize {
  width: number;
  height: number;
}

export interface OverlayViewport {
  width: number;
  height: number;
}

export interface OverlayPositionOptions {
  preferredPlacement?: OverlayPlacement;
  gap?: number;
  viewportPadding?: number;
}

export interface OverlayPosition {
  top: number;
  left: number;
  placement: OverlayPlacement;
  transformOrigin: string;
}

const oppositePlacement: Record<OverlayPlacement, OverlayPlacement> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

function availablePrimarySpace(
  trigger: OverlayRect,
  viewport: OverlayViewport,
  placement: OverlayPlacement,
  gap: number,
  padding: number,
): number {
  switch (placement) {
    case "top":
      return trigger.top - gap - padding;
    case "right":
      return viewport.width - trigger.right - gap - padding;
    case "bottom":
      return viewport.height - trigger.bottom - gap - padding;
    case "left":
      return trigger.left - gap - padding;
  }
}

function requiredPrimarySize(size: OverlaySize, placement: OverlayPlacement): number {
  return placement === "top" || placement === "bottom" ? size.height : size.width;
}

function choosePlacement(
  trigger: OverlayRect,
  size: OverlaySize,
  viewport: OverlayViewport,
  preferredPlacement: OverlayPlacement,
  gap: number,
  padding: number,
): OverlayPlacement {
  const opposite = oppositePlacement[preferredPlacement];
  const preferredSpace = availablePrimarySpace(
    trigger,
    viewport,
    preferredPlacement,
    gap,
    padding,
  );
  const oppositeSpace = availablePrimarySpace(trigger, viewport, opposite, gap, padding);
  const required = requiredPrimarySize(size, preferredPlacement);

  if (preferredSpace >= required) {
    return preferredPlacement;
  }

  if (oppositeSpace >= required || oppositeSpace > preferredSpace) {
    return opposite;
  }

  return preferredPlacement;
}

function rawPosition(
  trigger: OverlayRect,
  size: OverlaySize,
  placement: OverlayPlacement,
  gap: number,
): Pick<OverlayPosition, "top" | "left"> {
  switch (placement) {
    case "top":
      return {
        top: trigger.top - size.height - gap,
        left: trigger.left + (trigger.width - size.width) / 2,
      };
    case "right":
      return {
        top: trigger.top + (trigger.height - size.height) / 2,
        left: trigger.right + gap,
      };
    case "bottom":
      return {
        top: trigger.bottom + gap,
        left: trigger.left + (trigger.width - size.width) / 2,
      };
    case "left":
      return {
        top: trigger.top + (trigger.height - size.height) / 2,
        left: trigger.left - size.width - gap,
      };
  }
}

function transformOrigin(placement: OverlayPlacement): string {
  switch (placement) {
    case "top":
      return "center bottom";
    case "right":
      return "left center";
    case "bottom":
      return "center top";
    case "left":
      return "right center";
  }
}

export function computeAnchoredOverlayPosition(
  trigger: OverlayRect,
  size: OverlaySize,
  viewport: OverlayViewport,
  options: OverlayPositionOptions = {},
): OverlayPosition {
  const preferredPlacement = options.preferredPlacement ?? "bottom";
  const gap = Math.max(0, options.gap ?? 8);
  const viewportPadding = Math.max(0, options.viewportPadding ?? 8);
  const placement = choosePlacement(
    trigger,
    size,
    viewport,
    preferredPlacement,
    gap,
    viewportPadding,
  );
  const raw = rawPosition(trigger, size, placement, gap);

  const maximumLeft = viewport.width - viewportPadding - size.width;
  const maximumTop = viewport.height - viewportPadding - size.height;

  return {
    left: clamp(raw.left, viewportPadding, maximumLeft),
    top: clamp(raw.top, viewportPadding, maximumTop),
    placement,
    transformOrigin: transformOrigin(placement),
  };
}
