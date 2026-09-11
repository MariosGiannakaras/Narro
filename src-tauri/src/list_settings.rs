use crate::domain::ids::ListId;
use crate::domain::lists::ListRecord;
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::lists::{
    archive_list, archived_lists, get_list, permanently_delete_list, restore_list, ListStoreError,
};
use serde::Serialize;
use std::fmt::{Display, Formatter};
use std::path::{Component, Path, PathBuf};
use tauri::Manager;

const ICON_DIRECTORY: &str = "list-icons";

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchivedListSummary {
    pub id: String,
    pub title: String,
    pub color: Option<String>,
    pub archived_at: String,
}

impl TryFrom<ListRecord> for ArchivedListSummary {
    type Error = ListSettingsError;

    fn try_from(value: ListRecord) -> Result<Self, Self::Error> {
        let archived_at = value
            .archived_at
            .ok_or(ListSettingsError::ExpectedArchived(value.id))?;
        Ok(Self {
            id: value.id.to_string(),
            title: value.title,
            color: value.color,
            archived_at,
        })
    }
}

#[derive(Debug)]
pub enum ListSettingsError {
    OpenDatabase(rusqlite::Error),
    ConfigureDatabase(persistence::PersistenceError),
    Store(ListStoreError),
    ExpectedArchived(ListId),
}

impl Display for ListSettingsError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::OpenDatabase(error) => {
                write!(formatter, "failed to open Narro database: {error}")
            }
            Self::ConfigureDatabase(error) => {
                write!(formatter, "failed to configure Narro database: {error}")
            }
            Self::Store(error) => write!(formatter, "list settings mutation failed: {error}"),
            Self::ExpectedArchived(id) => {
                write!(
                    formatter,
                    "archived-list projection contained an active list: {id}"
                )
            }
        }
    }
}

impl std::error::Error for ListSettingsError {}

impl From<ListStoreError> for ListSettingsError {
    fn from(value: ListStoreError) -> Self {
        Self::Store(value)
    }
}

fn open_database(app_dir: &Path) -> Result<rusqlite::Connection, ListSettingsError> {
    let connection = rusqlite::Connection::open(app_dir.join("narro.db"))
        .map_err(ListSettingsError::OpenDatabase)?;
    persistence::configure_connection(&connection).map_err(ListSettingsError::ConfigureDatabase)?;
    Ok(connection)
}

fn resolve_owned_icon(app_dir: &Path, relative: &str) -> Option<PathBuf> {
    let path = Path::new(relative);
    let mut components = path.components();
    match (components.next(), components.next(), components.next()) {
        (Some(Component::Normal(directory)), Some(Component::Normal(filename)), None)
            if directory == ICON_DIRECTORY && !filename.is_empty() =>
        {
            Some(app_dir.join(ICON_DIRECTORY).join(filename))
        }
        _ => None,
    }
}

fn cleanup_owned_icon_after_commit(app_dir: &Path, relative: &str) {
    let Some(path) = resolve_owned_icon(app_dir, relative) else {
        eprintln!("Warning: refusing to remove non-owned list icon path after delete: {relative}");
        return;
    };
    match std::fs::remove_file(path) {
        Ok(()) => {}
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
        Err(error) => {
            eprintln!("Warning: list deletion committed but icon cleanup failed: {error}")
        }
    }
}

fn app_data_dir(app_handle: &tauri::AppHandle) -> CommandResult<PathBuf> {
    app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "LIST_SETTINGS_FAILED",
            format!("failed to resolve Narro app-data directory: {error}"),
        )
    })
}

fn parse_list_id(list_id: &str) -> CommandResult<ListId> {
    ListId::parse_str(list_id)
        .map_err(|_| CommandError::invalid_argument("listId", "must be a valid UUID"))
}

fn command_error(error: ListSettingsError) -> CommandError {
    let code = match &error {
        ListSettingsError::Store(ListStoreError::NotFound(_)) => "LIST_SETTINGS_NOT_FOUND",
        ListSettingsError::Store(ListStoreError::MustArchiveBeforePermanentDelete(_)) => {
            "LIST_SETTINGS_MUST_ARCHIVE"
        }
        _ => "LIST_SETTINGS_FAILED",
    };
    CommandError::new(code, error.to_string())
}

pub fn load_archived(app_dir: &Path) -> Result<Vec<ArchivedListSummary>, ListSettingsError> {
    let connection = open_database(app_dir)?;
    archived_lists(&connection)?
        .into_iter()
        .map(ArchivedListSummary::try_from)
        .collect()
}

pub fn archive(app_dir: &Path, id: ListId, now: &str) -> Result<(), ListSettingsError> {
    let mut connection = open_database(app_dir)?;
    archive_list(&mut connection, id, now)?;
    Ok(())
}

pub fn restore(app_dir: &Path, id: ListId, now: &str) -> Result<(), ListSettingsError> {
    let mut connection = open_database(app_dir)?;
    restore_list(&mut connection, id, now)?;
    Ok(())
}

