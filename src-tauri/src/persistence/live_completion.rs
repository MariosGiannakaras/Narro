use crate::domain::ids::{SessionId, TaskId};
use crate::domain::sessions::{SessionKind, SessionRecord, SessionSource};
use crate::persistence::sessions::{get_session, SessionStoreError};
use crate::persistence::tasks::{
    complete_task_in_transaction, get_task, TaskStoreError,
};
use crate::timer::runtime::{PersistedTimerExit, TimerRuntime, TimerRuntimeError};
use crate::timer::{TaskExitReason, TimerAction, TimerError, TimerExit, TimerStateKind};
use chrono::DateTime;
use rusqlite::{params, Connection, Transaction, TransactionBehavior};
use serde::Deserialize;
use std::fmt::{Display, Formatter};

const RUNTIME_CHECKPOINT_VERSION: u32 = 1;

#[derive(Debug, Deserialize)]
struct RuntimeAccountingCheckpoint {
    version: u32,
    closed_work_seconds: u64,
}

#[derive(Debug)]
pub enum LiveTaskCompletionError {
    Runtime(TimerRuntimeError),
    Session(SessionStoreError),
    Task(TaskStoreError),
    Sqlite(rusqlite::Error),
    CheckpointJson(serde_json::Error),
    InvalidTimestamp,
    TaskAlreadyCompleted(TaskId),
    MissingCheckpoint,
    CorruptCheckpointSessionId(String),
    CheckpointBindingMismatch {
        expected: SessionId,
        actual: SessionId,
    },
    UnsupportedCheckpointVersion(u32),
    SessionBindingMismatch,
    DurationAccountingUnderflow,
    DurationOverflow,
    DurationDecreased {
        stored_seconds: u64,
        attempted_seconds: u64,
    },
}

impl Display for LiveTaskCompletionError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Runtime(error) => Display::fmt(error, formatter),
            Self::Session(error) => Display::fmt(error, formatter),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::Sqlite(error) => {
                write!(formatter, "live task completion persistence failed: {error}")
            }
            Self::CheckpointJson(error) => {
                write!(formatter, "timer runtime checkpoint JSON is invalid: {error}")
            }
            Self::InvalidTimestamp => {
                formatter.write_str("live task completion timestamp must be RFC 3339")
            }
            Self::TaskAlreadyCompleted(id) => {
                write!(formatter, "live task is already completed: {id}")
            }
            Self::MissingCheckpoint => {
                formatter.write_str("open live task session has no durable runtime checkpoint")
            }
            Self::CorruptCheckpointSessionId(value) => write!(
                formatter,
                "timer runtime checkpoint session identity is invalid: {value}"
            ),
            Self::CheckpointBindingMismatch { expected, actual } => write!(
                formatter,
                "timer runtime checkpoint is bound to {actual} instead of open session {expected}"
            ),
            Self::UnsupportedCheckpointVersion(version) => write!(
                formatter,
                "timer runtime checkpoint version {version} is not supported for completion"
            ),
            Self::SessionBindingMismatch => formatter.write_str(
                "live task completion runtime, session and task bindings are inconsistent",
            ),
            Self::DurationAccountingUnderflow => formatter.write_str(
                "live task completion duration is lower than already-closed runtime work",
            ),
            Self::DurationOverflow => {
                formatter.write_str("live task completion duration exceeds SQLite range")
            }
            Self::DurationDecreased {
                stored_seconds,
                attempted_seconds,
            } => write!(
                formatter,
                "live task completion cannot decrease the open session duration: stored={stored_seconds}s attempted={attempted_seconds}s"
            ),
        }
    }
}

impl std::error::Error for LiveTaskCompletionError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Runtime(error) => Some(error),
            Self::Session(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::Sqlite(error) => Some(error),
            Self::CheckpointJson(error) => Some(error),
            _ => None,
        }
    }
}

impl From<TimerRuntimeError> for LiveTaskCompletionError {
    fn from(value: TimerRuntimeError) -> Self {
        Self::Runtime(value)
    }
}

impl From<SessionStoreError> for LiveTaskCompletionError {
    fn from(value: SessionStoreError) -> Self {
        Self::Session(value)
    }
}

impl From<TaskStoreError> for LiveTaskCompletionError {
    fn from(value: TaskStoreError) -> Self {
        match value {
            TaskStoreError::Sqlite(error) => Self::Sqlite(error),
            other => Self::Task(other),
        }
    }
}

impl From<rusqlite::Error> for LiveTaskCompletionError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<serde_json::Error> for LiveTaskCompletionError {
    fn from(value: serde_json::Error) -> Self {
        Self::CheckpointJson(value)
    }
}

