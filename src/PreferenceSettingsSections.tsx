import type { ReactNode } from "react";
import type { MonitorDescriptor } from "./diagnosticApi";
import type {
  FocusPanelSidePreference,
  PreferenceSettingsPatch,
  PreferenceSettingsSnapshot,
} from "./preferencesApi";
import type { PreferencePendingKey } from "./PreferenceSettingsRuntime";
import "./preferenceSettingsSections.css";

type CommonProps = {
  snapshot: PreferenceSettingsSnapshot;
  monitors: MonitorDescriptor[];
  pendingKey: PreferencePendingKey | null;
  onSave: (patch: PreferenceSettingsPatch, key: PreferencePendingKey) => void;
  onRefreshMonitors: () => void;
};

const MINUTE_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60] as const;

function Switch({
  checked,
  disabled = false,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      className="preference-settings__switch motion-interactive"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      data-switch-state={checked ? "on" : "off"}
      onClick={() => onChange(!checked)}
    >
      <span aria-hidden="true" />
    </button>
  );
}

function Row({
  title,
  detail,
  children,
  nested = false,
  unavailable = false,
}: {
  title: string;
  detail: string;
  children: ReactNode;
  nested?: boolean;
  unavailable?: boolean;
}) {
  return (
    <div
      className={`preference-settings__row${nested ? " preference-settings__row--nested" : ""}`}
      data-preference-unavailable={unavailable ? "true" : "false"}
    >
      <div className="preference-settings__copy">
        <strong>{title}</strong>
        <span className="type-metadata">{detail}</span>
      </div>
      <div className="preference-settings__control">{children}</div>
    </div>
  );
}

function DurationSelect({
  valueSeconds,
  disabled,
  label,
  onChange,
}: {
  valueSeconds: number;
  disabled: boolean;
  label: string;
  onChange: (seconds: number) => void;
}) {
  const valueMinutes = Math.max(1, Math.round(valueSeconds / 60));
  const values = MINUTE_OPTIONS.includes(valueMinutes as (typeof MINUTE_OPTIONS)[number])
    ? MINUTE_OPTIONS
    : [...MINUTE_OPTIONS, valueMinutes].sort((a, b) => a - b);
  return (
    <select
      aria-label={label}
      value={valueMinutes}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value) * 60)}
    >
      {values.map((minutes) => <option key={minutes} value={minutes}>{minutes} min{minutes === 1 ? "" : "s"}</option>)}
    </select>
  );
}

function monitorLabel(monitor: MonitorDescriptor): string {
  const name = monitor.name?.trim() || `Display ${monitor.index + 1}`;
  return `${name} · ${monitor.size.width}×${monitor.size.height} · ${Math.round(monitor.scaleFactor * 100)}%`;
}

export function BlitzPanelPreferenceSection({
  snapshot,
  monitors,
  pendingKey,
  onSave,
  onRefreshMonitors,
}: CommonProps) {
  const selected = snapshot.general.selectedMonitorKey ?? "";
  const selectedStillAvailable = !selected || monitors.some((monitor) => monitor.key === selected);
  return (
    <section className="theme-settings__section preference-settings__section" aria-labelledby="preferences-blitz-panel-title">
      <div className="theme-settings__section-heading">
        <div>
          <p className="theme-settings__section-kicker type-metadata">Window placement</p>
          <h2 id="preferences-blitz-panel-title" className="type-section-title">Blitz Panel</h2>
        </div>
        <button type="button" className="preference-settings__refresh motion-interactive" onClick={onRefreshMonitors}>
          Refresh displays
        </button>
      </div>
      <Row
        title="Monitor"
        detail={selectedStillAvailable
          ? "Choose which Windows work area owns the Focus Panel."
          : "The saved display is unavailable. Choose a current display or use the primary display automatically."}
      >
        <select
          aria-label="Focus Panel monitor"
          value={selectedStillAvailable ? selected : ""}
          disabled={pendingKey !== null}
          onChange={(event) => onSave({ selectedMonitorKey: event.target.value }, "monitor")}
        >
          <option value="">Primary display (automatic)</option>
          {monitors.map((monitor) => (
            <option key={monitor.key} value={monitor.key}>{monitorLabel(monitor)}</option>
          ))}
        </select>
      </Row>
      <Row title="Panel side" detail="Anchor the Focus Panel to the selected monitor's work-area edge.">
        <div className="theme-settings__segments" role="group" aria-label="Blitz Panel Side">
          {(["left", "right"] as FocusPanelSidePreference[]).map((side) => {
            const selectedSide = snapshot.general.focusPanelSide === side;
            return (
              <button
                key={side}
                type="button"
                className={`theme-settings__segment motion-interactive${selectedSide ? " theme-settings__segment--selected" : ""}`}
                aria-pressed={selectedSide}
                disabled={pendingKey !== null}
                data-panel-side={side}
                onClick={() => onSave({ focusPanelSide: side }, "side")}
              >
                {side === "left" ? "Left" : "Right"}
              </button>
            );
          })}
        </div>
      </Row>
    </section>
  );
}

