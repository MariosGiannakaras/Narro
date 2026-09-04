use crate::domain::ids::TaskId;
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

pub type MonotonicMillis = u64;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum WorkTimerMode {
    EstCountdown { est_seconds: u32 },
    CountUp,
    Pomodoro {
        work_seconds: u32,
        break_seconds: u32,
    },
}

impl WorkTimerMode {
    fn validate(self) -> Result<Self, TimerError> {
        match self {
            Self::EstCountdown { est_seconds: 0 }
            | Self::Pomodoro {
                work_seconds: 0, ..
            }
            | Self::Pomodoro {
                break_seconds: 0, ..
            } => Err(TimerError::InvalidDuration),
            _ => Ok(self),
        }
    }

    fn work_limit_ms(self) -> Option<u64> {
        match self {
            Self::EstCountdown { est_seconds } => Some(u64::from(est_seconds) * 1_000),
            Self::CountUp => None,
            Self::Pomodoro { work_seconds, .. } => Some(u64::from(work_seconds) * 1_000),
        }
    }

    fn pomodoro_break_ms(self) -> Option<u64> {
        match self {
            Self::Pomodoro { break_seconds, .. } => Some(u64::from(break_seconds) * 1_000),
            _ => None,
        }
    }
}

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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimerSnapshot {
    pub phase: TimerPhase,
    pub task_id: Option<TaskId>,
    pub mode: Option<WorkTimerMode>,
    pub work_elapsed_ms: u64,
    pub display_elapsed_ms: u64,
    pub display_remaining_ms: Option<u64>,
    pub break_elapsed_ms: u64,
    pub break_remaining_ms: Option<u64>,
    pub overtime_ms: u64,
}

