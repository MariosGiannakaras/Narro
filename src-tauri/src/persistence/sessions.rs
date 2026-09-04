use crate::domain::ids::{SessionId, TaskId};
use crate::domain::model::{DomainValueError, SessionKind, SessionSource};
use crate::domain::sessions::SessionRecord;
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use crate::timer::{TimerEngine, TimerRecoveryError, TimerRecoveryState, TimerStateKind};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension, Transaction};
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

const RECOVERY_SCHEMA_VERSION: i64 = 1;

#[derive(Debug)]
pub enum SessionPersistenceError {
    Sqlite(rusqlite::Error),
    Task(TaskStoreError),
    List(ListStoreError),
    Domain(DomainValueError),
    Recovery(TimerRecoveryError),
    RecoveryJson(serde_json::Error),
    InvalidTimestamp,
    InvalidStoredSessionId(String),
    InvalidStoredTaskId(String),
    InvalidStoredDuration(i64),
    SessionNotFound(SessionId),
    SessionAlreadyClosed(SessionId),
    SessionNotFocusOwned(SessionId),
    SessionTaskMismatch(SessionId),
    SessionKindMismatch(SessionId),
    DuplicateOpenSession,
    OrphanOpenSession(SessionId),
    DurationRegressed(SessionId),
    DurationOverflow,
    InvalidTransitionShape,
    UnsupportedRecoveryVersion(i64),
    RecoveryTaskMismatch,
}

impl Display for SessionPersistenceError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "session persistence failed: {error}"),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::List(error) => Display::fmt(error, formatter),
            Self::Domain(error) => Display::fmt(error, formatter),
            Self::Recovery(error) => Display::fmt(error, formatter),
            Self::RecoveryJson(error) => {
                write!(formatter, "focus recovery payload is invalid JSON: {error}")
            }
            Self::InvalidTimestamp => {
                formatter.write_str("session mutation timestamp must be RFC 3339")
            }
            Self::InvalidStoredSessionId(value) => {
                write!(formatter, "stored session id is invalid: {value}")
            }
            Self::InvalidStoredTaskId(value) => {
                write!(formatter, "stored session task id is invalid: {value}")
            }
            Self::InvalidStoredDuration(value) => {
                write!(formatter, "stored session duration is invalid: {value}")
            }
            Self::SessionNotFound(id) => write!(formatter, "session not found: {id}"),
            Self::SessionAlreadyClosed(id) => write!(formatter, "session is already closed: {id}"),
            Self::SessionNotFocusOwned(id) => {
                write!(formatter, "session is not owned by focus runtime: {id}")
            }
            Self::SessionTaskMismatch(id) => {
                write!(formatter, "session task does not match focus runtime: {id}")
            }
            Self::SessionKindMismatch(id) => {
                write!(formatter, "session kind does not match focus runtime: {id}")
            }
            Self::DuplicateOpenSession => {
                formatter.write_str("focus runtime already has an unfinished session")
            }
            Self::OrphanOpenSession(id) => {
                write!(
                    formatter,
                    "unfinished session is not linked to recovery state: {id}"
                )
            }
            Self::DurationRegressed(id) => {
                write!(
                    formatter,
                    "session checkpoint duration moved backwards: {id}"
                )
            }
            Self::DurationOverflow => formatter.write_str("session duration does not fit SQLite"),
            Self::InvalidTransitionShape => formatter.write_str(
                "focus persistence transition does not match the authoritative timer state",
            ),
            Self::UnsupportedRecoveryVersion(version) => {
                write!(
                    formatter,
                    "unsupported focus recovery schema version: {version}"
                )
            }
            Self::RecoveryTaskMismatch => formatter.write_str(
                "focus recovery task column does not match the serialized timer recovery task",
            ),
        }
    }
}

