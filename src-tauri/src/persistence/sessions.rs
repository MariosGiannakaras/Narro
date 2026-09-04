use crate::domain::ids::{ListId, SessionId, TaskId};
use crate::domain::sessions::{SessionDecodeError, SessionKind, SessionRecord, SessionSource};
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use chrono::DateTime;
use rusqlite::{params, Connection, Row};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum SessionStoreError {
    Sqlite(rusqlite::Error),
    Task(TaskStoreError),
    List(ListStoreError),
    Decode(SessionDecodeError),
    InvalidTimestamp,
    InvalidStoredIdentity,
    InvalidStoredDuration(i64),
    DurationTooLarge(u64),
    DurationRegressed {
        stored_seconds: u64,
        requested_seconds: u64,
    },
    SessionNotFound(SessionId),
    KindMismatch {
        id: SessionId,
        expected: SessionKind,
        actual: SessionKind,
    },
    SessionAlreadyClosed(SessionId),
    OpenSessionExists {
        kind: SessionKind,
        id: SessionId,
    },
    TaskArchived(TaskId),
    TaskCompleted(TaskId),
    ListArchived(ListId),
    NoOpenWorkSession,
    OpenWorkTaskMismatch {
        work_task_id: Option<TaskId>,
        requested_task_id: TaskId,
    },
    OrphanOpenBreak(SessionId),
}

impl Display for SessionStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "session persistence failed: {error}"),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::List(error) => Display::fmt(error, formatter),
            Self::Decode(error) => Display::fmt(error, formatter),
            Self::InvalidTimestamp => formatter.write_str("session timestamp must be RFC 3339"),
            Self::InvalidStoredIdentity => {
                formatter.write_str("stored session contains an invalid durable identity")
            }
            Self::InvalidStoredDuration(value) => {
                write!(formatter, "stored session duration is invalid: {value}")
            }
            Self::DurationTooLarge(value) => {
                write!(formatter, "session duration does not fit SQLite integer: {value}")
            }
            Self::DurationRegressed {
                stored_seconds,
                requested_seconds,
            } => write!(
                formatter,
                "session duration cannot move backwards: stored={stored_seconds}s requested={requested_seconds}s"
            ),
            Self::SessionNotFound(id) => write!(formatter, "session not found: {id}"),
            Self::KindMismatch {
                id,
                expected,
                actual,
            } => write!(
                formatter,
                "session {id} kind mismatch: expected {expected:?}, found {actual:?}"
            ),
            Self::SessionAlreadyClosed(id) => write!(formatter, "session is already closed: {id}"),
            Self::OpenSessionExists { kind, id } => {
                write!(formatter, "an open {kind:?} session already exists: {id}")
            }
            Self::TaskArchived(id) => write!(formatter, "cannot start live session for archived task: {id}"),
            Self::TaskCompleted(id) => {
                write!(formatter, "cannot start live session for completed task: {id}")
            }
            Self::ListArchived(id) => {
                write!(formatter, "cannot start live session in archived list: {id}")
            }
            Self::NoOpenWorkSession => {
                formatter.write_str("cannot start break without an open work session")
            }
            Self::OpenWorkTaskMismatch {
                work_task_id,
                requested_task_id,
            } => write!(
                formatter,
                "open work session task {work_task_id:?} does not match break task {requested_task_id}"
            ),
            Self::OrphanOpenBreak(id) => {
                write!(formatter, "open break session has no matching open work session: {id}")
            }
        }
    }
}

