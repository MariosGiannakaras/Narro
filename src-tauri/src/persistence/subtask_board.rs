use crate::domain::ids::{ListId, SubtaskId, TaskId};
use crate::domain::subtasks::SubtaskRecord;
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::subtasks::{get_subtask, subtasks_for_task, SubtaskStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use chrono::DateTime;
use rusqlite::{params, Connection, Transaction, TransactionBehavior};
use std::collections::HashSet;
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum SubtaskBoardError {
    Sqlite(rusqlite::Error),
    Task(TaskStoreError),
    List(ListStoreError),
    Subtask(SubtaskStoreError),
    ExpectedListMismatch { expected: ListId, actual: ListId },
    ExpectedParentMismatch {
        subtask_id: SubtaskId,
        expected: TaskId,
        actual: TaskId,
    },
    ExpectedTitleMismatch(SubtaskId),
    ExpectedCompletionMismatch(SubtaskId),
    ExpectedUpdatedAtMismatch(SubtaskId),
    ExpectedOrderMismatch(TaskId),
    StaleWrite(SubtaskId),
}

impl Display for SubtaskBoardError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "board subtask persistence failed: {error}"),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::List(error) => Display::fmt(error, formatter),
            Self::Subtask(error) => Display::fmt(error, formatter),
            Self::ExpectedListMismatch { expected, actual } => write!(
                formatter,
                "subtask parent list changed before the edit committed: expected {expected}, actual {actual}"
            ),
            Self::ExpectedParentMismatch {
                subtask_id,
                expected,
                actual,
            } => write!(
                formatter,
                "subtask parent changed before the edit committed for {subtask_id}: expected {expected}, actual {actual}"
            ),
            Self::ExpectedTitleMismatch(id) => {
                write!(formatter, "subtask title changed before the edit committed: {id}")
            }
            Self::ExpectedCompletionMismatch(id) => write!(
                formatter,
                "subtask completion changed before the edit committed: {id}"
            ),
            Self::ExpectedUpdatedAtMismatch(id) => write!(
                formatter,
                "subtask changed before the destructive edit committed: {id}"
            ),
            Self::ExpectedOrderMismatch(id) => write!(
                formatter,
                "subtask order changed before the reorder committed for parent task: {id}"
            ),
            Self::StaleWrite(id) => write!(
                formatter,
                "subtask changed before the atomic board write committed: {id}"
            ),
        }
    }
}

impl std::error::Error for SubtaskBoardError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            Self::Subtask(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for SubtaskBoardError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<TaskStoreError> for SubtaskBoardError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<ListStoreError> for SubtaskBoardError {
    fn from(value: ListStoreError) -> Self {
        Self::List(value)
    }
}

impl From<SubtaskStoreError> for SubtaskBoardError {
    fn from(value: SubtaskStoreError) -> Self {
        Self::Subtask(value)
    }
}

fn validate_timestamp(value: &str) -> Result<(), SubtaskBoardError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| SubtaskStoreError::InvalidTimestamp.into())
}

fn normalize_title(value: &str) -> Result<String, SubtaskBoardError> {
    let title = value.trim();
    if title.is_empty() {
        return Err(SubtaskStoreError::InvalidTitle.into());
    }
    Ok(title.to_owned())
}

fn validate_parent_binding(
    conn: &Connection,
    task_id: TaskId,
    expected_list_id: ListId,
    mutable: bool,
) -> Result<(), SubtaskBoardError> {
    let task = get_task(conn, task_id)?;
    if task.list_id != expected_list_id {
        return Err(SubtaskBoardError::ExpectedListMismatch {
            expected: expected_list_id,
            actual: task.list_id,
        });
    }

    let list = get_list(conn, task.list_id)?;
    if mutable {
        if task.archived_at.is_some() {
            return Err(SubtaskStoreError::ParentTaskArchived(task_id).into());
        }
        if task.completed_at.is_some() {
            return Err(SubtaskStoreError::ParentTaskCompleted(task_id).into());
        }
        if list.archived_at.is_some() {
            return Err(SubtaskStoreError::ParentListArchived(task.list_id).into());
        }
    }
    Ok(())
}

