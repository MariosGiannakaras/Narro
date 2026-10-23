/**
 * Motion v4: source-portable, deterministic choreography contract.
 *
 * This module intentionally does NOT move a native HWND, manipulate a WebView,
 * publish renderer presentation or mutate timer/session state. PR389 owns the
 * active native raster transaction. A later integration must supply the actual
 * measured DOM anchors, bind one live progress clock to native + renderer,
 * and render exactly ONE semantic task-title/time hierarchy.
 *
 * Reference: docs/NARRO_MOTION_V4_AND_UNIFIED_WINDOW_ROADMAP.md.
 */
export type MotionV4Presentation = "panel" | "timerCompact" | "timerExpanded";

export type MotionV4Route = Readonly<{
  from: MotionV4Presentation;
  to: MotionV4Presentation;
}>;

export type MotionV4Frame = Readonly<{
  progress: number;
  easedProgress: number;
  visibleHeight: number;
  panelAmount: number;
  expandedAmount: number;
  // A single title/time visual representative moves from DOM-measured source
  // anchor to destination anchor by this fraction. Never duplicate its text.
  sharedAnchorFraction: number;
  panelChromeOpacity: number;
  activeCardOpacity: number;
  liveMetadataOpacity: number;
  queueOpacity: number;
  actionsOpacity: number;
  // Expanded-only row opacity, gated on full row visibility inside window.
  subtaskRowOpacity: readonly number[];
}>;

export const MOTION_V4_DURATION_MS = 500;
export const MOTION_V4_REDUCED_DURATION_MS = 1;

const heights: Readonly<Record<MotionV4Presentation, number>> = {
  panel: 700,
  timerCompact: 110,
  timerExpanded: 300,
};

const presentationKinds: readonly MotionV4Presentation[] = [
  "panel",
  "timerCompact",
  "timerExpanded",
];

const clamp = (value: number): number => Math.min(1, Math.max(0, value));
const mix = (a: number, b: number, progress: number): number =>
  a + (b - a) * progress;

export function motionV4Smoothstep(progress: number): number {
  if (!Number.isFinite(progress)) {
    throw new RangeError("Motion v4 progress must be finite.");
  }
  const t = clamp(progress);
  return t * t * (3 - 2 * t);
}

function reveal(value: number, start: number, end: number): number {
  return motionV4Smoothstep((value - start) / (end - start));
}

export function isMotionV4Route(route: MotionV4Route): boolean {
  const valid = presentationKinds.includes(route.from)
    && presentationKinds.includes(route.to);
  if (!valid || route.from === route.to) return false;
  // No fictitious direct Panel-to-Expanded command; current coordinator
  // serializes this via Compact.
  return (route.from === "panel" && route.to === "timerCompact")
    || (route.from === "timerCompact" && route.to === "panel")
    || (route.from === "timerCompact" && route.to === "timerExpanded")
    || (route.from === "timerExpanded" && route.to === "timerCompact");
}

export function motionV4Duration(reducedMotion: boolean): number {
  return reducedMotion ? MOTION_V4_REDUCED_DURATION_MS : MOTION_V4_DURATION_MS;
}

/**
 * Pure frame sampler.
 *
 * @param rowBottoms Bottom coordinates of expanded-only row boxes, measured
 * from the visible top of the actual Timer surface; not fixture constants.
 *
 * The named opacity channels are renderer presentation cues, NOT permission to
 * alpha-blend two full-window bitmap screenshots. In particular, native A02
 * ghosting cannot be pronounced fixed by this pure renderer model.
 */
export function sampleMotionV4(
  route: MotionV4Route,
  progress: number,
  rowBottoms: readonly number[] = [],
): MotionV4Frame {
  if (!isMotionV4Route(route)) {
    throw new RangeError("Unsupported Motion v4 presentation transition.");
  }
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) {
    throw new RangeError("Motion v4 progress must be finite and in [0, 1].");
  }
  for (const bottom of rowBottoms) {
    if (!Number.isFinite(bottom) || bottom < 0) {
      throw new RangeError("Subtask row bottom must be a finite nonnegative coordinate.");
    }
  }

  const q = motionV4Smoothstep(progress);
  const fromPanel = route.from === "panel" ? 1 : 0;
  const toPanel = route.to === "panel" ? 1 : 0;
  const fromExpanded = route.from === "timerExpanded" ? 1 : 0;
  const toExpanded = route.to === "timerExpanded" ? 1 : 0;
  const panelAmount = mix(fromPanel, toPanel, q);
  const expandedAmount = mix(fromExpanded, toExpanded, q);
  const visibleHeight = mix(heights[route.from], heights[route.to], q);

  // A title/time anchor travels first; a full Panel hierarchy reveals later.
  // When closing, the inverse ordering is obtained from the same pure frame.
  const sharedAnchorFraction = route.from === "panel" || route.to === "panel"
    ? reveal(panelAmount, 0.16, 0.67)
    : q;
  const panelChromeOpacity = reveal(panelAmount, 0.55, 0.85);
  const activeCardOpacity = reveal(panelAmount, 0.50, 0.90);
  const liveMetadataOpacity = reveal(panelAmount, 0.84, 0.98);
  const queueOpacity = reveal(panelAmount, 0.53, 0.94);

  // Compact has no permanently visible action strip; it uses the existing
  // hover/focus grammar. Expanded and Panel display action buttons. On
  // expansion, buttons appear before rows. On collapse, rows leave first.
  const actionsOpacity = clamp(
    reveal(panelAmount, 0.71, 0.92)
    + reveal(expandedAmount, 0.24, 0.49),
  );

  const subtaskRowOpacity = rowBottoms.map((bottom, index) => {
    // Each row is revealed only after the complete row fits in the real
    // visible window. The end threshold lies BELOW the final 300 px extent,
    // including the fourth 36px fixture row (bottom 290).
    const fits = reveal(visibleHeight, bottom - 10, bottom + 2);
    const details = reveal(
      expandedAmount,
      0.44 + index * 0.07,
      0.73 + index * 0.06,
    );
    return fits * details;
  });

  return {
    progress,
    easedProgress: q,
    visibleHeight,
    panelAmount,
    expandedAmount,
    sharedAnchorFraction,
    panelChromeOpacity,
    activeCardOpacity,
    liveMetadataOpacity,
    queueOpacity,
    actionsOpacity,
    subtaskRowOpacity,
  };
}

/** Uses a monotonic elapsed clock; renderer timer must not be authoritative. */
export function motionV4Progress(
  elapsedMs: number,
  reducedMotion = false,
): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new RangeError("Motion v4 elapsed time must be finite and nonnegative.");
  }
  return clamp(elapsedMs / motionV4Duration(reducedMotion));
}
