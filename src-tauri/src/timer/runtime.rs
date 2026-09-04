use super::{
    TaskExitReason, TimerEngine, TimerError, TimerExit, TimerMode, TimerSnapshot, TimerStateKind,
    TimerSwitchResult,
};
use crate::domain::ids::{SessionId, TaskId};
use crate::domain::sessions::{SessionKind, SessionRecord};
use crate::persistence::sessions::{
    checkpoint_open_session, close_session, open_focus_break_session, open_focus_work_session,
    replace_open_focus_session, SessionStoreError,
};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

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
    BindingMismatch,
    DurationAccountingUnderflow,
}

impl Display for TimerRuntimeError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Timer(error) => Display::fmt(error, formatter),
            Self::Session(error) => Display::fmt(error, formatter),
            Self::BindingMismatch => formatter
                .write_str("timer runtime and persisted open-session binding are inconsistent"),
            Self::DurationAccountingUnderflow => formatter
                .write_str("timer runtime duration is lower than already-closed session duration"),
        }
    }
}

impl std::error::Error for TimerRuntimeError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Timer(error) => Some(error),
            Self::Session(error) => Some(error),
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

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TimerRuntime {
    engine: TimerEngine,
    binding: Option<SessionBinding>,
    closed_work_seconds: u64,
    closed_break_seconds: u64,
    last_state: TimerStateKind,
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
        let session = open_focus_work_session(conn, task_id, wall_time)?;

        self.engine = engine;
        self.binding = Some(SessionBinding::from_record(&session));
        self.closed_work_seconds = 0;
        self.closed_break_seconds = 0;
        self.last_state = snapshot.state;
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
        let checkpoint_same = snapshot.state != self.last_state;
        self.commit_candidate(conn, engine, snapshot, wall_time, checkpoint_same)
    }

    pub fn pause(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.pause(now_ms)?;
        self.commit_candidate(conn, engine, snapshot, wall_time, true)
    }

    pub fn resume(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.resume(now_ms)?;
        self.commit_candidate(conn, engine, snapshot, wall_time, true)
    }

    pub fn extend(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.extend(now_ms)?;
        self.commit_candidate(conn, engine, snapshot, wall_time, true)
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
        self.commit_candidate(conn, engine, snapshot, wall_time, false)
    }

    pub fn finish_break(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.finish_break(now_ms)?;
        self.commit_candidate(conn, engine, snapshot, wall_time, false)
    }

    pub fn skip_break(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        wall_time: &str,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let mut engine = self.engine.clone();
        let snapshot = engine.skip_break(now_ms)?;
        self.commit_candidate(conn, engine, snapshot, wall_time, false)
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
        let (closed, opened) = replace_open_focus_session(
            conn,
            current.id,
            current_duration,
            SessionKind::Work,
            Some(task_id),
            wall_time,
        )?;

        self.engine = engine;
        self.binding = Some(SessionBinding::from_record(&opened));
        self.closed_work_seconds = 0;
        self.closed_break_seconds = 0;
        self.last_state = result.current.state;

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
        let closed = close_session(conn, current.id, current_duration, wall_time)?;

        self.engine = engine;
        self.binding = None;
        self.closed_work_seconds = 0;
        self.closed_break_seconds = 0;
        self.last_state = TimerStateKind::Idle;

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
        wall_time: &str,
        checkpoint_same: bool,
    ) -> Result<TimerRuntimeSnapshot, TimerRuntimeError> {
        let desired = desired_binding(&snapshot)?;
        match (self.binding.clone(), desired) {
            (None, None) => {}
            (None, Some(next)) => {
                let opened = open_binding(conn, &next, wall_time)?;
                self.binding = Some(SessionBinding::from_record(&opened));
            }
            (Some(_), None) => return Err(TimerRuntimeError::BindingMismatch),
            (Some(current), Some(next))
                if current.kind == next.kind && current.task_id == next.task_id =>
            {
                if checkpoint_same {
                    let duration = self.open_duration_seconds(&snapshot, current.kind)?;
                    checkpoint_open_session(conn, current.id, duration, wall_time)?;
                }
            }
            (Some(current), Some(next)) => {
                let total = total_seconds(&snapshot, current.kind);
                let duration = self.open_duration_seconds(&snapshot, current.kind)?;
                let (_, opened) = replace_open_focus_session(
                    conn,
                    current.id,
                    duration,
                    next.kind,
                    next.task_id,
                    wall_time,
                )?;
                match current.kind {
                    SessionKind::Work => self.closed_work_seconds = total,
                    SessionKind::Break => self.closed_break_seconds = total,
                }
                self.binding = Some(SessionBinding::from_record(&opened));
            }
        }

        self.engine = engine;
        self.last_state = snapshot.state;
        Ok(self.runtime_snapshot(snapshot))
    }

    fn open_duration_seconds(
        &self,
        snapshot: &TimerSnapshot,
        kind: SessionKind,
    ) -> Result<u64, TimerRuntimeError> {
        let total = total_seconds(snapshot, kind);
        let closed = match kind {
            SessionKind::Work => self.closed_work_seconds,
            SessionKind::Break => self.closed_break_seconds,
        };
        total
            .checked_sub(closed)
            .ok_or(TimerRuntimeError::DurationAccountingUnderflow)
    }

    fn runtime_snapshot(&self, timer: TimerSnapshot) -> TimerRuntimeSnapshot {
        TimerRuntimeSnapshot {
            timer,
            open_session_id: self.open_session_id(),
        }
    }
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

fn open_binding(
    conn: &mut Connection,
    binding: &SessionBinding,
    wall_time: &str,
) -> Result<SessionRecord, TimerRuntimeError> {
    match binding.kind {
        SessionKind::Work => open_focus_work_session(
            conn,
            binding.task_id.ok_or(TimerRuntimeError::BindingMismatch)?,
            wall_time,
        )
        .map_err(TimerRuntimeError::from),
        SessionKind::Break => open_focus_break_session(conn, binding.task_id, wall_time)
            .map_err(TimerRuntimeError::from),
    }
}
