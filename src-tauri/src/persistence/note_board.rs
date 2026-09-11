use crate::domain::ids::{ListId, TaskId};
use crate::domain::notes::{NoteDocument, TaskNoteRecord, TASK_NOTE_FORMAT_VERSION};
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::notes::{get_task_note, validate_note_document, TaskNoteStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use chrono::DateTime;
use rusqlite::{params, Connection, TransactionBehavior};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum NoteBoardError {
    Sqlite(rusqlite::Error),
    Json(serde_json::Error),
    Task(TaskStoreError),
    List(ListStoreError),
    Note(TaskNoteStoreError),
    ExpectedListMismatch { expected: ListId, actual: ListId },
    ExpectedUpdatedAtMismatch(TaskId),
    StaleWrite(TaskId),
}

impl Display for NoteBoardError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "board task-note persistence failed: {error}"),
            Self::Json(error) => write!(formatter, "board task-note document JSON is invalid: {error}"),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::List(error) => Display::fmt(error, formatter),
            Self::Note(error) => Display::fmt(error, formatter),
            Self::ExpectedListMismatch { expected, actual } => write!(
                formatter,
                "task note parent list changed before the edit committed: expected {expected}, actual {actual}"
            ),
            Self::ExpectedUpdatedAtMismatch(id) => write!(
                formatter,
                "task note changed before the edit committed for task: {id}"
            ),
            Self::StaleWrite(id) => write!(
                formatter,
                "task note changed before the atomic board write committed for task: {id}"
            ),
        }
    }
}

impl std::error::Error for NoteBoardError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Json(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            Self::Note(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for NoteBoardError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<serde_json::Error> for NoteBoardError {
    fn from(value: serde_json::Error) -> Self {
        Self::Json(value)
    }
}

impl From<TaskStoreError> for NoteBoardError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<ListStoreError> for NoteBoardError {
    fn from(value: ListStoreError) -> Self {
        Self::List(value)
    }
}

impl From<TaskNoteStoreError> for NoteBoardError {
    fn from(value: TaskNoteStoreError) -> Self {
        Self::Note(value)
    }
}

fn validate_timestamp(value: &str) -> Result<(), NoteBoardError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| NoteBoardError::Note(TaskNoteStoreError::InvalidTimestamp))
}

fn validate_parent_binding(
    conn: &Connection,
    task_id: TaskId,
    expected_list_id: ListId,
    mutable: bool,
) -> Result<(), NoteBoardError> {
    let task = get_task(conn, task_id)?;
    if task.list_id != expected_list_id {
        return Err(NoteBoardError::ExpectedListMismatch {
            expected: expected_list_id,
            actual: task.list_id,
        });
    }
    let list = get_list(conn, task.list_id)?;
    if mutable {
        if task.archived_at.is_some() {
            return Err(NoteBoardError::Note(TaskNoteStoreError::TaskArchived(task_id)));
        }
        if list.archived_at.is_some() {
            return Err(NoteBoardError::Note(TaskNoteStoreError::ListArchived(
                task.list_id,
            )));
        }
    }
    Ok(())
}

fn validate_expected_version(
    task_id: TaskId,
    current: Option<&TaskNoteRecord>,
    expected_updated_at: Option<&str>,
) -> Result<(), NoteBoardError> {
    if current.map(|note| note.updated_at.as_str()) != expected_updated_at {
        return Err(NoteBoardError::ExpectedUpdatedAtMismatch(task_id));
    }
    Ok(())
}

pub fn board_task_note(
    conn: &Connection,
    task_id: TaskId,
    expected_list_id: ListId,
) -> Result<Option<TaskNoteRecord>, NoteBoardError> {
    validate_parent_binding(conn, task_id, expected_list_id, false)?;
    Ok(get_task_note(conn, task_id)?)
}

pub fn set_board_task_note_if_expected(
    conn: &mut Connection,
    task_id: TaskId,
    expected_list_id: ListId,
    expected_updated_at: Option<&str>,
    document: NoteDocument,
    now: &str,
) -> Result<TaskNoteRecord, NoteBoardError> {
    validate_timestamp(now)?;
    validate_note_document(&document)?;
    let content = serde_json::to_string(&document)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    validate_parent_binding(&tx, task_id, expected_list_id, true)?;
    let current = get_task_note(&tx, task_id)?;
    validate_expected_version(task_id, current.as_ref(), expected_updated_at)?;

    let changed = match expected_updated_at {
        Some(expected) => tx.execute(
            "UPDATE task_notes
             SET editor_format_version = ?1, content = ?2, updated_at = ?3
             WHERE task_id = ?4 AND updated_at = ?5",
            params![
                i64::from(TASK_NOTE_FORMAT_VERSION),
                content,
                now,
                task_id.to_string(),
                expected
            ],
        )?,
        None => tx.execute(
            "INSERT INTO task_notes (task_id, editor_format_version, content, updated_at)
             VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(task_id) DO NOTHING",
            params![
                task_id.to_string(),
                i64::from(TASK_NOTE_FORMAT_VERSION),
                content,
                now
            ],
        )?,
    };
    if changed != 1 {
        return Err(NoteBoardError::StaleWrite(task_id));
    }
    let saved = get_task_note(&tx, task_id)?
        .ok_or(NoteBoardError::Note(TaskNoteStoreError::MissingAfterUpsert(task_id)))?;
    tx.commit()?;
    Ok(saved)
}

