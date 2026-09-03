use crate::domain::ids::{ListId, SubtaskId, TaskId};
use crate::domain::subtasks::{NewSubtaskInput, SubtaskRecord, UpdateSubtaskInput};
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension, Row, Transaction};
use std::collections::HashSet;
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum SubtaskStoreError {
    Sqlite(rusqlite::Error),
    Task(TaskStoreError),
    List(ListStoreError),
    InvalidTitle,
    InvalidTimestamp,
    InvalidStoredIdentity(&'static str),
    InvalidStoredRank(i64),
    RankOverflow,
    NotFound(SubtaskId),
    ParentTaskArchived(TaskId),
    ParentTaskCompleted(TaskId),
    ParentListArchived(ListId),
    DuplicateReorderId,
    ReorderSetMismatch,
}

impl Display for SubtaskStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "subtask persistence failed: {error}"),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::List(error) => Display::fmt(error, formatter),
            Self::InvalidTitle => formatter.write_str("subtask title must not be empty"),
            Self::InvalidTimestamp => {
                formatter.write_str("subtask mutation timestamp must be RFC 3339")
            }
            Self::InvalidStoredIdentity(kind) => {
                write!(formatter, "stored {kind} identity is not a valid UUID")
            }
            Self::InvalidStoredRank(rank) => {
                write!(formatter, "stored subtask rank is invalid: {rank}")
            }
            Self::RankOverflow => formatter.write_str("subtask ordering rank overflow"),
            Self::NotFound(id) => write!(formatter, "subtask not found: {id}"),
            Self::ParentTaskArchived(id) => write!(formatter, "subtask parent task is archived: {id}"),
            Self::ParentTaskCompleted(id) => {
                write!(formatter, "subtask parent task is completed: {id}")
            }
            Self::ParentListArchived(id) => write!(formatter, "subtask parent list is archived: {id}"),
            Self::DuplicateReorderId => {
                formatter.write_str("subtask reorder contains a duplicate identity")
            }
            Self::ReorderSetMismatch => formatter.write_str(
                "subtask reorder must contain every subtask identity for the parent exactly once",
            ),
        }
    }
}

impl std::error::Error for SubtaskStoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for SubtaskStoreError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<TaskStoreError> for SubtaskStoreError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<ListStoreError> for SubtaskStoreError {
    fn from(value: ListStoreError) -> Self {
        Self::List(value)
    }
}

#[derive(Debug)]
struct RawSubtask {
    id: String,
    task_id: String,
    title: String,
    sort_rank: i64,
    completed_at: Option<String>,
    created_at: String,
    updated_at: String,
}

const SUBTASK_COLUMNS: &str =
    "id, task_id, title, sort_rank, completed_at, created_at, updated_at";

fn raw_subtask_from_row(row: &Row<'_>) -> rusqlite::Result<RawSubtask> {
    Ok(RawSubtask {
        id: row.get(0)?,
        task_id: row.get(1)?,
        title: row.get(2)?,
        sort_rank: row.get(3)?,
        completed_at: row.get(4)?,
        created_at: row.get(5)?,
        updated_at: row.get(6)?,
    })
}

fn decode_subtask(raw: RawSubtask) -> Result<SubtaskRecord, SubtaskStoreError> {
    let id = SubtaskId::parse_str(&raw.id)
        .map_err(|_| SubtaskStoreError::InvalidStoredIdentity("subtask"))?;
    let task_id = TaskId::parse_str(&raw.task_id)
        .map_err(|_| SubtaskStoreError::InvalidStoredIdentity("subtask parent task"))?;
    let sort_rank = u32::try_from(raw.sort_rank)
        .map_err(|_| SubtaskStoreError::InvalidStoredRank(raw.sort_rank))?;

    Ok(SubtaskRecord {
        id,
        task_id,
        title: raw.title,
        sort_rank,
        completed_at: raw.completed_at,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
    })
}

fn normalize_title(value: &str) -> Result<String, SubtaskStoreError> {
    let title = value.trim();
    if title.is_empty() {
        return Err(SubtaskStoreError::InvalidTitle);
    }
    Ok(title.to_owned())
}

fn validate_timestamp(value: &str) -> Result<(), SubtaskStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| SubtaskStoreError::InvalidTimestamp)
}

fn get_raw_subtask(
    conn: &Connection,
    id: SubtaskId,
) -> Result<Option<RawSubtask>, SubtaskStoreError> {
    let sql = format!("SELECT {SUBTASK_COLUMNS} FROM subtasks WHERE id = ?1");
    conn.query_row(&sql, [id.to_string()], raw_subtask_from_row)
        .optional()
        .map_err(SubtaskStoreError::from)
}

