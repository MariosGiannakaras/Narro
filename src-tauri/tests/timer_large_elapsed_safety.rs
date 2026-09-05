use narro_lib::domain::ids::{ListId, SessionId, TaskId};
use narro_lib::domain::lists::NewListInput;
use narro_lib::domain::model::PlanningLane;
use narro_lib::domain::sessions::SessionKind;
use narro_lib::domain::tasks::{NewTaskInput, SetTaskTimeTakenInput};
use narro_lib::persistence::lists::create_list;
use narro_lib::persistence::run_migrations;
use narro_lib::persistence::sessions::{
    checkpoint_open_session, get_open_session, open_focus_work_session, SessionStoreError,
};
use narro_lib::persistence::task_metadata::{
    set_task_time_taken, task_time_taken_seconds, TaskMetadataError,
};
use narro_lib::persistence::tasks::{create_task, get_task};
use narro_lib::persistence::timer_runtime::load_runtime_checkpoint;
use narro_lib::timer::runtime::{TimerRuntime, TimerRuntimeError};
use narro_lib::timer::{BreakKind, TimerEngine, TimerError, TimerMode, TimerStateKind};
use rusqlite::{params, Connection};
use serde_json::json;

const T0: &str = "2026-09-05T12:00:00Z";
const T1: &str = "2026-09-05T12:01:00Z";
const T2: &str = "2026-09-05T12:02:00Z";

fn fixture() -> (Connection, ListId, TaskId) {
    let mut conn = Connection::open_in_memory().expect("open database");
    run_migrations(&mut conn).expect("migrate database");
    let list = create_list(
        &mut conn,
        NewListInput {
            title: "Large elapsed".into(),
            color: None,
            icon_asset: None,
        },
        T0,
    )
    .expect("create list");
    let task = create_task(
        &mut conn,
        NewTaskInput {
            list_id: list.id,
            title: "Long timer".into(),
            manual_lane: PlanningLane::Today,
            est_seconds: None,
        },
        T0,
    )
    .expect("create task");
    (conn, list.id, task.id)
}

fn insert_open_session(
    conn: &Connection,
    task_id: TaskId,
    kind: SessionKind,
    duration_seconds: i64,
) -> SessionId {
    let session_id = SessionId::generate();
    conn.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, NULL, ?5, 'focus', ?4, ?4)",
        params![
            session_id.to_string(),
            task_id.to_string(),
            kind.as_str(),
            T0,
            duration_seconds,
        ],
    )
    .expect("insert open session");
    session_id
}

fn insert_checkpoint(conn: &Connection, session_id: SessionId, payload: serde_json::Value) {
    conn.execute(
        "INSERT INTO timer_runtime_checkpoint (singleton, session_id, payload_json, updated_at)
         VALUES (1, ?1, ?2, ?3)",
        params![session_id.to_string(), payload.to_string(), T0],
    )
    .expect("insert runtime checkpoint");
}

fn insert_closed_work_session(conn: &Connection, task_id: TaskId, seconds: i64) {
    conn.execute(
        "INSERT INTO sessions (
            id, task_id, kind, started_at, ended_at, duration_seconds,
            source, created_at, updated_at
         ) VALUES (?1, ?2, 'work', ?3, ?3, ?4, 'focus', ?3, ?3)",
        params![
            SessionId::generate().to_string(),
            task_id.to_string(),
            T0,
            seconds,
        ],
    )
    .expect("insert closed work session");
}

#[test]
fn continuous_count_up_remains_exact_at_the_top_of_the_monotonic_range() {
    let (_, _, task_id) = fixture();
    let mut engine = TimerEngine::new();
    engine
        .start_task(task_id, TimerMode::CountUp, 1)
        .expect("start near full clock range");

    let snapshot = engine
        .advance(u64::MAX)
        .expect("continuous elapsed span still fits u64");
    assert_eq!(snapshot.state, TimerStateKind::Running);
    assert_eq!(snapshot.work_elapsed_ms, u64::MAX - 1);
}

#[test]
fn recovered_near_max_work_counter_overflow_is_atomic() {
    let (mut conn, _, task_id) = fixture();
    let total_work_ms = u64::MAX - 500;
    let stored_seconds = i64::try_from(total_work_ms / 1_000).expect("seconds fit SQLite");
    let session_id = insert_open_session(&conn, task_id, SessionKind::Work, stored_seconds);
    insert_checkpoint(
        &conn,
        session_id,
        json!({
            "version": 1,
            "closed_work_seconds": 0,
            "closed_break_seconds": 0,
            "committed_break_ms": 0,
            "state": {
                "kind": "work",
                "task_id": task_id,
                "mode": TimerMode::CountUp,
                "phase": TimerStateKind::Paused,
                "total_work_ms": total_work_ms,
                "interval_work_ms": total_work_ms
            }
        }),
    );

    let mut runtime = TimerRuntime::recover(&mut conn, 0, T1).expect("recover near max work");
    let resumed = runtime.resume(&mut conn, 0, T1).expect("resume near max work");
    assert_eq!(resumed.timer.state, TimerStateKind::Running);
    let before_session = get_open_session(&conn).unwrap().unwrap();
    let before_checkpoint = load_runtime_checkpoint(&conn).unwrap().unwrap();

    let error = runtime
        .pause(&mut conn, 1_000, T2)
        .expect_err("new segment must not wrap accumulated work");
    assert!(matches!(
        error,
        TimerRuntimeError::Timer(TimerError::DurationOverflow)
    ));

    let after = runtime.snapshot(0).expect("failed mutation leaves runtime unchanged");
    assert_eq!(after.timer.state, TimerStateKind::Running);
    assert_eq!(after.timer.work_elapsed_ms, total_work_ms);
    assert_eq!(get_open_session(&conn).unwrap().unwrap(), before_session);
    assert_eq!(
        load_runtime_checkpoint(&conn).unwrap().unwrap(),
        before_checkpoint
    );
}

