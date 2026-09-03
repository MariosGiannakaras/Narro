use serde::{Deserialize, Serialize};

pub const PREFERENCES_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ThemePreference {
    System,
    Dark,
    Light,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FocusPanelSide {
    Left,
    Right,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct GeneralPreferences {
    pub selected_monitor_key: Option<String>,
    pub focus_panel_side: FocusPanelSide,
    pub open_on_login: bool,
    pub hide_task_times: bool,
    pub auto_parse_est_from_title: bool,
    pub theme: ThemePreference,
    pub timezone: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FocusPreferences {
    pub pomodoro_enabled: bool,
    pub pomodoro_work_seconds: u32,
    pub pomodoro_break_seconds: u32,
    pub default_break_seconds: u32,
    pub scrolling_title: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AlertPreferences {
    pub timed_alerts_enabled: bool,
    pub task_alert_interval_seconds: u32,
    pub task_alert_sound: Option<String>,
    pub animated_timer_flash: bool,
    pub notification_alerts_enabled: bool,
    pub notification_sound: Option<String>,
    pub schedule_reminders_enabled: bool,
    pub reminder_lead_seconds: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CelebrationPreferences {
    pub show_success_screen: bool,
    pub fun_gif: bool,
    pub success_sound: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PreferencesPayload {
    pub general: GeneralPreferences,
    pub focus: FocusPreferences,
    pub alerts: AlertPreferences,
    pub celebration: CelebrationPreferences,
}

impl Default for PreferencesPayload {
    fn default() -> Self {
        Self {
            general: GeneralPreferences {
                selected_monitor_key: None,
                focus_panel_side: FocusPanelSide::Right,
                open_on_login: false,
                hide_task_times: false,
                auto_parse_est_from_title: false,
                theme: ThemePreference::System,
                timezone: None,
            },
            focus: FocusPreferences {
                pomodoro_enabled: false,
                pomodoro_work_seconds: 25 * 60,
                pomodoro_break_seconds: 5 * 60,
                default_break_seconds: 10 * 60,
                scrolling_title: false,
            },
            alerts: AlertPreferences {
                timed_alerts_enabled: false,
                task_alert_interval_seconds: 10 * 60,
                task_alert_sound: None,
                animated_timer_flash: false,
                notification_alerts_enabled: false,
                notification_sound: None,
                schedule_reminders_enabled: false,
                reminder_lead_seconds: 10 * 60,
            },
            celebration: CelebrationPreferences {
                show_success_screen: false,
                fun_gif: false,
                success_sound: None,
            },
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PreferencesRecord {
    pub schema_version: u32,
    pub payload: PreferencesPayload,
    pub updated_at: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn defaults_are_local_safe_and_match_confirmed_base_settings() {
        let defaults = PreferencesPayload::default();
        assert_eq!(defaults.general.theme, ThemePreference::System);
        assert_eq!(defaults.general.focus_panel_side, FocusPanelSide::Right);
        assert!(defaults.general.selected_monitor_key.is_none());
        assert!(!defaults.general.open_on_login);
        assert!(!defaults.focus.pomodoro_enabled);
        assert_eq!(defaults.focus.default_break_seconds, 600);
        assert!(!defaults.alerts.schedule_reminders_enabled);
        assert!(!defaults.celebration.show_success_screen);
    }

    #[test]
    fn preference_enum_tokens_are_stable() {
        assert_eq!(
            serde_json::to_string(&ThemePreference::System).expect("serialize theme"),
            "\"system\""
        );
        assert_eq!(
            serde_json::to_string(&FocusPanelSide::Left).expect("serialize side"),
            "\"left\""
        );
    }

    #[test]
    fn unknown_payload_fields_are_rejected() {
        let mut value = serde_json::to_value(PreferencesPayload::default())
            .expect("serialize default preferences");
        value["general"]["unexpected"] = serde_json::json!(true);
        assert!(serde_json::from_value::<PreferencesPayload>(value).is_err());
    }
}
