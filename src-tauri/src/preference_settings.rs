use crate::autostart;
use crate::domain::preferences::{is_local_sound_id, FocusPanelSide, PreferencesPayload};
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::preferences::{initialize_preferences, mutate_preferences};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::{Emitter, Manager};

pub const PREFERENCES_CHANGED_EVENT: &str = "preferences-changed";
static PREFERENCES_GATE: Mutex<()> = Mutex::new(());

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct GeneralSettingsSnapshot {
    pub selected_monitor_key: Option<String>,
    pub focus_panel_side: String,
    pub open_on_login: bool,
    pub autostart_enabled: bool,
    pub hide_task_times: bool,
    pub auto_parse_est_from_title: bool,
    pub timezone: Option<String>,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct FocusSettingsSnapshot {
    pub pomodoro_enabled: bool,
    pub pomodoro_work_seconds: u32,
    pub pomodoro_break_seconds: u32,
    pub default_break_seconds: u32,
    pub scrolling_title: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct AlertSettingsSnapshot {
    pub timed_alerts_enabled: bool,
    pub task_alert_interval_seconds: u32,
    pub task_alert_sound: Option<String>,
    pub task_alert_volume_percent: u8,
    pub animated_timer_flash: bool,
    pub notification_alerts_enabled: bool,
    pub notification_sound: Option<String>,
    pub notification_volume_percent: u8,
    pub schedule_reminders_enabled: bool,
    pub reminder_lead_seconds: u32,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct CelebrationSettingsSnapshot {
    pub show_success_screen: bool,
    pub fun_gif: bool,
    pub success_sound: Option<String>,
    pub success_sound_volume_percent: u8,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct PreferenceSettingsSnapshot {
    pub schema_version: u32,
    pub general: GeneralSettingsSnapshot,
    pub focus: FocusSettingsSnapshot,
    pub alerts: AlertSettingsSnapshot,
    pub celebration: CelebrationSettingsSnapshot,
    pub local_sound_catalog_available: bool,
}

#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct PreferenceSettingsPatch {
    pub selected_monitor_key: Option<String>,
    pub focus_panel_side: Option<String>,
    pub open_on_login: Option<bool>,
    pub hide_task_times: Option<bool>,
    pub auto_parse_est_from_title: Option<bool>,
    pub timezone: Option<String>,
    pub pomodoro_enabled: Option<bool>,
    pub pomodoro_work_seconds: Option<u32>,
    pub pomodoro_break_seconds: Option<u32>,
    pub default_break_seconds: Option<u32>,
    pub scrolling_title: Option<bool>,
    pub timed_alerts_enabled: Option<bool>,
    pub task_alert_interval_seconds: Option<u32>,
    pub task_alert_sound: Option<String>,
    pub task_alert_volume_percent: Option<u8>,
    pub animated_timer_flash: Option<bool>,
    pub notification_alerts_enabled: Option<bool>,
    pub notification_sound: Option<String>,
    pub notification_volume_percent: Option<u8>,
    pub schedule_reminders_enabled: Option<bool>,
    pub reminder_lead_seconds: Option<u32>,
    pub show_success_screen: Option<bool>,
    pub fun_gif: Option<bool>,
    pub success_sound: Option<String>,
    pub success_sound_volume_percent: Option<u8>,
}

#[derive(Debug, Clone)]
struct PreparedPatch {
    patch: PreferenceSettingsPatch,
    side: Option<FocusPanelSide>,
}

fn preference_error(message: impl Into<String>) -> CommandError {
    CommandError::new("PREFERENCE_SETTINGS_FAILED", message)
}

fn app_data_dir(app_handle: &tauri::AppHandle) -> CommandResult<PathBuf> {
    app_handle.path().app_data_dir().map_err(|error| {
        preference_error(format!(
            "failed to resolve Narro app-data directory for Preferences: {error}"
        ))
    })
}

fn open_database(app_dir: &Path) -> CommandResult<rusqlite::Connection> {
    let connection = rusqlite::Connection::open(app_dir.join("narro.db"))
        .map_err(|error| preference_error(format!("failed to open Narro database: {error}")))?;
    persistence::configure_connection(&connection).map_err(|error| {
        preference_error(format!("failed to configure Narro database: {error}"))
    })?;
    Ok(connection)
}

fn parse_side(value: Option<&str>) -> CommandResult<Option<FocusPanelSide>> {
    value
        .map(|value| match value {
            "left" => Ok(FocusPanelSide::Left),
            "right" => Ok(FocusPanelSide::Right),
            _ => Err(CommandError::invalid_argument(
                "patch.focusPanelSide",
                "must be left or right",
            )),
        })
        .transpose()
}

fn normalize_optional_token(value: String) -> Option<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_owned())
    }
}

