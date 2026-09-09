use crate::domain::ids::{ListId, TaskId};
use crate::domain::tasks::TaskRecord;
use crate::persistence::tasks::{get_task, TaskStoreError};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum TaskEstimateEditError {
    Task(TaskStoreError),
    ExpectedListMismatch { expected: ListId, actual: ListId },
    ExpectedEstimateMismatch(TaskId),
    LiveTaskRequiresRuntimeBoundary(TaskId),
    StaleWrite(TaskId),
}

impl Display for TaskEstimateEditError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Task(error) => Display::fmt(error, formatter),
            Self::ExpectedListMismatch { expected, actual } => write!(
                formatter,
                "task list changed before the EST edit committed: expected {expected}, actual {actual}"
            ),
            Self::ExpectedEstimateMismatch(id) => {
                write!(formatter, "task EST changed before the edit committed: {id}")
            }
            Self::LiveTaskRequiresRuntimeBoundary(id) => write!(
                formatter,
                "live task EST must be edited through the paused timer runtime boundary: {id}"
            ),
            Self::StaleWrite(id) => write!(
                formatter,
                "task changed before the atomic EST write committed: {id}"
            ),
        }
    }
}

impl std::error::Error for TaskEstimateEditError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Task(error) => Some(error),
            _ => None,
        }
    }
}

impl From<TaskStoreError> for TaskEstimateEditError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

fn validate_timestamp(value: &str) -> Result<(), TaskEstimateEditError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| TaskStoreError::InvalidTimestamp.into())
}

fn estimate_for_sql(value: Option<u32>) -> Result<Option<i64>, TaskEstimateEditError> {
    match value {
        Some(0) => Err(TaskStoreError::InvalidEstimate.into()),
        Some(seconds) => Ok(Some(i64::from(seconds))),
        None => Ok(None),
    }
}

fn validate_active_list(conn: &Connection, id: ListId) -> Result<(), TaskEstimateEditError> {
    let archived_at: Option<Option<String>> = conn
        .query_row(
            "SELECT archived_at FROM lists WHERE id = ?1",
            [id.to_string()],
            |row| row.get(0),
        )
        .optional()
        .map_err(TaskStoreError::from)?;

    match archived_at {
        None => Err(TaskStoreError::ListNotFound(id).into()),
        Some(Some(_)) => Err(TaskStoreError::ListArchived(id).into()),
        Some(None) => Ok(()),
    }
}

fn has_live_focus_session(conn: &Connection, id: TaskId) -> Result<bool, TaskEstimateEditError> {
    conn.query_row(
        "SELECT EXISTS(
            SELECT 1 FROM sessions
            WHERE task_id = ?1
              AND kind = 'work'
              AND source = 'focus'
              AND ended_at IS NULL
        )",
        [id.to_string()],
        |row| row.get::<_, i64>(0),
    )
    .map(|value| value == 1)
    .map_err(TaskStoreError::from)
    .map_err(TaskEstimateEditError::from)
}

pub(crate) fn update_task_estimate_in_transaction(
    conn: &Connection,
    task_id: TaskId,
    expected_list_id: ListId,
    expected_est_seconds: Option<u32>,
    est_seconds: Option<u32>,
    now: &str,
) -> Result<TaskRecord, TaskEstimateEditError> {
    validate_timestamp(now)?;
    let expected_est_sql = estimate_for_sql(expected_est_seconds)?;
    let est_sql = estimate_for_sql(est_seconds)?;
    let current = get_task(conn, task_id)?;

    if current.archived_at.is_some() {
        return Err(TaskStoreError::ArchivedTask(task_id).into());
    }
    validate_active_list(conn, current.list_id)?;
    if current.list_id != expected_list_id {
        return Err(TaskEstimateEditError::ExpectedListMismatch {
            expected: expected_list_id,
            actual: current.list_id,
        });
    }
    if current.est_seconds != expected_est_seconds {
        return Err(TaskEstimateEditError::ExpectedEstimateMismatch(task_id));
    }

    let changed = conn
        .execute(
            "UPDATE tasks
             SET est_seconds = ?1, updated_at = ?2
             WHERE id = ?3
               AND list_id = ?4
               AND archived_at IS NULL
               AND est_seconds IS ?5",
            params![
                est_sql,
                now,
                task_id.to_string(),
                expected_list_id.to_string(),
                expected_est_sql,
            ],
        )
        .map_err(TaskStoreError::from)?;
    if changed != 1 {
        return Err(TaskEstimateEditError::StaleWrite(task_id));
    }

    Ok(get_task(conn, task_id)?)
}

