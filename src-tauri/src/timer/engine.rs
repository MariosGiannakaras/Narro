use crate::domain::ids::{SessionId, TaskId};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TimerPhase {
    Idle,
    WorkRunning,
    WorkPaused,
    BreakRunning,
    TimeUp,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum TimerDisplayMode {
    EstCountdown { est_seconds: u32 },
    CountUp,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkStopReason {
    Done,
    Skip,
    SwitchTask,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkSessionClosure {
    pub task_id: TaskId,
    pub session_id: SessionId,
    pub work_seconds: u64,
    pub reason: WorkStopReason,
    pub stopped_from: TimerPhase,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BreakSessionClosure {
    pub session_id: SessionId,
    pub break_seconds: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimerSnapshot {
    pub phase: TimerPhase,
    pub active_task_id: Option<TaskId>,
    pub work_session_id: Option<SessionId>,
    pub break_session_id: Option<SessionId>,
    pub display_mode: Option<TimerDisplayMode>,
    pub work_seconds: u64,
    pub countdown_remaining_seconds: Option<u64>,
    pub overtime_seconds: Option<u64>,
    pub break_seconds: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TimerStateError {
    AlreadyActive,
    NoActiveWork,
    InvalidEstimate,
    ClockMovedBackwards,
    InvalidTransition {
        phase: TimerPhase,
        action: &'static str,
    },
    WorkDurationOverflow,
}

impl Display for TimerStateError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::AlreadyActive => formatter.write_str("a timer session is already active"),
            Self::NoActiveWork => formatter.write_str("no active work session exists"),
            Self::InvalidEstimate => formatter.write_str("EST must be greater than zero seconds"),
            Self::ClockMovedBackwards => {
                formatter.write_str("timer transition timestamp moved backwards")
            }
            Self::InvalidTransition { phase, action } => {
                write!(formatter, "cannot {action} while timer phase is {phase:?}")
            }
            Self::WorkDurationOverflow => formatter.write_str("timer duration arithmetic overflow"),
        }
    }
}

impl std::error::Error for TimerStateError {}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
struct ActiveWork {
    task_id: TaskId,
    session_id: SessionId,
    display_mode: TimerDisplayMode,
    accumulated_work_seconds: u64,
    running_since: Option<DateTime<Utc>>,
    extended_from_time_up: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
struct ActiveBreak {
    session_id: SessionId,
    started_at: DateTime<Utc>,
    resume_work_after_break: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimerStateMachine {
    phase: TimerPhase,
    work: Option<ActiveWork>,
    active_break: Option<ActiveBreak>,
}

impl Default for TimerStateMachine {
    fn default() -> Self {
        Self::new()
    }
}

impl TimerStateMachine {
    pub const fn new() -> Self {
        Self {
            phase: TimerPhase::Idle,
            work: None,
            active_break: None,
        }
    }

    pub const fn phase(&self) -> TimerPhase {
        self.phase
    }

    pub fn start_work(
        &mut self,
        task_id: TaskId,
        session_id: SessionId,
        est_seconds: Option<u32>,
        now: DateTime<Utc>,
    ) -> Result<TimerSnapshot, TimerStateError> {
        if self.phase != TimerPhase::Idle || self.work.is_some() || self.active_break.is_some() {
            return Err(TimerStateError::AlreadyActive);
        }
        if matches!(est_seconds, Some(0)) {
            return Err(TimerStateError::InvalidEstimate);
        }

        let display_mode = match est_seconds {
            Some(est_seconds) => TimerDisplayMode::EstCountdown { est_seconds },
            None => TimerDisplayMode::CountUp,
        };
        self.work = Some(ActiveWork {
            task_id,
            session_id,
            display_mode,
            accumulated_work_seconds: 0,
            running_since: Some(now),
            extended_from_time_up: false,
        });
        self.phase = TimerPhase::WorkRunning;
        self.snapshot(now)
    }

    pub fn advance(&mut self, now: DateTime<Utc>) -> Result<TimerSnapshot, TimerStateError> {
        self.settle_running_work(now)?;
        self.snapshot(now)
    }

    pub fn pause(&mut self, now: DateTime<Utc>) -> Result<TimerSnapshot, TimerStateError> {
        self.settle_running_work(now)?;
        match self.phase {
            TimerPhase::WorkRunning => {
                self.work_mut()?.running_since = None;
                self.phase = TimerPhase::WorkPaused;
            }
            TimerPhase::WorkPaused | TimerPhase::TimeUp => {}
            phase => {
                return Err(TimerStateError::InvalidTransition {
                    phase,
                    action: "pause work",
                });
            }
        }
        self.snapshot(now)
    }

    pub fn resume(&mut self, now: DateTime<Utc>) -> Result<TimerSnapshot, TimerStateError> {
        self.settle_running_work(now)?;
        match self.phase {
            TimerPhase::WorkRunning => {}
            TimerPhase::WorkPaused => {
                self.work_mut()?.running_since = Some(now);
                self.phase = TimerPhase::WorkRunning;
            }
            phase => {
                return Err(TimerStateError::InvalidTransition {
                    phase,
                    action: "resume work",
                });
            }
        }
        self.snapshot(now)
    }

    pub fn extend_from_time_up(
        &mut self,
        now: DateTime<Utc>,
    ) -> Result<TimerSnapshot, TimerStateError> {
        if self.phase != TimerPhase::TimeUp {
            return Err(TimerStateError::InvalidTransition {
                phase: self.phase,
                action: "extend from Time's Up",
            });
        }
        let work = self.work_mut()?;
        work.extended_from_time_up = true;
        work.running_since = Some(now);
        self.phase = TimerPhase::WorkRunning;
        self.snapshot(now)
    }

    pub fn start_break(
        &mut self,
        break_session_id: SessionId,
        now: DateTime<Utc>,
    ) -> Result<TimerSnapshot, TimerStateError> {
        self.settle_running_work(now)?;
        let resume_work_after_break = match self.phase {
            TimerPhase::WorkRunning => true,
            TimerPhase::WorkPaused => false,
            phase => {
                return Err(TimerStateError::InvalidTransition {
                    phase,
                    action: "start break",
                });
            }
        };

        self.work_mut()?.running_since = None;
        self.active_break = Some(ActiveBreak {
            session_id: break_session_id,
            started_at: now,
            resume_work_after_break,
        });
        self.phase = TimerPhase::BreakRunning;
        self.snapshot(now)
    }

    pub fn finish_break(
        &mut self,
        now: DateTime<Utc>,
    ) -> Result<(BreakSessionClosure, TimerSnapshot), TimerStateError> {
        let resume = self
            .active_break
            .as_ref()
            .ok_or(TimerStateError::InvalidTransition {
                phase: self.phase,
                action: "finish break",
            })?
            .resume_work_after_break;
        self.close_break(now, resume)
    }

    pub fn skip_break(
        &mut self,
        now: DateTime<Utc>,
    ) -> Result<(BreakSessionClosure, TimerSnapshot), TimerStateError> {
        self.close_break(now, false)
    }

    pub fn stop_work(
        &mut self,
        reason: WorkStopReason,
        now: DateTime<Utc>,
    ) -> Result<WorkSessionClosure, TimerStateError> {
        self.settle_running_work(now)?;
        if self.phase == TimerPhase::BreakRunning {
            return Err(TimerStateError::InvalidTransition {
                phase: self.phase,
                action: "stop work during a break",
            });
        }
        if self.phase == TimerPhase::Idle {
            return Err(TimerStateError::NoActiveWork);
        }

        let stopped_from = self.phase;
        let work = self.work.take().ok_or(TimerStateError::NoActiveWork)?;
        let closure = WorkSessionClosure {
            task_id: work.task_id,
            session_id: work.session_id,
            work_seconds: work.accumulated_work_seconds,
            reason,
            stopped_from,
        };
        self.phase = TimerPhase::Idle;
        self.active_break = None;
        Ok(closure)
    }

    pub fn switch_task(
        &mut self,
        next_task_id: TaskId,
        next_session_id: SessionId,
        next_est_seconds: Option<u32>,
        now: DateTime<Utc>,
    ) -> Result<(WorkSessionClosure, TimerSnapshot), TimerStateError> {
        let previous = self.stop_work(WorkStopReason::SwitchTask, now)?;
        let snapshot = self.start_work(next_task_id, next_session_id, next_est_seconds, now)?;
        Ok((previous, snapshot))
    }

    pub fn snapshot(&self, now: DateTime<Utc>) -> Result<TimerSnapshot, TimerStateError> {
        let Some(work) = self.work.as_ref() else {
            return Ok(TimerSnapshot {
                phase: self.phase,
                active_task_id: None,
                work_session_id: None,
                break_session_id: None,
                display_mode: None,
                work_seconds: 0,
                countdown_remaining_seconds: None,
                overtime_seconds: None,
                break_seconds: 0,
            });
        };

        let live_work_delta = match work.running_since {
            Some(started_at) if self.phase == TimerPhase::WorkRunning => {
                elapsed_seconds(started_at, now)?
            }
            _ => 0,
        };
        let work_seconds = work
            .accumulated_work_seconds
            .checked_add(live_work_delta)
            .ok_or(TimerStateError::WorkDurationOverflow)?;
        let break_seconds = match self.active_break.as_ref() {
            Some(active_break) => elapsed_seconds(active_break.started_at, now)?,
            None => 0,
        };
        let break_session_id = self.active_break.as_ref().map(|active_break| active_break.session_id);

        let (countdown_remaining_seconds, overtime_seconds) = match work.display_mode {
            TimerDisplayMode::EstCountdown { est_seconds } => {
                let est_seconds = u64::from(est_seconds);
                let remaining = est_seconds.saturating_sub(work_seconds);
                let overtime = work
                    .extended_from_time_up
                    .then_some(work_seconds.saturating_sub(est_seconds));
                (Some(remaining), overtime)
            }
            TimerDisplayMode::CountUp => (None, None),
        };

        Ok(TimerSnapshot {
            phase: self.phase,
            active_task_id: Some(work.task_id),
            work_session_id: Some(work.session_id),
            break_session_id,
            display_mode: Some(work.display_mode),
            work_seconds,
            countdown_remaining_seconds,
            overtime_seconds,
            break_seconds,
        })
    }

    fn settle_running_work(&mut self, now: DateTime<Utc>) -> Result<(), TimerStateError> {
        if self.phase != TimerPhase::WorkRunning {
            return Ok(());
        }

        let work = self.work_mut()?;
        let started_at = work.running_since.ok_or(TimerStateError::InvalidTransition {
            phase: TimerPhase::WorkRunning,
            action: "settle work without a running timestamp",
        })?;
        let delta = elapsed_seconds(started_at, now)?;

        match work.display_mode {
            TimerDisplayMode::EstCountdown { est_seconds } if !work.extended_from_time_up => {
                let est_seconds = u64::from(est_seconds);
                let remaining = est_seconds.saturating_sub(work.accumulated_work_seconds);
                if delta >= remaining {
                    work.accumulated_work_seconds = est_seconds;
                    work.running_since = None;
                    self.phase = TimerPhase::TimeUp;
                } else {
                    work.accumulated_work_seconds = work
                        .accumulated_work_seconds
                        .checked_add(delta)
                        .ok_or(TimerStateError::WorkDurationOverflow)?;
                    work.running_since = Some(now);
                }
            }
            TimerDisplayMode::EstCountdown { .. } | TimerDisplayMode::CountUp => {
                work.accumulated_work_seconds = work
                    .accumulated_work_seconds
                    .checked_add(delta)
                    .ok_or(TimerStateError::WorkDurationOverflow)?;
                work.running_since = Some(now);
            }
        }
        Ok(())
    }

    fn close_break(
        &mut self,
        now: DateTime<Utc>,
        resume_work: bool,
    ) -> Result<(BreakSessionClosure, TimerSnapshot), TimerStateError> {
        if self.phase != TimerPhase::BreakRunning {
            return Err(TimerStateError::InvalidTransition {
                phase: self.phase,
                action: "close break",
            });
        }
        let active_break = self
            .active_break
            .take()
            .ok_or(TimerStateError::InvalidTransition {
                phase: self.phase,
                action: "close missing break session",
            })?;
        let break_seconds = elapsed_seconds(active_break.started_at, now)?;
        let closure = BreakSessionClosure {
            session_id: active_break.session_id,
            break_seconds,
        };

        if resume_work {
            self.work_mut()?.running_since = Some(now);
            self.phase = TimerPhase::WorkRunning;
        } else {
            self.work_mut()?.running_since = None;
            self.phase = TimerPhase::WorkPaused;
        }
        let snapshot = self.snapshot(now)?;
        Ok((closure, snapshot))
    }

    fn work_mut(&mut self) -> Result<&mut ActiveWork, TimerStateError> {
        self.work.as_mut().ok_or(TimerStateError::NoActiveWork)
    }
}

fn elapsed_seconds(start: DateTime<Utc>, end: DateTime<Utc>) -> Result<u64, TimerStateError> {
    let delta = end.signed_duration_since(start).num_seconds();
    u64::try_from(delta).map_err(|_| TimerStateError::ClockMovedBackwards)
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;
    use uuid::Uuid;

    fn at(second: u32) -> DateTime<Utc> {
        Utc.with_ymd_and_hms(2026, 9, 4, 12, 0, second)
            .single()
            .expect("fixture timestamp")
    }

    fn task(index: u128) -> TaskId {
        TaskId::from_uuid(Uuid::from_u128(0x1000_0000_0000_0000_0000_0000_0000_0000 + index))
    }

    fn session(index: u128) -> SessionId {
        SessionId::from_uuid(Uuid::from_u128(0x2000_0000_0000_0000_0000_0000_0000_0000 + index))
    }

    #[test]
    fn count_up_pause_resume_are_idempotent_and_preserve_one_session_identity() {
        let mut timer = TimerStateMachine::new();
        let started = timer
            .start_work(task(1), session(1), None, at(0))
            .expect("start count-up work");
        assert_eq!(started.phase, TimerPhase::WorkRunning);
        assert_eq!(started.work_session_id, Some(session(1)));

        let paused = timer.pause(at(10)).expect("pause work");
        assert_eq!(paused.phase, TimerPhase::WorkPaused);
        assert_eq!(paused.work_seconds, 10);
        assert_eq!(timer.pause(at(20)).expect("idempotent pause").work_seconds, 10);

        let resumed = timer.resume(at(20)).expect("resume work");
        assert_eq!(resumed.phase, TimerPhase::WorkRunning);
        assert_eq!(resumed.work_session_id, Some(session(1)));
        assert_eq!(
            timer.resume(at(25)).expect("idempotent resume").work_seconds,
            15
        );

        let closure = timer
            .stop_work(WorkStopReason::Done, at(30))
            .expect("finish work");
        assert_eq!(closure.session_id, session(1));
        assert_eq!(closure.task_id, task(1));
        assert_eq!(closure.work_seconds, 20);
        assert_eq!(closure.reason, WorkStopReason::Done);
        assert_eq!(timer.phase(), TimerPhase::Idle);
    }

    #[test]
    fn est_zero_crossing_enters_time_up_and_extend_preserves_session_without_counting_wait() {
        let mut timer = TimerStateMachine::new();
        timer
            .start_work(task(1), session(1), Some(10), at(0))
            .expect("start EST countdown");

        let time_up = timer.advance(at(12)).expect("cross EST boundary");
        assert_eq!(time_up.phase, TimerPhase::TimeUp);
        assert_eq!(time_up.work_seconds, 10);
        assert_eq!(time_up.countdown_remaining_seconds, Some(0));
        assert_eq!(time_up.overtime_seconds, None);
        assert_eq!(timer.snapshot(at(20)).unwrap().work_seconds, 10);

        let extended = timer
            .extend_from_time_up(at(20))
            .expect("extend from Time's Up");
        assert_eq!(extended.work_session_id, Some(session(1)));
        assert_eq!(extended.overtime_seconds, Some(0));

        let overtime = timer.advance(at(27)).expect("advance overtime");
        assert_eq!(overtime.phase, TimerPhase::WorkRunning);
        assert_eq!(overtime.work_session_id, Some(session(1)));
        assert_eq!(overtime.work_seconds, 17);
        assert_eq!(overtime.overtime_seconds, Some(7));
    }

    #[test]
    fn manual_break_tracks_distinct_session_and_does_not_add_break_time_to_work() {
        let mut timer = TimerStateMachine::new();
        timer
            .start_work(task(1), session(1), None, at(0))
            .expect("start work");
        let on_break = timer.start_break(session(2), at(10)).expect("start break");
        assert_eq!(on_break.phase, TimerPhase::BreakRunning);
        assert_eq!(on_break.work_seconds, 10);
        assert_eq!(on_break.break_session_id, Some(session(2)));

        let during_break = timer.snapshot(at(25)).expect("break snapshot");
        assert_eq!(during_break.work_seconds, 10);
        assert_eq!(during_break.break_seconds, 15);

        let (break_closure, resumed) = timer.finish_break(at(30)).expect("finish break");
        assert_eq!(break_closure.session_id, session(2));
        assert_eq!(break_closure.break_seconds, 20);
        assert_eq!(resumed.phase, TimerPhase::WorkRunning);
        assert_eq!(resumed.work_session_id, Some(session(1)));
        assert_eq!(timer.advance(at(35)).unwrap().work_seconds, 15);
    }

    #[test]
    fn skipped_break_leaves_work_paused() {
        let mut timer = TimerStateMachine::new();
        timer
            .start_work(task(1), session(1), None, at(0))
            .expect("start work");
        timer.start_break(session(2), at(5)).expect("start break");
        let (_, snapshot) = timer.skip_break(at(12)).expect("skip break");
        assert_eq!(snapshot.phase, TimerPhase::WorkPaused);
        assert_eq!(snapshot.work_seconds, 5);
        assert_eq!(timer.snapshot(at(30)).unwrap().work_seconds, 5);
    }

    #[test]
    fn switch_from_time_up_closes_original_session_and_starts_new_identity() {
        let mut timer = TimerStateMachine::new();
        timer
            .start_work(task(1), session(1), Some(5), at(0))
            .expect("start first task");
        assert_eq!(timer.advance(at(5)).unwrap().phase, TimerPhase::TimeUp);

        let (previous, current) = timer
            .switch_task(task(2), session(2), None, at(10))
            .expect("switch task from Time's Up");
        assert_eq!(previous.task_id, task(1));
        assert_eq!(previous.session_id, session(1));
        assert_eq!(previous.work_seconds, 5);
        assert_eq!(previous.reason, WorkStopReason::SwitchTask);
        assert_eq!(previous.stopped_from, TimerPhase::TimeUp);
        assert_eq!(current.active_task_id, Some(task(2)));
        assert_eq!(current.work_session_id, Some(session(2)));
        assert_eq!(current.phase, TimerPhase::WorkRunning);
    }

    #[test]
    fn backwards_timestamp_is_rejected_without_advancing_accumulated_work() {
        let mut timer = TimerStateMachine::new();
        timer
            .start_work(task(1), session(1), None, at(10))
            .expect("start work");
        assert_eq!(
            timer.advance(at(5)),
            Err(TimerStateError::ClockMovedBackwards)
        );
        assert_eq!(timer.snapshot(at(10)).unwrap().work_seconds, 0);
        assert_eq!(timer.phase(), TimerPhase::WorkRunning);
    }
}
