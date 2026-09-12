use crate::domain::ids::{ListId, TaskId};
use crate::domain::lists::ListRecord;
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::lists::{
    active_lists, archive_list, archived_lists, get_list, permanently_delete_list, restore_list,
    ListStoreError,
};
use crate::persistence::task_metadata::{task_time_taken_seconds, TaskMetadataError};
use chrono::{DateTime, Duration, Utc};
use rusqlite::{params, OptionalExtension};
use serde::Serialize;
use std::fmt::{Display, Formatter};
use std::path::{Component, Path, PathBuf};
use tauri::Manager;

const ICON_DIRECTORY: &str = "list-icons";
const DONE_ARCHIVE_DAYS: i64 = 60;

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

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchiveListFilterSummary {
    pub id: String,
    pub title: String,
    pub color: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchivedDoneTaskSummary {
    pub id: String,
    pub list_id: String,
    pub list_title: String,
    pub list_color: Option<String>,
    pub title: String,
    pub completed_at: String,
    pub archived_at: String,
    pub time_taken_seconds: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchiveSnapshot {
    pub lists: Vec<ArchivedListSummary>,
    pub done_tasks: Vec<ArchivedDoneTaskSummary>,
    pub filter_lists: Vec<ArchiveListFilterSummary>,
}

#[derive(Debug)]
pub enum ListSettingsError {
    OpenDatabase(rusqlite::Error),
    ConfigureDatabase(persistence::PersistenceError),
    Store(ListStoreError),
    TaskMetadata(TaskMetadataError),
    Sqlite(rusqlite::Error),
    ExpectedArchived(ListId),
    InvalidStoredTaskId(String),
    InvalidStoredListId(String),
    InvalidStoredCompletedTimestamp(String),
    ArchiveClockOverflow,
    ArchiveCountOverflow,
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
            Self::TaskMetadata(error) => {
                write!(formatter, "archived task metadata read failed: {error}")
            }
            Self::Sqlite(error) => write!(formatter, "archive snapshot persistence failed: {error}"),
            Self::ExpectedArchived(id) => {
                write!(
                    formatter,
                    "archived-list projection contained an active list: {id}"
                )
            }
            Self::InvalidStoredTaskId(id) => {
                write!(formatter, "archive snapshot contains invalid task identity: {id}")
            }
            Self::InvalidStoredListId(id) => {
                write!(formatter, "archive snapshot contains invalid list identity: {id}")
            }
            Self::InvalidStoredCompletedTimestamp(id) => write!(
                formatter,
                "completed task has an invalid RFC 3339 completion timestamp: {id}"
            ),
            Self::ArchiveClockOverflow => {
                formatter.write_str("done-task archive cutoff could not be represented")
            }
            Self::ArchiveCountOverflow => {
                formatter.write_str("done-task archive mutation count exceeded the supported range")
            }
        }
    }
}

impl std::error::Error for ListSettingsError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::OpenDatabase(error) | Self::Sqlite(error) => Some(error),
            Self::ConfigureDatabase(error) => Some(error),
            Self::Store(error) => Some(error),
            Self::TaskMetadata(error) => Some(error),
            _ => None,
        }
    }
}

impl From<ListStoreError> for ListSettingsError {
    fn from(value: ListStoreError) -> Self {
        Self::Store(value)
    }
}

impl From<TaskMetadataError> for ListSettingsError {
    fn from(value: TaskMetadataError) -> Self {
        Self::TaskMetadata(value)
    }
}

impl From<rusqlite::Error> for ListSettingsError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
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

pub fn archive_stale_done_tasks_at(
    connection: &mut rusqlite::Connection,
    now: &DateTime<Utc>,
) -> Result<u64, ListSettingsError> {
    let cutoff = now
        .checked_sub_signed(Duration::days(DONE_ARCHIVE_DAYS))
        .ok_or(ListSettingsError::ArchiveClockOverflow)?;

    let invalid_id: Option<String> = connection
        .query_row(
            "SELECT id
             FROM tasks
             WHERE completed_at IS NOT NULL
               AND julianday(completed_at) IS NULL
             LIMIT 1",
            [],
            |row| row.get(0),
        )
        .optional()?;
    if let Some(id) = invalid_id {
        return Err(ListSettingsError::InvalidStoredCompletedTimestamp(id));
    }

    let now_text = now.to_rfc3339();
    let cutoff_text = cutoff.to_rfc3339();
    let tx = connection.transaction()?;
    let changed = tx.execute(
        "UPDATE tasks
         SET archived_at = ?1, updated_at = ?1
         WHERE completed_at IS NOT NULL
           AND archived_at IS NULL
           AND julianday(completed_at) < julianday(?2)
           AND EXISTS (
               SELECT 1
               FROM lists
               WHERE lists.id = tasks.list_id
                 AND lists.archived_at IS NULL
           )",
        params![now_text, cutoff_text],
    )?;
    tx.commit()?;
    u64::try_from(changed).map_err(|_| ListSettingsError::ArchiveCountOverflow)
}

