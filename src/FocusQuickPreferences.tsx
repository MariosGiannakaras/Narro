import type { ReactNode } from "react";
import { findSelectedMonitor, type MonitorDescriptor } from "./diagnosticApi";
import {
  PreferenceSettingsRuntimeProvider,
  type PreferencePendingKey,
  usePreferenceSettingsRuntime,
} from "./PreferenceSettingsRuntime";
import type {
  FocusPanelSidePreference,
  PreferenceSettingsPatch,
  PreferenceSettingsSnapshot,
} from "./preferencesApi";
import "./focusQuickPreferences.css";

type FocusQuickPreferencesProps = {
  onBack: () => void;
};

type FocusQuickPreferencesViewProps = FocusQuickPreferencesProps & {
  snapshot: PreferenceSettingsSnapshot;
  monitors: MonitorDescriptor[];
  pendingKey: PreferencePendingKey | null;
  error: string | null;
  onSave: (
    patch: PreferenceSettingsPatch,
    key: PreferencePendingKey,
  ) => void | Promise<boolean>;
};

function QuickToggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      className={`focus-quick-preferences__switch${checked ? " focus-quick-preferences__switch--on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
    >
      <span aria-hidden="true" />
    </button>
  );
}

function QuickRow({
  title,
  nested = false,
  children,
}: {
  title: string;
  nested?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`focus-quick-preferences__row${nested ? " focus-quick-preferences__row--nested" : ""}`}>
      <span className="focus-quick-preferences__row-title">{title}</span>
      {children}
    </div>
  );
}

function QuickHeader({ onBack, saving = false }: FocusQuickPreferencesProps & { saving?: boolean }) {
  return (
    <header className="focus-quick-preferences__header">
      <button
        type="button"
        className="focus-quick-preferences__back"
        aria-label="Back to Focus"
        data-focus-quick-preferences-back="true"
        autoFocus
        onClick={onBack}
      >
        ←
      </button>
      <div className="focus-quick-preferences__heading">
        <span className="type-metadata">Menu</span>
        <h1 id="focus-quick-preferences-title">Quick Preferences</h1>
      </div>
      {saving ? <span className="focus-quick-preferences__saving type-metadata" role="status">Saving…</span> : null}
    </header>
  );
}

export function FocusQuickPreferencesView({
  onBack,
  snapshot,
  monitors,
  pendingKey,
  error,
  onSave,
}: FocusQuickPreferencesViewProps) {
  const busy = pendingKey !== null;
  const savedMonitorKey = snapshot.general.selectedMonitorKey;
  const resolvedMonitor = savedMonitorKey ? findSelectedMonitor(savedMonitorKey, monitors) : null;
  const automaticSelected = !savedMonitorKey;
  const savedMonitorUnavailable = Boolean(savedMonitorKey && !resolvedMonitor);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onBack();
    }
  };

  return (
    <section
      className="focus-quick-preferences"
      data-focus-quick-preferences="true"
      aria-labelledby="focus-quick-preferences-title"
      onKeyDown={handleKeyDown}
    >
      <QuickHeader onBack={onBack} saving={busy} />

      <div className="focus-quick-preferences__body">
        {error ? <div className="focus-quick-preferences__error type-metadata" role="alert">{error}</div> : null}

        <QuickRow title="Hide est/done times">
          <QuickToggle
            checked={snapshot.general.hideTaskTimes}
            disabled={busy}
            label="Hide est/done times on tasks"
            onChange={() => void onSave({ hideTaskTimes: !snapshot.general.hideTaskTimes }, "hideTaskTimes")}
          />
        </QuickRow>

        <section className="focus-quick-preferences__group" aria-labelledby="focus-quick-screen-title">
          <h2 id="focus-quick-screen-title" className="focus-quick-preferences__group-title">Screen</h2>
          <div className="focus-quick-preferences__screens" role="radiogroup" aria-label="Focus Panel screen">
            <button
              type="button"
              role="radio"
              aria-checked={automaticSelected}
              className={`focus-quick-preferences__screen${automaticSelected ? " focus-quick-preferences__screen--selected" : ""}`}
              disabled={busy}
              data-focus-quick-screen="automatic"
              onClick={() => void onSave({ selectedMonitorKey: "" }, "monitor")}
            >
              <span className="focus-quick-preferences__screen-preview" aria-hidden="true">
                <span />
              </span>
              <strong>Automatic</strong>
              <span className="type-metadata">Primary display</span>
            </button>
            {monitors.map((monitor) => {
              const selected = resolvedMonitor?.key === monitor.key;
              return (
                <button
                  key={monitor.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`focus-quick-preferences__screen${selected ? " focus-quick-preferences__screen--selected" : ""}`}
                  disabled={busy}
                  data-focus-quick-screen={monitor.key}
                  onClick={() => void onSave({ selectedMonitorKey: monitor.key }, "monitor")}
                >
                  <span className="focus-quick-preferences__screen-preview" aria-hidden="true">
                    <span />
                  </span>
                  <strong>{monitor.name?.trim() || `Screen ${monitor.index + 1}`}</strong>
                  <span className="type-metadata" data-focus-quick-screen-dimensions="true">
                    {monitor.size.width}×{monitor.size.height}
                  </span>
                </button>
              );
            })}
          </div>
          {savedMonitorUnavailable ? (
            <p className="focus-quick-preferences__warning type-metadata" role="status">
              Saved screen is unavailable. Choose a current screen or Automatic.
            </p>
          ) : null}
        </section>

        <QuickRow title="Blitz Panel Side">
          <div className="focus-quick-preferences__segments" role="group" aria-label="Blitz Panel Side">
            {(["left", "right"] as FocusPanelSidePreference[]).map((side) => {
              const selected = snapshot.general.focusPanelSide === side;
              return (
                <button
                  key={side}
                  type="button"
                  className={`focus-quick-preferences__segment${selected ? " focus-quick-preferences__segment--selected" : ""}`}
                  aria-pressed={selected}
                  disabled={busy}
                  onClick={() => void onSave({ focusPanelSide: side }, "side")}
                >
                  {side === "left" ? "Left" : "Right"}
                </button>
              );
            })}
          </div>
        </QuickRow>

        <QuickRow title="Pomodoros">
          <QuickToggle
            checked={snapshot.focus.pomodoroEnabled}
            disabled={busy}
            label="Pomodoros"
            onChange={() => void onSave({ pomodoroEnabled: !snapshot.focus.pomodoroEnabled }, "pomodoro")}
          />
        </QuickRow>

        <QuickRow title="Timed alerts during a task">
          <QuickToggle
            checked={snapshot.alerts.timedAlertsEnabled}
            disabled={busy}
            label="Timed alerts during a task"
            onChange={() => void onSave({ timedAlertsEnabled: !snapshot.alerts.timedAlertsEnabled }, "timedAlerts")}
          />
        </QuickRow>

        <QuickRow title="Notification Alerts">
          <QuickToggle
            checked={snapshot.alerts.notificationAlertsEnabled}
            disabled={busy}
            label="Notification Alerts"
            onChange={() => void onSave({ notificationAlertsEnabled: !snapshot.alerts.notificationAlertsEnabled }, "notificationAlerts")}
          />
        </QuickRow>

        <QuickRow title="Show success screen">
          <QuickToggle
            checked={snapshot.celebration.showSuccessScreen}
            disabled={busy}
            label="Show success screen"
            onChange={() => void onSave({ showSuccessScreen: !snapshot.celebration.showSuccessScreen }, "successScreen")}
          />
        </QuickRow>

        {snapshot.celebration.showSuccessScreen ? (
          <QuickRow title="Fun gif on success screen" nested>
            <QuickToggle
              checked={snapshot.celebration.funGif}
              disabled={busy}
              label="Fun gif on success screen"
              onChange={() => void onSave({ funGif: !snapshot.celebration.funGif }, "funGif")}
            />
          </QuickRow>
        ) : null}
      </div>
    </section>
  );
}

function FocusQuickPreferencesContent({ onBack }: FocusQuickPreferencesProps) {
  const preferences = usePreferenceSettingsRuntime();

  if (!preferences.snapshot) {
    return (
      <section
        className="focus-quick-preferences"
        data-focus-quick-preferences={preferences.loading ? "loading" : "error"}
        aria-labelledby="focus-quick-preferences-title"
      >
        <QuickHeader onBack={onBack} />
        <div className="focus-quick-preferences__body">
          <div className={`focus-quick-preferences__status type-metadata${preferences.error ? " focus-quick-preferences__error" : ""}`} role={preferences.error ? "alert" : "status"}>
            {preferences.error ?? "Loading Quick Preferences…"}
          </div>
        </div>
      </section>
    );
  }

  return (
    <FocusQuickPreferencesView
      onBack={onBack}
      snapshot={preferences.snapshot}
      monitors={preferences.monitors}
      pendingKey={preferences.pendingKey}
      error={preferences.error}
      onSave={preferences.save}
    />
  );
}

export function FocusQuickPreferences({ onBack }: FocusQuickPreferencesProps) {
  return (
    <PreferenceSettingsRuntimeProvider>
      <FocusQuickPreferencesContent onBack={onBack} />
    </PreferenceSettingsRuntimeProvider>
  );
}
