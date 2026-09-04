use super::{
    BreakKind, RuntimeState, TimerEngine, TimerError, TimerMode, TimerStateKind, WorkPhase,
    WorkRuntime,
};
use crate::domain::ids::TaskId;
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimerRecoveryState {
    pub task_id: TaskId,
    pub mode: TimerMode,
    pub state: TimerStateKind,
    pub work_elapsed_ms: u64,
    pub interval_work_ms: u64,
    pub total_break_ms: u64,
    pub active_segment_elapsed_ms: Option<u64>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TimerRecoveryError {
    Timer(TimerError),
    IdleState,
    InvalidWorkAccounting,
    InvalidActiveSegment,
    InvalidStateForMode,
}

impl Display for TimerRecoveryError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Timer(error) => Display::fmt(error, formatter),
            Self::IdleState => formatter.write_str("idle timer has no recoverable focus runtime"),
            Self::InvalidWorkAccounting => formatter.write_str(
                "timer recovery interval work cannot exceed total accumulated work",
            ),
            Self::InvalidActiveSegment => formatter.write_str(
                "timer recovery active-segment shape does not match the persisted timer state",
            ),
            Self::InvalidStateForMode => formatter.write_str(
                "timer recovery state is incompatible with the persisted timer mode",
            ),
        }
    }
}

impl std::error::Error for TimerRecoveryError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Timer(error) => Some(error),
            _ => None,
        }
    }
}

impl From<TimerError> for TimerRecoveryError {
    fn from(value: TimerError) -> Self {
        Self::Timer(value)
    }
}

impl TimerRecoveryState {
    fn validate(&self) -> Result<(), TimerRecoveryError> {
        self.mode.validate()?;
        if self.state == TimerStateKind::Idle {
            return Err(TimerRecoveryError::IdleState);
        }
        if self.interval_work_ms > self.work_elapsed_ms {
            return Err(TimerRecoveryError::InvalidWorkAccounting);
        }

        let expects_active_segment = matches!(
            self.state,
            TimerStateKind::Running | TimerStateKind::Break | TimerStateKind::OvertimeRunning
        );
        if expects_active_segment != self.active_segment_elapsed_ms.is_some() {
            return Err(TimerRecoveryError::InvalidActiveSegment);
        }

        if matches!(
            self.state,
            TimerStateKind::TimeUp
                | TimerStateKind::OvertimeRunning
                | TimerStateKind::OvertimePaused
        ) && !matches!(self.mode, TimerMode::EstCountdown { .. })
        {
            return Err(TimerRecoveryError::InvalidStateForMode);
        }
        Ok(())
    }
}

impl TimerEngine {
    pub fn recovery_state(
        &self,
        now_ms: u64,
    ) -> Result<Option<TimerRecoveryState>, TimerRecoveryError> {
        let mut candidate = self.clone();
        candidate.observe(now_ms)?;
        candidate.advance_inner(now_ms)?;

        let recovery = match &candidate.runtime {
            RuntimeState::Idle => return Ok(None),
            RuntimeState::Work(work) => {
                let work_elapsed_ms = work.projected_total(now_ms)?;
                let interval_work_ms = work.projected_interval(now_ms)?;
                TimerRecoveryState {
                    task_id: work.task_id,
                    mode: work.mode,
                    state: work.phase.state_kind(),
                    work_elapsed_ms,
                    interval_work_ms,
                    total_break_ms: candidate.committed_break_ms,
                    active_segment_elapsed_ms: work
                        .phase
                        .is_running()
                        .then(|| work.active_delta(now_ms)),
                }
            }
            RuntimeState::Break(break_runtime) => {
                let current_break_ms = break_runtime.projected_elapsed(now_ms)?;
                TimerRecoveryState {
                    task_id: break_runtime.resume_work.task_id,
                    mode: break_runtime.resume_work.mode,
                    state: TimerStateKind::Break,
                    work_elapsed_ms: break_runtime.resume_work.total_work_ms,
                    interval_work_ms: break_runtime.resume_work.interval_work_ms,
                    total_break_ms: candidate
                        .committed_break_ms
                        .checked_add(current_break_ms)
                        .ok_or(TimerError::DurationOverflow)?,
                    active_segment_elapsed_ms: Some(current_break_ms),
                }
            }
        };
        recovery.validate()?;
        Ok(Some(recovery))
    }