fn load_archived_done_tasks(
    connection: &rusqlite::Connection,
) -> Result<Vec<ArchivedDoneTaskSummary>, ListSettingsError> {
    let mut statement = connection.prepare(
        "SELECT tasks.id,
                tasks.list_id,
                tasks.title,
                tasks.completed_at,
                tasks.archived_at,
                lists.title,
                lists.color
         FROM tasks
         INNER JOIN lists ON lists.id = tasks.list_id
         WHERE tasks.completed_at IS NOT NULL
           AND tasks.archived_at IS NOT NULL
           AND lists.archived_at IS NULL
         ORDER BY tasks.completed_at DESC, tasks.id",
    )?;
    let rows = statement.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
            row.get::<_, String>(4)?,
            row.get::<_, String>(5)?,
            row.get::<_, Option<String>>(6)?,
        ))
    })?;

    let mut tasks = Vec::new();
    for row in rows {
        let (raw_id, raw_list_id, title, completed_at, archived_at, list_title, list_color) = row?;
        let task_id = TaskId::parse_str(&raw_id)
            .map_err(|_| ListSettingsError::InvalidStoredTaskId(raw_id.clone()))?;
        let list_id = ListId::parse_str(&raw_list_id)
            .map_err(|_| ListSettingsError::InvalidStoredListId(raw_list_id.clone()))?;
        tasks.push(ArchivedDoneTaskSummary {
            id: task_id.to_string(),
            list_id: list_id.to_string(),
            list_title,
            list_color,
            title,
            completed_at,
            archived_at,
            time_taken_seconds: task_time_taken_seconds(connection, task_id)?.to_string(),
        });
    }
    Ok(tasks)
}

fn load_filter_lists(
    connection: &rusqlite::Connection,
) -> Result<Vec<ArchiveListFilterSummary>, ListSettingsError> {
    active_lists(connection)?
        .into_iter()
        .map(|list| {
            Ok(ArchiveListFilterSummary {
                id: list.id.to_string(),
                title: list.title,
                color: list.color,
            })
        })
        .collect()
}

pub fn load_archived(app_dir: &Path) -> Result<Vec<ArchivedListSummary>, ListSettingsError> {
    let connection = open_database(app_dir)?;
    archived_lists(&connection)?
        .into_iter()
        .map(ArchivedListSummary::try_from)
        .collect()
}

