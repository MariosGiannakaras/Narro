use narro_lib::domain::ids::{ReminderId, SessionId, SubtaskId};
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::tasks::{
    archive_task, complete_task, create_task, get_task, permanently_delete_task, TaskStoreError,
};
use rusqlite::{params, Connection};

const T1: &str = "2026-09-03T20:00:00Z";
const T2: &str = "2026-09-03T20:10:00Z";
const T3: &str = "2026-09-03T20:11:00Z";

fn owned_row_count(conn: &Connection, table: &str, task_id: &str) -> i64 {
    let sql = match table {
        "subtasks" => "SELECT COUNT(*) FROM subtasks WHERE task_id = ?1",
        "task_notes" => "SELECT COUNT(*) FROM task_notes WHERE task_id = ?1",
        "reminders" => "SELECT COUNT(*) FROM reminders WHERE task_id = ?1",
        "sessions" => "SELECT COUNT(*) FROM sessions WHERE task_id = ?1",
        _ => panic!("unsupported task-owned table fixture: {table}"),
    };
    conn.query_row(sql, [task_id], |row| row.get(0))
        .expect("count task-owned rows")
}

#[test]
fn archive_preserves_history_but_permanent_delete_removes_reportable_task_history() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let list = create_list(
        &mut conn,
        NewListInput {
            title: "Inbox".into(),
            color: None,
            icon_asset: None,
        },
        T1,
    )
    .expect("create list");
    let task = create_task(
        &mut conn,
        NewTaskInput {
            list_id: list.id,
            title: "Historied task".into(),
            manual_lane: PlanningLane::Today,
            est_seconds: Some(1800),
        },
        T1,
    )
    .expect("create task");
    let task_id = task.id.to_string();

    conn.execute(
        "INSERT INTO subtasks (
            id, task_id, title, sort_rank, completed_at, created_at, updated_at
         ) VALUES (?1, ?2, 'Persisted subtask', 0, ?3, ?1, ?3)",
        params![SubtaskId::generate().to_string(), task_id, T2],
    )
    .expect("insert subtask history");
    conn.execute(
        "INSERT INTO task_notes (task_id, editor_format_version, content, updated_at)
         VALUES (?1, 1, '{\"blocks\":[]}', ?2)",
        params![task_id, T2],
    )
    .expect("insert task note history");
    conn.execute(
        "INSERT INTO reminders (
            id, task_id, remind_local_date, remind_local_time, timezone,
            fired_at, dismissed_at, created_at, updated_at
         ) VALUES (?1, ?2, '2026-09-03', '19:55', 'Europe/Athens', ?3, NULL, ?1, ?3)",
        params![ReminderId::generate().to_string(), task_id, T2],
    )
    .expect("insert reminder history");
    conn.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, 'work', ?3, ?4, 600, 'focus', ?3, ?4)",
        params![SessionId::generate().to_string(), task_id, T1, T2],
    )
    .expect("insert work-session history");

    complete_task(&mut conn, task.id, T2).expect("complete task");
    assert!(matches!(
        permanently_delete_task(&mut conn, task.id),
        Err(TaskStoreError::MustArchiveBeforePermanentDelete(id)) if id == task.id
    ));

    archive_task(&mut conn, task.id, T3).expect("archive completed task");
    let archived = get_task(&conn, task.id).expect("archived task remains readable");
    assert_eq!(archived.completed_at.as_deref(), Some(T2));
    assert_eq!(archived.archived_at.as_deref(), Some(T3));
    for table in ["subtasks", "task_notes", "reminders", "sessions"] {
        assert_eq!(
            owned_row_count(&conn, table, &task_id),
            1,
            "normal archive must preserve {table} history"
        );
    }

    permanently_delete_task(&mut conn, task.id).expect("permanently delete archived task");
    assert!(matches!(
        get_task(&conn, task.id),
        Err(TaskStoreError::NotFound(id)) if id == task.id
    ));
    for table in ["subtasks", "task_notes", "reminders", "sessions"] {
        assert_eq!(
            owned_row_count(&conn, table, &task_id),
            0,
            "permanent delete must remove {table} rows from reportable local history"
        );
    }

    let list_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM lists WHERE id = ?1",
            [list.id.to_string()],
            |row| row.get(0),
        )
        .expect("count owning list after task delete");
    assert_eq!(list_count, 1, "task deletion must not delete its list");
}
