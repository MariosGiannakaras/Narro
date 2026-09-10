use crate::domain::ids::{ListId, SubtaskId, TaskId};
use crate::domain::subtasks::SubtaskRecord;
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::subtask_board::{
    board_subtasks_for_task, create_board_subtask, delete_board_subtask_if_expected,
    reorder_board_subtasks_if_expected, set_board_subtask_completion_if_expected,
    update_board_subtask_title_if_expected, SubtaskBoardError,
};
use crate::persistence::subtasks::SubtaskStoreError;
use crate::persistence::tasks::{get_task, TaskStoreError};
use rusqlite::Connection;
use serde::Serialize;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardSubtask {
    pub id: String,
    pub task_id: String,
    pub title: String,
    pub sort_rank: u32,
    pub completed_at: Option<String>,
    pub updated_at: String,
}

impl From<SubtaskRecord> for BoardSubtask {
    fn from(value: SubtaskRecord) -> Self {
        Self {
            id: value.id.to_string(),
            task_id: value.task_id.to_string(),
            title: value.title,
            sort_rank: value.sort_rank,
            completed_at: value.completed_at,
            updated_at: value.updated_at,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardSubtaskSnapshot {
    pub task_id: String,
    pub list_id: String,
    pub mutable: bool,
    pub subtasks: Vec<BoardSubtask>,
}

fn app_database(app_handle: &tauri::AppHandle) -> CommandResult<Connection> {
    let app_dir: PathBuf = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "SUBTASK_FAILED",
            format!("failed to resolve Narro app-data directory for subtasks: {error}"),
        )
    })?;
    let connection = Connection::open(app_dir.join("narro.db")).map_err(|error| {
        CommandError::new(
            "SUBTASK_FAILED",
            format!("failed to open the Narro database for subtasks: {error}"),
        )
    })?;
    persistence::configure_connection(&connection).map_err(|error| {
        CommandError::new(
            "SUBTASK_FAILED",
            format!("failed to configure the Narro database for subtasks: {error}"),
        )
    })?;
    Ok(connection)
}

