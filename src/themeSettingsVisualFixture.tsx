import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import {
  BlitzPanelPreferenceSection,
  GeneralPreferenceRows,
  LowerPreferenceSections,
} from "./PreferenceSettingsSections";
import type { PreferenceSettingsSnapshot } from "./preferencesApi";
import { ThemeSettingsPanelView } from "./ThemeSettingsPanel";
import type { MonitorDescriptor } from "./diagnosticApi";
import type { ThemePreference } from "./themeApi";
import { WindowsShortcutSettingsPanelView } from "./WindowsShortcutSettingsPanel";
import type { GlobalShortcutSettingsSnapshot } from "./globalShortcutSettingsApi";

const params = new URLSearchParams(window.location.search);
const requested = params.get("preference");
const theme: ThemePreference = requested === "dark" || requested === "light" ? requested : "system";
const error = params.get("error") === "1"
  ? "[THEME_PREFERENCE_FAILED] The theme preference could not be saved."
  : null;
const shortcutConflict = params.get("shortcutConflict") === "1";
const section = params.get("section") ?? "upper";

const preferenceSnapshot: PreferenceSettingsSnapshot = {
  schemaVersion: 5,
  general: {
    selectedMonitorKey: "fixture-monitor-secondary",
    focusPanelSide: "right",
    openOnLogin: true,
    autostartEnabled: true,
    hideTaskTimes: true,
    autoParseEstFromTitle: true,
    timezone: "Europe/Athens",
  },
  focus: {
    pomodoroEnabled: true,
    pomodoroWorkSeconds: 25 * 60,
    pomodoroBreakSeconds: 5 * 60,
    defaultBreakSeconds: 10 * 60,
    scrollingTitle: true,
  },
  alerts: {
    timedAlertsEnabled: true,
    taskAlertIntervalSeconds: 10 * 60,
    taskAlertSound: "melodic-bell",
    taskAlertVolumePercent: 70,
    animatedTimerFlash: true,
    notificationAlertsEnabled: true,
    notificationSound: "futuristic-ding",
    notificationVolumePercent: 65,
    scheduleRemindersEnabled: true,
    reminderLeadSeconds: 10 * 60,
  },
  celebration: {
    showSuccessScreen: true,
    funGif: true,
    successSoundEnabled: true,
    successSound: "victory-bell",
    successSoundVolumePercent: 75,
  },
  localSoundCatalogAvailable: true,
};

const preferenceMonitors: MonitorDescriptor[] = [
  {
    key: "fixture-monitor-primary",
    index: 0,
    name: "Primary display",
    scaleFactor: 1,
    position: { x: 0, y: 0 },
    size: { width: 1920, height: 1080 },
    workArea: { position: { x: 0, y: 0 }, size: { width: 1920, height: 1040 } },
  },
  {
    key: "fixture-monitor-secondary",
    index: 1,
    name: "Secondary display",
    scaleFactor: 1.25,
    position: { x: 1920, y: 0 },
    size: { width: 2560, height: 1440 },
    workArea: { position: { x: 1920, y: 0 }, size: { width: 2560, height: 1400 } },
  },
];

const shortcutSnapshot: GlobalShortcutSettingsSnapshot = {
  goToNarroEnabled: true,
  toggleFocusModeEnabled: true,
  findFocusTimerEnabled: true,
  diagnostics: {
    observerInstalled: true,
    registered: true,
    chord: "Ctrl+Shift+B",
    triggerCount: 0,
    revision: 3,
    lastError: null,
    focusToggleRegistered: true,
    focusToggleChord: "Ctrl+Shift+T",
    focusToggleTriggerCount: 0,
    focusToggleLastError: null,
    findTimerRegistered: !shortcutConflict,
    findTimerChord: "Ctrl+Shift+P",
    findTimerTriggerCount: 0,
    findTimerLastError: shortcutConflict
      ? {
          code: "SHORTCUT_CONFLICT",
          message: "global shortcut 'Ctrl+Shift+P' is already registered and cannot be claimed by Narro",
        }
      : null,
  },
};

document.documentElement.dataset.theme = theme;
document.body.classList.add("visual-fixture-body");
document.body.dataset.themeSettingsPreference = theme;

const root = document.getElementById("root");
if (!root) throw new Error("Theme settings fixture root is missing.");

flushSync(() => {
  createRoot(root).render(
    <ThemeSettingsPanelView
      theme={theme}
      error={error}
      onSelectTheme={() => undefined}
      beforeGeneral={(
        <BlitzPanelPreferenceSection
          snapshot={preferenceSnapshot}
          monitors={preferenceMonitors}
          pendingKey={null}
          onSave={() => undefined}
          onRefreshMonitors={() => undefined}
        />
      )}
      generalChildren={(
        <GeneralPreferenceRows
          snapshot={preferenceSnapshot}
          pendingKey={null}
          onSave={() => undefined}
        />
      )}
    >
      <LowerPreferenceSections
        snapshot={preferenceSnapshot}
        pendingKey={null}
        onSave={() => undefined}
      />
      <WindowsShortcutSettingsPanelView
        snapshot={shortcutSnapshot}
        onChange={() => undefined}
      />
    </ThemeSettingsPanelView>,
  );
});

document.documentElement.dataset.themeSettingsShortcutConflict = shortcutConflict ? "true" : "false";
document.documentElement.dataset.themeSettingsSection = section;

const sectionTarget: Record<string, string> = {
  upper: "preferences-blitz-panel-title",
  middle: "preferences-blitz-mode-title",
  lower: "preferences-celebration-title",
};

window.requestAnimationFrame(() => {
  document.getElementById(sectionTarget[section] ?? sectionTarget.upper)?.scrollIntoView({ block: "start" });
  window.requestAnimationFrame(() => {
    document.documentElement.dataset.themeSettingsFixtureReady = "true";
  });
});