fn validate_sound_patch(field: &'static str, value: Option<&str>) -> CommandResult<()> {
    if let Some(value) = value {
        if !is_local_sound_id(value) {
            return Err(CommandError::invalid_argument(
                field,
                "must reference a bundled local Narro sound",
            ));
        }
    }
    Ok(())
}

fn validate_volume_patch(field: &'static str, value: Option<u8>) -> CommandResult<()> {
    if value.is_some_and(|percent| percent > 100) {
        return Err(CommandError::invalid_argument(
            field,
            "must be between 0 and 100",
        ));
    }
    Ok(())
}

fn prepare_patch(patch: PreferenceSettingsPatch) -> CommandResult<PreparedPatch> {
    let side = parse_side(patch.focus_panel_side.as_deref())?;
    validate_sound_patch("patch.taskAlertSound", patch.task_alert_sound.as_deref())?;
    validate_volume_patch(
        "patch.taskAlertVolumePercent",
        patch.task_alert_volume_percent,
    )?;
    validate_sound_patch(
        "patch.notificationSound",
        patch.notification_sound.as_deref(),
    )?;
    validate_volume_patch(
        "patch.notificationVolumePercent",
        patch.notification_volume_percent,
    )?;
    validate_sound_patch("patch.successSound", patch.success_sound.as_deref())?;
    validate_volume_patch(
        "patch.successSoundVolumePercent",
        patch.success_sound_volume_percent,
    )?;
    Ok(PreparedPatch { patch, side })
}

fn apply_patch(payload: &mut PreferencesPayload, prepared: &PreparedPatch) {
    let patch = &prepared.patch;
    if let Some(value) = &patch.selected_monitor_key {
        payload.general.selected_monitor_key = normalize_optional_token(value.clone());
    }
    if let Some(value) = prepared.side {
        payload.general.focus_panel_side = value;
    }
    if let Some(value) = patch.open_on_login {
        payload.general.open_on_login = value;
    }
    if let Some(value) = patch.hide_task_times {
        payload.general.hide_task_times = value;
    }
    if let Some(value) = patch.auto_parse_est_from_title {
        payload.general.auto_parse_est_from_title = value;
    }
    if let Some(value) = &patch.timezone {
        payload.general.timezone = normalize_optional_token(value.clone());
    }
    if let Some(value) = patch.pomodoro_enabled {
        payload.focus.pomodoro_enabled = value;
    }
    if let Some(value) = patch.pomodoro_work_seconds {
        payload.focus.pomodoro_work_seconds = value;
    }
    if let Some(value) = patch.pomodoro_break_seconds {
        payload.focus.pomodoro_break_seconds = value;
    }
    if let Some(value) = patch.default_break_seconds {
        payload.focus.default_break_seconds = value;
    }
    if let Some(value) = patch.scrolling_title {
        payload.focus.scrolling_title = value;
    }
    if let Some(value) = patch.timed_alerts_enabled {
        payload.alerts.timed_alerts_enabled = value;
    }
    if let Some(value) = patch.task_alert_interval_seconds {
        payload.alerts.task_alert_interval_seconds = value;
    }
    if let Some(value) = &patch.task_alert_sound {
        payload.alerts.task_alert_sound = Some(value.clone());
    }
    if let Some(value) = patch.task_alert_volume_percent {
        payload.alerts.task_alert_volume_percent = value;
    }
    if let Some(value) = patch.animated_timer_flash {
        payload.alerts.animated_timer_flash = value;
    }
    if let Some(value) = patch.notification_alerts_enabled {
        payload.alerts.notification_alerts_enabled = value;
    }
    if let Some(value) = &patch.notification_sound {
        payload.alerts.notification_sound = Some(value.clone());
    }
    if let Some(value) = patch.notification_volume_percent {
        payload.alerts.notification_volume_percent = value;
    }
    if let Some(value) = patch.schedule_reminders_enabled {
        payload.alerts.schedule_reminders_enabled = value;
    }
    if let Some(value) = patch.reminder_lead_seconds {
        payload.alerts.reminder_lead_seconds = value;
    }
    if let Some(value) = patch.show_success_screen {
        payload.celebration.show_success_screen = value;
        if !value {
            payload.celebration.fun_gif = false;
        }
    }
    if let Some(value) = patch.fun_gif {
        payload.celebration.fun_gif = value;
    }
    if let Some(value) = &patch.success_sound {
        payload.celebration.success_sound = Some(value.clone());
    }
    if let Some(value) = patch.success_sound_volume_percent {
        payload.celebration.success_sound_volume_percent = value;
    }
}