fn validate_parent_mutable(conn: &Connection, task_id: TaskId) -> Result<(), SubtaskStoreError> {
    let task = get_task(conn, task_id)?;
    if task.archived_at.is_some() {
        return Err(SubtaskStoreError::ParentTaskArchived(task_id));
    }
    if task.completed_at.is_some() {
        return Err(SubtaskStoreError::ParentTaskCompleted(task_id));
    }

    let list = get_list(conn, task.list_id)?;
    if list.archived_at.is_some() {
        return Err(SubtaskStoreError::ParentListArchived(task.list_id));
    }
    Ok(())
}

fn subtask_ids(conn: &Connection, task_id: TaskId) -> Result<Vec<SubtaskId>, SubtaskStoreError> {
    let mut statement = conn.prepare(
        "SELECT id
         FROM subtasks
         WHERE task_id = ?1
         ORDER BY sort_rank, id",
    )?;
    let rows = statement.query_map([task_id.to_string()], |row| row.get::<_, String>(0))?;
    let mut ids = Vec::new();
    for row in rows {
        ids.push(
            SubtaskId::parse_str(&row?)
                .map_err(|_| SubtaskStoreError::InvalidStoredIdentity("subtask"))?,
        );
    }
    Ok(ids)
}

fn next_rank(conn: &Connection, task_id: TaskId) -> Result<i64, SubtaskStoreError> {
    let current: Option<i64> = conn.query_row(
        "SELECT MAX(sort_rank) FROM subtasks WHERE task_id = ?1",
        [task_id.to_string()],
        |row| row.get(0),
    )?;

    match current {
        Some(rank) if rank >= i64::from(u32::MAX) => Err(SubtaskStoreError::RankOverflow),
        Some(rank) => Ok(rank + 1),
        None => Ok(0),
    }
}

fn compact_ranks(
    tx: &Transaction<'_>,
    task_id: TaskId,
    now: &str,
) -> Result<(), SubtaskStoreError> {
    let ids = subtask_ids(tx, task_id)?;
    for (index, id) in ids.iter().enumerate() {
        let rank = u32::try_from(index).map_err(|_| SubtaskStoreError::RankOverflow)?;
        let changed = tx.execute(
            "UPDATE subtasks
             SET sort_rank = ?1, updated_at = ?2
             WHERE id = ?3 AND task_id = ?4",
            params![i64::from(rank), now, id.to_string(), task_id.to_string()],
        )?;
        if changed != 1 {
            return Err(SubtaskStoreError::ReorderSetMismatch);
        }
    }
    Ok(())
}

pub fn get_subtask(
    conn: &Connection,
    id: SubtaskId,
) -> Result<SubtaskRecord, SubtaskStoreError> {
    decode_subtask(get_raw_subtask(conn, id)?.ok_or(SubtaskStoreError::NotFound(id))?)
}

pub fn subtasks_for_task(
    conn: &Connection,
    task_id: TaskId,
) -> Result<Vec<SubtaskRecord>, SubtaskStoreError> {
    get_task(conn, task_id)?;
    let sql = format!(
        "SELECT {SUBTASK_COLUMNS}
         FROM subtasks
         WHERE task_id = ?1
         ORDER BY sort_rank, id"
    );
    let mut statement = conn.prepare(&sql)?;
    let rows = statement.query_map([task_id.to_string()], raw_subtask_from_row)?;
    let mut subtasks = Vec::new();
    for row in rows {
        subtasks.push(decode_subtask(row?)?);
    }
    Ok(subtasks)
}

pub fn create_subtask(
    conn: &mut Connection,
    input: NewSubtaskInput,
    now: &str,
) -> Result<SubtaskRecord, SubtaskStoreError> {
    validate_timestamp(now)?;
    let title = normalize_title(&input.title)?;
    let id = SubtaskId::generate();
    let tx = conn.transaction()?;
    validate_parent_mutable(&tx, input.task_id)?;
    let rank = next_rank(&tx, input.task_id)?;
    tx.execute(
        "INSERT INTO subtasks (
            id, task_id, title, sort_rank, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?5)",
        params![id.to_string(), input.task_id.to_string(), title, rank, now],
    )?;
    let created = get_raw_subtask(&tx, id)?.ok_or(SubtaskStoreError::NotFound(id))?;
    tx.commit()?;
    decode_subtask(created)
}