impl std::error::Error for SessionStoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            Self::Decode(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for SessionStoreError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<TaskStoreError> for SessionStoreError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<ListStoreError> for SessionStoreError {
    fn from(value: ListStoreError) -> Self {
        Self::List(value)
    }
}

impl From<SessionDecodeError> for SessionStoreError {
    fn from(value: SessionDecodeError) -> Self {
        Self::Decode(value)
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InterruptedSessionRecovery {
    pub work: Option<SessionRecord>,
    pub closed_break: Option<SessionRecord>,
}

fn validate_timestamp(value: &str) -> Result<(), SessionStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| SessionStoreError::InvalidTimestamp)
}

fn duration_to_sql(value: u64) -> Result<i64, SessionStoreError> {
    i64::try_from(value).map_err(|_| SessionStoreError::DurationTooLarge(value))
}

fn duration_from_sql(value: i64) -> Result<u64, SessionStoreError> {
    if value < 0 {
        return Err(SessionStoreError::InvalidStoredDuration(value));
    }
    u64::try_from(value).map_err(|_| SessionStoreError::InvalidStoredDuration(value))
}

fn decode_session(row: &Row<'_>) -> Result<SessionRecord, SessionStoreError> {
    let id: String = row.get(0)?;
    let task_id: Option<String> = row.get(1)?;
    let kind: String = row.get(2)?;
    let started_at: String = row.get(3)?;
    let ended_at: Option<String> = row.get(4)?;
    let duration_seconds: i64 = row.get(5)?;
    let source: String = row.get(6)?;
    let created_at: String = row.get(7)?;
    let updated_at: String = row.get(8)?;

    Ok(SessionRecord {
        id: SessionId::parse_str(&id).map_err(|_| SessionStoreError::InvalidStoredIdentity)?,
        task_id: task_id
            .map(|value| {
                TaskId::parse_str(&value).map_err(|_| SessionStoreError::InvalidStoredIdentity)
            })
            .transpose()?,
        kind: SessionKind::try_from(kind.as_str())?,
        started_at,
        ended_at,
        duration_seconds: duration_from_sql(duration_seconds)?,
        source: SessionSource::try_from(source.as_str())?,
        created_at,
        updated_at,
    })
}

fn session_select_sql() -> &'static str {
    "SELECT id, task_id, kind, started_at, ended_at, duration_seconds, source, created_at, updated_at FROM sessions"
}

pub fn get_session(conn: &Connection, id: SessionId) -> Result<SessionRecord, SessionStoreError> {
    let sql = format!("{} WHERE id = ?1", session_select_sql());
    let mut statement = conn.prepare(&sql)?;
    let mut rows = statement.query([id.to_string()])?;
    let Some(row) = rows.next()? else {
        return Err(SessionStoreError::SessionNotFound(id));
    };
    decode_session(row)
}

pub fn open_session_by_kind(
    conn: &Connection,
    kind: SessionKind,
) -> Result<Option<SessionRecord>, SessionStoreError> {
    let sql = format!(
        "{} WHERE kind = ?1 AND ended_at IS NULL ORDER BY created_at, id LIMIT 1",
        session_select_sql()
    );
    let mut statement = conn.prepare(&sql)?;
    let mut rows = statement.query([kind.as_str()])?;
    rows.next()?.map(decode_session).transpose()
}

fn validate_live_task(conn: &Connection, task_id: TaskId) -> Result<(), SessionStoreError> {
    let task = get_task(conn, task_id)?;
    if task.archived_at.is_some() {
        return Err(SessionStoreError::TaskArchived(task_id));
    }
    if task.completed_at.is_some() {
        return Err(SessionStoreError::TaskCompleted(task_id));
    }
    let list = get_list(conn, task.list_id)?;
    if list.archived_at.is_some() {
        return Err(SessionStoreError::ListArchived(task.list_id));
    }
    Ok(())
}

fn ensure_no_open_kind(conn: &Connection, kind: SessionKind) -> Result<(), SessionStoreError> {
    if let Some(existing) = open_session_by_kind(conn, kind)? {
        return Err(SessionStoreError::OpenSessionExists {
            kind,
            id: existing.id,
        });
    }
    Ok(())
}

fn insert_open_session(
    conn: &Connection,
    task_id: Option<TaskId>,
    kind: SessionKind,
    source: SessionSource,
    started_at: &str,
) -> Result<SessionRecord, SessionStoreError> {
    let id = SessionId::generate();
    conn.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, NULL, 0, ?5, ?4, ?4)",
        params![
            id.to_string(),
            task_id.map(|value| value.to_string()),
            kind.as_str(),
            started_at,
            source.as_str()
        ],
    )?;
    get_session(conn, id)
}

pub fn start_work_session(
    conn: &mut Connection,
    task_id: TaskId,
    source: SessionSource,
    started_at: &str,
) -> Result<SessionRecord, SessionStoreError> {
    validate_timestamp(started_at)?;
    let tx = conn.transaction()?;
    validate_live_task(&tx, task_id)?;
    ensure_no_open_kind(&tx, SessionKind::Work)?;
    let session = insert_open_session(&tx, Some(task_id), SessionKind::Work, source, started_at)?;
    tx.commit()?;
    Ok(session)
}

