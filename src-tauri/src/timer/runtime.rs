use super::{
    BreakKind, BreakRuntime, RuntimeState, TaskExitReason, TimerEngine, TimerError, TimerExit,
    TimerMode, TimerSnapshot, TimerStateKind, TimerSwitchResult, WorkPhase, WorkRuntime,
};
use crate::domain::ids::{SessionId, TaskId};
use crate::domain::sessions::{SessionKind, SessionRecord};
use crate::persistence::sessions::{get_open_session, SessionStoreError};
use crate::persistence::timer_runtime::{
    checkpoint_open_session_with_runtime, close_session_and_clear_runtime,
    load_runtime_checkpoint, open_focus_work_session_with_checkpoint,
    replace_open_focus_session_with_checkpoint, TimerRuntimeStoreError,
};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

const RUNTIME_CHECKPOINT_VERSION: u32 = 1;
const PERIODIC_CHECKPOINT_INTERVAL_MS: u64 = 30_000;

#[derive(Debug, Clone, PartialEq, Eq)]
struct SessionBinding {
    id: SessionId,
    kind: SessionKind,
    task_id: Option<TaskId>,
}

impl SessionBinding {
    fn from_record(record: &SessionRecord) -> Self {
        Self {
            id: record.id,
            kind: record.kind,
            task_id: record.task_id,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
struct DurableTimerCheckpoint {
    version: u32,
    closed_work_seconds: u64,
    closed_break_seconds: u64,
    committed_break_ms: u64,
    state: DurableTimerState,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
enum DurableTimerState {
    Work {
        task_id: TaskId,
        mode: TimerMode,
        phase: TimerStateKind,
        total_work_ms: u64,
        interval_work_ms: u64,
    },
    Break {
        task_id: TaskId,
        mode: TimerMode,
        resume_phase: TimerStateKind,
        resume_total_work_ms: u64,
        resume_interval_work_ms: u64,
        break_kind: BreakKind,
        duration_ms: u64,
        elapsed_ms: u64,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TimerRuntimeSnapshot {
    pub timer: TimerSnapshot,
    pub open_session_id: Option<SessionId>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PersistedTimerExit {
    pub timer: TimerExit,
    pub closed_session: SessionRecord,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PersistedTimerSwitch {
    pub timer: TimerSwitchResult,
    pub previous_session: SessionRecord,
    pub current_session: SessionRecord,
}

#[derive(Debug)]
pub enum TimerRuntimeError {
    Timer(TimerError),
    Session(SessionStoreError),
    Store(TimerRuntimeStoreError),
    CheckpointJson(serde_json::Error),
    BindingMismatch,
    DurationAccountingUnderflow,
    UnsupportedCheckpointVersion(u32),
    InvalidRecoveryState,
    CheckpointDurationMismatch {
        session_id: SessionId,
        stored_seconds: u64,
        checkpoint_seconds: u64,
    },
}

impl Display for TimerRuntimeError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Timer(error) => Display::fmt(error, formatter),
            Self::Session(error) => Display::fmt(error, formatter),
            Self::Store(error) => Display::fmt(error, formatter),
            Self::CheckpointJson(error) => {
                write!(formatter, "timer runtime checkpoint JSON is invalid: {error}")
            }
            Self::BindingMismatch => formatter
                .write_str("timer runtime and persisted open-session binding are inconsistent"),
            Self::DurationAccountingUnderflow => formatter
                .write_str("timer runtime duration is lower than already-closed session duration"),
            Self::UnsupportedCheckpointVersion(version) => write!(
                formatter,
                "timer runtime checkpoint version {version} is not supported"
            ),
            Self::InvalidRecoveryState => {
                formatter.write_str("timer runtime checkpoint contains an invalid recovery state")
            }
            Self::CheckpointDurationMismatch {
                session_id,
                stored_seconds,
                checkpoint_seconds,
            } => write!(
                formatter,
                "timer runtime checkpoint duration disagrees with open session {session_id}: stored={stored_seconds}s checkpoint={checkpoint_seconds}s"
            ),
        }
    }
}

impl std::error::Error for TimerRuntimeError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Timer(error) => Some(error),
            Self::Session(error) => Some(error),
            Self::Store(error) => Some(error),
            Self::CheckpointJson(error) => Some(error),
            _ => None,
        }
    }
}

impl From<TimerError> for TimerRuntimeError {
    fn from(value: TimerError) -> Self {
        Self::Timer(value)
    }
}

impl From<SessionStoreError> for TimerRuntimeError {
    fn from(value: SessionStoreError) -> Self {
        Self::Session(value)
    }
}

impl From<TimerRuntimeStoreError> for TimerRuntimeError {
    fn from(value: TimerRuntimeStoreError) -> Self {
        match value {
            TimerRuntimeStoreError::Session(error) => Self::Session(error),
            other => Self::Store(other),
        }
    }
}

impl From<serde_json::Error> for TimerRuntimeError {
    fn from(value: serde_json::Error) -> Self {
        Self::CheckpointJson(value)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TimerRuntime {
    engine: TimerEngine,
    binding: Option<SessionBinding>,
    closed_work_seconds: u64,
    closed_break_seconds: u64,
    last_state: TimerStateKind,
    last_checkpoint_ms: Option<u64>,
}

impl Default for TimerRuntime {
    fn default() -> Self {
        Self::new()
    }
}

impl TimerRuntime {
    pub const fn new() -> Self {
        Self {
            engine: TimerEngine::new(),
            binding: None,
            closed_work_seconds: 0,
            closed_break_seconds: 0,
            last_state: TimerStateKind::Idle,
            last_checkpoint_ms: None,
        }
    }

    pub fn recover(
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<Self, TimerRuntimeError> {
        let checkpoint = load_runtime_checkpoint(conn)?;
        let open_session = get_open_session(conn)?;

        match (checkpoint, open_session) {
            (None, None) => Ok(Self::new()),
            (None, Some(_)) => Err(TimerRuntimeStoreError::MissingCheckpoint.into()),
            (Some(checkpoint), None) => {
                Err(TimerRuntimeStoreError::UnexpectedCheckpoint(checkpoint.session_id).into())
            }
            (Some(checkpoint), Some(open_session)) => {
                if checkpoint.session_id != open_session.id {
                    return Err(TimerRuntimeStoreError::CheckpointBindingMismatch {
                        expected: open_session.id,
                        actual: checkpoint.session_id,
                    }
                    .into());
                }

                let durable: DurableTimerCheckpoint =
                    serde_json::from_str(&checkpoint.payload_json)?;
                let (engine, closed_work_seconds, closed_break_seconds) =
                    restore_engine(durable, now_ms)?;
                let snapshot = engine.snapshot(now_ms)?;
                let desired = desired_binding(&snapshot)?
                    .ok_or(TimerRuntimeError::BindingMismatch)?;
                if desired.kind != open_session.kind || desired.task_id != open_session.task_id {
                    return Err(TimerRuntimeError::BindingMismatch);
                }

                let checkpoint_seconds = open_duration_seconds_for(
                    &snapshot,
                    open_session.kind,
                    closed_work_seconds,
                    closed_break_seconds,
                )?;
                if checkpoint_seconds != open_session.duration_seconds {
                    return Err(TimerRuntimeError::CheckpointDurationMismatch {
                        session_id: open_session.id,
                        stored_seconds: open_session.duration_seconds,
                        checkpoint_seconds,
                    });
                }

                let mut runtime = Self {
                    engine,
                    binding: Some(SessionBinding::from_record(&open_session)),
                    closed_work_seconds,
                    closed_break_seconds,
                    last_state: snapshot.state,
                    last_checkpoint_ms: Some(now_ms),
                };
                let normalized_payload = runtime.checkpoint_payload(now_ms)?;
                checkpoint_open_session_with_runtime(
                    conn,
                    open_session.id,
                    checkpoint_seconds,
                    wall_time,
                    &normalized_payload,
                )?;
                runtime.last_checkpoint_ms = Some(now_ms);
                Ok(runtime)
            }
        }
    }

    pub fn snapshot(&self, now_ms: u64) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        Ok(self.runtime_snapshot(self.engine.snapshot(now_ms)?))
    }

    pub fn open_session_id(&self) -> Option<SessionId> {
        self.binding.as_ref().map(|binding| binding.id)
    }

    pub fn start_task(
        &mut self,
        conn: &mut Connection,
        task_id: TaskId,
        mode: TimerMode,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        if self.binding.is_some() {
            return Err(TimerRuntimeError::BindingMismatch);
        }

        let mut engine = self.engine.clone();
        let snapshot = engine.start_task(task_id, mode, now_ms)?;
        let payload = checkpoint_payload_for(&engine, 0, 0, now_ms)?;
        let session =
            open_focus_work_session_with_checkpoint(conn, task_id, wall_time, &payload)?;

        self.engine = engine;
        self.binding = Some(SessionBinding::from_record(&session));
        self.closed_work_seconds = 0;
        self.closed_break_seconds = 0;
        self.last_state = snapshot.state;
        self.last_checkpoint_ms = Some(now_ms);
        Ok(self.runtime_snapshot(snapshot))
    }

    pub fn advance(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.advance(now_ms)?;
        let checkpoint_same =
            snapshot.state != self.last_state || self.checkpoint_due(now_ms);
        self.commit_candidate(
            conn,
            engine,
            snapshot,
            now_ms,
            wall_time,
            checkpoint_same,
        )
    }

    pub fn checkpoint(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.advance(now_ms)?;
        self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, true)
    }

    pub fn pause(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.pause(now_ms)?;
        self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, true)
    }

    pub fn resume(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.resume(now_ms)?;
        self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, true)
    }

    pub fn extend(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.extend(now_ms)?;
        self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, true)
    }