pub fn update_subtask(
    conn: &mut Connection,
    id: SubtaskId,
    input: UpdateSubtaskInput,
    now: &str,
) -> Result<SubtaskRecord, SubtaskStoreError> {
    validate_timestamp(now)?;
    let title = normalize_title(&input.title)?;
    let tx = conn.transaction()?;
    let current = get_subtask(&tx, id)?;
    validate_parent_mutable(&tx, current.task_id)?;
    let changed = tx.execute(
        "UPDATE subtasks SET title = ?1, updated_at = ?2 WHERE id = ?3 AND task_id = ?4",
        params![title, now, id.to_string(), current.task_id.to_string()],
    )?;
    if changed != 1 {
        return Err(SubtaskStoreError::NotFound(id));
    }
    let updated = get_raw_subtask(&tx, id)?.ok_or(SubtaskStoreError::NotFound(id))?;
    tx.commit()?;
    decode_subtask(updated)
}

pub fn complete_subtask(
    conn: &mut Connection,
    id: SubtaskId,
    now: &str,
) -> Result<SubtaskRecord, SubtaskStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let current = get_subtask(&tx, id)?;
    validate_parent_mutable(&tx, current.task_id)?;
    if current.completed_at.is_some() {
        return Ok(current);
    }
    let changed = tx.execute(
        "UPDATE subtasks
         SET completed_at = ?1, updated_at = ?1
         WHERE id = ?2 AND task_id = ?3 AND completed_at IS NULL",
        params![now, id.to_string(), current.task_id.to_string()],
    )?;
    if changed != 1 {
        return Err(SubtaskStoreError::NotFound(id));
    }
    let updated = get_raw_subtask(&tx, id)?.ok_or(SubtaskStoreError::NotFound(id))?;
    tx.commit()?;
    decode_subtask(updated)
}

pub fn reopen_subtask(
    conn: &mut Connection,
    id: SubtaskId,
    now: &str,
) -> Result<SubtaskRecord, SubtaskStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let current = get_subtask(&tx, id)?;
    validate_parent_mutable(&tx, current.task_id)?;
    if current.completed_at.is_none() {
        return Ok(current);
    }
    let changed = tx.execute(
        "UPDATE subtasks
         SET completed_at = NULL, updated_at = ?1
         WHERE id = ?2 AND task_id = ?3 AND completed_at IS NOT NULL",
        params![now, id.to_string(), current.task_id.to_string()],
    )?;
    if changed != 1 {
        return Err(SubtaskStoreError::NotFound(id));
    }
    let updated = get_raw_subtask(&tx, id)?.ok_or(SubtaskStoreError::NotFound(id))?;
    tx.commit()?;
    decode_subtask(updated)
}

pub fn reorder_subtasks(
    conn: &mut Connection,
    task_id: TaskId,
    ordered_ids: &[SubtaskId],
    now: &str,
) -> Result<Vec<SubtaskRecord>, SubtaskStoreError> {
    validate_timestamp(now)?;
    let requested: HashSet<SubtaskId> = ordered_ids.iter().copied().collect();
    if requested.len() != ordered_ids.len() {
        return Err(SubtaskStoreError::DuplicateReorderId);
    }

    let tx = conn.transaction()?;
    validate_parent_mutable(&tx, task_id)?;
    let current = subtask_ids(&tx, task_id)?;
    let current_set: HashSet<SubtaskId> = current.iter().copied().collect();
    if current.len() != ordered_ids.len() || current_set != requested {
        return Err(SubtaskStoreError::ReorderSetMismatch);
    }

    for (index, id) in ordered_ids.iter().enumerate() {
        let rank = u32::try_from(index).map_err(|_| SubtaskStoreError::RankOverflow)?;
        let changed = tx.execute(
            "UPDATE subtasks
             SET sort_rank = ?1, updated_at = ?2
             WHERE id = ?3 AND task_id = ?4",
            params![i64::from(rank), now, id.to_string(), task_id.to_string()],
        )?;
        if changed != 1 {
            return Err(SubtaskStoreError::ReorderSetMismatch);
        }
    }

    tx.commit()?;
    subtasks_for_task(conn, task_id)
}

pub fn delete_subtask(
    conn: &mut Connection,
    id: SubtaskId,
    now: &str,
) -> Result<(), SubtaskStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    let current = get_subtask(&tx, id)?;
    validate_parent_mutable(&tx, current.task_id)?;
    let changed = tx.execute(
        "DELETE FROM subtasks WHERE id = ?1 AND task_id = ?2",
        params![id.to_string(), current.task_id.to_string()],
    )?;
    if changed != 1 {
        return Err(SubtaskStoreError::NotFound(id));
    }
    compact_ranks(&tx, current.task_id, now)?;
    tx.commit()?;
    Ok(())
}
