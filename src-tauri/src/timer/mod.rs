//! Authoritative timer/session state machine.
//!
//! The engine stores accumulated durations plus monotonic run anchors. Renderers may sample
//! snapshots as often as they like without becoming authoritative and without requiring
//! per-second persistence writes. Session-row persistence and Tauri event integration are
//! layered on top in later Milestone 3 slices.

use crate::domain::ids::TaskId;
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TimerStateKind {
    Idle,
    Running,
    Paused,
    Break,
    TimeUp,
    Overtime,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BreakKind {
    Manual,
    Pomodoro,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum TimerMode {
    CountUp,
    EstCountdown { est_ms: u64 },
    Pomodoro { work_ms: u64, break_ms: u64 },
}

impl TimerMode {
    pub fn from_seconds(
        est_seconds: Option<u32>,
        pomodoro: Option<(u32, u32)>,
    ) -> Result<Self, TimerError> {
        if let Some((work_seconds, break_seconds)) = pomodoro {
            let work_ms = u64::from(work_seconds)
                .checked_mul(1_000)
                .ok_or(TimerError::DurationOverflow)?;
            let break_ms = u64::from(break_seconds)
                .checked_mul(1_000)
                .ok_or(TimerError::DurationOverflow)?;
            let mode = Self::Pomodoro { work_ms, break_ms };
            mode.validate()?;
            return Ok(mode);
        }

        match est_seconds {
            Some(seconds) => {
                let est_ms = u64::from(seconds)
                    .checked_mul(1_000)
                    .ok_or(TimerError::DurationOverflow)?;
                let mode = Self::EstCountdown { est_ms };
                mode.validate()?;
                Ok(mode)
            }
            None => Ok(Self::CountUp),
        }
    }

    fn validate(self) -> Result<(), TimerError> {
        match self {
            Self::CountUp => Ok(()),
            Self::EstCountdown { est_ms } if est_ms > 0 => Ok(()),
            Self::Pomodoro { work_ms, break_ms } if work_ms > 0 && break_ms > 0 => Ok(()),
            _ => Err(TimerError::ZeroDuration),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimerSnapshot {
    pub state: TimerStateKind,
    pub task_id: Option<TaskId>,
    pub mode: Option<TimerMode>,
    pub work_elapsed_ms: u64,
    pub total_break_ms: u64,
    pub countdown_remaining_ms: Option<u64>,
    pub overtime_ms: u64,
    pub break_kind: Option<BreakKind>,
    pub break_remaining_ms: Option<u64>,
}

impl TimerSnapshot {
    fn idle() -> Self {
        Self {
            state: TimerStateKind::Idle,
            task_id: None,
            mode: None,
            work_elapsed_ms: 0,
            total_break_ms: 0,
            countdown_remaining_ms: None,
            overtime_ms: 0,
            break_kind: None,
            break_remaining_ms: None,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TimerAction {
    StartTask,
    Pause,
    Resume,
    StartManualBreak,
    FinishBreak,
    SkipBreak,
    Extend,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TimerError {
    ClockMovedBackwards {
        previous_ms: u64,
        now_ms: u64,
    },
    AlreadyActive,
    NoActiveTask,
    InvalidTransition {
        action: TimerAction,
        state: TimerStateKind,
    },
    ZeroDuration,
    DurationOverflow,
}

impl Display for TimerError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::ClockMovedBackwards {
                previous_ms,
                now_ms,
            } => write!(
                formatter,
                "timer clock moved backwards: previous={previous_ms}ms now={now_ms}ms"
            ),
            Self::AlreadyActive => formatter.write_str("timer already has an active task"),
            Self::NoActiveTask => formatter.write_str("timer has no active task"),
            Self::InvalidTransition { action, state } => {
                write!(
                    formatter,
                    "timer action {action:?} is invalid from state {state:?}"
                )
            }
            Self::ZeroDuration => formatter.write_str("timer durations must be greater than zero"),
            Self::DurationOverflow => formatter.write_str("timer duration arithmetic overflow"),
        }
    }
}

impl std::error::Error for TimerError {}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum WorkPhase {
    Running,
    Paused,
    TimeUp,
    OvertimeRunning,
    OvertimePaused,
}

impl WorkPhase {
    fn state_kind(self) -> TimerStateKind {
        match self {
            Self::Running => TimerStateKind::Running,
            Self::Paused => TimerStateKind::Paused,
            Self::TimeUp => TimerStateKind::TimeUp,
            Self::OvertimeRunning | Self::OvertimePaused => TimerStateKind::Overtime,
        }
    }

    fn is_running(self) -> bool {
        matches!(self, Self::Running | Self::OvertimeRunning)
    }

    fn paused_variant(self) -> Self {
        match self {
            Self::OvertimeRunning | Self::OvertimePaused => Self::OvertimePaused,
            _ => Self::Paused,
        }
    }

    fn running_variant(self) -> Self {
        match self {
            Self::OvertimeRunning | Self::OvertimePaused => Self::OvertimeRunning,
            _ => Self::Running,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct WorkRuntime {
    task_id: TaskId,
    mode: TimerMode,
    phase: WorkPhase,
    total_work_ms: u64,
    interval_work_ms: u64,
    run_started_ms: Option<u64>,
}

impl WorkRuntime {
    fn checkpoint_delta(&mut self, delta_ms: u64) -> Result<(), TimerError> {
        self.total_work_ms = self
            .total_work_ms
            .checked_add(delta_ms)
            .ok_or(TimerError::DurationOverflow)?;
        self.interval_work_ms = self
            .interval_work_ms
            .checked_add(delta_ms)
            .ok_or(TimerError::DurationOverflow)?;
        self.run_started_ms = None;
        Ok(())
    }

    fn active_delta(&self, now_ms: u64) -> u64 {
        self.run_started_ms
            .map(|started| now_ms - started)
            .unwrap_or(0)
    }

    fn projected_total(&self, now_ms: u64) -> Result<u64, TimerError> {
        self.total_work_ms
            .checked_add(self.active_delta(now_ms))
            .ok_or(TimerError::DurationOverflow)
    }

    fn projected_interval(&self, now_ms: u64) -> Result<u64, TimerError> {
        self.interval_work_ms
            .checked_add(self.active_delta(now_ms))
            .ok_or(TimerError::DurationOverflow)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct BreakRuntime {
    kind: BreakKind,
    duration_ms: u64,
    elapsed_ms: u64,
    run_started_ms: u64,
    resume_work: WorkRuntime,
}

impl BreakRuntime {
    fn projected_elapsed(&self, now_ms: u64) -> Result<u64, TimerError> {
        self.elapsed_ms
            .checked_add(now_ms - self.run_started_ms)
            .ok_or(TimerError::DurationOverflow)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum RuntimeState {
    Idle,
    Work(WorkRuntime),
    Break(BreakRuntime),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TimerEngine {
    runtime: RuntimeState,
    committed_break_ms: u64,
    last_observed_ms: Option<u64>,
}

impl Default for TimerEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl TimerEngine {
    pub const fn new() -> Self {
        Self {
            runtime: RuntimeState::Idle,
            committed_break_ms: 0,
            last_observed_ms: None,
        }
    }

    pub fn start_task(
        &mut self,
        task_id: TaskId,
        mode: TimerMode,
        now_ms: u64,
    ) -> Result<TimerSnapshot, TimerError> {
        mode.validate()?;
        if !matches!(self.runtime, RuntimeState::Idle) {
            return Err(TimerError::AlreadyActive);
        }

        self.apply(now_ms, |candidate| {
            candidate.committed_break_ms = 0;
            candidate.runtime = RuntimeState::Work(WorkRuntime {
                task_id,
                mode,
                phase: WorkPhase::Running,
                total_work_ms: 0,
                interval_work_ms: 0,
                run_started_ms: Some(now_ms),
            });
            Ok(())
        })
    }

    pub fn advance(&mut self, now_ms: u64) -> Result<TimerSnapshot, TimerError> {
        self.apply(now_ms, |_| Ok(()))
    }

    pub fn pause(&mut self, now_ms: u64) -> Result<TimerSnapshot, TimerError> {
        self.apply(now_ms, |candidate| {
            let state = candidate.state_kind();
            let RuntimeState::Work(work) = &mut candidate.runtime else {
                return Err(candidate.invalid(TimerAction::Pause, state));
            };
            if matches!(work.phase, WorkPhase::Paused | WorkPhase::OvertimePaused) {
                return Ok(());
            }
            if !work.phase.is_running() {
                return Err(candidate.invalid(TimerAction::Pause, state));
            }
            let started = work.run_started_ms.ok_or(TimerError::DurationOverflow)?;
            work.checkpoint_delta(now_ms - started)?;
            work.phase = work.phase.paused_variant();
            Ok(())
        })
    }

    pub fn resume(&mut self, now_ms: u64) -> Result<TimerSnapshot, TimerError> {
        self.apply(now_ms, |candidate| {
            let state = candidate.state_kind();
            let RuntimeState::Work(work) = &mut candidate.runtime else {
                return Err(candidate.invalid(TimerAction::Resume, state));
            };
            if work.phase.is_running() {
                return Ok(());
            }
            if !matches!(work.phase, WorkPhase::Paused | WorkPhase::OvertimePaused) {
                return Err(candidate.invalid(TimerAction::Resume, state));
            }
            work.phase = work.phase.running_variant();
            work.run_started_ms = Some(now_ms);
            Ok(())
        })
    }

    pub fn extend(&mut self, now_ms: u64) -> Result<TimerSnapshot, TimerError> {
        self.apply(now_ms, |candidate| {
            let state = candidate.state_kind();
            let RuntimeState::Work(work) = &mut candidate.runtime else {
                return Err(candidate.invalid(TimerAction::Extend, state));
            };
            if work.phase != WorkPhase::TimeUp {
                return Err(candidate.invalid(TimerAction::Extend, state));
            }
            work.phase = WorkPhase::OvertimeRunning;
            work.run_started_ms = Some(now_ms);
            Ok(())
        })
    }

    pub fn start_manual_break(
        &mut self,
        duration_ms: u64,
        now_ms: u64,
    ) -> Result<TimerSnapshot, TimerError> {
        if duration_ms == 0 {
            return Err(TimerError::ZeroDuration);
        }
        self.apply(now_ms, |candidate| {
            let state = candidate.state_kind();
            let RuntimeState::Work(mut work) = candidate.runtime.clone() else {
                return Err(candidate.invalid(TimerAction::StartManualBreak, state));
            };
            if work.phase == WorkPhase::TimeUp {
                return Err(candidate.invalid(TimerAction::StartManualBreak, state));
            }
            if work.phase.is_running() {
                let started = work.run_started_ms.ok_or(TimerError::DurationOverflow)?;
                work.checkpoint_delta(now_ms - started)?;
            }
            work.phase = work.phase.paused_variant();
            work.run_started_ms = None;
            candidate.runtime = RuntimeState::Break(BreakRuntime {
                kind: BreakKind::Manual,
                duration_ms,
                elapsed_ms: 0,
                run_started_ms: now_ms,
                resume_work: work,
            });
            Ok(())
        })
    }

    pub fn finish_break(&mut self, now_ms: u64) -> Result<TimerSnapshot, TimerError> {
        self.apply_without_automatic_break_completion(now_ms, |candidate| {
            candidate.leave_break(now_ms, false)
        })
    }

    pub fn skip_break(&mut self, now_ms: u64) -> Result<TimerSnapshot, TimerError> {
        self.apply_without_automatic_break_completion(now_ms, |candidate| {
            candidate.leave_break(now_ms, true)
        })
    }

    pub fn snapshot(&self, now_ms: u64) -> Result<TimerSnapshot, TimerError> {
        if let Some(previous_ms) = self.last_observed_ms {
            if now_ms < previous_ms {
                return Err(TimerError::ClockMovedBackwards {
                    previous_ms,
                    now_ms,
                });
            }
        }
        self.snapshot_inner(now_ms)
    }

    fn apply<F>(&mut self, now_ms: u64, mutation: F) -> Result<TimerSnapshot, TimerError>
    where
        F: FnOnce(&mut Self) -> Result<(), TimerError>,
    {
        let mut candidate = self.clone();
        candidate.observe(now_ms)?;
        candidate.advance_inner(now_ms)?;
        mutation(&mut candidate)?;
        candidate.advance_inner(now_ms)?;
        let snapshot = candidate.snapshot_inner(now_ms)?;
        *self = candidate;
        Ok(snapshot)
    }

    fn apply_without_automatic_break_completion<F>(
        &mut self,
        now_ms: u64,
        mutation: F,
    ) -> Result<TimerSnapshot, TimerError>
    where
        F: FnOnce(&mut Self) -> Result<(), TimerError>,
    {
        let mut candidate = self.clone();
        candidate.observe(now_ms)?;
        candidate.advance_work_only(now_ms)?;
        mutation(&mut candidate)?;
        candidate.advance_inner(now_ms)?;
        let snapshot = candidate.snapshot_inner(now_ms)?;
        *self = candidate;
        Ok(snapshot)
    }

    fn observe(&mut self, now_ms: u64) -> Result<(), TimerError> {
        if let Some(previous_ms) = self.last_observed_ms {
            if now_ms < previous_ms {
                return Err(TimerError::ClockMovedBackwards {
                    previous_ms,
                    now_ms,
                });
            }
        }
        self.last_observed_ms = Some(now_ms);
        Ok(())
    }

    fn invalid(&self, action: TimerAction, state: TimerStateKind) -> TimerError {
        if state == TimerStateKind::Idle {
            TimerError::NoActiveTask
        } else {
            TimerError::InvalidTransition { action, state }
        }
    }

    fn state_kind(&self) -> TimerStateKind {
        match &self.runtime {
            RuntimeState::Idle => TimerStateKind::Idle,
            RuntimeState::Work(work) => work.phase.state_kind(),
            RuntimeState::Break(_) => TimerStateKind::Break,
        }
    }

    fn advance_work_only(&mut self, now_ms: u64) -> Result<(), TimerError> {
        let RuntimeState::Work(work) = &mut self.runtime else {
            return Ok(());
        };
        Self::advance_work_runtime(work, now_ms).map(|transition| {
            if let Some(next_state) = transition {
                self.runtime = next_state;
            }
        })
    }

    fn advance_inner(&mut self, now_ms: u64) -> Result<(), TimerError> {
        for _ in 0..4 {
            match &mut self.runtime {
                RuntimeState::Idle => return Ok(()),
                RuntimeState::Work(work) => {
                    let Some(next_state) = Self::advance_work_runtime(work, now_ms)? else {
                        return Ok(());
                    };
                    self.runtime = next_state;
                }
                RuntimeState::Break(break_runtime) => {
                    let projected = break_runtime.projected_elapsed(now_ms)?;
                    if projected < break_runtime.duration_ms {
                        return Ok(());
                    }
                    let remaining = break_runtime
                        .duration_ms
                        .checked_sub(break_runtime.elapsed_ms)
                        .ok_or(TimerError::DurationOverflow)?;
                    let completed_at = break_runtime
                        .run_started_ms
                        .checked_add(remaining)
                        .ok_or(TimerError::DurationOverflow)?;
                    self.committed_break_ms = self
                        .committed_break_ms
                        .checked_add(break_runtime.duration_ms)
                        .ok_or(TimerError::DurationOverflow)?;
                    let mut work = break_runtime.resume_work.clone();
                    match break_runtime.kind {
                        BreakKind::Manual => {
                            work.phase = work.phase.running_variant();
                            work.run_started_ms = Some(completed_at);
                        }
                        BreakKind::Pomodoro => {
                            work.phase = WorkPhase::Paused;
                            work.run_started_ms = None;
                        }
                    }
                    self.runtime = RuntimeState::Work(work);
                }
            }
        }
        Err(TimerError::DurationOverflow)
    }

    fn advance_work_runtime(
        work: &mut WorkRuntime,
        now_ms: u64,
    ) -> Result<Option<RuntimeState>, TimerError> {
        if work.phase != WorkPhase::Running {
            return Ok(None);
        }
        let started = work.run_started_ms.ok_or(TimerError::DurationOverflow)?;
        let active_delta = now_ms - started;

        match work.mode {
            TimerMode::CountUp => Ok(None),
            TimerMode::EstCountdown { est_ms } => {
                let remaining = est_ms
                    .checked_sub(work.interval_work_ms)
                    .ok_or(TimerError::DurationOverflow)?;
                if active_delta < remaining {
                    return Ok(None);
                }
                work.checkpoint_delta(remaining)?;
                work.phase = WorkPhase::TimeUp;
                Ok(None)
            }
            TimerMode::Pomodoro { work_ms, break_ms } => {
                let remaining = work_ms
                    .checked_sub(work.interval_work_ms)
                    .ok_or(TimerError::DurationOverflow)?;
                if active_delta < remaining {
                    return Ok(None);
                }
                let break_started_ms = started
                    .checked_add(remaining)
                    .ok_or(TimerError::DurationOverflow)?;
                work.checkpoint_delta(remaining)?;
                let mut resume_work = work.clone();
                resume_work.phase = WorkPhase::Paused;
                resume_work.interval_work_ms = 0;
                resume_work.run_started_ms = None;
                Ok(Some(RuntimeState::Break(BreakRuntime {
                    kind: BreakKind::Pomodoro,
                    duration_ms: break_ms,
                    elapsed_ms: 0,
                    run_started_ms: break_started_ms,
                    resume_work,
                })))
            }
        }
    }

    fn leave_break(&mut self, now_ms: u64, skipped: bool) -> Result<(), TimerError> {
        let state = self.state_kind();
        let RuntimeState::Break(break_runtime) = self.runtime.clone() else {
            return Err(self.invalid(
                if skipped {
                    TimerAction::SkipBreak
                } else {
                    TimerAction::FinishBreak
                },
                state,
            ));
        };
        let projected = break_runtime.projected_elapsed(now_ms)?;
        let credited = projected.min(break_runtime.duration_ms);
        self.committed_break_ms = self
            .committed_break_ms
            .checked_add(credited)
            .ok_or(TimerError::DurationOverflow)?;
        let mut work = break_runtime.resume_work;
        if skipped || break_runtime.kind == BreakKind::Pomodoro {
            work.phase = work.phase.paused_variant();
            work.run_started_ms = None;
        } else {
            work.phase = work.phase.running_variant();
            work.run_started_ms = Some(now_ms);
        }
        self.runtime = RuntimeState::Work(work);
        Ok(())
    }

    fn snapshot_inner(&self, now_ms: u64) -> Result<TimerSnapshot, TimerError> {
        match &self.runtime {
            RuntimeState::Idle => Ok(TimerSnapshot::idle()),
            RuntimeState::Work(work) => {
                let work_elapsed_ms = work.projected_total(now_ms)?;
                let interval_elapsed_ms = work.projected_interval(now_ms)?;
                let (countdown_remaining_ms, overtime_ms) = match work.mode {
                    TimerMode::CountUp => (None, 0),
                    TimerMode::EstCountdown { est_ms } => (
                        Some(est_ms.saturating_sub(interval_elapsed_ms)),
                        work_elapsed_ms.saturating_sub(est_ms),
                    ),
                    TimerMode::Pomodoro { work_ms, .. } => {
                        (Some(work_ms.saturating_sub(interval_elapsed_ms)), 0)
                    }
                };
                Ok(TimerSnapshot {
                    state: work.phase.state_kind(),
                    task_id: Some(work.task_id),
                    mode: Some(work.mode),
                    work_elapsed_ms,
                    total_break_ms: self.committed_break_ms,
                    countdown_remaining_ms,
                    overtime_ms,
                    break_kind: None,
                    break_remaining_ms: None,
                })
            }
            RuntimeState::Break(break_runtime) => {
                let current_break_elapsed = break_runtime.projected_elapsed(now_ms)?;
                let total_break_ms = self
                    .committed_break_ms
                    .checked_add(current_break_elapsed)
                    .ok_or(TimerError::DurationOverflow)?;
                Ok(TimerSnapshot {
                    state: TimerStateKind::Break,
                    task_id: Some(break_runtime.resume_work.task_id),
                    mode: Some(break_runtime.resume_work.mode),
                    work_elapsed_ms: break_runtime.resume_work.total_work_ms,
                    total_break_ms,
                    countdown_remaining_ms: None,
                    overtime_ms: match break_runtime.resume_work.mode {
                        TimerMode::EstCountdown { est_ms } => break_runtime
                            .resume_work
                            .total_work_ms
                            .saturating_sub(est_ms),
                        _ => 0,
                    },
                    break_kind: Some(break_runtime.kind),
                    break_remaining_ms: Some(
                        break_runtime
                            .duration_ms
                            .saturating_sub(current_break_elapsed),
                    ),
                })
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    fn task(slot: u128) -> TaskId {
        TaskId::from_uuid(Uuid::from_u128(slot))
    }

    #[test]
    fn timer_mode_selection_matches_product_precedence() {
        assert_eq!(
            TimerMode::from_seconds(None, None).unwrap(),
            TimerMode::CountUp
        );
        assert_eq!(
            TimerMode::from_seconds(Some(90), None).unwrap(),
            TimerMode::EstCountdown { est_ms: 90_000 }
        );
        assert_eq!(
            TimerMode::from_seconds(Some(90), Some((25 * 60, 5 * 60))).unwrap(),
            TimerMode::Pomodoro {
                work_ms: 1_500_000,
                break_ms: 300_000
            }
        );
        assert!(matches!(
            TimerMode::from_seconds(None, Some((0, 300))),
            Err(TimerError::ZeroDuration)
        ));
    }

    #[test]
    fn count_up_accumulates_only_running_work_and_pause_resume_are_idempotent() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(task(1), TimerMode::CountUp, 1_000)
            .unwrap();
        assert_eq!(engine.advance(4_000).unwrap().work_elapsed_ms, 3_000);

        let paused = engine.pause(5_000).unwrap();
        assert_eq!(paused.state, TimerStateKind::Paused);
        assert_eq!(paused.work_elapsed_ms, 4_000);
        assert_eq!(engine.pause(7_000).unwrap(), paused);
        assert_eq!(engine.advance(10_000).unwrap().work_elapsed_ms, 4_000);

        let resumed = engine.resume(10_000).unwrap();
        assert_eq!(resumed.state, TimerStateKind::Running);
        assert_eq!(engine.resume(11_000).unwrap().work_elapsed_ms, 5_000);
        assert_eq!(engine.advance(13_000).unwrap().work_elapsed_ms, 7_000);
    }

    #[test]
    fn est_countdown_enters_time_up_exactly_and_extend_exposes_overtime() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(task(2), TimerMode::EstCountdown { est_ms: 10_000 }, 0)
            .unwrap();
        let before = engine.advance(9_000).unwrap();
        assert_eq!(before.state, TimerStateKind::Running);
        assert_eq!(before.countdown_remaining_ms, Some(1_000));

        let time_up = engine.advance(12_000).unwrap();
        assert_eq!(time_up.state, TimerStateKind::TimeUp);
        assert_eq!(time_up.work_elapsed_ms, 10_000);
        assert_eq!(time_up.countdown_remaining_ms, Some(0));
        assert_eq!(engine.advance(20_000).unwrap().work_elapsed_ms, 10_000);

        let extended = engine.extend(20_000).unwrap();
        assert_eq!(extended.state, TimerStateKind::Overtime);
        let overtime = engine.advance(23_500).unwrap();
        assert_eq!(overtime.work_elapsed_ms, 13_500);
        assert_eq!(overtime.overtime_ms, 3_500);
        assert_eq!(overtime.countdown_remaining_ms, Some(0));
    }

    #[test]
    fn pomodoro_late_tick_enters_break_at_exact_threshold_and_break_expiry_pauses_work() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(
                task(3),
                TimerMode::Pomodoro {
                    work_ms: 10_000,
                    break_ms: 5_000,
                },
                1_000,
            )
            .unwrap();

        let break_snapshot = engine.advance(13_000).unwrap();
        assert_eq!(break_snapshot.state, TimerStateKind::Break);
        assert_eq!(break_snapshot.break_kind, Some(BreakKind::Pomodoro));
        assert_eq!(break_snapshot.work_elapsed_ms, 10_000);
        assert_eq!(break_snapshot.total_break_ms, 2_000);
        assert_eq!(break_snapshot.break_remaining_ms, Some(3_000));

        let awaiting_resume = engine.advance(20_000).unwrap();
        assert_eq!(awaiting_resume.state, TimerStateKind::Paused);
        assert_eq!(awaiting_resume.work_elapsed_ms, 10_000);
        assert_eq!(awaiting_resume.total_break_ms, 5_000);
        assert_eq!(awaiting_resume.countdown_remaining_ms, Some(10_000));
        assert_eq!(engine.advance(30_000).unwrap().work_elapsed_ms, 10_000);
    }

    #[test]
    fn manual_break_natural_completion_resumes_work_and_never_counts_break_as_work() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(4), TimerMode::CountUp, 0).unwrap();
        engine.start_manual_break(5_000, 4_000).unwrap();

        let during = engine.advance(7_000).unwrap();
        assert_eq!(during.state, TimerStateKind::Break);
        assert_eq!(during.work_elapsed_ms, 4_000);
        assert_eq!(during.total_break_ms, 3_000);

        let after = engine.advance(12_000).unwrap();
        assert_eq!(after.state, TimerStateKind::Running);
        assert_eq!(after.total_break_ms, 5_000);
        assert_eq!(after.work_elapsed_ms, 7_000);
    }

    #[test]
    fn skipped_manual_break_leaves_task_paused() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(5), TimerMode::CountUp, 0).unwrap();
        engine.start_manual_break(10_000, 2_000).unwrap();
        let skipped = engine.skip_break(5_000).unwrap();
        assert_eq!(skipped.state, TimerStateKind::Paused);
        assert_eq!(skipped.work_elapsed_ms, 2_000);
        assert_eq!(skipped.total_break_ms, 3_000);
        assert_eq!(engine.advance(20_000).unwrap().work_elapsed_ms, 2_000);
    }

    #[test]
    fn explicitly_finishing_manual_break_resumes_but_finishing_pomodoro_waits_for_resume() {
        let mut manual = TimerEngine::new();
        manual.start_task(task(6), TimerMode::CountUp, 0).unwrap();
        manual.start_manual_break(10_000, 1_000).unwrap();
        let resumed = manual.finish_break(3_000).unwrap();
        assert_eq!(resumed.state, TimerStateKind::Running);
        assert_eq!(resumed.total_break_ms, 2_000);

        let mut pomodoro = TimerEngine::new();
        pomodoro
            .start_task(
                task(7),
                TimerMode::Pomodoro {
                    work_ms: 1_000,
                    break_ms: 10_000,
                },
                0,
            )
            .unwrap();
        pomodoro.advance(1_000).unwrap();
        let paused = pomodoro.finish_break(3_000).unwrap();
        assert_eq!(paused.state, TimerStateKind::Paused);
        assert_eq!(paused.work_elapsed_ms, 1_000);
        assert_eq!(paused.total_break_ms, 2_000);
    }

    #[test]
    fn backwards_clock_is_rejected_without_partial_mutation() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(task(8), TimerMode::CountUp, 5_000)
            .unwrap();
        let before = engine.advance(8_000).unwrap();
        assert!(matches!(
            engine.pause(7_000),
            Err(TimerError::ClockMovedBackwards {
                previous_ms: 8_000,
                now_ms: 7_000
            })
        ));
        assert_eq!(engine.snapshot(8_000).unwrap(), before);
    }

    #[test]
    fn illegal_transitions_do_not_replace_active_state() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(9), TimerMode::CountUp, 0).unwrap();
        let before = engine.advance(1_000).unwrap();
        assert_eq!(
            engine.start_task(task(10), TimerMode::CountUp, 1_000),
            Err(TimerError::AlreadyActive)
        );
        assert!(matches!(
            engine.extend(1_000),
            Err(TimerError::InvalidTransition {
                action: TimerAction::Extend,
                state: TimerStateKind::Running
            })
        ));
        assert_eq!(engine.snapshot(1_000).unwrap(), before);
    }
}
