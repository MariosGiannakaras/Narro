use crate::domain::ids::{ListId, SessionId, TaskId};
use crate::domain::sessions::{SessionKind, SessionSource};
use chrono::{DateTime, FixedOffset};
use rusqlite::{Connection, Row};
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportRange {
    pub start_at: String,
    pub end_at: String,
    pub list_id: Option<ListId>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportSessionRow {
    pub id: SessionId,
    pub task_id: Option<TaskId>,
    pub task_title: Option<String>,
    pub list_id: Option<ListId>,
    pub list_title: Option<String>,
    pub kind: SessionKind,
    pub source: SessionSource,
    pub started_at: String,
    pub ended_at: String,
    pub duration_seconds: u64,
    pub task_archived: bool,
    pub list_archived: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportCompletedTaskRow {
    pub task_id: TaskId,
    pub list_id: ListId,
    pub task_title: String,
    pub list_title: String,
    pub est_seconds: Option<u32>,
    pub completed_at: String,
    pub time_taken_seconds: u64,
    pub task_archived: bool,
    pub list_archived: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReportHistorySnapshot {
    pub range: ReportRange,
    pub sessions: Vec<ReportSessionRow>,
    pub completed_tasks: Vec<ReportCompletedTaskRow>,
}

#[derive(Debug)]
pub enum ReportingError {
    Sqlite(rusqlite::Error),
    InvalidRangeTimestamp(&'static str),
    EmptyOrReversedRange,
    CorruptIdentity { field: &'static str, value: String },
    CorruptToken { field: &'static str, value: String },
    CorruptTimestamp { field: &'static str, value: String },
    CorruptDuration(i64),
    CorruptEstimate(i64),
    CorruptTimeTaken(i64),
    TimeTakenOverflow,
    MissingJoinedTask(SessionId),
    MissingJoinedList(TaskId),
}

impl Display for ReportingError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "reporting query failed: {error}"),
            Self::InvalidRangeTimestamp(field) => {
                write!(formatter, "report {field} must be an RFC 3339 timestamp")
            }
            Self::EmptyOrReversedRange => {
                formatter.write_str("report range end must be after its start")
            }
            Self::CorruptIdentity { field, value } => {
                write!(
                    formatter,
                    "stored report {field} identity is invalid: {value}"
                )
            }
            Self::CorruptToken { field, value } => {
                write!(formatter, "stored report {field} token is invalid: {value}")
            }
            Self::CorruptTimestamp { field, value } => {
                write!(
                    formatter,
                    "stored report {field} timestamp is invalid: {value}"
                )
            }
            Self::CorruptDuration(value) => {
                write!(
                    formatter,
                    "stored report session duration is invalid: {value}"
                )
            }
            Self::CorruptEstimate(value) => {
                write!(formatter, "stored report task estimate is invalid: {value}")
            }
            Self::CorruptTimeTaken(value) => {
                write!(
                    formatter,
                    "stored report task time taken is invalid: {value}"
                )
            }
            Self::TimeTakenOverflow => formatter.write_str("report task time taken overflowed"),
            Self::MissingJoinedTask(id) => {
                write!(formatter, "report session task is missing: {id}")
            }
            Self::MissingJoinedList(id) => {
                write!(formatter, "report task list is missing for task: {id}")
            }
        }
    }
}

impl std::error::Error for ReportingError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for ReportingError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

struct ValidatedRange {
    start: DateTime<FixedOffset>,
    end: DateTime<FixedOffset>,
}

fn validate_range(range: &ReportRange) -> Result<ValidatedRange, ReportingError> {
    let start = DateTime::parse_from_rfc3339(&range.start_at)
        .map_err(|_| ReportingError::InvalidRangeTimestamp("start_at"))?;
    let end = DateTime::parse_from_rfc3339(&range.end_at)
        .map_err(|_| ReportingError::InvalidRangeTimestamp("end_at"))?;
    if end <= start {
        return Err(ReportingError::EmptyOrReversedRange);
    }
    Ok(ValidatedRange { start, end })
}

fn parse_stored_timestamp(
    field: &'static str,
    value: &str,
) -> Result<DateTime<FixedOffset>, ReportingError> {
    DateTime::parse_from_rfc3339(value).map_err(|_| ReportingError::CorruptTimestamp {
        field,
        value: value.to_owned(),
    })
}

fn parse_session_id(value: String) -> Result<SessionId, ReportingError> {
    SessionId::parse_str(&value).map_err(|_| ReportingError::CorruptIdentity {
        field: "session",
        value,
    })
}

fn parse_task_id(field: &'static str, value: String) -> Result<TaskId, ReportingError> {
    TaskId::parse_str(&value).map_err(|_| ReportingError::CorruptIdentity { field, value })
}

fn parse_list_id(value: String) -> Result<ListId, ReportingError> {
    ListId::parse_str(&value).map_err(|_| ReportingError::CorruptIdentity {
        field: "list",
        value,
    })
}

#[derive(Debug)]
struct RawSessionRow {
    id: String,
    task_id: Option<String>,
    task_title: Option<String>,
    list_id: Option<String>,
    list_title: Option<String>,
    kind: String,
    source: String,
    started_at: String,
    ended_at: String,
    duration_seconds: i64,
    task_archived_at: Option<String>,
    list_archived_at: Option<String>,
}

fn raw_session_row(row: &Row<'_>) -> rusqlite::Result<RawSessionRow> {
    Ok(RawSessionRow {
        id: row.get(0)?,
        task_id: row.get(1)?,
        task_title: row.get(2)?,
        list_id: row.get(3)?,
        list_title: row.get(4)?,
        kind: row.get(5)?,
        source: row.get(6)?,
        started_at: row.get(7)?,
        ended_at: row.get(8)?,
        duration_seconds: row.get(9)?,
        task_archived_at: row.get(10)?,
        list_archived_at: row.get(11)?,
    })
}

fn decode_session_row(
    raw: RawSessionRow,
    validated: &ValidatedRange,
) -> Result<Option<ReportSessionRow>, ReportingError> {
    let id = parse_session_id(raw.id)?;
    let started = parse_stored_timestamp("session.started_at", &raw.started_at)?;
    parse_stored_timestamp("session.ended_at", &raw.ended_at)?;
    if started < validated.start || started >= validated.end {
        return Ok(None);
    }

    let kind = SessionKind::parse(&raw.kind).ok_or_else(|| ReportingError::CorruptToken {
        field: "session.kind",
        value: raw.kind.clone(),
    })?;
    let source = SessionSource::parse(&raw.source).ok_or_else(|| ReportingError::CorruptToken {
        field: "session.source",
        value: raw.source.clone(),
    })?;
    if raw.duration_seconds < 0 {
        return Err(ReportingError::CorruptDuration(raw.duration_seconds));
    }

    let task_id = raw
        .task_id
        .map(|value| parse_task_id("task", value))
        .transpose()?;
    let list_id = raw.list_id.map(parse_list_id).transpose()?;
    if kind == SessionKind::Work && task_id.is_none() {
        return Err(ReportingError::MissingJoinedTask(id));
    }
    if task_id.is_some()
        && (raw.task_title.is_none() || list_id.is_none() || raw.list_title.is_none())
    {
        return Err(ReportingError::MissingJoinedTask(id));
    }

    Ok(Some(ReportSessionRow {
        id,
        task_id,
        task_title: raw.task_title,
        list_id,
        list_title: raw.list_title,
        kind,
        source,
        started_at: raw.started_at,
        ended_at: raw.ended_at,
        duration_seconds: u64::try_from(raw.duration_seconds)
            .map_err(|_| ReportingError::CorruptDuration(raw.duration_seconds))?,
        task_archived: raw.task_archived_at.is_some(),
        list_archived: raw.list_archived_at.is_some(),
    }))
}

#[derive(Debug)]
struct RawCompletedTaskRow {
    task_id: String,
    list_id: String,
    task_title: String,
    list_title: String,
    est_seconds: Option<i64>,
    completed_at: String,
    manual_adjustment_seconds: i64,
    work_seconds: i64,
    task_archived_at: Option<String>,
    list_archived_at: Option<String>,
}

fn raw_completed_task_row(row: &Row<'_>) -> rusqlite::Result<RawCompletedTaskRow> {
    Ok(RawCompletedTaskRow {
        task_id: row.get(0)?,
        list_id: row.get(1)?,
        task_title: row.get(2)?,
        list_title: row.get(3)?,
        est_seconds: row.get(4)?,
        completed_at: row.get(5)?,
        manual_adjustment_seconds: row.get(6)?,
        work_seconds: row.get(7)?,
        task_archived_at: row.get(8)?,
        list_archived_at: row.get(9)?,
    })
}

fn decode_completed_task_row(
    raw: RawCompletedTaskRow,
    validated: &ValidatedRange,
) -> Result<Option<ReportCompletedTaskRow>, ReportingError> {
    let completed = parse_stored_timestamp("task.completed_at", &raw.completed_at)?;
    if completed < validated.start || completed >= validated.end {
        return Ok(None);
    }

    let task_id = parse_task_id("task", raw.task_id)?;
    let list_id = parse_list_id(raw.list_id)?;
    let est_seconds = match raw.est_seconds {
        Some(value) if value > 0 => {
            Some(u32::try_from(value).map_err(|_| ReportingError::CorruptEstimate(value))?)
        }
        Some(value) => return Err(ReportingError::CorruptEstimate(value)),
        None => None,
    };
    if raw.work_seconds < 0 {
        return Err(ReportingError::CorruptTimeTaken(raw.work_seconds));
    }
    let effective = raw
        .work_seconds
        .checked_add(raw.manual_adjustment_seconds)
        .ok_or(ReportingError::TimeTakenOverflow)?;
    if effective < 0 {
        return Err(ReportingError::CorruptTimeTaken(effective));
    }

    Ok(Some(ReportCompletedTaskRow {
        task_id,
        list_id,
        task_title: raw.task_title,
        list_title: raw.list_title,
        est_seconds,
        completed_at: raw.completed_at,
        time_taken_seconds: u64::try_from(effective)
            .map_err(|_| ReportingError::TimeTakenOverflow)?,
        task_archived: raw.task_archived_at.is_some(),
        list_archived: raw.list_archived_at.is_some(),
    }))
}

fn report_sessions(
    conn: &Connection,
    range: &ReportRange,
    validated: &ValidatedRange,
) -> Result<Vec<ReportSessionRow>, ReportingError> {
    let list_filter = range.list_id.map(|id| id.to_string());
    let mut statement = conn.prepare(
        "SELECT
            s.id,
            s.task_id,
            t.title,
            t.list_id,
            l.title,
            s.kind,
            s.source,
            s.started_at,
            s.ended_at,
            s.duration_seconds,
            t.archived_at,
            l.archived_at
         FROM sessions s
         LEFT JOIN tasks t ON t.id = s.task_id
         LEFT JOIN lists l ON l.id = t.list_id
         WHERE s.ended_at IS NOT NULL
           AND (?1 IS NULL OR t.list_id = ?1)
         ORDER BY s.started_at, s.id",
    )?;
    let rows = statement.query_map([list_filter.as_deref()], raw_session_row)?;
    let mut result = Vec::new();
    for row in rows {
        if let Some(decoded) = decode_session_row(row?, validated)? {
            result.push(decoded);
        }
    }
    Ok(result)
}

fn report_completed_tasks(
    conn: &Connection,
    range: &ReportRange,
    validated: &ValidatedRange,
) -> Result<Vec<ReportCompletedTaskRow>, ReportingError> {
    let list_filter = range.list_id.map(|id| id.to_string());
    let mut statement = conn.prepare(
        "SELECT
            t.id,
            t.list_id,
            t.title,
            l.title,
            t.est_seconds,
            t.completed_at,
            t.manual_time_adjustment_seconds,
            COALESCE(SUM(CASE WHEN s.kind = 'work' THEN s.duration_seconds ELSE 0 END), 0),
            t.archived_at,
            l.archived_at
         FROM tasks t
         JOIN lists l ON l.id = t.list_id
         LEFT JOIN sessions s ON s.task_id = t.id
         WHERE t.completed_at IS NOT NULL
           AND (?1 IS NULL OR t.list_id = ?1)
         GROUP BY
            t.id, t.list_id, t.title, l.title, t.est_seconds, t.completed_at,
            t.manual_time_adjustment_seconds, t.archived_at, l.archived_at
         ORDER BY t.completed_at, t.id",
    )?;
    let rows = statement.query_map([list_filter.as_deref()], raw_completed_task_row)?;
    let mut result = Vec::new();
    for row in rows {
        if let Some(decoded) = decode_completed_task_row(row?, validated)? {
            result.push(decoded);
        }
    }
    Ok(result)
}

pub fn report_history_snapshot(
    conn: &Connection,
    range: ReportRange,
) -> Result<ReportHistorySnapshot, ReportingError> {
    let validated = validate_range(&range)?;
    let sessions = report_sessions(conn, &range, &validated)?;
    let completed_tasks = report_completed_tasks(conn, &range, &validated)?;
    Ok(ReportHistorySnapshot {
        range,
        sessions,
        completed_tasks,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{archive_task, permanently_delete_task};
    use rusqlite::{params, Connection};

    const START: &str = "2026-09-30T00:00:00Z";
    const END: &str = "2026-10-01T00:00:00Z";
    const T0: &str = "2026-09-30T09:00:00Z";
    const T1: &str = "2026-09-30T10:00:00Z";
    const T2: &str = "2026-09-30T11:00:00Z";
    const T3: &str = "2026-09-30T12:00:00Z";
    const T4: &str = "2026-09-30T13:00:00Z";

    fn migrated() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open report database");
        run_migrations(&mut conn).expect("migrate report database");
        conn
    }

    fn create_test_list(conn: &mut Connection, title: &str) -> ListId {
        create_list(
            conn,
            NewListInput {
                title: title.into(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create report list")
        .id
    }

    fn create_test_task(
        conn: &mut Connection,
        list_id: ListId,
        title: &str,
        est: Option<u32>,
    ) -> TaskId {
        crate::persistence::tasks::create_task(
            conn,
            NewTaskInput {
                list_id,
                title: title.into(),
                manual_lane: PlanningLane::Today,
                est_seconds: est,
            },
            T0,
        )
        .expect("create report task")
        .id
    }

    fn insert_session(
        conn: &Connection,
        task_id: Option<TaskId>,
        kind: &str,
        started_at: &str,
        duration_seconds: i64,
    ) {
        conn.execute(
            "INSERT INTO sessions (
                id, task_id, kind, started_at, ended_at, duration_seconds,
                source, created_at, updated_at
             ) VALUES (?1, ?2, ?3, ?4, ?4, ?5, 'focus', ?4, ?4)",
            params![
                SessionId::generate().to_string(),
                task_id.map(|id| id.to_string()),
                kind,
                started_at,
                duration_seconds,
            ],
        )
        .expect("insert report session");
    }

    #[test]
    fn report_range_and_list_filter_project_closed_history_without_mutating_state() {
        let mut conn = migrated();
        let alpha = create_test_list(&mut conn, "Alpha");
        let beta = create_test_list(&mut conn, "Beta");
        let alpha_task = create_test_task(&mut conn, alpha, "Alpha task", Some(900));
        let beta_task = create_test_task(&mut conn, beta, "Beta task", None);

        insert_session(&conn, Some(alpha_task), "work", T1, 600);
        insert_session(&conn, Some(alpha_task), "break", T2, 120);
        insert_session(&conn, None, "break", T3, 60);
        insert_session(&conn, Some(beta_task), "work", T4, 300);
        insert_session(&conn, Some(alpha_task), "work", "2026-09-29T23:59:59Z", 30);

        conn.execute(
            "UPDATE tasks SET completed_at = ?1 WHERE id IN (?2, ?3)",
            params![T4, alpha_task.to_string(), beta_task.to_string()],
        )
        .expect("complete report tasks");

        let all = report_history_snapshot(
            &conn,
            ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: None,
            },
        )
        .expect("all-list report");
        assert_eq!(all.sessions.len(), 4);
        assert_eq!(all.completed_tasks.len(), 2);
        assert!(all.sessions.iter().any(|row| row.task_id.is_none()));

        let alpha_only = report_history_snapshot(
            &conn,
            ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: Some(alpha),
            },
        )
        .expect("alpha report");
        assert_eq!(alpha_only.sessions.len(), 2);
        assert!(alpha_only
            .sessions
            .iter()
            .all(|row| row.list_id == Some(alpha)));
        assert_eq!(alpha_only.completed_tasks.len(), 1);
        assert_eq!(alpha_only.completed_tasks[0].task_id, alpha_task);
    }

    #[test]
    fn archived_history_remains_reportable_and_permanent_task_delete_removes_it() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Archived");
        let task_id = create_test_task(&mut conn, list_id, "Historical", Some(600));
        insert_session(&conn, Some(task_id), "work", T1, 480);
        conn.execute(
            "UPDATE tasks SET completed_at = ?1 WHERE id = ?2",
            params![T2, task_id.to_string()],
        )
        .expect("complete historical task");

        archive_task(&mut conn, task_id, T3).expect("archive historical task");
        conn.execute(
            "UPDATE lists SET archived_at = ?1 WHERE id = ?2",
            params![T3, list_id.to_string()],
        )
        .expect("archive historical list");

        let archived = report_history_snapshot(
            &conn,
            ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: None,
            },
        )
        .expect("archived report");
        assert_eq!(archived.sessions.len(), 1);
        assert_eq!(archived.completed_tasks.len(), 1);
        assert!(archived.sessions[0].task_archived);
        assert!(archived.sessions[0].list_archived);
        assert!(archived.completed_tasks[0].task_archived);
        assert!(archived.completed_tasks[0].list_archived);

        permanently_delete_task(&mut conn, task_id).expect("permanently delete task");
        let after_delete = report_history_snapshot(
            &conn,
            ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: None,
            },
        )
        .expect("post-delete report");
        assert!(after_delete.sessions.is_empty());
        assert!(after_delete.completed_tasks.is_empty());
    }

    #[test]
    fn completed_task_time_taken_uses_work_sessions_plus_manual_adjustment_and_excludes_breaks() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Metrics");
        let task_id = create_test_task(&mut conn, list_id, "Measured", Some(900));
        insert_session(&conn, Some(task_id), "work", T1, 300);
        insert_session(&conn, Some(task_id), "break", T2, 120);
        insert_session(&conn, Some(task_id), "work", T3, 420);
        conn.execute(
            "UPDATE tasks
             SET completed_at = ?1, manual_time_adjustment_seconds = -60
             WHERE id = ?2",
            params![T4, task_id.to_string()],
        )
        .expect("complete measured task");

        let report = report_history_snapshot(
            &conn,
            ReportRange {
                start_at: START.into(),
                end_at: END.into(),
                list_id: None,
            },
        )
        .expect("metrics report");
        assert_eq!(report.completed_tasks.len(), 1);
        let task = &report.completed_tasks[0];
        assert_eq!(task.est_seconds, Some(900));
        assert_eq!(task.time_taken_seconds, 660);
    }

    #[test]
    fn invalid_or_reversed_ranges_fail_before_report_projection() {
        let conn = migrated();
        assert!(matches!(
            report_history_snapshot(
                &conn,
                ReportRange {
                    start_at: "not-a-date".into(),
                    end_at: END.into(),
                    list_id: None,
                },
            ),
            Err(ReportingError::InvalidRangeTimestamp("start_at"))
        ));
        assert!(matches!(
            report_history_snapshot(
                &conn,
                ReportRange {
                    start_at: END.into(),
                    end_at: START.into(),
                    list_id: None,
                },
            ),
            Err(ReportingError::EmptyOrReversedRange)
        ));
    }
}