pub fn start_break_session(
    conn: &mut Connection,
    task_id: TaskId,
    source: SessionSource,
    started_at: &str,
) -> Result<SessionRecord, SessionStoreError> {
    validate_timestamp(started_at)?;
    let tx = conn.transaction()?;
    validate_live_task(&tx, task_id)?;
    ensure_no_open_kind(&tx, SessionKind::Break)?;
    let work = open_session_by_kind(&tx, SessionKind::Work)?
        .ok_or(SessionStoreError::NoOpenWorkSession)?;
    if work.task_id != Some(task_id) {
        return Err(SessionStoreError::OpenWorkTaskMismatch {
            work_task_id: work.task_id,
            requested_task_id: task_id,
        });
    }
    let session = insert_open_session(&tx, Some(task_id), SessionKind::Break, source, started_at)?;
    tx.commit()?;
    Ok(session)
}

fn mutate_open_session(
    conn: &mut Connection,
    id: SessionId,
    expected_kind: SessionKind,
    duration_seconds: u64,
    now: &str,
    close: bool,
) -> Result<SessionRecord, SessionStoreError> {
    validate_timestamp(now)?;
    let duration_sql = duration_to_sql(duration_seconds)?;
    let tx = conn.transaction()?;
    let current = get_session(&tx, id)?;
    if current.kind != expected_kind {
        return Err(SessionStoreError::KindMismatch {
            id,
            expected: expected_kind,
            actual: current.kind,
        });
    }
    if current.ended_at.is_some() {
        return Err(SessionStoreError::SessionAlreadyClosed(id));
    }
    if duration_seconds < current.duration_seconds {
        return Err(SessionStoreError::DurationRegressed {
            stored_seconds: current.duration_seconds,
            requested_seconds: duration_seconds,
        });
    }

    if close {
        tx.execute(
            "UPDATE sessions
             SET duration_seconds = ?1, ended_at = ?2, updated_at = ?2
             WHERE id = ?3 AND ended_at IS NULL",
            params![duration_sql, now, id.to_string()],
        )?;
    } else {
        tx.execute(
            "UPDATE sessions
             SET duration_seconds = ?1, updated_at = ?2
             WHERE id = ?3 AND ended_at IS NULL",
            params![duration_sql, now, id.to_string()],
        )?;
    }
    let updated = get_session(&tx, id)?;
    tx.commit()?;
    Ok(updated)
}

pub fn checkpoint_work_session(
    conn: &mut Connection,
    id: SessionId,
    duration_seconds: u64,
    now: &str,
) -> Result<SessionRecord, SessionStoreError> {
    mutate_open_session(conn, id, SessionKind::Work, duration_seconds, now, false)
}

pub fn close_work_session(
    conn: &mut Connection,
    id: SessionId,
    duration_seconds: u64,
    ended_at: &str,
) -> Result<SessionRecord, SessionStoreError> {
    mutate_open_session(
        conn,
        id,
        SessionKind::Work,
        duration_seconds,
        ended_at,
        true,
    )
}

pub fn checkpoint_break_session(
    conn: &mut Connection,
    id: SessionId,
    duration_seconds: u64,
    now: &str,
) -> Result<SessionRecord, SessionStoreError> {
    mutate_open_session(conn, id, SessionKind::Break, duration_seconds, now, false)
}

pub fn close_break_session(
    conn: &mut Connection,
    id: SessionId,
    duration_seconds: u64,
    ended_at: &str,
) -> Result<SessionRecord, SessionStoreError> {
    mutate_open_session(
        conn,
        id,
        SessionKind::Break,
        duration_seconds,
        ended_at,
        true,
    )
}