export function GeneralPreferenceRows({
  snapshot,
  pendingKey,
  onSave,
}: Pick<CommonProps, "snapshot" | "pendingKey" | "onSave">) {
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const autostartMatches = snapshot.general.openOnLogin === snapshot.general.autostartEnabled;
  return (
    <>
      <Row
        title="Start with Windows"
        detail={autostartMatches
          ? "Start Narro automatically when Windows starts."
          : "Saved preference and Windows autostart are out of sync; toggling this will reconcile them."}
      >
        <Switch
          checked={snapshot.general.openOnLogin}
          disabled={pendingKey !== null}
          label="Start Narro with Windows"
          onChange={(openOnLogin) => onSave({ openOnLogin }, "openOnLogin")}
        />
      </Row>
      <Row title="Hide EST / Time Taken" detail="Keep task timing quieter until you hover or focus a task.">
        <Switch
          checked={snapshot.general.hideTaskTimes}
          disabled={pendingKey !== null}
          label="Hide task EST and Time Taken"
          onChange={(hideTaskTimes) => onSave({ hideTaskTimes }, "hideTaskTimes")}
        />
      </Row>
      <Row title="Auto-parse EST from title" detail="Recognize a supported estimate suffix when creating a task.">
        <Switch
          checked={snapshot.general.autoParseEstFromTitle}
          disabled={pendingKey !== null}
          label="Auto-parse EST from task title"
          onChange={(autoParseEstFromTitle) => onSave({ autoParseEstFromTitle }, "autoParseEst")}
        />
      </Row>
      <Row title="Timezone" detail={`Blank uses the current Windows/WebView timezone (${localZone}).`}>
        <input
          className="preference-settings__text-input"
          aria-label="Display timezone"
          placeholder={localZone}
          defaultValue={snapshot.general.timezone ?? ""}
          key={snapshot.general.timezone ?? "__system__"}
          disabled={pendingKey !== null}
          onBlur={(event) => {
            const timezone = event.currentTarget.value.trim();
            if (timezone) {
              try {
                new Intl.DateTimeFormat(undefined, { timeZone: timezone }).format();
              } catch {
                event.currentTarget.value = snapshot.general.timezone ?? "";
                return;
              }
            }
            if (timezone !== (snapshot.general.timezone ?? "")) onSave({ timezone }, "timezone");
          }}
        />
      </Row>
    </>
  );
}

