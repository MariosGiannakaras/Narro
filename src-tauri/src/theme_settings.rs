use crate::domain::preferences::ThemePreference;
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::preferences::{
    initialize_preferences, save_preferences, PreferenceStoreError,
};
use std::fmt::{Display, Formatter};
use std::path::{Path, PathBuf};
use tauri::{Emitter, Manager};

pub const THEME_PREFERENCE_CHANGED_EVENT: &str = "theme-preference-changed";

#[derive(Debug)]
pub enum ThemeSettingsError {
    OpenDatabase(rusqlite::Error),
    ConfigureDatabase(persistence::PersistenceError),
    Preferences(PreferenceStoreError),
}

impl Display for ThemeSettingsError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::OpenDatabase(error) => write!(formatter, "failed to open Narro database: {error}"),
            Self::ConfigureDatabase(error) => {
                write!(formatter, "failed to configure Narro database: {error}")
            }
            Self::Preferences(error) => write!(formatter, "theme preference failed: {error}"),
        }
    }
}

impl std::error::Error for ThemeSettingsError {}

impl From<PreferenceStoreError> for ThemeSettingsError {
    fn from(value: PreferenceStoreError) -> Self {
        Self::Preferences(value)
    }
}

fn open_database(app_dir: &Path) -> Result<rusqlite::Connection, ThemeSettingsError> {
    let connection = rusqlite::Connection::open(app_dir.join("narro.db"))
        .map_err(ThemeSettingsError::OpenDatabase)?;
    persistence::configure_connection(&connection)
        .map_err(ThemeSettingsError::ConfigureDatabase)?;
    Ok(connection)
}

fn app_data_dir(app_handle: &tauri::AppHandle) -> CommandResult<PathBuf> {
    app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "THEME_PREFERENCE_FAILED",
            format!("failed to resolve Narro app-data directory: {error}"),
        )
    })
}

fn command_error(error: ThemeSettingsError) -> CommandError {
    CommandError::new("THEME_PREFERENCE_FAILED", error.to_string())
}

fn parse_theme(theme: &str) -> CommandResult<ThemePreference> {
    match theme {
        "system" => Ok(ThemePreference::System),
        "dark" => Ok(ThemePreference::Dark),
        "light" => Ok(ThemePreference::Light),
        _ => Err(CommandError::invalid_argument(
            "theme",
            "must be system, dark, or light",
        )),
    }
}

pub fn load(app_dir: &Path, now: &str) -> Result<ThemePreference, ThemeSettingsError> {
    let mut connection = open_database(app_dir)?;
    let preferences = initialize_preferences(&mut connection, now)?;
    Ok(preferences.payload.general.theme)
}

pub fn save(
    app_dir: &Path,
    theme: ThemePreference,
    now: &str,
) -> Result<ThemePreference, ThemeSettingsError> {
    let mut connection = open_database(app_dir)?;
    let mut preferences = initialize_preferences(&mut connection, now)?.payload;
    preferences.general.theme = theme;
    let saved = save_preferences(&mut connection, preferences, now)?;
    Ok(saved.payload.general.theme)
}

#[tauri::command]
pub fn get_theme_preference(app_handle: tauri::AppHandle) -> CommandResult<ThemePreference> {
    let app_dir = app_data_dir(&app_handle)?;
    let now = chrono::Utc::now().to_rfc3339();
    load(&app_dir, &now).map_err(command_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn set_theme_preference(
    app_handle: tauri::AppHandle,
    theme: String,
) -> CommandResult<ThemePreference> {
    let theme = parse_theme(&theme)?;
    let app_dir = app_data_dir(&app_handle)?;
    let now = chrono::Utc::now().to_rfc3339();
    let committed = save(&app_dir, theme, &now).map_err(command_error)?;

    if let Err(error) = app_handle.emit(THEME_PREFERENCE_CHANGED_EVENT, committed) {
        eprintln!(
            "Warning: theme preference committed, but cross-window broadcast failed: {error}"
        );
    }

    Ok(committed)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::persistence::preferences::{get_preferences, save_preferences};
    use crate::persistence::run_migrations;

    const T1: &str = "2026-09-12T18:00:00Z";
    const T2: &str = "2026-09-12T18:01:00Z";

    fn test_app_dir() -> PathBuf {
        std::env::temp_dir().join(format!("narro-theme-settings-{}", uuid::Uuid::new_v4()))
    }

    fn setup(app_dir: &Path) {
        std::fs::create_dir_all(app_dir).expect("create app dir");
        let mut connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open database");
        run_migrations(&mut connection).expect("migrate database");
    }

    #[test]
    fn load_initializes_system_default_once() {
        let app_dir = test_app_dir();
        setup(&app_dir);

        assert_eq!(load(&app_dir, T1).expect("load default theme"), ThemePreference::System);
        assert_eq!(load(&app_dir, T2).expect("load existing theme"), ThemePreference::System);

        let connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open database");
        persistence::configure_connection(&connection).expect("configure database");
        let count: i64 = connection
            .query_row("SELECT COUNT(*) FROM preferences", [], |row| row.get(0))
            .expect("count preferences");
        assert_eq!(count, 1);
        drop(connection);
        std::fs::remove_dir_all(app_dir).expect("remove app dir");
    }

    #[test]
    fn save_changes_only_theme_and_preserves_other_preferences() {
        let app_dir = test_app_dir();
        setup(&app_dir);
        let mut connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open database");
        persistence::configure_connection(&connection).expect("configure database");
        let mut payload = initialize_preferences(&mut connection, T1)
            .expect("initialize preferences")
            .payload;
        payload.general.open_on_login = true;
        payload.general.timezone = Some("Europe/Athens".into());
        payload.focus.pomodoro_enabled = true;
        let expected_non_theme = payload.clone();
        save_preferences(&mut connection, payload, T1).expect("seed preferences");
        drop(connection);

        assert_eq!(save(&app_dir, ThemePreference::Dark, T2).expect("save dark"), ThemePreference::Dark);

        let connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open database");
        persistence::configure_connection(&connection).expect("configure database");
        let saved = get_preferences(&connection)
            .expect("read preferences")
            .expect("preferences row");
        assert_eq!(saved.payload.general.theme, ThemePreference::Dark);
        assert_eq!(saved.payload.general.open_on_login, expected_non_theme.general.open_on_login);
        assert_eq!(saved.payload.general.timezone, expected_non_theme.general.timezone);
        assert_eq!(saved.payload.focus, expected_non_theme.focus);
        assert_eq!(saved.payload.alerts, expected_non_theme.alerts);
        assert_eq!(saved.payload.celebration, expected_non_theme.celebration);
        drop(connection);
        std::fs::remove_dir_all(app_dir).expect("remove app dir");
    }

    #[test]
    fn repeated_save_is_idempotent_and_invalid_tokens_are_rejected() {
        let app_dir = test_app_dir();
        setup(&app_dir);
        assert_eq!(save(&app_dir, ThemePreference::Light, T1).expect("save light"), ThemePreference::Light);
        assert_eq!(save(&app_dir, ThemePreference::Light, T2).expect("save light again"), ThemePreference::Light);
        assert!(parse_theme("sepia").is_err());
        std::fs::remove_dir_all(app_dir).expect("remove app dir");
    }
}
