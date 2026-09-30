use crate::domain::ids::{SessionId, TaskId};
use crate::domain::sessions::{SessionKind, SessionRecord, SessionSource};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension, TransactionBehavior};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum SessionStoreError {
    Sqlite(rusqlite::Error),
    InvalidMutationTimestamp,
    InvalidSessionTimestamp(&'static str),
    CorruptStoredTimestamp(String),
    InvalidSessionShape,
    TaskNotFound(TaskId),
    TaskNotActive(TaskId),
    OpenSessionExists(SessionId),
    OpenSessionMutation(SessionId),
    StaleVersion {
        expected: String,
        actual: String,
    },
    NotFound(SessionId),
    AlreadyClosed(SessionId),
    DurationDecreased {
        stored_seconds: u64,
        attempted_seconds: u64,
    },
    DurationOverflow,
    EndBeforeStart,
    TimestampBeforePreviousUpdate,
    CorruptIdentity {
        field: &'static str,
        value: String,
    },
    CorruptToken {
        field: &'static str,
        value: String,
    },
    CorruptDuration(i64),
}

impl Display for SessionStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "session persistence failed: {error}"),
            Self::InvalidMutationTimestamp => {
                formatter.write_str("session mutation timestamp must be RFC 3339")
            }
            Self::InvalidSessionTimestamp(field) => {
                write!(formatter, "session {field} must be RFC 3339")
            }
            Self::CorruptStoredTimestamp(value) => {
                write!(formatter, "stored session timestamp is invalid: {value}")
            }
            Self::InvalidSessionShape => {
                formatter.write_str("work sessions require an owning task identity")
            }
            Self::TaskNotFound(id) => write!(formatter, "session task not found: {id}"),
            Self::TaskNotActive(id) => write!(formatter, "session task is not active: {id}"),
            Self::OpenSessionExists(id) => {
                write!(formatter, "an unfinished session already exists: {id}")
            }
            Self::OpenSessionMutation(id) => {
                write!(formatter, "unfinished session cannot be edited or deleted: {id}")
            }
            Self::StaleVersion { expected, actual } => {
                write!(
                    formatter,
                    "session changed before mutation: expected updated_at={expected}, actual={actual}"
                )
            }
            Self::NotFound(id) => write!(formatter, "session not found: {id}"),
            Self::AlreadyClosed(id) => write!(formatter, "session is already closed: {id}"),
            Self::DurationDecreased {
                stored_seconds,
                attempted_seconds,
            } => write!(
                formatter,
                "session checkpoint cannot decrease duration: stored={stored_seconds}s attempted={attempted_seconds}s"
            ),
            Self::DurationOverflow => formatter.write_str("session duration exceeds SQLite range"),
            Self::EndBeforeStart => {
                formatter.write_str("session end/checkpoint timestamp cannot precede start")
            }
            Self::TimestampBeforePreviousUpdate => formatter.write_str(
                "session mutation timestamp cannot precede the previous persisted update",
            ),
            Self::CorruptIdentity { field, value } => {
                write!(formatter, "stored session {field} identity is invalid: {value}")
            }
            Self::CorruptToken { field, value } => {
                write!(formatter, "stored session {field} token is invalid: {value}")
            }
            Self::CorruptDuration(value) => {
                write!(formatter, "stored session duration is invalid: {value}")
            }
        }
    }
}

impl std::error::Error for SessionStoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for SessionStoreError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

#[derive(Debug)]
struct RawSession {
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

fn validate_mutation_timestamp(value: &str) -> Result<(), SessionStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| SessionStoreError::InvalidMutationTimestamp)
}

fn parsed_input_timestamp(
    field: &'static str,
    value: &str,
) -> Result<DateTime<chrono::FixedOffset>, SessionStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map_err(|_| SessionStoreError::InvalidSessionTimestamp(field))
}