fn snapshot(
    schema_version: u32,
    payload: PreferencesPayload,
    autostart_enabled: bool,
) -> PreferenceSettingsSnapshot {
    PreferenceSettingsSnapshot {
        schema_version,
        general: GeneralSettingsSnapshot {
            selected_monitor_key: payload.general.selected_monitor_key,
            focus_panel_side: match payload.general.focus_panel_side {
                FocusPanelSide::Left => "left".to_owned(),
                FocusPanelSide::Right => "right".to_owned(),
            },
            open_on_login: payload.general.open_on_login,
            autostart_enabled,
            hide_task_times: payload.general.hide_task_times,
            auto_parse_est_from_title: payload.general.auto_parse_est_from_title,
            timezone: payload.general.timezone,
        },
        focus: FocusSettingsSnapshot {
            pomodoro_enabled: payload.focus.pomodoro_enabled,
            pomodoro_work_seconds: payload.focus.pomodoro_work_seconds,
            pomodoro_break_seconds: payload.focus.pomodoro_break_seconds,
            default_break_seconds: payload.focus.default_break_seconds,
            scrolling_title: payload.focus.scrolling_title,
        },
        alerts: AlertSettingsSnapshot {
            timed_alerts_enabled: payload.alerts.timed_alerts_enabled,
            task_alert_interval_seconds: payload.alerts.task_alert_interval_seconds,
            task_alert_sound: payload.alerts.task_alert_sound,
            task_alert_volume_percent: payload.alerts.task_alert_volume_percent,
            animated_timer_flash: payload.alerts.animated_timer_flash,
            notification_alerts_enabled: payload.alerts.notification_alerts_enabled,
            notification_sound: payload.alerts.notification_sound,
            notification_volume_percent: payload.alerts.notification_volume_percent,
            schedule_reminders_enabled: payload.alerts.schedule_reminders_enabled,
            reminder_lead_seconds: payload.alerts.reminder_lead_seconds,
        },
        celebration: CelebrationSettingsSnapshot {
            show_success_screen: payload.celebration.show_success_screen,
            fun_gif: payload.celebration.fun_gif,
            success_sound: payload.celebration.success_sound,
            success_sound_volume_percent: payload.celebration.success_sound_volume_percent,
        },
        // The catalog is bundled in the renderer as Narro-owned local synthesis recipes.
        // Backend validation accepts only the matching stable IDs, so no remote media token
        // can enter the persisted Preferences payload.
        local_sound_catalog_available: true,
    }
}

fn load_record(
    app_handle: &tauri::AppHandle,
) -> CommandResult<(crate::domain::preferences::PreferencesRecord, bool)> {
    let app_dir = app_data_dir(app_handle)?;
    let mut connection = open_database(&app_dir)?;
    let now = chrono::Utc::now().to_rfc3339();
    let record = initialize_preferences(&mut connection, &now)
        .map_err(|error| preference_error(format!("failed to read Preferences: {error}")))?;
    let autostart_enabled = autostart::status(app_handle)?.enabled;
    Ok((record, autostart_enabled))
}

#[tauri::command]
pub fn get_preference_settings(
    app_handle: tauri::AppHandle,
) -> CommandResult<PreferenceSettingsSnapshot> {
    let (record, autostart_enabled) = load_record(&app_handle)?;
    Ok(snapshot(
        record.schema_version,
        record.payload,
        autostart_enabled,
    ))
}

fn restore_autostart(app_handle: &tauri::AppHandle, enabled: bool) -> CommandResult<()> {
    if enabled {
        autostart::enable(app_handle)?;
    } else {
        autostart::disable(app_handle)?;
    }
    Ok(())
}