#[test]
fn recovered_near_max_break_counter_overflow_is_atomic() {
    let (mut conn, _, task_id) = fixture();
    let committed_break_ms = u64::MAX - 500;
    let closed_break_seconds = committed_break_ms / 1_000;
    let session_id = insert_open_session(&conn, task_id, SessionKind::Break, 0);
    insert_checkpoint(
        &conn,
        session_id,
        json!({
            "version": 1,
            "closed_work_seconds": 0,
            "closed_break_seconds": closed_break_seconds,
            "committed_break_ms": committed_break_ms,
            "state": {
                "kind": "break",
                "task_id": task_id,
                "mode": TimerMode::CountUp,
                "resume_phase": TimerStateKind::Paused,
                "resume_total_work_ms": 0,
                "resume_interval_work_ms": 0,
                "break_kind": BreakKind::Manual,
                "duration_ms": 1_000,
                "elapsed_ms": 0
            }
        }),
    );

    let mut runtime = TimerRuntime::recover(&mut conn, 0, T1).expect("recover near max break");
    let before = runtime.snapshot(0).expect("initial recovered break projection");
    assert_eq!(before.timer.state, TimerStateKind::Break);
    assert_eq!(before.timer.total_break_ms, committed_break_ms);
    let before_session = get_open_session(&conn).unwrap().unwrap();
    let before_checkpoint = load_runtime_checkpoint(&conn).unwrap().unwrap();

    let error = runtime
        .advance(&mut conn, 501, T2)
        .expect_err("projected break total must not wrap");
    assert!(matches!(
        error,
        TimerRuntimeError::Timer(TimerError::DurationOverflow)
    ));

    assert_eq!(runtime.snapshot(0).unwrap(), before);
    assert_eq!(get_open_session(&conn).unwrap().unwrap(), before_session);
    assert_eq!(
        load_runtime_checkpoint(&conn).unwrap().unwrap(),
        before_checkpoint
    );
}

#[test]
fn session_duration_above_sqlite_integer_range_is_rejected_without_mutation() {
    let (mut conn, _, task_id) = fixture();
    let session = open_focus_work_session(&mut conn, task_id, T0).expect("open work session");
    let before = get_open_session(&conn).unwrap().unwrap();

    let error = checkpoint_open_session(&mut conn, session.id, i64::MAX as u64 + 1, T1)
        .expect_err("SQLite duration range must be checked before write");
    assert!(matches!(error, SessionStoreError::DurationOverflow));
    assert_eq!(get_open_session(&conn).unwrap().unwrap(), before);
}

#[test]
fn very_large_valid_time_taken_sum_remains_exact() {
    let (conn, _, task_id) = fixture();
    let each = i64::MAX / 4;
    insert_closed_work_session(&conn, task_id, each);
    insert_closed_work_session(&conn, task_id, each);

    assert_eq!(
        task_time_taken_seconds(&conn, task_id).expect("large valid ledger must remain exact"),
        u64::try_from(each * 2).unwrap()
    );
}

#[test]
fn overflowing_time_taken_aggregate_fails_without_rebasing_task() {
    let (mut conn, _, task_id) = fixture();
    let each = i64::MAX / 2 + 1;
    insert_closed_work_session(&conn, task_id, each);
    insert_closed_work_session(&conn, task_id, each);

    assert!(matches!(
        task_time_taken_seconds(&conn, task_id),
        Err(TaskMetadataError::Sqlite(_)) | Err(TaskMetadataError::TimeTakenOverflow)
    ));

    let before = get_task(&conn, task_id).unwrap();
    let error = set_task_time_taken(
        &mut conn,
        task_id,
        SetTaskTimeTakenInput { total_seconds: 1 },
        T1,
    )
    .expect_err("overflowing ledger must reject manual rebase");
    assert!(matches!(
        error,
        TaskMetadataError::Sqlite(_) | TaskMetadataError::TimeTakenOverflow
    ));
    assert_eq!(get_task(&conn, task_id).unwrap(), before);
}
