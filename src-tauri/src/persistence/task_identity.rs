use crate::domain::ids::{ListId, TaskId};
use crate::domain::model::PlanningLane;
use crate::domain::tasks::TaskRecord;
use crate::persistence::tasks::{active_tasks_in_bucket, get_task, TaskStoreError};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension};
use std::collections::HashSet;
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum TaskIdentityError {
    Sqlite(rusqlite::Error),
    Task(TaskStoreError),
    InvalidTimestamp,
    ListNotFound(ListId),
    ListArchived(ListId),
    SourceArchived(TaskId),
    DuplicateReorderId,
    ReorderSetMismatch,
    RankOverflow,
}

impl Display for TaskIdentityError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "task identity persistence failed: {error}"),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::InvalidTimestamp => {
                formatter.write_str("task identity mutation timestamp must be RFC 3339")
            }
            Self::ListNotFound(id) => write!(formatter, "task list not found: {id}"),
            Self::ListArchived(id) => write!(formatter, "task list is archived: {id}"),
            Self::SourceArchived(id) => write!(formatter, "cannot duplicate archived task: {id}"),
            Self::DuplicateReorderId => {
                formatter.write_str("task reorder contains a duplicate identity")
            }
            Self::ReorderSetMismatch => formatter.write_str(
                "task reorder must contain every active task identity in the bucket exactly once",
            ),
            Self::RankOverflow => formatter.write_str("task ordering rank overflow"),
        }
    }
}

impl std::error::Error for TaskIdentityError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Task(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for TaskIdentityError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<TaskStoreError> for TaskIdentityError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

fn validate_timestamp(value: &str) -> Result<(), TaskIdentityError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| TaskIdentityError::InvalidTimestamp)
}

fn validate_active_list(conn: &Connection, id: ListId) -> Result<(), TaskIdentityError> {
    let archived_at: Option<Option<String>> = conn
        .query_row(
            "SELECT archived_at FROM lists WHERE id = ?1",
            [id.to_string()],
            |row| row.get(0),
        )
        .optional()?;

    match archived_at {
        None => Err(TaskIdentityError::ListNotFound(id)),
        Some(Some(_)) => Err(TaskIdentityError::ListArchived(id)),
        Some(None) => Ok(()),
    }
}

fn bucket_ids(
    conn: &Connection,
    list_id: ListId,
    lane: PlanningLane,
) -> Result<Vec<TaskId>, TaskIdentityError> {
    let mut statement = conn.prepare(
        "SELECT id
         FROM tasks
         WHERE list_id = ?1
           AND manual_lane = ?2
           AND completed_at IS NULL
           AND archived_at IS NULL
         ORDER BY sort_rank, id",
    )?;
    let rows = statement.query_map(params![list_id.to_string(), lane.as_str()], |row| {
        row.get::<_, String>(0)
    })?;
    let mut ids = Vec::new();
    for row in rows {
        ids.push(
            TaskId::parse_str(&row?)
                .map_err(|_| TaskIdentityError::ReorderSetMismatch)?,
        );
    }
    Ok(ids)
}

fn next_bucket_rank(
    conn: &Connection,
    list_id: ListId,
    lane: PlanningLane,
) -> Result<i64, TaskIdentityError> {
    let current: Option<i64> = conn.query_row(
        "SELECT MAX(sort_rank)
         FROM tasks
         WHERE list_id = ?1
           AND manual_lane = ?2
           AND completed_at IS NULL
           AND archived_at IS NULL",
        params![list_id.to_string(), lane.as_str()],
        |row| row.get(0),
    )?;

    match current {
        Some(rank) if rank >= i64::from(u32::MAX) => Err(TaskIdentityError::RankOverflow),
        Some(rank) => Ok(rank + 1),
        None => Ok(0),
    }
}

