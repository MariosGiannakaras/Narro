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
): Promise<void> {
  await invoke<void>("focus_surface_apply_presentation", { presentation });
}

export async function animateFocusSurfacePresentation(
  presentation: FocusSurfacePresentation,
  durationMs: number,
): Promise<void> {
  await invoke<void>("focus_surface_animate_presentation", { presentation, durationMs });
}

export async function presentFocusPanel(): Promise<void> {
  await applyFocusSurfacePresentation("panel");
}

export async function presentFloatingTimer(expanded = false): Promise<void> {
  await applyFocusSurfacePresentation(expanded ? "timerExpanded" : "timerCompact");
}

export async function setFloatingTimerExpanded(expanded: boolean): Promise<void> {
  await applyFocusSurfacePresentation(expanded ? "timerExpanded" : "timerCompact");
}
