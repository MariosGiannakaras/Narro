import type { ReactNode } from "react";
import {
  DEFAULT_NOTIFICATION_SOUND,
  DEFAULT_SUCCESS_SOUND,
  DEFAULT_TASK_ALERT_SOUND,
} from "./localSoundCatalog";
import { SoundPreferenceControl } from "./SoundPreferenceControl";
import { findSelectedMonitor, type MonitorDescriptor } from "./diagnosticApi";
import type {
  FocusPanelSidePreference,
  PreferenceSettingsPatch,
  PreferenceSettingsSnapshot,
} from "./preferencesApi";
import type { PreferencePendingKey } from "./PreferenceSettingsRuntime";
import "./preferenceSettingsSections.css";
import "./successSoundPreference.css";

type CommonProps = {
  snapshot: PreferenceSettingsSnapshot;
  monitors: MonitorDescriptor[];
  pendingKey: PreferencePendingKey | null;
  onSave: (
    patch: PreferenceSettingsPatch,
    key: PreferencePendingKey,
  ) => void | Promise<boolean>;
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
  const resolvedSelectedMonitor = selected ? findSelectedMonitor(selected, monitors) : null;
  const selectedStillAvailable = !selected || resolvedSelectedMonitor !== null;
  const selectValue = !selected
    ? ""
    : resolvedSelectedMonitor?.key ?? "__saved_monitor_unavailable__";
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
          value={selectValue}
          disabled={pendingKey !== null}
          onChange={(event) => onSave({ selectedMonitorKey: event.target.value }, "monitor")}
        >
          <option value="">Primary display (automatic)</option>
          {!selectedStillAvailable && (
            <option value="__saved_monitor_unavailable__" disabled>Saved display unavailable</option>
          )}
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
        {snapshot.focus.pomodoroEnabled ? (
          <>
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
                  </>
        ) : null}
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
        {snapshot.alerts.timedAlertsEnabled ? (
          <>
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
          detail={soundUnavailable
            ? "The local Narro sound catalog is unavailable."
            : "Choose a bundled local Narro sound. Starting another preview stops the current one."}
          nested
          unavailable={soundUnavailable}
        >
          {soundUnavailable ? (
            <button type="button" disabled className="preference-settings__unavailable">Preview unavailable</button>
          ) : (
            <SoundPreferenceControl
              selectedSound={snapshot.alerts.taskAlertSound}
              defaultSound={DEFAULT_TASK_ALERT_SOUND}
              volumePercent={snapshot.alerts.taskAlertVolumePercent}
              disabled={busy || !snapshot.alerts.timedAlertsEnabled}
              soundLabel="Task alert sound"
              volumeLabel="Task alert volume"
              onSoundChange={(taskAlertSound) => onSave({ taskAlertSound }, "taskAlertSound")}
              onVolumeCommit={(taskAlertVolumePercent) => onSave(
                { taskAlertVolumePercent },
                "taskAlertVolume",
              )}
            />
          )}
        </Row>
        <Row title="Animated flash on timer" detail="Allow the timer surface to use the documented alert flash.">
          <Switch
            checked={snapshot.alerts.animatedTimerFlash}
            disabled={busy}
            label="Animated timer flash"
            onChange={(animatedTimerFlash) => onSave({ animatedTimerFlash }, "timerFlash")}
          />
        </Row>
                  </>
        ) : null}
        <Row title="Notification alerts" detail="Allow local Windows notification alerts for relevant timer events.">
          <Switch
            checked={snapshot.alerts.notificationAlertsEnabled}
            disabled={busy}
            label="Notification alerts"
            onChange={(notificationAlertsEnabled) => onSave({ notificationAlertsEnabled }, "notificationAlerts")}
          />
        </Row>
        {snapshot.alerts.notificationAlertsEnabled ? (
          <>
        <Row
          title="Notification sound"
          detail={soundUnavailable
            ? "The local Narro sound catalog is unavailable."
            : "Choose the bundled local sound used by notification-alert preferences."}
          nested
          unavailable={soundUnavailable}
        >
          {soundUnavailable ? (
            <button type="button" disabled className="preference-settings__unavailable">Preview unavailable</button>
          ) : (
            <SoundPreferenceControl
              selectedSound={snapshot.alerts.notificationSound}
              defaultSound={DEFAULT_NOTIFICATION_SOUND}
              volumePercent={snapshot.alerts.notificationVolumePercent}
              disabled={busy || !snapshot.alerts.notificationAlertsEnabled}
              soundLabel="Notification sound"
              volumeLabel="Notification sound volume"
              onSoundChange={(notificationSound) => onSave(
                { notificationSound },
                "notificationSound",
              )}
              onVolumeCommit={(notificationVolumePercent) => onSave(
                { notificationVolumePercent },
                "notificationVolume",
              )}
            />
          )}
        </Row>
                  </>
        ) : null}
        <Row title="Schedule reminders" detail="Enable local reminders for scheduled tasks.">
          <Switch
            checked={snapshot.alerts.scheduleRemindersEnabled}
            disabled={busy}
            label="Schedule reminders"
            onChange={(scheduleRemindersEnabled) => onSave({ scheduleRemindersEnabled }, "scheduleReminders")}
          />
        </Row>
        {snapshot.alerts.scheduleRemindersEnabled ? (
          <>
        <Row title="Reminder timing" detail="Lead time before the scheduled task." nested>
          <DurationSelect
            valueSeconds={snapshot.alerts.reminderLeadSeconds}
            disabled={busy || !snapshot.alerts.scheduleRemindersEnabled}
            label="Schedule reminder lead time"
            onChange={(reminderLeadSeconds) => onSave({ reminderLeadSeconds }, "reminderLead")}
          />
        </Row>
                </>
        ) : null}
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
        {snapshot.celebration.showSuccessScreen ? (
          <>
        <Row title="Fun GIF" detail="Optional nested success-screen decoration; exact source visuals remain a fidelity follow-up." nested>
          <Switch
            checked={snapshot.celebration.funGif}
            disabled={busy || !snapshot.celebration.showSuccessScreen}
            label="Fun GIF on success screen"
            onChange={(funGif) => onSave({ funGif }, "funGif")}
          />
        </Row>
                  </>
        ) : null}
        <Row
          title="Success sound effect"
          detail={soundUnavailable
            ? "The local Narro sound catalog is unavailable."
            : "Control the bundled completion sound independently of the success screen."}
          nested
          unavailable={soundUnavailable}
        >
          <div className="preference-settings__success-sound-actions">
            {soundUnavailable ? (
              <button type="button" disabled className="preference-settings__unavailable">Preview unavailable</button>
            ) : (
              <SoundPreferenceControl
                selectedSound={snapshot.celebration.successSound}
                defaultSound={DEFAULT_SUCCESS_SOUND}
                volumePercent={snapshot.celebration.successSoundVolumePercent}
                disabled={busy || !snapshot.celebration.successSoundEnabled}
                soundLabel="Success sound"
                volumeLabel="Success sound volume"
                onSoundChange={(successSound) => onSave({ successSound }, "successSound")}
                onVolumeCommit={(successSoundVolumePercent) => onSave(
                  { successSoundVolumePercent },
                  "successSoundVolume",
                )}
              />
            )}
            <Switch
              checked={snapshot.celebration.successSoundEnabled}
              disabled={busy}
              label="Success sound effect"
              onChange={(successSoundEnabled) => onSave(
                { successSoundEnabled },
                "successSoundEnabled",
              )}
            />
          </div>
        </Row>
      </section>
    </>
  );
}