    pub fn from_recovery_paused(
        recovery: TimerRecoveryState,
    ) -> Result<Self, TimerRecoveryError> {
        recovery.validate()?;
        let phase = match recovery.state {
            TimerStateKind::Idle => return Err(TimerRecoveryError::IdleState),
            TimerStateKind::TimeUp => WorkPhase::TimeUp,
            TimerStateKind::OvertimeRunning | TimerStateKind::OvertimePaused => {
                WorkPhase::OvertimePaused
            }
            TimerStateKind::Running | TimerStateKind::Paused | TimerStateKind::Break => {
                WorkPhase::Paused
            }
        };

        Ok(Self {
            runtime: RuntimeState::Work(WorkRuntime {
                task_id: recovery.task_id,
                mode: recovery.mode,
                phase,
                total_work_ms: recovery.work_elapsed_ms,
                interval_work_ms: recovery.interval_work_ms,
                run_started_ms: None,
            }),
            committed_break_ms: recovery.total_break_ms,
            last_observed_ms: None,
        })
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
    fn running_checkpoint_preserves_exact_monotonic_work_and_segment_elapsed() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(1), TimerMode::CountUp, 1_000).unwrap();

        let recovery = engine.recovery_state(6_500).unwrap().unwrap();
        assert_eq!(recovery.state, TimerStateKind::Running);
        assert_eq!(recovery.work_elapsed_ms, 5_500);
        assert_eq!(recovery.interval_work_ms, 5_500);
        assert_eq!(recovery.active_segment_elapsed_ms, Some(5_500));
    }

    #[test]
    fn break_checkpoint_restores_underlying_work_paused_without_counting_downtime() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(2), TimerMode::CountUp, 0).unwrap();
        engine.start_manual_break(10_000, 4_000).unwrap();

        let recovery = engine.recovery_state(7_000).unwrap().unwrap();
        assert_eq!(recovery.state, TimerStateKind::Break);
        assert_eq!(recovery.work_elapsed_ms, 4_000);
        assert_eq!(recovery.total_break_ms, 3_000);
        assert_eq!(recovery.active_segment_elapsed_ms, Some(3_000));

        let restored = TimerEngine::from_recovery_paused(recovery).unwrap();
        let snapshot = restored.snapshot(500_000).unwrap();
        assert_eq!(snapshot.state, TimerStateKind::Paused);
        assert_eq!(snapshot.work_elapsed_ms, 4_000);
        assert_eq!(snapshot.total_break_ms, 3_000);
    }

    #[test]
    fn time_up_and_overtime_recovery_keep_their_semantic_state() {
        let mut time_up = TimerEngine::new();
        time_up
            .start_task(task(3), TimerMode::EstCountdown { est_ms: 5_000 }, 0)
            .unwrap();
        time_up.advance(6_000).unwrap();
        let saved = time_up.recovery_state(6_000).unwrap().unwrap();
        let restored = TimerEngine::from_recovery_paused(saved).unwrap();
        assert_eq!(restored.snapshot(0).unwrap().state, TimerStateKind::TimeUp);

        let mut overtime = time_up;
        overtime.extend(6_000).unwrap();
        let saved = overtime.recovery_state(8_000).unwrap().unwrap();
        let restored = TimerEngine::from_recovery_paused(saved).unwrap();
        let snapshot = restored.snapshot(0).unwrap();
        assert_eq!(snapshot.state, TimerStateKind::OvertimePaused);
        assert_eq!(snapshot.work_elapsed_ms, 7_000);
        assert_eq!(snapshot.overtime_ms, 2_000);
    }
}
