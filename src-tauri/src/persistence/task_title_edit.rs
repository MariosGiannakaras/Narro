use crate::domain::ids::{ListId, TaskId};
use crate::domain::tasks::TaskRecord;
use crate::persistence::tasks::{get_task, TaskStoreError};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum TaskTitleEditError {
    Task(TaskStoreError),
    ExpectedListMismatch {
        expected: ListId,
        actual: ListId,
    },
    ExpectedTitleMismatch(TaskId),
    StaleWrite(TaskId),
}

impl Display for TaskTitleEditError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Task(error) => Display::fmt(error, formatter),
            Self::ExpectedListMismatch { expected, actual } => write!(
                formatter,
                "task list changed before the inline edit committed: expected {expected}, actual {actual}"
            ),
            Self::ExpectedTitleMismatch(id) => write!(
                formatter,
                "task title changed before the inline edit committed: {id}"
            ),
            Self::StaleWrite(id) => write!(
                formatter,
                "task changed before the atomic inline-title write committed: {id}"
            ),
        }
    }
}

impl std::error::Error for TaskTitleEditError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Task(error) => Some(error),
            _ => None,
        }
    }
}

impl From<TaskStoreError> for TaskTitleEditError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

fn normalize_title(value: &str) -> Result<String, TaskTitleEditError> {
    let title = value.trim();
    if title.is_empty() {
        return Err(TaskStoreError::InvalidTitle.into());
    }
    Ok(title.to_owned())
}

fn validate_timestamp(value: &str) -> Result<(), TaskTitleEditError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| TaskStoreError::InvalidTimestamp.into())
}

fn validate_active_list(conn: &Connection, id: ListId) -> Result<(), TaskTitleEditError> {
    let archived_at: Option<Option<String>> = conn
        .query_row(
            "SELECT archived_at FROM lists WHERE id = ?1",
            [id.to_string()],
            |row| row.get(0),
        )
        .optional()
        .map_err(TaskStoreError::from)?;

    match archived_at {
        None => Err(TaskStoreError::ListNotFound(id).into()),
        Some(Some(_)) => Err(TaskStoreError::ListArchived(id).into()),
        Some(None) => Ok(()),
    }
}

