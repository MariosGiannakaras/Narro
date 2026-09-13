use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::preferences::get_preferences;
use std::fmt::{Display, Formatter};
use std::path::{Path, PathBuf};
use tauri::Manager;

#[derive(Debug)]
pub enum FocusPreferenceError {
    OpenDatabase(rusqlite::Error),
    ConfigureDatabase(persistence::PersistenceError),
    Preferences(persistence::preferences::PreferenceStoreError),
}

impl Display for FocusPreferenceError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::OpenDatabase(error) => {
                write!(formatter, "failed to open Narro database: {error}")
            }
            Self::ConfigureDatabase(error) => {
                write!(formatter, "failed to configure Narro database: {error}")
            }
            Self::Preferences(error) => {
                write!(formatter, "failed to read Focus preferences: {error}")
            }
        }
    }
}

impl std::error::Error for FocusPreferenceError {}

fn open_database(app_dir: &Path) -> Result<rusqlite::Connection, FocusPreferenceError> {
    let connection = rusqlite::Connection::open(app_dir.join("narro.db"))
        .map_err(FocusPreferenceError::OpenDatabase)?;
    persistence::configure_connection(&connection)
        .map_err(FocusPreferenceError::ConfigureDatabase)?;
    Ok(connection)
}

pub fn load_scrolling_title(app_dir: &Path) -> Result<bool, FocusPreferenceError> {
    let connection = open_database(app_dir)?;
    let preferences = get_preferences(&connection)
        .map_err(FocusPreferenceError::Preferences)?
        .map(|record| record.payload)
        .unwrap_or_default();
    Ok(preferences.focus.scrolling_title)
}

fn app_data_dir(app_handle: &tauri::AppHandle) -> CommandResult<PathBuf> {
    app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "FOCUS_PREFERENCE_FAILED",
            format!("failed to resolve Narro app-data directory for Focus preferences: {error}"),
        )
    })
}

#[tauri::command]
pub fn get_focus_scrolling_title_preference(app_handle: tauri::AppHandle) -> CommandResult<bool> {
    let app_dir = app_data_dir(&app_handle)?;
    load_scrolling_title(&app_dir)
        .map_err(|error| CommandError::new("FOCUS_PREFERENCE_FAILED", error.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::persistence::preferences::{initialize_preferences, save_preferences};
    use crate::persistence::run_migrations;

    const T1: &str = "2026-09-14T00:00:00Z";
    const T2: &str = "2026-09-14T00:01:00Z";

    fn test_app_dir() -> PathBuf {
        std::env::temp_dir().join(format!("narro-focus-preferences-{}", uuid::Uuid::new_v4()))
    }

    fn setup(app_dir: &Path) {
        std::fs::create_dir_all(app_dir).expect("create app dir");
        let mut connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open database");
        run_migrations(&mut connection).expect("migrate database");
    }

    #[test]
    fn scrolling_title_reads_default_and_persisted_value_without_mutation() {
        let app_dir = test_app_dir();
        setup(&app_dir);

        assert!(!load_scrolling_title(&app_dir).expect("read default scrolling title"));

        let mut connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open database");
        persistence::configure_connection(&connection).expect("configure database");
        let mut payload = initialize_preferences(&mut connection, T1)
            .expect("initialize preferences")
            .payload;
        payload.focus.scrolling_title = true;
        save_preferences(&mut connection, payload, T2).expect("save scrolling-title preference");
        drop(connection);

        assert!(load_scrolling_title(&app_dir).expect("read saved scrolling title"));
        std::fs::remove_dir_all(app_dir).expect("remove app dir");
    }
}