fn validate_closed_session_input(
    started_at: &str,
    ended_at: &str,
    duration_seconds: u64,
) -> Result<i64, SessionStoreError> {
    let started = parsed_input_timestamp("started_at", started_at)?;
    let ended = parsed_input_timestamp("ended_at", ended_at)?;
    if ended < started {
        return Err(SessionStoreError::EndBeforeStart);
    }
    duration_for_sql(duration_seconds)
}

fn ensure_task_exists(conn: &Connection, task_id: TaskId) -> Result<(), SessionStoreError> {
    let exists = conn
        .query_row(
            "SELECT 1 FROM tasks WHERE id = ?1",
            [task_id.to_string()],
            |_| Ok(()),
        )
        .optional()?;
    if exists.is_some() {
        Ok(())
    } else {
        Err(SessionStoreError::TaskNotFound(task_id))
    }
}

fn validate_expected_updated_at(
    current: &SessionRecord,
    expected_updated_at: &str,
) -> Result<(), SessionStoreError> {
    if current.updated_at == expected_updated_at {
        Ok(())
    } else {
        Err(SessionStoreError::StaleVersion {
            expected: expected_updated_at.to_owned(),
            actual: current.updated_at.clone(),
        })
    }
}

fn parsed_stored_timestamp(
    value: &str,
) -> Result<DateTime<chrono::FixedOffset>, SessionStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map_err(|_| SessionStoreError::CorruptStoredTimestamp(value.to_owned()))
}

fn ensure_not_before_start(started_at: &str, now: &str) -> Result<(), SessionStoreError> {
    let started = parsed_stored_timestamp(started_at)?;
    let now = DateTime::parse_from_rfc3339(now)
        .map_err(|_| SessionStoreError::InvalidMutationTimestamp)?;
    if now < started {
        return Err(SessionStoreError::EndBeforeStart);
    }
    Ok(())
}

fn ensure_not_before_previous_update(updated_at: &str, now: &str) -> Result<(), SessionStoreError> {
    let previous = parsed_stored_timestamp(updated_at)?;
    let now = DateTime::parse_from_rfc3339(now)
        .map_err(|_| SessionStoreError::InvalidMutationTimestamp)?;
    if now < previous {
        return Err(SessionStoreError::TimestampBeforePreviousUpdate);
    }
    Ok(())
}

fn duration_for_sql(value: u64) -> Result<i64, SessionStoreError> {
    i64::try_from(value).map_err(|_| SessionStoreError::DurationOverflow)
}

