import { invoke } from "@tauri-apps/api/core";

export type FocusSurfaceMode = "panel" | "timer";

export async function getFocusSurfaceMode(): Promise<FocusSurfaceMode> {
  const mode = await invoke<FocusSurfaceMode | null>("focus_surface_mode_snapshot");
  return mode === "timer" ? "timer" : "panel";
}

export async function prepareFloatingTimer(): Promise<void> {
  await invoke<void>("prepare_floating_timer");
}

export async function prewarmFocusSurface(): Promise<void> {
  await invoke<void>("prewarm_focus_surface");
}

export async function beginFocusVisualHold(): Promise<void> {
  await invoke<void>("begin_focus_visual_hold");
}

export async function endFocusVisualHold(): Promise<void> {
  await invoke<void>("end_focus_visual_hold");
}

export async function clearFocusSurfacePrewarm(): Promise<void> {
  await invoke<void>("clear_focus_surface_prewarm");
}

export async function revealFloatingTimer(): Promise<void> {
  await invoke<void>("reveal_floating_timer");
}

export async function prepareFocusPanel(): Promise<void> {
  await invoke<void>("prepare_focus_panel");
}

export async function revealFocusPanel(): Promise<void> {
  await invoke<void>("reveal_focus_panel");
}

export async function presentFloatingTimer(): Promise<void> {
  await invoke<void>("present_floating_timer");
}

export async function presentFocusPanel(): Promise<void> {
  await invoke<void>("present_focus_panel");
}

export async function setFloatingTimerExpanded(expanded: boolean): Promise<void> {
  await invoke<void>("set_floating_timer_expanded", { expanded });
}
