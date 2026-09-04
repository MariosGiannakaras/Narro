use super::{
    TaskExitReason, TimerEngine, TimerError, TimerExit, TimerMode, TimerRecoveryError, TimerSnapshot,
};
use crate::domain::ids::{SessionId, TaskId};
use crate::domain::sessions::{SessionKind, SessionRecord, SessionSource};
use crate::persistence::sessions::{
    checkpoint_open_session, close_session, get_open_session, open_focus_work_session,
    SessionStoreError,
};
use rusqlite::Connection;
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum SessionCoordinatorError {
    Timer(TimerError),
    Recovery(TimerRecoveryError),
    Session(SessionStoreError),
    PomodoroPersistencePending,
    MissingOpenWorkSession,
    UnexpectedOpenSession {
        id: SessionId,
        kind: SessionKind,
        source: SessionSource,
    },
    OpenWorkSessionMissingTask(SessionId),
}

impl Display for SessionCoordinatorError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Timer(error) => Display::fmt(error, formatter),
            Self::Recovery(error) => Display::fmt(error, formatter),
            Self::Session(error) => Display::fmt(error, formatter),
            Self::PomodoroPersistencePending => formatter.write_str(
                "Pomodoro session persistence requires automatic work/break boundary reconciliation",
            ),
            Self::MissingOpenWorkSession => {
                formatter.write_str("timer coordinator has no open persisted work session")
            }
            Self::UnexpectedOpenSession { id, kind, source } => write!(
                formatter,
                "cannot recover unsupported open session {id}: kind={kind:?} source={source:?}"
            ),
            Self::OpenWorkSessionMissingTask(id) => {
                write!(formatter, "open work session {id} has no task identity")
            }
        }
    }
}

impl std::error::Error for SessionCoordinatorError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Timer(error) => Some(error),
            Self::Recovery(error) => Some(error),
            Self::Session(error) => Some(error),
            _ => None,
        }
    }
}

impl From<TimerError> for SessionCoordinatorError {
    fn from(value: TimerError) -> Self {
        Self::Timer(value)
    }
}

impl From<TimerRecoveryError> for SessionCoordinatorError {
    fn from(value: TimerRecoveryError) -> Self {
        Self::Recovery(value)
    }
}