fn raw_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<RawSession> {
    Ok(RawSession {
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
}

fn decode_session(raw: RawSession) -> Result<SessionRecord, SessionStoreError> {
    let id = SessionId::parse_str(&raw.id).map_err(|_| SessionStoreError::CorruptIdentity {
        field: "id",
        value: raw.id.clone(),
    })?;
    let task_id = raw
        .task_id
        .as_deref()
        .map(TaskId::parse_str)
        .transpose()
        .map_err(|_| SessionStoreError::CorruptIdentity {
            field: "task_id",
            value: raw.task_id.clone().unwrap_or_default(),
        })?;
    let kind = SessionKind::parse(&raw.kind).ok_or_else(|| SessionStoreError::CorruptToken {
        field: "kind",
        value: raw.kind.clone(),
    })?;
    let source =
        SessionSource::parse(&raw.source).ok_or_else(|| SessionStoreError::CorruptToken {
            field: "source",
            value: raw.source.clone(),
        })?;
    if kind == SessionKind::Work && task_id.is_none() {
        return Err(SessionStoreError::InvalidSessionShape);
    }
    if raw.duration_seconds < 0 {
        return Err(SessionStoreError::CorruptDuration(raw.duration_seconds));
    }
    parsed_stored_timestamp(&raw.started_at)?;
    parsed_stored_timestamp(&raw.created_at)?;
    parsed_stored_timestamp(&raw.updated_at)?;
    if let Some(ended_at) = raw.ended_at.as_deref() {
        parsed_stored_timestamp(ended_at)?;
        ensure_not_before_start(&raw.started_at, ended_at)?;
    }

    Ok(SessionRecord {
        id,
        task_id,
        kind,
        started_at: raw.started_at,
        ended_at: raw.ended_at,
        duration_seconds: u64::try_from(raw.duration_seconds)
            .map_err(|_| SessionStoreError::CorruptDuration(raw.duration_seconds))?,
        source,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
    })
}

fn load_session(conn: &Connection, id: SessionId) -> Result<SessionRecord, SessionStoreError> {
    let raw = conn
        .query_row(
            "SELECT id, task_id, kind, started_at, ended_at, duration_seconds,
                    source, created_at, updated_at
             FROM sessions WHERE id = ?1",
            [id.to_string()],
            raw_from_row,
        )
        .optional()?;
    raw.map(decode_session)
        .transpose()?
        .ok_or(SessionStoreError::NotFound(id))
}

fn load_open_session(conn: &Connection) -> Result<Option<SessionRecord>, SessionStoreError> {
    let raw = conn
        .query_row(
            "SELECT id, task_id, kind, started_at, ended_at, duration_seconds,
                    source, created_at, updated_at
             FROM sessions WHERE ended_at IS NULL LIMIT 1",
            [],
            raw_from_row,
        )
        .optional()?;
    raw.map(decode_session).transpose()
}

fn validate_focus_task(conn: &Connection, task_id: TaskId) -> Result<(), SessionStoreError> {
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
        None => Err(SessionStoreError::TaskNotFound(task_id)),
        Some((None, None, None)) => Ok(()),
        Some(_) => Err(SessionStoreError::TaskNotActive(task_id)),
    }
}

fn open_focus_session(
    conn: &mut Connection,
    kind: SessionKind,
    task_id: Option<TaskId>,
    started_at: &str,
) -> Result<SessionRecord, SessionStoreError> {
    validate_mutation_timestamp(started_at)?;
    if kind == SessionKind::Work && task_id.is_none() {
        return Err(SessionStoreError::InvalidSessionShape);
    }

    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    if let Some(existing) = load_open_session(&tx)? {
        return Err(SessionStoreError::OpenSessionExists(existing.id));
    }
    if let Some(task_id) = task_id {
        validate_focus_task(&tx, task_id)?;
    }

    let id = SessionId::generate();
    tx.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, NULL, 0, 'focus', ?4, ?4)",
        params![
            id.to_string(),
            task_id.map(|value| value.to_string()),
            kind.as_str(),
            started_at
        ],
    )?;
    let created = load_session(&tx, id)?;
    tx.commit()?;
    Ok(created)
}

pub fn open_focus_work_session(
    conn: &mut Connection,
    task_id: TaskId,
    started_at: &str,
) -> Result<SessionRecord, SessionStoreError> {
    open_focus_session(conn, SessionKind::Work, Some(task_id), started_at)
}

pub fn open_focus_break_session(
    conn: &mut Connection,
    task_id: Option<TaskId>,
    started_at: &str,
) -> Result<SessionRecord, SessionStoreError> {
    open_focus_session(conn, SessionKind::Break, task_id, started_at)
}

pub fn get_session(conn: &Connection, id: SessionId) -> Result<SessionRecord, SessionStoreError> {
    load_session(conn, id)
}

pub fn get_open_session(conn: &Connection) -> Result<Option<SessionRecord>, SessionStoreError> {
    load_open_session(conn)
}

