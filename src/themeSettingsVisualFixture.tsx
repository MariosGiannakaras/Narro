import { flushSync } from "react-dom";
import { cloneElement, type ComponentProps, type ReactElement, useState } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import {
  BlitzPanelPreferenceSection,
  GeneralPreferenceRows,
  LowerPreferenceSections,
  TimePreferenceRows,
} from "./PreferenceSettingsSections";
import type { PreferenceSettingsSnapshot } from "./preferencesApi";
import { ThemeSettingsPanelView } from "./ThemeSettingsPanel";
import type { MonitorDescriptor } from "./diagnosticApi";
import type { ThemePreference } from "./themeApi";
import { WindowsShortcutSettingsPanelView } from "./WindowsShortcutSettingsPanel";
import { WindowsShortcutsDialog } from "./WindowsShortcutsDialog";
import { PreferencesDialog } from "./PreferencesDialog";
import type { GlobalShortcutSettingsSnapshot } from "./globalShortcutSettingsApi";
import { runPreferencesKeyboardRegression } from "./preferencesKeyboardRegression";

const params = new URLSearchParams(window.location.search);
const requested = params.get("preference");
const theme: ThemePreference = requested === "dark" || requested === "light" ? requested : "system";
const error = params.get("error") === "1"
  ? "[THEME_PREFERENCE_FAILED] The theme preference could not be saved."
  : null;
const shortcutConflict = params.get("shortcutConflict") === "1";
const shortcutsDialog = params.get("shortcutsDialog") === "1";
const preferencesDialog = params.get("preferencesDialog") === "1";

let settleThemeSave: ((failed: boolean) => void) | null = null;
function PreferencesFixture({ children }: { children: ReactElement<ComponentProps<typeof ThemeSettingsPanelView>> }) {
  const [open, setOpen] = useState(true);
  const [selectedTheme, setTheme] = useState(theme);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  return <>
    <button type="button" data-preferences-fixture-reopen="true" onClick={() => { setSaveError(null); setOpen(true); }}>Reopen Preferences</button>
    {open ? <PreferencesDialog onRequestClose={() => setOpen(false)}>{cloneElement(children, {
      theme: selectedTheme, pending: saving, error: saveError,
      onSelectTheme: (next: ThemePreference) => {
        if (saving || next === selectedTheme) return;
        setSaving(true);
        setSaveError(null);
        // A deferred native-save boundary: the regression controls completion
        // so pending, failure and late completion after close are deterministic.
        settleThemeSave = (failed) => {
          setSaving(false);
          if (failed) setSaveError("Fixture theme save failed");
          else setTheme(next);
          settleThemeSave = null;
        };
      },
    })}</PreferencesDialog> : null}
  </>;
}
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
  const content = (
    shortcutsDialog ? (
      <WindowsShortcutsDialog
        onRequestClose={() => undefined}
        settingsContent={(
          <WindowsShortcutSettingsPanelView
            snapshot={shortcutSnapshot}
            onChange={() => undefined}
          />
        )}
      />
    ) : (
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
      timeChildren={(
        <TimePreferenceRows
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
    </ThemeSettingsPanelView>
    )
  );
  createRoot(root).render(preferencesDialog ? <PreferencesFixture>{content}</PreferencesFixture> : content);
});

document.documentElement.dataset.themeSettingsShortcutConflict = shortcutConflict ? "true" : "false";
document.documentElement.dataset.themeSettingsShortcutsDialog = shortcutsDialog ? "true" : "false";
document.documentElement.dataset.themeSettingsSection = section;

const sectionTarget: Record<string, string> = {
  upper: "preferences-blitz-panel-title",
  middle: "preferences-blitz-mode-title",
  lower: "preferences-celebration-title",
};

window.requestAnimationFrame(async () => {
  if (preferencesDialog) {
    const scroll = document.querySelector<HTMLElement>('.preferences-dialog__scroll');
    if (!scroll || scroll.scrollWidth > scroll.clientWidth + 1) throw new Error('Preferences parent dialog has horizontal overflow.');
    scroll.scrollTop = scroll.scrollHeight;
    if (scroll.scrollTop <= 0) throw new Error('Preferences vertical scrolling was lost.');
    scroll.scrollTop = 0;
    const close = document.querySelector<HTMLButtonElement>('[data-preferences-close="true"]')!;
    flushSync(() => close.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })));
    if (document.querySelector('[data-preferences-dialog="true"]')) throw new Error('Preferences Escape did not dismiss.');
    flushSync(() => document.querySelector<HTMLButtonElement>('[data-preferences-fixture-reopen="true"]')!.click());
    try {
      await runPreferencesKeyboardRegression((failed) => {
        if (!settleThemeSave) throw new Error('Missing pending fixture theme save.');
        flushSync(() => settleThemeSave!(failed));
      });
      document.documentElement.dataset.themeSettingsKeyboardPass = 'true';
    } catch (error) {
      document.documentElement.dataset.themeSettingsKeyboardError = String(error);
      throw error;
    }
    document.documentElement.dataset.themeSettingsDialogContainmentPass = 'true';
  }
  // Source-aligned section captures must stay inside Edge's screenshot viewport.
  // scrollIntoView scrolled the page past the visible fixture: the former
  // preferences-middle/lower PNGs were entirely blank although the DOM passed.
  if (!shortcutsDialog && section !== "upper") {
    const target = document.getElementById(sectionTarget[section] ?? sectionTarget.upper);
    const surface = document.querySelector<HTMLElement>(".theme-settings");
    if (!target || !surface) throw new Error("Preferences fixture section target is missing.");
    const relativeTop = target.getBoundingClientRect().top - surface.getBoundingClientRect().top;
    surface.style.transform = `translateY(-${Math.max(0, Math.round(relativeTop) - 72)}px)`;
  }
  window.requestAnimationFrame(() => {
    // Check actual layout: these three readable accessibility names must not
    // occupy visible space in a standalone renderer without unrelated CSS.
    const labels = Array.from(document.querySelectorAll<HTMLElement>(".windows-shortcuts__toggle .sr-only"));
    const labelsHidden = labels.length === 3 && labels.every((label) => {
      const bounds = label.getBoundingClientRect();
      return bounds.width <= 1 && bounds.height <= 1;
    });
    document.documentElement.dataset.themeSettingsShortcutLabelsHidden = labelsHidden ? "true" : "false";
    document.documentElement.dataset.themeSettingsFixtureReady = "true";
  });
});