pub fn update_non_live_task_estimate_if_expected(
    conn: &mut Connection,
    task_id: TaskId,
    expected_list_id: ListId,
    expected_est_seconds: Option<u32>,
    est_seconds: Option<u32>,
    now: &str,
) -> Result<TaskRecord, TaskEstimateEditError> {
    validate_timestamp(now)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    if has_live_focus_session(&tx, task_id)? {
        return Err(TaskEstimateEditError::LiveTaskRequiresRuntimeBoundary(
            task_id,
        ));
    }
    let updated = update_task_estimate_in_transaction(
        &tx,
        task_id,
        expected_list_id,
        expected_est_seconds,
        est_seconds,
        now,
    )?;
    tx.commit().map_err(TaskStoreError::from)?;
    Ok(updated)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::create_task;
    use crate::timer::runtime::TimerRuntime;
    use crate::timer::TimerMode;

    const T0: &str = "2026-09-09T12:00:00Z";
    const T1: &str = "2026-09-09T12:01:00Z";

    fn fixture(est_seconds: Option<u32>) -> (Connection, ListId, TaskId) {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let list = create_list(
            &mut conn,
            NewListInput {
                title: "Work".into(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list");
        let task = create_task(
            &mut conn,
            NewTaskInput {
                list_id: list.id,
                title: "Estimate target".into(),
                manual_lane: PlanningLane::Today,
                est_seconds,
            },
            T0,
        )
        .expect("create task");
        (conn, list.id, task.id)
    }

    #[test]
    fn estimate_only_edit_preserves_unrelated_task_metadata() {
        let (mut conn, list_id, task_id) = fixture(Some(900));
        conn.execute(
            "UPDATE tasks
             SET manual_time_adjustment_seconds = 321,
                 schedule_kind = 'date_only',
                 scheduled_local_date = '2026-09-12',
                 completed_at = '2026-09-09T12:00:30Z'
             WHERE id = ?1",
            [task_id.to_string()],
        )
        .unwrap();
        let before = get_task(&conn, task_id).unwrap();

        let edited = update_non_live_task_estimate_if_expected(
            &mut conn,
            task_id,
            list_id,
            Some(900),
            Some(1_800),
            T1,
        )
        .expect("edit EST");

        assert_eq!(edited.est_seconds, Some(1_800));
        assert_eq!(edited.title, before.title);
        assert_eq!(edited.list_id, before.list_id);
        assert_eq!(edited.manual_lane, before.manual_lane);
        assert_eq!(edited.sort_rank, before.sort_rank);
        assert_eq!(
            edited.manual_time_adjustment_seconds,
            before.manual_time_adjustment_seconds
        );
        assert_eq!(edited.schedule_kind, before.schedule_kind);
        assert_eq!(edited.scheduled_local_date, before.scheduled_local_date);
        assert_eq!(edited.completed_at, before.completed_at);
    }

    #[test]
    fn expected_estimate_guard_is_null_safe_and_rejects_stale_values() {
        let (mut conn, list_id, task_id) = fixture(None);
        update_non_live_task_estimate_if_expected(&mut conn, task_id, list_id, None, Some(600), T1)
            .expect("set first EST");

        let stale = update_non_live_task_estimate_if_expected(
            &mut conn,
            task_id,
            list_id,
            None,
            Some(1_200),
            T1,
        );
        assert!(matches!(
            stale,
            Err(TaskEstimateEditError::ExpectedEstimateMismatch(id)) if id == task_id
        ));
        assert_eq!(get_task(&conn, task_id).unwrap().est_seconds, Some(600));
    }

    #[test]
    fn estimate_can_be_cleared_without_rewriting_other_fields() {
        let (mut conn, list_id, task_id) = fixture(Some(600));
        let edited = update_non_live_task_estimate_if_expected(
            &mut conn,
            task_id,
            list_id,
            Some(600),
            None,
            T1,
        )
        .expect("clear EST");
        assert_eq!(edited.est_seconds, None);
        assert_eq!(edited.title, "Estimate target");
    }

    #[test]
    fn live_task_requires_timer_runtime_estimate_boundary() {
        let (mut conn, list_id, task_id) = fixture(Some(600));
        let mut runtime = TimerRuntime::new();
        runtime
            .start_task(
                &mut conn,
                task_id,
                TimerMode::EstCountdown { est_ms: 600_000 },
                0,
                T0,
            )
            .unwrap();

        let result = update_non_live_task_estimate_if_expected(
            &mut conn,
            task_id,
            list_id,
            Some(600),
            Some(1_200),
            T1,
        );
        assert!(matches!(
            result,
            Err(TaskEstimateEditError::LiveTaskRequiresRuntimeBoundary(id)) if id == task_id
        ));
        assert_eq!(get_task(&conn, task_id).unwrap().est_seconds, Some(600));
    }
}