pub fn checkpoint_open_session(
    conn: &mut Connection,
    id: SessionId,
    duration_seconds: u64,
    now: &str,
) -> Result<SessionRecord, SessionStoreError> {
    validate_mutation_timestamp(now)?;
    let duration_sql = duration_for_sql(duration_seconds)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = load_session(&tx, id)?;
    if !current.is_open() {
        return Err(SessionStoreError::AlreadyClosed(id));
    }
    ensure_not_before_start(&current.started_at, now)?;
    ensure_not_before_previous_update(&current.updated_at, now)?;
    if duration_seconds < current.duration_seconds {
        return Err(SessionStoreError::DurationDecreased {
            stored_seconds: current.duration_seconds,
            attempted_seconds: duration_seconds,
        });
    }

    let changed = tx.execute(
        "UPDATE sessions
         SET duration_seconds = ?1, updated_at = ?2
         WHERE id = ?3 AND ended_at IS NULL",
        params![duration_sql, now, id.to_string()],
    )?;
    if changed != 1 {
        return Err(SessionStoreError::AlreadyClosed(id));
    }
    let updated = load_session(&tx, id)?;
    tx.commit()?;
    Ok(updated)
}

pub fn close_session(
    conn: &mut Connection,
    id: SessionId,
    duration_seconds: u64,
    ended_at: &str,
) -> Result<SessionRecord, SessionStoreError> {
    validate_mutation_timestamp(ended_at)?;
    let duration_sql = duration_for_sql(duration_seconds)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = load_session(&tx, id)?;
    if !current.is_open() {
        return Err(SessionStoreError::AlreadyClosed(id));
    }
    ensure_not_before_start(&current.started_at, ended_at)?;
    ensure_not_before_previous_update(&current.updated_at, ended_at)?;
    if duration_seconds < current.duration_seconds {
        return Err(SessionStoreError::DurationDecreased {
            stored_seconds: current.duration_seconds,
            attempted_seconds: duration_seconds,
        });
    }

    let changed = tx.execute(
        "UPDATE sessions
         SET ended_at = ?1, duration_seconds = ?2, updated_at = ?1
         WHERE id = ?3 AND ended_at IS NULL",
        params![ended_at, duration_sql, id.to_string()],
    )?;
    if changed != 1 {
        return Err(SessionStoreError::AlreadyClosed(id));
    }
    let closed = load_session(&tx, id)?;
    tx.commit()?;
    Ok(closed)
}

pub fn replace_open_focus_session(
    conn: &mut Connection,
    current_id: SessionId,
    current_duration_seconds: u64,
    next_kind: SessionKind,
    next_task_id: Option<TaskId>,
    transitioned_at: &str,
) -> Result<(SessionRecord, SessionRecord), SessionStoreError> {
    validate_mutation_timestamp(transitioned_at)?;
    if next_kind == SessionKind::Work && next_task_id.is_none() {
        return Err(SessionStoreError::InvalidSessionShape);
    }
    let duration_sql = duration_for_sql(current_duration_seconds)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = load_session(&tx, current_id)?;
    if !current.is_open() {
        return Err(SessionStoreError::AlreadyClosed(current_id));
    }
    ensure_not_before_start(&current.started_at, transitioned_at)?;
    ensure_not_before_previous_update(&current.updated_at, transitioned_at)?;
    if current_duration_seconds < current.duration_seconds {
        return Err(SessionStoreError::DurationDecreased {
            stored_seconds: current.duration_seconds,
            attempted_seconds: current_duration_seconds,
        });
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
        return Err(SessionStoreError::AlreadyClosed(current_id));
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

    let closed = load_session(&tx, current_id)?;
    let opened = load_session(&tx, next_id)?;
    tx.commit()?;
    Ok((closed, opened))
}

pub fn create_manual_work_session(
    conn: &mut Connection,
    task_id: TaskId,
    started_at: &str,
    ended_at: &str,
    duration_seconds: u64,
    now: &str,
) -> Result<SessionRecord, SessionStoreError> {
    validate_mutation_timestamp(now)?;
    let duration_sql = validate_closed_session_input(started_at, ended_at, duration_seconds)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    ensure_task_exists(&tx, task_id)?;

    let id = SessionId::generate();
    tx.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, 'work', ?3, ?4, ?5, 'manual', ?6, ?6)",
        params![
            id.to_string(),
            task_id.to_string(),
            started_at,
            ended_at,
            duration_sql,
            now,
        ],
    )?;

    let created = load_session(&tx, id)?;
    tx.commit()?;
    Ok(created)
}