impl std::error::Error for SessionPersistenceError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            Self::Domain(error) => Some(error),
            Self::Recovery(error) => Some(error),
            Self::RecoveryJson(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for SessionPersistenceError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<TaskStoreError> for SessionPersistenceError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<ListStoreError> for SessionPersistenceError {
    fn from(value: ListStoreError) -> Self {
        Self::List(value)
    }
}

impl From<DomainValueError> for SessionPersistenceError {
    fn from(value: DomainValueError) -> Self {
        Self::Domain(value)
    }
}

impl From<TimerRecoveryError> for SessionPersistenceError {
    fn from(value: TimerRecoveryError) -> Self {
        Self::Recovery(value)
    }
}

impl From<serde_json::Error> for SessionPersistenceError {
    fn from(value: serde_json::Error) -> Self {
        Self::RecoveryJson(value)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CloseFocusSession {
    pub id: SessionId,
    pub duration_ms: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct OpenFocusSession {
    pub task_id: TaskId,
    pub kind: SessionKind,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FocusTransitionResult {
    pub closed_session: Option<SessionRecord>,
    pub opened_session: Option<SessionRecord>,
    pub retained_session: Option<SessionRecord>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct FocusRecoveryRecord {
    pub timer: TimerRecoveryState,
    pub active_session_id: Option<SessionId>,
    pub active_session_base_ms: u64,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
struct StoredFocusRecoveryPayload {
    timer: TimerRecoveryState,
    active_session_base_ms: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RecoveredFocusRuntime {
    pub engine: TimerEngine,
    pub last_safe_checkpoint_at: String,
}

#[derive(Debug)]
struct StoredSessionRow {
    id: String,
    task_id: Option<String>,
    kind: String,
    started_at: String,
    ended_at: Option<String>,
    duration_seconds: i64,
    source: String,
    created_at: String,
    updated_at: String,
}

fn validate_timestamp(value: &str) -> Result<(), SessionPersistenceError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| SessionPersistenceError::InvalidTimestamp)
}

fn duration_seconds(duration_ms: u64) -> Result<i64, SessionPersistenceError> {
    i64::try_from(duration_ms / 1_000).map_err(|_| SessionPersistenceError::DurationOverflow)
}

fn decode_session(row: StoredSessionRow) -> Result<SessionRecord, SessionPersistenceError> {
    let id = SessionId::parse_str(&row.id)
        .map_err(|_| SessionPersistenceError::InvalidStoredSessionId(row.id.clone()))?;
    let task_id = row
        .task_id
        .map(|value| {
            TaskId::parse_str(&value)
                .map_err(|_| SessionPersistenceError::InvalidStoredTaskId(value))
        })
        .transpose()?;
    let duration_seconds = u64::try_from(row.duration_seconds)
        .map_err(|_| SessionPersistenceError::InvalidStoredDuration(row.duration_seconds))?;

    Ok(SessionRecord {
        id,
        task_id,
        kind: SessionKind::try_from(row.kind.as_str())?,
        started_at: row.started_at,
        ended_at: row.ended_at,
        duration_seconds,
        source: SessionSource::try_from(row.source.as_str())?,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

fn session_by_id(
    conn: &Connection,
    id: SessionId,
) -> Result<SessionRecord, SessionPersistenceError> {
    let row = conn
        .query_row(
            "SELECT id, task_id, kind, started_at, ended_at, duration_seconds,
                    source, created_at, updated_at
             FROM sessions
             WHERE id = ?1",
            [id.to_string()],
            |row| {
                Ok(StoredSessionRow {
                    id: row.get(0)?,
                    task_id: row.get(1)?,
                    kind: row.get(2)?,
                    started_at: row.get(3)?,
                    ended_at: row.get(4)?,
                    duration_seconds: row.get(5)?,
                    source: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                })
            },
        )
        .optional()?;
    row.map(decode_session)
        .transpose()?
        .ok_or(SessionPersistenceError::SessionNotFound(id))
}

fn open_session_id(conn: &Connection) -> Result<Option<SessionId>, SessionPersistenceError> {
    let value: Option<String> = conn
        .query_row(
            "SELECT id FROM sessions WHERE ended_at IS NULL LIMIT 1",
            [],
            |row| row.get(0),
        )
        .optional()?;
    value
        .map(|value| {
            SessionId::parse_str(&value)
                .map_err(|_| SessionPersistenceError::InvalidStoredSessionId(value))
        })
        .transpose()
}

fn validate_active_task(conn: &Connection, task_id: TaskId) -> Result<(), SessionPersistenceError> {
    let task = get_task(conn, task_id)?;
    if task.completed_at.is_some() || task.archived_at.is_some() {
        return Err(SessionPersistenceError::InvalidTransitionShape);
    }
    let list = get_list(conn, task.list_id)?;
    if list.archived_at.is_some() {
        return Err(SessionPersistenceError::InvalidTransitionShape);
    }
    Ok(())
}

fn expected_active_kind(state: TimerStateKind) -> Option<SessionKind> {
    match state {
        TimerStateKind::Running | TimerStateKind::OvertimeRunning => Some(SessionKind::Work),
        TimerStateKind::Break => Some(SessionKind::Break),
        TimerStateKind::Idle
        | TimerStateKind::Paused
        | TimerStateKind::TimeUp
        | TimerStateKind::OvertimePaused => None,
    }
}

fn open_focus_session_in_tx(
    tx: &Transaction<'_>,
    input: OpenFocusSession,
    now: &str,
) -> Result<SessionRecord, SessionPersistenceError> {
    validate_active_task(tx, input.task_id)?;
    if open_session_id(tx)?.is_some() {
        return Err(SessionPersistenceError::DuplicateOpenSession);
    }

    let id = SessionId::generate();
    tx.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, NULL, 0, 'focus', ?4, ?4)",
        params![
            id.to_string(),
            input.task_id.to_string(),
            input.kind.as_str(),
            now
        ],
    )?;
    session_by_id(tx, id)
}

fn close_focus_session_in_tx(
    tx: &Transaction<'_>,
    input: CloseFocusSession,
    ended_at: &str,
) -> Result<SessionRecord, SessionPersistenceError> {
    let current = session_by_id(tx, input.id)?;
    if current.ended_at.is_some() {
        return Err(SessionPersistenceError::SessionAlreadyClosed(input.id));
    }
    if current.source != SessionSource::Focus {
        return Err(SessionPersistenceError::SessionNotFocusOwned(input.id));
    }
    let next_duration = duration_seconds(input.duration_ms)?;
    if u64::try_from(next_duration).map_err(|_| SessionPersistenceError::DurationOverflow)?
        < current.duration_seconds
    {
        return Err(SessionPersistenceError::DurationRegressed(input.id));
    }

    tx.execute(
        "UPDATE sessions
         SET ended_at = ?1, duration_seconds = ?2, updated_at = ?1
         WHERE id = ?3 AND ended_at IS NULL",
        params![ended_at, next_duration, input.id.to_string()],
    )?;
    session_by_id(tx, input.id)
}

fn checkpoint_focus_session_in_tx(
    tx: &Transaction<'_>,
    id: SessionId,
    duration_ms: u64,
    updated_at: &str,
) -> Result<SessionRecord, SessionPersistenceError> {
    let current = session_by_id(tx, id)?;
    if current.ended_at.is_some() {
        return Err(SessionPersistenceError::SessionAlreadyClosed(id));
    }
    if current.source != SessionSource::Focus {
        return Err(SessionPersistenceError::SessionNotFocusOwned(id));
    }
    let next_duration = duration_seconds(duration_ms)?;
    if u64::try_from(next_duration).map_err(|_| SessionPersistenceError::DurationOverflow)?
        < current.duration_seconds
    {
        return Err(SessionPersistenceError::DurationRegressed(id));
    }

    tx.execute(
        "UPDATE sessions
         SET duration_seconds = ?1, updated_at = ?2
         WHERE id = ?3 AND ended_at IS NULL",
        params![next_duration, updated_at, id.to_string()],
    )?;
    session_by_id(tx, id)
}

fn validate_retained_focus_session(
    tx: &Transaction<'_>,
    id: SessionId,
    task_id: TaskId,
    kind: SessionKind,
) -> Result<SessionRecord, SessionPersistenceError> {
    let current = session_by_id(tx, id)?;
    if current.ended_at.is_some() {
        return Err(SessionPersistenceError::SessionAlreadyClosed(id));
    }
    if current.source != SessionSource::Focus {
        return Err(SessionPersistenceError::SessionNotFocusOwned(id));
    }
    if current.task_id != Some(task_id) {
        return Err(SessionPersistenceError::SessionTaskMismatch(id));
    }
    if current.kind != kind {
        return Err(SessionPersistenceError::SessionKindMismatch(id));
    }
    Ok(current)
}

fn save_recovery_in_tx(
    tx: &Transaction<'_>,
    timer: &TimerRecoveryState,
    active_session_id: Option<SessionId>,
    active_session_base_ms: u64,
    now: &str,
) -> Result<(), SessionPersistenceError> {
    let payload = serde_json::to_string(&StoredFocusRecoveryPayload {
        timer: timer.clone(),
        active_session_base_ms,
    })?;
    tx.execute(
        "INSERT INTO focus_runtime_recovery (
            id, task_id, active_session_id, schema_version, payload_json, updated_at
         ) VALUES (1, ?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(id) DO UPDATE SET
            task_id = excluded.task_id,
            active_session_id = excluded.active_session_id,
            schema_version = excluded.schema_version,
            payload_json = excluded.payload_json,
            updated_at = excluded.updated_at",
        params![
            timer.task_id.to_string(),
            active_session_id.map(|id| id.to_string()),
            RECOVERY_SCHEMA_VERSION,
            payload,
            now
        ],
    )?;
    Ok(())
}

fn load_recovery_from_connection(
    conn: &Connection,
) -> Result<Option<FocusRecoveryRecord>, SessionPersistenceError> {
    let row: Option<(String, Option<String>, i64, String, String)> = conn
        .query_row(
            "SELECT task_id, active_session_id, schema_version, payload_json, updated_at
             FROM focus_runtime_recovery
             WHERE id = 1",
            [],
            |row| {
                Ok((
                    row.get(0)?,
                    row.get(1)?,
                    row.get(2)?,
                    row.get(3)?,
                    row.get(4)?,
                ))
            },
        )
        .optional()?;

    let Some((task_id, active_session_id, version, payload, updated_at)) = row else {
        return Ok(None);
    };
    if version != RECOVERY_SCHEMA_VERSION {
        return Err(SessionPersistenceError::UnsupportedRecoveryVersion(version));
    }
    let task_id = TaskId::parse_str(&task_id)
        .map_err(|_| SessionPersistenceError::InvalidStoredTaskId(task_id))?;
    let active_session_id = active_session_id
        .map(|value| {
            SessionId::parse_str(&value)
                .map_err(|_| SessionPersistenceError::InvalidStoredSessionId(value))
        })
        .transpose()?;
    let payload: StoredFocusRecoveryPayload = serde_json::from_str(&payload)?;
    if payload.timer.task_id != task_id {
        return Err(SessionPersistenceError::RecoveryTaskMismatch);
    }

    Ok(Some(FocusRecoveryRecord {
        timer: payload.timer,
        active_session_id,
        active_session_base_ms: payload.active_session_base_ms,
        updated_at,
    }))
}

pub fn load_focus_recovery(
    conn: &Connection,
) -> Result<Option<FocusRecoveryRecord>, SessionPersistenceError> {
    load_recovery_from_connection(conn)
}

pub fn persist_focus_transition(
    conn: &mut Connection,
    close: Option<CloseFocusSession>,
    open: Option<OpenFocusSession>,
    recovery: &TimerRecoveryState,
    now: &str,
) -> Result<FocusTransitionResult, SessionPersistenceError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let previous = load_recovery_from_connection(&tx)?;
    let expected_kind = expected_active_kind(recovery.state);

    let mut closed_session = None;
    let mut opened_session = None;
    let mut retained_session = None;
    let mut active_session_id = None;
    let mut active_session_base_ms = 0;

    if recovery.state == TimerStateKind::TimeUp {
        if open.is_some() {
            return Err(SessionPersistenceError::InvalidTransitionShape);
        }
        let hold = close.ok_or(SessionPersistenceError::InvalidTransitionShape)?;
        let previous = previous
            .as_ref()
            .ok_or(SessionPersistenceError::InvalidTransitionShape)?;
        if previous.timer.state != TimerStateKind::Running
            || previous.timer.task_id != recovery.task_id
            || previous.active_session_id != Some(hold.id)
        {
            return Err(SessionPersistenceError::InvalidTransitionShape);
        }
        validate_retained_focus_session(&tx, hold.id, recovery.task_id, SessionKind::Work)?;
        let held = checkpoint_focus_session_in_tx(&tx, hold.id, hold.duration_ms, now)?;
        active_session_id = Some(hold.id);
        active_session_base_ms = hold.duration_ms;
        retained_session = Some(held);
    } else {
        closed_session = close
            .map(|input| close_focus_session_in_tx(&tx, input, now))
            .transpose()?;

        let existing_open = open_session_id(&tx)?;
        match expected_kind {
            Some(expected) => {
                if let Some(input) = open {
                    if input.kind != expected || input.task_id != recovery.task_id {
                        return Err(SessionPersistenceError::InvalidTransitionShape);
                    }
                    if let Some(orphan) = existing_open {
                        return Err(SessionPersistenceError::OrphanOpenSession(orphan));
                    }
                    let opened = open_focus_session_in_tx(&tx, input, now)?;
                    active_session_id = Some(opened.id);
                    opened_session = Some(opened);
                } else {
                    let previous = previous
                        .as_ref()
                        .ok_or(SessionPersistenceError::InvalidTransitionShape)?;
                    let retained_id = previous
                        .active_session_id
                        .ok_or(SessionPersistenceError::InvalidTransitionShape)?;
                    if recovery.state != TimerStateKind::OvertimeRunning
                        || previous.timer.state != TimerStateKind::TimeUp
                        || previous.timer.task_id != recovery.task_id
                        || existing_open != Some(retained_id)
                    {
                        return Err(SessionPersistenceError::InvalidTransitionShape);
                    }
                    let retained = validate_retained_focus_session(
                        &tx,
                        retained_id,
                        recovery.task_id,
                        expected,
                    )?;
                    active_session_id = Some(retained_id);
                    active_session_base_ms = previous.active_session_base_ms;
                    retained_session = Some(retained);
                }
            }
            None => {
                if open.is_some() {
                    return Err(SessionPersistenceError::InvalidTransitionShape);
                }
                if let Some(orphan) = existing_open {
                    return Err(SessionPersistenceError::OrphanOpenSession(orphan));
                }
            }
        }
    }

    save_recovery_in_tx(
        &tx,
        recovery,
        active_session_id,
        active_session_base_ms,
        now,
    )?;
    tx.commit()?;

    Ok(FocusTransitionResult {
        closed_session,
        opened_session,
        retained_session,
    })
}

pub fn checkpoint_focus_runtime(
    conn: &mut Connection,
    active_session_id: SessionId,
    recovery: &TimerRecoveryState,
    now: &str,
) -> Result<SessionRecord, SessionPersistenceError> {
    validate_timestamp(now)?;
    let expected_kind = expected_active_kind(recovery.state)
        .ok_or(SessionPersistenceError::InvalidTransitionShape)?;
    let segment_ms = recovery
        .active_segment_elapsed_ms
        .ok_or(SessionPersistenceError::InvalidTransitionShape)?;

    let tx = conn.transaction()?;
    let stored = load_recovery_from_connection(&tx)?
        .ok_or(SessionPersistenceError::InvalidTransitionShape)?;
    if stored.timer.task_id != recovery.task_id
        || stored.active_session_id != Some(active_session_id)
    {
        return Err(SessionPersistenceError::InvalidTransitionShape);
    }
    let current =
        validate_retained_focus_session(&tx, active_session_id, recovery.task_id, expected_kind)?;
    let next_duration_ms = stored
        .active_session_base_ms
        .checked_add(segment_ms)
        .ok_or(SessionPersistenceError::DurationOverflow)?;
    let next_duration = duration_seconds(next_duration_ms)?;
    if u64::try_from(next_duration).map_err(|_| SessionPersistenceError::DurationOverflow)?
        < current.duration_seconds
    {
        return Err(SessionPersistenceError::DurationRegressed(
            active_session_id,
        ));
    }

    tx.execute(
        "UPDATE sessions
         SET duration_seconds = ?1, updated_at = ?2
         WHERE id = ?3 AND ended_at IS NULL",
        params![next_duration, now, active_session_id.to_string()],
    )?;
    save_recovery_in_tx(
        &tx,
        recovery,
        Some(active_session_id),
        stored.active_session_base_ms,
        now,
    )?;
    let updated = session_by_id(&tx, active_session_id)?;
    tx.commit()?;
    Ok(updated)
}

pub fn clear_focus_recovery(conn: &mut Connection) -> Result<(), SessionPersistenceError> {
    let tx = conn.transaction()?;
    if let Some(open) = open_session_id(&tx)? {
        return Err(SessionPersistenceError::OrphanOpenSession(open));
    }
    tx.execute("DELETE FROM focus_runtime_recovery WHERE id = 1", [])?;
    tx.commit()?;
    Ok(())
}

pub fn recover_interrupted_focus(
    conn: &mut Connection,
    restarted_at: &str,
) -> Result<Option<RecoveredFocusRuntime>, SessionPersistenceError> {
    validate_timestamp(restarted_at)?;
    let tx = conn.transaction()?;
    let Some(stored) = load_recovery_from_connection(&tx)? else {
        if let Some(open) = open_session_id(&tx)? {
            return Err(SessionPersistenceError::OrphanOpenSession(open));
        }
        return Ok(None);
    };

    if let Some(active_session_id) = stored.active_session_id {
        let active = session_by_id(&tx, active_session_id)?;
        if active.ended_at.is_some() {
            return Err(SessionPersistenceError::SessionAlreadyClosed(
                active_session_id,
            ));
        }
        if active.source != SessionSource::Focus {
            return Err(SessionPersistenceError::SessionNotFocusOwned(
                active_session_id,
            ));
        }
        if active.task_id != Some(stored.timer.task_id) {
            return Err(SessionPersistenceError::SessionTaskMismatch(
                active_session_id,
            ));
        }
        let checkpoint_at = active.updated_at.clone();
        tx.execute(
            "UPDATE sessions
             SET ended_at = ?1, updated_at = ?1
             WHERE id = ?2 AND ended_at IS NULL",
            params![checkpoint_at, active_session_id.to_string()],
        )?;
    } else if let Some(open) = open_session_id(&tx)? {
        return Err(SessionPersistenceError::OrphanOpenSession(open));
    }

    let engine = TimerEngine::from_recovery_paused(stored.timer)?;
    let normalized = engine
        .recovery_state(0)?
        .ok_or(SessionPersistenceError::InvalidTransitionShape)?;
    save_recovery_in_tx(&tx, &normalized, None, 0, restarted_at)?;
    tx.commit()?;

    Ok(Some(RecoveredFocusRuntime {
        engine,
        last_safe_checkpoint_at: stored.updated_at,
    }))
}

pub fn sessions_for_task(
    conn: &Connection,
    task_id: TaskId,
) -> Result<Vec<SessionRecord>, SessionPersistenceError> {
    let mut statement = conn.prepare(
        "SELECT id, task_id, kind, started_at, ended_at, duration_seconds,
                source, created_at, updated_at
         FROM sessions
         WHERE task_id = ?1
         ORDER BY started_at, id",
    )?;
    let rows = statement.query_map([task_id.to_string()], |row| {
        Ok(StoredSessionRow {
            id: row.get(0)?,
            task_id: row.get(1)?,
            kind: row.get(2)?,
            started_at: row.get(3)?,
            ended_at: row.get(4)?,
            duration_seconds: row.get(5)?,
            source: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    })?;

    let mut sessions = Vec::new();
    for row in rows {
        sessions.push(decode_session(row?)?);
    }
    Ok(sessions)
}

pub fn active_focus_session(
    conn: &Connection,
) -> Result<Option<SessionRecord>, SessionPersistenceError> {
    open_session_id(conn)?
        .map(|id| session_by_id(conn, id))
        .transpose()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::create_task;
    use crate::timer::TimerMode;
    use rusqlite::Connection;

    const T1: &str = "2026-09-04T08:00:00Z";
    const T2: &str = "2026-09-04T08:01:00Z";

    fn fixture() -> (Connection, TaskId) {
        let mut conn = Connection::open_in_memory().expect("open session fixture database");
        run_migrations(&mut conn).expect("migrate session fixture database");
        let list = create_list(
            &mut conn,
            NewListInput {
                title: "Inbox".into(),
                color: None,
                icon_asset: None,
            },
            T1,
        )
        .expect("create session fixture list");
        let task = create_task(
            &mut conn,
            NewTaskInput {
                list_id: list.id,
                title: "Focus task".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            T1,
        )
        .expect("create session fixture task");
        (conn, task.id)
    }

    #[test]
    fn transition_rejects_open_shape_that_disagrees_with_timer_state() {
        let (mut conn, task_id) = fixture();
        let mut engine = TimerEngine::new();
        engine.start_task(task_id, TimerMode::CountUp, 0).unwrap();
        let recovery = engine.recovery_state(0).unwrap().unwrap();

        let result = persist_focus_transition(
            &mut conn,
            None,
            Some(OpenFocusSession {
                task_id,
                kind: SessionKind::Break,
            }),
            &recovery,
            T2,
        );
        assert!(matches!(
            result,
            Err(SessionPersistenceError::InvalidTransitionShape)
        ));
        assert!(active_focus_session(&conn).unwrap().is_none());
    }

    #[test]
    fn clear_recovery_refuses_to_orphan_an_open_session() {
        let (mut conn, task_id) = fixture();
        let mut engine = TimerEngine::new();
        engine.start_task(task_id, TimerMode::CountUp, 0).unwrap();
        let recovery = engine.recovery_state(0).unwrap().unwrap();
        persist_focus_transition(
            &mut conn,
            None,
            Some(OpenFocusSession {
                task_id,
                kind: SessionKind::Work,
            }),
            &recovery,
            T1,
        )
        .unwrap();

        assert!(matches!(
            clear_focus_recovery(&mut conn),
            Err(SessionPersistenceError::OrphanOpenSession(_))
        ));
    }
}
