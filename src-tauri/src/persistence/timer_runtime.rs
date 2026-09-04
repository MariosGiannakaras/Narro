use crate::domain::ids::{SessionId, TaskId};
use crate::domain::sessions::{SessionKind, SessionRecord};
use crate::persistence::sessions::{get_open_session, get_session, SessionStoreError};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension, Transaction, TransactionBehavior};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RuntimeCheckpointRecord {
    pub session_id: SessionId,
    pub payload_json: String,
    pub updated_at: String,
}

#[derive(Debug)]
pub enum TimerRuntimeStoreError {
    Session(SessionStoreError),
    MissingCheckpoint,
    UnexpectedCheckpoint(SessionId),
    CheckpointBindingMismatch {
        expected: SessionId,
        actual: SessionId,
    },
}

impl Display for TimerRuntimeStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Session(error) => Display::fmt(error, formatter),
            Self::MissingCheckpoint => {
                formatter.write_str("open timer session has no durable runtime checkpoint")
            }
            Self::UnexpectedCheckpoint(id) => write!(
                formatter,
                "durable runtime checkpoint exists without the expected open session: {id}"
            ),
            Self::CheckpointBindingMismatch { expected, actual } => write!(
                formatter,
                "durable runtime checkpoint is bound to {actual} instead of open session {expected}"
            ),
        }
    }
}

impl std::error::Error for TimerRuntimeStoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Session(error) => Some(error),
            _ => None,
        }
    }
}

impl From<SessionStoreError> for TimerRuntimeStoreError {
    fn from(value: SessionStoreError) -> Self {
        Self::Session(value)
    }
}

impl From<rusqlite::Error> for TimerRuntimeStoreError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Session(SessionStoreError::Sqlite(value))
    }
}

fn validate_mutation_timestamp(value: &str) -> Result<(), TimerRuntimeStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| SessionStoreError::InvalidMutationTimestamp.into())
}

fn parsed_stored_timestamp(
    value: &str,
) -> Result<DateTime<chrono::FixedOffset>, TimerRuntimeStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map_err(|_| SessionStoreError::CorruptStoredTimestamp(value.to_owned()).into())
}

fn ensure_not_before_start(started_at: &str, now: &str) -> Result<(), TimerRuntimeStoreError> {
    let started = parsed_stored_timestamp(started_at)?;
    let now = DateTime::parse_from_rfc3339(now).map_err(|_| {
        TimerRuntimeStoreError::Session(SessionStoreError::InvalidMutationTimestamp)
    })?;
    if now < started {
        return Err(SessionStoreError::EndBeforeStart.into());
    }
    Ok(())
}

fn ensure_not_before_previous_update(
    updated_at: &str,
    now: &str,
) -> Result<(), TimerRuntimeStoreError> {
    let previous = parsed_stored_timestamp(updated_at)?;
    let now = DateTime::parse_from_rfc3339(now).map_err(|_| {
        TimerRuntimeStoreError::Session(SessionStoreError::InvalidMutationTimestamp)
    })?;
    if now < previous {
        return Err(SessionStoreError::TimestampBeforePreviousUpdate.into());
    }
    Ok(())
}

fn duration_for_sql(value: u64) -> Result<i64, TimerRuntimeStoreError> {
    i64::try_from(value)
        .map_err(|_| TimerRuntimeStoreError::Session(SessionStoreError::DurationOverflow))
}

