use super::{
    RuntimeState, TimerEngine, TimerError, TimerMode, TimerSnapshot, TimerStateKind, WorkPhase,
    WorkRuntime,
};
use crate::domain::ids::TaskId;
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

const RECOVERY_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub(crate) struct TimerRecoveryCheckpoint {
    pub(crate) schema_version: u32,
    pub(crate) task_id: TaskId,
    pub(crate) mode: TimerMode,
    pub(crate) state: TimerStateKind,
    pub(crate) work_elapsed_ms: u64,
    pub(crate) interval_work_ms: u64,
    pub(crate) total_break_ms: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TimerRecoveryError {
    Timer(TimerError),
    UnsupportedSchemaVersion(u32),
    IdleCheckpoint,
    InvalidCheckpoint(&'static str),
}

impl Display for TimerRecoveryError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Timer(error) => Display::fmt(error, formatter),
            Self::UnsupportedSchemaVersion(version) => {
                write!(
                    formatter,
                    "unsupported timer recovery checkpoint version: {version}"
                )
            }
            Self::IdleCheckpoint => {
                formatter.write_str("idle timer state must not have a recovery checkpoint")
            }
            Self::InvalidCheckpoint(reason) => {
                write!(formatter, "invalid timer recovery checkpoint: {reason}")
            }
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

impl TimerEngine {
    pub(crate) fn recovery_checkpoint(
        &self,
        now_ms: u64,
    ) -> Result<TimerRecoveryCheckpoint, TimerRecoveryError> {
        if let Some(previous_ms) = self.last_observed_ms {
            if now_ms < previous_ms {
                return Err(TimerError::ClockMovedBackwards {
                    previous_ms,
                    now_ms,
                }
                .into());
            }
        }

        let mut candidate = self.clone();
        candidate.advance_inner(now_ms)?;
        match &candidate.runtime {
            RuntimeState::Idle => Err(TimerRecoveryError::IdleCheckpoint),
            RuntimeState::Work(work) => Ok(TimerRecoveryCheckpoint {
                schema_version: RECOVERY_SCHEMA_VERSION,
                task_id: work.task_id,
                mode: work.mode,
                state: work.phase.state_kind(),
                work_elapsed_ms: work.projected_total(now_ms)?,
                interval_work_ms: work.projected_interval(now_ms)?,
                total_break_ms: candidate.committed_break_ms,
            }),
            RuntimeState::Break(break_runtime) => {
                let current_break_ms = break_runtime.projected_elapsed(now_ms)?;
                let total_break_ms = candidate
                    .committed_break_ms
                    .checked_add(current_break_ms)
                    .ok_or(TimerError::DurationOverflow)?;
                Ok(TimerRecoveryCheckpoint {
                    schema_version: RECOVERY_SCHEMA_VERSION,
                    task_id: break_runtime.resume_work.task_id,
                    mode: break_runtime.resume_work.mode,
                    state: TimerStateKind::Break,
                    work_elapsed_ms: break_runtime.resume_work.total_work_ms,
                    interval_work_ms: break_runtime.resume_work.interval_work_ms,
                    total_break_ms,
                })
            }
        }
    }

    pub(crate) fn restore_interrupted_paused(
        checkpoint: TimerRecoveryCheckpoint,
        now_ms: u64,
    ) -> Result<(Self, TimerSnapshot), TimerRecoveryError> {
        if checkpoint.schema_version != RECOVERY_SCHEMA_VERSION {
            return Err(TimerRecoveryError::UnsupportedSchemaVersion(
                checkpoint.schema_version,
            ));
        }
        checkpoint.mode.validate()?;
        if checkpoint.state == TimerStateKind::Idle {
            return Err(TimerRecoveryError::IdleCheckpoint);
        }
        if checkpoint.interval_work_ms > checkpoint.work_elapsed_ms {
            return Err(TimerRecoveryError::InvalidCheckpoint(
                "interval work exceeds total work",
            ));
        }

        let phase = recovered_phase(&checkpoint)?;
        let engine = Self {
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
        };
        let snapshot = engine.snapshot_inner(now_ms)?;
        Ok((engine, snapshot))
    }
}

fn recovered_phase(checkpoint: &TimerRecoveryCheckpoint) -> Result<WorkPhase, TimerRecoveryError> {
    match checkpoint.state {
        TimerStateKind::Running | TimerStateKind::Paused => validate_normal_paused(checkpoint),
        TimerStateKind::TimeUp => match checkpoint.mode {
            TimerMode::EstCountdown { est_ms } if checkpoint.work_elapsed_ms == est_ms => {
                Ok(WorkPhase::TimeUp)
            }
            _ => Err(TimerRecoveryError::InvalidCheckpoint(
                "Time's Up requires work exactly at the EST boundary",
            )),
        },
        TimerStateKind::OvertimeRunning | TimerStateKind::OvertimePaused => match checkpoint.mode {
            TimerMode::EstCountdown { est_ms } if checkpoint.work_elapsed_ms > est_ms => {
                Ok(WorkPhase::OvertimePaused)
            }
            _ => Err(TimerRecoveryError::InvalidCheckpoint(
                "overtime requires work beyond the EST boundary",
            )),
        },
        TimerStateKind::Break => match checkpoint.mode {
            TimerMode::EstCountdown { est_ms } if checkpoint.work_elapsed_ms > est_ms => {
                Ok(WorkPhase::OvertimePaused)
            }
            TimerMode::EstCountdown { est_ms } if checkpoint.work_elapsed_ms == est_ms => {
                Ok(WorkPhase::TimeUp)
            }
            _ => validate_normal_paused(checkpoint),
        },
        TimerStateKind::Idle => Err(TimerRecoveryError::IdleCheckpoint),
    }
}

fn validate_normal_paused(
    checkpoint: &TimerRecoveryCheckpoint,
) -> Result<WorkPhase, TimerRecoveryError> {
    match checkpoint.mode {
        TimerMode::CountUp => {
            if checkpoint.interval_work_ms != checkpoint.work_elapsed_ms {
                return Err(TimerRecoveryError::InvalidCheckpoint(
                    "count-up interval work must equal total work",
                ));
            }
        }
        TimerMode::EstCountdown { est_ms } => {
            if checkpoint.work_elapsed_ms >= est_ms {
                return Err(TimerRecoveryError::InvalidCheckpoint(
                    "normal EST state must remain before the EST boundary",
                ));
            }
            if checkpoint.interval_work_ms != checkpoint.work_elapsed_ms {
                return Err(TimerRecoveryError::InvalidCheckpoint(
                    "EST interval work must equal total work",
                ));
            }
        }
        TimerMode::Pomodoro { work_ms, .. } => {
            if checkpoint.interval_work_ms >= work_ms {
                return Err(TimerRecoveryError::InvalidCheckpoint(
                    "Pomodoro interval work must remain below its work boundary",
                ));
            }
        }
    }
    Ok(WorkPhase::Paused)
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    fn task() -> TaskId {
        TaskId::from_uuid(Uuid::from_u128(0x4000))
    }

    #[test]
    fn running_checkpoint_restores_paused_without_counting_downtime() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(), TimerMode::CountUp, 0).unwrap();
        let checkpoint = engine.recovery_checkpoint(5_000).unwrap();
        let (_, restored) = TimerEngine::restore_interrupted_paused(checkpoint, 500_000).unwrap();
        assert_eq!(restored.state, TimerStateKind::Paused);
        assert_eq!(restored.work_elapsed_ms, 5_000);
    }

    #[test]
    fn est_and_pomodoro_checkpoint_shapes_restore_safely() {
        let mut est = TimerEngine::new();
        est.start_task(task(), TimerMode::EstCountdown { est_ms: 5_000 }, 0)
            .unwrap();
        let at_limit = est.recovery_checkpoint(8_000).unwrap();
        let (_, restored_limit) =
            TimerEngine::restore_interrupted_paused(at_limit, 99_000).unwrap();
        assert_eq!(restored_limit.state, TimerStateKind::TimeUp);
        assert_eq!(restored_limit.work_elapsed_ms, 5_000);

        let mut pomodoro = TimerEngine::new();
        pomodoro
            .start_task(
                task(),
                TimerMode::Pomodoro {
                    work_ms: 2_000,
                    break_ms: 3_000,
                },
                0,
            )
            .unwrap();
        let on_break = pomodoro.recovery_checkpoint(2_500).unwrap();
        assert_eq!(on_break.state, TimerStateKind::Break);
        let (_, restored_break) =
            TimerEngine::restore_interrupted_paused(on_break, 99_000).unwrap();
        assert_eq!(restored_break.state, TimerStateKind::Paused);
        assert_eq!(restored_break.work_elapsed_ms, 2_000);
        assert_eq!(restored_break.countdown_remaining_ms, Some(2_000));
    }
}