impl TimerRuntime {
    /// Complete the active task and finalize its focus session through one SQLite transaction.
    ///
    /// This is the product-level Done boundary. The lower-level `finish_task` method remains a
    /// timer/session lifecycle primitive; callers that mark a task Done must use this method so a
    /// completed task can never be published without the final tracked work already persisted.
    pub fn complete_task(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<PersistedTimerExit, LiveTaskCompletionError> {
        let runtime_snapshot = self.snapshot(now_ms)?;
        let timer = runtime_snapshot.timer;

        if timer.state == TimerStateKind::Idle {
            return Err(TimerRuntimeError::Timer(TimerError::NoActiveTask).into());
        }
        if timer.state == TimerStateKind::Break {
            return Err(TimerRuntimeError::Timer(TimerError::InvalidTransition {
                action: TimerAction::FinishTask,
                state: timer.state,
            })
            .into());
        }

        let task_id = timer
            .task_id
            .ok_or(LiveTaskCompletionError::SessionBindingMismatch)?;
        let mode = timer
            .mode
            .ok_or(LiveTaskCompletionError::SessionBindingMismatch)?;
        let session_id = runtime_snapshot
            .open_session_id
            .ok_or(LiveTaskCompletionError::SessionBindingMismatch)?;
        let exit = TimerExit {
            reason: TaskExitReason::Done,
            task_id,
            mode,
            final_state: timer.state,
            work_elapsed_ms: timer.work_elapsed_ms,
            total_break_ms: timer.total_break_ms,
            ended_at_ms: now_ms,
        };

        let closed_session = complete_task_and_close_session(
            conn,
            task_id,
            session_id,
            timer.work_elapsed_ms,
            wall_time,
        )?;

        // No fallible work may follow the committed transaction. Publish Idle only after the task,
        // final session duration and runtime-checkpoint removal have all committed together.
        *self = Self::new();

        Ok(PersistedTimerExit {
            timer: exit,
            closed_session,
        })
    }
}

fn validate_timestamp(
    value: &str,
) -> Result<DateTime<chrono::FixedOffset>, LiveTaskCompletionError> {
    DateTime::parse_from_rfc3339(value).map_err(|_| LiveTaskCompletionError::InvalidTimestamp)
}

fn load_checkpoint_accounting(
    tx: &Transaction<'_>,
    expected_session_id: SessionId,
) -> Result<RuntimeAccountingCheckpoint, LiveTaskCompletionError> {
    let row: Option<(String, String)> = tx
        .query_row(
            "SELECT session_id, payload_json
             FROM timer_runtime_checkpoint
             WHERE singleton = 1",
            [],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()?;
    let Some((session_id, payload_json)) = row else {
        return Err(LiveTaskCompletionError::MissingCheckpoint);
    };
    let actual = SessionId::parse_str(&session_id)
        .map_err(|_| LiveTaskCompletionError::CorruptCheckpointSessionId(session_id))?;
    if actual != expected_session_id {
        return Err(LiveTaskCompletionError::CheckpointBindingMismatch {
            expected: expected_session_id,
            actual,
        });
    }

    let checkpoint: RuntimeAccountingCheckpoint = serde_json::from_str(&payload_json)?;
    if checkpoint.version != RUNTIME_CHECKPOINT_VERSION {
        return Err(LiveTaskCompletionError::UnsupportedCheckpointVersion(
            checkpoint.version,
        ));
    }
    Ok(checkpoint)
}

fn complete_task_and_close_session(
    conn: &mut Connection,
    task_id: TaskId,
    session_id: SessionId,
    work_elapsed_ms: u64,
    wall_time: &str,
) -> Result<SessionRecord, LiveTaskCompletionError> {
    let completion_time = validate_timestamp(wall_time)?;
    let final_work_seconds = work_elapsed_ms / 1_000;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;

    let task = get_task(&tx, task_id)?;
    if task.completed_at.is_some() {
        return Err(LiveTaskCompletionError::TaskAlreadyCompleted(task_id));
    }

    let current = get_session(&tx, session_id)?;
    if !current.is_open()
        || current.kind != SessionKind::Work
        || current.source != SessionSource::Focus
        || current.task_id != Some(task_id)
    {
        return Err(LiveTaskCompletionError::SessionBindingMismatch);
    }
    let started_at = DateTime::parse_from_rfc3339(&current.started_at)
        .map_err(|_| LiveTaskCompletionError::SessionBindingMismatch)?;
    let updated_at = DateTime::parse_from_rfc3339(&current.updated_at)
        .map_err(|_| LiveTaskCompletionError::SessionBindingMismatch)?;
    if completion_time < started_at || completion_time < updated_at {
        return Err(LiveTaskCompletionError::InvalidTimestamp);
    }

    let checkpoint = load_checkpoint_accounting(&tx, session_id)?;
    let current_duration = final_work_seconds
        .checked_sub(checkpoint.closed_work_seconds)
        .ok_or(LiveTaskCompletionError::DurationAccountingUnderflow)?;
    if current_duration < current.duration_seconds {
        return Err(LiveTaskCompletionError::DurationDecreased {
            stored_seconds: current.duration_seconds,
            attempted_seconds: current_duration,
        });
    }
    let duration_sql =
        i64::try_from(current_duration).map_err(|_| LiveTaskCompletionError::DurationOverflow)?;

    let closed = tx.execute(
        "UPDATE sessions
         SET ended_at = ?1, duration_seconds = ?2, updated_at = ?1
         WHERE id = ?3 AND ended_at IS NULL",
        params![wall_time, duration_sql, session_id.to_string()],
    )?;
    if closed != 1 {
        return Err(LiveTaskCompletionError::SessionBindingMismatch);
    }
    let checkpoint_deleted = tx.execute(
        "DELETE FROM timer_runtime_checkpoint
         WHERE singleton = 1 AND session_id = ?1",
        [session_id.to_string()],
    )?;
    if checkpoint_deleted != 1 {
        return Err(LiveTaskCompletionError::MissingCheckpoint);
    }

    complete_task_in_transaction(&tx, task_id, wall_time)?;

    let closed_session = get_session(&tx, session_id)?;
    tx.commit()?;
    Ok(closed_session)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::sessions::get_open_session;
    use crate::persistence::task_metadata::task_time_taken_seconds;
    use crate::persistence::tasks::{create_task, get_task};
    use crate::timer::TimerMode;

    const T0: &str = "2026-09-04T10:00:00Z";
    const T2_5: &str = "2026-09-04T10:00:02.500Z";
    const T3_5: &str = "2026-09-04T10:00:03.500Z";
    const T5: &str = "2026-09-04T10:00:05Z";

    fn fixture() -> (Connection, TaskId) {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let list = create_list(
            &mut conn,
            NewListInput {
                title: "Inbox".into(),
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
                title: "Live completion".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: Some(600),
            },
            T0,
        )
        .expect("create task");
        (conn, task.id)
    }

    #[test]
    fn done_commits_task_session_and_checkpoint_removal_together() {
        let (mut conn, task_id) = fixture();
        let mut runtime = TimerRuntime::new();
        runtime
            .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
            .unwrap();
        let session_id = runtime.open_session_id().unwrap();

        let completed = runtime.complete_task(&mut conn, 2_500, T2_5).unwrap();
        assert_eq!(completed.timer.reason, TaskExitReason::Done);
        assert_eq!(completed.timer.work_elapsed_ms, 2_500);
        assert_eq!(completed.closed_session.id, session_id);
        assert_eq!(completed.closed_session.duration_seconds, 2);
        assert_eq!(completed.closed_session.ended_at.as_deref(), Some(T2_5));
        assert_eq!(
            runtime.snapshot(2_500).unwrap().timer.state,
            TimerStateKind::Idle
        );
        assert!(get_open_session(&conn).unwrap().is_none());
        assert!(get_task(&conn, task_id).unwrap().completed_at.is_some());
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 2);
        let checkpoint_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM timer_runtime_checkpoint", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(checkpoint_count, 0);
    }

    #[test]
    fn completion_failure_rolls_back_task_session_checkpoint_and_runtime_publication() {
        let (mut conn, task_id) = fixture();
        let mut runtime = TimerRuntime::new();
        runtime
            .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
            .unwrap();
        let session_id = runtime.open_session_id().unwrap();
        conn.execute_batch(
            "CREATE TRIGGER fail_live_completion
             BEFORE UPDATE OF completed_at ON tasks
             WHEN NEW.completed_at IS NOT NULL
             BEGIN
                 SELECT RAISE(ABORT, 'forced completion failure');
             END;",
        )
        .unwrap();

        let error = runtime
            .complete_task(&mut conn, 2_500, T2_5)
            .expect_err("forced task mutation failure must roll back the whole boundary");
        assert!(matches!(error, LiveTaskCompletionError::Sqlite(_)));
        assert!(get_task(&conn, task_id).unwrap().completed_at.is_none());
        let open = get_open_session(&conn).unwrap().unwrap();
        assert_eq!(open.id, session_id);
        assert_eq!(open.duration_seconds, 0);
        let checkpoint_count: i64 = conn
            .query_row("SELECT COUNT(*) FROM timer_runtime_checkpoint", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(checkpoint_count, 1);
        let still_running = runtime.snapshot(2_500).unwrap();
        assert_eq!(still_running.timer.state, TimerStateKind::Running);
        assert_eq!(still_running.timer.work_elapsed_ms, 2_500);

        conn.execute_batch("DROP TRIGGER fail_live_completion;")
            .unwrap();
        let completed = runtime.complete_task(&mut conn, 3_500, T3_5).unwrap();
        assert_eq!(completed.closed_session.duration_seconds, 3);
        assert!(get_task(&conn, task_id).unwrap().completed_at.is_some());
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 3);
    }

    #[test]
    fn done_from_time_up_keeps_decision_delay_out_of_time_taken() {
        let (mut conn, task_id) = fixture();
        let mut runtime = TimerRuntime::new();
        runtime
            .start_task(
                &mut conn,
                task_id,
                TimerMode::EstCountdown { est_ms: 2_000 },
                0,
                T0,
            )
            .unwrap();

        let completed = runtime.complete_task(&mut conn, 5_000, T5).unwrap();
        assert_eq!(completed.timer.final_state, TimerStateKind::TimeUp);
        assert_eq!(completed.timer.work_elapsed_ms, 2_000);
        assert_eq!(completed.closed_session.duration_seconds, 2);
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 2);
    }
}