impl TimerSnapshot {
    fn idle() -> Self {
        Self {
            phase: TimerPhase::Idle,
            task_id: None,
            mode: None,
            work_elapsed_ms: 0,
            display_elapsed_ms: 0,
            display_remaining_ms: None,
            break_elapsed_ms: 0,
            break_remaining_ms: None,
            overtime_ms: 0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FinishedPhase {
    Running,
    Paused,
    TimeUp,
    Overtime,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FinishedWork {
    pub task_id: TaskId,
    pub mode: WorkTimerMode,
    pub work_elapsed_ms: u64,
    pub finished_phase: FinishedPhase,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum TimerTransition {
    EstTimeUp { task_id: TaskId },
    PomodoroBreakStarted { task_id: TaskId },
    BreakFinished { task_id: TaskId },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TimerError {
    AlreadyActive,
    NotActive,
    BreakActive,
    TimeUpDecisionRequired,
    NotTimeUp,
    InvalidDuration,
    ClockWentBackward {
        previous_ms: MonotonicMillis,
        now_ms: MonotonicMillis,
    },
    TimeOverflow,
}

impl Display for TimerError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::AlreadyActive => formatter.write_str("a timer session is already active"),
            Self::NotActive => formatter.write_str("no timer session is active"),
            Self::BreakActive => formatter.write_str("work action is unavailable during a break"),
            Self::TimeUpDecisionRequired => {
                formatter.write_str("Time's Up requires Extend, finish, or switch task")
            }
            Self::NotTimeUp => formatter.write_str("timer is not waiting at Time's Up"),
            Self::InvalidDuration => formatter.write_str("timer durations must be greater than zero"),
            Self::ClockWentBackward {
                previous_ms,
                now_ms,
            } => write!(
                formatter,
                "timer monotonic clock moved backward from {previous_ms}ms to {now_ms}ms"
            ),
            Self::TimeOverflow => formatter.write_str("timer elapsed-time arithmetic overflow"),
        }
    }
}

impl std::error::Error for TimerError {}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum WorkPhase {
    Running,
    Paused,
    TimeUp,
    Overtime,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct WorkRuntime {
    task_id: TaskId,
    mode: WorkTimerMode,
    phase: WorkPhase,
    total_work_ms: u64,
    period_work_ms: u64,
    running_since_ms: Option<MonotonicMillis>,
}

impl WorkRuntime {
    fn new(task_id: TaskId, mode: WorkTimerMode, now_ms: MonotonicMillis) -> Self {
        Self {
            task_id,
            mode,
            phase: WorkPhase::Running,
            total_work_ms: 0,
            period_work_ms: 0,
            running_since_ms: Some(now_ms),
        }
    }

    fn running_delta(&self, now_ms: MonotonicMillis) -> Result<u64, TimerError> {
        match self.running_since_ms {
            Some(started_at) => now_ms
                .checked_sub(started_at)
                .ok_or(TimerError::TimeOverflow),
            None => Ok(0),
        }
    }

    fn current_total_work(&self, now_ms: MonotonicMillis) -> Result<u64, TimerError> {
        self.total_work_ms
            .checked_add(self.running_delta(now_ms)?)
            .ok_or(TimerError::TimeOverflow)
    }

    fn current_period_work(&self, now_ms: MonotonicMillis) -> Result<u64, TimerError> {
        self.period_work_ms
            .checked_add(self.running_delta(now_ms)?)
            .ok_or(TimerError::TimeOverflow)
    }

    fn checkpoint(&mut self, now_ms: MonotonicMillis) -> Result<(), TimerError> {
        if self.running_since_ms.is_none() {
            return Ok(());
        }
        let delta = self.running_delta(now_ms)?;
        self.total_work_ms = self
            .total_work_ms
            .checked_add(delta)
            .ok_or(TimerError::TimeOverflow)?;
        self.period_work_ms = self
            .period_work_ms
            .checked_add(delta)
            .ok_or(TimerError::TimeOverflow)?;
        self.running_since_ms = Some(now_ms);
        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct BreakRuntime {
    work: WorkRuntime,
    duration_ms: u64,
    started_at_ms: MonotonicMillis,
    reset_pomodoro_period_on_finish: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum RuntimeState {
    Idle,
    Work(WorkRuntime),
    Break(BreakRuntime),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TimerEngine {
    state: RuntimeState,
    last_now_ms: Option<MonotonicMillis>,
}

impl Default for TimerEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl TimerEngine {
    pub const fn new() -> Self {
        Self {
            state: RuntimeState::Idle,
            last_now_ms: None,
        }
    }

    fn accept_now(&mut self, now_ms: MonotonicMillis) -> Result<(), TimerError> {
        if let Some(previous_ms) = self.last_now_ms {
            if now_ms < previous_ms {
                return Err(TimerError::ClockWentBackward {
                    previous_ms,
                    now_ms,
                });
            }
        }
        self.last_now_ms = Some(now_ms);
        Ok(())
    }

    pub fn start_work(
        &mut self,
        task_id: TaskId,
        mode: WorkTimerMode,
        now_ms: MonotonicMillis,
    ) -> Result<TimerSnapshot, TimerError> {
        self.accept_now(now_ms)?;
        if !matches!(self.state, RuntimeState::Idle) {
            return Err(TimerError::AlreadyActive);
        }
        let mode = mode.validate()?;
        self.state = RuntimeState::Work(WorkRuntime::new(task_id, mode, now_ms));
        self.snapshot_unchecked(now_ms)
    }

    pub fn advance(
        &mut self,
        now_ms: MonotonicMillis,
    ) -> Result<Vec<TimerTransition>, TimerError> {
        self.accept_now(now_ms)?;
        self.advance_unchecked(now_ms)
    }

    fn advance_unchecked(
        &mut self,
        now_ms: MonotonicMillis,
    ) -> Result<Vec<TimerTransition>, TimerError> {
        let mut transitions = Vec::new();

        let next_state = match std::mem::replace(&mut self.state, RuntimeState::Idle) {
            RuntimeState::Idle => RuntimeState::Idle,
            RuntimeState::Work(mut work) => {
                if !matches!(work.phase, WorkPhase::Running) {
                    RuntimeState::Work(work)
                } else {
                    match work.mode {
                        WorkTimerMode::EstCountdown { .. } => {
                            let limit_ms = work
                                .mode
                                .work_limit_ms()
                                .expect("EST countdown always has a work limit");
                            let current = work.current_total_work(now_ms)?;
                            if current < limit_ms {
                                RuntimeState::Work(work)
                            } else {
                                let remaining_to_limit = limit_ms
                                    .checked_sub(work.total_work_ms)
                                    .ok_or(TimerError::TimeOverflow)?;
                                work.total_work_ms = limit_ms;
                                work.period_work_ms = work
                                    .period_work_ms
                                    .checked_add(remaining_to_limit)
                                    .ok_or(TimerError::TimeOverflow)?;
                                work.running_since_ms = None;
                                work.phase = WorkPhase::TimeUp;
                                transitions.push(TimerTransition::EstTimeUp {
                                    task_id: work.task_id,
                                });
                                RuntimeState::Work(work)
                            }
                        }
                        WorkTimerMode::Pomodoro { .. } => {
                            let limit_ms = work
                                .mode
                                .work_limit_ms()
                                .expect("Pomodoro always has a work limit");
                            let current = work.current_period_work(now_ms)?;
                            if current < limit_ms {
                                RuntimeState::Work(work)
                            } else {
                                let remaining_to_limit = limit_ms
                                    .checked_sub(work.period_work_ms)
                                    .ok_or(TimerError::TimeOverflow)?;
                                work.total_work_ms = work
                                    .total_work_ms
                                    .checked_add(remaining_to_limit)
                                    .ok_or(TimerError::TimeOverflow)?;
                                work.period_work_ms = limit_ms;
                                let running_since = work
                                    .running_since_ms
                                    .expect("running Pomodoro has a running timestamp");
                                let break_started_at_ms = running_since
                                    .checked_add(remaining_to_limit)
                                    .ok_or(TimerError::TimeOverflow)?;
                                work.running_since_ms = None;
                                work.phase = WorkPhase::Paused;
                                let duration_ms = work
                                    .mode
                                    .pomodoro_break_ms()
                                    .expect("Pomodoro always has a break duration");
                                transitions.push(TimerTransition::PomodoroBreakStarted {
                                    task_id: work.task_id,
                                });
                                RuntimeState::Break(BreakRuntime {
                                    work,
                                    duration_ms,
                                    started_at_ms: break_started_at_ms,
                                    reset_pomodoro_period_on_finish: true,
                                })
                            }
                        }
                        WorkTimerMode::CountUp => RuntimeState::Work(work),
                    }
                }
            }
            RuntimeState::Break(mut break_runtime) => {
                let elapsed = now_ms
                    .checked_sub(break_runtime.started_at_ms)
                    .ok_or(TimerError::TimeOverflow)?;
                if elapsed < break_runtime.duration_ms {
                    RuntimeState::Break(break_runtime)
                } else {
                    if break_runtime.reset_pomodoro_period_on_finish {
                        break_runtime.work.period_work_ms = 0;
                    }
                    break_runtime.work.phase = WorkPhase::Paused;
                    break_runtime.work.running_since_ms = None;
                    transitions.push(TimerTransition::BreakFinished {
                        task_id: break_runtime.work.task_id,
                    });
                    RuntimeState::Work(break_runtime.work)
                }
            }
        };

        self.state = next_state;
        Ok(transitions)
    }

    pub fn snapshot(
        &mut self,
        now_ms: MonotonicMillis,
    ) -> Result<TimerSnapshot, TimerError> {
        self.accept_now(now_ms)?;
        self.advance_unchecked(now_ms)?;
        self.snapshot_unchecked(now_ms)
    }

    fn snapshot_unchecked(&self, now_ms: MonotonicMillis) -> Result<TimerSnapshot, TimerError> {
        match &self.state {
            RuntimeState::Idle => Ok(TimerSnapshot::idle()),
            RuntimeState::Work(work) => {
                let work_elapsed_ms = work.current_total_work(now_ms)?;
                let period_elapsed_ms = work.current_period_work(now_ms)?;
                let phase = match work.phase {
                    WorkPhase::Running => TimerPhase::Running,
                    WorkPhase::Paused => TimerPhase::Paused,
                    WorkPhase::TimeUp => TimerPhase::TimeUp,
                    WorkPhase::Overtime => TimerPhase::Overtime,
                };
                let (display_elapsed_ms, display_remaining_ms, overtime_ms) = match work.mode {
                    WorkTimerMode::EstCountdown { .. } => {
                        let limit_ms = work
                            .mode
                            .work_limit_ms()
                            .expect("EST countdown always has a work limit");
                        let remaining = limit_ms.saturating_sub(work_elapsed_ms);
                        let overtime = if matches!(work.phase, WorkPhase::Overtime) {
                            work_elapsed_ms.saturating_sub(limit_ms)
                        } else {
                            0
                        };
                        (work_elapsed_ms.min(limit_ms), Some(remaining), overtime)
                    }
                    WorkTimerMode::CountUp => (work_elapsed_ms, None, 0),
                    WorkTimerMode::Pomodoro { .. } => {
                        let limit_ms = work
                            .mode
                            .work_limit_ms()
                            .expect("Pomodoro always has a work limit");
                        (
                            period_elapsed_ms.min(limit_ms),
                            Some(limit_ms.saturating_sub(period_elapsed_ms)),
                            0,
                        )
                    }
                };

                Ok(TimerSnapshot {
                    phase,
                    task_id: Some(work.task_id),
                    mode: Some(work.mode),
                    work_elapsed_ms,
                    display_elapsed_ms,
                    display_remaining_ms,
                    break_elapsed_ms: 0,
                    break_remaining_ms: None,
                    overtime_ms,
                })
            }
            RuntimeState::Break(break_runtime) => {
                let elapsed = now_ms
                    .checked_sub(break_runtime.started_at_ms)
                    .ok_or(TimerError::TimeOverflow)?
                    .min(break_runtime.duration_ms);
                Ok(TimerSnapshot {
                    phase: TimerPhase::Break,
                    task_id: Some(break_runtime.work.task_id),
                    mode: Some(break_runtime.work.mode),
                    work_elapsed_ms: break_runtime.work.total_work_ms,
                    display_elapsed_ms: elapsed,
                    display_remaining_ms: Some(break_runtime.duration_ms.saturating_sub(elapsed)),
                    break_elapsed_ms: elapsed,
                    break_remaining_ms: Some(break_runtime.duration_ms.saturating_sub(elapsed)),
                    overtime_ms: 0,
                })
            }
        }
    }

    pub fn pause(&mut self, now_ms: MonotonicMillis) -> Result<TimerSnapshot, TimerError> {
        self.accept_now(now_ms)?;
        self.advance_unchecked(now_ms)?;
        match &mut self.state {
            RuntimeState::Idle => return Err(TimerError::NotActive),
            RuntimeState::Break(_) => return Err(TimerError::BreakActive),
            RuntimeState::Work(work) => match work.phase {
                WorkPhase::Running | WorkPhase::Overtime => {
                    work.checkpoint(now_ms)?;
                    work.running_since_ms = None;
                    work.phase = WorkPhase::Paused;
                }
                WorkPhase::Paused => {}
                WorkPhase::TimeUp => return Err(TimerError::TimeUpDecisionRequired),
            },
        }
        self.snapshot_unchecked(now_ms)
    }

    pub fn resume(&mut self, now_ms: MonotonicMillis) -> Result<TimerSnapshot, TimerError> {
        self.accept_now(now_ms)?;
        self.advance_unchecked(now_ms)?;
        match &mut self.state {
            RuntimeState::Idle => return Err(TimerError::NotActive),
            RuntimeState::Break(_) => return Err(TimerError::BreakActive),
            RuntimeState::Work(work) => match work.phase {
                WorkPhase::Running | WorkPhase::Overtime => {}
                WorkPhase::Paused => {
                    work.phase = WorkPhase::Running;
                    work.running_since_ms = Some(now_ms);
                }
                WorkPhase::TimeUp => return Err(TimerError::TimeUpDecisionRequired),
            },
        }
        self.snapshot_unchecked(now_ms)
    }

    pub fn extend(&mut self, now_ms: MonotonicMillis) -> Result<TimerSnapshot, TimerError> {
        self.accept_now(now_ms)?;
        self.advance_unchecked(now_ms)?;
        match &mut self.state {
            RuntimeState::Work(work) if matches!(work.phase, WorkPhase::TimeUp) => {
                work.phase = WorkPhase::Overtime;
                work.running_since_ms = Some(now_ms);
            }
            RuntimeState::Work(_) => return Err(TimerError::NotTimeUp),
            RuntimeState::Break(_) => return Err(TimerError::BreakActive),
            RuntimeState::Idle => return Err(TimerError::NotActive),
        }
        self.snapshot_unchecked(now_ms)
    }

    pub fn start_break(
        &mut self,
        duration_seconds: u32,
        now_ms: MonotonicMillis,
    ) -> Result<TimerSnapshot, TimerError> {
        if duration_seconds == 0 {
            return Err(TimerError::InvalidDuration);
        }
        self.accept_now(now_ms)?;
        self.advance_unchecked(now_ms)?;
        let state = std::mem::replace(&mut self.state, RuntimeState::Idle);
        self.state = match state {
            RuntimeState::Idle => return Err(TimerError::NotActive),
            RuntimeState::Break(break_runtime) => RuntimeState::Break(break_runtime),
            RuntimeState::Work(mut work) => {
                if matches!(work.phase, WorkPhase::TimeUp) {
                    self.state = RuntimeState::Work(work);
                    return Err(TimerError::TimeUpDecisionRequired);
                }
                if matches!(work.phase, WorkPhase::Running | WorkPhase::Overtime) {
                    work.checkpoint(now_ms)?;
                }
                work.running_since_ms = None;
                work.phase = WorkPhase::Paused;
                RuntimeState::Break(BreakRuntime {
                    work,
                    duration_ms: u64::from(duration_seconds) * 1_000,
                    started_at_ms: now_ms,
                    reset_pomodoro_period_on_finish: false,
                })
            }
        };
        self.snapshot_unchecked(now_ms)
    }

    pub fn end_break(&mut self, now_ms: MonotonicMillis) -> Result<TimerSnapshot, TimerError> {
        self.accept_now(now_ms)?;
        self.advance_unchecked(now_ms)?;
        let state = std::mem::replace(&mut self.state, RuntimeState::Idle);
        self.state = match state {
            RuntimeState::Break(mut break_runtime) => {
                break_runtime.work.phase = WorkPhase::Paused;
                break_runtime.work.running_since_ms = None;
                RuntimeState::Work(break_runtime.work)
            }
            other => {
                self.state = other;
                return Err(TimerError::BreakActive);
            }
        };
        self.snapshot_unchecked(now_ms)
    }

    pub fn finish(&mut self, now_ms: MonotonicMillis) -> Result<FinishedWork, TimerError> {
        self.accept_now(now_ms)?;
        self.advance_unchecked(now_ms)?;
        let state = std::mem::replace(&mut self.state, RuntimeState::Idle);
        match state {
            RuntimeState::Idle => Err(TimerError::NotActive),
            RuntimeState::Break(break_runtime) => {
                self.state = RuntimeState::Break(break_runtime);
                Err(TimerError::BreakActive)
            }
            RuntimeState::Work(mut work) => {
                if matches!(work.phase, WorkPhase::Running | WorkPhase::Overtime) {
                    work.checkpoint(now_ms)?;
                    work.running_since_ms = None;
                }
                let finished_phase = match work.phase {
                    WorkPhase::Running => FinishedPhase::Running,
                    WorkPhase::Paused => FinishedPhase::Paused,
                    WorkPhase::TimeUp => FinishedPhase::TimeUp,
                    WorkPhase::Overtime => FinishedPhase::Overtime,
                };
                Ok(FinishedWork {
                    task_id: work.task_id,
                    mode: work.mode,
                    work_elapsed_ms: work.total_work_ms,
                    finished_phase,
                })
            }
        }
    }

    pub fn switch_task(
        &mut self,
        next_task_id: TaskId,
        next_mode: WorkTimerMode,
        now_ms: MonotonicMillis,
    ) -> Result<FinishedWork, TimerError> {
        let next_mode = next_mode.validate()?;
        let finished = self.finish(now_ms)?;
        self.state = RuntimeState::Work(WorkRuntime::new(next_task_id, next_mode, now_ms));
        Ok(finished)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    fn task(value: u128) -> TaskId {
        TaskId::from_uuid(Uuid::from_u128(value))
    }

    #[test]
    fn count_up_elapsed_time_depends_on_clock_not_snapshot_frequency() {
        let mut engine = TimerEngine::new();
        engine
            .start_work(task(1), WorkTimerMode::CountUp, 1_000)
            .expect("start count-up");

        let after_minute = engine.snapshot(61_000).expect("snapshot after minute");
        assert_eq!(after_minute.phase, TimerPhase::Running);
        assert_eq!(after_minute.work_elapsed_ms, 60_000);
        assert_eq!(after_minute.display_elapsed_ms, 60_000);
        assert_eq!(after_minute.display_remaining_ms, None);

        let repeated = engine.snapshot(61_000).expect("repeat same-time snapshot");
        assert_eq!(repeated, after_minute);
    }

    #[test]
    fn pause_and_resume_are_idempotent_and_paused_time_is_not_work() {
        let mut engine = TimerEngine::new();
        engine
            .start_work(task(1), WorkTimerMode::CountUp, 0)
            .expect("start work");
        let paused = engine.pause(10_000).expect("pause work");
        assert_eq!(paused.work_elapsed_ms, 10_000);
        assert_eq!(engine.pause(20_000).expect("repeat pause"), paused);

        engine.resume(30_000).expect("resume work");
        engine.resume(35_000).expect("repeat resume");
        let running = engine.snapshot(40_000).expect("running snapshot");
        assert_eq!(running.work_elapsed_ms, 20_000);
        assert_eq!(running.phase, TimerPhase::Running);
    }

    #[test]
    fn est_countdown_enters_time_up_at_exact_boundary_and_extend_preserves_work() {
        let mut engine = TimerEngine::new();
        engine
            .start_work(
                task(1),
                WorkTimerMode::EstCountdown { est_seconds: 10 },
                0,
            )
            .expect("start EST countdown");

        let transitions = engine.advance(12_000).expect("advance beyond EST");
        assert_eq!(
            transitions,
            vec![TimerTransition::EstTimeUp { task_id: task(1) }]
        );
        let time_up = engine.snapshot(20_000).expect("Time's Up remains frozen");
        assert_eq!(time_up.phase, TimerPhase::TimeUp);
        assert_eq!(time_up.work_elapsed_ms, 10_000);
        assert_eq!(time_up.display_remaining_ms, Some(0));

        let overtime = engine.extend(20_000).expect("extend same work session");
        assert_eq!(overtime.phase, TimerPhase::Overtime);
        assert_eq!(overtime.work_elapsed_ms, 10_000);
        let later = engine.snapshot(25_000).expect("overtime snapshot");
        assert_eq!(later.work_elapsed_ms, 15_000);
        assert_eq!(later.overtime_ms, 5_000);
    }

    #[test]
    fn manual_break_never_counts_as_work_and_returns_to_paused_work() {
        let mut engine = TimerEngine::new();
        engine
            .start_work(task(1), WorkTimerMode::CountUp, 0)
            .expect("start work");
        let break_start = engine.start_break(5, 10_000).expect("start manual break");
        assert_eq!(break_start.phase, TimerPhase::Break);
        assert_eq!(break_start.work_elapsed_ms, 10_000);

        let during_break = engine.snapshot(13_000).expect("break snapshot");
        assert_eq!(during_break.break_elapsed_ms, 3_000);
        assert_eq!(during_break.break_remaining_ms, Some(2_000));
        assert_eq!(during_break.work_elapsed_ms, 10_000);

        let transitions = engine.advance(15_000).expect("finish break by time");
        assert_eq!(
            transitions,
            vec![TimerTransition::BreakFinished { task_id: task(1) }]
        );
        let paused = engine.snapshot(18_000).expect("post-break snapshot");
        assert_eq!(paused.phase, TimerPhase::Paused);
        assert_eq!(paused.work_elapsed_ms, 10_000);

        engine.resume(20_000).expect("resume after break");
        assert_eq!(
            engine.snapshot(25_000).expect("work after break").work_elapsed_ms,
            15_000
        );
    }

    #[test]
    fn pomodoro_work_boundary_starts_break_at_boundary_and_resets_next_sprint() {
        let mut engine = TimerEngine::new();
        engine
            .start_work(
                task(1),
                WorkTimerMode::Pomodoro {
                    work_seconds: 5,
                    break_seconds: 3,
                },
                0,
            )
            .expect("start Pomodoro");

        let transitions = engine.advance(6_000).expect("cross Pomodoro boundary");
        assert_eq!(
            transitions,
            vec![TimerTransition::PomodoroBreakStarted { task_id: task(1) }]
        );
        let break_snapshot = engine.snapshot(6_000).expect("Pomodoro break snapshot");
        assert_eq!(break_snapshot.phase, TimerPhase::Break);
        assert_eq!(break_snapshot.work_elapsed_ms, 5_000);
        assert_eq!(break_snapshot.break_elapsed_ms, 1_000);
        assert_eq!(break_snapshot.break_remaining_ms, Some(2_000));

        let after_break = engine.snapshot(8_000).expect("break completion snapshot");
        assert_eq!(after_break.phase, TimerPhase::Paused);
        assert_eq!(after_break.work_elapsed_ms, 5_000);
        assert_eq!(after_break.display_elapsed_ms, 0);
        assert_eq!(after_break.display_remaining_ms, Some(5_000));

        engine.resume(10_000).expect("resume next Pomodoro sprint");
        let second_sprint = engine.snapshot(12_000).expect("second sprint snapshot");
        assert_eq!(second_sprint.work_elapsed_ms, 7_000);
        assert_eq!(second_sprint.display_elapsed_ms, 2_000);
        assert_eq!(second_sprint.display_remaining_ms, Some(3_000));
    }

    #[test]
    fn finish_and_switch_from_time_up_preserve_finished_task_identity_and_work() {
        let mut engine = TimerEngine::new();
        engine
            .start_work(
                task(1),
                WorkTimerMode::EstCountdown { est_seconds: 4 },
                0,
            )
            .expect("start first task");
        engine.advance(4_000).expect("reach Time's Up");

        let finished = engine
            .switch_task(task(2), WorkTimerMode::CountUp, 5_000)
            .expect("switch task from Time's Up");
        assert_eq!(finished.task_id, task(1));
        assert_eq!(finished.work_elapsed_ms, 4_000);
        assert_eq!(finished.finished_phase, FinishedPhase::TimeUp);

        let next = engine.snapshot(7_000).expect("next task snapshot");
        assert_eq!(next.task_id, Some(task(2)));
        assert_eq!(next.phase, TimerPhase::Running);
        assert_eq!(next.work_elapsed_ms, 2_000);
    }

    #[test]
    fn monotonic_clock_regression_is_rejected_without_mutating_elapsed_time() {
        let mut engine = TimerEngine::new();
        engine
            .start_work(task(1), WorkTimerMode::CountUp, 10_000)
            .expect("start work");
        engine.snapshot(20_000).expect("advance clock");
        assert!(matches!(
            engine.snapshot(19_000),
            Err(TimerError::ClockWentBackward {
                previous_ms: 20_000,
                now_ms: 19_000
            })
        ));
        assert_eq!(
            engine.snapshot(20_000).expect("state after rejected time").work_elapsed_ms,
            10_000
        );
    }
}
