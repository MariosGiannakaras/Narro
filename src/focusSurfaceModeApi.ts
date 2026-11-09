import { invoke } from "@tauri-apps/api/core";

export type FocusSurfacePresentation = "panel" | "timerCompact" | "timerExpanded";
export type FocusSurfaceMode = "panel" | "timer";

export function focusSurfaceModeOf(presentation: FocusSurfacePresentation): FocusSurfaceMode {
  return presentation === "panel" ? "panel" : "timer";
}

export async function getFocusSurfacePresentation(): Promise<FocusSurfacePresentation> {
  const presentation = await invoke<FocusSurfacePresentation | null>("focus_surface_presentation_snapshot");
  if (presentation === "timerCompact" || presentation === "timerExpanded") return presentation;
  return "panel";
}

export async function getFocusSurfaceMode(): Promise<FocusSurfaceMode> {
  return focusSurfaceModeOf(await getFocusSurfacePresentation());
}

export async function applyFocusSurfacePresentation(
  presentation: FocusSurfacePresentation,
  compactFrame?: number[],
): Promise<void> {
  await invoke<void>("focus_surface_apply_presentation", { presentation, compactFrame });
}

export async function captureCompactTimerFrame(): Promise<number[]> {
  return invoke<number[]>("focus_surface_capture_compact_frame");
}

export async function animateFocusSurfacePresentation(
  presentation: FocusSurfacePresentation,
  durationMs: number,
  rasterToken: number,
): Promise<void> {
  await invoke<void>("focus_surface_animate_presentation", { presentation, durationMs, rasterToken });
}

export async function prepareFocusSurfaceModeRaster(presentation: FocusSurfacePresentation): Promise<number> {
  return invoke<number>("focus_surface_prepare_mode_raster", { presentation });
}

/** Optional plates live only under an already acquired native raster lease. */
export async function prepareFocusMotionV4Plate(
  rasterToken: number,
  layout: import("./focusMotionV4Geometry").MotionV4RasterLayout,
): Promise<void> {
  await invoke<void>("focus_surface_prepare_v4_plate", { rasterToken, layout });
}

export async function prepareFocusMotionV4PanelPlate(
  rasterToken: number,
  stage: "source" | "target",
  layout?: import("./focusMotionV4PanelGeometry").MotionV4PanelLayout,
): Promise<void> {
  await invoke<void>("focus_surface_prepare_v4_panel_plate", { rasterToken, stage, layout });
}

export async function finishFocusSurfaceModeRaster(rasterToken: number, rollback = false): Promise<void> {
  await invoke<void>("focus_surface_finish_mode_raster", { rasterToken, rollback });
}

export async function presentFocusPanel(): Promise<void> {
  await applyFocusSurfacePresentation("panel");
}

export async function presentFloatingTimer(expanded = false): Promise<void> {
  await applyFocusSurfacePresentation(expanded ? "timerExpanded" : "timerCompact");
}

export async function setFloatingTimerExpanded(expanded: boolean, compactFrame?: number[]): Promise<void> {
  await applyFocusSurfacePresentation(expanded ? "timerExpanded" : "timerCompact", compactFrame);
}