fn parse_task_id(argument: &str, raw: &str) -> CommandResult<TaskId> {
    TaskId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn parse_list_id(argument: &str, raw: &str) -> CommandResult<ListId> {
    ListId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn parse_subtask_id(argument: &str, raw: &str) -> CommandResult<SubtaskId> {
    SubtaskId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn parse_subtask_ids(argument: &str, raw: &[String]) -> CommandResult<Vec<SubtaskId>> {
    raw.iter()
        .map(|value| parse_subtask_id(argument, value))
        .collect()
}

fn map_subtask_error(error: SubtaskBoardError) -> CommandError {
    match error {
        SubtaskBoardError::Subtask(SubtaskStoreError::InvalidTitle) => {
            CommandError::invalid_argument("title", "must not be empty")
        }
        SubtaskBoardError::Subtask(SubtaskStoreError::DuplicateReorderId) => {
            CommandError::invalid_argument("orderedIds", "must not contain duplicate subtask IDs")
        }
        SubtaskBoardError::Subtask(SubtaskStoreError::ReorderSetMismatch) => CommandError::invalid_argument(
            "orderedIds",
            "must contain the same subtask IDs as expectedOrder",
        ),
        SubtaskBoardError::ExpectedListMismatch { .. }
        | SubtaskBoardError::ExpectedParentMismatch { .. }
        | SubtaskBoardError::ExpectedTitleMismatch(_)
        | SubtaskBoardError::ExpectedCompletionMismatch(_)
        | SubtaskBoardError::ExpectedUpdatedAtMismatch(_)
        | SubtaskBoardError::ExpectedOrderMismatch(_)
        | SubtaskBoardError::StaleWrite(_)
        | SubtaskBoardError::Subtask(SubtaskStoreError::NotFound(_))
        | SubtaskBoardError::Task(TaskStoreError::NotFound(_))
        | SubtaskBoardError::Task(TaskStoreError::ListNotFound(_))
        | SubtaskBoardError::List(ListStoreError::NotFound(_)) => {
            CommandError::new("SUBTASK_STALE", error.to_string())
        }
        SubtaskBoardError::Subtask(SubtaskStoreError::ParentTaskArchived(_))
        | SubtaskBoardError::Subtask(SubtaskStoreError::ParentTaskCompleted(_))
        | SubtaskBoardError::Subtask(SubtaskStoreError::ParentListArchived(_))
        | SubtaskBoardError::Task(TaskStoreError::ArchivedTask(_))
        | SubtaskBoardError::Task(TaskStoreError::CompletedTask(_))
        | SubtaskBoardError::Task(TaskStoreError::ListArchived(_)) => {
            CommandError::new("SUBTASK_NOT_ALLOWED", error.to_string())
        }
        _ => CommandError::new("SUBTASK_FAILED", error.to_string()),
    }
}

fn snapshot(
    connection: &Connection,
    task_id: TaskId,
    list_id: ListId,
) -> Result<BoardSubtaskSnapshot, SubtaskBoardError> {
    let subtasks = board_subtasks_for_task(connection, task_id, list_id)?;
    let task = get_task(connection, task_id)?;
    let list = get_list(connection, list_id)?;
    Ok(BoardSubtaskSnapshot {
        task_id: task_id.to_string(),
        list_id: list_id.to_string(),
        mutable: task.archived_at.is_none()
            && task.completed_at.is_none()
            && list.archived_at.is_none(),
        subtasks: subtasks.into_iter().map(BoardSubtask::from).collect(),
    })
}

#[tauri::command(rename_all = "camelCase")]
pub fn get_list_board_task_subtasks(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
) -> CommandResult<BoardSubtaskSnapshot> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let connection = app_database(&app_handle)?;
    snapshot(&connection, task_id, list_id).map_err(map_subtask_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn create_list_board_subtask(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
    title: String,
) -> CommandResult<BoardSubtask> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let mut connection = app_database(&app_handle)?;
    create_board_subtask(
        &mut connection,
        task_id,
        list_id,
        title,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(BoardSubtask::from)
    .map_err(map_subtask_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn update_list_board_subtask_title(
    app_handle: tauri::AppHandle,
    subtask_id: String,
    task_id: String,
    list_id: String,
    expected_title: String,
    title: String,
) -> CommandResult<BoardSubtask> {
    let subtask_id = parse_subtask_id("subtaskId", &subtask_id)?;
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let mut connection = app_database(&app_handle)?;
    update_board_subtask_title_if_expected(
        &mut connection,
        subtask_id,
        task_id,
        list_id,
        &expected_title,
        title,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(BoardSubtask::from)
    .map_err(map_subtask_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn set_list_board_subtask_completion(
    app_handle: tauri::AppHandle,
    subtask_id: String,
    task_id: String,
    list_id: String,
    expected_completed_at: Option<String>,
    completed: bool,
) -> CommandResult<BoardSubtask> {
    let subtask_id = parse_subtask_id("subtaskId", &subtask_id)?;
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let mut connection = app_database(&app_handle)?;
    set_board_subtask_completion_if_expected(
        &mut connection,
        subtask_id,
        task_id,
        list_id,
        expected_completed_at.as_deref(),
        completed,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(BoardSubtask::from)
    .map_err(map_subtask_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn reorder_list_board_subtasks(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
    expected_order: Vec<String>,
    ordered_ids: Vec<String>,
) -> CommandResult<Vec<BoardSubtask>> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let expected_order = parse_subtask_ids("expectedOrder", &expected_order)?;
    let ordered_ids = parse_subtask_ids("orderedIds", &ordered_ids)?;
    let mut connection = app_database(&app_handle)?;
    reorder_board_subtasks_if_expected(
        &mut connection,
        task_id,
        list_id,
        &expected_order,
        &ordered_ids,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(|subtasks| subtasks.into_iter().map(BoardSubtask::from).collect())
    .map_err(map_subtask_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn delete_list_board_subtask(
    app_handle: tauri::AppHandle,
    subtask_id: String,
    task_id: String,
    list_id: String,
    expected_updated_at: String,
) -> CommandResult<()> {
    let subtask_id = parse_subtask_id("subtaskId", &subtask_id)?;
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let mut connection = app_database(&app_handle)?;
    delete_board_subtask_if_expected(
        &mut connection,
        subtask_id,
        task_id,
        list_id,
        &expected_updated_at,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map_err(map_subtask_error)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::subtasks::complete_subtask;
    use crate::persistence::tasks::{complete_task, create_task};

    const T0: &str = "2026-09-10T10:00:00Z";
    const T1: &str = "2026-09-10T10:01:00Z";

    fn setup() -> (Connection, ListId, TaskId) {
        let mut connection = Connection::open_in_memory().expect("open database");
        run_migrations(&mut connection).expect("migrate database");
        let list_id = create_list(
            &mut connection,
            NewListInput {
                title: "Work".into(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list")
        .id;
        let task_id = create_task(
            &mut connection,
            NewTaskInput {
                list_id,
                title: "Parent".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            T0,
        )
        .expect("create task")
        .id;
        (connection, list_id, task_id)
    }

    #[test]
    fn snapshot_is_read_only_after_parent_completion() {
        let (mut connection, list_id, task_id) = setup();
        let created = create_board_subtask(
            &mut connection,
            task_id,
            list_id,
            "Child".into(),
            T0,
        )
        .expect("create child");
        complete_subtask(&mut connection, created.id, T1).expect("complete child");
        complete_task(&mut connection, task_id, T1).expect("complete parent");

        let read = snapshot(&connection, task_id, list_id).expect("read completed parent subtasks");
        assert!(!read.mutable);
        assert_eq!(read.subtasks.len(), 1);
        assert!(read.subtasks[0].completed_at.is_some());

        let mutation = update_board_subtask_title_if_expected(
            &mut connection,
            created.id,
            task_id,
            list_id,
            "Child",
            "Changed".into(),
            T1,
        );
        assert!(matches!(
            mutation,
            Err(SubtaskBoardError::Subtask(SubtaskStoreError::ParentTaskCompleted(id))) if id == task_id
        ));
    }
}