pub fn delete_board_task_note_if_expected(
    conn: &mut Connection,
    task_id: TaskId,
    expected_list_id: ListId,
    expected_updated_at: &str,
    now: &str,
) -> Result<(), NoteBoardError> {
    validate_timestamp(now)?;
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    validate_parent_binding(&tx, task_id, expected_list_id, true)?;
    let current = get_task_note(&tx, task_id)?;
    validate_expected_version(task_id, current.as_ref(), Some(expected_updated_at))?;
    let changed = tx.execute(
        "DELETE FROM task_notes WHERE task_id = ?1 AND updated_at = ?2",
        params![task_id.to_string(), expected_updated_at],
    )?;
    if changed != 1 {
        return Err(NoteBoardError::StaleWrite(task_id));
    }
    tx.commit()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::lists::NewListInput;
    use crate::domain::model::PlanningLane;
    use crate::domain::notes::{NoteBlock, NoteTextRun};
    use crate::domain::tasks::NewTaskInput;
    use crate::persistence::lists::create_list;
    use crate::persistence::run_migrations;
    use crate::persistence::tasks::{complete_task, create_task};

    const T0: &str = "2026-09-11T06:00:00Z";
    const T1: &str = "2026-09-11T06:01:00Z";
    const T2: &str = "2026-09-11T06:02:00Z";

    fn document(label: &str) -> NoteDocument {
        NoteDocument {
            blocks: vec![NoteBlock::Paragraph {
                runs: vec![NoteTextRun {
                    text: label.into(),
                    bold: true,
                    italic: false,
                    strikethrough: false,
                    link: Some("https://example.com/narro".into()),
                }],
            }],
        }
    }

    fn setup() -> (Connection, ListId, TaskId) {
        let mut connection = Connection::open_in_memory().expect("open database");
        run_migrations(&mut connection).expect("migrate database");
        let list_id = create_list(
            &mut connection,
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
            &mut connection,
            NewTaskInput {
                list_id,
                title: "Parent".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            T0,
        )
        .expect("create task")
        .id;
        (connection, list_id, task_id)
    }

    #[test]
    fn stale_save_does_not_clobber_newer_note() {
        let (mut connection, list_id, task_id) = setup();
        let first = set_board_task_note_if_expected(
            &mut connection,
            task_id,
            list_id,
            None,
            document("first"),
            T0,
        )
        .expect("create note");
        let second = set_board_task_note_if_expected(
            &mut connection,
            task_id,
            list_id,
            Some(&first.updated_at),
            document("second"),
            T1,
        )
        .expect("replace note");

        let stale = set_board_task_note_if_expected(
            &mut connection,
            task_id,
            list_id,
            Some(&first.updated_at),
            document("stale"),
            T2,
        );
        assert!(matches!(stale, Err(NoteBoardError::ExpectedUpdatedAtMismatch(id)) if id == task_id));
        assert_eq!(
            board_task_note(&connection, task_id, list_id)
                .expect("read note")
                .expect("note exists")
                .updated_at,
            second.updated_at
        );
    }

    #[test]
    fn create_only_guard_rejects_concurrent_existing_note() {
        let (mut connection, list_id, task_id) = setup();
        set_board_task_note_if_expected(
            &mut connection,
            task_id,
            list_id,
            None,
            document("existing"),
            T0,
        )
        .expect("create note");
        let stale = set_board_task_note_if_expected(
            &mut connection,
            task_id,
            list_id,
            None,
            document("clobber"),
            T1,
        );
        assert!(matches!(stale, Err(NoteBoardError::ExpectedUpdatedAtMismatch(id)) if id == task_id));
    }

    #[test]
    fn completed_task_note_remains_mutable_but_stale_delete_is_rejected() {
        let (mut connection, list_id, task_id) = setup();
        let first = set_board_task_note_if_expected(
            &mut connection,
            task_id,
            list_id,
            None,
            document("first"),
            T0,
        )
        .expect("create note");
        complete_task(&mut connection, task_id, T1).expect("complete task");
        let second = set_board_task_note_if_expected(
            &mut connection,
            task_id,
            list_id,
            Some(&first.updated_at),
            document("completed edit"),
            T2,
        )
        .expect("edit completed task note");
        let stale_delete = delete_board_task_note_if_expected(
            &mut connection,
            task_id,
            list_id,
            &first.updated_at,
            T2,
        );
        assert!(matches!(stale_delete, Err(NoteBoardError::ExpectedUpdatedAtMismatch(id)) if id == task_id));
        assert_eq!(
            board_task_note(&connection, task_id, list_id)
                .expect("read note")
                .expect("note exists")
                .updated_at,
            second.updated_at
        );
    }
}
