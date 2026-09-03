use crate::domain::ids::{ListId, TaskId};
use crate::domain::notes::{
    NoteBlock, NoteDocument, NoteTextRun, TaskNoteRecord, TASK_NOTE_FORMAT_VERSION,
};
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::tasks::{get_task, TaskStoreError};
use chrono::DateTime;
use rusqlite::{params, Connection, OptionalExtension};
use std::fmt::{Display, Formatter};

#[derive(Debug)]
pub enum TaskNoteStoreError {
    Sqlite(rusqlite::Error),
    Json(serde_json::Error),
    Task(TaskStoreError),
    List(ListStoreError),
    InvalidTimestamp,
    TaskArchived(TaskId),
    ListArchived(ListId),
    UnsupportedFormatVersion(u32),
    InvalidStoredFormatVersion(i64),
    InvalidLink(String),
}

impl Display for TaskNoteStoreError {
    fn fmt(&self, formatter: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Sqlite(error) => write!(formatter, "task-note persistence failed: {error}"),
            Self::Json(error) => write!(formatter, "task-note document JSON is invalid: {error}"),
            Self::Task(error) => Display::fmt(error, formatter),
            Self::List(error) => Display::fmt(error, formatter),
            Self::InvalidTimestamp => {
                formatter.write_str("task-note mutation timestamp must be RFC 3339")
            }
            Self::TaskArchived(id) => write!(formatter, "task note is immutable for archived task: {id}"),
            Self::ListArchived(id) => write!(formatter, "task note is immutable for archived list: {id}"),
            Self::UnsupportedFormatVersion(version) => {
                write!(formatter, "unsupported task-note format version: {version}")
            }
            Self::InvalidStoredFormatVersion(version) => {
                write!(formatter, "stored task-note format version is invalid: {version}")
            }
            Self::InvalidLink(link) => write!(formatter, "task-note link must use http or https: {link}"),
        }
    }
}

impl std::error::Error for TaskNoteStoreError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Json(error) => Some(error),
            Self::Task(error) => Some(error),
            Self::List(error) => Some(error),
            _ => None,
        }
    }
}

impl From<rusqlite::Error> for TaskNoteStoreError {
    fn from(value: rusqlite::Error) -> Self {
        Self::Sqlite(value)
    }
}

impl From<serde_json::Error> for TaskNoteStoreError {
    fn from(value: serde_json::Error) -> Self {
        Self::Json(value)
    }
}

impl From<TaskStoreError> for TaskNoteStoreError {
    fn from(value: TaskStoreError) -> Self {
        Self::Task(value)
    }
}

impl From<ListStoreError> for TaskNoteStoreError {
    fn from(value: ListStoreError) -> Self {
        Self::List(value)
    }
}

fn validate_timestamp(value: &str) -> Result<(), TaskNoteStoreError> {
    DateTime::parse_from_rfc3339(value)
        .map(|_| ())
        .map_err(|_| TaskNoteStoreError::InvalidTimestamp)
}

fn validate_mutable_task(conn: &Connection, task_id: TaskId) -> Result<(), TaskNoteStoreError> {
    let task = get_task(conn, task_id)?;
    if task.archived_at.is_some() {
        return Err(TaskNoteStoreError::TaskArchived(task_id));
    }
    let list = get_list(conn, task.list_id)?;
    if list.archived_at.is_some() {
        return Err(TaskNoteStoreError::ListArchived(task.list_id));
    }
    Ok(())
}

fn validate_link(value: &str) -> Result<(), TaskNoteStoreError> {
    if value.is_empty() || value.chars().any(char::is_control) {
        return Err(TaskNoteStoreError::InvalidLink(value.to_owned()));
    }
    let lower = value.to_ascii_lowercase();
    if !(lower.starts_with("http://") || lower.starts_with("https://")) {
        return Err(TaskNoteStoreError::InvalidLink(value.to_owned()));
    }
    Ok(())
}

fn validate_run(run: &NoteTextRun) -> Result<(), TaskNoteStoreError> {
    if let Some(link) = &run.link {
        validate_link(link)?;
    }
    Ok(())
}

