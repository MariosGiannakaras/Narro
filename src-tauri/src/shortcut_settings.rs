use crate::domain::preferences::ShortcutPreferences;
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::preferences::{initialize_preferences, mutate_preferences};
use crate::shortcuts::{
    self, GlobalShortcutKind, ShortcutDiagnostics, ShortcutManager,
};
use serde::Serialize;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::Manager;

static SHORTCUT_SETTINGS_GATE: Mutex<()> = Mutex::new(());

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct GlobalShortcutSettingsSnapshot {
    pub go_to_narro_enabled: bool,
    pub toggle_focus_mode_enabled: bool,
    pub find_focus_timer_enabled: bool,
    pub diagnostics: ShortcutDiagnostics,
}

fn preference_error(message: impl Into<String>) -> CommandError {
    CommandError::new("SHORTCUT_PREFERENCE_FAILED", message)
}

fn open_database(app_dir: &Path) -> CommandResult<rusqlite::Connection> {
    let connection = rusqlite::Connection::open(app_dir.join("narro.db"))
        .map_err(|error| preference_error(format!("failed to open Narro database: {error}")))?;
    persistence::configure_connection(&connection).map_err(|error| {
        preference_error(format!("failed to configure Narro database: {error}"))
    })?;
    Ok(connection)
}

fn app_data_dir(app_handle: &tauri::AppHandle) -> CommandResult<PathBuf> {
    app_handle.path().app_data_dir().map_err(|error| {
        preference_error(format!(
            "failed to resolve Narro app-data directory for shortcut preferences: {error}"
        ))
    })
}

fn preference_enabled(preferences: &ShortcutPreferences, kind: GlobalShortcutKind) -> bool {
    match kind {
        GlobalShortcutKind::GoToNarro => preferences.go_to_narro_enabled,
        GlobalShortcutKind::ToggleFocusMode => preferences.toggle_focus_mode_enabled,
        GlobalShortcutKind::FindFocusTimer => preferences.find_focus_timer_enabled,
    }
}

fn set_enabled(preferences: &mut ShortcutPreferences, kind: GlobalShortcutKind, value: bool) {
    match kind {
        GlobalShortcutKind::GoToNarro => preferences.go_to_narro_enabled = value,
        GlobalShortcutKind::ToggleFocusMode => preferences.toggle_focus_mode_enabled = value,
        GlobalShortcutKind::FindFocusTimer => preferences.find_focus_timer_enabled = value,
    }
}

fn snapshot(
    preferences: ShortcutPreferences,
    diagnostics: ShortcutDiagnostics,
) -> GlobalShortcutSettingsSnapshot {
    GlobalShortcutSettingsSnapshot {
        go_to_narro_enabled: preferences.go_to_narro_enabled,
        toggle_focus_mode_enabled: preferences.toggle_focus_mode_enabled,
        find_focus_timer_enabled: preferences.find_focus_timer_enabled,
        diagnostics,
    }
}

fn load_preferences(app_dir: &Path) -> CommandResult<ShortcutPreferences> {
    let mut connection = open_database(app_dir)?;
    let now = chrono::Utc::now().to_rfc3339();
    initialize_preferences(&mut connection, &now)
        .map(|record| record.payload.shortcuts)
        .map_err(|error| preference_error(format!("failed to read shortcut preferences: {error}")))
}

pub fn load_from_connection(
    connection: &mut rusqlite::Connection,
    now: &str,
) -> CommandResult<ShortcutPreferences> {
    initialize_preferences(connection, now)
        .map(|record| record.payload.shortcuts)
        .map_err(|error| preference_error(format!("failed to initialize shortcut preferences: {error}")))
}

#[tauri::command]
pub fn get_global_shortcut_settings(
    app_handle: tauri::AppHandle,
    shortcut_manager: tauri::State<'_, ShortcutManager>,
) -> CommandResult<GlobalShortcutSettingsSnapshot> {
    let app_dir = app_data_dir(&app_handle)?;
    let preferences = load_preferences(&app_dir)?;
    let diagnostics = shortcut_manager.snapshot()?;
    Ok(snapshot(preferences, diagnostics))
}

