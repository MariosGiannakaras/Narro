use crate::domain::ids::{ListId, TaskId};
use crate::domain::model::PlanningLane;
use crate::domain::tasks::{NewTaskInput, TaskRecord};
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::task_title_edit::{update_task_title_if_expected, TaskTitleEditError};
use crate::persistence::tasks::{create_task, TaskStoreError};
use rusqlite::Connection;
use std::path::PathBuf;
use tauri::Manager;

fn app_database(app_handle: &tauri::AppHandle) -> CommandResult<Connection> {
    let app_dir: PathBuf = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "TASK_EDITOR_FAILED",
            format!("failed to resolve Narro app-data directory for task editing: {error}"),
        )
    })?;
    let connection = Connection::open(app_dir.join("narro.db")).map_err(|error| {
        CommandError::new(
            "TASK_EDITOR_FAILED",
            format!("failed to open the Narro database for task editing: {error}"),
        )
    })?;
    persistence::configure_connection(&connection).map_err(|error| {
        CommandError::new(
            "TASK_EDITOR_FAILED",
            format!("failed to configure the Narro database for task editing: {error}"),
        )
    })?;
    Ok(connection)
}

fn parse_list_id(argument: &str, raw: &str) -> CommandResult<ListId> {
    ListId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn parse_task_id(argument: &str, raw: &str) -> CommandResult<TaskId> {
    TaskId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn parse_pending_lane(argument: &str, raw: &str) -> CommandResult<PlanningLane> {
    PlanningLane::try_from(raw).map_err(|_| {
        CommandError::invalid_argument(argument, "must be backlog, this_week, or today")
    })
}

fn create_board_task(
    conn: &mut Connection,
    list_id: ListId,
    lane: PlanningLane,
    title: String,
    now: &str,
) -> Result<TaskRecord, TaskStoreError> {
    create_task(
        conn,
        NewTaskInput {
            list_id,
            title,
            manual_lane: lane,
            est_seconds: None,
        },
        now,
    )
}

fn map_create_error(error: TaskStoreError) -> CommandError {
    match error {
        TaskStoreError::InvalidTitle => CommandError::invalid_argument("title", "must not be empty"),
        TaskStoreError::ListNotFound(_) | TaskStoreError::ListArchived(_) => {
            CommandError::new("TASK_CREATE_STALE", error.to_string())
        }
        _ => CommandError::new("TASK_CREATE_FAILED", error.to_string()),
    }
}

fn map_edit_error(error: TaskTitleEditError) -> CommandError {
    match error {
        TaskTitleEditError::Task(TaskStoreError::InvalidTitle) => {
            CommandError::invalid_argument("title", "must not be empty")
        }
        TaskTitleEditError::ExpectedListMismatch { .. }
        | TaskTitleEditError::ExpectedTitleMismatch(_)
        | TaskTitleEditError::StaleWrite(_)
        | TaskTitleEditError::Task(TaskStoreError::NotFound(_))
        | TaskTitleEditError::Task(TaskStoreError::ListNotFound(_))
        | TaskTitleEditError::Task(TaskStoreError::ListArchived(_)) => {
            CommandError::new("TASK_EDIT_STALE", error.to_string())
        }
        TaskTitleEditError::Task(TaskStoreError::ArchivedTask(_)) => {
            CommandError::new("TASK_EDIT_NOT_ALLOWED", error.to_string())
        }
        _ => CommandError::new("TASK_EDIT_FAILED", error.to_string()),
    }
}

#[tauri::command(rename_all = "camelCase")]
pub fn create_list_board_task(
    app_handle: tauri::AppHandle,
    list_id: String,
    lane: String,
    title: String,
) -> CommandResult<String> {
    let list_id = parse_list_id("listId", &list_id)?;
    let lane = parse_pending_lane("lane", &lane)?;
    let mut connection = app_database(&app_handle)?;
    create_board_task(
        &mut connection,
        list_id,
        lane,
        title,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(|task| task.id.to_string())
    .map_err(map_create_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn update_list_board_task_title(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
    expected_title: String,
    title: String,
) -> CommandResult<()> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let mut connection = app_database(&app_handle)?;
    update_task_title_if_expected(
        &mut connection,
        task_id,
        list_id,
        &expected_title,
        title,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(|_| ())
    .map_err(map_edit_error)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::get_task;

    const T0: &str = "2026-09-09T08:00:00Z";
    const T1: &str = "2026-09-09T08:01:00Z";

    fn setup() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("run migrations");
        conn
    }

    fn list(conn: &mut Connection) -> ListId {
        create_list(
            conn,
            NewListInput {
                title: "Work".to_owned(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list")
        .id
    }

    #[test]
    fn board_create_uses_stable_identity_and_appends_to_requested_lane() {
        let mut conn = setup();
        let list_id = list(&mut conn);
        let first = create_board_task(
            &mut conn,
            list_id,
            PlanningLane::Today,
            "First".to_owned(),
            T0,
        )
        .expect("create first task");
        let second = create_board_task(
            &mut conn,
            list_id,
            PlanningLane::Today,
            "  Second  ".to_owned(),
            T1,
        )
        .expect("create second task");

        assert_ne!(first.id, second.id);
        assert_eq!(second.title, "Second");
        assert_eq!(second.list_id, list_id);
        assert_eq!(second.manual_lane, PlanningLane::Today);
        assert_eq!(second.sort_rank, first.sort_rank + 1);
        assert_eq!(get_task(&conn, second.id).expect("reload created task"), second);
    }

    #[test]
    fn blank_board_create_is_rejected_without_persisting_a_task() {
        let mut conn = setup();
        let list_id = list(&mut conn);
        let before: i64 = conn
            .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
            .expect("count tasks before invalid create");

        let result = create_board_task(
            &mut conn,
            list_id,
            PlanningLane::Backlog,
            "   ".to_owned(),
            T1,
        );
        assert!(matches!(result, Err(TaskStoreError::InvalidTitle)));

        let after: i64 = conn
            .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
            .expect("count tasks after invalid create");
        assert_eq!(after, before);
    }
}
