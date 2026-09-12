import { invoke } from "@tauri-apps/api/core";

export const THEME_PREFERENCE_CHANGED_EVENT = "theme-preference-changed";

export type ThemePreference = "system" | "dark" | "light";

export function getThemePreference(): Promise<ThemePreference> {
  return invoke<ThemePreference>("get_theme_preference");
}

export function setThemePreference(theme: ThemePreference): Promise<ThemePreference> {
  return invoke<ThemePreference>("set_theme_preference", { theme });
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "dark" || value === "light";
}