    pub fn start_manual_break(
        &mut self,
        conn: &mut Connection,
        duration_ms: u64,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.start_manual_break(duration_ms, now_ms)?;
        self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, false)
    }

    pub fn finish_break(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.finish_break(now_ms)?;
        self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, false)
    }

    pub fn skip_break(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.skip_break(now_ms)?;
        self.commit_candidate(conn, engine, snapshot, now_ms, wall_time, false)
    }

    pub fn finish_task(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<PersistedTimerExit, TimerRuntimeError> {
        self.exit_task(conn, TaskExitReason::Done, now_ms, wall_time)
    }

    pub fn skip_task(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<PersistedTimerExit, TimerRuntimeError> {
        self.exit_task(conn, TaskExitReason::Skip, now_ms, wall_time)
    }

    pub fn switch_task(
        &mut self,
        conn: &mut Connection,
        task_id: TaskId,
        mode: TimerMode,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<PersistedTimerSwitch, TimerRuntimeError> {
        let current = self
            .binding
            .clone()
            .ok_or(TimerRuntimeError::BindingMismatch)?;
        if current.kind != SessionKind::Work {
            return Err(TimerRuntimeError::BindingMismatch);
        }

        let mut engine = self.engine.clone();
        let result = engine.switch_task(task_id, mode, now_ms)?;
        if current.task_id != Some(result.previous.task_id) {
            return Err(TimerRuntimeError::BindingMismatch);
        }
        let current_total = seconds(result.previous.work_elapsed_ms);
        let current_duration = current_total
            .checked_sub(self.closed_work_seconds)
            .ok_or(TimerRuntimeError::DurationAccountingUnderflow)?;
        let payload = checkpoint_payload_for(&engine, 0, 0, now_ms)?;
        let (closed, opened) = replace_open_focus_session_with_checkpoint(
            conn,
            current.id,
            current_duration,
            SessionKind::Work,
            Some(task_id),
            wall_time,
            &payload,
        )?;

        self.engine = engine;
        self.binding = Some(SessionBinding::from_record(&opened));
        self.closed_work_seconds = 0;
        self.closed_break_seconds = 0;
        self.last_state = result.current.state;
        self.last_checkpoint_ms = Some(now_ms);

        Ok(PersistedTimerSwitch {
            timer: result,
            previous_session: closed,
            current_session: opened,
        })
    }

    fn exit_task(
        &mut self,
        conn: &mut Connection,
        reason: TaskExitReason,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<PersistedTimerExit, TimerRuntimeError> {
        let current = self
            .binding
            .clone()
            .ok_or(TimerRuntimeError::BindingMismatch)?;
        if current.kind != SessionKind::Work {
            return Err(TimerRuntimeError::BindingMismatch);
        }

        let mut engine = self.engine.clone();
        let exit = match reason {
            TaskExitReason::Done => engine.finish_task(now_ms)?,
            TaskExitReason::Skip => engine.skip_task(now_ms)?,
            TaskExitReason::Switch => return Err(TimerRuntimeError::BindingMismatch),
        };
        if current.task_id != Some(exit.task_id) {
            return Err(TimerRuntimeError::BindingMismatch);
        }
        let current_total = seconds(exit.work_elapsed_ms);
        let current_duration = current_total
            .checked_sub(self.closed_work_seconds)
            .ok_or(TimerRuntimeError::DurationAccountingUnderflow)?;
        let closed = close_session_and_clear_runtime(
            conn,
            current.id,
            current_duration,
            wall_time,
        )?;

        self.engine = engine;
        self.binding = None;
        self.closed_work_seconds = 0;
        self.closed_break_seconds = 0;
        self.last_state = TimerStateKind::Idle;
        self.last_checkpoint_ms = None;

        Ok(PersistedTimerExit {
            timer: exit,
            closed_session: closed,
        })
    }

    fn commit_candidate(
        &mut self,
        conn: &mut Connection,
        engine: TimerEngine,
        snapshot: TimerSnapshot,
        now_ms: u64,
        wall_time: &str,
        checkpoint_same: bool,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let desired = desired_binding(&snapshot)?;
        let mut next_closed_work_seconds = self.closed_work_seconds;
        let mut next_closed_break_seconds = self.closed_break_seconds;
        let mut next_binding = self.binding.clone();
        let mut checkpoint_written = false;

        match (self.binding.clone(), desired) {
            (None, None) => {}
            (None, Some(_)) => return Err(TimerRuntimeError::BindingMismatch),
            (Some(_), None) => return Err(TimerRuntimeError::BindingMismatch),
            (Some(current), Some(next))
                if current.kind == next.kind && current.task_id == next.task_id =>
            {
                if checkpoint_same {
                    let duration = open_duration_seconds_for(
                        &snapshot,
                        current.kind,
                        self.closed_work_seconds,
                        self.closed_break_seconds,
                    )?;
                    let payload = checkpoint_payload_for(
                        &engine,
                        self.closed_work_seconds,
                        self.closed_break_seconds,
                        now_ms,
                    )?;
                    checkpoint_open_session_with_runtime(
                        conn,
                        current.id,
                        duration,
                        wall_time,
                        &payload,
                    )?;
                    checkpoint_written = true;
                }
            }
            (Some(current), Some(next)) => {
                let total = total_seconds(&snapshot, current.kind);
                let duration = open_duration_seconds_for(
                    &snapshot,
                    current.kind,
                    self.closed_work_seconds,
                    self.closed_break_seconds,
                )?;
                match current.kind {
                    SessionKind::Work => next_closed_work_seconds = total,
                    SessionKind::Break => next_closed_break_seconds = total,
                }
                let payload = checkpoint_payload_for(
                    &engine,
                    next_closed_work_seconds,
                    next_closed_break_seconds,
                    now_ms,
                )?;
                let (_, opened) = replace_open_focus_session_with_checkpoint(
                    conn,
                    current.id,
                    duration,
                    next.kind,
                    next.task_id,
                    wall_time,
                    &payload,
                )?;
                next_binding = Some(SessionBinding::from_record(&opened));
                checkpoint_written = true;
            }
        }

        self.engine = engine;
        self.binding = next_binding;
        self.closed_work_seconds = next_closed_work_seconds;
        self.closed_break_seconds = next_closed_break_seconds;
        self.last_state = snapshot.state;
        if checkpoint_written {
            self.last_checkpoint_ms = Some(now_ms);
        }
        Ok(self.runtime_snapshot(snapshot))
    }

    fn checkpoint_due(&self, now_ms: u64) -> bool {
        self.last_checkpoint_ms
            .map(|previous| now_ms.saturating_sub(previous) >= PERIODIC_CHECKPOINT_INTERVAL_MS)
            .unwrap_or(true)
    }

    fn checkpoint_payload(&self, now_ms: u64) -> Result<String, TimerRuntimeError> {
        checkpoint_payload_for(
            &self.engine,
            self.closed_work_seconds,
            self.closed_break_seconds,
            now_ms,
        )
    }

    fn runtime_snapshot(&self, timer: TimerSnapshot) -> TimerRuntimeSnapshot {
        TimerRuntimeSnapshot {
            timer,
            open_session_id: self.open_session_id(),
        }
    }
}

fn checkpoint_payload_for(
    engine: &TimerEngine,
    closed_work_seconds: u64,
    closed_break_seconds: u64,
    now_ms: u64,
) -> Result<String, TimerRuntimeError> {
    let state = match &engine.runtime {
        RuntimeState::Idle => return Err(TimerRuntimeError::BindingMismatch),
        RuntimeState::Work(work) => DurableTimerState::Work {
            task_id: work.task_id,
            mode: work.mode,
            phase: work.phase.state_kind(),
            total_work_ms: work.projected_total(now_ms)?,
            interval_work_ms: work.projected_interval(now_ms)?,
        },
        RuntimeState::Break(break_runtime) => DurableTimerState::Break {
            task_id: break_runtime.resume_work.task_id,
            mode: break_runtime.resume_work.mode,
            resume_phase: break_runtime.resume_work.phase.state_kind(),
            resume_total_work_ms: break_runtime.resume_work.total_work_ms,
            resume_interval_work_ms: break_runtime.resume_work.interval_work_ms,
            break_kind: break_runtime.kind,
            duration_ms: break_runtime.duration_ms,
            elapsed_ms: break_runtime.projected_elapsed(now_ms)?,
        },
    };

    serde_json::to_string(&DurableTimerCheckpoint {
        version: RUNTIME_CHECKPOINT_VERSION,
        closed_work_seconds,
        closed_break_seconds,
        committed_break_ms: engine.committed_break_ms,
        state,
    })
    .map_err(TimerRuntimeError::from)
}

fn restore_engine(
    checkpoint: DurableTimerCheckpoint,
    now_ms: u64,
) -> Result<(TimerEngine, u64, u64), TimerRuntimeError> {
    if checkpoint.version != RUNTIME_CHECKPOINT_VERSION {
        return Err(TimerRuntimeError::UnsupportedCheckpointVersion(
            checkpoint.version,
        ));
    }

    let runtime = match checkpoint.state {
        DurableTimerState::Work {
            task_id,
            mode,
            phase,
            total_work_ms,
            interval_work_ms,
        } => {
            validate_mode(mode)?;
            let phase = recover_work_phase(phase)?;
            validate_work_checkpoint(mode, phase, total_work_ms, interval_work_ms)?;
            RuntimeState::Work(WorkRuntime {
                task_id,
                mode,
                phase,
                total_work_ms,
                interval_work_ms,
                run_started_ms: None,
            })
        }
        DurableTimerState::Break {
            task_id,
            mode,
            resume_phase,
            resume_total_work_ms,
            resume_interval_work_ms,
            break_kind,
            duration_ms,
            elapsed_ms,
        } => {
            validate_mode(mode)?;
            if duration_ms == 0 || elapsed_ms >= duration_ms {
                return Err(TimerRuntimeError::InvalidRecoveryState);
            }
            if break_kind == BreakKind::Pomodoro {
                let TimerMode::Pomodoro { break_ms, .. } = mode else {
                    return Err(TimerRuntimeError::InvalidRecoveryState);
                };
                if duration_ms != break_ms {
                    return Err(TimerRuntimeError::InvalidRecoveryState);
                }
            }
            let resume_phase = recover_break_resume_phase(resume_phase)?;
            validate_work_checkpoint(
                mode,
                resume_phase,
                resume_total_work_ms,
                resume_interval_work_ms,
            )?;
            RuntimeState::Break(BreakRuntime {
                kind: break_kind,
                duration_ms,
                elapsed_ms,
                run_started_ms: now_ms,
                resume_work: WorkRuntime {
                    task_id,
                    mode,
                    phase: resume_phase,
                    total_work_ms: resume_total_work_ms,
                    interval_work_ms: resume_interval_work_ms,
                    run_started_ms: None,
                },
            })
        }
    };

    Ok((
        TimerEngine {
            runtime,
            committed_break_ms: checkpoint.committed_break_ms,
            last_observed_ms: Some(now_ms),
        },
        checkpoint.closed_work_seconds,
        checkpoint.closed_break_seconds,
    ))
}

fn recover_work_phase(state: TimerStateKind) -> Result<WorkPhase, TimerRuntimeError> {
    match state {
        TimerStateKind::Running => Ok(WorkPhase::Paused),
        TimerStateKind::Paused => Ok(WorkPhase::Paused),
        TimerStateKind::TimeUp => Ok(WorkPhase::TimeUp),
        TimerStateKind::OvertimeRunning => Ok(WorkPhase::OvertimePaused),
        TimerStateKind::OvertimePaused => Ok(WorkPhase::OvertimePaused),
        TimerStateKind::Idle | TimerStateKind::Break => Err(TimerRuntimeError::InvalidRecoveryState),
    }
}

fn recover_break_resume_phase(state: TimerStateKind) -> Result<WorkPhase, TimerRuntimeError> {
    match state {
        TimerStateKind::Paused => Ok(WorkPhase::Paused),
        TimerStateKind::OvertimePaused => Ok(WorkPhase::OvertimePaused),
        _ => Err(TimerRuntimeError::InvalidRecoveryState),
    }
}

fn validate_mode(mode: TimerMode) -> Result<(), TimerRuntimeError> {
    match mode {
        TimerMode::CountUp => Ok(()),
        TimerMode::EstCountdown { est_ms } if est_ms > 0 => Ok(()),
        TimerMode::Pomodoro { work_ms, break_ms } if work_ms > 0 && break_ms > 0 => Ok(()),
        _ => Err(TimerError::ZeroDuration.into()),
    }
}

fn validate_work_checkpoint(
    mode: TimerMode,
    phase: WorkPhase,
    total_work_ms: u64,
    interval_work_ms: u64,
) -> Result<(), TimerRuntimeError> {
    if interval_work_ms > total_work_ms {
        return Err(TimerRuntimeError::InvalidRecoveryState);
    }

    match mode {
        TimerMode::CountUp => {
            if matches!(phase, WorkPhase::TimeUp | WorkPhase::OvertimeRunning | WorkPhase::OvertimePaused)
            {
                return Err(TimerRuntimeError::InvalidRecoveryState);
            }
        }
        TimerMode::EstCountdown { est_ms } => match phase {
            WorkPhase::Running | WorkPhase::Paused if interval_work_ms <= est_ms => {}
            WorkPhase::TimeUp if interval_work_ms == est_ms => {}
            WorkPhase::OvertimeRunning | WorkPhase::OvertimePaused if interval_work_ms >= est_ms => {}
            _ => return Err(TimerRuntimeError::InvalidRecoveryState),
        },
        TimerMode::Pomodoro { work_ms, .. } => {
            if !matches!(phase, WorkPhase::Running | WorkPhase::Paused)
                || interval_work_ms > work_ms
            {
                return Err(TimerRuntimeError::InvalidRecoveryState);
            }
        }
    }
    Ok(())
}

fn seconds(milliseconds: u64) -> u64 {
    milliseconds / 1_000
}

fn total_seconds(snapshot: &TimerSnapshot, kind: SessionKind) -> u64 {
    match kind {
        SessionKind::Work => seconds(snapshot.work_elapsed_ms),
        SessionKind::Break => seconds(snapshot.total_break_ms),
    }
}

fn open_duration_seconds_for(
    snapshot: &TimerSnapshot,
    kind: SessionKind,
    closed_work_seconds: u64,
    closed_break_seconds: u64,
) -> Result<u64, TimerRuntimeError> {
    let total = total_seconds(snapshot, kind);
    let closed = match kind {
        SessionKind::Work => closed_work_seconds,
        SessionKind::Break => closed_break_seconds,
    };
    total
        .checked_sub(closed)
        .ok_or(TimerRuntimeError::DurationAccountingUnderflow)
}

fn desired_binding(snapshot: &TimerSnapshot) -> Result<Option<SessionBinding>, TimerRuntimeError> {
    match snapshot.state {
        TimerStateKind::Idle => Ok(None),
        TimerStateKind::Break => Ok(Some(SessionBinding {
            id: SessionId::generate(),
            kind: SessionKind::Break,
            task_id: snapshot.task_id,
        })),
        _ => Ok(Some(SessionBinding {
            id: SessionId::generate(),
            kind: SessionKind::Work,
            task_id: Some(snapshot.task_id.ok_or(TimerRuntimeError::BindingMismatch)?),
        })),
    }
}