fn validate_focus_task(conn: &Connection, task_id: TaskId) -> Result<(), TimerRuntimeStoreError> {
    let state: Option<(Option<String>, Option<String>, Option<String>)> = conn
        .query_row(
            "SELECT tasks.completed_at, tasks.archived_at, lists.archived_at
             FROM tasks
             JOIN lists ON lists.id = tasks.list_id
             WHERE tasks.id = ?1",
            [task_id.to_string()],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .optional()?;

    match state {
        None => Err(SessionStoreError::TaskNotFound(task_id).into()),
        Some((None, None, None)) => Ok(()),
        Some(_) => Err(SessionStoreError::TaskNotActive(task_id).into()),
    }
}

fn checkpoint_session_id(conn: &Connection) -> Result<Option<SessionId>, TimerRuntimeStoreError> {
    let raw: Option<String> = conn
        .query_row(
            "SELECT session_id FROM timer_runtime_checkpoint WHERE singleton = 1",
            [],
            |row| row.get(0),
        )
        .optional()?;

    raw.map(|value| {
        SessionId::parse_str(&value).map_err(|_| {
            TimerRuntimeStoreError::Session(SessionStoreError::CorruptIdentity {
                field: "timer_runtime_checkpoint.session_id",
                value,
            })
        })
    })
    .transpose()
}

fn ensure_checkpoint_binding(
    conn: &Connection,
    expected: SessionId,
) -> Result<(), TimerRuntimeStoreError> {
    match checkpoint_session_id(conn)? {
        None => Err(TimerRuntimeStoreError::MissingCheckpoint),
        Some(actual) if actual == expected => Ok(()),
        Some(actual) => Err(TimerRuntimeStoreError::CheckpointBindingMismatch { expected, actual }),
    }
}

fn upsert_checkpoint(
    conn: &Connection,
    session_id: SessionId,
    payload_json: &str,
    updated_at: &str,
) -> Result<(), TimerRuntimeStoreError> {
    conn.execute(
        "INSERT INTO timer_runtime_checkpoint (singleton, session_id, payload_json, updated_at)
         VALUES (1, ?1, ?2, ?3)
         ON CONFLICT(singleton) DO UPDATE SET
             session_id = excluded.session_id,
             payload_json = excluded.payload_json,
             updated_at = excluded.updated_at",
        params![session_id.to_string(), payload_json, updated_at],
    )?;
    Ok(())
}

pub fn load_runtime_checkpoint(
    conn: &Connection,
) -> Result<Option<RuntimeCheckpointRecord>, TimerRuntimeStoreError> {
    let raw: Option<(String, String, String)> = conn
        .query_row(
            "SELECT session_id, payload_json, updated_at
             FROM timer_runtime_checkpoint
             WHERE singleton = 1",
            [],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .optional()?;

    let Some((session_id, payload_json, updated_at)) = raw else {
        return Ok(None);
    };
    let parsed_id = SessionId::parse_str(&session_id).map_err(|_| {
        TimerRuntimeStoreError::Session(SessionStoreError::CorruptIdentity {
            field: "timer_runtime_checkpoint.session_id",
            value: session_id,
        })
    })?;
    parsed_stored_timestamp(&updated_at)?;

    Ok(Some(RuntimeCheckpointRecord {
        session_id: parsed_id,
        payload_json,
        updated_at,
    }))
}

pub fn open_focus_work_session_with_checkpoint(
    conn: &mut Connection,
    task_id: TaskId,
    started_at: &str,
    payload_json: &str,
) -> Result<SessionRecord, TimerRuntimeStoreError> {
    validate_mutation_timestamp(started_at)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;

    if let Some(id) = checkpoint_session_id(&tx)? {
        return Err(TimerRuntimeStoreError::UnexpectedCheckpoint(id));
    }
    if let Some(existing) = get_open_session(&tx)? {
        return Err(SessionStoreError::OpenSessionExists(existing.id).into());
    }
    validate_focus_task(&tx, task_id)?;

    let id = SessionId::generate();
    tx.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, 'work', ?3, NULL, 0, 'focus', ?3, ?3)",
        params![id.to_string(), task_id.to_string(), started_at],
    )?;
    upsert_checkpoint(&tx, id, payload_json, started_at)?;

    let created = get_session(&tx, id)?;
    tx.commit()?;
    Ok(created)
}

pub fn checkpoint_open_session_with_runtime(
    conn: &mut Connection,
    id: SessionId,
    duration_seconds: u64,
    now: &str,
    payload_json: &str,
) -> Result<SessionRecord, TimerRuntimeStoreError> {
    validate_mutation_timestamp(now)?;
    let duration_sql = duration_for_sql(duration_seconds)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    ensure_checkpoint_binding(&tx, id)?;

    let current = get_session(&tx, id)?;
    if !current.is_open() {
        return Err(SessionStoreError::AlreadyClosed(id).into());
    }
    ensure_not_before_start(&current.started_at, now)?;
    ensure_not_before_previous_update(&current.updated_at, now)?;
    if duration_seconds < current.duration_seconds {
        return Err(SessionStoreError::DurationDecreased {
            stored_seconds: current.duration_seconds,
            attempted_seconds: duration_seconds,
        }
        .into());
    }

    let changed = tx.execute(
        "UPDATE sessions
         SET duration_seconds = ?1, updated_at = ?2
         WHERE id = ?3 AND ended_at IS NULL",
        params![duration_sql, now, id.to_string()],
    )?;
    if changed != 1 {
        return Err(SessionStoreError::AlreadyClosed(id).into());
    }
    upsert_checkpoint(&tx, id, payload_json, now)?;

    let updated = get_session(&tx, id)?;
    tx.commit()?;
    Ok(updated)
}