fn validate_subtask_binding(
    conn: &Connection,
    subtask: &SubtaskRecord,
    expected_task_id: TaskId,
    expected_list_id: ListId,
    mutable: bool,
) -> Result<(), SubtaskBoardError> {
    if subtask.task_id != expected_task_id {
        return Err(SubtaskBoardError::ExpectedParentMismatch {
            subtask_id: subtask.id,
            expected: expected_task_id,
            actual: subtask.task_id,
        });
    }
    validate_parent_binding(conn, expected_task_id, expected_list_id, mutable)
}

fn current_order_ids(
    conn: &Connection,
    task_id: TaskId,
) -> Result<Vec<SubtaskId>, SubtaskBoardError> {
    Ok(subtasks_for_task(conn, task_id)?
        .into_iter()
        .map(|subtask| subtask.id)
        .collect())
}

fn validate_order_ids(ids: &[SubtaskId]) -> Result<HashSet<SubtaskId>, SubtaskBoardError> {
    let set: HashSet<SubtaskId> = ids.iter().copied().collect();
    if set.len() != ids.len() {
        return Err(SubtaskStoreError::DuplicateReorderId.into());
    }
    Ok(set)
}

fn rewrite_ranks(
    tx: &Transaction<'_>,
    task_id: TaskId,
    ordered: &[SubtaskId],
    now: &str,
) -> Result<(), SubtaskBoardError> {
    for (index, id) in ordered.iter().enumerate() {
        let rank = u32::try_from(index).map_err(|_| SubtaskStoreError::RankOverflow)?;
        let changed = tx.execute(
            "UPDATE subtasks
             SET sort_rank = ?1, updated_at = ?2
             WHERE id = ?3 AND task_id = ?4",
            params![i64::from(rank), now, id.to_string(), task_id.to_string()],
        )?;
        if changed != 1 {
            return Err(SubtaskStoreError::ReorderSetMismatch.into());
        }
    }
    Ok(())
}

pub fn board_subtasks_for_task(
    conn: &Connection,
    task_id: TaskId,
    expected_list_id: ListId,
) -> Result<Vec<SubtaskRecord>, SubtaskBoardError> {
    validate_parent_binding(conn, task_id, expected_list_id, false)?;
    Ok(subtasks_for_task(conn, task_id)?)
}

pub fn create_board_subtask(
    conn: &mut Connection,
    task_id: TaskId,
    expected_list_id: ListId,
    title: String,
    now: &str,
) -> Result<SubtaskRecord, SubtaskBoardError> {
    validate_timestamp(now)?;
    let title = normalize_title(&title)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    validate_parent_binding(&tx, task_id, expected_list_id, true)?;
    let existing = subtasks_for_task(&tx, task_id)?;
    let rank = match existing.last() {
        Some(last) => last
            .sort_rank
            .checked_add(1)
            .ok_or(SubtaskStoreError::RankOverflow)?,
        None => 0,
    };
    let id = SubtaskId::generate();
    tx.execute(
        "INSERT INTO subtasks (
            id, task_id, title, sort_rank, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?5)",
        params![
            id.to_string(),
            task_id.to_string(),
            title,
            i64::from(rank),
            now
        ],
    )?;
    let created = get_subtask(&tx, id)?;
    tx.commit()?;
    Ok(created)
}

pub fn update_board_subtask_title_if_expected(
    conn: &mut Connection,
    id: SubtaskId,
    expected_task_id: TaskId,
    expected_list_id: ListId,
    expected_title: &str,
    title: String,
    now: &str,
) -> Result<SubtaskRecord, SubtaskBoardError> {
    validate_timestamp(now)?;
    let title = normalize_title(&title)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = get_subtask(&tx, id)?;
    validate_subtask_binding(&tx, &current, expected_task_id, expected_list_id, true)?;
    if current.title != expected_title {
        return Err(SubtaskBoardError::ExpectedTitleMismatch(id));
    }
    if current.title == title {
        return Ok(current);
    }

    let changed = tx.execute(
        "UPDATE subtasks
         SET title = ?1, updated_at = ?2
         WHERE id = ?3 AND task_id = ?4 AND title = ?5",
        params![
            title,
            now,
            id.to_string(),
            expected_task_id.to_string(),
            expected_title
        ],
    )?;
    if changed != 1 {
        return Err(SubtaskBoardError::StaleWrite(id));
    }
    let updated = get_subtask(&tx, id)?;
    tx.commit()?;
    Ok(updated)
}