pub fn edit_closed_session_if_expected(
    conn: &mut Connection,
    id: SessionId,
    expected_updated_at: &str,
    started_at: &str,
    ended_at: &str,
    duration_seconds: u64,
    now: &str,
) -> Result<SessionRecord, SessionStoreError> {
    validate_mutation_timestamp(now)?;
    let duration_sql = validate_closed_session_input(started_at, ended_at, duration_seconds)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = load_session(&tx, id)?;
    if current.is_open() {
        return Err(SessionStoreError::OpenSessionMutation(id));
    }
    validate_expected_updated_at(&current, expected_updated_at)?;
    ensure_not_before_previous_update(&current.updated_at, now)?;

    let changed = tx.execute(
        "UPDATE sessions
         SET started_at = ?1,
             ended_at = ?2,
             duration_seconds = ?3,
             source = 'edit',
             updated_at = ?4
         WHERE id = ?5
           AND ended_at IS NOT NULL
           AND updated_at = ?6",
        params![
            started_at,
            ended_at,
            duration_sql,
            now,
            id.to_string(),
            expected_updated_at,
        ],
    )?;
    if changed != 1 {
        return Err(SessionStoreError::StaleVersion {
            expected: expected_updated_at.to_owned(),
            actual: load_session(&tx, id)?.updated_at,
        });
    }

    let updated = load_session(&tx, id)?;
    tx.commit()?;
    Ok(updated)
}

pub fn delete_closed_session_if_expected(
    conn: &mut Connection,
    id: SessionId,
    expected_updated_at: &str,
) -> Result<SessionRecord, SessionStoreError> {
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = load_session(&tx, id)?;
    if current.is_open() {
        return Err(SessionStoreError::OpenSessionMutation(id));
    }
    validate_expected_updated_at(&current, expected_updated_at)?;

    let changed = tx.execute(
        "DELETE FROM sessions
         WHERE id = ?1
           AND ended_at IS NOT NULL
           AND updated_at = ?2",
        params![id.to_string(), expected_updated_at],
    )?;
    if changed != 1 {
        return Err(SessionStoreError::StaleVersion {
            expected: expected_updated_at.to_owned(),
            actual: load_session(&tx, id)?.updated_at,
        });
    }

    tx.commit()?;
    Ok(current)
}

