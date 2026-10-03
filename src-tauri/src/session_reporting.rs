use crate::domain::ids::{ListId, SessionId, TaskId};
use crate::domain::sessions::SessionKind;
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::sessions::{sessions_for_task, SessionStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use crate::reporting::{
    report_history_snapshot, ReportHistorySnapshot, ReportRange, ReportSessionRow, ReportingError,
};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SessionsReportSummary {
    pub total_focus_seconds: u64,
    pub total_tasks: u64,
    pub total_sessions: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SessionsReportRow {
    pub session: ReportSessionRow,
    pub task_session_ordinal: Option<u64>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SessionsReportProjection {
    pub summary: SessionsReportSummary,
    pub rows: Vec<SessionsReportRow>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskSessionsDetailProjection {
    pub task_id: TaskId,
    pub task_title: String,
    pub list_id: ListId,
    pub list_title: String,
    pub task_archived: bool,
    pub list_archived: bool,
    pub total_focus_seconds: u64,
    pub total_sessions: u64,
    pub rows: Vec<SessionsReportRow>,
}

#[derive(Debug)]
pub enum SessionsReportError {
    Reporting(ReportingError),
    SessionStore(SessionStoreError),
    TaskStore(TaskStoreError),
    ListStore(ListStoreError),
    MissingWorkTask,
    MissingWorkOrdinal(SessionId),
    DurationOverflow,
    CountOverflow,
}

impl Display for SessionsReportError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Reporting(error) => write!(formatter, "{error}"),
            Self::SessionStore(error) => write!(formatter, "{error}"),
            Self::TaskStore(error) => write!(formatter, "{error}"),
            Self::ListStore(error) => write!(formatter, "{error}"),
            Self::MissingWorkTask => {
                formatter.write_str("report work session is missing its task identity")
            }
            Self::MissingWorkOrdinal(id) => {
                write!(
                    formatter,
                    "report work session {id} is missing its all-history task ordinal"
                )
            }
            Self::DurationOverflow => {
                formatter.write_str("Sessions report focus duration overflowed")
            }
            Self::CountOverflow => formatter.write_str("Sessions report count overflowed"),
        }
    }
}

impl std::error::Error for SessionsReportError {}

impl From<ReportingError> for SessionsReportError {
    fn from(value: ReportingError) -> Self {
        Self::Reporting(value)
    }
}

impl From<SessionStoreError> for SessionsReportError {
    fn from(value: SessionStoreError) -> Self {
        Self::SessionStore(value)
    }
}

impl From<TaskStoreError> for SessionsReportError {
    fn from(value: TaskStoreError) -> Self {
        Self::TaskStore(value)
    }
}

impl From<ListStoreError> for SessionsReportError {
    fn from(value: ListStoreError) -> Self {
        Self::ListStore(value)
    }
}

fn closed_work_ordinals(
    conn: &Connection,
    task_ids: &HashSet<TaskId>,
) -> Result<HashMap<SessionId, u64>, SessionsReportError> {
    let mut ordered_task_ids = task_ids.iter().copied().collect::<Vec<_>>();
    ordered_task_ids.sort_by_key(|id| id.to_string());

    let mut ordinals = HashMap::new();
    for task_id in ordered_task_ids {
        let mut ordinal = 0_u64;
        for session in sessions_for_task(conn, task_id)? {
            if session.kind != SessionKind::Work || session.ended_at.is_none() {
                continue;
            }
            ordinal = ordinal
                .checked_add(1)
                .ok_or(SessionsReportError::CountOverflow)?;
            ordinals.insert(session.id, ordinal);
        }
    }
    Ok(ordinals)
}

/// Projects the user-visible Sessions dashboard from an already validated
/// report-history snapshot.
///
/// Total Time remains focus/work time only. Total Tasks counts distinct tasks
/// with work sessions in the filtered history. Total Sessions counts visible
/// rows under the active break filter.
///
/// Work-session ordinals must come from the task's complete closed work history,
/// not from the selected report range. Break rows deliberately have no ordinal
/// because the supplied source does not establish break ordinal semantics.
pub fn project_sessions_report(
    history: &ReportHistorySnapshot,
    show_break_sessions: bool,
    work_ordinals: &HashMap<SessionId, u64>,
) -> Result<SessionsReportProjection, SessionsReportError> {
    let mut total_focus_seconds = 0_u64;
    let mut worked_tasks = HashSet::<TaskId>::new();
    let mut rows = Vec::with_capacity(history.sessions.len());

    for session in &history.sessions {
        match session.kind {
            SessionKind::Work => {
                let task_id = session
                    .task_id
                    .ok_or(SessionsReportError::MissingWorkTask)?;
                worked_tasks.insert(task_id);
                total_focus_seconds = total_focus_seconds
                    .checked_add(session.duration_seconds)
                    .ok_or(SessionsReportError::DurationOverflow)?;
                let ordinal = work_ordinals
                    .get(&session.id)
                    .copied()
                    .ok_or(SessionsReportError::MissingWorkOrdinal(session.id))?;
                rows.push(SessionsReportRow {
                    session: session.clone(),
                    task_session_ordinal: Some(ordinal),
                });
            }
            SessionKind::Break if show_break_sessions => rows.push(SessionsReportRow {
                session: session.clone(),
                task_session_ordinal: None,
            }),
            SessionKind::Break => {}
        }
    }

    let total_tasks =
        u64::try_from(worked_tasks.len()).map_err(|_| SessionsReportError::CountOverflow)?;
    let total_sessions =
        u64::try_from(rows.len()).map_err(|_| SessionsReportError::CountOverflow)?;

    rows.reverse();

    Ok(SessionsReportProjection {
        summary: SessionsReportSummary {
            total_focus_seconds,
            total_tasks,
            total_sessions,
        },
        rows,
    })
}

pub fn load_sessions_report(
    conn: &Connection,
    range: ReportRange,
    show_break_sessions: bool,
) -> Result<SessionsReportProjection, SessionsReportError> {
    let history = report_history_snapshot(conn, range)?;
    let mut task_ids = HashSet::new();
    for session in &history.sessions {
        if session.kind == SessionKind::Work {
            task_ids.insert(
                session
                    .task_id
                    .ok_or(SessionsReportError::MissingWorkTask)?,
            );
        }
    }
    let ordinals = closed_work_ordinals(conn, &task_ids)?;
    project_sessions_report(&history, show_break_sessions, &ordinals)
}

pub fn load_task_sessions_detail(
    conn: &Connection,
    task_id: TaskId,
) -> Result<TaskSessionsDetailProjection, SessionsReportError> {
    let task = get_task(conn, task_id)?;
    let list = get_list(conn, task.list_id)?;
    let sessions = sessions_for_task(conn, task_id)?;
    let mut total_focus_seconds = 0_u64;
    let mut ordinal = 0_u64;
    let mut rows = Vec::new();

    for session in sessions {
        if session.kind != SessionKind::Work {
            continue;
        }
        let Some(ended_at) = session.ended_at else {
            continue;
        };
        ordinal = ordinal
            .checked_add(1)
            .ok_or(SessionsReportError::CountOverflow)?;
        total_focus_seconds = total_focus_seconds
            .checked_add(session.duration_seconds)
            .ok_or(SessionsReportError::DurationOverflow)?;
        rows.push(SessionsReportRow {
            session: ReportSessionRow {
                id: session.id,
                task_id: Some(task.id),
                task_title: Some(task.title.clone()),
                list_id: Some(list.id),
                list_title: Some(list.title.clone()),
                kind: session.kind,
                source: session.source,
                started_at: session.started_at,
                ended_at,
                duration_seconds: session.duration_seconds,
                updated_at: session.updated_at,
                task_archived: task.archived_at.is_some(),
                list_archived: list.archived_at.is_some(),
            },
            task_session_ordinal: Some(ordinal),
        });
    }

    let total_sessions =
        u64::try_from(rows.len()).map_err(|_| SessionsReportError::CountOverflow)?;
    rows.reverse();

    Ok(TaskSessionsDetailProjection {
        task_id: task.id,
        task_title: task.title,
        list_id: list.id,
        list_title: list.title,
        task_archived: task.archived_at.is_some(),
        list_archived: list.archived_at.is_some(),
        total_focus_seconds,
        total_sessions,
        rows,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::ids::SessionId;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::sessions::SessionSource;
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::sessions::create_manual_work_session;
    use crate::persistence::tasks::create_task;

    fn row(
        task_id: Option<TaskId>,
        kind: SessionKind,
        started_at: &str,
        duration_seconds: u64,
    ) -> ReportSessionRow {
        let list_id = task_id.map(|_| ListId::generate());
        ReportSessionRow {
            id: SessionId::generate(),
            task_id,
            task_title: task_id.map(|_| "Task".to_owned()),
            list_id,
            list_title: list_id.map(|_| "List".to_owned()),
            kind,
            source: SessionSource::Focus,
            started_at: started_at.to_owned(),
            ended_at: started_at.to_owned(),
            duration_seconds,
            updated_at: started_at.to_owned(),
            task_archived: false,
            list_archived: false,
        }
    }

    fn history(sessions: Vec<ReportSessionRow>) -> ReportHistorySnapshot {
        ReportHistorySnapshot {
            range: ReportRange {
                start_at: "2026-09-01T00:00:00Z".into(),
                end_at: "2026-10-01T00:00:00Z".into(),
                list_ids: Vec::new(),
            },
            sessions,
            completed_tasks: Vec::new(),
        }
    }

    fn ordinals(rows: &[ReportSessionRow]) -> HashMap<SessionId, u64> {
        let mut by_task = HashMap::<TaskId, u64>::new();
        let mut result = HashMap::new();
        for row in rows {
            if row.kind != SessionKind::Work {
                continue;
            }
            let Some(task_id) = row.task_id else {
                continue;
            };
            let ordinal = by_task.entry(task_id).or_insert(0);
            *ordinal += 1;
            result.insert(row.id, *ordinal);
        }
        result
    }

    #[test]
    fn summary_uses_focus_time_distinct_worked_tasks_and_visible_session_count() {
        let first = TaskId::generate();
        let second = TaskId::generate();
        let sessions = vec![
            row(Some(first), SessionKind::Work, "2026-09-01T09:00:00Z", 600),
            row(Some(first), SessionKind::Break, "2026-09-01T09:10:00Z", 120),
            row(Some(first), SessionKind::Work, "2026-09-01T09:12:00Z", 300),
            row(Some(second), SessionKind::Work, "2026-09-02T10:00:00Z", 900),
            row(None, SessionKind::Break, "2026-09-02T10:15:00Z", 180),
        ];
        let ordinal_map = ordinals(&sessions);
        let snapshot = history(sessions);

        let visible =
            project_sessions_report(&snapshot, true, &ordinal_map).expect("show breaks projection");
        assert_eq!(visible.summary.total_focus_seconds, 1_800);
        assert_eq!(visible.summary.total_tasks, 2);
        assert_eq!(visible.summary.total_sessions, 5);
        assert_eq!(visible.rows.len(), 5);
        assert!(visible
            .rows
            .iter()
            .filter(|row| row.session.kind == SessionKind::Break)
            .all(|row| row.task_session_ordinal.is_none()));

        let hidden = project_sessions_report(&snapshot, false, &ordinal_map)
            .expect("hide breaks projection");
        assert_eq!(hidden.summary.total_focus_seconds, 1_800);
        assert_eq!(hidden.summary.total_tasks, 2);
        assert_eq!(hidden.summary.total_sessions, 3);
        assert_eq!(hidden.rows.len(), 3);
        assert!(hidden
            .rows
            .iter()
            .all(|row| row.session.kind == SessionKind::Work));
    }

    #[test]
    fn projection_is_reverse_chronological_and_keeps_task_relative_ordinals() {
        let task = TaskId::generate();
        let sessions = vec![
            row(Some(task), SessionKind::Work, "2026-09-03T09:00:00Z", 60),
            row(Some(task), SessionKind::Break, "2026-09-03T09:01:00Z", 30),
            row(Some(task), SessionKind::Work, "2026-09-03T09:02:00Z", 90),
        ];
        let ordinal_map = ordinals(&sessions);
        let snapshot = history(sessions);

        let projected =
            project_sessions_report(&snapshot, true, &ordinal_map).expect("project history");
        assert_eq!(
            projected
                .rows
                .iter()
                .map(|row| row.session.started_at.as_str())
                .collect::<Vec<_>>(),
            vec![
                "2026-09-03T09:02:00Z",
                "2026-09-03T09:01:00Z",
                "2026-09-03T09:00:00Z",
            ]
        );
        assert_eq!(projected.rows[0].task_session_ordinal, Some(2));
        assert_eq!(projected.rows[1].task_session_ordinal, None);
        assert_eq!(projected.rows[2].task_session_ordinal, Some(1));
    }

    #[test]
    fn missing_all_history_ordinal_fails_closed() {
        let task = TaskId::generate();
        let snapshot = history(vec![row(
            Some(task),
            SessionKind::Work,
            "2026-09-01T09:00:00Z",
            60,
        )]);

        assert!(matches!(
            project_sessions_report(&snapshot, false, &HashMap::new()),
            Err(SessionsReportError::MissingWorkOrdinal(_))
        ));
    }

    #[test]
    fn task_detail_and_filtered_report_use_all_history_work_ordinals() {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let list = create_list(
            &mut conn,
            NewListInput {
                title: "Work".into(),
                color: None,
                icon_asset: None,
            },
            "2026-08-01T00:00:00Z",
        )
        .expect("create list");
        let task = create_task(
            &mut conn,
            NewTaskInput {
                list_id: list.id,
                title: "Email newsletter".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            "2026-08-01T00:00:00Z",
        )
        .expect("create task");

        for (started, ended, seconds, now) in [
            (
                "2026-08-02T09:00:00Z",
                "2026-08-02T09:01:00Z",
                60,
                "2026-08-02T09:02:00Z",
            ),
            (
                "2026-09-02T09:00:00Z",
                "2026-09-02T09:02:00Z",
                120,
                "2026-09-02T09:03:00Z",
            ),
            (
                "2026-09-03T09:00:00Z",
                "2026-09-03T09:03:00Z",
                180,
                "2026-09-03T09:04:00Z",
            ),
        ] {
            create_manual_work_session(&mut conn, task.id, started, ended, seconds, now)
                .expect("create historical work session");
        }

        let report = load_sessions_report(
            &conn,
            ReportRange {
                start_at: "2026-09-01T00:00:00Z".into(),
                end_at: "2026-10-01T00:00:00Z".into(),
                list_ids: vec![list.id],
            },
            false,
        )
        .expect("load filtered Sessions report");
        assert_eq!(report.rows.len(), 2);
        assert_eq!(report.rows[0].task_session_ordinal, Some(3));
        assert_eq!(report.rows[1].task_session_ordinal, Some(2));

        let detail = load_task_sessions_detail(&conn, task.id).expect("load task detail");
        assert_eq!(detail.task_title, "Email newsletter");
        assert_eq!(detail.list_title, "Work");
        assert_eq!(detail.total_focus_seconds, 360);
        assert_eq!(detail.total_sessions, 3);
        assert_eq!(
            detail
                .rows
                .iter()
                .map(|row| row.task_session_ordinal)
                .collect::<Vec<_>>(),
            vec![Some(3), Some(2), Some(1)]
        );
    }

    #[test]
    fn zero_history_returns_zero_totals_without_inventing_rows() {
        let snapshot = history(Vec::new());
        let projected = project_sessions_report(&snapshot, true, &HashMap::new())
            .expect("empty sessions projection");
        assert_eq!(
            projected.summary,
            SessionsReportSummary {
                total_focus_seconds: 0,
                total_tasks: 0,
                total_sessions: 0,
            }
        );
        assert!(projected.rows.is_empty());
    }

    #[test]
    fn malformed_work_row_fails_closed_instead_of_inventing_task_identity() {
        let snapshot = history(vec![row(
            None,
            SessionKind::Work,
            "2026-09-01T09:00:00Z",
            60,
        )]);

        assert!(matches!(
            project_sessions_report(&snapshot, true, &HashMap::new()),
            Err(SessionsReportError::MissingWorkTask)
        ));
    }

    #[test]
    fn focus_time_overflow_fails_closed() {
        let task = TaskId::generate();
        let sessions = vec![
            row(
                Some(task),
                SessionKind::Work,
                "2026-09-01T09:00:00Z",
                u64::MAX,
            ),
            row(Some(task), SessionKind::Work, "2026-09-01T10:00:00Z", 1),
        ];
        let ordinal_map = ordinals(&sessions);
        let snapshot = history(sessions);

        assert!(matches!(
            project_sessions_report(&snapshot, false, &ordinal_map),
            Err(SessionsReportError::DurationOverflow)
        ));
    }
}