pub fn load_archive_snapshot_at(
    app_dir: &Path,
    now: &DateTime<Utc>,
) -> Result<ArchiveSnapshot, ListSettingsError> {
    let mut connection = open_database(app_dir)?;
    archive_stale_done_tasks_at(&mut connection, now)?;
    let lists = archived_lists(&connection)?
        .into_iter()
        .map(ArchivedListSummary::try_from)
        .collect::<Result<Vec<_>, _>>()?;
    Ok(ArchiveSnapshot {
        lists,
        done_tasks: load_archived_done_tasks(&connection)?,
        filter_lists: load_filter_lists(&connection)?,
    })
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
) -> CommandResult<ArchiveSnapshot> {
    let app_dir = app_data_dir(&app_handle)?;
    load_archive_snapshot_at(&app_dir, &Utc::now()).map_err(command_error)
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
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::{active_lists, create_list, get_list};
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{complete_task, create_task, get_task};

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

    fn create_done_task(
        connection: &mut rusqlite::Connection,
        list_id: ListId,
        title: &str,
        completed_at: &str,
    ) -> TaskId {
        let task = create_task(
            connection,
            NewTaskInput {
                list_id,
                title: title.into(),
                manual_lane: PlanningLane::Today,
                est_seconds: Some(900),
            },
            "2026-07-01T00:00:00Z",
        )
        .expect("create task");
        complete_task(connection, task.id, completed_at).expect("complete task");
        task.id
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

        drop(connection);
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

        drop(connection);
        std::fs::remove_dir_all(app_dir).expect("remove app dir");
    }

    #[test]
    fn done_task_sweep_is_strict_at_sixty_days_idempotent_and_excludes_archived_lists() {
        let app_dir = test_app_dir();
        setup(&app_dir);
        let active_list = create_fixture(&app_dir, None);
        let mut connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open database");
        persistence::configure_connection(&connection).expect("configure database");

        let old_task = create_done_task(
            &mut connection,
            active_list.id,
            "Old done task",
            "2026-07-13T23:59:59Z",
        );
        let boundary_task = create_done_task(
            &mut connection,
            active_list.id,
            "Boundary done task",
            "2026-07-14T00:00:00Z",
        );
        let archived_list = create_list(
            &mut connection,
            NewListInput {
                title: "Archived project".into(),
                color: None,
                icon_asset: None,
            },
            "2026-07-01T00:00:00Z",
        )
        .expect("create archived-list fixture");
        let archived_list_task = create_done_task(
            &mut connection,
            archived_list.id,
            "Archived list done task",
            "2026-07-01T00:00:00Z",
        );
        archive_list(
            &mut connection,
            archived_list.id,
            "2026-07-02T00:00:00Z",
        )
        .expect("archive fixture list");

        let now = DateTime::parse_from_rfc3339("2026-09-12T00:00:00Z")
            .expect("parse now")
            .with_timezone(&Utc);
        assert_eq!(
            archive_stale_done_tasks_at(&mut connection, &now).expect("run sweep"),
            1
        );
        assert!(get_task(&connection, old_task)
            .expect("reload old task")
            .archived_at
            .is_some());
        assert!(get_task(&connection, boundary_task)
            .expect("reload boundary task")
            .archived_at
            .is_none());
        assert!(get_task(&connection, archived_list_task)
            .expect("reload archived-list task")
            .archived_at
            .is_none());
        assert_eq!(
            archive_stale_done_tasks_at(&mut connection, &now).expect("repeat sweep"),
            0
        );

        drop(connection);
        std::fs::remove_dir_all(app_dir).expect("remove app dir");
    }

    #[test]
    fn archive_snapshot_preserves_task_identity_completion_and_time_taken() {
        let app_dir = test_app_dir();
        setup(&app_dir);
        let list = create_fixture(&app_dir, None);
        let mut connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("open database");
        persistence::configure_connection(&connection).expect("configure database");
        let task_id = create_done_task(
            &mut connection,
            list.id,
            "Historical task",
            "2026-07-01T00:00:00Z",
        );
        connection
            .execute(
                "UPDATE tasks SET manual_time_adjustment_seconds = 1800 WHERE id = ?1",
                [task_id.to_string()],
            )
            .expect("seed Time Taken");
        drop(connection);

        let now = DateTime::parse_from_rfc3339("2026-09-12T00:00:00Z")
            .expect("parse now")
            .with_timezone(&Utc);
        let snapshot = load_archive_snapshot_at(&app_dir, &now).expect("load archive snapshot");
        assert_eq!(snapshot.done_tasks.len(), 1);
        let archived = &snapshot.done_tasks[0];
        assert_eq!(archived.id, task_id.to_string());
        assert_eq!(archived.list_id, list.id.to_string());
        assert_eq!(archived.completed_at, "2026-07-01T00:00:00Z");
        assert_eq!(archived.time_taken_seconds, "1800");
        assert_eq!(snapshot.filter_lists.len(), 1);
        assert_eq!(snapshot.filter_lists[0].id, list.id.to_string());

        let connection =
            rusqlite::Connection::open(app_dir.join("narro.db")).expect("reopen database");
        persistence::configure_connection(&connection).expect("configure database");
        let persisted = get_task(&connection, task_id).expect("reload archived task");
        assert_eq!(persisted.id, task_id);
        assert_eq!(persisted.completed_at.as_deref(), Some("2026-07-01T00:00:00Z"));
        assert!(persisted.archived_at.is_some());

        drop(connection);
        std::fs::remove_dir_all(app_dir).expect("remove app dir");
    }
}