#[tauri::command(rename_all = "camelCase")]
pub fn update_preference_settings(
    app_handle: tauri::AppHandle,
    patch: PreferenceSettingsPatch,
) -> CommandResult<PreferenceSettingsSnapshot> {
    let _gate = PREFERENCES_GATE
        .lock()
        .map_err(|_| preference_error("Preferences mutation lock is poisoned"))?;
    let prepared = prepare_patch(patch)?;
    let app_dir = app_data_dir(&app_handle)?;
    let mut connection = open_database(&app_dir)?;
    let now = chrono::Utc::now().to_rfc3339();

    let previous_autostart = autostart::status(&app_handle)?.enabled;
    let requested_autostart = prepared.patch.open_on_login;
    let native_changed = requested_autostart.is_some_and(|value| value != previous_autostart);

    if let Some(enabled) = requested_autostart {
        if native_changed {
            restore_autostart(&app_handle, enabled)?;
        }
    }

    let saved = mutate_preferences(&mut connection, &now, |payload| {
        apply_patch(payload, &prepared);
    });

    let record = match saved {
        Ok(record) => record,
        Err(error) => {
            if native_changed {
                if let Err(rollback_error) = restore_autostart(&app_handle, previous_autostart) {
                    return Err(preference_error(format!(
                        "failed to save Preferences: {error}; Windows autostart rollback also failed: {rollback_error}"
                    )));
                }
            }
            return Err(preference_error(format!(
                "failed to save Preferences: {error}"
            )));
        }
    };

    let observed_autostart = autostart::status(&app_handle)?.enabled;
    if record.payload.general.open_on_login != observed_autostart {
        return Err(preference_error(
            "saved open-on-login preference does not match Windows autostart state",
        ));
    }

    let committed = snapshot(record.schema_version, record.payload, observed_autostart);
    if let Err(error) = app_handle.emit(PREFERENCES_CHANGED_EVENT, committed.clone()) {
        eprintln!("Warning: Preferences committed, but cross-window broadcast failed: {error}");
    }
    Ok(committed)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn partial_patch_preserves_unrelated_preference_families() {
        let mut payload = PreferencesPayload::default();
        payload.shortcuts.go_to_narro_enabled = false;
        payload.general.timezone = Some("Europe/Athens".into());
        let original_shortcuts = payload.shortcuts.clone();

        let prepared = prepare_patch(PreferenceSettingsPatch {
            scrolling_title: Some(true),
            default_break_seconds: Some(12 * 60),
            ..PreferenceSettingsPatch::default()
        })
        .expect("prepare patch");

        apply_patch(&mut payload, &prepared);
        assert!(payload.focus.scrolling_title);
        assert_eq!(payload.focus.default_break_seconds, 12 * 60);
        assert_eq!(payload.general.timezone.as_deref(), Some("Europe/Athens"));
        assert_eq!(payload.shortcuts, original_shortcuts);
    }

    #[test]
    fn sound_patch_rejects_remote_or_unknown_ids_and_invalid_volume() {
        assert!(prepare_patch(PreferenceSettingsPatch {
            task_alert_sound: Some("https://example.com/sound.wav".into()),
            ..PreferenceSettingsPatch::default()
        })
        .is_err());
        assert!(prepare_patch(PreferenceSettingsPatch {
            notification_sound: Some("unknown-sound".into()),
            ..PreferenceSettingsPatch::default()
        })
        .is_err());
        assert!(prepare_patch(PreferenceSettingsPatch {
            success_sound: Some("victory-bell".into()),
            success_sound_volume_percent: Some(100),
            ..PreferenceSettingsPatch::default()
        })
        .is_ok());
        assert!(prepare_patch(PreferenceSettingsPatch {
            task_alert_volume_percent: Some(101),
            ..PreferenceSettingsPatch::default()
        })
        .is_err());
    }

    #[test]
    fn turning_off_success_screen_clears_nested_fun_gif() {
        let mut payload = PreferencesPayload::default();
        payload.celebration.show_success_screen = true;
        payload.celebration.fun_gif = true;
        let prepared = prepare_patch(PreferenceSettingsPatch {
            show_success_screen: Some(false),
            ..PreferenceSettingsPatch::default()
        })
        .expect("prepare patch");
        apply_patch(&mut payload, &prepared);
        assert!(!payload.celebration.show_success_screen);
        assert!(!payload.celebration.fun_gif);
    }

    #[test]
    fn empty_monitor_and_timezone_tokens_clear_optional_values() {
        let mut payload = PreferencesPayload::default();
        payload.general.selected_monitor_key = Some("monitor-a".into());
        payload.general.timezone = Some("Europe/Athens".into());
        let prepared = prepare_patch(PreferenceSettingsPatch {
            selected_monitor_key: Some("  ".into()),
            timezone: Some("".into()),
            ..PreferenceSettingsPatch::default()
        })
        .expect("prepare patch");
        apply_patch(&mut payload, &prepared);
        assert!(payload.general.selected_monitor_key.is_none());
        assert!(payload.general.timezone.is_none());
    }

    #[test]
    fn panel_side_tokens_are_strict() {
        assert!(prepare_patch(PreferenceSettingsPatch {
            focus_panel_side: Some("left".into()),
            ..PreferenceSettingsPatch::default()
        })
        .is_ok());
        assert!(prepare_patch(PreferenceSettingsPatch {
            focus_panel_side: Some("center".into()),
            ..PreferenceSettingsPatch::default()
        })
        .is_err());
    }
}