pub fn validate_note_document(document: &NoteDocument) -> Result<(), TaskNoteStoreError> {
    for block in &document.blocks {
        match block {
            NoteBlock::Paragraph { runs } => {
                for run in runs {
                    validate_run(run)?;
                }
            }
            NoteBlock::BulletList { items } | NoteBlock::NumberedList { items } => {
                for item in items {
                    for run in &item.runs {
                        validate_run(run)?;
                    }
                }
            }
        }
    }
    Ok(())
}

fn decode_note(
    task_id: TaskId,
    editor_format_version: i64,
    content: String,
    updated_at: String,
) -> Result<TaskNoteRecord, TaskNoteStoreError> {
    let version = u32::try_from(editor_format_version)
        .map_err(|_| TaskNoteStoreError::InvalidStoredFormatVersion(editor_format_version))?;
    if version != TASK_NOTE_FORMAT_VERSION {
        return Err(TaskNoteStoreError::UnsupportedFormatVersion(version));
    }
    let document: NoteDocument = serde_json::from_str(&content)?;
    validate_note_document(&document)?;
    Ok(TaskNoteRecord {
        task_id,
        editor_format_version: version,
        document,
        updated_at,
    })
}

pub fn get_task_note(
    conn: &Connection,
    task_id: TaskId,
) -> Result<Option<TaskNoteRecord>, TaskNoteStoreError> {
    get_task(conn, task_id)?;
    let raw: Option<(i64, String, String)> = conn
        .query_row(
            "SELECT editor_format_version, content, updated_at
             FROM task_notes
             WHERE task_id = ?1",
            [task_id.to_string()],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .optional()?;

    raw.map(|(version, content, updated_at)| decode_note(task_id, version, content, updated_at))
        .transpose()
}

pub fn set_task_note(
    conn: &mut Connection,
    task_id: TaskId,
    document: NoteDocument,
    now: &str,
) -> Result<TaskNoteRecord, TaskNoteStoreError> {
    validate_timestamp(now)?;
    validate_note_document(&document)?;
    let content = serde_json::to_string(&document)?;
    let tx = conn.transaction()?;
    validate_mutable_task(&tx, task_id)?;
    tx.execute(
        "INSERT INTO task_notes (task_id, editor_format_version, content, updated_at)
         VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(task_id) DO UPDATE SET
            editor_format_version = excluded.editor_format_version,
            content = excluded.content,
            updated_at = excluded.updated_at",
        params![
            task_id.to_string(),
            i64::from(TASK_NOTE_FORMAT_VERSION),
            content,
            now
        ],
    )?;
    let saved = get_task_note(&tx, task_id)?.ok_or_else(|| {
        TaskNoteStoreError::Json(serde_json::Error::io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "task note disappeared after upsert",
        )))
    })?;
    tx.commit()?;
    Ok(saved)
}

pub fn delete_task_note(
    conn: &mut Connection,
    task_id: TaskId,
    now: &str,
) -> Result<bool, TaskNoteStoreError> {
    validate_timestamp(now)?;
    let tx = conn.transaction()?;
    validate_mutable_task(&tx, task_id)?;
    let changed = tx.execute(
        "DELETE FROM task_notes WHERE task_id = ?1",
        [task_id.to_string()],
    )?;
    tx.commit()?;
    Ok(changed == 1)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::notes::{NoteBlock, NoteDocument, NoteTextRun};

    fn linked(link: &str) -> NoteDocument {
        NoteDocument {
            blocks: vec![NoteBlock::Paragraph {
                runs: vec![NoteTextRun {
                    text: "link".into(),
                    bold: false,
                    italic: false,
                    strikethrough: false,
                    link: Some(link.into()),
                }],
            }],
        }
    }

    #[test]
    fn explicit_http_and_https_links_are_allowed() {
        validate_note_document(&linked("https://example.com/path")).expect("https link");
        validate_note_document(&linked("HTTP://example.com")).expect("http link");
    }

    #[test]
    fn executable_or_implicit_schemes_are_rejected() {
        for link in ["javascript:alert(1)", "file:///C:/secret.txt", "example.com"] {
            assert!(matches!(
                validate_note_document(&linked(link)),
                Err(TaskNoteStoreError::InvalidLink(_))
            ));
        }
    }
}