#[tauri::command(rename_all = "camelCase")]
pub fn set_global_shortcut_enabled(
    app_handle: tauri::AppHandle,
    shortcut_manager: tauri::State<'_, ShortcutManager>,
    kind: GlobalShortcutKind,
    enabled: bool,
) -> CommandResult<GlobalShortcutSettingsSnapshot> {
    let _gate = SHORTCUT_SETTINGS_GATE
        .lock()
        .map_err(|_| preference_error("shortcut preference mutation lock is poisoned"))?;
    let app_dir = app_data_dir(&app_handle)?;
    let current_preferences = load_preferences(&app_dir)?;
    let current_diagnostics = shortcut_manager.snapshot()?;
    let previous_enabled = preference_enabled(&current_preferences, kind);
    let previous_registered = shortcuts::is_registered(&current_diagnostics, kind);

    if previous_registered != enabled {
        shortcuts::set_native_enabled(&app_handle, shortcut_manager.inner(), kind, enabled)?;
    }

    let persist_result = (|| {
        let mut connection = open_database(&app_dir)?;
        let now = chrono::Utc::now().to_rfc3339();
        mutate_preferences(&mut connection, &now, |payload| {
            set_enabled(&mut payload.shortcuts, kind, enabled);
        })
        .map(|record| record.payload.shortcuts)
        .map_err(|error| preference_error(format!("failed to save shortcut preference: {error}")))
    })();

    let saved_preferences = match persist_result {
        Ok(preferences) => preferences,
        Err(error) => {
            if previous_registered != enabled {
                if let Err(rollback_error) = shortcuts::set_native_enabled(
                    &app_handle,
                    shortcut_manager.inner(),
                    kind,
                    previous_registered,
                ) {
                    return Err(preference_error(format!(
                        "{error}; native shortcut rollback also failed: {rollback_error}"
                    )));
                }
            }
            return Err(error);
        }
    };

    let diagnostics = shortcut_manager.snapshot()?;
    let committed_enabled = preference_enabled(&saved_preferences, kind);
    if committed_enabled != enabled {
        return Err(preference_error(format!(
            "saved shortcut preference does not match requested state (previous enabled: {previous_enabled})"
        )));
    }
    if shortcuts::is_registered(&diagnostics, kind) != enabled {
        return Err(preference_error(
            "native shortcut registration state does not match the committed preference",
        ));
    }

    Ok(snapshot(saved_preferences, diagnostics))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn preference_field_mapping_is_independent() {
        let mut preferences = ShortcutPreferences::default();
        set_enabled(&mut preferences, GlobalShortcutKind::FindFocusTimer, false);
        assert!(preference_enabled(&preferences, GlobalShortcutKind::GoToNarro));
        assert!(preference_enabled(&preferences, GlobalShortcutKind::ToggleFocusMode));
        assert!(!preference_enabled(&preferences, GlobalShortcutKind::FindFocusTimer));

        set_enabled(&mut preferences, GlobalShortcutKind::GoToNarro, false);
        assert!(!preference_enabled(&preferences, GlobalShortcutKind::GoToNarro));
        assert!(preference_enabled(&preferences, GlobalShortcutKind::ToggleFocusMode));
    }

    #[test]
    fn snapshot_keeps_preference_intent_separate_from_native_availability() {
        let preferences = ShortcutPreferences {
            go_to_narro_enabled: true,
            toggle_focus_mode_enabled: false,
            find_focus_timer_enabled: true,
        };
        let manager = ShortcutManager::new();
        let diagnostics = manager.snapshot().expect("shortcut diagnostics");
        let result = snapshot(preferences, diagnostics);
        assert!(result.go_to_narro_enabled);
        assert!(!result.toggle_focus_mode_enabled);
        assert!(result.find_focus_timer_enabled);
        assert!(!result.diagnostics.registered);
    }
}
