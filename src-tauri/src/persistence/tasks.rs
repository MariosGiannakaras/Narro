use crate::domain::ids::{ListId, RecurrenceRuleId, TaskId};
use crate::domain::model::{DomainValueError, PlanningLane, ScheduleKind};
use crate::domain::tasks::{NewTaskInput, TaskDestination, TaskRecord, UpdateTaskInput};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension, Row, Transaction};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum TaskStoreError {
    Sqlite(rusqlite::Error),
    InvalidTitle,
    InvalidEstimate,
    InvalidTimestamp,
    InvalidStoredIdentity(&'static str),
    InvalidStoredDomainValue(DomainValueError),
    InvalidStoredRank(i64),
    InvalidStoredEstimate(i64),
    RankOverflow,
    ListNotFound(ListId),
    ListArchived(ListId),
    NotFound(TaskId),
    ArchivedTask(TaskId),
    CompletedTask(TaskId),
    MustArchiveBeforePermanentDelete(TaskId),
}

impl Display for TaskStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "task persistence failed: {error}"),
            Self::InvalidTitle => formatter.write_str("task title must not be empty"),
            Self::InvalidEstimate => formatter.write_str("task estimate must be greater than zero"),
            Self::InvalidTimestamp => {
                formatter.write_str("task mutation timestamp must be RFC 3339")
            }
            Self::InvalidStoredIdentity(kind) => {
                write!(formatter, "stored {kind} identity is not a valid UUID")
            }
            Self::InvalidStoredDomainValue(error) => Display::fmt(error, formatter),
            Self::InvalidStoredRank(rank) => {
                write!(formatter, "stored task rank is invalid: {rank}")
            }
            Self::InvalidStoredEstimate(value) => {
                write!(formatter, "stored task estimate is invalid: {value}")
            }
            Self::RankOverflow => formatter.write_str("task ordering rank overflow"),
            Self::ListNotFound(id) => write!(formatter, "task list not found: {id}"),
            Self::ListArchived(id) => write!(formatter, "task list is archived: {id}"),
            Self::NotFound(id) => write!(formatter, "task not found: {id}"),
            Self::ArchivedTask(id) => write!(formatter, "task is archived: {id}"),
            Self::CompletedTask(id) => write!(formatter, "task is completed: {id}"),
            Self::MustArchiveBeforePermanentDelete(id) => write!(
                formatter,
                "task must be archived before permanent deletion: {id}"
            ),
        }
    }
}

