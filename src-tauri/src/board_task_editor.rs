use crate::domain::ids::{ListId, TaskId};
use crate::domain::model::PlanningLane;
use crate::domain::tasks::{NewTaskInput, TaskRecord, UpdateTaskInput};
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::tasks::{create_task, get_task, update_task, TaskStoreError};
use rusqlite::Connection;
use std::fmt::{Display, Formatter};
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug)]
enum BoardTaskEditorError {
    Task(TaskStoreError),
    ExpectedListMismatch {
        expected: ListId,
        actual: ListId,
    },
    ExpectedTitleMismatch(TaskId),
}

impl Display for BoardTaskEditorError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Task(error) => Display::fmt(error, formatter),
            Self::ExpectedListMismatch { expected, actual } => write!(
                formatter,
                "task list changed before the inline edit committed: expected {expected}, actual {actual}"
            ),
            Self::ExpectedTitleMismatch(id) => write!(
                formatter,
                "task title changed before the inline edit committed: {id}"
            ),
        }
    }
}

impl std::error::Error for BoardTaskEditorError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Task(error) => Some(error),
            _ => None,
        }
    }
}

impl From<TaskStoreError> for BoardTaskEditorError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

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
) -> Result<TaskRecord, BoardTaskEditorError> {
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
    .map_err(BoardTaskEditorError::from)
}

fn update_board_task_title(
    conn: &mut Connection,
    task_id: TaskId,
    expected_list_id: ListId,
    expected_title: &str,
    title: String,
    now: &str,
) -> Result<TaskRecord, BoardTaskEditorError> {
    let current = get_task(conn, task_id)?;
    if current.list_id != expected_list_id {
        return Err(BoardTaskEditorError::ExpectedListMismatch {
            expected: expected_list_id,
            actual: current.list_id,
        });
    }
    if current.title != expected_title {
        return Err(BoardTaskEditorError::ExpectedTitleMismatch(task_id));
    }

    update_task(
        conn,
        task_id,
        UpdateTaskInput {
            title,
            est_seconds: current.est_seconds,
        },
        now,
    )
    .map_err(BoardTaskEditorError::from)
}

fn map_create_error(error: BoardTaskEditorError) -> CommandError {
    match error {
        BoardTaskEditorError::Task(TaskStoreError::InvalidTitle) => {
            CommandError::invalid_argument("title", "must not be empty")
        }
        BoardTaskEditorError::Task(TaskStoreError::ListNotFound(_))
        | BoardTaskEditorError::Task(TaskStoreError::ListArchived(_)) => {
            CommandError::new("TASK_CREATE_STALE", error.to_string())
        }
        _ => CommandError::new("TASK_CREATE_FAILED", error.to_string()),
    }
}

fn map_edit_error(error: BoardTaskEditorError) -> CommandError {
    match error {
        BoardTaskEditorError::Task(TaskStoreError::InvalidTitle) => {
            CommandError::invalid_argument("title", "must not be empty")
        }
        BoardTaskEditorError::ExpectedListMismatch { .. }
        | BoardTaskEditorError::ExpectedTitleMismatch(_)
        | BoardTaskEditorError::Task(TaskStoreError::NotFound(_))
        | BoardTaskEditorError::Task(TaskStoreError::ListNotFound(_))
        | BoardTaskEditorError::Task(TaskStoreError::ListArchived(_)) => {
            CommandError::new("TASK_EDIT_STALE", error.to_string())
        }
        BoardTaskEditorError::Task(TaskStoreError::ArchivedTask(_)) => {
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
    update_board_task_title(
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

    const T0: &str = "2026-09-09T08:00:00Z";
    const T1: &str = "2026-09-09T08:01:00Z";

    fn setup() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("run migrations");
        conn
    }

    fn list(conn: &mut Connection, title: &str) -> ListId {
        create_list(
            conn,
            NewListInput {
                title: title.to_owned(),
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
        let list_id = list(&mut conn, "Work");
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
        let list_id = list(&mut conn, "Work");
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
        assert!(matches!(
            result,
            Err(BoardTaskEditorError::Task(TaskStoreError::InvalidTitle))
        ));

        let after: i64 = conn
            .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
            .expect("count tasks after invalid create");
        assert_eq!(after, before);
    }

    #[test]
    fn title_edit_preserves_identity_position_estimate_schedule_and_completion_metadata() {
        let mut conn = setup();
        let list_id = list(&mut conn, "Work");
        let created = create_task(
            &mut conn,
            NewTaskInput {
                list_id,
                title: "Original".to_owned(),
                manual_lane: PlanningLane::ThisWeek,
                est_seconds: Some(1_500),
            },
            T0,
        )
        .expect("create task");
        conn.execute(
            "UPDATE tasks
             SET schedule_kind = 'date_only', scheduled_local_date = '2026-09-12', completed_at = '2026-09-09T08:00:30Z'
             WHERE id = ?1",
            [created.id.to_string()],
        )
        .expect("set preserved metadata");
        let before = get_task(&conn, created.id).expect("load task before edit");

        let edited = update_board_task_title(
            &mut conn,
            created.id,
            list_id,
            "Original",
            "  Renamed  ".to_owned(),
            T1,
        )
        .expect("edit task title");

        assert_eq!(edited.id, before.id);
        assert_eq!(edited.title, "Renamed");
        assert_eq!(edited.list_id, before.list_id);
        assert_eq!(edited.manual_lane, before.manual_lane);
        assert_eq!(edited.sort_rank, before.sort_rank);
        assert_eq!(edited.est_seconds, before.est_seconds);
        assert_eq!(edited.schedule_kind, before.schedule_kind);
        assert_eq!(edited.scheduled_local_date, before.scheduled_local_date);
        assert_eq!(edited.completed_at, before.completed_at);
    }

    #[test]
    fn stale_title_edit_is_rejected_without_clobbering_newer_authoritative_title() {
        let mut conn = setup();
        let list_id = list(&mut conn, "Work");
        let created = create_board_task(
            &mut conn,
            list_id,
            PlanningLane::Backlog,
            "Original".to_owned(),
            T0,
        )
        .expect("create task");
        update_task(
            &mut conn,
            created.id,
            UpdateTaskInput {
                title: "Newer title".to_owned(),
                est_seconds: None,
            },
            T1,
        )
        .expect("apply newer authoritative title");

        let result = update_board_task_title(
            &mut conn,
            created.id,
            list_id,
            "Original",
            "Stale overwrite".to_owned(),
            T1,
        );
        assert!(matches!(
            result,
            Err(BoardTaskEditorError::ExpectedTitleMismatch(id)) if id == created.id
        ));
        assert_eq!(
            get_task(&conn, created.id).expect("reload task").title,
            "Newer title"
        );
    }

    #[test]
    fn stale_list_edit_is_rejected_without_writing_title() {
        let mut conn = setup();
        let original_list = list(&mut conn, "Original list");
        let other_list = list(&mut conn, "Other list");
        let created = create_board_task(
            &mut conn,
            original_list,
            PlanningLane::Backlog,
            "Original".to_owned(),
            T0,
        )
        .expect("create task");

        let result = update_board_task_title(
            &mut conn,
            created.id,
            other_list,
            "Original",
            "Wrong list overwrite".to_owned(),
            T1,
        );
        assert!(matches!(
            result,
            Err(BoardTaskEditorError::ExpectedListMismatch { expected, actual })
                if expected == other_list && actual == original_list
        ));
        assert_eq!(
            get_task(&conn, created.id).expect("reload task").title,
            "Original"
        );
    }
}
