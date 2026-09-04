use super::{
    BreakKind, RuntimeState, TimerEngine, TimerError, TimerMode, TimerStateKind, WorkPhase,
    WorkRuntime,
};
use crate::domain::ids::TaskId;
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimerCheckpoint {
    pub state: TimerStateKind,
    pub task_id: TaskId,
    pub mode: TimerMode,
    pub work_elapsed_ms: u64,
    pub interval_work_ms: u64,
    pub total_break_ms: u64,
    pub break_kind: Option<BreakKind>,
    pub break_elapsed_ms: u64,
    pub break_duration_ms: Option<u64>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TimerCheckpointError {
    Timer(TimerError),
    IdleCheckpoint,
    InvalidBreakShape,
    InvalidModeProgress,
}

impl Display for TimerCheckpointError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Timer(error) => Display::fmt(error, formatter),
            Self::IdleCheckpoint => formatter.write_str("idle timer state cannot be persisted as an active runtime checkpoint"),
            Self::InvalidBreakShape => formatter.write_str("timer checkpoint break fields do not match the stored timer state"),
            Self::InvalidModeProgress => formatter.write_str("timer checkpoint progress is inconsistent with its timer mode/state"),
        }
    }
}

impl std::error::Error for TimerCheckpointError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Timer(error) => Some(error),
            _ => None,
        }
    }
}

impl From<TimerError> for TimerCheckpointError {
    fn from(value: TimerError) -> Self {
        Self::Timer(value)
    }
}

impl TimerCheckpoint {
    pub fn validate(&self) -> Result<(), TimerCheckpointError> {
        self.mode.validate()?;
        if self.state == TimerStateKind::Idle {
            return Err(TimerCheckpointError::IdleCheckpoint);
        }

        if self.state == TimerStateKind::Break {
            let Some(duration_ms) = self.break_duration_ms else {
                return Err(TimerCheckpointError::InvalidBreakShape);
            };
            if self.break_kind.is_none()
                || duration_ms == 0
                || self.break_elapsed_ms > duration_ms
            {
                return Err(TimerCheckpointError::InvalidBreakShape);
            }
        } else if self.break_kind.is_some()
            || self.break_elapsed_ms != 0
            || self.break_duration_ms.is_some()
        {
            return Err(TimerCheckpointError::InvalidBreakShape);
        }

        match self.mode {
            TimerMode::CountUp => {
                if matches!(
                    self.state,
                    TimerStateKind::TimeUp
                        | TimerStateKind::OvertimeRunning
                        | TimerStateKind::OvertimePaused
                ) {
                    return Err(TimerCheckpointError::InvalidModeProgress);
                }
            }
            TimerMode::EstCountdown { est_ms } => match self.state {
                TimerStateKind::Running | TimerStateKind::Paused => {
                    if self.interval_work_ms >= est_ms {
                        return Err(TimerCheckpointError::InvalidModeProgress);
                    }
                }
                TimerStateKind::TimeUp => {
                    if self.interval_work_ms != est_ms || self.work_elapsed_ms != est_ms {
                        return Err(TimerCheckpointError::InvalidModeProgress);
                    }
                }
                TimerStateKind::OvertimeRunning | TimerStateKind::OvertimePaused => {
                    if self.interval_work_ms < est_ms || self.work_elapsed_ms < est_ms {
                        return Err(TimerCheckpointError::InvalidModeProgress);
                    }
                }
                TimerStateKind::Break => {}
                TimerStateKind::Idle => return Err(TimerCheckpointError::IdleCheckpoint),
            },
            TimerMode::Pomodoro { work_ms, .. } => {
                if matches!(
                    self.state,
                    TimerStateKind::TimeUp
                        | TimerStateKind::OvertimeRunning
                        | TimerStateKind::OvertimePaused
                ) || self.interval_work_ms >= work_ms
                {
                    return Err(TimerCheckpointError::InvalidModeProgress);
                }
            }
        }

        Ok(())
    }
}

impl TimerEngine {
    pub fn recovery_checkpoint(
        &self,
        now_ms: u64,
    ) -> Result<Option<TimerCheckpoint>, TimerError> {
        if let Some(previous_ms) = self.last_observed_ms {
            if now_ms < previous_ms {
                return Err(TimerError::ClockMovedBackwards {
                    previous_ms,
                    now_ms,
                });
            }
        }

        let mut candidate = self.clone();
        candidate.advance_inner(now_ms)?;
        match &candidate.runtime {
            RuntimeState::Idle => Ok(None),
            RuntimeState::Work(work) => Ok(Some(TimerCheckpoint {
                state: work.phase.state_kind(),
                task_id: work.task_id,
                mode: work.mode,
                work_elapsed_ms: work.projected_total(now_ms)?,
                interval_work_ms: work.projected_interval(now_ms)?,
                total_break_ms: candidate.committed_break_ms,
                break_kind: None,
                break_elapsed_ms: 0,
                break_duration_ms: None,
            })),
            RuntimeState::Break(break_runtime) => {
                let break_elapsed_ms = break_runtime
                    .projected_elapsed(now_ms)?
                    .min(break_runtime.duration_ms);
                Ok(Some(TimerCheckpoint {
                    state: TimerStateKind::Break,
                    task_id: break_runtime.resume_work.task_id,
                    mode: break_runtime.resume_work.mode,
                    work_elapsed_ms: break_runtime.resume_work.total_work_ms,
                    interval_work_ms: break_runtime.resume_work.interval_work_ms,
                    total_break_ms: candidate
                        .committed_break_ms
                        .checked_add(break_elapsed_ms)
                        .ok_or(TimerError::DurationOverflow)?,
                    break_kind: Some(break_runtime.kind),
                    break_elapsed_ms,
                    break_duration_ms: Some(break_runtime.duration_ms),
                }))
            }
        }
    }

