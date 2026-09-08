use crate::domain::ids::{ListId, TaskId};
use crate::domain::model::{PlanningLane, ScheduleKind};
use crate::domain::tasks::{TaskDestination, TaskRecord};
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::task_identity::{reorder_active_bucket, TaskIdentityError};
use crate::persistence::tasks::{active_tasks_in_bucket, get_task, move_task, TaskStoreError};
use rusqlite::Connection;
use std::fmt::{Display, Formatter};
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug)]
enum BoardTaskMutationError {
    Task(TaskStoreError),
    Identity(TaskIdentityError),
    ExpectedListMismatch { expected: ListId, actual: ListId },
    ExpectedLaneMismatch {
        expected: PlanningLane,
        actual: PlanningLane,
    },
    ScheduledTask(TaskId),
    InvalidAnchor(TaskId),
    ScheduledAnchor(TaskId),
}

impl Display for BoardTaskMutationError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Task(error) => Display::fmt(error, formatter),
            Self::Identity(error) => Display::fmt(error, formatter),
            Self::ExpectedListMismatch { expected, actual } => write!(
                formatter,
                "task list changed before the board mutation committed: expected {expected}, actual {actual}"
            ),
            Self::ExpectedLaneMismatch { expected, actual } => write!(
                formatter,
                "task lane changed before the board mutation committed: expected {}, actual {}",
                expected.as_str(),
                actual.as_str()
            ),
            Self::ScheduledTask(id) => write!(
                formatter,
                "scheduled task {id} cannot be manually reordered or moved while its schedule is active"
            ),
            Self::InvalidAnchor(id) => write!(
                formatter,
                "task reorder anchor {id} is not an active task in the same persisted bucket"
            ),
            Self::ScheduledAnchor(id) => write!(
                formatter,
                "scheduled task {id} cannot be used as a manual reorder anchor"
            ),
        }
    }
}

impl std::error::Error for BoardTaskMutationError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Task(error) => Some(error),
            Self::Identity(error) => Some(error),
            _ => None,
        }
    }
}

impl From<TaskStoreError> for BoardTaskMutationError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<TaskIdentityError> for BoardTaskMutationError {
    fn from(value: TaskIdentityError) -> Self {
        Self::Identity(value)
    }
}

fn validate_expected_source(
    task: &TaskRecord,
    expected_list_id: ListId,
    expected_lane: PlanningLane,
) -> Result<(), BoardTaskMutationError> {
    if task.list_id != expected_list_id {
        return Err(BoardTaskMutationError::ExpectedListMismatch {
            expected: expected_list_id,
            actual: task.list_id,
        });
    }
    if task.manual_lane != expected_lane {
        return Err(BoardTaskMutationError::ExpectedLaneMismatch {
            expected: expected_lane,
            actual: task.manual_lane,
        });
    }
    if task.completed_at.is_some() {
        return Err(TaskStoreError::CompletedTask(task.id).into());
    }
    if task.archived_at.is_some() {
        return Err(TaskStoreError::ArchivedTask(task.id).into());
    }
    if task.schedule_kind != ScheduleKind::None {
        return Err(BoardTaskMutationError::ScheduledTask(task.id));
    }
    Ok(())
}

fn insertion_index_after_last_unscheduled(tasks: &[TaskRecord]) -> usize {
    tasks
        .iter()
        .rposition(|task| task.schedule_kind == ScheduleKind::None)
        .map_or(0, |index| index + 1)
}

