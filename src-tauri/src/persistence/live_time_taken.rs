use crate::domain::sessions::{SessionKind, SessionSource};
use crate::domain::tasks::{SetTaskTimeTakenInput, TaskRecord};
use crate::persistence::sessions::{get_session, SessionStoreError};
use crate::persistence::task_metadata::{
    set_task_time_taken_in_transaction, task_time_taken_seconds, TaskMetadataError,
};
use crate::persistence::timer_runtime::{load_runtime_checkpoint, TimerRuntimeStoreError};
use crate::timer::runtime::{TimerRuntime, TimerRuntimeError, TimerRuntimeSnapshot};
use crate::timer::TimerStateKind;
use rusqlite::{Connection, TransactionBehavior};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub struct LiveTimeTakenUpdate {
    pub runtime: TimerRuntimeSnapshot,
    pub task: TaskRecord,
    pub time_taken_seconds: u64,
}

#[derive(Debug)]
pub enum LiveTimeTakenError {
    Runtime(TimerRuntimeError),
    Metadata(TaskMetadataError),
    Store(TimerRuntimeStoreError),
    Session(SessionStoreError),
    Sqlite(rusqlite::Error),
    NotPaused(TimerStateKind),
    BindingMismatch,
}

impl Display for LiveTimeTakenError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Runtime(error) => Display::fmt(error, formatter),
            Self::Metadata(error) => Display::fmt(error, formatter),
            Self::Store(error) => Display::fmt(error, formatter),
            Self::Session(error) => Display::fmt(error, formatter),
            Self::Sqlite(error) => write!(formatter, "live Time Taken persistence failed: {error}"),
            Self::NotPaused(state) => write!(
                formatter,
                "live Time Taken can only be edited while paused; current timer state is {state:?}"
            ),
            Self::BindingMismatch => formatter.write_str(
                "live Time Taken runtime, open session and durable checkpoint bindings are inconsistent",
            ),
        }
    }
}

impl std::error::Error for LiveTimeTakenError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Runtime(error) => Some(error),
            Self::Metadata(error) => Some(error),
            Self::Store(error) => Some(error),
            Self::Session(error) => Some(error),
            Self::Sqlite(error) => Some(error),
            Self::NotPaused(_) | Self::BindingMismatch => None,
        }
    }
}

impl From<TimerRuntimeError> for LiveTimeTakenError {
    fn from(value: TimerRuntimeError) -> Self {
        Self::Runtime(value)
    }
}

impl From<TaskMetadataError> for LiveTimeTakenError {
    fn from(value: TaskMetadataError) -> Self {
        Self::Metadata(value)
    }
}

impl From<TimerRuntimeStoreError> for LiveTimeTakenError {
    fn from(value: TimerRuntimeStoreError) -> Self {
        Self::Store(value)
    }
}

impl From<SessionStoreError> for LiveTimeTakenError {
    fn from(value: SessionStoreError) -> Self {
        Self::Session(value)
    }
}

impl From<rusqlite::Error> for LiveTimeTakenError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl TimerRuntime {
    /// Rebase the user-facing Time Taken total for the active task while the timer is paused.
    ///
    /// Raw timer elapsed time and historical session durations remain monotonic accounting data.
    /// The edit updates the task's durable manual adjustment relative to the already-persisted work
    /// ledger, so future resumed work is added on top of the edited user baseline without snap-back.
    pub fn set_time_taken_while_paused(
        &mut self,
        conn: &mut Connection,
        input: SetTaskTimeTakenInput,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<LiveTimeTakenUpdate, LiveTimeTakenError> {
        let runtime = self.snapshot(now_ms)?;
        if !matches!(
            runtime.timer.state,
            TimerStateKind::Paused | TimerStateKind::OvertimePaused
        ) {
            return Err(LiveTimeTakenError::NotPaused(runtime.timer.state));
        }

        let task_id = runtime
            .timer
            .task_id
            .ok_or(LiveTimeTakenError::BindingMismatch)?;
        let session_id = runtime
            .open_session_id
            .ok_or(LiveTimeTakenError::BindingMismatch)?;

        let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
        let session = get_session(&tx, session_id)?;
        if !session.is_open()
            || session.kind != SessionKind::Work
            || session.source != SessionSource::Focus
            || session.task_id != Some(task_id)
        {
            return Err(LiveTimeTakenError::BindingMismatch);
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

        let task = set_task_time_taken_in_transaction(&tx, task_id, input, wall_time)?;
        let time_taken_seconds = task_time_taken_seconds(&tx, task_id)?;
        tx.commit()?;

        Ok(LiveTimeTakenUpdate {
            runtime,
            task,
            time_taken_seconds,
        })
    }
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
    use crate::persistence::tasks::{create_task, get_task};
    use crate::timer::TimerMode;

    const T0: &str = "2026-09-05T10:00:00Z";
    const T1: &str = "2026-09-05T10:01:00Z";
    const T15: &str = "2026-09-05T10:15:00Z";
    const T20: &str = "2026-09-05T10:20:00Z";
    const T25: &str = "2026-09-05T10:25:00Z";
    const T30: &str = "2026-09-05T10:30:00Z";
    const T35: &str = "2026-09-05T10:35:00Z";

    fn fixture() -> (Connection, crate::domain::ids::TaskId) {
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
                title: "Paused Time Taken".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: Some(1_800),
            },
            T0,
        )
        .expect("create task");
        (conn, task.id)
    }