impl std::error::Error for TaskStoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::InvalidStoredDomainValue(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for TaskStoreError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

#[derive(Debug)]
struct RawTask {
    id: String,
    list_id: String,
    title: String,
    manual_lane: String,
    sort_rank: i64,
    est_seconds: Option<i64>,
    manual_time_adjustment_seconds: i64,
    schedule_kind: String,
    scheduled_local_date: Option<String>,
    scheduled_local_time: Option<String>,
    schedule_timezone: Option<String>,
    recurrence_rule_id: Option<String>,
    recurrence_parent_task_id: Option<String>,
    completed_at: Option<String>,
    archived_at: Option<String>,
    created_at: String,
    updated_at: String,
}

fn raw_task_from_row(row: &Row<'_>) -> rusqlite::Result<RawTask> {
    Ok(RawTask {
        id: row.get(0)?,
        list_id: row.get(1)?,
        title: row.get(2)?,
        manual_lane: row.get(3)?,
        sort_rank: row.get(4)?,
        est_seconds: row.get(5)?,
        manual_time_adjustment_seconds: row.get(6)?,
        schedule_kind: row.get(7)?,
        scheduled_local_date: row.get(8)?,
        scheduled_local_time: row.get(9)?,
        schedule_timezone: row.get(10)?,
        recurrence_rule_id: row.get(11)?,
        recurrence_parent_task_id: row.get(12)?,
        completed_at: row.get(13)?,
        archived_at: row.get(14)?,
        created_at: row.get(15)?,
        updated_at: row.get(16)?,
    })
}

const TASK_COLUMNS: &str = "id, list_id, title, manual_lane, sort_rank, est_seconds, \
manual_time_adjustment_seconds, schedule_kind, scheduled_local_date, scheduled_local_time, \
schedule_timezone, recurrence_rule_id, recurrence_parent_task_id, completed_at, archived_at, \
created_at, updated_at";

fn decode_task(raw: RawTask) -> Result<TaskRecord, TaskStoreError> {
    let id =
        TaskId::parse_str(&raw.id).map_err(|_| TaskStoreError::InvalidStoredIdentity("task"))?;
    let list_id = ListId::parse_str(&raw.list_id)
        .map_err(|_| TaskStoreError::InvalidStoredIdentity("list"))?;
    let manual_lane = PlanningLane::try_from(raw.manual_lane.as_str())
        .map_err(TaskStoreError::InvalidStoredDomainValue)?;
    let schedule_kind = ScheduleKind::try_from(raw.schedule_kind.as_str())
        .map_err(TaskStoreError::InvalidStoredDomainValue)?;
    let sort_rank = u32::try_from(raw.sort_rank)
        .map_err(|_| TaskStoreError::InvalidStoredRank(raw.sort_rank))?;
    let est_seconds = match raw.est_seconds {
        Some(value) if value > 0 => {
            Some(u32::try_from(value).map_err(|_| TaskStoreError::InvalidStoredEstimate(value))?)
        }
        Some(value) => return Err(TaskStoreError::InvalidStoredEstimate(value)),
        None => None,
    };
    let recurrence_rule_id = raw
        .recurrence_rule_id
        .map(|value| {
            RecurrenceRuleId::parse_str(&value)
                .map_err(|_| TaskStoreError::InvalidStoredIdentity("recurrence rule"))
        })
        .transpose()?;
    let recurrence_parent_task_id = raw
        .recurrence_parent_task_id
        .map(|value| {
            TaskId::parse_str(&value)
                .map_err(|_| TaskStoreError::InvalidStoredIdentity("recurrence parent task"))
        })
        .transpose()?;

    Ok(TaskRecord {
        id,
        list_id,
        title: raw.title,
        manual_lane,
        sort_rank,
        est_seconds,
        manual_time_adjustment_seconds: raw.manual_time_adjustment_seconds,
        schedule_kind,
        scheduled_local_date: raw.scheduled_local_date,
        scheduled_local_time: raw.scheduled_local_time,
        schedule_timezone: raw.schedule_timezone,
        recurrence_rule_id,
        recurrence_parent_task_id,
        completed_at: raw.completed_at,
        archived_at: raw.archived_at,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
    })
}

fn normalize_title(value: &str) -> Result<String, TaskStoreError> {
    let title = value.trim();
    if title.is_empty() {
        return Err(TaskStoreError::InvalidTitle);
    }
    Ok(title.to_owned())
}

fn validate_estimate(value: Option<u32>) -> Result<Option<i64>, TaskStoreError> {
    match value {
        Some(0) => Err(TaskStoreError::InvalidEstimate),
        Some(seconds) => Ok(Some(i64::from(seconds))),
        None => Ok(None),
    }
}

fn validate_timestamp(value: &str) -> Result<(), TaskStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| TaskStoreError::InvalidTimestamp)
}

fn validate_active_list(conn: &Connection, id: ListId) -> Result<(), TaskStoreError> {
    let archived_at: Option<Option<String>> = conn
        .query_row(
            "SELECT archived_at FROM lists WHERE id = ?1",
            [id.to_string()],
            |row| row.get(0),
        )
        .optional()?;

    match archived_at {
        None => Err(TaskStoreError::ListNotFound(id)),
        Some(Some(_)) => Err(TaskStoreError::ListArchived(id)),
        Some(None) => Ok(()),
    }
}

