use crate::domain::ids::{SessionId, TaskId};
use crate::domain::sessions::{SessionKind, SessionRecord, SessionSource};
use crate::persistence::sessions::get_session;
use crate::persistence::tasks::{complete_task_in_transaction, get_task, TaskStoreError};
use crate::persistence::timer_runtime::{
    close_session_and_clear_runtime_in_transaction, load_runtime_checkpoint, TimerRuntimeStoreError,
};
use crate::timer::runtime::{PersistedTimerExit, TimerRuntime, TimerRuntimeError};
use crate::timer::{TaskExitReason, TimerAction, TimerError, TimerExit, TimerStateKind};
use rusqlite::{Connection, TransactionBehavior};
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
    Store(TimerRuntimeStoreError),
    Task(TaskStoreError),
    Sqlite(rusqlite::Error),
    CheckpointJson(serde_json::Error),
    TaskAlreadyCompleted(TaskId),
    UnsupportedCheckpointVersion(u32),
    SessionBindingMismatch,
    DurationAccountingUnderflow,
}

impl Display for LiveTaskCompletionError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Runtime(error) => Display::fmt(error, formatter),
            Self::Store(error) => Display::fmt(error, formatter),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::Sqlite(error) => {
                write!(
                    formatter,
                    "live task completion persistence failed: {error}"
                )
            }
            Self::CheckpointJson(error) => {
                write!(
                    formatter,
                    "timer runtime checkpoint JSON is invalid: {error}"
                )
            }
            Self::TaskAlreadyCompleted(id) => {
                write!(formatter, "live task is already completed: {id}")
            }
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
        }
    }
}

impl std::error::Error for LiveTaskCompletionError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Runtime(error) => Some(error),
            Self::Store(error) => Some(error),
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

impl From<TimerRuntimeStoreError> for LiveTaskCompletionError {
    fn from(value: TimerRuntimeStoreError) -> Self {
        Self::Store(value)
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

fn complete_task_and_close_session(
    conn: &mut Connection,
    task_id: TaskId,
    session_id: SessionId,
    work_elapsed_ms: u64,
    wall_time: &str,
) -> Result<SessionRecord, LiveTaskCompletionError> {
    let final_work_seconds = work_elapsed_ms / 1_000;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;

    let task = get_task(&tx, task_id)?;
    if task.completed_at.is_some() {
        return Err(LiveTaskCompletionError::TaskAlreadyCompleted(task_id));
    }

    let current = get_session(&tx, session_id).map_err(TimerRuntimeStoreError::from)?;
    if !current.is_open()
        || current.kind != SessionKind::Work
        || current.source != SessionSource::Focus
        || current.task_id != Some(task_id)
    {
        return Err(LiveTaskCompletionError::SessionBindingMismatch);
    }

    let checkpoint =
        load_runtime_checkpoint(&tx)?.ok_or(TimerRuntimeStoreError::MissingCheckpoint)?;
    if checkpoint.session_id != session_id {
        return Err(TimerRuntimeStoreError::CheckpointBindingMismatch {
            expected: session_id,
            actual: checkpoint.session_id,
        }
        .into());
    }
    let accounting: RuntimeAccountingCheckpoint = serde_json::from_str(&checkpoint.payload_json)?;
    if accounting.version != RUNTIME_CHECKPOINT_VERSION {
        return Err(LiveTaskCompletionError::UnsupportedCheckpointVersion(
            accounting.version,
        ));
    }
    let current_duration = final_work_seconds
        .checked_sub(accounting.closed_work_seconds)
        .ok_or(LiveTaskCompletionError::DurationAccountingUnderflow)?;

    let closed_session = close_session_and_clear_runtime_in_transaction(
        &tx,
        session_id,
        current_duration,
        wall_time,
    )?;
    complete_task_in_transaction(&tx, task_id, wall_time)?;

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
    use crate::persistence::sessions::{get_open_session, sessions_for_task};
    use crate::persistence::task_metadata::task_time_taken_seconds;
    use crate::persistence::tasks::{create_task, get_task};
    use crate::timer::TimerMode;

    const T0: &str = "2026-09-04T10:00:00Z";
    const T2_5: &str = "2026-09-04T10:00:02.500Z";
    const T3_5: &str = "2026-09-04T10:00:03.500Z";
    const T5: &str = "2026-09-04T10:00:05Z";
    const T1_30: &str = "2026-09-04T10:01:30Z";
    const T2_30: &str = "2026-09-04T10:02:30Z";
    const T3_30: &str = "2026-09-04T10:03:30Z";
    const T15: &str = "2026-09-04T10:15:00Z";
    const T30: &str = "2026-09-04T10:30:00Z";
    const T45: &str = "2026-09-04T10:45:00Z";

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

    #[test]
    fn pause_wait_resume_then_done_persists_exactly_the_two_work_segments() {
        let (mut conn, task_id) = fixture();
        let mut runtime = TimerRuntime::new();
        runtime
            .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
            .unwrap();

        runtime.pause(&mut conn, 900_000, T15).unwrap();
        runtime.resume(&mut conn, 1_800_000, T30).unwrap();
        let completed = runtime
            .complete_task(&mut conn, 2_700_000, T45)
            .unwrap();

        assert_eq!(completed.timer.work_elapsed_ms, 1_800_000);
        assert_eq!(completed.closed_session.duration_seconds, 1_800);
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 1_800);
    }

    #[test]
    fn done_after_break_uses_prior_closed_work_without_double_counting() {
        let (mut conn, task_id) = fixture();
        let mut runtime = TimerRuntime::new();
        runtime
            .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
            .unwrap();
        let first_work_session = runtime.open_session_id().unwrap();

        let on_break = runtime
            .start_manual_break(&mut conn, 60_000, 90_000, T1_30)
            .unwrap();
        assert_eq!(on_break.timer.state, TimerStateKind::Break);
        let break_session = runtime.open_session_id().unwrap();
        assert_ne!(break_session, first_work_session);

        let resumed = runtime.advance(&mut conn, 150_000, T2_30).unwrap();
        assert_eq!(resumed.timer.state, TimerStateKind::Running);
        let final_work_session = runtime.open_session_id().unwrap();
        assert_ne!(final_work_session, break_session);

        let completed = runtime
            .complete_task(&mut conn, 210_000, T3_30)
            .unwrap();
        assert_eq!(completed.timer.work_elapsed_ms, 150_000);
        assert_eq!(completed.closed_session.id, final_work_session);
        assert_eq!(completed.closed_session.duration_seconds, 60);

        let sessions = sessions_for_task(&conn, task_id).unwrap();
        assert_eq!(
            sessions
                .iter()
                .map(|session| (session.kind, session.duration_seconds))
                .collect::<Vec<_>>(),
            vec![
                (SessionKind::Work, 90),
                (SessionKind::Break, 60),
                (SessionKind::Work, 60),
            ]
        );
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 150);
    }
}
