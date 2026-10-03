import { invoke } from "@tauri-apps/api/core";
import type { MonitorDescriptor } from "./diagnosticApi";
import type { LocalSoundId } from "./localSoundCatalog";

export const PREFERENCES_CHANGED_EVENT = "preferences-changed";

export type FocusPanelSidePreference = "left" | "right";

export type GeneralSettingsSnapshot = {
  selectedMonitorKey: string | null;
  focusPanelSide: FocusPanelSidePreference;
  openOnLogin: boolean;
  autostartEnabled: boolean;
  hideTaskTimes: boolean;
  autoParseEstFromTitle: boolean;
  timezone: string | null;
};

export type FocusSettingsSnapshot = {
  pomodoroEnabled: boolean;
  pomodoroWorkSeconds: number;
  pomodoroBreakSeconds: number;
  defaultBreakSeconds: number;
  scrollingTitle: boolean;
};

export type AlertSettingsSnapshot = {
  timedAlertsEnabled: boolean;
  taskAlertIntervalSeconds: number;
  taskAlertSound: LocalSoundId | null;
  taskAlertVolumePercent: number;
  animatedTimerFlash: boolean;
  notificationAlertsEnabled: boolean;
  notificationSound: LocalSoundId | null;
  notificationVolumePercent: number;
  scheduleRemindersEnabled: boolean;
  reminderLeadSeconds: number;
};

export type CelebrationSettingsSnapshot = {
  showSuccessScreen: boolean;
  funGif: boolean;
  successSound: LocalSoundId | null;
  successSoundVolumePercent: number;
};

export type PreferenceSettingsSnapshot = {
  schemaVersion: number;
  general: GeneralSettingsSnapshot;
  focus: FocusSettingsSnapshot;
  alerts: AlertSettingsSnapshot;
  celebration: CelebrationSettingsSnapshot;
  localSoundCatalogAvailable: boolean;
};

export type PreferenceSettingsPatch = Partial<{
  selectedMonitorKey: string;
  focusPanelSide: FocusPanelSidePreference;
  openOnLogin: boolean;
  hideTaskTimes: boolean;
  autoParseEstFromTitle: boolean;
  timezone: string;
  pomodoroEnabled: boolean;
  pomodoroWorkSeconds: number;
  pomodoroBreakSeconds: number;
  defaultBreakSeconds: number;
  scrollingTitle: boolean;
  timedAlertsEnabled: boolean;
  taskAlertIntervalSeconds: number;
  taskAlertSound: LocalSoundId;
  taskAlertVolumePercent: number;
  animatedTimerFlash: boolean;
  notificationAlertsEnabled: boolean;
  notificationSound: LocalSoundId;
  notificationVolumePercent: number;
  scheduleRemindersEnabled: boolean;
  reminderLeadSeconds: number;
  showSuccessScreen: boolean;
  funGif: boolean;
  successSound: LocalSoundId;
  successSoundVolumePercent: number;
}>;

export function getPreferenceSettings(): Promise<PreferenceSettingsSnapshot> {
  return invoke<PreferenceSettingsSnapshot>("get_preference_settings");
}

export function updatePreferenceSettings(
  patch: PreferenceSettingsPatch,
): Promise<PreferenceSettingsSnapshot> {
  return invoke<PreferenceSettingsSnapshot>("update_preference_settings", { patch });
}

export function listPreferenceMonitors(): Promise<MonitorDescriptor[]> {
  return invoke<MonitorDescriptor[]>("list_monitors");
}