fn get_raw_task(conn: &Connection, id: TaskId) -> Result<Option<RawTask>, TaskStoreError> {
    let sql = format!("SELECT {TASK_COLUMNS} FROM tasks WHERE id = ?1");
    conn.query_row(&sql, [id.to_string()], raw_task_from_row)
        .optional()
        .map_err(TaskStoreError::from)
}

fn bucket_ids(
    conn: &Connection,
    list_id: ListId,
    lane: PlanningLane,
) -> Result<Vec<TaskId>, TaskStoreError> {
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
            TaskId::parse_str(&row?).map_err(|_| TaskStoreError::InvalidStoredIdentity("task"))?,
        );
    }
    Ok(ids)
}

fn next_bucket_rank(
    conn: &Connection,
    list_id: ListId,
    lane: PlanningLane,
) -> Result<i64, TaskStoreError> {
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
        Some(rank) if rank >= i64::from(u32::MAX) => Err(TaskStoreError::RankOverflow),
        Some(rank) => Ok(rank + 1),
        None => Ok(0),
    }
}

fn compact_bucket_ranks(
    tx: &Transaction<'_>,
    list_id: ListId,
    lane: PlanningLane,
    now: &str,
) -> Result<(), TaskStoreError> {
    let ids = bucket_ids(tx, list_id, lane)?;
    for (index, id) in ids.iter().enumerate() {
        let rank = i64::try_from(index).map_err(|_| TaskStoreError::RankOverflow)?;
        let changed = tx.execute(
            "UPDATE tasks
             SET sort_rank = ?1, updated_at = ?2
             WHERE id = ?3
               AND completed_at IS NULL
               AND archived_at IS NULL",
            params![rank, now, id.to_string()],
        )?;
        if changed != 1 {
            return Err(TaskStoreError::NotFound(*id));
        }
    }
    Ok(())
}

fn ensure_mutable_task(conn: &Connection, task: &TaskRecord) -> Result<(), TaskStoreError> {
    if task.archived_at.is_some() {
        return Err(TaskStoreError::ArchivedTask(task.id));
    }
    validate_active_list(conn, task.list_id)
}

pub fn get_task(conn: &Connection, id: TaskId) -> Result<TaskRecord, TaskStoreError> {
    decode_task(get_raw_task(conn, id)?.ok_or(TaskStoreError::NotFound(id))?)
}

pub fn active_tasks_in_bucket(
    conn: &Connection,
    list_id: ListId,
    lane: PlanningLane,
) -> Result<Vec<TaskRecord>, TaskStoreError> {
    validate_active_list(conn, list_id)?;
    let sql = format!(
        "SELECT {TASK_COLUMNS}
         FROM tasks
         WHERE list_id = ?1
           AND manual_lane = ?2
           AND completed_at IS NULL
           AND archived_at IS NULL
         ORDER BY sort_rank, id"
    );
    let mut statement = conn.prepare(&sql)?;
    let rows = statement.query_map(
        params![list_id.to_string(), lane.as_str()],
        raw_task_from_row,
    )?;
    let mut tasks = Vec::new();
    for row in rows {
        tasks.push(decode_task(row?)?);
    }
    Ok(tasks)
}

pub fn create_task(
    conn: &mut Connection,
    input: NewTaskInput,
    now: &str,
) -> Result<TaskRecord, TaskStoreError> {
    validate_timestamp(now)?;
    let title = normalize_title(&input.title)?;
    let est_seconds = validate_estimate(input.est_seconds)?;
    let id = TaskId::generate();
    let tx = conn.transaction()?;
    validate_active_list(&tx, input.list_id)?;
    let rank = next_bucket_rank(&tx, input.list_id, input.manual_lane)?;
    tx.execute(
        "INSERT INTO tasks (
            id, list_id, title, manual_lane, sort_rank, est_seconds,
            created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)",
        params![
            id.to_string(),
            input.list_id.to_string(),
            title,
            input.manual_lane.as_str(),
            rank,
            est_seconds,
            now
        ],
    )?;
    let created = get_raw_task(&tx, id)?.ok_or(TaskStoreError::NotFound(id))?;
    tx.commit()?;
    decode_task(created)
}

