use narro_lib::domain::ids::{ListId, TaskId};
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::notes::{
    NoteBlock, NoteDocument, NoteListItem, NoteTextRun, TASK_NOTE_FORMAT_VERSION,
};
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::{archive_list, create_list};
use narro_lib::persistence::notes::{
    delete_task_note, get_task_note, set_task_note, TaskNoteStoreError,
};
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::tasks::{archive_task, complete_task, create_task};
use rusqlite::{params, Connection};
use std::fs;
use uuid::Uuid;

const T1: &str = "2026-09-03T18:20:00Z";
const T2: &str = "2026-09-03T18:21:00Z";
const T3: &str = "2026-09-03T18:22:00Z";

fn create_test_list(conn: &mut Connection, title: &str) -> ListId {
    create_list(
        conn,
        NewListInput {
            title: title.into(),
            color: None,
            icon_asset: None,
        },
        T1,
    )
    .expect("create list")
    .id
}

fn create_test_task(conn: &mut Connection, list_id: ListId, title: &str) -> TaskId {
    create_task(
        conn,
        NewTaskInput {
            list_id,
            title: title.into(),
            manual_lane: PlanningLane::Today,
            est_seconds: Some(1800),
        },
        T1,
    )
    .expect("create task")
    .id
}

fn rich_document(label: &str) -> NoteDocument {
    NoteDocument {
        blocks: vec![
            NoteBlock::Paragraph {
                runs: vec![
                    NoteTextRun {
                        text: format!("{label} bold"),
                        bold: true,
                        italic: false,
                        strikethrough: false,
                        link: None,
                    },
                    NoteTextRun {
                        text: " docs".into(),
                        bold: false,
                        italic: true,
                        strikethrough: false,
                        link: Some("https://example.com/narro".into()),
                    },
                ],
            },
            NoteBlock::BulletList {
                items: vec![NoteListItem {
                    runs: vec![NoteTextRun {
                        text: "local only".into(),
                        bold: false,
                        italic: false,
                        strikethrough: true,
                        link: None,
                    }],
                }],
            },
            NoteBlock::NumberedList {
                items: vec![NoteListItem {
                    runs: vec![NoteTextRun {
                        text: "explicit links".into(),
                        bold: false,
                        italic: false,
                        strikethrough: false,
                        link: Some("HTTP://example.org/path".into()),
                    }],
                }],
            },
        ],
    }
}

#[test]
fn note_upsert_preserves_one_row_and_completed_task_history_remains_editable() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let list_id = create_test_list(&mut conn, "Inbox");
    let task_id = create_test_task(&mut conn, list_id, "Task");

    let first =
        set_task_note(&mut conn, task_id, rich_document("first"), T1).expect("save first note");
    assert_eq!(first.task_id, task_id);
    assert_eq!(first.editor_format_version, TASK_NOTE_FORMAT_VERSION);
    assert_eq!(first.updated_at, T1);

    complete_task(&mut conn, task_id, T2).expect("complete parent task");
    let second = set_task_note(&mut conn, task_id, rich_document("second"), T3)
        .expect("edit completed-task note");
    assert_eq!(second.task_id, task_id);
    assert_eq!(second.document, rich_document("second"));
    assert_eq!(second.updated_at, T3);

    let count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM task_notes WHERE task_id = ?1",
            [task_id.to_string()],
            |row| row.get(0),
        )
        .expect("count task note rows");
    assert_eq!(count, 1);
}

#[test]
fn invalid_link_is_rejected_before_existing_document_is_replaced() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let list_id = create_test_list(&mut conn, "Inbox");
    let task_id = create_test_task(&mut conn, list_id, "Task");
    let original = rich_document("original");
    set_task_note(&mut conn, task_id, original.clone(), T1).expect("save original note");

    let invalid = NoteDocument {
        blocks: vec![NoteBlock::Paragraph {
            runs: vec![NoteTextRun {
                text: "unsafe".into(),
                bold: false,
                italic: false,
                strikethrough: false,
                link: Some("javascript:alert(1)".into()),
            }],
        }],
    };
    let result = set_task_note(&mut conn, task_id, invalid, T2);
    assert!(matches!(result, Err(TaskNoteStoreError::InvalidLink(_))));
    assert_eq!(
        get_task_note(&conn, task_id)
            .expect("load original note")
            .expect("note still exists")
            .document,
        original
    );
}