pub fn sessions_for_task(
    conn: &Connection,
    task_id: TaskId,
) -> Result<Vec<SessionRecord>, SessionStoreError> {
    let mut statement = conn.prepare(
        "SELECT id, task_id, kind, started_at, ended_at, duration_seconds,
                source, created_at, updated_at
         FROM sessions
         WHERE task_id = ?1
         ORDER BY started_at, id",
    )?;
    let rows = statement.query_map([task_id.to_string()], raw_from_row)?;
    let mut sessions = Vec::new();
    for row in rows {
        sessions.push(decode_session(row?)?);
    }
    Ok(sessions)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::{archive_list, create_list};
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{complete_task, create_task};

    const T0: &str = "2026-09-04T10:00:00Z";
    const T1: &str = "2026-09-04T10:01:00Z";
    const T2: &str = "2026-09-04T10:02:00Z";

    fn fixture() -> (Connection, TaskId) {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let list = create_list(
            &mut conn,
            NewListInput {
                title: "Inbox".into(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list");
        let task = create_task(
            &mut conn,
            NewTaskInput {
                list_id: list.id,
                title: "Focus task".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: Some(600),
            },
            T0,
        )
        .expect("create task");
        (conn, task.id)
    }

    #[test]
    fn work_session_checkpoints_are_nondecreasing_and_close_explicitly() {
        let (mut conn, task_id) = fixture();
        let opened = open_focus_work_session(&mut conn, task_id, T0).unwrap();
        assert_eq!(opened.kind, SessionKind::Work);
        assert_eq!(opened.task_id, Some(task_id));
        assert!(opened.is_open());

        let checkpoint = checkpoint_open_session(&mut conn, opened.id, 45, T1).unwrap();
        assert_eq!(checkpoint.duration_seconds, 45);
        assert!(matches!(
            checkpoint_open_session(&mut conn, opened.id, 44, T1),
            Err(SessionStoreError::DurationDecreased {
                stored_seconds: 45,
                attempted_seconds: 44
            })
        ));

        let closed = close_session(&mut conn, opened.id, 75, T2).unwrap();
        assert_eq!(closed.duration_seconds, 75);
        assert_eq!(closed.ended_at.as_deref(), Some(T2));
        assert!(get_open_session(&conn).unwrap().is_none());
    }

    #[test]
    fn only_one_unfinished_session_can_exist_and_break_is_a_distinct_kind() {
        let (mut conn, task_id) = fixture();
        let work = open_focus_work_session(&mut conn, task_id, T0).unwrap();
        assert!(matches!(
            open_focus_break_session(&mut conn, Some(task_id), T1),
            Err(SessionStoreError::OpenSessionExists(id)) if id == work.id
        ));

        close_session(&mut conn, work.id, 60, T1).unwrap();
        let break_session = open_focus_break_session(&mut conn, Some(task_id), T1).unwrap();
        assert_eq!(break_session.kind, SessionKind::Break);
        assert_eq!(break_session.task_id, Some(task_id));
        assert_ne!(break_session.id, work.id);
        close_session(&mut conn, break_session.id, 60, T2).unwrap();

        let history = sessions_for_task(&conn, task_id).unwrap();
        assert_eq!(history.len(), 2);
        assert_eq!(history[0].kind, SessionKind::Work);
        assert_eq!(history[1].kind, SessionKind::Break);
    }

    #[test]
    fn manual_closed_work_session_can_be_added_to_completed_history_without_opening_runtime() {
        let (mut conn, task_id) = fixture();
        complete_task(&mut conn, task_id, T1).unwrap();

        let created = create_manual_work_session(
            &mut conn,
            task_id,
            "2026-09-04T09:00:00Z",
            "2026-09-04T09:30:00Z",
            1_800,
            T2,
        )
        .expect("create manual historical session");

        assert_eq!(created.task_id, Some(task_id));
        assert_eq!(created.kind, SessionKind::Work);
        assert_eq!(created.source, SessionSource::Manual);
        assert_eq!(created.duration_seconds, 1_800);
        assert_eq!(created.ended_at.as_deref(), Some("2026-09-04T09:30:00Z"));
        assert!(!created.is_open());
        assert!(get_open_session(&conn).unwrap().is_none());
    }

    #[test]
    fn closed_session_edit_is_stale_safe_and_preserves_identity_and_task() {
        let (mut conn, task_id) = fixture();
        let opened = open_focus_work_session(&mut conn, task_id, T0).unwrap();
        let closed = close_session(&mut conn, opened.id, 60, T1).unwrap();

        let edited = edit_closed_session_if_expected(
            &mut conn,
            closed.id,
            &closed.updated_at,
            "2026-09-04T09:55:00Z",
            "2026-09-04T10:05:00Z",
            600,
            T2,
        )
        .expect("edit closed session");

        assert_eq!(edited.id, closed.id);
        assert_eq!(edited.task_id, Some(task_id));
        assert_eq!(edited.kind, SessionKind::Work);
        assert_eq!(edited.source, SessionSource::Edit);
        assert_eq!(edited.created_at, closed.created_at);
        assert_eq!(edited.started_at, "2026-09-04T09:55:00Z");
        assert_eq!(edited.ended_at.as_deref(), Some("2026-09-04T10:05:00Z"));
        assert_eq!(edited.duration_seconds, 600);

        let stale = edit_closed_session_if_expected(
            &mut conn,
            closed.id,
            &closed.updated_at,
            T0,
            T1,
            60,
            T2,
        )
        .expect_err("stale edit must fail");
        assert!(matches!(stale, SessionStoreError::StaleVersion { .. }));

        let after = get_session(&conn, closed.id).expect("reload edited session");
        assert_eq!(after.updated_at, T2);
        assert_eq!(after.duration_seconds, 600);
    }

    #[test]
    fn open_session_cannot_be_edited_or_deleted_through_report_history_mutations() {
        let (mut conn, task_id) = fixture();
        let open = open_focus_work_session(&mut conn, task_id, T0).unwrap();

        assert!(matches!(
            edit_closed_session_if_expected(
                &mut conn,
                open.id,
                &open.updated_at,
                T0,
                T1,
                60,
                T1,
            ),
            Err(SessionStoreError::OpenSessionMutation(id)) if id == open.id
        ));
        assert!(matches!(
            delete_closed_session_if_expected(&mut conn, open.id, &open.updated_at),
            Err(SessionStoreError::OpenSessionMutation(id)) if id == open.id
        ));

        let authoritative = get_open_session(&conn)
            .unwrap()
            .expect("live open session remains");
        assert_eq!(authoritative.id, open.id);
    }

    #[test]
    fn closed_session_delete_is_stale_safe_and_removes_only_the_target_row() {
        let (mut conn, task_id) = fixture();
        let first = open_focus_work_session(&mut conn, task_id, T0).unwrap();
        let first = close_session(&mut conn, first.id, 60, T1).unwrap();
        let second = create_manual_work_session(
            &mut conn,
            task_id,
            T1,
            T2,
            60,
            T2,
        )
        .expect("create second closed session");

        assert!(matches!(
            delete_closed_session_if_expected(&mut conn, first.id, "stale-version"),
            Err(SessionStoreError::StaleVersion { .. })
        ));
        assert_eq!(sessions_for_task(&conn, task_id).unwrap().len(), 2);

        let deleted = delete_closed_session_if_expected(&mut conn, first.id, &first.updated_at)
            .expect("delete first closed session");
        assert_eq!(deleted.id, first.id);

        let remaining = sessions_for_task(&conn, task_id).unwrap();
        assert_eq!(remaining.len(), 1);
        assert_eq!(remaining[0].id, second.id);
    }

    #[test]
    fn manual_session_input_validation_fails_before_any_history_write() {
        let (mut conn, task_id) = fixture();
        let before = sessions_for_task(&conn, task_id).unwrap();

        assert!(matches!(
            create_manual_work_session(
                &mut conn,
                task_id,
                "not-a-time",
                T1,
                60,
                T2,
            ),
            Err(SessionStoreError::InvalidSessionTimestamp("started_at"))
        ));
        assert!(matches!(
            create_manual_work_session(
                &mut conn,
                task_id,
                T2,
                T1,
                60,
                T2,
            ),
            Err(SessionStoreError::EndBeforeStart)
        ));

        assert_eq!(sessions_for_task(&conn, task_id).unwrap(), before);
    }

    #[test]
    fn focus_session_rejects_completed_or_archived_task_contexts() {
        let (mut conn, task_id) = fixture();
        complete_task(&mut conn, task_id, T1).unwrap();
        assert!(matches!(
            open_focus_work_session(&mut conn, task_id, T2),
            Err(SessionStoreError::TaskNotActive(id)) if id == task_id
        ));

        let (mut conn, task_id) = fixture();
        let owning_list = conn
            .query_row(
                "SELECT list_id FROM tasks WHERE id = ?1",
                [task_id.to_string()],
                |row| row.get::<_, String>(0),
            )
            .map(|value| crate::domain::ids::ListId::parse_str(&value).unwrap())
            .unwrap();
        archive_list(&mut conn, owning_list, T1).unwrap();
        assert!(matches!(
            open_focus_work_session(&mut conn, task_id, T2),
            Err(SessionStoreError::TaskNotActive(id)) if id == task_id
        ));
    }
}