export function LowerPreferenceSections({
  snapshot,
  pendingKey,
  onSave,
}: Pick<CommonProps, "snapshot" | "pendingKey" | "onSave">) {
  const busy = pendingKey !== null;
  const soundUnavailable = !snapshot.localSoundCatalogAvailable;
  return (
    <>
      <section className="theme-settings__section preference-settings__section" aria-labelledby="preferences-blitz-mode-title">
        <div className="theme-settings__section-heading">
          <div>
            <p className="theme-settings__section-kicker type-metadata">Focus timing</p>
            <h2 id="preferences-blitz-mode-title" className="type-section-title">Blitz Mode</h2>
          </div>
        </div>
        <Row title="Pomodoros" detail="Use sprint and break durations instead of task EST for new Focus starts.">
          <Switch
            checked={snapshot.focus.pomodoroEnabled}
            disabled={busy}
            label="Enable Pomodoros"
            onChange={(pomodoroEnabled) => onSave({ pomodoroEnabled }, "pomodoro")}
          />
        </Row>
        <Row title="Work sprint" detail="Length of each Pomodoro work interval." nested>
          <DurationSelect
            valueSeconds={snapshot.focus.pomodoroWorkSeconds}
            disabled={busy || !snapshot.focus.pomodoroEnabled}
            label="Pomodoro work sprint"
            onChange={(pomodoroWorkSeconds) => onSave({ pomodoroWorkSeconds }, "pomodoroWork")}
          />
        </Row>
        <Row title="Pomodoro break" detail="Automatic break length after a completed sprint." nested>
          <DurationSelect
            valueSeconds={snapshot.focus.pomodoroBreakSeconds}
            disabled={busy || !snapshot.focus.pomodoroEnabled}
            label="Pomodoro break duration"
            onChange={(pomodoroBreakSeconds) => onSave({ pomodoroBreakSeconds }, "pomodoroBreak")}
          />
        </Row>
        <Row title="Default break length" detail="Used by Start Break in Focus and the in-app shortcut.">
          <DurationSelect
            valueSeconds={snapshot.focus.defaultBreakSeconds}
            disabled={busy}
            label="Default manual break duration"
            onChange={(defaultBreakSeconds) => onSave({ defaultBreakSeconds }, "defaultBreak")}
          />
        </Row>
        <Row title="Scrolling title on live timer" detail="Scroll long live-task titles instead of keeping them truncated.">
          <Switch
            checked={snapshot.focus.scrollingTitle}
            disabled={busy}
            label="Scrolling title on live timer"
            onChange={(scrollingTitle) => onSave({ scrollingTitle }, "scrollingTitle")}
          />
        </Row>
      </section>

      <section className="theme-settings__section preference-settings__section" aria-labelledby="preferences-alerts-title">
        <div className="theme-settings__section-heading">
          <div>
            <p className="theme-settings__section-kicker type-metadata">Attention</p>
            <h2 id="preferences-alerts-title" className="type-section-title">Alerts</h2>
          </div>
        </div>
        <Row title="Timed alerts during a task" detail="Enable periodic local reminders while focused.">
          <Switch
            checked={snapshot.alerts.timedAlertsEnabled}
            disabled={busy}
            label="Timed task alerts"
            onChange={(timedAlertsEnabled) => onSave({ timedAlertsEnabled }, "timedAlerts")}
          />
        </Row>
        <Row title="Task alert interval" detail="How often a timed task alert may occur." nested>
          <DurationSelect
            valueSeconds={snapshot.alerts.taskAlertIntervalSeconds}
            disabled={busy || !snapshot.alerts.timedAlertsEnabled}
            label="Task alert interval"
            onChange={(taskAlertIntervalSeconds) => onSave({ taskAlertIntervalSeconds }, "taskAlertInterval")}
          />
        </Row>
        <Row
          title="Task alert sound"
          detail="No validated Narro-owned local sound catalog is installed yet."
          nested
          unavailable={soundUnavailable}
        >
          <button type="button" disabled className="preference-settings__unavailable">Preview unavailable</button>
        </Row>
        <Row title="Animated flash on timer" detail="Allow the timer surface to use the documented alert flash.">
          <Switch
            checked={snapshot.alerts.animatedTimerFlash}
            disabled={busy}
            label="Animated timer flash"
            onChange={(animatedTimerFlash) => onSave({ animatedTimerFlash }, "timerFlash")}
          />
        </Row>
        <Row title="Notification alerts" detail="Allow local Windows notification alerts for relevant timer events.">
          <Switch
            checked={snapshot.alerts.notificationAlertsEnabled}
            disabled={busy}
            label="Notification alerts"
            onChange={(notificationAlertsEnabled) => onSave({ notificationAlertsEnabled }, "notificationAlerts")}
          />
        </Row>
        <Row
          title="Notification sound"
          detail="No validated Narro-owned local sound catalog is installed yet."
          nested
          unavailable={soundUnavailable}
        >
          <button type="button" disabled className="preference-settings__unavailable">Preview unavailable</button>
        </Row>
        <Row title="Schedule reminders" detail="Enable local reminders for scheduled tasks.">
          <Switch
            checked={snapshot.alerts.scheduleRemindersEnabled}
            disabled={busy}
            label="Schedule reminders"
            onChange={(scheduleRemindersEnabled) => onSave({ scheduleRemindersEnabled }, "scheduleReminders")}
          />
        </Row>
        <Row title="Reminder timing" detail="Lead time before the scheduled task." nested>
          <DurationSelect
            valueSeconds={snapshot.alerts.reminderLeadSeconds}
            disabled={busy || !snapshot.alerts.scheduleRemindersEnabled}
            label="Schedule reminder lead time"
            onChange={(reminderLeadSeconds) => onSave({ reminderLeadSeconds }, "reminderLead")}
          />
        </Row>
      </section>

      <section className="theme-settings__section preference-settings__section" aria-labelledby="preferences-celebration-title">
        <div className="theme-settings__section-heading">
          <div>
            <p className="theme-settings__section-kicker type-metadata">Completion</p>
            <h2 id="preferences-celebration-title" className="type-section-title">Celebration</h2>
          </div>
        </div>
        <Row title="Show success screen" detail="Enable a local completion moment after a successful task transition.">
          <Switch
            checked={snapshot.celebration.showSuccessScreen}
            disabled={busy}
            label="Show success screen"
            onChange={(showSuccessScreen) => onSave({ showSuccessScreen }, "successScreen")}
          />
        </Row>
        <Row title="Fun GIF" detail="Optional nested success-screen decoration; exact source visuals remain a fidelity follow-up." nested>
          <Switch
            checked={snapshot.celebration.funGif}
            disabled={busy || !snapshot.celebration.showSuccessScreen}
            label="Fun GIF on success screen"
            onChange={(funGif) => onSave({ funGif }, "funGif")}
          />
        </Row>
        <Row
          title="Success sound"
          detail="No validated Narro-owned local sound catalog is installed yet."
          nested
          unavailable={soundUnavailable}
        >
          <button type="button" disabled className="preference-settings__unavailable">Preview unavailable</button>
        </Row>
      </section>
    </>
  );
}