pub fn recover_interrupted_sessions(
    conn: &mut Connection,
) -> Result<InterruptedSessionRecovery, SessionStoreError> {
    let tx = conn.transaction()?;
    let work = open_session_by_kind(&tx, SessionKind::Work)?;
    let open_break = open_session_by_kind(&tx, SessionKind::Break)?;

    let closed_break = if let Some(break_session) = open_break {
        let Some(work_session) = &work else {
            return Err(SessionStoreError::OrphanOpenBreak(break_session.id));
        };
        if break_session.task_id != work_session.task_id {
            return Err(SessionStoreError::OpenWorkTaskMismatch {
                work_task_id: work_session.task_id,
                requested_task_id: break_session
                    .task_id
                    .ok_or(SessionStoreError::OrphanOpenBreak(break_session.id))?,
            });
        }
        tx.execute(
            "UPDATE sessions
             SET ended_at = updated_at
             WHERE id = ?1 AND ended_at IS NULL",
            [break_session.id.to_string()],
        )?;
        Some(get_session(&tx, break_session.id)?)
    } else {
        None
    };

    tx.commit()?;
    Ok(InterruptedSessionRecovery { work, closed_break })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::{archive_list, create_list};
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{archive_task, complete_task, create_task};

    const T0: &str = "2026-09-04T08:00:00Z";
    const T1: &str = "2026-09-04T08:01:00Z";
    const T2: &str = "2026-09-04T08:02:00Z";
    const T3: &str = "2026-09-04T08:03:00Z";
    const T4: &str = "2026-09-04T08:04:00Z";

    fn migrated() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("migrate database");
        conn
    }

    fn task_fixture(conn: &mut Connection, title: &str) -> TaskId {
        let list = create_list(
            conn,
            NewListInput {
                title: format!("{title} list"),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list");
        create_task(
            conn,
            NewTaskInput {
                list_id: list.id,
                title: title.into(),
                manual_lane: PlanningLane::Today,
                est_seconds: Some(1_800),
            },
            T0,
        )
        .expect("create task")
        .id
    }

    #[test]
    fn work_session_checkpoint_is_monotonic_and_close_allows_next_work_session() {
        let mut conn = migrated();
        let task_id = task_fixture(&mut conn, "First");
        let work = start_work_session(&mut conn, task_id, SessionSource::Focus, T0)
            .expect("start work session");
        assert!(work.is_open());
        assert_eq!(work.duration_seconds, 0);

        let duplicate = start_work_session(&mut conn, task_id, SessionSource::Focus, T1);
        assert!(matches!(
            duplicate,
            Err(SessionStoreError::OpenSessionExists {
                kind: SessionKind::Work,
                ..
            })
        ));

        let checkpoint =
            checkpoint_work_session(&mut conn, work.id, 42, T1).expect("checkpoint work session");
        assert_eq!(checkpoint.duration_seconds, 42);
        assert_eq!(checkpoint.updated_at, T1);
        assert!(matches!(
            checkpoint_work_session(&mut conn, work.id, 41, T2),
            Err(SessionStoreError::DurationRegressed { .. })
        ));

        let closed = close_work_session(&mut conn, work.id, 65, T2).expect("close work session");
        assert_eq!(closed.duration_seconds, 65);
        assert_eq!(closed.ended_at.as_deref(), Some(T2));

        let next = start_work_session(&mut conn, task_id, SessionSource::Focus, T3)
            .expect("start next work session after close");
        assert_ne!(next.id, work.id);
    }

    #[test]
    fn database_unique_index_rejects_second_open_row_of_same_kind() {
        let mut conn = migrated();
        let task_id = task_fixture(&mut conn, "Unique");
        let first =
            start_work_session(&mut conn, task_id, SessionSource::Focus, T0).expect("start work");

        let direct = conn.execute(
            "INSERT INTO sessions (
                id, task_id, kind, started_at, ended_at, duration_seconds,
                source, created_at, updated_at
             ) VALUES (?1, ?2, 'work', ?3, NULL, 0, 'focus', ?3, ?3)",
            params![SessionId::generate().to_string(), task_id.to_string(), T1],
        );
        assert!(
            direct.is_err(),
            "unique index must reject duplicate open work row"
        );
        assert_eq!(
            open_session_by_kind(&conn, SessionKind::Work)
                .unwrap()
                .unwrap()
                .id,
            first.id
        );
    }

    #[test]
    fn break_requires_matching_open_work_and_remains_distinct() {
        let mut conn = migrated();
        let first_task = task_fixture(&mut conn, "First");
        let second_task = task_fixture(&mut conn, "Second");

        assert!(matches!(
            start_break_session(&mut conn, first_task, SessionSource::Focus, T0),
            Err(SessionStoreError::NoOpenWorkSession)
        ));

        let work = start_work_session(&mut conn, first_task, SessionSource::Focus, T0)
            .expect("start work");
        assert!(matches!(
            start_break_session(&mut conn, second_task, SessionSource::Focus, T1),
            Err(SessionStoreError::OpenWorkTaskMismatch { .. })
        ));

        let break_session = start_break_session(&mut conn, first_task, SessionSource::Focus, T1)
            .expect("start break");
        assert_ne!(break_session.id, work.id);
        assert_eq!(break_session.kind, SessionKind::Break);
        assert_eq!(break_session.task_id, Some(first_task));

        checkpoint_break_session(&mut conn, break_session.id, 30, T2).expect("checkpoint break");
        close_break_session(&mut conn, break_session.id, 45, T3).expect("close break");
        assert!(open_session_by_kind(&conn, SessionKind::Break)
            .unwrap()
            .is_none());
        assert_eq!(
            open_session_by_kind(&conn, SessionKind::Work)
                .unwrap()
                .unwrap()
                .id,
            work.id
        );
    }

    #[test]
    fn recovery_closes_open_break_at_last_checkpoint_and_leaves_work_open_paused_candidate() {
        let mut conn = migrated();
        let task_id = task_fixture(&mut conn, "Recovery");
        let work =
            start_work_session(&mut conn, task_id, SessionSource::Focus, T0).expect("start work");
        checkpoint_work_session(&mut conn, work.id, 75, T1).expect("checkpoint work");
        let break_session =
            start_break_session(&mut conn, task_id, SessionSource::Focus, T1).expect("start break");
        checkpoint_break_session(&mut conn, break_session.id, 20, T2).expect("checkpoint break");

        let recovered = recover_interrupted_sessions(&mut conn).expect("recover interrupted state");
        let recovered_work = recovered.work.expect("open work should survive recovery");
        assert_eq!(recovered_work.id, work.id);
        assert_eq!(recovered_work.duration_seconds, 75);
        assert!(recovered_work.ended_at.is_none());

        let closed_break = recovered
            .closed_break
            .expect("break should be closed on recovery");
        assert_eq!(closed_break.duration_seconds, 20);
        assert_eq!(closed_break.ended_at.as_deref(), Some(T2));
        assert!(open_session_by_kind(&conn, SessionKind::Break)
            .unwrap()
            .is_none());
    }

    #[test]
    fn starting_live_work_rejects_completed_or_archived_tasks() {
        let mut conn = migrated();
        let completed = task_fixture(&mut conn, "Completed");
        complete_task(&mut conn, completed, T1).expect("complete task");
        assert!(matches!(
            start_work_session(&mut conn, completed, SessionSource::Focus, T2),
            Err(SessionStoreError::TaskCompleted(id)) if id == completed
        ));

        let archived = task_fixture(&mut conn, "Archived");
        archive_task(&mut conn, archived, T2).expect("archive task");
        assert!(matches!(
            start_work_session(&mut conn, archived, SessionSource::Focus, T3),
            Err(SessionStoreError::TaskArchived(id)) if id == archived
        ));

        let archived_list_task = task_fixture(&mut conn, "Archived list");
        let owning_list = get_task(&conn, archived_list_task)
            .expect("load archived-list task")
            .list_id;
        archive_list(&mut conn, owning_list, T3).expect("archive owning list");
        assert!(matches!(
            start_work_session(&mut conn, archived_list_task, SessionSource::Focus, T4),
            Err(SessionStoreError::ListArchived(id)) if id == owning_list
        ));
    }

    #[test]
    fn closed_session_rejects_future_checkpoint_mutation() {
        let mut conn = migrated();
        let task_id = task_fixture(&mut conn, "Closed");
        let work =
            start_work_session(&mut conn, task_id, SessionSource::Focus, T0).expect("start work");
        close_work_session(&mut conn, work.id, 10, T1).expect("close work");
        assert!(matches!(
            checkpoint_work_session(&mut conn, work.id, 20, T4),
            Err(SessionStoreError::SessionAlreadyClosed(id)) if id == work.id
        ));
    }
}
