use crate::domain::ids::{SessionId, TaskId};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TimerPhase {
    Idle,
    Running,
    Paused,
    Break,
    TimeUp,
    Overtime,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TimerDisplayMode {
    EstCountdown,
    CountUp,
    Overtime,
    BreakElapsed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum WorkMode {
    Regular,
    Overtime,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimerSnapshot {
    pub phase: TimerPhase,
    pub task_id: Option<TaskId>,
    pub work_session_id: Option<SessionId>,
    pub est_seconds: Option<u32>,
    pub actual_work_seconds: u64,
    pub display_mode: Option<TimerDisplayMode>,
    pub display_seconds: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FinishedWork {
    pub task_id: TaskId,
    pub work_session_id: SessionId,
    pub actual_work_seconds: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SwitchedWork {
    pub finished: FinishedWork,
    pub next_work_session_id: SessionId,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TimerError {
    AlreadyActive,
    NoActiveTask,
    InvalidEstimate,
    InvalidTransition {
        action: &'static str,
        phase: TimerPhase,
    },
    TimeWentBackwards,
    DurationOverflow,
}

impl Display for TimerError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::AlreadyActive => formatter.write_str("a timer task is already active"),
            Self::NoActiveTask => formatter.write_str("there is no active timer task"),
            Self::InvalidEstimate => formatter.write_str("task EST must be greater than zero"),
            Self::InvalidTransition { action, phase } => {
                write!(formatter, "cannot {action} while timer phase is {phase:?}")
            }
            Self::TimeWentBackwards => {
                formatter.write_str("timer transition time cannot move backwards")
            }
            Self::DurationOverflow => formatter.write_str("timer duration arithmetic overflow"),
        }
    }
}

impl std::error::Error for TimerError {}

#[derive(Debug, Clone)]
pub struct TimerState {
    phase: TimerPhase,
    task_id: Option<TaskId>,
    work_session_id: Option<SessionId>,
    est_seconds: Option<u32>,
    accumulated_work_seconds: u64,
    running_since: Option<DateTime<Utc>>,
    break_started_at: Option<DateTime<Utc>>,
    resume_mode: WorkMode,
    last_transition_at: Option<DateTime<Utc>>,
}

impl Default for TimerState {
    fn default() -> Self {
        Self::new()
    }
}

impl TimerState {
    pub const fn new() -> Self {
        Self {
            phase: TimerPhase::Idle,
            task_id: None,
            work_session_id: None,
            est_seconds: None,
            accumulated_work_seconds: 0,
            running_since: None,
            break_started_at: None,
            resume_mode: WorkMode::Regular,
            last_transition_at: None,
        }
    }

    pub fn phase(&self) -> TimerPhase {
        self.phase
    }

    pub fn start(
        &mut self,
        task_id: TaskId,
        est_seconds: Option<u32>,
        now: DateTime<Utc>,
    ) -> Result<SessionId, TimerError> {
        if self.phase != TimerPhase::Idle {
            return Err(TimerError::AlreadyActive);
        }
        if matches!(est_seconds, Some(0)) {
            return Err(TimerError::InvalidEstimate);
        }

        let session_id = SessionId::generate();
        self.phase = TimerPhase::Running;
        self.task_id = Some(task_id);
        self.work_session_id = Some(session_id);
        self.est_seconds = est_seconds;
        self.accumulated_work_seconds = 0;
        self.running_since = Some(now);
        self.break_started_at = None;
        self.resume_mode = WorkMode::Regular;
        self.last_transition_at = Some(now);
        Ok(session_id)
    }

    pub fn advance(&mut self, now: DateTime<Utc>) -> Result<TimerSnapshot, TimerError> {
        self.validate_now(now)?;
        if self.phase == TimerPhase::Running {
            if let Some(est_seconds) = self.est_seconds {
                let effective = self.effective_work_seconds(now)?;
                if effective >= u64::from(est_seconds) {
                    self.accumulated_work_seconds = u64::from(est_seconds);
                    self.running_since = None;
                    self.phase = TimerPhase::TimeUp;
                    self.last_transition_at = Some(now);
                }
            }
        }
        self.snapshot(now)
    }

    pub fn pause(&mut self, now: DateTime<Utc>) -> Result<TimerSnapshot, TimerError> {
        self.validate_now(now)?;
        match self.phase {
            TimerPhase::Paused => return self.snapshot(now),
            TimerPhase::Running => self.checkpoint_running(now, WorkMode::Regular)?,
            TimerPhase::Overtime => self.checkpoint_running(now, WorkMode::Overtime)?,
            phase => {
                return Err(TimerError::InvalidTransition {
                    action: "pause",
                    phase,
                })
            }
        }
        self.phase = TimerPhase::Paused;
        self.last_transition_at = Some(now);
        self.snapshot(now)
    }

    pub fn resume(&mut self, now: DateTime<Utc>) -> Result<TimerSnapshot, TimerError> {
        self.validate_now(now)?;
        match self.phase {
            TimerPhase::Running | TimerPhase::Overtime => return self.snapshot(now),
            TimerPhase::Paused => {
                self.phase = match self.resume_mode {
                    WorkMode::Regular => TimerPhase::Running,
                    WorkMode::Overtime => TimerPhase::Overtime,
                };
                self.running_since = Some(now);
                self.last_transition_at = Some(now);
                self.snapshot(now)
            }
            phase => Err(TimerError::InvalidTransition {
                action: "resume",
                phase,
            }),
        }
    }

    pub fn start_break(&mut self, now: DateTime<Utc>) -> Result<TimerSnapshot, TimerError> {
        self.validate_now(now)?;
        match self.phase {
            TimerPhase::Running => self.checkpoint_running(now, WorkMode::Regular)?,
            TimerPhase::Overtime => self.checkpoint_running(now, WorkMode::Overtime)?,
            TimerPhase::Paused => {}
            phase => {
                return Err(TimerError::InvalidTransition {
                    action: "start break",
                    phase,
                })
            }
        }

        self.phase = TimerPhase::Break;
        self.running_since = None;
        self.break_started_at = Some(now);
        self.last_transition_at = Some(now);
        self.snapshot(now)
    }

    pub fn end_break(&mut self, now: DateTime<Utc>) -> Result<TimerSnapshot, TimerError> {
        self.validate_now(now)?;
        if self.phase != TimerPhase::Break {
            return Err(TimerError::InvalidTransition {
                action: "end break",
                phase: self.phase,
            });
        }

        self.break_started_at = None;
        self.phase = match self.resume_mode {
            WorkMode::Regular => TimerPhase::Running,
            WorkMode::Overtime => TimerPhase::Overtime,
        };
        self.running_since = Some(now);
        self.last_transition_at = Some(now);
        self.snapshot(now)
    }

    pub fn extend(&mut self, now: DateTime<Utc>) -> Result<TimerSnapshot, TimerError> {
        self.validate_now(now)?;
        if self.phase != TimerPhase::TimeUp {
            return Err(TimerError::InvalidTransition {
                action: "extend",
                phase: self.phase,
            });
        }

        self.resume_mode = WorkMode::Overtime;
        self.phase = TimerPhase::Overtime;
        self.running_since = Some(now);
        self.last_transition_at = Some(now);
        self.snapshot(now)
    }

    pub fn finish(&mut self, now: DateTime<Utc>) -> Result<FinishedWork, TimerError> {
        self.validate_now(now)?;
        match self.phase {
            TimerPhase::Running => self.checkpoint_running(now, WorkMode::Regular)?,
            TimerPhase::Overtime => self.checkpoint_running(now, WorkMode::Overtime)?,
            TimerPhase::Paused | TimerPhase::TimeUp => {}
            TimerPhase::Break => {
                return Err(TimerError::InvalidTransition {
                    action: "finish task",
                    phase: self.phase,
                })
            }
            TimerPhase::Idle => return Err(TimerError::NoActiveTask),
        }

        let finished = FinishedWork {
            task_id: self.task_id.ok_or(TimerError::NoActiveTask)?,
            work_session_id: self.work_session_id.ok_or(TimerError::NoActiveTask)?,
            actual_work_seconds: self.accumulated_work_seconds,
        };
        self.reset();
        Ok(finished)
    }

    pub fn switch_task(
        &mut self,
        next_task_id: TaskId,
        next_est_seconds: Option<u32>,
        now: DateTime<Utc>,
    ) -> Result<SwitchedWork, TimerError> {
        if matches!(next_est_seconds, Some(0)) {
            return Err(TimerError::InvalidEstimate);
        }
        let finished = self.finish(now)?;
        let next_work_session_id = self.start(next_task_id, next_est_seconds, now)?;
        Ok(SwitchedWork {
            finished,
            next_work_session_id,
        })
    }

    pub fn snapshot(&self, now: DateTime<Utc>) -> Result<TimerSnapshot, TimerError> {
        self.validate_now(now)?;
        if self.phase == TimerPhase::Idle {
            return Ok(TimerSnapshot {
                phase: TimerPhase::Idle,
                task_id: None,
                work_session_id: None,
                est_seconds: None,
                actual_work_seconds: 0,
                display_mode: None,
                display_seconds: 0,
            });
        }

        let actual_work_seconds = self.effective_work_seconds(now)?;
        let (display_mode, display_seconds) = match self.phase {
            TimerPhase::Break => (
                Some(TimerDisplayMode::BreakElapsed),
                self.break_elapsed_seconds(now)?,
            ),
            TimerPhase::Overtime => (
                Some(TimerDisplayMode::Overtime),
                self.overtime_seconds(actual_work_seconds),
            ),
            TimerPhase::TimeUp => (Some(TimerDisplayMode::EstCountdown), 0),
            TimerPhase::Running | TimerPhase::Paused => match self.est_seconds {
                Some(est_seconds) => (
                    Some(TimerDisplayMode::EstCountdown),
                    u64::from(est_seconds).saturating_sub(actual_work_seconds),
                ),
                None => (Some(TimerDisplayMode::CountUp), actual_work_seconds),
            },
            TimerPhase::Idle => unreachable!("idle snapshot returned above"),
        };

        Ok(TimerSnapshot {
            phase: self.phase,
            task_id: self.task_id,
            work_session_id: self.work_session_id,
            est_seconds: self.est_seconds,
            actual_work_seconds,
            display_mode,
            display_seconds,
        })
    }

    fn checkpoint_running(
        &mut self,
        now: DateTime<Utc>,
        resume_mode: WorkMode,
    ) -> Result<(), TimerError> {
        self.accumulated_work_seconds = self.effective_work_seconds(now)?;
        self.running_since = None;
        self.resume_mode = resume_mode;
        Ok(())
    }

    fn effective_work_seconds(&self, now: DateTime<Utc>) -> Result<u64, TimerError> {
        let active_seconds = match self.running_since {
            Some(started_at)
                if matches!(self.phase, TimerPhase::Running | TimerPhase::Overtime) =>
            {
                duration_seconds(started_at, now)?
            }
            _ => 0,
        };
        self.accumulated_work_seconds
            .checked_add(active_seconds)
            .ok_or(TimerError::DurationOverflow)
    }

    fn break_elapsed_seconds(&self, now: DateTime<Utc>) -> Result<u64, TimerError> {
        match self.break_started_at {
            Some(started_at) => duration_seconds(started_at, now),
            None => Ok(0),
        }
    }

    fn overtime_seconds(&self, actual_work_seconds: u64) -> u64 {
        match self.est_seconds {
            Some(est_seconds) => actual_work_seconds.saturating_sub(u64::from(est_seconds)),
            None => actual_work_seconds,
        }
    }

    fn validate_now(&self, now: DateTime<Utc>) -> Result<(), TimerError> {
        if self
            .last_transition_at
            .is_some_and(|last_transition_at| now < last_transition_at)
        {
            return Err(TimerError::TimeWentBackwards);
        }
        Ok(())
    }

    fn reset(&mut self) {
        *self = Self::new();
    }
}

fn duration_seconds(start: DateTime<Utc>, end: DateTime<Utc>) -> Result<u64, TimerError> {
    let duration: Duration = end
        .signed_duration_since(start)
        .to_std()
        .map_err(|_| TimerError::TimeWentBackwards)?
        .into();
    u64::try_from(duration.num_seconds()).map_err(|_| TimerError::DurationOverflow)
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;
    use uuid::Uuid;

    fn at(seconds: i64) -> DateTime<Utc> {
        Utc.timestamp_opt(1_800_000_000 + seconds, 0)
            .single()
            .expect("fixture timestamp")
    }

    fn task(seed: u128) -> TaskId {
        TaskId::from_uuid(Uuid::from_u128(seed))
    }

    #[test]
    fn est_countdown_uses_timestamps_and_enters_time_up_at_exact_est() {
        let mut timer = TimerState::new();
        let session_id = timer.start(task(1), Some(60), at(0)).expect("start timer");

        let halfway = timer.snapshot(at(30)).expect("halfway snapshot");
        assert_eq!(halfway.phase, TimerPhase::Running);
        assert_eq!(halfway.work_session_id, Some(session_id));
        assert_eq!(halfway.actual_work_seconds, 30);
        assert_eq!(halfway.display_seconds, 30);

        let late_tick = timer.advance(at(75)).expect("advance beyond EST");
        assert_eq!(late_tick.phase, TimerPhase::TimeUp);
        assert_eq!(late_tick.actual_work_seconds, 60);
        assert_eq!(late_tick.display_seconds, 0);
        assert_eq!(late_tick.work_session_id, Some(session_id));
    }

    #[test]
    fn pause_resume_is_idempotent_and_does_not_count_paused_time() {
        let mut timer = TimerState::new();
        timer.start(task(1), None, at(0)).expect("start timer");

        timer.pause(at(10)).expect("pause");
        let paused_again = timer.pause(at(20)).expect("idempotent pause");
        assert_eq!(paused_again.actual_work_seconds, 10);

        timer.resume(at(30)).expect("resume");
        let running_again = timer.resume(at(40)).expect("idempotent resume");
        assert_eq!(running_again.actual_work_seconds, 20);

        let snapshot = timer.snapshot(at(50)).expect("final snapshot");
        assert_eq!(snapshot.actual_work_seconds, 30);
        assert_eq!(snapshot.display_mode, Some(TimerDisplayMode::CountUp));
        assert_eq!(snapshot.display_seconds, 30);
    }

    #[test]
    fn manual_break_keeps_break_time_distinct_from_work_time() {
        let mut timer = TimerState::new();
        timer.start(task(1), Some(120), at(0)).expect("start timer");

        let break_snapshot = timer.start_break(at(25)).expect("start break");
        assert_eq!(break_snapshot.phase, TimerPhase::Break);
        assert_eq!(break_snapshot.actual_work_seconds, 25);
        assert_eq!(break_snapshot.display_seconds, 0);

        let during_break = timer.snapshot(at(55)).expect("break snapshot");
        assert_eq!(during_break.actual_work_seconds, 25);
        assert_eq!(during_break.display_mode, Some(TimerDisplayMode::BreakElapsed));
        assert_eq!(during_break.display_seconds, 30);

        timer.end_break(at(65)).expect("end break");
        let resumed = timer.snapshot(at(75)).expect("resumed snapshot");
        assert_eq!(resumed.actual_work_seconds, 35);
    }

    #[test]
    fn extend_preserves_work_session_and_exposes_overtime() {
        let mut timer = TimerState::new();
        let session_id = timer.start(task(1), Some(20), at(0)).expect("start timer");
        timer.advance(at(20)).expect("reach time up");

        let extended = timer.extend(at(30)).expect("extend");
        assert_eq!(extended.phase, TimerPhase::Overtime);
        assert_eq!(extended.work_session_id, Some(session_id));
        assert_eq!(extended.actual_work_seconds, 20);

        let overtime = timer.snapshot(at(42)).expect("overtime snapshot");
        assert_eq!(overtime.actual_work_seconds, 32);
        assert_eq!(overtime.display_mode, Some(TimerDisplayMode::Overtime));
        assert_eq!(overtime.display_seconds, 12);
        assert_eq!(overtime.work_session_id, Some(session_id));
    }

    #[test]
    fn finish_and_switch_preserve_finished_duration_and_use_new_session_identity() {
        let mut timer = TimerState::new();
        let first_session = timer.start(task(1), None, at(0)).expect("start first");

        let switched = timer
            .switch_task(task(2), Some(90), at(15))
            .expect("switch task");
        assert_eq!(switched.finished.task_id, task(1));
        assert_eq!(switched.finished.work_session_id, first_session);
        assert_eq!(switched.finished.actual_work_seconds, 15);
        assert_ne!(switched.next_work_session_id, first_session);

        let next = timer.snapshot(at(25)).expect("next task snapshot");
        assert_eq!(next.task_id, Some(task(2)));
        assert_eq!(next.actual_work_seconds, 10);
        assert_eq!(next.display_seconds, 80);
    }

    #[test]
    fn time_up_finish_keeps_exact_est_and_rejects_backward_time() {
        let mut timer = TimerState::new();
        timer.start(task(1), Some(10), at(0)).expect("start timer");
        timer.advance(at(15)).expect("time up");

        assert!(matches!(
            timer.snapshot(at(14)),
            Err(TimerError::TimeWentBackwards)
        ));

        let finished = timer.finish(at(20)).expect("finish at time up");
        assert_eq!(finished.actual_work_seconds, 10);
        assert_eq!(timer.phase(), TimerPhase::Idle);
    }
}