impl From<SessionStoreError> for SessionCoordinatorError {
    fn from(value: SessionStoreError) -> Self {
        Self::Session(value)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PersistedTimerExit {
    pub timer: TimerExit,
    pub session: SessionRecord,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SessionCoordinator {
    engine: TimerEngine,
    open_work_session_id: Option<SessionId>,
}

impl Default for SessionCoordinator {
    fn default() -> Self {
        Self::new()
    }
}

impl SessionCoordinator {
    pub const fn new() -> Self {
        Self {
            engine: TimerEngine::new(),
            open_work_session_id: None,
        }
    }

    pub const fn open_work_session_id(&self) -> Option<SessionId> {
        self.open_work_session_id
    }

    pub fn snapshot(&self, now_ms: u64) -> Result<TimerSnapshot, SessionCoordinatorError> {
        self.engine.snapshot(now_ms).map_err(Into::into)
    }

    pub fn start_task(
        &mut self,
        conn: &mut Connection,
        task_id: TaskId,
        mode: TimerMode,
        now_ms: u64,
        now: &str,
    ) -> Result<TimerSnapshot, SessionCoordinatorError> {
        ensure_work_only_mode(mode)?;
        let mut candidate = self.engine.clone();
        let snapshot = candidate.start_task(task_id, mode, now_ms)?;
        let session = open_focus_work_session(conn, task_id, now)?;
        self.engine = candidate;
        self.open_work_session_id = Some(session.id);
        Ok(snapshot)
    }

    pub fn checkpoint(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        now: &str,
    ) -> Result<TimerSnapshot, SessionCoordinatorError> {
        let session_id = self.required_open_session()?;
        let mut candidate = self.engine.clone();
        let snapshot = candidate.advance(now_ms)?;
        checkpoint_open_session(
            conn,
            session_id,
            duration_seconds(snapshot.work_elapsed_ms),
            now,
        )?;
        self.engine = candidate;
        Ok(snapshot)
    }

    pub fn pause(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        now: &str,
    ) -> Result<TimerSnapshot, SessionCoordinatorError> {
        let session_id = self.required_open_session()?;
        let mut candidate = self.engine.clone();
        let snapshot = candidate.pause(now_ms)?;
        checkpoint_open_session(
            conn,
            session_id,
            duration_seconds(snapshot.work_elapsed_ms),
            now,
        )?;
        self.engine = candidate;
        Ok(snapshot)
    }

    pub fn resume(&mut self, now_ms: u64) -> Result<TimerSnapshot, SessionCoordinatorError> {
        self.required_open_session()?;
        self.engine.resume(now_ms).map_err(Into::into)
    }

    pub fn extend(&mut self, now_ms: u64) -> Result<TimerSnapshot, SessionCoordinatorError> {
        self.required_open_session()?;
        self.engine.extend(now_ms).map_err(Into::into)
    }

    pub fn finish_task(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        now: &str,
    ) -> Result<PersistedTimerExit, SessionCoordinatorError> {
        self.exit_task(conn, TaskExitReason::Done, now_ms, now)
    }

    pub fn skip_task(
        &mut self,
        conn: &mut Connection,
        now_ms: u64,
        now: &str,
    ) -> Result<PersistedTimerExit, SessionCoordinatorError> {
        self.exit_task(conn, TaskExitReason::Skip, now_ms, now)
    }

    pub fn recover_open_work_paused(
        conn: &Connection,
        mode: TimerMode,
        now_ms: u64,
    ) -> Result<Option<(Self, TimerSnapshot)>, SessionCoordinatorError> {
        ensure_work_only_mode(mode)?;
        let Some(session) = get_open_session(conn)? else {
            return Ok(None);
        };
        if session.kind != SessionKind::Work || session.source != SessionSource::Focus {
            return Err(SessionCoordinatorError::UnexpectedOpenSession {
                id: session.id,
                kind: session.kind,
                source: session.source,
            });
        }
        let task_id = session
            .task_id
            .ok_or(SessionCoordinatorError::OpenWorkSessionMissingTask(session.id))?;
        let persisted_work_ms = session
            .duration_seconds
            .checked_mul(1_000)
            .ok_or(TimerError::DurationOverflow)?;
        let (engine, snapshot) = TimerEngine::restore_interrupted_work_paused(
            task_id,
            mode,
            persisted_work_ms,
            now_ms,
        )?;
        Ok(Some((
            Self {
                engine,
                open_work_session_id: Some(session.id),
            },
            snapshot,
        )))
    }

    fn exit_task(
        &mut self,
        conn: &mut Connection,
        reason: TaskExitReason,
        now_ms: u64,
        now: &str,
    ) -> Result<PersistedTimerExit, SessionCoordinatorError> {
        let session_id = self.required_open_session()?;
        let mut candidate = self.engine.clone();
        let timer = match reason {
            TaskExitReason::Done => candidate.finish_task(now_ms)?,
            TaskExitReason::Skip => candidate.skip_task(now_ms)?,
            TaskExitReason::Switch => unreachable!("switch requires an atomic close/open transition"),
        };
        let session = close_session(
            conn,
            session_id,
            duration_seconds(timer.work_elapsed_ms),
            now,
        )?;
        self.engine = candidate;
        self.open_work_session_id = None;
        Ok(PersistedTimerExit { timer, session })
    }

    fn required_open_session(&self) -> Result<SessionId, SessionCoordinatorError> {
        self.open_work_session_id
            .ok_or(SessionCoordinatorError::MissingOpenWorkSession)
    }
}

fn ensure_work_only_mode(mode: TimerMode) -> Result<(), SessionCoordinatorError> {
    if matches!(mode, TimerMode::Pomodoro { .. }) {
        Err(SessionCoordinatorError::PomodoroPersistencePending)
    } else {
        Ok(())
    }
}

const fn duration_seconds(duration_ms: u64) -> u64 {
    duration_ms / 1_000
}