pub fn set_board_subtask_completion_if_expected(
    conn: &mut Connection,
    id: SubtaskId,
    expected_task_id: TaskId,
    expected_list_id: ListId,
    expected_completed_at: Option<&str>,
    completed: bool,
    now: &str,
) -> Result<SubtaskRecord, SubtaskBoardError> {
    validate_timestamp(now)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = get_subtask(&tx, id)?;
    validate_subtask_binding(&tx, &current, expected_task_id, expected_list_id, true)?;
    if current.completed_at.as_deref() != expected_completed_at {
        return Err(SubtaskBoardError::ExpectedCompletionMismatch(id));
    }
    if current.completed_at.is_some() == completed {
        return Ok(current);
    }

    let completed_at = completed.then(|| now.to_owned());
    let changed = tx.execute(
        "UPDATE subtasks
         SET completed_at = ?1, updated_at = ?2
         WHERE id = ?3 AND task_id = ?4",
        params![
            completed_at,
            now,
            id.to_string(),
            expected_task_id.to_string()
        ],
    )?;
    if changed != 1 {
        return Err(SubtaskBoardError::StaleWrite(id));
    }
    let updated = get_subtask(&tx, id)?;
    tx.commit()?;
    Ok(updated)
}

pub fn reorder_board_subtasks_if_expected(
    conn: &mut Connection,
    task_id: TaskId,
    expected_list_id: ListId,
    expected_order: &[SubtaskId],
    requested_order: &[SubtaskId],
    now: &str,
) -> Result<Vec<SubtaskRecord>, SubtaskBoardError> {
    validate_timestamp(now)?;
    let expected_set = validate_order_ids(expected_order)?;
    let requested_set = validate_order_ids(requested_order)?;
    if expected_order.len() != requested_order.len() || expected_set != requested_set {
        return Err(SubtaskStoreError::ReorderSetMismatch.into());
    }

    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    validate_parent_binding(&tx, task_id, expected_list_id, true)?;
    let current = current_order_ids(&tx, task_id)?;
    if current != expected_order {
        return Err(SubtaskBoardError::ExpectedOrderMismatch(task_id));
    }
    if current == requested_order {
        return Ok(subtasks_for_task(&tx, task_id)?);
    }

    rewrite_ranks(&tx, task_id, requested_order, now)?;
    let reordered = subtasks_for_task(&tx, task_id)?;
    tx.commit()?;
    Ok(reordered)
}