pub fn replace_open_focus_session_with_checkpoint(
    conn: &mut Connection,
    current_id: SessionId,
    current_duration_seconds: u64,
    next_kind: SessionKind,
    next_task_id: Option<TaskId>,
    transitioned_at: &str,
    payload_json: &str,
) -> Result<(SessionRecord, SessionRecord), TimerRuntimeStoreError> {
    validate_mutation_timestamp(transitioned_at)?;
    if next_kind == SessionKind::Work && next_task_id.is_none() {
        return Err(SessionStoreError::InvalidSessionShape.into());
    }
    let duration_sql = duration_for_sql(current_duration_seconds)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    ensure_checkpoint_binding(&tx, current_id)?;

    let current = get_session(&tx, current_id)?;
    if !current.is_open() {
        return Err(SessionStoreError::AlreadyClosed(current_id).into());
    }
    ensure_not_before_start(&current.started_at, transitioned_at)?;
    ensure_not_before_previous_update(&current.updated_at, transitioned_at)?;
    if current_duration_seconds < current.duration_seconds {
        return Err(SessionStoreError::DurationDecreased {
            stored_seconds: current.duration_seconds,
            attempted_seconds: current_duration_seconds,
        }
        .into());
    }
    if let Some(task_id) = next_task_id {
        validate_focus_task(&tx, task_id)?;
    }

    let changed = tx.execute(
        "UPDATE sessions
         SET ended_at = ?1, duration_seconds = ?2, updated_at = ?1
         WHERE id = ?3 AND ended_at IS NULL",
        params![transitioned_at, duration_sql, current_id.to_string()],
    )?;
    if changed != 1 {
        return Err(SessionStoreError::AlreadyClosed(current_id).into());
    }

    let next_id = SessionId::generate();
    tx.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, NULL, 0, 'focus', ?4, ?4)",
        params![
            next_id.to_string(),
            next_task_id.map(|value| value.to_string()),
            next_kind.as_str(),
            transitioned_at
        ],
    )?;
    upsert_checkpoint(&tx, next_id, payload_json, transitioned_at)?;

    let closed = get_session(&tx, current_id)?;
    let opened = get_session(&tx, next_id)?;
    tx.commit()?;
    Ok((closed, opened))
}

pub(crate) fn close_session_and_clear_runtime_in_transaction(
    tx: &Transaction<'_>,
    id: SessionId,
    duration_seconds: u64,
    ended_at: &str,
) -> Result<SessionRecord, TimerRuntimeStoreError> {
    validate_mutation_timestamp(ended_at)?;
    let duration_sql = duration_for_sql(duration_seconds)?;
    ensure_checkpoint_binding(tx, id)?;

    let current = get_session(tx, id)?;
    if !current.is_open() {
        return Err(SessionStoreError::AlreadyClosed(id).into());
    }
    ensure_not_before_start(&current.started_at, ended_at)?;
    ensure_not_before_previous_update(&current.updated_at, ended_at)?;
    if duration_seconds < current.duration_seconds {
        return Err(SessionStoreError::DurationDecreased {
            stored_seconds: current.duration_seconds,
            attempted_seconds: duration_seconds,
        }
        .into());
    }

    let changed = tx.execute(
        "UPDATE sessions
         SET ended_at = ?1, duration_seconds = ?2, updated_at = ?1
         WHERE id = ?3 AND ended_at IS NULL",
        params![ended_at, duration_sql, id.to_string()],
    )?;
    if changed != 1 {
        return Err(SessionStoreError::AlreadyClosed(id).into());
    }
    let deleted = tx.execute(
        "DELETE FROM timer_runtime_checkpoint WHERE singleton = 1 AND session_id = ?1",
        [id.to_string()],
    )?;
    if deleted != 1 {
        return Err(TimerRuntimeStoreError::MissingCheckpoint);
    }

    get_session(tx, id).map_err(TimerRuntimeStoreError::from)
}

pub fn close_session_and_clear_runtime(
    conn: &mut Connection,
    id: SessionId,
    duration_seconds: u64,
    ended_at: &str,
) -> Result<SessionRecord, TimerRuntimeStoreError> {
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let closed = close_session_and_clear_runtime_in_transaction(&tx, id, duration_seconds, ended_at)?;
    tx.commit()?;
    Ok(closed)
}