fn reorder_unscheduled_task_before(
    conn: &mut Connection,
    id: TaskId,
    expected_list_id: ListId,
    expected_lane: PlanningLane,
    before_id: Option<TaskId>,
    now: &str,
) -> Result<Vec<TaskRecord>, BoardTaskMutationError> {
    let current = get_task(conn, id)?;
    validate_expected_source(&current, expected_list_id, expected_lane)?;

    let bucket = active_tasks_in_bucket(conn, expected_list_id, expected_lane)?;
    let original_ids: Vec<TaskId> = bucket.iter().map(|task| task.id).collect();
    let Some(current_index) = original_ids.iter().position(|candidate| *candidate == id) else {
        return Err(BoardTaskMutationError::InvalidAnchor(id));
    };

    if before_id == Some(id) {
        return Ok(bucket);
    }

    let mut remaining = bucket;
    remaining.remove(current_index);

    let insertion_index = match before_id {
        Some(anchor_id) => {
            let Some(index) = remaining.iter().position(|task| task.id == anchor_id) else {
                return Err(BoardTaskMutationError::InvalidAnchor(anchor_id));
            };
            if remaining[index].schedule_kind != ScheduleKind::None {
                return Err(BoardTaskMutationError::ScheduledAnchor(anchor_id));
            }
            index
        }
        None => insertion_index_after_last_unscheduled(&remaining),
    };

    let mut ordered_ids: Vec<TaskId> = remaining.iter().map(|task| task.id).collect();
    ordered_ids.insert(insertion_index, id);
    if ordered_ids == original_ids {
        return active_tasks_in_bucket(conn, expected_list_id, expected_lane)
            .map_err(BoardTaskMutationError::from);
    }

    reorder_active_bucket(conn, expected_list_id, expected_lane, &ordered_ids, now)
        .map_err(BoardTaskMutationError::from)
}

fn move_unscheduled_task_to_lane(
    conn: &mut Connection,
    id: TaskId,
    expected_list_id: ListId,
    expected_source_lane: PlanningLane,
    target_lane: PlanningLane,
    now: &str,
) -> Result<TaskRecord, BoardTaskMutationError> {
    let current = get_task(conn, id)?;
    validate_expected_source(&current, expected_list_id, expected_source_lane)?;
    if expected_source_lane == target_lane {
        return Ok(current);
    }

    move_task(
        conn,
        id,
        TaskDestination {
            list_id: expected_list_id,
            manual_lane: target_lane,
        },
        now,
    )
    .map_err(BoardTaskMutationError::from)
}

fn app_database(app_handle: &tauri::AppHandle) -> CommandResult<Connection> {
    let app_dir: PathBuf = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "TASK_BOARD_MUTATION_FAILED",
            format!("failed to resolve Narro app-data directory for task board mutation: {error}"),
        )
    })?;
    let connection = Connection::open(app_dir.join("narro.db")).map_err(|error| {
        CommandError::new(
            "TASK_BOARD_MUTATION_FAILED",
            format!("failed to open the Narro database for task board mutation: {error}"),
        )
    })?;
    persistence::configure_connection(&connection).map_err(|error| {
        CommandError::new(
            "TASK_BOARD_MUTATION_FAILED",
            format!("failed to configure the Narro database for task board mutation: {error}"),
        )
    })?;
    Ok(connection)
}

