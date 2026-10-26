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
    rememberTimerPositionOnRestart: false,
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

let shortcutsCloseRequests = 0;
const readShortcutCloseRequests = () => shortcutsCloseRequests;
flushSync(() => {
  const content = (
    shortcutsDialog ? (
      <WindowsShortcutsDialog
        onRequestClose={() => { shortcutsCloseRequests++; }}
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
    if (shortcutsDialog && !shortcutConflict) {
      // C38: ten rows existed in the DOM while the final Search row was
      // below the visible native 1000x700 dialog. Check painted bounds,
      // not just row presence or a screenshot with scrollbars hidden.
      const scroll = document.querySelector<HTMLElement>(".windows-shortcuts-dialog__scroll");
      const rows = Array.from(document.querySelectorAll<HTMLElement>(".windows-shortcuts__row"));
      const bounds = scroll?.getBoundingClientRect();
      const fits = Boolean(scroll && bounds && rows.length === 10
        && scroll.scrollHeight <= scroll.clientHeight + 1
        && scroll.scrollWidth <= scroll.clientWidth + 1
        && rows.every((row) => {
          const rect = row.getBoundingClientRect();
          return rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1;
        }));
      document.documentElement.dataset.themeSettingsShortcutsLayout = JSON.stringify({
        viewport: [innerWidth, innerHeight], rows: rows.length,
        client: scroll ? [scroll.clientWidth, scroll.clientHeight] : null,
        content: scroll ? [scroll.scrollWidth, scroll.scrollHeight] : null,
      });
      // Smaller windows retain accessible scrolling; do not crop content to
      // make a no-scroll assertion pass outside the supported dense layout.
      if (innerWidth >= 1000 && innerHeight >= 700) {
        document.documentElement.dataset.themeSettingsShortcutsLayoutPass = String(fits);
        if (!fits) throw new Error("C38: ten shortcut rows must fit the supported dialog viewport");
      }
    }
    if (shortcutsDialog && !shortcutConflict) {
      // Simulate browser focus loss during a native shortcut-save without
      // changing actual shortcut preferences or registration.
      const closeButton = document.querySelector<HTMLButtonElement>('[data-windows-shortcuts-close="true"]');
      if (!closeButton) throw new Error("Shortcuts close button is missing");
      // G16 pre-physical: exercise production dialog's real browser-facing
      // forward and reverse focus trap, not UI Automation's RootWebArea
      // placeholder (which cannot identify a DOM-focused child in WebView2).
      const shortcutsSurface = closeButton.closest<HTMLElement>('[role="dialog"][aria-modal="true"]');
      if (!shortcutsSurface) throw new Error("Windows Shortcuts modal focus owner missing");
      const tabbables = Array.from(shortcutsSurface.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter(element => !element.closest('[hidden], [inert]') && element.getClientRects().length > 0);
      const lastTabbable = tabbables[tabbables.length - 1];
      if (tabbables[0] !== closeButton || !lastTabbable || lastTabbable === closeButton) {
        throw new Error("Shortcuts trap requires the real close and final keyboard control");
      }
      lastTabbable.focus({ preventScroll: true });
      const forwardTab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
      lastTabbable.dispatchEvent(forwardTab);
      if (!forwardTab.defaultPrevented || document.activeElement !== closeButton) {
        throw new Error("Shortcuts forward Tab did not wrap from last to first control");
      }
      const reverseTab = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true });
      closeButton.dispatchEvent(reverseTab);
      if (!reverseTab.defaultPrevented || document.activeElement !== lastTabbable) {
        throw new Error("Shortcuts reverse Shift+Tab did not wrap from first to last control");
      }
      document.documentElement.dataset.themeSettingsShortcutsTabTrapPass = "true";
      closeButton.focus({ preventScroll: true });
      // A later topmost modal owns input; do not steal its Escape.
      const newerDialog = document.createElement("section");
      newerDialog.setAttribute("role", "dialog");
      newerDialog.setAttribute("aria-modal", "true");
      newerDialog.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px";
      document.body.appendChild(newerDialog);
      const newerEscape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
      window.dispatchEvent(newerEscape);
      newerDialog.remove();
      if (newerEscape.defaultPrevented || readShortcutCloseRequests() !== 0) {
        throw new Error("Shortcuts recovery stole input from a newer modal");
      }
      closeButton.blur();
      if (document.activeElement !== document.body) throw new Error("Shortcuts orphaned focus setup failed");
      const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
      window.dispatchEvent(tab);
      const tabRecovered = tab.defaultPrevented && document.activeElement === closeButton;
      closeButton.blur();
      const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
      window.dispatchEvent(escape);
      const passed = tabRecovered && escape.defaultPrevented && readShortcutCloseRequests() === 1;
      document.documentElement.dataset.themeSettingsShortcutsKeyboardRecoveryPass = String(passed);
      if (!passed) throw new Error("Shortcuts must recover Tab and Escape when pending save orphans focus");
    }
    // Verify *rendered* icon-only modal controls, not just source CSS text.
    // Both dialogs reuse 2rem hitboxes around the same 16px ActionIcon close.
    // A browser line box or inherited global button padding can otherwise
    // displace/squeeze the SVG even if the class declares place-items:center.
    const modalCloseSelector = shortcutsDialog
      ? '[data-windows-shortcuts-close="true"]'
      : preferencesDialog ? '[data-preferences-close="true"]' : null;
    if (modalCloseSelector) {
      const close = document.querySelector<HTMLButtonElement>(modalCloseSelector);
      const svg = close?.querySelector("svg");
      if (!close || !svg) throw new Error("Modal close icon control is missing");
      const rect = close.getBoundingClientRect();
      const glyph = svg.getBoundingClientRect();
      const rootRem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const computed = getComputedStyle(close);
      const near = (actual: number, expected: number) =>
        Number.isFinite(actual) && Number.isFinite(expected) && Math.abs(actual - expected) <= 0.75;
      const centered = near(rect.width, 2 * rootRem) && near(rect.height, 2 * rootRem)
        && near(glyph.width, 16) && near(glyph.height, 16)
        && near((glyph.left + glyph.right) / 2, (rect.left + rect.right) / 2)
        && near((glyph.top + glyph.bottom) / 2, (rect.top + rect.bottom) / 2)
        && near(parseFloat(computed.paddingLeft), 0)
        && near(parseFloat(computed.paddingRight), 0);
      document.documentElement.dataset.themeSettingsModalCloseGeometryPass = String(centered);
      if (!centered) throw new Error("Rendered 2rem modal close: 16px SVG must be centered, no inherited padding");
    }
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
