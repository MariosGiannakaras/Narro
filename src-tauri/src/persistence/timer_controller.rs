use crate::domain::ids::TaskId;
use crate::domain::tasks::SetTaskTimeTakenInput;
use crate::domain::timer_events::{TimerSessionChange, TimerSessionPayload};
use crate::persistence::live_completion::LiveTaskCompletionError;
use crate::persistence::live_time_taken::LiveTimeTakenError;
use crate::timer::runtime::{TimerRuntime, TimerRuntimeError, TimerRuntimeSnapshot};
use crate::timer::{TimerMode, TimerStateKind};
use rusqlite::Connection;
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum TimerControllerError {
    Runtime(TimerRuntimeError),
    Completion(LiveTaskCompletionError),
    TimeTaken(LiveTimeTakenError),
    RevisionOverflow,
}

impl Display for TimerControllerError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Runtime(error) => Display::fmt(error, formatter),
            Self::Completion(error) => Display::fmt(error, formatter),
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

impl From<LiveTimeTakenError> for TimerControllerError {
    fn from(value: LiveTimeTakenError) -> Self {
        Self::TimeTaken(value)
    }
}

#[derive(Debug)]
pub struct TimerController {
    connection: Connection,
    runtime: TimerRuntime,
    revision: u64,
}

impl TimerController {
    pub fn recover(
        mut connection: Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<Self, TimerControllerError> {
        let runtime = TimerRuntime::recover(&mut connection, now_ms, wall_time)?;
        Ok(Self {
            connection,
            runtime,
            revision: 0,
        })
    }

    pub fn snapshot(&self, now_ms: u64) -> Result<TimerSessionPayload, TimerControllerError> {
        Ok(TimerSessionPayload::snapshot(
            self.revision,
            self.runtime.snapshot(now_ms)?,
        ))
    }

    pub fn start_task(
        &mut self,
        task_id: TaskId,
        mode: TimerMode,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        let next_revision = self.next_revision()?;
        let runtime = self
            .runtime
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
        let before = self.runtime.snapshot(now_ms)?;
        let after = self
            .runtime
            .advance(&mut self.connection, now_ms, wall_time)?;

        if before.timer.state == after.timer.state
            && before.open_session_id == after.open_session_id
        {
            return Ok(None);
        }

        Ok(Some(self.publish(
            next_revision,
            after.clone(),
            TimerSessionChange::AutomaticBoundary {
                previous_state: before.timer.state,
                current_state: after.timer.state,
                closed_session_id: (before.open_session_id != after.open_session_id)
                    .then_some(before.open_session_id)
                    .flatten(),
                opened_session_id: (before.open_session_id != after.open_session_id)
                    .then_some(after.open_session_id)
                    .flatten(),
            },
        )))
    }

    pub fn pause(
        &mut self,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        self.simple_transition(now_ms, wall_time, TimerSessionChange::Paused, |runtime, conn| {
            runtime.pause(conn, now_ms, wall_time)
        })
    }

    pub fn resume(
        &mut self,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        self.simple_transition(now_ms, wall_time, TimerSessionChange::Resumed, |runtime, conn| {
            runtime.resume(conn, now_ms, wall_time)
        })
    }

    pub fn extend(
        &mut self,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        self.simple_transition(now_ms, wall_time, TimerSessionChange::Extended, |runtime, conn| {
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
        let before = self.runtime.snapshot(now_ms)?;
        let closed_work_session_id = before
            .open_session_id
            .expect("active work runtime must have an open session");
        let runtime = self.runtime.start_manual_break(
            &mut self.connection,
            duration_ms,
            now_ms,
            wall_time,
        )?;
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
        let before = self.runtime.snapshot(now_ms)?;
        let task_id = before
            .timer
            .task_id
            .expect("active completion runtime must have a task");
        let completed = self
            .runtime
            .complete_task(&mut self.connection, now_ms, wall_time)?;
        let runtime = idle_runtime_snapshot();
        Ok(self.publish(
            next_revision,
            runtime,
            TimerSessionChange::TaskCompleted {
                task_id,
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
        let runtime = idle_runtime_snapshot();
        Ok(self.publish(
            next_revision,
            runtime,
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
        let switched = self.runtime.switch_task(
            &mut self.connection,
            task_id,
            mode,
            now_ms,
            wall_time,
        )?;
        let runtime = TimerRuntimeSnapshot {
            timer: switched.timer.current.clone(),
            open_session_id: Some(switched.current_session.id),
        };
        Ok(self.publish(
            next_revision,
            runtime,
            TimerSessionChange::TaskSwitched {
                previous_task_id: switched.timer.previous.task_id,
                current_task_id: switched.timer.current.task_id.expect("switch target task"),
                previous_session_id: switched.previous_session.id,
                current_session_id: switched.current_session.id,
            },
        ))
    }

    pub fn set_time_taken_while_paused(
        &mut self,
        input: SetTaskTimeTakenInput,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerSessionPayload, TimerControllerError> {
        let next_revision = self.next_revision()?;
        let updated = self.runtime.set_time_taken_while_paused(
            &mut self.connection,
            input,
            now_ms,
            wall_time,
        )?;
        let task_id = updated
            .runtime
            .timer
            .task_id
            .expect("paused live Time Taken update must remain bound to a task");
        Ok(self.publish(
            next_revision,
            updated.runtime,
            TimerSessionChange::TimeTakenRebased {
                task_id,
                total_seconds: updated.time_taken_seconds,
            },
        ))
    }

    fn simple_transition<F>(
        &mut self,
        now_ms: u64,
        wall_time: &str,
        change: TimerSessionChange,
        transition: F,
    ) -> Result<TimerSessionPayload, TimerControllerError>
    where
        F: FnOnce(&mut TimerRuntime, &mut Connection) -> Result<TimerRuntimeSnapshot, TimerRuntimeError>,
    {
        let next_revision = self.next_revision()?;
        let before = self.runtime.snapshot(now_ms)?;
        let after = transition(&mut self.runtime, &mut self.connection)?;
        if before == after {
            return Ok(TimerSessionPayload::snapshot(self.revision, after));
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
        let before = self.runtime.snapshot(now_ms)?;
        let closed_break_session_id = before
            .open_session_id
            .expect("active break runtime must have an open break session");
        let after = if skipped {
            self.runtime
                .skip_break(&mut self.connection, now_ms, wall_time)?
        } else {
            self.runtime
                .finish_break(&mut self.connection, now_ms, wall_time)?
        };
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
        TimerSessionPayload::changed(revision, runtime, change)
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
    use crate::persistence::tasks::create_task;

    const T0: &str = "2026-09-05T12:00:00Z";
    const T1: &str = "2026-09-05T12:01:00Z";
    const T2: &str = "2026-09-05T12:02:00Z";

    fn fixture() -> (Connection, TaskId, TaskId) {
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
        (connection, first.id, second.id)
    }

    #[test]
    fn successful_persisted_transitions_increment_revision_after_commit() {
        let (connection, task_id, _) = fixture();
        let mut controller = TimerController::recover(connection, 0, T0).unwrap();
        assert_eq!(controller.snapshot(0).unwrap().revision, 0);

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
        assert_eq!(task_time_taken_seconds(&controller.connection, task_id).unwrap(), 60);

        let rebased = controller
            .set_time_taken_while_paused(
                SetTaskTimeTakenInput { total_seconds: 30 },
                60_000,
                T1,
            )
            .unwrap();
        assert_eq!(rebased.revision, 3);
        assert!(matches!(
            rebased.change,
            Some(TimerSessionChange::TimeTakenRebased { total_seconds: 30, .. })
        ));

        controller.resume(60_000, T1).unwrap();
        let completed = controller.complete_task(90_000, T2).unwrap();
        assert_eq!(completed.revision, 5);
        assert_eq!(completed.runtime.timer.state, TimerStateKind::Idle);
        assert!(matches!(
            completed.change,
            Some(TimerSessionChange::TaskCompleted { task_id: id, .. }) if id == task_id
        ));
        assert_eq!(task_time_taken_seconds(&controller.connection, task_id).unwrap(), 60);
        assert!(get_open_session(&controller.connection).unwrap().is_none());
    }

    #[test]
    fn failed_transition_does_not_publish_or_consume_revision() {
        let (connection, _, _) = fixture();
        let mut controller = TimerController::recover(connection, 0, T0).unwrap();
        assert!(controller.pause(1_000, T1).is_err());
        assert_eq!(controller.revision, 0);
        assert_eq!(controller.snapshot(1_000).unwrap().revision, 0);
    }

    #[test]
    fn automatic_boundary_event_reports_state_and_session_replacement() {
        let (connection, task_id, _) = fixture();
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
    fn task_switch_event_carries_both_session_identities() {
        let (connection, first, second) = fixture();
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
