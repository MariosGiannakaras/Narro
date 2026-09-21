import { invoke } from "@tauri-apps/api/core";

export type FocusSurfaceMode = "panel" | "timer";

export async function getFocusSurfaceMode(): Promise<FocusSurfaceMode> {
  const mode = await invoke<FocusSurfaceMode | null>("focus_surface_mode_snapshot");
  return mode === "timer" ? "timer" : "panel";
}

export async function presentFloatingTimer(): Promise<void> {
  await invoke<void>("present_floating_timer");
}

export async function presentFocusPanel(): Promise<void> {
  await invoke<void>("present_focus_panel");
}