    #[test]
    fn live_time_taken_edit_requires_paused_runtime() {
        let (mut conn, task_id) = fixture();
        let mut runtime = TimerRuntime::new();
        runtime
            .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
            .unwrap();

        let error = runtime
            .set_time_taken_while_paused(
                &mut conn,
                SetTaskTimeTakenInput { total_seconds: 30 },
                30_000,
                T1,
            )
            .expect_err("running live task must reject manual Time Taken edit");
        assert!(matches!(
            error,
            LiveTimeTakenError::NotPaused(TimerStateKind::Running)
        ));
        assert_eq!(
            get_task(&conn, task_id)
                .unwrap()
                .manual_time_adjustment_seconds,
            0
        );
    }

    #[test]
    fn paused_edit_rebases_effective_time_without_rewriting_raw_session_history() {
        let (mut conn, task_id) = fixture();
        let mut runtime = TimerRuntime::new();
        runtime
            .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
            .unwrap();
        runtime.pause(&mut conn, 900_000, T15).unwrap();

        let edited = runtime
            .set_time_taken_while_paused(
                &mut conn,
                SetTaskTimeTakenInput { total_seconds: 600 },
                900_000,
                T15,
            )
            .unwrap();
        assert_eq!(edited.runtime.timer.state, TimerStateKind::Paused);
        assert_eq!(edited.runtime.timer.work_elapsed_ms, 900_000);
        assert_eq!(edited.time_taken_seconds, 600);
        assert_eq!(edited.task.manual_time_adjustment_seconds, -300);
        assert_eq!(
            get_open_session(&conn).unwrap().unwrap().duration_seconds,
            900
        );

        runtime.resume(&mut conn, 1_800_000, T30).unwrap();
        runtime.pause(&mut conn, 2_100_000, T35).unwrap();
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 900);

        let completed = runtime.complete_task(&mut conn, 2_100_000, T35).unwrap();
        assert_eq!(completed.timer.work_elapsed_ms, 1_200_000);
        assert_eq!(completed.closed_session.duration_seconds, 1_200);
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 900);

        let sessions = sessions_for_task(&conn, task_id).unwrap();
        assert_eq!(sessions.len(), 1);
        assert_eq!(sessions[0].kind, SessionKind::Work);
        assert_eq!(sessions[0].duration_seconds, 1_200);
        assert_eq!(
            get_task(&conn, task_id)
                .unwrap()
                .manual_time_adjustment_seconds,
            -300
        );
    }

    #[test]
    fn paused_edit_survives_recovery_and_future_work() {
        let (mut conn, task_id) = fixture();
        let mut runtime = TimerRuntime::new();
        runtime
            .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
            .unwrap();
        runtime.pause(&mut conn, 900_000, T15).unwrap();
        runtime
            .set_time_taken_while_paused(
                &mut conn,
                SetTaskTimeTakenInput { total_seconds: 600 },
                900_000,
                T15,
            )
            .unwrap();

        let mut recovered = TimerRuntime::recover(&mut conn, 0, T20).unwrap();
        assert_eq!(
            recovered.snapshot(0).unwrap().timer.state,
            TimerStateKind::Paused
        );
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 600);

        recovered.resume(&mut conn, 0, T20).unwrap();
        let completed = recovered.complete_task(&mut conn, 300_000, T25).unwrap();
        assert_eq!(completed.timer.work_elapsed_ms, 1_200_000);
        assert_eq!(completed.closed_session.duration_seconds, 1_200);
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 900);
    }

    #[test]
    fn failed_paused_edit_rolls_back_and_leaves_runtime_unchanged() {
        let (mut conn, task_id) = fixture();
        let mut runtime = TimerRuntime::new();
        runtime
            .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
            .unwrap();
        runtime.pause(&mut conn, 60_000, T1).unwrap();
        conn.execute_batch(
            "CREATE TRIGGER fail_live_time_taken
             BEFORE UPDATE OF manual_time_adjustment_seconds ON tasks
             BEGIN
                 SELECT RAISE(ABORT, 'forced Time Taken failure');
             END;",
        )
        .unwrap();

        let error = runtime
            .set_time_taken_while_paused(
                &mut conn,
                SetTaskTimeTakenInput { total_seconds: 30 },
                60_000,
                T1,
            )
            .expect_err("forced metadata failure must roll back");
        assert!(matches!(
            error,
            LiveTimeTakenError::Metadata(TaskMetadataError::Sqlite(_))
        ));
        let snapshot = runtime.snapshot(60_000).unwrap();
        assert_eq!(snapshot.timer.state, TimerStateKind::Paused);
        assert_eq!(snapshot.timer.work_elapsed_ms, 60_000);
        assert_eq!(
            get_open_session(&conn).unwrap().unwrap().duration_seconds,
            60
        );
        assert_eq!(
            get_task(&conn, task_id)
                .unwrap()
                .manual_time_adjustment_seconds,
            0
        );
        assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 60);
    }
}
