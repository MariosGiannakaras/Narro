use super::{RuntimeState, TimerEngine, TimerError, TimerMode, WorkPhase, WorkRuntime};
use crate::domain::ids::TaskId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TimerRecoveryPhase {
    Paused,
    TimeUp,
    OvertimePaused,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimerRecoveryCheckpoint {
    pub task_id: TaskId,
    pub mode: TimerMode,
    pub phase: TimerRecoveryPhase,
    pub work_elapsed_ms: u64,
    pub interval_work_ms: u64,
    pub total_break_ms: u64,
}

impl TimerRecoveryCheckpoint {
    fn validate(&self) -> Result<(), TimerError> {
        self.mode.validate()?;
        if self.interval_work_ms > self.work_elapsed_ms {
            return Err(TimerError::InvalidRecoveryState);
        }

        match (self.mode, self.phase) {
            (TimerMode::CountUp, TimerRecoveryPhase::Paused)
                if self.interval_work_ms == self.work_elapsed_ms =>
            {
                Ok(())
            }
            (
                TimerMode::EstCountdown { est_ms },
                TimerRecoveryPhase::Paused,
            ) if self.interval_work_ms < est_ms
                && self.interval_work_ms == self.work_elapsed_ms =>
            {
                Ok(())
            }
            (
                TimerMode::EstCountdown { est_ms },
                TimerRecoveryPhase::TimeUp,
            ) if self.interval_work_ms == est_ms && self.work_elapsed_ms == est_ms => Ok(()),
            (
                TimerMode::EstCountdown { est_ms },
                TimerRecoveryPhase::OvertimePaused,
            ) if self.interval_work_ms >= est_ms
                && self.interval_work_ms == self.work_elapsed_ms =>
            {
                Ok(())
            }
            (
                TimerMode::Pomodoro { work_ms, .. },
                TimerRecoveryPhase::Paused,
            ) if self.interval_work_ms < work_ms => Ok(()),
            _ => Err(TimerError::InvalidRecoveryState),
        }
    }
}

impl TimerEngine {
    pub fn recovery_checkpoint(
        &self,
        now_ms: u64,
    ) -> Result<Option<TimerRecoveryCheckpoint>, TimerError> {
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
        let checkpoint = match &candidate.runtime {
            RuntimeState::Idle => None,
            RuntimeState::Work(work) => Some(TimerRecoveryCheckpoint {
                task_id: work.task_id,
                mode: work.mode,
                phase: recovery_phase(work.phase),
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
                let work = &break_runtime.resume_work;
                Some(TimerRecoveryCheckpoint {
                    task_id: work.task_id,
                    mode: work.mode,
                    phase: recovery_phase(work.phase),
                    work_elapsed_ms: work.total_work_ms,
                    interval_work_ms: work.interval_work_ms,
                    total_break_ms,
                })
            }
        };
        Ok(checkpoint)
    }

    pub fn restore_recovery(
        checkpoint: TimerRecoveryCheckpoint,
        now_ms: u64,
    ) -> Result<Self, TimerError> {
        checkpoint.validate()?;
        let phase = match checkpoint.phase {
            TimerRecoveryPhase::Paused => WorkPhase::Paused,
            TimerRecoveryPhase::TimeUp => WorkPhase::TimeUp,
            TimerRecoveryPhase::OvertimePaused => WorkPhase::OvertimePaused,
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

fn recovery_phase(phase: WorkPhase) -> TimerRecoveryPhase {
    match phase {
        WorkPhase::Running | WorkPhase::Paused => TimerRecoveryPhase::Paused,
        WorkPhase::TimeUp => TimerRecoveryPhase::TimeUp,
        WorkPhase::OvertimeRunning | WorkPhase::OvertimePaused => {
            TimerRecoveryPhase::OvertimePaused
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::timer::{BreakKind, TimerStateKind};
    use uuid::Uuid;

    fn task(slot: u128) -> TaskId {
        TaskId::from_uuid(Uuid::from_u128(slot))
    }

    #[test]
    fn running_count_up_restores_paused_and_process_downtime_is_not_counted() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(1), TimerMode::CountUp, 1_000).unwrap();

        let checkpoint = engine
            .recovery_checkpoint(6_000)
            .unwrap()
            .expect("active checkpoint");
        assert_eq!(checkpoint.phase, TimerRecoveryPhase::Paused);
        assert_eq!(checkpoint.work_elapsed_ms, 5_000);

        let mut restored = TimerEngine::restore_recovery(checkpoint, 500).unwrap();
        let paused = restored.snapshot(20_000).unwrap();
        assert_eq!(paused.state, TimerStateKind::Paused);
        assert_eq!(paused.work_elapsed_ms, 5_000);

        restored.resume(20_000).unwrap();
        assert_eq!(restored.advance(22_000).unwrap().work_elapsed_ms, 7_000);
    }

    #[test]
    fn time_up_restores_as_a_decision_state_without_counting_downtime() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(task(2), TimerMode::EstCountdown { est_ms: 10_000 }, 0)
            .unwrap();

        let checkpoint = engine
            .recovery_checkpoint(15_000)
            .unwrap()
            .expect("time-up checkpoint");
        assert_eq!(checkpoint.phase, TimerRecoveryPhase::TimeUp);
        assert_eq!(checkpoint.work_elapsed_ms, 10_000);

        let restored = TimerEngine::restore_recovery(checkpoint, 100).unwrap();
        let snapshot = restored.snapshot(50_000).unwrap();
        assert_eq!(snapshot.state, TimerStateKind::TimeUp);
        assert_eq!(snapshot.work_elapsed_ms, 10_000);
        assert_eq!(snapshot.countdown_remaining_ms, Some(0));
    }

    #[test]
    fn overtime_restores_paused_and_preserves_exact_overtime() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(task(3), TimerMode::EstCountdown { est_ms: 5_000 }, 0)
            .unwrap();
        engine.advance(5_000).unwrap();
        engine.extend(6_000).unwrap();

        let checkpoint = engine
            .recovery_checkpoint(9_000)
            .unwrap()
            .expect("overtime checkpoint");
        assert_eq!(checkpoint.phase, TimerRecoveryPhase::OvertimePaused);
        assert_eq!(checkpoint.work_elapsed_ms, 8_000);

        let mut restored = TimerEngine::restore_recovery(checkpoint, 1_000).unwrap();
        let paused = restored.snapshot(20_000).unwrap();
        assert_eq!(paused.state, TimerStateKind::OvertimePaused);
        assert_eq!(paused.overtime_ms, 3_000);

        restored.resume(20_000).unwrap();
        assert_eq!(restored.advance(22_000).unwrap().overtime_ms, 5_000);
    }

    #[test]
    fn active_manual_break_restores_underlying_work_paused_and_credits_only_observed_break() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(4), TimerMode::CountUp, 0).unwrap();
        engine.start_manual_break(10_000, 4_000).unwrap();
        assert_eq!(engine.snapshot(7_000).unwrap().break_kind, Some(BreakKind::Manual));

        let checkpoint = engine
            .recovery_checkpoint(7_000)
            .unwrap()
            .expect("break checkpoint");
        assert_eq!(checkpoint.phase, TimerRecoveryPhase::Paused);
        assert_eq!(checkpoint.work_elapsed_ms, 4_000);
        assert_eq!(checkpoint.total_break_ms, 3_000);

        let restored = TimerEngine::restore_recovery(checkpoint, 10).unwrap();
        let paused = restored.snapshot(100_000).unwrap();
        assert_eq!(paused.state, TimerStateKind::Paused);
        assert_eq!(paused.work_elapsed_ms, 4_000);
        assert_eq!(paused.total_break_ms, 3_000);
    }

    #[test]
    fn pomodoro_break_restores_paused_at_the_next_work_interval() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(
                task(5),
                TimerMode::Pomodoro {
                    work_ms: 5_000,
                    break_ms: 10_000,
                },
                0,
            )
            .unwrap();

        let checkpoint = engine
            .recovery_checkpoint(8_000)
            .unwrap()
            .expect("pomodoro break checkpoint");
        assert_eq!(checkpoint.phase, TimerRecoveryPhase::Paused);
        assert_eq!(checkpoint.work_elapsed_ms, 5_000);
        assert_eq!(checkpoint.interval_work_ms, 0);
        assert_eq!(checkpoint.total_break_ms, 3_000);

        let restored = TimerEngine::restore_recovery(checkpoint, 0).unwrap();
        let paused = restored.snapshot(50_000).unwrap();
        assert_eq!(paused.state, TimerStateKind::Paused);
        assert_eq!(paused.countdown_remaining_ms, Some(5_000));
        assert_eq!(paused.work_elapsed_ms, 5_000);
    }

    #[test]
    fn invalid_recovery_shapes_are_rejected() {
        let count_up_overtime = TimerRecoveryCheckpoint {
            task_id: task(6),
            mode: TimerMode::CountUp,
            phase: TimerRecoveryPhase::OvertimePaused,
            work_elapsed_ms: 5_000,
            interval_work_ms: 5_000,
            total_break_ms: 0,
        };
        assert_eq!(
            TimerEngine::restore_recovery(count_up_overtime, 0),
            Err(TimerError::InvalidRecoveryState)
        );

        let interval_exceeds_total = TimerRecoveryCheckpoint {
            task_id: task(7),
            mode: TimerMode::Pomodoro {
                work_ms: 10_000,
                break_ms: 5_000,
            },
            phase: TimerRecoveryPhase::Paused,
            work_elapsed_ms: 1_000,
            interval_work_ms: 2_000,
            total_break_ms: 0,
        };
        assert_eq!(
            TimerEngine::restore_recovery(interval_exceeds_total, 0),
            Err(TimerError::InvalidRecoveryState)
        );
    }
}