pub fn update_task(
    conn: &mut Connection,
    id: TaskId,
    input: UpdateTaskInput,
    now: &str,
) -> Result<TaskRecord, TaskStoreError> {
    validate_timestamp(now)?;
    let title = normalize_title(&input.title)?;
    let est_seconds = validate_estimate(input.est_seconds)?;
    let tx = conn.transaction()?;
    let current = get_task(&tx, id)?;
    ensure_mutable_task(&tx, &current)?;
    let changed = tx.execute(
        "UPDATE tasks
         SET title = ?1, est_seconds = ?2, updated_at = ?3
         WHERE id = ?4 AND archived_at IS NULL",
        params![title, est_seconds, now, id.to_string()],
    )?;
    if changed != 1 {
        return Err(TaskStoreError::NotFound(id));
    }
    let updated = get_raw_task(&tx, id)?.ok_or(TaskStoreError::NotFound(id))?;
    tx.commit()?;
    decode_task(updated)
}

pub fn move_task(
    conn: &mut Connection,
    id: TaskId,
    destination: TaskDestination,
    now: &str,
) -> Result<TaskRecord, TaskStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let current = get_task(&tx, id)?;
    ensure_mutable_task(&tx, &current)?;
    if current.completed_at.is_some() {
        return Err(TaskStoreError::CompletedTask(id));
    }
    validate_active_list(&tx, destination.list_id)?;
    if current.list_id == destination.list_id && current.manual_lane == destination.manual_lane {
        drop(tx);
        return Ok(current);
    }

    let target_rank = next_bucket_rank(&tx, destination.list_id, destination.manual_lane)?;
    let changed = tx.execute(
        "UPDATE tasks
         SET list_id = ?1, manual_lane = ?2, sort_rank = ?3, updated_at = ?4
         WHERE id = ?5 AND completed_at IS NULL AND archived_at IS NULL",
        params![
            destination.list_id.to_string(),
            destination.manual_lane.as_str(),
            target_rank,
            now,
            id.to_string()
        ],
    )?;
    if changed != 1 {
        return Err(TaskStoreError::NotFound(id));
    }
    compact_bucket_ranks(&tx, current.list_id, current.manual_lane, now)?;
    let moved = get_raw_task(&tx, id)?.ok_or(TaskStoreError::NotFound(id))?;
    tx.commit()?;
    decode_task(moved)
}

pub fn complete_task(
    conn: &mut Connection,
    id: TaskId,
    now: &str,
) -> Result<TaskRecord, TaskStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let current = get_task(&tx, id)?;
    ensure_mutable_task(&tx, &current)?;
    if current.completed_at.is_some() {
        drop(tx);
        return Ok(current);
    }

    let changed = tx.execute(
        "UPDATE tasks
         SET completed_at = ?1, updated_at = ?1
         WHERE id = ?2 AND completed_at IS NULL AND archived_at IS NULL",
        params![now, id.to_string()],
    )?;
    if changed != 1 {
        return Err(TaskStoreError::NotFound(id));
    }
    compact_bucket_ranks(&tx, current.list_id, current.manual_lane, now)?;
    let completed = get_raw_task(&tx, id)?.ok_or(TaskStoreError::NotFound(id))?;
    tx.commit()?;
    decode_task(completed)
}

