use narro_lib::domain::ids::{SessionId, TaskId};
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::sessions::SessionKind;
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::sessions::{
    checkpoint_open_session, close_session, get_open_session, get_session,
    open_focus_break_session, open_focus_work_session,
};
use narro_lib::persistence::task_metadata::task_time_taken_seconds;
use narro_lib::persistence::tasks::create_task;
use rusqlite::{params, Connection};
use std::fs;
use uuid::Uuid;

const T0: &str = "2026-09-04T12:00:00Z";
const T1: &str = "2026-09-04T12:01:00Z";
const T2: &str = "2026-09-04T12:02:00Z";
const T3: &str = "2026-09-04T12:03:00Z";

fn create_task_fixture(conn: &mut Connection) -> TaskId {
    let list = create_list(
        conn,
        NewListInput {
            title: "Inbox".into(),
            color: None,
            icon_asset: None,
        },
        T0,
    )
    .expect("create list");
    create_task(
        conn,
        NewTaskInput {
            list_id: list.id,
            title: "Persisted focus task".into(),
            manual_lane: PlanningLane::Today,
            est_seconds: Some(900),
        },
        T0,
    )
    .expect("create task")
    .id
}

#[test]
fn open_session_checkpoint_survives_database_reopen_and_can_close_after_restart() {
    let path = std::env::temp_dir().join(format!("narro-session-reopen-{}.db", Uuid::new_v4()));
    let session_id;
    let task_id;

    {
        let mut conn = Connection::open(&path).expect("open temporary database");
        run_migrations(&mut conn).expect("migrate temporary database");
        task_id = create_task_fixture(&mut conn);
        let opened = open_focus_work_session(&mut conn, task_id, T0).expect("open work session");
        session_id = opened.id;
        checkpoint_open_session(&mut conn, session_id, 42, T1).expect("checkpoint work session");
    }

    {
        let mut reopened = Connection::open(&path).expect("reopen temporary database");
        run_migrations(&mut reopened).expect("re-run migrations after reopen");
        let unfinished = get_open_session(&reopened)
            .expect("load open session")
            .expect("open session should survive restart");
        assert_eq!(unfinished.id, session_id);
        assert_eq!(unfinished.task_id, Some(task_id));
        assert_eq!(unfinished.duration_seconds, 42);

        let closed = close_session(&mut reopened, session_id, 75, T2).expect("close after restart");
        assert_eq!(closed.duration_seconds, 75);
        assert_eq!(closed.ended_at.as_deref(), Some(T2));
        assert!(get_open_session(&reopened).unwrap().is_none());
    }

    {
        let mut reopened = Connection::open(&path).expect("reopen closed-session database");
        run_migrations(&mut reopened).expect("migrate closed-session database");
        let persisted = get_session(&reopened, session_id).expect("load closed session");
        assert_eq!(persisted.duration_seconds, 75);
        assert_eq!(persisted.ended_at.as_deref(), Some(T2));
    }

    fs::remove_file(path).expect("remove temporary database");
}

#[test]
fn work_and_break_rows_remain_distinct_and_only_work_contributes_to_time_taken() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let task_id = create_task_fixture(&mut conn);

    let work = open_focus_work_session(&mut conn, task_id, T0).expect("open work session");
    close_session(&mut conn, work.id, 120, T1).expect("close work session");
    let break_session =
        open_focus_break_session(&mut conn, Some(task_id), T1).expect("open break session");
    close_session(&mut conn, break_session.id, 600, T2).expect("close break session");

    assert_eq!(get_session(&conn, work.id).unwrap().kind, SessionKind::Work);
    assert_eq!(
        get_session(&conn, break_session.id).unwrap().kind,
        SessionKind::Break
    );
    assert_eq!(
        task_time_taken_seconds(&conn, task_id).expect("calculate Time Taken"),
        120
    );
}

#[test]
fn database_constraint_rejects_a_second_open_session_even_outside_store_api() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let task_id = create_task_fixture(&mut conn);
    let open = open_focus_work_session(&mut conn, task_id, T0).expect("open work session");

    let raw_second_id = SessionId::from_uuid(Uuid::from_u128(0x2222));
    let result = conn.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, 'break', ?3, NULL, 0, 'focus', ?3, ?3)",
        params![raw_second_id.to_string(), task_id.to_string(), T1],
    );
    assert!(
        result.is_err(),
        "database must reject a second unfinished session"
    );

    let still_open = get_open_session(&conn)
        .expect("read open session")
        .expect("original session remains open");
    assert_eq!(still_open.id, open.id);
}

#[test]
fn closed_history_does_not_block_a_later_open_session() {
    let mut conn = Connection::open_in_memory().expect("open in-memory database");
    run_migrations(&mut conn).expect("migrate database");
    let task_id = create_task_fixture(&mut conn);

    let first = open_focus_work_session(&mut conn, task_id, T0).unwrap();
    close_session(&mut conn, first.id, 60, T1).unwrap();
    let second = open_focus_work_session(&mut conn, task_id, T2).unwrap();
    assert_ne!(first.id, second.id);
    checkpoint_open_session(&mut conn, second.id, 30, T3).unwrap();

    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM sessions", [], |row| row.get(0))
        .expect("count session history");
    assert_eq!(count, 2);
}
