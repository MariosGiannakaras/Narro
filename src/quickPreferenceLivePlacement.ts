import type { PreferencePendingKey } from "./PreferenceSettingsRuntime";
import type { PreferenceSettingsPatch } from "./preferencesApi";

// Only these two persisted settings change the already visible Panel's
// native monitor/edge. Never reposition or convert an active Timer for the
// unrelated Focus/alert toggles.
export function isLivePanelPlacementPreference(key: PreferencePendingKey): boolean {
  return key === "monitor" || key === "side";
}

export async function saveQuickPreferenceWithLivePlacement(
  patch: PreferenceSettingsPatch,
  key: PreferencePendingKey,
  persist: (patch: PreferenceSettingsPatch, key: PreferencePendingKey) => Promise<boolean>,
  reapplyVisiblePanel: () => Promise<void>,
): Promise<boolean> {
  const saved = await persist(patch, key);
  if (!saved) return false;
  if (isLivePanelPlacementPreference(key)) {
    await reapplyVisiblePanel();
  }
  return true;
}