pub fn reopen_task(
    conn: &mut Connection,
    id: TaskId,
    now: &str,
) -> Result<TaskRecord, TaskStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let current = get_task(&tx, id)?;
    ensure_mutable_task(&tx, &current)?;
    if current.completed_at.is_none() {
        drop(tx);
        return Ok(current);
    }

    let rank = next_bucket_rank(&tx, current.list_id, current.manual_lane)?;
    let changed = tx.execute(
        "UPDATE tasks
         SET completed_at = NULL, sort_rank = ?1, updated_at = ?2
         WHERE id = ?3 AND completed_at IS NOT NULL AND archived_at IS NULL",
        params![rank, now, id.to_string()],
    )?;
    if changed != 1 {
        return Err(TaskStoreError::NotFound(id));
    }
    let reopened = get_raw_task(&tx, id)?.ok_or(TaskStoreError::NotFound(id))?;
    tx.commit()?;
    decode_task(reopened)
}

pub fn archive_task(
    conn: &mut Connection,
    id: TaskId,
    now: &str,
) -> Result<TaskRecord, TaskStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let current = get_task(&tx, id)?;
    if current.archived_at.is_some() {
        drop(tx);
        return Ok(current);
    }

    let changed = tx.execute(
        "UPDATE tasks
         SET archived_at = ?1, updated_at = ?1
         WHERE id = ?2 AND archived_at IS NULL",
        params![now, id.to_string()],
    )?;
    if changed != 1 {
        return Err(TaskStoreError::NotFound(id));
    }
    if current.completed_at.is_none() {
        compact_bucket_ranks(&tx, current.list_id, current.manual_lane, now)?;
    }
    let archived = get_raw_task(&tx, id)?.ok_or(TaskStoreError::NotFound(id))?;
    tx.commit()?;
    decode_task(archived)
}

pub fn restore_task(
    conn: &mut Connection,
    id: TaskId,
    now: &str,
) -> Result<TaskRecord, TaskStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let current = get_task(&tx, id)?;
    if current.archived_at.is_none() {
        drop(tx);
        return Ok(current);
    }
    validate_active_list(&tx, current.list_id)?;

    let rank = if current.completed_at.is_none() {
        Some(next_bucket_rank(&tx, current.list_id, current.manual_lane)?)
    } else {
        None
    };
    let changed = match rank {
        Some(rank) => tx.execute(
            "UPDATE tasks
             SET archived_at = NULL, sort_rank = ?1, updated_at = ?2
             WHERE id = ?3 AND archived_at IS NOT NULL",
            params![rank, now, id.to_string()],
        )?,
        None => tx.execute(
            "UPDATE tasks
             SET archived_at = NULL, updated_at = ?1
             WHERE id = ?2 AND archived_at IS NOT NULL",
            params![now, id.to_string()],
        )?,
    };
    if changed != 1 {
        return Err(TaskStoreError::NotFound(id));
    }
    let restored = get_raw_task(&tx, id)?.ok_or(TaskStoreError::NotFound(id))?;
    tx.commit()?;
    decode_task(restored)
}

