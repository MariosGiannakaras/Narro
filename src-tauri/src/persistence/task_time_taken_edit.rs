use crate::domain::ids::{ListId, TaskId};
use crate::domain::tasks::{SetTaskTimeTakenInput, TaskRecord};
use crate::persistence::task_metadata::{
    set_task_time_taken_in_transaction, task_time_taken_seconds, TaskMetadataError,
};
use crate::persistence::tasks::{get_task, TaskStoreError};
use rusqlite::{Connection, TransactionBehavior};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum TaskTimeTakenEditError {
    Metadata(TaskMetadataError),
    Task(TaskStoreError),
    ExpectedListMismatch {
        expected: ListId,
        actual: ListId,
    },
    ExpectedTimeTakenMismatch {
        task_id: TaskId,
        expected: u64,
        actual: u64,
    },
    LiveTaskRequiresRuntimeBoundary(TaskId),
}

impl Display for TaskTimeTakenEditError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Metadata(error) => Display::fmt(error, formatter),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::ExpectedListMismatch { expected, actual } => write!(
                formatter,
                "task list changed before the Time Taken edit committed: expected {expected}, actual {actual}"
            ),
            Self::ExpectedTimeTakenMismatch {
                task_id,
                expected,
                actual,
            } => write!(
                formatter,
                "task Time Taken changed before the edit committed: {task_id}; expected {expected}s, actual {actual}s"
            ),
            Self::LiveTaskRequiresRuntimeBoundary(id) => write!(
                formatter,
                "live task Time Taken must be edited through the paused timer runtime boundary: {id}"
            ),
        }
    }
}

impl std::error::Error for TaskTimeTakenEditError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Metadata(error) => Some(error),
            Self::Task(error) => Some(error),
            _ => None,
        }
    }
}

impl From<TaskMetadataError> for TaskTimeTakenEditError {
    fn from(value: TaskMetadataError) -> Self {
        Self::Metadata(value)
    }
}

impl From<TaskStoreError> for TaskTimeTakenEditError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

fn has_live_focus_session(conn: &Connection, id: TaskId) -> Result<bool, TaskTimeTakenEditError> {
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
    .map_err(TaskTimeTakenEditError::from)
}

pub fn set_non_live_task_time_taken_if_expected(
    conn: &mut Connection,
    task_id: TaskId,
    expected_list_id: ListId,
    expected_total_seconds: u64,
    total_seconds: u32,
    now: &str,
) -> Result<(TaskRecord, u64), TaskTimeTakenEditError> {
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = get_task(&tx, task_id)?;
    if current.list_id != expected_list_id {
        return Err(TaskTimeTakenEditError::ExpectedListMismatch {
            expected: expected_list_id,
            actual: current.list_id,
        });
    }
    if has_live_focus_session(&tx, task_id)? {
        return Err(TaskTimeTakenEditError::LiveTaskRequiresRuntimeBoundary(task_id));
    }

    let actual = task_time_taken_seconds(&tx, task_id)?;
    if actual != expected_total_seconds {
        return Err(TaskTimeTakenEditError::ExpectedTimeTakenMismatch {
            task_id,
            expected: expected_total_seconds,
            actual,
        });
    }

    let task = set_task_time_taken_in_transaction(
        &tx,
        task_id,
        SetTaskTimeTakenInput { total_seconds },
        now,
    )?;
    let effective = task_time_taken_seconds(&tx, task_id)?;
    tx.commit().map_err(TaskStoreError::from)?;
    Ok((task, effective))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::sessions::{NewSessionInput, SessionKind, SessionSource};
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::sessions::{close_session, open_session};
    use crate::persistence::tasks::create_task;
    use crate::timer::runtime::TimerRuntime;
    use crate::timer::TimerMode;

    const T0: &str = "2026-09-09T12:00:00Z";
    const T1: &str = "2026-09-09T12:01:00Z";
    const T2: &str = "2026-09-09T12:02:00Z";

    fn fixture() -> (Connection, ListId, TaskId) {
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
                title: "Time target".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: Some(1_800),
            },
            T0,
        )
        .expect("create task");
        (conn, list.id, task.id)
    }

    #[test]
    fn non_live_edit_preserves_session_history_and_reconciles_effective_total() {
        let (mut conn, list_id, task_id) = fixture();
        let session = open_session(
            &mut conn,
            NewSessionInput {
                task_id: Some(task_id),
                kind: SessionKind::Work,
                source: SessionSource::Manual,
            },
            T0,
        )
        .unwrap();
        close_session(&mut conn, session.id, 600, T1).unwrap();

        let (_, effective) = set_non_live_task_time_taken_if_expected(
            &mut conn,
            task_id,
            list_id,
            600,
            900,
            T2,
        )
        .expect("edit Time Taken");
        assert_eq!(effective, 900);

        let stored_duration: i64 = conn
            .query_row(
                "SELECT duration_seconds FROM sessions WHERE id = ?1",
                [session.id.to_string()],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(stored_duration, 600);
    }

    #[test]
    fn stale_expected_total_rejects_overwrite() {
        let (mut conn, list_id, task_id) = fixture();
        set_non_live_task_time_taken_if_expected(&mut conn, task_id, list_id, 0, 300, T1)
            .unwrap();

        let stale = set_non_live_task_time_taken_if_expected(
            &mut conn,
            task_id,
            list_id,
            0,
            600,
            T2,
        );
        assert!(matches!(
            stale,
            Err(TaskTimeTakenEditError::ExpectedTimeTakenMismatch {
                task_id: id,
                expected: 0,
                actual: 300,
            }) if id == task_id
        ));
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 300);
    }

    #[test]
    fn live_task_requires_runtime_time_taken_boundary() {
        let (mut conn, list_id, task_id) = fixture();
        let mut runtime = TimerRuntime::new();
        runtime
            .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
            .unwrap();

        let result = set_non_live_task_time_taken_if_expected(
            &mut conn,
            task_id,
            list_id,
            0,
            120,
            T1,
        );
        assert!(matches!(
            result,
            Err(TaskTimeTakenEditError::LiveTaskRequiresRuntimeBoundary(id)) if id == task_id
        ));
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 0);
    }
}
