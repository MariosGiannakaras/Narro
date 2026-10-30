use crate::domain::ids::{ListId, TaskId};
use crate::domain::tasks::SetTaskTimeTakenInput;
use crate::domain::timer_events::{TimerSessionChange, TimerSessionPayload};
use crate::persistence::live_completion::LiveTaskCompletionError;
use crate::persistence::live_time_taken::LiveTimeTakenError;
use crate::persistence::live_time_taken_projection::{
    BasisKey, TimeTakenInvalidation, TimeTakenProjectionCache,
};
use crate::persistence::task_metadata::task_time_taken_seconds;
use crate::timer::runtime::{
    LiveEstimateEditError, LiveEstimateEditInput, TimerRuntime, TimerRuntimeError,
    TimerRuntimeSnapshot,
};
use crate::timer::TimerMode;
use rusqlite::Connection;
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum TimerControllerError {
    Runtime(TimerRuntimeError),
    Completion(LiveTaskCompletionError),
    Estimate(LiveEstimateEditError),
    TimeTaken(LiveTimeTakenError),
    RevisionOverflow,
}

impl Display for TimerControllerError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Runtime(error) => Display::fmt(error, formatter),
            Self::Completion(error) => Display::fmt(error, formatter),
            Self::Estimate(error) => Display::fmt(error, formatter),
            Self::TimeTaken(error) => Display::fmt(error, formatter),
            Self::RevisionOverflow => {
                formatter.write_str("timer/session event revision reached its maximum value")
            }
        }
    }
}

impl std::error::Error for TimerControllerError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Runtime(error) => Some(error),
            Self::Completion(error) => Some(error),
            Self::Estimate(error) => Some(error),
            Self::TimeTaken(error) => Some(error),
            Self::RevisionOverflow => None,
        }
    }
}

impl From<TimerRuntimeError> for TimerControllerError {
    fn from(value: TimerRuntimeError) -> Self {
        Self::Runtime(value)
    }
}

impl From<LiveTaskCompletionError> for TimerControllerError {
    fn from(value: LiveTaskCompletionError) -> Self {
        Self::Completion(value)
    }
}

impl From<LiveEstimateEditError> for TimerControllerError {
    fn from(value: LiveEstimateEditError) -> Self {
        Self::Estimate(value)
    }
}

impl From<LiveTimeTakenError> for TimerControllerError {
    fn from(value: LiveTimeTakenError) -> Self {
        Self::TimeTaken(value)
    }
}

pub struct TimerController {
    connection: Connection,
    runtime: TimerRuntime,
    revision: u64,
    published_runtime: TimerRuntimeSnapshot,
    time_taken_cache: TimeTakenProjectionCache,
    time_taken_invalidation: TimeTakenInvalidation,
}