pub fn permanently_delete_task(conn: &mut Connection, id: TaskId) -> Result<(), TaskStoreError> {
    let tx = conn.transaction()?;
    let current = get_task(&tx, id)?;
    if current.archived_at.is_none() {
        return Err(TaskStoreError::MustArchiveBeforePermanentDelete(id));
    }

    let changed = tx.execute("DELETE FROM tasks WHERE id = ?1", [id.to_string()])?;
    if changed != 1 {
        return Err(TaskStoreError::NotFound(id));
    }
    tx.commit()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::persistence::lists::{archive_list, create_list};
    use crate::persistence::run_migrations;
    use rusqlite::params;
    use std::collections::HashSet;

    const T1: &str = "2026-09-03T12:00:00Z";
    const T2: &str = "2026-09-03T12:01:00Z";
    const T3: &str = "2026-09-03T12:02:00Z";
    const T4: &str = "2026-09-03T12:03:00Z";

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

    fn input(list_id: ListId, title: &str, lane: PlanningLane) -> NewTaskInput {
        NewTaskInput {
            list_id,
            title: title.to_owned(),
            manual_lane: lane,
            est_seconds: Some(900),
        }
    }

    fn task_ids(tasks: &[TaskRecord]) -> Vec<TaskId> {
        tasks.iter().map(|task| task.id).collect()
    }

    #[test]
    fn create_and_update_keep_stable_identity_and_typed_fields() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Inbox");
        let created = create_task(
            &mut conn,
            input(list_id, "  First task  ", PlanningLane::Backlog),
            T1,
        )
        .expect("create task");
        assert_eq!(created.title, "First task");
        assert_eq!(created.est_seconds, Some(900));
        assert_eq!(created.schedule_kind, ScheduleKind::None);
        assert_eq!(created.sort_rank, 0);

        let updated = update_task(
            &mut conn,
            created.id,
            UpdateTaskInput {
                title: "Edited task".into(),
                est_seconds: Some(1800),
            },
            T2,
        )
        .expect("update task");
        assert_eq!(updated.id, created.id);
        assert_eq!(updated.title, "Edited task");
        assert_eq!(updated.est_seconds, Some(1800));
        assert_eq!(updated.updated_at, T2);
        assert_eq!(get_task(&conn, created.id).expect("reload task"), updated);
    }

    #[test]
    fn move_between_planning_buckets_preserves_count_identity_and_compacts_source() {
        let mut conn = migrated();
        let first_list = create_test_list(&mut conn, "First list");
        let second_list = create_test_list(&mut conn, "Second list");
        let first = create_task(
            &mut conn,
            input(first_list, "First", PlanningLane::Backlog),
            T1,
        )
        .expect("create first task");
        let second = create_task(
            &mut conn,
            input(first_list, "Second", PlanningLane::Backlog),
            T1,
        )
        .expect("create second task");
        let expected: HashSet<TaskId> = [first.id, second.id].into_iter().collect();

        let moved = move_task(
            &mut conn,
            first.id,
            TaskDestination {
                list_id: second_list,
                manual_lane: PlanningLane::Today,
            },
            T2,
        )
        .expect("move task");
        assert_eq!(moved.id, first.id);
        assert_eq!(moved.list_id, second_list);
        assert_eq!(moved.manual_lane, PlanningLane::Today);
        assert_eq!(moved.sort_rank, 0);

        let source = active_tasks_in_bucket(&conn, first_list, PlanningLane::Backlog)
            .expect("source bucket");
        assert_eq!(task_ids(&source), vec![second.id]);
        assert_eq!(source[0].sort_rank, 0);
        let target =
            active_tasks_in_bucket(&conn, second_list, PlanningLane::Today).expect("target bucket");
        assert_eq!(task_ids(&target), vec![first.id]);

        let moved_again = move_task(
            &mut conn,
            first.id,
            TaskDestination {
                list_id: second_list,
                manual_lane: PlanningLane::Today,
            },
            T3,
        )
        .expect("idempotent same-bucket move");
        assert_eq!(moved_again.id, first.id);

        let stored: HashSet<TaskId> = [
            get_task(&conn, first.id).unwrap().id,
            get_task(&conn, second.id).unwrap().id,
        ]
        .into_iter()
        .collect();
        assert_eq!(stored, expected);
    }

    #[test]
    fn complete_and_reopen_are_idempotent_and_preserve_bucket_ordering() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Inbox");
        let first = create_task(&mut conn, input(list_id, "First", PlanningLane::Today), T1)
            .expect("create first");
        let second = create_task(&mut conn, input(list_id, "Second", PlanningLane::Today), T1)
            .expect("create second");

        let completed = complete_task(&mut conn, first.id, T2).expect("complete first");
        assert_eq!(completed.completed_at.as_deref(), Some(T2));
        let active = active_tasks_in_bucket(&conn, list_id, PlanningLane::Today)
            .expect("active after complete");
        assert_eq!(task_ids(&active), vec![second.id]);
        assert_eq!(active[0].sort_rank, 0);

        let completed_again = complete_task(&mut conn, first.id, T3).expect("repeat complete");
        assert_eq!(completed_again.completed_at.as_deref(), Some(T2));

        let reopened = reopen_task(&mut conn, first.id, T3).expect("reopen task");
        assert!(reopened.completed_at.is_none());
        let active = active_tasks_in_bucket(&conn, list_id, PlanningLane::Today)
            .expect("active after reopen");
        assert_eq!(task_ids(&active), vec![second.id, first.id]);
        assert_eq!(
            active.iter().map(|task| task.sort_rank).collect::<Vec<_>>(),
            vec![0, 1]
        );

        let reopened_again = reopen_task(&mut conn, first.id, T4).expect("repeat reopen");
        assert_eq!(reopened_again.sort_rank, 1);
    }

    #[test]
    fn archive_restore_and_permanent_delete_preserve_then_remove_owned_history() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Inbox");
        let task = create_task(&mut conn, input(list_id, "Task", PlanningLane::Backlog), T1)
            .expect("create task");
        conn.execute(
            "INSERT INTO subtasks (id, task_id, title, sort_rank, created_at, updated_at)
             VALUES (?1, ?2, 'Subtask', 0, ?3, ?3)",
            params![TaskId::generate().to_string(), task.id.to_string(), T1],
        )
        .expect("insert subtask fixture");
        conn.execute(
            "INSERT INTO sessions (id, task_id, kind, started_at, ended_at, duration_seconds, source, created_at, updated_at)
             VALUES (?1, ?2, 'work', ?3, ?3, 60, 'focus', ?3, ?3)",
            params![crate::domain::ids::SessionId::generate().to_string(), task.id.to_string(), T1],
        )
        .expect("insert session fixture");

        assert!(matches!(
            permanently_delete_task(&mut conn, task.id),
            Err(TaskStoreError::MustArchiveBeforePermanentDelete(id)) if id == task.id
        ));

        let archived = archive_task(&mut conn, task.id, T2).expect("archive task");
        assert_eq!(archived.archived_at.as_deref(), Some(T2));
        let preserved_sessions: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM sessions WHERE task_id = ?1",
                [task.id.to_string()],
                |row| row.get(0),
            )
            .expect("count preserved sessions");
        assert_eq!(preserved_sessions, 1);

        let restored = restore_task(&mut conn, task.id, T3).expect("restore task");
        assert_eq!(restored.id, task.id);
        assert!(restored.archived_at.is_none());

        archive_task(&mut conn, task.id, T4).expect("archive again");
        permanently_delete_task(&mut conn, task.id).expect("permanent delete");
        for table in ["tasks", "subtasks", "sessions"] {
            let count: i64 = conn
                .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |row| {
                    row.get(0)
                })
                .expect("count cascade rows");
            assert_eq!(
                count, 0,
                "{table} should be removed by permanent delete cascade"
            );
        }
    }

    #[test]
    fn invalid_input_and_archived_list_are_rejected_before_task_write() {
        let mut conn = migrated();
        let list_id = create_test_list(&mut conn, "Inbox");
        let blank = create_task(&mut conn, input(list_id, "   ", PlanningLane::Backlog), T1);
        assert!(matches!(blank, Err(TaskStoreError::InvalidTitle)));

        let zero_estimate = create_task(
            &mut conn,
            NewTaskInput {
                list_id,
                title: "Bad estimate".into(),
                manual_lane: PlanningLane::Backlog,
                est_seconds: Some(0),
            },
            T1,
        );
        assert!(matches!(
            zero_estimate,
            Err(TaskStoreError::InvalidEstimate)
        ));

        archive_list(&mut conn, list_id, T2).expect("archive list");
        let archived_target = create_task(
            &mut conn,
            input(list_id, "Cannot create here", PlanningLane::Today),
            T3,
        );
        assert!(matches!(
            archived_target,
            Err(TaskStoreError::ListArchived(id)) if id == list_id
        ));

        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
            .expect("count tasks after rejected writes");
        assert_eq!(count, 0);
    }
}
