use narro_lib::domain::ids::{ListId, TaskId};
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::sessions::SessionKind;
use narro_lib::domain::tasks::NewTaskInput;
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::sessions::{get_open_session, sessions_for_task};
use narro_lib::persistence::task_metadata::task_time_taken_seconds;
use narro_lib::persistence::tasks::create_task;
use narro_lib::timer::runtime::TimerRuntime;
use narro_lib::timer::{TimerMode, TimerStateKind};
use rusqlite::Connection;

const T0: &str = "2026-09-05T10:00:00Z";
const T5: &str = "2026-09-05T10:05:00Z";
const T7: &str = "2026-09-05T10:07:00Z";
const T15: &str = "2026-09-05T10:15:00Z";
const T20: &str = "2026-09-05T10:20:00Z";
const T23: &str = "2026-09-05T10:23:00Z";
const T25: &str = "2026-09-05T10:25:00Z";
const T30: &str = "2026-09-05T10:30:00Z";
const T40: &str = "2026-09-05T10:40:00Z";

fn fixture() -> (Connection, ListId) {
    let mut conn = Connection::open_in_memory().expect("open database");
    run_migrations(&mut conn).expect("migrate database");
    let list = create_list(
        &mut conn,
        NewListInput {
            title: "Inbox".into(),
            color: None,
            icon_asset: None,
        },
        T0,
    )
    .expect("create list");
    (conn, list.id)
}

fn task(conn: &mut Connection, list_id: ListId, title: &str) -> TaskId {
    create_task(
        conn,
        NewTaskInput {
            list_id,
            title: title.into(),
            manual_lane: PlanningLane::Today,
            est_seconds: Some(1_800),
        },
        T0,
    )
    .expect("create task")
    .id
}

#[test]
fn repeated_pause_cycles_with_recovery_persist_exactly_thirty_minutes() {
    let (mut conn, list_id) = fixture();
    let task_id = task(&mut conn, list_id, "Thirty minute recovery");
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, task_id, TimerMode::CountUp, 0, T0)
        .unwrap();

    runtime.pause(&mut conn, 900_000, T15).unwrap();
    let mut recovered = TimerRuntime::recover(&mut conn, 0, T20).unwrap();
    assert_eq!(
        recovered.snapshot(0).unwrap().timer.state,
        TimerStateKind::Paused
    );

    recovered.resume(&mut conn, 0, T20).unwrap();
    recovered.pause(&mut conn, 300_000, T25).unwrap();
    let waited = recovered.advance(&mut conn, 600_000, T30).unwrap();
    assert_eq!(waited.timer.work_elapsed_ms, 1_200_000);
    recovered.resume(&mut conn, 600_000, T30).unwrap();

    let completed = recovered
        .complete_task(&mut conn, 1_200_000, T40)
        .unwrap();
    assert_eq!(completed.timer.work_elapsed_ms, 1_800_000);
    assert_eq!(completed.closed_session.duration_seconds, 1_800);
    assert_eq!(task_time_taken_seconds(&conn, task_id).unwrap(), 1_800);
    assert!(get_open_session(&conn).unwrap().is_none());
}

#[test]
fn restart_after_task_switch_recovers_only_the_new_task_session() {
    let (mut conn, list_id) = fixture();
    let first = task(&mut conn, list_id, "Before switch");
    let second = task(&mut conn, list_id, "After switch");
    let mut runtime = TimerRuntime::new();
    runtime
        .start_task(&mut conn, first, TimerMode::CountUp, 0, T0)
        .unwrap();

    let switched = runtime
        .switch_task(&mut conn, second, TimerMode::CountUp, 300_000, T5)
        .unwrap();
    assert_eq!(switched.previous_session.duration_seconds, 300);
    let second_session = switched.current_session.id;
    runtime.checkpoint(&mut conn, 420_000, T7).unwrap();

    let mut recovered = TimerRuntime::recover(&mut conn, 0, T20).unwrap();
    let snapshot = recovered.snapshot(0).unwrap();
    assert_eq!(snapshot.timer.state, TimerStateKind::Paused);
    assert_eq!(snapshot.timer.task_id, Some(second));
    assert_eq!(snapshot.timer.work_elapsed_ms, 120_000);
    assert_eq!(snapshot.open_session_id, Some(second_session));

    let open = get_open_session(&conn).unwrap().unwrap();
    assert_eq!(open.id, second_session);
    assert_eq!(open.task_id, Some(second));
    assert_eq!(open.kind, SessionKind::Work);
    assert_eq!(open.duration_seconds, 120);
    let open_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM sessions WHERE ended_at IS NULL",
            [],
            |row| row.get(0),
        )
        .unwrap();
    assert_eq!(open_count, 1);

    let first_sessions = sessions_for_task(&conn, first).unwrap();
    assert_eq!(first_sessions.len(), 1);
    assert_eq!(first_sessions[0].duration_seconds, 300);
    assert!(!first_sessions[0].is_open());

    recovered.resume(&mut conn, 0, T20).unwrap();
    let completed = recovered
        .complete_task(&mut conn, 180_000, T23)
        .unwrap();
    assert_eq!(completed.timer.task_id, second);
    assert_eq!(completed.timer.work_elapsed_ms, 300_000);
    assert_eq!(completed.closed_session.id, second_session);
    assert_eq!(completed.closed_session.duration_seconds, 300);
    assert_eq!(task_time_taken_seconds(&conn, first).unwrap(), 300);
    assert_eq!(task_time_taken_seconds(&conn, second).unwrap(), 300);
    assert!(get_open_session(&conn).unwrap().is_none());
}