pub fn permanently_delete(app_dir: &Path, id: ListId) -> Result<(), ListSettingsError> {
    let mut connection = open_database(app_dir)?;
    let existing = get_list(&connection, id)?;
    permanently_delete_list(&mut connection, id)?;

    if let Some(relative) = existing.icon_asset.as_deref() {
        cleanup_owned_icon_after_commit(app_dir, relative);
    }
    Ok(())
}

#[tauri::command]
pub fn get_archived_lists_for_settings(
    app_handle: tauri::AppHandle,
) -> CommandResult<Vec<ArchivedListSummary>> {
    let app_dir = app_data_dir(&app_handle)?;
    load_archived(&app_dir).map_err(command_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn archive_list_from_settings(
    app_handle: tauri::AppHandle,
    list_id: String,
) -> CommandResult<()> {
    let id = parse_list_id(&list_id)?;
    let app_dir = app_data_dir(&app_handle)?;
    let now = chrono::Utc::now().to_rfc3339();
    archive(&app_dir, id, &now).map_err(command_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn restore_list_from_settings(
    app_handle: tauri::AppHandle,
    list_id: String,
) -> CommandResult<()> {
    let id = parse_list_id(&list_id)?;
    let app_dir = app_data_dir(&app_handle)?;
    let now = chrono::Utc::now().to_rfc3339();
    restore(&app_dir, id, &now).map_err(command_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn permanently_delete_list_from_settings(
    app_handle: tauri::AppHandle,
    list_id: String,
) -> CommandResult<()> {
    let id = parse_list_id(&list_id)?;
    let app_dir = app_data_dir(&app_handle)?;
    permanently_delete(&app_dir, id).map_err(command_error)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::persistence::lists::{active_lists, create_list, get_list};
    use crate::persistence::run_migrations;

    const T1: &str = "2026-09-12T00:00:00Z";
    const T2: &str = "2026-09-12T00:01:00Z";

    fn test_app_dir() -> PathBuf {
        std::env::temp_dir().join(format!("narro-list-settings-{}", uuid::Uuid::new_v4()))
    }

    fn setup(app_dir: &Path) {
        std::fs::create_dir_all(app_dir).expect("create app dir");
        let mut connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open database");
        run_migrations(&mut connection).expect("migrate database");
    }

    fn create_fixture(app_dir: &Path, icon_asset: Option<String>) -> ListRecord {
        let mut connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open database");
        persistence::configure_connection(&connection).expect("configure database");
        create_list(
            &mut connection,
            NewListInput {
                title: "Work".into(),
                color: Some("#48d6c5".into()),
                icon_asset,
            },
            T1,
        )
        .expect("create list")
    }

    #[test]
    fn archive_and_restore_use_existing_persistence_boundary_and_preserve_identity() {
        let app_dir = test_app_dir();
        setup(&app_dir);
        let created = create_fixture(&app_dir, None);

        archive(&app_dir, created.id, T2).expect("archive list");
        let archived = load_archived(&app_dir).expect("load archived lists");
        assert_eq!(archived.len(), 1);
        assert_eq!(archived[0].id, created.id.to_string());

        restore(&app_dir, created.id, "2026-09-12T00:02:00Z").expect("restore list");
        let connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open database");
        persistence::configure_connection(&connection).expect("configure database");
        let restored = get_list(&connection, created.id).expect("restored list");
        assert_eq!(restored.id, created.id);
        assert!(restored.archived_at.is_none());
        assert_eq!(active_lists(&connection).expect("active lists").len(), 1);

        std::fs::remove_dir_all(app_dir).expect("remove app dir");
    }

    #[test]
    fn permanent_delete_requires_archive_and_cleans_owned_icon_after_commit() {
        let app_dir = test_app_dir();
        setup(&app_dir);
        let icon_dir = app_dir.join(ICON_DIRECTORY);
        std::fs::create_dir_all(&icon_dir).expect("create icon directory");
        let icon_relative = "list-icons/work.png";
        let icon_path = app_dir.join(icon_relative);
        std::fs::write(&icon_path, b"icon").expect("write icon");
        let created = create_fixture(&app_dir, Some(icon_relative.into()));

        let active_error = permanently_delete(&app_dir, created.id)
            .expect_err("active list permanent delete must fail");
        assert!(matches!(
            active_error,
            ListSettingsError::Store(ListStoreError::MustArchiveBeforePermanentDelete(id)) if id == created.id
        ));
        assert!(icon_path.exists(), "failed delete must keep owned icon");

        archive(&app_dir, created.id, T2).expect("archive list");
        permanently_delete(&app_dir, created.id).expect("delete archived list");
        assert!(
            !icon_path.exists(),
            "committed permanent delete must clean owned icon"
        );

        let connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open database");
        persistence::configure_connection(&connection).expect("configure database");
        assert!(matches!(
            get_list(&connection, created.id),
            Err(ListStoreError::NotFound(id)) if id == created.id
        ));

        std::fs::remove_dir_all(app_dir).expect("remove app dir");
    }
}
