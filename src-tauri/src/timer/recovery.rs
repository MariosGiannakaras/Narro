use super::{
    RuntimeState, TimerEngine, TimerError, TimerMode, TimerSnapshot, WorkPhase, WorkRuntime,
};
use crate::domain::ids::TaskId;
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TimerRecoveryError {
    Timer(TimerError),
    PomodoroBoundaryAmbiguous {
        persisted_work_ms: u64,
        work_interval_ms: u64,
    },
}

impl Display for TimerRecoveryError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Timer(error) => Display::fmt(error, formatter),
            Self::PomodoroBoundaryAmbiguous {
                persisted_work_ms,
                work_interval_ms,
            } => write!(
                formatter,
                "cannot recover Pomodoro work at or beyond its interval boundary: persisted={persisted_work_ms}ms interval={work_interval_ms}ms"
            ),
        }
    }
}

impl std::error::Error for TimerRecoveryError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Timer(error) => Some(error),
            Self::PomodoroBoundaryAmbiguous { .. } => None,
        }
    }
}

impl From<TimerError> for TimerRecoveryError {
    fn from(value: TimerError) -> Self {
        Self::Timer(value)
    }
}

impl TimerEngine {
    pub fn restore_interrupted_work_paused(
        task_id: TaskId,
        mode: TimerMode,
        persisted_work_ms: u64,
        now_ms: u64,
    ) -> Result<(Self, TimerSnapshot), TimerRecoveryError> {
        mode.validate()?;

        let phase = match mode {
            TimerMode::CountUp => WorkPhase::Paused,
            TimerMode::EstCountdown { est_ms } => {
                if persisted_work_ms > est_ms {
                    WorkPhase::OvertimePaused
                } else {
                    WorkPhase::Paused
                }
            }
            TimerMode::Pomodoro { work_ms, .. } => {
                if persisted_work_ms >= work_ms {
                    return Err(TimerRecoveryError::PomodoroBoundaryAmbiguous {
                        persisted_work_ms,
                        work_interval_ms: work_ms,
                    });
                }
                WorkPhase::Paused
            }
        };

        let mut engine = Self {
            runtime: RuntimeState::Work(WorkRuntime {
                task_id,
                mode,
                phase,
                total_work_ms: persisted_work_ms,
                interval_work_ms: persisted_work_ms,
                run_started_ms: None,
            }),
            committed_break_ms: 0,
            last_observed_ms: Some(now_ms),
        };
        let snapshot = engine.advance(now_ms)?;
        Ok((engine, snapshot))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    fn task() -> TaskId {
        TaskId::from_uuid(Uuid::from_u128(0x3000))
    }

    #[test]
    fn count_up_recovery_is_paused_and_does_not_count_downtime() {
        let (mut engine, recovered) = TimerEngine::restore_interrupted_work_paused(
            task(),
            TimerMode::CountUp,
            7_000,
            100_000,
        )
        .expect("recover count-up work");
        assert_eq!(recovered.state, super::super::TimerStateKind::Paused);
        assert_eq!(recovered.work_elapsed_ms, 7_000);
        assert_eq!(engine.advance(200_000).unwrap().work_elapsed_ms, 7_000);

        engine.resume(200_000).unwrap();
        assert_eq!(engine.advance(203_000).unwrap().work_elapsed_ms, 10_000);
    }

    #[test]
    fn est_recovery_preserves_remaining_or_overtime_without_running() {
        let (_, before_limit) = TimerEngine::restore_interrupted_work_paused(
            task(),
            TimerMode::EstCountdown { est_ms: 10_000 },
            6_000,
            50_000,
        )
        .unwrap();
        assert_eq!(before_limit.state, super::super::TimerStateKind::Paused);
        assert_eq!(before_limit.countdown_remaining_ms, Some(4_000));

        let (_, overtime) = TimerEngine::restore_interrupted_work_paused(
            task(),
            TimerMode::EstCountdown { est_ms: 10_000 },
            13_000,
            50_000,
        )
        .unwrap();
        assert_eq!(overtime.state, super::super::TimerStateKind::OvertimePaused);
        assert_eq!(overtime.overtime_ms, 3_000);
    }

    #[test]
    fn ambiguous_pomodoro_boundary_is_rejected() {
        assert!(matches!(
            TimerEngine::restore_interrupted_work_paused(
                task(),
                TimerMode::Pomodoro {
                    work_ms: 5_000,
                    break_ms: 2_000
                },
                5_000,
                10_000
            ),
            Err(TimerRecoveryError::PomodoroBoundaryAmbiguous {
                persisted_work_ms: 5_000,
                work_interval_ms: 5_000
            })
        ));
    }
}
