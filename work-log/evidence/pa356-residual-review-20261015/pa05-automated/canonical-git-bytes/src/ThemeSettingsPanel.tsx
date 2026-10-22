import { type ReactNode } from "react";
import {
  BlitzPanelPreferenceSection,
  GeneralPreferenceRows,
  LowerPreferenceSections,
} from "./PreferenceSettingsSections";
import {
  PreferenceSettingsRuntimeProvider,
  usePreferenceSettingsRuntime,
} from "./PreferenceSettingsRuntime";
import { useThemeRuntime } from "./ThemeRuntime";
import type { ThemePreference } from "./themeApi";
import { WindowsShortcutSettingsPanel } from "./WindowsShortcutSettingsPanel";
import "./themeSettingsPanel.css";

type ThemeSettingsPanelViewProps = {
  theme: ThemePreference;
  pending?: boolean;
  error?: string | null;
  onSelectTheme: (theme: ThemePreference) => void;
  beforeGeneral?: ReactNode;
  generalChildren?: ReactNode;
  children?: ReactNode;
};

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; description: string }> = [
  { value: "system", label: "System", description: "Follow your Windows color mode" },
  { value: "dark", label: "Dark", description: "Use Narro's dark surfaces" },
  { value: "light", label: "Light", description: "Use Narro's light surfaces" },
];

export function ThemeSettingsPanelView({
  theme,
  pending = false,
  error = null,
  onSelectTheme,
  beforeGeneral,
  generalChildren,
  children,
}: ThemeSettingsPanelViewProps) {
  return (
    <section className="theme-settings" data-theme-settings="true" aria-labelledby="theme-settings-title">
      <header className="theme-settings__header">
        <p className="theme-settings__eyebrow type-metadata">Settings</p>
        <h1 id="theme-settings-title" className="type-page-title">Preferences</h1>
        <p className="theme-settings__intro">Manage Narro's local Windows appearance and shortcuts.</p>
      </header>

      {beforeGeneral}

      <section className="theme-settings__section preference-settings__section" aria-labelledby="theme-general-title">
        <div className="theme-settings__section-heading">
          <div>
            <p className="theme-settings__section-kicker type-metadata">Appearance</p>
            <h2 id="theme-general-title" className="type-section-title">General</h2>
          </div>
          {pending ? <span className="theme-settings__saving" role="status">Saving…</span> : null}
        </div>

        <div className="theme-settings__row">
          <div className="theme-settings__copy">
            <strong>Theme</strong>
            <span className="type-metadata">System follows your current Windows light or dark preference.</span>
          </div>
          <div className="theme-settings__segments" role="group" aria-label="Theme">
            {THEME_OPTIONS.map((option) => {
              const selected = option.value === theme;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`theme-settings__segment motion-interactive${selected ? " theme-settings__segment--selected" : ""}`}
                  aria-pressed={selected}
                  aria-label={`${option.label} theme — ${option.description}`}
                  disabled={pending}
                  data-theme-option={option.value}
                  onClick={() => onSelectTheme(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {generalChildren}
        {error ? <div className="theme-settings__error" role="alert">{error}</div> : null}
      </section>

      {children}
    </section>
  );
}

function ThemeSettingsPanelContent({ onOpenShortcuts }: { onOpenShortcuts?: () => void }) {
  const { theme, pending, error: themeError, saveTheme } = useThemeRuntime();
  const preferences = usePreferenceSettingsRuntime();
  const save = (patch: Parameters<typeof preferences.save>[0], key: Parameters<typeof preferences.save>[1]) => {
    void preferences.save(patch, key);
  };

  const beforeGeneral = preferences.snapshot ? (
    <>
      {preferences.error ? (
        <div className="theme-settings__error preference-settings__error" role="alert">
          {preferences.error}
        </div>
      ) : null}
      <BlitzPanelPreferenceSection
        snapshot={preferences.snapshot}
        monitors={preferences.monitors}
        pendingKey={preferences.pendingKey}
        onSave={save}
        onRefreshMonitors={() => void preferences.refreshMonitors()}
      />
    </>
  ) : (
    <div className="preference-settings__loading" role="status">
      {preferences.loading ? "Loading Preferences…" : "Preferences could not be loaded."}
    </div>
  );

  return (
    <ThemeSettingsPanelView
      theme={theme}
      pending={pending}
      error={themeError}
      onSelectTheme={(next) => void saveTheme(next)}
      beforeGeneral={beforeGeneral}
      generalChildren={preferences.snapshot ? (
        <GeneralPreferenceRows
          snapshot={preferences.snapshot}
          pendingKey={preferences.pendingKey}
          onSave={save}
        />
      ) : null}
    >
      {preferences.snapshot ? (
        <LowerPreferenceSections
          snapshot={preferences.snapshot}
          pendingKey={preferences.pendingKey}
          onSave={save}
        />
      ) : null}
      {onOpenShortcuts ? (
        <section className="theme-settings__section" data-shortcuts-dialog-entry="true"
          aria-labelledby="theme-shortcuts-title">
          <div className="theme-settings__section-heading">
            <div>
              <p className="theme-settings__section-kicker type-metadata">Windows</p>
              <h2 id="theme-shortcuts-title" className="type-section-title">Shortcuts</h2>
            </div>
            <button type="button" className="theme-settings__shortcut-entry motion-interactive"
              onClick={onOpenShortcuts}>
              View shortcuts
            </button>
          </div>
          <p className="type-metadata">
            Review the three global shortcuts and seven fixed in-app bindings in a dedicated window.
          </p>
        </section>
      ) : <WindowsShortcutSettingsPanel />}
    </ThemeSettingsPanelView>
  );
}

export function ThemeSettingsPanel({ onOpenShortcuts }: { onOpenShortcuts?: () => void } = {}) {
  return (
    <PreferenceSettingsRuntimeProvider>
      <ThemeSettingsPanelContent onOpenShortcuts={onOpenShortcuts} />
    </PreferenceSettingsRuntimeProvider>
  );
}
