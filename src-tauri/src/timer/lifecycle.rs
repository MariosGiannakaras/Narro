use super::{
    RuntimeState, TimerAction, TimerEngine, TimerError, TimerMode, TimerSnapshot, TimerStateKind,
    WorkPhase, WorkRuntime,
};
use crate::domain::ids::TaskId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskExitReason {
    Done,
    Skip,
    Switch,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimerExit {
    pub reason: TaskExitReason,
    pub task_id: TaskId,
    pub mode: TimerMode,
    pub final_state: TimerStateKind,
    pub work_elapsed_ms: u64,
    pub total_break_ms: u64,
    pub ended_at_ms: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimerSwitchResult {
    pub previous: TimerExit,
    pub current: TimerSnapshot,
}

impl TimerEngine {
    pub fn finish_task(&mut self, now_ms: u64) -> Result<TimerExit, TimerError> {
        self.exit_task(TaskExitReason::Done, TimerAction::FinishTask, now_ms)
    }

    pub fn skip_task(&mut self, now_ms: u64) -> Result<TimerExit, TimerError> {
        self.exit_task(TaskExitReason::Skip, TimerAction::SkipTask, now_ms)
    }

    pub fn switch_task(
        &mut self,
        task_id: TaskId,
        mode: TimerMode,
        now_ms: u64,
    ) -> Result<TimerSwitchResult, TimerError> {
        mode.validate()?;
        let mut candidate = self.clone();
        let previous =
            candidate.exit_task_inner(TaskExitReason::Switch, TimerAction::SwitchTask, now_ms)?;
        let current = candidate.start_task(task_id, mode, now_ms)?;
        *self = candidate;
        Ok(TimerSwitchResult { previous, current })
    }

    pub fn restore_snapshot_paused(
        snapshot: &TimerSnapshot,
        now_ms: u64,
    ) -> Result<Self, TimerError> {
        if snapshot.state == TimerStateKind::Idle {
            return Err(TimerError::NoActiveTask);
        }
        let task_id = snapshot.task_id.ok_or(TimerError::NoActiveTask)?;
        let mode = snapshot.mode.ok_or(TimerError::NoActiveTask)?;
        mode.validate()?;

        let interval_work_ms = match mode {
            TimerMode::CountUp | TimerMode::EstCountdown { .. } => snapshot.work_elapsed_ms,
            TimerMode::Pomodoro { work_ms, .. } => snapshot.work_elapsed_ms % work_ms,
        };
        let phase = match snapshot.state {
            TimerStateKind::Running | TimerStateKind::Paused => WorkPhase::Paused,
            TimerStateKind::Break => match mode {
                TimerMode::EstCountdown { .. } if snapshot.overtime_ms > 0 => {
                    WorkPhase::OvertimePaused
                }
                _ => WorkPhase::Paused,
            },
            TimerStateKind::TimeUp => WorkPhase::TimeUp,
            TimerStateKind::OvertimeRunning | TimerStateKind::OvertimePaused => {
                WorkPhase::OvertimePaused
            }
            TimerStateKind::Idle => return Err(TimerError::NoActiveTask),
        };

        Ok(Self {
            runtime: RuntimeState::Work(WorkRuntime {
                task_id,
                mode,
                phase,
                total_work_ms: snapshot.work_elapsed_ms,
                interval_work_ms,
                run_started_ms: None,
            }),
            committed_break_ms: snapshot.total_break_ms,
            last_observed_ms: Some(now_ms),
        })
    }

    fn exit_task(
        &mut self,
        reason: TaskExitReason,
        action: TimerAction,
        now_ms: u64,
    ) -> Result<TimerExit, TimerError> {
        let mut candidate = self.clone();
        let exit = candidate.exit_task_inner(reason, action, now_ms)?;
        *self = candidate;
        Ok(exit)
    }

    fn exit_task_inner(
        &mut self,
        reason: TaskExitReason,
        action: TimerAction,
        now_ms: u64,
    ) -> Result<TimerExit, TimerError> {
        self.observe(now_ms)?;
        self.advance_inner(now_ms)?;
        let state = self.state_kind();
        if state == TimerStateKind::Idle {
            return Err(TimerError::NoActiveTask);
        }
        if state == TimerStateKind::Break {
            return Err(TimerError::InvalidTransition { action, state });
        }

        let snapshot = self.snapshot_inner(now_ms)?;
        let task_id = snapshot.task_id.ok_or(TimerError::NoActiveTask)?;
        let mode = snapshot.mode.ok_or(TimerError::NoActiveTask)?;
        let exit = TimerExit {
            reason,
            task_id,
            mode,
            final_state: snapshot.state,
            work_elapsed_ms: snapshot.work_elapsed_ms,
            total_break_ms: snapshot.total_break_ms,
            ended_at_ms: now_ms,
        };

        self.runtime = RuntimeState::Idle;
        self.committed_break_ms = 0;
        Ok(exit)
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
    fn finish_captures_running_work_then_returns_engine_to_idle() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(task(1), TimerMode::CountUp, 1_000)
            .unwrap();

        let exit = engine.finish_task(5_500).unwrap();
        assert_eq!(exit.reason, TaskExitReason::Done);
        assert_eq!(exit.task_id, task(1));
        assert_eq!(exit.final_state, TimerStateKind::Running);
        assert_eq!(exit.work_elapsed_ms, 4_500);
        assert_eq!(exit.total_break_ms, 0);
        assert_eq!(exit.ended_at_ms, 5_500);
        assert_eq!(engine.snapshot(5_500).unwrap().state, TimerStateKind::Idle);
    }

    #[test]
    fn done_from_time_up_preserves_exact_est_work_without_decision_delay() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(task(2), TimerMode::EstCountdown { est_ms: 5_000 }, 0)
            .unwrap();

        let exit = engine.finish_task(9_000).unwrap();
        assert_eq!(exit.final_state, TimerStateKind::TimeUp);
        assert_eq!(exit.work_elapsed_ms, 5_000);
        assert_eq!(exit.ended_at_ms, 9_000);
        assert_eq!(engine.snapshot(9_000).unwrap().state, TimerStateKind::Idle);
    }

    #[test]
    fn switch_from_time_up_preserves_previous_summary_and_starts_clean_target_runtime() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(task(3), TimerMode::EstCountdown { est_ms: 3_000 }, 0)
            .unwrap();

        let switched = engine
            .switch_task(task(4), TimerMode::CountUp, 5_000)
            .unwrap();
        assert_eq!(switched.previous.reason, TaskExitReason::Switch);
        assert_eq!(switched.previous.task_id, task(3));
        assert_eq!(switched.previous.final_state, TimerStateKind::TimeUp);
        assert_eq!(switched.previous.work_elapsed_ms, 3_000);
        assert_eq!(switched.current.state, TimerStateKind::Running);
        assert_eq!(switched.current.task_id, Some(task(4)));
        assert_eq!(switched.current.work_elapsed_ms, 0);

        let target = engine.advance(7_000).unwrap();
        assert_eq!(target.task_id, Some(task(4)));
        assert_eq!(target.work_elapsed_ms, 2_000);
    }

    #[test]
    fn switch_while_running_closes_old_work_at_switch_timestamp() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(task(5), TimerMode::CountUp, 1_000)
            .unwrap();

        let switched = engine
            .switch_task(task(6), TimerMode::EstCountdown { est_ms: 10_000 }, 3_500)
            .unwrap();
        assert_eq!(switched.previous.task_id, task(5));
        assert_eq!(switched.previous.work_elapsed_ms, 2_500);
        assert_eq!(switched.current.task_id, Some(task(6)));
        assert_eq!(switched.current.work_elapsed_ms, 0);
        assert_eq!(switched.current.countdown_remaining_ms, Some(10_000));
    }

    #[test]
    fn invalid_switch_mode_is_atomic_and_keeps_current_task_running() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(7), TimerMode::CountUp, 0).unwrap();
        let before = engine.advance(2_000).unwrap();

        assert_eq!(
            engine.switch_task(task(8), TimerMode::EstCountdown { est_ms: 0 }, 2_000),
            Err(TimerError::ZeroDuration)
        );
        assert_eq!(engine.snapshot(2_000).unwrap(), before);
        assert_eq!(engine.advance(3_000).unwrap().work_elapsed_ms, 3_000);
    }

    #[test]
    fn skip_is_rejected_during_break_without_partial_exit() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(9), TimerMode::CountUp, 0).unwrap();
        engine.start_manual_break(10_000, 1_000).unwrap();
        let before = engine.snapshot(2_000).unwrap();

        assert!(matches!(
            engine.skip_task(2_000),
            Err(TimerError::InvalidTransition {
                action: TimerAction::SkipTask,
                state: TimerStateKind::Break
            })
        ));
        assert_eq!(engine.snapshot(2_000).unwrap(), before);
    }

    #[test]
    fn finish_after_overtime_captures_same_task_total() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(task(10), TimerMode::EstCountdown { est_ms: 2_000 }, 0)
            .unwrap();
        engine.advance(2_500).unwrap();
        engine.extend(3_000).unwrap();

        let exit = engine.finish_task(4_500).unwrap();
        assert_eq!(exit.final_state, TimerStateKind::OvertimeRunning);
        assert_eq!(exit.work_elapsed_ms, 3_500);
        assert_eq!(exit.mode, TimerMode::EstCountdown { est_ms: 2_000 });
    }

    #[test]
    fn running_snapshot_restores_paused_without_counting_downtime() {
        let mut engine = TimerEngine::new();
        engine.start_task(task(11), TimerMode::CountUp, 1_000).unwrap();
        let snapshot = engine.snapshot(6_000).unwrap();
        assert_eq!(snapshot.state, TimerStateKind::Running);
        assert_eq!(snapshot.work_elapsed_ms, 5_000);

        let restored = TimerEngine::restore_snapshot_paused(&snapshot, 60_000).unwrap();
        let recovered = restored.snapshot(90_000).unwrap();
        assert_eq!(recovered.state, TimerStateKind::Paused);
        assert_eq!(recovered.work_elapsed_ms, 5_000);
    }

    #[test]
    fn pomodoro_break_snapshot_restores_paused_at_next_sprint_boundary() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(
                task(12),
                TimerMode::Pomodoro {
                    work_ms: 5_000,
                    break_ms: 4_000,
                },
                0,
            )
            .unwrap();
        let snapshot = engine.advance(6_000).unwrap();
        assert_eq!(snapshot.state, TimerStateKind::Break);
        assert_eq!(snapshot.work_elapsed_ms, 5_000);

        let restored = TimerEngine::restore_snapshot_paused(&snapshot, 100_000).unwrap();
        let recovered = restored.snapshot(110_000).unwrap();
        assert_eq!(recovered.state, TimerStateKind::Paused);
        assert_eq!(recovered.work_elapsed_ms, 5_000);
        assert_eq!(recovered.countdown_remaining_ms, Some(5_000));
    }

    #[test]
    fn overtime_break_recovery_preserves_overtime_paused_state() {
        let mut engine = TimerEngine::new();
        engine
            .start_task(task(13), TimerMode::EstCountdown { est_ms: 2_000 }, 0)
            .unwrap();
        engine.advance(2_000).unwrap();
        engine.extend(3_000).unwrap();
        engine.start_manual_break(5_000, 5_000).unwrap();
        let snapshot = engine.snapshot(6_000).unwrap();
        assert_eq!(snapshot.state, TimerStateKind::Break);
        assert_eq!(snapshot.overtime_ms, 2_000);

        let restored = TimerEngine::restore_snapshot_paused(&snapshot, 50_000).unwrap();
        let recovered = restored.snapshot(80_000).unwrap();
        assert_eq!(recovered.state, TimerStateKind::OvertimePaused);
        assert_eq!(recovered.work_elapsed_ms, 4_000);
        assert_eq!(recovered.overtime_ms, 2_000);
    }
}
