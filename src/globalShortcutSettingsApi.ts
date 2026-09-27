import { invoke } from "@tauri-apps/api/core";
import type { ShortcutDiagnostics } from "./diagnosticApi";

export type GlobalShortcutKind = "goToNarro" | "toggleFocusMode" | "findFocusTimer";

export type GlobalShortcutSettingsSnapshot = {
  goToNarroEnabled: boolean;
  toggleFocusModeEnabled: boolean;
  findFocusTimerEnabled: boolean;
  diagnostics: ShortcutDiagnostics;
};

export function getGlobalShortcutSettings(): Promise<GlobalShortcutSettingsSnapshot> {
  return invoke<GlobalShortcutSettingsSnapshot>("get_global_shortcut_settings");
}

export function setGlobalShortcutEnabled(
  kind: GlobalShortcutKind,
  enabled: boolean,
): Promise<GlobalShortcutSettingsSnapshot> {
  return invoke<GlobalShortcutSettingsSnapshot>("set_global_shortcut_enabled", { kind, enabled });
}
