use crate::domain::ids::TaskId;
use crate::domain::sessions::SessionKind;
use crate::reporting::{ReportHistorySnapshot, ReportSessionRow};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SessionsReportSummary {
    pub total_focus_seconds: u64,
    pub total_tasks: u64,
    pub total_sessions: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SessionsReportProjection {
    pub summary: SessionsReportSummary,
    pub rows: Vec<ReportSessionRow>,
}

#[derive(Debug)]
pub enum SessionsReportError {
    MissingWorkTask,
    DurationOverflow,
    CountOverflow,
}

impl Display for SessionsReportError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::MissingWorkTask => {
                formatter.write_str("report work session is missing its task identity")
            }
            Self::DurationOverflow => {
                formatter.write_str("Sessions report focus duration overflowed")
            }
            Self::CountOverflow => formatter.write_str("Sessions report count overflowed"),
        }
    }
}

impl std::error::Error for SessionsReportError {}

/// Projects the user-visible Sessions dashboard from an already validated
/// report-history snapshot.
///
/// Total Time is focus/work time only, matching the Sessions report wording.
/// Total Tasks counts distinct tasks with work sessions in the filtered
/// history. Total Sessions counts the rows visible under the current
/// break-visibility filter, because the source product explicitly describes
/// the top numbers as updating with the active filters.
///
/// Session numbering is deliberately not assigned here: a range-filtered
/// snapshot cannot prove a work session's all-history ordinal for its task.
pub fn project_sessions_report(
    history: &ReportHistorySnapshot,
    show_break_sessions: bool,
) -> Result<SessionsReportProjection, SessionsReportError> {
    let mut total_focus_seconds = 0_u64;
    let mut worked_tasks = HashSet::<TaskId>::new();
    let mut rows = Vec::with_capacity(history.sessions.len());

    for session in &history.sessions {
        match session.kind {
            SessionKind::Work => {
                let task_id = session.task_id.ok_or(SessionsReportError::MissingWorkTask)?;
                worked_tasks.insert(task_id);
                total_focus_seconds = total_focus_seconds
                    .checked_add(session.duration_seconds)
                    .ok_or(SessionsReportError::DurationOverflow)?;
                rows.push(session.clone());
            }
            SessionKind::Break if show_break_sessions => rows.push(session.clone()),
            SessionKind::Break => {}
        }
    }

    let total_tasks =
        u64::try_from(worked_tasks.len()).map_err(|_| SessionsReportError::CountOverflow)?;
    let total_sessions =
        u64::try_from(rows.len()).map_err(|_| SessionsReportError::CountOverflow)?;

    Ok(SessionsReportProjection {
        summary: SessionsReportSummary {
            total_focus_seconds,
            total_tasks,
            total_sessions,
        },
        rows,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::ids::{ListId, SessionId};
    use crate::domain::sessions::SessionSource;
    use crate::reporting::ReportRange;

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
            task_archived: false,
            list_archived: false,
        }
    }

    fn history(sessions: Vec<ReportSessionRow>) -> ReportHistorySnapshot {
        ReportHistorySnapshot {
            range: ReportRange {
                start_at: "2026-09-01T00:00:00Z".into(),
                end_at: "2026-10-01T00:00:00Z".into(),
                list_id: None,
            },
            sessions,
            completed_tasks: Vec::new(),
        }
    }

    #[test]
    fn summary_uses_focus_time_distinct_worked_tasks_and_visible_session_count() {
        let first = TaskId::generate();
        let second = TaskId::generate();
        let snapshot = history(vec![
            row(Some(first), SessionKind::Work, "2026-09-01T09:00:00Z", 600),
            row(Some(first), SessionKind::Break, "2026-09-01T09:10:00Z", 120),
            row(Some(first), SessionKind::Work, "2026-09-01T09:12:00Z", 300),
            row(Some(second), SessionKind::Work, "2026-09-02T10:00:00Z", 900),
            row(None, SessionKind::Break, "2026-09-02T10:15:00Z", 180),
        ]);

        let visible = project_sessions_report(&snapshot, true).expect("show breaks projection");
        assert_eq!(visible.summary.total_focus_seconds, 1_800);
        assert_eq!(visible.summary.total_tasks, 2);
        assert_eq!(visible.summary.total_sessions, 5);
        assert_eq!(visible.rows.len(), 5);

        let hidden = project_sessions_report(&snapshot, false).expect("hide breaks projection");
        assert_eq!(hidden.summary.total_focus_seconds, 1_800);
        assert_eq!(hidden.summary.total_tasks, 2);
        assert_eq!(hidden.summary.total_sessions, 3);
        assert_eq!(hidden.rows.len(), 3);
        assert!(hidden
            .rows
            .iter()
            .all(|session| session.kind == SessionKind::Work));
    }

    #[test]
    fn projection_preserves_authoritative_chronological_row_order() {
        let task = TaskId::generate();
        let snapshot = history(vec![
            row(Some(task), SessionKind::Work, "2026-09-03T09:00:00Z", 60),
            row(Some(task), SessionKind::Break, "2026-09-03T09:01:00Z", 30),
            row(Some(task), SessionKind::Work, "2026-09-03T09:02:00Z", 90),
        ]);

        let projected = project_sessions_report(&snapshot, true).expect("project history");
        assert_eq!(
            projected
                .rows
                .iter()
                .map(|session| session.started_at.as_str())
                .collect::<Vec<_>>(),
            vec![
                "2026-09-03T09:00:00Z",
                "2026-09-03T09:01:00Z",
                "2026-09-03T09:02:00Z",
            ]
        );
    }

    #[test]
    fn zero_history_returns_zero_totals_without_inventing_rows() {
        let projected = project_sessions_report(&history(Vec::new()), true)
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
            project_sessions_report(&snapshot, true),
            Err(SessionsReportError::MissingWorkTask)
        ));
    }

    #[test]
    fn focus_time_overflow_fails_closed() {
        let task = TaskId::generate();
        let snapshot = history(vec![
            row(Some(task), SessionKind::Work, "2026-09-01T09:00:00Z", u64::MAX),
            row(Some(task), SessionKind::Work, "2026-09-01T10:00:00Z", 1),
        ]);

        assert!(matches!(
            project_sessions_report(&snapshot, false),
            Err(SessionsReportError::DurationOverflow)
        ));
    }
}