pub fn reorder_active_bucket(
    conn: &mut Connection,
    list_id: ListId,
    lane: PlanningLane,
    ordered_ids: &[TaskId],
    now: &str,
) -> Result<Vec<TaskRecord>, TaskIdentityError> {
    validate_timestamp(now)?;
    let requested: HashSet<TaskId> = ordered_ids.iter().copied().collect();
    if requested.len() != ordered_ids.len() {
        return Err(TaskIdentityError::DuplicateReorderId);
    }

    let tx = conn.transaction()?;
    validate_active_list(&tx, list_id)?;
    let current = bucket_ids(&tx, list_id, lane)?;
    let current_set: HashSet<TaskId> = current.iter().copied().collect();
    if current.len() != ordered_ids.len() || current_set != requested {
        return Err(TaskIdentityError::ReorderSetMismatch);
    }

    for (index, id) in ordered_ids.iter().enumerate() {
        let rank = u32::try_from(index).map_err(|_| TaskIdentityError::RankOverflow)?;
        let changed = tx.execute(
            "UPDATE tasks
             SET sort_rank = ?1, updated_at = ?2
             WHERE id = ?3
               AND list_id = ?4
               AND manual_lane = ?5
               AND completed_at IS NULL
               AND archived_at IS NULL",
            params![
                i64::from(rank),
                now,
                id.to_string(),
                list_id.to_string(),
                lane.as_str()
            ],
        )?;
        if changed != 1 {
            return Err(TaskIdentityError::ReorderSetMismatch);
        }
    }

    tx.commit()?;
    active_tasks_in_bucket(conn, list_id, lane).map_err(TaskIdentityError::from)
}