pub fn update_task_title_if_expected(
    conn: &mut Connection,
    task_id: TaskId,
    expected_list_id: ListId,
    expected_title: &str,
    title: String,
    now: &str,
) -> Result<TaskRecord, TaskTitleEditError> {
    validate_timestamp(now)?;
    let title = normalize_title(&title)?;
    let tx = conn.transaction().map_err(TaskStoreError::from)?;
    let current = get_task(&tx, task_id)?;

    if current.archived_at.is_some() {
        return Err(TaskStoreError::ArchivedTask(task_id).into());
    }
    validate_active_list(&tx, current.list_id)?;
    if current.list_id != expected_list_id {
        return Err(TaskTitleEditError::ExpectedListMismatch {
            expected: expected_list_id,
            actual: current.list_id,
        });
    }
    if current.title != expected_title {
        return Err(TaskTitleEditError::ExpectedTitleMismatch(task_id));
    }

    // The expected title/list and active-state checks are part of the authoritative SQLite write.
    // Only title/updated_at are assigned, so a concurrent EST/schedule/session-owned metadata
    // change cannot be overwritten by a stale title editor.
    let changed = tx
        .execute(
            "UPDATE tasks
             SET title = ?1, updated_at = ?2
             WHERE id = ?3
               AND list_id = ?4
               AND title = ?5
               AND archived_at IS NULL
               AND EXISTS (
                   SELECT 1 FROM lists
                   WHERE id = ?4 AND archived_at IS NULL
               )",
            params![
                title,
                now,
                task_id.to_string(),
                expected_list_id.to_string(),
                expected_title,
            ],
        )
        .map_err(TaskStoreError::from)?;
    if changed != 1 {
        return Err(TaskTitleEditError::StaleWrite(task_id));
    }

    let updated = get_task(&tx, task_id)?;
    tx.commit().map_err(TaskStoreError::from)?;
    Ok(updated)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::tasks::{NewTaskInput, UpdateTaskInput};
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{create_task, update_task};

    const T0: &str = "2026-09-09T08:00:00Z";
    const T1: &str = "2026-09-09T08:01:00Z";

    fn setup() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("run migrations");
        conn
    }

    fn list(conn: &mut Connection, title: &str) -> ListId {
        create_list(
            conn,
            NewListInput {
                title: title.to_owned(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list")
        .id
    }

    fn task(conn: &mut Connection, list_id: ListId, title: &str) -> TaskRecord {
        create_task(
            conn,
            NewTaskInput {
                list_id,
                title: title.to_owned(),
                manual_lane: PlanningLane::ThisWeek,
                est_seconds: Some(1_500),
            },
            T0,
        )
        .expect("create task")
    }

    #[test]
    fn title_edit_preserves_identity_position_estimate_schedule_completion_and_time_metadata() {
        let mut conn = setup();
        let list_id = list(&mut conn, "Work");
        let created = task(&mut conn, list_id, "Original");
        conn.execute(
            "UPDATE tasks
             SET schedule_kind = 'date_only',
                 scheduled_local_date = '2026-09-12',
                 completed_at = '2026-09-09T08:00:30Z',
                 manual_time_adjustment_seconds = 321
             WHERE id = ?1",
            [created.id.to_string()],
        )
        .expect("set preserved metadata");
        let before = get_task(&conn, created.id).expect("load task before edit");

        let edited = update_task_title_if_expected(
            &mut conn,
            created.id,
            list_id,
            "Original",
            "  Renamed  ".to_owned(),
            T1,
        )
        .expect("edit task title");

        assert_eq!(edited.id, before.id);
        assert_eq!(edited.title, "Renamed");
        assert_eq!(edited.list_id, before.list_id);
        assert_eq!(edited.manual_lane, before.manual_lane);
        assert_eq!(edited.sort_rank, before.sort_rank);
        assert_eq!(edited.est_seconds, before.est_seconds);
        assert_eq!(
            edited.manual_time_adjustment_seconds,
            before.manual_time_adjustment_seconds
        );
        assert_eq!(edited.schedule_kind, before.schedule_kind);
        assert_eq!(edited.scheduled_local_date, before.scheduled_local_date);
        assert_eq!(edited.scheduled_local_time, before.scheduled_local_time);
        assert_eq!(edited.schedule_timezone, before.schedule_timezone);
        assert_eq!(edited.completed_at, before.completed_at);
    }

    #[test]
    fn blank_title_edit_is_rejected_without_writing() {
        let mut conn = setup();
        let list_id = list(&mut conn, "Work");
        let created = task(&mut conn, list_id, "Original");

        let result = update_task_title_if_expected(
            &mut conn,
            created.id,
            list_id,
            "Original",
            "  ".to_owned(),
            T1,
        );
        assert!(matches!(
            result,
            Err(TaskTitleEditError::Task(TaskStoreError::InvalidTitle))
        ));
        assert_eq!(get_task(&conn, created.id).unwrap().title, "Original");
    }

    #[test]
    fn stale_title_edit_is_rejected_without_clobbering_newer_authoritative_title() {
        let mut conn = setup();
        let list_id = list(&mut conn, "Work");
        let created = task(&mut conn, list_id, "Original");
        update_task(
            &mut conn,
            created.id,
            UpdateTaskInput {
                title: "Newer title".to_owned(),
                est_seconds: created.est_seconds,
            },
            T1,
        )
        .expect("apply newer title");

        let result = update_task_title_if_expected(
            &mut conn,
            created.id,
            list_id,
            "Original",
            "Stale overwrite".to_owned(),
            T1,
        );
        assert!(matches!(
            result,
            Err(TaskTitleEditError::ExpectedTitleMismatch(id)) if id == created.id
        ));
        assert_eq!(get_task(&conn, created.id).unwrap().title, "Newer title");
    }

    #[test]
    fn stale_list_edit_is_rejected_without_writing_title() {
        let mut conn = setup();
        let original_list = list(&mut conn, "Original list");
        let other_list = list(&mut conn, "Other list");
        let created = task(&mut conn, original_list, "Original");

        let result = update_task_title_if_expected(
            &mut conn,
            created.id,
            other_list,
            "Original",
            "Wrong list overwrite".to_owned(),
            T1,
        );
        assert!(matches!(
            result,
            Err(TaskTitleEditError::ExpectedListMismatch { expected, actual })
                if expected == other_list && actual == original_list
        ));
        assert_eq!(get_task(&conn, created.id).unwrap().title, "Original");
    }

    #[test]
    fn archived_list_rejects_title_edit_without_writing() {
        let mut conn = setup();
        let list_id = list(&mut conn, "Work");
        let created = task(&mut conn, list_id, "Original");
        conn.execute(
            "UPDATE lists SET archived_at = ?1, updated_at = ?1 WHERE id = ?2",
            params![T1, list_id.to_string()],
        )
        .expect("archive list fixture");

        let result = update_task_title_if_expected(
            &mut conn,
            created.id,
            list_id,
            "Original",
            "Should not save".to_owned(),
            T1,
        );
        assert!(matches!(
            result,
            Err(TaskTitleEditError::Task(TaskStoreError::ListArchived(id))) if id == list_id
        ));
        assert_eq!(get_task(&conn, created.id).unwrap().title, "Original");
    }
}