pub fn delete_board_subtask_if_expected(
    conn: &mut Connection,
    id: SubtaskId,
    expected_task_id: TaskId,
    expected_list_id: ListId,
    expected_updated_at: &str,
    now: &str,
) -> Result<(), SubtaskBoardError> {
    validate_timestamp(now)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let current = get_subtask(&tx, id)?;
    validate_subtask_binding(&tx, &current, expected_task_id, expected_list_id, true)?;
    if current.updated_at != expected_updated_at {
        return Err(SubtaskBoardError::ExpectedUpdatedAtMismatch(id));
    }

    let changed = tx.execute(
        "DELETE FROM subtasks
         WHERE id = ?1 AND task_id = ?2 AND updated_at = ?3",
        params![id.to_string(), expected_task_id.to_string(), expected_updated_at],
    )?;
    if changed != 1 {
        return Err(SubtaskBoardError::StaleWrite(id));
    }
    let remaining = current_order_ids(&tx, expected_task_id)?;
    rewrite_ranks(&tx, expected_task_id, &remaining, now)?;
    tx.commit()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::subtasks::{NewSubtaskInput, UpdateSubtaskInput};
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::subtasks::{complete_subtask, create_subtask, update_subtask};
    use crate::persistence::tasks::create_task;

    const T0: &str = "2026-09-10T09:00:00Z";
    const T1: &str = "2026-09-10T09:01:00Z";
    const T2: &str = "2026-09-10T09:02:00Z";

    fn setup() -> (Connection, ListId, TaskId) {
        let mut conn = Connection::open_in_memory().expect("open database");
        run_migrations(&mut conn).expect("migrate database");
        let list_id = create_list(
            &mut conn,
            NewListInput {
                title: "Work".into(),
                color: None,
                icon_asset: None,
            },
            T0,
        )
        .expect("create list")
        .id;
        let task_id = create_task(
            &mut conn,
            NewTaskInput {
                list_id,
                title: "Parent".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: Some(900),
            },
            T0,
        )
        .expect("create task")
        .id;
        (conn, list_id, task_id)
    }

    fn create(conn: &mut Connection, task_id: TaskId, title: &str) -> SubtaskRecord {
        create_subtask(
            conn,
            NewSubtaskInput {
                task_id,
                title: title.into(),
            },
            T0,
        )
        .expect("create subtask")
    }

    #[test]
    fn title_and_completion_guards_reject_stale_renderer_state_without_clobbering() {
        let (mut conn, list_id, task_id) = setup();
        let subtask = create(&mut conn, task_id, "Original");
        update_subtask(
            &mut conn,
            subtask.id,
            UpdateSubtaskInput {
                title: "Newer".into(),
            },
            T1,
        )
        .expect("authoritative title update");

        let stale_title = update_board_subtask_title_if_expected(
            &mut conn,
            subtask.id,
            task_id,
            list_id,
            "Original",
            "Stale overwrite".into(),
            T2,
        );
        assert!(matches!(
            stale_title,
            Err(SubtaskBoardError::ExpectedTitleMismatch(id)) if id == subtask.id
        ));
        assert_eq!(get_subtask(&conn, subtask.id).unwrap().title, "Newer");

        let completed = complete_subtask(&mut conn, subtask.id, T1).expect("complete subtask");
        let stale_completion = set_board_subtask_completion_if_expected(
            &mut conn,
            subtask.id,
            task_id,
            list_id,
            None,
            false,
            T2,
        );
        assert!(matches!(
            stale_completion,
            Err(SubtaskBoardError::ExpectedCompletionMismatch(id)) if id == subtask.id
        ));
        assert_eq!(
            get_subtask(&conn, subtask.id).unwrap().completed_at,
            completed.completed_at
        );
    }

    #[test]
    fn stale_reorder_and_stale_delete_do_not_partially_mutate_order() {
        let (mut conn, list_id, task_id) = setup();
        let first = create(&mut conn, task_id, "First");
        let second = create(&mut conn, task_id, "Second");
        let third = create(&mut conn, task_id, "Third");
        let original = vec![first.id, second.id, third.id];

        reorder_board_subtasks_if_expected(
            &mut conn,
            task_id,
            list_id,
            &original,
            &[third.id, second.id, first.id],
            T1,
        )
        .expect("authoritative reorder");

        let stale_reorder = reorder_board_subtasks_if_expected(
            &mut conn,
            task_id,
            list_id,
            &original,
            &[second.id, first.id, third.id],
            T2,
        );
        assert!(matches!(
            stale_reorder,
            Err(SubtaskBoardError::ExpectedOrderMismatch(id)) if id == task_id
        ));
        assert_eq!(
            current_order_ids(&conn, task_id).unwrap(),
            vec![third.id, second.id, first.id]
        );

        let newer = get_subtask(&conn, second.id).expect("load second");
        update_subtask(
            &mut conn,
            second.id,
            UpdateSubtaskInput {
                title: "Second updated".into(),
            },
            T2,
        )
        .expect("update second");
        let stale_delete = delete_board_subtask_if_expected(
            &mut conn,
            second.id,
            task_id,
            list_id,
            &newer.updated_at,
            T2,
        );
        assert!(matches!(
            stale_delete,
            Err(SubtaskBoardError::ExpectedUpdatedAtMismatch(id)) if id == second.id
        ));
        assert_eq!(
            current_order_ids(&conn, task_id).unwrap(),
            vec![third.id, second.id, first.id]
        );
    }
}