impl TimerController {
    pub fn recover(
        mut connection: Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<Self, TimerControllerError> {
        let runtime = TimerRuntime::recover(&mut connection, now_ms, wall_time)?;
        let published_runtime = runtime.snapshot(now_ms)?;
        let mut controller = Self {
            connection,
            runtime,
            revision: 0,
            published_runtime,
            time_taken_cache: TimeTakenProjectionCache::default(),
            time_taken_invalidation: TimeTakenInvalidation::default(),
        };
        controller.refresh_time_taken_basis();
        Ok(controller)
    }

    /// Return the last Rust-observed, persistence-coherent projection.
    ///
    /// This deliberately does not advance the timer from renderer-provided time. Automatic timer
    /// boundaries are applied by `advance`, then published. Renderers remain presentation-only.
    pub fn snapshot(&self) -> TimerSessionPayload {
        self.with_live_time_taken(TimerSessionPayload::snapshot(
            self.revision,
            self.published_runtime.clone(),
        ))
    }

    pub(crate) fn time_taken_invalidator(&self) -> TimeTakenInvalidation {
        self.time_taken_invalidation.clone()
    }

    fn time_taken_basis_key(&self) -> Option<BasisKey> {
        Some(BasisKey {
            task_id: self.published_runtime.timer.task_id?,
            session_id: self.published_runtime.open_session_id,
            timer_revision: self.revision,
            checkpoint_work_seconds: self.runtime.checkpointed_work_seconds(),
            history_revision: self.time_taken_invalidation.revision(),
        })
    }

    /// Refresh only on a committed boundary/history invalidation/checkpoint.
    /// A read failure belongs to the display projection, never rolls back a
    /// successful Timer mutation, and is retried on the next changed basis.
    fn refresh_time_taken_basis(&mut self) {
        let key = self.time_taken_basis_key();
        let connection = &self.connection;
        self.time_taken_cache.refresh(key, || {
            let key = key.ok_or("LIVE_TIME_TAKEN_UNAVAILABLE")?;
            task_time_taken_seconds(connection, key.task_id)
                .map_err(|_| "LIVE_TIME_TAKEN_UNAVAILABLE")
        });
    }

    fn with_live_time_taken(&self, mut payload: TimerSessionPayload) -> TimerSessionPayload {
        payload.live_time_taken = self.time_taken_cache.project(
            self.time_taken_basis_key(),
            payload.runtime.timer.work_elapsed_ms / 1_000,
        );
        payload
    }

    /// Force the already-authoritative runtime projection through the durable session/checkpoint
    /// boundary without consuming an event revision. Callers must first advance/report all due
    /// automatic boundaries to the same `now_ms`.
    pub(crate) fn checkpoint(
        &mut self,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<(), TimerControllerError> {
        let runtime = self
            .runtime
            .checkpoint(&mut self.connection, now_ms, wall_time)?;
        self.published_runtime = runtime;
        self.refresh_time_taken_basis();
        Ok(())
    }

    pub fn start_task(
        &mut self,
        task_id: TaskId,
        mode: TimerMode,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        let next_revision = self.next_revision()?;
        let runtime =
            self.runtime
                .start_task(&mut self.connection, task_id, mode, now_ms, wall_time)?;
        let session_id = runtime
            .open_session_id
            .expect("successful timer start must publish an open work session");
        Ok(self.publish(
            next_revision,
            runtime,
            TimerSessionChange::Started {
                task_id,
                session_id,
            },
        ))
    }

    pub fn advance(
        &mut self,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<Option<TimerSessionPayload>, TimerControllerError> {
        let next_revision = self.next_revision()?;
        let before = self.published_runtime.clone();
        let after = self
            .runtime
            .advance(&mut self.connection, now_ms, wall_time)?;

        let boundary_changed = before.timer.state != after.timer.state
            || before.open_session_id != after.open_session_id;
        if !boundary_changed {
            self.published_runtime = after;
            self.refresh_time_taken_basis();
            return Ok(None);
        }

        let closed_session_id = if before.open_session_id != after.open_session_id {
            before.open_session_id
        } else {
            None
        };
        let opened_session_id = if before.open_session_id != after.open_session_id {
            after.open_session_id
        } else {
            None
        };
        Ok(Some(self.publish(
            next_revision,
            after.clone(),
            TimerSessionChange::AutomaticBoundary {
                previous_state: before.timer.state,
                current_state: after.timer.state,
                closed_session_id,
                opened_session_id,
            },
        )))
    }

    pub fn pause(
        &mut self,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        self.simple_transition(TimerSessionChange::Paused, |runtime, conn| {
            runtime.pause(conn, now_ms, wall_time)
        })
    }

    pub fn resume(
        &mut self,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        self.simple_transition(TimerSessionChange::Resumed, |runtime, conn| {
            runtime.resume(conn, now_ms, wall_time)
        })
    }

    pub fn extend(
        &mut self,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        self.simple_transition(TimerSessionChange::Extended, |runtime, conn| {
            runtime.extend(conn, now_ms, wall_time)
        })
    }

    pub fn start_manual_break(
        &mut self,
        duration_ms: u64,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        let next_revision = self.next_revision()?;
        let closed_work_session_id = self.published_runtime.open_session_id;
        let runtime = self.runtime.start_manual_break(
            &mut self.connection,
            duration_ms,
            now_ms,
            wall_time,
        )?;
        let closed_work_session_id =
            closed_work_session_id.expect("successful break start must have closed a work session");
        let break_session_id = runtime
            .open_session_id
            .expect("successful break start must publish an open break session");
        Ok(self.publish(
            next_revision,
            runtime,
            TimerSessionChange::ManualBreakStarted {
                closed_work_session_id,
                break_session_id,
            },
        ))
    }

    pub fn finish_break(
        &mut self,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        self.break_exit(now_ms, wall_time, false)
    }

    pub fn skip_break(
        &mut self,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        self.break_exit(now_ms, wall_time, true)
    }

    pub fn complete_task(
        &mut self,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        let next_revision = self.next_revision()?;
        let completed = self
            .runtime
            .complete_task(&mut self.connection, now_ms, wall_time)?;
        Ok(self.publish(
            next_revision,
            idle_runtime_snapshot(),
            TimerSessionChange::TaskCompleted {
                task_id: completed.timer.task_id,
                closed_session_id: completed.closed_session.id,
            },
        ))
    }

    pub fn skip_task(
        &mut self,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        let next_revision = self.next_revision()?;
        let skipped = self
            .runtime
            .skip_task(&mut self.connection, now_ms, wall_time)?;
        Ok(self.publish(
            next_revision,
            idle_runtime_snapshot(),
            TimerSessionChange::TaskSkipped {
                task_id: skipped.timer.task_id,
                closed_session_id: skipped.closed_session.id,
            },
        ))
    }

    pub fn switch_task(
        &mut self,
        task_id: TaskId,
        mode: TimerMode,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        let next_revision = self.next_revision()?;
        let switched =
            self.runtime
                .switch_task(&mut self.connection, task_id, mode, now_ms, wall_time)?;
        let runtime = TimerRuntimeSnapshot {
            timer: switched.timer.current.clone(),
            open_session_id: Some(switched.current_session.id),
        };
        Ok(self.publish(
            next_revision,
            runtime,
            TimerSessionChange::TaskSwitched {
                previous_task_id: switched.timer.previous.task_id,
                current_task_id: switched
                    .timer
                    .current
                    .task_id
                    .expect("successful switch must publish a target task"),
                previous_session_id: switched.previous_session.id,
                current_session_id: switched.current_session.id,
            },
        ))
    }

    pub fn set_estimate_while_paused(
        &mut self,
        expected_task_id: TaskId,
        expected_list_id: ListId,
        expected_est_seconds: Option<u32>,
        est_seconds: Option<u32>,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        let next_revision = self.next_revision()?;
        let updated = self.runtime.set_estimate_while_paused(
            &mut self.connection,
            LiveEstimateEditInput {
                expected_task_id,
                expected_list_id,
                expected_est_seconds,
                est_seconds,
            },
            now_ms,
            wall_time,
        )?;
        Ok(self.publish(
            next_revision,
            updated.runtime,
            TimerSessionChange::EstimateRebased {
                task_id: expected_task_id,
                est_seconds: updated.task.est_seconds,
            },
        ))
    }

    pub fn set_time_taken_while_paused(
        &mut self,
        expected_task_id: TaskId,
        expected_total_seconds: u64,
        input: SetTaskTimeTakenInput,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        let next_revision = self.next_revision()?;
        let updated = self.runtime.set_time_taken_while_paused(
            &mut self.connection,
            expected_task_id,
            expected_total_seconds,
            input,
            now_ms,
            wall_time,
        )?;
        Ok(self.publish(
            next_revision,
            updated.runtime,
            TimerSessionChange::TimeTakenRebased {
                task_id: expected_task_id,
                total_seconds: updated.time_taken_seconds,
            },
        ))
    }

    fn simple_transition<F>(
        &mut self,
        change: TimerSessionChange,
        transition: F,
    ) -> Result<TimerSessionPayload, TimerControllerError>
    where
        F: FnOnce(
            &mut TimerRuntime,
            &mut Connection,
        ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError>,
    {
        let next_revision = self.next_revision()?;
        let before = self.published_runtime.clone();
        let after = transition(&mut self.runtime, &mut self.connection)?;
        if before.timer.state == after.timer.state
            && before.open_session_id == after.open_session_id
        {
            self.published_runtime = after.clone();
            self.refresh_time_taken_basis();
            return Ok(
                self.with_live_time_taken(TimerSessionPayload::snapshot(self.revision, after))
            );
        }
        Ok(self.publish(next_revision, after, change))
    }

    fn break_exit(
        &mut self,
        now_ms: u64,
        wall_time: &str,
        skipped: bool,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        let next_revision = self.next_revision()?;
        let closed_break_session_id = self.published_runtime.open_session_id;
        let after = if skipped {
            self.runtime
                .skip_break(&mut self.connection, now_ms, wall_time)?
        } else {
            self.runtime
                .finish_break(&mut self.connection, now_ms, wall_time)?
        };
        let closed_break_session_id = closed_break_session_id
            .expect("successful break exit must have closed a break session");
        let work_session_id = after
            .open_session_id
            .expect("successful break exit must publish an open work session");
        let change = if skipped {
            TimerSessionChange::BreakSkipped {
                closed_break_session_id,
                work_session_id,
            }
        } else {
            TimerSessionChange::BreakFinished {
                closed_break_session_id,
                work_session_id,
            }
        };
        Ok(self.publish(next_revision, after, change))
    }

    fn next_revision(&self) -> Result<u64, TimerControllerError> {
        self.revision
            .checked_add(1)
            .ok_or(TimerControllerError::RevisionOverflow)
    }

    fn publish(
        &mut self,
        revision: u64,
        runtime: TimerRuntimeSnapshot,
        change: TimerSessionChange,
    ) -> TimerSessionPayload {
        self.revision = revision;
        self.published_runtime = runtime.clone();
        self.refresh_time_taken_basis();
        self.with_live_time_taken(TimerSessionPayload::changed(revision, runtime, change))
    }
}

fn idle_runtime_snapshot() -> TimerRuntimeSnapshot {
    TimerRuntime::new()
        .snapshot(0)
        .expect("new idle timer runtime snapshot must be infallible")
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
    use crate::timer::TimerStateKind;

    const T0: &str = "2026-09-05T12:00:00Z";
    const T1: &str = "2026-09-05T12:01:00Z";
    const T2: &str = "2026-09-05T12:02:00Z";

    fn displayed_taken(controller: &TimerController) -> String {
        controller
            .snapshot()
            .live_time_taken
            .expect("active native projection")
            .seconds
            .expect("valid display basis")
    }

    #[test]
    fn live_taken_advances_without_adding_checkpoints_twice_or_losing_history() {
        let (mut conn, _, task, _) = fixture();
        crate::persistence::sessions::create_manual_work_session(
            &mut conn,
            task,
            "2026-09-05T11:58:00Z",
            T0,
            90,
            T0,
        )
        .unwrap();
        let mut c = TimerController::recover(conn, 0, T0).unwrap();
        c.start_task(task, TimerMode::CountUp, 0, T0).unwrap();
        assert_eq!(displayed_taken(&c), "90");
        for (ms, total) in [
            (999, "90"),
            (1000, "91"),
            (29999, "119"),
            (30000, "120"),
            (50000, "140"),
        ] {
            c.advance(ms, T1).unwrap();
            assert_eq!(displayed_taken(&c), total);
        }
        c.checkpoint(50000, T1).unwrap();
        assert_eq!(displayed_taken(&c), "140");
        c.advance(51000, T1).unwrap();
        assert_eq!(displayed_taken(&c), "141");
    }

    #[test]
    fn live_taken_manual_rebase_break_pause_and_recovery_keep_the_native_basis() {
        let (conn, _, task, _) = fixture();
        let mut c = TimerController::recover(conn, 0, T0).unwrap();
        c.start_task(task, TimerMode::CountUp, 0, T0).unwrap();
        c.pause(50000, T1).unwrap();
        c.set_time_taken_while_paused(
            task,
            50,
            SetTaskTimeTakenInput { total_seconds: 5 },
            50000,
            T1,
        )
        .unwrap();
        assert_eq!(displayed_taken(&c), "5");
        c.resume(60000, T1).unwrap();
        c.advance(61000, T1).unwrap();
        assert_eq!(displayed_taken(&c), "6");
        c.start_manual_break(60000, 62000, T1).unwrap();
        assert_eq!(displayed_taken(&c), "7");
        c.advance(70000, T2).unwrap();
        assert_eq!(displayed_taken(&c), "7");
        c.skip_break(71000, T2).unwrap();
        c.advance(72000, T2).unwrap();
        assert_eq!(displayed_taken(&c), "8");
        c.pause(72000, T2).unwrap();
        let mut recovered = TimerController::recover(c.connection, 0, T2).unwrap();
        assert_eq!(displayed_taken(&recovered), "8");
        recovered.advance(100000, T2).unwrap();
        assert_eq!(displayed_taken(&recovered), "8");
        recovered.resume(100000, T2).unwrap();
        recovered.advance(101000, T2).unwrap();
        assert_eq!(displayed_taken(&recovered), "9");
    }

    #[test]
    fn external_history_invalidates_only_after_commit_and_never_polls_on_snapshot() {
        let (conn, _, task, _) = fixture();
        let mut c = TimerController::recover(conn, 0, T0).unwrap();
        c.start_task(task, TimerMode::CountUp, 0, T0).unwrap();
        c.advance(1000, T0).unwrap();
        let changed = c.time_taken_invalidator();
        let manual = crate::persistence::sessions::create_manual_work_session(
            &mut c.connection,
            task,
            "2026-09-05T11:58:00Z",
            T0,
            90,
            T0,
        )
        .unwrap();
        changed.invalidate();
        assert!(c.snapshot().live_time_taken.unwrap().seconds.is_none());
        c.advance(2000, T0).unwrap();
        assert_eq!(displayed_taken(&c), "92");
        crate::persistence::sessions::edit_closed_session_if_expected(
            &mut c.connection,
            manual.id,
            T0,
            "2026-09-05T11:58:00Z",
            T0,
            60,
            T1,
        )
        .unwrap();
        changed.invalidate();
        c.advance(2250, T1).unwrap();
        assert_eq!(displayed_taken(&c), "62");
        crate::persistence::sessions::delete_closed_session_if_expected(
            &mut c.connection,
            manual.id,
            T1,
        )
        .unwrap();
        changed.invalidate();
        c.advance(2500, T1).unwrap();
        assert_eq!(displayed_taken(&c), "2");
        // Renaming the table makes any accidental hot snapshot query fail.
        c.connection
            .execute_batch("ALTER TABLE sessions RENAME TO projection_unavailable_sessions;")
            .unwrap();
        for _ in 0..20 {
            assert_eq!(displayed_taken(&c), "2");
        }
        c.advance(3000, T0).unwrap();
        assert_eq!(displayed_taken(&c), "3");
        changed.invalidate();
        c.advance(4000, T0).unwrap();
        let p = c.snapshot();
        assert_eq!(p.runtime.timer.state, TimerStateKind::Running);
        assert_eq!(
            p.live_time_taken.unwrap().error.as_deref(),
            Some("LIVE_TIME_TAKEN_UNAVAILABLE")
        );
    }

    #[test]
    fn task_switch_completion_and_rejected_rebase_do_not_alias_the_display_total() {
        let (conn, _, first, second) = fixture();
        let mut c = TimerController::recover(conn, 0, T0).unwrap();
        c.start_task(first, TimerMode::CountUp, 0, T0).unwrap();
        c.advance(1200, T0).unwrap();
        c.switch_task(second, TimerMode::EstCountdown { est_ms: 2000 }, 1200, T0)
            .unwrap();
        assert_eq!(displayed_taken(&c), "0");
        c.advance(3200, T1).unwrap();
        assert_eq!(displayed_taken(&c), "2");
        c.extend(3200, T1).unwrap();
        c.advance(4200, T1).unwrap();
        assert_eq!(displayed_taken(&c), "3");
        c.pause(4200, T1).unwrap();
        let before = c.snapshot();
        assert!(c
            .set_time_taken_while_paused(
                first,
                3,
                SetTaskTimeTakenInput { total_seconds: 5 },
                4200,
                T1
            )
            .is_err());
        assert_eq!(c.snapshot(), before);
        c.complete_task(4200, T1).unwrap();
        assert!(c.snapshot().live_time_taken.is_none());
        assert_eq!(task_time_taken_seconds(&c.connection, second).unwrap(), 3);
    }

    #[test]
    fn pomodoro_boundaries_never_add_break_time_or_duplicate_closed_work() {
        let (conn, _, task, _) = fixture();
        let mut c = TimerController::recover(conn, 0, T0).unwrap();
        c.start_task(
            task,
            TimerMode::Pomodoro {
                work_ms: 2000,
                break_ms: 1000,
            },
            0,
            T0,
        )
        .unwrap();
        for (ms, total) in [
            (1000, "1"),
            (2000, "2"),
            (2500, "2"),
            (3000, "2"),
            (4000, "3"),
            (5000, "4"),
        ] {
            c.advance(ms, T1).unwrap();
            assert_eq!(displayed_taken(&c), total);
        }
    }

    fn fixture() -> (Connection, ListId, TaskId, TaskId) {
        let mut connection = Connection::open_in_memory().unwrap();
        run_migrations(&mut connection).unwrap();
        let list = create_list(
            &mut connection,
            NewListInput {
                title: "Inbox".into(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .unwrap();
        let first = create_task(
            &mut connection,
            NewTaskInput {
                list_id: list.id,
                title: "First".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: Some(120),
            },
            T0,
        )
        .unwrap();
        let second = create_task(
            &mut connection,
            NewTaskInput {
                list_id: list.id,
                title: "Second".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            T0,
        )
        .unwrap();
        (connection, list.id, first.id, second.id)
    }

    #[test]
    fn successful_persisted_transitions_increment_revision_after_commit() {
        let (connection, list_id, task_id, _) = fixture();
        let mut controller = TimerController::recover(connection, 0, T0).unwrap();
        assert_eq!(controller.snapshot().revision, 0);

        let started = controller
            .start_task(task_id, TimerMode::CountUp, 0, T0)
            .unwrap();
        assert_eq!(started.revision, 1);
        assert!(matches!(
            started.change,
            Some(TimerSessionChange::Started { task_id: id, .. }) if id == task_id
        ));

        let paused = controller.pause(60_000, T1).unwrap();
        assert_eq!(paused.revision, 2);
        assert_eq!(paused.runtime.timer.state, TimerStateKind::Paused);
        assert_eq!(
            task_time_taken_seconds(&controller.connection, task_id).unwrap(),
            60
        );

        let estimate = controller
            .set_estimate_while_paused(task_id, list_id, Some(120), Some(180), 60_000, T1)
            .unwrap();
        assert_eq!(estimate.revision, 3);
        assert!(matches!(
            estimate.change,
            Some(TimerSessionChange::EstimateRebased {
                task_id: id,
                est_seconds: Some(180),
            }) if id == task_id
        ));
        assert_eq!(
            get_task(&controller.connection, task_id)
                .unwrap()
                .est_seconds,
            Some(180)
        );

        let rebased = controller
            .set_time_taken_while_paused(
                task_id,
                60,
                SetTaskTimeTakenInput { total_seconds: 30 },
                60_000,
                T1,
            )
            .unwrap();
        assert_eq!(rebased.revision, 4);
        assert!(matches!(
            rebased.change,
            Some(TimerSessionChange::TimeTakenRebased {
                total_seconds: 30,
                ..
            })
        ));

        controller.resume(60_000, T1).unwrap();
        let completed = controller.complete_task(90_000, T2).unwrap();
        assert_eq!(completed.revision, 6);
        assert_eq!(completed.runtime.timer.state, TimerStateKind::Idle);
        assert!(matches!(
            completed.change,
            Some(TimerSessionChange::TaskCompleted { task_id: id, .. }) if id == task_id
        ));
        assert_eq!(
            task_time_taken_seconds(&controller.connection, task_id).unwrap(),
            60
        );
        assert!(get_open_session(&controller.connection).unwrap().is_none());
    }

    #[test]
    fn forced_checkpoint_does_not_consume_revision_or_publish_a_semantic_change() {
        let (connection, _, task_id, _) = fixture();
        let mut controller = TimerController::recover(connection, 0, T0).unwrap();
        controller
            .start_task(task_id, TimerMode::CountUp, 0, T0)
            .unwrap();

        controller.checkpoint(5_000, T1).unwrap();
        let snapshot = controller.snapshot();
        assert_eq!(snapshot.revision, 1);
        assert_eq!(snapshot.runtime.timer.state, TimerStateKind::Running);
        assert_eq!(snapshot.runtime.timer.work_elapsed_ms, 5_000);
        assert_eq!(
            get_open_session(&controller.connection)
                .unwrap()
                .unwrap()
                .duration_seconds,
            5
        );
    }

    #[test]
    fn failed_transition_does_not_publish_or_consume_revision() {
        let (connection, _, _, _) = fixture();
        let mut controller = TimerController::recover(connection, 0, T0).unwrap();
        assert!(controller.pause(1_000, T1).is_err());
        assert_eq!(controller.revision, 0);
        assert_eq!(controller.snapshot().revision, 0);
    }

    #[test]
    fn invalid_session_lifecycle_commands_return_errors_without_consuming_revision() {
        let (connection, _, _, _) = fixture();
        let mut controller = TimerController::recover(connection, 0, T0).unwrap();

        assert!(controller.start_manual_break(60_000, 1_000, T1).is_err());
        assert!(controller.finish_break(1_000, T1).is_err());
        assert!(controller.skip_break(1_000, T1).is_err());
        assert!(controller.complete_task(1_000, T1).is_err());
        assert!(controller.skip_task(1_000, T1).is_err());
        assert_eq!(controller.revision, 0);
        assert_eq!(controller.snapshot().revision, 0);
        assert_eq!(
            controller.snapshot().runtime.timer.state,
            TimerStateKind::Idle
        );
    }

    #[test]
    fn automatic_boundary_event_uses_last_persisted_projection_not_a_renderer_projection() {
        let (connection, _, task_id, _) = fixture();
        let mut controller = TimerController::recover(connection, 0, T0).unwrap();
        let started = controller
            .start_task(
                task_id,
                TimerMode::Pomodoro {
                    work_ms: 2_000,
                    break_ms: 5_000,
                },
                0,
                T0,
            )
            .unwrap();
        let work_session = started.runtime.open_session_id.unwrap();

        assert_eq!(
            controller.snapshot().runtime.timer.state,
            TimerStateKind::Running
        );
        assert_eq!(controller.snapshot().revision, 1);

        let event = controller
            .advance(2_000, T1)
            .unwrap()
            .expect("Pomodoro boundary should publish an event");
        assert_eq!(event.revision, 2);
        assert_eq!(event.runtime.timer.state, TimerStateKind::Break);
        let break_session = event.runtime.open_session_id.unwrap();
        assert_ne!(work_session, break_session);
        assert!(matches!(
            event.change,
            Some(TimerSessionChange::AutomaticBoundary {
                previous_state: TimerStateKind::Running,
                current_state: TimerStateKind::Break,
                closed_session_id: Some(closed),
                opened_session_id: Some(opened),
            }) if closed == work_session && opened == break_session
        ));
    }

    #[test]
    fn checkpoint_only_advance_refreshes_projection_without_consuming_revision() {
        let (connection, _, task_id, _) = fixture();
        let mut controller = TimerController::recover(connection, 0, T0).unwrap();
        controller
            .start_task(task_id, TimerMode::CountUp, 0, T0)
            .unwrap();

        assert!(controller.advance(31_000, T1).unwrap().is_none());
        let snapshot = controller.snapshot();
        assert_eq!(snapshot.revision, 1);
        assert_eq!(snapshot.runtime.timer.state, TimerStateKind::Running);
        assert_eq!(snapshot.runtime.timer.work_elapsed_ms, 31_000);
    }

    #[test]
    fn task_switch_event_carries_both_session_identities() {
        let (connection, _, first, second) = fixture();
        let mut controller = TimerController::recover(connection, 0, T0).unwrap();
        let started = controller
            .start_task(first, TimerMode::CountUp, 0, T0)
            .unwrap();
        let first_session = started.runtime.open_session_id.unwrap();

        let switched = controller
            .switch_task(second, TimerMode::CountUp, 30_000, T1)
            .unwrap();
        let second_session = switched.runtime.open_session_id.unwrap();
        assert_eq!(switched.revision, 2);
        assert!(matches!(
            switched.change,
            Some(TimerSessionChange::TaskSwitched {
                previous_task_id,
                current_task_id,
                previous_session_id,
                current_session_id,
            }) if previous_task_id == first
                && current_task_id == second
                && previous_session_id == first_session
                && current_session_id == second_session
        ));
    }
}
