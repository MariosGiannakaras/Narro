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

export async function finishFocusSurfaceModeRaster(rasterToken: number, rollback = false): Promise<void> {
  await invoke<void>("focus_surface_finish_mode_raster", { rasterToken, rollback });
}

export type FocusTransitionTraceStage =
  | "renderer.raster-ready"
  | "renderer.target-prepared"
  | "renderer.native-request"
  | "renderer.native-finished"
  | "renderer.commit"
  | "renderer.release-request"
  | "renderer.rollback";

/**
 * Best-effort, bounded technical marker for opt-in packaged physical capture.
 * The native endpoint writes nothing without NARRO_FOCUS_CAPTURE_DIR; markers
 * contain no task strings or pixel data. Do not await this diagnostic command:
 * diagnostics cannot be allowed to change transition ordering or failures.
 */
export function markFocusTransitionTrace(
  stage: FocusTransitionTraceStage,
  rasterToken?: number,
): void {
  void invoke<void>("focus_transition_trace_mark", { stage, rasterToken })
    .catch(() => { /* diagnostic only; never interfere with Focus recovery */ });
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
