import { useThemeRuntime } from "./ThemeRuntime";
import type { ThemePreference } from "./themeApi";
import "./themeSettingsPanel.css";

type ThemeSettingsPanelViewProps = {
  theme: ThemePreference;
  pending?: boolean;
  error?: string | null;
  onSelectTheme: (theme: ThemePreference) => void;
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
}: ThemeSettingsPanelViewProps) {
  return (
    <section className="theme-settings" data-theme-settings="true" aria-labelledby="theme-settings-title">
      <header className="theme-settings__header">
        <p className="theme-settings__eyebrow type-metadata">Settings</p>
        <h1 id="theme-settings-title" className="type-page-title">Preferences</h1>
        <p className="theme-settings__intro">
          Choose how Narro follows the Windows appearance. Other preference families remain unchanged.
        </p>
      </header>

      <section className="theme-settings__section" aria-labelledby="theme-general-title">
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

        {error ? <div className="theme-settings__error" role="alert">{error}</div> : null}
      </section>
    </section>
  );
}

export function ThemeSettingsPanel() {
  const { theme, pending, error, saveTheme } = useThemeRuntime();
  return (
    <ThemeSettingsPanelView
      theme={theme}
      pending={pending}
      error={error}
      onSelectTheme={(next) => void saveTheme(next)}
    />
  );
}