    pub fn restore_checkpoint_paused(
        checkpoint: &TimerCheckpoint,
        now_ms: u64,
    ) -> Result<Self, TimerCheckpointError> {
        checkpoint.validate()?;
        let phase = match checkpoint.state {
            TimerStateKind::TimeUp => WorkPhase::TimeUp,
            TimerStateKind::OvertimeRunning | TimerStateKind::OvertimePaused => {
                WorkPhase::OvertimePaused
            }
            TimerStateKind::Running
            | TimerStateKind::Paused
            | TimerStateKind::Break => WorkPhase::Paused,
            TimerStateKind::Idle => return Err(TimerCheckpointError::IdleCheckpoint),
        };

        Ok(Self {
            runtime: RuntimeState::Work(WorkRuntime {
                task_id: checkpoint.task_id,
                mode: checkpoint.mode,
                phase,
                total_work_ms: checkpoint.work_elapsed_ms,
                interval_work_ms: checkpoint.interval_work_ms,
                run_started_ms: None,
            }),
            committed_break_ms: checkpoint.total_break_ms,
            last_observed_ms: Some(now_ms),
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
    fn running_checkpoint_restores_paused_without_counting_downtime() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(1), TimerMode::CountUp, 1_000).unwrap();
        let checkpoint = engine
            .recovery_checkpoint(6_000)
            .unwrap()
            .expect("active checkpoint");
        assert_eq!(checkpoint.state, TimerStateKind::Running);
        assert_eq!(checkpoint.work_elapsed_ms, 5_000);

        let restored = TimerEngine::restore_checkpoint_paused(&checkpoint, 60_000).unwrap();
        let snapshot = restored.snapshot(90_000).unwrap();
        assert_eq!(snapshot.state, TimerStateKind::Paused);
        assert_eq!(snapshot.work_elapsed_ms, 5_000);
    }

    #[test]
    fn time_up_and_overtime_recovery_preserve_decision_semantics() {
        let mut time_up = TimerEngine::new();
        time_up
            .start_task(task(2), TimerMode::EstCountdown { est_ms: 5_000 }, 0)
            .unwrap();
        let checkpoint = time_up
            .recovery_checkpoint(8_000)
            .unwrap()
            .expect("Time's Up checkpoint");
        assert_eq!(checkpoint.state, TimerStateKind::TimeUp);
        let restored = TimerEngine::restore_checkpoint_paused(&checkpoint, 20_000).unwrap();
        assert_eq!(restored.snapshot(30_000).unwrap().state, TimerStateKind::TimeUp);

        let mut overtime = restored;
        overtime.extend(30_000).unwrap();
        let checkpoint = overtime
            .recovery_checkpoint(33_000)
            .unwrap()
            .expect("overtime checkpoint");
        let restored = TimerEngine::restore_checkpoint_paused(&checkpoint, 90_000).unwrap();
        let snapshot = restored.snapshot(120_000).unwrap();
        assert_eq!(snapshot.state, TimerStateKind::OvertimePaused);
        assert_eq!(snapshot.work_elapsed_ms, 8_000);
        assert_eq!(snapshot.overtime_ms, 3_000);
    }

    #[test]
    fn break_recovery_becomes_paused_and_preserves_partial_break_credit() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(3), TimerMode::CountUp, 0).unwrap();
        engine.start_manual_break(10_000, 4_000).unwrap();
        let checkpoint = engine
            .recovery_checkpoint(7_000)
            .unwrap()
            .expect("break checkpoint");
        assert_eq!(checkpoint.state, TimerStateKind::Break);
        assert_eq!(checkpoint.work_elapsed_ms, 4_000);
        assert_eq!(checkpoint.break_elapsed_ms, 3_000);
        assert_eq!(checkpoint.total_break_ms, 3_000);

        let restored = TimerEngine::restore_checkpoint_paused(&checkpoint, 100_000).unwrap();
        let snapshot = restored.snapshot(150_000).unwrap();
        assert_eq!(snapshot.state, TimerStateKind::Paused);
        assert_eq!(snapshot.work_elapsed_ms, 4_000);
        assert_eq!(snapshot.total_break_ms, 3_000);
    }

    #[test]
    fn malformed_checkpoint_shapes_are_rejected() {
        let invalid = TimerCheckpoint {
            state: TimerStateKind::Break,
            task_id: task(4),
            mode: TimerMode::CountUp,
            work_elapsed_ms: 1_000,
            interval_work_ms: 1_000,
            total_break_ms: 0,
            break_kind: None,
            break_elapsed_ms: 0,
            break_duration_ms: None,
        };
        assert_eq!(
            invalid.validate(),
            Err(TimerCheckpointError::InvalidBreakShape)
        );
    }
}