fn parse_id(argument: &str, raw: &str) -> CommandResult<TaskId> {
    TaskId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn parse_list_id(argument: &str, raw: &str) -> CommandResult<ListId> {
    ListId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn parse_lane(argument: &str, raw: &str) -> CommandResult<PlanningLane> {
    PlanningLane::try_from(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be backlog, this_week, or today"))
}

fn map_reorder_error(error: BoardTaskMutationError) -> CommandError {
    match error {
        BoardTaskMutationError::ScheduledTask(_) | BoardTaskMutationError::ScheduledAnchor(_) => {
            CommandError::new("TASK_REORDER_NOT_ALLOWED", error.to_string())
        }
        BoardTaskMutationError::ExpectedListMismatch { .. }
        | BoardTaskMutationError::ExpectedLaneMismatch { .. }
        | BoardTaskMutationError::InvalidAnchor(_)
        | BoardTaskMutationError::Identity(TaskIdentityError::ReorderSetMismatch)
        | BoardTaskMutationError::Identity(TaskIdentityError::DuplicateReorderId) => {
            CommandError::new("TASK_REORDER_STALE", error.to_string())
        }
        _ => CommandError::new("TASK_REORDER_FAILED", error.to_string()),
    }
}

fn map_move_error(error: BoardTaskMutationError) -> CommandError {
    match error {
        BoardTaskMutationError::ScheduledTask(_) => {
            CommandError::new("TASK_MOVE_NOT_ALLOWED", error.to_string())
        }
        BoardTaskMutationError::ExpectedListMismatch { .. }
        | BoardTaskMutationError::ExpectedLaneMismatch { .. } => {
            CommandError::new("TASK_MOVE_STALE", error.to_string())
        }
        _ => CommandError::new("TASK_MOVE_FAILED", error.to_string()),
    }
}

#[tauri::command(rename_all = "camelCase")]
pub fn reorder_list_board_task(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
    source_lane: String,
    before_task_id: Option<String>,
) -> CommandResult<()> {
    let task_id = parse_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let source_lane = parse_lane("sourceLane", &source_lane)?;
    let before_task_id = before_task_id
        .as_deref()
        .map(|value| parse_id("beforeTaskId", value))
        .transpose()?;
    let mut connection = app_database(&app_handle)?;
    reorder_unscheduled_task_before(
        &mut connection,
        task_id,
        list_id,
        source_lane,
        before_task_id,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(|_| ())
    .map_err(map_reorder_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn move_list_board_task(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
    source_lane: String,
    target_lane: String,
) -> CommandResult<()> {
    let task_id = parse_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let source_lane = parse_lane("sourceLane", &source_lane)?;
    let target_lane = parse_lane("targetLane", &target_lane)?;
    let mut connection = app_database(&app_handle)?;
    move_unscheduled_task_to_lane(
        &mut connection,
        task_id,
        list_id,
        source_lane,
        target_lane,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(|_| ())
    .map_err(map_move_error)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::create_task;
    use std::collections::HashSet;

    const T0: &str = "2026-09-08T12:00:00Z";
    const T1: &str = "2026-09-08T12:01:00Z";

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

    fn task(conn: &mut Connection, list_id: ListId, title: &str, lane: PlanningLane) -> TaskRecord {
        create_task(
            conn,
            NewTaskInput {
                list_id,
                title: title.to_owned(),
                manual_lane: lane,
                est_seconds: None,
            },
            T0,
        )
        .expect("create task")
    }

    fn ids(tasks: &[TaskRecord]) -> Vec<TaskId> {
        tasks.iter().map(|task| task.id).collect()
    }

    #[test]
    fn same_lane_reorder_uses_exact_set_and_keeps_scheduled_rows_singular() {
        let mut conn = setup();
        let list_id = list(&mut conn);
        let first = task(&mut conn, list_id, "First", PlanningLane::Backlog);
        let scheduled = task(&mut conn, list_id, "Scheduled", PlanningLane::Backlog);
        let last = task(&mut conn, list_id, "Last", PlanningLane::Backlog);
        conn.execute(
            "UPDATE tasks SET schedule_kind = 'date_only', scheduled_local_date = '2026-09-10' WHERE id = ?1",
            [scheduled.id.to_string()],
        )
        .expect("schedule fixture task");
        let expected: HashSet<TaskId> = [first.id, scheduled.id, last.id].into_iter().collect();

        let reordered = reorder_unscheduled_task_before(
            &mut conn,
            last.id,
            list_id,
            PlanningLane::Backlog,
            Some(first.id),
            T1,
        )
        .expect("reorder unscheduled task");
        assert_eq!(ids(&reordered), vec![last.id, first.id, scheduled.id]);
        assert_eq!(
            reordered.iter().map(|task| task.id).collect::<HashSet<_>>(),
            expected
        );
        let persisted_schedule = get_task(&conn, scheduled.id).expect("reload scheduled task");
        assert_eq!(persisted_schedule.schedule_kind, ScheduleKind::DateOnly);
        assert_eq!(
            persisted_schedule.scheduled_local_date.as_deref(),
            Some("2026-09-10")
        );
    }

    #[test]
    fn scheduled_task_manual_reorder_is_rejected_without_position_write() {
        let mut conn = setup();
        let list_id = list(&mut conn);
        let first = task(&mut conn, list_id, "First", PlanningLane::Today);
        let scheduled = task(&mut conn, list_id, "Scheduled", PlanningLane::Today);
        conn.execute(
            "UPDATE tasks SET schedule_kind = 'date_only', scheduled_local_date = '2026-09-09' WHERE id = ?1",
            [scheduled.id.to_string()],
        )
        .expect("schedule fixture task");
        let before = ids(
            &active_tasks_in_bucket(&conn, list_id, PlanningLane::Today)
                .expect("load bucket before rejected reorder"),
        );

        let result = reorder_unscheduled_task_before(
            &mut conn,
            scheduled.id,
            list_id,
            PlanningLane::Today,
            Some(first.id),
            T1,
        );
        assert!(matches!(result, Err(BoardTaskMutationError::ScheduledTask(id)) if id == scheduled.id));
        assert_eq!(
            ids(&active_tasks_in_bucket(&conn, list_id, PlanningLane::Today)
                .expect("load bucket after rejected reorder")),
            before
        );
    }

    #[test]
    fn cross_lane_move_appends_atomically_and_preserves_exact_global_identity_set() {
        let mut conn = setup();
        let list_id = list(&mut conn);
        let moving = task(&mut conn, list_id, "Move me", PlanningLane::Backlog);
        let stay = task(&mut conn, list_id, "Stay", PlanningLane::Backlog);
        let target = task(&mut conn, list_id, "Target", PlanningLane::Today);
        let expected: HashSet<TaskId> = [moving.id, stay.id, target.id].into_iter().collect();

        let moved = move_unscheduled_task_to_lane(
            &mut conn,
            moving.id,
            list_id,
            PlanningLane::Backlog,
            PlanningLane::Today,
            T1,
        )
        .expect("move task to Today");
        assert_eq!(moved.id, moving.id);
        assert_eq!(moved.manual_lane, PlanningLane::Today);
        assert_eq!(
            ids(&active_tasks_in_bucket(&conn, list_id, PlanningLane::Backlog)
                .expect("load compacted source")),
            vec![stay.id]
        );
        assert_eq!(
            ids(&active_tasks_in_bucket(&conn, list_id, PlanningLane::Today)
                .expect("load appended target")),
            vec![target.id, moving.id]
        );
        let stored: HashSet<TaskId> = [moving.id, stay.id, target.id]
            .into_iter()
            .map(|id| get_task(&conn, id).expect("reload task").id)
            .collect();
        assert_eq!(stored, expected);
    }

    #[test]
    fn stale_source_lane_and_wrong_anchor_fail_without_mutation() {
        let mut conn = setup();
        let list_id = list(&mut conn);
        let first = task(&mut conn, list_id, "First", PlanningLane::Backlog);
        let second = task(&mut conn, list_id, "Second", PlanningLane::Backlog);
        let other_lane = task(&mut conn, list_id, "Today", PlanningLane::Today);
        let original = ids(
            &active_tasks_in_bucket(&conn, list_id, PlanningLane::Backlog)
                .expect("load original backlog"),
        );

        let stale = move_unscheduled_task_to_lane(
            &mut conn,
            first.id,
            list_id,
            PlanningLane::Today,
            PlanningLane::ThisWeek,
            T1,
        );
        assert!(matches!(
            stale,
            Err(BoardTaskMutationError::ExpectedLaneMismatch { .. })
        ));

        let wrong_anchor = reorder_unscheduled_task_before(
            &mut conn,
            second.id,
            list_id,
            PlanningLane::Backlog,
            Some(other_lane.id),
            T1,
        );
        assert!(matches!(
            wrong_anchor,
            Err(BoardTaskMutationError::InvalidAnchor(id)) if id == other_lane.id
        ));
        assert_eq!(
            ids(&active_tasks_in_bucket(&conn, list_id, PlanningLane::Backlog)
                .expect("load backlog after rejected mutations")),
            original
        );
    }
}
