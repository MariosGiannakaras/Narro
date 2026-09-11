use crate::domain::ids::{ListId, TaskId};
use crate::domain::notes::{NoteDocument, TaskNoteRecord};
use crate::error::{CommandError, CommandResult};
use crate::persistence;
use crate::persistence::lists::{get_list, ListStoreError};
use crate::persistence::note_board::{
    board_task_note, delete_board_task_note_if_expected, set_board_task_note_if_expected,
    NoteBoardError,
};
use crate::persistence::notes::TaskNoteStoreError;
use crate::persistence::tasks::{get_task, TaskStoreError};
use rusqlite::Connection;
use serde::Serialize;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardTaskNote {
    pub task_id: String,
    pub editor_format_version: u32,
    pub document: NoteDocument,
    pub updated_at: String,
}

impl From<TaskNoteRecord> for BoardTaskNote {
    fn from(value: TaskNoteRecord) -> Self {
        Self {
            task_id: value.task_id.to_string(),
            editor_format_version: value.editor_format_version,
            document: value.document,
            updated_at: value.updated_at,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardTaskNoteSnapshot {
    pub task_id: String,
    pub list_id: String,
    pub mutable: bool,
    pub note: Option<BoardTaskNote>,
}

fn app_database(app_handle: &tauri::AppHandle) -> CommandResult<Connection> {
    let app_dir: PathBuf = app_handle.path().app_data_dir().map_err(|error| {
        CommandError::new(
            "NOTE_FAILED",
            format!("failed to resolve Narro app-data directory for task notes: {error}"),
        )
    })?;
    let connection = Connection::open(app_dir.join("narro.db")).map_err(|error| {
        CommandError::new(
            "NOTE_FAILED",
            format!("failed to open the Narro database for task notes: {error}"),
        )
    })?;
    persistence::configure_connection(&connection).map_err(|error| {
        CommandError::new(
            "NOTE_FAILED",
            format!("failed to configure the Narro database for task notes: {error}"),
        )
    })?;
    Ok(connection)
}

fn parse_task_id(argument: &str, raw: &str) -> CommandResult<TaskId> {
    TaskId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn parse_list_id(argument: &str, raw: &str) -> CommandResult<ListId> {
    ListId::parse_str(raw)
        .map_err(|_| CommandError::invalid_argument(argument, "must be a valid UUID"))
}

fn map_note_error(error: NoteBoardError) -> CommandError {
    match &error {
        NoteBoardError::ExpectedListMismatch { .. }
        | NoteBoardError::ExpectedUpdatedAtMismatch(_)
        | NoteBoardError::StaleWrite(_)
        | NoteBoardError::Task(TaskStoreError::NotFound(_))
        | NoteBoardError::Task(TaskStoreError::ListNotFound(_))
        | NoteBoardError::List(ListStoreError::NotFound(_))
        | NoteBoardError::Note(TaskNoteStoreError::Task(TaskStoreError::NotFound(_)))
        | NoteBoardError::Note(TaskNoteStoreError::Task(TaskStoreError::ListNotFound(_)))
        | NoteBoardError::Note(TaskNoteStoreError::List(ListStoreError::NotFound(_))) => {
            CommandError::new("NOTE_STALE", error.to_string())
        }
        NoteBoardError::Note(TaskNoteStoreError::TaskArchived(_))
        | NoteBoardError::Note(TaskNoteStoreError::ListArchived(_))
        | NoteBoardError::Task(TaskStoreError::ArchivedTask(_))
        | NoteBoardError::Task(TaskStoreError::ListArchived(_)) => {
            CommandError::new("NOTE_NOT_ALLOWED", error.to_string())
        }
        NoteBoardError::Note(TaskNoteStoreError::InvalidLink(_)) => {
            CommandError::invalid_argument("document", "links must use http or https")
        }
        NoteBoardError::Note(TaskNoteStoreError::DocumentTooLarge(_)) => {
            CommandError::invalid_argument("document", "exceeds the supported task-note limits")
        }
        _ => CommandError::new("NOTE_FAILED", error.to_string()),
    }
}

fn snapshot(
    connection: &Connection,
    task_id: TaskId,
    list_id: ListId,
) -> Result<BoardTaskNoteSnapshot, NoteBoardError> {
    let note = board_task_note(connection, task_id, list_id)?;
    let task = get_task(connection, task_id)?;
    let list = get_list(connection, list_id)?;
    Ok(BoardTaskNoteSnapshot {
        task_id: task_id.to_string(),
        list_id: list_id.to_string(),
        mutable: task.archived_at.is_none() && list.archived_at.is_none(),
        note: note.map(BoardTaskNote::from),
    })
}

#[tauri::command(rename_all = "camelCase")]
pub fn get_list_board_task_note(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
) -> CommandResult<BoardTaskNoteSnapshot> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let connection = app_database(&app_handle)?;
    snapshot(&connection, task_id, list_id).map_err(map_note_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn save_list_board_task_note(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
    expected_updated_at: Option<String>,
    document: NoteDocument,
) -> CommandResult<BoardTaskNote> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let mut connection = app_database(&app_handle)?;
    set_board_task_note_if_expected(
        &mut connection,
        task_id,
        list_id,
        expected_updated_at.as_deref(),
        document,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map(BoardTaskNote::from)
    .map_err(map_note_error)
}

#[tauri::command(rename_all = "camelCase")]
pub fn delete_list_board_task_note(
    app_handle: tauri::AppHandle,
    task_id: String,
    list_id: String,
    expected_updated_at: String,
) -> CommandResult<()> {
    let task_id = parse_task_id("taskId", &task_id)?;
    let list_id = parse_list_id("listId", &list_id)?;
    let mut connection = app_database(&app_handle)?;
    delete_board_task_note_if_expected(
        &mut connection,
        task_id,
        list_id,
        &expected_updated_at,
        &chrono::Utc::now().to_rfc3339(),
    )
    .map_err(map_note_error)
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

    const T0: &str = "2026-09-11T07:00:00Z";
    const T1: &str = "2026-09-11T07:01:00Z";

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
                title: "Task".into(),
                manual_lane: PlanningLane::Today,
                est_seconds: None,
            },
            T0,
        )
        .expect("create task")
        .id;
        (connection, list_id, task_id)
    }

    fn document() -> NoteDocument {
        NoteDocument {
            blocks: vec![NoteBlock::Paragraph {
                runs: vec![NoteTextRun {
                    text: "Notes".into(),
                    bold: false,
                    italic: true,
                    strikethrough: false,
                    link: Some("https://example.com".into()),
                }],
            }],
        }
    }

    #[test]
    fn completed_task_snapshot_stays_mutable_for_notes() {
        let (mut connection, list_id, task_id) = setup();
        set_board_task_note_if_expected(
            &mut connection,
            task_id,
            list_id,
            None,
            document(),
            T0,
        )
        .expect("create note");
        complete_task(&mut connection, task_id, T1).expect("complete task");
        let read = snapshot(&connection, task_id, list_id).expect("read completed note");
        assert!(read.mutable);
        assert_eq!(read.note.expect("note").task_id, task_id.to_string());
    }

    #[test]
    fn stale_error_maps_to_stable_note_code() {
        let error = map_note_error(NoteBoardError::ExpectedUpdatedAtMismatch(TaskId::generate()));
        assert_eq!(error.code, "NOTE_STALE");
    }
}