#[test]
fn archived_task_or_list_blocks_note_mutation_but_keeps_note_readable() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");

    let archived_task_list = create_test_list(&mut conn, "Task archive");
    let archived_task_id = create_test_task(&mut conn, archived_task_list, "Archived task");
    set_task_note(&mut conn, archived_task_id, rich_document("task"), T1)
        .expect("save note before task archive");
    archive_task(&mut conn, archived_task_id, T2).expect("archive task");
    assert!(matches!(
        set_task_note(&mut conn, archived_task_id, rich_document("blocked"), T3),
        Err(TaskNoteStoreError::TaskArchived(id)) if id == archived_task_id
    ));
    assert!(get_task_note(&conn, archived_task_id)
        .expect("read archived task note")
        .is_some());

    let archived_list_id = create_test_list(&mut conn, "List archive");
    let list_task_id = create_test_task(&mut conn, archived_list_id, "List task");
    set_task_note(&mut conn, list_task_id, rich_document("list"), T1)
        .expect("save note before list archive");
    archive_list(&mut conn, archived_list_id, T2).expect("archive list");
    assert!(matches!(
        delete_task_note(&mut conn, list_task_id, T3),
        Err(TaskNoteStoreError::ListArchived(id)) if id == archived_list_id
    ));
    assert!(get_task_note(&conn, list_task_id)
        .expect("read archived list note")
        .is_some());
}

#[test]
fn note_document_and_format_version_survive_database_reopen() {
    let path = std::env::temp_dir().join(format!("narro-note-{}.db", Uuid::new_v4()));
    let task_id;
    let expected = rich_document("persistent");

    {
        let mut conn = Connection::open(&path).expect("open temporary database");
        run_migrations(&mut conn).expect("migrate temporary database");
        let list_id = create_test_list(&mut conn, "Inbox");
        task_id = create_test_task(&mut conn, list_id, "Persistent task");
        set_task_note(&mut conn, task_id, expected.clone(), T1).expect("save task note");
    }

    {
        let mut reopened = Connection::open(&path).expect("reopen temporary database");
        run_migrations(&mut reopened).expect("re-run migrations after reopen");
        let persisted = get_task_note(&reopened, task_id)
            .expect("load task note")
            .expect("persisted note exists");
        assert_eq!(persisted.task_id, task_id);
        assert_eq!(persisted.editor_format_version, TASK_NOTE_FORMAT_VERSION);
        assert_eq!(persisted.document, expected);
        assert_eq!(persisted.updated_at, T1);
    }

    fs::remove_file(path).expect("remove temporary database");
}

#[test]
fn unsupported_stored_format_version_is_explicitly_rejected() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let list_id = create_test_list(&mut conn, "Inbox");
    let task_id = create_test_task(&mut conn, list_id, "Task");
    let content = serde_json::to_string(&rich_document("future")).expect("serialize document");
    conn.execute(
        "INSERT INTO task_notes (task_id, editor_format_version, content, updated_at)
         VALUES (?1, 2, ?2, ?3)",
        params![task_id.to_string(), content, T1],
    )
    .expect("insert unsupported version fixture");

    assert!(matches!(
        get_task_note(&conn, task_id),
        Err(TaskNoteStoreError::UnsupportedFormatVersion(2))
    ));
}

#[test]
fn delete_note_is_idempotent_for_active_task() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let list_id = create_test_list(&mut conn, "Inbox");
    let task_id = create_test_task(&mut conn, list_id, "Task");
    set_task_note(&mut conn, task_id, rich_document("delete"), T1).expect("save note");

    assert!(delete_task_note(&mut conn, task_id, T2).expect("delete existing note"));
    assert!(!delete_task_note(&mut conn, task_id, T3).expect("delete missing note"));
    assert!(get_task_note(&conn, task_id)
        .expect("read deleted note")
        .is_none());
}