pub fn duplicate_task(
    conn: &mut Connection,
    source_id: TaskId,
    now: &str,
) -> Result<TaskRecord, TaskIdentityError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let source = get_task(&tx, source_id)?;
    if source.archived_at.is_some() {
        return Err(TaskIdentityError::SourceArchived(source_id));
    }
    validate_active_list(&tx, source.list_id)?;

    let id = TaskId::generate();
    let rank = next_bucket_rank(&tx, source.list_id, source.manual_lane)?;
    let est_seconds = source.est_seconds.map(i64::from);
    tx.execute(
        "INSERT INTO tasks (
            id, list_id, title, manual_lane, sort_rank, est_seconds,
            manual_time_adjustment_seconds, schedule_kind,
            scheduled_local_date, scheduled_local_time, schedule_timezone,
            recurrence_rule_id, recurrence_parent_task_id,
            completed_at, archived_at, created_at, updated_at
         ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6,
            0, ?7, ?8, ?9, ?10,
            NULL, NULL,
            NULL, NULL, ?11, ?11
         )",
        params![
            id.to_string(),
            source.list_id.to_string(),
            source.title,
            source.manual_lane.as_str(),
            rank,
            est_seconds,
            source.schedule_kind.as_str(),
            source.scheduled_local_date,
            source.scheduled_local_time,
            source.schedule_timezone,
            now
        ],
    )?;
    tx.commit()?;

    get_task(conn, id).map_err(TaskIdentityError::from)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::ids::SessionId;
    use crate::domain::lists::NewListInput;
    use crate::domain::tasks::{NewTaskInput, TaskDestination, UpdateTaskInput};
    use crate::persistence::lists::{archive_list, create_list};
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{
        archive_task, complete_task, create_task, move_task, update_task,
    };

    const T1: &str = "2026-09-03T13:00:00Z";
    const T2: &str = "2026-09-03T13:01:00Z";
    const T3: &str = "2026-09-03T13:02:00Z";

    fn migrated() -> Connection {
        let mut conn = Connection::open_in_memory().expect("open in-memory database");
        run_migrations(&mut conn).expect("migrate database");
        conn
    }

    fn create_test_list(conn: &mut Connection, title: &str) -> ListId {
        create_list(
            conn,
            NewListInput {
                title: title.to_owned(),
                color: None,
                icon_asset: None,
            },
            T1,
        )
        .expect("create list")
        .id
    }

    fn create_test_task(
        conn: &mut Connection,
        list_id: ListId,
        title: &str,
        lane: PlanningLane,
    ) -> TaskRecord {
        create_task(
            conn,
            NewTaskInput {
                list_id,
                title: title.to_owned(),
                manual_lane: lane,
                est_seconds: Some(900),
            },
            T1,
        )
        .expect("create task")
    }

    fn ids(tasks: &[TaskRecord]) -> Vec<TaskId> {
        tasks.iter().map(|task| task.id).collect()
    }

    #[test]
    fn repeated_reorder_changes_only_positions_and_preserves_exact_identity_set() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Inbox");
        let first = create_test_task(&mut conn, list_id, "First", PlanningLane::Backlog);
        let second = create_test_task(&mut conn, list_id, "Second", PlanningLane::Backlog);
        let third = create_test_task(&mut conn, list_id, "Third", PlanningLane::Backlog);
        let fourth = create_test_task(&mut conn, list_id, "Fourth", PlanningLane::Backlog);
        let expected: HashSet<TaskId> = [first.id, second.id, third.id, fourth.id]
            .into_iter()
            .collect();
        let order_a = [fourth.id, second.id, first.id, third.id];
        let order_b = [first.id, third.id, fourth.id, second.id];

        for iteration in 0..40 {
            let requested = if iteration % 2 == 0 { &order_a } else { &order_b };
            let reordered =
                reorder_active_bucket(&mut conn, list_id, PlanningLane::Backlog, requested, T2)
                    .expect("reorder bucket");
            assert_eq!(ids(&reordered), requested);
            assert_eq!(
                reordered
                    .iter()
                    .map(|task| task.sort_rank)
                    .collect::<Vec<_>>(),
                vec![0, 1, 2, 3]
            );
            assert_eq!(
                reordered
                    .iter()
                    .map(|task| task.id)
                    .collect::<HashSet<_>>(),
                expected
            );
        }

        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
            .expect("count tasks after repeated reorder");
        assert_eq!(count, 4);
    }

    #[test]
    fn duplicate_or_stale_reorder_is_rejected_without_partial_position_write() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Inbox");
        let first = create_test_task(&mut conn, list_id, "First", PlanningLane::Today);
        let second = create_test_task(&mut conn, list_id, "Second", PlanningLane::Today);
        let third = create_test_task(&mut conn, list_id, "Third", PlanningLane::Today);
        let original = ids(
            &active_tasks_in_bucket(&conn, list_id, PlanningLane::Today)
                .expect("load original bucket"),
        );

        let duplicate = reorder_active_bucket(
            &mut conn,
            list_id,
            PlanningLane::Today,
            &[first.id, first.id, third.id],
            T2,
        );
        assert!(matches!(
            duplicate,
            Err(TaskIdentityError::DuplicateReorderId)
        ));
        assert_eq!(
            ids(
                &active_tasks_in_bucket(&conn, list_id, PlanningLane::Today)
                    .expect("bucket after duplicate rejection")
            ),
            original
        );

        let stale = reorder_active_bucket(
            &mut conn,
            list_id,
            PlanningLane::Today,
            &[third.id, second.id, TaskId::generate()],
            T2,
        );
        assert!(matches!(
            stale,
            Err(TaskIdentityError::ReorderSetMismatch)
        ));
        assert_eq!(
            ids(
                &active_tasks_in_bucket(&conn, list_id, PlanningLane::Today)
                    .expect("bucket after stale rejection")
            ),
            original
        );
    }

    #[test]
    fn reorder_and_cross_bucket_moves_never_change_global_task_count_or_identities() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Inbox");
        let first = create_test_task(&mut conn, list_id, "First", PlanningLane::Backlog);
        let second = create_test_task(&mut conn, list_id, "Second", PlanningLane::Backlog);
        let third = create_test_task(&mut conn, list_id, "Third", PlanningLane::Backlog);
        let expected: HashSet<TaskId> = [first.id, second.id, third.id].into_iter().collect();

        for _ in 0..12 {
            reorder_active_bucket(
                &mut conn,
                list_id,
                PlanningLane::Backlog,
                &[third.id, first.id, second.id],
                T2,
            )
            .expect("reorder before move");
            move_task(
                &mut conn,
                first.id,
                TaskDestination {
                    list_id,
                    manual_lane: PlanningLane::Today,
                },
                T2,
            )
            .expect("move to today");
            move_task(
                &mut conn,
                first.id,
                TaskDestination {
                    list_id,
                    manual_lane: PlanningLane::Backlog,
                },
                T2,
            )
            .expect("move back to backlog");
            let current = active_tasks_in_bucket(&conn, list_id, PlanningLane::Backlog)
                .expect("load backlog after move cycle");
            assert_eq!(current.len(), 3);
            assert_eq!(
                current.iter().map(|task| task.id).collect::<HashSet<_>>(),
                expected
            );
        }

        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
            .expect("count tasks after reorder and moves");
        assert_eq!(count, 3);
    }

    #[test]
    fn duplicate_creates_one_independent_active_copy_and_resets_history_links() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Inbox");
        let source = create_test_task(&mut conn, list_id, "Source", PlanningLane::Today);
        conn.execute(
            "UPDATE tasks
             SET manual_time_adjustment_seconds = 120,
                 schedule_kind = 'date_only',
                 scheduled_local_date = '2026-09-04'
             WHERE id = ?1",
            [source.id.to_string()],
        )
        .expect("configure source task");
        conn.execute(
            "INSERT INTO sessions (
                id, task_id, kind, started_at, ended_at, duration_seconds, source, created_at, updated_at
             ) VALUES (?1, ?2, 'work', ?3, ?3, 60, 'focus', ?3, ?3)",
            params![SessionId::generate().to_string(), source.id.to_string(), T1],
        )
        .expect("insert source session");
        let source = complete_task(&mut conn, source.id, T2).expect("complete source");

        let duplicate = duplicate_task(&mut conn, source.id, T3).expect("duplicate task");
        assert_ne!(duplicate.id, source.id);
        assert_eq!(duplicate.list_id, source.list_id);
        assert_eq!(duplicate.title, source.title);
        assert_eq!(duplicate.manual_lane, source.manual_lane);
        assert_eq!(duplicate.est_seconds, source.est_seconds);
        assert_eq!(duplicate.schedule_kind, source.schedule_kind);
        assert_eq!(
            duplicate.scheduled_local_date,
            source.scheduled_local_date
        );
        assert_eq!(duplicate.manual_time_adjustment_seconds, 0);
        assert!(duplicate.completed_at.is_none());
        assert!(duplicate.archived_at.is_none());
        assert!(duplicate.recurrence_rule_id.is_none());
        assert!(duplicate.recurrence_parent_task_id.is_none());
        assert_eq!(duplicate.created_at, T3);
        assert_eq!(duplicate.updated_at, T3);

        let duplicate_sessions: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM sessions WHERE task_id = ?1",
                [duplicate.id.to_string()],
                |row| row.get(0),
            )
            .expect("count duplicate sessions");
        assert_eq!(duplicate_sessions, 0);

        let edited = update_task(
            &mut conn,
            duplicate.id,
            UpdateTaskInput {
                title: "Independent copy".into(),
                est_seconds: Some(1800),
            },
            T3,
        )
        .expect("edit duplicate independently");
        assert_eq!(edited.title, "Independent copy");
        assert_eq!(get_task(&conn, source.id).expect("reload source").title, "Source");

        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
            .expect("count task rows after duplicate");
        assert_eq!(count, 2);
    }

    #[test]
    fn duplicate_rejects_archived_source_and_archived_list_without_writing() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Inbox");
        let task = create_test_task(&mut conn, list_id, "Task", PlanningLane::Backlog);
        archive_task(&mut conn, task.id, T2).expect("archive source task");

        let archived_source = duplicate_task(&mut conn, task.id, T3);
        assert!(matches!(
            archived_source,
            Err(TaskIdentityError::SourceArchived(id)) if id == task.id
        ));

        let second = create_test_task(&mut conn, list_id, "Second", PlanningLane::Backlog);
        archive_list(&mut conn, list_id, T2).expect("archive list");
        let archived_list = duplicate_task(&mut conn, second.id, T3);
        assert!(matches!(
            archived_list,
            Err(TaskIdentityError::ListArchived(id)) if id == list_id
        ));

        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
            .expect("count tasks after rejected duplication");
        assert_eq!(count, 2);
    }
}
