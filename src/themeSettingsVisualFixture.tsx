import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import "./App.css";
import { ThemeSettingsPanelView } from "./ThemeSettingsPanel";
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
    >
      <WindowsShortcutSettingsPanelView
        snapshot={shortcutSnapshot}
        onChange={() => undefined}
      />
    </ThemeSettingsPanelView>,
  );
});

document.documentElement.dataset.themeSettingsShortcutConflict = shortcutConflict ? "true" : "false";
document.documentElement.dataset.themeSettingsFixtureReady = "true";
